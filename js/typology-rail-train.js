(function () {
  const rails = document.querySelectorAll("[data-rail-svg] [data-rail-train]");
  if (!rails.length) return;

  rails.forEach((rail) => {
    const length = rail.getTotalLength();
    const trainLength = Math.min(160, length * 0.22);
    rail.style.strokeDasharray = trainLength.toFixed(1) + " " + (length - trainLength).toFixed(1);
    rail.style.setProperty("--dash-end", -length.toFixed(1) + "px");
  });
})();
