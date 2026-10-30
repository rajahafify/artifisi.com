// Fig 1 on /projects/dunia, built with the Anatomy skill's kit (tools/anatomy/kit, MIT).
// A gamepad on a bench is wired to a recorder. The recorder samples ten times a second; each sample is
// punched as one row across a paper tape: six channel holes, always, and one action hole whose place
// across the tape is where the stick was. Move the stick and the tape records it.
//
//   node tools/anatomy/recorder/build.mjs          writes src/figures/recorder.html, public/figures/recorder.js,
//                                                 src/styles/iso.css and a standalone page for checks
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..", "..");
const OUT = process.argv.includes("--out") ? process.argv[process.argv.indexOf("--out") + 1] : null;

// The model: one sample per tick, every channel in every sample.
const HZ = 10;
const CHANNELS = ["Camera", "Depth", "Segmentation", "Motion", "Action", "Ground truth"];

const WIDTH = 640;
const HEIGHT = 400;

const PLATE = { x: -150, y: -62, w: 278, d: 130, r: 8 };
const PLATE_H = 10;
const FOOT_H = 5;

// Gamepad
const PAD = { x: -134, y: -16, w: 66, d: 34, r: 14 };
const PAD_H = 8;
const STICK = [-103, 4];
const STICK_TOP = PAD_H + 6.4;
const STICK_REACH = 2.2;

// Recorder
const CASE = { x: -6, y: -48, w: 116, d: 70, r: 4 };
const CASE_H = 36;
const LAMPS = CHANNELS.map((_, i) => [6 + i * 13, -38]);
const REEL = [82, -4];
const REEL_R = 17;

// Tape, coming out of the front face onto the plate
const TAPE = { x: 40, y: CASE.y + CASE.d, w: 36, d: 40, r: 0.6 };
const TAPE_Z = 0.5;
const ROW = 2.4;          // world units between rows
const HOLE_X = Array.from({ length: 6 }, (_, i) => TAPE.x + 3 + i * 2.6);
const ACT_X0 = TAPE.x + 21, ACT_SPAN = 12;   // action hole travels across this
const SPROCKET_X = TAPE.x + 1;

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), ...k.boxCorners(CASE, 0, CASE_H + 6), [REEL[0], REEL[1], CASE_H + 9]],
  WIDTH, HEIGHT, { pad: 26, azimuth: 40 },
);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));

function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
  // ruler strip along the front edge, with a tick every 5 and a major every 25
  const strip = { x: PLATE.x + 16, y: PLATE.y + PLATE.d - 14, w: 120, d: 6, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 5, 5, strip.y + 0.8, 0.6, [1.8, 3.4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3, 0.6]), at([strip.x + strip.w - 2, strip.y + 3, 0.6])], { size: 0.45 }));
  return out.join("");
}

function gamepad() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(PAD, -4), 0, 0.1, P)}" style="filter:blur(4px)"/>`];
  out.push(S(k.slabOf(PAD, 0, PAD_H, P, 8, 0.8), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PAD, 3), PAD_H, P), { tone: "faint" }));
  // d-pad
  const dx = PAD.x + 12, dy = PAD.y + 12;
  const a = 5, b = 1.6;
  const cross = [[dx - b, dy - a], [dx + b, dy - a], [dx + b, dy - b], [dx + a, dy - b], [dx + a, dy + b], [dx + b, dy + b], [dx + b, dy + a], [dx - b, dy + a], [dx - b, dy + b], [dx - a, dy + b], [dx - a, dy - b], [dx - b, dy - b]];
  out.push(S(k.extrude(cross, PAD_H, 1.2, P, { convex: false }), { tone: "hi", crease: "lo" }));
  // four face buttons
  const bx = PAD.x + PAD.w - 13, by = PAD.y + 12;
  for (const [x, y] of byDepth([[bx, by - 3.6], [bx - 3.6, by], [bx + 3.6, by], [bx, by + 3.6]])) {
    out.push(S(k.cylinder(x, y, 1.7, PAD_H, 1.3, P, 18), { tone: "hi", crease: "lo" }));
  }
  // stick well, with its ring
  out.push(S(k.cylinder(STICK[0], STICK[1], 5, PAD_H, 0.8, P, 32), { tone: "lo" }));
  out.push(L(k.ring(STICK[0], STICK[1], 6.2, PAD_H, P, 32), { tone: "lo" }));
  // cable port on the right end
  out.push(S(k.slabOf({ x: PAD.x + PAD.w - 1, y: -2.5, w: 3, d: 5, r: 0.6 }, 2, 3.2, P, 2), { tone: "mid" }));
  out.push(D([at([PAD.x + 6, PAD.y + 4, PAD_H]), at([PAD.x + PAD.w - 6, PAD.y + 4, PAD_H])], { size: 0.4, tone: "lo" }));
  return out.join("");
}

// The stick is built at rest and moved with translateAlong: shaft and cap lean together.
function stick() {
  const [x, y] = STICK;
  return S(k.cylinder(x, y, 1.3, PAD_H + 0.8, 4, P, 16), { tone: "mid", crease: "none" }) +
    S(k.cylinder(x, y, 3.4, PAD_H + 4.8, 1.6, P, 28, 0.4), { tone: "hi", lit: true }) +
    L(k.ring(x, y, 2.2, STICK_TOP, P, 24), { tone: "lo" });
}

function cable() {
  // from the gamepad's port, down to the plate, along it in front of the recorder, up to the socket on its front
  const sx = CASE.x + 14, sy = CASE.y + CASE.d;
  const pts = [[PAD.x + PAD.w + 2, 0, 3.6], [PAD.x + PAD.w + 8, 0, 0.8], [PAD.x + PAD.w + 8, 34, 0.8], [sx, 34, 0.8], [sx, sy + 3, 0.8], [sx, sy + 1.2, 5.5]];
  const screen = pts.map(at);
  return k.wireSvg(screen[0], screen[screen.length - 1], { via: screen.slice(1, -1), tone: "mid", size: 1 });
}

function recorder() {
  const out = [`<path class="iso-halo" d="${k.haloOf(k.insetPlan(CASE, -3), 0, 0.1, P)}" style="filter:blur(5px)"/>`];
  out.push(S(k.slabOf(CASE, 0, 4, P, 4, 0.5), { tone: "lo", crease: "none" }));
  out.push(S(k.slabOf(k.insetPlan(CASE, 1.2), 4, CASE_H - 4, P, 4, 1), { tone: "mid", inner: L(k.sideSeam(k.insetPlan(CASE, 1.2), CASE_H - 6, P, 4), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(CASE, 5), CASE_H, P, 4), { tone: "faint" }));
  // screws along the base lip, front and right faces
  out.push(D([CASE.x + 30, CASE.x + 86].map((x) => at([x, CASE.y + CASE.d, 2])).concat([CASE.y + 12, CASE.y + 58].map((y) => at([CASE.x + CASE.w, y, 2]))), { size: 0.45 }));
  // vent slots on the right face, ticks hanging from the lid seam
  const right = CASE.x + CASE.w - 1.2;
  const vents = k.sideTicks(CASE.y + 10, CASE.y + 40, 3, 100, right, CASE_H - 10, [10, 10], P, "y");
  out.push(L(vents.minor + vents.major, { tone: "lo" }));
  // socket on the front face where the cable lands
  const sx = CASE.x + 14, sy = CASE.y + CASE.d;
  out.push(S(k.slabOf({ x: sx - 3, y: sy - 1.2, w: 6, d: 2.4, r: 0.6 }, 3.5, 5, P, 2), { tone: "mid" }));
  // the tape guide: a lip over the slot the tape leaves through
  out.push(S(k.slabOf({ x: TAPE.x - 3, y: sy - 1.2, w: TAPE.w + 6, d: 4, r: 0.8 }, 3.2, 3, P, 3, 0.4), { tone: "mid" }));
  out.push(D([at([TAPE.x - 1, sy + 1.4, 6.2]), at([TAPE.x + TAPE.w + 1, sy + 1.4, 6.2])], { size: 0.4 }));
  // channel lamps along the back of the lid: bezels, then the lamps themselves drawn live
  for (const [x, y] of LAMPS) {
    out.push(S(k.cylinder(x, y, 4, CASE_H, 0.8, P, 28), { tone: "lo" }));
  }
  // label plate with three rule lines
  const label = { x: CASE.x + 8, y: CASE.y + 22, w: 40, d: 30, r: 1.5 };
  out.push(S(k.slabOf(label, CASE_H, 0.5, P, 3), { tone: "lo", crease: "none" }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + 4, label.y + 9], CASE_H + 0.5, P, "x"), "DUNIA", { size: 5.2, tone: "mid" }));
  for (const yy of [16, 20.5, 25]) out.push(L(k.lineOnTop([label.x + 4, label.y + yy], [label.x + (yy === 25 ? 22 : 34), label.y + yy], CASE_H + 0.5, P), { tone: "faint", free: "end" }));
  out.push(D(k.corners(label, 1.8).map(([x, y]) => at([x, y, CASE_H + 0.5])), { size: 0.4 }));
  // corner screws on the lid
  out.push(D(k.corners(CASE, 4.5).map(([x, y]) => at([x, y, CASE_H])), { size: 0.5 }));
  // the reel: spindle, flange, hub (spokes drawn live)
  out.push(S(k.cylinder(REEL[0], REEL[1], 3, CASE_H, 2, P, 20), { tone: "mid" }));
  out.push(S(k.cylinder(REEL[0], REEL[1], REEL_R, CASE_H + 2, 2.4, P, 72, 0.6), { tone: "hi", crease: "lo" }));
  out.push(L(k.ring(REEL[0], REEL[1], REEL_R - 3, CASE_H + 4.4, P, 64), { tone: "lo" }));
  out.push(S(k.cylinder(REEL[0], REEL[1], 4.2, CASE_H + 4.4, 1.6, P, 28), { tone: "mid" }));
  out.push(L(k.knurl(REEL[0], REEL[1], 4.2, CASE_H + 4.4, CASE_H + 6, 20, P), { tone: "lo" }));
  return out.join("");
}

const lampSvg = (i, on) => {
  const [x, y] = LAMPS[i];
  return S(k.cylinder(x, y, 2.6, CASE_H + 0.8, 1, P, 24), on ? { tone: "hi", lit: true } : { tone: "lo" });
};
const spokes = (turn) => {
  const out = [];
  for (let s = 0; s < 3; s++) {
    const a = turn * Math.PI * 2 + (s * Math.PI * 2) / 3;
    out.push(k.lineOnTop([REEL[0] + Math.sin(a) * 4.6, REEL[1] - Math.cos(a) * 4.6], [REEL[0] + Math.sin(a) * (REEL_R - 3.2), REEL[1] - Math.cos(a) * (REEL_R - 3.2)], CASE_H + 4.4, P));
  }
  return out.join("");
};

function tape() {
  const out = [];
  out.push(S(k.slabOf(TAPE, 0, TAPE_Z, P, 2), { tone: "hi", crease: "none", flat: true }));
  // a clip on the tape's top face, so rows enter from under the lip and leave off the end
  const clip = k.onTop(k.ringOf(k.insetPlan(TAPE, 0.4), 2), TAPE_Z, P, true);
  out.push(`<clipPath id="rec-tape-clip"><path d="${clip}"/></clipPath>`);
  out.push(`<g clip-path="url(#rec-tape-clip)"><g data-part="rows"></g></g>`);
  return out.join("");
}

const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label:
    "A gamepad on a bench, wired to a recorder. Six lamps on the recorder stand for the six channels it captures. Ten times a second it punches one row across a paper tape that runs out of its front: six holes for the channels and one hole whose place across the tape is where the gamepad's stick was.",
  body: [
    plate(),
    gamepad(),
    `<g data-part="stick">${stick()}</g>`,
    recorder(),
    `<g data-part="lamps">${LAMPS.map((_, i) => lampSvg(i, true)).join("")}</g>`,
    `<path data-part="spokes" class="iso-line" data-tone="lit" d="${spokes(0)}" style="stroke-width:0.9"/>`,
    tape(),
    cable(),
  ],
});

// Live code: the clock, the stick, the tape rows, the reel, the lamps and the readout, all from one model.
const live = `
const P = ${JSON.stringify(P)};
const HZ = ${HZ}, ROW = ${ROW}, TAPE = ${JSON.stringify(TAPE)}, TAPE_Z = ${TAPE_Z};
const HOLE_X = ${JSON.stringify(HOLE_X)}, ACT_X0 = ${ACT_X0}, ACT_SPAN = ${ACT_SPAN}, SPROCKET_X = ${SPROCKET_X};
const STICK_REACH = ${STICK_REACH}, REEL = ${JSON.stringify(REEL)}, REEL_R = ${REEL_R}, CASE_H = ${CASE_H};
const root = document.querySelector("[data-fig='recorder']"); if (root) {
const stage = root.querySelector(".iso-stage");
const svg = stage.querySelector("svg");
const stickEl = svg.querySelector('[data-part="stick"]');
const rowsEl = svg.querySelector('[data-part="rows"]');
const spokesEl = svg.querySelector('[data-part="spokes"]');
const lamps = svg.querySelector('[data-part="lamps"]');
const readout = root.querySelector("[data-readout]");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const spokes = ${spokes.toString().replace(/k\.lineOnTop/g, "lineOnTop")};
// Every sample ever taken: its stick value. Rows on the tape are the most recent ones.
const ROWS = Math.ceil(TAPE.d / ROW) + 2;
const tape = [];
let stickX = 0, target = 0, touring = true, clock = 0, step = 0, phase = 0, last = 0, frame = 0, visible = false, idle = 0;
const tourAt = (t) => Math.sin(t * 2.1) * 0.7 + Math.sin(t * 4.7) * 0.22;
function rowsSvg() {
  // row n sits ROW * (n + phase) out from the lip; newest first
  let holes = [], act = [], spr = [];
  for (let n = 0; n < tape.length; n++) {
    const y = TAPE.y + ROW * (n + phase) + 0.6;
    if (y > TAPE.y + TAPE.d + 1) break;
    for (const x of HOLE_X) holes.push(iso([x, y, TAPE_Z], P));
    act.push(iso([ACT_X0 + (tape[n] + 1) / 2 * ACT_SPAN, y, TAPE_Z], P));
    spr.push(iso([SPROCKET_X, y, TAPE_Z], P));
  }
  return dotsSvg(spr, { size: 0.35, tone: "lo" }) + dotsSvg(holes, { size: 0.55, tone: "mid" }) + dotsSvg(act, { size: 0.75, tone: "hi" });
}
function draw() {
  stickEl.setAttribute("transform", translateAlong(P, [stickX * STICK_REACH, 0, 0]));
  rowsEl.innerHTML = rowsSvg();
  spokesEl.setAttribute("d", spokes((step + phase) / 40));
  const dir = Math.abs(stickX) < 0.12 ? "centre" : (stickX < 0 ? "left " : "right ") + Math.abs(stickX).toFixed(2);
  const text = "step " + step + " · stick " + dir + " · " + HZ + " Hz";
  if (readout.textContent !== text) readout.textContent = text;
}
function tick(now) {
  const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
  last = now;
  if (touring) { clock += dt; target = tourAt(clock); }
  stickX += (target - stickX) * (1 - Math.exp(-dt / 0.12));
  // the clock: one sample every 1/HZ s; the tape slides one row per sample
  phase += dt * HZ;
  while (phase >= 1) { phase -= 1; step++; tape.unshift(stickX); if (tape.length > ROWS) tape.pop(); }
  draw();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => { if (!frame && visible && !still.matches) { last = 0; frame = requestAnimationFrame(tick); } };
const steer = (v) => { touring = false; target = clamp(v, -1, 1); clearTimeout(idle); idle = setTimeout(() => { touring = true; }, 3200); run(); };
new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "80px 0px" }).observe(stage);
stage.addEventListener("pointermove", (e) => { const b = svg.getBoundingClientRect(); steer(((e.clientX - b.left) / b.width - 0.5) * 2.4); });
stage.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") { e.preventDefault(); steer(target - 0.25); }
  if (e.key === "ArrowRight") { e.preventDefault(); steer(target + 0.25); }
});
// a still frame under reduced motion: a tape already written by a slow sweep
for (let n = 0; n < ROWS; n++) tape.push(Math.sin(n * 0.35) * 0.8);
step = 1240; draw();
}
`;

const body = k.plateHtml({
  fig: "Fig 1",
  title: "The recorder",
  hint: "Move across it to steer the stick",
  readout: "step 1240 · stick centre · 10 Hz",
  keys: [
    { mark: "lit", label: "The stick and the lamps: what the player does, and the six channels being captured" },
    { mark: "raised", label: "The tape: one row per sample, ten rows a second" },
  ],
  caption:
    "Dunia samples the game ten times a second. Each sample keeps all six channels, camera, depth, segmentation, motion, action and ground truth, so every row on the tape has six holes. The seventh hole is the action: it moves across the tape with the stick, which is how what the player did ends up labelled next to what the world looked like.",
  body: `<div class="iso-stage" tabindex="0" role="img" aria-label="The recorder: move the pointer across it, or use the arrow keys, to steer the gamepad's stick">${svg}</div>`,
});

const kitSrc = readFileSync(join(HERE, "..", "kit", "iso-kit.mjs"), "utf8").replace(/^export /gm, "");
const fragment = `<div class="iso" data-theme="dark" data-fig="recorder">${body}</div>`;
const script = kitSrc + live;

mkdirSync(join(ROOT, "src", "figures"), { recursive: true });
mkdirSync(join(ROOT, "public", "figures"), { recursive: true });
writeFileSync(join(ROOT, "src", "figures", "recorder.html"), fragment);
writeFileSync(join(ROOT, "public", "figures", "recorder.js"), script);
writeFileSync(join(ROOT, "src", "styles", "iso.css"), "/* Anatomy kit styles (tools/anatomy, MIT). Generated by tools/anatomy/recorder/build.mjs. */\n" + k.ISO_CSS);
if (OUT) writeFileSync(OUT, k.pageHtml({ title: "The recorder", theme: "dark", body: fragment, script }));
console.log("wrote src/figures/recorder.html, public/figures/recorder.js, src/styles/iso.css" + (OUT ? ", " + OUT : ""));
