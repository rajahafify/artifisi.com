// Page behaviour: smooth scroll, the scroll-driven story, reveals, the header, and the demo card.
// `html.js` is set before paint; `html.motion` too, unless reduced motion is requested or WebGL is missing.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import Lenis from "lenis";
import { PHASES } from "./phases";
import type { Room, Tier } from "./room";

gsap.registerPlugin(ScrollTrigger, SplitText, Draggable);

const root = document.documentElement;
const q = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
const qa = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

const small = matchMedia("(max-width: 720px)").matches;
// Phones and small machines start on the light render tier (no real-time shadows, lower pixel
// ratio). The room also drops to it by itself if it can't hold its frame rate.
const device = navigator as Navigator & { deviceMemory?: number };
const tier: Tier = small || (navigator.hardwareConcurrency ?? 8) <= 4 || (device.deviceMemory ?? 8) <= 4 ? "low" : "high";
const story = q("[data-story]")!;
const canvas = q<HTMLCanvasElement>("[data-room]")!;
const motion = root.classList.contains("motion");

// The 3D room (and Three.js with it) loads in its own chunk once the headline has painted, so
// the first view never waits for it. Until it arrives the story still scrolls; the room picks up
// at whatever point the reader has reached.
let room: Room | null = null;
let storyProgress = 0;
let storyVisible = true;
async function loadRoom() {
  const { createRoom } = await import("./room");
  room = createRoom(
    canvas,
    {
      you: q("[data-label-you]"),
      sidekick: q("[data-label-sidekick]"),
      // One pair of bubbles per conversation; phones run three, desktops six plus two grey pairs.
      pairs: qa("[data-pair-mine]")
        .map((mine, k) => ({ mine, theirs: qa("[data-pair-theirs]")[k] }))
        .slice(0, small ? 3 : 5),
      others: small ? [] : qa("[data-bubble-other]"),
      thought: q("[data-thought]"),
      questions: qa("[data-question]").slice(0, small ? 5 : 8),
    },
    { small, tier },
  );
  if (!room) return; // WebGL failed after all: the story still reads, over the paper background
  if (!motion) {
    room.renderAt(0); // reduced motion: one still frame behind the hero
    return;
  }
  room.setProgress(storyProgress, true);
  room.setActive(storyVisible);
  gsap.ticker.add((time) => room!.tick(time));
  gsap.fromTo(canvas, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "power2.out" });
}
const idle = (fn: () => void) =>
  "requestIdleCallback" in window ? requestIdleCallback(fn, { timeout: 600 }) : setTimeout(fn, 200);
// If the 3D chunk fails to load (offline, a flaky network), the story still works without it.
requestAnimationFrame(() => idle(() => void loadRoom().catch(() => {})));

// ---- Header ---------------------------------------------------------------------------
const nav = q("[data-nav]")!;
let lastY = 0;
function onScroll(y: number) {
  nav.classList.toggle("is-solid", y > 40);
  // Hide on the way down past the story, show on the way back up.
  const pastStory = y > story.offsetTop + story.offsetHeight - innerHeight;
  nav.classList.toggle("is-hidden", pastStory && y > lastY + 2 && y > 200);
  if (y < lastY - 2) nav.classList.remove("is-hidden");
  lastY = y;
}
for (const s of qa(".dark")) {
  ScrollTrigger.create({
    trigger: s,
    start: "top 40px",
    end: "bottom 40px",
    onToggle: (self) => nav.classList.toggle("on-dark", self.isActive),
  });
}

// ---- Smooth scroll --------------------------------------------------------------------
let lenis: Lenis | null = null;
if (motion) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
  lenis.on("scroll", (e: Lenis) => {
    ScrollTrigger.update();
    onScroll(e.scroll);
  });
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
} else {
  addEventListener("scroll", () => onScroll(scrollY), { passive: true });
}
onScroll(scrollY);

// Set by the story once it's built: jump to a step (0 is the hero) and play it.
let jumpToStep: (step: number) => void = () => {};


// ---- The story ------------------------------------------------------------------------
const steps = [PHASES.problem, PHASES.checkin, PHASES.arrive, PHASES.talk, PHASES.outcome];
const storyRange = () => story.offsetHeight - innerHeight;
// Where to land for a step: a little past its start, so its copy is fully in.
const stepY = (i: number) => story.offsetTop + storyRange() * (steps[i][0] + (steps[i][1] - steps[i][0]) * 0.45);

if (motion) {
  const hero = q("[data-hero]")!;
  const chapters = qa("[data-chapter]");
  const rail = q("[data-rail]")!;
  const railButtons = qa<HTMLButtonElement>("button", rail);
  const legend = q(".legend")!;

  // The copy is one timeline, one unit long, with a label per step. ScrollTrigger scrubs it,
  // so the hero and chapters ease in and out with the scroll instead of being set by hand.
  const copy = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.05 } });
  // Opacity only, not visibility: faded copy stays in the accessibility tree (the H1 included),
  // and anything that takes keyboard focus scrolls its step into view (below).
  copy.to(hero, { opacity: 0, y: -60, duration: 0.085 }, 0.015);
  chapters.forEach((el, i) => {
    const [a, b] = steps[i];
    copy.addLabel(`step${i + 1}`, a);
    copy.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, a);
    // Each step's copy stays fully in until the very end of its range, where the step rests.
    if (i < chapters.length - 1) copy.to(el, { opacity: 0, y: -30, ease: "power2.in", duration: 0.015 }, b - 0.015);
  });
  // Step 4, played by the scroll on the app's own swipe deck: Mei is passed, Aisha gets a connect
  // that waits, and Daniel is a match. Scrolling back up plays it backwards.
  const swipe = q("[data-swipe]");
  if (swipe) {
    const [oA] = PHASES.outcome;
    const card = (id: string) => q(`[data-swipe-card="${id}"]`, swipe)!;
    const mei = card("mei");
    const aisha = card("aisha");
    const daniel = card("daniel");
    const stampOf = (c: HTMLElement, kind: string) => q(`.poster-stamp-${kind}`, c)!;
    const passBtn = q("[data-swipe-pass]", swipe)!;
    const connectBtn = q("[data-swipe-connect]", swipe)!;
    gsap.set(aisha, { y: 14, scale: 0.95 });
    gsap.set(daniel, { y: 28, scale: 0.9 });
    gsap.set(qa(".poster-stamp", swipe), { scale: 0.6 });
    const press = (btn: HTMLElement, at: number) =>
      copy.to(btn, { scale: 0.86, duration: 0.006, ease: "power1.out" }, at).to(btn, { scale: 1, duration: 0.012, ease: "back.out(3)" }, at + 0.006);
    const swipeOut = (c: HTMLElement, dir: number, at: number, rise: HTMLElement[]) => {
      copy
        .to(c, { x: dir * 34, rotation: dir * 6, duration: 0.012, ease: "power1.out" }, at)
        .to(stampOf(c, dir > 0 ? "connect" : "pass"), { opacity: 1, scale: 1.08, duration: 0.01, ease: "back.out(3)" }, at + 0.004)
        .to(c, { x: dir * 560, y: 60, rotation: dir * 26, opacity: 0, duration: 0.022, ease: "power2.in" }, at + 0.017);
      rise.forEach((r, i) => copy.to(r, { y: i * 14, scale: 1 - i * 0.05, duration: 0.016, ease: "back.out(2)" }, at + 0.03));
    };
    copy.fromTo(swipe, { opacity: 0, y: 40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.02, ease: "back.out(1.6)" }, oA);
    press(passBtn, oA + 0.022);
    swipeOut(mei, -1, oA + 0.022, [aisha, daniel]);
    copy.fromTo("[data-swipe-toast-pass]", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.008 }, oA + 0.045).to("[data-swipe-toast-pass]", { opacity: 0, duration: 0.008 }, oA + 0.065);
    press(connectBtn, oA + 0.07);
    swipeOut(aisha, 1, oA + 0.07, [daniel]);
    copy.fromTo("[data-swipe-toast]", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.008 }, oA + 0.093).to("[data-swipe-toast]", { opacity: 0, duration: 0.008 }, oA + 0.113);
    press(connectBtn, oA + 0.118);
    swipeOut(daniel, 1, oA + 0.118, []);
    // The match: the panel pops, the two Buddies (green, yours; grey, Daniel's) come together,
    // and confetti in the brand colours bursts out from between them.
    const match = q("[data-swipe-match]", swipe)!;
    copy.fromTo(match, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.024, ease: "back.out(1.8)" }, oA + 0.142);
    copy.fromTo(q(".sf-mine", swipe), { x: -80, rotation: -20 }, { x: 0, rotation: 0, duration: 0.022, ease: "back.out(2.2)" }, oA + 0.148);
    copy.fromTo(q(".sf-theirs", swipe), { x: 80, rotation: 20 }, { x: 0, rotation: 0, duration: 0.022, ease: "back.out(2.2)" }, oA + 0.148);
    const burst = q("[data-swipe-burst]", swipe)!;
    const colours = ["#ff5a36", "#1f7a52", "#ede4d3", "#ffb59f", "#b8bdb4"];
    const bits = Array.from({ length: 26 }, (_, i) => {
      const b = document.createElement("i");
      b.style.background = colours[i % colours.length];
      if (i % 3 === 0) b.style.borderRadius = "50%";
      burst.append(b);
      return b;
    });
    copy.fromTo(
      bits,
      { x: 0, y: 0, scale: 0, rotation: 0, opacity: 1 },
      {
        x: () => gsap.utils.random(-170, 170),
        y: () => gsap.utils.random(-150, 90),
        rotation: () => gsap.utils.random(-240, 240),
        scale: () => gsap.utils.random(0.7, 1.3),
        duration: 0.03,
        ease: "power3.out",
        stagger: { each: 0.0005, from: "random" },
      },
      oA + 0.152,
    );
    copy.fromTo(qa(".swipe-kicker, .swipe-title, .swipe-sub", swipe), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.014, stagger: 0.004 }, oA + 0.16);
    copy.to(q(".swipe-actions", swipe), { opacity: 0, y: 10, duration: 0.012 }, oA + 0.145);
  }
  copy.set({}, {}, 1); // pad to exactly one unit so progress maps onto PHASES

  const setUi = (p: number) => {
    storyProgress = p;
    room?.setProgress(p, true);
    let current = -1;
    steps.forEach(([a, b], i) => {
      if (p >= a) current = i;
      railButtons[i].style.setProperty("--fill", clamp((p - a) / (b - a)).toFixed(3));
    });
    railButtons.forEach((b, i) => b.classList.toggle("is-active", i === current));
    // The faded hero must not catch clicks meant for the story.
    hero.style.pointerEvents = p > 0.05 ? "none" : "";
    const showUi = p > 0.09;
    rail.classList.toggle("is-on", showUi);
    legend.classList.toggle("is-on", showUi && p < 0.97);
  };

  // Steps, not a scrub. The scroll only decides which step you're on; crossing into a step
  // plays it to the end on its own clock, whether or not the scroll keeps moving. Each step rests
  // just before the end of its range, where everything in it has fully played. Scrolling back
  // past a boundary plays back to the step before, a little faster.
  const rest = [0, ...steps.map(([, b], i) => (i === steps.length - 1 ? 1 : b - 0.025))];
  const stepFor = (p: number) => steps.reduce((s, [a], i) => (p >= a ? i + 1 : s), 0);
  copy.pause();
  const player = { p: 0 };
  let currentStep = -1;
  let playing: gsap.core.Tween | null = null;
  const render = () => {
    copy.progress(player.p);
    setUi(player.p);
  };
  /** Play to a step; returns how long that takes, in seconds. */
  const goTo = (step: number, instant = false): number => {
    if (step === currentStep && !instant) return playing?.isActive() ? playing.duration() - playing.time() : 0;
    currentStep = step;
    const to = rest[step];
    playing?.kill();
    const distance = Math.abs(to - player.p);
    if (instant || distance < 0.001) {
      player.p = to;
      render();
      return 0;
    }
    const forward = to > player.p;
    const duration = clamp(distance * (forward ? 11 : 5), 0.6, 3.2);
    playing = gsap.to(player, { p: to, duration, ease: forward ? "power1.inOut" : "power2.out", onUpdate: render });
    return duration;
  };
  // The hybrid: one scroll gesture moves one step, and the page holds still while that step plays.
  // A small nudge (a few pixels of scroll) past the step you're resting on starts the next one at
  // once; the page settles on that step's place and ignores the wheel, touch and keys until the
  // step has finished. Up works the same way. After the last step, scrolling is normal again.
  const NUDGE = 24;
  const anchorY = (i: number) => (i === 0 ? story.offsetTop : stepY(i - 1));
  let resting = 0;
  let held = false;
  let release: gsap.core.Tween | null = null;
  // A trackpad flick keeps sending wheel events for a second or so. Let go only once input has
  // been quiet for a moment, so one gesture never runs through several steps.
  let lastInput = 0;
  const noteInput = () => (lastInput = performance.now());
  for (const type of ["wheel", "touchmove"]) addEventListener(type, noteInput, { passive: true, capture: true });
  // Lenis already blocks wheel and touch while a step holds the page; scroll keys need blocking
  // here (outside text fields), so the keyboard can't slip past a step either.
  const scrollKeys = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"]);
  addEventListener(
    "keydown",
    (e) => {
      noteInput();
      const typing = (e.target as HTMLElement)?.closest?.("input, textarea, [contenteditable]");
      if (held && scrollKeys.has(e.key) && !typing) e.preventDefault();
    },
    { capture: true },
  );
  const letGo = () => {
    if (performance.now() - lastInput < 220) {
      release = gsap.delayedCall(0.1, letGo);
      return;
    }
    held = false;
    lenis?.start();
  };
  const moveTo = (i: number) => {
    resting = clamp(i, 0, steps.length);
    const plays = goTo(resting);
    release?.kill();
    held = true;
    lenis?.stop();
    lenis?.scrollTo(anchorY(resting), { force: true, duration: 0.8, easing: (t) => 1 - Math.pow(1 - t, 3) });
    release = gsap.delayedCall(Math.max(plays, 0.8) + 0.05, letGo);
  };
  lenis?.on("scroll", (e: Lenis) => {
    if (held) return;
    const y = e.scroll;
    const top = story.offsetTop;
    if (y < top - 1 || y > top + storyRange() + 1) return; // outside the story: plain scrolling
    if (e.direction > 0 && resting < steps.length && y > anchorY(resting) + NUDGE) moveTo(resting + 1);
    else if (e.direction < 0 && resting > 0 && y < anchorY(resting) - NUDGE) moveTo(resting - 1);
  });
  ScrollTrigger.create({
    trigger: story,
    start: "top top",
    end: "bottom bottom",
    // Coming back up from the page below lands on the last step.
    onEnterBack: () => {
      if (!held) moveTo(steps.length);
    },
    onRefresh: (self) => {
      resting = stepFor(self.progress);
      goTo(resting, true);
    },
  });
  // Only draw the scene while any of it is on screen.
  ScrollTrigger.create({
    trigger: story,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => {
      storyVisible = self.isActive;
      room?.setActive(self.isActive);
    },
  });
  setUi(0);
  // One loop for the whole page: Lenis, ScrollTrigger and (once loaded) the room all run on
  // GSAP's ticker.

  railButtons.forEach((b, i) => b.addEventListener("click", () => moveTo(i + 1)));

  // Keyboard users can reach the hero links and the last step's link while they're faded out;
  // bring the right part of the story back into view when they do.
  hero.addEventListener("focusin", () => {
    if (resting !== 0) moveTo(0);
  });
  chapters.forEach((el, i) =>
    el.addEventListener("focusin", () => {
      if (resting !== i + 1) moveTo(i + 1);
    }),
  );
  jumpToStep = moveTo;

  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      room?.setPointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    },
    { passive: true },
  );

  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // The hero comes in line by line, then the room builds itself behind it.
    const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
    intro
      .from("h1 .line > span", { yPercent: 110, duration: 1.4, stagger: 0.1 }, 0.15)
      .from(".hero-foot > *", { autoAlpha: 0, y: 20, duration: 1.2, stagger: 0.1 }, 0.55)
      .from(".scroll-cue", { autoAlpha: 0, duration: 1 }, 1.1);

    // Section headings reveal line by line from behind a mask. SplitText re-splits on resize,
    // and keeps the heading readable to screen readers.
    for (const el of qa("h2[data-reveal]")) {
      SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 105,
            duration: 1.2,
            ease: "expo.out",
            stagger: 0.09,
            scrollTrigger: { trigger: el, start: "top 86%", once: true },
          }),
      });
    }
    gsap.from("[data-reveal]:not(h2)", {
      autoAlpha: 0,
      y: 40,
      duration: 1.2,
      ease: "expo.out",
      scrollTrigger: { trigger: "[data-reveal]:not(h2)", start: "top 85%", once: true },
    });
  });
}

// In-page links: story steps land on their step; everything else scrolls smoothly.
for (const a of qa<HTMLAnchorElement>('a[href^="#"]')) {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href")!.slice(1);
    if (!id) return;
    const step = /^story-(\d)$/.exec(id);
    const target = document.getElementById(id);
    if (!target) return;
    if (step && motion) {
      e.preventDefault();
      jumpToStep(Number(step[1]));
    } else if (lenis) {
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    }
  });
}

// ---- Try a card: the app's event screen, working ---------------------------------------
// Mirrors the deck in the app (screens/event.dart): the top card follows your finger and tilts,
// the next one rises behind it, CONNECT or PASS shows past a small drag, and past a quarter of
// the width it goes. Daniel connects back in this demo, so connecting to him shows the match moment.
const stack = q("[data-deck]");
if (stack) {
  const cards = qa("[data-pcard]", stack);
  const status = q("[data-deck-status]")!;
  const segYou = q("[data-seg-you]")!;
  const segMatches = q("[data-seg-matches]")!;
  const brief = q("[data-brief]")!;
  const empty = q("[data-empty]", stack)!;
  const emptyText = q("[data-empty-text]", stack)!;
  const actions = qa<HTMLButtonElement>("[data-act]");
  const talkOpen = q<HTMLButtonElement>("[data-talk-open]")!;
  const scrim = q("[data-sheet-scrim]")!;
  const sheet = q("[data-sheet]")!;
  const moment = q("[data-moment]")!;
  const fast = !motion;
  const strongIds = new Set(cards.filter((c) => q(".poster-chip.is-strong", c)).map((c) => c.dataset.pcard));
  let index = 0;
  let matches = 0;
  let waiting = 0;
  let busy = false;
  // True while the deck is playing itself (see "Swipes for you" below). It never moves focus.
  let autoplaying = false;
  const focusDeck = () => {
    if (!autoplaying) stack.focus({ preventScroll: true });
  };

  const width = () => stack.clientWidth || 340;
  const stampsAt = (card: HTMLElement, t: number) => {
    const o = clamp((Math.abs(t) - 0.12) / 0.5);
    q(".poster-stamp-connect", card)!.style.opacity = t > 0 ? String(o) : "0";
    q(".poster-stamp-pass", card)!.style.opacity = t < 0 ? String(o) : "0";
  };
  // The card behind rises as the top one moves away (event.dart: 12px down, 94%, 55% opacity).
  const behind = (t: number) => {
    const next = cards[index + 1];
    if (!next) return;
    const a = Math.abs(t);
    gsap.set(next, { y: 12 - 12 * a, scale: 0.94 + 0.06 * a, opacity: 0.55 + 0.45 * a });
  };

  // Words in the app, recomputed as the deck changes (roomBriefing in logic/sidekick.dart).
  const refresh = () => {
    const left = cards.slice(index);
    const strong = left.filter((c) => strongIds.has(c.dataset.pcard)).length;
    segYou.textContent = left.length ? `For you · ${left.length}` : "For you";
    segMatches.textContent = matches ? `Matches · ${matches}` : "Matches";
    const people = left.length === 1 ? "1 person" : `${left.length} people`;
    const tail = strong === 0 ? "Best fit first." : strong === 1 ? "1 strong fit, shown first." : `${strong} strong fits, shown first.`;
    brief.textContent = left.length ? `Read ${people} for you. ${tail}` : "Nobody new to scout yet.";
    actions.forEach((b) => (b.disabled = !left.length));
    talkOpen.disabled = !left.length;
    empty.hidden = left.length > 0;
    if (!left.length) {
      emptyText.textContent = waiting
        ? `You asked to connect with ${waiting} ${waiting === 1 ? "person" : "people"}. If they connect back, it’s a match. New people show up here as they check in.`
        : "New people show up here as they check in.";
    }
  };

  const layout = () => {
    cards.forEach((card, i) => {
      const depth = i - index;
      card.inert = depth !== 0;
      if (depth < 0) return;
      gsap.set(card, {
        x: 0,
        rotation: 0,
        y: depth === 0 ? 0 : 12,
        scale: depth === 0 ? 1 : 0.94,
        opacity: depth === 0 ? 1 : depth === 1 ? 0.55 : 0,
        visibility: depth > 1 ? "hidden" : "visible",
        zIndex: 10 - depth,
      });
      stampsAt(card, 0);
    });
    refresh();
  };

  const showMoment = () => {
    moment.hidden = false;
    if (!fast) {
      gsap.fromTo(moment, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.26 });
      gsap.fromTo(q(".moment-glow", moment), { opacity: 0 }, { opacity: 1, duration: 0.66 });
      gsap.fromTo(q(".moment-me", moment), { x: -55 }, { x: 0, duration: 0.66, delay: 0.11, ease: "back.out(1.7)" });
      gsap.fromTo(q(".moment-them", moment), { x: 55 }, { x: 0, duration: 0.66, delay: 0.11, ease: "back.out(1.7)" });
      gsap.fromTo(qa(".moment-kicker, .moment-title, .moment-sub, .moment-actions", moment), { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.5 });
    }
    if (!autoplaying) q<HTMLButtonElement>("[data-moment-go]", moment)!.focus({ preventScroll: true });
  };
  const hideMoment = (text?: string) => {
    moment.hidden = true;
    if (text) status.innerHTML = text;
    focusDeck();
  };
  q("[data-moment-go]", moment)!.addEventListener("click", () =>
    hideMoment("In the app, <b>this opens your chat with Daniel</b>, with his contact details and the opener."),
  );
  q("[data-moment-later]", moment)!.addEventListener("click", () => hideMoment());

  const decide = (like: boolean) => {
    const card = cards[index];
    if (!card || busy || !sheet.hidden || !moment.hidden) return;
    busy = true;
    const name = card.dataset.first!;
    const match = like && card.dataset.match === "true";
    stampsAt(card, like ? 1 : -1);
    behind(1);
    gsap.to(card, {
      x: (like ? 1.3 : -1.3) * width() * 1.2,
      y: width() * 0.08,
      rotation: like ? 7 : -7,
      duration: fast ? 0 : 0.26,
      ease: "power2.in",
      onComplete: () => {
        index++;
        if (match) matches++;
        else if (like) waiting++;
        layout();
        const top = cards[index];
        if (top && !fast) gsap.from(top, { opacity: 0.6, duration: 0.26 });
        busy = false;
        if (match) showMoment();
        else focusDeck();
      },
    });
    status.innerHTML = !like
      ? `Passed. <b>That stays on Hana’s phone.</b> ${name} isn’t told.`
      : match
        ? `In this demo ${name} connects too, so <b>it’s a match.</b>`
        : `Connected. It becomes a match only if ${name} connects too, and <b>${name} isn’t told unless she does.</b>`;
  };

  cards.forEach((card) => {
    Draggable.create(card, {
      type: "x",
      allowNativeTouchScrolling: true,
      zIndexBoost: false,
      onDrag() {
        const t = clamp(this.x / (width() * 0.32), -1, 1);
        gsap.set(card, { rotation: t * 6, y: Math.abs(this.x) * 0.06 });
        stampsAt(card, t);
        behind(t);
      },
      onRelease() {
        if (this.x > width() * 0.26) decide(true);
        else if (this.x < -width() * 0.26) decide(false);
        else {
          gsap.to(card, { x: 0, y: 0, rotation: 0, duration: fast ? 0 : 0.22, ease: "back.out(2)" });
          stampsAt(card, 0);
          behind(0);
        }
      },
    });
  });

  actions.forEach((b) => b.addEventListener("click", () => decide(b.dataset.act === "connect")));
  stack.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") decide(true);
    else if (e.key === "ArrowLeft") decide(false);
    else return;
    e.preventDefault();
  });

  // "How would the sidekicks talk?" opens the bottom sheet for the person on top, as in the app.
  const openSheet = () => {
    const card = cards[index];
    if (!card) return;
    qa("[data-sheet-for]", sheet).forEach((b) => (b.hidden = b.dataset.sheetFor !== card.dataset.pcard));
    scrim.hidden = sheet.hidden = false;
    sheet.scrollTop = 0;
    if (!fast) {
      gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(sheet, { yPercent: 100 }, { yPercent: 0, duration: 0.42, ease: "expo.out" });
      gsap.from(qa(`[data-sheet-for="${card.dataset.pcard}"] .app-bubble`, sheet), { y: 10, opacity: 0, duration: 0.4, stagger: 0.35, delay: 0.3 });
    }
    q<HTMLButtonElement>("[data-sheet-close]", sheet)!.focus({ preventScroll: true });
  };
  const closeSheet = () => {
    if (sheet.hidden) return;
    const done = () => {
      scrim.hidden = sheet.hidden = true;
      talkOpen.focus({ preventScroll: true });
    };
    if (fast) return done();
    gsap.to(scrim, { opacity: 0, duration: 0.2 });
    gsap.to(sheet, { yPercent: 100, duration: 0.25, ease: "power2.in", onComplete: done });
  };
  talkOpen.addEventListener("click", openSheet);
  scrim.addEventListener("click", closeSheet);
  q("[data-sheet-close]", sheet)!.addEventListener("click", closeSheet);
  sheet.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSheet();
  });

  q("[data-reset]")!.addEventListener("click", () => {
    index = matches = waiting = 0;
    busy = false;
    moment.hidden = scrim.hidden = sheet.hidden = true;
    status.textContent = "";
    layout();
    focusDeck();
  });

  // Swipes for you. Reaching this section is a breakpoint: if you haven't touched the deck a
  // couple of seconds later, it plays itself (a nudge as a hint, Daniel to a match, then Aisha
  // passed and Mei connected). Touching the deck, a button or a key hands it straight back to
  // you, for good; scrolling away pauses it. Off with reduced motion.
  let handedOver = false;
  let pending: gsap.core.Tween[] = [];
  const stopAuto = () => {
    pending.forEach((t) => t.kill());
    pending = [];
    autoplaying = false;
  };
  const takeOver = () => {
    if (autoplaying && status.dataset.auto) status.textContent = "";
    delete status.dataset.auto;
    handedOver = true;
    stopAuto();
  };
  const device = stack.closest(".device")!;
  device.addEventListener("pointerdown", takeOver, { capture: true });
  device.addEventListener("keydown", takeOver, { capture: true });
  actions.forEach((b) => b.addEventListener("pointerdown", takeOver));
  q("[data-reset]")!.addEventListener("pointerdown", takeOver);
  const after = (seconds: number, fn: () => void) => pending.push(gsap.delayedCall(seconds, fn));
  const nudge = (card: HTMLElement) => {
    const t = gsap.timeline();
    t.to(card, { x: 46, rotation: 4, duration: 0.35, ease: "power2.out", onUpdate: () => stampsAt(card, 0.4) })
      .to(card, { x: 0, rotation: 0, duration: 0.5, ease: "back.out(2)", onComplete: () => stampsAt(card, 0) });
  };
  const autoPlay = () => {
    if (handedOver || !motion || index >= cards.length || !sheet.hidden) return;
    autoplaying = true;
    status.dataset.auto = "1";
    status.innerHTML = "Not swiping? <b>Here’s how it goes.</b> Swipe any time to take over.";
    let at = 0;
    const step = (gap: number, fn: () => void) => after((at += gap), () => autoplaying && fn());
    if (cards[index]) step(0, () => nudge(cards[index]));
    // Whatever is on top, play the rest of the deck: Daniel connects (a match), Aisha is
    // passed, Mei gets a connect that waits.
    const plan: Record<string, boolean> = { daniel: true, aisha: false, mei: true };
    cards.slice(index).forEach((card) => {
      step(1.3, () => decide(plan[card.dataset.pcard!] ?? true));
      if (card.dataset.match === "true") step(3.4, () => hideMoment());
    });
    step(1.2, () => {
      autoplaying = false;
      delete status.dataset.auto;
    });
  };
  ScrollTrigger.create({
    trigger: device,
    start: "top 85%",
    end: "bottom 30%",
    onEnter: () => after(1.2, autoPlay),
    onEnterBack: () => after(1.2, autoPlay),
    onLeave: stopAuto,
    onLeaveBack: stopAuto,
  });

  layout();
}

// On a short frame the demo screen scrolls; start it scrolled down so the buttons show.
const demoScroll = q("[data-app] .app-scroll");
if (demoScroll) {
  const fit = () => (demoScroll.scrollTop = demoScroll.scrollHeight);
  fit();
  document.fonts?.ready.then(fit);
  addEventListener("resize", fit, { passive: true });
}

// ---- Privacy: what each side sees ------------------------------------------------------
const views = q("[data-views]");
if (views) {
  const tabs = qa<HTMLButtonElement>("[data-scenario]");
  const note = q("[data-scenario-note]")!;
  const show = (id: string, focus = false) => {
    views.dataset.state = id;
    views.setAttribute("aria-labelledby", `sc-${id}`);
    tabs.forEach((t) => {
      const on = t.dataset.scenario === id;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) {
        note.textContent = t.dataset.note ?? "";
        if (focus) t.focus();
      }
    });
    // An element can belong to several states ("pass connect"); only fade in what newly appears.
    const all = qa("[data-when]", views);
    const appearing = all.filter((el) => el.hidden && el.dataset.when!.split(" ").includes(id));
    all.forEach((el) => (el.hidden = !el.dataset.when!.split(" ").includes(id)));
    if (motion) gsap.fromTo(appearing, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "expo.out" });
    play(id, motion);
  };

  // Hana's phone acts out the choice: Daniel's card goes left (pass) or right (connect), the next
  // card rises, and the screen settles where the app would leave it (Undo after a pass, two left).
  // When both connect, both phones show the match moment. Daniel's phone never changes before then.
  const top = q("[data-mini-top]", views)!;
  const next = q("[data-mini-next]", views)!;
  const undo = q("[data-mini-undo]", views)!;
  const count = q("[data-mini-count]", views)!;
  const matchTabs = qa("[data-mini-matches]", views);
  const moments = qa("[data-mini-moment]", views);
  let acting: gsap.core.Timeline | null = null;
  const settle = (id: string) => {
    const dir = id === "pass" ? -1 : 1;
    gsap.set(top, { x: dir * 460, y: 30, rotation: dir * 7, opacity: 0 });
    gsap.set(next, { y: 0, scale: 1, opacity: 1 });
    count.textContent = "For you · 2";
    undo.hidden = id !== "pass";
    const both = id === "both";
    matchTabs.forEach((m) => (m.textContent = both ? "Matches · 1" : "Matches"));
    moments.forEach((m) => {
      m.hidden = !both;
      gsap.set(m, { opacity: 1 });
    });
  };
  function play(id: string, animate: boolean) {
    acting?.kill();
    if (!animate) return settle(id);
    // Start from the deck before the choice, then act it out.
    const dir = id === "pass" ? -1 : 1;
    const stamp = q(dir < 0 ? ".poster-stamp-pass" : ".poster-stamp-connect", top)!;
    qa(".poster-stamp", top).forEach((el) => (el.style.opacity = "0"));
    gsap.set(top, { x: 0, y: 0, rotation: 0, opacity: 1 });
    gsap.set(next, { y: 12, scale: 0.94, opacity: 0.55 });
    count.textContent = "For you · 3";
    undo.hidden = true;
    matchTabs.forEach((m) => (m.textContent = "Matches"));
    moments.forEach((m) => (m.hidden = true));
    acting = gsap
      .timeline()
      .to(top, { x: dir * 40, rotation: dir * 3, duration: 0.35, ease: "power1.out" }, 0.2)
      .to(stamp, { opacity: 1, duration: 0.2 }, 0.3)
      .to(top, { x: dir * 460, y: 30, rotation: dir * 7, duration: 0.45, ease: "power2.in" }, 0.6)
      .to(next, { y: 0, scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" }, 0.85)
      .call(() => settle(id === "both" ? "connect" : id), [], 1.15);
    if (id === "both") {
      acting.call(() => settle("both"), [], 1.35).fromTo(moments, { opacity: 0 }, { opacity: 1, duration: 0.45 }, 1.35);
    }
  }
  // Rest on the first choice; act it out once when the phones come into view.
  settle("pass");
  if (motion) ScrollTrigger.create({ trigger: views, start: "top 65%", once: true, onEnter: () => play(views.dataset.state!, true) });
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => show(t.dataset.scenario!));
    t.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      show(tabs[(i + d + tabs.length) % tabs.length].dataset.scenario!, true);
    });
  });
}

// Web fonts change line breaks and heights; measure again once they and the page are in.
document.fonts?.ready.then(() => ScrollTrigger.refresh());
addEventListener("load", () => ScrollTrigger.refresh());
