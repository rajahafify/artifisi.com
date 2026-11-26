# getsidekick.artifisi.com

Sidekick's landing page, built with Astro. One page:

- **The room** (`src/scripts/room.ts`): a small 3D model of an event, the talk at the back and the floor in front. The scroll story opens with the problem (you're stuck in the talk; question marks over the people on the floor), then four actions in place that fix it, with the camera holding still: you check in (a ripple, and your green Buddy appears beside you); everyone else checks in (a grey Buddy pops up beside each); the sidekicks talk (a green Buddy appears beside each grey one it talks to, with two-way chat bubbles running at once, and grey pairs chat too); and match or pass, played on the app's swipe deck (Mei passed, Aisha waiting, Daniel a match with confetti). Green is always yours, grey everyone else's. Buddy is built in `buddy3d.ts` from the logo's proportions.
- **Try a card**: a working demo of the swipe card and the sidekicks' conversation, using the demo-event people from the app's dev seed.
- **Privacy**: the same app screens on two phones, for pass, connect and both connect.
- **For organisers**: the app's "Bring the room in" sheet beside the three steps to fill a room; the button opens the app's add-event screen (`/new`).
- Questions, and a closing call to action with a QR code on desktops.

`src/scripts/main.ts` wires up smooth scroll (Lenis), the story, reveals and the demo card. Everything runs on GSAP's ticker, one loop for Lenis, ScrollTrigger and the 3D room. The story copy is a GSAP timeline with a label per step, scrubbed by ScrollTrigger; section headings reveal line by line with SplitText masks; motion is set up inside `gsap.matchMedia()` so it reverts if reduced motion is switched on.

## Render quality

- The room builds itself on first load: chairs, tables and people grow in from the stage forward, then the sidekick and your pin arrive. There is no blocking preloader; the headline is readable from the first frame.
- **High tier** (desktops): real-time soft shadows, pixel ratio up to 2.
- **Low tier** (phones, 4 or fewer CPU cores, or 4 GB or less memory): soft contact shadows under each person and table, pixel ratio up to 1.25 (1.5 on phones).
- A high-tier room measures 90 frames after its intro and drops itself to the low tier if they average under 40fps.

## Fonts

Inter and Instrument Serif, the app's own pair, self-hosted through `@fontsource` (no request to Google). Each file carries unicode-range subsets, so browsers fetch only what a page uses.

## Loading

The first script is about 71 KB gzipped (GSAP, Lenis, the page logic). The 3D room and Three.js (about 142 KB) load as a separate chunk once the headline has painted; the story scrolls fine before it arrives and the room picks up wherever the reader is.

## Sharing and search

- `public/og.jpg` is the share image (1200x630), a capture of the real hero. Re-capture it if the hero changes.
- The home page carries Open Graph and Twitter tags and a schema.org `SoftwareApplication` block, limited to facts stated on the page.
- `src/pages/404.astro` is the not-found page (Cloudflare Pages serves `404.html` automatically). It uses `layouts/Shell.astro`, which has no page script; the landing page uses `layouts/Base.astro`, which adds it.
- The closing section shows a QR code to `sidekick.artifisi.com` on desktops (drawn at build time with `qrcode`), hidden on phones and touch screens.

## Checks

The last pass ran axe-core (WCAG 2.2 AA plus best practices) at desktop, phone and reduced-motion with no violations, and every visible control is at least 24px.

## Accessibility and fallbacks

- With reduced motion, the story is a normal hero, then one still frame of the room in a frame of its own (the sidekicks talking), then the steps as a list. The frame never sits behind text, and without WebGL it is left out. No pinning, no smooth scroll.
- In the scroll story, each step's copy sits on a soft patch of paper, so the room never runs through the text.
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

The sidekick is described as what it is: an AI that ranks and writes from profiles. The section "What your sidekick does, and doesn't" lists its limits (it never messages anyone, swipes for you, shares contacts before a match, or reveals swipes) and notes that pilot models are free hosted ones that may keep what they're sent. Chat bubbles in the story speak about their person ("Mine needs engineering help."), never as them.
