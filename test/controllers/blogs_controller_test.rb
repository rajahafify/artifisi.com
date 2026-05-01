require "test_helper"

class BlogsControllerTest < ActionDispatch::IntegrationTest
  test "serves template-backed blog page" do
    get "/blogs/introducing-orbwalker"
    assert_response :success
    assert_select "h1", text: "Introducing Orbwalker"
  end

  test "returns 404 for slugs without matching template" do
    get "/blogs/nonexistent-slug"
    assert_response :not_found
  end
end
