class Api::V1::Pd::FacilitatorApplicationCohortViewSerializer < ActiveModel::Serializer
  attributes :id, :date_accepted, :applicant_name, :district_name, :school_name, :email,
    :notified, :assigned_workshop, :registered_workshop, :assigned_fit, :registered_fit,
    :accepted_fit

  def date_accepted
    object.accepted_at.try(:strftime, '%b %e')
  end

  def email
    object.user.email
  end

  def notified
    # TODO: (mehal) implement this
    'Not implemented'
  end

  def assigned_workshop
    # TODO: (mehal) implement this
    'Not implemented'
  end

  def registered_workshop
    # TODO: (mehal) implement this
    'Not implemented'
  end

  def assigned_fit
    # TODO: (mehal) implement this
    'Not implemented'
  end

  def registered_fit
    # TODO: (mehal) implement this
    'Not implemented'
  end
end
