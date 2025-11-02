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

  test "re-renders form with inline errors when contact is invalid" do
    assert_no_difference("Contact.count") do
      post contacts_path, params: {
        contact: {
          name: "",
          email: "",
          company: "",
          message: ""
        }
      }
    end

    assert_response :unprocessable_entity
    assert_select "div[data-field='contact[name]'] .form-field-error", text: "Name can't be blank"
    assert_select "div[data-field='contact[email]'] .form-field-error", text: "Email can't be blank"
    assert_select "div[data-field='contact[message]'] .form-field-error", text: "Message can't be blank"
  end
end
