class ApplicationController < ActionController::Base
  layout :determine_layout
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern

  # Changes to the importmap will invalidate the etag for HTML responses
  stale_when_importmap_changes

  helper_method :current_user

  private

  def current_user
    return @current_user if defined?(@current_user)

    @current_user = User.find_by(id: session[:user_id])
  end

  def require_login
    return if current_user

    redirect_to login_path, alert: "Please sign in to continue."
  end

  def determine_layout
    return "application" if controller_name == "pages" && action_name == "home"
    return "application" unless current_user

    "dashboard"
  end
end
