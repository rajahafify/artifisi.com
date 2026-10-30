// "What Dunia records" on the Dunia page: the episode tabs and the drive you can steer.
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

/* Episode sheets: a row of tabs, the chosen sheet on the stage below. */
(function () {
  var tabs = $$(".outputs [role=tab]");
  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute("aria-controls"));
      if (on && p.hidden) { p.hidden = false; p.classList.remove("is-entering"); void p.offsetWidth; p.classList.add("is-entering"); }
      else if (!on) p.hidden = true;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { select(t); });
    t.addEventListener("keydown", function (e) {
      var k = e.key, n = tabs.length;
      if (k === "ArrowDown" || k === "ArrowRight") { e.preventDefault(); select(tabs[(i + 1) % n], true); }
      if (k === "ArrowUp" || k === "ArrowLeft") { e.preventDefault(); select(tabs[(i - 1 + n) % n], true); }
    });
  });
})();

/* The drive: each button press is a decision, and Dunia writes the row. A toy model, labelled sample data. */
(function () {
  var body = $("#drive-rows"), total = $("#drive-total"), me = $("#car-me"), ahead = $("#car-ahead");
  if (!body) return;
  var s = { step: 4, lane: 1, aheadLane: 1, gap: 40, speed: 57, ret: 0.6 };
  function place() {
    me.style.setProperty("--lane", s.lane);
    ahead.style.setProperty("--lane", s.aheadLane);
    ahead.style.left = Math.max(14, Math.min(88, 10 + s.gap * 1.9)) + "%";
  }
  place();
  function row(cells, bad) {
    var tr = document.createElement("tr");
    tr.className = "is-new" + (bad ? " is-bad" : "");
    cells.forEach(function (c, j) { var td = document.createElement("td"); td.textContent = c; if (j === 0) td.className = "num idx"; if (j === 4) td.className = "num"; tr.appendChild(td); });
    body.appendChild(tr);
    while (body.children.length > 6) body.removeChild(body.firstChild);
  }
  $$(".play-ctl button").forEach(function (b) {
    b.addEventListener("click", function () {
      var act = b.dataset.act, state = "Lane " + (s.lane + 1) + ", " + s.gap + " m gap, " + s.speed + " km/h";
      var label = { left: "Steer left", hold: "Hold", right: "Steer right" }[act];
      var moved = act === "left" ? s.lane > 0 : act === "right" ? s.lane < 2 : false;
      if (moved) s.lane += act === "left" ? -1 : 1;
      var outcome, r, bad = false;
      if (s.lane === s.aheadLane) {
        s.gap -= 9;
        if (s.gap <= 4) { outcome = "Too close, braked hard"; r = -1.0; bad = true; s.gap = 30; s.speed = 41; }
        else { outcome = "Clear"; r = 0.1; s.speed = Math.min(60, s.speed + 1); }
      } else {
        outcome = moved ? "Lane " + (s.lane + 1) + ", clear" : "Clear"; r = moved ? 0.3 : 0.1;
        s.speed = Math.min(60, s.speed + 1);
        // A new car pulls in ahead.
        if (moved) { s.aheadLane = s.lane; s.gap = 34 + Math.round(Math.random() * 10); }
      }
      if (act !== "hold" && !moved) { outcome = "Edge of road, held lane"; r = -0.2; }
      s.step += 1; s.ret = Math.round((s.ret + r) * 10) / 10;
      row([String(s.step), state, label, outcome, (r > 0 ? "+" : "") + r.toFixed(1)], bad);
      total.textContent = s.step + " steps, return " + s.ret.toFixed(1);
      place();
    });
  });
})();

