# reports.artifisi.com

One static folder, no build step. It holds the reports we publish ourselves, the samples that prove the work, and the page that sells custom reports.

```
reports/
  index.html              front door, prices, Formspree contact form
  malaysia-wages/         our own report, DOSM wage survey
  samples/households/     unofficial KRI sample, kept as proof
  favicon.svg, og.png
```

## Deploy (separate Cloudflare Pages project)

1. Cloudflare dashboard, Workers & Pages, Create, Pages, connect `rajahafify/artifisi.com` again as a second project named `reports`.
2. Production branch `main`. Build command `exit 0`. Build output directory `reports`.
3. Settings, Builds, Build watch paths: include `reports/*` so this project only rebuilds when this folder changes. In the `artifisi-com` project, add `reports/*` to its exclude list.
4. Custom domains, add `reports.artifisi.com`.
5. In Cloudflare DNS add a CNAME: name `reports`, target `reports.pages.dev`, proxied.

A separate project because Pages gives a custom domain the whole project, and because this folder should never touch the main site's build.

## Editing

- Copy and prices live in `index.html`. The same prices live in `../playbook/sales/rate-card.md`. Change both together.
- The contact form posts to Formspree. Replace `YOUR_FORM_ID` in the `<form action>` with the id from formspree.io, then set `_next` to the live URL so the `#sent` banner shows after submit.
- `og.png` is the share image. Retake it if the headline changes: headless Chrome at 1200x630.
- Reports sit one level down and use absolute paths (`/malaysia-wages/`). Samples live at `samples/<slug>/`. The main site 301s `/samples/*` here.

## Adding a report

Copy `malaysia-wages/` to `<slug>/`, replace `data.json` and the six scene functions, then add a card to the `#reports` section of `index.html`. The build rules are in `../playbook/instructions.md`.
