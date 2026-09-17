(function () {
  const heading = document.querySelector("[data-split-flap]");
  if (!heading) return;

  const lines = Array.from(heading.querySelectorAll("[data-flap-line]"));
  if (!lines.length) return;

  const FLAP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const STEP_DELAY = 45;
  const MIN_STEPS = 4;
  const MAX_STEPS = 9;

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

  function runFlap(span, finalChar, delay) {
    if (span.textContent === finalChar && finalChar === " ") return;
    const steps = MIN_STEPS + Math.floor(Math.random() * (MAX_STEPS - MIN_STEPS));

    setTimeout(() => {
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
        }, STEP_DELAY / 2);

        i++;
        if (i < steps) setTimeout(tick, STEP_DELAY);
      }
      tick();
    }, delay);
  }

  function play() {
    let index = 0;
    lines.forEach((line, lineIndex) => {
      const chars = buildChars(line);
      chars.forEach(({ span, final }) => {
        const delay = index * 12 + lineIndex * 80;
        runFlap(span, final, delay);
        index++;
      });
    });
  }

  if (document.readyState === "complete") {
    play();
  } else {
    window.addEventListener("load", play);
  }
})();
