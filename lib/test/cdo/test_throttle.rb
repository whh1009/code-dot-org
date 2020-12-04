require_relative '../test_helper'
require 'cdo/throttle'
require 'timecop'

class ThrottleTest < Minitest::Test
  include Cdo::Throttle

  def teardown
    CDO.shared_cache.clear
  end

  def test_throttle_with_limit_1
    Timecop.freeze
    refute throttle("my_key", 1, 2) # 1/1 reqs per 2s - not throttled
    Timecop.travel(Time.now.utc + 1)
    assert throttle("my_key", 1, 2) # 2/1 reqs per 2s - throttled
    Timecop.travel(Time.now.utc + THROTTLE_TIME - 1)
    assert throttle("my_key", 1, 2) # still throttled
    Timecop.travel(Time.now.utc + THROTTLE_TIME)
    refute throttle("my_key", 1, 2) # 1/1 reqs per 2s after waiting - not throttled anymore
    Timecop.travel(Time.now.utc + 1)
    assert throttle("my_key", 1, 2) # 2/1 reqs per 2s - throttled again
  end

  def test_throttle_with_limit_greater_than_1
    Timecop.freeze
    refute throttle("my_key", 2, 2) # 1/2 reqs per 2s - not throttled
    Timecop.travel(Time.now.utc + 1)
    refute throttle("my_key", 2, 2) # 2/2 reqs per 2s - not throttled
    Timecop.travel(Time.now.utc + 0.5)
    assert throttle("my_key", 2, 2) # 3/2 reqs per 2s - throttled
    Timecop.travel(Time.now.utc + THROTTLE_TIME)
    refute throttle("my_key", 2, 2) # 1/2 reqs per 2s after waiting - not throttled anymore
    Timecop.travel(Time.now.utc + 1)
    refute throttle("my_key", 2, 2) # 2/2 reqs per 2s - not throttled
    Timecop.travel(Time.now.utc + 0.5)
    assert throttle("my_key", 2, 2) # 3/2 reqs per 2s - throttled again
  end
end
