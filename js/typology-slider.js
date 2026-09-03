(function () {
  const slider = document.querySelector("[data-slider]");
  if (!slider) return;

  const track = slider.querySelector("[data-track]");
  const slides = Array.from(track.children);
  const dots = Array.from(slider.querySelectorAll("[data-dot]"));
  const prevBtn = slider.querySelector("[data-prev]");
  const nextBtn = slider.querySelector("[data-next]");

  let index = 0;

  function goTo(newIndex) {
    index = (newIndex + slides.length) % slides.length;
    track.style.transform = "translateX(-" + index * 100 + "%)";
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  }

  prevBtn.addEventListener("click", () => goTo(index - 1));
  nextBtn.addEventListener("click", () => goTo(index + 1));
  dots.forEach((dot, i) => dot.addEventListener("click", () => goTo(i)));

  goTo(0);
})();
