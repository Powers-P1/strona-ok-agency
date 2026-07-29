(() => {
  const scenes = [...document.querySelectorAll(".scene")];
  const navButtons = [...document.querySelectorAll(".scene-nav [data-go]")];
  const hashes = scenes.map((scene) => `#${scene.id}`);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const interactiveSelector = "button, a, summary, input, textarea, select, [contenteditable]";
  let activeIndex = Math.max(0, hashes.indexOf(window.location.hash));
  let locked = false;
  let touchStartY = 0;

  function resetViewportOffset() {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  function setScene(index, { updateHash = true, force = false } = {}) {
    const nextIndex = Math.max(0, Math.min(scenes.length - 1, index));
    if (!force && nextIndex === activeIndex) return;
    const previousIndex = activeIndex;
    const previous = scenes[previousIndex];
    activeIndex = nextIndex;

    scenes.forEach((scene, sceneIndex) => {
      const isActive = sceneIndex === activeIndex;
      scene.classList.toggle("is-active", isActive);
      scene.classList.toggle("is-leaving-up", sceneIndex === previousIndex && sceneIndex < activeIndex);
      scene.setAttribute("aria-hidden", String(!isActive));
      if (isActive) {
        scene.removeAttribute("inert");
      } else {
        scene.setAttribute("inert", "");
      }
    });

    navButtons.forEach((button, buttonIndex) => {
      if (buttonIndex === activeIndex) {
        button.setAttribute("aria-current", "true");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    document.body.dataset.theme = scenes[activeIndex].dataset.theme;
    document.querySelector('meta[name="theme-color"]').content =
      scenes[activeIndex].dataset.theme === "dark" ? "#06192b" : "#ead9cb";

    closeAllCallouts();
    const defaultCallout = scenes[activeIndex].querySelector('[data-callout][data-default-open="true"]');
    if (defaultCallout) {
      defaultCallout.dataset.pinned = "true";
      syncCallout(defaultCallout, true);
    }

    if (updateHash) history.replaceState(null, "", hashes[activeIndex]);
    resetViewportOffset();
    window.requestAnimationFrame(resetViewportOffset);
    window.setTimeout(resetViewportOffset, 0);
    window.setTimeout(resetViewportOffset, 80);
    window.setTimeout(() => scenes.forEach((scene) => scene.classList.remove("is-leaving-up")), 980);
  }

  function move(direction) {
    if (locked) return;
    const nextIndex = Math.max(0, Math.min(scenes.length - 1, activeIndex + direction));
    if (nextIndex === activeIndex) return;
    locked = true;
    setScene(nextIndex);
    window.setTimeout(() => {
      locked = false;
    }, reduceMotion.matches ? 40 : 980);
  }

  window.addEventListener("wheel", (event) => {
    event.preventDefault();
    if (Math.abs(event.deltaY) < 28) return;
    move(event.deltaY > 0 ? 1 : -1);
  }, { passive: false });

  window.addEventListener("touchstart", (event) => {
    touchStartY = event.target.closest(interactiveSelector)
      ? null
      : event.changedTouches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", (event) => {
    if (touchStartY === null) return;
    const delta = touchStartY - event.changedTouches[0].clientY;
    if (Math.abs(delta) > 46) move(delta > 0 ? 1 : -1);
  }, { passive: true });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllCallouts();
      return;
    }
    if (event.target.closest(interactiveSelector)) return;
    if (["ArrowDown", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      move(1);
    }
    if (["ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      move(-1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      setScene(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      setScene(scenes.length - 1);
    }
  });

  window.addEventListener("hashchange", () => {
    const index = hashes.indexOf(window.location.hash);
    if (index >= 0) setScene(index, { updateHash: false });
  });

  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => setScene(Number(button.dataset.go)));
  });

  function syncCallout(callout, open) {
    const button = callout.querySelector(".annotation-dot");
    const panel = callout.querySelector(".annotation-copy");
    callout.classList.toggle("is-open", open);
    button.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
  }

  function closeAllCallouts() {
    document.querySelectorAll("[data-callout]").forEach((callout) => {
      callout.dataset.pinned = "false";
      delete callout.dataset.preview;
      syncCallout(callout, false);
    });
  }

  document.querySelectorAll("[data-callout]").forEach((callout) => {
    const button = callout.querySelector(".annotation-dot");
    const initiallyOpen = callout.classList.contains("is-open");
    callout.dataset.defaultOpen = String(initiallyOpen);
    callout.dataset.pinned = String(initiallyOpen);
    syncCallout(callout, initiallyOpen);

    function previewOpen() {
      if (callout.classList.contains("is-open")) return;
      document.querySelectorAll("[data-callout]").forEach((item) => {
        if (item === callout) return;
        item.dataset.pinned = "false";
        delete item.dataset.preview;
        syncCallout(item, false);
      });
      callout.dataset.preview = "true";
      syncCallout(callout, true);
    }

    function closePreview() {
      if (callout.dataset.preview !== "true" || document.activeElement === button) return;
      delete callout.dataset.preview;
      syncCallout(callout, false);
    }

    callout.addEventListener("mouseenter", previewOpen);
    callout.addEventListener("mouseleave", closePreview);
    button.addEventListener("focus", previewOpen);
    button.addEventListener("blur", () => {
      if (callout.dataset.pinned !== "true") {
        delete callout.dataset.preview;
        syncCallout(callout, false);
      }
    });
    button.addEventListener("click", () => {
      const wasPreview = callout.dataset.preview === "true";
      const willOpen = wasPreview || callout.dataset.pinned !== "true";
      document.querySelectorAll("[data-callout]").forEach((item) => {
        item.dataset.pinned = "false";
        delete item.dataset.preview;
        syncCallout(item, false);
      });
      if (willOpen) {
        callout.dataset.pinned = "true";
        syncCallout(callout, true);
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-callout]")) closeAllCallouts();
  });

  document.querySelectorAll(".mobile-details").forEach((group) => {
    group.querySelectorAll("details").forEach((detail) => {
      detail.querySelector("summary")?.addEventListener("click", () => {
        if (detail.open) return;
        group.querySelectorAll("details").forEach((sibling) => {
          if (sibling !== detail) sibling.open = false;
        });
      });
      detail.addEventListener("toggle", () => {
        if (!detail.open) return;
        group.querySelectorAll("details").forEach((sibling) => {
          if (sibling !== detail) sibling.open = false;
        });
      });
    });
  });

  function syncAccordionItem(item, open) {
    const trigger = item.querySelector(".accordion-trigger");
    const panel = item.querySelector(".accordion-detail");
    item.classList.toggle("is-open", open);
    trigger.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
  }

  document.querySelectorAll(".accordion-item").forEach((item) => {
    syncAccordionItem(item, item.classList.contains("is-open"));
    const trigger = item.querySelector(".accordion-trigger");
    trigger.addEventListener("click", () => {
      const willOpen = trigger.getAttribute("aria-expanded") !== "true";
      item.closest(".accordion").querySelectorAll(".accordion-item").forEach((row) => {
        syncAccordionItem(row, false);
      });
      if (willOpen) syncAccordionItem(item, true);
    });
  });

  setScene(activeIndex, { updateHash: false, force: true });
})();
