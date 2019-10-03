class ErrorsController < ApplicationController
  def not_found
    # respond_to do |format|
    #   format.html {render status: 404}
    # end
    puts "hello there"
    respond_to do |format|
      puts "here"
      format.html {render template: 'errors/not_found.haml', layout: 'layouts/application', status: :not_found}
      format.all {head :not_found}
    end
  end

  def unacceptable
    respond_to do |format|
      format.html {render status: 422}
    end
  end

  def internal_server_error
    respond_to do |format|
      format.html {render status: 500}
    end
  end
end
