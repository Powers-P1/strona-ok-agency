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
    const shortLandscape = viewportHeight <= 760 && viewportRatio > 4 / 3;

    if (!compact) {
      return Object.freeze({
        compact: false,
        portrait: false,
        shortLandscape,
        copySafeZone: 1,
        copyFitsFirstView: true,
        requiredHeight: Math.ceil(viewportHeight),
      });
    }

    const portrait = viewportRatio <= 2 / 3;
    const copySafeZone = shortLandscape
      ? 1
      : viewportWidth > 1180
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
      shortLandscape,
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
  const artBounds = new WeakMap();
  let frame = 0;
  let needsRemeasure = false;
  let artBoundsChanged = false;

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

  const typeRoles = Object.freeze({
    "content": [14, .0155, 48],
    "label": [12, .012, 32],
    "control": [15, .0145, 42],
    "icon": [18, .0165, 44],
    "display-home": [96, .18, 720],
    "display-home-compact": [120, .125, 360],
    "display-service": [68, .087, 360],
    "display-process": [74, .095, 392],
    "display-section": [58, .078, 320],
    "display-question": [28, .047, 192],
    "display-card": [25, .032, 128],
    "display-result": [48, .06, 240],
    "display-document": [76, .088, 360],
  });

  const publishViewportTypeScale = () => {
    const viewportHeight = window.innerHeight;
    root.style.setProperty("--ok-viewport-height-runtime", `${viewportHeight}px`);
    Object.entries(typeRoles).forEach(([role, [floor, ratio, ceiling]]) => {
      const value = Math.min(ceiling, Math.max(floor, viewportHeight * ratio));
      const resolvedValue = `${value.toFixed(3)}px`;
      /* Publish the resolved semantic token itself as well as its diagnostic
       * runtime value. WebKit can retain a stale result for a nested
       * var(var(...)) chain after a live aspect-ratio change, even though the
       * inner custom property has already changed. A direct semantic value
       * makes the system transactional for every component. */
      root.style.setProperty(`--ok-type-${role}-runtime`, resolvedValue);
      root.style.setProperty(`--ok-type-${role}`, resolvedValue);
    });
  };

  const rendered = element => {
    if (!element || element.hidden || element.closest("[hidden]")) return false;
    if (element.closest("[inert]")) return false;
    if (element.closest('[aria-hidden="true"]')) return false;
    const style = getComputedStyle(element);
    return style.display !== "none"
      && style.visibility !== "hidden"
      && element.getClientRects().length > 0;
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

  const contentBottomWithin = (content, scene) => {
    let bottom = Math.max(content.offsetHeight, content.scrollHeight);
    let current = content;

    while (current && current !== scene) {
      bottom += current.offsetTop;
      current = current.offsetParent;
    }

    return current === scene ? bottom : null;
  };

  const deepFreeze = value => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
    Object.values(value).forEach(deepFreeze);
    return Object.freeze(value);
  };

  const rectFromEdges = (left, top, right, bottom) => ({
    left,
    top,
    right,
    bottom,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  });

  const intersectRect = (rect, clip) => {
    const left = Math.min(clip.right, Math.max(clip.left, rect.left));
    const top = Math.min(clip.bottom, Math.max(clip.top, rect.top));
    const right = Math.max(left, Math.min(clip.right, rect.right));
    const bottom = Math.max(top, Math.min(clip.bottom, rect.bottom));
    return rectFromEdges(left, top, right, bottom);
  };

  const sameArtBounds = (first, second) => JSON.stringify(first) === JSON.stringify(second);

  const publishArtBounds = (layout, sceneRect, artRect, mask = null) => {
    const art = rectFromEdges(
      artRect.left - sceneRect.left,
      artRect.top - sceneRect.top,
      artRect.right - sceneRect.left,
      artRect.bottom - sceneRect.top,
    );
    const scene = rectFromEdges(0, 0, sceneRect.width, sceneRect.height);
    let fullVisible = intersectRect(art, scene);
    let feather = null;

    if (mask) {
      const horizontal = mask.axis === "x";
      const featherStart = Math.min(mask.cut, mask.reveal);
      const featherEnd = Math.max(mask.cut, mask.reveal);
      const featherBounds = horizontal
        ? rectFromEdges(
            art.left + featherStart,
            art.top,
            art.left + featherEnd,
            art.bottom,
          )
        : rectFromEdges(
            art.left,
            art.top + featherStart,
            art.right,
            art.top + featherEnd,
          );
      const visibleBounds = mask.revealSide === "right"
        ? rectFromEdges(art.left + mask.reveal, art.top, art.right, art.bottom)
        : mask.revealSide === "left"
          ? rectFromEdges(art.left, art.top, art.left + mask.reveal, art.bottom)
          : mask.revealSide === "bottom"
            ? rectFromEdges(art.left, art.top + mask.reveal, art.right, art.bottom)
            : rectFromEdges(art.left, art.top, art.right, art.top + mask.reveal);
      const visibleInScene = intersectRect(visibleBounds, scene);
      const featherInScene = intersectRect(featherBounds, scene);

      fullVisible = visibleInScene;
      feather = {
        axis: mask.axis,
        start: horizontal ? featherInScene.left : featherInScene.top,
        end: horizontal ? featherInScene.right : featherInScene.bottom,
        ...featherInScene,
      };
    }

    const record = deepFreeze({
      version: 1,
      coordinateSpace: "scene-css-px",
      masked: Boolean(mask),
      revealSide: mask?.revealSide ?? null,
      art,
      fullVisible,
      feather,
    });
    const previous = artBounds.get(layout.scene) || artBounds.get(layout.art);
    if (previous && sameArtBounds(previous, record)) {
      artBounds.set(layout.scene, previous);
      artBounds.set(layout.art, previous);
      return;
    }

    artBounds.set(layout.scene, record);
    artBounds.set(layout.art, record);
    artBoundsChanged = true;
  };

  const clearArtMask = (layout, sceneRect, artRect) => {
    layout.art.dataset.okSafeArt = "idle";
    delete layout.art.dataset.okSafeReveal;
    layout.art.style.removeProperty("--ok-safe-mask-image");
    publishArtBounds(layout, sceneRect, artRect);
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

  const clearLayout = layout => {
    delete layout.scene.dataset.okSafeCurtain;
    delete layout.scene.dataset.okSafeMobileHero;
    delete layout.scene.dataset.okSafeCompactFit;
    layout.scene.style.removeProperty("--ok-safe-curtain-mask");
    layout.scene.style.removeProperty("--ok-safe-required-height");
    layout.scene.querySelectorAll("[data-ok-safe-content]").forEach(content => {
      restoreScrollRegion(content);
      delete content.dataset.okSafeContent;
    });
    clearArtMask(
      layout,
      layout.scene.getBoundingClientRect(),
      layout.art.getBoundingClientRect(),
    );
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
    restoreScrollRegion(content);
    delete layout.scene.dataset.okSafeCurtain;
    delete layout.scene.dataset.okSafeMobileHero;
    delete layout.scene.dataset.okSafeCompactFit;
    layout.scene.style.removeProperty("--ok-safe-curtain-mask");

    /*
     * Measure grow-mode scenes from the current viewport, never from the
     * height published by a previous viewport. Otherwise a wide/8K window can
     * become the next portrait window's input and make the hero permanently
     * taller after resize. Genuine text overflow is recalculated below and
     * published again in the same frame.
     */
    if (layout.mode === "grow") {
      layout.scene.style.removeProperty("--ok-safe-required-height");
    }

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
    if (!sceneRect.width || !sceneRect.height || !artRect.width || !artRect.height) {
      clearArtMask(layout, sceneRect, artRect);
      return;
    }

    /* Match CSS media queries to the layout viewport. WebKit may update a
     * picture source before visualViewport settles after desktop resize. */
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tallPortrait = viewportHeight > 760
      && viewportHeight > viewportWidth * 1.35;
    const compact = viewportWidth <= 1180
      || viewportHeight <= 760
      || tallPortrait
      || contentRect.width >= sceneRect.width * .5;

    const gap = Math.max(20, Math.min(56, sceneRect.width * .03));
    const offsetBottom = contentBottomWithin(content, layout.scene);
    let requiredHeight = Math.ceil(
      (offsetBottom ?? contentRect.bottom - sceneRect.top) + gap,
    );

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
    if (compactHome) {
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
      clearArtMask(layout, sceneRect, artRect);
      return;
    }

    /*
     * The wide/short composition already owns its art crop. Growing the hero
     * to reserve a second, empty art band creates a visible gap before the
     * next section (most noticeably in Safari on short Mac viewports).
     */
    if (isHome && !layout.scene.classList.contains("is-focused")) {
      requiredHeight = Math.max(viewportHeight, requiredHeight);
      layout.scene.style.setProperty("--ok-safe-required-height", `${requiredHeight}px`);
      clearArtMask(layout, sceneRect, artRect);
      return;
    }

    if (layout.scene.classList.contains("is-focused")) {
      delete layout.scene.dataset.okSafeCurtain;
      layout.scene.style.removeProperty("--ok-safe-curtain-mask");
      layout.scene.style.setProperty("--ok-safe-required-height", `${requiredHeight}px`);
      clearArtMask(layout, sceneRect, artRect);
      return;
    }

    const artMaskMode = layout.scene.dataset.okSafeMask || "auto";
    const forceArtMask = artMaskMode === "always";
    const suppressArtMask = artMaskMode === "never";

    if (suppressArtMask || (!compact && !forceArtMask && !isHome)) {
      if (layout.mode === "grow") {
        layout.scene.style.setProperty("--ok-safe-required-height", `${requiredHeight}px`);
      } else {
        layout.scene.style.removeProperty("--ok-safe-required-height");
      }
      clearArtMask(layout, sceneRect, artRect);
      return;
    }

    if (layout.mode === "grow") {
      layout.scene.style.setProperty("--ok-safe-required-height", `${requiredHeight}px`);
    } else {
      layout.scene.style.removeProperty("--ok-safe-required-height");
    }

    const clamp = (value, maximum) => Math.max(0, Math.min(maximum, value));
    const spaces = {
      left: Math.max(0, contentRect.left - artRect.left),
      right: Math.max(0, artRect.right - contentRect.right),
      top: Math.max(0, contentRect.top - artRect.top),
      bottom: Math.max(0, artRect.bottom - contentRect.bottom),
    };
    const allowedSides = ["left", "right", "top", "bottom"];
    const revealSide = allowedSides.reduce(
      (best, side) => spaces[side] > spaces[best] ? side : best,
      allowedSides[0],
    );
    const horizontalFeather = Math.max(96, Math.min(240, artRect.width * .18));
    const verticalFeather = Math.max(96, Math.min(240, artRect.height * .18));
    let maskImage = "";
    let cut = 0;
    let reveal = 0;
    let axis = "x";

    if (revealSide === "right") {
      cut = clamp(contentRect.right - artRect.left + gap * .35, artRect.width);
      reveal = clamp(cut + horizontalFeather, artRect.width);
      maskImage = `linear-gradient(to right, transparent 0, transparent ${cut}px, #000 ${reveal}px, #000 100%)`;
    } else if (revealSide === "left") {
      cut = clamp(contentRect.left - artRect.left - gap * .35, artRect.width);
      reveal = clamp(cut - horizontalFeather, artRect.width);
      maskImage = `linear-gradient(to right, #000 0, #000 ${reveal}px, transparent ${cut}px, transparent 100%)`;
    } else if (revealSide === "bottom") {
      axis = "y";
      cut = clamp(contentRect.bottom - artRect.top + gap * .35, artRect.height);
      reveal = clamp(cut + verticalFeather, artRect.height);
      maskImage = `linear-gradient(to bottom, transparent 0, transparent ${cut}px, #000 ${reveal}px, #000 100%)`;
    } else {
      axis = "y";
      cut = clamp(contentRect.top - artRect.top - gap * .35, artRect.height);
      reveal = clamp(cut - verticalFeather, artRect.height);
      maskImage = `linear-gradient(to bottom, #000 0, #000 ${reveal}px, transparent ${cut}px, transparent 100%)`;
    }

    layout.art.style.setProperty("--ok-safe-mask-image", maskImage);
    layout.art.dataset.okSafeReveal = revealSide;
    layout.art.dataset.okSafeArt = "active";
    publishArtBounds(layout, sceneRect, artRect, {
      axis,
      cut,
      reveal,
      revealSide,
    });
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
    publishViewportTypeScale();
    artBoundsChanged = false;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tallPortrait = viewportHeight > 760
      && viewportHeight > viewportWidth * 1.35;
    root.toggleAttribute("data-ok-tall-portrait", tallPortrait);
    layouts.forEach(measureLayout);
    measureCards();
    if (artBoundsChanged) {
      window.dispatchEvent(new CustomEvent("okagency:art-safety-change", {
        detail: { version: 1 },
      }));
    }
  };

  const schedule = () => {
    if (frame) {
      needsRemeasure = true;
      return;
    }
    frame = requestAnimationFrame(() => {
      measure();
      if (needsRemeasure) {
        needsRemeasure = false;
        schedule();
      }
    });
  };

  const scheduleViewportMeasure = () => {
    /* Drop the previous viewport's grow-height before the next paint. */
    publishViewportTypeScale();
    layouts.forEach(layout => {
      if (layout.mode === "grow") {
        layout.scene.style.removeProperty("--ok-safe-required-height");
      }
    });
    schedule();
  };

  discover();
  publishViewportTypeScale();

  if ("ResizeObserver" in window) {
    /* Content-driven resize notifications must not clear a grow scene's
     * published height. Doing so creates a shrink/grow feedback loop. Only
     * real viewport events use scheduleViewportMeasure; observed layout
     * changes request a normal measurement against the current viewport. */
    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(root);
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

  window.addEventListener("resize", scheduleViewportMeasure, { passive: true });
  window.addEventListener("orientationchange", scheduleViewportMeasure, { passive: true });
  window.visualViewport?.addEventListener("resize", scheduleViewportMeasure, { passive: true });
  window.matchMedia("(max-width: 1180px), (max-aspect-ratio: 4/3)")
    .addEventListener?.("change", scheduleViewportMeasure);
  document.fonts?.ready.then(() => requestAnimationFrame(schedule));
  schedule();

  window.OKAgencyResponsiveSafety = Object.freeze({
    getHomeHeroLayout,
    getArtBounds: sceneOrArt => artBounds.get(sceneOrArt) || null,
    refresh: schedule,
    snapshot: () => ({
      tallPortrait: root.hasAttribute("data-ok-tall-portrait"),
      shieldedArt: document.querySelectorAll('[data-ok-safe-art="active"]').length,
      scrollRegions: document.querySelectorAll('[data-ok-safe-scroll="true"]').length,
      stackedCards: Boolean(document.querySelector('[data-ok-safe-cards="stacked"]')),
    }),
  });
})();
