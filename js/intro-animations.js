(function () {
  const section = document.querySelector(".intro");
  if (!section) return;

  // Parallax: the background arrow drifts slower than the page scroll.
  const arrow = section.querySelector(".intro__bg-indicator");
  if (arrow) {
    const PARALLAX_FACTOR = 0.18;
    let ticking = false;

    function updateParallax() {
      const rect = section.getBoundingClientRect();
      arrow.style.transform = "translateY(" + (-rect.top * PARALLAX_FACTOR).toFixed(1) + "px)";
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(updateParallax);
          ticking = true;
        }
      },
      { passive: true }
    );

    updateParallax();
  }

  // Staggered reveal for everything else in the section, once it scrolls into view.
  const revealItems = Array.from(section.querySelectorAll("[data-reveal]"));
  if (!revealItems.length) return;

  revealItems.forEach((el, i) => {
    el.style.transitionDelay = i * 90 + "ms";
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealItems.forEach((el) => el.classList.add("is-in"));
        observer.disconnect();
      });
    },
    { threshold: 0.25 }
  );

  observer.observe(section);
})();
