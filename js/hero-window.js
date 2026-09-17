(function () {
  const wrap = document.querySelector("[data-hero-window]");
  if (!wrap) return;

  const image = wrap.querySelector("[data-hero-window-img]");

  const MAX_TILT = 7;
  const MAX_PAN_X = 30;
  const MAX_PAN_Y = 20;
  const EASE = 0.08;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let raf = null;

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

  function render() {
    currentX += (targetX - currentX) * EASE;
    currentY += (targetY - currentY) * EASE;

    wrap.style.transform =
      "perspective(900px) rotateX(" +
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

    const settled =
      Math.abs(targetX - currentX) < 0.001 && Math.abs(targetY - currentY) < 0.001;

    if (!settled) {
      raf = requestAnimationFrame(render);
    } else {
      raf = null;
    }
  }

  window.addEventListener("mousemove", onPointerMove);
  wrap.addEventListener("mouseleave", onPointerLeave);
  window.addEventListener("blur", onPointerLeave);
})();
