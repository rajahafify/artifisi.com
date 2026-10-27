# ikhlas-proposal.artifisi.com

The pitch to ikhlas.com for a games channel inside their app. One static folder, no build step.

```
ikhlas-proposal/
  index.html                15 slides at 1920x1080, scaled to the page width on screen
  game/teka-surah.html      the Teka Surah demo, playable on slide 6 and full screen
  assets/                   Bazaar Basra mockup, Teka Surah screenshot used in print
  ikhlas-games-pitch.pdf    the same slides as a PDF, one slide per page
  robots.txt, favicon.svg
```

The page carries `noindex` and `robots.txt` blocks crawlers. It is meant to be shared by link, not found by search.

## Deploy (separate Cloudflare Pages project)

1. Cloudflare dashboard, Workers & Pages, Create, Pages, connect `rajahafify/artifisi.com` again as a project named `ikhlas-proposal`.
2. Production branch `main`. Build command `exit 0`. Build output directory `ikhlas-proposal`.
3. Settings, Builds, Build watch paths: include `ikhlas-proposal/*`. In the `artifisi-com` project, add `ikhlas-proposal/*` to its exclude list.
4. Custom domains, add `ikhlas-proposal.artifisi.com`.
5. In Cloudflare DNS add a CNAME: name `ikhlas-proposal`, target `ikhlas-proposal.pages.dev`, proxied.

## Editing

- Slides are plain HTML sections in `index.html`. Keep each slide inside its 1920x1080 frame.
- Printing the page gives one slide per page and swaps the live game for `assets/teka-puzzle.png`. To rebuild the PDF, print `index.html` with headless Chrome at a 1920x1080 page size with backgrounds on (Playwright `page.pdf({ width: '1920px', height: '1080px', printBackground: true })` after `emulateMedia({ media: 'print' })`).
- The game is a single file. Its hints and summaries are drafts until the ikhlas.com ustaz has checked them.
- No prices or deal terms go in this pitch. The deal is proposed in person.
