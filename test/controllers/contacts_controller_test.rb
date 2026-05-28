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

  test "successful orbwalker newsletter submission via turbo stream replaces the signup form" do
    assert_difference("Contact.count", 1) do
      post contacts_path,
           params: {
             source: "orbwalker_newsletter",
             contact: {
               name: "Newsletter Fan",
               email: "fan@example.com",
               company: "",
               message: "Orbwalker newsletter signup"
             }
           },
           as: :turbo_stream
    end

    assert_response :success
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    assert_includes response.body, 'turbo-stream action="replace" target="orbwalker_newsletter_form"'
    assert_match(/You're on the list\./, response.body)
  end

  test "invalid orbwalker newsletter submission via turbo stream shows inline errors" do
    assert_no_difference("Contact.count") do
      post contacts_path,
           params: {
             source: "orbwalker_newsletter",
             contact: {
               name: "",
               email: "",
               company: "",
               message: "Orbwalker newsletter signup"
             }
           },
           as: :turbo_stream
    end

    assert_response :unprocessable_entity
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    assert_includes response.body, 'turbo-stream action="replace" target="orbwalker_newsletter_form"'
    assert_match(/Name can(&#39;|')t be blank/, response.body)
    assert_match(/Email can(&#39;|')t be blank/, response.body)
  end

  test "invalid orbwalker newsletter html submission re-renders orbwalker page with inline errors" do
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
    assert_select "h1", "Orbwalker"
    assert_select "turbo-frame#orbwalker_newsletter_form" do
      assert_select "p", text: "Name can't be blank"
      assert_select "p", text: "Email can't be blank"
    end
  end
end
