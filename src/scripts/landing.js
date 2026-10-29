// Landing page below the hero: entrances, the episode sheets and the drive you can play,
// the pinned pilot fragment, the games ledger, the contact form and the Kuala Lumpur clock.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

/* Entrances: each section's parts rise in order as the section arrives. Visible without script. */
(function () {
  var items = $$("[data-rise]");
  if (reduce) { gsap.set(items, { opacity: 1, y: 0 }); return; }
  ScrollTrigger.batch(items, {
    start: "top 88%",
    once: true,
    onEnter: function (batch) { gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.08, overwrite: true }); }
  });
  // A slow drift on the game screens as they pass.
  $$(".strip img").forEach(function (img, i) {
    gsap.fromTo(img, { yPercent: i % 2 ? 4 : -2 }, { yPercent: i % 2 ? -2 : 4, ease: "none", scrollTrigger: { trigger: ".strip", start: "top bottom", end: "bottom top", scrub: true } });
  });
  // The years count in as the intro arrives.
  $$(".years .yr").forEach(function (el) {
    var to = +el.textContent, o = { v: to - 12 };
    el.textContent = o.v;
    gsap.to(o, { v: to, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true }, onUpdate: function () { el.textContent = Math.round(o.v); } });
  });
})();

/* Episode sheets: a tab list on the left, the chosen sheet on the stage. */
(function () {
  var tabs = $$(".outputs [role=tab]");
  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute("aria-controls"));
      if (on && p.hidden) { p.hidden = false; p.classList.remove("is-entering"); void p.offsetWidth; p.classList.add("is-entering"); }
      else if (!on) p.hidden = true;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(t); });
    t.addEventListener("keydown", function (e) {
      var k = e.key, n = tabs.length;
      if (k === "ArrowDown" || k === "ArrowRight") { e.preventDefault(); select(tabs[(i + 1) % n], true); }
      if (k === "ArrowUp" || k === "ArrowLeft") { e.preventDefault(); select(tabs[(i - 1 + n) % n], true); }
    });
  });
})();

/* The drive: each button press is a decision, and Dunia writes the row. A toy model, labelled sample data. */
(function () {
  var body = $("#drive-rows"), total = $("#drive-total"), me = $("#car-me"), ahead = $("#car-ahead");
  if (!body) return;
  var s = { step: 4, lane: 1, aheadLane: 1, gap: 40, speed: 57, ret: 0.6 };
  function place() {
    me.style.setProperty("--lane", s.lane);
    ahead.style.setProperty("--lane", s.aheadLane);
    ahead.style.left = Math.max(14, Math.min(88, 10 + s.gap * 1.9)) + "%";
  }
  place();
  function row(cells, bad) {
    var tr = document.createElement("tr");
    tr.className = "is-new" + (bad ? " is-bad" : "");
    cells.forEach(function (c, j) { var td = document.createElement("td"); td.textContent = c; if (j === 0) td.className = "num idx"; if (j === 4) td.className = "num"; tr.appendChild(td); });
    body.appendChild(tr);
    while (body.children.length > 6) body.removeChild(body.firstChild);
  }
  $$(".play-ctl button").forEach(function (b) {
    b.addEventListener("click", function () {
      var act = b.dataset.act, state = "Lane " + (s.lane + 1) + ", " + s.gap + " m gap, " + s.speed + " km/h";
      var label = { left: "Steer left", hold: "Hold", right: "Steer right" }[act];
      var moved = act === "left" ? s.lane > 0 : act === "right" ? s.lane < 2 : false;
      if (moved) s.lane += act === "left" ? -1 : 1;
      var outcome, r, bad = false;
      if (s.lane === s.aheadLane) {
        s.gap -= 9;
        if (s.gap <= 4) { outcome = "Too close, braked hard"; r = -1.0; bad = true; s.gap = 30; s.speed = 41; }
        else { outcome = "Clear"; r = 0.1; s.speed = Math.min(60, s.speed + 1); }
      } else {
        outcome = moved ? "Lane " + (s.lane + 1) + ", clear" : "Clear"; r = moved ? 0.3 : 0.1;
        s.speed = Math.min(60, s.speed + 1);
        // A new car pulls in ahead.
        if (moved) { s.aheadLane = s.lane; s.gap = 34 + Math.round(Math.random() * 10); }
      }
      if (act !== "hold" && !moved) { outcome = "Edge of road, held lane"; r = -0.2; }
      s.step += 1; s.ret = Math.round((s.ret + r) * 10) / 10;
      row([String(s.step), state, label, outcome, (r > 0 ? "+" : "") + r.toFixed(1)], bad);
      total.textContent = s.step + " steps, return " + s.ret.toFixed(1);
      place();
    });
  });
})();

/* Pilot: the side tabs swap the words and the fragment; the step nearest the middle sets the fragment's state. */
(function () {
  var sec = $(".lp-pilot"); if (!sec) return;
  var tabs = $$(".side-tabs [role=tab]"), ink = $(".tab-ink"), steps = $$(".step", sec), apply = $("#pilot-apply");
  var side = "ai", cur = 0;
  function moveInk() {
    var t = tabs.filter(function (x) { return x.getAttribute("aria-selected") === "true"; })[0];
    ink.style.width = t.offsetWidth + "px";
    ink.style.transform = "translateX(" + t.offsetLeft + "px)";
  }
  function show(i) {
    cur = i;
    steps.forEach(function (st, j) { st.classList.toggle("is-on", j === i); });
    $$(".frag", sec).forEach(function (f) {
      $$(".frag-state", f).forEach(function (st) { st.classList.toggle("is-on", +st.dataset.state === i); });
    });
    var c = $('.frag[data-track="' + side + '"] .frag-state[data-state="' + i + '"] .count', sec);
    if (c) { var o = { v: 0 }, to = +c.dataset.to; if (reduce) c.textContent = to; else gsap.to(o, { v: to, duration: 1.4, ease: "expo.out", onUpdate: function () { c.textContent = Math.round(o.v); } }); }
  }
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      side = t.dataset.side;
      tabs.forEach(function (x) { x.setAttribute("aria-selected", x === t ? "true" : "false"); });
      $$("[data-ai]", sec).forEach(function (el) { el.hidden = side !== "ai"; });
      $$("[data-studio]", sec).forEach(function (el) { el.hidden = side !== "studio"; });
      $$(".frag", sec).forEach(function (f) { f.hidden = f.dataset.track !== side; });
      apply.dataset.topic = side;
      moveInk(); show(cur);
    });
  });
  moveInk();
  window.addEventListener("resize", moveInk);
  steps.forEach(function (st, i) {
    ScrollTrigger.create({ trigger: st, start: "top 55%", end: "bottom 55%", onToggle: function (self) { if (self.isActive) show(i); } });
  });
  show(0);
})();

/* Games ledger: the picture beside the list follows the row in focus. */
(function () {
  var pv = $(".preview"); if (!pv) return;
  var img = $("img", pv), rows = $$(".row"), fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  function to(row) {
    if (!fine.matches) return;
    rows.forEach(function (r) { r.classList.toggle("is-shown", r === row); });
    if (img.getAttribute("src") !== row.dataset.preview) {
      pv.classList.add("is-swapping");
      setTimeout(function () { img.src = row.dataset.preview; pv.classList.remove("is-swapping"); }, 150);
    }
    var y = row.getBoundingClientRect().top - $(".rows").getBoundingClientRect().top;
    pv.style.transform = "translateY(" + Math.max(0, y - 40) + "px)";
  }
  rows.forEach(function (r) { r.addEventListener("pointerenter", function () { to(r); }); r.addEventListener("focus", function () { to(r); }); });
})();

/* Kuala Lumpur time in the footer. */
(function () {
  var t = $("#kl-time"); if (!t) return;
  var f = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kuala_Lumpur", hour: "2-digit", minute: "2-digit" });
  function tick() { t.textContent = f.format(new Date()); }
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
  // Links from other pages: /#apply-ai and /#apply-studio open the form with the pilot topic set.
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
