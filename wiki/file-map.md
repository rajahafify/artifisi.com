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

## Reports

| File | Role |
|---|---|
| `reports/index.html` | The front door. Prices, packages, enquiry form, a card per published report |
| `reports/malaysia-wages/index.html` | The wages report page. Six claims, one scene each, the figures as real text |
| `reports/malaysia-wages/scene.js` | The wages scenes and the `Stage` class |
| `reports/malaysia-wages/data.json` | Every figure the wages page can show |
| `reports/malaysia-cpi/index.html` | The CPI report page. Six claims, one scene each, the figures as real text |
| `reports/malaysia-cpi/scene.js` | The CPI scenes and the `Stage` class. `Stage.backdrop()` hangs display type behind the chart in depth, `Stage.compose()` resizes and offsets the chart to make room for it. `makeTimeline()` resolves a phrase from the voice into a moment, and every scene's reveal steps are anchored to it |
| `reports/malaysia-cpi/data.json` | Every figure the CPI page can show |
| `reports/samples/households/index.html` | The KRI households sample. Unofficial, not checked by KRI |

## Report Working Folders

| File | Role |
|---|---|
| `raw/<slug>/source.json` | The rows the source returned. The only source in the folder |
| `raw/<slug>/source.md` | Citation block, field shapes, caveats |
| `raw/<slug>/brief.md` | Stage 1. Why this dataset and this story |
| `raw/<slug>/story.md` | Stage 4. Claim, evidence, counterpoint, so-what |
| `raw/<slug>/sections.md` | Stage 5. Six sections, one claim and one mechanism each |
| `raw/<slug>/numbers.csv` | Stage 3. The figure register. One row per figure, with its source reference |
| `raw/<slug>/tokens.css` | Stage 7. The palette and type scale |
| `raw/<slug>/qa.md` | Stage 10. The figure diff, the render checks, the known gaps |
| `raw/<slug>/qa/` | Screenshots and the rendered page text |
| `raw/<slug>/README.md` | Which file is current for each stage |
| `raw/<slug>/shots.json` | The shot list. Theme, size, the shots and the end card |
| `raw/<slug>/vo/script.txt` | The voice-over script, one line per shot |
| `raw/<slug>/vo/dur.json` | The measured duration of each voice line. These set the shot lengths |
| `raw/<slug>/vo/words.json` | The offset of every word in every voice line, and the sentences they make. This is what lets a chart show a number when the voice says it |
| `raw/<slug>/storyboard/` | One frame per shot, rendered from the live page, plus the contact sheet |
| `raw/<slug>/video/clips.json` | What was captured and how long. The clips and the mp4 are local, not tracked |

## Playbook and Tools

| File | Role |
|---|---|
| `playbook/pipeline.md` | The eleven stages and four gates for a report page. Gate 4 also checks the mechanism, the page's own tokens, the 9:16 frame and the one-second timing |
| `playbook/palettes.md` | The palette registry and how to pick a new one |
| `playbook/video.md` | The video pipeline, the five-beat arc, the card shot type, the craft rules for the cut, and the capture rules |
| `playbook/instructions.md` | Build and ship rules, version 3. The rules are numbered in the order they cost us time |
| `playbook/tools/browser.js` | Route, launch flags, `THEMES`, `overlayCSS`, `frameContext`, `openShot`, `cardHTML`, the `.vb-card` and `.vb-wall` overlay styles. `cardHTML()` writes a card's parts with the moment each one arrives as its animation delay |
| `playbook/tools/storyboard.js` | One frame per shot plus the contact sheet. Renders card shots as well as scene shots, and runs a card's reveal to its end so the frame is the finished card |
| `playbook/tools/record-video.js` | Per shot capture, frame by frame. Captures a clean frame of every scene for the wall, resolves each scene's, card's and caption's cues against the voice, and injects the blurred wall behind the end card |
| `playbook/tools/voice.py` | edge-tts to mp3, the trailing silence and the long pauses trimmed, the word offsets kept. Writes `dur.json` and `words.json` |
| `playbook/tools/mux.py` | Concat, lay the voice under the shots, write `out.mp4` |
| `playbook/sales/rate-card.md` | Prices and what is sold. The price list is duplicated in `reports/index.html` |

## Related Pages

- [[architecture]]
- [[features]]
