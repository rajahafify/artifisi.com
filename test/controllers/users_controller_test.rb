require "test_helper"
require "securerandom"

class UsersControllerTest < ActionDispatch::IntegrationTest
  def create_user(attributes = {})
    defaults = {
      name: "Example User",
      email: "example#{SecureRandom.hex(4)}@example.com",
      password: "password123",
      password_confirmation: "password123"
    }
    User.create!(defaults.merge(attributes))
  end

  def sign_in(user)
    post session_path, params: {
      session: {
        email: user.email,
        password: "password123"
      }
    }
    follow_redirect!
  end

  test "requires sign in for new user form" do
    get new_user_path
    assert_redirected_to login_path
    assert_equal "Please sign in to continue.", flash[:alert]
  end

  test "renders dashboard new user form for signed-in users" do
    admin = create_user

    sign_in(admin)

    get new_user_path
    assert_response :success
    assert_select "div.dashboard-container"
    assert_select "section h2", "Create user account"
    assert_select "form[action='#{users_path}']"
    assert_select "button", text: "Create user"
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
    assert_select "div[data-field='user[name]'] .form-field-error", text: "Name can't be blank"
    assert_select "div[data-field='user[email]'] .form-field-error", text: "Email is invalid"
    assert_select "div[data-field='user[password]'] .form-field-error", text: "Password is too short (minimum is 8 characters)"
    assert_select "div[data-field='user[password_confirmation]'] .form-field-error", text: "Password confirmation doesn't match Password"
  end

  test "lists users on index page" do
    admin = create_user
    users = Array.new(3) { |index| create_user(name: "Person #{index}", email: "person#{index}@example.com") }

    sign_in(admin)

    get users_path
    assert_response :success
    assert_select "table tbody tr", users.size + 1
    users.each do |user|
      assert_select "table tbody tr", text: /#{Regexp.escape(user.email)}/
    end
  end

  test "renders edit form" do
    admin = create_user
    user = create_user

    sign_in(admin)

    get edit_user_path(user)
    assert_response :success
    assert_select "form[action='#{user_path(user)}'][method='post']"
  end

  test "updates user with valid parameters and optional password" do
    admin = create_user
    user = create_user(name: "Old Name", email: "old@example.com")

    sign_in(admin)

    patch user_path(user), params: {
      user: {
        name: "Updated Name",
        email: "updated@example.com",
        password: "",
        password_confirmation: ""
      }
    }

    assert_redirected_to user_path(user)
    user.reload
    assert_equal "Updated Name", user.name
    assert_equal "updated@example.com", user.email
  end

  test "does not update user with invalid parameters" do
    admin = create_user
    user = create_user

    sign_in(admin)

    patch user_path(user), params: {
      user: {
        name: "",
        email: "invalid"
      }
    }

    assert_response :unprocessable_entity
    assert_select "div[data-field='user[name]'] .form-field-error", text: "Name can't be blank"
    assert_select "div[data-field='user[email]'] .form-field-error", text: "Email is invalid"
  end

  test "deletes user" do
    admin = create_user
    user = create_user

    sign_in(admin)

    assert_difference("User.count", -1) do
      delete user_path(user)
    end

    assert_redirected_to users_path
  end

  test "requires sign in for profile" do
    get profile_path
    assert_redirected_to login_path
    assert_equal "Please sign in to continue.", flash[:alert]
  end

  test "requires sign in for user show" do
    user = create_user

    get user_path(user)
    assert_redirected_to login_path
    assert_equal "Please sign in to continue.", flash[:alert]
  end

  test "shows profile for signed in user" do
    user = create_user(name: "Profile User", email: "profile@example.com")

    post session_path, params: {
      session: {
        email: user.email,
        password: "password123"
      }
    }

    get profile_path
    assert_response :success
    assert_select "div.dashboard-container"
    assert_select "aside", text: /Profile/
    assert_select "h1", text: /Welcome back/
    assert_select "*", text: /Profile User/
    assert_select "section#identity"
    assert_select "section#security"
    assert_select "section#preferences"
    assert_select "section#support"
    assert_select "a[href='#{edit_user_path(user)}']", text: /Edit profile/
  end


  test "shows user detail with dashboard shell" do
    admin = create_user
    user = create_user(name: "Managed User", email: "managed@example.com")

    sign_in(admin)

    get user_path(user)
    assert_response :success
    assert_select "div.dashboard-container"
    assert_select "aside", text: /Users/
    assert_select "h1", text: /Managed User/
    assert_select "section#identity"
    assert_select "section#status"
    assert_select "section#actions"
  end
end
