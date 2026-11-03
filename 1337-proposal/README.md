# 1337-proposal.artifisi.com

The pitch to 1337 Ventures for a rebuilt website: 1337.ventures and leet.capital, moved off WordPress and PHP to pre-built pages, with an audit file for the SC's technology risk rules. It uses the same deck format as `airasia-proposal/` and `ikhlas-proposal/`, with the two working landing pages in place of a daily game. One static folder, no build step.

```
1337-proposal/
  index.html                14 slides at 1920x1080, scaled to the page width on screen
  demo/1337-landing.html    the 1337 Ventures landing page, live on slide 6 and full screen
  demo/leet-landing.html    the Leet Capital landing page, live on slide 9 and full screen
  assets/                   phone screenshots of both pages, used in print
  1337-website-pitch.pdf    the same slides as a PDF, one slide per page
  robots.txt, favicon.svg
```

The deck and both demo pages carry `noindex`, and `robots.txt` blocks crawlers. It is meant to be shared by link, not found by search.

## Deploy (separate Cloudflare Pages project)

1. Cloudflare dashboard, Workers & Pages, Create, Pages, connect `rajahafify/artifisi.com` again as a project named `1337-proposal`. If Cloudflare refuses a name that starts with a number, use `leet-proposal` and swap the name in the steps below.
2. Framework preset None. Production branch `main`. Build command `exit 0`. Root directory empty. Build output directory `1337-proposal`.
3. Settings, Builds, Build watch paths: include `1337-proposal/*`. In the `artifisi-com` project, add `1337-proposal/*` to its exclude list.
4. Custom domains, add `1337-proposal.artifisi.com`.
5. In Cloudflare DNS add a CNAME: name `1337-proposal`, target `1337-proposal.pages.dev`, proxied.

## Editing

- Slides are plain HTML sections in `index.html`. Keep each slide inside its 1920x1080 frame.
- Printing the page gives one slide per page and swaps the live pages for the screenshots in `assets/`. To rebuild the PDF, print `index.html` with headless Chrome at a 1920x1080 page size with backgrounds on (Playwright `page.pdf({ width: '1920px', height: '1080px', printBackground: true })` after `emulateMedia({ media: 'print' })`).
- The two demo pages are single-file builds of a Vite, React, TypeScript and GSAP project. The source is in the project files under `1337-website-proposal/source/` and `source-leet/`. Rebuild there and copy `dist/index.html` over the file in `demo/`.
- Drafts to confirm with 1337: the sample startup (Kopi Labs), alumni lines, stage routing rules, Leet campaigns and figures, and the limit and risk wording, which Leet Capital compliance signs off.
- 1337 was not hacked. Slide 2 is about the public PHP2Shell flaws of October 2026 and the exposure every WordPress site carried.
- No prices, deal terms or cost figures go in this pitch. The deal is proposed in person. Dunia stays out.
