(() => {
  "use strict";

  const scenes = [...document.querySelectorAll(".scene")];
  const sceneButtons = [...document.querySelectorAll("[data-go]")];
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const hashes = scenes.map((scene) => `#${scene.id}`);
  let activeIndex = Math.max(0, hashes.indexOf(window.location.hash));

  const motionPaused = () => (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
    || window.OKAgencyMotion?.isPaused()
  );

  const updateActiveScene = (index, { updateHash = true } = {}) => {
    activeIndex = Math.max(0, Math.min(scenes.length - 1, index));

    scenes.forEach((scene, sceneIndex) => {
      scene.classList.toggle("is-active", sceneIndex === activeIndex);
      scene.setAttribute("aria-hidden", "false");
      scene.removeAttribute("inert");
    });

    const theme = scenes[activeIndex]?.dataset.theme || "light";
    document.body.dataset.theme = theme;
    if (themeColor) themeColor.content = theme === "dark" ? "#06192b" : "#ead9cb";
    if (updateHash) history.replaceState(null, "", hashes[activeIndex]);
  };

  scenes.forEach((scene) => {
    scene.setAttribute("aria-hidden", "false");
    scene.removeAttribute("inert");
  });

  sceneButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.go);
      if (!Number.isInteger(index) || !scenes[index]) return;
      updateActiveScene(index);
      scenes[index].scrollIntoView({
        behavior: motionPaused() ? "auto" : "smooth",
        block: "start",
      });
    });
  });

  let scrollFrame = 0;
  const syncActiveScene = () => {
    scrollFrame = 0;
    const probe = window.innerHeight * .5;
    const sceneRects = scenes.map((scene) => scene.getBoundingClientRect());
    let index = sceneRects.findIndex((rect) => rect.top <= probe && rect.bottom > probe);
    if (index < 0) {
      index = sceneRects.reduce((closest, rect, current) => {
        const distance = Math.abs((rect.top + rect.bottom) * .5 - probe);
        return distance < closest.distance ? { index: current, distance } : closest;
      }, { index: activeIndex, distance: Infinity }).index;
    }
    if (index >= 0 && index !== activeIndex) updateActiveScene(index);
  };
  const scheduleSceneSync = () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(syncActiveScene);
  };

  window.addEventListener("scroll", scheduleSceneSync, { passive: true });
  window.addEventListener("resize", scheduleSceneSync, { passive: true });

  window.addEventListener("hashchange", () => {
    const index = hashes.indexOf(window.location.hash);
    if (index < 0) return;
    updateActiveScene(index, { updateHash: false });
    scenes[index].scrollIntoView({
      behavior: motionPaused() ? "auto" : "smooth",
      block: "start",
    });
  });

  updateActiveScene(activeIndex, { updateHash: false });
  if (window.location.hash && scenes[activeIndex]) {
    requestAnimationFrame(() => scenes[activeIndex].scrollIntoView({
      behavior: "auto",
      block: "start",
    }));
  }
  scheduleSceneSync();
})();
