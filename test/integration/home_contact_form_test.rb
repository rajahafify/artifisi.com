require "test_helper"

class HomeContactFormTest < ActionDispatch::IntegrationTest
  test "contact section form submits to contacts path with required fields" do
    get root_path
    assert_response :success

    assert_select "section#contact turbo-frame#contact_form form[action='#{contacts_path}'][method='post']" do
      assert_select "input[name='contact[name]'][type='text']"
      assert_select "input[name='contact[email]'][type='email']"
      assert_select "input[name='contact[company]'][type='text']"
      assert_select "textarea[name='contact[message]']"
      assert_select "button[type='submit']"
    end
  end

  test "successful contact submission via turbo stream replaces the form and sets cookie" do
    assert_difference("Contact.count", 1) do
      post contacts_path,
           params: {
             contact: {
               name: "Turbo Tester",
               email: "turbo@example.com",
               company: "Turbo Inc",
               message: "Turbo power!"
             }
           },
           as: :turbo_stream
    end

    assert_response :success
    assert_equal "text/vnd.turbo-stream.html", response.media_type
    assert_includes response.body, 'turbo-stream action="replace" target="contact_form"'
    assert_match(/Message sent\./, response.body)
    assert_match(/Someone from our team will get back to you as soon as possible\./, response.body)
    assert_equal Contact.last.id.to_s, cookies[:contact_submission]
  end

  test "contact section shows success message when submission cookie is present" do
    contact = Contact.create!(
      name: "Cookie Keeper",
      email: "cookie@example.com",
      company: "Cookie Co",
      message: "Storing state."
    )

    cookies[:contact_submission] = contact.id

    get root_path
    assert_response :success

    assert_select "section#contact turbo-frame#contact_form" do
      assert_select "h3", text: "Message sent."
      assert_select "p", text: /Someone from our team will get back to you as soon as possible\./
      assert_select "form", false
    end
  end
end
