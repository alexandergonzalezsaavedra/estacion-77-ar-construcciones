(function () {
  const svg = document.querySelector(".ubicacion__map");
  if (!svg) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Order: logo (0s) -> red route -> roads/river -> pins and labels.
  const roads = svg.querySelectorAll(".map-st2, .map-st3");
  roads.forEach((el, i) => {
    el.classList.add("map-fade");
    el.style.setProperty("--d", 0.1 + i * 0.01 + "s");
  });

  svg.querySelectorAll(".map-st4").forEach((el) => {
    el.classList.add("map-fade");
    el.style.setProperty("--d", "0.15s");
  });

  svg.querySelectorAll(".map-st5").forEach((el, i) => {
    el.classList.add("map-route");
    el.style.setProperty("--len", el.getTotalLength().toFixed(1));
    el.style.setProperty("--d", 0.2 + i * 0.15 + "s");
  });

  const dot = svg.querySelector("circle.map-st14");
  if (dot) {
    dot.classList.add("map-pop");
    dot.style.setProperty("--d", "0.8s");
  }

  const pinStart = 0.5;
  const pills = Array.from(svg.querySelectorAll("g > path.map-st14")).map((p) => p.parentElement);
  pills.forEach((g, i) => {
    g.classList.add("map-pop");
    g.style.setProperty("--d", pinStart + i * 0.06 + "s");
  });

  const labels = svg.querySelectorAll("text");
  labels.forEach((t) => {
    if (t.closest(".map-pop, .map-logo")) return;
    t.classList.add("map-fade");
    t.style.setProperty("--d", "0.45s");
  });


  svg.classList.add("map-anim");

  new IntersectionObserver(
    (entries, obs) => {
      if (!entries[0].isIntersecting) return;
      svg.classList.add("is-mapped");
      obs.disconnect();
    },
    { threshold: 0.1 }
  ).observe(svg);
})();
