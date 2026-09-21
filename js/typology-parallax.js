(function () {
  const section = document.querySelector(".typology");
  if (!section) return;

  const items = Array.from(section.querySelectorAll("[data-typology-parallax]")).map((el) => ({
    el,
    factor: parseFloat(el.dataset.typologyParallax) || 0.15,
  }));
  if (!items.length) return;

  const SCROLL_EASE = 0.15;

  let targetOffset = 0;
  let currentOffset = 0;
  let raf = null;

  function updateScrollTarget() {
    const rect = section.getBoundingClientRect();
    targetOffset = -rect.top;
    if (!raf) raf = requestAnimationFrame(render);
  }

  function render() {
    currentOffset += (targetOffset - currentOffset) * SCROLL_EASE;

    items.forEach((item) => {
      item.el.style.transform = "translateY(" + (currentOffset * item.factor).toFixed(2) + "px)";
    });

    if (Math.abs(targetOffset - currentOffset) > 0.5) {
      raf = requestAnimationFrame(render);
    } else {
      raf = null;
    }
  }

  window.addEventListener("scroll", updateScrollTarget, { passive: true });
  updateScrollTarget();
})();
