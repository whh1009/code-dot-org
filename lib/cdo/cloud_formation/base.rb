require 'aws-sdk-cloudformation'
require 'aws-sdk-s3'

require 'active_support/core_ext/string/inflections'

require 'digest'
require 'erb'
require 'json'
require 'yaml'

module Cdo::CloudFormation
  class Base
    extend Forwardable
    def_delegators :@log, :info, :debug, :warn

    attr_accessor :log
    attr_reader :template, :template_policy, :stack_name, :stack, :options

    def initialize(**options)
      @log = options.delete(:log) || Logger.new(STDOUT)
      @template = options.delete(:template) || raise('Template required')
      @template_policy = options.delete(:policy) || template.split('.').tap {|s| s.first << '-policy'}.join('.')
      @options = options

      @stack_name = options.delete(:stack_name) || stack_name
      raise 'invalid stack name' unless @stack_name.match?(/^#{STACK_NAME_CHARS}*$/)

      @log_resource_filter = []
      @tags = []
      options[:temp_bucket] ||= ENV['TEMP_S3_BUCKET'] || 'cf-templates-p9nfb0gyyrpf-us-east-1'
    end

    # A stack name can contain only alphanumeric characters (case sensitive) and hyphens.
    # Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cfn-using-console-create-stack-parameters.html
    STACK_NAME_CHARS = /[[:alnum:]-]/

    attr_reader :log_resource_filter, :tags

    # Validates that the template is valid CloudFormation syntax.
    # Does not check validity of the resource properties, just the base syntax.
    # First prints the JSON-formatted template, then either raises an error (if invalid)
    # or prints the template description (if valid).
    def validate
      template = render_template(dry_run: true)
      info template if options[:verbose]
      template_info = string_or_url(template)
      info cfn.validate_template(template_info).description
      options = stack_options(template)

      params = options[:parameters].reject {|x| x[:parameter_value].nil?}
      info "Parameters:\n#{params.map {|p| "#{p[:parameter_key]}: #{p[:parameter_value]}"}.join("\n")}" unless params.empty?

      validate_changes(options, "#{stack_name}-#{Digest::MD5.hexdigest(template)}") if stack_exists?
    end

    # Log potential changes to an existing stack using a temporary change set.
    def validate_changes(options, name)
      info "Listing changes to existing stack `#{stack_name}`:"
      change_set_id = cfn.create_change_set(
        options.merge(change_set_name: name)
      ).id

      begin
        change_set = nil
        loop do
          change_set = cfn.describe_change_set(
            change_set_name: change_set_id,
            stack_name: stack_name
          )
          break unless %w(CREATE_PENDING CREATE_IN_PROGRESS).include?(change_set.status)
          sleep 1
        end
        change_set.changes.each do |change|
          c = change.resource_change
          str = "#{c.action} #{c.logical_resource_id} [#{c.resource_type}] #{c.scope.join(', ')}"
          str += " Replacement: #{c.replacement}" if %w(True Conditional).include?(c.replacement)
          str += " (#{c.details.map {|d| d.target.name}.join(', ')})" if c.details.any?
          info str
        end
        info 'No changes' if change_set.changes.empty?

      ensure
        cfn.delete_change_set(
          change_set_name: change_set_id,
          stack_name: stack_name
        )
      end
    end

    # https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/cloudformation-limits.html
    TEMPLATE_MAX = 51_200
    TEMPLATE_S3_MAX = 460_800

    # Returns an inline string or S3 URL depending on the size of the template.
    def string_or_url(template)
      # Upload the template to S3 if it's too large to be passed directly.
      if template.length < TEMPLATE_MAX
        {template_body: template}
      elsif template.length < TEMPLATE_S3_MAX
        debug 'Uploading template to S3...'
        bucket = options[:temp_bucket]
        key = "#{stack_name}-#{Digest::MD5.hexdigest(template)}-cfn.json"
        Aws::S3::Client.new.put_object(
          bucket: bucket,
          key: key,
          body: template
        )
        {template_url: "https://s3.amazonaws.com/#{bucket}/#{key}"}
      else
        raise 'Template is too large'
      end
    end

    def parameters(template)
      params = YAML.load(template)['Parameters']
      return [] unless params
      params.map do |key, properties|
        value = CDO[key.underscore] || ENV[key.underscore.upcase]
        param = {parameter_key: key}
        if value
          param[:parameter_value] = value
        elsif stack_exists? && stack.parameters.any? {|p| p.parameter_key == key}
          param[:use_previous_value] = true
        elsif properties['Default']
          next # use default param
        else
          # Required parameter value not found in environment, existing stack or default.
          # Ask for input directly.
          require 'highline'
          param[:parameter_value] = HighLine.new.ask("Enter value for Parameter #{key}:", String)
        end
        param
      end.compact
    end

    def base_options
      {stack_name: stack_name}
    end

    def stack_options(template)
      base_options.merge(string_or_url(template)).merge(
        parameters: parameters(template),
        tags: tags,
        capabilities: %w[
          CAPABILITY_IAM
          CAPABILITY_NAMED_IAM
        ]
      )
    end

    def create_or_update
      action = stack_exists? ? :update : :create
      info "#{action} stack: #{stack_name}..."
      template = render_template
      options = stack_options(template)
      if File.file?(template_policy)
        stack_policy = JSON.pretty_generate(YAML.load(render_template(template: template_policy)))
        options[:stack_policy_body] = stack_policy
        options[:stack_policy_during_update_body] = stack_policy if action == :update
      end
      options[:on_failure] = 'DO_NOTHING' if action == :create

      stack_action(action, options)

      unless options[:quiet]
        info 'Outputs:'
        cfn.describe_stacks(stack_name: @stack_id).stacks.first.outputs.each do |output|
          info "#{output.output_key}: #{output.output_value}"
        end
      end
    end

    def delete
      if stack_exists?
        info "Shutting down #{stack_name}..."
        stack_action(:delete, base_options)
      else
        warn "Stack #{stack_name} does not exist."
      end
    end

    private

    def cfn
      @cfn ||= Aws::CloudFormation::Client.new
    end

    # Only way to determine whether a given stack exists using the Ruby API.
    def stack_exists?
      !!@stack ||= begin
        cfn.describe_stacks(stack_name: stack_name).stacks.first.tap do |stack|
          @stack_id = stack.stack_id
        end
      rescue Aws::CloudFormation::Errors::ValidationError => e
        raise e unless e.message == "Stack with id #{stack_name} does not exist"
        false
      end
    end

    def stack_action(method, options)
      @started_at = Time.now
      begin
        result = cfn.method("#{method}_stack").call(options)
        @stack_id ||= result.stack_id if result.respond_to?(:stack_id)
      rescue Aws::CloudFormation::Errors::ValidationError => e
        if e.message == 'No updates are to be performed.'
          info e.message
          return
        else
          raise
        end
      end
      wait_for_stack(method, &method(:tail_events))
    end

    # Prints the latest CloudFormation stack events.
    def tail_events
      @last_event ||= @started_at
      stack_events = cfn.describe_stack_events(stack_name: @stack_id).stack_events
      stack_events.reject! do |event|
        event.timestamp <= @last_event ||
          log_resource_filter.include?(event.logical_resource_id)
      end
      stack_events.sort_by(&:timestamp).each do |event|
        str = "#{event.logical_resource_id} [#{event.resource_status}]"
        str = "#{str}: #{event.resource_status_reason}" if event.resource_status_reason
        str = "#{event.timestamp}- #{str}" unless options[:quiet]
        info str
        if event.resource_status == 'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS'
          throw :success
        end
      end
      @last_event = ([@last_event] + stack_events.map(&:timestamp)).max
    end

    def wait_for_stack(action)
      info "Stack #{action} requested, waiting for provisioning to complete..."
      yield rescue nil
      begin
        cfn.wait_until("stack_#{action}_complete".to_sym, stack_name: @stack_id) do |w|
          w.delay = 5 # seconds
          w.max_attempts = 540 # = 1.5 hours
          w.before_wait do
            yield
            print '.' unless options[:quiet]
          end
        end
      rescue Aws::Waiters::Errors::FailureStateError
        yield rescue nil
        if action == :create
          info 'Stack will remain in its half-created state for debugging. To delete, run `rake adhoc:stop`.'
        end
        raise "\nError on #{action}."
      end
      yield rescue nil
      info "\nStack #{action} complete." unless options[:quiet]
      info "Don't forget to remove AWS resources by running `rake adhoc:delete` after you're done testing your instance!" if action == :create
    end

    def render_template(template: self.template, dry_run: false)
      erb_file(template, dry_run: dry_run)
    end

    # Inline a file into a CloudFormation template.
    def file(filename, vars={})
      file = File.expand_path filename
      str = File.read(file)
      {'Fn::Sub': erb_eval(str, file, vars)}.to_json
    end

    def erb_file(filename, vars={})
      file = File.expand_path filename
      erb_eval(File.read(file), file, vars)
    end

    def get_binding
      binding
    end

    def erb_eval(str, filename=nil, local_vars={})
      local_binding = get_binding
      local_vars.each_pair do |key, value|
        local_binding.local_variable_set(key, value)
      end
      Dir.chdir(File.dirname(filename)) do
        ERB.new(str, nil, '-').tap {|erb| erb.filename = filename}.result(local_binding)
      end
    end

    # Generate boilerplate Trust Policy for an AWS Service Role.
    def service_role(service)
      document = {
        Statement: [
          Effect: 'Allow',
          Action: 'sts:AssumeRole',
          Principal: {Service: ["#{service}.amazonaws.com"]}
        ]
      }
      "AssumeRolePolicyDocument: #{document.to_json}"
    end

    # Helper function to call a Lambda-function-based AWS::CloudFormation::CustomResource.
    # Ref: http://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-resource-cfn-customresource.html
    def lambda_fn(function_name, properties={})
      custom_type = properties.delete(:CustomType)
      depends_on = properties.delete(:DependsOn)
      custom_resource = {
        Type: properties.delete('Type') || "Custom::#{custom_type || function_name}",
        Properties: {
          ServiceToken: {'Fn::Join' => [':', [
            'arn:aws:lambda',
            {Ref: 'AWS::Region'},
            {Ref: 'AWS::AccountId'},
            'function',
            function_name
          ]]}
        }.merge(properties)
      }
      custom_resource['DependsOn'] = depends_on if depends_on
      custom_resource.to_json
    end
  end
end
