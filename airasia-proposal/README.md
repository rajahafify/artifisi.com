# airasia-proposal.artifisi.com

The pitch to airasia for a daily games channel inside the airasia MOVE app. It is the sibling of `ikhlas-proposal/`, with the Islamic framing taken out and travel games put in. One static folder, no build step.

```
airasia-proposal/
  index.html                13 slides at 1920x1080, scaled to the page width on screen
  game/guess-where.html     the Guess Where demo, playable on slide 6 and full screen
  assets/                   Guess Where screenshot used in print
  airasia-games-pitch.pdf   the same slides as a PDF, one slide per page
  robots.txt, favicon.svg
```

The page carries `noindex` and `robots.txt` blocks crawlers. It is meant to be shared by link, not found by search.

## Deploy (separate Cloudflare Pages project)

1. Cloudflare dashboard, Workers & Pages, Create, Pages, connect `rajahafify/artifisi.com` again as a project named `airasia-proposal`.
2. Production branch `main`. Build command `exit 0`. Build output directory `airasia-proposal`.
3. Settings, Builds, Build watch paths: include `airasia-proposal/*`. In the `artifisi-com` project, add `airasia-proposal/*` to its exclude list.
4. Custom domains, add `airasia-proposal.artifisi.com`.
5. In Cloudflare DNS add a CNAME: name `airasia-proposal`, target `airasia-proposal.pages.dev`, proxied.

## Editing

- Slides are plain HTML sections in `index.html`. Keep each slide inside its 1920x1080 frame.
- Printing the page gives one slide per page and swaps the live game for `assets/guess-where-puzzle.png`. To rebuild the PDF, print `index.html` with headless Chrome at a 1920x1080 page size with backgrounds on (Playwright `page.pdf({ width: '1920px', height: '1080px', printBackground: true })` after `emulateMedia({ media: 'print' })`).
- The game is a single file. Its three rounds (Bali, Siem Reap, Chiang Mai) and the city list are drafts. The city list is for the demo and is not the airasia route map.
- Wrong guesses show the great-circle distance, the compass direction from the guess to the answer, and whether the country matches.
- No prices, deal terms or cost figures go in this pitch. The deal is proposed in person. Dunia stays out.
