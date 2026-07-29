(() => {
  "use strict";

  const hero = document.getElementById("hero");
  if (!hero) return;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let routing = false;
  let pendingMenu = false;

  const waitForLeave = () => new Promise(resolve => {
    if (reduce) {
      requestAnimationFrame(resolve);
      return;
    }

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(fallback);
      hero.removeEventListener("transitionend", onEnd);
      resolve();
    };
    const onEnd = event => {
      if (
        hero.classList.contains("is-route-leaving")
        && [".topbar", ".copy", ".image-rig"].some(selector => event.target.matches?.(selector))
      ) finish();
    };
    const fallback = setTimeout(finish, 520);
    hero.addEventListener("transitionend", onEnd);
  });

  const leave = async target => {
    if (routing) return;
    routing = true;
    hero.classList.remove("is-panel-transition", "is-panel-returning");
    hero.classList.add("is-route-leaving");
    document.body.setAttribute("aria-busy", "true");
    await waitForLeave();
    location.href = target;
  };

  /*
    The hero CTA owns a mapped energy activation in tree-energy.js.
    We let that interaction finish first, then continue to the decision lobby.
    This preserves the accepted hero behaviour instead of bypassing it in capture.
  */
  const focusObserver = new MutationObserver(() => {
    if (!pendingMenu || !hero.classList.contains("is-focused")) return;
    pendingMenu = false;
    leave("/menu");
  });
  focusObserver.observe(hero, { attributes: true, attributeFilter: ["class"] });

  document.addEventListener("click", event => {
    const trigger = event.target.closest("[data-menu-entry], .route-link");
    if (!trigger || routing) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || trigger.target) return;

    if (trigger.matches("[data-menu-entry]")) {
      if (document.documentElement.dataset.heroEffects === "disabled") {
        event.preventDefault();
        leave("/menu");
        return;
      }
      pendingMenu = true;
      return;
    }

    event.preventDefault();
    const target = new URL(trigger.href, location.href);
    if (target.origin !== location.origin) return;
    leave(target.href);
  }, true);
})();
