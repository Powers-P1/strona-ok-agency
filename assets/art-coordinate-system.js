(() => {
  "use strict";

  const DEFAULT_ART_WIDTH = 1672;
  const DEFAULT_ART_HEIGHT = 941;
  const RING_SIZE = 44;
  const RING_RADIUS = RING_SIZE / 2;
  const SAFE_INSET = 24;
  const BOTTOM_CLEARANCE = 88;
  const COPY_CLEARANCE = 30;
  const FIXED_UI_EXPANSION = 16;
  const COPY_TANGENT_OFFSETS = [
    0,
    ...Array.from({ length: 12 }, (_value, index) => {
      const offset = (index + 1) * 24;
      return [-offset, offset];
    }).flat(),
  ];
  const COPY_OUTWARD_OFFSETS = [0, 24, 48, 72];
  const PLACEMENT_TIER_MINIMUM = Object.freeze({
    energy: 220,
    highlight: 96,
    structure: 1,
  });
  const PLACEMENT_CANDIDATE_LIMIT = 48;
  const PLACEMENT_CANDIDATE_SPACING = 24;
  const DEBUG_GEOMETRY = /(?:^|\b)hotspots(?:\b|$)/i.test(
    new URLSearchParams(location.search).get("audit") || "",
  );

  const serviceSelector = [
    ".campaign-frame",
    ".social-frame",
    ".process-frame",
    ".diagnosis-frame",
  ].join(",");
  const contentSelector = [
    ".opening-copy",
    ".process-opening-copy",
    ".journey-intro",
    ".proof-content",
    ".method-copy",
    ".editorial-copy",
    ".process-editorial-content",
    ".map-interface",
    ".result-content",
    ".copy-panel",
    ".portrait-frame",
    ".scene-inner > .copy",
  ].join(",");
  const fixedUiSelector = ".site-header, .motion-toggle, .scroll-cue";
  const adapters = [];
  const runtimeStyles = new Map();
  const runtimeAttributes = new Map();
  const debugOverlays = new Map();
  const debugSnapshots = new Map();
  const fixedAnchorLayouts = new Map();
  const annotationsByCallout = new WeakMap();
  const lastAnchors = new WeakMap();
  const placementCandidateCache = new WeakMap();
  const placementMapRequests = new WeakMap();
  const cleanupCallbacks = [];
  let solveFrame = 0;
  let resizeObserver = null;
  let destroyed = false;

  const finiteNumber = value => {
    if (value === null || value === undefined || String(value).trim() === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const percentage = value => {
    const match = String(value || "").trim().match(/^(-?\d+(?:\.\d+)?)%$/);
    return match ? Number(match[1]) / 100 : null;
  };

  const clamp = (value, minimum, maximum) =>
    Math.min(Math.max(value, minimum), maximum);

  const positionPart = (value, axis) => {
    const parts = String(value || "").trim().split(/\s+/);
    const token = parts[axis] || parts[0] || "50%";
    const keywords = {
      left: 0,
      top: 0,
      center: 0.5,
      right: 1,
      bottom: 1,
    };
    if (token in keywords) return keywords[token];
    return percentage(token) ?? 0.5;
  };

  const coverGeometry = (scene, art) => {
    const style = getComputedStyle(art);
    const naturalWidth = art.naturalWidth || Number(art.getAttribute("width")) || DEFAULT_ART_WIDTH;
    const naturalHeight = art.naturalHeight || Number(art.getAttribute("height")) || DEFAULT_ART_HEIGHT;
    const coordinateWidth = Number(art.getAttribute("width")) || naturalWidth;
    const coordinateHeight = Number(art.getAttribute("height")) || naturalHeight;
    const scale = style.objectFit === "contain"
      ? Math.min(scene.clientWidth / naturalWidth, scene.clientHeight / naturalHeight)
      : Math.max(scene.clientWidth / naturalWidth, scene.clientHeight / naturalHeight);
    const width = naturalWidth * scale;
    const height = naturalHeight * scale;
    return {
      width,
      height,
      left: (scene.clientWidth - width) * positionPart(style.objectPosition, 0),
      top: (scene.clientHeight - height) * positionPart(style.objectPosition, 1),
      scale,
      coordinateWidth,
      coordinateHeight,
    };
  };

  const rect = (left, top, width, height) => ({
    left,
    top,
    right: left + width,
    bottom: top + height,
    width,
    height,
  });

  const normalizeRect = value => {
    if (!value || typeof value !== "object") return null;
    const left = finiteNumber(value.left ?? value.x);
    const top = finiteNumber(value.top ?? value.y);
    const width = finiteNumber(value.width);
    const height = finiteNumber(value.height);
    const right = finiteNumber(value.right) ?? (left !== null && width !== null ? left + width : null);
    const bottom = finiteNumber(value.bottom) ?? (top !== null && height !== null ? top + height : null);
    if (left === null || top === null || right === null || bottom === null) return null;
    if (right < left || bottom < top) return null;
    return rect(left, top, right - left, bottom - top);
  };

  const viewportRectWithin = (element, sceneRect, expansion = 0) => {
    const bounds = element.getBoundingClientRect();
    return rect(
      bounds.left - sceneRect.left - expansion,
      bounds.top - sceneRect.top - expansion,
      bounds.width + expansion * 2,
      bounds.height + expansion * 2,
    );
  };

  const intersects = (first, second) =>
    first.left < second.right &&
    first.right > second.left &&
    first.top < second.bottom &&
    first.bottom > second.top;

  const intersectionArea = (first, second) => {
    const width = Math.min(first.right, second.right) - Math.max(first.left, second.left);
    const height = Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top);
    return width > 0 && height > 0 ? width * height : 0;
  };

  const contains = (outer, inner) =>
    inner.left >= outer.left &&
    inner.right <= outer.right &&
    inner.top >= outer.top &&
    inner.bottom <= outer.bottom;

  const isBox = element => {
    if (!element || element.hidden) return false;
    const style = getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const bounds = element.getBoundingClientRect();
    return bounds.width > 0 && bounds.height > 0;
  };

  const rememberRuntimeStyle = (element, property) => {
    let properties = runtimeStyles.get(element);
    if (!properties) {
      properties = new Map();
      runtimeStyles.set(element, properties);
    }
    if (!properties.has(property)) {
      properties.set(property, {
        value: element.style.getPropertyValue(property),
        priority: element.style.getPropertyPriority(property),
      });
    }
  };

  const setRuntimeStyle = (element, property, value) => {
    rememberRuntimeStyle(element, property);
    element.style.setProperty(property, value);
  };

  const rememberRuntimeAttribute = (element, attribute) => {
    let attributes = runtimeAttributes.get(element);
    if (!attributes) {
      attributes = new Map();
      runtimeAttributes.set(element, attributes);
    }
    if (!attributes.has(attribute)) {
      attributes.set(attribute, element.getAttribute(attribute));
    }
  };

  const setRuntimeAttribute = (element, attribute, value) => {
    rememberRuntimeAttribute(element, attribute);
    element.setAttribute(attribute, value);
  };

  const setRuntimeOptionalAttribute = (element, attribute, value) => {
    rememberRuntimeAttribute(element, attribute);
    if (value === null || value === undefined) element.removeAttribute(attribute);
    else element.setAttribute(attribute, value);
  };

  const serviceWirePathFor = (adapter, annotation) => {
    const annotationId = annotation.callout.dataset.annotation;
    if (!annotationId) return null;
    const wire = [...adapter.scene.querySelectorAll(".annotation-wire")]
      .find(layer => layer.dataset.line === annotationId);
    return wire?.querySelector("path") || null;
  };

  const exitingAnnotations = () => new Set(adapters.flatMap(adapter => (
    adapter.annotations.filter(annotation => {
      if (isOpen(annotation)) return false;
      const opacity = Number.parseFloat(getComputedStyle(annotation.copy).opacity || "0");
      return opacity > 0.01;
    })
  )));

  const clearRuntime = (preservedAnnotations = new Set()) => {
    const preservedElements = new Set();
    const preservedAttributeElements = new Set();
    preservedAnnotations.forEach(annotation => {
      preservedElements.add(annotation.callout);
      preservedElements.add(annotation.copy);
      preservedAttributeElements.add(annotation.callout);
      preservedAttributeElements.add(annotation.dot);
    });
    adapters.forEach(adapter => {
      if (adapter.kind !== "service") return;
      adapter.annotations.forEach(annotation => {
        if (!preservedAnnotations.has(annotation)) return;
        const path = serviceWirePathFor(adapter, annotation);
        if (path) {
          preservedElements.add(path);
          preservedAttributeElements.add(path);
        }
      });
    });
    const retainedStyles = new Map();
    runtimeStyles.forEach((properties, element) => {
      if (preservedElements.has(element)) {
        retainedStyles.set(element, properties);
        return;
      }
      properties.forEach(({ value, priority }, property) => {
        if (value) element.style.setProperty(property, value, priority);
        else element.style.removeProperty(property);
      });
    });
    runtimeStyles.clear();
    retainedStyles.forEach((properties, element) => {
      runtimeStyles.set(element, properties);
    });

    const retainedAttributes = new Map();
    runtimeAttributes.forEach((attributes, element) => {
      if (preservedAttributeElements.has(element)) {
        retainedAttributes.set(element, attributes);
        return;
      }
      attributes.forEach((value, attribute) => {
        if (value === null) element.removeAttribute(attribute);
        else element.setAttribute(attribute, value);
      });
    });
    runtimeAttributes.clear();
    retainedAttributes.forEach((attributes, element) => {
      runtimeAttributes.set(element, attributes);
    });

    adapters.forEach(adapter => {
      adapter.annotations.forEach(annotation => {
        if (preservedAnnotations.has(annotation)) return;
        annotation.callout.classList.toggle("flip", annotation.originalFlip);
      });
    });
  };

  const clearDebugOverlays = () => {
    debugOverlays.forEach(overlay => overlay.remove());
    debugOverlays.clear();
  };

  const readAnchorPair = (callout, profile) => {
    const suffix = profile === "base"
      ? ""
      : profile[0].toUpperCase() + profile.slice(1);
    const x = finiteNumber(callout.dataset[`artX${suffix}`]);
    const y = finiteNumber(callout.dataset[`artY${suffix}`]);
    return x === null || y === null ? null : { x, y, profile };
  };

  const originalServiceAnchor = callout => {
    const style = getComputedStyle(callout);
    const x = percentage(style.getPropertyValue("--dot-x"));
    const y = percentage(style.getPropertyValue("--dot-y"));
    return x === null || y === null
      ? null
      : { relativeX: x, relativeY: y, profile: "base" };
  };

  const originalAboutAnchor = callout => {
    const style = getComputedStyle(callout);
    const x = percentage(style.getPropertyValue("--x"));
    const y = percentage(style.getPropertyValue("--y"));
    return x === null || y === null
      ? null
      : { relativeX: x, relativeY: y, profile: "base" };
  };

  const originalServiceSide = callout => {
    const style = getComputedStyle(callout);
    const dotX = percentage(style.getPropertyValue("--dot-x"));
    const dotY = percentage(style.getPropertyValue("--dot-y"));
    const copyLeft = percentage(style.getPropertyValue("--copy-left"));
    const copyRight = percentage(style.getPropertyValue("--copy-right"));
    const copyTop = percentage(style.getPropertyValue("--copy-top"));
    if (dotX === null || dotY === null || copyTop === null) return "right";
    const copyCenterX = copyLeft !== null
      ? copyLeft
      : copyRight !== null
        ? 1 - copyRight
        : dotX;
    const deltaX = copyCenterX - dotX;
    const deltaY = copyTop - dotY;
    if (Math.abs(deltaX) >= Math.abs(deltaY)) return deltaX < 0 ? "left" : "right";
    return deltaY < 0 ? "above" : "below";
  };

  const createAnnotation = (callout, kind) => ({
    callout,
    dot: callout.querySelector(".annotation-dot"),
    copy: callout.querySelector(".annotation-copy"),
    originalSemantics: {
      anchorState: callout.getAttribute("data-ok-anchor-state"),
      ariaHidden: callout.getAttribute("aria-hidden"),
      inert: callout.getAttribute("inert"),
      dotAriaHidden: callout.querySelector(".annotation-dot")?.getAttribute("aria-hidden") ?? null,
      dotDisabled: callout.querySelector(".annotation-dot")?.getAttribute("disabled") ?? null,
      dotTabIndex: callout.querySelector(".annotation-dot")?.getAttribute("tabindex") ?? null,
    },
    baseFallback: kind === "service"
      ? originalServiceAnchor(callout)
      : originalAboutAnchor(callout),
    preferredSide: kind === "service"
      ? originalServiceSide(callout)
      : callout.classList.contains("flip") ? "left" : "right",
    originalFlip: callout.classList.contains("flip"),
  });

  document.querySelectorAll(serviceSelector).forEach(scene => {
    const art = scene.querySelector(":scope > .campaign-art");
    const annotations = [...scene.querySelectorAll(":scope > .annotation-callout")]
      .map(callout => createAnnotation(callout, "service"))
      .filter(annotation => annotation.dot && annotation.copy);
    if (art && annotations.length) adapters.push({ scene, art, annotations, kind: "service" });
  });

  document.querySelectorAll(".about-page .scene").forEach(scene => {
    const art = scene.querySelector(":scope > .scene-art");
    const inner = scene.querySelector(":scope > .scene-inner");
    const annotations = inner
      ? [...inner.querySelectorAll(":scope > .annotation")]
        .map(callout => createAnnotation(callout, "about"))
        .filter(annotation => annotation.dot && annotation.copy)
      : [];
    if (art && inner && annotations.length) adapters.push({ scene, art, inner, annotations, kind: "about" });
  });
  adapters.forEach(adapter => adapter.annotations.forEach(annotation => {
    annotationsByCallout.set(annotation.callout, annotation);
  }));

  const activeProfiles = artBounds => {
    if (innerHeight <= 800 && innerWidth > 640) return ["short", "compact", "base"];
    if ((artBounds.masked && artBounds.maskShape !== "local-hole") || innerWidth <= 1180) {
      return ["compact", "base"];
    }
    return ["base", "compact"];
  };

  const placementMapFor = adapter => {
    const api = window.OKAgencyResponsiveSafety;
    const map = api?.getPlacementMap?.(adapter.scene)
      || api?.getPlacementMap?.(adapter.art)
      || null;
    if (map || typeof api?.requestPlacementMap !== "function") return map;
    if (!placementMapRequests.has(adapter)) {
      const pending = api.requestPlacementMap(adapter.scene)
        .catch(() => null)
        .finally(() => placementMapRequests.delete(adapter));
      placementMapRequests.set(adapter, pending);
    }
    return null;
  };

  const authoredNaturalAnchors = (annotation, profiles, placementMap) => {
    const anchors = [];
    profiles.forEach(profile => {
      const source = readAnchorPair(annotation.callout, profile)
        || (profile === "base" ? annotation.baseFallback : null);
      if (!source) return;
      const x = source.relativeX === undefined
        ? source.x
        : source.relativeX * placementMap.width;
      const y = source.relativeY === undefined
        ? source.y
        : source.relativeY * placementMap.height;
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      if (!anchors.some(anchor => anchor.x === x && anchor.y === y)) {
        anchors.push({ x, y, profile });
      }
    });
    return anchors;
  };

  const placementTierOrder = art => (
    art.dataset.placementEnergy === "none"
      ? ["structure"]
      : ["energy", "highlight", "structure"]
  );

  const naturalPlacementCandidates = (annotation, profiles, placementMap, art) => {
    const cacheKey = `${profiles.join(",")}:${placementMap.width}x${placementMap.height}`;
    const cached = placementCandidateCache.get(annotation);
    if (cached?.map === placementMap && cached.key === cacheKey) return cached.candidates;

    const anchors = authoredNaturalAnchors(annotation, profiles, placementMap);
    const maximumDistance = Math.max(140, Math.min(placementMap.width, placementMap.height) * .3);
    const maximumDistanceSquared = maximumDistance * maximumDistance;
    const candidates = [];
    const seen = new Set();
    const append = (x, y, tier, profile, distanceSquared) => {
      const key = `${Math.round(x)}:${Math.round(y)}`;
      if (seen.has(key)) return false;
      if (candidates.some(candidate => (
        candidate.tier === tier
        && Math.hypot(candidate.naturalX - x, candidate.naturalY - y)
          < PLACEMENT_CANDIDATE_SPACING
      ))) return false;
      seen.add(key);
      candidates.push({
        naturalX: x,
        naturalY: y,
        tier,
        profile,
        authoredDistance: Math.sqrt(distanceSquared),
      });
      return true;
    };

    placementTierOrder(art).forEach(tier => {
      const minimum = PLACEMENT_TIER_MINIMUM[tier];
      const pool = placementMap.candidates?.[tier] || [];
      let tierCount = 0;
      anchors.forEach(anchor => {
        if (tierCount >= PLACEMENT_CANDIDATE_LIMIT) return;
        if (placementMap.tierAt(anchor.x, anchor.y) >= minimum) {
          if (append(anchor.x, anchor.y, tier, anchor.profile, 0)) tierCount += 1;
        }
        const ranked = [];
        for (const index of pool) {
          const x = index % placementMap.width;
          const y = Math.floor(index / placementMap.width);
          const distanceSquared = (x - anchor.x) ** 2 + (y - anchor.y) ** 2;
          if (distanceSquared <= maximumDistanceSquared) {
            ranked.push({ x, y, distanceSquared });
          }
        }
        ranked.sort((first, second) => first.distanceSquared - second.distanceSquared);
        for (const candidate of ranked) {
          if (tierCount >= PLACEMENT_CANDIDATE_LIMIT) break;
          if (append(
            candidate.x,
            candidate.y,
            tier,
            anchor.profile,
            candidate.distanceSquared,
          )) tierCount += 1;
        }
      });
    });

    placementCandidateCache.set(annotation, { map: placementMap, key: cacheKey, candidates });
    return candidates;
  };

  const annotationCandidates = (annotation, profiles, geometry, placementMap, art) => {
    const natural = naturalPlacementCandidates(annotation, profiles, placementMap, art);
    const previous = lastAnchors.get(annotation);
    const ordered = previous?.map === placementMap
      ? [previous, ...natural.filter(candidate => (
        candidate.naturalX !== previous.naturalX || candidate.naturalY !== previous.naturalY
      ))]
      : natural;
    return ordered.map(candidate => ({
      ...candidate,
      x: geometry.left + geometry.width * candidate.naturalX / placementMap.width,
      y: geometry.top + geometry.height * candidate.naturalY / placementMap.height,
    }));
  };

  const artBoundsFor = (scene, art, geometry) => {
    const api = window.OKAgencyResponsiveSafety;
    let safety = null;
    if (typeof api?.getArtBounds === "function") {
      try {
        safety = api.getArtBounds(scene) || api.getArtBounds(art);
      } catch {
        safety = null;
      }
    }
    if (safety) {
      const fullVisible = normalizeRect(safety.fullVisible);
      const feather = normalizeRect(safety.feather);
      const protectedRect = normalizeRect(safety.protected);
      return {
        masked: Boolean(safety.masked),
        maskShape: safety.maskShape || null,
        fullVisible,
        /* A visible ring must be entirely outside the safety feather. The
         * feather still renders unchanged; it is simply not interactive art. */
        interactiveVisible: fullVisible,
        protected: protectedRect,
      };
    }
    const left = Math.max(0, geometry.left);
    const top = Math.max(0, geometry.top);
    const right = Math.min(scene.clientWidth, geometry.left + geometry.width);
    const bottom = Math.min(scene.clientHeight, geometry.top + geometry.height);
    return {
      masked: art.dataset.okSafeArt === "active",
      maskShape: null,
      protected: null,
      fullVisible: right >= left && bottom >= top
        ? rect(left, top, right - left, bottom - top)
        : null,
      interactiveVisible: right >= left && bottom >= top
        ? rect(left, top, right - left, bottom - top)
        : null,
    };
  };

  const obstaclesFor = (adapter, sceneRect) => {
    const content = [...adapter.scene.querySelectorAll(contentSelector)]
      .filter(isBox)
      .map(element => viewportRectWithin(element, sceneRect));
    const fixed = [...new Set([
      ...adapter.scene.querySelectorAll(fixedUiSelector),
      ...document.querySelectorAll(".site-header, .motion-toggle"),
    ])]
      .filter(isBox)
      .map(element => viewportRectWithin(element, sceneRect, FIXED_UI_EXPANSION));
    return { content, fixed };
  };

  const fixedAnchorObstaclesFor = (adapter, sceneRect) => {
    const obstacles = obstaclesFor(adapter, sceneRect);
    const local = [...adapter.scene.querySelectorAll(".scroll-cue")]
      .filter(isBox)
      .map(element => viewportRectWithin(element, sceneRect, FIXED_UI_EXPANSION));
    const global = [...document.querySelectorAll(".site-header, .motion-toggle")]
      .filter(isBox)
      .map(element => {
        const bounds = element.getBoundingClientRect();
        return rect(
          bounds.left - FIXED_UI_EXPANSION,
          bounds.top - FIXED_UI_EXPANSION,
          bounds.width + FIXED_UI_EXPANSION * 2,
          bounds.height + FIXED_UI_EXPANSION * 2,
        );
      });
    return { content: obstacles.content, fixed: [...local, ...global] };
  };

  const ringFor = point => rect(
    point.x - RING_RADIUS,
    point.y - RING_RADIUS,
    RING_SIZE,
    RING_SIZE,
  );

  const ringFits = (ring, point, adapter, artBounds, obstacles, siblings) => {
    const sceneSafe = rect(
      SAFE_INSET,
      SAFE_INSET,
      adapter.scene.clientWidth - SAFE_INSET * 2,
      adapter.scene.clientHeight - SAFE_INSET * 2,
    );
    if (!artBounds.interactiveVisible || !contains(artBounds.interactiveVisible, ring)) return false;
    if (artBounds.protected && intersects(ring, artBounds.protected)) return false;
    if (!contains(sceneSafe, ring)) return false;
    if (adapter.scene.clientHeight - point.y < BOTTOM_CLEARANCE) return false;
    if (obstacles.content.some(obstacle => intersects(ring, obstacle))) return false;
    if (obstacles.fixed.some(obstacle => intersects(ring, obstacle))) return false;
    return siblings.every(sibling => !intersects(ring, sibling));
  };

  const ringRejections = (ring, point, adapter, artBounds, obstacles, siblings = []) => {
    const reasons = [];
    const sceneSafe = rect(
      SAFE_INSET,
      SAFE_INSET,
      adapter.scene.clientWidth - SAFE_INSET * 2,
      adapter.scene.clientHeight - SAFE_INSET * 2,
    );
    if (!artBounds.interactiveVisible || !contains(artBounds.interactiveVisible, ring)) reasons.push("visible-art");
    if (artBounds.protected && intersects(ring, artBounds.protected)) reasons.push("protected-content");
    if (!contains(sceneSafe, ring)) reasons.push("scene-inset");
    if (adapter.scene.clientHeight - point.y < BOTTOM_CLEARANCE) reasons.push("bottom-clearance");
    if (obstacles.content.some(obstacle => intersects(ring, obstacle))) reasons.push("content");
    if (obstacles.fixed.some(obstacle => intersects(ring, obstacle))) reasons.push("fixed-ui");
    if (siblings.some(sibling => intersects(ring, sibling))) reasons.push("sibling-ring");
    return reasons;
  };

  const oppositeSide = {
    above: "below",
    below: "above",
    left: "right",
    right: "left",
  };

  const candidateOrder = preferred => {
    if (preferred === "left" || preferred === "right") {
      return [
        preferred,
        preferred === "left" ? "above" : "below",
        preferred === "left" ? "below" : "above",
        oppositeSide[preferred],
      ];
    }
    return [
      preferred,
      preferred === "above" ? "left" : "right",
      preferred === "above" ? "right" : "left",
      oppositeSide[preferred],
    ];
  };

  const idealCopyPosition = (side, point, width, height) => {
    if (side === "left") {
      return { left: point.x - width - COPY_CLEARANCE, top: point.y - height / 2 };
    }
    if (side === "right") {
      return { left: point.x + COPY_CLEARANCE, top: point.y - height / 2 };
    }
    if (side === "above") {
      return { left: point.x - width / 2, top: point.y - height - COPY_CLEARANCE };
    }
    return { left: point.x - width / 2, top: point.y + COPY_CLEARANCE };
  };

  const copyPositionCandidates = (annotation, point, width, height) => {
    const maximumLeft = annotation.adapter.scene.clientWidth - width - SAFE_INSET;
    const maximumTop = annotation.adapter.scene.clientHeight - height - SAFE_INSET;
    if (maximumLeft < SAFE_INSET || maximumTop < SAFE_INSET) return [];

    const seen = new Set();
    const candidates = [];

    candidateOrder(annotation.preferredSide).forEach((side, order) => {
      const ideal = idealCopyPosition(side, point, width, height);
      COPY_OUTWARD_OFFSETS.forEach(outward => {
        COPY_TANGENT_OFFSETS.forEach(tangent => {
          const horizontal = side === "left" || side === "right";
          const direction = side === "left" || side === "above" ? -1 : 1;
          const rawLeft = ideal.left + (horizontal ? outward * direction : tangent);
          const rawTop = ideal.top + (horizontal ? tangent : outward * direction);
          const left = clamp(rawLeft, SAFE_INSET, maximumLeft);
          const top = clamp(rawTop, SAFE_INSET, maximumTop);
          const key = `${left.toFixed(2)}:${top.toFixed(2)}`;
          if (seen.has(key)) return;
          seen.add(key);
          candidates.push({
            left,
            top,
            side,
            rect: rect(left, top, width, height),
            displacementRank: order * 576 + tangent * tangent + outward * outward,
          });
        });
      });
    });
    return candidates.sort((first, second) => first.displacementRank - second.displacementRank);
  };

  const isOpen = annotation =>
    annotation.callout.classList.contains("is-open") ||
    annotation.dot.getAttribute("aria-expanded") === "true";

  const chooseCopyPosition = (
    annotation,
    point,
    width,
    height,
    obstacles,
    rings,
    visibleCopies,
  ) => {
    for (const candidate of copyPositionCandidates(annotation, point, width, height)) {
      const copyRect = candidate.rect;
      if (obstacles.content.some(obstacle => intersects(copyRect, obstacle))) continue;
      if (obstacles.fixed.some(obstacle => intersects(copyRect, obstacle))) continue;
      if (rings.some(ring => intersects(copyRect, ring))) continue;
      if (visibleCopies.some(sibling => intersects(copyRect, sibling))) continue;
      return candidate;
    }
    return null;
  };

  const chooseLeastObstructedCopyPosition = (
    annotation,
    point,
    width,
    height,
    obstacles,
    rings,
    visibleCopies,
  ) => copyPositionCandidates(annotation, point, width, height)
    .filter(candidate => (
      !obstacles.fixed.some(obstacle => intersects(candidate.rect, obstacle))
      && !rings.some(ring => intersects(candidate.rect, ring))
      && !visibleCopies.some(copy => intersects(candidate.rect, copy))
    ))
    .map(candidate => ({
      candidate,
      penalty: obstacles.content.reduce((total, obstacle) => (
        total + intersectionArea(candidate.rect, obstacle)
      ), 0),
    }))
    .sort((first, second) => (
      first.penalty - second.penalty
      || first.candidate.displacementRank - second.candidate.displacementRank
    ))[0]?.candidate || null;

  const placeCopies = (adapter, points, rings, obstacles) => {
    const copies = new Array(adapter.annotations.length);
    const openIndexes = [];
    const closedIndexes = [];
    adapter.annotations.forEach((annotation, index) => {
      if (!points[index]) return;
      (isOpen(annotation) ? openIndexes : closedIndexes).push(index);
    });
    const visibleCopies = [];

    for (const index of [...openIndexes, ...closedIndexes]) {
      const annotation = adapter.annotations[index];
      annotation.adapter = adapter;
      const width = annotation.copy.offsetWidth;
      const height = annotation.copy.offsetHeight;
      if (!width || !height) continue;
      const open = isOpen(annotation);
      const ringsToAvoid = rings.filter(Boolean);
      const position = open
        ? chooseCopyPosition(
          annotation,
          points[index],
          width,
          height,
          obstacles,
          ringsToAvoid,
          visibleCopies,
        ) || chooseLeastObstructedCopyPosition(
          annotation,
          points[index],
          width,
          height,
          obstacles,
          ringsToAvoid,
          visibleCopies,
        )
        : measuredAnnotationGeometry(adapter, annotation).copy;
      if (!position) continue;
      copies[index] = position;
      if (open) visibleCopies.push(position.rect);
    }
    return copies;
  };

  const solveAdapter = adapter => {
    const geometry = coverGeometry(adapter.scene, adapter.art);
    const artBounds = artBoundsFor(adapter.scene, adapter.art, geometry);
    const profiles = activeProfiles(artBounds);
    const sceneRect = adapter.scene.getBoundingClientRect();
    const obstacles = obstaclesFor(adapter, sceneRect);
    const fixedAnchorObstacles = fixedAnchorObstaclesFor(adapter, sceneRect);
    const placementMap = placementMapFor(adapter);
    if (!placementMap) {
      return {
        geometry,
        points: adapter.annotations.map(() => null),
        rings: adapter.annotations.map(() => null),
        copies: adapter.annotations.map(() => null),
        status: "pending",
      };
    }
    const candidates = adapter.annotations.map(annotation =>
      annotationCandidates(annotation, profiles, geometry, placementMap, adapter.art));

    /* Hotspots are authored in the artwork coordinate system, just like the
     * signals on the hero tree. Interaction may reflow a copy and its connector,
     * but it must never select another point anchor. A responsive profile is
     * selected once per artwork geometry and then reused across interactions. */
    const anchorLayoutKey = [
      `${adapter.scene.clientWidth}x${adapter.scene.clientHeight}`,
      [geometry.left, geometry.top, geometry.width, geometry.height]
        .map(value => Math.round(value * 10) / 10)
        .join(","),
      profiles.join(","),
      artBounds.interactiveVisible
        ? [
          artBounds.interactiveVisible.left,
          artBounds.interactiveVisible.top,
          artBounds.interactiveVisible.width,
          artBounds.interactiveVisible.height,
        ].map(value => Math.round(value)).join(",")
        : "no-art-bounds",
      artBounds.protected
        ? [
          artBounds.protected.left,
          artBounds.protected.top,
          artBounds.protected.width,
          artBounds.protected.height,
        ].map(value => Math.round(value)).join(",")
        : "no-protected-bounds",
      fixedAnchorObstacles.content
        .map(bounds => [bounds.left, bounds.top, bounds.width, bounds.height]
          .map(value => Math.round(value))
          .join(","))
        .join(";"),
    ].join(":");
    let anchorLayout = fixedAnchorLayouts.get(adapter);
    if (anchorLayout?.key !== anchorLayoutKey) {
      const points = adapter.annotations.map(() => null);
      const rings = adapter.annotations.map(() => null);
      adapter.annotations.forEach((annotation, index) => {
        for (const point of candidates[index]) {
          const ring = ringFor(point);
          if (!ringFits(
            ring,
            point,
            adapter,
            artBounds,
            fixedAnchorObstacles,
            rings.filter(Boolean),
          )) continue;
          points[index] = point;
          rings[index] = ring;
          lastAnchors.set(annotation, { ...point, map: placementMap });
          break;
        }
      });
      anchorLayout = { key: anchorLayoutKey, points, rings };
      fixedAnchorLayouts.set(adapter, anchorLayout);
    }
    const { points, rings } = anchorLayout;
    const copies = placeCopies(adapter, points, rings, obstacles);
    points.forEach((point, index) => {
      if (point && !copies[index]) {
        points[index] = null;
        rings[index] = null;
      }
    });
    const placedCount = points.filter(Boolean).length;
    const status = placedCount === adapter.annotations.length
      ? "solved"
      : placedCount
        ? "partial"
        : "hidden";
    const solution = { geometry, points, rings, copies, status };
    if (DEBUG_GEOMETRY) {
      debugSnapshots.set(adapter.scene, {
        scene: adapter.scene.id || null,
        status,
        masked: artBounds.masked,
        profiles: [...profiles],
        ringConfigurations: 1,
        copyFailures: copies.filter((copy, index) => points[index] && !copy).length,
        selected: points.map((point, index) => ({
          key: adapter.annotations[index].callout.dataset.annotation
            || adapter.annotations[index].dot.getAttribute("aria-controls"),
          state: point ? "placed" : "hidden",
          naturalX: point ? point.naturalX : null,
          naturalY: point ? point.naturalY : null,
          tier: point ? point.tier : null,
          value: point ? placementMap.tierAt(point.naturalX, point.naturalY) : null,
          x: point ? Math.round(point.x * 10) / 10 : null,
          y: point ? Math.round(point.y * 10) / 10 : null,
        })),
        candidates: candidates.map((list, index) => list.map(point => ({
          profile: point.profile,
          x: Math.round(point.x * 10) / 10,
          y: Math.round(point.y * 10) / 10,
          rejectedBy: ringRejections(
            ringFor(point),
            point,
            adapter,
            artBounds,
            obstacles,
          ),
          key: adapter.annotations[index].callout.dataset.annotation
            || adapter.annotations[index].dot.getAttribute("aria-controls"),
        }))),
      });
    }
    return solution;
  };

  const updateServiceWire = (adapter, annotation, point, copy, geometry) => {
    const path = serviceWirePathFor(adapter, annotation);
    if (!path) return;

    const copyIsRight = copy.left + copy.rect.width / 2 > point.x;
    const targetX = copyIsRight ? copy.left : copy.rect.right;
    const targetY = clamp(point.y, copy.top + 14, copy.rect.bottom - 14);
    const elbowX = point.x + (targetX - point.x) * 0.55;
    const naturalX = value => ((value - geometry.left) / geometry.width) * geometry.coordinateWidth;
    const naturalY = value => ((value - geometry.top) / geometry.height) * geometry.coordinateHeight;
    setRuntimeAttribute(
      path,
      "d",
      `M ${naturalX(point.x).toFixed(1)} ${naturalY(point.y).toFixed(1)} ` +
        `L ${naturalX(elbowX).toFixed(1)} ${naturalY(point.y).toFixed(1)} ` +
        `L ${naturalX(targetX).toFixed(1)} ${naturalY(targetY).toFixed(1)}`,
    );
  };

  const serviceConnectorGeometry = (adapter, geometry) => {
    adapter.scene
      .querySelectorAll(".annotation-lines")
      .forEach(layer => {
        setRuntimeStyle(layer, "inset", "auto");
        setRuntimeStyle(layer, "left", `${geometry.left}px`);
        setRuntimeStyle(layer, "top", `${geometry.top}px`);
        setRuntimeStyle(layer, "width", `${geometry.width}px`);
        setRuntimeStyle(layer, "height", `${geometry.height}px`);
        setRuntimeAttribute(
          layer,
          "viewBox",
          `0 0 ${geometry.coordinateWidth} ${geometry.coordinateHeight}`,
        );
      });
  };

  const measuredAnnotationGeometry = (adapter, annotation) => {
    const sceneRect = adapter.scene.getBoundingClientRect();
    const dotRect = annotation.dot.getBoundingClientRect();
    const copyRect = annotation.copy.getBoundingClientRect();
    const copy = rect(
      copyRect.left - sceneRect.left,
      copyRect.top - sceneRect.top,
      copyRect.width,
      copyRect.height,
    );
    return {
      point: {
        x: dotRect.left - sceneRect.left + dotRect.width / 2,
        y: dotRect.top - sceneRect.top + dotRect.height / 2,
      },
      copy: {
        left: copy.left,
        top: copy.top,
        rect: copy,
      },
    };
  };

  const updateAboutLeader = (annotation, point, copy) => {
    const copyIsRight = copy.left + copy.rect.width / 2 > point.x;
    const targetX = copyIsRight ? copy.left : copy.rect.right;
    const targetY = clamp(point.y, copy.top + 14, copy.rect.bottom - 14);
    const lineX = targetX - point.x;
    const lineY = targetY - point.y;
    annotation.callout.classList.toggle("flip", !copyIsRight);
    setRuntimeStyle(annotation.callout, "--leader-length", `${Math.hypot(lineX, lineY)}px`);
    setRuntimeStyle(annotation.callout, "--leader-angle", `${Math.atan2(lineY, lineX)}rad`);
  };

  const setAnnotationPlacementState = (adapter, annotation, placed) => {
    const { callout, copy, dot, originalSemantics } = annotation;
    const wirePath = serviceWirePathFor(adapter, annotation);
    if (!placed) {
      window.OKAgencyAnnotations?.close?.(callout);
      callout.classList.remove("is-open");
      delete callout.dataset.preview;
      callout.dataset.pinned = "false";
      dot.setAttribute("aria-expanded", "false");
      copy.setAttribute("aria-hidden", "true");
      wirePath?.closest(".annotation-wire")?.classList.remove("is-open");
    }

    setRuntimeOptionalAttribute(
      callout,
      "data-ok-anchor-state",
      placed ? "placed" : "hidden",
    );
    setRuntimeOptionalAttribute(
      callout,
      "aria-hidden",
      placed ? originalSemantics.ariaHidden : "true",
    );
    setRuntimeOptionalAttribute(
      callout,
      "inert",
      placed ? originalSemantics.inert : "",
    );
    setRuntimeOptionalAttribute(
      dot,
      "aria-hidden",
      placed ? originalSemantics.dotAriaHidden : "true",
    );
    setRuntimeOptionalAttribute(
      dot,
      "disabled",
      placed ? originalSemantics.dotDisabled : "",
    );
    setRuntimeOptionalAttribute(
      dot,
      "tabindex",
      placed ? originalSemantics.dotTabIndex : "-1",
    );
    if (wirePath) setRuntimeStyle(wirePath, "visibility", placed ? "visible" : "hidden");
  };

  const applyServiceSolution = (adapter, solution, preservedCopies = new Set()) => {
    serviceConnectorGeometry(adapter, solution.geometry);

    adapter.annotations.forEach((annotation, index) => {
      const point = solution.points[index];
      const copy = solution.copies[index];
      if (preservedCopies.has(annotation)) return;
      const placed = Boolean(point && copy);
      setAnnotationPlacementState(adapter, annotation, placed);
      setRuntimeStyle(annotation.callout, "visibility", placed ? "visible" : "hidden");
      if (!placed) return;
      setRuntimeStyle(annotation.callout, "--dot-x", `${point.x}px`);
      setRuntimeStyle(annotation.callout, "--dot-y", `${point.y}px`);
      setRuntimeStyle(annotation.callout, "--annotation-delay", `${index * -0.42}s`);
      setRuntimeStyle(annotation.callout, "--copy-left", `${copy.left}px`);
      setRuntimeStyle(annotation.callout, "--copy-right", "auto");
      setRuntimeStyle(annotation.callout, "--copy-top", `${copy.top}px`);
      updateServiceWire(adapter, annotation, point, copy, solution.geometry);
    });
  };

  const applyAboutSolution = (adapter, solution, preservedCopies = new Set()) => {
    const sceneRect = adapter.scene.getBoundingClientRect();
    const innerRect = adapter.inner.getBoundingClientRect();
    const innerLeft = innerRect.left - sceneRect.left;
    const innerTop = innerRect.top - sceneRect.top;

    adapter.annotations.forEach((annotation, index) => {
      const point = solution.points[index];
      const copy = solution.copies[index];
      if (preservedCopies.has(annotation)) return;
      const placed = Boolean(point && copy);
      setAnnotationPlacementState(adapter, annotation, placed);
      setRuntimeStyle(annotation.callout, "visibility", placed ? "visible" : "hidden");
      if (!placed) return;
      setRuntimeStyle(annotation.callout, "--x", `${point.x - innerLeft}px`);
      setRuntimeStyle(annotation.callout, "--y", `${point.y - innerTop}px`);
      setRuntimeStyle(annotation.callout, "--annotation-delay", `${index * -0.42}s`);
      setRuntimeStyle(annotation.copy, "top", `${copy.top - point.y}px`);
      setRuntimeStyle(annotation.copy, "left", `${copy.left - point.x}px`);
      setRuntimeStyle(annotation.copy, "right", "auto");
      setRuntimeStyle(annotation.copy, "--copy-shift-y", "0px");

      updateAboutLeader(annotation, point, copy);
    });
  };

  const appendDebugBox = (overlay, bounds, kind) => {
    if (!bounds) return;
    const box = document.createElement("span");
    box.className = "annotation-debug-box";
    box.dataset.debugKind = kind;
    box.style.setProperty("left", `${bounds.left}px`);
    box.style.setProperty("top", `${bounds.top}px`);
    box.style.setProperty("width", `${bounds.width}px`);
    box.style.setProperty("height", `${bounds.height}px`);
    overlay.append(box);
  };

  const renderDebugOverlay = (adapter, solution) => {
    if (!DEBUG_GEOMETRY) return;
    const geometry = solution?.geometry || coverGeometry(adapter.scene, adapter.art);
    const safety = artBoundsFor(adapter.scene, adapter.art, geometry);
    const obstacles = obstaclesFor(adapter, adapter.scene.getBoundingClientRect());
    const overlay = document.createElement("div");
    overlay.className = "annotation-debug-overlay";
    overlay.dataset.debugStatus = solution?.status || "hidden";
    overlay.setAttribute("aria-hidden", "true");

    appendDebugBox(overlay, safety.fullVisible, "visible-art");
    appendDebugBox(overlay, safety.protected, "protected-content");
    obstacles.content.forEach(bounds => appendDebugBox(overlay, bounds, "content"));
    obstacles.fixed.forEach(bounds => appendDebugBox(overlay, bounds, "fixed-ui"));
    solution?.rings.filter(Boolean).forEach(bounds => appendDebugBox(overlay, bounds, "ring"));
    solution?.copies.filter(Boolean).forEach(copy => appendDebugBox(overlay, copy.rect, "copy"));

    const label = document.createElement("span");
    label.className = "annotation-debug-label";
    label.textContent = `HOTSPOTS: ${(solution?.status || "hidden").toUpperCase()}`;
    overlay.append(label);
    adapter.scene.append(overlay);
    debugOverlays.set(adapter.scene, overlay);
  };

  const solveAll = () => {
    solveFrame = 0;
    if (destroyed) return;
    /* Opening B closes A synchronously, but A remains visible during its exit
     * transition. Preserve A's complete runtime layout through this solve so
     * the new card can be positioned without snapping the old card back to its
     * authored coordinates for a single frame. The next solve may clear A once
     * its opacity reaches zero. */
    const preservedCopies = exitingAnnotations();
    clearRuntime(preservedCopies);
    clearDebugOverlays();
    debugSnapshots.clear();
    if (innerWidth <= 640) {
      return;
    }

    const solutions = adapters.map(solveAdapter);
    adapters.forEach((adapter, index) => {
      const solution = solutions[index];
      if (adapter.kind === "service") applyServiceSolution(adapter, solution, preservedCopies);
      else applyAboutSolution(adapter, solution, preservedCopies);
      renderDebugOverlay(adapter, solution);
    });
  };

  const schedule = () => {
    if (destroyed || solveFrame) return;
    solveFrame = requestAnimationFrame(solveAll);
  };

  const listen = (target, type, listener, options) => {
    target?.addEventListener(type, listener, options);
    cleanupCallbacks.push(() => target?.removeEventListener(type, listener, options));
  };

  adapters.forEach(adapter => adapter.annotations.forEach(annotation => {
    listen(annotation.copy, "transitionend", event => {
      if (event.propertyName === "opacity" && !isOpen(annotation)) schedule();
    });
  }));

  listen(window, "load", schedule, { once: true });
  listen(window, "resize", schedule, { passive: true });
  listen(window, "orientationchange", schedule, { passive: true });
  listen(window.visualViewport, "resize", schedule, { passive: true });
  listen(window, "okagency:art-safety-change", schedule);
  listen(window, "okagency:placement-map-change", schedule);
  listen(window, "okagency:annotationchange", event => {
    const annotation = annotationsByCallout.get(event.detail?.callout);
    if (annotation && !event.detail?.open) {
      /* Closing CSS includes a small translate. Freeze the outgoing card at
       * its final open geometry; only opacity may change until transitionend. */
      setRuntimeStyle(annotation.copy, "transform", "none");
      schedule();
      return;
    }
    if (event.detail?.open) schedule();
  });
  listen(window, "okagency:motionchange", schedule);
  listen(window, "scroll", () => {
    if (document.querySelector(".annotation-callout.is-open, .annotation.is-open")) schedule();
  }, { passive: true });

  document.fonts?.ready.then(schedule);

  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(schedule);
    adapters.forEach(adapter => {
      resizeObserver.observe(adapter.scene);
      resizeObserver.observe(adapter.art);
    });
  }

  const destroy = () => {
    destroyed = true;
    if (solveFrame) cancelAnimationFrame(solveFrame);
    resizeObserver?.disconnect();
    fixedAnchorLayouts.clear();
    cleanupCallbacks.splice(0).forEach(cleanup => cleanup());
    clearRuntime();
    clearDebugOverlays();
  };
  listen(window, "pagehide", destroy, { once: true });

  if (DEBUG_GEOMETRY) {
    window.OKAgencyAnnotationGeometryDebug = Object.freeze({
      refresh: schedule,
      snapshot: () => [...debugSnapshots.values()].map(entry => structuredClone(entry)),
    });
  }

  schedule();
})();
