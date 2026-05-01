class BlogsController < ApplicationController
  layout "application"

  def show
    safe_slug = params[:slug].to_s.gsub(/[^a-z0-9_-]/, "")
    render template: "blogs/#{safe_slug.tr('-', '_')}"
  rescue ActionView::MissingTemplate
    raise ActiveRecord::RecordNotFound
  end
end
