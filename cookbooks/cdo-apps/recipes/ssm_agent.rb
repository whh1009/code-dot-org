# Install the amazon-ssm-agent Snap package on Ubuntu EC2 instances.
# Ref: https://docs.aws.amazon.com/systems-manager/latest/userguide/agent-install-ubuntu.html#ubuntu-server-20.04,-18.04,-and-16.04-lts-64-bit-(snap)

snap_package 'amazon-ssm-agent' if node.key?(:ec2) && node[:platform] == 'ubuntu'
