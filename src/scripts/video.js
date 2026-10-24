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
