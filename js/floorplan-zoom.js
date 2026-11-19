// Floor plan lightbox: click/tap a plan to open it full screen.
// Touch: pinch or double-tap to zoom, drag to pan.
// Mouse: wheel or double-click to zoom, drag to pan.
(function () {
  const plans = document.querySelectorAll(".typology-detail__floorplan");
  if (!plans.length) return;

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const MAX_ZOOM = 4;
  const TAP_ZOOM = 2.5;

  const box = document.createElement("div");
  box.className = "floorplan-zoom";
  box.hidden = true;
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.innerHTML =
    '<button class="floorplan-zoom__close" type="button" aria-label="Cerrar">&times;</button>' +
    '<div class="floorplan-zoom__scroller"><img class="floorplan-zoom__img" alt="" /></div>' +
    '<p class="floorplan-zoom__hint">' +
    (finePointer
      ? "Usa la rueda o haz doble clic para ampliar"
      : "Pellizca o toca dos veces para ampliar") +
    "</p>";
  document.body.appendChild(box);

  const scroller = box.querySelector(".floorplan-zoom__scroller");
  const img = box.querySelector(".floorplan-zoom__img");
  const closeBtn = box.querySelector(".floorplan-zoom__close");

  let zoom = 1;
  let baseW = 0;
  let lastFocus = null;

  function fitWidth() {
    const cs = getComputedStyle(scroller);
    const vw = scroller.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const vh = scroller.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    const ratio = img.naturalWidth / img.naturalHeight || 1;
    return Math.min(vw, vh * ratio);
  }

  // Set zoom keeping the point (cx, cy), relative to the scroller, fixed on screen.
  function setZoom(z, cx, cy) {
    z = Math.min(MAX_ZOOM, Math.max(1, z));
    const rect = img.getBoundingClientRect();
    const sRect = scroller.getBoundingClientRect();
    if (cx === undefined) {
      cx = sRect.width / 2;
      cy = sRect.height / 2;
    }
    // Point on the image (0..1) currently under (cx, cy).
    const px = (sRect.left + cx - rect.left) / rect.width;
    const py = (sRect.top + cy - rect.top) / rect.height;

    zoom = z;
    img.style.width = baseW * zoom + "px";
    box.classList.toggle("is-zoomed", zoom > 1.01);

    const nRect = img.getBoundingClientRect();
    scroller.scrollLeft += nRect.left + px * nRect.width - (sRect.left + cx);
    scroller.scrollTop += nRect.top + py * nRect.height - (sRect.top + cy);
  }

  function layout() {
    baseW = fitWidth();
    img.style.width = baseW * zoom + "px";
  }

  function open(src, alt) {
    lastFocus = document.activeElement;
    zoom = 1;
    img.style.width = "";
    img.alt = alt || "";
    img.src = src;
    box.hidden = false;
    document.documentElement.classList.add("floorplan-zoom-open");
    const ready = () => {
      layout();
      scroller.scrollLeft = 0;
      scroller.scrollTop = 0;
    };
    if (img.complete && img.naturalWidth) ready();
    else img.addEventListener("load", ready, { once: true });
    closeBtn.focus();
  }

  function close() {
    box.hidden = true;
    box.classList.remove("is-zoomed");
    document.documentElement.classList.remove("floorplan-zoom-open");
    img.removeAttribute("src");
    if (lastFocus) lastFocus.focus();
  }

  plans.forEach((plan) => {
    plan.addEventListener("click", () => {
      open(plan.currentSrc || plan.src, plan.alt);
    });
  });

  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !box.hidden) close();
  });
  window.addEventListener("resize", () => {
    if (!box.hidden) layout();
  });

  // Mouse: drag to pan when zoomed.
  let drag = null;
  let dragged = false;
  scroller.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    dragged = false;
    if (zoom <= 1.01) return;
    drag = { x: e.clientX, y: e.clientY, l: scroller.scrollLeft, t: scroller.scrollTop };
    box.classList.add("is-dragging");
    e.preventDefault();
  });
  window.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) dragged = true;
    scroller.scrollLeft = drag.l - dx;
    scroller.scrollTop = drag.t - dy;
  });
  window.addEventListener("pointerup", () => {
    drag = null;
    box.classList.remove("is-dragging");
  });

  // Mouse wheel / trackpad: zoom at the cursor.
  scroller.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const s = scroller.getBoundingClientRect();
      setZoom(zoom * Math.exp(-e.deltaY * 0.0015), e.clientX - s.left, e.clientY - s.top);
    },
    { passive: false }
  );

  // Tap on the backdrop (not on the image) closes when not zoomed.
  scroller.addEventListener("click", (e) => {
    if (dragged) return;
    if (e.target === scroller && zoom <= 1.01) close();
  });

  // Double tap / double click toggles zoom at that point.
  let lastTap = 0;
  img.addEventListener("click", (e) => {
    if (dragged) return;
    const now = Date.now();
    if (now - lastTap < 300) {
      const s = scroller.getBoundingClientRect();
      setZoom(zoom > 1.01 ? 1 : TAP_ZOOM, e.clientX - s.left, e.clientY - s.top);
      lastTap = 0;
    } else {
      lastTap = now;
    }
  });

  // Pinch to zoom.
  let pinch = null;
  function dist(t) {
    return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  }
  function mid(t) {
    const s = scroller.getBoundingClientRect();
    return {
      x: (t[0].clientX + t[1].clientX) / 2 - s.left,
      y: (t[0].clientY + t[1].clientY) / 2 - s.top,
    };
  }
  scroller.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 2) {
        pinch = { d: dist(e.touches), z: zoom };
      }
    },
    { passive: true }
  );
  scroller.addEventListener(
    "touchmove",
    (e) => {
      if (!pinch || e.touches.length !== 2) return;
      e.preventDefault();
      const m = mid(e.touches);
      setZoom(pinch.z * (dist(e.touches) / pinch.d), m.x, m.y);
    },
    { passive: false }
  );
  scroller.addEventListener("touchend", (e) => {
    if (e.touches.length < 2) pinch = null;
  });
})();
