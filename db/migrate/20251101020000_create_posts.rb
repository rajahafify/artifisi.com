class CreatePosts < ActiveRecord::Migration[8.1]
  def change
    create_table :posts do |t|
      t.string :title, null: false
      t.text :body, null: false
      t.string :status, null: false, default: "draft"
      t.references :author, null: false, foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :posts, :status
    add_index :posts, :created_at
  end
end
