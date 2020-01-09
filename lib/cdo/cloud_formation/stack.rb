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

    AVAILABILITY_ZONES = ('b'..'e').map {|i| "us-east-1#{i}"}

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
  end
end
