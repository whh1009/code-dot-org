require 'test_helper'

class Census::StateCsOfferingTest < ActiveSupport::TestCase
  test "Basic offering creation succeeds" do
    offering = build :state_cs_offering
    assert offering.valid?, offering.errors.full_messages
  end

  test "Offering creation without course fails" do
    offering = build :state_cs_offering, :without_course
    refute offering.valid?
  end

  test "Offering creation without school fails" do
    offering = build :state_cs_offering, :without_school
    refute offering.valid?
  end

  test "Offering creation without school_year fails" do
    offering = build :state_cs_offering, :without_school_year
    refute offering.valid?
  end

  test "Offering creation with invalid school_year fails" do
    offering = build :state_cs_offering, :with_invalid_school_year
    refute offering.valid?
  end

  test 'delete_state_cs_offerings removes state CS offerings' do
    school = create :school
    state_cs_offering = create :state_cs_offering, school: school

    assert_equal school.state_cs_offering.pluck(:id), [state_cs_offering.id]

    school.delete_state_cs_offerings(school.state_school_id)
    assert_empty school.state_cs_offering
  end

  test 'delete_state_cs_offerings returns hash with keys needed to reconstitute' do
    school = create :school
    state_cs_offering = create :state_cs_offering, school: school

    assert_equal school.state_cs_offering.pluck(:id), [state_cs_offering.id]

    deleted_offerings = school.delete_state_cs_offerings(school.state_school_id)

    expected = {
      course: state_cs_offering.course,
      school_year: state_cs_offering.school_year
    }

    assert_equal 1, deleted_offerings.length
    assert_equal expected,
      deleted_offerings.first.slice(:course, :school_year)
  end
end
