class PostsController < ApplicationController
  before_action :require_login

  def index
    @posts = Post.includes(:author).order(created_at: :desc)
  end

  def new
    @post = current_user.posts.build
  end

  def create
    @post = current_user.posts.build(post_params)

    if @post.save
      redirect_to dashboard_path, notice: "Post created successfully."
    else
      render :new, status: :unprocessable_entity
    end
  end

  private

  def post_params
    params.require(:post).permit(:title, :body, :status)
  end
end
