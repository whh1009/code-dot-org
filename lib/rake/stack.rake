namespace :stack do
  task :environment do
    ENV['CDN_ENABLED'] ||= '1' unless rack_env?(:adhoc)
    ENV['DOMAIN'] ||= rack_env?(:adhoc) ? 'cdn-code.org' : 'code.org'
    require 'cdo/aws/cloud_formation'
  end

  namespace :start do
    task default: :environment do
      AWS::CloudFormation.create_or_update
    end

    desc 'Launch/update a full-stack deployment with CloudFront CDN disabled.
Note: Consumes AWS resources until `stack:stop` is called.'
    task no_cdn: :environment do
      ENV['CDN_ENABLED'] = nil
      AWS::CloudFormation.create_or_update
    end
  end

  desc 'Launch/update a full-stack deployment.
Note: Consumes AWS resources until `adhoc:stop` is called.'
  task start: ['start:default']

  # `stop` command intentionally removed. Use AWS console to manually delete stacks.

  desc 'Validate CloudFormation template.'
  task validate: :environment do
    AWS::CloudFormation.validate
  end

  # Managed resource stacks other than the Code.org application.
  %I(vpc iam ami data lambda alerting).each do |stack|
    namespace stack do
      task :environment do
        ENV['TEMPLATE'] ||= "#{stack}.yml.erb"
        ENV['STACK_NAME'] ||= stack.to_s if [:lambda, :alerting].include? stack
        ENV['STACK_NAME'] ||= "#{stack.upcase}#{"-#{rack_env}" if [:ami, :data].include? stack}"
        require 'cdo/aws/cloud_formation'
        require 'cdo/cloud_formation/stack'
        @stack = AWS::CloudFormation.init(Cdo::CloudFormation::Stack)
      end

      desc "Launch/update #{stack} stack component."
      task start: :environment do
        @stack.create_or_update
      end

      desc "Validate #{stack} stack template."
      task validate: :environment do
        @stack.validate
      end

      # `stop` command intentionally removed. Use AWS console to manually delete stacks.
    end
  end
end
