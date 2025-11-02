class PostsController < ApplicationController
  before_action :require_login
  before_action :set_post, only: %i[show edit update destroy]

  def index
    @posts = Post.includes(:author).order(created_at: :desc)
  end

  def show; end

  def new
    @post = current_user.posts.build
  end

  def edit; end

  def create
    @post = current_user.posts.build(post_params)

    if @post.save
      redirect_to post_path(@post), notice: "Post created successfully."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def update
    if @post.update(post_params)
      redirect_to post_path(@post), notice: "Post updated successfully."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @post.destroy
    redirect_to posts_path, notice: "Post deleted successfully."
  end

  private

  def set_post
    @post = Post.includes(:author).find_by!(slug: params[:slug])
  end

  def post_params
    params.require(:post).permit(:title, :body, :status)
  end
end
