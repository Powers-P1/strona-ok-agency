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
  let sceneAnchorFrame = 0;
  let currentSceneAnchor = null;
  let pendingSceneAnchor = null;
  let viewportSize = { width: window.innerWidth, height: window.innerHeight };

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
    const elements = [...content.querySelectorAll(
      "h1,h2,h3,p,button,a,li,summary,label,input,select,textarea",
    )].filter(rendered);
    const bounds = {
      top: Number.POSITIVE_INFINITY,
      right: Number.NEGATIVE_INFINITY,
      bottom: Number.NEGATIVE_INFINITY,
      left: Number.POSITIVE_INFINITY,
    };
    const includeRect = rect => {
      if (!rect?.width || !rect?.height) return;
      bounds.top = Math.min(bounds.top, rect.top);
      bounds.right = Math.max(bounds.right, rect.right);
      bounds.bottom = Math.max(bounds.bottom, rect.bottom);
      bounds.left = Math.min(bounds.left, rect.left);
    };

    elements.forEach(element => {
      if (element.matches("input,select,textarea")) {
        includeRect(element.getBoundingClientRect());
        return;
      }

      const range = document.createRange();
      range.selectNodeContents(element);
      const textRects = [...range.getClientRects()].filter(rect => rect.width && rect.height);
      if (textRects.length) {
        textRects.forEach(includeRect);
      } else {
        includeRect(element.getBoundingClientRect());
      }
      range.detach?.();
    });

    return Number.isFinite(bounds.top) ? bounds : stableContentRect(content);
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
    const fullVisible = intersectRect(art, scene);
    let protectedRect = null;
    let feather = null;

    if (mask) {
      const withinScene = localRect => intersectRect(rectFromEdges(
        art.left + localRect.left,
        art.top + localRect.top,
        art.left + localRect.right,
        art.top + localRect.bottom,
      ), scene);
      protectedRect = withinScene(mask.protected);
      feather = withinScene(mask.feather);
    }

    const record = deepFreeze({
      version: 2,
      coordinateSpace: "scene-css-px",
      masked: Boolean(mask),
      maskShape: mask?.shape ?? null,
      revealSide: null,
      art,
      fullVisible,
      protected: protectedRect,
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
    delete layout.art.dataset.okSafeShape;
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
    const suppressArtMask = artMaskMode === "never";
    const maskableScene = layout.mode === "scene";

    if (suppressArtMask || !maskableScene) {
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

    const hardMargin = Math.max(18, Math.min(64, Math.min(sceneRect.width, sceneRect.height) * .025));
    const featherSize = Math.max(48, Math.min(144, Math.min(sceneRect.width, sceneRect.height) * .08));
    const clampX = value => Math.max(0, Math.min(artRect.width, value));
    const clampY = value => Math.max(0, Math.min(artRect.height, value));
    const protectedRect = rectFromEdges(
      clampX(contentRect.left - artRect.left - hardMargin),
      clampY(contentRect.top - artRect.top - hardMargin),
      clampX(contentRect.right - artRect.left + hardMargin),
      clampY(contentRect.bottom - artRect.top + hardMargin),
    );
    const featherRect = rectFromEdges(
      clampX(protectedRect.left - featherSize),
      clampY(protectedRect.top - featherSize),
      clampX(protectedRect.right + featherSize),
      clampY(protectedRect.bottom + featherSize),
    );
    const fixed = value => (Math.round(value * 100) / 100).toString();
    const svgMask = [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fixed(artRect.width)} ${fixed(artRect.height)}">`,
      `<defs><filter id="blur" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">`,
      `<feGaussianBlur stdDeviation="${fixed(featherSize * .42)}"/></filter>`,
      `<mask id="safe" maskUnits="userSpaceOnUse" x="0" y="0" width="${fixed(artRect.width)}" height="${fixed(artRect.height)}" mask-type="luminance">`,
      `<rect width="100%" height="100%" fill="white"/>`,
      `<rect x="${fixed(protectedRect.left)}" y="${fixed(protectedRect.top)}" width="${fixed(protectedRect.width)}" height="${fixed(protectedRect.height)}" fill="black" filter="url(#blur)"/>`,
      `<rect x="${fixed(protectedRect.left)}" y="${fixed(protectedRect.top)}" width="${fixed(protectedRect.width)}" height="${fixed(protectedRect.height)}" fill="black"/>`,
      `</mask></defs><rect width="100%" height="100%" fill="white" mask="url(#safe)"/></svg>`,
    ].join("");
    const maskImage = `url("data:image/svg+xml,${encodeURIComponent(svgMask)}")`;

    layout.art.style.setProperty("--ok-safe-mask-image", maskImage);
    delete layout.art.dataset.okSafeReveal;
    layout.art.dataset.okSafeShape = "local-hole";
    layout.art.dataset.okSafeArt = "active";
    publishArtBounds(layout, sceneRect, artRect, {
      shape: "local-hole",
      protected: protectedRect,
      feather: featherRect,
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

  const sceneElements = () => [...new Set(
    layouts.filter(layout => layout.mode === "scene").map(layout => layout.scene),
  )];

  const captureSceneAnchor = () => {
    if (window.innerWidth <= 640) {
      currentSceneAnchor = null;
      return null;
    }
    const scenes = sceneElements();
    if (!scenes.length) return null;
    const candidates = scenes.map(scene => ({ scene, rect: scene.getBoundingClientRect() }));
    const active = candidates.find(({ rect }) => rect.top <= 0 && rect.bottom > 0)
      || candidates.reduce((closest, candidate) => {
        const distance = Math.abs(candidate.rect.top);
        return distance < closest.distance ? { ...candidate, distance } : closest;
      }, { ...candidates[0], distance: Number.POSITIVE_INFINITY });
    if (!active?.rect.height) return null;
    currentSceneAnchor = {
      scene: active.scene,
      offset: Math.max(0, Math.min(1, -active.rect.top / active.rect.height)),
    };
    return currentSceneAnchor;
  };

  const scheduleSceneAnchorCapture = () => {
    if (pendingSceneAnchor || sceneAnchorFrame) return;
    sceneAnchorFrame = requestAnimationFrame(() => {
      sceneAnchorFrame = 0;
      captureSceneAnchor();
    });
  };

  const cancelPendingSceneAnchor = () => {
    if (!pendingSceneAnchor) return;
    pendingSceneAnchor = null;
    captureSceneAnchor();
  };

  const sceneAnchorScrollKeys = new Set([
    "ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " ",
  ]);

  const cancelPendingSceneAnchorFromKey = event => {
    if (event.defaultPrevented) return;
    const target = event.target;
    if (target instanceof HTMLElement && (
      target.isContentEditable
      || /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)
    )) return;
    if (!sceneAnchorScrollKeys.has(event.key)) return;
    cancelPendingSceneAnchor();
  };

  const restoreSceneAnchor = () => {
    const anchor = pendingSceneAnchor;
    pendingSceneAnchor = null;
    if (!anchor?.scene?.isConnected || window.innerWidth <= 640) {
      captureSceneAnchor();
      return;
    }
    const rect = anchor.scene.getBoundingClientRect();
    const target = window.scrollY + rect.top + rect.height * anchor.offset;
    const scrollHost = document.scrollingElement;
    if (scrollHost && Number.isFinite(target)) scrollHost.scrollTop = Math.round(target);
    captureSceneAnchor();
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
        detail: { version: 2 },
      }));
    }
    if (pendingSceneAnchor) restoreSceneAnchor();
    else captureSceneAnchor();
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
    const nextViewport = { width: window.innerWidth, height: window.innerHeight };
    const viewportChanged = nextViewport.width !== viewportSize.width
      || nextViewport.height !== viewportSize.height;
    if (
      viewportChanged
      && viewportSize.width > 640
      && nextViewport.width > 640
      && !pendingSceneAnchor
    ) {
      pendingSceneAnchor = currentSceneAnchor || captureSceneAnchor();
    }
    viewportSize = nextViewport;
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
  window.addEventListener("scroll", scheduleSceneAnchorCapture, { passive: true });
  window.addEventListener("wheel", cancelPendingSceneAnchor, { passive: true });
  window.addEventListener("touchstart", cancelPendingSceneAnchor, { passive: true });
  window.addEventListener("keydown", cancelPendingSceneAnchorFromKey);
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
      anchoredScene: currentSceneAnchor?.scene?.id || null,
    }),
  });
})();
