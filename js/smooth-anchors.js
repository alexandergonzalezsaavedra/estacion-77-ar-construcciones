// Smooth scroll for in-page links (e.g. "Regístrate aquí" -> #registro).
// Lands the target just below the fixed header instead of underneath it.
// Positions come from offsetTop (layout), so the parallax/reveal transforms
// on the target don't throw the landing point off.
(function () {
  const GAP = 24; // space between the header and the target
  const header = document.querySelector(".site-header");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function layoutTop(el) {
    let y = 0;
    for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
    return y;
  }

  function scrollToTarget(target, smooth) {
    const offset = (header ? header.offsetHeight : 0) + GAP;
    window.scrollTo({
      top: Math.max(0, layoutTop(target) - offset),
      behavior: smooth && !reduceMotion.matches ? "smooth" : "auto",
    });
  }

  document.addEventListener("click", (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = decodeURIComponent(link.getAttribute("href").slice(1));
    const target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    scrollToTarget(target, true);
    history.pushState(null, "", "#" + id);
    // Move keyboard focus to the form's first field without jumping again.
    const field = target.querySelector("input, select, textarea");
    if (field) setTimeout(() => field.focus({ preventScroll: true }), 600);
  });

  // Opening a page with a hash (e.g. index.html#registro): correct the landing.
  if (location.hash.length > 1) {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) window.addEventListener("load", () => scrollToTarget(target, false));
  }
})();
