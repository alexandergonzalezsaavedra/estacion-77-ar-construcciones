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

  // Plans animate in the first time the tabs scroll into view; switching
  // tabs later replays it because the panel goes display:none -> block.
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      tabs.classList.add('is-inview');
      observer.disconnect();
    },
    { threshold: 0, rootMargin: '0px 0px -35% 0px' }
  );
  observer.observe(tabs);
})();
