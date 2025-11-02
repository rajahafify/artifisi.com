class DashboardController < ApplicationController
  before_action :require_login

  def show
    @user = current_user
    @recent_users = User.order(created_at: :desc).limit(5)
    @recent_posts = Post.includes(:author).with_rich_text_body.order(created_at: :desc).limit(5)
  end
end
