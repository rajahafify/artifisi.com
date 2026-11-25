# getsidekick.artifisi.com

Sidekick's landing page, built with Astro. One page:

- **The room** (`src/scripts/room.ts`): a Three.js scene of an event. The back half is the talk, the front half is the networking floor. As you scroll, your sidekick (the orange light) leaves your seat, scouts the floor, ranks three people and draws the match line back to you. Everything is driven by one scroll progress value, so scrolling back plays it backwards.
- **Try a card**: a working demo of the swipe card and the sidekicks' conversation, using the demo-event people from the app's dev seed.
- Privacy, questions, and a final call to action.

`src/scripts/main.ts` wires up smooth scroll (Lenis), the pinned story (GSAP ScrollTrigger), reveals and the demo card.

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
