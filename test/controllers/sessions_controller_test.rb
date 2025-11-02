require "test_helper"

class SessionsControllerTest < ActionDispatch::IntegrationTest
  def setup
    @user = User.create!(
      name: "Existing User",
      email: "existing@example.com",
      password: "password123",
      password_confirmation: "password123"
    )
  end

  test "creates session for valid credentials" do
    post session_path, params: {
      session: {
        email: @user.email,
        password: "password123"
      }
    }

    assert_redirected_to dashboard_path
    assert_equal @user.id, session[:user_id]
  end

  test "renders Tailwind-styled login page" do
    get new_session_path

    assert_response :success
    assert_select "div.min-h-screen.bg-slate-50"
    assert_select "div.max-w-7xl.mx-auto"
    assert_select "div", class: /rounded-2xl/
    assert_select "h1", "Sign in to your account"
    assert_select "form button", text: "Sign In"
  end

  test "does not create session for invalid credentials and shows inline error" do
    post session_path, params: {
      session: {
        email: @user.email,
        password: "wrong-password"
      }
    }

    assert_response :unprocessable_entity
    assert_nil session[:user_id]
    assert_select "div[data-field='session[email]'] .form-field-error", text: "Invalid email or password."
    assert_select "div[data-field='session[password]'] .form-field-error", text: "Invalid email or password."
  end

  test "destroys session" do
    post session_path, params: {
      session: {
        email: @user.email,
        password: "password123"
      }
    }

    delete session_path
    assert_redirected_to root_path
    assert_nil session[:user_id]
  end
end
