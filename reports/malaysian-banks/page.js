// Malaysia's banks, six ways: the page around the charts.
// The six-ranks chart, the league table and the motion. The 3D charts live in scene.js and
// this file drives them through window.__byName. Every number is already in the HTML, so
// with no script the page still reads in full.
(function () {
  "use strict";

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const G = window.gsap;
  // The film (?shot) seeks frames itself, so the page's own motion stays off there.
  const motion = !!G && !reduced && !new URLSearchParams(location.search).has("shot");
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
    ranks(banks);
    league(banks);
    tickers(banks);
  }

  // ---------- tickers: the twelve run past like a market board ----------
  // Each band carries one measure for all twelve, twice over so the loop has no seam.
  // It drifts on its own and the reader's scroll speeds it up or turns it round.
  function tickers(banks) {
    $$(".ticker").forEach((band) => {
      const m = band.dataset.m;
      const item = (b) => '<span class="tk"><b>' + b.short + "</b> " +
        (m === "profit" ? "US$" + comma(b.profit) + "m" : "US$" + one(b.assets / 1000) + "b") + "</span>";
      const run = banks.map(item).join("");
      const track = document.createElement("div");
      track.className = "ticker-track";
      track.innerHTML = run + run;
      band.appendChild(track);
      if (!motion) return;
      const dir = band.dataset.dir === "right" ? 1 : -1;
      const loop = G.fromTo(track, { xPercent: dir < 0 ? 0 : -50 }, { xPercent: dir < 0 ? -50 : 0, duration: 38, ease: "none", repeat: -1 });
      if (window.ScrollTrigger) {
        ScrollTrigger.create({
          trigger: band, start: "top bottom", end: "bottom top",
          onUpdate: (self) => {
            const sign = self.direction < 0 ? -1 : 1;
            const boost = 1 + Math.min(5, Math.abs(self.getVelocity()) / 300);
            G.to(loop, {
              timeScale: boost * sign, duration: 0.2, overwrite: true,
              onComplete: () => G.to(loop, { timeScale: sign, duration: 1.2, overwrite: true }),
            });
          },
        });
      }
    });
  }

  // ---------- ranks: each bank's line through its six ranks ----------
  // Twelve lines across six columns. A bank's height in a column is its rank among the
  // twelve on that measure, first at the top; ties share a rank and sit in size order.
  // The lines draw in when the chart comes into view, then Hong Leong stands out.
  // ?shot=ranks&t= freezes the draw at t for the film.
  const RANK_COLS = [
    { k: "assets", head: "Assets", phrase: "by assets" },
    { k: "profit", head: "Profit", phrase: "by profit" },
    { k: "roe", head: "ROE", phrase: "on return on equity" },
    { k: "roa", head: "ROA", phrase: "on return on assets" },
    { k: "cir", head: "Cost", phrase: "on cost", low: true, word: "leanest" },
    { k: "car", head: "Capital", phrase: "on capital" },
  ];
  function ranks(banks) {
    const fig = $(".ranks");
    const svg = $(".ranks-svg");
    const list = $(".names");
    const read = $('.ranks-read [data-f="read"]');
    if (!fig || !svg || !list) return;
    const NS = "http://www.w3.org/2000/svg";
    const el = (tag, attrs, parent) => {
      const n = document.createElementNS(NS, tag);
      Object.keys(attrs).forEach((k) => n.setAttribute(k, attrs[k]));
      if (parent) parent.appendChild(n);
      return n;
    };
    const bySize = (a, b) => b.assets - a.assets;
    // Row position in each column: rank order, ties broken by size.
    const pos = RANK_COLS.map((c) => {
      const order = banks.slice().sort((a, b) => (c.low ? a[c.k] - b[c.k] : b[c.k] - a[c.k]) || bySize(a, b));
      return new Map(order.map((b, i) => [b, i]));
    });
    const label = (b, c) => {
      const o = rankOf(banks, b, c.k, c.low);
      if (c.word && o.r === 1 && !o.tied) return c.word;
      return ord(o.r) + (o.tied ? "=" : "");
    };
    const sentence = (b) => b.short + ": " + RANK_COLS.map((c) => {
      const o = rankOf(banks, b, c.k, c.low);
      if (c.word && o.r === 1 && !o.tied) return c.word + " " + c.phrase;
      return ord(o.r) + (o.tied ? " equal" : "") + (c.word ? " " + c.word : "") + " " + c.phrase;
    }).join(", ") + ".";

    list.replaceChildren();
    const buttons = banks.map((b) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = b.short;
      btn.setAttribute("aria-pressed", "false");
      list.appendChild(btn);
      return btn;
    });

    let sel = banks.findIndex((b) => b.short === "Hong Leong");
    if (sel < 0) sel = 0;
    let t = 1, lines = [], built = null;

    function layout() {
      const W = Math.max(300, fig.clientWidth);
      const phone = W < 560;
      const L = phone ? 84 : 120, R = phone ? 14 : 120, TOP = 40, ROW = phone ? 30 : 38;
      const H = TOP + ROW * (banks.length - 1) + 24;
      const xs = RANK_COLS.map((_, i) => L + ((W - L - R) * i) / (RANK_COLS.length - 1));
      const y = (i) => TOP + i * ROW;
      return { W, H, phone, L, R, xs, y, dot: phone ? 11 : 14 };
    }

    function build() {
      const g = layout();
      built = g;
      svg.replaceChildren();
      svg.setAttribute("viewBox", "0 0 " + g.W + " " + g.H);
      svg.setAttribute("width", g.W);
      svg.setAttribute("height", g.H);
      RANK_COLS.forEach((c, i) => {
        el("line", { class: "rk-rule", x1: g.xs[i], x2: g.xs[i], y1: g.y(0) - 12, y2: g.y(banks.length - 1) + 12 }, svg);
        el("text", { class: "rk-head", x: g.xs[i], y: 12 }, svg).textContent = c.head;
      });
      lines = banks.map((b, bi) => {
        const grp = el("g", { class: "rk-g" }, svg);
        const pts = RANK_COLS.map((c, i) => [g.xs[i], g.y(pos[i].get(b))]);
        let d = "M" + pts[0][0] + " " + pts[0][1];
        for (let i = 1; i < pts.length; i++) {
          const mx = (pts[i - 1][0] + pts[i][0]) / 2;
          d += " C" + mx + " " + pts[i - 1][1] + " " + mx + " " + pts[i][1] + " " + pts[i][0] + " " + pts[i][1];
        }
        const path = el("path", { class: "rk-line", d }, grp);
        const hit = el("path", { class: "rk-hit", d }, grp);
        hit.addEventListener("click", () => pick(bi));
        const nameL = el("text", { class: "rk-name", x: g.L - (g.dot + 8), y: pts[0][1], "text-anchor": "end", "dominant-baseline": "central" }, svg);
        nameL.textContent = b.short;
        nameL.addEventListener("click", () => pick(bi));
        let nameR = null;
        if (!g.phone) {
          nameR = el("text", { class: "rk-name", x: g.W - g.R + g.dot + 8, y: pts[pts.length - 1][1], "dominant-baseline": "central" }, svg);
          nameR.textContent = b.short;
          nameR.addEventListener("click", () => pick(bi));
        }
        const len = path.getTotalLength();
        path.style.strokeDasharray = len + " " + len;
        return { b, grp, path, len, pts, names: [nameL, nameR].filter(Boolean) };
      });
      // The chosen bank's dots, drawn last so they sit on top.
      const dots = el("g", { class: "rk-dots" }, svg);
      lines.dots = RANK_COLS.map(() => {
        const d = el("g", { class: "rk-dot" }, dots);
        el("circle", { r: g.dot }, d);
        el("text", {}, d);
        return d;
      });
      paint();
    }

    function paint() {
      if (!built) return;
      lines.forEach((ln, i) => {
        // Each line draws left to right, a beat after the one above it.
        const own = Math.min(1, Math.max(0, (t - i * 0.025) / 0.6));
        const e = 1 - Math.pow(1 - own, 3);
        ln.path.style.strokeDashoffset = (ln.len * (1 - e)).toFixed(1);
        ln.grp.classList.toggle("on", i === sel && t >= 0.85);
        ln.names.forEach((n) => n.classList.toggle("on", i === sel && t >= 0.85));
      });
      const ln = lines[sel];
      const show = t >= 0.85;
      lines.dots.forEach((d, i) => {
        d.style.opacity = show ? "1" : "0";
        d.setAttribute("transform", "translate(" + ln.pts[i][0] + "," + ln.pts[i][1] + ")");
        const lab = label(ln.b, RANK_COLS[i]);
        d.querySelector("text").textContent = lab === "leanest" ? "1" : lab.replace(/(st|nd|rd|th)/, "");
      });
      // Bring the chosen line to the front of the others.
      if (show) ln.grp.parentNode.insertBefore(ln.grp, lines.dots[0].parentNode);
    }

    function pick(i) {
      sel = i;
      buttons.forEach((x, j) => x.setAttribute("aria-pressed", j === i ? "true" : "false"));
      if (t < 1) t = 1;
      paint();
      if (read) softSwap(read, sentence(banks[i]));
    }
    buttons.forEach((btn, i) => btn.addEventListener("click", () => pick(i)));

    const seek = (v) => { t = Math.min(1, Math.max(0, v)); paint(); };
    window.__seekExtra = Object.assign(window.__seekExtra || {}, { ranks: seek });

    build();
    buttons[sel].setAttribute("aria-pressed", "true");
    if (read) read.dataset.text = read.textContent;
    let lastW = fig.clientWidth;
    new ResizeObserver(() => { if (Math.abs(fig.clientWidth - lastW) > 2) { lastW = fig.clientWidth; build(); } }).observe(fig);
    addEventListener("beforeprint", () => seek(1));

    const q = new URLSearchParams(location.search);
    if (q.get("shot") === "ranks") {
      document.body.classList.add("shot-mode", "shot-ranks");
      $("#sheet").classList.add("on");
      requestAnimationFrame(() => { build(); seek(q.has("t") ? parseFloat(q.get("t")) : 1); });
      return;
    }
    if (reduced || !("IntersectionObserver" in window)) return;
    // Plays once, the first time the chart comes into view.
    seek(0);
    const io = new IntersectionObserver((es) => {
      if (!es.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const t0 = performance.now(), dur = 2200;
      const step = (now) => { seek((now - t0) / dur); if (t < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(fig);
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

  // ---------- the pinned charts: scroll brings a chart forward and it plays itself ----------
  const blocks = $$(".reading .block[data-for]");
  const figs = $$(".figs .fig");
  let current = null;
  function showFig(name) {
    const was = current;
    current = name;
    // The new chart steps forward a little as it takes the field.
    if (motion && was && was !== name) {
      const f = figs.find((x) => x.dataset.scene === name);
      if (f) G.fromTo(f, { scale: 0.94, rotate: -1 }, { scale: 1, rotate: 0, duration: 0.7, ease: "expo.out" });
    }
    figs.forEach((f) => f.classList.toggle("on", f.dataset.scene === name));
  }
  if ("IntersectionObserver" in window && blocks.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        showFig(e.target.dataset.for);
        autoplay(e.target.dataset.for);
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    blocks.forEach((b) => io.observe(b));
  }

  // A chart plays the first time its block comes into view. After that it holds its last
  // frame, and a click on it replays it. The film (?shot) seeks frames itself.
  function autoplay(name) {
    const st = window.__byName && window.__byName[name];
    if (!st || st.playing || st.done || st.t > 0 || document.body.classList.contains("shot-mode")) return;
    st.play();
  }

  // Print (the PDF): each chart moves into its own text block, at its finished frame,
  // and goes back to the field afterwards.
  const figHome = figs.map((f) => [f, f.parentNode, f.nextSibling]);
  addEventListener("beforeprint", () => {
    figs.forEach((f) => {
      const b = document.querySelector('.block[data-for="' + f.dataset.scene + '"]');
      const h = b && b.querySelector("h3");
      if (!h) return;
      f.classList.add("print-in", "on");
      h.after(f);
    });
    $$(".block details").forEach((d) => { d.dataset.wasOpen = d.open ? "1" : ""; d.open = true; });
    // Count-ups the reader has not scrolled to yet print their real figure.
    $$("[data-final]").forEach((el) => { el.innerHTML = el.dataset.final; });
    if (window.__seek) window.__seek(1);
    if (window.__stages) window.__stages.forEach((s) => s.resize());
  });
  addEventListener("afterprint", () => {
    figHome.forEach(([f, parent, next]) => { f.classList.remove("print-in"); parent.insertBefore(f, next); });
    figs.forEach((f) => f.classList.toggle("on", f.dataset.scene === (current || "swap")));
    $$(".block details").forEach((d) => { d.open = d.dataset.wasOpen === "1"; });
    if (window.__stages) window.__stages.forEach((s) => s.resize());
  });

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
    // The reader may already be at a chart when the 3D code finishes loading.
    if (current) autoplay(current);
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

    // Every photo in the mosaic drifts at its own speed, so the masthead parts as it leaves.
    $$(".mosaic .cell").forEach((c, i) => {
      G.to(c, {
        yPercent: [-18, 10, -6, 24, -14, 6, 16, -10, 12][i % 9], ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });
    });
    // The two lines of the headline pull apart as the reader scrolls on.
    if (matchMedia("(min-width: 821px)").matches) $$(".lines [data-line]").forEach((l, i) => {
      G.to(l.parentNode, {
        x: (i ? 1 : -1) * 0.08 * innerWidth, ease: "none",
        scrollTrigger: { trigger: ".hero-text", start: "top 40%", end: "bottom top", scrub: true },
      });
    });

    // The 62 grows into its place as the skyline rises behind it.
    G.fromTo(".figure", { scale: 0.72, transformOrigin: "0% 100%" }, {
      scale: 1, ease: "none",
      scrollTrigger: { trigger: ".statement", start: "top 80%", end: "center center", scrub: true },
    });

    // The two specimens slide in from opposite edges and meet (side by side, so wide screens only).
    const wide = matchMedia("(min-width: 821px)").matches;
    if (wide) $$(".spec").forEach((el, i) => {
      G.fromTo(el, { xPercent: i ? 45 : -45 }, {
        xPercent: 0, ease: "none",
        scrollTrigger: { trigger: ".spec-pair", start: "top bottom", end: "top 35%", scrub: true },
      });
    });

    // The wall's columns travel at different speeds.
    $$(".wall .tile").forEach((t, i) => {
      const col = i % 4;
      G.fromTo(t, { yPercent: [10, -6, 14, -10][col] }, {
        yPercent: [-10, 6, -14, 10][col], ease: "none",
        scrollTrigger: { trigger: ".wall", start: "top bottom", end: "bottom top", scrub: true },
      });
    });

    // The league heading slides across as the table passes.
    if (wide) G.fromTo(".league-head h2", { x: 0 }, {
      x: 0.05 * innerWidth, ease: "none",
      scrollTrigger: { trigger: ".league", start: "top bottom", end: "bottom top", scrub: true },
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
    el.dataset.final = to.toFixed(dp) + tail;
    el.innerHTML = (0).toFixed(dp) + tail;
    G.to(o, {
      v: to, duration: 1.6, ease: "expo.out",
      onUpdate: () => { el.innerHTML = o.v.toFixed(dp) + tail; },
      onComplete: () => { el.innerHTML = to.toFixed(dp) + tail; },
      scrollTrigger: { trigger: trigger, start: "top 70%", once: true },
    });
  }
})();
