require_relative '../../test/mailers/previews/pd_workshop_mailer_preview'

class MailPreviewController < ApplicationController
  def index
    @email = Pd::WorkshopMailerPreview.new.teacher_enrollment_receipt__csf_intro
    ActionMailer::InlinePreviewInterceptor.previewing_email(@email)
    part = @email.find_first_mime_type('text/html') || @email
    @email_content = part.decoded
  end
end
