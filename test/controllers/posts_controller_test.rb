require "test_helper"

class PostsControllerTest < ActionDispatch::IntegrationTest
  include ActionView::Helpers::SanitizeHelper
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
        body: "<div><p>Body #{index + 1}</p></div>",
        status: index.zero? ? :draft : :published,
        author: @user
      )
    end

    get posts_path

    assert_response :success
    assert_select "section#posts-index"
    assert_select "section#posts-index table tbody tr", 2
    posts.each do |post|
      assert_select "section#posts-index a[href='#{post_path(post)}']", text: post.title
      first_word = strip_tags(post.body).split.first
      assert_select "section#posts-index td", text: /#{Regexp.escape(first_word)}/
      assert_select "section#posts-index td", text: post.status.titleize
      assert_select "section#posts-index a[href='#{edit_post_path(post)}']", text: /Edit/i
      assert_select "section#posts-index form[action='#{post_path(post)}'] input[name='_method'][value='delete']"
    end
    assert_select "a[href='#{new_post_path}']", text: /New post/i
  end

  test "renders new for signed-in users" do
    sign_in_as(@user)

    get new_post_path

    assert_response :success
    assert_select "form[action='#{posts_path}']"
    assert_select "input[name='post[title]']"
    assert_select "input[type='hidden'][name='post[body]']"
    assert_select "div[data-controller='lexxy-editor']"
    assert_select "select[name='post[status]'] option[value='draft']"
    assert_select "select[name='post[status]'] option[value='published']"
  end

  test "creates post with valid attributes" do
    sign_in_as(@user)

    assert_difference "Post.count", 1 do
      post posts_path, params: {
        post: {
          title: "A valid blog post",
          body: "<div><p>Here is the full body content for the blog post.</p></div>",
          status: "published"
        }
      }
    end

    created_post = Post.order(:created_at).last
    assert_redirected_to post_path(created_post)
    assert_equal "Post created successfully.", flash[:notice]
    assert_equal @user, created_post.author
    assert_equal "published", created_post.status
    assert_equal "Here is the full body content for the blog post.", strip_tags(created_post.body)
    assert_equal "a-valid-blog-post", created_post.slug
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

  test "shows post details" do
    sign_in_as(@user)
    post_record = Post.create!(
      title: "Dashboard Insights",
      body: "<div><p>Rich content</p></div>",
      author: @user
    )

    get post_path(post_record)

    assert_response :success
    assert_select "h1", text: /Dashboard Insights/
    assert_select ".prose", text: /Rich content/
    assert_select "a[href='#{edit_post_path(post_record)}']", text: "Edit"
  end

  test "renders edit form for signed-in users" do
    sign_in_as(@user)
    post_record = Post.create!(
      title: "Edit Me",
      body: "<div><p>Body text</p></div>",
      author: @user
    )

    get edit_post_path(post_record)

    assert_response :success
    assert_select "form[action='#{post_path(post_record)}']"
    assert_select "input[name='post[title]'][value='Edit Me']"
    assert_select "div[data-controller='lexxy-editor']"
  end

  test "updates post with valid attributes" do
    sign_in_as(@user)
    post_record = Post.create!(
      title: "Old Title",
      body: "<div><p>Original</p></div>",
      status: :draft,
      author: @user
    )

    patch post_path(post_record), params: {
      post: {
        title: "Updated Title",
        status: "published"
      }
    }

    post_record.reload
    assert_redirected_to post_path(post_record)
    assert_equal "Updated Title", post_record.title
    assert_equal "published", post_record.status
    assert_equal "updated-title", post_record.slug
  end

  test "destroys post" do
    sign_in_as(@user)
    post_record = Post.create!(
      title: "Disposable",
      body: "<div><p>bye</p></div>",
      author: @user
    )

    assert_difference "Post.count", -1 do
      delete post_path(post_record)
    end

    assert_redirected_to posts_path
  end

  private

  def sign_in_as(user)
    post session_path, params: {
      session: { email: user.email, password: "password123" }
    }
    assert_redirected_to dashboard_path
  end
end
