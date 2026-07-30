(() => {
  "use strict";

  const canonicalUrl = "/assets/tree-light-map-frozen.json";
  const trigger = document.getElementById("explore");
  const coarsePointer = window.matchMedia("(pointer: coarse)");
  const smallViewport = window.matchMedia("(max-width: 720px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = Boolean(navigator.connection?.saveData);
  const automaticEffectsDisabled = () => (
    saveData
    || coarsePointer.matches
    || smallViewport.matches
    || reducedMotion.matches
  );
  let started = false;
  let ready = false;
  let pendingActivation = false;
  let pendingIntent = false;
  let ambientTimer = 0;
  let ambientIdleCallback = 0;
  let loadGeneration = 0;
  const scriptPromises = new Map();

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

  const effectsEligible = () => (
    !automaticEffectsDisabled()
    && !window.OKAgencyMotion?.isPaused()
  );

  const cancelAmbientStart = () => {
    window.clearTimeout(ambientTimer);
    ambientTimer = 0;
    if (ambientIdleCallback && "cancelIdleCallback" in window) {
      window.cancelIdleCallback(ambientIdleCallback);
    }
    ambientIdleCallback = 0;
  };

  const loadScript = (source) => {
    if (scriptPromises.has(source)) return scriptPromises.get(source);

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = source;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Nie udało się wczytać ${source}`));
      document.body.append(script);
    });
    scriptPromises.set(source, promise);
    promise.catch(() => scriptPromises.delete(source));
    return promise;
  };

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
    if (!effectsEligible()) return;

    cancelAmbientStart();
    started = true;
    const generation = ++loadGeneration;
    const isCurrent = () => generation === loadGeneration && effectsEligible();
    const abandon = () => {
      started = false;
      if (effectsEligible()) {
        requestAnimationFrame(() => start({ force: pendingActivation || force }));
        return;
      }
      document.documentElement.dataset.heroEffects = "disabled";
      if (pendingActivation && trigger) {
        pendingActivation = false;
        requestAnimationFrame(() => trigger.click());
      }
    };

    try {
      const canonicalMap = await loadCanonicalMap();
      if (!isCurrent()) {
        abandon();
        return;
      }
      window.TREE_LIGHT_MAP = canonicalMap;

      await loadScript("/assets/stone-neural-map.js");
      if (!isCurrent()) {
        abandon();
        return;
      }

      await loadScript("/assets/tree-energy.js?v=20260729-3");
      if (!isCurrent()) {
        abandon();
        return;
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get("debugMap") === "1" && params.get("editMap") === "1") {
        await loadScript("/assets/tree-map-editor.js");
        if (!isCurrent()) {
          abandon();
          return;
        }
      }

      ready = true;
      pendingIntent = false;
      document.documentElement.dataset.heroEffects = "ready";
      if (pendingActivation && trigger) {
        pendingActivation = false;
        requestAnimationFrame(() => trigger.click());
      }
    } catch (error) {
      if (generation !== loadGeneration) {
        abandon();
        return;
      }
      started = false;
      console.error("OK Agency: nie udało się uruchomić mapy światła.", error);
    }
  };

  const ensureBeforeActivation = (event) => {
    if (ready) return;
    if (event.type === "click") {
      if (automaticEffectsDisabled() || window.OKAgencyMotion?.isPaused()) {
        document.documentElement.dataset.heroEffects = "disabled";
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      pendingActivation = true;
      pendingIntent = true;
      start({ force: true });
      return;
    }
    pendingIntent = true;
    if (automaticEffectsDisabled() || window.OKAgencyMotion?.isPaused()) {
      document.documentElement.dataset.heroEffects = "disabled";
      return;
    }
    start();
  };

  const scheduleAmbientStart = () => {
    cancelAmbientStart();
    if (ready || started || !effectsEligible()) return;
    const begin = () => start();
    if ("requestIdleCallback" in window) {
      ambientIdleCallback = window.requestIdleCallback(() => {
        ambientIdleCallback = 0;
        begin();
      }, { timeout: 2400 });
    } else {
      ambientTimer = window.setTimeout(() => {
        ambientTimer = 0;
        begin();
      }, 1400);
    }
  };

  trigger?.addEventListener("pointerenter", ensureBeforeActivation);
  trigger?.addEventListener("focus", ensureBeforeActivation);
  trigger?.addEventListener("click", ensureBeforeActivation, { capture: true });

  window.addEventListener("okagency:motionchange", (event) => {
    if (event.detail?.paused) {
      cancelAmbientStart();
      loadGeneration += 1;
      if (!ready) document.documentElement.dataset.heroEffects = "disabled";
      return;
    }
    if (!automaticEffectsDisabled() && !ready) {
      delete document.documentElement.dataset.heroEffects;
      if (pendingIntent) start();
      else scheduleAmbientStart();
    }
  });

  const syncEligibility = () => {
    if (ready) return;
    if (!effectsEligible()) {
      cancelAmbientStart();
      loadGeneration += 1;
      document.documentElement.dataset.heroEffects = "disabled";
      return;
    }
    delete document.documentElement.dataset.heroEffects;
    if (pendingIntent) start();
    else scheduleAmbientStart();
  };

  coarsePointer.addEventListener("change", syncEligibility);
  smallViewport.addEventListener("change", syncEligibility);
  reducedMotion.addEventListener("change", syncEligibility);

  if (document.readyState === "complete") scheduleAmbientStart();
  else window.addEventListener("load", scheduleAmbientStart, { once: true });
})();
