class BlogsController < ApplicationController
  layout "application"

  def show
    slug = params[:slug]
    render slug.parameterize.underscore
  rescue ActionView::MissingTemplate
    raise ActiveRecord::RecordNotFound
  end
end
