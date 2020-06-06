class CreateCurriculumChunks < ActiveRecord::Migration[5.0]
  def change
    create_table :curriculum_chunks do |t|
      t.string :pilot_experiment
      t.boolean :assignable, null: false, default: false
      t.boolean :stable, null: false, default: false

      t.timestamps
    end
  end
end
