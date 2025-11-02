require "test_helper"

class PagesControllerTest < ActionDispatch::IntegrationTest
  test "GET / renders artifisi.com home content" do
    get root_url

    assert_response :success
    assert_select "nav", text: /Artifisi/i
    [ "About", "Projects", "Blog", "Contact" ].each do |link|
      assert_select "nav a", text: link
    end

    assert_select "h1", "Advancing AI with Malaysian Innovation"
    assert_select "p", text: /Malaysian ingenuity/
    assert_select "a[data-role='primary-cta']", text: "Get started"
    assert_select "a[data-role='secondary-cta']", text: "Learn more"

    assert_select "section", text: /About Artifisi/i
    assert_select "section", text: /Our Mission/i
    assert_select "section", text: /Our Vision/i
    assert_select "section", text: /Our Approach/i
    %w[Innovation Ethical\ Responsibility Collaboration Agility Continuous\ Learning Local\ Expertise].each do |value|
      assert_select "section", text: /#{Regexp.escape(value)}/
    end

    [ "AI Consulting", "Custom AI Solutions", "AI Integration", "AI Training and Workshops" ].each do |service|
      assert_select "section", text: /#{Regexp.escape(service)}/
    end

    assert_select "section", text: /RTFC Real-Time Friendly Companion for gamers/
    assert_select "section", text: /Forecast: Shape Your Future/
    assert_select "footer", text: /Pioneering AI innovation in Malaysia since 2024/

    assert_select "a[href='#{login_path}']", text: "Log in"
    assert_select "main.pt-20", count: 0
  end
end
