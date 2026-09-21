(function () {
  const slider = document.querySelector("[data-slider]");
  if (!slider) return;

  const track = slider.querySelector("[data-track]");
  const slides = Array.from(track.children);
  const dots = Array.from(slider.querySelectorAll("[data-dot]"));
  const prevBtn = slider.querySelector("[data-prev]");
  const nextBtn = slider.querySelector("[data-next]");
  const total = slides.length;

  let index = 0;

  function positionOf(i) {
    const offset = (i - index + total) % total;
    if (offset === 0) return "is-active";
    if (offset === 1) return "is-next";
    if (offset === total - 1) return "is-prev";
    return "";
  }

  // A slide hopping straight from one side to the other must not animate
  // across the stage, so it snaps there while invisible behind the others.
  function render() {
    slides.forEach((slide, i) => {
      const next = positionOf(i);
      const wasPrev = slide.classList.contains("is-prev");
      const wasNext = slide.classList.contains("is-next");
      const jumps = (wasPrev && next === "is-next") || (wasNext && next === "is-prev");

      if (jumps) slide.classList.add("is-jump");
      slide.classList.remove("is-active", "is-prev", "is-next");
      if (next) slide.classList.add(next);
      if (jumps) {
        void slide.offsetWidth;
        slide.classList.remove("is-jump");
      }
    });
    dots.forEach((dot, k) => dot.classList.toggle("is-active", k === index));
  }

  function goTo(newIndex) {
    index = (newIndex + total) % total;
    render();
    restartAutoplay();
  }

  prevBtn.addEventListener("click", () => goTo(index - 1));
  nextBtn.addEventListener("click", () => goTo(index + 1));
  dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));

  // Drag / swipe: the active card follows the pointer, release past the
  // threshold changes slide, otherwise it eases back.
  const THRESHOLD = 60;
  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dragging = false;
  let moved = false;
  let locked = null;

  function activeSlide() {
    return slides[index];
  }

  function onDown(e) {
    if (e.target.closest('button')) return;
    dragging = true;
    moved = false;
    locked = null;
    dx = 0;
    startX = e.clientX;
    startY = e.clientY;
    track.setPointerCapture(e.pointerId);
    track.classList.add('is-dragging');
  }

  function onMove(e) {
    if (!dragging) return;
    const mx = e.clientX - startX;
    const my = e.clientY - startY;
    if (locked === null && (Math.abs(mx) > 6 || Math.abs(my) > 6)) {
      locked = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
    }
    if (locked !== 'x') return;
    moved = true;
    dx = mx;
    activeSlide().style.transform =
      'perspective(1400px) translateX(' + dx * 0.7 + 'px) scale(1) rotateY(' + dx * -0.03 + 'deg)';
    activeSlide().style.setProperty('--dx', Math.max(-40, Math.min(40, dx * -0.15)) + 'px');
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');
    activeSlide().style.transform = '';
    activeSlide().style.removeProperty('--dx');
    if (moved && Math.abs(dx) > THRESHOLD) {
      goTo(dx < 0 ? index + 1 : index - 1);
    }
  }

  track.addEventListener('pointerdown', onDown);
  track.addEventListener('pointermove', onMove);
  track.addEventListener('pointerup', onUp);
  track.addEventListener('pointercancel', onUp);
  track.addEventListener('dragstart', (e) => e.preventDefault());
  track.addEventListener(
    'click',
    (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    },
    true
  );

  // Autoplay: advances every 5s, pauses while hovered, dragged, out of
  // view or with the tab hidden, and restarts after any manual change.
  const AUTOPLAY_MS = 5000;
  let timer = null;
  let hovering = false;
  let visible = false;

  function stopAutoplay() {
    clearInterval(timer);
    timer = null;
  }

  function startAutoplay() {
    stopAutoplay();
    if (hovering || dragging || !visible || document.hidden) return;
    timer = setInterval(() => goTo(index + 1), AUTOPLAY_MS);
  }

  function restartAutoplay() {
    startAutoplay();
  }

  slider.addEventListener('mouseenter', () => {
    hovering = true;
    stopAutoplay();
  });
  slider.addEventListener('mouseleave', () => {
    hovering = false;
    startAutoplay();
  });
  track.addEventListener('pointerdown', stopAutoplay);
  document.addEventListener('visibilitychange', startAutoplay);

  new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
      startAutoplay();
    },
    { threshold: 0.3 }
  ).observe(slider);

  // Scroll parallax: images drift slower than the cards as the page scrolls.
  let scrollTicking = false;
  function updateScrollParallax() {
    const rect = slider.getBoundingClientRect();
    const offset = rect.top + rect.height / 2 - window.innerHeight / 2;
    const sy = Math.max(-50, Math.min(50, offset * -0.08));
    slides.forEach((slide) => slide.style.setProperty('--sy', sy.toFixed(1) + 'px'));
    scrollTicking = false;
  }
  window.addEventListener(
    'scroll',
    () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(updateScrollParallax);
      }
    },
    { passive: true }
  );
  updateScrollParallax();

  render();
})();
