// Home page split stage: moves the divider for each act, counts the rows that have crossed it,
// and shows the divider only while the split holds. The scroll-craft engine publishes --sc-p on each act.
(function () {
  var acts = Array.prototype.slice.call(document.querySelectorAll(".sp"));
  var div = document.querySelector(".sp-divider"); if (!acts.length || !div) return;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  var count = div.querySelector(".sd-count b"), rowsAt = [0.14, 0.22, 0.46, 0.54, 0.78, 0.86];
  var cur = acts.map(function () { return 50; });
  function p(el) { return parseFloat(el.style.getPropertyValue("--sc-p")) || 0; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function ease(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  // 0 before a, eases to 1 at b, back to 0 by c.
  function bump(q, a, b, c) { return q < b ? ease((q - a) / (b - a)) : 1 - ease((q - b) / (c - b)); }
  // Where each act wants the divider, in percent, for its progress.
  var target = {
    mission: function (q) { return 50 + 7 * bump(q, 0.62, 0.72, 0.8) - 7 * bump(q, 0.72, 0.8, 0.9); },
    ai: function (q) { var t = clamp((q - 0.08) / 0.42, 0, 1); t = t * t * (3 - 2 * t); return 50 * (1 - t); }
  };
  function frame() {
    var vh = innerHeight, live = -1;
    acts.forEach(function (el, i) {
      var q = p(el), f = target[el.id], want = f ? f(q) : 50;
      cur[i] += (want - cur[i]) * 0.14;
      if (Math.abs(want - cur[i]) < 0.05) cur[i] = want;
      el.style.setProperty("--split", cur[i].toFixed(2) + "%");
      el.style.setProperty("--split-n", cur[i].toFixed(2));
      var r = el.getBoundingClientRect();
      if (r.top <= vh * 0.5 && r.bottom >= vh * 0.5) live = i;
    });
    var first = acts[0].getBoundingClientRect(), last = acts[acts.length - 1].getBoundingClientRect();
    var on = live >= 0 && !(acts[live].id === "ai" && cur[live] < 1);
    document.documentElement.classList.toggle("in-split", on);
    if (live >= 0) div.style.setProperty("--split", cur[live].toFixed(2) + "%");
    div.style.setProperty("--prog", clamp(-first.top / (last.bottom - first.top - vh || 1), 0, 1).toFixed(3));
    var dq = p(document.getElementById("games")), n = 0;
    rowsAt.forEach(function (a) { if (dq >= a) n++; });
    if (document.getElementById("ai").getBoundingClientRect().top < vh * 0.5) n = rowsAt.length;
    if (count.textContent !== String(n)) count.textContent = n;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
