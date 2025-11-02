require "test_helper"

class RegistrationsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = User.create!(
      name: "Existing User",
      email: "existing@example.com",
      password: "password123",
      password_confirmation: "password123"
    )
  end

  test "renders registration form for guests" do
    get registration_path

    assert_response :success
    assert_select "div.min-h-screen.bg-slate-50"
    assert_select "div.max-w-7xl.mx-auto"
    assert_select "div", class: /rounded-2xl/
    assert_select "h1", "Create your Artifisi account"
  end

  test "redirects authenticated users from registration page" do
    post session_path, params: {
      session: { email: @user.email, password: "password123" }
    }

    get registration_path

    assert_redirected_to dashboard_path
  end
end
