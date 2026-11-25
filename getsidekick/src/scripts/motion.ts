// Motion for the landing page. Content is visible without JavaScript; this only adds the
// entrance reveals, the swipe demo and the FAQ. Skipped entirely when reduced motion is requested.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduce) {
  document.documentElement.classList.add("js-motion");

  // Hero entrance.
  gsap.from(".hero .eyebrow, .hero h1, .hero .lead, .hero .actions, .hero .status", {
    opacity: 0,
    y: 22,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.09,
    delay: 0.1,
  });
  gsap.from(".phone", { opacity: 0, y: 40, duration: 1, ease: "power3.out", delay: 0.25 });

  // Section reveals as they scroll into view.
  gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%", once: true },
    });
  });
}

// The swipe demo: the top card is connected, slides away, and returns, over and over.
// The card underneath stays put. It stops with reduced motion.
const top = document.querySelector<HTMLElement>(".person.top");
const stamp = document.querySelector<HTMLElement>(".stamp");
if (top && stamp && !reduce) {
  const tl = gsap.timeline({ delay: 2.4, repeat: -1, repeatDelay: 1.4 });
  tl.to(stamp, { opacity: 1, duration: 0.2 })
    .to(top, { x: 280, rotation: 14, opacity: 0, duration: 0.6, ease: "power2.in" }, "+=0.3")
    .set(stamp, { opacity: 0 })
    .set(top, { x: 0, rotation: 0 })
    .to(top, { opacity: 1, duration: 0.5, ease: "power2.out" });
}
