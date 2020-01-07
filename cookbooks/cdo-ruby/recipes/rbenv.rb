apt_package 'curl'
rbenv_system_install 'system' do
  update_rbenv true
end
rbenv_ruby '2.7.0'
rbenv_global '2.7.0'

cookbook_file '/etc/gemrc' do
  action :create_if_missing
  source 'gemrc'
  mode '0644'
end

# Update rubygems to a specific version
# rubygems_version = node['cdo-ruby']['rubygems_version']
# if rubygems_version
#   execute 'gem update --system' do
#     command "gem update -q --system '#{rubygems_version}'"
#     environment 'REALLY_GEM_UPDATE_SYSTEM' => '1'
#     not_if "which gem && gem --version | grep -q '#{rubygems_version}'"
#   end
# end
