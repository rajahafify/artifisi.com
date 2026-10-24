// One field of small cubes that re-forms into each chart as you scroll.
// Every section has data-scene="name" and may offer several views; click the chart or a view button to switch.
import * as THREE from "three";

const N = 1400;
const C = {
  red: new THREE.Color("#e8604f"),
  ready: new THREE.Color("#1fa38a"),
  gap: new THREE.Color("#c98a16"),
  ink: new THREE.Color("#eef0ec"),
  road: new THREE.Color("#5d6763"),
  dim: new THREE.Color("#3a4441"),
};

const canvas = document.getElementById("scene");
const labelLayer = document.getElementById("labels");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x101413, 9, 20);
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
camera.position.set(0, 0, 11);

scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(4, 6, 8);
scene.add(key);

const group = new THREE.Group();
scene.add(group);
const mesh = new THREE.InstancedMesh(
  new THREE.BoxGeometry(0.09, 0.09, 0.09),
  new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.1 }),
  N
);
mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
group.add(mesh);

// Seeded random so every visit draws the same shapes.
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const delay = Float32Array.from({ length: N }, rnd);
const spin = Float32Array.from({ length: N }, () => rnd() * Math.PI * 2);

// A view is N positions, N colours and the labels that go with it.
function view(fn, labels = []) {
  const pos = new Float32Array(N * 3);
  const col = [];
  for (let i = 0; i < N; i++) {
    const [x, y, z, c] = fn(i);
    pos.set([x, y, z], i * 3);
    col.push(c);
  }
  return { pos, col, labels };
}

// Split N points across weights; returns [groupIndex, indexInGroup, groupSize] for point i.
function splitter(weights, min = 24) {
  const total = weights.reduce((a, b) => a + b, 0);
  const sizes = weights.map((w) => Math.max(min, Math.round((w / total) * N)));
  const big = sizes.indexOf(Math.max(...sizes));
  sizes[big] += N - sizes.reduce((a, b) => a + b, 0);
  const starts = sizes.map((_, k) => sizes.slice(0, k).reduce((a, b) => a + b, 0));
  return (i) => {
    let k = sizes.length - 1;
    while (starts[k] > i) k--;
    return [k, i - starts[k], sizes[k]];
  };
}

// Fibonacci sphere, filled a little so it reads as a solid.
const ball = (j, n, r) => {
  const y = 1 - (2 * (j + 0.5)) / n;
  const rad = Math.sqrt(1 - y * y);
  const t = j * 2.39996;
  const s = r * (0.75 + 0.25 * ((j * 7) % 4) / 3);
  return [Math.cos(t) * rad * s, y * s, Math.sin(t) * rad * s];
};

// A flat coin of radius R with a rim.
const coin = (j, n, R) => {
  if (j < n * 0.3) {
    const a = (j / (n * 0.3)) * Math.PI * 2;
    return [Math.cos(a) * R, Math.sin(a) * R, (j % 3 - 1) * 0.06];
  }
  const r = Math.sqrt(rnd()) * (R - 0.1);
  const a = j * 2.39996;
  return [Math.cos(a) * r, Math.sin(a) * r, j % 2 ? 0.1 : -0.1];
};

// A vertical bar of height h and width w standing on y0.
const bar = (j, n, x, y0, h, w) => {
  const per = Math.max(1, Math.round(n / Math.max(1, Math.round(h / 0.1))));
  const layer = Math.floor(j / per), layers = Math.ceil(n / per);
  return [x + ((j % per) / per - 0.5) * w, y0 + (layer / layers) * h, ((j * 0.37) % 1 - 0.5) * w];
};

const CATS = [
  ["Navigation", C.ready], ["Public transit", C.ready], ["Web & shop builders", C.ready], ["Security audits", C.ready],
  ["Messaging", C.gap], ["Freelance marketplace", C.gap], ["Work management", C.gap], ["Firewall & identity", C.gap],
];

const EXITS = [
  // name, value US$B, founded, sold, colour
  ["CyberArk", 25, 1999, 2026, C.gap],
  ["Waze", 1, 2008, 2013, C.ready],
  ["Moovit", 0.9, 2012, 2020, C.ready],
  ["Viber", 0.9, 2010, 2014, C.gap],
];
const tone = (c) => (c === C.ready ? "ready" : c === C.gap ? "gap" : c === C.red ? "red" : "ink");

const views = {
  coin: [
    // The $1B Google paid for Waze.
    view((i) => [...coin(i, N, 2.6), C.red], [{ p: [0, -2.95, 0], t: "Waze · bought by Google, 2013 · about US$1B", c: "red" }]),
    // The four exits as coins, area to scale.
    (() => {
      const pick = splitter(EXITS.map((e) => e[1]), 110);
      const at = [[-0.9, 0], [2.3, 1.45], [2.3, 0], [2.3, -1.45]];
      const R = EXITS.map((e) => Math.sqrt(e[1] / 25) * 2.4);
      return view(
        (i) => {
          const [k, j, n] = pick(i);
          const [x, y, z] = coin(j, n, Math.max(R[k], 0.45));
          return [at[k][0] + x, at[k][1] + y, z, EXITS[k][4]];
        },
        EXITS.map((e, k) => ({
          p: k ? [at[k][0], at[k][1] - 0.68, 0] : [at[k][0], -2.75, 0],
          t: `${e[0]} · US$${e[1] === 1 ? "~1" : e[1]}B · ${e[3]}`,
          c: tone(e[4]),
          small: k > 0,
        }))
      );
    })(),
  ],

  stats: [
    // 2 days, 11 products, 4 open categories.
    (() => {
      const pick = splitter([2, 11, 4].flatMap((n) => Array(n).fill(1)));
      return view(
        (i) => {
          const [k, j, n] = pick(i);
          let cx, cy, c, r = 0.42;
          if (k < 2) { cx = -2.6; cy = k ? -0.7 : 0.7; c = C.ink; r = 0.55; }
          else if (k < 13) { const m = k - 2; cx = -0.6 + (m % 3) * 0.75; cy = 1.6 - Math.floor(m / 3) * 0.95; c = C.ink; r = 0.3; }
          else { const m = k - 13; cx = 2.6; cy = 1.65 - m * 1.1; c = C.gap; r = 0.42; }
          const [x, y, z] = ball(j, n, r);
          return [cx + x, cy + y, z, c];
        },
        [
          { p: [-2.6, -1.75, 0], t: "2 days", c: "ink" },
          { p: [0.15, -2.2, 0], t: "11 products", c: "ink" },
          { p: [2.6, -2.55, 0], t: "4 open gaps", c: "gap" },
        ]
      );
    })(),
    // The week as a road, with a milestone for each day.
    (() => {
      const road = (t) => [-3.2 + t * 6.4, Math.sin(t * Math.PI * 1.5) * 0.9 - 0.6];
      const stops = [0.08, 0.36, 0.64, 0.92];
      const text = ["20 Oct · committee decides", "21 Oct · ban confirmed", "22 Oct · TuJu buckles", "23 Oct · rethink on wider ban"];
      const tall = [2.4, 1.3, 2.4, 1.3];
      const roadN = Math.round(N * 0.72);
      const lane = roadN / 4;
      return view(
        (i) => {
          if (i < roadN) {
            const t = (i % lane) / lane;
            const l = Math.floor(i / lane);
            const [x, y] = road(t);
            const dash = (l === 1 || l === 2) && Math.floor(t * 30) % 2 === 0;
            return [x, y, (l - 1.5) * 0.18, dash ? C.ink : C.road];
          }
          const j = i - roadN, per = Math.floor((N - roadN) / 4);
          const k = Math.min(3, Math.floor(j / per));
          const [x, y] = road(stops[k]);
          const h = tall[k];
          return [x + ((j % 3) - 1) * 0.08, y + 0.15 + ((j % per) / per) * h, ((j * 0.37) % 1 - 0.5) * 0.15, k === 2 ? C.red : C.ink];
        },
        stops.map((s, k) => {
          const [x, y] = road(s);
          return { p: [x, y + tall[k] + 0.4, 0], t: text[k], c: k === 2 ? "red" : "ink", align: k === 3 ? "right" : k === 0 ? "left" : "center" };
        })
      );
    })(),
  ],

  donut: [
    // Eight segments, four ready and four open gap.
    view(
      (i) => {
        const seg = i % 8;
        const a = (seg / 8) * Math.PI * 2 + (Math.floor(i / 8) / (N / 8)) * (Math.PI * 2 / 8) * 0.86;
        const tube = (i * 0.618) % 1 * Math.PI * 2;
        const R = 2.4, r = 0.45 * Math.sqrt(((i * 13) % 7) / 6 + 0.15);
        return [(R + Math.cos(tube) * r) * Math.cos(a), (R + Math.cos(tube) * r) * Math.sin(a), Math.sin(tube) * r, seg < 4 ? C.ready : C.gap];
      },
      CATS.map(([t, c], s) => {
        const a = ((s + 0.43) / 8) * Math.PI * 2;
        return { p: [Math.cos(a) * 3.2, Math.sin(a) * 3.2, 0], t, c: tone(c), align: Math.cos(a) < -0.2 ? "right" : Math.cos(a) > 0.2 ? "left" : "center" };
      })
    ),
    // Who owns them: bought by a foreign giant, or listed in New York.
    (() => {
      const items = [
        ["Waze\nGoogle", C.ready], ["Moovit\nMobileye", C.ready], ["Viber\nRakuten", C.gap], ["CyberArk\nPalo Alto", C.gap],
        ["Wix\nNasdaq", C.ready], ["Fiverr\nNYSE", C.gap], ["monday.com\nNasdaq", C.gap], ["Check Point\nNasdaq", C.gap],
      ];
      const at = items.map((_, k) => [(k < 4 ? -2.1 : 2.1) + ((k % 4) % 2 ? 0.85 : -0.85), 0.9 - Math.floor((k % 4) / 2) * 1.9]);
      return view(
        (i) => {
          const k = i % 8, j = Math.floor(i / 8);
          const [x, y, z] = ball(j, N / 8, 0.55);
          return [at[k][0] + x, at[k][1] + y, z, items[k][1]];
        },
        [
          ...items.map(([t, c], k) => ({ p: [at[k][0], at[k][1] - 0.92, 0], t, c: tone(c), small: true })),
          { p: [-2.1, 2.2, 0], t: "Bought by a foreign giant", c: "ink" },
          { p: [2.1, 2.2, 0], t: "Listed on US exchanges", c: "ink" },
        ]
      );
    })(),
  ],

  table: [
    // One slab per category. Ready slabs are packed; open gaps are loose.
    view(
      (i) => {
        const row = i % 8;
        const j = Math.floor(i / 8);
        let x = -2.6 + (j % 35) * 0.13, y = 2.45 - row * 0.7, z = (Math.floor(j / 35) - 2) * 0.12;
        if (row >= 4) { x += (rnd() - 0.5) * 0.5; y += (rnd() - 0.5) * 0.35; z += (rnd() - 0.5) * 1.2; }
        return [x, y, z, CATS[row][1]];
      },
      CATS.map(([t, c], row) => ({ p: [-2.6, 2.45 - row * 0.7 + 0.3, 0], t, c: tone(c), align: "left", small: true }))
    ),
    // When each was founded. Israeli products above the line, Malaysian ones below.
    (() => {
      const il = [["Check Point", 1993], ["CyberArk", 1999], ["Wix", 2006], ["Waze", 2008], ["Viber", 2010], ["Fiverr", 2010], ["Moovit", 2012], ["monday.com", 2012]];
      const my = [["Exabytes", 2001], ["EasyStore", 2013], ["SiteGiant", 2013], ["TuJu", 2025]];
      // Kept narrow so the labels on the right still fit on screen.
      const X0 = -1.2, W = 4.4, Y0 = -0.6;
      const X = (yr) => X0 + ((yr - 1993) / 33) * W;
      const stalks = [...il.map(([t, y], k) => [t, y, 0.45 + k * 0.36, C.ink]), ...my.map(([t, y], k) => [t, y, -(0.5 + k * 0.36), C.ready])];
      const axisN = Math.round(N * 0.3), per = Math.floor((N - axisN) / stalks.length);
      return view(
        (i) => {
          if (i < axisN) {
            const t = i / axisN;
            return [X0 + t * W, Y0 + (i % 2) * 0.06 - 0.03, ((i * 0.37) % 1 - 0.5) * 0.12, C.road];
          }
          const j = i - axisN, k = Math.min(stalks.length - 1, Math.floor(j / per));
          const [, yr, h, c] = stalks[k];
          const u = (j % per) / per;
          return [X(yr) + ((j % 2) - 0.5) * 0.06, Y0 + h * u, ((j * 0.37) % 1 - 0.5) * 0.06, c];
        },
        [
          ...stalks.map(([t, yr, h, c]) => ({ p: [X(yr) + 0.1, Y0 + h, 0], t: `${t} ${yr}`, c: tone(c), align: "left", small: true })),
          { p: [X0 - 0.1, Y0, 0], t: "1993", c: "muted", small: true, align: "right" },
          { p: [X0 + W + 0.1, Y0, 0], t: "2026", c: "muted", small: true, align: "left" },
        ]
      );
    })(),
  ],

  bars: (() => {
    const make = (heights, label) => {
      const full = 5.4, max = Math.max(...heights);
      const pick = splitter(heights, 60);
      return view(
        (i) => {
          const [k, j, n] = pick(i);
          const [x, y, z] = bar(j, n, -2.4 + k * 1.6, -2.7, (heights[k] / max) * full, 0.6);
          return [x + (rnd() - 0.5) * 0.06, y, z, EXITS[k][4]];
        },
        EXITS.map((e, k) => ({ p: [-2.4 + k * 1.6, -2.7 + (heights[k] / max) * full + 0.35, 0], t: label(e), c: tone(e[4]) }))
      );
    };
    return [
      // Acquisition prices to scale.
      make(EXITS.map((e) => e[1]), (e) => `${e[0]} ${e[1] === 1 ? "~1" : e[1]}`),
      // Same prices on a log scale, so the small ones become readable.
      make(EXITS.map((e) => Math.log10(e[1] * 1000)), (e) => `${e[0]} ${e[1] === 1 ? "~1" : e[1]}`),
      // Years from founding to sale.
      make(EXITS.map((e) => e[3] - e[2]), (e) => `${e[0]} ${e[3] - e[2]} yrs`),
    ];
  })(),

  ask: [
    // Three strands for the three asks, rising together.
    view(
      (i) => {
        const s = i % 3;
        const t = Math.floor(i / 3) / (N / 3);
        const a = t * Math.PI * 6 + (s * Math.PI * 2) / 3;
        const r = 0.9 + 0.25 * Math.sin(t * 20);
        return [Math.cos(a) * r, -3 + t * 6, Math.sin(a) * r, [C.ready, C.gap, C.ink][s]];
      },
      ["Buy local first", "Fund the gaps", "Publish the test"].map((t, s) => ({ p: [1.5, 3 - s * 0.4, 0], t, c: ["ready", "gap", "ink"][s], align: "left" }))
    ),
    // Which categories each ask covers.
    (() => {
      const cols = [[0, 1, 2, 3], [4, 6, 7], [0, 1, 2, 3, 4, 5, 6, 7]];
      const balls = cols.flatMap((cats, k) => cats.map((cat, m) => [k, m, cat]));
      const per = Math.floor(N / balls.length);
      return view(
        (i) => {
          const b = Math.min(balls.length - 1, Math.floor(i / per));
          const [k, m, cat] = balls[b];
          const [x, y, z] = ball(i % per, per, 0.26);
          return [-2.4 + k * 2.4 + x, 2.1 - m * 0.66 + y, z, CATS[cat][1]];
        },
        [
          { p: [-2.4, 2.8, 0], t: "Buy local first · 4", c: "ready" },
          { p: [0, 2.8, 0], t: "Fund the gaps · 3", c: "gap" },
          { p: [2.4, 2.8, 0], t: "Publish the test · 8", c: "ink" },
          ...cols[1].map((cat, m) => ({ p: [0.4, 2.1 - m * 0.66, 0], t: CATS[cat][0], c: "gap", align: "left", small: true })),
        ]
      );
    })(),
  ],

  // Loose field behind the notes.
  field: [view(() => [(rnd() - 0.5) * 14, (rnd() - 0.5) * 9, (rnd() - 0.5) * 8, C.dim])],
};

const sections = [...document.querySelectorAll("[data-scene]")];
const current = new Map(sections.map((s) => [s, 0]));
const viewOf = (k) => views[sections[k].dataset.scene][current.get(sections[k])];

// Labels are HTML, placed over their 3D anchor every frame.
let dominant = 0, labelEls = [], labelKey = "";
function buildLabels() {
  labelLayer.textContent = "";
  labelEls = viewOf(dominant).labels.map((l) => {
    const el = document.createElement("div");
    el.className = `lbl ${l.c || ""} ${l.small ? "small" : ""} ${l.align || "center"}`;
    el.textContent = l.t;
    labelLayer.appendChild(el);
    return { el, p: new THREE.Vector3(...l.p), align: l.align || "center", w: 0 };
  });
  labelKey = `${dominant}:${current.get(sections[dominant])}`;
  canvas.style.cursor = views[sections[dominant].dataset.scene].length > 1 ? "pointer" : "default";
}

// View switching: the buttons in each section, or a click on the chart itself.
let changedAt = 0;
function setView(section, v) {
  const n = views[section.dataset.scene].length;
  v = ((v % n) + n) % n;
  current.set(section, v);
  section.querySelectorAll("[data-view]").forEach((el) => {
    const on = Number(el.dataset.view) === v;
    el.classList.toggle("on", on);
    if (el.tagName === "BUTTON") el.setAttribute("aria-pressed", String(on));
  });
  changedAt = performance.now();
}
sections.forEach((s) => {
  s.querySelectorAll("button[data-view]").forEach((b) => b.addEventListener("click", () => setView(s, Number(b.dataset.view))));
});
canvas.addEventListener("click", () => {
  const s = sections[dominant];
  setView(s, current.get(s) + 1);
  learned();
});

// Teach the click: a tapping finger until the first switch, and a "1 / 3" chip under every chart.
const TAUGHT = "ts-taught";
let taught = false;
try { taught = localStorage.getItem(TAUGHT) === "1"; } catch {}
function learned() {
  taught = true;
  try { localStorage.setItem(TAUGHT, "1"); } catch {}
}
sections.forEach((s) => s.querySelectorAll("button[data-view]").forEach((b) => b.addEventListener("click", learned)));
const finger = document.createElement("div");
finger.className = "finger";
finger.setAttribute("aria-hidden", "true");
finger.innerHTML = '<span class="ripple"></span><svg viewBox="0 0 24 24" width="44" height="44"><path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/></svg><span class="say">Click the chart</span>';
document.body.appendChild(finger);
const chip = document.createElement("div");
chip.className = "chip";
chip.setAttribute("aria-hidden", "true");
document.body.appendChild(chip);
const fingerAt = new THREE.Vector3(0.3, -0.4, 0);
const chipAt = new THREE.Vector3(0, -3.6, 0);

// Scroll position -> which two sections to blend, and how far.
function scrollState() {
  const mid = scrollY + innerHeight * 0.5;
  // A shape is fully formed when its section's top reaches the top of the screen (or its middle, if shorter).
  const centers = sections.map((s) => s.offsetTop + Math.min(s.offsetHeight, innerHeight) * 0.5);
  if (mid <= centers[0]) return [0, 0, 0];
  for (let k = 0; k < centers.length - 1; k++) {
    if (mid < centers[k + 1]) return [k, k + 1, (mid - centers[k]) / (centers[k + 1] - centers[k])];
  }
  return [centers.length - 1, centers.length - 1, 0];
}
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

const m = new THREE.Matrix4();
const q = new THREE.Quaternion();
const e = new THREE.Euler();
const p = new THREE.Vector3();
const v3 = new THREE.Vector3();
const one = new THREE.Vector3(1, 1, 1);
const tc = new THREE.Color();
const mouse = { x: 0, y: 0 };
addEventListener("pointermove", (ev) => {
  mouse.x = ev.clientX / innerWidth - 0.5;
  mouse.y = ev.clientY / innerHeight - 0.5;
});

// Where the shape sits: in the free space right of the text on wide screens, above the text on phones.
// Each section gets its own spot and size, since some text columns are wider than others.
let offsetX = 0, offsetY = 0, scale = 0.82;
const place = new Map();
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const wide = w > 900;
  camera.position.z = wide ? 11 : 13.5;
  const halfH = Math.tan(THREE.MathUtils.degToRad(20)) * camera.position.z;
  const perPx = (2 * halfH) / h;
  offsetY = wide ? 0 : 0.5 * halfH;
  sections.forEach((s) => {
    const col = s.querySelector(".col");
    if (!wide || !col) return place.set(s, { x: wide ? 0.44 * halfH * camera.aspect : 0, s: wide ? 0.82 : 0.5 });
    const left = col.getBoundingClientRect().right + 24;
    const free = Math.max(200, w - left - 16);
    // Shapes plus their labels span about 8.4 units.
    place.set(s, { x: (left + free / 2 - w / 2) * perPx, s: Math.min(0.82, (free * perPx) / 8.4) });
  });
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();
addEventListener("load", resize);
document.fonts?.ready.then(resize);

// Positions ease toward their target, so scrolling and view changes both animate.
const cur = new Float32Array(N * 3);
const curCol = Array.from({ length: N }, () => new THREE.Color());
let first = true;
const clock = new THREE.Clock();
let last = 0;

function frame() {
  const now = clock.getElapsedTime();
  const dt = Math.min(0.1, now - last);
  last = now;
  const t = reduced ? 0 : now;
  const [a, b, f] = scrollState();
  const A = viewOf(a), B = viewOf(b);
  dominant = f < 0.5 ? a : b;
  if (`${dominant}:${current.get(sections[dominant])}` !== labelKey) buildLabels();

  for (let i = 0; i < N; i++) {
    // Each cube leaves a little earlier or later, so shapes dissolve instead of sliding.
    const k = smooth(0.2 + delay[i] * 0.35, 0.45 + delay[i] * 0.35, f);
    const i3 = i * 3;
    // Same speed at any frame rate.
    const rate = first || reduced ? 1 : 1 - Math.exp(-dt * (3.5 + delay[i] * 6));
    for (let d = 0; d < 3; d++) {
      const target = A.pos[i3 + d] + (B.pos[i3 + d] - A.pos[i3 + d]) * k;
      cur[i3 + d] += (target - cur[i3 + d]) * rate;
    }
    p.set(cur[i3], cur[i3 + 1], cur[i3 + 2]);
    p.z += Math.sin(k * Math.PI) * (delay[i] - 0.5) * 3;
    if (!reduced) p.y += Math.sin(t * 1.2 + spin[i]) * 0.02;
    e.set(spin[i] + t * 0.3, spin[i] * 0.5 + t * 0.2, 0);
    q.setFromEuler(e);
    m.compose(p, q, one);
    mesh.setMatrixAt(i, m);
    tc.copy(A.col[i]).lerp(B.col[i], k);
    curCol[i].lerp(tc, rate);
    mesh.setColorAt(i, curCol[i]);
  }
  first = false;
  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor.needsUpdate = true;

  // The coin and the strands turn slowly; charts with labels stay nearly face-on so they read.
  const name = sections[dominant].dataset.scene;
  const v = current.get(sections[dominant]);
  const turn = v === 0 && (name === "coin" || name === "ask");
  const targetY = turn && !reduced ? Math.sin(t * 0.35) * 0.6 + mouse.x * 0.4 : -0.12 + mouse.x * 0.15;
  const targetX = (name === "donut" && v === 0 ? -0.35 : 0.04) + mouse.y * 0.1;
  group.rotation.y += (targetY - group.rotation.y) * 0.05;
  group.rotation.x += (targetX - group.rotation.x) * 0.05;
  const spot = place.get(sections[dominant]);
  offsetX = spot.x;
  scale += (spot.s - scale) * 0.08;
  group.scale.setScalar(scale);
  group.position.x += (offsetX - group.position.x) * 0.08;
  group.position.y += (offsetY - group.position.y) * 0.08;
  group.updateMatrixWorld();

  // Show labels once the shape has settled.
  const settled = Math.abs(f - (dominant === a ? 0 : 1)) < 0.22 && performance.now() - changedAt > 900;
  labelLayer.classList.toggle("show", settled);
  const w = innerWidth, h = innerHeight;
  for (const l of labelEls) {
    v3.copy(l.p).applyMatrix4(group.matrixWorld).project(camera);
    // Keep every label on screen, which matters on phones.
    if (!l.w) l.w = l.el.offsetWidth;
    let x = ((v3.x + 1) / 2) * w;
    const lo = l.align === "left" ? 6 : l.align === "right" ? l.w + 6 : l.w / 2 + 6;
    const hi = l.align === "left" ? w - l.w - 6 : l.align === "right" ? w - 6 : w - l.w / 2 - 6;
    x = Math.min(Math.max(x, lo), Math.max(lo, hi));
    l.el.style.transform = `translate(${x}px, ${((1 - v3.y) / 2) * h}px)`;
  }

  const count = views[sections[dominant].dataset.scene].length;
  const multi = count > 1 && settled;
  const phoneHero = innerWidth <= 900 && dominant === 0;
  finger.classList.toggle("show", multi && !taught && !phoneHero);
  chip.classList.toggle("show", multi && !phoneHero);
  chip.textContent = `${current.get(sections[dominant]) + 1} / ${count} · ${innerWidth <= 900 ? "tap" : "click"} to switch`;
  v3.copy(fingerAt).applyMatrix4(group.matrixWorld).project(camera);
  finger.style.transform = `translate(${((v3.x + 1) / 2) * w}px, ${((1 - v3.y) / 2) * h}px)`;
  v3.copy(chipAt).applyMatrix4(group.matrixWorld).project(camera);
  chip.style.transform = `translate(${((v3.x + 1) / 2) * w}px, ${Math.min(((1 - v3.y) / 2) * h, h - 30)}px)`;
  finger.querySelector(".say").textContent = innerWidth <= 900 ? "Tap the chart" : "Click the chart";

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
document.documentElement.classList.add("has-scene");
