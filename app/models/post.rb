class Post < ApplicationRecord
  belongs_to :author, class_name: "User"

  enum :status, { draft: 0, published: 1 }, default: :draft

  scope :recent_published, ->(limit_value = 3) { published.order(created_at: :desc).limit(limit_value) }

  validates :title, presence: true
  validates :body, presence: true
  validates :slug, presence: true, uniqueness: true

  before_validation :generate_slug, if: :should_generate_slug?

  def to_param
    slug
  end

  private

  def should_generate_slug?
    title.present? && (slug.blank? || will_save_change_to_title?)
  end

  def generate_slug
    base_slug = title.to_s.parameterize.presence || "post"
    candidate = base_slug
    sequence = 2

    while Post.where.not(id: id).exists?(slug: candidate)
      candidate = "#{base_slug}-#{sequence}"
      sequence += 1
    end

    self.slug = candidate
  end
end
