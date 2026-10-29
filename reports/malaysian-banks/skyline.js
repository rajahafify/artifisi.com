// The twelve as a skyline. Each tower is a bank and its height is its assets, so the
// three that hold 62% stand over the rest. The scene fills the whole 62% section and the
// reader's scroll moves through it: the towers rise as the section comes in, the top
// three turn orange as the figure lands, and the camera drifts along the street.
// With no GSAP or with reduced motion it stands at its finished frame.
import * as THREE from "three";

const section = document.querySelector("#concentration");
const canvas = section && section.querySelector("canvas.skyline");

const ORANGE = 0xff7a1f, TOWER = 0x1b2a33, EDGE_DARK = 0x40525e, EDGE_HOT = 0xffb37a, INK = 0x050f16;
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;

// Floors: a white texture with darker bands, multiplied by each tower's colour.
function floorTexture() {
  const c = document.createElement("canvas");
  c.width = 64; c.height = 64;
  const x = c.getContext("2d");
  x.fillStyle = "#ffffff"; x.fillRect(0, 0, 64, 64);
  x.fillStyle = "#c9c9c9"; x.fillRect(0, 40, 64, 10);
  x.fillStyle = "#e4e4e4"; for (let i = 6; i < 64; i += 14) x.fillRect(i, 0, 3, 64);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

async function build() {
  const D = await fetch("./data.json").then((r) => r.json());
  const banks = D.banks.slice().sort((a, b) => b.assets - a.assets);
  const total = D.totals.assets;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 500);
  const tex = floorTexture();

  const W = 2.2, GAP = 0.5, DEPTH = 2.2, HMAX = 24;
  const span = banks.length * W + (banks.length - 1) * GAP;
  const towers = banks.map((b, i) => {
    const h = (b.assets / banks[0].assets) * HMAX;
    const x = -span / 2 + W / 2 + i * (W + GAP);
    const z = (i % 3 === 1 ? -0.9 : 0) + (i % 4 === 3 ? 0.6 : 0);
    const map = tex.clone(); map.needsUpdate = true; map.repeat.set(1, Math.max(1, h * 1.4));
    const mat = new THREE.MeshBasicMaterial({ color: TOWER, map });
    const geo = new THREE.BoxGeometry(W, 1, DEPTH);
    geo.translate(0, 0.5, 0);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, 0, z);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: EDGE_DARK }));
    mesh.add(edges);
    scene.add(mesh);
    return { b, h, x, z, mesh, mat, edges, top: i < 3 };
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(span * 3, 40), new THREE.MeshBasicMaterial({ color: INK }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.001;
  scene.add(ground);
  const street = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-span, 0, 1.6), new THREE.Vector3(span, 0, 1.6)]),
    new THREE.LineBasicMaterial({ color: EDGE_DARK })
  );
  scene.add(street);

  // Labels for the three that matter, written in the page so the numbers are text.
  const layer = section.querySelector(".skyline-labels");
  const labels = towers.filter((t) => t.top).map((t) => {
    const el = document.createElement("span");
    el.className = "sky-label";
    el.innerHTML = "<b>" + t.b.short + "</b> " + ((t.b.assets / total) * 100).toFixed(1) + "%";
    layer.appendChild(el);
    return { t, el };
  });

  let w = 1, h = 1, p = 1, printing = false;
  function resize() {
    const r = canvas.getBoundingClientRect();
    w = Math.max(1, r.width); h = Math.max(1, r.height);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    draw();
  }

  const hot = new THREE.Color(ORANGE), cold = new THREE.Color(TOWER);
  const v = new THREE.Vector3();
  // p runs 0 to 1 as the section crosses the screen.
  function draw() {
    const rise = smooth(seg(p, 0.0, 0.45));
    const heat = smooth(seg(p, 0.35, 0.6));
    towers.forEach((t, i) => {
      const own = smooth(seg(rise, i * 0.03, 0.55 + i * 0.03));
      t.mesh.scale.y = Math.max(0.001, t.h * own);
      if (t.top) {
        t.mat.color.copy(cold).lerp(hot, heat);
        t.edges.material.color.set(heat > 0.5 ? EDGE_HOT : EDGE_DARK);
      }
    });
    // On a wide screen the street fills the left of the section, up to the axis the words
    // hang on; on a phone it fills the band under the words.
    // In print the skyline has its own frame under the words, so it takes the full width.
    const portrait = w / h < 1.2 || printing;
    const frac = portrait ? 0.94 : 0.4;   // share of the width the street may take
    const centre = portrait ? 0.5 : 0.22; // where its middle sits, as a share of the width
    const tanV = Math.tan((camera.fov * Math.PI) / 360);
    const tanH = tanV * camera.aspect;
    const dW = span / 2 / (tanH * frac);
    const dH = (HMAX * 1.12) / 2 / (tanV * (portrait ? 0.9 : 0.78));
    const d = Math.max(dW, dH);
    camera.setViewOffset(w, h, (0.5 - centre) * w, 0, w, h);
    // The camera starts low in the street looking up, and rises and swings as you scroll.
    const ang = lerp(0.32, -0.18, p);
    const lift = lerp(0.08, 0.55, p);
    camera.position.set(Math.sin(ang) * d, HMAX * lift, Math.cos(ang) * d);
    camera.lookAt(0, HMAX * lerp(0.56, 0.5, p), 0);
    renderer.render(scene, camera);
    labels.forEach(({ t, el }) => {
      v.set(t.x + W / 2 + 0.25, t.mesh.scale.y - 0.6, t.z).project(camera);
      const show = heat > 0.5 && v.z < 1;
      el.style.opacity = show ? "1" : "0";
      el.style.visibility = show ? "visible" : "hidden";
      el.style.transform = "translate(" + ((v.x * 0.5 + 0.5) * w).toFixed(1) + "px," + ((-v.y * 0.5 + 0.5) * h).toFixed(1) + "px) translate(0,-50%)";
    });
  }

  new ResizeObserver(resize).observe(canvas);
  resize();
  section.classList.add("has-skyline");

  // For the film and the PDF: seek the skyline to any point, as __seek does for the charts.
  const seek = (t) => { p = clamp01(t); draw(); };
  window.__seekExtra = Object.assign(window.__seekExtra || {}, { skyline: seek });
  // The PDF draws the skyline at the print frame's own size (see @media print).
  addEventListener("beforeprint", () => {
    printing = true; w = 700; h = 520;
    renderer.setPixelRatio(2);
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    seek(1);
  });
  addEventListener("afterprint", () => { printing = false; resize(); });

  // ?shot=skyline&t=<t>: the section alone, full frame, frozen at t.
  const q = new URLSearchParams(location.search);
  if (q.get("shot") === "skyline") {
    document.body.classList.add("shot-mode", "shot-sky");
    section.classList.add("on");
    requestAnimationFrame(() => { resize(); seek(q.has("t") ? parseFloat(q.get("t")) : 1); });
    return;
  }

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const G = window.gsap;
  if (G && window.ScrollTrigger && !reduced) {
    G.registerPlugin(ScrollTrigger);
    p = 0; draw();
    ScrollTrigger.create({
      trigger: section, start: "top 85%", end: "bottom top", scrub: 0.6,
      onUpdate: (self) => { p = self.progress; draw(); },
    });
  }
}

if (canvas) {
  // Wait for the deferred GSAP scripts, which run before DOMContentLoaded fires.
  const go = () => build().catch((e) => console.error("skyline failed:", e));
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
  else go();
}
