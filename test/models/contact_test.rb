require "test_helper"

class ContactTest < ActiveSupport::TestCase
  test "creates contact with valid attributes" do
    assert_difference("Contact.count", 1) do
      Contact.create!(
        name: "Jane Doe",
        email: "jane@example.com",
        company: "Acme Corp",
        message: "I'd love to learn more about your services."
      )
    end
  end
end
