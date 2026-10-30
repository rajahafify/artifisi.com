// The recorder on /projects/dunia. The scroll-craft engine publishes --sc-p on the act; this turns it into
// a playhead: which view is open, which channels are lit, and the readouts and rows for the current step.
// Every number comes from the sample flight below, computed for the step, and the page labels it as sample.
(function () {
  var act = document.getElementById("demo"); if (!act) return;
  var win = act.querySelector(".ds-win");
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s) { return win.querySelector(s); };
  var reads = {}; Array.prototype.forEach.call(win.querySelectorAll("[data-read]"), function (o) { reads[o.getAttribute("data-read")] = o; });
  var chans = Array.prototype.slice.call(win.querySelectorAll(".ds-ch li"));
  var tabs = Array.prototype.slice.call(win.querySelectorAll("[data-tab]"));
  var rowsEl = $(".ds-rows"), tree = $(".ds-tree"), head = $(".ds-head"), tEl = $("[data-t]"), stepEl = $("[data-step]"), state = $(".ds-state");

  // Act progress where each part starts, and the stretch of it the sample flight is recorded across.
  var REC_FROM = 0.12, REC_TO = 0.58, EXPORT_AT = 0.6, STATUS_AT = 0.84, STEPS = 300;

  // A sample drone flight through three gates, 30 s at 10 Hz. Smooth made-up signals, not a recording.
  function sample(k) {
    var t = k / 10;
    var x = 0.42 * t * 10 / 3, y = 2.4 * Math.sin(t / 4.1), z = 1.6 + 0.35 * Math.sin(t / 2.3);
    var gate = Math.min(3, Math.floor(t / 10) + 1), toGate = (10 - (t % 10)) * 1.4;
    var roll = Math.round(9 * Math.cos(t / 4.1)), pitch = Math.round(6 + 3 * Math.sin(t / 1.7));
    var through = k > 0 && k % 100 === 99;
    return {
      t: t,
      rgb: "frame " + (k + 1) + ", 640×360",
      depth: "nearest " + (0.8 + toGate * 0.32).toFixed(2) + " m",
      seg: toGate < 4 ? "gate, floor, wall" : "floor, wall, crate",
      imu: "ax " + (0.3 * Math.cos(t / 1.7)).toFixed(2) + "  gz " + (0.58 * Math.cos(t / 4.1)).toFixed(2),
      act: "pitch " + pitch + "°  roll " + (roll > 0 ? "+" : "") + roll + "°",
      gt: "x " + x.toFixed(2) + "  y " + y.toFixed(2) + "  z " + z.toFixed(2),
      action: Math.abs(roll) > 5 ? (roll > 0 ? "Roll right" : "Roll left") : "Pitch forward",
      outcome: through ? "Through gate " + gate : "Gate " + gate + " in " + toGate.toFixed(1) + " m",
      reward: through ? "+1.0" : "+0.1",
    };
  }
  function pad(n, w) { n = String(n); while (n.length < w) n = "0" + n; return n; }
  function clock(t) { return pad(Math.floor(t / 60), 2) + ":" + pad((t % 60).toFixed(1), 4); }

  function phaseAt(p) { return p < REC_FROM ? "watch" : p < EXPORT_AT ? "record" : p < STATUS_AT ? "export" : "status"; }

  var treeText = "", shown = -1, lastStep = -1, lastPhase = "", lastLit = -1;
  function draw(p) {
    var phase = phaseAt(p);
    if (phase !== lastPhase) {
      win.setAttribute("data-phase", phase); lastPhase = phase;
      tabs.forEach(function (b) { b.setAttribute("aria-current", b.getAttribute("data-tab") === phase ? "true" : "false"); });
      state.textContent = phase === "watch" ? "Ready" : phase === "record" ? "Recording" : phase === "export" ? "Exported" : "Saved";
    }
    // Channels light one after another as recording starts, and stay lit.
    var lit = Math.max(0, Math.min(chans.length, Math.floor((p - REC_FROM) / 0.035) + 1));
    if (p < REC_FROM) lit = 0;
    if (lit !== lastLit) { chans.forEach(function (li, i) { li.classList.toggle("on", i < lit); }); lastLit = lit; }

    var r = Math.max(0, Math.min(1, (p - REC_FROM) / (REC_TO - REC_FROM)));
    var step = Math.round(r * (STEPS - 1));
    head.style.transform = "translateX(" + (r * 100).toFixed(2) + "cqw)";
    // The export tree writes itself line by line through the first part of the export view.
    var lines = phase === "watch" || phase === "record" ? 0 : Math.min(99, 1 + Math.floor((p - EXPORT_AT) / 0.012));
    if (lines !== shown && treeText) { tree.textContent = treeText.split("\n").slice(0, lines).join("\n"); shown = lines; win.setAttribute("data-sc-verify-state", phase + ":" + lastStep + ":" + lines); }
    if (step === lastStep) return;
    lastStep = step;
    win.setAttribute("data-sc-verify-state", phase + ":" + step);
    var s = sample(step);
    tEl.textContent = clock(s.t); stepEl.textContent = p < REC_FROM ? 0 : step + 1;
    chans.forEach(function (li, i) { var id = li.getAttribute("data-ch"); reads[id].textContent = i < lit ? s[id] : "-"; });
    // The last six steps written, newest at the bottom.
    var html = "";
    for (var k = Math.max(0, step - 5); k <= step && p >= REC_FROM; k++) {
      var q = sample(k);
      html += '<div class="ds-row' + (q.reward === "+1.0" ? " hit" : "") + '"><span>' + (k + 1) + "</span><span>" + q.action + "</span><span>" + q.outcome + "</span><span>" + q.reward + "</span></div>";
    }
    rowsEl.innerHTML = html;
    var total = 0; for (var j = 0; j <= step; j++) total += parseFloat(sample(j).reward);
    treeText =
      "episode  sample_flight_0001\n" +
      "├─ steps: " + (step + 1) + "\n" +
      "│  ├─ observation\n" +
      "│  │  ├─ image          640×360 RGB\n" +
      "│  │  ├─ depth          640×360, metres\n" +
      "│  │  ├─ segmentation   640×360, class ids\n" +
      "│  │  └─ imu            accel, gyro\n" +
      "│  ├─ action           pitch, roll, yaw, throttle\n" +
      "│  ├─ reward           total " + total.toFixed(1) + "\n" +
      "│  ├─ is_first / is_last / is_terminal\n" +
      "│  └─ ground_truth     pose of every object\n" +
      "└─ format: RLDS";
    shown = -1;
  }

  function progress() { return parseFloat(act.style.getPropertyValue("--sc-p")) || 0; }
  if (reduce) { draw(0.99); draw(0.99); win.setAttribute("data-phase", "all"); return; }

  (function loop() { draw(progress()); requestAnimationFrame(loop); })();

  // Tabs jump the playhead: scroll to that point of the pinned act.
  tabs.forEach(function (b) {
    b.addEventListener("click", function () {
      var at = parseFloat(b.getAttribute("data-at")) + 0.02;
      var top = act.getBoundingClientRect().top + scrollY, travel = act.offsetHeight - innerHeight;
      scrollTo({ top: top + travel * at, behavior: "smooth" });
    });
  });
})();

// The pilot form: posts to Formspree, and the question changes with who is applying.
(function () {
  var f = document.getElementById("pform"); if (!f) return;
  var ask = f.querySelector(".dp-ask"), msg = f.querySelector(".dp-msg");
  f.addEventListener("change", function (e) { if (e.target.name === "topic") ask.textContent = e.target.getAttribute("data-ask"); });
  f.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!f.checkValidity()) { msg.textContent = "Add your email and a line about the task or the game."; f.reportValidity(); return; }
    msg.textContent = "Sending…";
    fetch(f.action, { method: "POST", body: new FormData(f), headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw 0; f.reset(); msg.textContent = "Thanks. We'll reply from hello@artifisi.com."; })
      .catch(function () { msg.textContent = "That didn't send. Write to hello@artifisi.com instead."; });
  });
})();
