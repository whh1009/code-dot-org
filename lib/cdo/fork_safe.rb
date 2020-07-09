require 'concurrent'
require 'socket'

# ForkSafe module refinement.
# Make a method 'fork-safe' by transparently invoking it on the parent process.
# Serializes method calls from forked child processes to the parent process.
#
# @example
# class MyClass
#   using ForkSafe
#   fork_safe def echo(x)
#     puts "[#{$$}] Processing #{x}..."
#     x
#   end
# end
#
# my_class = MyClass.new
# > my_class.echo $$
# [1] Processing 1...
# => 1
# > fork { my_class.new.echo $$ }
# [1] Processing 2...
module ForkSafe
  @read, @write = UNIXSocket.pair(:DGRAM)

  def invoke(args, object_id)
    if THREAD.alive?
      ObjectSpace._id2ref(object_id).call(*args)
    else
      @write << Marshal.dump([object_id, args])
    end
  end
  module_function :invoke

  THREAD = Thread.new do
    len = @read.getsockopt(:SOCKET, :RCVBUF).int
    until (msg = @read.recv(len)).empty?
      object_id, args = Marshal.load(msg)
      method = ObjectSpace._id2ref(object_id)
      Concurrent.global_io_executor.post(*args, &method)
    end
  end

  refine Module do
    def fork_safe(method_id)
      id = "@_fork_#{method_id.to_s.gsub(/[^[[:alnum:]]]/, '_')}".to_sym
      mod = Module.new do
        define_method(:initialize) do |*args|
          super(*args)
          instance_variable_set(id, method(method_id).super_method.object_id)
        end

        define_method(method_id) do |*args|
          raise 'Block not allowed in fork_safe method' if block_given?
          ForkSafe.invoke(args, instance_variable_get(id))
        end
      end
      prepend mod
    end
  end
end
