class AddContentToCurriculumChunk < ActiveRecord::Migration[5.0]
  def change
    add_reference :curriculum_chunks, :content, polymorphic: true
  end
end
