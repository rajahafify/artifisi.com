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

  test "re-renders orbwalker page with feedback when newsletter signup is invalid" do
    assert_no_difference("Contact.count") do
      post contacts_path, params: {
        source: "orbwalker_newsletter",
        contact: {
          name: "",
          email: "",
          company: "",
          message: "Orbwalker newsletter signup"
        }
      }
    end

    assert_response :unprocessable_entity
    assert_select "section#follow"
    assert_select "p", text: "Please correct the highlighted fields and try again."
    assert_select "li", text: "Name can't be blank"
    assert_select "li", text: "Email can't be blank"
  end

  test "creates orbwalker newsletter contact and redirects back to follow section" do
    assert_difference("Contact.count", 1) do
      post contacts_path, params: {
        source: "orbwalker_newsletter",
        contact: {
          name: "Newsletter Fan",
          email: "fan@example.com",
          company: "",
          message: "Orbwalker newsletter signup"
        }
      }
    end

    assert_redirected_to orbwalker_path(anchor: "follow")
    assert_equal "Thanks for signing up. We'll share Orbwalker updates soon.", flash[:notice]
  end
end
