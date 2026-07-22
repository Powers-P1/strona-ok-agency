const menuToggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
const siteNavigation = document.querySelector<HTMLElement>("[data-navigation]");

const setMenuState = (open: boolean) => {
  if (!menuToggle || !siteNavigation) return;

  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Zamknij menu" : "Otwórz menu");
  siteNavigation.toggleAttribute("data-open", open);
  document.body.classList.toggle("menu-open", open);
};

menuToggle?.addEventListener("click", () => {
  setMenuState(menuToggle.getAttribute("aria-expanded") !== "true");
});

siteNavigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenuState(false);
    menuToggle?.focus();
  }
});

const desktopQuery = window.matchMedia("(min-width: 900px)");
desktopQuery.addEventListener("change", ({ matches }) => {
  if (matches) setMenuState(false);
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const revealElements = document.querySelectorAll<HTMLElement>("[data-reveal]");

if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.setAttribute("data-visible", ""));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).setAttribute("data-visible", "");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.08 },
  );

  revealElements.forEach((element) => observer.observe(element));
}
