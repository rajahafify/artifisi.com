class ContactsController < ApplicationController
  before_action :require_login, only: :index

  def index
    @contacts = Contact.order(created_at: :desc)
  end

  def create
    @contact = Contact.new(contact_params)

    if @contact.save
      remember_contact_submission(@contact)

      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace("contact_form", partial: "contacts/success")
        end
        format.html do
          redirect_to root_path, notice: "Thanks for reaching out! We'll be in touch soon."
        end
      end
    else
      forget_contact_submission

      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: turbo_stream.replace(
            "contact_form",
            partial: "contacts/form",
            locals: { contact: @contact }
          ), status: :unprocessable_entity
        end
        format.html do
          @contact_submitted = false
          @featured_posts = Post.recent_published
          render "pages/home", status: :unprocessable_entity
        end
      end
    end
  end

  def new
    @contact_submitted = cookies[:contact_submission].present?
    @contact = Contact.new
  end

  private

  def contact_params
    params.require(:contact).permit(:name, :email, :company, :message)
  end

  def remember_contact_submission(contact)
    cookies[:contact_submission] = {
      value: contact.id,
      expires: 1.year.from_now
    }
  end

  def forget_contact_submission
    cookies.delete(:contact_submission)
  end
end
