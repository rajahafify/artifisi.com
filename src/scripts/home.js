// Home page behaviour: the hero scene, section pieces, contact form and video player.
import * as THREE from "three";
window.THREE = THREE;

(function () {
  var hero = document.querySelector(".hero");
  if (!window.THREE || !hero) return;
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true }); } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x0a0a0a, 1);
  hero.insertBefore(renderer.domElement, hero.firstChild);

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0a0a, 40, 110);
  var camera = new THREE.PerspectiveCamera(32, 1, 0.1, 300);
  var camPos = new THREE.Vector3(0, 20, 50), camLook = new THREE.Vector3(0, 2, 0);

  var seed = 7;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  // Every material registers here with its base opacity, so whole scenes can fade in and out.
  function lineMat(color, base) { var m = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: base }); m.userData.base = base; return m; }
  function pointMat(opts, base) { opts.transparent = true; opts.opacity = base; opts.sizeAttenuation = false; var m = new THREE.PointsMaterial(opts); m.userData.base = base; return m; }
  function edges(geo, mat) { return new THREE.LineSegments(new THREE.EdgesGeometry(geo), mat); }
  function circle(r, seg, mat) {
    var pts = [];
    for (var i = 0; i <= seg; i++) { var a = i / seg * Math.PI * 2; pts.push(Math.cos(a) * r, 0, Math.sin(a) * r); }
    var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    return new THREE.Line(g, mat);
  }
  function dynLines(n, mat) {
    var g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 6), 3));
    var l = new THREE.LineSegments(g, mat); l.frustumCulled = false; return l;
  }
  var groups = {};
  function makeGroup(name) {
    var g = new THREE.Group(); g.userData.mats = []; g.userData.alpha = name === "city" ? 1 : 0;
    g.visible = name === "city"; scene.add(g); groups[name] = g; return g;
  }
  function reg(group, mat) { group.userData.mats.push(mat); return mat; }

  // =========================================================
  // City: players walking, captured into a dataset
  // =========================================================
  var city = makeGroup("city");
  var SP = 4, X0 = -30, Z0 = -12, NX = 8, NZ = 7;
  var cityMat = reg(city, lineMat(0x5a5a5a, 0.9));
  var streetMat = reg(city, lineMat(0x262626, 1));
  for (var bx = 0; bx < NX - 1; bx++) {
    for (var bz = 0; bz < NZ - 1; bz++) {
      if (rnd() < 0.18) continue;
      var h = 0.5 + Math.pow(rnd(), 2) * 5;
      var e = edges(new THREE.BoxGeometry(2.6, h, 2.6), cityMat);
      e.position.set(X0 + bx * SP + SP / 2, h / 2, Z0 + bz * SP + SP / 2);
      city.add(e);
    }
  }
  var sv = [];
  for (var i = 0; i < NX; i++) sv.push(X0 + i * SP, 0, Z0, X0 + i * SP, 0, Z0 + (NZ - 1) * SP);
  for (var j = 0; j < NZ; j++) sv.push(X0, 0, Z0 + j * SP, X0 + (NX - 1) * SP + 3, 0, Z0 + j * SP);
  var sg = new THREE.BufferGeometry();
  sg.setAttribute("position", new THREE.Float32BufferAttribute(sv, 3));
  city.add(new THREE.LineSegments(sg, streetMat));

  var LC = 10, LR = 6, LL = 8, LS = 1.5, LX = 7, LZ = -(LR - 1) * LS / 2;
  var CAP = LC * LR * LL;
  var lpos = new Float32Array(CAP * 3), lcol = new Float32Array(CAP * 3);
  var EMPTY = 0.16, FULL = 0.92;
  for (var s = 0; s < CAP; s++) {
    var lv = Math.floor(s / (LC * LR)), r = Math.floor((s % (LC * LR)) / LC), c = s % LC;
    lpos[s * 3] = LX + c * LS; lpos[s * 3 + 1] = 0.4 + lv * LS; lpos[s * 3 + 2] = LZ + r * LS;
    lcol[s * 3] = lcol[s * 3 + 1] = lcol[s * 3 + 2] = EMPTY;
  }
  var lg = new THREE.BufferGeometry();
  lg.setAttribute("position", new THREE.BufferAttribute(lpos, 3));
  lg.setAttribute("color", new THREE.BufferAttribute(lcol, 3));
  var latticeMat = reg(city, pointMat({ size: 3, vertexColors: true }, 1));
  city.add(new THREE.Points(lg, latticeMat));
  var frameMat = reg(city, lineMat(0x333333, 1));
  var latticeFrame = edges(new THREE.BoxGeometry((LC - 1) * LS + 1, (LL - 1) * LS + 1, (LR - 1) * LS + 1), frameMat);
  latticeFrame.position.set(LX + (LC - 1) * LS / 2, 0.4 + (LL - 1) * LS / 2 - 0.1, 0);
  city.add(latticeFrame);

  var NA = 70, apos = new Float32Array(NA * 3);
  var ag = new THREE.BufferGeometry();
  ag.setAttribute("position", new THREE.BufferAttribute(apos, 3));
  var agentMat = reg(city, pointMat({ size: 4, color: 0xffffff }, 1));
  var agentPts = new THREE.Points(ag, agentMat); agentPts.frustumCulled = false; city.add(agentPts);

  var TN = 1600, tpos = new Float32Array(TN * 3), tHead = 0, tCount = 0;
  var tg = new THREE.BufferGeometry();
  tg.setAttribute("position", new THREE.BufferAttribute(tpos, 3));
  var trailMat = reg(city, pointMat({ size: 1.6, color: 0x6a6a6a }, 1));
  var trailPts = new THREE.Points(tg, trailMat); trailPts.frustumCulled = false; city.add(trailPts);

  var nextSlot = 0, filled = 0, resetTimer = 0, captured = 0;
  var countEl = document.getElementById("count");
  var agents = [];
  function spawn(a) {
    a.ix = 0; a.iz = Math.floor(Math.random() * NZ);
    a.tx = a.ix; a.tz = a.iz; a.t = 1; a.mode = "walk"; a.dropT = Math.random() * 0.2;
    a.speed = 2.4 + Math.random() * 1.6; a.steps = 0;
  }
  for (var k = 0; k < NA; k++) { var a0 = {}; spawn(a0); a0.ix = Math.floor(Math.random() * NX); agents.push(a0); }
  function nodeX(ix) { return X0 + ix * SP; }
  function nodeZ(iz) { return Z0 + iz * SP; }

  function choose(a) {
    if (a.ix === NX - 1 && Math.random() < 0.55 && nextSlot < CAP) {
      a.mode = "fly"; a.slot = nextSlot++; a.f = 0;
      a.p0 = new THREE.Vector3(nodeX(a.ix), 0.3, nodeZ(a.iz));
      var sx = lpos[a.slot * 3], sy = lpos[a.slot * 3 + 1], sz = lpos[a.slot * 3 + 2];
      a.p2 = new THREE.Vector3(sx, sy, sz);
      a.p1 = new THREE.Vector3((a.p0.x + sx) / 2, Math.max(sy, 2) + 4, (a.p0.z + sz) / 2);
      return;
    }
    var opts = [];
    if (a.ix < NX - 1) { opts.push([1, 0]); opts.push([1, 0]); }
    if (a.ix > 0) opts.push([-1, 0]);
    if (a.iz < NZ - 1) opts.push([0, 1]);
    if (a.iz > 0) opts.push([0, -1]);
    var d = opts[Math.floor(Math.random() * opts.length)];
    a.turned = a.dx !== undefined && (a.dx !== d[0] || a.dz !== d[1]);
    a.dx = d[0]; a.dz = d[1]; a.steps++;
    a.tx = a.ix + d[0]; a.tz = a.iz + d[1]; a.t = 0;
  }

  var tmp = new THREE.Vector3();
  function updateCity(dt) {
    for (var n = 0; n < NA; n++) {
      var a = agents[n], x, y, z;
      if (a.mode === "walk") {
        a.t += dt * a.speed / SP;
        if (a.t >= 1) { a.ix = a.tx; a.iz = a.tz; choose(a); if (a.mode === "fly") { n--; continue; } }
        x = nodeX(a.ix) + (nodeX(a.tx) - nodeX(a.ix)) * a.t;
        z = nodeZ(a.iz) + (nodeZ(a.tz) - nodeZ(a.iz)) * a.t;
        y = 0.3;
        a.dropT -= dt;
        if (a.dropT <= 0) {
          a.dropT = 0.22;
          tpos[tHead * 3] = x; tpos[tHead * 3 + 1] = 0.08; tpos[tHead * 3 + 2] = z;
          tHead = (tHead + 1) % TN; tCount = Math.min(tCount + 1, TN);
        }
      } else {
        a.f += dt / 1.8;
        var f = Math.min(a.f, 1), e = f * f * (3 - 2 * f), u = 1 - e;
        tmp.set(0, 0, 0).addScaledVector(a.p0, u * u).addScaledVector(a.p1, 2 * u * e).addScaledVector(a.p2, e * e);
        x = tmp.x; y = tmp.y; z = tmp.z;
        if (a.f >= 1) {
          lcol[a.slot * 3] = lcol[a.slot * 3 + 1] = lcol[a.slot * 3 + 2] = FULL;
          lg.attributes.color.needsUpdate = true;
          filled++; captured++;
          if (countEl) countEl.textContent = captured.toLocaleString("en") + " samples captured";
          spawn(a);
          x = nodeX(a.ix); y = 0.3; z = nodeZ(a.iz);
        }
      }
      apos[n * 3] = x; apos[n * 3 + 1] = y; apos[n * 3 + 2] = z;
    }
    ag.attributes.position.needsUpdate = true;
    tg.attributes.position.needsUpdate = true;
    tg.setDrawRange(0, tCount);
    if (filled >= CAP) {
      resetTimer += dt;
      if (resetTimer > 2.5) {
        for (var q = 0; q < CAP; q++) lcol[q * 3] = lcol[q * 3 + 1] = lcol[q * 3 + 2] = EMPTY;
        lg.attributes.color.needsUpdate = true;
        filled = 0; nextSlot = 0; resetTimer = 0;
      }
    }
  }

  // =========================================================
  // Driving: cars on a loop, lidar fan on the player car
  // =========================================================
  var drive = makeGroup("drive");
  var TA = 20, TB = 10;
  var roadMat = reg(drive, lineMat(0x6a6a6a, 1));
  var laneMat = reg(drive, lineMat(0x333333, 1));
  var bldMat = reg(drive, lineMat(0x3a3a3a, 1));
  function trackPt(th, off) {
    var x = Math.cos(th) * (TA + off), z = Math.sin(th) * (TB + off);
    return new THREE.Vector3(x, 0, z);
  }
  [-2.4, 2.4].forEach(function (off) {
    var pts = [];
    for (var i = 0; i <= 160; i++) pts.push(trackPt(i / 160 * Math.PI * 2, off));
    drive.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), roadMat));
  });
  var lane = [];
  for (var i2 = 0; i2 < 80; i2 += 2) {
    lane.push(trackPt(i2 / 80 * Math.PI * 2, 0), trackPt((i2 + 0.8) / 80 * Math.PI * 2, 0));
  }
  drive.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lane), laneMat));
  var obstacles = [];
  for (var b = 0; b < 26; b++) {
    var th = rnd() * Math.PI * 2, out = rnd() < 0.5 ? 6 + rnd() * 6 : -(5 + rnd() * 3.5);
    var p = trackPt(th, out), bh = 1 + rnd() * 5, bw = 1.5 + rnd() * 2;
    var bm = edges(new THREE.BoxGeometry(bw, bh, bw), bldMat);
    bm.position.set(p.x, bh / 2, p.z); drive.add(bm);
    obstacles.push({ x: p.x, z: p.z, r: bw * 0.7 });
  }
  var carMat = reg(drive, lineMat(0x9a9a9a, 1));
  var egoMat = reg(drive, lineMat(0xffffff, 1));
  function makeCar(mat) {
    var g = new THREE.Group();
    var body = edges(new THREE.BoxGeometry(2, 0.6, 1), mat); body.position.y = 0.4; g.add(body);
    var cab = edges(new THREE.BoxGeometry(1, 0.45, 0.85), mat); cab.position.set(-0.15, 0.92, 0); g.add(cab);
    drive.add(g); return g;
  }
  var cars = [];
  for (var cc = 0; cc < 5; cc++) {
    cars.push({ th: cc * 1.25, lane: cc % 2 ? 1.2 : -1.2, v: cc === 0 ? 0.32 : 0.22 + cc * 0.025, mesh: makeCar(cc === 0 ? egoMat : carMat) });
  }
  var NR = 32, RAYLEN = 9;
  var rayMat = reg(drive, lineMat(0x8a8a8a, 0.55));
  var rays = dynLines(NR, rayMat); drive.add(rays);
  var hitMat = reg(drive, pointMat({ size: 4, color: 0xffffff }, 1));
  var hitGeo = new THREE.BufferGeometry(); hitGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(NR * 3), 3));
  var hitPts = new THREE.Points(hitGeo, hitMat); hitPts.frustumCulled = false; drive.add(hitPts);
  var driveFrame = 0, egoSpeed = 0, egoAction = "throttle", egoGap = 0, egoSteer = 0;

  function updateDrive(dt) {
    var ego = cars[0];
    // Gap to the nearest car ahead in the same lane.
    var gap = 99;
    cars.forEach(function (c, i) {
      if (i === 0 || Math.abs(c.lane - ego.lane) > 0.1) return;
      var d = ((c.th - ego.th) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      gap = Math.min(gap, d * (TA + TB) / 2);
    });
    if (gap < 7 && Math.random() < dt * 0.8) ego.lane = -ego.lane;
    var target = gap < 5 ? 0.16 : 0.32;
    ego.v += (target - ego.v) * Math.min(dt * 1.5, 1);
    egoAction = gap < 5 ? "brake" : (ego.v < target - 0.01 ? "throttle" : "cruise");
    egoGap = gap;
    cars.forEach(function (c) {
      c.lane0 = c.lane0 === undefined ? c.lane : c.lane0 + (c.lane - c.lane0) * Math.min(dt * 2, 1);
      c.th += c.v * dt / 1.5;
      var p = trackPt(c.th, c.lane0), q = trackPt(c.th + 0.01, c.lane0);
      c.mesh.position.copy(p);
      c.mesh.rotation.y = -Math.atan2(q.z - p.z, q.x - p.x);
    });
    egoSteer = (ego.lane - ego.lane0) * 12 + 4;
    egoSpeed = ego.v * 190;
    // Lidar: rays stop at the first car or building they meet.
    var pos = rays.geometry.attributes.position.array, hp = hitGeo.attributes.position.array, hits = 0;
    var ex = ego.mesh.position.x, ez = ego.mesh.position.z, yaw = -ego.mesh.rotation.y;
    var targets = obstacles.concat(cars.slice(1).map(function (c) { return { x: c.mesh.position.x, z: c.mesh.position.z, r: 1.1 }; }));
    for (var i = 0; i < NR; i++) {
      var ang = yaw + i / NR * Math.PI * 2, dx = Math.cos(ang), dz = Math.sin(ang), len = RAYLEN, hit = false;
      for (var t = 0; t < targets.length; t++) {
        var ox = targets[t].x - ex, oz = targets[t].z - ez, proj = ox * dx + oz * dz;
        if (proj <= 0 || proj > len) continue;
        var perp = Math.abs(ox * dz - oz * dx);
        if (perp < targets[t].r) { len = proj - Math.sqrt(targets[t].r * targets[t].r - perp * perp) * 0.6; hit = true; }
      }
      pos[i * 6] = ex; pos[i * 6 + 1] = 0.6; pos[i * 6 + 2] = ez;
      pos[i * 6 + 3] = ex + dx * len; pos[i * 6 + 4] = 0.6; pos[i * 6 + 5] = ez + dz * len;
      hp[i * 3] = ex + dx * len; hp[i * 3 + 1] = 0.6; hp[i * 3 + 2] = ez + dz * len;
      if (hit) hits++;
    }
    rays.geometry.attributes.position.needsUpdate = true;
    hitGeo.attributes.position.needsUpdate = true;
    driveFrame++;
    return [
      "frame      " + driveFrame,
      "speed      " + egoSpeed.toFixed(0) + " km/h",
      "steering   " + egoSteer.toFixed(1) + "°",
      "lane       " + (ego.lane < 0 ? "inner" : "outer"),
      "gap ahead  " + (egoGap > 40 ? "clear" : egoGap.toFixed(1) + " m"),
      "lidar hits " + hits + " / " + NR,
      "action     " + egoAction
    ].join("\n");
  }

  // =========================================================
  // Drones: one drone flying a gate course
  // =========================================================
  var drone = makeGroup("drone");
  var gridMat = reg(drone, lineMat(0x222222, 1));
  var gv = [];
  for (var gx = -30; gx <= 30; gx += 3) gv.push(gx, 0, -18, gx, 0, 18);
  for (var gz = -18; gz <= 18; gz += 3) gv.push(-30, 0, gz, 30, 0, gz);
  var gGeo = new THREE.BufferGeometry(); gGeo.setAttribute("position", new THREE.Float32BufferAttribute(gv, 3));
  drone.add(new THREE.LineSegments(gGeo, gridMat));
  var towerMat = reg(drone, lineMat(0x3a3a3a, 1));
  for (var tw = 0; tw < 9; tw++) {
    var thh = 3 + rnd() * 10, tx = -24 + tw * 6 + rnd() * 2, tz = (rnd() < 0.5 ? -1 : 1) * (8 + rnd() * 6);
    var tm = edges(new THREE.BoxGeometry(2, thh, 2), towerMat); tm.position.set(tx, thh / 2, tz); drone.add(tm);
  }
  var course = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-20, 4, 0), new THREE.Vector3(-10, 8, -7), new THREE.Vector3(2, 5, -4),
    new THREE.Vector3(14, 9, -6), new THREE.Vector3(20, 6, 4), new THREE.Vector3(6, 3, 8), new THREE.Vector3(-10, 6, 6)
  ], true);
  var pathMat = reg(drone, lineMat(0x2e2e2e, 1));
  drone.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(course.getPoints(200)), pathMat));
  var gateMat = reg(drone, lineMat(0x8a8a8a, 1));
  var gates = [];
  for (var gi = 0; gi < 7; gi++) {
    var gu = gi / 7, gp = course.getPointAt(gu), gt = course.getTangentAt(gu);
    var ring = circle(1.6, 32, gateMat);
    ring.position.copy(gp);
    ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), gt);
    drone.add(ring); gates.push(gu);
  }
  var droneMat = reg(drone, lineMat(0xffffff, 1));
  var droneObj = new THREE.Group();
  var arms = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.9, 0, -0.9), new THREE.Vector3(0.9, 0, 0.9), new THREE.Vector3(-0.9, 0, 0.9), new THREE.Vector3(0.9, 0, -0.9)]);
  droneObj.add(new THREE.LineSegments(arms, droneMat));
  [[-0.9, -0.9], [0.9, 0.9], [-0.9, 0.9], [0.9, -0.9]].forEach(function (p) { var rr = circle(0.45, 16, droneMat); rr.position.set(p[0], 0.05, p[1]); droneObj.add(rr); });
  droneObj.add(edges(new THREE.BoxGeometry(0.5, 0.25, 0.5), droneMat));
  drone.add(droneObj);
  var DTN = 400, dtpos = new Float32Array(DTN * 3), dtHead = 0, dtCount = 0, dtT = 0;
  var dtg = new THREE.BufferGeometry(); dtg.setAttribute("position", new THREE.BufferAttribute(dtpos, 3));
  var dTrailMat = reg(drone, pointMat({ size: 2, color: 0x7a7a7a }, 1));
  var dtp = new THREE.Points(dtg, dTrailMat); dtp.frustumCulled = false; drone.add(dtp);
  var dropMat = reg(drone, lineMat(0x3a3a3a, 1));
  var dropLine = dynLines(1, dropMat); drone.add(dropLine);
  var du = 0, battery = 100, lastPos = new THREE.Vector3(), dFrame = 0;

  function updateDrone(dt) {
    du = (du + dt * 0.045) % 1;
    var p = course.getPointAt(du), t = course.getTangentAt(du);
    droneObj.position.copy(p);
    droneObj.rotation.set(t.z * 0.35, -Math.atan2(t.z, t.x), -t.x * 0.15);
    var speed = lastPos.distanceTo(p) / Math.max(dt, 1e-3);
    lastPos.copy(p);
    dtT -= dt;
    if (dtT <= 0) {
      dtT = 0.05;
      dtpos[dtHead * 3] = p.x; dtpos[dtHead * 3 + 1] = p.y; dtpos[dtHead * 3 + 2] = p.z;
      dtHead = (dtHead + 1) % DTN; dtCount = Math.min(dtCount + 1, DTN);
      dtg.attributes.position.needsUpdate = true; dtg.setDrawRange(0, dtCount);
    }
    var lp = dropLine.geometry.attributes.position.array;
    lp[0] = p.x; lp[1] = p.y; lp[2] = p.z; lp[3] = p.x; lp[4] = 0; lp[5] = p.z;
    dropLine.geometry.attributes.position.needsUpdate = true;
    battery = Math.max(12, battery - dt * 0.4);
    var next = 0; for (var g = 0; g < gates.length; g++) if (gates[g] > du) { next = g; break; }
    var heading = (Math.atan2(t.x, -t.z) * 180 / Math.PI + 360) % 360;
    dFrame++;
    return [
      "frame     " + dFrame,
      "altitude  " + p.y.toFixed(1) + " m",
      "speed     " + (speed * 3.6).toFixed(0) + " km/h",
      "heading   " + heading.toFixed(0) + "°",
      "pitch     " + (t.y * 30).toFixed(1) + "°",
      "next gate " + (next + 1) + " / " + gates.length,
      "battery   " + battery.toFixed(0) + "%"
    ].join("\n");
  }

  // =========================================================
  // Robots: a two-link arm doing pick and place
  // =========================================================
  var robot = makeGroup("robot");
  var tableMat = reg(robot, lineMat(0x3a3a3a, 1));
  var table = edges(new THREE.BoxGeometry(22, 0.6, 10), tableMat); table.position.y = -0.3; robot.add(table);
  var binMat = reg(robot, lineMat(0x5a5a5a, 1));
  var binA = edges(new THREE.BoxGeometry(5, 1, 4), binMat); binA.position.set(-5.2, 0.5, 1); robot.add(binA);
  var binB = edges(new THREE.BoxGeometry(5, 1, 4), binMat); binB.position.set(5.2, 0.5, 1); robot.add(binB);
  var armMat = reg(robot, lineMat(0xffffff, 1));
  var cubeMat = reg(robot, lineMat(0x9a9a9a, 1));
  var base = edges(new THREE.CylinderGeometry(1, 1.2, 0.8, 12), armMat); base.position.set(0, 0.4, -2.5); robot.add(base);
  var armLines = dynLines(6, armMat); robot.add(armLines);
  var joints = [];
  for (var jn = 0; jn < 3; jn++) { var jm = edges(new THREE.BoxGeometry(0.45, 0.45, 0.45), armMat); robot.add(jm); joints.push(jm); }
  var cubes = [];
  for (var cu = 0; cu < 6; cu++) {
    var cm = edges(new THREE.BoxGeometry(0.8, 0.8, 0.8), cubeMat);
    cm.position.set(-6.6 + (cu % 3) * 1.4, 0.4, 0.2 + Math.floor(cu / 3) * 1.6);
    robot.add(cm); cubes.push(cm);
  }
  var SHOULDER = new THREE.Vector3(0, 1.4, -2.5), L1 = 5, L2 = 4.6;
  var hand = new THREE.Vector3(0, 6, 0), handGoal = new THREE.Vector3();
  var phase = 0, phaseT = 0, cubeIdx = 0, carrying = null, placed = 0, grip = "open", rFrame = 0;
  var placeSpots = [];
  for (var ps = 0; ps < 6; ps++) placeSpots.push(new THREE.Vector3(3.8 + (ps % 3) * 1.4, 0.4, 0.2 + Math.floor(ps / 3) * 1.6));
  var ang = { yaw: 0, sh: 0, el: 0 };

  function solveIK(target) {
    var d = target.clone().sub(SHOULDER);
    var yaw = Math.atan2(d.z, d.x);
    var rr = Math.sqrt(d.x * d.x + d.z * d.z), dy = d.y;
    var dist = Math.min(Math.sqrt(rr * rr + dy * dy), L1 + L2 - 0.05);
    var a2 = Math.acos((L1 * L1 + L2 * L2 - dist * dist) / (2 * L1 * L2));
    var a1 = Math.atan2(dy, rr) + Math.acos((L1 * L1 + dist * dist - L2 * L2) / (2 * L1 * dist));
    var elbow = new THREE.Vector3(Math.cos(yaw) * Math.cos(a1) * L1, Math.sin(a1) * L1, Math.sin(yaw) * Math.cos(a1) * L1).add(SHOULDER);
    var dir = target.clone().sub(elbow).normalize().multiplyScalar(L2);
    ang.yaw = yaw * 180 / Math.PI; ang.sh = a1 * 180 / Math.PI; ang.el = (Math.PI - a2) * 180 / Math.PI;
    return { elbow: elbow, wrist: elbow.clone().add(dir) };
  }

  function updateRobot(dt) {
    var src = cubes[cubeIdx], dst = placeSpots[placed % 6];
    var above = function (v) { return new THREE.Vector3(v.x, 4.5, v.z); };
    var at = function (v) { return new THREE.Vector3(v.x, 1.6, v.z); };
    var steps = [above(src.position), at(src.position), "grip", above(src.position), above(dst), at(dst), "release", above(dst)];
    var step = steps[phase];
    phaseT += dt;
    if (step === "grip" || step === "release") {
      grip = step === "grip" ? "closed" : "open";
      if (phaseT > 0.35) {
        if (step === "grip") carrying = src;
        else { carrying.position.copy(dst); carrying = null; placed++; cubeIdx = (cubeIdx + 1) % cubes.length; if (placed % 6 === 0) resetCubes(); }
        phase = (phase + 1) % steps.length; phaseT = 0;
      }
    } else {
      handGoal.copy(step);
      hand.lerp(handGoal, Math.min(dt * 3.2, 1));
      if (hand.distanceTo(handGoal) < 0.08) { phase = (phase + 1) % steps.length; phaseT = 0; }
    }
    var sol = solveIK(hand);
    var A = armLines.geometry.attributes.position.array, gw = grip === "open" ? 0.45 : 0.25;
    var w = sol.wrist;
    var segs = [SHOULDER, sol.elbow, sol.elbow, w,
      new THREE.Vector3(w.x - gw, w.y, w.z), new THREE.Vector3(w.x + gw, w.y, w.z),
      new THREE.Vector3(w.x - gw, w.y, w.z), new THREE.Vector3(w.x - gw, w.y - 0.6, w.z),
      new THREE.Vector3(w.x + gw, w.y, w.z), new THREE.Vector3(w.x + gw, w.y - 0.6, w.z),
      new THREE.Vector3(0, 0.8, -2.5), SHOULDER];
    segs.forEach(function (v, i) { A[i * 3] = v.x; A[i * 3 + 1] = v.y; A[i * 3 + 2] = v.z; });
    armLines.geometry.attributes.position.needsUpdate = true;
    joints[0].position.copy(SHOULDER); joints[1].position.copy(sol.elbow); joints[2].position.copy(w);
    if (carrying) carrying.position.set(w.x, w.y - 1, w.z);
    rFrame++;
    return [
      "frame      " + rFrame,
      "base yaw   " + ang.yaw.toFixed(1) + "°",
      "shoulder   " + ang.sh.toFixed(1) + "°",
      "elbow      " + ang.el.toFixed(1) + "°",
      "gripper    " + grip,
      "holding    " + (carrying ? "cube " + (cubeIdx + 1) : "nothing"),
      "placed     " + placed
    ].join("\n");
  }
  function resetCubes() {
    cubes.forEach(function (cm, cu) { cm.position.set(-6.6 + (cu % 3) * 1.4, 0.4, 0.2 + Math.floor(cu / 3) * 1.6); });
  }

  // Small text labels drawn into the scene.
  function textSprite(group, text, size) {
    var cv = document.createElement("canvas"); cv.width = 512; cv.height = 96;
    var cx = cv.getContext("2d");
    cx.font = "500 44px 'IBM Plex Mono', Menlo, monospace"; cx.fillStyle = "#bdbdbd"; cx.textBaseline = "middle";
    cx.fillText(text, 8, 48);
    var tex = new THREE.CanvasTexture(cv);
    var m = new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 1, depthWrite: false }); m.userData.base = 1;
    reg(group, m);
    var sp = new THREE.Sprite(m); sp.scale.set(size * 5.33, size, 1); sp.center.set(0, 0.5);
    group.add(sp); return sp;
  }

  // =========================================================
  // AI: dataset table filling row by row
  // =========================================================
  var dataset = makeGroup("dataset");
  var ROWS = 16, RZ = 1.3, COLS = [{ x: -9, w: 6, name: "state" }, { x: -2.5, w: 2.5, name: "action" }, { x: 1.5, w: 5, name: "outcome" }];
  var rowMats = [];
  for (var ri = 0; ri < ROWS; ri++) {
    var rm = reg(dataset, lineMat(0x5a5a5a, 0.35)); rowMats.push(rm);
    COLS.forEach(function (c) {
      var slab = edges(new THREE.BoxGeometry(c.w, 0.25, 1), rm);
      slab.position.set(c.x + c.w / 2, 0.15, -10 + ri * RZ); dataset.add(slab);
    });
  }
  COLS.forEach(function (c) { var s = textSprite(dataset, c.name, 0.9); s.position.set(c.x, 0.8, -11.6); });
  var splitMat = reg(dataset, lineMat(0x9a9a9a, 1));
  [["train 80%", 8], ["val 10%", 1], ["test 10%", 1]].reduce(function (y, sdef) {
    var b = edges(new THREE.BoxGeometry(2.5, sdef[1], 2.5), splitMat); b.position.set(12, y + sdef[1] / 2, 0); dataset.add(b);
    var t = textSprite(dataset, sdef[0], 0.8); t.position.set(13.8, y + sdef[1] / 2, 0);
    return y + sdef[1] + 0.4;
  }, 0);
  var NP = 40, dpos = new Float32Array(NP * 3), dpar = [];
  var dpg = new THREE.BufferGeometry(); dpg.setAttribute("position", new THREE.BufferAttribute(dpos, 3));
  var dpMat = reg(dataset, pointMat({ size: 3, color: 0xffffff }, 1));
  var dpp = new THREE.Points(dpg, dpMat); dpp.frustumCulled = false; dataset.add(dpp);
  for (var dp = 0; dp < NP; dp++) dpar.push({ t: Math.random(), col: dp % 3 });
  var writeRow = 0, rowT = 0, episodes = 1284, samples = 0, epStep = 0;
  function updateDataset(dt) {
    rowT += dt;
    if (rowT > 0.45) {
      rowT = 0; writeRow = (writeRow + 1) % ROWS; samples++; epStep++;
      if (epStep > 240) { epStep = 0; episodes++; }
    }
    rowMats.forEach(function (m, i) {
      var age = (writeRow - i + ROWS) % ROWS;
      m.userData.base = age === 0 ? 1 : Math.max(0.25, 0.85 - age * 0.06);
    });
    var rz = -10 + writeRow * RZ;
    dpar.forEach(function (p, i) {
      p.t += dt * 1.4; if (p.t > 1) p.t -= 1;
      var c = COLS[p.col], tx = c.x + c.w / 2;
      dpos[i * 3] = -18 + (tx + 18) * p.t; dpos[i * 3 + 1] = 0.3 + Math.sin(p.t * Math.PI) * 2; dpos[i * 3 + 2] = rz * p.t + (1 - p.t) * (i % 5 - 2);
    });
    dpg.attributes.position.needsUpdate = true;
    var total = episodes * 240 + samples;
    return [
      "episodes   " + episodes.toLocaleString("en"),
      "this ep.   step " + epStep + " / 240",
      "row        { state, action, outcome }",
      "train      " + Math.round(total * 0.8).toLocaleString("en"),
      "val        " + Math.round(total * 0.1).toLocaleString("en"),
      "test       " + Math.round(total * 0.1).toLocaleString("en"),
      "export     RLDS (example)"
    ].join("\n");
  }

  // =========================================================
  // AI: a small network training with backprop
  // =========================================================
  var train = makeGroup("train");
  var LAYERS = [5, 7, 7, 5, 2], LXS = [-12, -6, 0, 6, 12], nodes = [];
  var nodeMat = reg(train, lineMat(0xd0d0d0, 1));
  LAYERS.forEach(function (n, li) {
    nodes.push([]);
    for (var ni = 0; ni < n; ni++) {
      var y = 6 + (ni - (n - 1) / 2) * 1.8;
      var nm = edges(new THREE.OctahedronGeometry(0.35), nodeMat); nm.position.set(LXS[li], y, 0); train.add(nm);
      nodes[li].push(new THREE.Vector3(LXS[li], y, 0));
    }
  });
  var edgeList = [];
  for (var li = 0; li < LAYERS.length - 1; li++)
    nodes[li].forEach(function (a) { nodes[li + 1].forEach(function (b) { edgeList.push([a, b, Math.random()]); }); });
  var epos = new Float32Array(edgeList.length * 6), ecol = new Float32Array(edgeList.length * 6);
  edgeList.forEach(function (e, i) { epos.set([e[0].x, e[0].y, e[0].z, e[1].x, e[1].y, e[1].z], i * 6); });
  var eg = new THREE.BufferGeometry();
  eg.setAttribute("position", new THREE.BufferAttribute(epos, 3));
  eg.setAttribute("color", new THREE.BufferAttribute(ecol, 3));
  var edgeMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1 }); edgeMat.userData.base = 1; reg(train, edgeMat);
  train.add(new THREE.LineSegments(eg, edgeMat));
  var inLbl = textSprite(train, "state in", 0.8); inLbl.position.set(-15.8, 6, 0);
  var outLbl = textSprite(train, "action out", 0.8); outLbl.position.set(13, 6, 0);
  var phaseLbl = textSprite(train, "", 0.8); phaseLbl.position.set(-12, 12.2, 0);
  function setSprite(sp, text) {
    var cv = sp.material.map.image, cx = cv.getContext("2d");
    cx.clearRect(0, 0, cv.width, cv.height);
    cx.font = "500 44px 'IBM Plex Mono', Menlo, monospace"; cx.fillStyle = "#ffffff"; cx.textBaseline = "middle";
    cx.fillText(text, 8, 48); sp.material.map.needsUpdate = true;
  }
  // Loss curve under the network.
  var LN = 160, lossPts = new Float32Array(LN * 3), lossN = 0;
  var lossGeo = new THREE.BufferGeometry(); lossGeo.setAttribute("position", new THREE.BufferAttribute(lossPts, 3));
  var lossMat = reg(train, lineMat(0xffffff, 1));
  var lossLine = new THREE.Line(lossGeo, lossMat); lossLine.frustumCulled = false; train.add(lossLine);
  var axisMat = reg(train, lineMat(0x3a3a3a, 1));
  var axis = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-12, -3, 0), new THREE.Vector3(12, -3, 0), new THREE.Vector3(-12, -3, 0), new THREE.Vector3(-12, 0.6, 0)]);
  train.add(new THREE.LineSegments(axis, axisMat));
  var lossLbl = textSprite(train, "loss", 0.7); lossLbl.position.set(-14.6, -1, 0);
  var tPhase = "forward", tT = 0, tStep = 0, tEpoch = 1, loss = 2.3, gradNorm = 0;
  function updateTrain(dt) {
    tT += dt / 1.4;
    if (tT >= 1) {
      tT = 0;
      if (tPhase === "forward") tPhase = "backward";
      else {
        tPhase = "forward"; tStep++;
        if (tStep % 40 === 0) tEpoch++;
        loss = 0.08 + 2.2 * Math.exp(-tStep / 35) + (Math.random() - 0.5) * 0.12 * Math.exp(-tStep / 80);
        gradNorm = 0.2 + loss * (0.6 + Math.random() * 0.3);
        edgeList.forEach(function (e) { e[2] = Math.min(1, Math.max(0, e[2] + (Math.random() - 0.5) * 0.3)); });
        if (lossN >= LN) { lossN = 0; tStep = 0; tEpoch = 1; }
        lossPts[lossN * 3] = -12 + lossN / LN * 24; lossPts[lossN * 3 + 1] = -3 + Math.min(loss, 2.4) * 1.45; lossPts[lossN * 3 + 2] = 0;
        lossN++; lossGeo.attributes.position.needsUpdate = true; lossGeo.setDrawRange(0, lossN);
      }
      setSprite(phaseLbl, tPhase === "forward" ? "forward pass  →" : "←  backward pass");
    }
    var front = tPhase === "forward" ? -12 + tT * 24 : 12 - tT * 24;
    edgeList.forEach(function (e, i) {
      var mid = (e[0].x + e[1].x) / 2, d = Math.abs(mid - front);
      var pulse = Math.max(0, 1 - d / 4);
      var base = 0.12 + e[2] * 0.18;
      var v = tPhase === "forward" ? base + pulse * 0.85 : base + pulse * 0.5;
      for (var k = 0; k < 6; k++) ecol[i * 6 + k] = v;
    });
    eg.attributes.color.needsUpdate = true;
    return [
      "epoch      " + tEpoch,
      "step       " + tStep,
      "pass       " + tPhase,
      "loss       " + loss.toFixed(3),
      "grad norm  " + gradNorm.toFixed(3),
      "lr         3e-4",
      "batch      256 rows"
    ].join("\n");
  }

  // =========================================================
  // AI: the SDK sitting in a game loop
  // =========================================================
  var sdk = makeGroup("sdk");
  var engMat = reg(sdk, lineMat(0x7a7a7a, 1));
  var sdkMat = reg(sdk, lineMat(0xffffff, 1));
  var dimMat = reg(sdk, lineMat(0x333333, 1));
  var eng = edges(new THREE.BoxGeometry(9, 5, 6), engMat); eng.position.set(-10, 2.5, 0); sdk.add(eng);
  for (var eb = 0; eb < 7; eb++) {
    var ebh = 0.5 + rnd() * 2.5, ebm = edges(new THREE.BoxGeometry(1, ebh, 1), dimMat);
    ebm.position.set(-13 + (eb % 4) * 2, ebh / 2, -1.5 + Math.floor(eb / 4) * 3); sdk.add(ebm);
  }
  var sdkBox = edges(new THREE.BoxGeometry(3, 3, 3), sdkMat); sdkBox.position.set(0, 2.5, 0); sdk.add(sdkBox);
  var inner = edges(new THREE.BoxGeometry(1.6, 1.6, 1.6), sdkMat); inner.position.copy(sdkBox.position); sdk.add(inner);
  var store = [];
  for (var st = 0; st < 10; st++) { var sl = edges(new THREE.BoxGeometry(4, 0.35, 3), engMat); sl.position.set(10, 0.3 + st * 0.5, 0); sl.visible = false; sdk.add(sl); store.push(sl); }
  var pipe = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-5.5, 2.5, 0), new THREE.Vector3(-1.5, 2.5, 0), new THREE.Vector3(1.5, 2.5, 0), new THREE.Vector3(8, 2.5, 0)]);
  sdk.add(new THREE.LineSegments(pipe, dimMat));
  textSprite(sdk, "game loop", 0.9).position.set(-14.5, 6, 0);
  textSprite(sdk, "Dunia SDK", 0.9).position.set(-2.2, 5, 0);
  textSprite(sdk, "episodes", 0.9).position.set(8, 6.2, 0);
  var PK = 24, ppos = new Float32Array(PK * 3), pk = [];
  var pkg = new THREE.BufferGeometry(); pkg.setAttribute("position", new THREE.BufferAttribute(ppos, 3));
  var pkMat = reg(sdk, pointMat({ size: 3.5, color: 0xffffff }, 1));
  var pkp = new THREE.Points(pkg, pkMat); pkp.frustumCulled = false; sdk.add(pkp);
  for (var pq = 0; pq < PK; pq++) pk.push({ t: pq / PK });
  var calls = { state: 0, action: 0, outcome: 0 }, stored = 0, storeT = 0;
  var CODE = [
    "// illustrative",
    "rec = Dunia.Start(Format.RLDS)",
    "tick: rec.State(world); rec.Action(input)",
    "step: rec.Outcome(result)"
  ].join("\n");
  function updateSdk(dt) {
    sdkBox.rotation.y += dt * 0.4; inner.rotation.y -= dt * 0.7; inner.rotation.x += dt * 0.3;
    pk.forEach(function (p, i) {
      var before = p.t;
      p.t += dt * 0.35; if (p.t > 1) p.t -= 1;
      if (before < 0.4 && p.t >= 0.4) { var kk = ["state", "action", "outcome"][i % 3]; calls[kk]++; }
      var x = p.t < 0.4 ? -5.5 + (p.t / 0.4) * 5.5 : (p.t - 0.4) / 0.6 * 8;
      ppos[i * 3] = x; ppos[i * 3 + 1] = 2.5 + (i % 3 - 1) * 0.35; ppos[i * 3 + 2] = 0;
    });
    pkg.attributes.position.needsUpdate = true;
    storeT += dt;
    if (storeT > 0.8) { storeT = 0; stored++; store.forEach(function (s, i) { s.visible = i < stored % 11; }); }
    return CODE + "\n\ncalls  State " + calls.state + " · Action " + calls.action + " · Outcome " + calls.outcome;
  }

  // =========================================================
  // Use cases: copy and camera framing
  // =========================================================
  var NAMES_NOTE = "Company names are examples of teams that use this kind of data. They are not our customers.";
  var MODES = {
    drive: {
      label: "Driving", kicker: "Gaming division · Driving",
      title: "Driving data for L4 cars",
      body: "Someone drives in a game. Dunia saves what the car could sense, what the driver did and what happened next, for every frame, already labelled. That is the shape of data self-driving teams train on.",
      flow: ["play a drive", "sensor view + controls", "labelled episode"],
      who: "<b>Who needs it:</b> L4 self-driving programs, for example Tesla and BYD.",
      cam: [4, 36, 46], look: [4, 0, 0], update: updateDrive, anchor: function () { return cars[0].mesh.position.clone().setY(1.2); }, side: "games", note: NAMES_NOTE
    },
    drone: {
      label: "Drones", kicker: "Gaming division · Drones",
      title: "Flight data for autonomous drones",
      body: "Players fly a course through gates. Dunia records position, speed, attitude and every stick input, so a model can learn how a pilot handles tight spaces and wind.",
      flow: ["fly a course", "pose + inputs", "flight log"],
      who: "<b>Who needs it:</b> drone and aerospace teams, for example Aerodyne and SpaceX.",
      cam: [8, 22, 40], look: [6, 4, 0], update: updateDrone, anchor: function () { return droneObj.position.clone(); }, side: "games", note: NAMES_NOTE
    },
    robot: {
      label: "Robots", kicker: "Gaming division · Robots",
      title: "Grasp data for robot arms",
      body: "Players pick things up and put them somewhere else. Dunia records each grasp: joint angles, grip, where the object went and whether it worked.",
      flow: ["pick and place", "joints + grip", "grasp dataset"],
      who: "<b>Who needs it:</b> robotics companies building arms and humanoids.",
      cam: [6, 16, 26], look: [2, 2, 0], update: updateRobot, anchor: function () { return joints[2].position.clone(); }, side: "games", note: ""
    },
    dataset: {
      label: "Datasets", kicker: "AI division · Datasets",
      title: "Gameplay becomes a dataset",
      body: "Every step a player takes becomes one row: what the world looked like, what they did, and what happened next. Rows group into episodes, and episodes split into training, validation and test sets.",
      flow: ["episode", "state, action, outcome", "train / val / test"],
      who: "<b>Export:</b> in whatever format the buyer trains on, for example RLDS.",
      cam: [4, 30, 42], look: [3, 0, -1], update: updateDataset, shift: 9, anchor: function () { return new THREE.Vector3(6.5, 0.3, -10 + writeRow * RZ); }, side: "ai", note: "Numbers in this view are a simulation."
    },
    train: {
      label: "Training", kicker: "AI division · Training",
      title: "What the data is for",
      body: "A model looks at the state and guesses the action. The guess is compared with what the player really did, and the error flows backwards through the network to adjust it. That is backpropagation. Cleaner data means the model learns faster.",
      flow: ["forward pass", "loss", "backward pass"],
      who: "<b>Who trains on it:</b> teams building robot policies and world models.",
      cam: [1, 7, 56], look: [1, 4, 0], update: updateTrain, anchor: function () { return nodes[4][0].clone(); }, side: "ai", note: "Numbers in this view are a simulation."
    },
    sdk: {
      label: "Dunia SDK", kicker: "AI division · Dunia SDK",
      title: "A small library in the game loop",
      body: "The SDK sits inside the game engine. At each decision it reads the world state and the player's input, then writes the outcome once the step resolves. Nothing changes for the player.",
      flow: ["game loop", "Dunia SDK", "episodes"],
      who: "<b>Status:</b> an MVP runs inside our own demo game.",
      cam: [-1, 13, 42], look: [-1, 6, 0], update: updateSdk, tag: "up", anchor: function () { return new THREE.Vector3(0, 4, 0); }, side: "ai", note: "Code is illustrative."
    }
  };
  var mode = "city";
  var panel = document.getElementById("sim-panel"), switcher = document.getElementById("sim-switch");
  var el = function (id) { return document.getElementById(id); };
  function openMode(m) {
    mode = m;
    var M = MODES[m];
    hero.classList.add("sim");
    el("sim-kicker").textContent = M.kicker;
    el("sim-title").textContent = M.title;
    el("sim-body").textContent = M.body;
    el("sim-flow").innerHTML = M.flow.map(function (f) { return "<span>" + f + "</span>"; }).join(" → ");
    el("sim-who").innerHTML = M.who;
    el("sim-note").textContent = M.note || "";
    el("sim-note").hidden = !M.note;
    panel.classList.toggle("right", M.side === "ai");
    switcher.classList.toggle("left", M.side === "ai");
    tagEl.style.opacity = 0;
    switcher.innerHTML = Object.keys(MODES).filter(function (k) { return MODES[k].side === M.side; })
      .map(function (k) { return '<button type="button" data-mode="' + k + '"' + (k === m ? ' class="on"' : '') + '>' + MODES[k].label + '</button>'; }).join("");
    readout.textContent = M.update(0);
    panel.hidden = false; switcher.hidden = false;
    panel.style.animation = "none"; void panel.offsetWidth; panel.style.animation = "";
    Object.keys(groups).forEach(function (k) { if (k === m) groups[k].visible = true; });
    setSide(0);
  }
  function closeMode() {
    mode = "city";
    hero.classList.remove("sim");
    panel.hidden = true; switcher.hidden = true;
    groups.city.visible = true;
  }
  hero.addEventListener("click", function (e) {
    var b = e.target.closest("[data-mode]");
    if (b) { e.stopPropagation(); openMode(b.dataset.mode); }
  });
  // Clicking the scene itself, outside the panel, goes back to the two halves.
  renderer.domElement.addEventListener("click", function () { if (mode !== "city") closeMode(); });
  el("sim-back").addEventListener("click", closeMode);
  window.addEventListener("keydown", function (e) { if (e.key === "Escape" && mode !== "city") closeMode(); });

  // =========================================================
  // Hover to pick a side
  // =========================================================
  var side = 0, sideTarget = 0;
  var pickGames = el("pick-games"), pickAi = el("pick-ai");
  var pinsEl = el("pins");
  var pins = Array.prototype.map.call(pinsEl.querySelectorAll(".pin"), function (p) {
    return { el: p, v: new THREE.Vector3(+p.dataset.x, +p.dataset.y, +p.dataset.z) };
  });
  var probe = el("probe"), probeTag = el("probe-tag"), readout = el("sim-readout");
  var mouse = null, tracked = -1, mouseY = 0;
  var DIRS = { "1,0": "east", "-1,0": "west", "0,1": "south", "0,-1": "north" };
  function setSide(v) {
    sideTarget = v;
    pickGames.classList.toggle("on", v < 0);
    pickAi.classList.toggle("on", v > 0);
    pinsEl.classList.toggle("show-games", v < 0);
    pinsEl.classList.toggle("show-ai", v > 0);
  }
  function sideAt(clientX) { var r = hero.getBoundingClientRect(); return (clientX - r.left) / r.width < 0.5 ? -1 : 1; }
  hero.addEventListener("pointermove", function (e) {
    var r = hero.getBoundingClientRect();
    mouseY = (e.clientY - r.top) / r.height - 0.5;
    mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (mode === "city" && e.pointerType === "mouse") setSide(sideAt(e.clientX));
  });
  hero.addEventListener("pointerleave", function () { mouse = null; tracked = -1; if (mode === "city") setSide(0); });
  renderer.domElement.addEventListener("pointerdown", function (e) { if (mode === "city") setSide(sideAt(e.clientX)); });
  pickGames.addEventListener("focus", function () { if (mode === "city") setSide(-1); });
  pickAi.addEventListener("focus", function () { if (mode === "city") setSide(1); });

  var pv = new THREE.Vector3();
  function toScreen(v, w, h) {
    pv.copy(v).project(camera);
    return { x: (pv.x + 1) / 2 * w, y: (1 - pv.y) / 2 * h };
  }
  var tagEl = el("sim-tag");
  function overlays() {
    var w = hero.clientWidth, h = hero.clientHeight;
    if (mode !== "city") {
      var ts = toScreen(MODES[mode].anchor(), w, h);
      tagEl.style.transform = "translate(" + ts.x + "px," + ts.y + "px)";
      tagEl.style.opacity = 1;
      var up = MODES[mode].tag === "up";
      tagEl.classList.toggle("up", up);
      tagEl.classList.toggle("flip", !up && ts.x > w * 0.55);
    }
    pins.forEach(function (p) {
      var s = toScreen(p.v, w, h);
      p.el.style.left = s.x + "px"; p.el.style.top = s.y + "px";
    });
    if (mode === "city" && mouse && side < -0.3) {
      if (tracked < 0) {
        var best = 70, bi = -1;
        for (var n = 0; n < NA; n++) {
          if (agents[n].mode !== "walk") continue;
          pv.set(apos[n * 3], apos[n * 3 + 1], apos[n * 3 + 2]);
          var s = toScreen(pv, w, h), d = Math.hypot(s.x - mouse.x, s.y - mouse.y);
          if (d < best) { best = d; bi = n; }
        }
        tracked = bi;
      }
      if (tracked >= 0 && agents[tracked].mode === "walk") {
        var a = agents[tracked], wx = apos[tracked * 3], wz = apos[tracked * 3 + 2];
        pv.set(wx, apos[tracked * 3 + 1], wz);
        var sp = toScreen(pv, w, h);
        if (Math.hypot(sp.x - mouse.x, sp.y - mouse.y) < 140) {
          probe.style.transform = "translate(" + sp.x + "px," + sp.y + "px)";
          probeTag.innerHTML = "<b>player " + String(tracked + 1).padStart(2, "0") + "</b>\n" +
            "pos     " + wx.toFixed(1) + ", " + wz.toFixed(1) + "\n" +
            "heading " + (DIRS[a.dx + "," + a.dz] || "idle") + "\n" +
            "action  " + (a.turned ? "turn" : "move") + "\n" +
            "step    " + a.steps;
          probe.classList.add("on");
          return;
        }
      }
      tracked = -1;
    }
    probe.classList.remove("on");
  }

  function resize() {
    var w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.userData.narrow = w < 700;
    camera.updateProjectionMatrix();
  }

  var clock = 0, readoutT = 0;
  function frame(dt, animate) {
    // Fade groups toward the current mode.
    Object.keys(groups).forEach(function (k) {
      var g = groups[k], target = k === mode ? 1 : 0;
      g.userData.alpha += (target - g.userData.alpha) * Math.min(dt * 4, 1);
      if (target === 0 && g.userData.alpha < 0.01) { g.userData.alpha = 0; g.visible = false; }
    });
    if (animate) {
      if (groups.city.visible) updateCity(dt);
      Object.keys(MODES).forEach(function (k) {
        if (!groups[k].visible) return;
        var txt = MODES[k].update(dt);
        if (k === mode) { readoutT -= dt; if (readoutT <= 0) { readoutT = 0.1; readout.textContent = txt; } }
      });
    }
    side += (sideTarget - side) * Math.min(dt * 3, 1);
    var narrow = camera.userData.narrow;
    var tp, tl;
    if (mode === "city") {
      var cx = side * 7;
      tp = [cx + Math.sin(clock * 0.05) * 2, 20 + mouseY * -3, narrow ? 74 : 50];
      tl = [cx * 0.9, 2, 0];
    } else {
      var M = MODES[mode], k2 = narrow ? 1.6 : 1;
      // Keep the scene to the right of the panel on wide screens.
      var shift = narrow ? 0 : (M.shift != null ? M.shift : (M.side === "ai" ? 3 : -3));
      tp = [M.cam[0] * k2 + shift + Math.sin(clock * 0.1) * 3, M.cam[1] * k2, M.cam[2] * k2];
      tl = [M.look[0] + shift, M.look[1], M.look[2]];
    }
    camPos.lerp(new THREE.Vector3(tp[0], tp[1], tp[2]), Math.min(dt * 2.2, 1));
    camLook.lerp(new THREE.Vector3(tl[0], tl[1], tl[2]), Math.min(dt * 2.2, 1));
    camera.position.copy(camPos);
    camera.lookAt(camLook);

    var gameBright = side < 0 ? 1 : 1 - side * 0.65, aiBright = side > 0 ? 1 : 1 + side * 0.65;
    Object.keys(groups).forEach(function (k) {
      var g = groups[k];
      g.userData.mats.forEach(function (m) { m.opacity = m.userData.base * g.userData.alpha; });
    });
    cityMat.opacity *= gameBright; streetMat.opacity *= gameBright; trailMat.opacity *= gameBright;
    latticeMat.opacity *= aiBright; frameMat.opacity *= aiBright;
    renderer.render(scene, camera);
    overlays();
  }

  window.addEventListener("resize", resize);
  resize();
  for (var wu = 0; wu < 600; wu++) updateCity(1 / 30);
  Object.keys(MODES).forEach(function (k) { for (var i = 0; i < 60; i++) MODES[k].update(1 / 30); });
  camPos.set(0, 20, camera.userData.narrow ? 74 : 50);

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var visible = true;
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(hero);
  var last = performance.now();
  function loop(now) {
    var dt = Math.min((now - last) / 1000, 0.1); last = now;
    if (visible) { clock += dt; frame(dt, !reduced); }
    requestAnimationFrame(loop);
  }
  frame(1, false);
  requestAnimationFrame(loop);
})();

/* Section flourishes: one small three.js scene per band. Each renders only while on screen and leans a little toward the cursor. */
(function () {
  if (!window.THREE) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mx = 0, my = 0;
  window.addEventListener("pointermove", function (e) { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });

  function line(color, opacity) { return new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity }); }
  function edges(geo, mat) { return new THREE.LineSegments(new THREE.EdgesGeometry(geo), mat); }
  function dots(n, color, size) {
    var g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ color: color, size: size, sizeAttenuation: true }));
  }
  function circle(mat) { var pts = []; for (var i = 0; i < 64; i++) pts.push(new THREE.Vector3(Math.cos(i / 64 * 6.2832), Math.sin(i / 64 * 6.2832), 0)); return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), mat); }
  var AI = 0x2343d6, TEAL = 0x0b7f8c, INK = 0x8a8a8a;

  var BUILD = {
    // Company: a wide field of points rising and falling slowly, like terrain being sampled.
    field: function (s, cam, cv) {
      cam.position.set(0, 9, 18); cam.lookAt(2, -1, 0);
      var W = 90, D = 34, N = W * D, p = dots(N, 0x777777, 0.085); s.add(p);
      p.material.transparent = true; p.material.opacity = 0.6;
      // A few points light up blue, like samples being picked out of the field.
      var M = 18, hi = dots(M, AI, 0.18); s.add(hi);
      var pick = []; for (var m = 0; m < M; m++) pick.push({ i: (Math.random() * N) | 0, o: Math.random() });
      var a = p.geometry.attributes.position.array, b = hi.geometry.attributes.position.array;
      for (var i = 0; i < W; i++) for (var j = 0; j < D; j++) { var k = (i * D + j) * 3; a[k] = (i - W / 2) * 0.5 + 3; a[k + 2] = (j - D / 2) * 0.5; }
      // Cursor ripple: where the pointer meets the field, the surface lifts.
      var ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 2), hit = new THREE.Vector3(9999, 0, 9999), tgt = new THREE.Vector3(9999, 0, 9999), m2 = new THREE.Vector2();
      cv.parentNode.addEventListener("pointermove", function (e) {
        var r = cv.getBoundingClientRect(); m2.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        ray.setFromCamera(m2, cam); if (!ray.ray.intersectPlane(plane, tgt)) tgt.set(9999, 0, 9999);
      });
      cv.parentNode.addEventListener("pointerleave", function () { tgt.set(9999, 0, 9999); });
      return function (t) {
        if (tgt.x > 9000) hit.lerp(tgt, 0.02); else if (hit.x > 9000) hit.copy(tgt); else hit.lerp(tgt, 0.12);
        for (var i = 0; i < W; i++) for (var j = 0; j < D; j++) {
          var k = (i * D + j) * 3, x = a[k], z = a[k + 2], dx = x - hit.x, dz = z - hit.z, d2 = dx * dx + dz * dz;
          a[k + 1] = Math.sin(x * 0.3 + t * 0.6) * 0.7 + Math.cos(z * 0.4 - t * 0.45) * 0.6 + Math.sin((x + z) * 0.12 + t * 0.25) * 0.9 - 2
            + 1.5 * Math.exp(-d2 / 6) * Math.cos(Math.sqrt(d2) * 1.4 - t * 3);
        }
        for (var m = 0; m < M; m++) {
          var q = pick[m], ph = (q.o + t * 0.12) % 1;
          if (ph < 0.01) q.i = (Math.random() * N) | 0;
          var k2 = q.i * 3, lift = Math.sin(ph * Math.PI) * 1.4;
          b[m * 3] = a[k2]; b[m * 3 + 1] = a[k2 + 1] + lift; b[m * 3 + 2] = a[k2 + 2];
        }
        p.geometry.attributes.position.needsUpdate = true; hi.geometry.attributes.position.needsUpdate = true;
      };
    },
    // About: Malaysia outline, peninsula and Borneo, with Kuala Lumpur marked.
    malaysia: function (s, cam) {
      var MY = [[[100.12, 6.44], [100.16, 6.64], [100.22, 6.69], [100.35, 6.55], [100.57, 6.47], [100.63, 6.45], [100.72, 6.48], [100.79, 6.43], [100.82, 6.33], [100.87, 6.25], [100.99, 6.26], [101.05, 6.24], [101.08, 6.17], [101.09, 6.03], [101.08, 5.96], [100.99, 5.85], [100.98, 5.77], [101.03, 5.72], [101.08, 5.68], [101.15, 5.64], [101.23, 5.73], [101.26, 5.79], [101.4, 5.85], [101.56, 5.91], [101.65, 5.8], [101.72, 5.77], [101.79, 5.78], [101.87, 5.82], [101.92, 5.91], [101.94, 5.98], [102.06, 6.1], [102.07, 6.18], [102.1, 6.24], [102.28, 6.2], [102.34, 6.17], [102.53, 5.86], [102.79, 5.64], [102.9, 5.56], [102.98, 5.52], [103.1, 5.41], [103.2, 5.26], [103.42, 4.85], [103.45, 4.67], [103.47, 4.39], [103.42, 3.98], [103.36, 3.77], [103.37, 3.67], [103.45, 3.52], [103.43, 3.38], [103.45, 3.26], [103.44, 2.93], [103.48, 2.84], [103.54, 2.77], [103.81, 2.58], [103.83, 2.51], [103.97, 2.26], [104.22, 1.72], [104.29, 1.48], [104.28, 1.42], [104.18, 1.37], [104.11, 1.41], [104.1, 1.49], [104.02, 1.58], [103.99, 1.46], [103.92, 1.45], [103.82, 1.48], [103.69, 1.45], [103.55, 1.33], [103.48, 1.33], [103.43, 1.43], [103.4, 1.5], [103.36, 1.55], [102.9, 1.79], [102.73, 1.86], [102.55, 2.04], [102.15, 2.25], [101.89, 2.45], [101.78, 2.57], [101.52, 2.68], [101.41, 2.81], [101.35, 2.84], [101.3, 2.89], [101.35, 3.01], [101.33, 3.14], [101.3, 3.25], [101.12, 3.47], [101.03, 3.63], [100.85, 3.78], [100.78, 3.86], [100.72, 3.97], [100.8, 4.02], [100.76, 4.1], [100.66, 4.23], [100.62, 4.37], [100.62, 4.65], [100.48, 5.04], [100.35, 5.59], [100.37, 5.78], [100.34, 5.98], [100.26, 6.18], [100.16, 6.32], [100.12, 6.44]], [[117.58, 4.17], [117.45, 4.19], [117.28, 4.3], [117.1, 4.34], [116.84, 4.34], [116.7, 4.35], [116.59, 4.34], [116.51, 4.37], [116.42, 4.31], [116.32, 4.35], [116.24, 4.36], [116.14, 4.35], [116.02, 4.29], [115.9, 4.35], [115.84, 4.33], [115.78, 4.25], [115.68, 4.19], [115.63, 4.08], [115.6, 3.98], [115.56, 3.73], [115.54, 3.63], [115.57, 3.5], [115.52, 3.36], [115.49, 3.21], [115.49, 3.13], [115.45, 3.04], [115.38, 3.01], [115.31, 2.99], [115.25, 3.03], [115.19, 2.97], [115.12, 2.89], [115.09, 2.84], [115.09, 2.76], [115.08, 2.69], [115.13, 2.61], [115.18, 2.57], [115.15, 2.49], [115.09, 2.45], [114.97, 2.35], [114.84, 2.27], [114.77, 2.21], [114.79, 2.05], [114.83, 1.98], [114.8, 1.89], [114.7, 1.85], [114.66, 1.69], [114.63, 1.62], [114.57, 1.51], [114.51, 1.45], [114.39, 1.5], [114.27, 1.47], [114.13, 1.45], [114, 1.46], [113.9, 1.43], [113.83, 1.38], [113.76, 1.31], [113.68, 1.26], [113.62, 1.24], [113.51, 1.31], [113.36, 1.33], [113.13, 1.41], [113.07, 1.43], [113.01, 1.43], [113, 1.5], [112.94, 1.57], [112.48, 1.56], [112.34, 1.51], [112.25, 1.48], [112.19, 1.44], [112.17, 1.34], [112.13, 1.24], [112.08, 1.14], [111.92, 1.11], [111.81, 1.01], [111.69, 1.01], [111.61, 1.02], [111.55, 0.99], [111.48, 1], [111.29, 1.04], [111.1, 1.05], [110.99, 1.03], [110.62, 0.88], [110.5, 0.86], [110.4, 0.94], [110.31, 1], [110.12, 1.19], [110.04, 1.23], [109.99, 1.28], [109.94, 1.34], [109.88, 1.4], [109.82, 1.44], [109.73, 1.52], [109.66, 1.62], [109.64, 1.78], [109.57, 1.81], [109.54, 1.9], [109.63, 2.03], [109.69, 1.89], [109.86, 1.76], [109.98, 1.72], [110.11, 1.7], [110.25, 1.69], [110.35, 1.72], [110.67, 1.55], [110.78, 1.52], [110.89, 1.53], [111.1, 1.4], [111.22, 1.4], [111.12, 1.45], [111.06, 1.49], [111.03, 1.56], [111.04, 1.63], [111.11, 1.68], [111.15, 1.74], [111.17, 1.9], [111.2, 1.98], [111.25, 2.06], [111.27, 2.14], [111.21, 2.2], [111.2, 2.3], [111.21, 2.38], [111.24, 2.44], [111.3, 2.4], [111.35, 2.37], [111.44, 2.38], [111.44, 2.5], [111.44, 2.63], [111.51, 2.74], [111.62, 2.82], [111.73, 2.85], [112.12, 2.92], [112.74, 3.07], [112.92, 3.13], [112.99, 3.16], [113.04, 3.21], [113.14, 3.34], [113.32, 3.56], [113.45, 3.74], [113.71, 4], [113.92, 4.24], [113.99, 4.42], [113.99, 4.48], [113.98, 4.55], [114.05, 4.59], [114.17, 4.53], [114.22, 4.48], [114.26, 4.41], [114.29, 4.35], [114.32, 4.26], [114.42, 4.26], [114.51, 4.11], [114.57, 4.05], [114.66, 4.04], [114.72, 4.1], [114.77, 4.17], [114.81, 4.27], [114.83, 4.35], [114.82, 4.43], [114.78, 4.55], [114.76, 4.67], [114.79, 4.76], [114.86, 4.8], [114.94, 4.86], [115.03, 4.9], [115.03, 4.82], [115.03, 4.69], [115.05, 4.58], [115.11, 4.39], [115.17, 4.36], [115.25, 4.35], [115.32, 4.36], [115.28, 4.46], [115.27, 4.63], [115.23, 4.75], [115.17, 4.87], [115.38, 4.93], [115.43, 4.97], [115.52, 5.05], [115.58, 5.19], [115.47, 5.25], [115.42, 5.33], [115.42, 5.41], [115.56, 5.57], [115.62, 5.55], [115.69, 5.54], [115.8, 5.54], [115.88, 5.61], [115.92, 5.72], [116.06, 5.88], [116.11, 6], [116.14, 6.13], [116.5, 6.52], [116.54, 6.58], [116.75, 6.98], [116.83, 6.95], [116.85, 6.83], [116.81, 6.69], [116.79, 6.61], [116.91, 6.66], [117.02, 6.8], [117.08, 6.92], [117.13, 6.97], [117.23, 6.94], [117.24, 6.83], [117.29, 6.68], [117.38, 6.61], [117.5, 6.57], [117.61, 6.51], [117.67, 6.43], [117.69, 6.35], [117.69, 6.27], [117.61, 6.2], [117.65, 6.07], [117.64, 6], [117.62, 5.94], [117.5, 5.88], [117.82, 5.94], [117.9, 5.97], [118, 6.05], [118.06, 5.98], [118.12, 5.86], [117.94, 5.79], [117.97, 5.71], [118.14, 5.75], [118.25, 5.82], [118.35, 5.81], [118.46, 5.76], [118.51, 5.73], [118.56, 5.68], [118.59, 5.59], [118.71, 5.56], [118.96, 5.43], [119.05, 5.42], [119.18, 5.43], [119.26, 5.37], [119.27, 5.31], [119.26, 5.25], [119.22, 5.16], [119.13, 5.1], [118.91, 5.02], [118.67, 4.96], [118.55, 4.97], [118.38, 5.02], [118.32, 5.01], [118.26, 4.99], [118.18, 4.83], [118.32, 4.67], [118.56, 4.5], [118.59, 4.41], [118.5, 4.36], [118.36, 4.34], [118.23, 4.32], [118.12, 4.29], [118.01, 4.25], [117.9, 4.26], [117.74, 4.34], [117.65, 4.3], [117.6, 4.2]]];
      cam.position.set(0, -2, 12); cam.lookAt(0, 0.2, 0);
      var g = new THREE.Group(); s.add(g);
      var cx = 109.5, cy = 4.0, sc = 0.64;
      function v(x, y) { return new THREE.Vector3((x - cx) * sc, (y - cy) * sc, 0); }
      MY.forEach(function (ring) {
        var pts = ring.map(function (c) { return v(c[0], c[1]); });
        g.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), line(0x4a4a4a, 0.8)));
        var fill = dots(pts.length, 0x8a8a8a, 0.05); fill.geometry.setFromPoints(pts); g.add(fill);
      });
      var kl = v(101.69, 3.14), ring = circle(line(AI, 1)); ring.position.copy(kl); g.add(ring);
      var pin = dots(1, AI, 0.22); pin.geometry.attributes.position.array.set([kl.x, kl.y, 0.01]); g.add(pin);
      return function (t) {
        g.rotation.x = -0.35 + Math.sin(t * 0.2) * 0.05; g.rotation.y = Math.sin(t * 0.15) * 0.12;
        var k = (t * 0.5) % 1; ring.scale.setScalar(0.06 + k * 0.4); ring.material.opacity = 1 - k;
      };
    },
    // Dunia poster: lattice in blue with points settling into slots.
    dunia: function (s, cam) {
      cam.position.set(9, 6, 14); cam.lookAt(0, 0, 0);
      var g = new THREE.Group(); s.add(g);
      g.add(edges(new THREE.BoxGeometry(6, 4, 4), line(0x5b78ff, 0.85)));
      for (var i = -2; i <= 2; i++) { var l = edges(new THREE.PlaneGeometry(6, 4), line(0x5b78ff, 0.18)); l.position.z = i * 0.8; g.add(l); }
      var N = 140, p = dots(N, 0xffffff, 0.07); g.add(p);
      var seed = []; for (var k = 0; k < N; k++) seed.push({ x: (Math.random() - .5) * 5.4, y: (Math.random() - .5) * 3.4, z: (Math.random() - .5) * 3.4, p: Math.random() });
      return function (t) {
        g.rotation.y = Math.sin(t * 0.25) * 0.5 - 0.3;
        var a = p.geometry.attributes.position.array;
        for (var k = 0; k < N; k++) { var S = seed[k], q = (S.p + t * 0.08) % 1; a[k * 3] = q < 0.5 ? -9 + q * 2 * (9 + S.x) : S.x; a[k * 3 + 1] = S.y; a[k * 3 + 2] = S.z; }
        p.geometry.attributes.position.needsUpdate = true;
      };
    }
  };

  [].forEach.call(document.querySelectorAll("canvas[data-fx]"), function (cv) {
    var build = BUILD[cv.dataset.fx]; if (!build) return;
    var r; try { r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { return; }
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    var s = new THREE.Scene(), cam = new THREE.PerspectiveCamera(35, 1.4, 0.1, 100);
    var update = build(s, cam, cv), base = cam.position.clone(), look = new THREE.Vector3(), t = Math.random() * 10, on = false, last = 0;
    var dir = new THREE.Vector3(); cam.getWorldDirection(dir); look.copy(cam.position).add(dir.multiplyScalar(base.length()));
    function size() {
      var w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
      if (cv.width !== Math.round(w * r.getPixelRatio()) || cv.height !== Math.round(h * r.getPixelRatio())) { r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
    }
    function tick(now) {
      if (!on) return;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
      if (!reduce) t += dt;
      size(); update(t);
      cam.position.set(base.x + mx * 1.6, base.y - my * 1.0, base.z); cam.lookAt(look);
      r.render(s, cam);
      requestAnimationFrame(tick);
    }
    size(); update(t); r.render(s, cam);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v && !on) { on = true; last = 0; requestAnimationFrame(tick); } on = v; }).observe(cv);
  });
})();

/* Contact form: posts to Formspree and shows the result in place. "Talk to us" links pick the topic. */
(function () {
  var f = document.getElementById("cform"), msg = document.getElementById("cform-msg"), topic = document.getElementById("ctopic");
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-topic]"); if (a) { topic.value = a.getAttribute("data-topic"); setTimeout(function () { f.querySelector("input").focus({ preventScroll: true }); }, 500); }
  });
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    if (f.action.indexOf("FORM_ID") !== -1) { msg.textContent = "Form not connected yet. Email hello@artifisi.com for now."; return; }
    var btn = f.querySelector("button"); btn.disabled = true; msg.textContent = "Sending…";
    fetch(f.action, { method: "POST", body: new FormData(f), headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw 0; f.reset(); msg.textContent = "Thanks. We'll reply from hello@artifisi.com."; })
      .catch(function () { msg.textContent = "That didn't send. Email hello@artifisi.com instead."; })
      .then(function () { btn.disabled = false; });
  });
})();

// Video player: links with data-embed open in a dialog instead of leaving the site.
(function () {
  var dlg = document.getElementById("vmodal"), frame = dlg.querySelector(".vframe");
  if (!dlg.showModal) return;
  function close() { frame.innerHTML = ""; if (dlg.open) dlg.close(); }
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-embed]"); if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    dlg.classList.toggle("tall", a.hasAttribute("data-tall"));
    frame.innerHTML = '<iframe allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen title="Video"></iframe>';
    frame.firstChild.src = a.getAttribute("data-embed");
    dlg.showModal();
  });
  document.getElementById("vclose").addEventListener("click", close);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
  dlg.addEventListener("close", function () { frame.innerHTML = ""; });
})();
