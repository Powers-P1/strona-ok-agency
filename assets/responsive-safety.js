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
  const backdropSources = Object.freeze({
    light: "assets/editorial-atelier-backdrop-v2-1672.webp",
    dark: "assets/editorial-atelier-backdrop-dark-v1.webp",
  });
  const placementMapCache = new Map();

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

  const createBackdrop = art => {
    const tone = art.dataset.okSafeBackdrop;
    const source = backdropSources[tone];
    if (!source) return null;

    const backdrop = art.cloneNode(false);
    [
      "id",
      "src",
      "srcset",
      "sizes",
      "fetchpriority",
      "data-placement-mask",
      "data-placement-energy",
      "data-ok-safe-art",
      "data-ok-safe-backdrop",
    ].forEach(attribute => backdrop.removeAttribute(attribute));
    backdrop.classList.remove("campaign-art", "scene-art");
    backdrop.classList.add("ok-safe-art-backdrop");
    backdrop.dataset.okSafeBackdropKind = art.classList.contains("scene-art") ? "scene" : "campaign";
    backdrop.dataset.okSafeBackdropLayer = tone;
    backdrop.alt = "";
    backdrop.setAttribute("aria-hidden", "true");
    backdrop.setAttribute("role", "presentation");
    backdrop.decoding = "async";
    backdrop.loading = "eager";
    art.after(backdrop);

    const markReady = () => {
      if (!backdrop.naturalWidth) return;
      backdrop.dataset.okSafeBackdropReady = "true";
      schedule();
    };
    backdrop.addEventListener("load", markReady, { once: true });
    backdrop.addEventListener("error", schedule, { once: true });

    backdrop.src = new URL(source, document.baseURI).href;
    return backdrop;
  };

  const syncBackdropGeometry = layout => {
    if (!layout.backdrop) return;
    const style = getComputedStyle(layout.art);
    layout.backdrop.style.objectPosition = style.objectPosition;
    layout.backdrop.style.transform = style.transform;
    layout.backdrop.style.transformOrigin = style.transformOrigin;
  };

  const buildPlacementMap = source => {
    if (!source) return Promise.resolve(null);
    const url = new URL(source, document.baseURI).href;
    if (placementMapCache.has(url)) return placementMapCache.get(url);

    const pending = new Promise(resolve => {
      const image = new Image();
      image.decoding = "async";
      image.src = url;
      image.addEventListener("load", () => {
        const columns = Math.max(1, Math.ceil(image.naturalWidth / 8));
        const rows = Math.max(1, Math.ceil(image.naturalHeight / 8));
        const canvas = document.createElement("canvas");
        canvas.width = columns;
        canvas.height = rows;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) {
          resolve(null);
          return;
        }
        context.drawImage(image, 0, 0, columns, rows);
        const pixels = context.getImageData(0, 0, columns, rows).data;
        const stride = columns + 1;
        const integral = new Uint32Array(stride * (rows + 1));

        for (let y = 0; y < rows; y += 1) {
          let rowSum = 0;
          for (let x = 0; x < columns; x += 1) {
            rowSum += pixels[(y * columns + x) * 4] >= 4 ? 1 : 0;
            integral[(y + 1) * stride + x + 1] = integral[y * stride + x + 1] + rowSum;
          }
        }

        resolve(Object.freeze({
          width: image.naturalWidth,
          height: image.naturalHeight,
          columns,
          rows,
          integral,
        }));
      }, { once: true });
      image.addEventListener("error", () => resolve(null), { once: true });
    });
    placementMapCache.set(url, pending);
    return pending;
  };

  const addLayout = (scene, contentSelector, artSelector, mode = "scene") => {
    if (!scene) return;
    const art = scene.querySelector(artSelector);
    if (!art) return;

    scene.dataset.okSafeScene = "";
    art.dataset.okSafeArt = "idle";
    const layout = {
      scene,
      contentSelector,
      art,
      backdrop: createBackdrop(art),
      placementMap: null,
      mode,
    };
    layouts.push(layout);
    buildPlacementMap(art.dataset.placementMask).then(map => {
      layout.placementMap = map;
      schedule();
    });
    observed.add(scene);
    observed.add(art);
  };

  const visualContentGeometry = content => {
    const rects = [];
    const bounds = {
      top: Number.POSITIVE_INFINITY,
      right: Number.NEGATIVE_INFINITY,
      bottom: Number.NEGATIVE_INFINITY,
      left: Number.POSITIVE_INFINITY,
    };
    const includeRect = rect => {
      if (!rect?.width || !rect?.height) return;
      rects.push({
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
      bounds.top = Math.min(bounds.top, rect.top);
      bounds.right = Math.max(bounds.right, rect.right);
      bounds.bottom = Math.max(bounds.bottom, rect.bottom);
      bounds.left = Math.min(bounds.left, rect.left);
    };

    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    let textNode = walker.nextNode();
    while (textNode) {
      const element = textNode.parentElement;
      if (textNode.textContent.trim() && rendered(element)) {
        const range = document.createRange();
        range.selectNodeContents(textNode);
        [...range.getClientRects()].forEach(includeRect);
        range.detach?.();
      }
      textNode = walker.nextNode();
    }

    [...content.querySelectorAll("input,select,textarea")].filter(rendered).forEach(element => {
      includeRect(element.getBoundingClientRect());
    });

    if (Number.isFinite(bounds.top)) return { bounds, rects };
    const fallback = stableContentRect(content);
    return { bounds: fallback, rects: [fallback] };
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

  const objectPositionPart = (value, axis) => {
    const parts = String(value || "").trim().split(/\s+/);
    const token = parts[axis] || parts[0] || "50%";
    const keywords = {
      left: 0,
      top: 0,
      center: .5,
      right: 1,
      bottom: 1,
    };
    if (token in keywords) return keywords[token];
    const percentage = token.match(/^(-?\d+(?:\.\d+)?)%$/);
    return percentage ? Number(percentage[1]) / 100 : .5;
  };

  const placementIntersects = (layout, contentRect, padding) => {
    const map = layout.placementMap;
    if (!map) return null;

    const artRect = layout.art.getBoundingClientRect();
    if (!artRect.width || !artRect.height) return false;
    const style = getComputedStyle(layout.art);
    const scale = style.objectFit === "contain"
      ? Math.min(artRect.width / map.width, artRect.height / map.height)
      : style.objectFit === "fill"
        ? null
        : Math.max(artRect.width / map.width, artRect.height / map.height);
    const renderedWidth = scale === null ? artRect.width : map.width * scale;
    const renderedHeight = scale === null ? artRect.height : map.height * scale;
    const scaleX = renderedWidth / map.width;
    const scaleY = renderedHeight / map.height;
    const offsetX = (artRect.width - renderedWidth) * objectPositionPart(style.objectPosition, 0);
    const offsetY = (artRect.height - renderedHeight) * objectPositionPart(style.objectPosition, 1);
    const naturalLeft = (contentRect.left - padding - artRect.left - offsetX) / scaleX;
    const naturalTop = (contentRect.top - padding - artRect.top - offsetY) / scaleY;
    const naturalRight = (contentRect.right + padding - artRect.left - offsetX) / scaleX;
    const naturalBottom = (contentRect.bottom + padding - artRect.top - offsetY) / scaleY;
    const left = Math.max(0, Math.min(map.columns, Math.floor(naturalLeft / map.width * map.columns)));
    const top = Math.max(0, Math.min(map.rows, Math.floor(naturalTop / map.height * map.rows)));
    const right = Math.max(left, Math.min(map.columns, Math.ceil(naturalRight / map.width * map.columns)));
    const bottom = Math.max(top, Math.min(map.rows, Math.ceil(naturalBottom / map.height * map.rows)));
    if (right <= left || bottom <= top) return false;

    const stride = map.columns + 1;
    const occupied = map.integral[bottom * stride + right]
      - map.integral[top * stride + right]
      - map.integral[bottom * stride + left]
      + map.integral[top * stride + left];
    return occupied > 0;
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

  /*
   * PR #49 contract: the complete photographic plate fades toward the side
   * that owns the artwork. One continuous feather keeps every branch attached;
   * no per-line boxes or local holes are painted behind the copy.
   */
  const buildDirectionalFeather = ({ artRect, contentRect, gap }) => {
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
    const horizontalFeather = Math.max(96, Math.min(280, artRect.width * .18));
    const verticalFeather = Math.max(84, Math.min(240, artRect.height * .15));
    let image = "";
    let cut = 0;
    let reveal = 0;
    let axis = "x";

    if (revealSide === "right") {
      cut = clamp(contentRect.right - artRect.left + gap * .35, artRect.width);
      reveal = clamp(cut + horizontalFeather, artRect.width);
      image = `linear-gradient(to right, transparent 0, transparent ${cut}px, #000 ${reveal}px, #000 100%)`;
    } else if (revealSide === "left") {
      cut = clamp(contentRect.left - artRect.left - gap * .35, artRect.width);
      reveal = clamp(cut - horizontalFeather, artRect.width);
      image = `linear-gradient(to right, #000 0, #000 ${reveal}px, transparent ${cut}px, transparent 100%)`;
    } else if (revealSide === "bottom") {
      axis = "y";
      cut = clamp(contentRect.bottom - artRect.top + gap * .35, artRect.height);
      reveal = clamp(cut + verticalFeather, artRect.height);
      image = `linear-gradient(to bottom, transparent 0, transparent ${cut}px, #000 ${reveal}px, #000 100%)`;
    } else {
      axis = "y";
      cut = clamp(contentRect.top - artRect.top - gap * .35, artRect.height);
      reveal = clamp(cut - verticalFeather, artRect.height);
      image = `linear-gradient(to bottom, #000 0, #000 ${reveal}px, transparent ${cut}px, transparent 100%)`;
    }

    return Object.freeze({
      image,
      shape: "directional-feather",
      axis,
      cut,
      reveal,
      revealSide,
    });
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
    let protectedArea = null;
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

      fullVisible = intersectRect(visibleBounds, scene);
      feather = intersectRect(featherBounds, scene);
    }

    const record = deepFreeze({
      version: 2,
      coordinateSpace: "scene-css-px",
      masked: Boolean(mask),
      maskShape: mask?.shape ?? (mask ? "directional-feather" : null),
      revealSide: mask?.revealSide ?? null,
      art,
      fullVisible,
      protected: protectedArea,
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
    syncBackdropGeometry(layout);
    const artRect = layout.art.getBoundingClientRect();
    const contentGeometry = layout.mode === "grow" ? null : visualContentGeometry(content);
    const contentBounds = contentGeometry?.bounds ?? stableContentRect(content);
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
    const placementCollision = isHome
      ? false
      : placementIntersects(layout, contentRect, Math.max(12, gap * .35));
    const hasArtworkCollision = forceArtMask || (placementCollision ?? compact);
    const backdropReady = isHome
      || layout.backdrop?.dataset.okSafeBackdropReady === "true";

    if (suppressArtMask || !hasArtworkCollision || !backdropReady) {
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

    const directionalFeather = buildDirectionalFeather({
      artRect,
      contentRect,
      gap,
    });
    if (!directionalFeather) {
      clearArtMask(layout, sceneRect, artRect);
      return;
    }

    layout.art.style.setProperty("--ok-safe-mask-image", directionalFeather.image);
    layout.art.dataset.okSafeReveal = directionalFeather.revealSide;
    layout.art.dataset.okSafeShape = directionalFeather.shape;
    layout.art.dataset.okSafeArt = "active";
    publishArtBounds(layout, sceneRect, artRect, directionalFeather);
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
