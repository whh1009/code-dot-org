require_relative './base'
require_relative './lambda'

require 'cdo/rake_utils'

# Functions specific to managing and configuring Code.org CloudFormation stacks.
module Cdo::CloudFormation
  class Stack < Base
    include Lambda
    # Hard-coded values for our CloudFormation template.
    S3_BUCKET = 'cdo-dist'.freeze
    DOMAIN = ENV['DOMAIN'] || 'cdn-code.org'
    SSH_IP = '0.0.0.0/0'.freeze
    SSH_KEY_NAME = 'server_access_key'.freeze
    AVAILABILITY_ZONES = ('b'..'e').map {|i| "us-east-1#{i}"}

    attr_reader :params

    def initialize(**options)
      super
      @params = {}
    end

    def get_binding
      binding
    end

    def stack_name
      name = ENV['STACK_NAME'] || CDO.stack_name
      name += "-#{branch}" if name == 'adhoc'
      name.gsub(/[^#{STACK_NAME_CHARS}]/, '-')
    end

    def branch
      ENV['branch'] || (rack_env?(:adhoc) ? RakeUtils.git_branch : rack_env)
    end

    def base_options
      # All stacks use the same shared Service Role for CloudFormation resource-management permissions.
      # Pass `ADMIN=1` to update admin resources with a privileged Service Role.
      role_name = "CloudFormation#{ENV['ADMIN'] ? 'Admin' : 'Service'}"
      account = Aws::STS::Client.new.get_caller_identity.account
      super.merge(
        role_arn: "arn:aws:iam::#{account}:role/admin/#{role_name}"
      )
    end

    def azs
      AVAILABILITY_ZONES.map {|zone| zone[-1].upcase}
    end
    alias_method :availability_zones, :azs

    def availability_zone
      azs.first
    end

    def subnets
      azs.map {|az| {'Fn::ImportValue': "VPC-Subnet#{az}"}}
    end

    def public_subnets
      azs.map {|az| {'Fn::ImportValue': "VPC-PublicSubnet#{az}"}}
    end

    def environment
      rack_env
    end

    def region
      CDO.aws_region
    end

    def ssh_ip
      SSH_IP
    end

    def cdn_enabled
      !!ENV['CDN_ENABLED']
    end

    def domain
      DOMAIN
    end

    def s3_bucket
      S3_BUCKET
    end

    def log_name
      LOG_NAME
    end

    def signal_resource(resource_id, status='SUCCESS')
      <<~SH.chomp
        aws cloudformation signal-resource \
          --unique-id $(curl -s http://169.254.169.254/latest/meta-data/instance-id) \
          --stack-name ${AWS::StackName} \
          --logical-resource-id #{resource_id} \
          --status #{status} \
          --region ${AWS::Region}
      SH
    end

    def complete_lifecycle(hook_name, asg_name)
      <<~SH.chomp
        aws autoscaling complete-lifecycle-action \
          --lifecycle-action-result CONTINUE \
          --instance-id $(curl -s http://169.254.169.254/latest/meta-data/instance-id) \
          --lifecycle-hook-name #{hook_name} \
          --auto-scaling-group-name #{asg_name} \
          --region ${AWS::Region}
      SH
    end

    # Adds the specified properties to a YAML document.
    def add_properties(properties)
      properties.transform_values(&:to_json).map{|p| p.join(': ')}.join("\n      ")
    end
  end
end
