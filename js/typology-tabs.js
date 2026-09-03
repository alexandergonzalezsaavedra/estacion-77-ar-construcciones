(function () {
  const tabs = document.querySelector("[data-tabs]");
  if (!tabs) return;

  const buttons = Array.from(tabs.querySelectorAll("[data-tab]"));
  const panels = Array.from(tabs.querySelectorAll("[data-panel]"));
  const segments = Array.from(tabs.querySelectorAll("[data-segment]"));

  function goTo(index) {
    buttons.forEach((btn, i) => btn.classList.toggle("is-active", i === index));
    panels.forEach((panel, i) => panel.classList.toggle("is-active", i === index));
    segments.forEach((seg, i) => seg.classList.toggle("is-active", i <= index));
  }

  buttons.forEach((btn, i) =>
    btn.addEventListener("click", () => goTo(i))
  );

  goTo(0);
})();
