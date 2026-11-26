// The room: a small 3D model of an event that tells Sidekick's story as you scroll.
//
// Back half: the talk. A stage with a slide, a speaker, and rows of chairs. You sit in one.
// Front half: the floor. People stand around cocktail tables, talking.
//
// The story is four actions, each happening in place while the camera holds still:
//   1. You check in. A ripple spreads from your seat and your sidekick (green Buddy) appears.
//   2. Everyone else checks in. A grey Buddy appears beside each of them.
//   3. The sidekicks talk. Yours talks to many of theirs at once; other pairs talk too.
//   4. Match or pass. Your conversations resolve: a match, a connect that waits, a pass.
// Green is always yours; grey is everyone else's.
//
// Everything on screen is a function of one number, `progress` (0 to 1), plus a clock for idle
// motion. Scrolling backwards plays the story backwards.
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  BoxGeometry,
  CanvasTexture,
  CapsuleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Fog,
  HemisphereLight,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFSoftShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  RingGeometry,
  SRGBColorSpace,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from "three";

export interface Room {
  setProgress(p: number): void;
  /** Draw one frame. Called from the page's shared animation loop (GSAP's ticker), in seconds. */
  tick(seconds: number): void;
  renderAt(p: number): void;
  setPointer(x: number, y: number): void;
  setActive(active: boolean): void;
  dispose(): void;
}

export interface RoomLabels {
  you?: HTMLElement | null;
  sidekick?: HTMLElement | null;
  /** Step 3: one pair of bubbles per conversation, your sidekick's and theirs. */
  pairs?: { mine: HTMLElement; theirs: HTMLElement }[];
  /** Step 3: grey pairs talking among themselves. */
  others?: HTMLElement[];
}

// Story phases, in progress units. The page copy lines up with these.
import { PHASES } from "./phases";
import { makeBuddy } from "./buddy3d";
export { PHASES };

const PAPER = new Color("#f5efe3");
const FLOOR = new Color("#efe7d7");
const ZONE = new Color("#e6dcc8");
const PINE = new Color("#12402e");
const SIGNAL = new Color("#ff5a36");
// Your sidekick is green; everyone else's is grey.
const GREEN = new Color("#1f7a52");
const GREY = new Color("#b8bdb4");
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
  /** When this person checks in, in progress units; 2 = they don't, so no sidekick. */
  checkIn: number;
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

export type Tier = "high" | "low";

// The room builds itself on first load: chairs and people pop up from the stage forward.
const backOut = (t: number) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);

// Soft contact shadow used when real-time shadows are off.
function blobTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(70, 52, 30, 0.34)");
  grad.addColorStop(0.55, "rgba(70, 52, 30, 0.14)");
  grad.addColorStop(1, "rgba(70, 52, 30, 0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/**
 * `tier` "high" draws real-time soft shadows; "low" (phones, small GPUs) uses baked-looking
 * contact shadows and a lower pixel ratio. A "high" room that can't hold ~40fps drops to "low".
 */
export function createRoom(canvas: HTMLCanvasElement, labels: RoomLabels, opts: { small: boolean; tier: Tier }): Room | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  const dpr = Math.min(window.devicePixelRatio || 1, opts.small ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.setClearColor(PAPER, 1);
  let tier: Tier = opts.tier;
  renderer.shadowMap.enabled = tier === "high";
  renderer.shadowMap.type = PCFSoftShadowMap;

  const scene = new Scene();
  scene.fog = new Fog(PAPER, 34, 60);
  const camera = new PerspectiveCamera(28, 1, 0.5, 120);
  const rand = rng(11);

  // ---- Light --------------------------------------------------------------------------
  scene.add(new HemisphereLight(0xffffff, 0xe6d9c2, 1.6));
  const sun = new DirectionalLight(0xfff4e6, 2.1);
  sun.position.set(7, 16, 9);
  sun.castShadow = tier === "high";
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
      ctx.font = `${Math.round(h * 0.11)}px "Inter", sans-serif`;
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
        ctx.font = `500 ${Math.round(h * 0.56)}px "Inter", sans-serif`;
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
        checkIn: 2,
      });
    }
  }
  const speakerIndex = people.length;
  people.push({ x: 0.6, z: -7.4, face: 0, seated: false, clothes: new Color("#2b3a33"), skin: SKIN[1], phase: 0, checkIn: 2 });

  // Groups on the floor, each around a cocktail table.
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
        checkIn: 2,
      });
    }
  });
  // The three picks: one person in each of three groups. #1 (Daniel) is the match.
  const firstOf = (g: number) => groupOf.findIndex((v) => v === g);
  const picks = [firstOf(6) + 1, firstOf(0) + 2, firstOf(4)];
  picks.forEach((i, k) => (people[i].clothes = [new Color("#3f6f5a"), new Color("#7a5f86"), new Color("#a86a4a")][k]));

  const you = people[youIndex];
  you.clothes = PINE.clone();

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

  // Contact shadows for the low tier: one soft blob under each person and table.
  const blobs = new InstancedMesh(
    new PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
    new MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false }),
    n + tables.length,
  );
  blobs.visible = tier === "low";
  scene.add(blobs);

  // Rings under you, the picks and the sidekick's scan.
  const flatRing = (inner: number, outer: number, color: Color, opacity = 0) => {
    const g = new RingGeometry(inner, outer, 64);
    g.rotateX(-Math.PI / 2);
    const m = new Mesh(g, new MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
    scene.add(m);
    return m;
  };
  const youRing = flatRing(0.42, 0.5, GREEN, 0.9);
  const youPulse = flatRing(0.95, 1.0, GREEN);
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

  // ---- Who checks in, and when ----------------------------------------------------------
  // Everyone on the floor and most of the audience check in during step 2, in a scattered order.
  // You check in during step 1. The speaker and a few seats never do, so not everyone has a sidekick.
  const [arriveA, arriveB] = PHASES.arrive;
  people.forEach((pp, i) => {
    if (i === youIndex || i === speakerIndex) return;
    if (pp.seated && rand() > 0.62) return;
    pp.checkIn = lerp(arriveA + 0.015, arriveB - 0.05, rand());
  });
  // The picks check in early, so their sidekicks are there to talk to.
  picks.forEach((i) => (people[i].checkIn = lerp(arriveA + 0.02, arriveA + 0.08, rand())));
  const checkInAt = PHASES.checkin[0] + (PHASES.checkin[1] - PHASES.checkin[0]) * 0.35;

  // Where a person's sidekick floats: beside them, at shoulder height.
  const sidekickAt = (i: number, out = new Vector3()) => {
    const pp = people[i];
    return out.set(pp.x + 0.42, pp.seated ? 1.3 : 1.62, pp.z + 0.12);
  };

  // ---- Grey sidekicks (everyone else's): instanced, so a whole room is three draw calls ------
  const others = people.map((pp, i) => ({ i, pp })).filter(({ pp, i }) => pp.checkIn <= 1 && i !== youIndex);
  const greyBody = new InstancedMesh(
    new RoundedBoxGeometry(1.4, 1.2, 0.9, 6, 0.45),
    new MeshStandardMaterial({ color: GREY, roughness: 0.45 }),
    others.length,
  );
  const greyEyes = new InstancedMesh(new SphereGeometry(1, 14, 10), new MeshStandardMaterial({ color: "#3f4c45", roughness: 0.4 }), others.length * 2);
  const greyCheeks = new InstancedMesh(new SphereGeometry(1, 12, 8), new MeshStandardMaterial({ color: "#e9a08c", roughness: 0.7 }), others.length * 2);
  greyBody.castShadow = true;
  scene.add(greyBody, greyEyes, greyCheeks);
  const eyeLocal = [-0.22, 0.22].map((x) => new Matrix4().compose(new Vector3(x, 0.08, 0.42), new Quaternion(), new Vector3(0.11, 0.14, 0.06)));
  const cheekLocal = [-0.38, 0.38].map((x) => new Matrix4().compose(new Vector3(x, -0.14, 0.39), new Quaternion(), new Vector3(0.1, 0.06, 0.035)));
  const GREY_SIZE = 0.27;

  // ---- Your sidekick: the logo, in 3D, in green ------------------------------------------
  const buddy = makeBuddy({ body: GREEN, features: "#fbf9f4", cheeks: SIGNAL, shadows: true, glow: 0.12 });
  const mine = buddy.group;
  buddy.setWink(true);
  scene.add(mine);
  const mineAt = sidekickAt(youIndex).add(new Vector3(0.18, 0.28, 0));
  const MINE_SIZE = 0.44;

  // ---- Step 3: conversations -----------------------------------------------------------
  // Your sidekick doesn't travel: a green Buddy pops up beside each grey one it talks to, so it is
  // in several conversations at once (the three picks first). A few grey pairs talk too.
  const yourTalks = [picks[0], picks[1], picks[2], firstOf(7), firstOf(8) + 1].slice(0, opts.small ? 3 : 5);
  const pairCandidates: [number, number][] = [
    [firstOf(1), firstOf(9)],
    [firstOf(2) + 1, firstOf(3)],
    [firstOf(5) + 1, firstOf(4) + 1],
    [firstOf(0), firstOf(1) + 1],
  ];
  const otherPairs = pairCandidates.filter(([a, b]) => people[a]?.checkIn <= 1 && people[b]?.checkIn <= 1 && !yourTalks.includes(a) && !yourTalks.includes(b));
  const clones = yourTalks.map((i, k) => {
    const b = makeBuddy({ body: GREEN, features: "#fbf9f4", cheeks: SIGNAL, glow: 0.12, seed: k + 3 });
    b.group.visible = false;
    scene.add(b.group);
    // Just to the right of their grey Buddy, a touch higher, so the two read as a pair.
    return { b, at: sidekickAt(i).add(new Vector3(0.5, 0.06, 0.05)) };
  });
  // A soft green ring on the floor where each one pops in.
  const cloneRings = yourTalks.map(() => flatRing(0.3, 0.38, GREEN));

  // ---- Camera ---------------------------------------------------------------------------
  // Two framings only: the hero, then one view of the whole room for all four steps. The move
  // between them happens once, as step 1 begins; after that the camera only drifts slightly in.
  const shots = {
    hero: [new Vector3(-13, 18, 28), new Vector3(-7.4, 0, 0.6)],
    story: [new Vector3(-9.5, 14.5, 19.5), new Vector3(-0.2, 0.6, 1.0)],
  };
  const wide = { hero: shots.hero.map((v) => v.clone()), story: shots.story.map((v) => v.clone()) };
  const narrow = {
    hero: [new Vector3(0, 30, 23), new Vector3(0, 0, 5.5)],
    // Looks a little further into the floor, so the room sits in the top part of the screen,
    // above the step's copy.
    story: [new Vector3(1.2, 27, 15.5), new Vector3(0.9, 0.6, 4.6)],
  };
  const camPos = new Vector3();
  const camLook = new Vector3();
  function cameraAt(p: number) {
    const t = smooth(PHASES.checkin[0] - 0.02, PHASES.checkin[0] + 0.08, p);
    camPos.lerpVectors(shots.hero[0], shots.story[0], t);
    camLook.lerpVectors(shots.hero[1], shots.story[1], t);
    // A slow push in across the four steps, small enough to feel still.
    const drift = smooth(PHASES.checkin[0], 1, p) * 0.06;
    camPos.lerp(camLook, drift);
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
    shots.hero[0].copy(set.hero[0]);
    shots.hero[1].copy(set.hero[1]);
    shots.story[0].copy(set.story[0]);
    shots.story[1].copy(set.story[1]);
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  // ---- Frame --------------------------------------------------------------------------
  let target = 0;
  let current = 0;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const tmp = new Vector3();
  const tmp2 = new Vector3();
  const pos = new Vector3();
  const project = new Vector3();
  const col = new Color();
  const m4 = new Matrix4();
  const m5 = new Matrix4();
  const quat = new Quaternion();
  const scl = new Vector3();
  const hidden = new Matrix4().makeScale(0, 0, 0);

  function place(el: HTMLElement | null | undefined, at: Vector3, opacity: number) {
    if (!el) return;
    project.copy(at).project(camera);
    let x = (project.x * 0.5 + 0.5) * width;
    const y = (-project.y * 0.5 + 0.5) * height;
    if (el.classList.contains("bubble")) {
      // Keep bubbles inside the screen and clear of the step rail on the right, and never over
      // the step's copy at the bottom left (or, on phones, the bottom).
      const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
      // Where the bubble sits relative to its point: centred, or to one side of it.
      const before = el.classList.contains("bubble-left") ? w - 18 : el.classList.contains("bubble-right") ? 18 : w / 2;
      const right = opts.small ? 10 : 140;
      x = clamp(x, before + 10, width - (w - before) - right);
      const half = before;
      const overCopy = opts.small ? y > height * 0.62 : x - half < width * 0.4 && y > height * 0.56;
      if (overCopy) opacity = 0;
    }
    const onScreen = x > -10 && x < width + 10 && y > 60 && y < height + 10;
    const visible = opacity > 0.01 && project.z < 1 && onScreen;
    el.style.opacity = visible ? opacity.toFixed(3) : "0";
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    el.style.visibility = visible ? "visible" : "hidden";
    if (!visible || el.classList.contains("bubble")) return;
    const pick = el.classList.contains("pick");
    if (pick && opts.small && y > height * 0.6) {
      el.style.opacity = "0";
      el.style.visibility = "hidden";
      return;
    }
    const box = pick ? (el.firstElementChild as HTMLElement) : el;
    const room = width < 720 ? 16 : 150; // keep clear of the step rail on the right
    el.classList.toggle("flip", el.classList.contains("tag-you") || x + 18 + box.offsetWidth > width - room);
    if (pick) el.classList.toggle("below", y - 18 - box.offsetHeight < 90);
  }

  let introOn = true; // off for the still frame used with reduced motion
  let introSettled = false;
  function grow(x: number, z: number, intro: number) {
    if (intro >= 1) return 1;
    const delay = clamp((z + 9) / 18) * 0.55 + Math.abs(x) * 0.012;
    const t = clamp((intro - delay) / 0.42);
    return t <= 0 ? 0.0001 : backOut(t);
  }
  // A pop for things that appear: 0 before `at`, a quick overshoot, then 1.
  const pop = (at: number, p: number, span = 0.025) => {
    const t = clamp((p - at) / span);
    return t <= 0 ? 0 : t >= 1 ? 1 : backOut(t);
  };

  function draw(p: number, time: number) {
    const intro = introOn ? clamp((time - 0.15) / 2.1) : 1;
    if (!introSettled) {
      // Chairs and tables grow in with the people, then stay put.
      chairs.forEach((c, i) => {
        const g = grow(c.x, c.z, intro);
        dummy.position.copy(c);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(g, g, g);
        dummy.updateMatrix();
        chairMesh.setMatrixAt(i, dummy.matrix);
        chairBacks.setMatrixAt(i, dummy.matrix);
      });
      tables.forEach((t, i) => {
        const g = grow(t.x, t.z, intro);
        dummy.position.copy(t);
        dummy.scale.set(g, g, g);
        dummy.updateMatrix();
        tableTops.setMatrixAt(i, dummy.matrix);
        tableLegs.setMatrixAt(i, dummy.matrix);
        dummy.position.set(t.x, 0.012, t.z);
        dummy.scale.set(0.9 * g, 1, 0.9 * g);
        dummy.updateMatrix();
        blobs.setMatrixAt(n + i, dummy.matrix);
      });
      chairMesh.instanceMatrix.needsUpdate = chairBacks.instanceMatrix.needsUpdate = true;
      tableTops.instanceMatrix.needsUpdate = tableLegs.instanceMatrix.needsUpdate = true;
      if (intro >= 1) introSettled = true;
    }

    const [talkA, talkB] = PHASES.talk;
    const [outA] = PHASES.outcome;
    const checkedIn = smooth(checkInAt - 0.01, checkInAt + 0.02, p);
    const talking = smooth(talkA, talkA + 0.03, p);
    const decided = smooth(outA, outA + 0.05, p);

    // Camera first: the sidekicks and labels face it.
    cameraAt(p);
    pointer.sx += (pointer.x - pointer.sx) * 0.05;
    pointer.sy += (pointer.y - pointer.sy) * 0.05;
    camera.position.copy(camPos);
    camera.position.x += pointer.sx * 0.6;
    camera.position.y -= pointer.sy * 0.4;
    camera.lookAt(camLook);

    // People.
    for (let i = 0; i < n; i++) {
      const pp = people[i];
      let x = pp.x;
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
        face += Math.sin(time * 0.7 + pp.phase) * 0.25;
        y = Math.max(0, Math.sin(time * 1.6 + pp.phase)) * 0.025;
      }
      const g = grow(pp.x, pp.z, intro);
      dummy.position.set(x, y, pp.z);
      dummy.rotation.set(0, face, 0);
      dummy.scale.set(g, scaleY * g, g);
      dummy.updateMatrix();
      bodies.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, lerp(0, y + (pp.seated ? 0.98 : 1.12), Math.min(1, g)), pp.z);
      dummy.scale.set(g, g, g);
      dummy.updateMatrix();
      heads.setMatrixAt(i, dummy.matrix);
      dummy.position.set(x, 0.011, pp.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(0.95 * g, 1, 0.95 * g);
      dummy.updateMatrix();
      blobs.setMatrixAt(i, dummy.matrix);
      // In the last step, people outside your three conversations step back a little.
      const fade = i === youIndex || picks.includes(i) || i === speakerIndex ? 0 : decided * 0.45;
      bodies.setColorAt(i, col.copy(pp.clothes).lerp(PAPER, fade));
      heads.setColorAt(i, col.copy(pp.skin).lerp(PAPER, fade));
    }
    bodies.instanceMatrix.needsUpdate = heads.instanceMatrix.needsUpdate = blobs.instanceMatrix.needsUpdate = true;
    bodies.instanceColor!.needsUpdate = heads.instanceColor!.needsUpdate = true;

    // Grey sidekicks appear beside each person as they check in (step 2), and blink and bob.
    others.forEach(({ i, pp }, k) => {
      const s = pop(pp.checkIn, p) * GREY_SIZE;
      if (s < 0.001) {
        greyBody.setMatrixAt(k, hidden);
        greyEyes.setMatrixAt(k * 2, hidden);
        greyEyes.setMatrixAt(k * 2 + 1, hidden);
        greyCheeks.setMatrixAt(k * 2, hidden);
        greyCheeks.setMatrixAt(k * 2 + 1, hidden);
        return;
      }
      sidekickAt(i, pos);
      pos.y += Math.sin(time * 1.8 + pp.phase) * 0.03;
      dummy.position.copy(pos);
      dummy.lookAt(camera.position);
      quat.copy(dummy.quaternion);
      m4.compose(pos, quat, scl.setScalar(s));
      greyBody.setMatrixAt(k, m4);
      const blink = ((time + pp.phase) % 4.3) < 0.12 ? 0.1 : 1;
      eyeLocal.forEach((e, j) => {
        m5.copy(e);
        m5.elements[5] *= blink;
        greyEyes.setMatrixAt(k * 2 + j, tmpMat.multiplyMatrices(m4, m5));
      });
      cheekLocal.forEach((c, j) => greyCheeks.setMatrixAt(k * 2 + j, tmpMat.multiplyMatrices(m4, c)));
    });
    greyBody.instanceMatrix.needsUpdate = greyEyes.instanceMatrix.needsUpdate = greyCheeks.instanceMatrix.needsUpdate = true;

    // Check-in ripples: one under each person at the moment they check in, and yours in step 1.
    others.forEach(({ pp }, k) => {
      const t = (p - pp.checkIn) / 0.035;
      if (t < 0 || t > 1) return ripples.setMatrixAt(k, hidden);
      dummy.position.set(pp.x, 0.02, pp.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(0.5 + t * 1.6);
      dummy.updateMatrix();
      ripples.setMatrixAt(k, dummy.matrix);
    });
    ripples.instanceMatrix.needsUpdate = true;
    (ripples.material as MeshBasicMaterial).opacity = 0.55;

    // You: the ring under your seat and the pin above you, then the check-in pulse.
    const arrive = smooth(0.75, 1, intro);
    youRing.position.set(you.x, 0.02, you.z);
    pin.position.set(you.x, 1.85 + Math.sin(time * 2) * 0.06, you.z);
    pin.rotation.y = time * 0.8;
    pin.scale.setScalar(Math.max(0.0001, arrive));
    pinMat.color.copy(PINE);
    const pulse = (time * 0.8) % 1;
    youPulse.position.set(you.x, 0.021, you.z);
    youPulse.scale.setScalar(0.5 + pulse * 2.2);
    const pulsing = smooth(PHASES.checkin[0] + 0.02, checkInAt, p) * (1 - smooth(PHASES.arrive[0] - 0.03, PHASES.arrive[0], p));
    (youPulse.material as MeshBasicMaterial).opacity = (1 - pulse) * 0.8 * pulsing;

    // Your green sidekick pops up beside you the moment you check in, and stays there.
    const mineScale = pop(checkInAt, p, 0.03) * MINE_SIZE;
    mine.visible = mineScale > 0.001;
    mine.scale.setScalar(Math.max(0.0001, mineScale));
    mine.position.copy(mineAt);
    mine.position.y += Math.sin(time * 1.6) * 0.05;
    mine.lookAt(camera.position);
    buddy.setWink(talking < 0.5);
    buddy.tick(time);

    // Step 3: your green Buddy pops up beside each grey one it talks to, one after another.
    // In step 4 only the three picks' conversations stay.
    clones.forEach(({ b, at }, k) => {
      const t0 = talkA + 0.008 + k * 0.012;
      const s = pop(t0, p, 0.03) * (k > 2 ? 1 - decided : 1);
      const size = s * GREY_SIZE * 1.08;
      b.group.visible = size > 0.001;
      const ring = cloneRings[k];
      const tt = clamp((p - t0) / 0.03);
      ring.position.set(at.x, 0.02, at.z);
      ring.scale.setScalar(0.6 + tt * 1.4);
      (ring.material as MeshBasicMaterial).opacity = tt > 0 && tt < 1 ? (1 - tt) * 0.8 : 0;
      if (!b.group.visible) return;
      b.group.scale.setScalar(size);
      b.group.position.copy(at);
      b.group.position.y += Math.sin(time * 1.8 + k) * 0.03;
      b.group.lookAt(camera.position);
      b.setWink((time + k) % 5 < 2.5);
      b.tick(time);
    });

    // Rings under the three picks in step 4: the match in Signal, the others in their outcome.
    picks.forEach((idx, k) => {
      const ring = pickRings[k];
      ring.position.set(people[idx].x, 0.02, people[idx].z);
      const mat = ring.material as MeshBasicMaterial;
      mat.color.copy(k === 0 ? SIGNAL : k === 1 ? GREEN : GREY);
      mat.opacity = decided * (k === 0 ? 1 : 0.7);
    });
    (youRing.material as MeshBasicMaterial).color.copy(GREEN).lerp(SIGNAL, decided);

    renderer.render(scene, camera);

    // ---- HTML over the scene ----
    // Step 1: you, and your sidekick's name tag.
    if (labels.you) labels.you.classList.toggle("is-checked", checkedIn > 0.5);
    place(labels.you, tmp.set(you.x, 2.15, you.z), smooth(PHASES.checkin[0], PHASES.checkin[0] + 0.04, p) * (1 - talking));
    place(labels.sidekick, tmp.copy(mineAt).setY(mineAt.y + 0.2), checkedIn * (1 - smooth(PHASES.arrive[0] + 0.04, PHASES.arrive[0] + 0.08, p)));

    // Step 3: many conversations at once. In each, your sidekick types and asks, theirs types and
    // answers, then a pause; the pairs run on staggered loops. Grey pairs chat among themselves.
    const talkVis = talking * (1 - smooth(talkB - 0.02, talkB + 0.01, p));
    const say = (el: HTMLElement, at: Vector3, t: number, from: number, to: number) => {
      const state = t < from ? "off" : t < from + 0.8 ? "typing" : t < to ? "text" : "off";
      if (el.dataset.state !== state) el.dataset.state = state;
      place(el, at, state === "off" ? 0 : talkVis);
    };
    (labels.pairs ?? []).forEach(({ mine, theirs }, k) => {
      if (k >= clones.length) {
        mine.style.visibility = theirs.style.visibility = "hidden";
        return;
      }
      const t = (time - k * 1.15 + 7 * 8) % 7;
      // Yours reads to the right of your Buddy; their answer reads to the left of theirs and is
      // lifted by the height of yours while both show, so a pair's bubbles never cover each other.
      say(mine, tmp.copy(clones[k].at).setY(clones[k].at.y + 0.3), t, 0, 4.4);
      const lift = mine.dataset.state && mine.dataset.state !== "off" ? ((mine.firstElementChild as HTMLElement)?.offsetHeight ?? 0) + 8 : 0;
      theirs.style.setProperty("--lift", `${lift}px`);
      say(theirs, sidekickAt(yourTalks[k], tmp2).setY(tmp2.y + 0.3), t, 1.7, 6.1);
    });
    (labels.others ?? []).forEach((el, k) => {
      const pair = otherPairs[k];
      if (!pair) return void (el.style.visibility = "hidden");
      const t = (time - k * 1.6 - 0.6 + 6 * 8) % 6;
      say(el, sidekickAt(pair[0], tmp).setY(tmp.y + 0.34), t, 0, 4);
    });
  }

  const tmpMat = new Matrix4();
  // Check-in ripples for everyone else (one ring each, instanced).
  const ripples = new InstancedMesh(
    new RingGeometry(0.42, 0.5, 40).rotateX(-Math.PI / 2),
    new MeshBasicMaterial({ color: GREY.clone().multiplyScalar(0.75), transparent: true, opacity: 0.5, depthWrite: false }),
    others.length,
  );
  scene.add(ripples);

  // ---- Quality ------------------------------------------------------------------------
  function setTier(next: Tier) {
    if (next === tier) return;
    tier = next;
    const high = tier === "high";
    renderer.shadowMap.enabled = high;
    sun.castShadow = high;
    blobs.visible = !high;
    renderer.setPixelRatio(high ? dpr : Math.min(dpr, 1.25));
    // Shadow settings are compiled into the shaders, so materials must rebuild.
    scene.traverse((o) => {
      const mat = (o as Mesh).material as { needsUpdate?: boolean } | undefined;
      if (mat) mat.needsUpdate = true;
    });
    resize();
  }

  // ---- Loop (driven by the page's GSAP ticker) -----------------------------------------
  let active = true;
  let started = -1;
  let last = -1;
  let samples = 0;
  let spent = 0;
  function tick(now: number) {
    if (!active || document.hidden) {
      last = -1;
      return;
    }
    if (started < 0) started = now;
    const dt = last < 0 ? 1 / 60 : Math.min(0.1, now - last);
    last = now;
    // Ease toward the scroll position at the same speed whatever the frame rate.
    current += (target - current) * (1 - Math.pow(1 - 0.09, dt * 60));
    if (Math.abs(target - current) < 0.0005) current = target;
    const t = now - started;
    draw(current, t);
    // Measure 90 frames once the intro is over; drop to the low tier if they're slow.
    if (tier === "high" && t > 2.6 && samples < 90) {
      spent += dt;
      if (++samples === 90 && spent / 90 > 1 / 40) setTier("low");
    }
  }

  return {
    setProgress(p) {
      target = clamp(p);
    },
    tick,
    renderAt(p) {
      active = false;
      introOn = false;
      target = current = clamp(p);
      draw(current, 5.2);
      // Fonts may arrive after the still frame; draw it again once they do.
      document.fonts?.ready.then(() => draw(current, 5.2));
    },
    setPointer(x, y) {
      pointer.x = x;
      pointer.y = y;
    },
    setActive(on) {
      active = on;
    },
    dispose() {
      active = false;
      ro.disconnect();
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
