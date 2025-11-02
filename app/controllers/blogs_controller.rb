class BlogsController < ApplicationController
  layout "application"

  def show
    @post = Post.published.find_by!(slug: params[:slug])
    @related_posts = Post.published
                         .where.not(id: @post.id)
                         .order(created_at: :desc)
                         .limit(3)
  end
end
