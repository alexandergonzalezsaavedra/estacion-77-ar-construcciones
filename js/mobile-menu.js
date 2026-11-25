// Hamburger menu (below 1200px, where the header pills don't fit):
// opens a panel under the header with the links to each project.
(function () {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  if (!toggle || !menu) return;

  const desktop = window.matchMedia("(min-width: 1200px)");

  function setOpen(open) {
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("menu-open", open);
  }

  toggle.addEventListener("click", () => setOpen(menu.hidden));

  // Close after choosing a project, with Escape, on an outside click,
  // or when the screen grows to desktop size.
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (!menu.hidden && !e.target.closest(".site-header")) setOpen(false);
  });
  desktop.addEventListener("change", (e) => {
    if (e.matches) setOpen(false);
  });
})();
