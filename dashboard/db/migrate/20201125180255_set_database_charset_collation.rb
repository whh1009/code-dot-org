class SetDatabaseCharsetCollation < ActiveRecord::Migration[5.2]
  def change
    execute "ALTER DATABASE #{ActiveRecord::Base.connection.current_database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
  end
end
