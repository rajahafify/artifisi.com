# artifisi.com (static rebuild)

Plain static site built with Astro. No database, no accounts, no forms.

## Run it

    cd site
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
2. Root directory `site`, build command `npm run build`, output directory `dist`.
3. Add the custom domains `www.artifisi.com` and `artifisi.com`, then point DNS at Pages.
4. Once it is live, the DigitalOcean droplet can be switched off.
