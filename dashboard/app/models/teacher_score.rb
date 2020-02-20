# == Schema Information
#
# Table name: teacher_scores
#
#  id            :integer          not null, primary key
#  user_level_id :integer
#  teacher_id    :integer
#  score         :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class TeacherScore < ApplicationRecord
end
