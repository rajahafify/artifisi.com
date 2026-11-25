// Page behaviour: smooth scroll, the scroll-driven story, reveals, the header, and the demo card.
// `html.js` is set before paint; `html.motion` too, unless reduced motion is requested or WebGL is missing.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { createRoom, PHASES, type Tier } from "./room";

gsap.registerPlugin(ScrollTrigger, SplitText);

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
const room = createRoom(
  canvas,
  { you: q("[data-label-you]"), sidekick: q("[data-label-sidekick]"), picks: qa("[data-label-pick]") },
  { small, tier },
);
if (!room) root.classList.remove("motion");
const motion = root.classList.contains("motion");

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

if (room && motion) {
  const hero = q("[data-hero]")!;
  const chapters = qa("[data-chapter]");
  const rail = q("[data-rail]")!;
  const railButtons = qa<HTMLButtonElement>("button", rail);
  const legend = q(".legend")!;

  // The copy is one timeline, one unit long, with a label per step. ScrollTrigger scrubs it,
  // so the hero and chapters ease in and out with the scroll instead of being set by hand.
  const copy = gsap.timeline({ defaults: { ease: "power2.out", duration: 0.05 } });
  copy.to(hero, { autoAlpha: 0, y: -60, duration: 0.085 }, 0.015);
  chapters.forEach((el, i) => {
    const [a, b] = steps[i];
    copy.addLabel(`step${i + 1}`, a);
    copy.fromTo(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0 }, a);
    if (i < chapters.length - 1) copy.to(el, { autoAlpha: 0, y: -30, ease: "power2.in" }, b - 0.05);
  });
  copy.set({}, {}, 1); // pad to exactly one unit so progress maps onto PHASES

  const setUi = (p: number) => {
    room.setProgress(p);
    let current = -1;
    steps.forEach(([a, b], i) => {
      if (p >= a) current = i;
      railButtons[i].style.setProperty("--fill", clamp((p - a) / (b - a)).toFixed(3));
    });
    railButtons.forEach((b, i) => b.classList.toggle("is-active", i === current));
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
    onToggle: (self) => room.setActive(self.isActive),
  });
  setUi(0);
  // One loop for the whole page: Lenis, ScrollTrigger and the room all run on GSAP's ticker.
  gsap.ticker.add((time) => room.tick(time));

  railButtons.forEach((b, i) => b.addEventListener("click", () => scrollToY(stepY(i))));

  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      room.setPointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
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
      .from(".scroll-cue", { autoAlpha: 0, duration: 1 }, 1.1)
      .from(canvas, { autoAlpha: 0, duration: 1.2, ease: "power2.out" }, 0);

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
} else if (room) {
  // Reduced motion: one still frame of the room behind the hero.
  room.renderAt(0);
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

// ---- Demo card ------------------------------------------------------------------------
const card = q("[data-card]");
if (card) {
  const tabs = qa<HTMLButtonElement>("[data-talk]");
  const panels = qa("[data-talk-panel]");
  const result = q("[data-result]")!;
  let timers: number[] = [];
  let currentId = tabs[0].dataset.talk!;

  const play = (id: string) => {
    timers.forEach(clearTimeout);
    timers = [];
    const panel = panels.find((p) => p.dataset.talkPanel === id)!;
    const msgs = qa(".msg", panel);
    msgs.forEach((m) => m.classList.remove("is-in"));
    const reduce = !motion;
    msgs.forEach((m, i) => {
      if (reduce) m.classList.add("is-in");
      else timers.push(window.setTimeout(() => m.classList.add("is-in"), 250 + i * 900));
    });
  };

  const select = (id: string, focus = false) => {
    currentId = id;
    tabs.forEach((t) => {
      const on = t.dataset.talk === id;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    panels.forEach((p) => (p.hidden = p.dataset.talkPanel !== id));
    card.setAttribute("aria-labelledby", `tab-${id}`);
    card.classList.remove("is-pass", "is-connect");
    result.textContent = "";
    play(id);
  };

  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t.dataset.talk!));
    t.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      select(tabs[(i + d + tabs.length) % tabs.length].dataset.talk!, true);
    });
  });

  for (const b of qa<HTMLButtonElement>("[data-act]", card)) {
    b.addEventListener("click", () => {
      const name = tabs.find((t) => t.dataset.talk === currentId)!.querySelector("b")!.textContent!.split(" ")[0];
      const connect = b.dataset.act === "connect";
      card.classList.remove("is-pass", "is-connect");
      void card.offsetWidth;
      card.classList.add(connect ? "is-connect" : "is-pass");
      window.setTimeout(() => card.classList.remove("is-pass", "is-connect"), 650);
      result.innerHTML = connect
        ? `In this demo ${name} connects too: <b>it's a match.</b> You'd swap contacts and get an opener.`
        : `Passed. ${name} will never know.`;
    });
  }

  // Play the first conversation when the card comes into view.
  ScrollTrigger.create({ trigger: card, start: "top 75%", once: true, onEnter: () => play(currentId) });
  if (!motion) play(currentId);
}

// Web fonts change line breaks and heights; measure again once they and the page are in.
document.fonts?.ready.then(() => ScrollTrigger.refresh());
addEventListener("load", () => ScrollTrigger.refresh());
