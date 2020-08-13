Ohai.plugin(:CdoSecrets) do
  provides :secrets
  provides :cdo

  collect_data(:default) do
    git_path = File.join(node[:home], node.chef_environment)
    if File.file?(git_path)
      ENV['BUNDLE_GEMFILE'] = '' # Disable Bundler
      require "#{node['cdo-repository']['git_path']}/deployment"
      secrets CDO.chef
      cdo CDO
    else
      secrets Mash.new
      cdo Mash.new
    end
  end
end
