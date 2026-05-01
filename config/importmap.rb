# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "tailwindcss-stimulus-components", to: "lib/tailwindcss-stimulus-components.js", preload: true
pin "tailwindcss-stimulus-components-source", to: "tailwindcss-stimulus-components.module.js", preload: true
pin "lexxy", to: "lexxy.js"
pin "@rails/activestorage", to: "activestorage.esm.js" # to support attachments
pin "@studio-freight/lenis", to: "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js"
pin "gsap", to: "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"
pin "gsap/ScrollTrigger", to: "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"
