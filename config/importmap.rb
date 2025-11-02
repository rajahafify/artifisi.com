# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "tailwindcss-stimulus-components", to: "lib/tailwindcss-stimulus-components.js", preload: true
pin "tailwindcss-stimulus-components-source", to: "tailwindcss-stimulus-components.module.js", preload: true
pin "trix", to: "https://cdn.jsdelivr.net/npm/trix@2.0.4/dist/trix.esm.js"
pin "@rails/actiontext", to: "actiontext.esm.js"
