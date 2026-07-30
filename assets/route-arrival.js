(() => {
  "use strict";

  const normalizePath = value => {
    try {
      const path = new URL(value, location.href).pathname.replace(/\/+$/, "");
      return path || "/";
    } catch {
      return "";
    }
  };

  /*
    `pagereveal` runs before the browser captures the incoming document for a
    cross-document View Transition. Reveal the complete menu synchronously so
    the browser blends hero -> menu, rather than hero -> an empty startup frame.
  */
  addEventListener("pagereveal", event => {
    const fromUrl = globalThis.navigation?.activation?.from?.url;
    const isHeroToMenu = Boolean(
      event.viewTransition
      && normalizePath(fromUrl) === "/"
      && normalizePath(location.href) === "/menu"
    );
    if (!isHeroToMenu) return;

    const root = document.documentElement;
    const body = document.body;
    root.dataset.routeArrival = "hero-menu";
    body?.classList.add("is-ready", "is-route-arriving");

    const cleanup = () => {
      delete root.dataset.routeArrival;
      body?.classList.remove("is-route-arriving");
    };
    event.viewTransition.finished.then(cleanup, cleanup);
  }, { once: true });
})();
