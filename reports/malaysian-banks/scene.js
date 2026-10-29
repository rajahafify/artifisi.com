// Six banking mechanisms, drawn as line art.
// Every scene is f(t) so the page can play it on scroll and the video can seek it exactly.
import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";

// The palette is the page's: hot orange ground, blue-black ink, white fields. The charts
// sit on a white field, so ink marks what does well on a measure and orange marks what
// does not, or the bank next door.
const C = {
  paper: 0xffffff, paper2: 0xf3f1ee, ink: 0x050f16, ctx: 0x9a9a9a,
  gold: 0x050f16, stamp: 0xff7a1f, rule: 0xd9d6d1, shade: 0xebe8e4,
};

const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- the timeline ----------
// On the page a scene plays in one second. In the film it plays over the length of its
// voice line, and the moment the voice names a number is the moment that number
// appears. The words come from ?words=<json>, which the recorder fills in from the
// voice track's own timings.
//
// Every cue carries the fraction the scene has always used. With no words the page gets
// that fraction, so the page plays exactly as it always has; with words the film gets the
// moment the voice says it. The page and the film run the same code and only the clock
// differs.
const QUERY = new URLSearchParams(location.search);

const key = (s) => s.toLowerCase().replace(/[^a-z0-9']+/g, "");

function makeTimeline(words, dur) {
  const t = { words: words || [], dur: dur || 0, hits: [], misses: [] };
  // Find a phrase in the words. The phrase is written the way it is spoken, and the
  // words are the ones the voice said, so the two meet on the letters that carry sound.
  const find = (phrase) => {
    const want = key(phrase);
    if (!want) return null;
    for (let i = 0; i < t.words.length; i++) {
      let got = "";
      let n = 0;
      for (let j = i; j < t.words.length; j++) {
        got += key(t.words[j][0]);
        n++;
        if (got.length >= want.length) break;
      }
      if (got === want) return { i, n };
    }
    return null;
  };
  // at: the moment the phrase is said. end: the moment it is finished. seconds: the
  // same moment, in seconds from the start of the line, for the parts of a film that
  // are timed in seconds and not in fractions of a chart.
  const at = (phrase, fallback) => {
    const hit = find(phrase);
    if (!hit) { t.misses.push(phrase); return fallback; }
    t.hits.push(phrase);
    return t.dur ? Math.min(1, t.words[hit.i][1] / t.dur) : fallback;
  };
  const end = (phrase, fallback) => {
    const hit = find(phrase);
    if (!hit) { t.misses.push(phrase); return fallback; }
    t.hits.push(phrase);
    const last = t.words[hit.i + hit.n - 1];
    return t.dur ? Math.min(1, last[2] / t.dur) : fallback;
  };
  const seconds = (phrase, fallback) => {
    const hit = find(phrase);
    if (!hit) { t.misses.push(phrase); return fallback; }
    t.hits.push(phrase);
    return t.words[hit.i][1];
  };
  t.at = at;
  t.end = end;
  t.seconds = seconds;
  return t;
}

let WORDS = null;
if (QUERY.has("words")) {
  try { WORDS = JSON.parse(QUERY.get("words")); } catch (e) { WORDS = null; }
}
const T = makeTimeline(WORDS && WORDS.words, WORDS && WORDS.dur);
window.__timeline = T;

// The display face, used for the type that hangs behind a chart.
const DISPLAY_FONT = '"Young Serif", Georgia, serif';

// Draw a line of type into a texture. The texture goes on a plane in the scene, so the
// type is a thing in the same space as the chart: it takes the chart's perspective and
// the chart's geometry stands in front of it.
function textTexture(text, opts) {
  const px = opts.px || 320;
  const family = opts.family || DISPLAY_FONT;
  const weight = opts.weight || 400;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  const setFont = () => { ctx.font = weight + " " + px + "px " + family; };
  setFont();
  const w = Math.max(2, Math.ceil(ctx.measureText(text).width) + Math.round(px * 0.1));
  const h = Math.ceil(px * 1.18);
  c.width = w; c.height = h;
  setFont();
  ctx.fillStyle = opts.color || "#050f16";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { tex, aspect: w / h };
}

// ---------- stage ----------
class Stage {
  constructor(canvas, wrap, spec, data) {
    this.canvas = canvas; this.wrap = wrap; this.spec = spec; this.data = data;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.localClippingEnabled = true;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 400);
    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.mats = [];
    this.labels = [];
    this.t = 0;
    this.playing = false;
    this.done = false;
    this.aspect = 1;
    this.w = 1; this.h = 1;

    this.body = spec.build(this);
    this.resize();
    // The browser drops a WebGL context when a page holds more than a few. When
    // it comes back the scene has to be redrawn or the frame is blank.
    this.renderer.domElement.addEventListener("webglcontextrestored", () => this.draw());
    // Open at the top of the shot: the chart stands in its starting state
    // until the reader asks for it, and the first click runs it forward.
    this.t = 0;
    this.done = false;
    this.draw();

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(wrap);
  }

  // fat line in CSS pixels
  line(points, color, px = 1.5, opts = {}) {
    const g = new LineGeometry();
    const arr = [];
    points.forEach((p) => arr.push(p.x, p.y, p.z));
    g.setPositions(arr);
    const m = new LineMaterial({
      color, linewidth: Math.max(1, px), transparent: opts.opacity != null,
      opacity: opts.opacity == null ? 1 : opts.opacity, dashed: !!opts.dash,
      dashSize: opts.dash ? 0.09 : 1, gapSize: opts.dash ? 0.07 : 0,
    });
    if (opts.dash) m.defines.USE_DASH = "";
    const l = new Line2(g, m);
    l.computeLineDistances();
    l.frustumCulled = false;
    this.mats.push(m);
    this.root.add(l);
    return l;
  }

  loop(points, color, px = 1.5, opts = {}) {
    const pts = points.concat([points[0]]);
    return this.line(pts, color, px, opts);
  }

  box(w, h, d, color, px = 1.5, opts = {}) {
    const g = new THREE.Group();
    const x = w / 2, y = h / 2, z = d / 2;
    const p = [
      [-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z],
      [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z],
    ].map((a) => V(a[0], a[1], a[2]));
    const e = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    e.forEach(([a, b]) => g.add(this.line([p[a], p[b]], color, px, opts)));
    this.root.add(g);
    return g;
  }

  quad(points, color, opacity = 1) {
    const g = new THREE.BufferGeometry();
    const arr = [];
    points.forEach((p) => arr.push(p.x, p.y, p.z));
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    g.setIndex([0, 1, 2, 0, 2, 3]);
    g.computeVertexNormals();
    const m = new THREE.MeshBasicMaterial({
      color, transparent: opacity < 1, opacity, side: THREE.DoubleSide,
      clippingPlanes: this.clip || [],
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.frustumCulled = false;
    this.root.add(mesh);
    return mesh;
  }

  extent(a, b) {
    const l = this.line([a, b], 0x000000, 1, { opacity: 0 });
    l.renderOrder = -1;
    return l;
  }

  // anchor: l ends at the point and runs left, r starts at it and runs right,
  // t sits above it, b sits below it, c is centred on it.
  label(text, cls = "", anchor = "c") {
    const el = document.createElement("div");
    el.className = "scene-label " + cls;
    el.textContent = text;
    this.wrap.appendChild(el);
    const o = { el, at: V(0, 0, 0), vis: true, anchor };
    this.labels.push(o);
    return o;
  }

  place(o, v3, visible = true) {
    o.at.copy(v3);
    o.vis = visible;
  }

  fit(dir, pad = 1.12, target = null) {
    this.fitArgs = [dir, pad, target];
    // The compose transform shrinks the chart after the framing is worked out, so the
    // frame is measured with the chart at full size and the shrink is applied after.
    this.applyCompose(false);
    const box = new THREE.Box3().setFromObject(this.root);
    if (box.isEmpty()) { this.applyCompose(); return; }
    const center = target || box.getCenter(V(0, 0, 0));
    const size = box.getSize(V(0, 0, 0));
    const d = dir.clone().normalize();
    const up = V(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(up, d).normalize();
    const camUp = new THREE.Vector3().crossVectors(d, right).normalize();
    const hw = Math.abs(size.x * right.x) + Math.abs(size.y * right.y) + Math.abs(size.z * right.z);
    const hh = Math.abs(size.x * camUp.x) + Math.abs(size.y * camUp.y) + Math.abs(size.z * camUp.z);
    const vFov = (this.camera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * this.camera.aspect);
    const dist = Math.max(hh / 2 / Math.tan(vFov / 2), hw / 2 / Math.tan(hFov / 2)) * pad;
    this.camera.position.copy(center).addScaledVector(d, dist);
    this.camera.lookAt(center);
    this.camera.updateProjectionMatrix();
    this.center = center;
    this.fitCenter = center.clone();
    this.fitRadius = dist;
    this.applyCompose();
    this.placeBackdrop();
  }

  // Shrink the chart and move it, so the type behind it has somewhere to be. The
  // shrink is about the centre of the framing, not the origin, so the chart stays
  // where it was composed and only gets smaller.
  compose(opts = {}) {
    this.composeOpts = Object.assign({}, this.composeOpts, opts);
    this.applyCompose();
    return this;
  }

  applyCompose(on = true) {
    const o = this.composeOpts;
    if (!o) return;
    if (!on) {
      this.root.scale.setScalar(1);
      this.root.position.set(0, 0, 0);
      return;
    }
    const s = o.scale != null ? o.scale : 1;
    const c = this.fitCenter || V(0, 0, 0);
    this.root.scale.setScalar(s);
    this.root.position.copy(c).sub(c.clone().multiplyScalar(s));
    if (o.offset) this.root.position.add(o.offset);
  }

  // Hang a line of display type behind the chart, in depth. It is a plane in the
  // scene, not a label on top of it, so the chart stands in front of the type and the
  // two share one perspective.
  backdrop(text, opts = {}) {
    this.backdropOpts = Object.assign({ text }, opts);
    this.buildBackdrop();
    // The display face may not have arrived when the first texture was drawn, so the
    // texture is drawn again once the font is in. The repaint does not register
    // another font request, or the two would chase each other.
    const o = this.backdropOpts;
    const family = o.family || DISPLAY_FONT;
    const weight = o.weight || 400;
    const px = o.px || 320;
    if (document.fonts && document.fonts.load) {
      document.fonts.load(weight + " " + px + "px " + family)
        .then(() => { this.paintBackdrop(); this.draw(); })
        .catch(() => {});
    }
    return this;
  }

  buildBackdrop() {
    const o = this.backdropOpts;
    if (!o) return;
    if (!this.backdropMesh) {
      const mat = new THREE.MeshBasicMaterial({
        transparent: true, depthWrite: false, depthTest: false,
      });
      this.backdropMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
      this.backdropMesh.renderOrder = -10;
      this.scene.add(this.backdropMesh);
    }
    this.backdropMesh.material.opacity = o.opacity != null ? o.opacity : 1;
    this.paintBackdrop();
  }

  paintBackdrop() {
    const o = this.backdropOpts;
    if (!o || !this.backdropMesh) return;
    const t = textTexture(o.text, o);
    if (this.backdropMesh.material.map) this.backdropMesh.material.map.dispose();
    this.backdropMesh.material.map = t.tex;
    this.backdropMesh.material.needsUpdate = true;
    this.backdropAspect = t.aspect;
    this.placeBackdrop();
  }

  placeBackdrop() {
    const m = this.backdropMesh;
    if (!m || !this.fitCenter) return;
    const o = this.backdropOpts;
    const back = o.back != null ? o.back : 2.6;
    const dist = this.fitRadius + back;
    const vFov = (this.camera.fov * Math.PI) / 180;
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * this.camera.aspect);
    const frameH = 2 * Math.tan(vFov / 2) * dist;
    const frameW = 2 * Math.tan(hFov / 2) * dist;
    // cover is the share of the frame width the type spans. h is the alternative, the
    // world height of the type. Either way the plane keeps the texture's proportions.
    let h, w;
    if (o.cover) { w = frameW * o.cover; h = w / this.backdropAspect; }
    else { h = o.h != null ? o.h : frameH * 0.85; w = h * this.backdropAspect; }
    m.scale.set(w, h, 1);
    const d = this.camera.position.clone().sub(this.fitCenter).normalize();
    m.position.copy(this.fitCenter).addScaledVector(d, -back);
    if (o.at) m.position.add(o.at);
    m.lookAt(this.camera.position);
  }

  resize() {
    const r = this.wrap.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width));
    const h = Math.max(1, Math.round(r.height));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = w; this.h = h;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.mats.forEach((m) => m.resolution.set(w * dpr, h * dpr));
    this.wrap.style.setProperty("--ls", Math.round(Math.max(11, Math.min(22, w / 40))) + "px");
    if (this.fitArgs) this.fit.apply(this, this.fitArgs);
    if (this.body.resize) this.body.resize(w, h);
    this.draw();
  }

  play() {
    if (this.spec.reduced) return;
    if (this.tw) this.tw.kill();
    this.playing = true;
    this.done = false;
    this.t = 0;
    this.start = performance.now();
    const tok = (this.run = (this.run || 0) + 1);
    if (this.onstate) this.onstate("playing");
    const step = (now) => {
      if (tok !== this.run) return;
      const t = clamp01((now - this.start) / this.spec.duration);
      this.t = t;
      this.draw();
      if (t >= 1) {
        this.playing = false;
        this.done = true;
        if (this.onstate) this.onstate("done");
        return;
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  seek(t) {
    this.t = clamp01(t);
    this.draw();
  }

  // Run the shot to a given point, from wherever it is. A control on the page uses this
  // to show one state of the chart (assets, then profit). It cancels a running play().
  to(t, ms = 900) {
    this.run = (this.run || 0) + 1;
    if (this.onstate) this.onstate("done");
    if (this.tw) this.tw.kill();
    const g = window.gsap;
    if (!g || this.spec.reduced) { this.seek(t); return; }
    this.tw = g.to(this, { t: clamp01(t), duration: ms / 1000, ease: "expo.out", onUpdate: () => this.draw() });
  }

  draw() {
    this.body.update(this.t);
    this.renderer.render(this.scene, this.camera);
    const W = this.w, H = this.h;
    const ANCH = { l: "-100%,-50%", r: "0,-50%", t: "-50%,-100%", b: "-50%,0%", c: "-50%,-50%" };
    this.labels.forEach((o) => {
      if (!o.vis) { o.el.style.opacity = "0"; return; }
      const p = o.at.clone().project(this.camera);
      if (p.z > 1) { o.el.style.opacity = "0"; return; }
      const x = (p.x * 0.5 + 0.5) * W;
      const y = (-p.y * 0.5 + 0.5) * H;
      o.el.style.opacity = "1";
      o.el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) translate(" + (ANCH[o.anchor] || ANCH.c) + ")";
    });
  }
}

// ---------- helpers ----------
// A horizontal bar in the XY plane whose right edge can move without rebuilding geometry.
function hbar(stage, y, h, color, px) {
  const g = new THREE.Group();
  g.add(stage.line([V(-0.5, -0.5, 0), V(0.5, -0.5, 0)], color, px));
  g.add(stage.line([V(-0.5, 0.5, 0), V(0.5, 0.5, 0)], color, px));
  g.add(stage.line([V(0.5, -0.5, 0), V(0.5, 0.5, 0)], color, px));
  stage.root.add(g);
  g.position.y = y;
  return {
    group: g,
    set(x0, x1) {
      const w = Math.max(0.0001, x1 - x0);
      g.scale.set(w, h, 1);
      g.position.x = x0 + w / 2;
    },
  };
}

// A ring of line segments on the XZ plane.
function ring(stage, y, r, color, px, opts = {}, segs = 28, from = 0, to = Math.PI * 2) {
  const pts = [];
  for (let i = 0; i <= segs; i++) {
    const a = from + (to - from) * (i / segs);
    pts.push(V(Math.cos(a) * r, y, Math.sin(a) * r));
  }
  return stage.line(pts, color, px, opts);
}


// An arc of line segments in the XY plane, facing the camera. The segments are drawn
// in order, so showing the first n of them draws the arc forward without rebuilding it.
function arc(stage, cx, cy, r, color, px, segs = 64, from = Math.PI / 2, sweep = -Math.PI * 2) {
  const pts = [];
  for (let i = 0; i <= segs; i++) {
    const a = from + sweep * (i / segs);
    pts.push(V(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0));
  }
  const l = stage.line(pts, color, px);
  l.segs = segs;
  l.show = (f) => { l.geometry.instanceCount = Math.max(0, Math.round(segs * clamp01(f))); l.visible = f > 0.001; };
  return l;
}

const fmtPct = (v) => v.toFixed(1) + "%";

// Dim or restore a line or mesh. Transparency is switched on once, the first time.
function dim(obj, on, low = 0.16) {
  const m = obj.material;
  if (!m.transparent) { m.transparent = true; m.needsUpdate = true; }
  m.opacity = on ? low : 1;
}
const bySize = (D) => D.banks.slice().sort((a, b) => b.assets - a.assets);

// ---------- 2. the swap ----------
// Each bar starts as the bank's share of the twelve banks' assets, then changes to its
// share of their profit. The bars that grow earn more than their size. The ghost stays
// at the asset share so the change can be read.
function sceneSwap(stage, D) {
  const banks = bySize(D);
  const ta = D.totals.assets, tp = D.totals.profit;
  const ROW = 0.62, XMAX = 6.0, SMAX = 28;
  const xOf = (pct) => (pct / SMAX) * XMAX;
  const rows = banks.map((b, i) => {
    const a = (b.assets / ta) * 100, p = (b.profit / tp) * 100;
    const y = (banks.length - 1 - i) * ROW;
    const up = p - a > 0.5, down = a - p > 0.5;
    const color = up ? C.gold : down ? C.stamp : C.ctx;
    const ghost = stage.line([V(xOf(a), y - 0.2, 0.01), V(xOf(a), y + 0.2, 0.01)], C.ctx, 1.4, { opacity: 0.9 });
    const bar = hbar(stage, y, 0.4, C.ink, 1.6);
    const fill = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.0 }));
    stage.root.add(fill);
    const nm = stage.label(b.short, up ? "small" : "small dim", "l");
    const val = stage.label("", "small", "r");
    return { b, a, p, y, up, down, color, ghost, bar, fill, nm, val };
  });
  stage.line([V(0, -0.4, 0), V(0, (banks.length - 1) * ROW + 0.4, 0)], C.ink, 2);
  const lHead = stage.label("Share of assets", "dim", "r");

  stage.extent(V(-2.3, -0.6, 0), V(XMAX + 1.9, (banks.length - 1) * ROW + 1.1, 0));
  stage.fit(V(0.0, 0.0, 1), 1.03);
  stage.backdrop("18.5%", { cover: 0.88, back: 3, opacity: 0.08, color: "#050f16", at: V(0.6, -0.4, 0) });

  return {
    update(t) {
      const a = smooth(seg(t, 0.0, 0.38));
      const b = smooth(seg(t, 0.5, 0.9));
      rows.forEach((r) => {
        const w = lerp(xOf(r.a) * a, xOf(r.p), b);
        r.bar.set(0, Math.max(0.0001, w));
        r.bar.group.children.forEach((l) => l.material.color.setHex(b > 0.02 ? r.color : C.ink));
        r.fill.scale.set(Math.max(0.0001, w), 0.4, 1);
        r.fill.position.set(w / 2, r.y, -0.01);
        r.fill.material.opacity = 0.32 * b;
        r.ghost.visible = b > 0.02;
        stage.place(r.nm, V(-0.15, r.y, 0), a > 0.05);
        const shown = b > 0.5 ? fmtPct(r.p) : fmtPct(r.a);
        r.val.el.textContent = b > 0.5 && (r.up || r.down) ? fmtPct(r.a) + " → " + fmtPct(r.p) : shown;
        r.val.el.className = "scene-label small " + (b > 0.5 ? (r.up ? "gold" : r.down ? "stamp" : "dim") : "dim");
        stage.place(r.val, V(Math.max(w, xOf(r.a) * a) + 0.15, r.y, 0), a > 0.9);
      });
      lHead.el.textContent = b > 0.5 ? "Share of profit" : "Share of assets";
      stage.place(lHead, V(0.05, (banks.length - 1) * ROW + 0.72, 0), a > 0.05);
    },
  };
}

// ---------- 3. the blocks ----------
// Each bank is a block, highest return first. Its footprint is its assets and its
// height is its return on equity. The plane is a return on equity the reader can move;
// it opens at 7.5%, where five blocks never reach it. Blocks under the plane are orange.
function sceneBlocks(stage, D) {
  const banks = D.banks.slice().sort((a, b) => b.roe - a.roe || b.assets - a.assets);
  const GAP = 0.34, HK = 0.5;
  let line = 7.5;
  let x = 0;
  const blocks = banks.map((b) => {
    const s = 0.34 + Math.sqrt(b.assets / D.banks[0].assets) * 1.2;
    const cx = x + s / 2;
    x += s + GAP;
    return { b, s, cx, h: b.roe * HK };
  });
  const span = x - GAP;
  blocks.forEach((k) => { k.cx -= span / 2; });

  blocks.forEach((k) => {
    const g = new THREE.Group();
    g.position.set(k.cx, 0, 0);
    const hw = k.s / 2;
    const bot = [[-hw, -hw], [hw, -hw], [hw, hw], [-hw, hw]];
    k.body = new THREE.Mesh(
      new THREE.BoxGeometry(k.s - 0.01, k.h, k.s - 0.01),
      new THREE.MeshBasicMaterial({ color: C.paper })
    );
    k.body.position.y = k.h / 2;
    g.add(k.body);
    bot.forEach(([px, pz]) => g.add(stage.line([V(px, 0, pz), V(px, k.h, pz)], C.ink, 1.4)));
    g.add(stage.loop(bot.map(([px, pz]) => V(px, k.h, pz)), C.ink, 1.8));
    g.add(stage.loop(bot.map(([px, pz]) => V(px, 0, pz)), C.ink, 1.4));
    stage.root.add(g);
    k.g = g;
    // The value rides with the name on the tilted label. Twelve values in a row on top
    // of the blocks collide on a phone.
    k.nm = stage.label("", "small tilt", "l");
    k.nm.el.innerHTML = "<span>" + k.b.short + " " + fmtPct(k.b.roe) + "</span>";
  });

  // the plane, built at height zero and moved up to the line
  const ex = span / 2 + 0.5, ez = 1.4;
  const plane = stage.quad([V(-ex, 0, -ez), V(ex, 0, -ez), V(ex, 0, ez), V(-ex, 0, ez)], C.stamp, 0.18);
  const edge = stage.line([V(-ex, 0, ez), V(ex, 0, ez)], C.stamp, 2.4);
  const lLine = stage.label("", "stamp", "r");
  stage.line([V(-ex, 0, ez), V(ex, 0, ez)], C.ink, 1.6);

  stage.extent(V(-span / 2 - 3.1, -3.6, 0), V(span / 2 + 3.0, 12.3 * HK + 0.4, 0));
  stage.fit(V(0.28, 0.26, 1), 1.02);
  stage.backdrop("5 of 12", { cover: 0.84, back: 4, opacity: 0.08, color: "#050f16", at: V(0, 0.6, 0) });

  // Colour the blocks against the line and say how many stay under it.
  const under = () => blocks.filter((k) => k.b.roe < line).length;
  function paint() {
    blocks.forEach((k) => {
      const low = k.b.roe < line;
      k.body.material.color.setHex(low ? C.stamp : C.paper);
      k.nm.el.className = "scene-label small tilt " + (low ? "stamp" : "dim");
    });
    lLine.el.textContent = fmtPct(line);
    if (stage.backdropOpts) {
      const n = under();
      const text = n + " of 12";
      if (stage.backdropOpts.text !== text) { stage.backdropOpts.text = text; stage.paintBackdrop(); }
    }
  }
  paint();

  return {
    update(t) {
      blocks.forEach((k, i) => {
        const f = smooth(seg(t, 0.04 + i * 0.03, 0.5 + i * 0.03));
        k.g.scale.y = Math.max(0.001, f);
        stage.place(k.nm, V(k.cx + 0.12, -0.42, k.s / 2), true);
      });
      const yL = line * HK;
      const p = smooth(seg(t, 0.55, 0.8));
      plane.position.y = yL; edge.position.y = yL;
      plane.material.opacity = 0.18 * p;
      edge.visible = p > 0.02;
      stage.place(lLine, V(ex + 0.08, yL, ez), p > 0.5);
    },
    // The page's slider calls this. It returns how many banks are under the line.
    setLine(v) { line = v; paint(); stage.draw(); return under(); },
  };
}

// ---------- 4. the dials ----------
// Each ring is a ringgit of income. The dark arc is what the bank spends to earn it,
// its cost-to-income ratio. The rings are in order, leanest first.
function sceneDials(stage, D) {
  const banks = D.banks.slice().sort((a, b) => a.cir - b.cir);
  const COLS = 3, SX = 2.3, SY = 2.55, R = 0.78;
  const rows = Math.ceil(banks.length / COLS);
  const dials = banks.map((b, i) => {
    const c = i % COLS, r = Math.floor(i / COLS);
    const x = (c - (COLS - 1) / 2) * SX;
    const y = ((rows - 1) / 2 - r) * SY;
    const lean = b.cir < 40, heavy = b.cir > 60;
    const color = lean ? C.gold : heavy ? C.stamp : C.ctx;
    arc(stage, x, y, R, C.rule, 5).show(1);
    const cost = arc(stage, x, y, R, color, 5.5);
    const val = stage.label("", "big " + (lean ? "gold" : heavy ? "stamp" : ""), "c");
    const nm = stage.label(b.short, "small dim", "b");
    return { b, x, y, cost, val, nm, i };
  });

  stage.extent(V(-(COLS / 2) * SX, -(rows / 2) * SY - 0.9, 0), V((COLS / 2) * SX, (rows / 2) * SY, 0));
  stage.fit(V(0, 0, 1), 1.02);
  stage.backdrop("30 sen", { cover: 0.92, back: 3, opacity: 0.07, color: "#050f16" });

  return {
    // The page's choice calls this with a test on each bank. Rings that fail it fade.
    highlight(test) {
      dials.forEach((d) => {
        const off = test ? !test(d.b) : false;
        dim(d.cost, off);
        d.val.el.style.visibility = off ? "hidden" : "";
        d.nm.el.style.opacity = off ? "0.35" : "";
      });
      stage.draw();
    },
    update(t) {
      dials.forEach((d) => {
        const f = smooth(seg(t, 0.04 + d.i * 0.035, 0.5 + d.i * 0.035));
        d.cost.show((d.b.cir / 100) * f);
        d.val.el.textContent = Math.round(d.b.cir * f) + " sen";
        stage.place(d.val, V(d.x, d.y, 0), f > 0.02);
        stage.place(d.nm, V(d.x, d.y - R - 0.16, 0), true);
      });
    },
  };
}

// ---------- 5. the tanks ----------
// Two pairs of tanks. The first pair holds assets, the second holds profit. The
// Malaysian tank is all twelve banks and fills to the top. The DBS tank is one bank.
function sceneTanks(stage, D) {
  const dbs = D.region.find((r) => r.name === "DBS");
  const ta = D.totals.assets, tp = D.totals.profit;
  const H = 5.2, R = 0.82, GAP = 2.05, PAIR = 5.0;
  const tanks = [
    { x: -PAIR / 2 - GAP / 2, f: 1, color: C.gold, name: "Malaysia's 12", val: "US$950.5b", grp: 0 },
    { x: -PAIR / 2 + GAP / 2, f: dbs.assets / ta, color: C.stamp, name: "DBS", val: "US$697.8b", grp: 0 },
    { x: PAIR / 2 - GAP / 2, f: 1, color: C.gold, name: "Malaysia's 12", val: "US$9.37b", grp: 1 },
    { x: PAIR / 2 + GAP / 2, f: dbs.profit / tp, color: C.stamp, name: "DBS", val: "US$8.37b", grp: 1 },
  ];
  tanks.forEach((k) => {
    const g = new THREE.Group();
    g.position.x = k.x;
    stage.root.add(g);
    g.add(ring(stage, 0, R, C.ink, 1.6));
    g.add(ring(stage, H, R, C.ink, 1.6));
    g.add(stage.line([V(-R, 0, 0), V(-R, H, 0)], C.ink, 1.6));
    g.add(stage.line([V(R, 0, 0), V(R, H, 0)], C.ink, 1.6));
    const liquid = new THREE.Mesh(
      new THREE.CylinderGeometry(R - 0.02, R - 0.02, 1, 40, 1, true),
      new THREE.MeshBasicMaterial({ color: k.color, transparent: true, opacity: 0.32, side: THREE.FrontSide, depthWrite: false })
    );
    g.add(liquid);
    const top = ring(stage, 0, R - 0.02, k.color, 2.6);
    g.add(top);
    k.g = g; k.liquid = liquid; k.top = top;
    k.lname = stage.label(k.name, "small dim", "b");
    k.lval = stage.label(k.val, "small", "t");
    k.lpct = stage.label("", "big " + (k.color === C.stamp ? "stamp" : "gold"), "c");
  });
  const head = [
    stage.label("Assets", "", "b"),
    stage.label("Net profit", "", "b"),
  ];

  stage.extent(V(-PAIR / 2 - GAP / 2 - R - 0.3, -1.9, 0), V(PAIR / 2 + GAP / 2 + R + 0.3, H + 0.9, 0));
  stage.camera.fov = 20;
  stage.fit(V(0.0, 0.32, 1), 1.04);
  stage.backdrop("89%", { cover: 0.86, back: 3.5, opacity: 0.08, color: "#050f16", at: V(0, 0.4, 0) });

  return {
    update(t) {
      tanks.forEach((k, i) => {
        const st = k.grp === 0 ? 0.02 : 0.48;
        const f = smooth(seg(t, st + (i % 2) * 0.06, st + 0.36 + (i % 2) * 0.06));
        const h = H * k.f * f;
        k.liquid.scale.y = Math.max(0.001, h);
        k.liquid.position.y = h / 2;
        k.liquid.visible = f > 0.001;
        k.top.position.y = h;
        k.top.visible = f > 0.001;
        stage.place(k.lname, V(k.x, -0.25, R), true);
        stage.place(k.lval, V(k.x, H + 0.25, 0), f > 0.95);
        k.lpct.el.textContent = k.f === 1 ? "100%" : Math.round(k.f * 100 * f) + "%";
        stage.place(k.lpct, V(k.x, Math.max(0.5, h / 2), R), f > 0.05);
      });
      stage.place(head[0], V(-PAIR / 2, -0.85, R), true);
      stage.place(head[1], V(PAIR / 2, -0.85, R), true);
    },
  };
}

// ---------- 6. the lanes ----------
// Four lanes, one per country, with the biggest local banks in each. Every bank drops
// to its return on assets. The dashed line is Malaysia's best, 1.4%.
function sceneLanes(stage, D) {
  const lanes = ["Malaysia", "Singapore", "Thailand", "Indonesia"];
  const SX = 2.0, YK = 1.7, TOP = 4.2 * YK;
  const yOf = (v) => v * YK;
  const x0 = -((lanes.length - 1) / 2) * SX;
  lanes.forEach((c, i) => {
    const x = x0 + i * SX;
    stage.line([V(x, 0, 0), V(x, TOP, 0)], C.rule, 1.4);
  });
  stage.line([V(x0 - 0.9, 0, 0), V(-x0 + 0.9, 0, 0)], C.ink, 2);
  [1, 2, 3, 4].forEach((v) => {
    stage.line([V(x0 - 0.9, yOf(v), -0.02), V(x0 - 0.75, yOf(v), -0.02)], C.ink, 1.4);
  });
  const ticks = [1, 2, 3, 4].map((v) => { const l = stage.label(v + "%", "small dim", "l"); l.v = v; return l; });
  const best = stage.line([V(x0 - 0.75, yOf(1.4), 0.02), V(-x0 + 0.9, yOf(1.4), 0.02)], C.ink, 2, { dash: true });
  const lBest = stage.label("Malaysia's best, 1.4%", "small gold", "l");

  const RD = 0.13;
  const geo = new THREE.SphereGeometry(RD, 20, 14);
  const placed = [];
  const dots = D.region.slice().sort((a, b) => a.roa - b.roa).map((r) => {
    const li = lanes.indexOf(r.country);
    const y = yOf(r.roa);
    // Banks with the same return sit side by side in their lane, not on top of each other.
    let dx = 0;
    for (const c of [0, -0.32, 0.32, -0.64, 0.64]) {
      const x = x0 + li * SX + c;
      if (!placed.some((p) => Math.hypot(p.x - x, p.y - y) < RD * 2 + 0.05)) { dx = c; break; }
    }
    const x = x0 + li * SX + dx;
    placed.push({ x, y });
    const color = r.name === "BCA" ? C.stamp : r.country === "Malaysia" ? C.gold : C.ctx;
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color }));
    m.position.set(x, TOP, 0.05);
    stage.root.add(m);
    return { r, m, x, y, li };
  });
  const names = lanes.map((c) => stage.label(c, "small", "b"));
  const lBCA = stage.label("BCA 3.8%", "stamp", "r");

  stage.extent(V(x0 - 1.7, -0.9, 0), V(-x0 + 1.3, TOP + 0.3, 0));
  stage.fit(V(0.0, 0.0, 1), 1.03);
  stage.backdrop("3.8%", { cover: 0.84, back: 3, opacity: 0.08, color: "#050f16", at: V(0, 0.5, 0) });

  return {
    // The page's choice calls this with a country, or null for all four.
    highlight(country) {
      dots.forEach((d) => dim(d.m, country && d.r.country !== country, 0.15));
      names.forEach((l, i) => { l.el.style.opacity = country && lanes[i] !== country ? "0.4" : ""; });
      stage.draw();
    },
    update(t) {
      dots.forEach((d, i) => {
        const st = 0.03 + d.li * 0.12 + (i % 4) * 0.025;
        const f = seg(t, st, st + 0.26);
        // fall and settle: a drop that speeds up with a small bounce at the end
        const e = f < 0.8 ? Math.pow(f / 0.8, 2) : 1 - Math.sin(((f - 0.8) / 0.2) * Math.PI) * 0.06;
        d.m.position.y = lerp(TOP, d.y, e);
        d.m.visible = f > 0;
      });
      const p = smooth(seg(t, 0.78, 0.92));
      best.visible = p > 0.02;
      stage.place(lBest, V(-x0 + 0.9, yOf(1.4) + 0.3, 0), p > 0.5);
      lanes.forEach((c, i) => stage.place(names[i], V(x0 + i * SX, -0.2, 0), true));
      ticks.forEach((l) => stage.place(l, V(x0 - 0.95, yOf(l.v), 0), true));
      const bca = dots.find((d) => d.r.name === "BCA");
      stage.place(lBCA, V(bca.x + 0.28, bca.y, 0), t > 0.72);
    },
  };
}
// ---------- boot ----------
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

const DATA = await fetch("./data.json").then((r) => r.json());
const SCENES = {
  swap: { build: (s) => sceneSwap(s, DATA), durationMs: 1600 },
  blocks: { build: (s) => sceneBlocks(s, DATA), durationMs: 1400 },
  dials: { build: (s) => sceneDials(s, DATA), durationMs: 1400 },
  tanks: { build: (s) => sceneTanks(s, DATA), durationMs: 1600 },
  lanes: { build: (s) => sceneLanes(s, DATA), durationMs: 1400 },
};

// Every scene plays in under two seconds on the page. The video stretches a shot to the length of
// its voice line, so ?dur=<ms> overrides the duration for capture only. Nothing else changes.
const DUR_OVERRIDE = Number(QUERY.get("dur")) || 0;

// ---------- the click indicator ----------
const coarse = matchMedia("(pointer: coarse)").matches;
const VERB = coarse ? "Tap" : "Click";
const TAUGHT = "mb-taught";
let taught = false;
try { taught = localStorage.getItem(TAUGHT) === "1"; } catch (e) { taught = false; }
function learned() {
  taught = true;
  try { localStorage.setItem(TAUGHT, "1"); } catch (e) { /* private mode */ }
  document.querySelectorAll(".finger.show").forEach((el) => el.classList.remove("show"));
}

const FINGER_SVG =
  '<svg viewBox="0 0 24 24" width="42" height="42" aria-hidden="true"><path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/></svg>';

function attach(st, fig, index) {
  const wrap = st.wrap;
  // Each chart is named by the heading of the text block that goes with it.
  const head = document.querySelector('.block[data-for="' + st.name + '"] h3') || (fig.closest("section") && fig.closest("section").querySelector("h2"));
  wrap.tabIndex = 0;
  wrap.setAttribute("role", "button");
  wrap.setAttribute("aria-label", (reduced ? "Still frame: " : VERB + " to play: ") + (head ? head.textContent.trim() : "the chart"));
  const chip = document.createElement("span");
  chip.className = "chip";
  wrap.appendChild(chip);

  if (reduced) {
    chip.textContent = "Still frame";
    chip.classList.add("static");
    return;
  }

  const finger = document.createElement("div");
  finger.className = "finger" + (index === 0 && !taught ? " show" : "");
  finger.innerHTML = '<span class="ripple"></span>' + FINGER_SVG + '<span class="say">' + VERB + " to play</span>";
  wrap.appendChild(finger);

  const setState = (s) => {
    const n = (index + 1) + " / " + TOTAL + " \u00b7 ";
    chip.textContent = n + (s === "playing" ? "playing" : s === "done" ? VERB.toLowerCase() + " to replay" : VERB.toLowerCase() + " to play");
    chip.classList.toggle("busy", s === "playing");
    wrap.classList.toggle("is-playing", s === "playing");
    wrap.classList.toggle("is-idle", s === "idle");
  };
  st.onstate = setState;
  setState("idle");

  const go = () => {
    if (!taught) learned();
    st.play();
  };
  wrap.addEventListener("click", go);
  wrap.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
  });
}

const stages = [];
const TOTAL = document.querySelectorAll("[data-scene]").length;
document.querySelectorAll("[data-scene]").forEach((fig, index) => {
  const name = fig.dataset.scene;
  const spec = SCENES[name];
  if (!spec) return;
  const wrap = fig.querySelector(".canvas-wrap");
  const canvas = fig.querySelector("canvas");
  wrap.style.aspectRatio = fig.dataset.aspect || "4 / 5";
  try {
    const st = new Stage(canvas, wrap, { build: spec.build, duration: DUR_OVERRIDE || spec.durationMs, reduced }, DATA);
    st.name = name; st.fig = fig;
    stages.push(st);
    // With reduced motion nothing plays, so the chart stands at its end state.
    if (reduced) st.seek(1);
    attach(st, fig, index);
  } catch (err) {
    console.error("scene failed:", name, err);
    fig.classList.add("failed");
  }
});

window.__stages = stages;
// The page script (page.js) drives the charts from its controls through these.
window.__byName = Object.fromEntries(stages.map((s) => [s.name, s]));
window.dispatchEvent(new CustomEvent("scenes-ready"));
window.__seek = (t, name) => {
  stages.forEach((s) => { if (!name || s.name === name) s.seek(t); });
};

const q = QUERY;
if (q.has("still")) {
  stages.forEach((s) => s.seek(1));
}
if (q.has("only")) {
  const n = parseInt(q.get("only"), 10);
  document.querySelectorAll("main > section").forEach((el, i) => {
    if (i !== n - 1) el.style.display = "none";
  });
  document.querySelectorAll("header.hero, .method").forEach((el) => { el.style.display = "none"; });
}
if (q.has("shot")) {
  const st = stages.find((s) => s.name === q.get("shot"));
  if (st) {
    document.body.classList.add("shot-mode");
    document.querySelectorAll(".figs .fig").forEach((f) => f.classList.toggle("on", f === st.fig));
    requestAnimationFrame(() => {
      st.resize();
      st.seek(q.has("t") ? parseFloat(q.get("t")) : 1);
    });
  }
}
