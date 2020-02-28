require_relative './stack'

require 'aws-sdk-acm'
require 'aws-sdk-cloudwatchlogs'
require 'tempfile'

require 'active_support/core_ext/numeric/bytes'
require 'cdo/aws/cloudfront'
require 'cdo/cron'
require_relative './adhoc'

# Functions specific to the monolithic Code.org application stack.
module Cdo::CloudFormation
  class CdoApp < Stack
    include Adhoc if rack_env?(:adhoc)
    LOG_NAME = '/var/log/bootstrap.log'.freeze
    CHEF_KEY = rack_env?(:adhoc) ? 'adhoc/chef' : 'chef'

    IMAGE_ID = ENV['IMAGE_ID'] || 'ami-07d0cf3af28718ef8' # ubuntu/images/hvm-ssd/ubuntu-bionic-18.04-amd64-server-20190722.1
    INSTANCE_TYPE = rack_env?(:production) ? 'm4.10xlarge' : 't2.2xlarge'
    ORIGIN = "https://github.com/code-dot-org/code-dot-org.git"

    # number of seconds to configure as Time To Live for DNS record
    DNS_TTL = 60

    attr_reader :daemon, :daemon_instance_id,
      :frontends, :database, :load_balancer, :alarms,
      :commit,
      :chef_version

    def initialize(**options)
      options[:template] ||= 'cloud_formation_stack.yml.erb'
      super

      raise "Stack name must not include 'dashboard'" if stack_name.include?('dashboard')

      check_branch!
      @commit = options.delete(:commit) || `git ls-remote origin #{branch}`.split.first

      @frontends = rack_env?(:production) || options[:frontends]
      @database = [:staging, :test, :levelbuilder].include?(rack_env) || options[:database]
      @load_balancer = !rack_env?(:adhoc) || options[:frontends]
      @alarms = !rack_env?(:adhoc) || options[:alarms]
      @chef_version = '15.2.20'

      log_resource_filter.push 'FrontendLaunchConfig', 'ASGCount'

      # Don't provision daemon where manually-provisioned daemon instances already exist.
      # Track Instance ID of manually-provisioned daemon instances that already exist and can't be referenced dynamically
      # TODO import manually-provisioned instances into cloudformation stacks.
      if %w(autoscale-prod test staging levelbuilder).include? stack_name
        @daemon_instance_id = {
          'autoscale-prod' => 'i-08f5f8ace0a473b8d',
          'test' => 'i-004727200191f3251',
          'staging' => 'i-02e6cdc765421ab34',
          'levelbuilder' => 'i-0907b146f7e6503f6'
        }[stack_name]
      else
        @daemon = 'Daemon'
      end

      # Use alternate legacy EC2 instance resource name for standalone-adhoc stack.
      @daemon = 'WebServer' if rack_env?(:adhoc) && !@frontends

      tags.push(key: 'environment', value: rack_env)
      tags.push(key: 'owner', value: Aws::STS::Client.new.get_caller_identity.arn) if rack_env?(:adhoc)
    end

    def check_branch!
      if rack_env?(:adhoc) && RakeUtils.git_branch == branch
        # Current branch is the one we're deploying to the adhoc server,
        # so check whether it's up-to-date with the remote before we get any further.
        unless `git remote show '#{ORIGIN}' 2>&1 | grep '(up to date)' | grep '#{branch}' | wc -l`.strip.to_i > 0
          raise 'Current adhoc branch needs to be up-to-date with GitHub branch of the same name, otherwise deploy will fail.
To specify an alternate branch name, run `rake adhoc:start branch=BRANCH`.'
        end
      else
        # Either not adhoc or deploying a different branch than the current local one;
        # simply check that the branch exists on GitHub before deploying.
        unless system("git ls-remote --exit-code '#{ORIGIN}' #{branch} > /dev/null")
          raise 'Current branch needs to be pushed to GitHub with the same name, otherwise deploy will fail.
  To specify an alternate branch name, run `rake stack:start branch=BRANCH`.'
        end
      end
    end

    def get_binding
      binding
    end

    # CNAME prefix to use for this stack.
    def cname
      stack_name
    end

    # Fully qualified domain name, with optional pre/postfix.
    def subdomain(prefix = nil, postfix = nil)
      subdomain = [prefix, cname, postfix].compact.join('-')
      [subdomain.presence, DOMAIN].compact.join('.').downcase
    end

    def studio_subdomain
      subdomain nil, 'studio'
    end

    def local_mode
      !!CDO.chef_local_mode
    end

    # Lookup ACM certificate for ELB and CloudFront SSL.
    # Choose latest expiration among multiple active matching certificates.
    ACM_REGION = 'us-east-1'.freeze
    def certificate_arn
      acm = Aws::ACM::Client.new(region: ACM_REGION)
      wildcard = "*.#{DOMAIN}"
      acm.
        list_certificates(certificate_statuses: ['ISSUED']).
        certificate_summary_list.
        select {|cert| cert.domain_name == wildcard || cert.domain_name == DOMAIN}.
        map {|cert| acm.describe_certificate(certificate_arn: cert.certificate_arn).certificate}.
        select {|cert| cert.subject_alternative_names.include? wildcard}.
        max_by(&:not_after).
        certificate_arn
    end

    def bootstrap_script_path
      @bootstrap_script ||= begin
        unless dry_run.tap{|x| puts "bootstrap path"}
          Aws::S3::Client.new.put_object(
            bucket: S3_BUCKET,
            key: "#{CHEF_KEY}/bootstrap-#{stack_name}.sh",
            body: File.read(aws_dir('chef-bootstrap.sh'))
          )
        end
        "s3://#{S3_BUCKET}/#{CHEF_KEY}/bootstrap-$STACK.sh"
      end
    end

    def ssl_certs_path
      @certs_path ||= begin
        unless dry_run.tap{|x| puts "Certs path"}
          Dir.chdir(aws_dir('cloudformation')) do
            RakeUtils.bundle_exec './update_certs',
              subdomain,
              studio_subdomain,
              subdomain('origin')
          end
        end
        "s3://#{s3_bucket}/ssl/certs/#{subdomain}"
      end
    end

    def cookbooks_path
      return nil unless local_mode
      @cookbooks_path ||= begin
        unless dry_run.tap{|x| puts "Cookbooks path"}
          RakeUtils.with_bundle_dir(cookbooks_dir) do
            Tempfile.open('berks') do |tmp|
              RakeUtils.bundle_exec 'berks', 'package', tmp.path
              Aws::S3::Client.new.put_object(
                bucket: S3_BUCKET,
                key: "#{CHEF_KEY}/#{branch}.tar.gz",
                body: tmp.read
              )
            end
          end
        end
        "s3://#{S3_BUCKET}/#{CHEF_KEY}/#{branch}.tar.gz"
      end
    end

    def wait_for_stack(action)
      token = nil
      super(action) do
        token = tail_log(token)
        yield
      end
    end

    # Prints the latest output from a CloudWatch Logs log stream, if present.
    def tail_log(token)
      log_config = {
        log_group_name: stack_name,
        log_stream_name: LOG_NAME,
        start_from_head: true,
      }
      if token
        log_config[:next_token] = token
      else
        log_config[:start_time] = @started_at
      end
      # Return silently if we can't get the log events for any reason.
      resp = logs.get_log_events(log_config) rescue return
      resp.events.map(&:message).each(&method(:info))
      resp.next_forward_token
    end

    def cloudfront_config(app)
      AWS::CloudFront.distribution_config(
        app.downcase.to_sym,
        subdomain('origin'),
        app == 'Dashboard' ?
          [studio_subdomain] :
          [subdomain] + (CDO.partners + ['advocacy']).map {|x| subdomain(nil, x)},
        {
          AcmCertificateArn: certificate_arn,
          MinimumProtocolVersion: 'TLSv1',
          SslSupportMethod: domain == 'code.org' ? 'vip' : 'sni-only'
        }
      )
    end

    private

    def logs
      @logs ||= Aws::CloudWatchLogs::Client.new
    end
  end
end
