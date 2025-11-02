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
      body: "This is the full body of the blog post used for testing.",
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
  end

  test "provides enum helpers for status" do
    post = Post.new(valid_attributes)

    assert post.draft?
    post.published!
    assert post.published?
    assert_equal %w[draft published], Post.statuses.keys.sort
  end
end
