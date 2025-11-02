class AddSlugToPosts < ActiveRecord::Migration[8.1]
  class MigrationPost < ApplicationRecord
    self.table_name = "posts"
  end

  def up
    add_column :posts, :slug, :string
    add_index :posts, :slug, unique: true

    MigrationPost.reset_column_information

    say_with_time "Backfilling post slugs" do
      MigrationPost.find_each do |post|
        base_slug = post.title.to_s.parameterize.presence || "post"
        candidate = base_slug
        sequence = 2

        while MigrationPost.where.not(id: post.id).exists?(slug: candidate)
          candidate = "#{base_slug}-#{sequence}"
          sequence += 1
        end

        post.update_columns(slug: candidate)
      end
    end

    change_column_null :posts, :slug, false
  end

  def down
    remove_index :posts, :slug if index_exists?(:posts, :slug)
    remove_column :posts, :slug
  end
end
