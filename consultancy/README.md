# consultancy.artifisi.com

One static page, no build step. It sells the report-to-page service and links the KRI sample as proof.

## Deploy (separate Cloudflare Pages project)

1. Cloudflare dashboard, Workers & Pages, Create, Pages, connect `rajahafify/artifisi.com` again as a second project named `consultancy`.
2. Production branch `main`. Build command `exit 0`. Build output directory `consultancy`.
3. Settings, Builds, Build watch paths: include `consultancy/*` so this project only rebuilds when this folder changes. In the `artifisi-com` project, add `consultancy/*` to its exclude list.
4. Custom domains, add `consultancy.artifisi.com`.
5. In DNSimple add a CNAME: name `consultancy`, content `consultancy.pages.dev`.

A separate project because Pages gives a custom domain the whole project, and because this page should never touch the main site's build.

## Editing

- Copy and prices live in `index.html`. The same prices live in `../playbook/sales/rate-card.md`. Change both together.
- `og.png` is the share image. Retake it if the headline changes: headless Chrome at 1200x630.
- Links to the sample point at `https://artifisi.com/samples/households` on purpose. A relative link would 404 on the subdomain.
