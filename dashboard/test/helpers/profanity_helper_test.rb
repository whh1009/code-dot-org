require 'test_helper'

class ProfanityHelperTest < ActionView::TestCase
  teardown do
    # Some tests access and store data in the cache, so clear between tests to avoid state leakage
    Rails.cache.clear
  end

  test 'find_profanities: caches and returns profanities from ProfanityFilter' do
    text = 'lots of bad words'
    profanities = ['bad', 'words']
    ProfanityFilter.expects(:find_potential_profanities).once.returns(profanities)

    assert_equal profanities, find_profanities(text, 'en-US')

    # Confirm ProfanityFilter response was cached but ProfanityFilter was not invoked a second time.
    assert_equal profanities, find_profanities(text, 'en-US')
  end

  test 'find_profanities: returns nil if text is not provided' do
    ProfanityFilter.expects(:find_potential_profanities).never

    assert_nil find_profanities('', 'en-US')
  end

  test 'throttled_find_profanities: yields profanities if cached' do
    Rails.cache.expects(:exist?).returns(true)
    expected_profanities = ['bad']
    Rails.cache.expects(:read).once.returns(expected_profanities)
    expects(:throttle).never
    ProfanityFilter.expects(:find_potential_profanities).never

    actual_profanities = nil
    throttled_find_profanities('bad words', 'en-US', 'a1b2c3', 1, 1) {|profanities| actual_profanities = profanities}
    assert_equal expected_profanities, actual_profanities
  end

  test 'throttled_find_profanities: does not yield if request is throttled' do
    Rails.cache.expects(:read).never
    expects(:throttle).once.returns(true)
    ProfanityFilter.expects(:find_potential_profanities).never

    throttled_find_profanities('throttled!', 'en-US', 'a1b2c3', 1, 1) {raise 'Error: Block unexpectedly executed.'}
  end

  test 'throttled_find_profanities: caches and yields profanities not cached or throttled' do
    Rails.cache.expects(:read).never
    expects(:throttle).once.with("profanity/a1b2c3", 1, 1).returns(false)
    expected_profanities = ['bad']
    ProfanityFilter.expects(:find_potential_profanities).once.returns(expected_profanities)

    actual_profanities = nil
    throttled_find_profanities('bad words', 'en-US', 'a1b2c3', 1, 1) {|profanities| actual_profanities = profanities}
    assert_equal expected_profanities, actual_profanities
  end
end
