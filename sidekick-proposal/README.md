# sidekick-pitch-deck.artifisi.com

The Sidekick pitch deck, built with Astro. Twelve slides at 1920x1080, scaled to the page width on screen and printed one per page. Text only, no build-time data.

```
sidekick-proposal/
  src/pages/index.astro     the slides, in order
  src/layouts/Deck.astro    the frame, the type and colours, the scaling script
  public/                   favicon.svg, robots.txt (blocks crawlers)
  astro.config.mjs          site URL
```

The page carries `noindex` and `robots.txt` blocks crawlers. It is meant to be shared by link, not found by search.

## Run and build

```bash
cd sidekick-proposal
npm ci
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
```

Node 22 (see `.node-version`).

## Deploy (separate Cloudflare Pages project)

1. Cloudflare dashboard, Workers & Pages, Create, Pages, connect `rajahafify/artifisi.com` as a project named `sidekick-pitch-deck`.
2. Production branch `main`. Root directory `sidekick-proposal`. Build command `npm ci && npm run build`. Build output directory `dist`.
3. Settings, Builds, Build watch paths: include `sidekick-proposal/*`. In the `artifisi-com` project, add `sidekick-proposal/*` to its exclude list.
4. Custom domains, add `sidekick-pitch-deck.artifisi.com`.
5. In Cloudflare DNS add a CNAME: name `sidekick-pitch-deck`, target `sidekick-pitch-deck.pages.dev`, proxied.

## Editing

- Each slide is a `<div class="frame"><section class="slide">` block in `index.astro`. Keep each slide inside its 1920x1080 frame. `npm run build` plus a look at the page is the check: a slide that is too tall overflows its frame.
- Colours come from the Sidekick app: Pine `#12402e`, Oat `#ede4d3`, Signal `#ff5a36`.
- The deck has no prices or deal terms. Those are discussed in person.
- Facts on the slides come from the Sidekick README and code. Check them against the code before a pitch goes out.
