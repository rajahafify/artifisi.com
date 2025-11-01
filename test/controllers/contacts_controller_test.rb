require "test_helper"

class ContactsControllerTest < ActionDispatch::IntegrationTest
  test "renders the contact form" do
    get new_contact_path
    assert_response :success
  end

  test "creates a contact and redirects to the home page" do
    assert_difference("Contact.count", 1) do
      post contacts_path, params: {
        contact: {
          name: "Jane Doe",
          email: "jane@example.com",
          company: "Acme Corp",
          message: "I'd love to learn more about working together."
        }
      }
    end

    assert_redirected_to root_path
  end
end
