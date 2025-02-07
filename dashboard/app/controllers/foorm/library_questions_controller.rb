module Foorm
  # Foorm Library Editor is only available on levelbuilder or test, for those with levelbuilder permissions.
  class LibraryQuestionsController < ApplicationController
    before_action :require_levelbuilder_mode_or_test_env
    before_action :authenticate_user!
    load_and_authorize_resource

    # GET /foorm/library_questions/:id
    def show
      render json: @library_question.to_json
    end

    # PUT /foorm/library_questions/:id/update
    def update
      @library_question.question = JSON.pretty_generate(params[:question].as_json)

      if @library_question.save
        return render json: @library_question
      else
        return render status: :bad_request, json: @library_question.errors
      end
    end
  end
end
