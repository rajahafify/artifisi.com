// One field of small cubes that re-forms into each chart as you scroll.
// Every section has data-scene="name" and may offer several views; click the chart or a view button to switch.
import * as THREE from "three";

const N = 1400;
const C = {
  red: new THREE.Color("#ef6a55"),
  ready: new THREE.Color("#36b3a0"),
  gap: new THREE.Color("#e0a23a"),
  ink: new THREE.Color("#eef0ec"),
  road: new THREE.Color("#5a6680"),
  dim: new THREE.Color("#34405a"),
};

const canvas = document.getElementById("scene");
const labelLayer = document.getElementById("labels");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0f1522, 9, 20);
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

// Split `total` points across weights; returns [groupIndex, indexInGroup, groupSize] for point i.
function split(weights, total, min = 24) {
  const sum = weights.reduce((a, b) => a + b, 0);
  const sizes = weights.map((w) => Math.max(min, Math.round((w / sum) * total)));
  const big = sizes.indexOf(Math.max(...sizes));
  sizes[big] += total - sizes.reduce((a, b) => a + b, 0);
  const starts = sizes.map((_, k) => sizes.slice(0, k).reduce((a, b) => a + b, 0));
  return (i) => {
    let k = sizes.length - 1;
    while (starts[k] > i) k--;
    return [k, i - starts[k], sizes[k]];
  };
}

const tone = (c) => (c === C.ready ? "ready" : c === C.gap ? "gap" : c === C.red ? "red" : c === C.road ? "muted" : "ink");

// Columns on a shared floor. items are [label, value, colour]. A ghost fills each column up to `max` in dim cubes.
function columns(items, { max, ghost = 0, label = (it) => `${it[0]}\n${it[1]}` } = {}) {
  const full = 5.2, y0 = -2.7, w = 0.7;
  const top = max ?? Math.max(...items.map((it) => it[1]));
  const step = Math.min(1.9, 6.4 / items.length);
  const X = (k) => (k - (items.length - 1) / 2) * step;
  const H = (k) => (items[k][1] / top) * full;
  const ghostN = Math.round(N * ghost);
  const pickG = split(items.map((_, k) => full - H(k)), Math.max(1, ghostN), 1);
  const pick = split(items.map((it) => it[1]), N - ghostN, 40);
  return view(
    (i) => {
      if (i < ghostN) {
        const [k, j, n] = pickG(i);
        const [x, y, z] = bar(j, n, X(k), y0 + H(k), full - H(k), w);
        return [x, y, z, C.dim];
      }
      const [k, j, n] = pick(i - ghostN);
      const [x, y, z] = bar(j, n, X(k), y0, H(k), w);
      return [x + (rnd() - 0.5) * 0.05, y, z, items[k][2]];
    },
    items.map((it, k) => ({ p: [X(k), y0 + (ghost ? full : H(k)) + 0.45, 0], t: label(it), c: tone(it[2]) }))
  );
}

// The median household as a house of cubes: walls, roof, a door and two windows. Sorted left to right so it can be split by share.
const HOUSE = (() => {
  const pts = [];
  while (pts.length < N) {
    const x = (rnd() - 0.5) * 4.4, y = -2.4 + rnd() * 4.8;
    const z = rnd() < 0.7 ? (rnd() < 0.5 ? -0.8 : 0.8) : (rnd() - 0.5) * 1.6;
    const body = y < 0.5 && Math.abs(x) < 1.9;
    const roof = y >= 0.5 && Math.abs(x) < 2.2 * (1 - (y - 0.5) / 1.9);
    const front = z > 0.7;
    const door = front && Math.abs(x) < 0.38 && y < -1.0;
    const win = front && Math.abs(Math.abs(x) - 1.15) < 0.33 && Math.abs(y + 0.45) < 0.33;
    if ((body || roof) && !door && !win) pts.push([x, y, z]);
  }
  return pts.sort((a, b) => a[0] - b[0]);
})();
const WAGES = Math.round(N * 0.629);
const splitX = HOUSE[WAGES][0];

const views = {
  house: [
    // RM7,017 a month, the median household in 2024.
    view((i) => [...HOUSE[i], C.ink], [{ p: [0, -2.95, 0], t: "Median household · RM7,017 a month · 2024", c: "ink" }]),
    // Same house split by source: 62.9% wages.
    view(
      (i) => {
        const [x, y, z] = HOUSE[i];
        const w = i < WAGES;
        return [x + (w ? -0.18 : 0.18), y, z, w ? C.ready : C.ink];
      },
      [
        { p: [(-2.2 + splitX) / 2 - 0.18, -2.95, 0], t: "Wages · 62.9%", c: "ready" },
        { p: [(splitX + 2.2) / 2 + 0.18, -2.95, 0], t: "Everything else · 37.1%", c: "ink" },
      ]
    ),
  ],

  happy: [
    // Malaysia Happiness Index, out of 10.
    columns([["2021", 6.48, C.ink], ["2024", 7.6, C.ready]], { max: 10, ghost: 0.28, label: (it) => `${it[0]}\n${it[1].toFixed(2)} of 10` }),
  ],

  districts: [
    // 166 districts as three waffle columns: 55 at or below 5.1%, 45 above it, 66 above 10.2%.
    (() => {
      const tiers = [[55, C.ready, "55 districts\nat or below 5.1%"], [45, C.gap, "45 districts\nabove 5.1%"], [66, C.red, "66 districts\nabove 10.2%"]];
      const balls = tiers.flatMap(([n, c], t) => Array.from({ length: n }, (_, m) => [t, m, c]));
      const pick = split(balls.map(() => 1), N, 1);
      const cx = [-2.2, 0, 2.2], s = 0.3, y0 = -2.4;
      return view(
        (i) => {
          const [k, j, n] = pick(i);
          const [t, m, c] = balls[k];
          const [x, y, z] = ball(j, n, 0.11);
          return [cx[t] + ((m % 6) - 2.5) * s + x, y0 + Math.floor(m / 6) * s + y, z, c];
        },
        tiers.map(([n, c, t], k) => ({ p: [cx[k], y0 + Math.ceil(n / 6) * s + 0.4, 0], t, c: tone(c) }))
      );
    })(),
    // The extremes against the national rate.
    columns([["Pitas, Sabah", 50, C.red], ["Kuala Krai, Kelantan", 20.2, C.gap], ["Malaysia", 5.1, C.ready]], { label: (it) => `${it[0]}\n${it[1]}%` }),
  ],

  squeeze: [
    // Two jars of bottom 10% income. The bright top is what is left after spending.
    (() => {
      const jars = [["2019", 0.108], ["2024", 0.019]];
      const half = N / 2, h = 4.6, y0 = -2.6, R = 0.85;
      return view(
        (i) => {
          const k = i < half ? 0 : 1, j = i % half;
          const a = j * 2.39996;
          const r = R * (j % 5 === 0 ? Math.sqrt((j * 0.618) % 1) : 1);
          const y = y0 + (j / half) * h;
          const left = j >= half * (1 - jars[k][1]);
          return [(k ? 1.4 : -1.4) + Math.cos(a) * r, y, Math.sin(a) * r, left ? C.ready : C.road];
        },
        jars.map(([yr, f], k) => ({ p: [k ? 1.4 : -1.4, y0 + h + 0.45, 0], t: `${yr}\n${(f * 100).toFixed(1)}% left over`, c: "ready" }))
      );
    })(),
    // Rise in monthly spending, 2019 to 2024.
    columns([["Bottom 10%", 384, C.red], ["Top 10%", 65, C.road]], { label: (it) => `${it[0]}\n+RM${it[1]} a month` }),
  ],

  plate: [
    // Two plates, area to scale.
    (() => {
      const plates = [["Eating out", 902.7, C.gap], ["Food at home", 875.8, C.ready]];
      const half = N / 2;
      return view(
        (i) => {
          const k = i < half ? 0 : 1;
          const [x, y, z] = coin(i % half, half, 1.5 * Math.sqrt(plates[k][1] / 902.7));
          return [(k ? 1.75 : -1.75) + x, y + 0.2, z, plates[k][2]];
        },
        plates.map(([t, v, c], k) => ({ p: [k ? 1.75 : -1.75, -1.75, 0], t: `${t}\nRM${v.toFixed(2)}`, c: tone(c) }))
      );
    })(),
    // Food as a share of all spending: the bright arc.
    (() => {
      const rings = [["Bottom 10%", 0.383, C.red], ["Top 10%", 0.245, C.ready]];
      const half = N / 2, R = 1.25;
      return view(
        (i) => {
          const k = i < half ? 0 : 1, j = i % half;
          const t = j / half;
          const a = Math.PI / 2 - t * Math.PI * 2;
          const tube = (j * 0.618) % 1 * Math.PI * 2, r = 0.22;
          return [(k ? 1.6 : -1.6) + (R + Math.cos(tube) * r) * Math.cos(a), 0.3 + (R + Math.cos(tube) * r) * Math.sin(a), Math.sin(tube) * r, t < rings[k][1] ? rings[k][2] : C.dim];
        },
        rings.map(([t, s, c], k) => ({ p: [k ? 1.6 : -1.6, -1.6, 0], t: `${t}\n${(s * 100).toFixed(1)}% on food`, c: tone(c) }))
      );
    })(),
  ],

  health: [
    // A hundred adults, one ball per 1%: 22 obese, 33 overweight.
    (() => {
      const per = Math.floor(N / 100);
      return view(
        (i) => {
          const k = Math.min(99, Math.floor(i / per));
          const [x, y, z] = ball(i % per, per, 0.17);
          const c = k < 22 ? C.red : k < 55 ? C.gap : C.road;
          return [-2.25 + (k % 10) * 0.5 + x, 2.0 - Math.floor(k / 10) * 0.5 + y, z, c];
        },
        [
          { p: [-2.0, -3.05, 0], t: "Obese\n21.8%", c: "red" },
          { p: [0, -3.05, 0], t: "Overweight\n32.6%", c: "gap" },
          { p: [2.0, -3.05, 0], t: "Neither\n45.6%", c: "muted" },
        ]
      );
    })(),
  ],

  ageing: [
    // Perak households with an older person, out of 100%.
    columns([["Perak 2022", 35.5, C.ink], ["Perak 2024", 41.7, C.gap]], { max: 100, ghost: 0.4, label: (it) => `${it[0]}\n${it[1]}%` }),
    // Households headed by an older person, top four states.
    columns([["Perak", 25.6, C.gap], ["Pahang", 22.2, C.ready], ["Negeri\nSembilan", 20.8, C.ready], ["Perlis", 20.7, C.ready]], { label: (it) => `${it[0]}\n${it[1]}%` }),
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
const TAUGHT = "soh-taught";
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

// Phones read as pages: each section's text, then a full-screen page that shows its chart. CSS hides these on wide screens.
const topBar = document.querySelector(".bar");
const vizPages = sections.map((s) => {
  if (s.classList.contains("notes")) return null;
  const page = document.createElement("div");
  page.className = "vizpage";
  page.setAttribute("aria-hidden", "true");
  const kicker = s.querySelector(".kicker");
  if (kicker) page.appendChild(document.createElement("span")).textContent = kicker.textContent;
  s.appendChild(page);
  return page;
});
let phone = false;
// Same test as the CSS: a narrow window, or a touch screen held upright even when the browser asks for the desktop site.
const phoneQuery = matchMedia("(max-width: 900px), (pointer: coarse) and (orientation: portrait)");

// Scroll position -> which two sections to blend, and how far.
function scrollState() {
  const mid = scrollY + innerHeight * 0.5;
  // A shape is fully formed when its section's top reaches the top of the screen (or its middle, if shorter).
  // On phones it is fully formed when its chart page fills the screen, so shapes change while text covers them.
  const centers = sections.map((s, k) => {
    const page = phone && vizPages[k];
    if (page) { const r = page.getBoundingClientRect(); return scrollY + r.top + r.height * 0.5; }
    return s.offsetTop + Math.min(s.offsetHeight, innerHeight) * 0.5;
  });
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

// Where the shape sits: in the free space right of the text on wide screens, centred on phones.
// Each section gets its own spot and size, since some text columns are wider than others.
let offsetX = 0, offsetY = 0, scale = 0.82;
const place = new Map();
function resize() {
  const wide = !phoneQuery.matches;
  phone = !wide;
  if (phone) document.documentElement.style.setProperty("--bar", `${topBar.offsetHeight}px`);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  // A hidden or not-yet-laid-out page reports zero size; a later resize fills this in.
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.position.z = 11;
  const halfH = Math.tan(THREE.MathUtils.degToRad(20)) * camera.position.z;
  const perPx = (2 * halfH) / h;
  offsetY = 0;
  // On a phone, fit the shapes and their labels to the screen width.
  const fit = Math.min(0.82, (2 * halfH * camera.aspect) / 8.4);
  sections.forEach((s) => {
    const col = s.querySelector(".col");
    if (!wide || !col) return place.set(s, { x: wide ? 0.44 * halfH * camera.aspect : 0, s: wide ? 0.82 : fit });
    const left = col.getBoundingClientRect().right + 24;
    const free = Math.max(200, w - left - 16);
    // Shapes plus their labels span about 8.4 units.
    place.set(s, { x: (left + free / 2 - w / 2) * perPx, s: Math.min(0.82, (free * perPx) / 8.4) });
  });
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
// Also catch size changes that fire no window resize, like an in-app browser opening.
new ResizeObserver(() => resize()).observe(canvas);
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

  // The house turns slowly; charts with labels stay nearly face-on so they read.
  const name = sections[dominant].dataset.scene;
  const v = current.get(sections[dominant]);
  const turn = name === "house" && v === 0;
  const targetY = turn && !reduced ? Math.sin(t * 0.35) * 0.6 + mouse.x * 0.4 : -0.12 + mouse.x * 0.15;
  const targetX = (name === "plate" && v === 1 ? 0 : 0.04) + mouse.y * 0.1;
  group.rotation.y += (targetY - group.rotation.y) * 0.05;
  group.rotation.x += (targetX - group.rotation.x) * 0.05;
  const spot = place.get(sections[dominant]);
  if (!spot) return requestAnimationFrame(frame);
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
  finger.classList.toggle("show", multi && !taught);
  chip.classList.toggle("show", multi);
  chip.textContent = `${current.get(sections[dominant]) + 1} / ${count} · ${phone ? "tap" : "click"} to switch`;
  v3.copy(fingerAt).applyMatrix4(group.matrixWorld).project(camera);
  finger.style.transform = `translate(${((v3.x + 1) / 2) * w}px, ${((1 - v3.y) / 2) * h}px)`;
  v3.copy(chipAt).applyMatrix4(group.matrixWorld).project(camera);
  chip.style.transform = `translate(${((v3.x + 1) / 2) * w}px, ${Math.min(((1 - v3.y) / 2) * h, h - 30)}px)`;
  finger.querySelector(".say").textContent = phone ? "Tap the chart" : "Click the chart";

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
document.documentElement.classList.add("has-scene");
// The phone layout only applies once has-scene is set.
resize();
