// Page behaviour: smooth scroll, the scroll-driven story, reveals, the header, and the demo card.
// `html.js` is set before paint; `html.motion` too, unless reduced motion is requested or WebGL is missing.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { createRoom, PHASES } from "./room";

gsap.registerPlugin(ScrollTrigger);

const root = document.documentElement;
const q = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
const qa = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const small = matchMedia("(max-width: 720px)").matches;
const story = q("[data-story]")!;
const canvas = q<HTMLCanvasElement>("[data-room]")!;
const room = createRoom(
  canvas,
  { you: q("[data-label-you]"), sidekick: q("[data-label-sidekick]"), picks: qa("[data-label-pick]") },
  { small },
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
for (const s of qa(".light")) {
  ScrollTrigger.create({
    trigger: s,
    start: "top 40px",
    end: "bottom 40px",
    onToggle: (self) => nav.classList.toggle("on-light", self.isActive),
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

  const setStory = (p: number) => {
    room.setProgress(p);
    const out = smooth(0.015, 0.1, p);
    hero.style.opacity = String(1 - out);
    hero.style.transform = `translate3d(0, ${(-60 * out).toFixed(1)}px, 0)`;
    hero.style.visibility = out > 0.99 ? "hidden" : "visible";

    let current = -1;
    chapters.forEach((el, i) => {
      const [a, b] = steps[i];
      const inn = smooth(a, a + 0.05, p);
      const last = i === chapters.length - 1;
      const outT = last ? 0 : smooth(b - 0.05, b, p);
      const o = inn * (1 - outT);
      el.style.opacity = o.toFixed(3);
      el.style.visibility = o > 0.01 ? "visible" : "hidden";
      el.style.transform = `translate3d(0, ${((1 - inn) * 30 - outT * 30).toFixed(1)}px, 0)`;
      if (p >= a) current = i;
      const fill = clamp((p - a) / (b - a));
      railButtons[i].style.setProperty("--fill", fill.toFixed(3));
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
    onUpdate: (self) => setStory(self.progress),
    onRefresh: (self) => setStory(self.progress),
  });
  // Only draw the scene while any of it is on screen.
  ScrollTrigger.create({
    trigger: story,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) => room.setActive(self.isActive),
  });
  setStory(0);

  railButtons.forEach((b, i) => b.addEventListener("click", () => scrollToY(stepY(i))));

  addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse") return;
      room.setPointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
    },
    { passive: true },
  );

  // The hero comes in line by line.
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.from("h1 .line > span", { yPercent: 110, duration: 1.4, stagger: 0.1 }, 0.15)
    .from(".kicker", { opacity: 0, y: 12, duration: 1 }, 0.1)
    .from(".hero-foot > *", { opacity: 0, y: 20, duration: 1.2, stagger: 0.1 }, 0.55)
    .from(".scroll-cue", { opacity: 0, duration: 1 }, 1.1)
    .from(canvas, { opacity: 0, duration: 2.2, ease: "power2.out" }, 0);

  // Section reveals.
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    once: true,
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.08 }),
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

addEventListener("load", () => ScrollTrigger.refresh());
