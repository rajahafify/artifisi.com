// The room: a WebGL picture of an event that tells Sidekick's story as you scroll.
//
// The back half of the room is the talk: a stage and rows of seats. You sit in one of them.
// The front half is the networking floor, with people standing in small groups.
// Your sidekick (the orange light) leaves your seat, scouts the floor, ranks three people,
// and when you both connect, a line joins your seat to theirs.
//
// Everything on screen is a function of one number, `progress` (0 to 1), plus a clock for
// small idle motion. Scrolling backwards plays the story backwards.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Points,
  RingGeometry,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
  CatmullRomCurve3,
  QuadraticBezierCurve3,
} from "three";

export interface Room {
  /** Where the story should be, 0 to 1. The scene eases toward it. */
  setProgress(p: number): void;
  /** Jump straight to a point in the story and draw once (used for reduced motion). */
  renderAt(p: number): void;
  setPointer(x: number, y: number): void;
  setActive(active: boolean): void;
  dispose(): void;
}

export interface RoomLabels {
  you?: HTMLElement | null;
  sidekick?: HTMLElement | null;
  picks: HTMLElement[];
}

const OAT = new Color("#ede4d3");
const SIGNAL = new Color("#ff5a36");
const BG = new Color("#0a1c15");

// Story phases, in progress units. Kept in one place so the copy can line up with them.
export const PHASES = {
  hero: [0, 0.12],
  checkin: [0.12, 0.32],
  scout: [0.32, 0.56],
  rank: [0.56, 0.78],
  match: [0.78, 1],
} as const;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// A small seeded random, so the room is the same on every visit.
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const vertex = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  uniform float uScale;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uScale / -mv.z;
    vColor = aColor;
    vAlpha = aAlpha * smoothstep(40.0, 12.0, -mv.z);
  }
`;
const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.2, 0.14, d);
    float glow = pow(smoothstep(0.5, 0.0, d), 2.2) * 0.55;
    float a = (core + glow) * vAlpha;
    if (a < 0.004) discard;
    gl_FragColor = vec4(vColor, a);
  }
`;

type Node = {
  base: Vector3; // resting place
  pos: Vector3; // where it is drawn this frame
  phase: number; // for idle motion
  kind: "seat" | "floor" | "speaker";
  scanAt: number; // scout progress (0 to 1) when the sidekick first passes; 2 = never
};

export function createRoom(canvas: HTMLCanvasElement, labels: RoomLabels, opts: { small: boolean }): Room | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  const dpr = Math.min(window.devicePixelRatio || 1, opts.small ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(BG, 1);

  const scene = new Scene();
  const camera = new PerspectiveCamera(34, 1, 0.1, 100);
  const rand = rng(7);

  // ---- People -------------------------------------------------------------------------
  const nodes: Node[] = [];
  // The talk: rows of seats facing a stage at the back.
  const seatRows = opts.small ? 4 : 5;
  const seatCols = opts.small ? 11 : 13;
  let youIndex = -1;
  for (let r = 0; r < seatRows; r++) {
    for (let c = 0; c < seatCols; c++) {
      const x = (c - (seatCols - 1) / 2) * 0.72;
      const z = -2.0 - r * 0.72;
      const isYou = r === 1 && c === Math.floor(seatCols / 2) - 2;
      if (!isYou && rand() > 0.72) continue; // some empty seats
      if (isYou) youIndex = nodes.length;
      nodes.push({ base: new Vector3(x, 0, z), pos: new Vector3(x, 0, z), phase: rand() * 6.28, kind: "seat", scanAt: 2 });
    }
  }
  nodes.push({ base: new Vector3(0, 0.2, -6.6), pos: new Vector3(0, 0.2, -6.6), phase: 0, kind: "speaker", scanAt: 2 });

  // The floor: groups of people talking.
  const groups = opts.small ? 13 : 19;
  for (let g = 0; g < groups; g++) {
    const gx = lerp(-8.6, 8.6, rand());
    const gz = lerp(1.0, 7.2, rand());
    const size = 2 + Math.floor(rand() * 5);
    const radius = 0.35 + size * 0.08;
    for (let k = 0; k < size; k++) {
      const a = (k / size) * Math.PI * 2 + rand() * 0.6;
      const p = new Vector3(gx + Math.cos(a) * radius, 0, gz + Math.sin(a) * radius);
      nodes.push({ base: p, pos: p.clone(), phase: rand() * 6.28, kind: "floor", scanAt: 2 });
    }
  }

  // The three people the sidekick ranks, placed on its route. #1 is the match.
  const pickSpots = [new Vector3(4.4, 0, 5.1), new Vector3(-5.2, 0, 3.0), new Vector3(1.2, 0, 6.6)];
  const picks = pickSpots.map((spot) => {
    nodes.push({ base: spot.clone(), pos: spot.clone(), phase: rand() * 6.28, kind: "floor", scanAt: 2 });
    return nodes.length - 1;
  });

  const you = nodes[youIndex];

  // The sidekick's route over the floor.
  const route = new CatmullRomCurve3([
    new Vector3(-0.6, 0, 0.4),
    new Vector3(-4.0, 0, 1.6),
    new Vector3(-6.4, 0, 3.4),
    new Vector3(-4.2, 0, 6.0),
    new Vector3(-0.4, 0, 6.8),
    new Vector3(3.2, 0, 6.2),
    new Vector3(6.4, 0, 4.0),
    new Vector3(4.6, 0, 1.8),
    new Vector3(1.6, 0, 3.2),
  ]);
  const routeEnd = route.getPoint(1);
  const SCAN_RADIUS = 2.6;
  // When does the sidekick first come within reach of each floor node?
  for (let s = 0; s <= 240; s++) {
    const t = s / 240;
    const p = route.getPoint(t);
    for (const n of nodes) {
      if (n.kind !== "floor" || n.scanAt <= 1) continue;
      if (Math.hypot(n.base.x - p.x, n.base.z - p.z) < SCAN_RADIUS) n.scanAt = t;
    }
  }

  const count = nodes.length;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);
  const peopleGeo = new BufferGeometry();
  peopleGeo.setAttribute("position", new BufferAttribute(positions, 3));
  peopleGeo.setAttribute("aColor", new BufferAttribute(colors, 3));
  peopleGeo.setAttribute("aSize", new BufferAttribute(sizes, 1));
  peopleGeo.setAttribute("aAlpha", new BufferAttribute(alphas, 1));

  const uniforms = { uScale: { value: 400 } };
  const pointMaterial = () =>
    new ShaderMaterial({
      uniforms,
      vertexShader: vertex,
      fragmentShader: fragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
  const people = new Points(peopleGeo, pointMaterial());
  scene.add(people);

  // ---- The floor: a faint dot grid gives the room depth -------------------------------
  const gridPts: number[] = [];
  const step = opts.small ? 0.7 : 0.55;
  for (let x = -11; x <= 11.01; x += step) for (let z = -8; z <= 8.5; z += step) gridPts.push(x, -0.02, z);
  const gridGeo = new BufferGeometry();
  const gridCount = gridPts.length / 3;
  gridGeo.setAttribute("position", new BufferAttribute(new Float32Array(gridPts), 3));
  gridGeo.setAttribute("aColor", new BufferAttribute(new Float32Array(gridCount * 3).fill(0.6), 3));
  gridGeo.setAttribute("aSize", new BufferAttribute(new Float32Array(gridCount).fill(0.07), 1));
  gridGeo.setAttribute("aAlpha", new BufferAttribute(new Float32Array(gridCount).fill(0.16), 1));
  const grid = new Points(gridGeo, pointMaterial());
  scene.add(grid);

  // The stage at the back: a lit edge.
  const stageGeo = new BufferGeometry().setFromPoints([new Vector3(-3.4, 0, -7.0), new Vector3(3.4, 0, -7.0)]);
  const stageMat = new LineBasicMaterial({ color: OAT, transparent: true, opacity: 0.55 });
  scene.add(new Line(stageGeo, stageMat));
  const stageGlow: number[] = [];
  for (let i = 0; i <= 40; i++) stageGlow.push(lerp(-3.4, 3.4, i / 40), 0, -7.0);
  const stageGlowGeo = new BufferGeometry();
  stageGlowGeo.setAttribute("position", new BufferAttribute(new Float32Array(stageGlow), 3));
  stageGlowGeo.setAttribute("aColor", new BufferAttribute(new Float32Array(41 * 3).fill(0.9), 3));
  stageGlowGeo.setAttribute("aSize", new BufferAttribute(new Float32Array(41).fill(0.22), 1));
  stageGlowGeo.setAttribute("aAlpha", new BufferAttribute(new Float32Array(41).fill(0.18), 1));
  scene.add(new Points(stageGlowGeo, pointMaterial()));

  // ---- Rings --------------------------------------------------------------------------
  const ring = (inner: number, outer: number, color: Color) => {
    const m = new Mesh(
      new RingGeometry(inner, outer, 96),
      new MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
    );
    m.rotation.x = -Math.PI / 2;
    scene.add(m);
    return m;
  };
  const youRing = ring(0.3, 0.33, OAT);
  const checkinRing = ring(0.96, 1.0, SIGNAL);
  const halo = ring(0.3, 0.335, SIGNAL);
  const scanRing = ring(0.985, 1.0, SIGNAL);
  const scanFill = ring(0.0, 1.0, SIGNAL);
  const pickRings = picks.map(() => ring(0.36, 0.39, OAT));

  // ---- Lines --------------------------------------------------------------------------
  const pickLines = picks.map(() => {
    const geo = new BufferGeometry().setFromPoints([new Vector3(), new Vector3()]);
    const line = new Line(geo, new LineBasicMaterial({ color: OAT, transparent: true, opacity: 0 }));
    scene.add(line);
    return line;
  });
  const ARC_SEGMENTS = 80;
  const matchNode = nodes[picks[0]];
  const arcCurve = new QuadraticBezierCurve3(
    you.base.clone(),
    new Vector3((you.base.x + matchNode.base.x) / 2, 3.6, (you.base.z + matchNode.base.z) / 2),
    matchNode.base.clone().setY(0.85), // where #1 floats once ranked
  );
  const arcGeo = new BufferGeometry().setFromPoints(arcCurve.getPoints(ARC_SEGMENTS));
  const arc = new Line(arcGeo, new LineBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.95 }));
  arc.geometry.setDrawRange(0, 0);
  scene.add(arc);

  // The sidekick and the spark that travels the match line.
  const lights = new Float32Array(2 * 3);
  const lightGeo = new BufferGeometry();
  lightGeo.setAttribute("position", new BufferAttribute(lights, 3));
  lightGeo.setAttribute("aColor", new BufferAttribute(new Float32Array([1, 0.5, 0.34, 1, 0.8, 0.7]), 3));
  lightGeo.setAttribute("aSize", new BufferAttribute(new Float32Array([0.62, 0.55]), 1));
  lightGeo.setAttribute("aAlpha", new BufferAttribute(new Float32Array([1, 0]), 1));
  const sidekick = new Points(lightGeo, pointMaterial());
  scene.add(sidekick);

  // ---- Camera path --------------------------------------------------------------------
  // [progress, camera position, look-at]
  const shots: [number, Vector3, Vector3][] = [
    [0.0, new Vector3(-4.6, 7.6, 15.5), new Vector3(-4.2, 0, -0.6)],
    [0.2, new Vector3(-2.6, 4.2, 4.2), new Vector3(-0.6, 0, -3.0)],
    [0.42, new Vector3(0.5, 13.5, 10.5), new Vector3(0, 0, 3.4)],
    [0.66, new Vector3(4.2, 7.4, 12.6), new Vector3(0.2, 0, 3.6)],
    [0.92, new Vector3(1.2, 9.6, 13.8), new Vector3(0.6, 0, 0.6)],
  ];
  // On narrow screens the hero copy fills the lower half, so the room sits higher and centred.
  const heroWide: [Vector3, Vector3] = [shots[0][1].clone(), shots[0][2].clone()];
  const heroNarrow: [Vector3, Vector3] = [new Vector3(0, 9.5, 18), new Vector3(0, 0, 6.5)];
  // Narrow screens can't fit all three picks, so the last two shots favour #1.
  const lateWide = shots.slice(3).map(([, a, l]) => [a.clone(), l.clone()] as [Vector3, Vector3]);
  const lateNarrow: [Vector3, Vector3][] = [
    [new Vector3(3.4, 9.5, 14.5), new Vector3(2.2, 0, 4.6)],
    [new Vector3(1.6, 10.5, 14.5), new Vector3(1.6, 0, 1.6)],
  ];
  const camPos = new Vector3();
  const camLook = new Vector3();
  function cameraAt(p: number) {
    let i = 0;
    while (i < shots.length - 2 && p > shots[i + 1][0]) i++;
    const [p0, a0, l0] = shots[i];
    const [p1, a1, l1] = shots[i + 1];
    const t = smooth(p0, p1, p);
    camPos.lerpVectors(a0, a1, t);
    camLook.lerpVectors(l0, l1, t);
  }

  // ---- Sizing -------------------------------------------------------------------------
  let width = 1;
  let height = 1;
  let distance = 1;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Narrow screens see less of the room sideways, so step back.
    distance = camera.aspect < 0.8 ? 1.75 : camera.aspect < 1.3 ? 1.3 : 1;
    const hero = camera.aspect < 0.8 ? heroNarrow : heroWide;
    shots[0][1].copy(hero[0]);
    shots[0][2].copy(hero[1]);
    const late = camera.aspect < 0.8 ? lateNarrow : lateWide;
    late.forEach(([a, l], k) => {
      shots[3 + k][1].copy(a);
      shots[3 + k][2].copy(l);
    });
    camera.updateProjectionMatrix();
    uniforms.uScale.value = (height / (2 * Math.tan((camera.fov * Math.PI) / 360))) * dpr;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // ---- Frame --------------------------------------------------------------------------
  let target = 0;
  let current = 0;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const sk = new Vector3();
  const tmp = new Vector3();
  const project = new Vector3();

  function place(el: HTMLElement | null | undefined, at: Vector3, opacity: number) {
    if (!el) return;
    project.copy(at).project(camera);
    const x = (project.x * 0.5 + 0.5) * width;
    const y = (-project.y * 0.5 + 0.5) * height;
    const onScreen = x > -10 && x < width + 10 && y > 60 && y < height + 10;
    const visible = opacity > 0.01 && project.z < 1 && onScreen;
    el.style.opacity = visible ? opacity.toFixed(3) : "0";
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    el.style.visibility = visible ? "visible" : "hidden";
    if (!visible) return;
    const pick = el.classList.contains("pick");
    const box = pick ? (el.firstElementChild as HTMLElement) : el;
    const w = box.offsetWidth;
    const room = width < 720 ? 16 : 150; // keep clear of the step rail on the right
    el.classList.toggle("flip", x + 18 + w > width - room);
    if (pick) el.classList.toggle("below", y - 18 - box.offsetHeight < 90);
  }

  function draw(p: number, time: number) {
    const checkin = smooth(PHASES.checkin[0], PHASES.checkin[1], p);
    const scoutT = smooth(PHASES.scout[0], PHASES.scout[1] - 0.02, p);
    const scouting = smooth(PHASES.scout[0] - 0.01, PHASES.scout[0] + 0.03, p) * (1 - smooth(PHASES.rank[0], PHASES.rank[0] + 0.05, p));
    const rank = smooth(PHASES.rank[0], PHASES.rank[0] + 0.1, p);
    const match = smooth(PHASES.match[0], PHASES.match[0] + 0.12, p);

    // Where the sidekick is.
    if (p < PHASES.scout[0]) {
      // Beside you, then out from your seat to the edge of the floor in a low arc.
      const orbit = tmp.set(Math.cos(time * 1.4) * 0.42, 0.35, Math.sin(time * 1.4) * 0.42).multiplyScalar(1 - checkin);
      const start = you.base;
      const end = route.getPoint(0);
      sk.set(lerp(start.x, end.x, checkin), lerp(0, 0, checkin) + Math.sin(checkin * Math.PI) * 1.6, lerp(start.z, end.z, checkin)).add(orbit);
    } else if (p < PHASES.rank[0]) {
      route.getPoint(scoutT, sk);
      sk.y = 0.25;
    } else {
      sk.copy(routeEnd);
      sk.y = 0.25 + Math.sin(time * 2) * 0.05;
    }

    // People.
    const dimOthers = rank * 0.62;
    for (let i = 0; i < count; i++) {
      const n = nodes[i];
      const pos = n.pos.copy(n.base);
      let size = 0.34;
      let alpha = 0.55;
      let r = OAT.r * 0.82;
      let g = OAT.g * 0.82;
      let b = OAT.b * 0.82;

      if (n.kind === "seat") {
        alpha = 0.42 * (1 - scouting * 0.4) * (1 - dimOthers * 0.5);
        size = 0.3;
        if (i === youIndex) {
          alpha = 1;
          size = 0.46;
          r = lerp(OAT.r, SIGNAL.r, match);
          g = lerp(OAT.g, SIGNAL.g, match);
          b = lerp(OAT.b, SIGNAL.b, match);
        }
      } else if (n.kind === "speaker") {
        pos.x += Math.sin(time * 0.5) * 0.8;
        size = 0.5;
        alpha = 0.9;
        r = OAT.r;
        g = OAT.g;
        b = OAT.b;
      } else {
        // People on the floor shift their weight a little.
        pos.x += Math.sin(time * 0.6 + n.phase) * 0.05;
        pos.z += Math.cos(time * 0.5 + n.phase * 1.3) * 0.05;
        const scanned = n.scanAt <= 1 ? smooth(n.scanAt, n.scanAt + 0.05, scoutT) : 0;
        // A flash as the scan ring passes over.
        const dist = Math.hypot(pos.x - sk.x, pos.z - sk.z);
        const ringR = ((time * 1.6) % 1) * SCAN_RADIUS;
        const flash = scouting * Math.exp(-Math.pow(dist - ringR, 2) * 10) * (dist < SCAN_RADIUS ? 1 : 0);
        alpha = 0.5 + scanned * 0.3 + flash * 0.6;
        size = 0.34 + flash * 0.16;
        const warm = flash * 0.7;
        r = lerp(r, SIGNAL.r, warm);
        g = lerp(g, SIGNAL.g, warm);
        b = lerp(b, SIGNAL.b, warm);
        const pick = picks.indexOf(i);
        if (pick >= 0) {
          const lift = rank * (pick === 0 ? 0.85 : 0.6);
          pos.y += lift;
          size = lerp(size, pick === 0 ? 0.78 : 0.62, rank);
          alpha = lerp(alpha, 1, rank);
          r = lerp(r, OAT.r, rank);
          g = lerp(g, OAT.g, rank);
          b = lerp(b, OAT.b, rank);
          if (pick === 0) {
            r = lerp(r, SIGNAL.r, match);
            g = lerp(g, SIGNAL.g, match);
            b = lerp(b, SIGNAL.b, match);
          } else {
            alpha *= 1 - match * 0.45;
          }
        } else {
          alpha *= 1 - dimOthers;
        }
      }
      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
      sizes[i] = size;
      alphas[i] = alpha;
    }
    peopleGeo.attributes.position.needsUpdate = true;
    peopleGeo.attributes.aColor.needsUpdate = true;
    peopleGeo.attributes.aSize.needsUpdate = true;
    peopleGeo.attributes.aAlpha.needsUpdate = true;

    // Sidekick light and the spark on the match line.
    lights[0] = sk.x;
    lights[1] = sk.y;
    lights[2] = sk.z;
    const sparkT = (time * 0.45) % 1;
    arcCurve.getPoint(sparkT, tmp);
    lights[3] = tmp.x;
    lights[4] = tmp.y;
    lights[5] = tmp.z;
    lightGeo.attributes.position.needsUpdate = true;
    (lightGeo.attributes.aAlpha as BufferAttribute).setX(1, smooth(0.9, 1, match) * Math.sin(sparkT * Math.PI));
    lightGeo.attributes.aAlpha.needsUpdate = true;

    // Rings.
    youRing.position.set(you.base.x, 0.01, you.base.z);
    youRing.scale.setScalar(1 + Math.sin(time * 2.2) * 0.06);
    (youRing.material as MeshBasicMaterial).opacity = 0.7;
    const ci = (time * 0.7) % 1;
    checkinRing.position.copy(youRing.position);
    checkinRing.scale.setScalar(0.3 + ci * 2.4);
    (checkinRing.material as MeshBasicMaterial).opacity = (1 - ci) * 0.6 * smooth(0.04, 0.14, p) * (1 - smooth(0.28, 0.34, p));
    halo.position.set(sk.x, 0.01, sk.z);
    halo.scale.setScalar(1 + Math.sin(time * 3) * 0.08);
    (halo.material as MeshBasicMaterial).opacity = 0.9;
    const ringR = ((time * 1.6) % 1) * SCAN_RADIUS;
    scanRing.position.set(sk.x, 0.005, sk.z);
    scanRing.scale.setScalar(Math.max(0.01, ringR));
    (scanRing.material as MeshBasicMaterial).opacity = scouting * (1 - ringR / SCAN_RADIUS) * 0.8;
    scanFill.position.set(sk.x, 0.0, sk.z);
    scanFill.scale.setScalar(SCAN_RADIUS);
    (scanFill.material as MeshBasicMaterial).opacity = scouting * 0.05;
    picks.forEach((idx, k) => {
      const m = pickRings[k];
      m.position.set(nodes[idx].pos.x, 0.01, nodes[idx].pos.z);
      m.scale.setScalar(1 + Math.sin(time * 2 + k) * 0.05);
      const mat = m.material as MeshBasicMaterial;
      mat.color.copy(k === 0 ? OAT.clone().lerp(SIGNAL, match) : OAT);
      mat.opacity = rank * (k === 0 ? 0.9 : 0.6 * (1 - match * 0.6));
    });

    // Lines from the sidekick to the three it ranked.
    picks.forEach((idx, k) => {
      const line = pickLines[k];
      const attr = line.geometry.attributes.position as BufferAttribute;
      attr.setXYZ(0, sk.x, sk.y, sk.z);
      const n = nodes[idx].pos;
      attr.setXYZ(1, n.x, n.y, n.z);
      attr.needsUpdate = true;
      const appear = smooth(PHASES.rank[0] + k * 0.03, PHASES.rank[0] + 0.08 + k * 0.03, p);
      (line.material as LineBasicMaterial).opacity = appear * 0.55 * (1 - match * 0.85);
    });

    // The match: a line drawn from your seat to theirs.
    arc.geometry.setDrawRange(0, Math.floor(smooth(PHASES.match[0], PHASES.match[0] + 0.14, p) * (ARC_SEGMENTS + 1)));

    // Camera, with a little drift toward the pointer.
    cameraAt(p);
    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;
    tmp.subVectors(camPos, camLook).multiplyScalar(distance);
    camera.position.copy(camLook).add(tmp);
    camera.position.x += pointer.sx * 0.9;
    camera.position.y += pointer.sy * 0.5;
    camera.lookAt(camLook);

    renderer.render(scene, camera);

    // HTML labels that follow points in the scene.
    place(labels.you, tmp.set(you.base.x, 0, you.base.z), smooth(0.07, 0.13, p) * (1 - scouting * 0.6));
    place(labels.sidekick, sk, smooth(0.02, 0.1, p) * (1 - rank));
    labels.picks.forEach((el, k) => {
      const n = nodes[picks[k]].pos;
      const show = smooth(PHASES.rank[0] + 0.04 + k * 0.03, PHASES.rank[0] + 0.1 + k * 0.03, p);
      const keep = k === 0 ? 1 : 1 - match * 0.7;
      place(el, n, show * keep);
      el.classList.toggle("is-match", k === 0 && match > 0.5);
    });
  }

  // ---- Loop ---------------------------------------------------------------------------
  let active = true;
  let raf = 0;
  const start = performance.now();
  function frame() {
    raf = 0;
    if (!active) return;
    current += (target - current) * 0.09;
    if (Math.abs(target - current) < 0.0005) current = target;
    draw(current, (performance.now() - start) / 1000);
    raf = requestAnimationFrame(frame);
  }
  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else if (active && !raf) raf = requestAnimationFrame(frame);
  };
  document.addEventListener("visibilitychange", onVisibility);
  raf = requestAnimationFrame(frame);

  return {
    setProgress(p) {
      target = clamp(p);
    },
    renderAt(p) {
      active = false;
      cancelAnimationFrame(raf);
      target = current = clamp(p);
      draw(current, 1.2);
    },
    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
    },
    setActive(on) {
      if (on === active) return;
      active = on;
      if (on && !raf) raf = requestAnimationFrame(frame);
    },
    dispose() {
      active = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      scene.traverse((o) => {
        const m = o as Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as { dispose?: () => void } | undefined;
        mat?.dispose?.();
      });
      renderer.dispose();
    },
  } satisfies Room;
}
