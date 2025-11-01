require "test_helper"

class TailwindSetupTest < ActiveSupport::TestCase
  def test_layout_includes_tailwind_cdn_script
    layout_path = Rails.root.join("app/views/layouts/application.html.erb")
    html = File.read(layout_path)

    assert_includes html, "https://cdn.tailwindcss.com",
                     "expected layout to include Tailwind CDN script tag"
  end

  def test_tailwind_gem_not_present
    gemfile = File.read(Rails.root.join("Gemfile"))
    refute_includes gemfile, "tailwindcss-rails",
                     "expected Tailwind CDN setup to avoid tailwindcss-rails gem"
  end
end
