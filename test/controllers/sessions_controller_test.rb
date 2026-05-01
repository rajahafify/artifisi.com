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
    get login_path

    assert_response :success
    assert_select "div.min-h-screen.bg-slate-50"
    assert_select "div.max-w-7xl.mx-auto"
    assert_select "div", class: /rounded-2xl/
    assert_select "h1", "Sign in to your account"
    assert_select "form button", text: "Sign In"
  end

  test "login page does not contain AI dashboard or SaaS language" do
    get login_path

    assert_response :success
    assert_no_match(/AI performance/i, response.body)
    assert_no_match(/adoption metrics/i, response.body)
    assert_no_match(/team collaboration/i, response.body)
    assert_no_match(/Live insights/i, response.body)
    assert_no_match(/Human-centered controls/i, response.body)
    assert_no_match(/smarter decisions/i, response.body)
    assert_no_match(/personalized dashboards/i, response.body)
    assert_no_match(/granular roles/i, response.body)
  end

  test "redirects authenticated users from login page" do
    post session_path, params: {
      session: {
        email: @user.email,
        password: "password123"
      }
    }

    get login_path

    assert_redirected_to dashboard_path
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
