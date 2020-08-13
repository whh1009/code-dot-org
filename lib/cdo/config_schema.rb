require 'json-schema'

module Cdo
  # Include this module within Cdo::Config to allow variables with JSON-schema validation.
  module ConfigSchema
    def render(*sources)
      super.tap do |configs|
        configs.each(&method(:process_schema!))
      end
    end

    def freeze
      validate!
      super
    end

    private

    def process_schema!(config)
      @schema = {type: 'object', properties: {}}
      config.each do |key, value|
        next unless value.is_a?(Hash) && (schema = value.delete('schema'))
        @schema[:properties][key] = schema.dup
        config[key] = schema['default'] if value.empty?
      end
    end

    def validate!
      @schema[:properties].keys.each do |key|
        value = table[key]
        # Dynamic/lazy values will be validated when set.
        next if value.is_a?(Lazy)
        JSON::Validator.validate!(@schema, {key => value})
      end

      # Validate dynamic/lazy values when set.
      @table.extend(
        Module.new do
          def []=(key, value)
            if @schema[:properties].key?(key)
              begin
                JSON::Validator.validate!(@schema, {key => value})
              rescue JSON::Schema::ValidationError => e
                CDO.log.warn(e)
                # Don't set dynamic variable if it fails schema validation.
                return
              end
            end
            super
          end
        end
      )
      @table.instance_variable_set(:@schema, @schema)
    end
  end
end
