// One particle field of small cubes that re-forms into each chart as you scroll.
// Every section has data-scene="name"; the field blends between the shapes of neighbouring sections.
import * as THREE from "three";

const N = 1400;
const C = {
  red: new THREE.Color("#e8604f"),
  ready: new THREE.Color("#1fa38a"),
  gap: new THREE.Color("#c98a16"),
  ink: new THREE.Color("#eef0ec"),
  dim: new THREE.Color("#3a4441"),
};

const canvas = document.getElementById("scene");
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

// Each formation is a list of N positions and N colours.
function formation(fn) {
  const pos = new Float32Array(N * 3);
  const col = [];
  for (let i = 0; i < N; i++) {
    const [x, y, z, c] = fn(i);
    pos.set([x, y, z], i * 3);
    col.push(c);
  }
  return { pos, col };
}

// Split N points across weights; returns [groupIndex, indexInGroup, groupSize] for point i.
function splitter(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  const sizes = weights.map((w) => Math.max(24, Math.round((w / total) * N)));
  sizes[0] += N - sizes.reduce((a, b) => a + b, 0);
  const starts = sizes.map((_, k) => sizes.slice(0, k).reduce((a, b) => a + b, 0));
  return (i) => {
    let k = sizes.length - 1;
    while (starts[k] > i) k--;
    return [k, i - starts[k], sizes[k]];
  };
}

const ball = (j, n, r) => {
  // Fibonacci sphere, filled a little so it reads as a solid.
  const y = 1 - (2 * (j + 0.5)) / n;
  const rad = Math.sqrt(1 - y * y);
  const t = j * 2.39996;
  const s = r * (0.75 + 0.25 * ((j * 7) % 4) / 3);
  return [Math.cos(t) * rad * s, y * s, Math.sin(t) * rad * s];
};

const shapes = {
  // A $1B coin: two faces and a rim.
  coin: formation((i) => {
    const R = 2.6;
    if (i < N * 0.3) {
      const a = (i / (N * 0.3)) * Math.PI * 2;
      return [Math.cos(a) * R, Math.sin(a) * R, (i % 3 - 1) * 0.12, C.red];
    }
    const j = i - N * 0.3;
    const r = Math.sqrt(rnd()) * (R - 0.15);
    const a = j * 2.39996;
    return [Math.cos(a) * r, Math.sin(a) * r, i % 2 ? 0.2 : -0.2, C.red];
  }),

  // 2 days, 11 products, 4 open categories.
  stats: (() => {
    const pick = splitter([2, 11, 4].flatMap((n) => Array(n).fill(1)));
    return formation((i) => {
      const [k, j, n] = pick(i);
      let cx, cy, c, r = 0.42;
      if (k < 2) { cx = -2.6; cy = k ? -0.7 : 0.7; c = C.ink; r = 0.55; }
      else if (k < 13) { const m = k - 2; cx = -0.6 + (m % 3) * 0.75; cy = 1.6 - Math.floor(m / 3) * 0.95; c = C.ink; r = 0.3; }
      else { const m = k - 13; cx = 2.6; cy = 1.65 - m * 1.1; c = C.gap; r = 0.42; }
      const [x, y, z] = ball(j, n, r);
      return [cx + x, cy + y, z, c];
    });
  })(),

  // Eight segments, four ready and four open gap.
  donut: formation((i) => {
    const seg = i % 8;
    const a = (seg / 8) * Math.PI * 2 + (Math.floor(i / 8) / (N / 8)) * (Math.PI * 2 / 8) * 0.86;
    const tube = (i * 0.618) % 1 * Math.PI * 2;
    const R = 2.4, r = 0.45 * Math.sqrt(((i * 13) % 7) / 6 + 0.15);
    return [(R + Math.cos(tube) * r) * Math.cos(a), (R + Math.cos(tube) * r) * Math.sin(a), Math.sin(tube) * r, seg < 4 ? C.ready : C.gap];
  }),

  // One slab per category. Ready slabs are packed; open gaps are loose.
  table: formation((i) => {
    const row = i % 8;
    const j = Math.floor(i / 8), n = N / 8;
    const ready = row < 4;
    let x = -2.4 + (j % 35) * 0.14, y = 2.45 - row * 0.7, z = (Math.floor(j / 35) - 2) * 0.12;
    if (!ready) { x += (rnd() - 0.5) * 0.5; y += (rnd() - 0.5) * 0.35; z += (rnd() - 0.5) * 1.2; }
    return [x, y, z, ready ? C.ready : C.gap];
  }),

  // Acquisition prices to scale: CyberArk 25, Waze ~1, Moovit 0.9, Viber 0.9.
  bars: (() => {
    const vals = [25, 1, 0.9, 0.9];
    const cols = [C.gap, C.ready, C.ready, C.gap];
    const pick = splitter(vals);
    const full = 5.4; // height of the 25 bar
    return formation((i) => {
      const [k, j, n] = pick(i);
      const h = (vals[k] / 25) * full;
      const w = 0.6;
      const per = Math.max(1, Math.round(n / Math.max(1, Math.round(h / 0.1))));
      const layer = Math.floor(j / per);
      const layers = Math.ceil(n / per);
      const u = (j % per) / per;
      return [
        -2.4 + k * 1.6 + (u - 0.5) * w + (rnd() - 0.5) * 0.08,
        -2.7 + (layer / layers) * h,
        ((j * 0.37) % 1 - 0.5) * w,
        cols[k],
      ];
    });
  })(),

  // Three strands for the three asks, rising together.
  ask: formation((i) => {
    const s = i % 3;
    const t = Math.floor(i / 3) / (N / 3);
    const a = t * Math.PI * 6 + (s * Math.PI * 2) / 3;
    const r = 0.9 + 0.25 * Math.sin(t * 20);
    return [Math.cos(a) * r, -3 + t * 6, Math.sin(a) * r, [C.ready, C.gap, C.ink][s]];
  }),

  // Loose field behind the notes.
  field: formation(() => [(rnd() - 0.5) * 14, (rnd() - 0.5) * 9, (rnd() - 0.5) * 8, C.dim]),
};

// Scroll position -> which two shapes to blend, and how far.
const sections = [...document.querySelectorAll("[data-scene]")];
function scrollState() {
  const mid = scrollY + innerHeight * 0.5;
  // A shape is fully formed when its section's top reaches the top of the screen (or its middle, if shorter).
  const centers = sections.map((s) => s.offsetTop + Math.min(s.offsetHeight, innerHeight) * 0.5);
  if (mid <= centers[0]) return [0, 0, 0];
  for (let k = 0; k < centers.length - 1; k++) {
    if (mid < centers[k + 1]) {
      const f = (mid - centers[k]) / (centers[k + 1] - centers[k]);
      return [k, k + 1, f];
    }
  }
  return [centers.length - 1, centers.length - 1, 0];
}
const shapeOf = (k) => shapes[sections[k].dataset.scene];

const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

const m = new THREE.Matrix4();
const q = new THREE.Quaternion();
const e = new THREE.Euler();
const p = new THREE.Vector3();
const one = new THREE.Vector3(1, 1, 1);
const c = new THREE.Color();
const mouse = { x: 0, y: 0 };
addEventListener("pointermove", (ev) => {
  mouse.x = ev.clientX / innerWidth - 0.5;
  mouse.y = ev.clientY / innerHeight - 0.5;
});

// Where the shape sits: beside the text on wide screens, above it on phones.
let offsetX = 0, offsetY = 0, wide = true;
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  wide = w > 900;
  camera.position.z = wide ? 11 : 13.5;
  const halfH = Math.tan(THREE.MathUtils.degToRad(20)) * camera.position.z;
  offsetX = wide ? 0.44 * halfH * camera.aspect : 0;
  offsetY = wide ? 0 : 0.55 * halfH;
  group.scale.setScalar(wide ? 0.82 : 0.62);
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
resize();

const clock = new THREE.Clock();
function frame() {
  const t = reduced ? 0 : clock.getElapsedTime();
  const [a, b, f] = scrollState();
  const A = shapeOf(a), B = shapeOf(b);

  for (let i = 0; i < N; i++) {
    // Each cube leaves a little earlier or later, so shapes dissolve instead of sliding.
    const k = smooth(0.2 + delay[i] * 0.35, 0.45 + delay[i] * 0.35, f);
    const i3 = i * 3;
    p.set(
      A.pos[i3] + (B.pos[i3] - A.pos[i3]) * k,
      A.pos[i3 + 1] + (B.pos[i3 + 1] - A.pos[i3 + 1]) * k,
      A.pos[i3 + 2] + (B.pos[i3 + 2] - A.pos[i3 + 2]) * k
    );
    // Lift cubes mid-flight for a bit of depth.
    p.z += Math.sin(k * Math.PI) * (delay[i] - 0.5) * 3;
    if (!reduced) p.y += Math.sin(t * 1.2 + spin[i]) * 0.02;
    e.set(spin[i] + t * 0.3, spin[i] * 0.5 + t * 0.2, 0);
    q.setFromEuler(e);
    m.compose(p, q, one);
    mesh.setMatrixAt(i, m);
    c.copy(A.col[i]).lerp(B.col[i], k);
    mesh.setColorAt(i, c);
  }
  mesh.instanceMatrix.needsUpdate = true;
  mesh.instanceColor.needsUpdate = true;

  const name = sections[f < 0.5 ? a : b].dataset.scene;
  const turn = name === "coin" || name === "donut" || name === "ask";
  const targetY = (turn && !reduced ? Math.sin(t * 0.35) * 0.6 : -0.25) + mouse.x * 0.4;
  const targetX = (name === "donut" ? -0.5 : 0.08) + mouse.y * 0.25;
  group.rotation.y += (targetY - group.rotation.y) * 0.05;
  group.rotation.x += (targetX - group.rotation.x) * 0.05;
  group.position.x += (offsetX - group.position.x) * 0.08;
  group.position.y += (offsetY - group.position.y) * 0.08;

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();
document.documentElement.classList.add("has-scene");
