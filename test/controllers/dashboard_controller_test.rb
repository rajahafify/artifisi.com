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
    extra_users = []
    6.times do |index|
      extra_users << User.create!(
        name: "Member #{index}",
        email: "member#{index}@example.com",
        password: "password123",
        password_confirmation: "password123"
      )
    end

    post session_path, params: {
      session: { email: @user.email, password: "password123" }
    }

    assert_redirected_to dashboard_path

    get dashboard_path
    assert_response :success
    assert_select "div.dashboard-container"
    assert_select "div", class: /rounded-3xl.*bg-white/
    assert_select "aside", text: /Dashboard/
    assert_select "a[href='#{profile_path}']", text: /View/
    assert_select "section#profile", false
    assert_select "section#users table tbody tr", 5
    assert_select "section#users a[href='#{users_path}']", text: /View more/i
    assert_select "section#users a[href='#{new_user_path}']", text: /Add user/i
    recent_users = User.order(created_at: :desc).limit(5)
    recent_users.each do |recent_user|
      assert_select "section#users a[href='#{edit_user_path(recent_user)}']", text: /Update/i
      assert_select "section#users form[action='#{user_path(recent_user)}'] input[name='_method'][value='delete']"
    end
    assert_select "form[action='#{session_path}'] button", text: "Log out"
  end
end
