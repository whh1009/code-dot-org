class AddCheckResultsToUserLevel < ActiveRecord::Migration[5.2]
  def change
    add_column :user_levels, :check_results, :string
  end
end
