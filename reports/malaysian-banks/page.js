// Malaysia's banks, six ways: the page around the charts.
// The bank sheet, the league table and the motion. The 3D charts live in scene.js and
// this file drives them through window.__byName. Every number is already in the HTML, so
// with no script the page still reads in full.
(function () {
  "use strict";

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const G = window.gsap;
  const motion = !!G && !reduced;
  if (motion) document.documentElement.classList.add("motion");
  if (G && window.ScrollTrigger) G.registerPlugin(ScrollTrigger);
  if (G && window.Flip) G.registerPlugin(Flip);

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  // ---------- text swap soft, from the Transitions skill ----------
  const ms = (name) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;
  function softSwap(el, next) {
    const prev = el.dataset.text ?? el.textContent;
    if (prev === next) return;
    el.dataset.text = next;
    clearTimeout(el._softTimer);
    if (reduced) { el.textContent = next; return; }

    const out = document.createElement("span");
    out.className = "t-text-soft-old";
    out.setAttribute("aria-hidden", "true");
    out.textContent = prev;
    const inn = document.createElement("span");
    inn.className = "t-text-soft-new";
    inn.textContent = next;

    const w0 = el.getBoundingClientRect().width;
    el.classList.remove("is-swapping");
    el.replaceChildren(out, inn);
    const w1 = inn.getBoundingClientRect().width;
    el.style.width = w0 + "px";
    void el.offsetWidth;
    el.classList.add("is-swapping");
    el.style.width = w1 + "px";

    el._softTimer = setTimeout(() => {
      el.classList.remove("is-swapping");
      el.style.removeProperty("width");
      el.textContent = next;
    }, Math.max(ms("--text-soft-dur"), ms("--text-soft-resize-dur")) + 40);
  }

  // ---------- numbers ----------
  const ord = (n) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };
  const one = (v) => v.toFixed(1);
  const comma = (v) => v.toLocaleString("en-US");

  // Rank among the twelve. Ties share a rank, so two banks at 11.2% are both "2nd equal".
  function rankOf(banks, b, key, low) {
    const better = banks.filter((x) => (low ? x[key] < b[key] : x[key] > b[key])).length;
    const tied = banks.filter((x) => x !== b && x[key] === b[key]).length;
    return { r: better + 1, tied: tied > 0 };
  }
  const rankText = (o, word) => {
    if (word && o.r === 1 && !o.tied) return word.charAt(0).toUpperCase() + word.slice(1);
    return ord(o.r) + (o.tied ? " equal" : "") + (word ? " " + word : "");
  };

  const MEASURES = {
    assets: { v: (b) => one(b.assets / 1000), bar: (b) => b.assets },
    profit: { v: (b) => comma(b.profit), bar: (b) => b.profit },
    roe: { v: (b) => one(b.roe), bar: (b) => b.roe },
    roa: { v: (b) => one(b.roa), bar: (b) => b.roa },
    cir: { v: (b) => one(b.cir), bar: (b) => b.cir, low: true },
    car: { v: (b) => one(b.car), bar: (b) => b.car },
  };

  fetch("./data.json").then((r) => r.json()).then(build).catch((e) => console.error("data failed:", e));

  function build(D) {
    const banks = D.banks;
    const T = D.totals;
    const share = (b, k) => one((b[k] / T[k]) * 100);
    sheet(banks, share);
    league(banks);
  }

  // ---------- the sheet: pick a bank, read its row ----------
  function sheet(banks, share) {
    const list = $(".names");
    const card = $("#statement");
    if (!list || !card) return;
    list.replaceChildren();
    banks.forEach((b, i) => {
      const btn = document.createElement("button");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
      btn.setAttribute("aria-controls", "statement");
      btn.tabIndex = i === 0 ? 0 : -1;
      btn.dataset.rank = b.rank;
      btn.textContent = b.short;
      list.appendChild(btn);
    });
    const f = (k) => card.querySelector('[data-f="' + k + '"]');
    const bySize = banks.slice().sort((a, b) => b.assets - a.assets);

    function show(b) {
      const pos = bySize.indexOf(b) + 1;
      const local = pos === 1 ? "Largest of the twelve" : pos === banks.length ? "Smallest of the twelve" : ord(pos) + " largest of the twelve";
      const set = {
        name: b.name,
        world: "World rank " + b.rank,
        local: local,
        assets: "US$" + one(b.assets / 1000) + "b",
        "assets-r": rankText(rankOf(banks, b, "assets")) + ", " + share(b, "assets") + "% of all",
        profit: "US$" + comma(b.profit) + "m",
        "profit-r": rankText(rankOf(banks, b, "profit")) + ", " + share(b, "profit") + "% of all",
        roe: one(b.roe) + "%",
        "roe-r": rankText(rankOf(banks, b, "roe")),
        roa: one(b.roa) + "%",
        "roa-r": rankText(rankOf(banks, b, "roa")),
        cir: one(b.cir) + "%",
        "cir-r": rankText(rankOf(banks, b, "cir", true), "leanest"),
        car: one(b.car) + "%",
        "car-r": rankText(rankOf(banks, b, "car")),
        line: "Holds " + share(b, "assets") + "% of the assets and makes " + share(b, "profit") + "% of the profit.",
      };
      Object.keys(set).forEach((k) => { const el = f(k); if (el) softSwap(el, set[k]); });
    }

    const buttons = $$("button", list);
    function pick(i, focus) {
      buttons.forEach((x, j) => {
        x.setAttribute("aria-selected", j === i ? "true" : "false");
        x.tabIndex = j === i ? 0 : -1;
      });
      if (focus) buttons[i].focus();
      show(banks[i]);
      if (motion) G.fromTo(card, { y: 10 }, { y: 0, duration: 0.5, ease: "expo.out" });
    }
    list.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (btn) pick(buttons.indexOf(btn));
    });
    list.addEventListener("keydown", (e) => {
      const i = buttons.indexOf(document.activeElement);
      if (i < 0) return;
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (e.key === "Home") { e.preventDefault(); pick(0, true); }
      else if (e.key === "End") { e.preventDefault(); pick(buttons.length - 1, true); }
      else if (step) { e.preventDefault(); pick((i + step + buttons.length) % buttons.length, true); }
    });
    // The HTML already shows Maybank. This checks the computed ranks match it.
    show(banks[0]);
  }

  // ---------- the league: six measures, twelve orders ----------
  function league(banks) {
    const ol = $(".bands");
    const tabs = $$(".tabs button");
    if (!ol || !tabs.length) return;
    const rows = new Map();
    banks.forEach((b) => {
      const li = document.createElement("li");
      li.className = "band-row";
      li.innerHTML = '<span class="v"></span><span class="n"></span><span class="bar-track"><span class="bar-fill"></span></span>';
      li.querySelector(".n").innerHTML = b.name + "<small>World rank " + b.rank + "</small>";
      rows.set(b, li);
      ol.appendChild(li);
    });

    function sortBy(m, animate) {
      const M = MEASURES[m];
      const order = banks.slice().sort((a, b) => (M.low ? M.bar(a) - M.bar(b) : M.bar(b) - M.bar(a)));
      const max = Math.max.apply(null, banks.map(M.bar));
      const state = animate && motion && window.Flip ? Flip.getState(ol.children) : null;
      order.forEach((b, i) => {
        const li = rows.get(b);
        li.querySelector(".v").textContent = M.v(b);
        // The far end of each order, three banks, is filled orange.
        const low = i >= order.length - 3;
        li.classList.toggle("low", low);
        // The colour is never the only sign: the far end also says so in words.
        li.querySelector(".n small").textContent = "World rank " + b.rank + (low ? ", far end of this order" : "");
        ol.appendChild(li);
      });
      const fills = order.map((b) => [rows.get(b).querySelector(".bar-fill"), M.bar(b) / max]);
      if (state) {
        Flip.from(state, { duration: 0.7, ease: "power3.inOut", stagger: 0.015 });
        fills.forEach(([el, s]) => G.to(el, { scaleX: s, duration: 0.8, ease: "expo.out" }));
      } else {
        fills.forEach(([el, s]) => { el.style.transform = "scaleX(" + s + ")"; });
      }
    }

    tabs.forEach((btn, i) => {
      btn.tabIndex = i === 0 ? 0 : -1;
      btn.addEventListener("click", () => {
        tabs.forEach((x) => { x.setAttribute("aria-selected", x === btn ? "true" : "false"); x.tabIndex = x === btn ? 0 : -1; });
        sortBy(btn.dataset.m, true);
      });
      btn.addEventListener("keydown", (e) => {
        const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (!step) return;
        e.preventDefault();
        const n = tabs[(i + step + tabs.length) % tabs.length];
        n.focus(); n.click();
      });
    });
    sortBy("assets", false);

    // First sight: the bars grow from nothing, top row first.
    if (motion && window.ScrollTrigger) {
      G.from($$(".bar-fill", ol), {
        scaleX: 0, duration: 1, ease: "expo.out", stagger: 0.04,
        scrollTrigger: { trigger: ol, start: "top 80%", once: true },
      });
    }
  }

  // ---------- the pinned charts: scroll picks the chart, a click plays it ----------
  const blocks = $$(".reading .block[data-for]");
  const figs = $$(".figs .fig");
  function showFig(name) {
    figs.forEach((f) => f.classList.toggle("on", f.dataset.scene === name));
  }
  if ("IntersectionObserver" in window && blocks.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) showFig(e.target.dataset.for); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    blocks.forEach((b) => io.observe(b));
  }

  function stagesReady(fn) {
    if (window.__byName) fn(window.__byName);
    else window.addEventListener("scenes-ready", () => fn(window.__byName), { once: true });
  }

  // A control shows the chart it sits under, then moves it.
  function bring(st) {
    showFig(st.name);
    if (!st.playing && st.t < 0.99) st.to(1, 1200);
  }

  const BIG = new Set(["Maybank", "CIMB Group", "Public Bank", "RHB Bank", "Hong Leong Financial Group"]);
  const ISLAMIC = new Set(["Bank Islam Malaysia", "Bank Muamalat Malaysia", "Bank Rakyat Malaysia", "MBSB Bank"]);

  stagesReady((S) => {
    $$(".reading .seg").forEach((seg) => {
      const name = seg.closest(".block").dataset.for;
      const st = S[name];
      if (!st) return;
      const opts = $$("button", seg);
      opts.forEach((btn) => btn.addEventListener("click", () => {
        opts.forEach((x) => x.setAttribute("aria-checked", x === btn ? "true" : "false"));
        const v = btn.dataset.v;
        showFig(name);
        if (name === "swap" || name === "tanks") { st.to(parseFloat(v), 1100); return; }
        if (name === "dials") {
          st.body.highlight(v === "big" ? (b) => BIG.has(b.name) : v === "islamic" ? (b) => ISLAMIC.has(b.name) : null);
        }
        if (name === "lanes") st.body.highlight(v || null);
        bring(st);
      }));
    });

    const range = $("#roe-line");
    const blocksSt = S.blocks;
    if (range && blocksSt) {
      const out = $("#roe-out"), cnt = $("#roe-n");
      range.addEventListener("input", () => {
        const v = parseFloat(range.value);
        const n = blocksSt.body.setLine(v);
        out.textContent = one(v) + "%";
        cnt.textContent = n + " of 12";
        bring(blocksSt);
      });
    }

    // ?shot=name: the film shows one chart, full frame.
    const q = new URLSearchParams(location.search);
    if (q.has("shot")) showFig(q.get("shot"));
  });

  if (!motion) return;

  // ---------- page motion (GSAP) ----------
  const mm = G.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Masthead: the photo cells open, then the headline rises line by line.
    const tl = G.timeline({ defaults: { ease: "expo.out" } });
    tl.from(".mosaic .cell", { clipPath: "inset(0 0 100% 0)", duration: 1.1, stagger: { each: 0.05, from: "start" } }, 0)
      .fromTo(".lines [data-line]", { y: 0, yPercent: 105 }, { yPercent: 0, duration: 0.9, stagger: 0.11 }, 0.25)
      .to("[data-load]", { opacity: 1, y: 0, duration: 0.8 }, 0.45);

    // The Maybank photo drifts as the masthead scrolls away.
    G.to(".mosaic .photo.wide:first-child img", {
      scale: 1.12, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });

    // Headings and notes come up as they enter.
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 88%", once: true,
      onEnter: (els) => G.to(els, { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08 }),
    });

    // The big figure counts up to 62.
    countUp($(".figure"), 62, 0, "<sup>%</sup>", ".statement");
    // The two specimens count up side by side.
    $$(".spec-fig").forEach((el) => countUp(el, parseFloat(el.textContent), 1, "%", ".spec-pair"));

    // The sheet slides in on its orange stage.
    G.from("#statement", {
      y: 80, rotate: -1.5, duration: 1.2, ease: "expo.out",
      scrollTrigger: { trigger: ".stage", start: "top 75%", once: true },
    });

    // The wall: tiles drop in, row by row.
    G.from(".wall .tile", {
      opacity: 0, y: 40, duration: 0.8, ease: "expo.out", stagger: 0.04,
      scrollTrigger: { trigger: ".wall", start: "top 75%", once: true },
    });

    // The wordmark rises out of the footer as it is revealed.
    G.from(".wordmark svg", {
      yPercent: 40, ease: "none",
      scrollTrigger: { trigger: "main", start: "bottom bottom", end: "bottom top", scrub: true },
    });
  });

  function countUp(el, to, dp, tail, trigger) {
    if (!el) return;
    const o = { v: 0 };
    el.innerHTML = (0).toFixed(dp) + tail;
    G.to(o, {
      v: to, duration: 1.6, ease: "expo.out",
      onUpdate: () => { el.innerHTML = o.v.toFixed(dp) + tail; },
      onComplete: () => { el.innerHTML = to.toFixed(dp) + tail; },
      scrollTrigger: { trigger: trigger, start: "top 70%", once: true },
    });
  }
})();
