require "test_helper"

class LiquidGlassStylesTest < ActiveSupport::TestCase
  def test_liquid_glass_applies_text_shadow_to_all_descendants
    css = File.read(Rails.root.join("app/assets/stylesheets/app.css"))

    assert_match(
      /\.liquid-glass\s*,\s*\.liquid-glass\s+\*/,
      css,
      "expected .liquid-glass rule to target the element and all descendants"
    )

    assert_match(
      /\.liquid-glass\s*,\s*\.liquid-glass\s+\*[^}]*text-shadow:\s*[^;]+!important;/m,
      css,
      "expected .liquid-glass rule to define text-shadow with !important for all nested content"
    )
  end
end
