class BlogsController < ApplicationController
  ALLOWED_SLUGS = %w[introducing-orbwalker free-orb-movement enemy-intent-combat building-match3-roguelike-malaysia].freeze

  layout "application"

  def show
    slug = params[:slug]
    raise ActionController::RoutingError, "Not Found" unless ALLOWED_SLUGS.include?(slug)

    render slug.tr("-", "_")
  end
end
