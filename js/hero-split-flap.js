(function () {
  const heading = document.querySelector("[data-split-flap]");
  if (!heading) return;

  const lines = Array.from(heading.querySelectorAll("[data-flap-line]"));
  if (!lines.length) return;

  const FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const STEP_DELAY = 60;
  const MIN_STEPS = 3;
  const MAX_STEPS = 6;
  const CHAR_STAGGER = 12; // ms between characters
  const LINE_STAGGER = 60; // extra ms per line
  const START_AFTER = 450; // ms after load: starts while the logo is still landing

  function buildChars(line) {
    const text = line.textContent.replace(/\s+/g, " ").trim();
    line.textContent = "";
    const result = [];

    text.split(/(\s+)/).forEach((chunk) => {
      if (chunk === "") return;
      const isSpace = /^\s+$/.test(chunk);
      const target = isSpace ? line : document.createElement("span");
      if (!isSpace) target.className = "flap-word";

      Array.from(chunk).forEach((char) => {
        const span = document.createElement("span");
        span.className = "flap-char";
        span.textContent = char === " " ? " " : char;
        target.appendChild(span);
        result.push({ span, final: char === " " ? " " : char });
      });

      if (!isSpace) line.appendChild(target);
    });

    return result;
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
    document.dispatchEvent(new Event("hero-cta-ready"));
  }

  function play() {
    let remaining = 0;
    lineChars.forEach((chars) => {
      remaining += chars.length;
    });

    function onCharDone() {
      remaining--;
      if (remaining === 0) setTimeout(revealCta, 80);
    }

    let index = 0;
    lineChars.forEach((chars, lineIndex) => {
      chars.forEach(({ span, final }) => {
        const delay = index * CHAR_STAGGER + lineIndex * LINE_STAGGER;
        runFlap(span, final, delay, onCharDone);
        index++;
      });
    });
  }

  // The logo entrance is JS-driven (hero-parallax.js), so it never fires
  // `animationend`; start on a short fixed delay instead of waiting for it.
  setTimeout(play, START_AFTER);
})();
