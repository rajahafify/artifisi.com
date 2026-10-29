// Landing page below the hero: entrances, the episode sheets and the drive you can play,
// the contact form and the Kuala Lumpur clock.
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
  // The years count in as the intro arrives.
  $$(".years .yr").forEach(function (el) {
    var to = +el.textContent, o = { v: to - 12 };
    el.textContent = o.v;
    gsap.to(o, { v: to, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true }, onUpdate: function () { el.textContent = Math.round(o.v); } });
  });
})();

/* Episode sheets: a row of tabs, the chosen sheet on the stage below. */
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
