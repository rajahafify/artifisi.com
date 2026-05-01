# File Map

**Summary**: Feature-to-file mapping across the codebase.  
**Sources**: `app/`, `test/`, `config/`  
**Last updated**: 2026-05-01

---

## Overview

Maps features to their primary implementation files, aiding navigation and impact analysis.

## Landing Page

| File | Role |
|---|---|
| `app/controllers/pages_controller.rb` | Serves home page |
| `app/views/pages/home.html.erb` | Home page template |
| `test/controllers/pages_controller_test.rb` | Page controller tests |

## Blog

| File | Role |
|---|---|
| `app/controllers/blogs_controller.rb` | Public blog post display |
| `app/views/blogs/show.html.erb` | Blog post template |
| `test/controllers/blogs_controller_test.rb` | Blog controller tests |

## Contact Form

| File | Role |
|---|---|
| `app/controllers/contacts_controller.rb` | Contact CRUD |
| `app/models/contact.rb` | Contact model + validations |
| `app/views/contacts/_form.html.erb` | Contact form partial |
| `app/views/contacts/_success.html.erb` | Success state partial |
| `app/views/contacts/index.html.erb` | Contact list (admin) |
| `app/views/contacts/new.html.erb` | Public contact form |
| `test/controllers/contacts_controller_test.rb` | Contact controller tests |
| `test/models/contact_test.rb` | Contact model tests |
| `test/integration/home_contact_form_test.rb` | Home page contact form integration |

## Authentication

| File | Role |
|---|---|
| `app/controllers/sessions_controller.rb` | Login/logout handling |
| `app/controllers/registrations_controller.rb` | User registration |
| `app/models/user.rb` | User model (has_secure_password) |
| `app/views/sessions/new.html.erb` | Login form |
| `app/views/registrations/new.html.erb` | Registration form |
| `test/controllers/sessions_controller_test.rb` | Session tests |
| `test/controllers/registrations_controller_test.rb` | Registration tests |
| `test/models/user_test.rb` | User model tests |

## User Management (Admin)

| File | Role |
|---|---|
| `app/controllers/users_controller.rb` | User CRUD |
| `app/views/users/index.html.erb` | User list |
| `app/views/users/show.html.erb` | User detail |
| `app/views/users/new.html.erb` | Create user |
| `app/views/users/edit.html.erb` | Edit user |
| `app/views/users/profile.html.erb` | Profile page |
| `test/controllers/users_controller_test.rb` | User controller tests |

## Posts (Admin)

| File | Role |
|---|---|
| `app/controllers/posts_controller.rb` | Post CRUD |
| `app/models/post.rb` | Post model |
| `app/views/posts/index.html.erb` | Post list |
| `app/views/posts/show.html.erb` | Post detail |
| `app/views/posts/new.html.erb` | Create post |
| `app/views/posts/edit.html.erb` | Edit post |
| `app/views/posts/_form.html.erb` | Post form partial |
| `test/controllers/posts_controller_test.rb` | Post controller tests |
| `test/models/post_test.rb` | Post model tests |

## Dashboard

| File | Role |
|---|---|
| `app/controllers/dashboard_controller.rb` | Dashboard logic |
| `app/views/dashboard/show.html.erb` | Dashboard shell |
| `app/views/dashboard/_header.html.erb` | Dashboard header |
| `app/views/dashboard/_sidebar.html.erb` | Dashboard sidebar |
| `app/views/dashboard/_section.html.erb` | Section wrapper |
| `app/views/dashboard/_contacts_table.html.erb` | Contacts table |
| `app/views/dashboard/_posts_table.html.erb` | Posts table |
| `app/views/dashboard/_users_table.html.erb` | Users table |
| `test/controllers/dashboard_controller_test.rb` | Dashboard tests |

## JavaScript (Stimulus)

| File | Role |
|---|---|
| `app/javascript/application.js` | JS entry point |
| `app/javascript/controllers/application.js` | Stimulus application bootstrap |
| `app/javascript/controllers/index.js` | Controller auto-loader |
| `app/javascript/controllers/hello_controller.js` | Example controller |
| `app/javascript/lib/tailwindcss-stimulus-components.js` | Tailwind + Stimulus utilities |

## Assets & Styles

| File | Role |
|---|---|
| `app/assets/stylesheets/app.css` | Main stylesheet |
| `app/assets/images/hero.webp` | Hero image |
| `app/assets/images/values.webp` | Values section image |
| `test/assets/liquid_glass_styles_test.rb` | Style asset tests |

## Configuration

| File | Role |
|---|---|
| `config/application.rb` | App configuration |
| `config/routes.rb` | Route definitions |
| `config/database.yml` | Database config |
| `config/deploy.yml` | Kamal deployment |
| `config/importmap.rb` | JS import maps |
| `config/puma.rb` | Web server config |
| `config/queue.yml` | Solid Queue config |
| `config/recurring.yml` | Recurring jobs |
| `config/cache.yml` | Solid Cache config |
| `config/cable.yml` | Solid Cable config |

## Related Pages

- [[architecture]]
- [[features]]
