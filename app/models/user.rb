require "securerandom"
require "openssl"

class User < ApplicationRecord
  attr_reader :password
  attr_accessor :password_confirmation

  before_validation :normalize_email

  validates :name, presence: true
  validates :email, presence: true, format: { with: URI::MailTo::EMAIL_REGEXP }, uniqueness: { case_sensitive: false }
  validates :password, presence: true, length: { minimum: 8 }, if: :password_required?
  validate :password_confirmation_matches, if: :password_required?

  def password=(unencrypted_password)
    @password = unencrypted_password
    return if unencrypted_password.blank?

    self.password_salt = generate_salt
    self.password_digest = digest_password(unencrypted_password, password_salt)
  end

  def authenticate(unencrypted_password)
    return false if password_digest.blank? || password_salt.blank?

    candidate = digest_password(unencrypted_password, password_salt)
    ActiveSupport::SecurityUtils.secure_compare(password_digest, candidate)
  rescue ArgumentError
    false
  end

  private

  def password_required?
    password_digest.blank? || @password.present?
  end

  def password_confirmation_matches
    return if @password == password_confirmation

    errors.add(:password_confirmation, "doesn't match Password")
  end

  def normalize_email
    self.email = email.to_s.strip.downcase.presence
  end

  def generate_salt
    SecureRandom.hex(16)
  end

  def digest_password(unencrypted_password, salt)
    digest = OpenSSL::Digest::SHA256.hexdigest("#{salt}--#{unencrypted_password}")
    digest
  end
end
