def cmd(exec, match = nil, should_match = true)
  return command(exec).stdout if match.nil?
  describe command(exec) do
    if should_match
      its('stdout') {should match match}
    else
      its('stdout') {should_not match match}
    end
  end
end

def mysql(query, match = nil)
  cmd "mysql -BNe '#{query}' -h 127.0.0.1 -u root -ptest-password -P 6033", match
end

def admin(query)
  cmd "mysql -BNe '#{query}' -h 127.0.0.1 -uadmin -padmin -P 6032"
end

describe service('proxysql') do
  it {should be_enabled}
  it {should be_running}
end

writer = '/var/log/mysql-writer/general.log'
reader = '/var/log/mysql-reader/general.log'

admin 'UPDATE mysql_query_rules set active = 1 where rule_id = 3; LOAD MYSQL QUERY RULES TO RUNTIME;'
cmd "truncate -s0 #{writer}"
cmd "truncate -s0 #{reader}"

sql = 'CREATE DATABASE IF NOT EXISTS TEST'
mysql sql
cmd "cat #{writer}", sql
cmd "cat #{reader}", sql, false

sql = 'SELECT 5'
mysql sql, '5'
cmd "cat #{reader}", sql
cmd "cat #{writer}", sql, false

cmd "truncate -s0 #{writer}"
cmd "truncate -s0 #{reader}"

mysql 'START TRANSACTION'
mysql 'CREATE TABLE IF NOT EXISTS test ()'
mysql 'SELECT 9'
mysql 'COMMIT'
