require "test_helper"

class UsersControllerTest < ActionDispatch::IntegrationTest
  test "renders new user form" do
    get new_user_path
    assert_response :success
    assert_select "div.min-h-screen.bg-slate-50"
    assert_select "div.max-w-7xl.mx-auto"
    assert_select "div", class: /rounded-2xl/
    assert_select "h1", "Create your Artifisi account"
  end

  test "creates user with valid parameters" do
    assert_difference("User.count", 1) do
      post users_path, params: {
        user: {
          name: "Test User",
          email: "user@example.com",
          password: "password123",
          password_confirmation: "password123"
        }
      }
    end

    user = User.order(:created_at).last
    assert_redirected_to user_path(user)
    follow_redirect!
    assert_response :success
  end

  test "does not create user with invalid parameters" do
    assert_no_difference("User.count") do
      post users_path, params: {
        user: {
          name: "",
          email: "invalid",
          password: "short",
          password_confirmation: "mismatch"
        }
      }
    end

    assert_response :unprocessable_entity
  end
end
