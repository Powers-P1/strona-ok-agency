(() => {
  "use strict";

  const canonicalUrl = "/assets/tree-light-map-frozen.json";
  const trigger = document.getElementById("explore");
  const coarsePointer = window.matchMedia("(pointer: coarse)");
  const smallViewport = window.matchMedia("(max-width: 720px)");
  const saveData = Boolean(navigator.connection?.saveData);
  const automaticEffectsDisabled = () => (
    saveData
    || coarsePointer.matches
    || smallViewport.matches
  );
  let started = false;
  let ready = false;
  let pendingActivation = false;

  if (automaticEffectsDisabled() || window.OKAgencyMotion?.isPaused()) {
    document.documentElement.dataset.heroEffects = "disabled";
  }

  const isMap = (value) => Boolean(
    value
    && value.image
    && value.source
    && value.nodes
    && Array.isArray(value.edges)
    && Array.isArray(value.roots)
    && Array.isArray(value.groups)
  );

  const loadScript = (source) => new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = source;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Nie udało się wczytać ${source}`));
    document.body.append(script);
  });

  const loadCanonicalMap = async () => {
    const response = await fetch(canonicalUrl, { cache: "force-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const frozenMap = await response.json();
    if (!isMap(frozenMap)) throw new Error("Nieprawidłowy format mapy");
    return frozenMap;
  };

  const start = async ({ force = false } = {}) => {
    if (ready) return;
    if (started) return;
    if (!force && window.OKAgencyMotion?.isPaused()) return;

    started = true;
    try {
      window.TREE_LIGHT_MAP = await loadCanonicalMap();
      await loadScript("/assets/stone-neural-map.js");
      await loadScript("/assets/tree-energy.js?v=20260729-2");

      const params = new URLSearchParams(window.location.search);
      if (params.get("debugMap") === "1" && params.get("editMap") === "1") {
        await loadScript("/assets/tree-map-editor.js");
      }

      ready = true;
      document.documentElement.dataset.heroEffects = "ready";
      if (pendingActivation && trigger) {
        pendingActivation = false;
        requestAnimationFrame(() => trigger.click());
      }
    } catch (error) {
      started = false;
      console.error("OK Agency: nie udało się uruchomić mapy światła.", error);
    }
  };

  const ensureBeforeActivation = (event) => {
    if (ready) return;
    if (automaticEffectsDisabled() || window.OKAgencyMotion?.isPaused()) {
      document.documentElement.dataset.heroEffects = "disabled";
      return;
    }
    if (event.type === "click") {
      event.preventDefault();
      event.stopImmediatePropagation();
      pendingActivation = true;
    }
    start({ force: true });
  };

  trigger?.addEventListener("pointerenter", ensureBeforeActivation, { once: true });
  trigger?.addEventListener("focus", ensureBeforeActivation, { once: true });
  trigger?.addEventListener("click", ensureBeforeActivation, { capture: true });

  window.addEventListener("okagency:motionchange", (event) => {
    if (event.detail?.paused) {
      if (!ready) document.documentElement.dataset.heroEffects = "disabled";
      return;
    }
    if (!automaticEffectsDisabled() && !ready) {
      delete document.documentElement.dataset.heroEffects;
    }
  });
})();
