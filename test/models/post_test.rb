require "test_helper"

class PostTest < ActiveSupport::TestCase
  def setup
    @author = User.create!(
      name: "Author",
      email: "author@example.com",
      password: "password123",
      password_confirmation: "password123"
    )
  end

  def valid_attributes(overrides = {})
    {
      title: "A fresh blog post",
      body: "<div><p>This is the full body of the blog post used for testing.</p></div>",
      author: @author,
      status: "draft"
    }.merge(overrides)
  end

  test "valid with required attributes" do
    post = Post.new(valid_attributes)

    assert post.valid?
  end

  test "requires title, body, and author" do
    post = Post.new

    assert_not post.valid?
    assert_includes post.errors[:title], "can't be blank"
    assert_includes post.errors[:body], "can't be blank"
    assert_includes post.errors[:author], "must exist"
  end

  test "restricts status to draft or published" do
    post = Post.new(valid_attributes)

    assert_raises ArgumentError do
      post.status = "archived"
    end
  end

  test "defaults status to draft" do
    post = Post.new(valid_attributes.except(:status))

    assert_equal "draft", post.status
    assert_equal "This is the full body of the blog post used for testing.", post.body.to_plain_text
  end

  test "provides enum helpers for status" do
    post = Post.new(valid_attributes)

    assert post.draft?
    post.published!
    assert post.published?
    assert_equal %w[draft published], Post.statuses.keys.sort
  end

  test "body is handled via rich text" do
    post = Post.new(valid_attributes)

    assert post.body.respond_to?(:to_trix_html)
    assert_includes post.body.to_trix_html, "<p>This is the full body of the blog post used for testing.</p>"
  end

  test "generates sanitized slug from title" do
    post = Post.create!(valid_attributes.merge(title: "Hello World! 2025"))

    assert_equal "hello-world-2025", post.slug
    assert_equal post.slug, post.to_param
  end

  test "ensures slug uniqueness" do
    Post.create!(valid_attributes.merge(title: "Duplicate Title"))
    second = Post.create!(valid_attributes.merge(title: "Duplicate Title"))

    assert_not_equal "duplicate-title", second.slug
    assert_match(/\Aduplicate-title-\d+\z/, second.slug)
  end

  test "updates slug when title changes" do
    post = Post.create!(valid_attributes.merge(title: "Initial Title"))

    post.update!(title: "Renamed Title")

    assert_equal "renamed-title", post.slug
  end
end
