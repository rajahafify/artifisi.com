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
      picks: qa("[data-label-pick]"),
      bubbleMe: q("[data-bubble-me]"),
      // Phones show three replies at a time, desktops four.
      bubbles: qa("[data-bubble]").slice(0, small ? 3 : 4),
    },
    { small, tier },
  );
  if (!room) return; // WebGL failed after all: the story still reads, over the paper background
  if (!motion) {
    room.renderAt(0); // reduced motion: one still frame behind the hero
    return;
  }
  room.setProgress(storyProgress);
  room.setActive(storyVisible);
  gsap.ticker.add((time) => room!.tick(time));
  gsap.fromTo(canvas, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: "power2.out" });
}
const idle = (fn: () => void) =>
  "requestIdleCallback" in window ? requestIdleCallback(fn, { timeout: 600 }) : setTimeout(fn, 200);
requestAnimationFrame(() => idle(() => void loadRoom()));

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

function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 1.6 });
  else scrollTo({ top: y, behavior: "auto" });
}

// ---- The story ------------------------------------------------------------------------
const steps = [PHASES.checkin, PHASES.scout, PHASES.rank, PHASES.match];
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
    if (i < chapters.length - 1) copy.to(el, { opacity: 0, y: -30, ease: "power2.in" }, b - 0.05);
  });
  copy.set({}, {}, 1); // pad to exactly one unit so progress maps onto PHASES

  const setUi = (p: number) => {
    storyProgress = p;
    room?.setProgress(p);
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

  ScrollTrigger.create({
    trigger: story,
    start: "top top",
    end: "bottom bottom",
    animation: copy,
    scrub: 0.6,
    onUpdate: (self) => setUi(self.progress),
    onRefresh: (self) => setUi(self.progress),
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

  railButtons.forEach((b, i) => b.addEventListener("click", () => scrollToY(stepY(i))));

  // Keyboard users can reach the hero links and the last step's link while they're faded out;
  // bring the right part of the story back into view when they do.
  hero.addEventListener("focusin", () => {
    if (scrollY > story.offsetTop + 40) scrollToY(story.offsetTop);
  });
  chapters.forEach((el, i) =>
    el.addEventListener("focusin", () => {
      if (Math.abs(scrollY - stepY(i)) > innerHeight * 0.2) scrollToY(stepY(i));
    }),
  );

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
      scrollToY(stepY(Number(step[1]) - 1));
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
    q<HTMLButtonElement>("[data-moment-go]", moment)!.focus({ preventScroll: true });
  };
  const hideMoment = (text?: string) => {
    moment.hidden = true;
    if (text) status.innerHTML = text;
    stack.focus({ preventScroll: true });
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
        else stack.focus({ preventScroll: true });
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
    stack.focus({ preventScroll: true });
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
