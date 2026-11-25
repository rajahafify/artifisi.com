// The room: a small 3D model of an event that tells Sidekick's story as you scroll.
//
// Back half: the talk. A stage with a slide, a speaker, and rows of chairs. You sit in one.
// Front half: the floor. People stand around cocktail tables, talking.
// Your sidekick (the orange orb) leaves your seat, visits each group on the floor, ranks three
// people, and when you both connect, a line joins your chair to theirs.
//
// Everything on screen is a function of one number, `progress` (0 to 1), plus a clock for idle
// motion. Scrolling backwards plays the story backwards.
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CapsuleGeometry,
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Fog,
  HemisphereLight,
  InstancedMesh,
  Line,
  LineDashedMaterial,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  QuadraticBezierCurve3,
  RingGeometry,
  SRGBColorSpace,
  Scene,
  SphereGeometry,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
} from "three";

export interface Room {
  setProgress(p: number): void;
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

// Story phases, in progress units. The page copy lines up with these.
export const PHASES = {
  hero: [0, 0.12],
  checkin: [0.12, 0.32],
  scout: [0.32, 0.56],
  rank: [0.56, 0.78],
  match: [0.78, 1],
} as const;

const PAPER = new Color("#f5efe3");
const FLOOR = new Color("#efe7d7");
const ZONE = new Color("#e6dcc8");
const PINE = new Color("#12402e");
const SIGNAL = new Color("#ff5a36");
const CHAIR = new Color("#d3c6ad");
const TABLE = new Color("#fbf8f1");
const CLOTHES = ["#8c9a90", "#6e7f75", "#b5a58a", "#9aa6a0", "#7f705f", "#a9b4ac", "#c2b39b", "#5f6f66"].map((c) => new Color(c));
const SKIN = ["#e8cfb0", "#d1a47e", "#a97b55", "#f1dcc4", "#7d5538", "#c58e64"].map((c) => new Color(c));

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Person = {
  x: number;
  z: number;
  face: number; // which way they face (radians)
  seated: boolean;
  clothes: Color;
  skin: Color;
  phase: number;
  scanAt: number; // scout progress when the sidekick reaches their group; 2 = never
};

// Text drawn onto a flat plane, for the floor zone labels and the slide on stage.
function textPlane(draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, w: number, h: number, px = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * px);
  canvas.height = Math.round(h * px);
  const ctx = canvas.getContext("2d")!;
  draw(ctx, canvas.width, canvas.height);
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  const mesh = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  return { mesh, redraw: () => (draw(ctx, canvas.width, canvas.height), (tex.needsUpdate = true)) };
}

export function createRoom(canvas: HTMLCanvasElement, labels: RoomLabels, opts: { small: boolean }): Room | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  const dpr = Math.min(window.devicePixelRatio || 1, opts.small ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(PAPER, 1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  scene.fog = new Fog(PAPER, 34, 60);
  const camera = new PerspectiveCamera(28, 1, 0.5, 120);
  const rand = rng(11);

  // ---- Light --------------------------------------------------------------------------
  scene.add(new HemisphereLight(0xffffff, 0xe6d9c2, 1.6));
  const sun = new DirectionalLight(0xfff4e6, 2.1);
  sun.position.set(7, 16, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(opts.small ? 1024 : 2048, opts.small ? 1024 : 2048);
  sun.shadow.camera.left = -14;
  sun.shadow.camera.right = 14;
  sun.shadow.camera.top = 14;
  sun.shadow.camera.bottom = -14;
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 50;
  sun.shadow.radius = 4;
  sun.shadow.bias = -0.0008;
  scene.add(sun);

  // ---- The room -----------------------------------------------------------------------
  const floor = new Mesh(new PlaneGeometry(90, 90), new MeshStandardMaterial({ color: FLOOR, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  // The talk area is a slightly darker rug.
  const rug = new Mesh(new PlaneGeometry(13.2, 7.6), new MeshStandardMaterial({ color: ZONE, roughness: 1 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.005, -4.6);
  rug.receiveShadow = true;
  scene.add(rug);

  const stageMat = new MeshStandardMaterial({ color: "#dccfb6", roughness: 0.9 });
  const stage = new Mesh(new BoxGeometry(8, 0.45, 2), stageMat);
  stage.position.set(0, 0.225, -7.6);
  stage.castShadow = stage.receiveShadow = true;
  scene.add(stage);

  // The slide on the screen behind the speaker.
  const slide = textPlane(
    (ctx, w, h) => {
      ctx.fillStyle = "#12402e";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ede4d3";
      ctx.font = `${Math.round(h * 0.11)}px "Geist Mono", monospace`;
      ctx.fillText("KEYNOTE", w * 0.07, h * 0.24);
      ctx.font = `${Math.round(h * 0.3)}px "Instrument Serif", Georgia, serif`;
      ctx.fillText("What comes next", w * 0.07, h * 0.62);
      ctx.fillStyle = "#ff5a36";
      ctx.fillRect(w * 0.07, h * 0.76, w * 0.12, h * 0.025);
    },
    5.6,
    2.5,
  );
  slide.mesh.position.set(0, 2.15, -8.45);
  scene.add(slide.mesh);
  const screenFrame = new Mesh(new BoxGeometry(5.8, 2.7, 0.1), new MeshStandardMaterial({ color: "#0d2e21" }));
  screenFrame.position.set(0, 2.15, -8.52);
  screenFrame.castShadow = true;
  scene.add(screenFrame);

  // Floor labels.
  const floorLabel = (text: string, x: number, z: number) => {
    const t = textPlane(
      (ctx, w, h) => {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "rgba(18, 64, 46, 0.55)";
        ctx.font = `500 ${Math.round(h * 0.56)}px "Geist Mono", monospace`;
        ctx.textBaseline = "middle";
        const spaced = text.split("").join(String.fromCharCode(8202));
        ctx.fillText(spaced, 4, h / 2);
      },
      3.4,
      0.5,
    );
    t.mesh.rotation.x = -Math.PI / 2;
    t.mesh.position.set(x + 1.7, 0.02, z);
    scene.add(t.mesh);
    return t;
  };
  const zoneLabels = [floorLabel("THE TALK", -6.4, -0.4), floorLabel("THE FLOOR", -9.6, 0.9)];
  // Canvas text needs the web fonts; redraw once they are in.
  document.fonts?.ready.then(() => {
    slide.redraw();
    zoneLabels.forEach((l) => l.redraw());
  });

  // ---- People -------------------------------------------------------------------------
  const people: Person[] = [];
  const chairs: Vector3[] = [];
  const rows = 5;
  const cols = 12;
  let youIndex = -1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // An aisle down the middle.
      const x = (c - (cols - 1) / 2) * 0.82 + (c >= cols / 2 ? 0.5 : -0.5);
      const z = -2.2 - r * 0.86;
      chairs.push(new Vector3(x, 0, z));
      const isYou = r === 1 && c === 3;
      if (!isYou && rand() > 0.74) continue;
      if (isYou) youIndex = people.length;
      people.push({
        x,
        z,
        face: Math.PI,
        seated: true,
        clothes: CLOTHES[Math.floor(rand() * CLOTHES.length)],
        skin: SKIN[Math.floor(rand() * SKIN.length)],
        phase: rand() * 6.28,
        scanAt: 2,
      });
    }
  }
  const speakerIndex = people.length;
  people.push({ x: 0.6, z: -7.4, face: 0, seated: false, clothes: new Color("#2b3a33"), skin: SKIN[1], phase: 0, scanAt: 2 });

  // Groups on the floor, each around a cocktail table, placed along the sidekick's route.
  const groupSpots: [number, number, number][] = [
    [-6.4, 1.8, 4],
    [-2.9, 2.4, 3],
    [-7.0, 5.4, 5],
    [-3.4, 6.6, 4],
    [0.4, 4.6, 4],
    [0.2, 8.0, 3],
    [3.8, 6.9, 4],
    [7.0, 5.6, 4],
    [7.2, 2.2, 3],
    [3.8, 2.0, 4],
  ];
  const tables: Vector3[] = [];
  const groupOf: number[] = [];
  groupSpots.forEach(([gx, gz, size], g) => {
    tables.push(new Vector3(gx, 0, gz));
    for (let k = 0; k < size; k++) {
      const a = (k / size) * Math.PI * 2 + g;
      const r = 0.72;
      const x = gx + Math.cos(a) * r;
      const z = gz + Math.sin(a) * r;
      groupOf[people.length] = g;
      people.push({
        x,
        z,
        face: Math.atan2(gx - x, gz - z),
        seated: false,
        clothes: CLOTHES[Math.floor(rand() * CLOTHES.length)],
        skin: SKIN[Math.floor(rand() * SKIN.length)],
        phase: rand() * 6.28,
        scanAt: 2,
      });
    }
  });
  // The three picks: one person in each of three groups. #1 (Daniel) is the match.
  const firstOf = (g: number) => groupOf.findIndex((v) => v === g);
  const picks = [firstOf(6) + 1, firstOf(0) + 2, firstOf(4)];
  picks.forEach((i, k) => (people[i].clothes = [new Color("#3f6f5a"), new Color("#7a5f86"), new Color("#a86a4a")][k]));

  const you = people[youIndex];
  you.clothes = PINE.clone();

  // The sidekick's route: from your seat over to the floor, past every group.
  const route = new CatmullRomCurve3(
    [
      [0, 0.6],
      [-4.6, 0.9],
      [-8.4, 3.6],
      [-5.4, 8.2],
      [-1.4, 6.0],
      [1.8, 9.2],
      [5.6, 8.6],
      [8.8, 4.0],
      [5.6, 0.6],
      [2.2, 3.8],
    ].map(([x, z]) => new Vector3(x, 1.7, z)),
  );
  const routeEnd = route.getPoint(1);
  // When the sidekick first comes near each table, its whole group counts as scouted.
  groupSpots.forEach(([gx, gz], g) => {
    let at = 2;
    for (let s = 0; s <= 300; s++) {
      const p = route.getPoint(s / 300);
      if (Math.hypot(p.x - gx, p.z - gz) < 2.0) {
        at = s / 300;
        break;
      }
    }
    people.forEach((p, i) => {
      if (groupOf[i] === g) p.scanAt = at;
    });
  });

  // ---- Meshes (instanced, so the whole crowd is a handful of draw calls) ---------------
  const n = people.length;
  const bodyGeo = new CapsuleGeometry(0.2, 0.5, 6, 14);
  bodyGeo.translate(0, 0.45, 0);
  const headGeo = new SphereGeometry(0.17, 20, 14);
  const bodies = new InstancedMesh(bodyGeo, new MeshStandardMaterial({ roughness: 0.85 }), n);
  const heads = new InstancedMesh(headGeo, new MeshStandardMaterial({ roughness: 0.7 }), n);
  bodies.castShadow = heads.castShadow = true;
  bodies.receiveShadow = true;
  scene.add(bodies, heads);

  const chairGeo = new BoxGeometry(0.46, 0.42, 0.46);
  chairGeo.translate(0, 0.21, 0);
  const chairMesh = new InstancedMesh(chairGeo, new MeshStandardMaterial({ color: CHAIR, roughness: 0.95 }), chairs.length);
  chairMesh.castShadow = chairMesh.receiveShadow = true;
  const backGeo = new BoxGeometry(0.46, 0.5, 0.08);
  backGeo.translate(0, 0.67, 0.19);
  const chairBacks = new InstancedMesh(backGeo, chairMesh.material, chairs.length);
  chairBacks.castShadow = true;
  const dummy = new Object3D();
  chairs.forEach((c, i) => {
    dummy.position.copy(c);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    chairMesh.setMatrixAt(i, dummy.matrix);
    chairBacks.setMatrixAt(i, dummy.matrix);
  });
  scene.add(chairMesh, chairBacks);

  const tableGeo = new CylinderGeometry(0.34, 0.34, 0.05, 28);
  tableGeo.translate(0, 1.05, 0);
  const legGeo = new CylinderGeometry(0.04, 0.06, 1.05, 10);
  legGeo.translate(0, 0.52, 0);
  const tableTops = new InstancedMesh(tableGeo, new MeshStandardMaterial({ color: TABLE, roughness: 0.6 }), tables.length);
  const tableLegs = new InstancedMesh(legGeo, new MeshStandardMaterial({ color: "#cbbd9f" }), tables.length);
  tableTops.castShadow = tableLegs.castShadow = true;
  tables.forEach((t, i) => {
    dummy.position.copy(t);
    dummy.updateMatrix();
    tableTops.setMatrixAt(i, dummy.matrix);
    tableLegs.setMatrixAt(i, dummy.matrix);
  });
  scene.add(tableTops, tableLegs);

  // "Seen" marks: a thin ring at the feet of everyone the sidekick has scouted.
  const seenGeo = new RingGeometry(0.3, 0.36, 40);
  seenGeo.rotateX(-Math.PI / 2);
  const seen = new InstancedMesh(seenGeo, new MeshBasicMaterial({ color: PINE, transparent: true, opacity: 0.35, depthWrite: false }), n);
  scene.add(seen);

  // Rings under you, the picks and the sidekick's scan.
  const flatRing = (inner: number, outer: number, color: Color, opacity = 0) => {
    const g = new RingGeometry(inner, outer, 64);
    g.rotateX(-Math.PI / 2);
    const m = new Mesh(g, new MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
    scene.add(m);
    return m;
  };
  const youRing = flatRing(0.42, 0.5, PINE, 0.9);
  const youPulse = flatRing(0.95, 1.0, SIGNAL);
  const scanRing = flatRing(0.97, 1.0, SIGNAL);
  const scanDisc = new Mesh(new CircleGeometry(1, 48).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0, depthWrite: false }));
  scene.add(scanDisc);
  const pickRings = picks.map(() => flatRing(0.42, 0.52, PINE));

  // A map pin over your head, so you can always find yourself.
  const pinMat = new MeshStandardMaterial({ color: PINE, roughness: 0.5 });
  const pin = new Mesh(new SphereGeometry(0.17, 24, 16), pinMat);
  const pinTip = new Mesh(new ConeGeometry(0.15, 0.32, 24), pinMat);
  pinTip.rotation.x = Math.PI;
  pinTip.position.y = -0.2;
  pin.add(pinTip);
  pin.castShadow = pinTip.castShadow = true;
  scene.add(pin);

  // The sidekick: a small glowing orb with a soft light of its own.
  const orb = new Mesh(new SphereGeometry(0.2, 32, 20), new MeshStandardMaterial({ color: SIGNAL, emissive: SIGNAL, emissiveIntensity: 0.9, roughness: 0.3 }));
  orb.castShadow = true;
  const orbHalo = new Mesh(new SphereGeometry(0.36, 24, 16), new MeshBasicMaterial({ color: SIGNAL, transparent: true, opacity: 0.18, depthWrite: false }));
  const orbLight = new PointLight(SIGNAL, 6, 4.5, 2);
  scene.add(orb, orbHalo, orbLight);
  const orbShadow = new Mesh(new CircleGeometry(0.3, 32).rotateX(-Math.PI / 2), new MeshBasicMaterial({ color: "#000", transparent: true, opacity: 0.08, depthWrite: false }));
  scene.add(orbShadow);
  // A dotted trail that shows where the sidekick has been.
  const trailPts = route.getPoints(240).map((p) => new Vector3(p.x, 0.03, p.z));
  const trail = new Line(new BufferGeometry().setFromPoints(trailPts), new LineDashedMaterial({ color: SIGNAL, dashSize: 0.18, gapSize: 0.16, transparent: true, opacity: 0.7 }));
  trail.computeLineDistances();
  trail.geometry.setDrawRange(0, 0);
  scene.add(trail);

  // Lines from the sidekick to the three it ranked.
  const pickLines = picks.map(() => {
    const line = new Line(
      new BufferGeometry().setFromPoints([new Vector3(), new Vector3()]),
      new LineDashedMaterial({ color: PINE, dashSize: 0.14, gapSize: 0.1, transparent: true, opacity: 0 }),
    );
    scene.add(line);
    return line;
  });

  // The match: a line from your chair to theirs, drawn as a tube so it reads on a light floor.
  const match = people[picks[0]];
  const arcCurve = new QuadraticBezierCurve3(
    new Vector3(you.x, 1.25, you.z),
    new Vector3((you.x + match.x) / 2, 4.6, (you.z + match.z) / 2),
    new Vector3(match.x, 1.6, match.z),
  );
  const ARC = 120;
  const arcGeo = new TubeGeometry(arcCurve, ARC, 0.035, 8, false);
  const arc = new Mesh(arcGeo, new MeshBasicMaterial({ color: SIGNAL }));
  const arcIndexCount = arcGeo.index!.count;
  arcGeo.setDrawRange(0, 0);
  scene.add(arc);
  const spark = new Mesh(new SphereGeometry(0.09, 16, 12), new MeshBasicMaterial({ color: SIGNAL }));
  scene.add(spark);

  // ---- Camera -------------------------------------------------------------------------
  // [progress, camera position, look-at]
  const shots: [number, Vector3, Vector3][] = [
    [0.0, new Vector3(-13, 18, 28), new Vector3(-7.4, 0, 0.6)],
    [0.2, new Vector3(-10, 11, 9.5), new Vector3(-4.2, 0.6, -3.2)],
    [0.42, new Vector3(-2, 23, 18), new Vector3(-1.2, 0, 4.2)],
    [0.66, new Vector3(-4, 13.5, 19), new Vector3(-0.4, 0.6, 4.8)],
    [0.92, new Vector3(-9, 15, 19), new Vector3(-0.6, 0.6, 0.8)],
  ];
  const wide = shots.map(([, a, l]) => [a.clone(), l.clone()] as [Vector3, Vector3]);
  // Portrait screens: centre the room and frame the top pick.
  const narrow: [Vector3, Vector3][] = [
    [new Vector3(0, 30, 23), new Vector3(0, 0, 5.5)],
    [new Vector3(-5, 8.5, 6), new Vector3(-2.6, 0.6, -3.6)],
    [new Vector3(0, 24, 15), new Vector3(0, 0, 4.4)],
    [new Vector3(3, 14, 16), new Vector3(2.6, 0.6, 5.6)],
    [new Vector3(2, 24, 17), new Vector3(1, 0.6, 2.8)],
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

  let width = 1;
  let height = 1;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = camera.aspect < 0.8 ? 38 : camera.aspect < 1.3 ? 32 : 28;
    camera.updateProjectionMatrix();
    const set = camera.aspect < 0.8 ? narrow : wide;
    set.forEach(([a, l], k) => {
      shots[k][1].copy(a);
      shots[k][2].copy(l);
    });
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
  const col = new Color();
  const hidden = new Matrix4().makeScale(0, 0, 0);

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
    const room = width < 720 ? 16 : 150; // keep clear of the step rail on the right
    el.classList.toggle("flip", x + 18 + box.offsetWidth > width - room);
    if (pick) el.classList.toggle("below", y - 18 - box.offsetHeight < 90);
  }

  function draw(p: number, time: number) {
    const checkin = smooth(PHASES.checkin[0], PHASES.checkin[1], p);
    const scoutT = smooth(PHASES.scout[0], PHASES.scout[1] - 0.02, p);
    const scouting = smooth(PHASES.scout[0] - 0.01, PHASES.scout[0] + 0.03, p) * (1 - smooth(PHASES.rank[0], PHASES.rank[0] + 0.05, p));
    const rank = smooth(PHASES.rank[0], PHASES.rank[0] + 0.1, p);
    const matched = smooth(PHASES.match[0], PHASES.match[0] + 0.12, p);

    // Where the sidekick is: beside your head, then over to the floor, then along its route.
    const bob = Math.sin(time * 2.4) * 0.08;
    if (p < PHASES.scout[0]) {
      const orbit = tmp.set(Math.cos(time * 1.3) * 0.55, 0, Math.sin(time * 1.3) * 0.55).multiplyScalar(1 - checkin);
      const start = tmp.clone().add(new Vector3(you.x, 1.55, you.z));
      const end = route.getPoint(0);
      sk.lerpVectors(start, end, checkin);
      sk.y += Math.sin(checkin * Math.PI) * 1.8;
      void orbit;
    } else if (p < PHASES.rank[0]) {
      route.getPoint(scoutT, sk);
    } else {
      sk.copy(routeEnd);
    }
    sk.y += bob;

    // People.
    const dim = rank * 0.7;
    for (let i = 0; i < n; i++) {
      const pp = people[i];
      const pick = picks.indexOf(i);
      const isYou = i === youIndex;
      let x = pp.x;
      let z = pp.z;
      let face = pp.face;
      let y = 0;
      let scaleY = 1;
      if (pp.seated) {
        y = 0.32;
        scaleY = 0.82;
        face = Math.PI + Math.sin(time * 0.3 + pp.phase) * 0.05;
      } else if (i === speakerIndex) {
        x += Math.sin(time * 0.45) * 1.2;
        y = 0.45;
        face = Math.sin(time * 0.45 + 1.2) * 0.6;
      } else {
        // Standing people shift their weight and turn a little as they talk.
        face += Math.sin(time * 0.7 + pp.phase) * 0.25;
        y = Math.max(0, Math.sin(time * 1.6 + pp.phase)) * 0.025;
      }
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, face, 0);
      dummy.scale.set(1, scaleY, 1);
      dummy.updateMatrix();
      bodies.setMatrixAt(i, dummy.matrix);
      const headY = y + (pp.seated ? 0.98 : 1.12);
      dummy.position.set(x, headY, z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      heads.setMatrixAt(i, dummy.matrix);

      // Colour: fade everyone but you and the picks once the list is ready.
      let fade = 0;
      if (!isYou && pick < 0 && i !== speakerIndex) fade = dim;
      if (pick > 0) fade = matched * 0.35;
      col.copy(pp.clothes);
      col.lerp(PAPER, fade);
      bodies.setColorAt(i, col);
      col.copy(pp.skin).lerp(PAPER, fade);
      heads.setColorAt(i, col);

      // Seen rings.
      const s = pp.scanAt <= 1 ? smooth(pp.scanAt, pp.scanAt + 0.04, scoutT) * (1 - rank) : 0;
      if (s > 0.01) {
        dummy.position.set(x, 0.015, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(0.6 + s * 0.4);
        dummy.updateMatrix();
        seen.setMatrixAt(i, dummy.matrix);
      } else seen.setMatrixAt(i, hidden);
    }
    bodies.instanceMatrix.needsUpdate = true;
    heads.instanceMatrix.needsUpdate = true;
    bodies.instanceColor!.needsUpdate = true;
    heads.instanceColor!.needsUpdate = true;
    seen.instanceMatrix.needsUpdate = true;

    // The sidekick.
    orb.position.copy(sk);
    orbHalo.position.copy(sk);
    orbHalo.scale.setScalar(1 + Math.sin(time * 3) * 0.12);
    orbLight.position.copy(sk);
    orbShadow.position.set(sk.x, 0.012, sk.z);
    const trailCount = p < PHASES.scout[0] ? 0 : Math.floor((p < PHASES.rank[0] ? scoutT : 1) * 241);
    trail.geometry.setDrawRange(0, trailCount);
    (trail.material as LineDashedMaterial).opacity = 0.75 * (1 - matched * 0.7);

    pin.position.set(you.x, 1.85 + Math.sin(time * 2) * 0.06, you.z);
    pin.rotation.y = time * 0.8;
    pinMat.color.copy(PINE).lerp(SIGNAL, matched);

    // Rings.
    youRing.position.set(you.x, 0.02, you.z);
    const pulse = (time * 0.8) % 1;
    youPulse.position.set(you.x, 0.021, you.z);
    youPulse.scale.setScalar(0.5 + pulse * 1.8);
    (youPulse.material as MeshBasicMaterial).opacity = (1 - pulse) * 0.7 * (smooth(0.08, 0.16, p) * (1 - smooth(0.28, 0.34, p)) + matched);
    (youRing.material as MeshBasicMaterial).color.copy(PINE).lerp(SIGNAL, matched);
    const sweep = (time * 1.4) % 1;
    scanRing.position.set(sk.x, 0.022, sk.z);
    scanRing.scale.setScalar(0.3 + sweep * 2.2);
    (scanRing.material as MeshBasicMaterial).opacity = scouting * (1 - sweep) * 0.9;
    scanDisc.position.set(sk.x, 0.018, sk.z);
    scanDisc.scale.setScalar(2.5);
    (scanDisc.material as MeshBasicMaterial).opacity = scouting * 0.08;
    picks.forEach((idx, k) => {
      const ring = pickRings[k];
      ring.position.set(people[idx].x, 0.02, people[idx].z);
      const mat = ring.material as MeshBasicMaterial;
      mat.color.copy(PINE);
      if (k === 0) mat.color.lerp(SIGNAL, matched);
      mat.opacity = rank * (k === 0 ? 1 : 0.8 * (1 - matched * 0.6));
    });

    picks.forEach((idx, k) => {
      const line = pickLines[k];
      const attr = line.geometry.attributes.position as BufferAttribute;
      attr.setXYZ(0, sk.x, sk.y, sk.z);
      attr.setXYZ(1, people[idx].x, 1.3, people[idx].z);
      attr.needsUpdate = true;
      line.computeLineDistances();
      const appear = smooth(PHASES.rank[0] + k * 0.03, PHASES.rank[0] + 0.08 + k * 0.03, p);
      (line.material as LineDashedMaterial).opacity = appear * 0.75 * (1 - matched);
    });

    // The match line, drawn from your chair to theirs, with a spark travelling along it.
    const draw = smooth(PHASES.match[0], PHASES.match[0] + 0.14, p);
    arcGeo.setDrawRange(0, Math.floor((draw * arcIndexCount) / 6) * 6);
    const sparkT = (time * 0.4) % 1;
    arcCurve.getPoint(sparkT, spark.position);
    spark.visible = draw > 0.98;

    // Camera, with a little drift toward the pointer.
    cameraAt(p);
    if (camera.aspect < 0.8) {
      // Portrait screens can't see the whole floor, so follow the sidekick while it scouts.
      const dx = (clamp(sk.x, -5, 5) * 0.8 - camLook.x) * scouting;
      const dz = (sk.z + 2.5 - camLook.z) * scouting * 0.6;
      camLook.x += dx;
      camPos.x += dx;
      camLook.z += dz;
      camPos.z += dz;
    }
    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;
    camera.position.copy(camPos);
    camera.position.x += pointer.sx * 0.8;
    camera.position.y -= pointer.sy * 0.5;
    camera.lookAt(camLook);

    renderer.render(scene, camera);

    // HTML labels.
    place(labels.you, tmp.set(you.x, 2.1, you.z), smooth(0.07, 0.13, p) * (1 - scouting * 0.5));
    place(labels.sidekick, sk, smooth(0.07, 0.13, p) * (1 - rank));
    labels.picks.forEach((el, k) => {
      const pp = people[picks[k]];
      const show = smooth(PHASES.rank[0] + 0.04 + k * 0.03, PHASES.rank[0] + 0.1 + k * 0.03, p);
      const keep = k === 0 ? 1 : 1 - matched * 0.65;
      place(el, tmp.set(pp.x, 1.55, pp.z), show * keep);
      el.classList.toggle("is-match", k === 0 && matched > 0.5);
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
      // Fonts may arrive after the still frame; draw it again once they do.
      document.fonts?.ready.then(() => draw(current, 1.2));
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
        const mat = m.material as { dispose?: () => void; map?: { dispose(): void } } | undefined;
        mat?.map?.dispose();
        mat?.dispose?.();
      });
      renderer.dispose();
    },
  } satisfies Room;
}
