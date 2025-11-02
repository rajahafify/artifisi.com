class AddBodyToPosts < ActiveRecord::Migration[8.1]
  class MigrationPost < ApplicationRecord
    self.table_name = "posts"
  end

  class MigrationRichText < ApplicationRecord
    self.table_name = "action_text_rich_texts"
  end

  def up
    add_column :posts, :body, :text

    MigrationPost.reset_column_information

    say_with_time "Backfilling post bodies from ActionText" do
      MigrationRichText.where(record_type: "Post", name: "body").find_each do |rich_text|
        post = MigrationPost.find_by(id: rich_text.record_id)
        next unless post

        post.update_columns(body: rich_text.body) if post.body.blank?
      end
    end

    change_column_null :posts, :body, false, ""
  end

  def down
    remove_column :posts, :body
  end
end
