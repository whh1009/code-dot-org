require 'digest/md5'
require 'cdo/throttle'

module ProfanityHelper
  include Cdo::Throttle

  PROFANITY_PREFIX = "profanity/".freeze

  # Uses ProfanityFilter to find any profanities in the given text + locale. Caches the response.
  # @param [String] text
  # @param [String] locale
  # returns [Array<String>|nil] Array of profane words, if any are found.
  def find_profanities(text, locale)
    return nil if text.nil_or_empty?
    key = cache_key(text, locale)
    Rails.cache.fetch(key) {ProfanityFilter.find_potential_profanities(text, locale)}
  end

  # If the given id is not throttled, uses ProfanityFilter to find any profanities in the given
  # text + locale. Caches and invokes a block with the response unless the request was throttled.
  # @param [String] text
  # @param [String] locale
  # @param [String] id - Unique identifier for throttling
  # @param [Integer] limit - Request limit
  # @param [Integer] period - Period for request limit
  def throttled_find_profanities(text, locale, id, limit, period)
    return nil if text.nil_or_empty?
    key = cache_key(text, locale)
    return yield(Rails.cache.read(key)) if Rails.cache.exist?(key)
    return if throttle(PROFANITY_PREFIX + id.to_s, limit, period)

    profanities = ProfanityFilter.find_potential_profanities(text, locale)
    Rails.cache.write(key, profanities)
    yield(profanities)
  end

  private

  def cache_key(text, locale)
    # Hash text in cache_key to avoid long cache keys.
    PROFANITY_PREFIX + "#{locale}/#{Digest::MD5.hexdigest(text)}"
  end
end
