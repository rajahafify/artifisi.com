// Home page behaviour: the hero scene, section pieces, contact form and video player.
import * as THREE from "three";
import "./hero.js";
import "./video.js";
import "./landing.js";
window.THREE = THREE;

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
      cam.userData.minAspect = 1.9; // narrow canvases widen the lens so Borneo and the peninsula both fit
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
      if (cv.width !== Math.round(w * r.getPixelRatio()) || cv.height !== Math.round(h * r.getPixelRatio())) { r.setSize(w, h, false); cam.aspect = w / h;
        var m = cam.userData.minAspect; cam.fov = m && cam.aspect < m ? 2 * Math.atan(Math.tan(35 * Math.PI / 360) * m / cam.aspect) * 180 / Math.PI : 35;
        cam.updateProjectionMatrix(); }
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
