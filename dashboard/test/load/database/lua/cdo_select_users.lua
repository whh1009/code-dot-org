#!/usr/bin/env sysbench

-- init/teardown code taken from: https://www.percona.com/blog/2019/04/25/creating-custom-sysbench-scripts/

-- Called by sysbench one time to initialize this script
function thread_init()
 
  -- Create globals to be used elsewhere in the script
 
  -- drv - initialize the sysbench mysql driver
  drv = sysbench.sql.driver()
 
  -- con - represents the connection to MySQL
  con = drv:connect()

  query_templates = {
    [[SELECT *
      FROM dashboard_production.users
      WHERE deleted_at is null
            AND id = $userId
      ORDER BY id ASC limit 1]],
    [[SELECT *
      FROM dashboard_production.user_storage_ids
      WHERE user_id = $userId limit 1]]
  }
end
 
-- Called by sysbench when script is done executing
function thread_done()
  -- Disconnect/close connection to MySQL
  con:disconnect()
end
 

function event()
  -- TODO:(suresh) Declare these as local variables?  Switch to sb_rand_unique()?
  local max_user_level_id = 2098563437
  local max_user_id = 50826205
  local max_level_id = 17741
  local max_script_id = 405
  local max_level_source_id = 861968845
  
  local vars = {
    userId = sb_rand(1, max_user_level_id)
  }

  local random_template = query_templates[math.random(#query_templates)]
  -- Simple string interpolation from: https://hisham.hm/2016/01/04/string-interpolation-in-lua/
  -- "variable" names must be alphanumeric characters only.
  local query = string.gsub(random_template, "%$(%w+)", vars)

  con:query(query)
end
