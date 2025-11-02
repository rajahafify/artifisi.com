class ChangePostsStatusToEnum < ActiveRecord::Migration[8.1]
  def up
    add_column :posts, :status_new, :integer, default: 0, null: false

    execute <<~SQL.squish
      UPDATE posts
      SET status_new = CASE status
        WHEN 'published' THEN 1
        ELSE 0
      END
    SQL

    remove_index :posts, :status if index_exists?(:posts, :status)
    remove_column :posts, :status
    rename_column :posts, :status_new, :status
    add_index :posts, :status
  end

  def down
    add_column :posts, :status_old, :string, default: "draft", null: false

    execute <<~SQL.squish
      UPDATE posts
      SET status_old = CASE status
        WHEN 1 THEN 'published'
        ELSE 'draft'
      END
    SQL

    remove_index :posts, :status if index_exists?(:posts, :status)
    remove_column :posts, :status
    rename_column :posts, :status_old, :status
    add_index :posts, :status
  end
end
