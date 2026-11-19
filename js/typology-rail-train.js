(function () {
  const rails = document.querySelectorAll("[data-rail-svg] [data-rail-train]");
  if (!rails.length) return;

  // A <line> drawn with percentage coordinates (the full-width purple line)
  // is measured from its rendered width, since its length depends on the screen.
  function lengthOf(rail) {
    if (rail.tagName.toLowerCase() === "line") {
      return rail.ownerSVGElement.getBoundingClientRect().width;
    }
    return rail.getTotalLength();
  }

  function setup() {
    rails.forEach((rail) => {
      const length = lengthOf(rail);
      if (!length) return;
      const trainLength = Math.min(160, length * 0.22);
      rail.style.strokeDasharray = trainLength.toFixed(1) + " " + (length - trainLength).toFixed(1);
      rail.style.setProperty("--dash-end", -length.toFixed(1) + "px");
    });
  }

  setup();

  // Only lengths that depend on the screen width change on resize.
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 150);
  });
})();
