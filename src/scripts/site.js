// Every page below the hero: entrances, the Kuala Lumpur clock, the contact form and the video dialog.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./video.js";

gsap.registerPlugin(ScrollTrigger);
var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

/* Entrances: each section's parts rise in order as the section arrives. Visible without script. */
(function () {
  var items = $$("[data-rise]");
  if (reduce) { gsap.set(items, { opacity: 1, y: 0 }); return; }
  ScrollTrigger.batch(items, {
    start: "top 90%",
    once: true,
    onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.07, overwrite: true }); }
  });
  // The film widens into place as the showcase arrives.
  $$(".show .film").forEach(function (el) {
    gsap.fromTo(el, { clipPath: "inset(6% 8% 6% 8%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: el, start: "top 95%", end: "top 35%", scrub: true } });
  });
  // The footer name slides in from the right as the page ends.
  $$(".foot .mark").forEach(function (el) {
    gsap.fromTo(el, { xPercent: 8 }, { xPercent: 0, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom bottom", scrub: true } });
  });
  // Wall pictures drift a little against the scroll.
  $$(".wall img").forEach(function (el) {
    gsap.fromTo(el, { yPercent: -4 }, { yPercent: 4, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
  });
})();

/* Name columns: hovering an item shows its line in the empty columns. */
(function () {
  $$(".cols").forEach(function (cols) {
    var hint = $(".hint", cols); if (!hint) return;
    var rest = hint.textContent;
    $$("[data-hint]", cols).forEach(function (el) {
      el.addEventListener("mouseenter", function () { hint.textContent = el.dataset.hint; });
      el.addEventListener("mouseleave", function () { hint.textContent = rest; });
    });
  });
})();

/* Kuala Lumpur time. */
(function () {
  var t = $("#kl-time"); if (!t) return;
  var f = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kuala_Lumpur", hour: "2-digit", minute: "2-digit" });
  function tick() { t.textContent = f.format(new Date()) + " in KL"; }
  tick(); setInterval(tick, 15000);
})();

/* Contact form: posts to Formspree and answers in place. Pilot links pick the topic. */
(function () {
  var f = $("#cform"), msg = $("#cform-msg"); if (!f) return;
  var topics = { ai: "Pilot: AI or robotics team", studio: "Pilot: game studio" };
  function pick(v) { var r = $('input[name=topic][value="' + v + '"]', f); if (r) r.checked = true; }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-topic]"); if (!a) return;
    pick(topics[a.dataset.topic] || a.dataset.topic);
    setTimeout(function () { $("#cemail").focus({ preventScroll: true }); }, 600);
  });
  // Links like /#apply-ai and /#apply-studio open the form with the pilot topic set.
  var deep = { "#apply-ai": topics.ai, "#apply-studio": topics.studio }[location.hash];
  if (deep) { pick(deep); setTimeout(function () { $("#contact").scrollIntoView(); $("#cemail").focus({ preventScroll: true }); }, 300); }
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    var email = $("#cemail");
    f.classList.remove("is-error", "is-sent");
    if (!email.value || !email.checkValidity()) {
      void f.offsetWidth; f.classList.add("is-error");
      msg.textContent = "That email doesn't look right. Try again.";
      email.focus(); return;
    }
    var btn = $(".go", f); btn.disabled = true; msg.textContent = "Sending…";
    fetch(f.action, { method: "POST", body: new FormData(f), headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw 0; f.reset(); f.classList.add("is-sent"); msg.textContent = "Thanks. We'll reply from hello@artifisi.com."; })
      .catch(function () { f.classList.add("is-error"); msg.textContent = "That didn't send. Email hello@artifisi.com instead."; })
      .then(function () { btn.disabled = false; });
  });
})();
