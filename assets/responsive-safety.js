(() => {
  "use strict";

  const getHomeHeroLayout = ({
    viewportWidth,
    viewportHeight,
    sceneTop,
    contentBottom,
    gap,
  }) => {
    const viewportRatio = viewportWidth / viewportHeight;
    const compact = viewportWidth <= 1180 || viewportRatio <= 4 / 3;

    if (!compact) {
      return Object.freeze({
        compact: false,
        portrait: false,
        artScale: 1,
        copySafeZone: 1,
        copyFitsFirstView: true,
        requiredHeight: Math.ceil(viewportHeight),
      });
    }

    const portrait = viewportRatio <= 2 / 3;
    const artScale = portrait
      ? 1
      : Math.min(1.22, Math.max(1, 1 + (4 / 3 - viewportRatio) * .85));
    const copySafeZone = viewportWidth > 1180
      ? .68
      : viewportWidth > 640
        ? .6
        : .5;
    const copyEnd = contentBottom - sceneTop + gap;
    const copySafeBoundary = sceneTop + viewportHeight * copySafeZone;
    const copyFitsFirstView = contentBottom + gap <= copySafeBoundary;
    const requiredHeight = copyFitsFirstView
      ? Math.ceil(viewportHeight)
      : Math.max(
          Math.ceil(viewportHeight),
          Math.ceil(copyEnd / copySafeZone),
        );

    return Object.freeze({
      compact: true,
      portrait,
      artScale,
      copySafeZone,
      copyFitsFirstView,
      requiredHeight,
    });
  };

  if (typeof window === "undefined" || typeof document === "undefined") {
    if (typeof module !== "undefined") {
      module.exports = { getHomeHeroLayout };
    }
    return;
  }

  const root = document.documentElement;
  const body = document.body;
  const observed = new Set();
  const layouts = [];
  let frame = 0;

  const selectors = {
    serviceScene: [
      ".campaign-frame",
      ".social-frame",
      ".process-frame",
      ".diagnosis-frame",
    ].join(","),
    serviceContent: [
      ".opening-copy",
      ".journey-intro",
      ".proof-content",
      ".process-editorial-content",
      ".map-interface",
      ".result-content",
    ].join(","),
  };

  const rendered = element => {
    if (!element || element.hidden || element.closest("[hidden]")) return false;
    if (element.closest("[inert]")) return false;
    if (element.closest('[aria-hidden="true"]')) return false;
    const style = getComputedStyle(element);
    return style.display !== "none"
      && style.visibility !== "hidden";
  };

  const addLayout = (scene, contentSelector, artSelector, mode = "scene") => {
    if (!scene) return;
    const art = scene.querySelector(artSelector);
    if (!art) return;

    scene.dataset.okSafeScene = "";
    art.dataset.okSafeArt = "idle";
    layouts.push({ scene, contentSelector, art, mode });
    observed.add(scene);
    observed.add(art);
  };

  const visualContentRect = content => {
    const elements = [
      content,
      ...content.querySelectorAll(
        "h1,h2,h3,p,button,a,li,summary,label,input,select,textarea,form,fieldset",
      ),
    ].filter(rendered);

    return elements.reduce((bounds, element) => {
      const rect = element.getBoundingClientRect();
      const right = Math.max(rect.right, rect.left + element.scrollWidth);
      const bottom = Math.max(rect.bottom, rect.top + element.scrollHeight);
      return {
        top: Math.min(bounds.top, rect.top),
        right: Math.max(bounds.right, right),
        bottom: Math.max(bounds.bottom, bottom),
        left: Math.min(bounds.left, rect.left),
      };
    }, {
      top: Number.POSITIVE_INFINITY,
      right: Number.NEGATIVE_INFINITY,
      bottom: Number.NEGATIVE_INFINITY,
      left: Number.POSITIVE_INFINITY,
    });
  };

  const stableContentRect = content => {
    const rect = content.getBoundingClientRect();
    return {
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      left: rect.left,
    };
  };

  const discover = () => {
    const home = document.querySelector(".home-page .hero");
    if (home) addLayout(home, ":scope > .copy, :scope > .detail", ":scope > .art-stage", "grow");

    document.querySelectorAll(selectors.serviceScene).forEach(scene => {
      addLayout(scene, selectors.serviceContent, ":scope > .campaign-art");
    });

    document.querySelectorAll(".about-page .scene").forEach(scene => {
      addLayout(scene, ".copy-panel", ":scope > .scene-art");
    });

    const errorPage = document.querySelector(".error-page");
    if (errorPage) addLayout(errorPage, ".error-copy", ":scope > .error-art", "grow");
  };

  const restoreScrollRegion = content => {
    delete content.dataset.okSafeScroll;
    content.style.removeProperty("--ok-safe-content-max-height");
    if (content.dataset.okSafeAddedTabindex === "true") {
      content.removeAttribute("tabindex");
      delete content.dataset.okSafeAddedTabindex;
    }
    if (content.dataset.okSafeAddedRole === "true") {
      content.removeAttribute("role");
      delete content.dataset.okSafeAddedRole;
    }
    if (content.dataset.okSafeAddedLabelledby === "true") {
      content.removeAttribute("aria-labelledby");
      delete content.dataset.okSafeAddedLabelledby;
    }
  };

  const makeScrollRegion = (content, availableHeight) => {
    content.dataset.okSafeScroll = "true";
    content.style.setProperty("--ok-safe-content-max-height", `${Math.max(180, availableHeight)}px`);

    if (!content.hasAttribute("tabindex")) {
      content.tabIndex = 0;
      content.dataset.okSafeAddedTabindex = "true";
    }
    let labelled = content.hasAttribute("aria-label") || content.hasAttribute("aria-labelledby");
    if (!content.hasAttribute("aria-label") && !content.hasAttribute("aria-labelledby")) {
      const heading = content.querySelector("h1[id], h2[id], h3[id]");
      if (heading) {
        content.setAttribute("aria-labelledby", heading.id);
        content.dataset.okSafeAddedLabelledby = "true";
        labelled = true;
      }
    }
    if (labelled && !content.hasAttribute("role")) {
      content.setAttribute("role", "region");
      content.dataset.okSafeAddedRole = "true";
    }
  };

  const clearLayout = layout => {
    layout.art.dataset.okSafeArt = "idle";
    delete layout.art.dataset.okSafeReveal;
    delete layout.scene.dataset.okSafeCurtain;
    delete layout.scene.dataset.okSafeMobileHero;
    delete layout.scene.dataset.okSafeCompactFit;
    layout.scene.style.removeProperty("--ok-safe-curtain-mask");
    layout.scene.style.removeProperty("--ok-home-compact-art-scale");
    layout.art.style.removeProperty("--ok-safe-mask-image");
    layout.scene.querySelectorAll("[data-ok-safe-content]").forEach(content => {
      restoreScrollRegion(content);
      delete content.dataset.okSafeContent;
    });
  };

  const measureLayout = layout => {
    const candidates = [...layout.scene.querySelectorAll(layout.contentSelector)];
    const content = candidates.find(rendered);
    candidates.filter(candidate => candidate !== content).forEach(candidate => {
      restoreScrollRegion(candidate);
      delete candidate.dataset.okSafeContent;
    });
    if (!content) {
      clearLayout(layout);
      return;
    }

    content.dataset.okSafeContent = "";
    delete layout.scene.dataset.okSafeCurtain;
    delete layout.scene.dataset.okSafeMobileHero;
    delete layout.scene.dataset.okSafeCompactFit;
    layout.scene.style.removeProperty("--ok-safe-curtain-mask");
    const sceneRect = layout.scene.getBoundingClientRect();
    const artRect = layout.art.getBoundingClientRect();
    const contentBounds = layout.mode === "grow"
      ? stableContentRect(content)
      : visualContentRect(content);
    const contentRect = {
      ...contentBounds,
      width: contentBounds.right - contentBounds.left,
      height: contentBounds.bottom - contentBounds.top,
    };
    if (!sceneRect.width || !sceneRect.height || !artRect.width || !artRect.height) return;

    const viewport = window.visualViewport;
    const viewportWidth = viewport?.width || window.innerWidth;
    const viewportHeight = viewport?.height || window.innerHeight;
    const tallPortrait = viewportHeight > 760
      && viewportHeight > viewportWidth * 1.35;
    const compact = viewportWidth <= 1180
      || viewportHeight <= 760
      || tallPortrait
      || contentRect.width >= sceneRect.width * .5;

    const gap = Math.max(20, Math.min(56, sceneRect.width * .03));
    let requiredHeight = Math.ceil(contentRect.bottom - sceneRect.top + gap);

    const naturalHeight = Math.max(content.scrollHeight, contentRect.height);
    const availableHeight = Math.floor(sceneRect.bottom - Math.max(contentRect.top, sceneRect.top) - gap);
    if (layout.mode !== "grow" && naturalHeight > availableHeight + 2) {
      makeScrollRegion(content, availableHeight);
    } else {
      restoreScrollRegion(content);
    }

    const isHome = layout.mode === "grow" && body.classList.contains("home-page");
    const homeLayout = isHome
      ? getHomeHeroLayout({
          viewportWidth,
          viewportHeight,
          sceneTop: sceneRect.top,
          contentBottom: contentRect.bottom,
          gap,
        })
      : null;
    const compactHome = Boolean(homeLayout?.compact);
    if (!compactHome) {
      layout.scene.style.removeProperty("--ok-home-compact-art-scale");
    }
    if (isHome && compact) {
      const minimumArtSpace = Math.max(300, Math.min(520, viewportWidth * .5));
      requiredHeight = Math.max(
        requiredHeight,
        Math.ceil(contentRect.bottom - sceneRect.top + minimumArtSpace),
      );
    }

    if (compactHome) {
      /*
       * The compact 4:3 plate deliberately reserves a clear copy zone above
       * the sculpture. As the viewport becomes taller, zoom that plate around
       * the tree base so the reserved zone does not grow into a visual void.
       * The portrait asset already has its own crop and stays at natural scale.
       */
      layout.scene.style.setProperty(
        "--ok-home-compact-art-scale",
        homeLayout.artScale.toFixed(3),
      );

      /*
       * The compact plates already contain the complete tree inside their
       * lower half. Keep the normal experience to exactly one viewport.
       * Only enlarged text/zoom that genuinely no longer fits may grow the
       * document, preserving WCAG reflow instead of shrinking typography.
       */
      requiredHeight = homeLayout.requiredHeight;

      layout.scene.style.setProperty("--ok-safe-required-height", `${requiredHeight}px`);
      layout.scene.dataset.okSafeMobileHero = homeLayout.portrait ? "portrait" : "compact";
      layout.scene.dataset.okSafeCompactFit = homeLayout.copyFitsFirstView
        ? "first-view"
        : "accessible-overflow";
      layout.art.dataset.okSafeArt = "idle";
      delete layout.art.dataset.okSafeReveal;
      layout.art.style.removeProperty("--ok-safe-mask-image");
      return;
    }

    if (layout.scene.classList.contains("is-focused")) {
      delete layout.scene.dataset.okSafeCurtain;
      layout.scene.style.removeProperty("--ok-safe-curtain-mask");
      layout.scene.style.setProperty("--ok-safe-required-height", `${requiredHeight}px`);
      layout.art.dataset.okSafeArt = "idle";
      delete layout.art.dataset.okSafeReveal;
      layout.art.style.removeProperty("--ok-safe-mask-image");
      return;
    }

    if (!compact && !isHome) {
      layout.scene.style.setProperty("--ok-safe-required-height", `${requiredHeight}px`);
      layout.art.dataset.okSafeArt = "idle";
      delete layout.art.dataset.okSafeReveal;
      layout.art.style.removeProperty("--ok-safe-mask-image");
      return;
    }

    layout.scene.style.setProperty("--ok-safe-required-height", `${requiredHeight}px`);

    const clamp = (value, maximum) => Math.max(0, Math.min(maximum, value));
    if (isHome && compact) {
      const curtainCut = clamp(
        contentRect.bottom - sceneRect.top + gap * .35,
        sceneRect.height,
      );
      const curtainFeather = Math.max(120, Math.min(260, sceneRect.height * .2));
      const curtainReveal = clamp(curtainCut + curtainFeather, sceneRect.height);
      const curtainMask = `linear-gradient(to bottom, #000 0, #000 ${curtainCut}px, transparent ${curtainReveal}px, transparent 100%)`;

      layout.scene.dataset.okSafeCurtain = "active";
      layout.scene.style.setProperty("--ok-safe-curtain-mask", curtainMask);
      layout.art.dataset.okSafeArt = "idle";
      delete layout.art.dataset.okSafeReveal;
      layout.art.style.removeProperty("--ok-safe-mask-image");
      return;
    }

    const spaces = {
      left: Math.max(0, contentRect.left - artRect.left),
      right: Math.max(0, artRect.right - contentRect.right),
      top: Math.max(0, contentRect.top - artRect.top),
      bottom: Math.max(0, artRect.bottom - contentRect.bottom),
    };
    const allowedSides = isHome
      ? (compact ? ["bottom"] : ["right"])
      : ["left", "right", "top", "bottom"];
    const revealSide = allowedSides.reduce(
      (best, side) => spaces[side] > spaces[best] ? side : best,
      allowedSides[0],
    );
    const horizontalFeather = Math.max(96, Math.min(240, artRect.width * .18));
    const verticalFeather = Math.max(96, Math.min(240, artRect.height * .18));
    let maskImage = "";

    if (revealSide === "right") {
      const cut = clamp(contentRect.right - artRect.left + gap * .35, artRect.width);
      const reveal = clamp(cut + horizontalFeather, artRect.width);
      maskImage = `linear-gradient(to right, transparent 0, transparent ${cut}px, #000 ${reveal}px, #000 100%)`;
    } else if (revealSide === "left") {
      const cut = clamp(contentRect.left - artRect.left - gap * .35, artRect.width);
      const reveal = clamp(cut - horizontalFeather, artRect.width);
      maskImage = `linear-gradient(to right, #000 0, #000 ${reveal}px, transparent ${cut}px, transparent 100%)`;
    } else if (revealSide === "bottom") {
      const cut = clamp(contentRect.bottom - artRect.top + gap * .35, artRect.height);
      const reveal = clamp(cut + verticalFeather, artRect.height);
      maskImage = `linear-gradient(to bottom, transparent 0, transparent ${cut}px, #000 ${reveal}px, #000 100%)`;
    } else {
      const cut = clamp(contentRect.top - artRect.top - gap * .35, artRect.height);
      const reveal = clamp(cut - verticalFeather, artRect.height);
      maskImage = `linear-gradient(to bottom, #000 0, #000 ${reveal}px, transparent ${cut}px, transparent 100%)`;
    }

    layout.art.style.setProperty("--ok-safe-mask-image", maskImage);
    layout.art.dataset.okSafeReveal = revealSide;
    layout.art.dataset.okSafeArt = "active";
  };

  const measureCards = () => {
    const cards = document.querySelector(".menu-page .cards");
    if (!cards) return;
    if (document.fonts && document.fonts.status !== "loaded") return;

    const cardItems = [...cards.querySelectorAll(".card")];
    const menuStage = cards.closest(".menu-stage");
    const setMenuOverflow = active => menuStage?.toggleAttribute("data-ok-safe-menu-overflow", active);
    const viewportKey = `${window.innerWidth}x${window.innerHeight}`;
    if (cards.dataset.okSafeCards === "stacked") {
      if (cards.dataset.okSafeViewport !== viewportKey) {
        delete cards.dataset.okSafeCards;
        delete cards.dataset.okSafeViewport;
        cards.style.removeProperty("--ok-safe-card-height");
        setMenuOverflow(false);
        requestAnimationFrame(schedule);
        return;
      }

      const textHeight = Math.max(...cardItems.map(card => card.querySelector(".card-text")?.scrollHeight || 0));
      const imageHeight = Math.max(220, Math.min(440, window.innerHeight * .34));
      cards.style.setProperty("--ok-safe-card-height", `${Math.ceil(textHeight + imageHeight + 24)}px`);
      setMenuOverflow(true);
      return;
    }

    const crowded = cardItems.some(card => {
      const text = card.querySelector(".card-text");
      const image = card.querySelector(".card-img");
      if (!text || !image) return false;
      const textRect = text.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();
      return text.scrollHeight > text.clientHeight + 2
        || textRect.bottom > imageRect.top + 56;
    });

    if (!crowded) {
      cards.style.removeProperty("--ok-safe-card-height");
      setMenuOverflow(false);
      return;
    }

    const textHeight = Math.max(...cardItems.map(card => card.querySelector(".card-text")?.scrollHeight || 0));
    const imageHeight = Math.max(220, Math.min(440, window.innerHeight * .34));
    cards.dataset.okSafeCards = "stacked";
    cards.dataset.okSafeViewport = viewportKey;
    cards.style.setProperty("--ok-safe-card-height", `${Math.ceil(textHeight + imageHeight + 24)}px`);
    setMenuOverflow(true);
  };

  const measure = () => {
    frame = 0;
    const viewport = window.visualViewport;
    const viewportWidth = viewport?.width || window.innerWidth;
    const viewportHeight = viewport?.height || window.innerHeight;
    const tallPortrait = viewportHeight > 760
      && viewportHeight > viewportWidth * 1.35;
    root.toggleAttribute("data-ok-tall-portrait", tallPortrait);
    layouts.forEach(measureLayout);
    measureCards();
  };

  const schedule = () => {
    if (frame) return;
    frame = requestAnimationFrame(measure);
  };

  discover();

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(schedule);
    observed.forEach(element => resizeObserver.observe(element));
    document.querySelectorAll(".menu-page .cards, .menu-page .card-text").forEach(element => {
      resizeObserver.observe(element);
    });
  }

  const mutationObserver = new MutationObserver(schedule);
  mutationObserver.observe(body, {
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-hidden", "class", "hidden", "inert"],
  });

  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("orientationchange", schedule, { passive: true });
  window.visualViewport?.addEventListener("resize", schedule, { passive: true });
  document.fonts?.ready.then(() => requestAnimationFrame(schedule));
  schedule();

  window.OKAgencyResponsiveSafety = Object.freeze({
    getHomeHeroLayout,
    refresh: schedule,
    snapshot: () => ({
      tallPortrait: root.hasAttribute("data-ok-tall-portrait"),
      shieldedArt: document.querySelectorAll('[data-ok-safe-art="active"]').length,
      scrollRegions: document.querySelectorAll('[data-ok-safe-scroll="true"]').length,
      stackedCards: Boolean(document.querySelector('[data-ok-safe-cards="stacked"]')),
    }),
  });
})();
