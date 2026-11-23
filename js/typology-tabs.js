(function () {
  const tabs = document.querySelector("[data-tabs]");
  if (!tabs) return;

  const buttons = Array.from(tabs.querySelectorAll("[data-tab]"));
  const panels = Array.from(tabs.querySelectorAll("[data-panel]"));
  // Old station-style nav (index.html, hidden): segments up to the active one light up.
  const segments = Array.from(tabs.querySelectorAll("[data-segment]"));
  const prevBtn = tabs.querySelector("[data-tab-prev]");
  const nextBtn = tabs.querySelector("[data-tab-next]");
  const total = buttons.length;

  let index = 0;

  function goTo(i) {
    index = (i + total) % total;
    buttons.forEach((btn, k) => {
      const active = k === index;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    panels.forEach((panel, k) => panel.classList.toggle("is-active", k === index));
    segments.forEach((seg, k) => seg.classList.toggle("is-active", k <= index));
    placeArrows();
  }

  // Prev/next arrows sit at the vertical middle of the active panel's plans
  // (not of plans + specs); that height changes per tab and per screen size.
  const stage = prevBtn && prevBtn.parentElement;
  function placeArrows() {
    if (!stage) return;
    const plans = panels[index] && panels[index].querySelector(".typology-detail > .grid");
    if (!plans) return;
    const top =
      plans.getBoundingClientRect().top - stage.getBoundingClientRect().top + plans.offsetHeight / 2;
    stage.style.setProperty("--arrow-top", top.toFixed(1) + "px");
  }

  buttons.forEach((btn, i) => btn.addEventListener("click", () => goTo(i)));
  if (prevBtn) prevBtn.addEventListener("click", () => goTo(index - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => goTo(index + 1));
  if (stage) {
    window.addEventListener("resize", placeArrows);
    tabs.querySelectorAll(".typology-detail__floorplan").forEach((img) => {
      if (!img.complete) img.addEventListener("load", placeArrows);
    });
  }

  goTo(0);

  // Plans animate in the first time the tabs scroll into view; switching
  // tabs later replays it because the panel goes display:none -> block.
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      tabs.classList.add("is-inview");
      observer.disconnect();
    },
    { threshold: 0, rootMargin: "0px 0px -35% 0px" }
  );
  observer.observe(tabs);
})();
