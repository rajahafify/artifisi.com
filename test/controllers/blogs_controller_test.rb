require "test_helper"

class BlogsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @author = User.create!(
      name: "Blog Author",
      email: "blog_author@example.com",
      password: "password123",
      password_confirmation: "password123"
    )

    @published_post = Post.create!(
      title: "Published Story",
      body: "<div><p>Published body</p></div>",
      status: :published,
      author: @author
    )

    @draft_post = Post.create!(
      title: "Draft Story",
      body: "<div><p>Draft body</p></div>",
      status: :draft,
      author: @author
    )
  end

  test "shows published blog post" do
    get blog_path(@published_post)

    assert_response :success
    assert_select "h1", text: @published_post.title
    assert_select ".prose", text: /Published body/
  end

  test "returns not found for draft posts" do
    get blog_path(@draft_post)

    assert_response :not_found
  end
end
