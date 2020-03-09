module AWS
  # Manages application-specific configuration and deployment of AWS CloudFront distributions.
  class CloudFormation
    def self.init(cls=nil)
      require 'cdo/cloud_formation/cdo_app'
      template = ENV['TEMPLATE']
      cls ||= template ?
        Cdo::CloudFormation::Stack :
        Cdo::CloudFormation::CdoApp

      Dir.chdir aws_dir('cloudformation')
      cls.new(
        log: CDO.log,
        template: template,
        verbose: ENV['VERBOSE'],
        quiet: ENV['QUIET'],
        stack_name: ENV['STACK_NAME'],
        frontends: ENV['FRONTENDS']
      )
    end

    extend SingleForwardable
    def_delegators :init,
      :validate, :create_or_update, :delete,
      :stop, :start_inactive_instance
  end
end
