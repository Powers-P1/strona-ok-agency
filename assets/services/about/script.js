(() => {
  "use strict";

  const scenes = [...document.querySelectorAll(".scene")];
  const navButtons = [...document.querySelectorAll(".scene-nav [data-go]")];
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

    navButtons.forEach((button) => {
      if (Number(button.dataset.go) === activeIndex) {
        button.setAttribute("aria-current", "true");
      } else {
        button.removeAttribute("aria-current");
      }
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

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      const index = scenes.indexOf(visible.target);
      if (index >= 0 && index !== activeIndex) updateActiveScene(index);
    }, {
      rootMargin: "-25% 0px -25% 0px",
      threshold: [0.2, 0.45, 0.7],
    });
    scenes.forEach((scene) => observer.observe(scene));
  }

  window.addEventListener("hashchange", () => {
    const index = hashes.indexOf(window.location.hash);
    if (index < 0) return;
    updateActiveScene(index, { updateHash: false });
    scenes[index].scrollIntoView({
      behavior: motionPaused() ? "auto" : "smooth",
      block: "start",
    });
  });

  function syncCallout(callout, open) {
    const button = callout.querySelector(".annotation-dot");
    const panel = callout.querySelector(".annotation-copy");
    callout.classList.toggle("is-open", open);
    button?.setAttribute("aria-expanded", String(open));
    if (panel) panel.hidden = !open;
  }

  function closeAllCallouts(except = null) {
    document.querySelectorAll("[data-callout]").forEach((callout) => {
      if (callout === except) return;
      callout.dataset.pinned = "false";
      delete callout.dataset.preview;
      syncCallout(callout, false);
    });
  }

  document.querySelectorAll("[data-callout]").forEach((callout) => {
    const button = callout.querySelector(".annotation-dot");
    const initiallyOpen = callout.classList.contains("is-open");
    callout.dataset.pinned = String(initiallyOpen);
    syncCallout(callout, initiallyOpen);

    const previewOpen = () => {
      if (callout.classList.contains("is-open")) return;
      closeAllCallouts(callout);
      callout.dataset.preview = "true";
      syncCallout(callout, true);
    };

    const closePreview = () => {
      if (callout.dataset.preview !== "true" || document.activeElement === button) return;
      delete callout.dataset.preview;
      syncCallout(callout, false);
    };

    callout.addEventListener("mouseenter", previewOpen);
    callout.addEventListener("mouseleave", closePreview);
    button?.addEventListener("focus", previewOpen);
    button?.addEventListener("blur", () => {
      if (callout.dataset.pinned !== "true") {
        delete callout.dataset.preview;
        syncCallout(callout, false);
      }
    });
    button?.addEventListener("click", () => {
      const willOpen = (
        callout.dataset.preview === "true"
        || callout.dataset.pinned !== "true"
      );
      closeAllCallouts();
      if (willOpen) {
        callout.dataset.pinned = "true";
        syncCallout(callout, true);
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-callout]")) closeAllCallouts();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAllCallouts();
  });

  document.querySelectorAll(".mobile-details").forEach((group) => {
    group.querySelectorAll("details").forEach((detail) => {
      detail.addEventListener("toggle", () => {
        if (!detail.open) return;
        group.querySelectorAll("details").forEach((sibling) => {
          if (sibling !== detail) sibling.open = false;
        });
      });
    });
  });

  const syncAccordionItem = (item, open) => {
    const trigger = item.querySelector(".accordion-trigger");
    const panel = item.querySelector(".accordion-detail");
    item.classList.toggle("is-open", open);
    trigger?.setAttribute("aria-expanded", String(open));
    if (panel) panel.hidden = !open;
  };

  document.querySelectorAll(".accordion-item").forEach((item) => {
    syncAccordionItem(item, item.classList.contains("is-open"));
    const trigger = item.querySelector(".accordion-trigger");
    trigger?.addEventListener("click", () => {
      const willOpen = trigger.getAttribute("aria-expanded") !== "true";
      item.closest(".accordion")?.querySelectorAll(".accordion-item").forEach((row) => {
        syncAccordionItem(row, false);
      });
      if (willOpen) syncAccordionItem(item, true);
    });
  });

  updateActiveScene(activeIndex, { updateHash: false });
  if (window.location.hash && scenes[activeIndex]) {
    requestAnimationFrame(() => scenes[activeIndex].scrollIntoView({ block: "start" }));
  }
})();
