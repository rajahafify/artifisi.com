# artifisi.com (static rebuild)

Plain static site built with Astro. No database, no accounts, no forms.

## Run it

    npm install
    npm run dev      # http://localhost:4321
    npm run build    # writes dist/

Needs Node 22.12 or newer.

## Where things live

- `src/pages/` one file per page. `projects/dunia`, `projects/melaka-1511` and `projects/orbwalker` keep the old URLs.
- `src/data.js` email, WhatsApp, the Dunia video link and the game cards.
- `src/styles/site.css` all the styling. Same colours as the company card.
- `public/img/` images. `public/_redirects` sends old Rails URLs somewhere useful.

## Deploy on Cloudflare Pages

1. Cloudflare dashboard, Workers & Pages, Create, Pages, connect this repo.
2. Build command `npm run build`, output directory `dist`.
3. Add the custom domains `www.artifisi.com` and `artifisi.com`, then point DNS at Pages.
4. Once it is live, switch off the DigitalOcean droplet (206.189.32.232). The old Rails app is in git history before this change if you ever need it.

CI runs `npm ci && npm run build` on every pull request.

The `wiki/` and `raw/` folders are older notes. Most wiki pages describe the old Rails app.
