class PagesController < ApplicationController
  def home
    @contact_submitted = cookies[:contact_submission].present?
    @contact = Contact.new unless @contact_submitted
  end

  def orbwalker
  end

  def privacy
  end
end
