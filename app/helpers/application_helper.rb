module ApplicationHelper
  def render_public_header
    render "layouts/public_header"
  end

  def render_post_body(html)
    sanitize(html, tags: %w[h2 h3 h4 h5 h6 p ul ol li strong em a blockquote pre code br], attributes: %w[href])
  end

  def post_excerpt(html, length: 120)
    strip_tags(html.to_s).squish.truncate(length)
  end
end
