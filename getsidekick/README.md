# getsidekick.artifisi.com

Sidekick's landing page, built with Astro. One page:

- **The room** (`src/scripts/room.ts`): a small 3D model of an event, on the light Sidekick palette. At the back, the talk: a stage with a slide, a speaker and rows of chairs, with a pin over your seat. In front, the floor: people around cocktail tables. As you scroll, your sidekick (the orange orb) leaves your seat, visits each group (leaving a dotted trail and a ring under everyone it has seen), ranks three people and draws the match line back to you. Everything is driven by one scroll progress value, so scrolling back plays it backwards.
- **Try a card**: a working demo of the swipe card and the sidekicks' conversation, using the demo-event people from the app's dev seed.
- Privacy, questions, and a final call to action.

`src/scripts/main.ts` wires up smooth scroll (Lenis), the story, reveals and the demo card. Everything runs on GSAP's ticker, one loop for Lenis, ScrollTrigger and the 3D room. The story copy is a GSAP timeline with a label per step, scrubbed by ScrollTrigger; section headings reveal line by line with SplitText masks; motion is set up inside `gsap.matchMedia()` so it reverts if reduced motion is switched on.

## Render quality

- The room builds itself on first load: chairs, tables and people grow in from the stage forward, then the sidekick and your pin arrive. There is no blocking preloader; the headline is readable from the first frame.
- **High tier** (desktops): real-time soft shadows, pixel ratio up to 2.
- **Low tier** (phones, 4 or fewer CPU cores, or 4 GB or less memory): soft contact shadows under each person and table, pixel ratio up to 1.25 (1.5 on phones).
- A high-tier room measures 90 frames after its intro and drops itself to the low tier if they average under 40fps.

## Accessibility and fallbacks

- With reduced motion, or without WebGL, the story is a normal hero plus a numbered list, with one still frame of the room. No pinning, no smooth scroll.
- Without JavaScript, the page is fully readable; only the demo buttons are hidden.
- The scene pauses when off screen or when the tab is hidden, and caps pixel ratio (1.5 on phones).

## Run and build

```bash
cd getsidekick
npm ci
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
```

## Deploy (separate Cloudflare Pages project)

1. Workers & Pages, Create, Pages, connect `rajahafify/artifisi.com` as `getsidekick`.
2. Production branch `main`. Root directory `getsidekick`. Build command `npm ci && npm run build`. Output `dist`.
3. Build watch paths: include `getsidekick/*`; add `getsidekick/*` to the other projects' exclude lists.
4. Custom domain `getsidekick.artifisi.com`, and a proxied CNAME `getsidekick` → `getsidekick.pages.dev`.

## Copy rules

Claims on the page come from the Sidekick README and backend code. Sidekick is in pilot and has not run at a live event; the page says so. No prices, user counts or testimonials until they are real.
