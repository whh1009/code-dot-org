class ChangeCoursesToUnitGroups < ActiveRecord::Migration[5.0]
  def change
    rename_table :courses, :unit_groups
  end
end
