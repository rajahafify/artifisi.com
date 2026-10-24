# artifisi.com (static rebuild)

Static site built with Astro. No database and no accounts. The contact form posts to Formspree.

## Run it

    npm install
    npm run dev      # http://localhost:4321
    npm run build    # writes dist/

Needs Node 22.12 or newer.

## Where things live

- `src/pages/index.astro` the home page markup: three.js hero, company profile, Dunia, games, about, contact form.
- `src/scripts/home.js` everything that moves on the home page: the hero scene and its use-case views, the small section scenes, the contact form and the video player. three.js comes from npm.
- `src/styles/home.css` home page styling. `src/styles/site.css` styles the inner pages to match.
- `src/pages/projects/` and `privacy`, `404` the inner pages. `projects/dunia`, `projects/melaka-1511` and `projects/orbwalker` keep the old URLs.
- `src/data.js` email, Formspree endpoint and Dunia video link for the inner pages.
- `public/img/` images. `public/_redirects` sends old Rails URLs somewhere useful.

## Deploy on Cloudflare Pages

1. Cloudflare dashboard, Workers & Pages, Create, Pages, connect this repo.
2. Build command `npm run build`, output directory `dist`.
3. Add the custom domains `www.artifisi.com` and `artifisi.com`, then point DNS at Pages.
4. Once it is live, switch off the DigitalOcean droplet (206.189.32.232). The old Rails app is in git history before this change if you ever need it.

CI runs `npm ci && npm run build` on every pull request.

The `wiki/` and `raw/` folders are older notes. Most wiki pages describe the old Rails app.
