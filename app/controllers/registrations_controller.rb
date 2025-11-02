class RegistrationsController < ApplicationController
  def new
    return redirect_to dashboard_path if current_user

    @user = User.new
  end
end
