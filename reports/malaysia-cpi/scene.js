// Six price mechanisms, drawn as line art.
// Every scene is f(t) so the page can play it on scroll and the video can seek it exactly.
import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";

const C = {
  paper: 0xf3f0e9, paper2: 0xeae5da, ink: 0x1c1e24, ctx: 0xa7a49a,
  cool: 0x26557f, warm: 0xbd5320, rule: 0xd6d1c4, shade: 0xe3ded2,
};

const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
const seg = (t, a, b) => clamp01((t - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

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
    const box = new THREE.Box3().setFromObject(this.root);
    if (box.isEmpty()) return;
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

// ---------- 1. the column ----------
function sceneColumn(stage, D) {
  const H = 7.4, BASE = 100, SPAN = 40;
  const yOf = (v) => ((v - BASE) / SPAN) * H;
  const W = 2.6, DP = 1.3;
  const now = D.headline.index, then = D.headline.indexYago;

  // ground: the 2010 base
  stage.quad([V(-W / 2 - 0.15, 0, -DP / 2), V(W / 2 + 0.15, 0, -DP / 2), V(W / 2 + 0.15, 0, DP / 2), V(-W / 2 - 0.15, 0, DP / 2)], C.shade, 1);
  const corners = [[-W / 2, -DP / 2], [W / 2, -DP / 2], [W / 2, DP / 2], [-W / 2, DP / 2]];
  corners.forEach(([x, z]) => stage.line([V(x, 0, z), V(x, yOf(now), z)], C.rule, 1.2));

  // the body: everything up to September 2025
  const bodyH = yOf(then);
  const body = stage.box(W, 1, DP, C.ctx, 1.4);
  const bodyFill = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.014, 1, DP - 0.014),
    new THREE.MeshBasicMaterial({ color: 0xe2dccb })
  );
  body.add(bodyFill);
  body.position.y = bodyH / 2;

  // the year: the sliver from September 2025 to September 2026
  const sliverH = yOf(now) - bodyH;
  const sliver = stage.box(W, 1, DP, C.cool, 2.2);
  const sliverFill = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.014, 1, DP - 0.014),
    new THREE.MeshBasicMaterial({ color: C.cool, transparent: true, opacity: 0.45 })
  );
  sliver.add(sliverFill);
  sliver.position.y = bodyH + sliverH / 2;

  // the reference plate at September 2025
  const plate = stage.box(W + 2.0, 0.05, DP + 1.0, C.ink, 1.6);
  plate.position.y = bodyH;

  // scale on the left
  const ticks = [110, 120, 130].map((v) => {
    stage.line([V(-W / 2 - 0.12, yOf(v), DP / 2), V(-W / 2 - 0.55, yOf(v), DP / 2)], C.rule, 1.2);
    const l = stage.label(String(v), "small dim", "l");
    l.v = v;
    return l;
  });

  const lBase = stage.label("2010 = 100", "small dim", "l");
  const lRef = stage.label("135.2  Sep 2025", "small", "l");
  const lTop = stage.label("137.6", "big", "t");
  const lYear = stage.label("+1.8% in a year", "cool", "r");
  const lShare = stage.label("6.4% of the climb since 2010", "small dim", "c");

  stage.extent(V(-W / 2 - 1.8, -0.95, 0), V(W / 2 + 2.6, yOf(now) + 1.0, 0));
  stage.fit(V(0.24, 0.07, 1), 1.04);

  return {
    update(t) {
      // The column comes up to September 2025 first, then the year arrives on top of
      // it. Splitting the motion leaves room to read the scale in between.
      const e = smooth(seg(t, 0, 0.42));
      const bh = bodyH * e;
      body.scale.y = Math.max(0.001, bh);
      body.position.y = bh / 2;

      const sh = sliverH * smooth(seg(t, 0.58, 0.95));
      sliver.scale.y = Math.max(0.001, sh);
      sliver.position.y = bh + sh / 2;

      plate.position.y = bh;
      plate.visible = t > 0.02;

      stage.place(lBase, V(-W / 2 - 0.12, 0.08, DP / 2));
      stage.place(lRef, V(-W / 2 - 0.12, bh, DP / 2), t > 0.35);
      stage.place(lTop, V(0, bh + sh + 0.22, 0), t > 0.12);
      stage.place(lYear, V(W / 2 + 0.2, bh + sh / 2, 0), t > 0.86);
      stage.place(lShare, V(0, -0.6, 0), t > 0.86);
      ticks.forEach((l) => stage.place(l, V(-W / 2 - 0.12, yOf(l.v), DP / 2)));
    },
  };
}

// ---------- 2. the ladder ----------
function sceneLadder(stage, D) {
  const MAXV = 3.2, XW = 5.0;
  const xOf = (v) => (v / MAXV) * XW;
  const DY = 0.56, BH = 0.28;
  const divs = D.divisions;
  const n = divs.length;
  const yOf = (i) => (n - 1 - i) * DY;

  stage.line([V(0, -0.45, 0), V(0, yOf(0) + 0.5, 0)], C.ink, 2);
  [0, 1, 2, 3].forEach((v) => {
    stage.line([V(xOf(v), -0.45, 0), V(xOf(v), -0.3, 0)], C.ink, 1.3);
    const l = stage.label(v + "%", "small dim", "c");
    l.v = v;
  });
  const natX = xOf(D.headline.yoy);
  stage.line([V(natX, -0.45, 0), V(natX, yOf(0) + 0.55, 0)], C.cool, 1.8, { dash: true, opacity: 0.95 });
  const lNat = stage.label("national 1.8%", "small cool", "t");

  const rows = divs.map((d, i) => {
    const y = yOf(i);
    const up = d.yoy > d.yoyAug, down = d.yoy < d.yoyAug;
    const hot = d.code === "07", cold = d.code === "04";
    const col = hot ? C.warm : cold ? C.cool : C.ink;
    const bar = hbar(stage, y, BH, col, hot || cold ? 2.2 : 1.5);
    bar.set(0, 0);
    const tick = stage.line([V(0, -0.19, 0), V(0, 0.19, 0)], C.ctx, 1.5);
    tick.position.y = y;
    const big = Math.abs(d.dYoy) >= 0.2;
    let conn = null;
    if (big) {
      const a = Math.min(xOf(d.yoy), xOf(d.yoyAug)), b = Math.max(xOf(d.yoy), xOf(d.yoyAug));
      conn = stage.line([V(a, y + BH / 2 + 0.17, 0), V(b, y + BH / 2 + 0.17, 0)], up ? C.warm : C.cool, 2.2);
    }
    const move = hot ? "  +0.5" : cold ? "  \u22120.7" : d.code === "08" ? "  \u22120.8" : "";
    const cls = "small" + (hot ? " warm" : cold ? " cool" : d.code === "08" ? " cool" : "");
    const name = stage.label(d.short, cls, "l");
    const val = stage.label(d.yoy.toFixed(1) + "%" + move, cls, "r");
    return { d, y, bar, tick, conn, name, val, up, down, hot, cold };
  });

  stage.extent(V(-1.9, -1.0, 0), V(XW + 1.5, yOf(0) + 1.0, 0));
  stage.fit(V(0.02, 0.03, 1), 1.03);

  return {
    update(t) {
      rows.forEach((r, i) => {
        const f = smooth(seg(t, i * 0.035, 0.52 + i * 0.035));
        r.bar.set(0, xOf(r.d.yoy) * f);
        const m = smooth(seg(t, 0.55, 1));
        r.tick.position.x = lerp(xOf(r.d.yoy), xOf(r.d.yoyAug), m);
        if (r.conn) {
          const lo = Math.min(xOf(r.d.yoy), xOf(r.d.yoyAug));
          const hi = Math.max(xOf(r.d.yoy), xOf(r.d.yoyAug));
          const a = lerp(hi, lo, m);
          const b = lerp(lo, hi, m);
          r.conn.geometry.setPositions([a, r.y + BH / 2 + 0.17, 0, b, r.y + BH / 2 + 0.17, 0]);
          r.conn.computeLineDistances();
        }
        stage.place(r.name, V(-0.12, r.y, 0), t > 0.02);
        stage.place(r.val, V(xOf(r.d.yoy) * f + 0.16, r.y, 0), f > 0.1);
      });
      stage.place(lNat, V(natX, yOf(0) + 0.7, 0), t > 0.3);
      stage.labels.forEach((l) => {
        if (l.v != null) stage.place(l, V(xOf(l.v), -0.56, 0));
      });
    },
  };
}

// ---------- 3. the path ----------
function scenePath(stage, D) {
  const path = D.path36, core = D.core.path36;
  const N = path.length;
  const MX = 0.2, RMAX = 2.8, H = 9.4;
  const xOf = (i) => i * MX;
  const yOf = (v) => (v / RMAX) * H;

  // the floor and the months
  stage.line([V(-0.55, 0, 0), V(xOf(N - 1) + 0.55, 0, 0)], C.ink, 2);
  const monthLabels = [];
  for (let i = 0; i < N; i += 6) {
    stage.line([V(xOf(i), 0, 0), V(xOf(i), H, 0)], C.rule, 0.9, { opacity: 0.8 });
    const l = stage.label(path[i].date, "small dim", "c");
    l.i = i;
    monthLabels.push(l);
  }
  stage.line([V(xOf(N - 1), 0, 0), V(xOf(N - 1), H, 0)], C.rule, 0.9, { opacity: 0.8 });

  // the band the headline never left
  const lo = Math.min(...path.map((p) => p.yoy));
  const hi = Math.max(...path.map((p) => p.yoy));
  [lo, hi].forEach((v) => {
    stage.line([V(-0.35, yOf(v), 0), V(xOf(N - 1) + 0.3, yOf(v), 0)], C.rule, 1.2, { dash: true, opacity: 0.95 });
  });
  const lBand = stage.label("the band: " + lo.toFixed(1) + "% to " + hi.toFixed(1) + "%", "small dim", "c");

  // rate scale on the left
  [0.5, 1, 1.5, 2, 2.5].forEach((v) => {
    stage.line([V(-0.5, yOf(v), 0), V(-0.28, yOf(v), 0)], C.ctx, 1.1);
    const l = stage.label(v.toFixed(1) + "%", "small dim", "l");
    l.v = v;
  });

  // the two lines
  const head = stage.line(path.map((p, i) => V(xOf(i), yOf(p.yoy), 0)), C.cool, 2.8);
  const coreLine = stage.line(core.map((p, i) => V(xOf(i), yOf(p.yoy), 0)), C.warm, 2.2);
  // LineGeometry draws one instance per segment, so the line can be revealed a month at a time.
  head.geometry.instanceCount = 1;
  coreLine.geometry.instanceCount = 1;

  // drop lines every six months
  for (let i = 0; i < N; i += 6) {
    stage.line([V(xOf(i), 0, 0), V(xOf(i), yOf(path[i].yoy), 0)], C.ctx, 1);
  }

  // the marker, travelling to now
  const mark = stage.line([V(0, 0, 0), V(0, 1, 0)], C.ink, 2);
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 12, 8),
    new THREE.MeshBasicMaterial({ color: C.ink })
  );
  stage.root.add(dot);
  const lNow = stage.label("Sept 2026 · 1.8%", "cool", "r");
  const lCore = stage.label("core", "warm small", "r");

  stage.extent(V(-1.7, -1.0, 0), V(xOf(N - 1) + 1.7, H + 0.8, 0));
  stage.fit(V(0.06, 0.09, 1), 1.03);

  return {
    update(t) {
      const e = smooth(t);
      const k = Math.max(1, Math.round(e * (N - 1)));
      head.geometry.instanceCount = k;
      coreLine.geometry.instanceCount = k;
      const i = Math.min(N - 1, k);
      const yh = yOf(path[i].yoy);
      mark.position.set(xOf(i), yh / 2, 0);
      mark.scale.y = yh;
      dot.position.set(xOf(i), yh, 0);
      stage.place(lNow, V(xOf(i) + 0.14, yh + 0.24, 0), t > 0.12);
      stage.place(lCore, V(xOf(i) + 0.14, yOf(core[i].yoy) - 0.24, 0), t > 0.5);
      stage.place(lBand, V(xOf(N - 1) / 2, H + 0.32, 0), t > 0.3);
      monthLabels.forEach((l) => stage.place(l, V(xOf(l.i), -0.42, 0)));
      stage.labels.forEach((l) => {
        if (l.v != null) stage.place(l, V(-0.52, yOf(l.v), 0));
      });
    },
  };
}

// ---------- 4. the drum ----------
function sceneDrum(stage, D) {
  const R = 1.3, PMAX = 5.0, H = 4.6;
  const yOf = (p) => (p / PMAX) * H;
  const w = D.fuel.window;
  const cut = D.fuel.sep26.ron95Skps;
  const sepAvg = D.fuel.sep26.ron95;

  const SEG = 22, FROM = Math.PI * 0.12, TO = Math.PI * 1.88;
  for (let i = 0; i <= SEG; i++) {
    const a = FROM + (TO - FROM) * (i / SEG);
    const x = Math.cos(a) * R, z = Math.sin(a) * R;
    stage.line([V(x, 0, z), V(x, H, z)], C.ctx, 1.3);
  }
  ring(stage, H, R, C.ink, 2, {}, 30);
  ring(stage, 0, R, C.ink, 2, {}, 30);
  ring(stage, yOf(cut), R, C.cool, 1.8, {}, 30, FROM, TO);

  const liquid = new THREE.Mesh(
    new THREE.CylinderGeometry(R - 0.03, R - 0.03, 1, 30, 1, true),
    new THREE.MeshBasicMaterial({ color: C.warm, transparent: true, opacity: 0.32, side: THREE.DoubleSide })
  );
  stage.root.add(liquid);
  const surface = new THREE.Mesh(
    new THREE.CircleGeometry(R - 0.035, 30),
    new THREE.MeshBasicMaterial({ color: C.warm, transparent: true, opacity: 0.6, side: THREE.DoubleSide })
  );
  surface.rotation.x = -Math.PI / 2;
  stage.root.add(surface);
  const cutPlane = new THREE.Mesh(
    new THREE.CircleGeometry(R - 0.035, 30),
    new THREE.MeshBasicMaterial({ color: C.cool, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
  );
  cutPlane.rotation.x = -Math.PI / 2;
  cutPlane.position.y = yOf(cut);
  stage.root.add(cutPlane);
  ring(stage, yOf(sepAvg), R, C.ink, 1.5, { dash: true }, 30);

  const lName = stage.label("RON95", "small dim", "c");
  const lMkt = stage.label("RM4.18", "warm big", "r");
  const lCut = stage.label("RM2.05 subsidised", "cool", "l");
  const lGap = stage.label("RM2.13 you do not pay", "small warm", "c");
  const lNow = stage.label("22 Oct: RM4.32", "small dim", "r");

  stage.extent(V(-R - 1.9, -0.8, -R), V(R + 1.7, H + 0.8, R));
  stage.fit(V(0.22, 0.09, 1), 1.04);

  return {
    update(t) {
      const e = smooth(t);
      const f = e * (w.length - 1);
      const idx = Math.min(w.length - 1, Math.floor(f));
      const nxt = Math.min(w.length - 1, idx + 1);
      const p = lerp(w[idx].ron95, w[nxt].ron95, f - idx);
      const top = yOf(p);
      const lo = yOf(cut);
      liquid.scale.y = Math.max(0.001, top - lo);
      liquid.position.y = (top + lo) / 2;
      surface.position.y = top;
      stage.place(lName, V(0, H + 0.3, 0));
      stage.place(lMkt, V(R + 0.12, top, 0), t > 0.6);
      stage.place(lNow, V(R + 0.12, top - 0.34, 0), t > 0.85);
      stage.place(lCut, V(-R - 0.12, lo, 0), t > 0.3);
      stage.place(lGap, V(0, (top + lo) / 2, R * 0.62), t > 0.78);
    },
  };
}

// ---------- 5. the dots ----------
function sceneDots(stage, D) {
  const st = D.states;
  const n = st.length;
  const LO = 0.3, HI = 2.6, H = 6.2;
  const yOf = (v) => ((v - LO) / (HI - LO)) * H;
  const R = 0.13;
  const natY = yOf(D.headline.yoy);

  // the scale the dots hang on
  stage.line([V(0, 0, 0), V(0, H + 0.35, 0)], C.ink, 1.6, { opacity: 0.5 });
  [0.5, 1, 1.5, 2, 2.5].forEach((v) => {
    stage.line([V(-0.42, yOf(v), 0), V(-0.2, yOf(v), 0)], C.ctx, 1.1);
    const l = stage.label(v.toFixed(1) + "%", "small dim", "l");
    l.v = v;
  });
  stage.line([V(-1.55, natY, -0.9), V(1.55, natY, -0.9)], C.cool, 2, { dash: true });
  const lNat = stage.label("national 1.8%", "small cool", "r");

  const seeds = st.map((s, i) => ({
    x: ((i * 37) % 17) / 17 * 1.5 - 0.75,
    y: 0.5 + ((i * 53) % 19) / 19 * 4.2,
    z: ((i * 29) % 13) / 13 * 1.2 - 0.6,
  }));

  const geo = new THREE.SphereGeometry(R, 12, 8);
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff }), n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  stage.root.add(mesh);

  const m4 = new THREE.Matrix4();
  st.forEach((s, i) => {
    const above = s.yoy > D.headline.yoy;
    const on = Math.abs(s.yoy - D.headline.yoy) < 0.001;
    mesh.setColorAt(i, new THREE.Color(above ? C.warm : on ? C.cool : C.ink));
  });

  // where each dot lands: the rate sets the height, a small offset keeps equal
  // rates from sitting on top of each other
  const target = st.map((s, i) => V(
    ((i * 37) % 17) / 17 * 0.9 - 0.45,
    yOf(s.yoy) + ((((i * 17) % 7) / 7) - 0.5) * 0.12,
    ((i * 29) % 13) / 13 * 0.5 - 0.25
  ));

  const NAMED = [
    { name: "Sarawak", side: -1 },
    { name: "Perlis", side: -1 },
    { name: "W.P. Kuala Lumpur", side: -1 },
    { name: "Negeri Sembilan", side: -1 },
    { name: "W.P. Labuan", side: 1 },
  ];
  const named = NAMED.map((c) => {
    const i = st.findIndex((x) => x.name === c.name);
    if (i < 0) return null;
    const el = stage.label(c.name + "  " + st[i].yoy.toFixed(1) + "%", "small", c.side < 0 ? "l" : "r");
    const lead = stage.line([V(0, 0, 0), V(0, 0, 0)], C.ctx, 1);
    return { i, el, lead, side: c.side, s: st[i] };
  }).filter(Boolean);

  stage.extent(V(-2.7, -0.8, -1.3), V(2.7, H + 0.9, 1.3));
  stage.fit(V(0.14, 0.06, 1), 1.04);

  return {
    update(t) {
      st.forEach((s, i) => {
        const f = smooth(seg(t, i * 0.022, 0.52 + i * 0.022));
        const p = V(
          lerp(seeds[i].x, target[i].x, f),
          lerp(seeds[i].y, target[i].y, f),
          lerp(seeds[i].z, target[i].z, f)
        );
        m4.makeTranslation(p.x, p.y, p.z);
        mesh.setMatrixAt(i, m4);
      });
      mesh.instanceMatrix.needsUpdate = true;
      stage.place(lNat, V(1.5, natY - 0.24, -0.9), t > 0.25);
      named.forEach((o) => {
        const ty = target[o.i].y;
        const tx = o.side * 0.95;
        stage.place(o.el, V(tx, ty, 0.15), t > 0.62);
        o.lead.geometry.setPositions([target[o.i].x, ty, 0.1, tx, ty, 0.1]);
        o.lead.computeLineDistances();
      });
      stage.labels.forEach((l) => {
        if (l.v != null) stage.place(l, V(-0.46, yOf(l.v), 0));
      });
    },
  };
}

// ---------- 6. the split ----------
function sceneSplit(stage, D) {
  const TOP = 5.4, COL = 3.4, RMAX = 3.2;
  const yOf = (v) => (v / RMAX) * COL;
  const X = 1.8, PW = 0.9;
  const u = D.strata.urban.transport.yoy, r = D.strata.rural.transport.yoy;

  [[-X], [X]].forEach(([x]) => {
    stage.line([V(x - PW / 2, 0, 0), V(x - PW / 2, TOP - 1.1, 0)], C.ctx, 1.4);
    stage.line([V(x + PW / 2, 0, 0), V(x + PW / 2, TOP - 1.1, 0)], C.ctx, 1.4);
  });

  // the fork: one stream in, two out
  stage.line([V(0, TOP, 0), V(0, TOP - 0.6, 0)], C.ink, 2.6);
  stage.line([V(0, TOP - 0.6, 0), V(-X, TOP - 0.95, 0)], C.ink, 2.2);
  stage.line([V(0, TOP - 0.6, 0), V(X, TOP - 0.95, 0)], C.ink, 2.2);
  stage.line([V(-X, TOP - 0.95, 0), V(-X, TOP - 1.1, 0)], C.ink, 2.2);
  stage.line([V(X, TOP - 0.95, 0), V(X, TOP - 1.1, 0)], C.ink, 2.2);

  const lFuel = stage.label("fuel price", "small dim", "c");

  const cols = [
    { x: -X, v: u, name: "City", col: C.warm, rate: u, all: D.strata.urban.yoy },
    { x: X, v: r, name: "Countryside", col: C.cool, rate: r, all: D.strata.rural.yoy },
  ].map((c) => {
    const g = stage.box(PW, 1, 0.55, c.col, 2.2);
    const fill = new THREE.Mesh(
      new THREE.BoxGeometry(PW - 0.02, 1, 0.52),
      new THREE.MeshBasicMaterial({ color: c.col, transparent: true, opacity: 0.28 })
    );
    g.add(fill);
    g.position.set(c.x, 0.5, 0);
    const lab = stage.label(c.rate.toFixed(2) + "%", "big " + (c.name === "City" ? "warm" : "cool"), "c");
    const lab2 = stage.label(c.name + " · all prices " + c.all.toFixed(2) + "%", "small dim", "c");
    return { ...c, g, fill, lab, lab2, h: yOf(c.v) };
  });

  stage.extent(V(-X - 2.0, -1.2, -0.7), V(X + 2.0, TOP + 0.8, 0.7));
  stage.fit(V(0.05, 0.05, 1), 1.03);

  return {
    update(t) {
      cols.forEach((c, i) => {
        const f = smooth(seg(t, 0.28 + i * 0.1, 0.86 + i * 0.1));
        const h = c.h * f;
        c.g.scale.y = Math.max(0.001, h);
        c.g.position.y = h / 2;
        stage.place(c.lab, V(c.x, h + 0.26, 0), f > 0.08);
        stage.place(c.lab2, V(c.x, -0.42, 0), t > 0.72);
      });
      stage.place(lFuel, V(0, TOP + 0.3, 0), t > 0.05);
    },
  };
}

// ---------- boot ----------
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

const DATA = await fetch("./data.json").then((r) => r.json());
const SCENES = {
  column: { build: (s) => sceneColumn(s, DATA), duration: 1000 },
  ladder: { build: (s) => sceneLadder(s, DATA), duration: 1000 },
  path: { build: (s) => scenePath(s, DATA), duration: 1000 },
  drum: { build: (s) => sceneDrum(s, DATA), duration: 1000 },
  dots: { build: (s) => sceneDots(s, DATA), duration: 1000 },
  split: { build: (s) => sceneSplit(s, DATA), duration: 1000 },
};

// Every scene plays in one second on the page. The video stretches a shot to the length of
// its voice line, so ?dur=<ms> overrides the duration for capture only. Nothing else changes.
const DUR_OVERRIDE = Number(new URLSearchParams(location.search).get("dur")) || 0;

// ---------- the click indicator ----------
const coarse = matchMedia("(pointer: coarse)").matches;
const VERB = coarse ? "Tap" : "Click";
const TAUGHT = "mc-taught";
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
  const head = fig.closest("section") && fig.closest("section").querySelector("h2");
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
    chip.textContent = s === "playing" ? "Playing" : s === "done" ? "Replay" : "Play the shot";
    chip.classList.toggle("busy", s === "playing");
    wrap.classList.toggle("is-playing", s === "playing");
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
document.querySelectorAll("[data-scene]").forEach((fig, index) => {
  const name = fig.dataset.scene;
  const spec = SCENES[name];
  if (!spec) return;
  const wrap = fig.querySelector(".canvas-wrap");
  const canvas = fig.querySelector("canvas");
  wrap.style.aspectRatio = fig.dataset.aspect || "4 / 5";
  try {
    const st = new Stage(canvas, wrap, { build: spec.build, duration: DUR_OVERRIDE || spec.duration, reduced }, DATA);
    st.name = name; st.fig = fig;
    stages.push(st);
    attach(st, fig, index);
  } catch (err) {
    console.error("scene failed:", name, err);
    fig.classList.add("failed");
  }
});

window.__stages = stages;
window.__seek = (t, name) => {
  stages.forEach((s) => { if (!name || s.name === name) s.seek(t); });
};

const q = new URLSearchParams(location.search);
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
    st.fig.closest("section").classList.add("on");
    requestAnimationFrame(() => {
      st.resize();
      st.seek(q.has("t") ? parseFloat(q.get("t")) : 1);
    });
  }
}
