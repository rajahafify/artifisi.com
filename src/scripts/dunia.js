// Dunia page header: points stream in from the left and settle into slots in the lattice.
import * as THREE from "three";

(function () {
  var cv = document.querySelector(".dhero-gl"), count = document.getElementById("dcount");
  if (!cv) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var r;
  try { r = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { return; }
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  var scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(38, 1.6, 0.1, 200);
  var g = new THREE.Group(); scene.add(g);
  function line(c, o) { return new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o }); }
  var box = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(8, 6, 6)), line(0x8fa3ff, 0.9)); g.add(box);
  for (var i = -3; i <= 3; i++) { var pl = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(8, 6)), line(0x8fa3ff, 0.12)); pl.position.z = i * 0.85; g.add(pl); }
  for (var j = -2; j <= 2; j++) { var pv = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(6, 6)), line(0x8fa3ff, 0.08)); pv.rotation.y = Math.PI / 2; pv.position.x = j * 1.5; g.add(pv); }

  var N = 420, pos = new Float32Array(N * 3), seed = [];
  for (var k = 0; k < N; k++) seed.push({ x: -3.6 + (k % 12) * 0.65, y: -2.6 + (Math.floor(k / 12) % 7) * 0.85, z: -2.6 + Math.floor(k / 84) * 1.3, sx: -26 - Math.random() * 8, sy: (Math.random() - 0.5) * 10, sz: (Math.random() - 0.5) * 10, o: Math.random() });
  var pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.09 })));

  var mx = 0, my = 0;
  window.addEventListener("pointermove", function (e) { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  function size() {
    var w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
    if (cv.width !== Math.round(w * r.getPixelRatio()) || cv.height !== Math.round(h * r.getPixelRatio())) { r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  }
  var t = 0, last = 0, on = true, total = 0;
  function frame(now) {
    if (!on) return;
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016; last = now;
    if (!reduce) t += dt;
    size();
    var narrow = cv.clientWidth < 760;
    // Push the lattice right on wide screens so the copy sits clear on the left.
    cam.position.set((narrow ? 0 : -6) + 11 + mx * 2, 6 - my * 1.5, narrow ? 30 : 19);
    cam.lookAt(narrow ? 0 : -6, narrow ? -6 : 0.5, 0);
    g.rotation.y = Math.sin(t * 0.2) * 0.25 - 0.2;
    var filled = 0;
    for (var k = 0; k < N; k++) {
      var s = seed[k], q = (s.o + t * 0.05) % 1, e = Math.min(1, q / 0.55), ee = e * e * (3 - 2 * e);
      pos[k * 3] = s.sx + (s.x - s.sx) * ee; pos[k * 3 + 1] = s.sy + (s.y - s.sy) * ee; pos[k * 3 + 2] = s.sz + (s.z - s.sz) * ee;
      if (e >= 1) filled++;
    }
    pg.attributes.position.needsUpdate = true;
    total += filled * dt * 0.4;
    if (count) count.textContent = Math.floor(total).toLocaleString("en");
    r.render(scene, cam);
    requestAnimationFrame(frame);
  }
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v && !on) { on = true; last = 0; requestAnimationFrame(frame); } on = v; }).observe(cv);
  requestAnimationFrame(frame);
})();
