(() => {
  "use strict";

  const fallbackMap = window.TREE_LIGHT_MAP;
  const canonicalUrl = "assets/tree-light-map-frozen.json";

  function isMap(value) {
    return Boolean(
      value
      && value.image
      && value.source
      && value.nodes
      && Array.isArray(value.edges)
      && Array.isArray(value.roots)
      && Array.isArray(value.groups)
    );
  }

  function loadScript(source) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = source;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Nie udało się wczytać ${source}`));
      document.body.append(script);
    });
  }

  async function loadCanonicalMap() {
    try {
      const response = await fetch(canonicalUrl, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const frozenMap = await response.json();
      if (!isMap(frozenMap)) throw new Error("Nieprawidłowy format mapy");
      return frozenMap;
    } catch (error) {
      // file:// cannot fetch JSON in some browsers. The embedded JS map keeps that
      // preview usable, while HTTP always treats the frozen JSON as canonical.
      if (isMap(fallbackMap)) return fallbackMap;
      throw error;
    }
  }

  loadCanonicalMap()
    .then((map) => {
      window.TREE_LIGHT_MAP = map;
      return loadScript("assets/stone-neural-map.js");
    })
    .then(() => loadScript("assets/tree-energy.js"))
    .then(() => {
      const params = new URLSearchParams(window.location.search);
      const editorRequested = params.get("debugMap") === "1"
        && params.get("editMap") === "1";
      return editorRequested
        ? loadScript("assets/tree-map-editor.js")
        : undefined;
    })
    .catch((error) => {
      console.error("OK Agency: nie udało się uruchomić mapy światła.", error);
    });
})();
