class SessionsController < ApplicationController
  def new; end

  def create
    user = find_user_by_email(session_params[:email])

    if user&.authenticate(session_params[:password])
      session[:user_id] = user.id
      redirect_to dashboard_path, notice: "Welcome back, #{user.name.split.first}!"
    else
      flash.now[:alert] = "Invalid email or password."
      render :new, status: :unprocessable_entity
    end
  end

  def destroy
    session.delete(:user_id)
    redirect_to root_path, notice: "Signed out successfully."
  end

  private

  def session_params
    params.require(:session).permit(:email, :password)
  end

  def find_user_by_email(email)
    normalized_email = email.to_s.strip.downcase
    return if normalized_email.blank?

    User.find_by("lower(email) = ?", normalized_email)
  end
end
