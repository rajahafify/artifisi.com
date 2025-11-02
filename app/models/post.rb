class Post < ApplicationRecord
  belongs_to :author, class_name: "User"

  enum :status, { draft: 0, published: 1 }, default: :draft

  validates :title, presence: true
  validates :body, presence: true
end
