require "test_helper"

class UserTest < ActiveSupport::TestCase
  def setup
    @valid_attributes = {
      name: "Test User",
      email: "user@example.com",
      password: "password123",
      password_confirmation: "password123"
    }
  end

  test "valid with required attributes" do
    user = User.new(@valid_attributes)
    assert user.valid?
  end

  test "requires unique email (case insensitive)" do
    User.create!(@valid_attributes)
    duplicate = User.new(@valid_attributes.merge(email: "USER@example.com"))

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:email], "has already been taken"
  end

  test "requires password with minimum length" do
    user = User.new(@valid_attributes.merge(password: "short", password_confirmation: "short"))

    assert_not user.valid?
    assert_includes user.errors[:password], "is too short (minimum is 8 characters)"
  end

  test "downcases email before saving" do
    user = User.create!(@valid_attributes.merge(email: "User@Example.COM"))

    assert_equal "user@example.com", user.reload.email
  end
end
