class PagesController < ApplicationController
  def home
    @contact_submitted = cookies[:contact_submission].present?
    @contact = Contact.new unless @contact_submitted
    @featured_posts = Post.recent_published
  end
end
