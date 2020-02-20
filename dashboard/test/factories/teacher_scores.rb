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

FactoryGirl.define do
  factory :teacher_score do
    user_level_id 1
    teacher_id 1
    score 1
  end
end
