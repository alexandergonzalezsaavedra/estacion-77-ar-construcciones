(function () {
  const wrap = document.querySelector("[data-hero-window]");
  if (!wrap) return;

  const image = wrap.querySelector("[data-hero-window-img]");
  const heroSection = wrap.closest(".hero-banner");

  const MAX_TILT = 7;
  const MAX_PAN_X = 30;
  const MAX_PAN_Y = 20;
  const EASE = 0.08;
  const ENTRANCE_DURATION = 1300;
  const SCROLL_FACTOR = 0.25;
  const SCROLL_EASE = 0.15;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let targetScrollY = 0;
  let currentScrollY = 0;
  let exitProgress = 0;
  let raf = null;
  let entranceStart = null;
  let entranceDone = false;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function onPointerMove(event) {
    const rect = wrap.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    targetX = Math.min(1, Math.max(-1, px * 2 - 1));
    targetY = Math.min(1, Math.max(-1, py * 2 - 1));
    if (!raf) raf = requestAnimationFrame(render);
  }

  function onPointerLeave() {
    targetX = 0;
    targetY = 0;
    if (!raf) raf = requestAnimationFrame(render);
  }

  // Reads scroll position from the section itself (untransformed), never
  // from `wrap`, which already carries our own transform each frame.
  function onScroll() {
    if (!heroSection) return;
    const rect = heroSection.getBoundingClientRect();
    const scrolledPast = Math.max(0, -rect.top);
    targetScrollY = scrolledPast * SCROLL_FACTOR;
    exitProgress = Math.min(1, scrolledPast / heroSection.offsetHeight);
    if (!raf) raf = requestAnimationFrame(render);
  }

  function render(now) {
    if (entranceStart === null) entranceStart = now || performance.now();

    let entranceEase = 1;
    if (!entranceDone) {
      const elapsed = (now || performance.now()) - entranceStart;
      const progress = Math.min(1, elapsed / ENTRANCE_DURATION);
      entranceEase = easeOutCubic(progress);
      if (progress >= 1) entranceDone = true;
    }

    currentX += (targetX - currentX) * EASE;
    currentY += (targetY - currentY) * EASE;
    currentScrollY += (targetScrollY - currentScrollY) * SCROLL_EASE;

    const entranceTY = (1 - entranceEase) * 30;
    const entranceScale = 0.94 + entranceEase * 0.06;
    const exitScale = 1 - exitProgress * 0.08;
    const exitOpacity = 1 - exitProgress * 0.4;

    wrap.style.opacity = (entranceEase * exitOpacity).toFixed(3);
    wrap.style.transform =
      "translateY(" +
      (entranceTY + currentScrollY).toFixed(2) +
      "px) scale(" +
      (entranceScale * exitScale).toFixed(3) +
      ") perspective(900px) rotateX(" +
      (-currentY * MAX_TILT).toFixed(2) +
      "deg) rotateY(" +
      (currentX * MAX_TILT).toFixed(2) +
      "deg)";

    image.setAttribute(
      "transform",
      "translate(" +
        (currentX * MAX_PAN_X).toFixed(2) +
        " " +
        (currentY * MAX_PAN_Y).toFixed(2) +
        ")"
    );

    const tiltSettled =
      Math.abs(targetX - currentX) < 0.001 && Math.abs(targetY - currentY) < 0.001;
    const scrollSettled = Math.abs(targetScrollY - currentScrollY) < 0.05;

    if (!entranceDone || !tiltSettled || !scrollSettled) {
      raf = requestAnimationFrame(render);
    } else {
      raf = null;
    }
  }

  window.addEventListener("mousemove", onPointerMove);
  wrap.addEventListener("mouseleave", onPointerLeave);
  window.addEventListener("blur", onPointerLeave);
  window.addEventListener("scroll", onScroll, { passive: true });

  raf = requestAnimationFrame(render);
})();
