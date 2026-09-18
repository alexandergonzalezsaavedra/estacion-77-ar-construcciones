(function () {
  const section = document.querySelector(".intro");
  if (!section) return;

  const ENTRANCE_DURATION = 700;
  const STAGGER = 90;
  const SCROLL_EASE = 0.15;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  // Background arrow: pure continuous parallax, no entrance reveal.
  const arrow = section.querySelector(".intro__bg-indicator");
  const ARROW_FACTOR = 0.18;

  // Foreground content: staggered fade/rise reveal on first view, plus its
  // own (subtler) parallax factor once visible — closer layers drift less.
  const LAYER_FACTORS = {
    "intro__title": 0.08,
    "intro__subtitle": 0.08,
    "intro__description": 0.08,
    "intro__content-form": 0.06,
    "intro__feature": 0.05,
  };

  function factorFor(el) {
    for (const cls in LAYER_FACTORS) {
      if (el.classList.contains(cls)) return LAYER_FACTORS[cls];
    }
    return 0.06;
  }

  const items = Array.from(section.querySelectorAll("[data-reveal]")).map((el, i) => ({
    el,
    factor: factorFor(el),
    triggerAt: i * STAGGER,
    triggered: false,
    start: null,
    done: false,
  }));

  let targetOffset = 0;
  let currentOffset = 0;
  let raf = null;

  function updateScrollTarget() {
    const rect = section.getBoundingClientRect();
    targetOffset = -rect.top;
    if (!raf) raf = requestAnimationFrame(render);
  }

  function render(now) {
    now = now || performance.now();
    let stillAnimating = false;

    currentOffset += (targetOffset - currentOffset) * SCROLL_EASE;
    if (Math.abs(targetOffset - currentOffset) > 0.5) stillAnimating = true;

    if (arrow) {
      arrow.style.transform = "translateY(" + (currentOffset * ARROW_FACTOR).toFixed(1) + "px)";
    }

    items.forEach((item) => {
      if (!item.triggered) return;
      if (item.start === null) item.start = now;

      let ease = 1;
      if (!item.done) {
        const progress = Math.min(1, (now - item.start) / ENTRANCE_DURATION);
        ease = easeOutCubic(progress);
        if (progress < 1) stillAnimating = true;
        else item.done = true;
      }

      const entranceTY = (1 - ease) * 28;
      const parallaxTY = currentOffset * item.factor;
      item.el.style.opacity = ease.toFixed(3);
      item.el.style.transform = "translateY(" + (entranceTY + parallaxTY).toFixed(2) + "px)";
    });

    if (stillAnimating) {
      raf = requestAnimationFrame(render);
    } else {
      raf = null;
    }
  }

  window.addEventListener("scroll", updateScrollTarget, { passive: true });

  if (items.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          items.forEach((item) => {
            setTimeout(() => {
              item.triggered = true;
              if (!raf) raf = requestAnimationFrame(render);
            }, item.triggerAt);
          });
          observer.disconnect();
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(section);
  }

  raf = requestAnimationFrame(render);
})();
