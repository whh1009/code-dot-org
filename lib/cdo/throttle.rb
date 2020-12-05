require 'cdo/shared_cache'

module Cdo
  module Throttle
    # TODO: what should this value be?
    THROTTLE_TIME = 10.seconds.freeze
    CACHE_PREFIX = "cdo_throttle/".freeze

    # @param [String] id - Unique identifier to throttle on.
    # @param [Integer] limit - Number of requests allowed over period.
    # @param [Integer] period - Period of time in seconds.
    # @returns [Boolean] Whether or not the request should be throttled.
    # Once an ID has been throttled, it will stay throttled for Cdo::Throttle::THROTTLE_TIME.
    def self.throttle(id, limit, period)
      full_key = CACHE_PREFIX + id.to_s
      value = CDO.shared_cache.read(full_key) || empty_value
      now = Time.now.utc
      value[:request_timestamps] << now

      if value[:throttled_until]&.future?
        should_throttle = true
      else
        value[:throttled_until] = nil
        earliest = now - period
        value[:request_timestamps].select! {|timestamp| timestamp >= earliest}
        should_throttle = value[:request_timestamps].size > limit
        value[:throttled_until] = now + THROTTLE_TIME if should_throttle
      end

      CDO.shared_cache.write(full_key, value)
      should_throttle
    end

    def self.empty_value
      {
        throttled_until: nil,
        request_timestamps: []
      }
    end
  end
end
