class BlogsController < ApplicationController
  layout "application"

  def show
    slug = params[:slug].to_s.gsub(/[^a-z0-9_-]/, "")
    template = "blogs/#{slug.tr("-", "_")}"
    raise ActionController::RoutingError, "Not Found" unless lookup_context.template_exists?(template, [], false)

    render template: template
  end
end
