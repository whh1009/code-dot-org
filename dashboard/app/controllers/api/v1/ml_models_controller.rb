require 'aws-sdk-s3'
require 'cdo/aws/s3'

class Api::V1::MlModelsController < ApplicationController
  skip_before_action :verify_authenticity_token

  S3_BUCKET = 'cdo-v3-trained-ml-models'

  # POST api/v1//ml_models/save
  # Save a trained ML model to S3
  def save
    model_id = generate_id
    UserMlModel.create!(
      user_id: current_user.id,
      model_id: model_id,
      name: params["name"]
    )
    upload_to_s3(model_id, params["trainedModel"].to_json)
    render json: "hooray!"
  end

  def get_trained_model
    puts
    puts "in get_trained_model"
    puts
    result = download_from_s3(params[:model_id])
    puts "result:"
    puts
    puts result
    puts
  end

  def user_models
    UserMlModel.where(user_id: current_user.id)
  end

  private

  def generate_id
    SecureRandom.alphanumeric(12)
  end

  def upload_to_s3(model_id, trained_model)
    AWS::S3.upload_to_bucket(S3_BUCKET, model_id, trained_model, no_random: true)
  end

  def download_from_s3(model_id)
    AWS::S3.download_from_bucket(S3_BUCKET, model_id)
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def ml_model_params
    params.require(:ml_model).permit(:trained_model)
  end
end
