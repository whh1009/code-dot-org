# == Schema Information
#
# Table name: curriculum_chunks
#
#  id               :integer          not null, primary key
#  pilot_experiment :string(255)
#  assignable       :boolean          default(FALSE), not null
#  stable           :boolean          default(FALSE), not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#  content_type     :string(255)
#  content_id       :integer
#
# Indexes
#
#  index_curriculum_chunks_on_content_type_and_content_id  (content_type,content_id)
#

class CurriculumChunk < ApplicationRecord
  belongs_to :content, polymorphic: true
end
