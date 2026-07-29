(() => {
  const hero = document.getElementById("hero");
  const back = document.getElementById("back");
  const sculpture = document.getElementById("sculpture");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!hero || !back) return;

  sculpture?.addEventListener("error", () => {
    const fallbackSrc = sculpture.dataset.fallbackSrc;
    if (!fallbackSrc || sculpture.src.endsWith(fallbackSrc)) return;
    sculpture.src = fallbackSrc;
  }, { once: true });

  let panelTimer = 0;
  const playPanels = (className, duration) => {
    if (reducedMotion.matches) return;
    window.clearTimeout(panelTimer);
    hero.classList.remove("is-panel-transition", "is-panel-returning");
    void hero.offsetWidth;
    hero.classList.add(className);
    panelTimer = window.setTimeout(() => hero.classList.remove(className), duration);
  };

  let wasFocused = hero.classList.contains("is-focused");
  const observer = new MutationObserver(() => {
    const focused = hero.classList.contains("is-focused");
    if (focused && !wasFocused) {
      playPanels("is-panel-transition", 1500);
    }
    wasFocused = focused;
  });

  observer.observe(hero, { attributes: true, attributeFilter: ["class"] });
  back.addEventListener("click", () => playPanels("is-panel-returning", 1300), { capture: true });
})();
