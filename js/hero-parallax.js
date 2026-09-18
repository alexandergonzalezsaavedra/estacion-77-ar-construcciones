(function () {
  const heroSection = document.querySelector(".hero-banner");
  if (!heroSection) return;

  const logo = heroSection.querySelector(".hero-banner__logo-estacion");
  const heading = heroSection.querySelector("[data-split-flap]");
  const cta = heroSection.querySelector("[data-hero-cta]");

  const LOGO_DURATION = 2400;
  const LOGO_SCROLL_FACTOR = 0.12;
  const HEADING_SCROLL_FACTOR = 0.08;
  const CTA_DURATION = 500;
  const CTA_SCROLL_FACTOR = 0.05;
  const SCROLL_EASE = 0.15;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  let targetScroll = 0;
  let currentScroll = 0;
  let raf = null;

  const logoState = { start: null, done: false };
  const ctaState = { start: null, done: false, triggered: false };

  function updateScrollTarget() {
    const rect = heroSection.getBoundingClientRect();
    targetScroll = Math.max(0, -rect.top);
    if (!raf) raf = requestAnimationFrame(render);
  }

  if (cta) {
    document.addEventListener(
      "hero-cta-ready",
      () => {
        ctaState.triggered = true;
        if (!raf) raf = requestAnimationFrame(render);
      },
      { once: true }
    );
  }

  function render(now) {
    now = now || performance.now();
    let stillAnimating = false;

    currentScroll += (targetScroll - currentScroll) * SCROLL_EASE;
    if (Math.abs(targetScroll - currentScroll) > 0.5) stillAnimating = true;

    if (logo) {
      if (logoState.start === null) logoState.start = now;
      let ease = 1;
      if (!logoState.done) {
        const progress = Math.min(1, (now - logoState.start) / LOGO_DURATION);
        ease = easeOutCubic(progress);
        if (progress < 1) stillAnimating = true;
        else logoState.done = true;
      }
      const entranceTY = (1 - ease) * -110;
      const scale = 0.96 + ease * 0.04;
      const blur = (1 - ease) * 6;
      logo.style.opacity = ease.toFixed(3);
      logo.style.filter = "blur(" + blur.toFixed(2) + "px)";
      logo.style.transform =
        "translateY(" +
        (entranceTY + currentScroll * LOGO_SCROLL_FACTOR).toFixed(2) +
        "px) scale(" +
        scale.toFixed(3) +
        ")";
    }

    if (heading) {
      heading.style.transform =
        "translateY(" + (currentScroll * HEADING_SCROLL_FACTOR).toFixed(2) + "px)";
    }

    if (cta && ctaState.triggered) {
      if (ctaState.start === null) ctaState.start = now;
      let ease = 1;
      if (!ctaState.done) {
        const progress = Math.min(1, (now - ctaState.start) / CTA_DURATION);
        ease = easeOutCubic(progress);
        if (progress < 1) stillAnimating = true;
        else ctaState.done = true;
      }
      const entranceTY = (1 - ease) * 18;
      cta.style.opacity = ease.toFixed(3);
      cta.style.transform =
        "translateY(" + (entranceTY + currentScroll * CTA_SCROLL_FACTOR).toFixed(2) + "px)";
    }

    if (stillAnimating) {
      raf = requestAnimationFrame(render);
    } else {
      raf = null;
    }
  }

  window.addEventListener("scroll", updateScrollTarget, { passive: true });
  raf = requestAnimationFrame(render);
})();
