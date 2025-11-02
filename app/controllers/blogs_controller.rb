class BlogsController < ApplicationController
  layout "application"

  def show
    @post = Post.published.with_rich_text_body.find_by!(slug: params[:slug])
    @related_posts = Post.published
                         .with_rich_text_body
                         .where.not(id: @post.id)
                         .order(created_at: :desc)
                         .limit(3)
  end
end
