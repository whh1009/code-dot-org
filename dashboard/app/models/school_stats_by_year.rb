# == Schema Information
#
# Table name: school_stats_by_years
#
#  school_id          :string(12)       not null, primary key
#  school_year        :string(9)        not null, primary key
#  grades_offered_lo  :string(2)
#  grades_offered_hi  :string(2)
#  grade_pk_offered   :boolean
#  grade_kg_offered   :boolean
#  grade_01_offered   :boolean
#  grade_02_offered   :boolean
#  grade_03_offered   :boolean
#  grade_04_offered   :boolean
#  grade_05_offered   :boolean
#  grade_06_offered   :boolean
#  grade_07_offered   :boolean
#  grade_08_offered   :boolean
#  grade_09_offered   :boolean
#  grade_10_offered   :boolean
#  grade_11_offered   :boolean
#  grade_12_offered   :boolean
#  grade_13_offered   :boolean
#  virtual_status     :string(14)
#  students_total     :integer
#  student_am_count   :integer
#  student_as_count   :integer
#  student_hi_count   :integer
#  student_bl_count   :integer
#  student_wh_count   :integer
#  student_hp_count   :integer
#  student_tr_count   :integer
#  title_i_status     :string(1)
#  frl_eligible_total :integer
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  community_type     :string(16)
#
# Indexes
#
#  index_school_stats_by_years_on_school_id  (school_id)
#

class SchoolStatsByYear < ApplicationRecord
  self.primary_keys = :school_id, :school_year

  belongs_to :school

  def self.seed_from_s3
    CDO.log.info "Seeding 2018-2019 public and charter school demographic data."
    # Originally from xyzfillthisin
    AWS::S3.seed_from_file('cdo-nces', "2018-2019/ccd/xyz.csv") do |filename|
      merge_from_csv(filename, {col_sep: ",", headers: true}, true) do |row|
        {
          school_id:          row['NCESSCH'].to_i.to_s,
          school_year:        '2018-2019',

          # Grades offered
          grades_offered_lo:  row['GSLO'],
          grades_offered_hi:  row['GSHI'],
          grade_pk_offered:   row['G_PK_OFFERED'] == 'Yes',
          grade_kg_offered:   row['G_KG_OFFERED'] == 'Yes',
          grade_01_offered:   row['G_1_OFFERED'] == 'Yes',
          grade_02_offered:   row['G_2_OFFERED'] == 'Yes',
          grade_03_offered:   row['G_3_OFFERED'] == 'Yes',
          grade_04_offered:   row['G_4_OFFERED'] == 'Yes',
          grade_05_offered:   row['G_5_OFFERED'] == 'Yes',
          grade_06_offered:   row['G_6_OFFERED'] == 'Yes',
          grade_07_offered:   row['G_7_OFFERED'] == 'Yes',
          grade_08_offered:   row['G_8_OFFERED'] == 'Yes',
          grade_09_offered:   row['G_9_OFFERED'] == 'Yes',
          grade_10_offered:   row['G_10_OFFERED'] == 'Yes',
          grade_11_offered:   row['G_11_OFFERED'] == 'Yes',
          grade_12_offered:   row['G_12_OFFERED'] == 'Yes',
          grade_13_offered:   row['G_13_OFFERED'] == 'Yes',

          # Student body race breakdown
          # students_total:     row['Total Students All Grades (Excludes AE) [Public School] 2017-18'].presence.try {|v| v.to_i <= 0 ? nil : v.to_i},
          # student_am_count:   row['American Indian/Alaska Native Students [Public School] 2017-18'].presence.try {|v| v.to_i < 0 ? nil : v.to_i},
          # student_as_count:   row['Asian or Asian/Pacific Islander Students [Public School] 2017-18'].presence.try {|v| v.to_i < 0 ? nil : v.to_i},
          # student_hi_count:   row['Hispanic Students [Public School] 2017-18'].presence.try {|v| v.to_i < 0 ? nil : v.to_i},
          # student_bl_count:   row['Black Students [Public School] 2017-18'].presence.try {|v| v.to_i < 0 ? nil : v.to_i},
          # student_wh_count:   row['White Students [Public School] 2017-18'].presence.try {|v| v.to_i < 0 ? nil : v.to_i},
          # student_hp_count:   row['Hawaiian Nat./Pacific Isl. Students [Public School] 2017-18'].presence.try {|v| v.to_i < 0 ? nil : v.to_i},
          # student_tr_count:   row['Two or More Races Students [Public School] 2017-18'].presence.try {|v| v.to_i < 0 ? nil : v.to_i},
          #
          # # Other school demographics
          # title_i_status:     TITLE_I_MAP[row['Title I School Status [Public School] 2017-18']],
          # frl_eligible_total: row['Free and Reduced Lunch Students [Public School] 2017-18'].presence.try {|v| v.to_i < 0 ? nil : v.to_i},
          # community_type:     COMMUNITY_TYPE_MAP[row['Urban-centric Locale [Public School] 2017-18']],
          # virtual_status:     VIRTUAL_SCHOOL_MAP[row['Virtual School Status [Public School] 2017-18']]
        }
      end
    end

    CDO.log.info "Seeding 2018-2019 public and charter school virtual and title I status."
    # Originally from xyzfillthisin
    AWS::S3.seed_from_file('cdo-nces', "2018-2019/ccd/xyz.csv") do |filename|
      merge_from_csv(filename, {col_sep: ",", headers: true}, true) do |row|
        {
          school_id:          row['NCESSCH'].to_i.to_s,
          school_year:        '2018-2019',

          # Other school demographics
          title_i_status:     'yes',
          virtual_status:     'no'
        }
      end
    end
  end

  # Loads/merges the data from a CSV into the table.
  # Requires a block to parse the row.
  # @param filename [String] The CSV file name.
  # @param options [Hash] Optional, the CSV file parsing options.
  def self.merge_from_csv(filename, options = {col_sep: "\t", headers: true, quote_char: "\x00"}, dry_run = false)
    new_school_stats = 0
    updated_school_stats = 0
    unchanged_school_stats = 0

    CSV.read(filename, options).each do |row|
      parsed = yield row
      loaded = find_by(primary_keys.map(&:to_sym).map {|k| [k, parsed[k]]}.to_h)
      if loaded.nil?
        begin
          SchoolStatsByYear.new(parsed).save! unless dry_run
          new_school_stats += 1
        rescue ActiveRecord::InvalidForeignKey
          puts parsed[:school_id]
        end
      else
        loaded.assign_attributes(parsed)
        if loaded.changed?
          loaded.update!(parsed) unless dry_run
          updated_school_stats += 1
        else
          unchanged_school_stats += 1
        end
      end

      CDO.log.info "School Stats By Years seeding: done processing #{filename}.\n"\
        "#{new_school_stats} school stats added.\n"\
        "#{updated_school_stats} school stats updated.\n"\
        "#{unchanged_school_stats} school stats in import with no updates.\n"
    end
  end

  def has_high_school_grades?
    grade_09_offered || grade_10_offered || grade_11_offered || grade_12_offered || grade_13_offered
  end

  def has_k8_grades?
    grade_kg_offered || grade_01_offered || grade_02_offered || grade_03_offered || grade_04_offered || grade_05_offered || grade_06_offered || grade_07_offered || grade_08_offered
  end

  # Percentage of underrepresented minorities students
  # Note these are values between 0-100, not 0-1!
  def urm_percent
    percent_of_students([student_am_count, student_hi_count, student_bl_count, student_hp_count].compact.reduce(:+))
  end

  # Percentage of free/reduced lunch eligible students
  # Note these are values between 0-100, not 0-1!
  def frl_eligible_percent
    percent_of_students(frl_eligible_total)
  end

  # Is this a rural school?
  # Returns nil if there is no data. Otherwise returns true or false.
  def rural_school?
    return nil unless community_type

    # The Rural Education Achievement Program (REAP) accepts the following NCES locale codes
    # as "rural": town (distant and remote subcategories)
    # and rural (fringe, distant, and remote subcategories).
    %w(town_distant town_remote rural_fringe rural_distant rural_remote).
      include? community_type
  end

  # Title I status can be values 1-6, M, or nil.
  # Values 1-5 are Title I eligible,
  # 6 is ineligible, M=Missing, and nil are unknown.
  # See description under TITLEISTAT here:
  # https://nces.ed.gov/ccd/Data/txt/sc131alay.txt
  def title_i_eligible?
    return nil unless title_i_status
    return nil if title_i_status == 'M'

    %w(1 2 3 4 5).include? title_i_status
  end

  # returns what percent "count" is of the total student enrollment (0-100)
  def percent_of_students(count)
    return nil unless count && students_total
    (100.0 * count / students_total).round(2)
  end
end
