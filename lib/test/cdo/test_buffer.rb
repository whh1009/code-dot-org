require_relative '../test_helper'
require 'cdo/buffer'

class BufferTest < Minitest::Test
  class TestBuffer < Cdo::Buffer
    def flushed
      (@flushed ||= [])
    end

    def flush(events)
      raise "EMPTY" if events.empty?
      flushed.push(events)
    end

    def flushes
      flushed.length
    end
  end

  def test_batch_events
    b = TestBuffer.new(batch_events: 2)
    7.times {b.buffer('foo')}
    b.close
    assert_equal 4, b.flushes
  end

  def test_batch_size_given_small_data_should_succeed
    b = TestBuffer.new(batch_size: 4)
    7.times {b.buffer('HI')}
    b.close
    assert_equal 4, b.flushes
  end

  def test_batch_size_given_too_large_string_should_raise_exception
    test_string = 'HI'
    assert_raises(ArgumentError) do
      b = TestBuffer.new(batch_size: test_string.bytesize - 1)
      b.buffer(test_string)
    end
  end

  def test_batch_size_given_too_large_object_should_raise_exception
    max_size = 5
    assert_raises(ArgumentError) do
      b = TestBuffer.new(batch_size: max_size)
      b.buffer([], max_size + 1)
    end
  end

  def test_batch_interval
    b = TestBuffer.new(max_interval: 0.1)
    7.times {b.buffer('bar')}
    assert_equal 0, b.flushes
    sleep 0.2
    assert_equal 1, b.flushes
    b.flush!
    assert_equal 1, b.flushes
  end

  def test_errors_after_close
    b = ReBuffer.new
    b.buffer 'foo'
    b.close
    assert_equal 1, b.flushes
    assert_instance_of Errno::EPIPE, b.errors.first
    assert_raises(IOError) do
      b.buffer 'foo'
    end
  end

  class ReBuffer < TestBuffer
    attr_reader :errors
    # Re-buffer events endlessly until an error is raised when the buffer is closed.
    def flush(events)
      super
      events.map(&method(:buffer))
    rescue => e
      (@errors ||= []) << e
      raise
    end
  end

  class StdoutBuffer < Cdo::Buffer
    def flush(events)
      events.each(&method(:puts))
    end
  end

  def test_fork
    b = StdoutBuffer.new
    output, err = capture_subprocess_io do
      $stdout.sync = true
      b.buffer 'foo2'
      pid = fork do
        b.buffer 'foo1'
        b.flush!
      end
      Process.wait(pid)
      b.buffer 'foo3'
      b.flush!
    end
    assert_empty err
    assert_equal "foo1\nfoo2\nfoo3\n", output
  end

  def test_min_interval
    b = TestBuffer.new(batch_events: 1, min_interval: 1.second.to_i)
    start = Concurrent.monotonic_time
    4.times {b.buffer('foo')}
    b.flush!
    finish = Concurrent.monotonic_time
    assert_equal 4, b.flushes
    time_taken = finish - start
    # Given a min_interval of 1 second and 4 flushes, assert the flush! takes 3-4 seconds.
    assert_operator time_taken, :>, 3
    assert_operator time_taken, :<, 4
  end

  def test_min_interval_no_flush
    b = TestBuffer.new(batch_events: 1, min_interval: 0.1)
    4.times {b.buffer('foo')}
    sleep 0.05
    assert_equal 1, b.flushes
    b.buffer('foo')
    sleep 0.3
    assert_equal 4, b.flushes
    sleep 0.1
    assert_equal 5, b.flushes
    sleep 0.1
    assert_equal 5, b.flushes
  end
end
