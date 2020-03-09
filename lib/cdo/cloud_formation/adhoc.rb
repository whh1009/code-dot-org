require 'aws-sdk-ec2'

module Cdo::CloudFormation
  # Helper functions related to adhoc instances of CdoApp.
  module Adhoc
    def start_inactive_instance
      cloudformation_resource = Aws::CloudFormation::Resource.new
      stack = cloudformation_resource.stack(stack_name)
      instance = Aws::EC2::Instance.new(id: stack.resource('WebServer').physical_resource_id)
      if instance.state.code != 80
        info "Instance #{instance.id} in Stack #{stack_name} can't be started because it is not" \
            " currently stopped.  Current state - #{instance.state.code}:#{instance.state.name}"
      else
        info "Starting Instance #{instance.id} ..."
        instance.start
        instance.wait_until_running
        info "Instance #{instance.id} is started."

        public_ip_address = instance.reload.public_ip_address
        dashboard_url = stack.outputs.detect {|output| output.output_key == 'DashboardURL'}.output_value
        pegasus_url = stack.outputs.detect {|output| output.output_key == 'PegasusURL'}.output_value

        # suffix period to construct fully qualified domain name
        pegasus_domain_name = URI.parse(pegasus_url).host + '.'
        dashboard_domain_name = URI.parse(dashboard_url).host + '.'

        route53_client = Aws::Route53::Client.new

        # this lookup may stop working if/when there are more than 100 zones
        # prefix zone name with a period to prevent partial match (don't let zone "code.org." match "foo.cdn-code.org.")
        hosted_zone_id = route53_client.
          list_hosted_zones.
          hosted_zones.
          select {|zone| pegasus_domain_name.end_with?('.' + zone.name)}.
          first.
          id

        change_resource_response = route53_client.change_resource_record_sets(
          hosted_zone_id: hosted_zone_id,
          change_batch: {
            changes: [pegasus_domain_name, dashboard_domain_name].map do |domain_name|
              {
                action: "UPSERT",
                resource_record_set: {
                  name: domain_name,
                  resource_records: [{value: public_ip_address}],
                  ttl: DNS_TTL,
                  type: "A"
                }
              }
            end,
            comment: "Web server for adhoc environment #{pegasus_domain_name}",
          }
        )
        change_status = change_resource_response.change_info.status
        change_id = change_resource_response.change_info.id
        info "DNS update status - #{change_status}"
        info "Waiting for AWS Route53 to apply updated DNS records to all of its servers."
        route53_client.wait_until(:resource_record_sets_changed, {id: change_id})
        change_status = route53_client.get_change({id: change_id}).change_info.status
        info "DNS update status - #{change_status}"
        info "Wait up to the configured Time To Live (#{DNS_TTL} seconds) to lookup new IP address."
      end
      stack.outputs.each do |output|
        info "#{output.output_key}: #{output.output_value}"
      end
    end

    def stop
      if stack_exists?
        info "Finding EC2 Instance for CloudFormation Stack #{stack_name} ..."
        cloudformation_resource = Aws::CloudFormation::Resource.new
        stack = cloudformation_resource.stack(stack_name)
        instance_id = stack.resource('WebServer').physical_resource_id
        instance = Aws::EC2::Instance.new(id: instance_id)
        if instance.nil?
          info "Instance #{instance_id} does not exist or has been terminated."\
                "Delete this unrecoverable CloudFormation stack: rake adhoc:delete STACK_NAME=#{stack_name}"
        elsif instance.state.code == 80 # already Stopped
          info "Instance #{instance.id} is already Stopped."
        elsif instance.state.code == 16 # Running
          info "Stopping Instance #{instance.id} ..."
          stop_result = instance.stop
          info "Instance Status - #{stop_result.stopping_instances[0].current_state.name}"
          info "Waiting until Stopped ..."
          instance.wait_until_stopped
          info "Instance Status - #{instance.reload.state.name}"
          info "To start instance: rake adhoc:start_inactive_instance STACK_NAME=#{stack_name}"
        else
          info "Cannot stop Instance because its state is #{instance.state.name}"
        end
      else
        CDO.log.warn "Stack #{stack_name} does not exist."
      end
    end
  end
end
