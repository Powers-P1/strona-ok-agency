(() => {
  "use strict";

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Direct entries keep their own short choreography. During a supported
  // hero -> menu View Transition, route-arrival.js has already exposed the
  // complete menu as the incoming snapshot, so this is intentionally idempotent.
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
  }));

  // Only remove the startup delays after the longest entrance has completed.
  // Hover must never cut the choreography short.
  const settle = () => document.body.classList.add("is-settled");
  const finalImage = document.querySelector(".card:last-child .card-img img");
  finalImage?.addEventListener("transitionend", settle, { once: true });
  setTimeout(settle, 1700);

  // Soft fallback exit for same-origin routes that do not opt into a
  // cross-document View Transition.
  if (!reduce) {
    let routing = false;
    document.addEventListener("click", e => {
      const a = e.target.closest("a[href]");
      if (!a || routing) return;
      if (
        e.metaKey
        || e.ctrlKey
        || e.shiftKey
        || e.altKey
        || a.target
        || a.hasAttribute("download")
      ) return;

      const target = new URL(a.href, location.href);
      if (target.origin !== location.origin) return;
      if (
        target.pathname === location.pathname
        && target.search === location.search
      ) return;

      e.preventDefault();
      routing = true;
      document.body.classList.add("is-leaving");
      document.body.setAttribute("aria-busy", "true");
      setTimeout(() => { location.href = target.href; }, 560);
    });
  }
})();
