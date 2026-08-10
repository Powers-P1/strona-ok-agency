(() => {
  "use strict";

  const frameSelector = "[data-scene-frame]";
  const seamSelector = ".scene-seam[data-scene-seam-source]";
  const boundarySourceSelector = "[data-scene-boundary-source]";
  const boundaryTargetSelector = "[data-scene-boundary-target][data-scene-continuation]";
  const lightLightAtmosphere = {
    compact: "assets/scene-transitions/scene-seam-atmosphere-light-light-legacy-cloud-compact-v2.webp",
    low: "assets/scene-transitions/scene-seam-atmosphere-light-light-legacy-cloud-low-v2.webp",
    default: "assets/scene-transitions/scene-seam-atmosphere-light-light-legacy-cloud-v2.webp",
  };
  const exclusionPaddingX = 18;
  const exclusionPaddingY = 14;
  const exclusionFeather = 24;
  const exclusionCoverageLimit = .86;
  const denseInsetX = 14;
  const denseInsetY = 10;
  const semanticContainerTags = new Set(["ARTICLE", "DIV", "DL", "FIELDSET", "FORM", "NAV", "OL", "SECTION", "UL"]);
  const switchDuration = 780;
  const seams = [];
  const switchFlows = [];
  const connectedSeams = new WeakSet();
  const observedImages = new WeakSet();
  const backdropObservers = new WeakMap();
  const exclusionMaskKeys = new WeakMap();
  let syncFrame = 0;
  let resizeObserver;

  const isContinuationBoundary = seam => (
    seam.hasAttribute("data-scene-seam-boundary")
    && !seam.classList.contains("scene-seam--switch")
  );

  const terminalFrame = endpoint => {
    if (!endpoint) return null;
    if (endpoint.matches(frameSelector)) return endpoint;
    const frames = [...endpoint.querySelectorAll(frameSelector)];
    return frames.at(-1) || endpoint;
  };

  const siblingScene = (seam, side) => {
    const property = side === "next" ? "nextElementSibling" : "previousElementSibling";
    let candidate = seam[property];
    while (candidate) {
      if (candidate.matches(frameSelector)) return candidate;
      if (side === "previous" && candidate.matches(boundarySourceSelector)) return terminalFrame(candidate);
      if (side === "next" && candidate.matches(boundaryTargetSelector)) return candidate;
      candidate = candidate[property];
    }
    return null;
  };

  const adjacentScene = seam => siblingScene(
    seam,
    seam.dataset.sceneSeamSource === "next" ? "next" : "previous",
  );

  const originalArtwork = scene => {
    if (!scene) return null;
    return scene.querySelector("[data-scene-seam-art-source]")
      || scene.querySelector(":scope > [data-scene-art]:not([data-ok-safe-backdrop-layer])")
      || scene.querySelector(":scope > picture > [data-scene-art]:not([data-ok-safe-backdrop-layer])")
      || (scene.matches(boundarySourceSelector)
        ? scene.querySelector("[data-scene-art]:not([data-ok-safe-backdrop-layer])")
        : null);
  };

  const sceneTone = frame => (
    frame?.dataset.sceneTone
    || originalArtwork(frame)?.dataset.okSafeBackdrop
    || ""
  ).trim().toLowerCase();

  const backdropSource = frame => {
    if (!frame) return "";
    const explicit = frame.dataset.sceneSeamSafeBackdropSrc?.trim();
    if (explicit) return explicit;
    const flow = frame.closest("[data-scene-flow]");
    const tone = sceneTone(frame);
    if (tone === "light") return flow?.dataset.sceneSeamLightBackdropSrc?.trim() || "";
    if (tone === "dark") return flow?.dataset.sceneSeamDarkBackdropSrc?.trim() || "";
    return "";
  };

  const syncSeamBackdrop = frame => {
    const source = backdropSource(frame);
    if (!source) return true;
    const backdrop = frame.querySelector(":scope > [data-ok-safe-backdrop-layer]");
    if (!backdrop) return false;
    const target = new URL(source, document.baseURI).href;
    if (backdrop.src !== target) backdrop.src = target;
    backdrop.dataset.seamSafeBackdropOverride = "active";
    return true;
  };

  const observeSeamBackdrop = frame => {
    if (!frame || !backdropSource(frame) || backdropObservers.has(frame) || !("MutationObserver" in window)) return;
    const observer = new MutationObserver(scheduleSync);
    observer.observe(frame, { childList: true });
    backdropObservers.set(frame, observer);
  };

  const visibleRect = element => {
    if (!element || element.hidden || element.hasAttribute("inert") || element.getAttribute("aria-hidden") === "true") return null;
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return null;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 ? rect : null;
  };

  const semanticContentRects = marker => {
    const markerRect = visibleRect(marker);
    if (!markerRect) return [];
    const direct = [...marker.children]
      .map(element => ({ element, rect: visibleRect(element) }))
      .filter(item => item.rect);
    if (!direct.length) return [markerRect];

    return direct.flatMap(panel => {
      const broadPanel = semanticContainerTags.has(panel.element.tagName)
        && panel.rect.width >= markerRect.width * .82;
      if (broadPanel) {
        const nested = [...panel.element.children]
          .map(element => visibleRect(element))
          .filter(Boolean);
        if (nested.length) return nested;
      }
      return [panel.rect];
    });
  };

  const protectedContentRects = scene => {
    if (!scene) return [];
    const frameRect = scene.getBoundingClientRect();
    return [...scene.querySelectorAll("[data-seam-safe-content]")]
      .flatMap(semanticContentRects)
      .map(rect => {
        const left = Math.max(frameRect.left, rect.left);
        const top = Math.max(frameRect.top, rect.top);
        const right = Math.min(frameRect.right, rect.right);
        const bottom = Math.min(frameRect.bottom, rect.bottom);
        return { left, top, right, bottom, width: right - left, height: bottom - top };
      })
      .filter(rect => rect.width > 0 && rect.height >= 12);
  };

  const rounded = value => Math.round(value * 100) / 100;

  const rectangleUnionArea = rectangles => {
    const edges = [...new Set(rectangles.flatMap(rectangle => [
      rectangle.x,
      rectangle.x + rectangle.width,
    ]))].sort((a, b) => a - b);
    let area = 0;
    for (let index = 0; index < edges.length - 1; index += 1) {
      const left = edges[index];
      const right = edges[index + 1];
      if (right <= left) continue;
      const intervals = rectangles
        .filter(rectangle => rectangle.x < right && rectangle.x + rectangle.width > left)
        .map(rectangle => [rectangle.y, rectangle.y + rectangle.height])
        .sort((a, b) => a[0] - b[0]);
      let coveredHeight = 0;
      let start = -1;
      let end = -1;
      intervals.forEach(interval => {
        if (start < 0) [start, end] = interval;
        else if (interval[0] <= end) end = Math.max(end, interval[1]);
        else {
          coveredHeight += end - start;
          [start, end] = interval;
        }
      });
      if (start >= 0) coveredHeight += end - start;
      area += (right - left) * coveredHeight;
    }
    return area;
  };

  const exclusionSvg = (width, height, holes) => {
    const rectangles = holes.map(hole => (
      `<rect x="${rounded(hole.x)}" y="${rounded(hole.y)}" `
      + `width="${rounded(hole.width)}" height="${rounded(hole.height)}" `
      + `rx="${rounded(Math.min(22, hole.width / 4, hole.height / 4))}" fill="#3d3d3d"/>`
    )).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rounded(width)}" height="${rounded(height)}" viewBox="0 0 ${rounded(width)} ${rounded(height)}">`
      + `<defs><filter id="f" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${exclusionFeather}"/></filter>`
      + `<mask id="m" x="0" y="0" width="${rounded(width)}" height="${rounded(height)}" maskUnits="userSpaceOnUse">`
      + `<rect width="${rounded(width)}" height="${rounded(height)}" fill="white"/><g filter="url(#f)">${rectangles}</g></mask></defs>`
      + `<rect width="${rounded(width)}" height="${rounded(height)}" fill="white" mask="url(#m)"/></svg>`;
    return `url("data:image/svg+xml;base64,${window.btoa(svg)}")`;
  };

  const clearExclusionMask = (seam, field) => {
    field.style.removeProperty("--scene-seam-safe-exclusion-mask");
    exclusionMaskKeys.delete(field);
    seam.dataset.sceneSeamExclusion = "none";
    seam.dataset.sceneSeamDepth = String(Math.round(field.getBoundingClientRect().height));
  };

  const syncSeamReserve = (seam, field, previous, next) => {
    const overlapsRealScenes = seam.dataset.sceneSeamMaterial === "asset"
      || (
        isContinuationBoundary(seam)
        && previous?.matches(frameSelector)
        && next?.matches(frameSelector)
      );
    if (!isContinuationBoundary(seam) || overlapsRealScenes) {
      /* Asset continuations and fullscreen boundaries overlap the real
         surfaces on both sides instead of adding empty document space. */
      seam.style.removeProperty("--scene-seam-reserve");
      seam.dataset.sceneSeamReserve = "0";
      return;
    }

    /* A document-flow continuation needs room for the diffuse edge before its
       natural-height content starts. This remains a layout contract, not a
       route-specific offset. */
    const fieldHeight = field.getBoundingClientRect().height;
    const reserve = Math.ceil(Math.max(0, Math.min(fieldHeight * .66, window.innerHeight * .2)) / 2) * 2;
    const current = Number.parseFloat(
      getComputedStyle(seam).getPropertyValue("--scene-seam-reserve"),
    ) || 0;
    if (Math.abs(current - reserve) >= 1) {
      seam.style.setProperty("--scene-seam-reserve", `${reserve}px`);
    }
    seam.dataset.sceneSeamReserve = String(reserve);
  };

  const syncExclusionMask = (seam, field) => {
    const fieldRect = field.getBoundingClientRect();
    const previous = siblingScene(seam, "previous");
    const next = siblingScene(seam, "next");

    if (!fieldRect.width || !fieldRect.height || !previous || !next) {
      clearExclusionMask(seam, field);
      return;
    }

    const holes = [...protectedContentRects(previous), ...protectedContentRects(next)]
      .map(rect => {
        const left = Math.max(0, rect.left - fieldRect.left - exclusionPaddingX);
        const top = Math.max(0, rect.top - fieldRect.top - exclusionPaddingY);
        const right = Math.min(fieldRect.width, rect.right - fieldRect.left + exclusionPaddingX);
        const bottom = Math.min(fieldRect.height, rect.bottom - fieldRect.top + exclusionPaddingY);
        return { x: left, y: top, width: right - left, height: bottom - top };
      })
      .filter(rect => rect.width > 0 && rect.height > 0);

    if (!holes.length) {
      clearExclusionMask(seam, field);
      return;
    }

    const fieldArea = fieldRect.width * fieldRect.height;
    const coveredArea = rectangleUnionArea(holes);
    const denselyCovered = holes.some(hole => (
      hole.width >= fieldRect.width * .94 && hole.height >= fieldRect.height * .88
    )) || coveredArea >= fieldArea * exclusionCoverageLimit;
    const maskHoles = denselyCovered
      ? holes.map(hole => ({
        x: hole.x + denseInsetX,
        y: hole.y + denseInsetY,
        width: Math.max(1, hole.width - (denseInsetX * 2)),
        height: Math.max(1, hole.height - (denseInsetY * 2)),
      }))
      : holes;

    const key = `${Math.round(fieldRect.width)}x${Math.round(fieldRect.height)}:`
      + maskHoles.map(hole => [hole.x, hole.y, hole.width, hole.height].map(Math.round).join(",")).join(";");
    if (exclusionMaskKeys.get(field) !== key) {
      field.style.setProperty("--scene-seam-safe-exclusion-mask", exclusionSvg(fieldRect.width, fieldRect.height, maskHoles));
      exclusionMaskKeys.set(field, key);
    }
    seam.dataset.sceneSeamExclusion = denselyCovered ? "dense" : "masked";
    seam.dataset.sceneSeamDepth = String(Math.round(fieldRect.height));
  };

  const positionFraction = (token, axis) => {
    const value = String(token || "").toLowerCase();
    if (value === "left" || value === "top") return 0;
    if (value === "right" || value === "bottom") return 1;
    if (value === "center") return .5;
    const percentage = value.match(/^(-?\d+(?:\.\d+)?)%$/);
    if (percentage) return Number(percentage[1]) / 100;
    return axis === "x" ? .5 : .5;
  };

  const objectPosition = value => {
    const tokens = String(value || "50% 50%").trim().split(/\s+/);
    if (tokens.length === 1) {
      const vertical = /^(top|bottom)$/i.test(tokens[0]);
      return vertical
        ? { x: .5, y: positionFraction(tokens[0], "y") }
        : { x: positionFraction(tokens[0], "x"), y: .5 };
    }
    return { x: positionFraction(tokens[0], "x"), y: positionFraction(tokens[1], "y") };
  };

  const fittedArtwork = (source, field) => {
    const fieldRect = field.getBoundingClientRect();
    const sourceRect = source.getBoundingClientRect();
    const style = getComputedStyle(source);
    const naturalWidth = source.naturalWidth || sourceRect.width;
    const naturalHeight = source.naturalHeight || sourceRect.height;
    const fit = style.objectFit || "fill";
    const position = objectPosition(style.objectPosition);
    let renderedWidth = sourceRect.width;
    let renderedHeight = sourceRect.height;

    if (naturalWidth && naturalHeight && fit !== "fill") {
      const cover = Math.max(sourceRect.width / naturalWidth, sourceRect.height / naturalHeight);
      const contain = Math.min(sourceRect.width / naturalWidth, sourceRect.height / naturalHeight);
      let scale = fit === "contain" ? contain : cover;
      if (fit === "none") scale = 1;
      if (fit === "scale-down") scale = Math.min(1, contain);
      renderedWidth = naturalWidth * scale;
      renderedHeight = naturalHeight * scale;
    }

    return {
      fit,
      objectPosition: style.objectPosition || "50% 50%",
      renderedWidth,
      left: sourceRect.left - fieldRect.left + ((sourceRect.width - renderedWidth) * position.x),
    };
  };

  const syncSeam = seam => {
    const field = seam.querySelector(":scope > .scene-seam__field");
    const scene = adjacentScene(seam);
    syncSeamBackdrop(scene);
    const source = originalArtwork(scene);
    const atmosphere = seam.querySelector(".scene-seam__atmosphere img");
    if (!field || !atmosphere) return;

    const previous = siblingScene(seam, "previous");
    const next = siblingScene(seam, "next");
    syncSeamReserve(seam, field, previous, next);
    syncExclusionMask(seam, field);
    if (!source) {
      seam.dataset.sceneSeamResolvedSource = "atmosphere";
      return;
    }

    const geometry = fittedArtwork(source, field);
    const extensionRatio = atmosphere.naturalWidth && atmosphere.naturalHeight
      ? atmosphere.naturalHeight / atmosphere.naturalWidth
      : 376 / 1672;
    const extensionHeight = Math.max(field.getBoundingClientRect().height, geometry.renderedWidth * extensionRatio);

    field.style.setProperty("--scene-seam-source-left", `${geometry.left}px`);
    field.style.setProperty("--scene-seam-source-width", `${geometry.renderedWidth}px`);
    field.style.setProperty("--scene-seam-source-height", `${extensionHeight}px`);
    field.style.setProperty("--scene-seam-source-object-fit", geometry.fit);
    field.style.setProperty("--scene-seam-source-object-position", geometry.objectPosition);
    seam.dataset.sceneSeamResolvedSource = seam.dataset.sceneSeamSource;
  };

  const scheduleSync = () => {
    if (syncFrame) return;
    syncFrame = requestAnimationFrame(() => {
      syncFrame = 0;
      seams.forEach(syncSeam);
      document.querySelectorAll(frameSelector).forEach(syncSeamBackdrop);
    });
  };

  const connectSeam = seam => {
    if (connectedSeams.has(seam)) return;
    connectedSeams.add(seam);
    seams.push(seam);
    const previous = siblingScene(seam, "previous");
    const next = siblingScene(seam, "next");
    const owner = adjacentScene(seam);
    observeSeamBackdrop(owner);
    const images = [...new Set([
      originalArtwork(owner),
      originalArtwork(previous),
      originalArtwork(next),
      ...seam.querySelectorAll(".scene-seam__field img"),
    ].filter(Boolean))];
    images.forEach(image => {
      if (!observedImages.has(image)) {
        observedImages.add(image);
        image.addEventListener("load", scheduleSync);
      }
      resizeObserver?.observe(image);
    });
    [siblingScene(seam, "previous"), siblingScene(seam, "next")].forEach(scene => {
      if (!scene) return;
      resizeObserver?.observe(scene);
      scene.querySelectorAll("[data-seam-safe-content]").forEach(marker => resizeObserver?.observe(marker));
    });
    resizeObserver?.observe(seam);
  };

  const atmosphereSources = target => ({
    compact: target.dataset.sceneSeamAtmosphereCompact || lightLightAtmosphere.compact,
    low: target.dataset.sceneSeamAtmosphereLow || lightLightAtmosphere.low,
    default: target.dataset.sceneSeamAtmosphereDefault || lightLightAtmosphere.default,
  });

  const createAtmospherePicture = sources => {
    const picture = document.createElement("picture");
    picture.className = "scene-seam__atmosphere";

    const compact = document.createElement("source");
    compact.media = "(max-width: 820px)";
    compact.srcset = sources.compact;
    picture.append(compact);

    const low = document.createElement("source");
    low.media = "(min-width: 821px) and (max-height: 620px)";
    low.srcset = sources.low;
    picture.append(low);

    const image = document.createElement("img");
    image.src = sources.default;
    image.width = 1672;
    image.height = 376;
    image.alt = "";
    image.setAttribute("role", "presentation");
    image.decoding = "async";
    picture.append(image);
    return picture;
  };

  const createContinuationSeams = () => {
    document.querySelectorAll(boundaryTargetSelector).forEach(target => {
      const source = target.previousElementSibling;
      if (!source?.matches(boundarySourceSelector)) return;
      const sourceScene = terminalFrame(source);
      if (sceneTone(sourceScene) !== "light" || sceneTone(target) !== "light") return;

      const seam = document.createElement("div");
      seam.className = "scene-seam scene-seam--continuation";
      seam.dataset.sceneSeamSource = "previous";
      seam.dataset.sceneSeamFrom = "light";
      seam.dataset.sceneSeamTo = "light";
      seam.dataset.sceneSeamMaterial = "asset";
      seam.setAttribute("data-scene-seam-boundary", "");
      seam.setAttribute("aria-hidden", "true");
      const matteSource = target.dataset.sceneSeamMatte?.trim();
      if (matteSource) {
        const matteUrl = new URL(matteSource, document.baseURI).href.replaceAll('"', "%22");
        seam.style.setProperty("--scene-seam-matte", `url("${matteUrl}")`);
      }
      const field = document.createElement("span");
      field.className = "scene-seam__field";
      field.append(createAtmospherePicture(atmosphereSources(target)));
      seam.append(field);
      target.before(seam);
    });
  };

  const motionReduced = () => (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
    || window.OKAgencyMotion?.isPaused?.()
  );

  const connectSwitchFlow = flow => {
    const overlay = flow.querySelector(":scope .scene-seam--switch");
    const frames = [...flow.querySelectorAll(frameSelector)];
    if (!overlay || !frames.length) return;
    const state = {
      flow,
      overlay,
      active: frames.find(frame => frame.classList.contains("is-active")) || frames[0],
      frames,
      timer: 0,
    };
    switchFlows.push(state);
    frames.forEach(frame => {
      observeSeamBackdrop(frame);
      syncSeamBackdrop(frame);
    });
  };

  const activateSwitchSeam = next => {
    const state = switchFlows.find(item => item.flow.contains(next));
    if (!state || state.active === next) return;
    const previous = state.active;
    const previousTone = sceneTone(state.active);
    const nextTone = sceneTone(next);
    state.active = next;
    if (motionReduced() || !previousTone || !nextTone || previousTone === nextTone) return;

    clearTimeout(state.timer);
    state.frames.forEach(frame => delete frame.dataset.sceneSeamRole);
    previous.dataset.sceneSeamRole = "outgoing";
    next.dataset.sceneSeamRole = "incoming";
    state.flow.dataset.sceneSeamSwitching = "active";
    state.overlay.dataset.sceneSeamOrientation = previousTone === "dark" ? "reverse" : "normal";
    state.overlay.dataset.sceneSeamFrom = previousTone;
    state.overlay.dataset.sceneSeamTo = nextTone;
    delete state.overlay.dataset.sceneSeamState;
    void state.overlay.offsetWidth;
    state.overlay.dataset.sceneSeamState = "active";
    state.timer = setTimeout(() => {
      delete state.overlay.dataset.sceneSeamState;
      delete state.flow.dataset.sceneSeamSwitching;
      state.frames.forEach(frame => delete frame.dataset.sceneSeamRole);
    }, switchDuration);
  };

  const connect = () => {
    createContinuationSeams();
    document.querySelectorAll(seamSelector).forEach(connectSeam);
    document.querySelectorAll("[data-scene-flow=\"switch\"]").forEach(connectSwitchFlow);
    document.querySelectorAll(frameSelector).forEach(frame => {
      observeSeamBackdrop(frame);
      syncSeamBackdrop(frame);
      resizeObserver?.observe(frame);
    });
    scheduleSync();
    document.fonts?.ready.then(scheduleSync);
  };

  if ("ResizeObserver" in window) resizeObserver = new ResizeObserver(scheduleSync);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", connect, { once: true });
  else connect();

  window.addEventListener("okagency:scene-activate", event => activateSwitchSeam(event.detail?.scene));
  window.addEventListener("okagency:art-safety-change", scheduleSync);
  window.addEventListener("resize", scheduleSync, { passive: true });
  window.addEventListener("orientationchange", scheduleSync, { passive: true });
})();
