(function () {
  const heading = document.querySelector("[data-split-flap]");
  if (!heading) return;

  const lines = Array.from(heading.querySelectorAll("[data-flap-line]"));
  if (!lines.length) return;

  const FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const STEP_DELAY = 100;
  const MIN_STEPS = 5;
  const MAX_STEPS = 10;

  function buildChars(line) {
    const text = line.textContent;
    line.textContent = "";
    return Array.from(text).map((char) => {
      const span = document.createElement("span");
      span.className = "flap-char";
      span.textContent = char === " " ? " " : char;
      line.appendChild(span);
      return { span, final: char === " " ? " " : char };
    });
  }

  function runFlap(span, finalChar, delay, onDone) {
    if (finalChar === " ") {
      if (onDone) onDone();
      return;
    }
    const steps = MIN_STEPS + Math.floor(Math.random() * (MAX_STEPS - MIN_STEPS));

    setTimeout(() => {
      span.classList.add("is-visible");
      let i = 0;
      function tick() {
        const stepIndex = i;
        span.classList.remove("is-flipping");
        void span.offsetWidth;
        span.classList.add("is-flipping");

        setTimeout(() => {
          const last = stepIndex === steps - 1;
          span.textContent = last
            ? finalChar
            : FLAP_CHARS[Math.floor(Math.random() * FLAP_CHARS.length)];
          if (last && onDone) onDone();
        }, STEP_DELAY / 2);

        i++;
        if (i < steps) setTimeout(tick, STEP_DELAY);
      }
      tick();
    }, delay);
  }

  // Build the per-character spans up front (hidden via CSS) so the reveal
  // and the flap sequence can start together once the logo has landed.
  const lineChars = lines.map(buildChars);

  function revealCta() {
    const cta = document.querySelector("[data-hero-cta]");
    if (cta) cta.classList.add("is-visible");
  }

  function play() {
    let remaining = 0;
    lineChars.forEach((chars) => {
      remaining += chars.length;
    });

    function onCharDone() {
      remaining--;
      if (remaining === 0) setTimeout(revealCta, 200);
    }

    let index = 0;
    lineChars.forEach((chars, lineIndex) => {
      chars.forEach(({ span, final }) => {
        const delay = index * 25 + lineIndex * 120;
        runFlap(span, final, delay, onCharDone);
        index++;
      });
    });
  }

  const logo = document.querySelector(".hero-banner__logo-estacion");
  let started = false;
  function start() {
    if (started) return;
    started = true;
    play();
  }

  if (logo) {
    logo.addEventListener("animationend", start, { once: true });
    // Safety net in case the animation is skipped (reduced motion, no CSS, etc.)
    setTimeout(start, 2800);
  } else {
    start();
  }
})();
