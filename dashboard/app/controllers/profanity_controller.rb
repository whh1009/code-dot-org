require 'cdo/honeybadger'

class ProfanityController < ApplicationController
  include ProfanityHelper

  # TODO: what should these values be?
  THROTTLE_LIMIT_DEFAULT = 2
  THROTTLE_LIMIT_IP = 10

  # POST /profanity/find
  # Detects profanity within the given text (+ optional locale). This endpoint is throttled because it
  # uses a paid third-party service (Webpurify) but needs to be accessed by unauthenticated users.
  # @param [String] params[:text] String to test
  # @param [String] params[:locale] Locale to test in. Optional. Uses request locale if not provided.
  # @returns [Array<String>|nil] Profane words within the given string
  def find
    id = current_user&.id || session.id
    # Only throttle by IP if no user or session ID is available.
    throttle_ip = id.blank?
    id ||= request.ip
    # TODO: what should these values be?
    limit = throttle_ip ?
      DCDO.get('profanity_throttle_limit_per_min_ip', THROTTLE_LIMIT_IP) :
      DCDO.get('profanity_throttle_limit_per_min_default', THROTTLE_LIMIT_DEFAULT)
    period = 60

    ProfanityHelper.throttled_find_profanities(params[:text], locale, id, limit, period) do |profanities|
      return render json: profanities
    end

    # If we make it here, the request should be throttled.
    Honeybadger.notify(
      error_class: 'RequestThrottledWarning',
      error_message: "Client throttled for POST #{request.path}",
      context: {throttle_id: id, is_ip: throttle_ip, limit: limit, period: period}
    )
    head :too_many_requests
  end

  private

  def locale
    params[:locale] || request.locale
  end
end
