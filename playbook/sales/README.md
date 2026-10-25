# Sales kit

- `rate-card.md` the prices and what each package includes.
- `services-agreement.md` the contract. Have a Malaysian lawyer read it once.
- `../../public/consultancy/index.html` the public page at consultancy.artifisi.com.

Prices live in two places: this rate card and the landing page. Change both together.

## Subdomain

The page is plain HTML in `public/consultancy/`, so the Astro build copies it to `dist/consultancy/index.html`.

1. Cloudflare, Workers and Pages, pick the artifisi.com Pages project, Custom domains, add `consultancy.artifisi.com`.
2. Add a CNAME for `consultancy` pointing at the Pages project.
3. Add a URL Rewrite rule so the subdomain root serves the page without changing the address bar: when host equals `consultancy.artifisi.com` and path equals `/`, rewrite path to `/consultancy`.
4. Check that `/samples/households` and the fonts load over the subdomain. Both use absolute paths, so they should.

Without step 3 the subdomain shows the Artifisi home page, because every custom domain on a Pages project serves the same site.
