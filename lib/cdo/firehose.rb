require 'singleton'
require 'cdo/buffer'
require 'aws-sdk-firehose'
require 'active_support/core_ext/module/attribute_accessors'

# A wrapper client to the AWS Firehose service.
# @example
#   FirehoseClient.instance.put_record(
#     {
#       study: 'underwater basket weaving', # REQUIRED
#       study_group: 'control',             # OPTIONAL
#       script_id: script.id,               # OPTIONAL
#       level_id: level.id,                 # OPTIONAL
#       project_id: project.id,             # OPTIONAL
#       user_id: user.id,                   # OPTIONAL
#       event: 'drowning',                  # REQUIRED
#       data_int: 2,                        # OPTIONAL
#       data_float: 1.8,                    # OPTIONAL
#       data_string: 'hello world',         # OPTIONAL
#       data_json: "{\"key\":\"value\"}"    # OPTIONAL
#     }
#   )

class FirehoseClient < Cdo::Buffer
  STREAM_NAME = 'analysis-events'.freeze

  include Singleton
  cattr_accessor :client

  # 'Each PutRecordBatch request supports up to 500 records.'
  # Ref: https://docs.aws.amazon.com/firehose/latest/APIReference/API_PutRecordBatch.html
  ITEMS_PER_REQUEST = 500

  # 'The maximum size of a record sent to Kinesis Data Firehose, before base64-encoding, is 1,000 KiB.'
  # Ref: https://docs.aws.amazon.com/firehose/latest/dev/limits.html
  BYTES_PER_RECORD = 1024 * 1000

  # 'The PutRecordBatch operation can take up to 500 records per call or 4 MiB per call, whichever is smaller.'
  # Ref: https://docs.aws.amazon.com/firehose/latest/dev/limits.html
  BYTES_PER_REQUEST = 1024 * 1024 * 4

  # Initializes the @firehose to an AWS Firehose client.
  def initialize
    super(
      batch_count: ITEMS_PER_REQUEST,
      batch_size: BYTES_PER_REQUEST,
      object_size: BYTES_PER_RECORD,
      max_interval: 10.0,
      min_interval: 0.1
    )
    unless [:development, :test].include? rack_env
      self.client = Aws::Firehose::Client.new
    end
  end

  # Posts a record to the analytics stream.
  # @param data [hash] The data to insert into the stream.
  def put_record(data)
    return unless Gatekeeper.allows('firehose', default: true)
    buffer({data: add_common_values(data).to_json})
  end

  def flush(events)
    return unless Gatekeeper.allows('firehose', default: true)
    if client
      client.put_record_batch(
        {
          delivery_stream_name: STREAM_NAME,
          records: events
        }
      )
    else
      CDO.log.info "Skipped sending records to #{STREAM_NAME}:\n#{events}"
    end
  end

  private

  # Adds common key-value pairs to the data hash.
  # @param data [hash] The data to add the key-value pairs to.
  # @return [hash] The data, including the newly added key-value pairs.
  def add_common_values(data)
    data.merge(
      created_at: DateTime.now,
      environment: rack_env,
      device: 'server-side'.to_json
    )
  end
end
