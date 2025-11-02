require "test_helper"

class PostsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(
      name: "Author User",
      email: "author_user@example.com",
      password: "password123",
      password_confirmation: "password123"
    )
  end

  test "redirects guests from new" do
    get new_post_path

    assert_redirected_to login_path
    assert_equal "Please sign in to continue.", flash[:alert]
  end

  test "redirects guests from index" do
    get posts_path

    assert_redirected_to login_path
    assert_equal "Please sign in to continue.", flash[:alert]
  end

  test "renders index for signed-in users" do
    sign_in_as(@user)
    posts = []
    2.times do |index|
      posts << Post.create!(
        title: "Post #{index + 1}",
        body: "Body #{index + 1}",
        status: index.zero? ? :draft : :published,
        author: @user
      )
    end

    get posts_path

    assert_response :success
    assert_select "section#posts-index"
    assert_select "section#posts-index table tbody tr", 2
    posts.each do |post|
      assert_select "section#posts-index td", text: post.title
      assert_select "section#posts-index td", text: post.status.titleize
    end
    assert_select "a[href='#{new_post_path}']", text: /New post/i
  end

  test "renders new for signed-in users" do
    sign_in_as(@user)

    get new_post_path

    assert_response :success
    assert_select "form[action='#{posts_path}']"
    assert_select "input[name='post[title]']"
    assert_select "textarea[name='post[body]']"
    assert_select "select[name='post[status]'] option[value='draft']"
    assert_select "select[name='post[status]'] option[value='published']"
  end

  test "creates post with valid attributes" do
    sign_in_as(@user)

    assert_difference "Post.count", 1 do
      post posts_path, params: {
        post: {
          title: "A valid blog post",
          body: "Here is the full body content for the blog post.",
          status: "published"
        }
      }
    end

    assert_redirected_to dashboard_path
    assert_equal "Post created successfully.", flash[:notice]
    created_post = Post.order(:created_at).last
    assert_equal @user, created_post.author
    assert_equal "published", created_post.status
  end

  test "does not create post with invalid attributes" do
    sign_in_as(@user)

    assert_no_difference "Post.count" do
      post posts_path, params: {
        post: {
          title: "",
          body: ""
        }
      }
    end

    assert_response :unprocessable_entity
    assert_select "[data-test='post-errors']"
    assert_select "[data-test='post-errors']", text: /Title can't be blank/
  end

  private

  def sign_in_as(user)
    post session_path, params: {
      session: { email: user.email, password: "password123" }
    }
    assert_redirected_to dashboard_path
  end
end
