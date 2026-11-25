(function () {
  const section = document.querySelector(".intro");
  if (!section) return;

  const ENTRANCE_DURATION = 500;
  const STAGGER = 60;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // Background arrow: parallax tied directly to the scroll position (no
  // easing lag), so nothing keeps drifting once the page stops scrolling.
  const arrow = section.querySelector(".intro__bg-indicator");
  const ARROW_FACTOR = 0.18;

  function updateArrow() {
    if (!arrow) return;
    const offset = -section.getBoundingClientRect().top;
    arrow.style.transform = "translateY(" + (offset * ARROW_FACTOR).toFixed(1) + "px)";
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateArrow();
        ticking = false;
      });
    },
    { passive: true }
  );
  updateArrow();

  // Foreground content (texts, form, features): a one-time staggered
  // fade/rise when the section first comes into view. No scroll parallax,
  // so the form stays still while people read or fill it in.
  const items = Array.from(section.querySelectorAll("[data-reveal]"));
  if (!items.length) return;

  function reveal(el) {
    let start = null;
    function frame(now) {
      if (start === null) start = now;
      const progress = Math.min(1, (now - start) / ENTRANCE_DURATION);
      const ease = easeOutCubic(progress);
      el.style.opacity = ease.toFixed(3);
      el.style.transform = progress < 1 ? "translateY(" + ((1 - ease) * 28).toFixed(2) + "px)" : "none";
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      items.forEach((el, i) => setTimeout(() => reveal(el), i * STAGGER));
      observer.disconnect();
    },
    { threshold: 0.1 }
  );
  observer.observe(section);
})();
