require "test_helper"

class DashboardControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(
      name: "Dashboard User",
      email: "dashboard@example.com",
      password: "password123",
      password_confirmation: "password123"
    )
  end

  test "redirects guests to sign-in" do
    get dashboard_path

    assert_redirected_to new_session_path
    assert_equal "Please sign in to continue.", flash[:alert]
  end

  test "renders dashboard for signed-in users" do
    post session_path, params: {
      session: { email: @user.email, password: "password123" }
    }

    assert_redirected_to dashboard_path

    get dashboard_path
    assert_response :success
    assert_select "div.dashboard-container"
    assert_select "div", class: /rounded-3xl.*bg-white/
    assert_select "aside", text: /Dashboard/
    assert_select "section#overview"
    assert_select "form[action='#{session_path}'] button", text: "Log out"
  end
end
