# Load deployment.rb into Chef context.
# This makes CDO.* variables and secrets available to Chef resources in the execution phase.
#
# To resolve a reference in the execution phase use `#lazy in a Chef-resource property, e.g.:
#
# resource do
#   property lazy {CDO.variable_name}
# end

# Install gem dependencies used by Cdo::Secrets.
chef_gem('aws-sdk-secretsmanager') {compile_time true}
chef_gem('activesupport') {compile_time true}

ohai 'reload_secrets' do
  action :nothing
  plugin 'cdo_secrets'
end
