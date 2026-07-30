(() => {
  "use strict";

  const storageKey = "okagency-motion";
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  const root = document.documentElement;

  const readPreference = () => {
    try {
      return window.sessionStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };

  const initialPreference = readPreference();
  let paused = initialPreference
    ? initialPreference === "paused"
    : media.matches;
  if (!paused) root.classList.add("motion-intro-enabled");

  window.setTimeout(() => {
    root.classList.remove("motion-intro-enabled");
  }, 1600);

  const applyState = ({ persist = false, announce = false } = {}) => {
    root.dataset.motion = paused ? "paused" : "running";
    if (paused) root.classList.remove("motion-intro-enabled");

    const button = document.querySelector("[data-motion-toggle]");
    if (button) {
      button.setAttribute("aria-pressed", String(paused));
      button.setAttribute(
        "aria-label",
        paused
          ? "Wznów ruch i animacje na stronie"
          : "Wstrzymaj ruch i animacje na stronie",
      );
      const label = button.querySelector("[data-motion-label]");
      if (label) label.textContent = paused ? "Wznów ruch" : "Wstrzymaj ruch";
    }

    if (persist) {
      try {
        window.sessionStorage.setItem(storageKey, paused ? "paused" : "running");
      } catch {
        // Sterowanie nadal działa na bieżącej stronie, jeśli pamięć jest niedostępna.
      }
    }

    if (announce) {
      window.dispatchEvent(new CustomEvent("okagency:motionchange", {
        detail: { paused },
      }));
    }
  };

  const setPaused = (next, options = {}) => {
    paused = Boolean(next);
    applyState(options);
  };

  window.OKAgencyMotion = Object.freeze({
    isPaused: () => paused,
    setPaused: (next) => setPaused(next, { persist: true, announce: true }),
  });

  applyState();

  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector("[data-motion-toggle]")) return;

    const button = document.createElement("button");
    button.className = "motion-toggle";
    button.type = "button";
    button.dataset.motionToggle = "";
    button.innerHTML = `
      <span class="motion-toggle__icon" aria-hidden="true"></span>
      <span data-motion-label></span>
    `;
    button.addEventListener("click", () => {
      setPaused(!paused, { persist: true, announce: true });
    });
    document.body.append(button);
    applyState();
  }, { once: true });

  media.addEventListener("change", (event) => {
    if (readPreference()) return;
    setPaused(event.matches, { announce: true });
  });
})();
