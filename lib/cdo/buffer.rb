require 'concurrent/scheduled_task'
require 'concurrent/utility/native_integer'
require 'honeybadger/ruby'

module Cdo
  # Abstract class to handle asynchronous-buffering and periodic-flushing using a thread pool.
  # This class is content-agnostic, buffering event objects in memory through #buffer(event, size).
  # Subclasses implement #flush(events), which will be called periodically as the buffer is flushed in batches.
  #
  # Because events are stored in memory, the buffer can synchronously flush when the Ruby process exits.
  class Buffer
    MAX_INT = Concurrent::Utility::NativeInteger.MAX_VALUE

    # @param [Integer] batch_events   Maximum number of events in a buffered batch.
    # @param [Integer] batch_size     Maximum total payload 'size', based on the size parameter passed to #buffer,
    #                                 in a buffered batch.
    # @param [Float] max_interval     Seconds after the first buffered item before a flush will occur.
    # @param [Float] min_interval     Seconds after the previous flush before a flush will occur.
    #                                 Useful for rate-throttling.
    # @param [Float] wait_at_exit     Seconds to wait at exit for flushing to complete.
    def initialize(
      batch_events: MAX_INT,
      batch_size:   MAX_INT,
      max_interval: Float::INFINITY,
      min_interval: 0.0,
      wait_at_exit: nil
    )
      @batch_events = batch_events
      @batch_size   = batch_size
      @max_interval = max_interval
      @min_interval = min_interval

      @scheduled_task = nil
      @buffer = Batch.new

      @ruby_pid = $$
      if wait_at_exit
        at_exit {flush!(wait_at_exit)}
      end
    end

    # Implement in subclass.
    # @param [Array<Object>] events
    def flush(events)
    end

    # Add an event to the buffer.
    # @raise [ArgumentError] when the event exceeds batch size
    # @raise [IOError, Errno::EPIPE] when the Buffer is closed
    # @param [Object] event
    # @param [Integer] size
    def buffer(event, size = nil)
      size ||= event.is_a?(String) ? event.bytesize : 1
      raise ArgumentError, 'Event exceeds batch size' if size > @batch_size
      reset_if_forked
      @buffer << Batch::Item.new(event, size, now)
      schedule_flush
    end

    # Flush existing buffered events.
    # @param [Float] timeout seconds to wait for buffered events to finish flushing.
    def flush!(timeout = Float::INFINITY)
      reset_if_forked
      start = now
      until (wait = start - now + timeout) < 0 || @buffer.empty?
        wait = nil if wait.infinite?
        schedule_flush(true).value(wait)
      end
    end

    private

    def now
      Concurrent.monotonic_time
    end

    # Schedule a flush in the future when the next batch is ready.
    # @param [Boolean] force flush batch even if not full.
    # @return [Concurrent::ScheduledTask]
    def schedule_flush(force = false)
      delay = batch_ready(force)
      unless @scheduled_task&.reschedule(delay) || @scheduled_task&.pending?
        @scheduled_task = Concurrent::ScheduledTask.execute(delay) do
          flush_batch
          schedule_flush
        end
      end
      @scheduled_task
    end

    # Determine when the next batch of events is ready to be flushed.
    # @param [Boolean] force flush batch even if not full.
    # @return [Float] Seconds until the next batch can be flushed.
    def batch_ready(force)
      # Wait until max_interval has passed since the earliest event to flush a non-full batch.
      wait = @max_interval - (now - @buffer.earliest)

      # Flush now if the batch is full or when force flushing.
      wait = 0.0 if force ||
        @buffer.size >= @batch_size ||
        @buffer.length >= @batch_events

      # Flush later if last flush was more recent than min_interval.
      [0.0, wait, @min_interval - (now - @last_flush.to_f)].max.to_f
    end

    # Flush a batch of events from the buffer.
    def flush_batch
      @last_flush = now
      flush(take_batch.map(&:event))
    rescue => e
      Honeybadger.notify(e)
      raise
    end

    # Take a single batch of events from the buffer.
    def take_batch
      batch = Batch.new
      batch << @buffer.shift until
        @buffer.empty? ||
          batch.length >= @batch_events ||
          (batch.size + @buffer.first.size) > @batch_size
      batch
    end

    # Helper class to track total size and earliest element in a batch of events.
    class Batch < Array
      Item = Struct.new(:event, :size, :created_at)

      attr_reader :size

      def initialize
        super
        @size = 0
      end

      # @param [Item] item
      def <<(item)
        super.tap {@size += item.size}
      end

      # @return [Item]
      def shift
        super.tap {|item| @size -= item.size}
      end

      def earliest
        first&.created_at || Float::INFINITY
      end
    end

    def reset_if_forked
      if $$ != @ruby_pid
        @buffer.clear
        @scheduled_task&.cancel
        @ruby_pid = $$
      end
    end
  end
end
