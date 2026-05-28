require "test_helper"

class PagesControllerTest < ActionDispatch::IntegrationTest
  test "GET / renders artifisi.com home content" do
    get root_url

    assert_response :success
    assert_select "header", text: /Artifisi/i
    [ "Home", "Orbwalker", "About", "Devlog", "Contact" ].each do |link|
      assert_select "header a", text: link
    end

    assert_select "h1", "Original Games from Malaysia"
    assert_select "p", text: /Orbwalker/
    assert_select "a[data-role='primary-cta']", text: "Follow Orbwalker"
    assert_select "a[data-role='secondary-cta']", text: "Contact the Studio"

    assert_select "section", text: /About Artifisi/i
    assert_select "section", text: /Our Mission/i
    assert_select "section", text: /Our Vision/i
    assert_select "section", text: /Our Approach/i
    %w[Craftsmanship Player-First\ Design Collaboration Agility Continuous\ Learning Malaysian\ Roots,\ Global\ Reach].each do |value|
      assert_select "section", text: /#{Regexp.escape(value)}/
    end

    [ "Game Development", "Art & Animation", "Game Design", "Quality Assurance" ].each do |service|
      assert_select "section", text: /#{Regexp.escape(service)}/
    end

    assert_select "section", text: /Our Capabilities/i
    assert_select "section", text: /Our Services/i, count: 0

    assert_select "section", text: /Orbwalker/
    assert_select "footer", text: /Building original games in Malaysia since 2024/

    # 4.3 — devlog section
    assert_select "section#devlog", 1
    assert_select "section#devlog h2", text: /devlog/i
    assert_select "section#blog", count: 0

    # 4.2 — no placeholder phone
    assert_no_match(/\+60 12-345 6789/, response.body)

    # 4.4 — press kit link
    assert_select "footer a", text: /press kit/i

    assert_select "section#devlog a[href='#{blog_path('introducing-orbwalker')}']", text: /Read more/
    assert_select "section#devlog article", 4
    assert_select "header a", text: "Request a demo", count: 0
    assert_select "header a", text: "Log in", count: 0
    assert_select "main.pt-20", count: 0
  end

  # 4.1 — team/founder section
  test "GET / renders team or founder presence" do
    get root_url
    assert_response :success
    assert_select "section", text: /team|founder/i
  end

  test "GET /projects/orbwalker renders Orbwalker detail page" do
    get orbwalker_path

    assert_response :success
    assert_select "h1", "Orbwalker"
    assert_select "body", /match-3 roguelike/i
    assert_select "body", /fantasy/i

    assert_select "section#follow form[action='#{contacts_path}'][method='post']" do
      assert_select "input[name='source'][value='orbwalker_newsletter']"
      assert_select "input[name='contact[name]'][type='text']"
      assert_select "input[name='contact[email]'][type='email']"
      assert_select "input[name='contact[message]'][value='Orbwalker newsletter signup']"
      assert_select "button[type='submit']", text: /sign up/i
    end
    assert_select "section#follow a", text: /contact the studio/i
  end

  test "GET /privacy renders privacy policy page" do
    get privacy_path

    assert_response :success
    assert_select "h1", /privacy/i
    assert_select "body", /collect/i
    assert_select "footer a[href='#{privacy_path}']"
  end
end
