require 'cdo/rake_utils'

module DBUtils
  # Send SQL statements to proxysql-admin interface.
  def self.proxysql_admin(sql)
    require 'uri'
    require 'mysql2'
    client = @@proxy_client ||= begin
      uri = URI.parse(CDO.db_proxy_admin)
      Mysql2::Client.new(
        host: uri.host == 'localhost' ? '127.0.0.1' : uri.host,
        port: uri.port || 3306,
        protocol: 'tcp',
        username: uri.user,
        password: uri.password,
        reconnect: true
      )
    end
    results = sql.
      split(';').
      map(&:chomp).
      reject(&:empty?).
      map(&client.method(:query)).
      map(&:to_a)
    results.one? ? results.first : results
  end

  # Workaround for 'No database selected' issue with ProxySQL schema cache.
  # Ref: https://github.com/sysown/proxysql/issues/698#issuecomment-279771373
  def self.reload_proxy_backends
    # Note: The admin-interface solution does NOT currently work.
    # proxysql_admin <<~SQL
    # UPDATE mysql_servers SET status='OFFLINE_HARD';
    # LOAD MYSQL SERVERS TO RUNTIME;
    # UPDATE mysql_servers SET status='ONLINE';
    # LOAD MYSQL SERVERS TO RUNTIME;
    # SQL
    RakeUtils.restart_service('proxysql')
    sleep 2
  end
end
