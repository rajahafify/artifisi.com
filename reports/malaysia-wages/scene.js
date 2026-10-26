// Six wage mechanisms, drawn as line art.
// Every scene is f(t) so the page can play it on scroll and the video can seek it exactly.
import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";

const C = {
  paper: 0xf6f2ea, paper2: 0xefe9dd, ink: 0x332d26, ctx: 0xb6ab96,
  accent: 0x1e5b49, warn: 0xa6442a, rule: 0xdcd3c2, shade: 0xe4dbca,
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

  label(text, cls = "") {
    const el = document.createElement("div");
    el.className = "scene-label " + cls;
    el.textContent = text;
    this.wrap.appendChild(el);
    const o = { el, at: V(0, 0, 0), vis: true };
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
    const dpr = this.renderer.getPixelRatio();
    const W = this.w, H = this.h;
    this.labels.forEach((o) => {
      if (!o.vis) { o.el.style.opacity = "0"; return; }
      const p = o.at.clone().project(this.camera);
      if (p.z > 1) { o.el.style.opacity = "0"; return; }
      const x = (p.x * 0.5 + 0.5) * W;
      const y = (-p.y * 0.5 + 0.5) * H;
      o.el.style.opacity = "1";
      o.el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) translate(-50%,-50%)";
    });
    void dpr;
  }
}

// ---------- 1. the lift ----------
function sceneLift(stage, D) {
  const H = 8.4, W = 2.9, DP = 2.9, CH = 0.86;
  const yOf = (v) => ((v - 2940) / (5990 - 2940)) * H;
  const corners = [[-W / 2, -DP / 2], [W / 2, -DP / 2], [W / 2, DP / 2], [-W / 2, DP / 2]];

  // mass: back and left walls
  stage.quad([V(-W / 2, 0, -DP / 2), V(W / 2, 0, -DP / 2), V(W / 2, H, -DP / 2), V(-W / 2, H, -DP / 2)], C.shade, 0.55);
  stage.quad([V(-W / 2, 0, -DP / 2), V(-W / 2, 0, DP / 2), V(-W / 2, H, DP / 2), V(-W / 2, H, -DP / 2)], C.shade, 0.4);

  corners.forEach(([x, z]) => stage.line([V(x, 0, z), V(x, H, z)], C.ink, 1.7));
  stage.loop(corners.map(([x, z]) => V(x, 0, z)), C.ink, 2.4);

  const rings = [];
  [3500, 4000, 4500, 5000, 5500].forEach((v) => {
    const y = yOf(v);
    const l = stage.loop(corners.map(([x, z]) => V(x, y, z)), C.rule, 1.2);
    const tick = stage.label("RM" + v.toLocaleString("en"), "anchor-r small dim");
    tick.side = true;
    rings.push({ y, l, tick });
  });
  const top = stage.loop(corners.map(([x, z]) => V(x, H, z)), C.accent, 1.8);

  const car = new THREE.Group();
  car.add(stage.box(2.15, CH, 2.15, C.accent, 2));
  car.add(new THREE.Mesh(
    new THREE.BoxGeometry(2.15, CH, 2.15),
    new THREE.MeshBasicMaterial({ color: C.accent, transparent: true, opacity: 0.16 })
  ));
  stage.root.add(car);

  const ghost = stage.box(2.15, CH, 2.15, C.ctx, 1.2, { opacity: 0.55, dash: true });
  ghost.position.y = CH / 2;
  stage.root.add(ghost);

  const lMed = stage.label("RM2,940  national median", "anchor-l");
  const lTop = stage.label("RM5,990  education", "anchor-b big");

  // The floor ticks sit outside the shaft on the left and the median label on the right.
  // Without them inside the box the camera crops them at the video's frame.
  stage.extent(V(-W / 2 - 0.85, 0, 0), V(W / 2 + 2.1, H + 1.0, 0));
  stage.fit(V(0.3, 0.06, 1), 1.06);

  return {
    update(t) {
      const e = smooth(t);
      car.position.y = CH / 2 + (H - CH) * e;
      rings.forEach((r) => {
        const on = car.position.y - CH / 2 >= r.y - 0.05;
        r.l.material.color.setHex(on ? C.ink : C.rule);
        r.tick.el.style.color = on ? "#6e665a" : "#c9bfab";
        stage.place(r.tick, V(-W / 2 - 0.28, r.y, DP / 2));
      });
      top.material.color.setHex(e > 0.96 ? C.accent : C.ctx);
      stage.place(lMed, V(W / 2 + 0.35, 0.55, DP / 2), true);
      stage.place(lTop, V(0, H + 0.45, 0), e > 0.88);
    },
  };
}

// ---------- 2. the sorting floor ----------
function sceneFloor(stage, D) {
  const LANE = 2.4, TOP = 5.2, SPLIT = -LANE + 2 * LANE * 0.658;
  const N = 420, nL = Math.round(N * 0.658), nR = N - nL;
  const SP = 0.2, R = 0.058;

  const laneL = { x0: -LANE, x1: SPLIT }, laneR = { x0: SPLIT, x1: LANE };
  const mk = (lane, n, below) => {
    const cols = Math.max(1, Math.floor((lane.x1 - lane.x0) / SP));
    const out = [];
    for (let i = 0; i < n; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      out.push({
        x: lane.x0 + (lane.x1 - lane.x0) * ((c + 0.5) / cols) + (((i * 37) % 11) / 11 - 0.5) * 0.05,
        y: 0.12 + r * SP,
        z: ((r % 2 ? 1 : -1) * 0.22) + (c % 3 === 0 ? 0.12 : 0),
        below,
      });
    }
    return out;
  };
  const spots = mk(laneL, nL, true).concat(mk(laneR, nR, false));
  const maxY = spots.reduce((m, s) => Math.max(m, s.y), 0) + 0.3;

  // floor + conveyor
  stage.line([V(-LANE - 0.25, 0, 0.7), V(LANE + 0.25, 0, 0.7)], C.ink, 2.4);
  stage.line([V(-LANE - 0.25, 0, -0.7), V(LANE + 0.25, 0, -0.7)], C.ctx, 1.2);
  const cw = LANE + 0.35, ch = 0.2;
  stage.box(cw * 2, ch, 1.5, C.ink, 1.5).position.set(0, TOP, 0);

  // median post
  stage.line([V(SPLIT, 0, 0.72), V(SPLIT, TOP + 0.35, 0.72)], C.warn, 2.6);
  const lMed = stage.label("median", "anchor-r warn small");

  const geo = new THREE.SphereGeometry(R, 8, 6);
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff }), N);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  spots.forEach((s, i) => mesh.setColorAt(i, new THREE.Color(s.below ? C.ink : C.ctx)));
  stage.root.add(mesh);

  const m4 = new THREE.Matrix4();
  const lBig = stage.label("65.8%", "anchor-t big");
  const lBig2 = stage.label("34.2%", "anchor-t big dim");

  stage.extent(V(-LANE, -0.5, 0), V(LANE, TOP + 1.35, 0));
  stage.fit(V(0.02, 0.13, 1), 1.04);

  return {
    update(t) {
      spots.forEach((s, i) => {
        const st = 0.03 + 0.72 * (i / N);
        const du = 0.16;
        let y;
        if (t < st) y = TOP + ch / 2 + R;
        else if (t < st + du) y = lerp(TOP + ch / 2 + R, s.y, smooth((t - st) / du));
        else y = s.y;
        m4.makeTranslation(s.x, y, s.z);
        mesh.setMatrixAt(i, m4);
      });
      mesh.instanceMatrix.needsUpdate = true;
      stage.place(lMed, V(SPLIT - 0.12, TOP + 0.42, 0.72));
      const on = t > 0.6;
      stage.place(lBig, V((laneL.x0 + laneL.x1) / 2, TOP + 0.85, 0.7), on);
      stage.place(lBig2, V((laneR.x0 + laneR.x1) / 2, TOP + 0.85, 0.7), on);
      void maxY;
    },
  };
}

// ---------- 3. the canyon ----------
function sceneCanyon(stage, D) {
  const yrs = D.series.years, sp = D.series.spread;
  const Z0 = 6.6, Z1 = -6.6;
  const dz = (Z1 - Z0) / (yrs.length - 1);
  const hwOf = (v) => 0.85 + (v - 3.0) * 1.55;
  const WH = 0.85;
  const zs = yrs.map((_, i) => Z0 + i * dz);
  const hw = sp.map(hwOf);

  const clip = new THREE.Plane(new THREE.Vector3(0, 0, 1), Z1);
  stage.clip = [clip];

  for (let i = 0; i < zs.length - 1; i++) {
    stage.quad([
      V(-hw[i], 0, zs[i]), V(-hw[i + 1], 0, zs[i + 1]),
      V(hw[i + 1], 0, zs[i + 1]), V(hw[i], 0, zs[i]),
    ], C.paper2, 1);
  }
  [-1, 1].forEach((sg) => {
    for (let i = 0; i < zs.length - 1; i++) {
      stage.quad([
        V(sg * hw[i], 0, zs[i]), V(sg * hw[i + 1], 0, zs[i + 1]),
        V(sg * hw[i + 1], WH, zs[i + 1]), V(sg * hw[i], WH, zs[i]),
      ], C.ctx, 0.62);
    }
    stage.line(zs.map((z, i) => V(sg * hw[i], 0, z)), C.ink, 2.2);
    stage.line(zs.map((z, i) => V(sg * hw[i], WH, z)), C.ink, 2.2);
  });
  for (let i = 0; i < zs.length; i++) {
    stage.line([V(-hw[i], 0.003, zs[i]), V(hw[i], 0.003, zs[i])], C.ctx, i === 9 || i === 10 ? 2.2 : 0.9,
      { opacity: 0.5, });
  }
  const i19 = 9, i20 = 10;
  stage.line([V(-hw[i19], 0.005, zs[i19]), V(hw[i19], 0.005, zs[i19])], C.warn, 2.2);
  stage.line([V(-hw[i20], 0.005, zs[i20]), V(hw[i20], 0.005, zs[i20])], C.warn, 2.2);

  const lYear = stage.label("2010 · 3.59", "anchor-l big");
  const lNow = stage.label("2020 · 3.80", "anchor-r warn");

  stage.camera.fov = 14;
  stage.fit(V(0.42, 0.82, 0.55), 1.08);

  return {
    update(t) {
      const e = smooth(t);
      const rev = lerp(Z0 + 0.001, Z1, clamp01(e * 1.1));
      clip.constant = rev;
      const f = (Z0 - rev) / (Z0 - Z1);
      const idx = Math.max(0, Math.min(yrs.length - 1, Math.floor(f * (yrs.length - 1) + 0.0001)));
      stage.place(lYear, V(-hw[idx] - 0.62, 0.06, zs[idx]));
      lYear.el.textContent = yrs[idx] + " \u00b7 " + sp[idx].toFixed(2);
      stage.place(lNow, V(hw[i20] + 0.62, 0.06, zs[i20]), idx === i20);
    },
  };
}
// ---------- 4. the section ----------
function sceneSection(stage, D) {
  const sorted = D.sections.slice().sort((a, b) => a.r25 - b.r25 || b.r10 - a.r10);
  const H = 7.4, RMAX = 2.75, W = 5.7;
  const yOf = (r) => (r / RMAX) * H;

  stage.line([V(-W / 2 - 0.6, 0, -2.1), V(W / 2 + 0.6, 0, -2.1)], C.rule, 1);
  stage.line([V(-W / 2 - 0.6, 0, 2.1), V(W / 2 + 0.6, 0, 2.1)], C.ink, 2.4);
  [0.5, 1, 1.5, 2, 2.5].forEach((r) => {
    stage.line([V(-W / 2, yOf(r), -2.1), V(W / 2, yOf(r), -2.1)], C.rule, 0.9, { opacity: 0.75 });
  });

  const rows = [
    { list: sorted.filter((_, i) => i % 2 === 0), z: -1.35, off: 0.5 },
    { list: sorted.filter((_, i) => i % 2 === 1), z: 1.35, off: 0 },
  ];
  const cars = [], meta = [];
  rows.forEach((row) => {
    const sp = W / (row.list.length + (row.off ? 1 : 0));
    row.list.forEach((s, i) => {
      const cx = -W / 2 + sp * (i + 0.5 + (row.off || 0));
      const y10 = yOf(s.r10), y25 = yOf(s.r25), up = y25 > y10;
      stage.box(0.3, H, 0.12, C.rule, 0.9).position.set(cx, H / 2, row.z);
      stage.box(0.3, 0.17, 0.12, C.ctx, 1.1).position.set(cx, y10, row.z);
      stage.line([V(cx, y10, row.z), V(cx, y25, row.z)], up ? C.accent : C.warn, 2.4);
      const car = stage.box(0.3, 0.17, 0.12, up ? C.accent : C.ink, 1.8);
      car.position.set(cx, y10, row.z);
      cars.push({ car, y10, y25 });
      meta.push({ s, cx, z: row.z });
    });
  });

  const find = (n) => meta.findIndex((m) => m.s.name === n);
  const marks = [
    ["Health", "+0.36", "accent"], ["Public admin", "+0.21", "accent"],
    ["Real estate", "-0.38", "warn"], ["Mining", "-0.30", "warn"],
  ].map((m) => ({ el: stage.label(m[1], "anchor-t small " + m[2]), i: find(m[0]) }));

  stage.extent(V(-W / 2, -1.55, 0), V(W / 2, H + 0.1, 0));
  stage.fit(V(0.1, 0.14, 1), 1.04);

  return {
    update(t) {
      const e = smooth(t);
      cars.forEach((c) => { c.car.position.y = lerp(c.y10, c.y25, e); });
      marks.forEach((M, n) => {
        if (M.i < 0) return;
        const m = meta[M.i];
        stage.place(M.el, V(m.cx, -0.62 - (n % 2) * 0.42, m.z), e > 0.5);
      });
    },
  };
}

// ---------- 5. the city ----------
function sceneCity(stage, D) {
  const items = D.sections
    .map((s) => ({ s, w: Math.pow(s.share, 0.7), h: s.r25, bill: s.share * s.r25 }))
    .sort((a, b) => a.bill - b.bill);
  const tot = items.reduce((t, i) => t + i.bill, 0);
  const COLS = 4, COLW = 1.95, ROWD = 2.3;

  const blocks = items.map((it, i) => {
    const c = i % COLS, r = Math.floor(i / COLS);
    const x = (c - (COLS - 1) / 2) * COLW;
    const z = (r - 2) * ROWD;
    const w = 0.45 + (it.w / 6.9) * 0.85;
    const h = it.h * 2.05;
    const d = w * 0.95;
    return { it, x, z, w, h, d, bill: it.bill / tot, big: it.bill / tot > 0.1 };
  });

  const groups = [];
  blocks.forEach((b) => {
    const g = new THREE.Group();
    g.position.set(b.x, 0, b.z);
    const hw = b.w / 2, hd = b.d / 2;
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(b.w - 0.012, b.h, b.d - 0.012),
      new THREE.MeshBasicMaterial({ color: b.big ? (b.it.s.s === "P" ? C.accent : C.ink) : C.paper })
    );
    body.position.y = b.h / 2;
    g.add(body);
    const bot = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]];
    bot.forEach(([px, pz]) => g.add(stage.line([V(px, 0, pz), V(px, b.h, pz)], C.ink, 1.4)));
    g.add(stage.loop(bot.map(([px, pz]) => V(px, b.h, pz)), C.ink, 1.7));
    g.add(stage.loop(bot.map(([px, pz]) => V(px, 0, pz)), C.ink, 1.7));
    stage.root.add(g);
    groups.push(g);
    b.cols = Math.max(2, Math.round(b.w / 0.15));
    b.rows = Math.max(3, Math.round(b.h / 0.2));
    b.lit = Math.round(b.cols * b.rows * Math.min(1, b.it.bill / 16));
  });

  let total = 0;
  blocks.forEach((b) => { total += b.cols * b.rows; });
  const wins = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(0.055, 0.075),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
    total
  );
  wins.frustumCulled = false;
  const m4 = new THREE.Matrix4();
  let n = 0;
  const index = blocks.map((b) => {
    const ids = [];
    for (let r = 0; r < b.rows; r++) {
      for (let c = 0; c < b.cols; c++) {
        const px = b.x - b.w / 2 + (b.w / b.cols) * (c + 0.5);
        const py = 0.18 + (b.h - 0.34) * (r / Math.max(1, b.rows - 1));
        m4.makeTranslation(px, py, b.z + b.d / 2 + 0.008);
        wins.setMatrixAt(n, m4);
        wins.setColorAt(n, new THREE.Color(b.big ? C.paper : C.shade));
        ids.push(n); n++;
      }
    }
    return ids;
  });
  wins.instanceMatrix.needsUpdate = true;
  stage.root.add(wins);

  stage.fit(V(0, 0.38, 1), 1.44);

  return {
    update(t) {
      groups.forEach((g, i) => {
        g.scale.y = Math.max(0.001, smooth(clamp01((t - i * 0.014) / 0.44)));
      });
      const lt = clamp01((t - 0.46) / 0.42);
      blocks.forEach((b, bi) => {
        const on = Math.round(b.lit * clamp01(lt * 1.25));
        if (b.big) return;
        index[bi].forEach((wi, j) => {
          wins.setColorAt(wi, new THREE.Color(j < on ? C.ctx : C.rule));
        });
      });
      if (wins.instanceColor) wins.instanceColor.needsUpdate = true;

      // The camera sweeps around the block. A wide canvas has room for the sweep, so the
      // page's 16:10 figure gets the full one. A narrow canvas does not: the block walks
      // out of frame, so the sweep tightens to what the frame can hold.
      const amp = lerp(0.09, 0.21, clamp01((stage.camera.aspect - 0.8) / 0.7));
      const az = lerp(-0.81 * amp, amp, smooth(t));
      const ce = stage.fitCenter, rad = stage.fitRadius;
      stage.camera.position.set(
        ce.x + Math.sin(az) * rad,
        ce.y + 0.38 * rad,
        ce.z + Math.cos(az) * rad
      );
      stage.camera.lookAt(ce);
    },
  };
}

// ---------- 6. the cutaway ----------
function sceneCutaway(stage, D) {
  const H = 6.2, SC = 6500;
  const yOf = (v) => (v / SC) * H;
  const pairs = [
    { name: "Agriculture", med: 1813, mean: 2575, x: -1.65, w: 2.5 },
    { name: "Public admin", med: 4625, mean: 4838, x: 1.65, w: 2.5 },
  ];
  const cars = [], labs = [];

  pairs.forEach((p) => {
    const yMed = yOf(p.med), yMean = yOf(p.mean);
    const hw = p.w / 2, hd = 0.9;
    const bot = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]];
    stage.quad([V(p.x - hw, 0, -hd), V(p.x + hw, 0, -hd), V(p.x + hw, yMean, -hd), V(p.x - hw, yMean, -hd)], C.shade, 0.5);
    bot.forEach(([px, pz]) => stage.line([V(p.x + px, 0, pz), V(p.x + px, yMean, pz)], C.ink, 1.6));
    stage.loop(bot.map(([px, pz]) => V(p.x + px, yMean, pz)), C.ink, 2.1);
    stage.loop(bot.map(([px, pz]) => V(p.x + px, 0, pz)), C.ink, 2.1);
    stage.line([V(p.x - hw, yMed, hd), V(p.x + hw, yMed, hd)], C.ink, 2.5);
    stage.line([V(p.x - hw, yMean, hd), V(p.x + hw, yMean, hd)], C.accent, 2.5);
    stage.line([V(p.x - hw, 0.003, hd), V(p.x + hw, 0.003, hd)], C.ink, 1.4);

    const ghost = stage.box(0.9, 0.42, 0.7, C.ctx, 1.1, { opacity: 0.6, dash: true });
    ghost.position.set(p.x, yMed - 0.21, 0);
    stage.root.add(ghost);

    const car = stage.box(0.9, 0.42, 0.7, C.accent, 1.8);
    car.position.set(p.x, 0.21, 0);
    cars.push({ car, yMed, yMean });

    labs.push({
      nm: stage.label(p.name, "anchor-b"),
      ratio: stage.label((p.mean / p.med).toFixed(2) + "\u00d7", "anchor-b big accent"),
      p, hw, yMed, yMean,
    });
  });

  stage.extent(V(-4.2, 0, 0), V(4.2, yOf(4838) + 1.25, 0));
  stage.fit(V(0.05, 0.05, 1), 1.04);

  return {
    update(t) {
      const a = smooth(seg(t, 0, 0.36));
      const b = smooth(seg(t, 0.44, 0.9));
      cars.forEach((c) => {
        const y0 = 0.21, y1 = c.yMed - 0.21, y2 = c.yMean - 0.21;
        c.car.position.y = lerp(lerp(y0, y1, a), y2, b);
      });
      labs.forEach((L) => {
        stage.place(L.nm, V(L.p.x, L.yMean + 0.92, 0), true);
        stage.place(L.ratio, V(L.p.x, L.yMean + 0.46, 0), b > 0.25);
      });
    },
  };
}

// ---------- boot ----------
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.remove("no-js");
document.documentElement.classList.add("js");

const DATA = await fetch("./data.json").then((r) => r.json());
const SCENES = {
  lift: { build: (s) => sceneLift(s, DATA), duration: 1000 },
  floor: { build: (s) => sceneFloor(s, DATA), duration: 1000 },
  canyon: { build: (s) => sceneCanyon(s, DATA), duration: 1000 },
  section: { build: (s) => sceneSection(s, DATA), duration: 1000 },
  city: { build: (s) => sceneCity(s, DATA), duration: 1000 },
  cutaway: { build: (s) => sceneCutaway(s, DATA), duration: 1000 },
};

// Every scene plays in one second on the page. The video stretches a shot to the length of
// its voice line, so ?dur=<ms> overrides the duration for capture only. Nothing else changes.
const DUR_OVERRIDE = Number(new URLSearchParams(location.search).get("dur")) || 0;

// ---------- the click indicator ----------
// Same idea as tech-sovereignty: a finger that presses until you have clicked once,
// and a chip under every chart that says what the click will do.
const coarse = matchMedia("(pointer: coarse)").matches;
const VERB = coarse ? "Tap" : "Click";
const TAUGHT = "mw-taught";
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
