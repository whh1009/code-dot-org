# Configure ProxySQL integration.

# https://github.com/sysown/proxysql#ubuntu--debian
apt_repository "proxysql" do
  uri "http://repo.proxysql.com/ProxySQL/proxysql-2.0.x/#{node['lsb']['codename']}/"
  distribution nil
  components ['./']
  key "https://repo.proxysql.com/ProxySQL/repo_pub_key"
end

apt_package 'proxysql' do
  version '2.0.6'
  action :upgrade
end

writer = URI.parse(node['cdo-secrets']['db_writer'] || 'mysql2://root@localhost/')
reader = URI.parse(node['cdo-secrets']['db_reader']) || writer.dup
admin = URI.parse(node['cdo-mysql']['proxy']['admin'])
proxy_port = node['cdo-mysql']['proxy']['port']

template 'proxysql.cnf' do
  path "/etc/#{name}"
  source 'proxysql.cnf.erb'
  variables(
    reader: reader,
    writer: writer,
    admin: admin,
    port: proxy_port
  )
end

service 'proxysql' do
  action [:enable, :start]
  subscribes :reload, 'template[proxysql.cnf]', :immediately
end

# Override application config to use proxy endpoint for DB reads and writes.
node.override['cdo-secrets']['db_writer'] = writer.dup.tap {|r| r.hostname = '127.0.0.1'; r.port = proxy_port}.to_s
node.override['cdo-secrets']['db_reader'] = reader.dup.tap {|r| r.hostname = '127.0.0.1'; r.port = proxy_port}.to_s
node.override['cdo-secrets']['db_proxy_admin'] = admin.to_s
