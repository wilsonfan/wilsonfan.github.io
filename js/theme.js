// Theme toggle. The anti-flash snippet inlined in each page's <head> already
// applies a saved theme before first paint; this just wires up the button.
(function () {
  var btn = document.getElementById("theme-toggle");
  if (!btn) return;
  var root = document.documentElement;
  var mq = window.matchMedia("(prefers-color-scheme: dark)");

  function current() {
    return root.getAttribute("data-theme") || (mq.matches ? "dark" : "light");
  }
  function sync() {
    btn.setAttribute("aria-pressed", current() === "dark");
  }
  sync();
  mq.addEventListener("change", sync);

  btn.addEventListener("click", function () {
    var next = current() === "dark" ? "light" : "dark";
    root.classList.add("theme-fade"); // eases the swap; see styles.css
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    sync();
    setTimeout(function () { root.classList.remove("theme-fade"); }, 350);
  });
})();
