// Home page scenes: smooth scroll, the statement that inks in, the marquee, the pinned "what we stand for",
// division rows with a picture under the cursor, the Dunia film growing to the screen and the sideways games.
// Pinned and scrubbed versions only run on wide screens without reduced motion; otherwise the sections stay plain.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
var mm = gsap.matchMedia();

document.fonts.ready.then(function () {
  // Smooth scroll on desktop only. Touch keeps native scrolling.
  mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", function () {
    var s = ScrollSmoother.create({ wrapper: "#smooth-wrapper", content: "#smooth-content", smooth: 1.1, effects: false, normalizeScroll: false });
    // In-page links scroll through the smoother.
    function go(e) {
      var a = e.target.closest('a[href^="#"]'); if (!a) return;
      var id = a.getAttribute("href"); if (id.length < 2) return;
      var t = document.querySelector(id); if (!t) return;
      e.preventDefault(); s.scrollTo(t, true, "top top");
    }
    document.addEventListener("click", go);
    return function () { document.removeEventListener("click", go); s.kill(); };
  });

  mm.add("(prefers-reduced-motion: no-preference)", function () {
    // Who we are: each word inks in as the statement passes the middle of the screen.
    $$("[data-ink]").forEach(function (el) {
      var split = SplitText.create(el, { type: "words", wordsClass: "w" });
      gsap.to(split.words, { color: "#111111", stagger: 0.1, ease: "none", scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } });
    });

    // Numbers count up to their value.
    $$("[data-count]").forEach(function (el) {
      var to = +el.dataset.count, o = { v: to > 100 ? to - 20 : 0 };
      el.textContent = o.v;
      gsap.to(o, { v: to, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%", once: true }, onUpdate: function () { el.textContent = Math.round(o.v); } });
    });

    // Marquee: runs on its own and turns with the scroll direction.
    var track = $(".mq-track");
    if (track) {
      var loop = gsap.to(track, { xPercent: -50, ease: "none", duration: 22, repeat: -1 });
      ScrollTrigger.create({ trigger: ".mq", start: "top bottom", end: "bottom top", onUpdate: function (self) {
        var v = Math.max(-4, Math.min(4, self.getVelocity() / 400));
        gsap.to(loop, { timeScale: (self.direction || 1) * (1 + Math.abs(v)), duration: 0.4, overwrite: true });
      } });
    }

    // Founder quote rises line by line.
    $$("[data-lines]").forEach(function (el) {
      SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line", autoSplit: true, onSplit: function (self) {
        return gsap.from(self.lines, { yPercent: 105, duration: 1, ease: "expo.out", stagger: 0.09, scrollTrigger: { trigger: el, start: "top 80%", once: true } });
      } });
    });

    // Footer name: letters rise as the page ends.
    $$(".foot .mark").forEach(function (el) {
      var split = SplitText.create(el, { type: "chars" });
      gsap.from(split.chars, { yPercent: 70, ease: "none", stagger: 0.04, scrollTrigger: { trigger: ".foot", start: "top 85%", end: "bottom bottom", scrub: true } });
    });
  });

  // Wide screens: the pinned scenes.
  mm.add("(prefers-reduced-motion: no-preference) and (min-width: 900px)", function () {
    // What we stand for: one idea at a time while the section holds still.
    var stand = $(".stand");
    if (stand) {
      stand.classList.add("is-pinned");
      var items = $$(".stand-item", stand), words = $$(".stand-words li", stand), list = $(".stand-words", stand);
      gsap.set(items, { autoAlpha: 0, y: 40 }); gsap.set(items[0], { autoAlpha: 1, y: 0 }); words[0].classList.add("on");
      var tl = gsap.timeline({ scrollTrigger: { trigger: stand, start: "top top", end: "+=" + innerHeight * 2.2, pin: true, scrub: 0.6,
        onUpdate: function (self) {
          var i = Math.min(items.length - 1, Math.floor(self.progress * items.length * 0.999));
          words.forEach(function (w, k) { w.classList.toggle("on", k === i); });
        } } });
      tl.to(".stand-bar span", { scaleX: 1, ease: "none", duration: 3 }, 0);
      for (var i = 1; i < items.length; i++) {
        tl.to(items[i - 1], { autoAlpha: 0, y: -40, duration: 0.3 }, i - 0.15)
          .to(list, { y: -i + "em", duration: 0.4, ease: "power2.inOut" }, i - 0.2)
          .to(items[i], { autoAlpha: 1, y: 0, duration: 0.3 }, i);
      }
    }

    // Dunia: the film starts as a frame behind the title and grows to the whole screen.
    var dz = $(".dz");
    if (dz) {
      dz.classList.add("is-pinned");
      var frame = $(".dz-frame", dz), title = $(".dz-title", dz);
      gsap.timeline({ scrollTrigger: { trigger: $(".dz-stage", dz), start: "top top", end: "+=" + innerHeight * 1.4, pin: true, scrub: 0.6 } })
        .fromTo(frame, { clipPath: "inset(30% 31% 30% 31%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut", duration: 1 }, 0)
        .fromTo(title, { scale: 1, opacity: 1 }, { scale: 1.6, opacity: 0, ease: "power1.in", duration: 0.6 }, 0.1);
      gsap.set(title, { zIndex: 2, mixBlendMode: "difference" });
    }

    // Games: the page holds and the gallery moves sideways.
    var hz = $(".hz");
    if (hz) {
      hz.classList.add("is-h");
      var trk = $(".hz-track", hz);
      var dist = function () { return trk.scrollWidth - innerWidth; };
      var move = gsap.to(trk, { x: function () { return -dist(); }, ease: "none", scrollTrigger: { trigger: hz, start: "top top", end: function () { return "+=" + dist(); }, pin: true, scrub: 0.5, invalidateOnRefresh: true } });
      $$(".hz-pic img", hz).forEach(function (img) {
        gsap.fromTo(img, { xPercent: -5 }, { xPercent: 5, ease: "none", scrollTrigger: { trigger: img.parentNode, containerAnimation: move, start: "left right", end: "right left", scrub: true } });
      });
      $$(".hz-text", hz).forEach(function (t) {
        gsap.from(t.children, { y: 40, opacity: 0, stagger: 0.06, duration: 0.8, ease: "expo.out", scrollTrigger: { trigger: t, containerAnimation: move, start: "left 85%", toggleActions: "play none none reverse" } });
      });
    }

    return function () { $$(".is-pinned, .is-h").forEach(function (el) { el.classList.remove("is-pinned", "is-h"); }); };
  });

  ScrollTrigger.refresh();
});

// What we do: the division's picture follows the cursor over its row.
(function () {
  var box = $(".divs"), fl = $(".div-float"); if (!box || !fl || !fine) return;
  var img = $("img", fl), xTo = gsap.quickTo(fl, "x", { duration: 0.5, ease: "power3" }), yTo = gsap.quickTo(fl, "y", { duration: 0.5, ease: "power3" });
  box.addEventListener("pointermove", function (e) { var r = box.getBoundingClientRect(); xTo(e.clientX - r.left); yTo(e.clientY - r.top); });
  $$(".div-row", box).forEach(function (row) {
    row.addEventListener("pointerenter", function () { img.src = row.dataset.img; gsap.to(fl, { opacity: 1, scale: 1, rotate: -3, duration: 0.5, ease: "expo.out" }); });
    row.addEventListener("pointerleave", function () { gsap.to(fl, { opacity: 0, scale: 0.6, rotate: 0, duration: 0.4, ease: "power2.in" }); });
  });
})();

// Cursor: a dot that grows into a label over things you can open. Buttons lean toward it.
(function () {
  var c = $(".cursor"); if (!c || !fine) return;
  document.documentElement.classList.add("has-cursor");
  var label = $(".cursor-label", c), x = gsap.quickTo(c, "x", { duration: 0.25, ease: "power3" }), y = gsap.quickTo(c, "y", { duration: 0.25, ease: "power3" });
  addEventListener("pointermove", function (e) { x(e.clientX); y(e.clientY); });
  document.addEventListener("pointerover", function (e) {
    var t = e.target.closest("[data-cursor]"), inHero = e.target.closest(".hero, iframe, input, textarea");
    c.classList.toggle("big", !!t); c.classList.toggle("dim", !!inHero && !t);
    label.textContent = t ? t.dataset.cursor : "";
  });
  $$(".magnet").forEach(function (m) {
    var mx = gsap.quickTo(m, "x", { duration: 0.4, ease: "power3" }), my = gsap.quickTo(m, "y", { duration: 0.4, ease: "power3" });
    m.addEventListener("pointermove", function (e) { var r = m.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.25); my((e.clientY - r.top - r.height / 2) * 0.35); });
    m.addEventListener("pointerleave", function () { mx(0); my(0); });
  });
})();
