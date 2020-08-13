require 'dynamic_config/dcdo_base'

module Cdo
  # Prepend this module to a Cdo::Config to allow Dynamic variables via DCDO.
  module DynamicConfig
    def render(*sources)
      super.tap do |configs|
        configs.each(&method(:process_dynamic!))
      end
    end

    def freeze
      load_dynamic!
      super
    end

    # Stores a reference to a dynamic variable so it can be resolved later.
    Dynamic = Struct.new(:key, :default) do
      def to_s
        "@{#{key}:#{default}}"
      end
    end

    REGEX = /@{(.*):(.*)}/
    YAML.add_domain_type('', 'Dynamic') do |_tag, value|
      Dynamic.new(nil, value)
    end

    def process_dynamic!(config)
      return if config.nil?
      config.each do |key, value|
        if value.is_a?(Hash) && value.delete('dynamic')
          value = config[key] = Dynamic.new
        end
        next unless value.is_a?(Dynamic)
        value.key ||= "cdo_#{key}"
        raise 'Dynamic variable requires schema' unless (schema = @schema[:properties][key])
        raise 'Dynamic variable requires default' unless (default = schema['default'])
        value.default ||= default
      end
    end

    def load_dynamic!
      dcdo = nil
      table.each do |key, value|
        next unless value.is_a?(Dynamic) ||
          (value.is_a?(String) && value.match?(REGEX))

        if value.is_a?(Dynamic)
          table[key] = value.default
        end

        lazy = Cdo.lazy do
          dcdo ||= DCDOBase.create(self)
          if value.is_a?(Dynamic)
            dcdo.get(value.key, value.default)
          elsif value.is_a?(String)
            value.to_s.gsub(REGEX) {dcdo.get($1, $2)}
          end
        end
        resolved = false

        # Replace lazy references to the underlying object on first access,
        # in order to support 'falsey' (false / nil) values.
        define_singleton_method(key) do
          unless resolved
            resolved = true
            @table[key] = lazy.__getobj__
          end
          @table[key]
        end
      end
    end
  end
end
