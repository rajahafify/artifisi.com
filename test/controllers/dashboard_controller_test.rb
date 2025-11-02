require "test_helper"

class DashboardControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(
      name: "Dashboard User",
      email: "dashboard@example.com",
      password: "password123",
      password_confirmation: "password123"
    )
  end

  test "redirects guests to sign-in" do
    get dashboard_path

    assert_redirected_to login_path
    assert_equal "Please sign in to continue.", flash[:alert]
  end

  test "renders dashboard for signed-in users" do
    extra_users = []
    6.times do |index|
      extra_users << User.create!(
        name: "Member #{index}",
        email: "member#{index}@example.com",
        password: "password123",
        password_confirmation: "password123"
      )
    end
    posts = []
    3.times do |index|
      posts << Post.create!(
        title: "Sample Post #{index + 1}",
        body: "Body for sample post #{index + 1}",
        status: index.even? ? "draft" : "published",
        author: @user
      )
    end
    contacts = []
    3.times do |index|
      contacts << Contact.create!(
        name: "Lead #{index + 1}",
        email: "lead#{index + 1}@example.com",
        company: "Company #{index + 1}",
        message: "I am interested in learning more about Artifisi #{index + 1}."
      )
    end

    post session_path, params: {
      session: { email: @user.email, password: "password123" }
    }

    assert_redirected_to dashboard_path

    get dashboard_path
    assert_response :success
    assert_select "div.dashboard-container"
    assert_select "div", class: /rounded-3xl.*bg-white/
    assert_select "aside", text: /Dashboard/
    assert_select "a[href='#{profile_path}']", text: /View/
    assert_select "section#profile", false
    assert_select "section#users table tbody tr", 5
    assert_select "section#users a[href='#{users_path}']", text: /View more/i
    assert_select "section#users a[href='#{new_user_path}']", text: /Add user/i
    recent_users = User.order(created_at: :desc).limit(5)
    recent_users.each do |recent_user|
      assert_select "section#users a[href='#{user_path(recent_user)}']", text: recent_user.name
      assert_select "section#users a[href='#{edit_user_path(recent_user)}']", text: /Update/i
      assert_select "section#users form[action='#{user_path(recent_user)}'] input[name='_method'][value='delete']"
    end
    assert_select "section#blogs"
    assert_select "section#blogs h2", text: /Blog posts/i
    assert_select "section#blogs a[href='#{new_post_path}']", text: /Add post/i
    assert_select "section#blogs a[href='#{posts_path}']", text: /View more/i
    assert_select "section#blogs table tbody tr", 3
    posts.first(3).each do |post_record|
      assert_select "section#blogs a[href='#{post_path(post_record)}']", text: post_record.title
      assert_select "section#blogs td", text: post_record.status.titleize
      assert_select "section#blogs a[href='#{edit_post_path(post_record)}']", text: /Edit/i
      assert_select "section#blogs form[action='#{post_path(post_record)}'] input[name='_method'][value='delete']"
    end
    assert_select "section#contacts"
    assert_select "section#contacts h2", text: /Contact requests/i
    assert_select "section#contacts table tbody tr", 3
    contacts.first(3).each do |contact_record|
      assert_select "section#contacts td", text: contact_record.name
      assert_select "section#contacts td", text: contact_record.email
      assert_select "section#contacts td", text: contact_record.company
    end
    assert_select "section#contacts a[href='#{new_contact_path}']", text: /Add contact/i
    assert_select "section#contacts a[href='#{contacts_path}']", text: /View more/i
    assert_select "a[href='#{new_post_path}']", text: /Add post/i
    assert_select "form[action='#{session_path}'] button", text: "Log out"
  end
end
