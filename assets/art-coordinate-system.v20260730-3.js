(() => {
  const serviceFrames = [
    ...document.querySelectorAll(
      ".campaign-frame, .social-frame, .process-frame, .diagnosis-frame",
    ),
  ];
  const aboutScenes = [...document.querySelectorAll(".scene")];
  const serviceGeometry = new WeakMap();
  const aboutGeometry = new WeakMap();
  const preferredCopySides = new WeakMap();
  const summaryHomes = new WeakMap();
  const safeInset = 24;
  const dotClearance = 30;

  const percentage = value => {
    const match = String(value || "").trim().match(/^(-?\d+(?:\.\d+)?)%$/);
    return match ? Number(match[1]) / 100 : null;
  };

  const finiteNumber = value => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

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
    const parsed = percentage(token);
    return parsed === null ? 0.5 : parsed;
  };

  const coverGeometry = (container, art) => {
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const naturalWidth =
      art.naturalWidth || Number(art.getAttribute("width")) || 1672;
    const naturalHeight =
      art.naturalHeight || Number(art.getAttribute("height")) || 941;
    const coordinateWidth =
      Number(art.getAttribute("width")) || naturalWidth;
    const coordinateHeight =
      Number(art.getAttribute("height")) || naturalHeight;
    const style = getComputedStyle(art);
    const scale =
      style.objectFit === "contain"
        ? Math.min(
            containerWidth / naturalWidth,
            containerHeight / naturalHeight,
          )
        : Math.max(
            containerWidth / naturalWidth,
            containerHeight / naturalHeight,
          );
    const width = naturalWidth * scale;
    const height = naturalHeight * scale;
    const left =
      (containerWidth - width) *
      positionPart(style.objectPosition, 0);
    const top =
      (containerHeight - height) *
      positionPart(style.objectPosition, 1);
    return {
      width,
      height,
      left,
      top,
      scale,
      naturalWidth,
      naturalHeight,
      coordinateWidth,
      coordinateHeight,
    };
  };

  const rememberServiceCallout = callout => {
    if (serviceGeometry.has(callout)) return serviceGeometry.get(callout);
    const style = getComputedStyle(callout);
    const values = {
      artX: finiteNumber(callout.dataset.artX),
      artY: finiteNumber(callout.dataset.artY),
      dotX: percentage(style.getPropertyValue("--dot-x")),
      dotY: percentage(style.getPropertyValue("--dot-y")),
      copyLeft: percentage(style.getPropertyValue("--copy-left")),
      copyRight: percentage(style.getPropertyValue("--copy-right")),
      copyTop: percentage(style.getPropertyValue("--copy-top")),
    };
    serviceGeometry.set(callout, values);
    return values;
  };

  const updateAnnotationWire = (
    frame,
    callout,
    copy,
    geometry,
    dotX,
    dotY,
  ) => {
    const annotationId = callout.dataset.annotation;
    if (!annotationId) return;
    const wire = [...frame.querySelectorAll(".annotation-wire")].find(
      layer => layer.dataset.line === annotationId,
    );
    const path = wire?.querySelector("path");
    if (!path || dotX === null || dotY === null) return;

    const copyLeft = copy.offsetLeft;
    const copyTop = copy.offsetTop;
    const copyWidth = copy.offsetWidth;
    const copyHeight = copy.offsetHeight;
    const copyIsRight = copyLeft + copyWidth / 2 > dotX;
    const targetX = copyIsRight
      ? copyLeft
      : copyLeft + copyWidth;
    const targetY = clamp(
      dotY,
      copyTop + 14,
      copyTop + copyHeight - 14,
    );
    const elbowX = dotX + (targetX - dotX) * 0.55;
    const naturalX = value =>
      ((value - geometry.left) / geometry.width) *
      geometry.coordinateWidth;
    const naturalY = value =>
      ((value - geometry.top) / geometry.height) *
      geometry.coordinateHeight;

    path.setAttribute(
      "d",
      `M ${naturalX(dotX).toFixed(1)} ${naturalY(dotY).toFixed(1)} ` +
        `L ${naturalX(elbowX).toFixed(1)} ${naturalY(dotY).toFixed(1)} ` +
        `L ${naturalX(targetX).toFixed(1)} ${naturalY(targetY).toFixed(1)}`,
    );
  };

  const mapCoordinate = (start, size, ratio) =>
    ratio === null ? null : start + size * ratio;

  const clamp = (value, minimum, maximum) =>
    Math.min(Math.max(value, minimum), Math.max(minimum, maximum));

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

  const idealCopyPosition = (
    side,
    dotX,
    dotY,
    copyWidth,
    copyHeight,
  ) => {
    if (side === "left") {
      return {
        left: dotX - copyWidth - dotClearance,
        top: dotY - copyHeight / 2,
      };
    }
    if (side === "right") {
      return {
        left: dotX + dotClearance,
        top: dotY - copyHeight / 2,
      };
    }
    if (side === "above") {
      return {
        left: dotX - copyWidth / 2,
        top: dotY - copyHeight - dotClearance,
      };
    }
    return {
      left: dotX - copyWidth / 2,
      top: dotY + dotClearance,
    };
  };

  const headerSafeTop = (frame, frameRect) => {
    const header =
      frame.querySelector(".site-header") ||
      document.querySelector(".site-header");
    if (!header) return safeInset;
    const headerRect = header.getBoundingClientRect();
    const overlapsFrame =
      headerRect.bottom > frameRect.top && headerRect.top < frameRect.bottom;
    return overlapsFrame
      ? Math.max(safeInset, headerRect.bottom - frameRect.top + 12)
      : safeInset;
  };

  const copyBounds = (frame, frameRect, copyHeight) => {
    const frameIsVisible =
      frameRect.bottom > safeInset && frameRect.top < innerHeight - safeInset;
    const minimumTop = frameIsVisible
      ? Math.max(
          safeInset,
          -frameRect.top + safeInset,
          headerSafeTop(frame, frameRect),
        )
      : safeInset;
    const maximumTop = frameIsVisible
      ? Math.min(
          frame.clientHeight - copyHeight - 76,
          innerHeight - frameRect.top - copyHeight - safeInset,
        )
      : frame.clientHeight - copyHeight - 76;
    return {
      minimumTop,
      maximumTop: Math.max(minimumTop, maximumTop),
    };
  };

  const copyOverlapsDot = (
    left,
    top,
    copyWidth,
    copyHeight,
    dotX,
    dotY,
  ) =>
    dotX >= left - 22 &&
    dotX <= left + copyWidth + 22 &&
    dotY >= top - 22 &&
    dotY <= top + copyHeight + 22;

  const protectedSelectors = [
    ".site-header",
    ".opening-copy",
    ".process-opening-copy",
    ".journey-intro",
    ".proof-content",
    ".method-copy",
    ".editorial-copy",
    ".process-editorial-content",
    ".map-interface",
    ".copy-panel",
    ".scene-inner > .copy",
    ".scroll-cue",
  ].join(",");

  const protectedRects = (frame, frameRect) => {
    const elements = [
      ...new Set([
        ...frame.querySelectorAll(protectedSelectors),
        ...document.querySelectorAll(
          ".site-header, .motion-toggle, .scene-nav",
        ),
      ]),
    ];
    return elements
      .filter(element => {
        const style = getComputedStyle(element);
        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number(style.opacity || 1) > 0
        );
      })
      .map(element => element.getBoundingClientRect())
      .filter(
        rect =>
          rect.width > 0 &&
          rect.height > 0 &&
          rect.right > frameRect.left &&
          rect.left < frameRect.right &&
          rect.bottom > frameRect.top &&
          rect.top < frameRect.bottom,
      )
      .map(rect => ({
        bottom: rect.bottom - frameRect.top + 12,
        left: rect.left - frameRect.left - 12,
        right: rect.right - frameRect.left + 12,
        top: rect.top - frameRect.top - 12,
      }));
  };

  const overlapArea = (left, top, width, height, obstacle) => {
    const overlapWidth = Math.max(
      0,
      Math.min(left + width, obstacle.right) - Math.max(left, obstacle.left),
    );
    const overlapHeight = Math.max(
      0,
      Math.min(top + height, obstacle.bottom) - Math.max(top, obstacle.top),
    );
    return overlapWidth * overlapHeight;
  };

  const inferPreferredSide = (
    callout,
    preferredLeft,
    preferredTop,
    copyWidth,
    copyHeight,
    dotX,
    dotY,
  ) => {
    if (preferredCopySides.has(callout)) {
      return preferredCopySides.get(callout);
    }
    const deltaX = preferredLeft + copyWidth / 2 - dotX;
    const deltaY = preferredTop + copyHeight / 2 - dotY;
    const side =
      Math.abs(deltaX) >= Math.abs(deltaY)
        ? deltaX < 0
          ? "left"
          : "right"
        : deltaY < 0
          ? "above"
          : "below";
    preferredCopySides.set(callout, side);
    return side;
  };

  const chooseCopyPosition = (
    frame,
    frameRect,
    preferred,
    dotX,
    dotY,
    copyWidth,
    copyHeight,
    sides = candidateOrder(preferred),
  ) => {
    const { minimumTop, maximumTop } = copyBounds(
      frame,
      frameRect,
      copyHeight,
    );
    const maximumLeft = Math.max(
      safeInset,
      frame.clientWidth - copyWidth - safeInset,
    );
    const obstacles = protectedRects(frame, frameRect);

    return sides
      .map((side, index) => {
        const ideal = idealCopyPosition(
          side,
          dotX,
          dotY,
          copyWidth,
          copyHeight,
        );
        const left = clamp(ideal.left, safeInset, maximumLeft);
        const top = clamp(ideal.top, minimumTop, maximumTop);
        const displacement = Math.hypot(left - ideal.left, top - ideal.top);
        const overlap = copyOverlapsDot(
          left,
          top,
          copyWidth,
          copyHeight,
          dotX,
          dotY,
        );
        const collisionArea = obstacles.reduce(
          (total, obstacle) =>
            total +
            overlapArea(left, top, copyWidth, copyHeight, obstacle),
          0,
        );
        return {
          left,
          side,
          top,
          score:
            (overlap ? 100000 : 0) +
            (collisionArea ? 50000 + collisionArea : 0) +
            displacement * 4 +
            index * 28,
        };
      })
      .sort((a, b) => a.score - b.score)[0];
  };

  const updateServiceFrame = frame => {
    const art = frame.querySelector(".campaign-art");
    if (!art) return;
    frame.classList.remove("uses-annotation-summary");
    const geometry = coverGeometry(frame, art);
    let hasClippedHotspot = false;

    frame
      .querySelectorAll(".annotation-lines, .energy-shimmer")
      .forEach(layer => {
        Object.assign(layer.style, {
          inset: "auto",
          left: `${geometry.left}px`,
          top: `${geometry.top}px`,
          width: `${geometry.width}px`,
          height: `${geometry.height}px`,
        });
      });
    frame.querySelectorAll(".annotation-lines").forEach(layer => {
      layer.setAttribute(
        "viewBox",
        `0 0 ${geometry.coordinateWidth} ${geometry.coordinateHeight}`,
      );
    });

    frame.querySelectorAll(".annotation-callout").forEach((callout, index) => {
      const original = rememberServiceCallout(callout);
      const dotX =
        original.artX === null
          ? mapCoordinate(geometry.left, geometry.width, original.dotX)
          : geometry.left +
            geometry.width *
              (original.artX / geometry.coordinateWidth);
      const dotY =
        original.artY === null
          ? mapCoordinate(geometry.top, geometry.height, original.dotY)
          : geometry.top +
            geometry.height *
              (original.artY / geometry.coordinateHeight);
      const originalCopyLeft = mapCoordinate(
        geometry.left,
        geometry.width,
        original.copyLeft,
      );
      const originalCopyTop = mapCoordinate(
        geometry.top,
        geometry.height,
        original.copyTop,
      );
      const originalCopyRight =
        original.copyRight === null
          ? null
          : frame.clientWidth -
            mapCoordinate(
              geometry.left,
              geometry.width,
              1 - original.copyRight,
            );

      if (
        dotX !== null &&
        dotY !== null &&
        (dotX < 12 ||
          dotX > frame.clientWidth - 12 ||
          dotY < 12 ||
          dotY > frame.clientHeight - 12)
      ) {
        hasClippedHotspot = true;
      }

      if (dotX !== null) callout.style.setProperty("--dot-x", `${dotX}px`);
      if (dotY !== null) callout.style.setProperty("--dot-y", `${dotY}px`);
      callout.style.setProperty(
        "--annotation-delay",
        `${index * -0.42}s`,
      );

      const copy = callout.querySelector(".annotation-copy");
      if (!copy || dotX === null || dotY === null) return;
      const copyWidth = copy.offsetWidth;
      const copyHeight = copy.offsetHeight;
      if (!copyWidth || !copyHeight) return;
      const frameRect = frame.getBoundingClientRect();
      const preferredLeft =
        originalCopyLeft ??
        (originalCopyRight === null
          ? copy.offsetLeft
          : frame.clientWidth - originalCopyRight - copyWidth);
      const preferredTop = originalCopyTop ?? copy.offsetTop;
      const preferred = inferPreferredSide(
        callout,
        preferredLeft,
        preferredTop,
        copyWidth,
        copyHeight,
        dotX,
        dotY,
      );
      const position = chooseCopyPosition(
        frame,
        frameRect,
        preferred,
        dotX,
        dotY,
        copyWidth,
        copyHeight,
      );
      callout.style.setProperty("--copy-left", `${position.left}px`);
      callout.style.setProperty("--copy-right", "auto");
      callout.style.setProperty("--copy-top", `${position.top}px`);
      updateAnnotationWire(
        frame,
        callout,
        copy,
        geometry,
        dotX,
        dotY,
      );
    });

    const hasMobileAlternative = Boolean(
      frame.querySelector(".journey-mobile-steps"),
    );
    const useSummary =
      (innerWidth <= 640 && !hasMobileAlternative) ||
      (innerWidth >= 641 && (innerWidth <= 820 || hasClippedHotspot));
    frame.classList.toggle("uses-annotation-summary", useSummary);

    frame.querySelectorAll(".tablet-annotations").forEach(details => {
      const home = summaryHomes.get(details);
      const useOverlay = useSummary && innerWidth > 1024;
      details.classList.toggle("is-overlay", useOverlay);
      if (useOverlay && details.parentElement !== frame) {
        frame.append(details);
      } else if (!useOverlay && home && details.parentElement !== home) {
        home.append(details);
      }
    });
  };

  const rememberAboutAnnotation = annotation => {
    if (aboutGeometry.has(annotation)) return aboutGeometry.get(annotation);
    const style = getComputedStyle(annotation);
    const values = {
      artX: finiteNumber(annotation.dataset.artX),
      artY: finiteNumber(annotation.dataset.artY),
      x: percentage(style.getPropertyValue("--x")),
      y: percentage(style.getPropertyValue("--y")),
    };
    aboutGeometry.set(annotation, values);
    return values;
  };

  const updateAboutScene = scene => {
    const art = scene.querySelector(".scene-art");
    const inner = scene.querySelector(".scene-inner");
    if (!art || !inner) return;
    const geometry = coverGeometry(scene, art);
    const headerHeight = inner.offsetTop;
    const referenceHeader = 90;
    const referenceInnerHeight =
      geometry.coordinateHeight - referenceHeader;

    inner
      .querySelectorAll(":scope > .annotation")
      .forEach((annotation, index) => {
        const original = rememberAboutAnnotation(annotation);
        annotation.style.setProperty(
          "--annotation-delay",
          `${index * -0.42}s`,
        );
        if (original.artX !== null) {
          annotation.style.setProperty(
            "--x",
            `${
              geometry.left +
              geometry.width *
                (original.artX / geometry.coordinateWidth)
            }px`,
          );
        } else if (original.x !== null) {
          annotation.style.setProperty(
            "--x",
            `${geometry.left + geometry.width * original.x}px`,
          );
        }
        if (original.artY !== null) {
          annotation.style.setProperty(
            "--y",
            `${
              geometry.top +
              geometry.height *
                (original.artY / geometry.coordinateHeight) -
              headerHeight
            }px`,
          );
        } else if (original.y !== null) {
          const sourceY =
            referenceHeader + referenceInnerHeight * original.y;
          annotation.style.setProperty(
            "--y",
            `${geometry.top + sourceY * geometry.scale - headerHeight}px`,
          );
        }

        const copy = annotation.querySelector(".annotation-copy");
        if (!copy || copy.hidden) return;
        const copyWidth = copy.offsetWidth;
        const copyHeight = copy.offsetHeight;
        if (!copyWidth || !copyHeight) return;
        const sceneRect = scene.getBoundingClientRect();
        const dot = annotation.querySelector(".annotation-dot");
        const dotRect = dot?.getBoundingClientRect();
        if (!dot || !dotRect) return;
        const dotX = dotRect.left + dotRect.width / 2 - sceneRect.left;
        const dotY = dotRect.top + dotRect.height / 2 - sceneRect.top;
        const preferred = annotation.classList.contains("flip")
          ? "left"
          : "right";
        const position = chooseCopyPosition(
          scene,
          sceneRect,
          preferred,
          dotX,
          dotY,
          copyWidth,
          copyHeight,
        );

        copy.style.setProperty("top", `${position.top - dotY}px`);
        copy.style.setProperty("left", `${position.left - dotX}px`);
        copy.style.setProperty("right", "auto");
        copy.style.setProperty("--copy-shift-y", "0px");
        const copyIsRight = position.left + copyWidth / 2 > dotX;
        const targetX = copyIsRight
          ? position.left
          : position.left + copyWidth;
        const targetY = clamp(
          dotY,
          position.top + 14,
          position.top + copyHeight - 14,
        );
        const lineX = targetX - dotX;
        const lineY = targetY - dotY;
        annotation.classList.toggle("flip", !copyIsRight);
        annotation.style.setProperty(
          "--leader-length",
          `${Math.hypot(lineX, lineY)}px`,
        );
        annotation.style.setProperty(
          "--leader-angle",
          `${Math.atan2(lineY, lineX)}rad`,
        );
      });
  };

  const syncMotionToggleVisibility = () => {
    const shouldHide =
      innerWidth <= 640 &&
      serviceFrames.some(
        frame =>
          frame.classList.contains("uses-annotation-summary") &&
          frame.querySelector(".tablet-annotations[open]"),
      );
    document.querySelectorAll(".motion-toggle").forEach(toggle => {
      if (shouldHide && !toggle.hidden) {
        toggle.dataset.annotationSummaryHidden = "true";
        toggle.hidden = true;
        toggle.style.setProperty("display", "none", "important");
      } else if (
        !shouldHide &&
        toggle.dataset.annotationSummaryHidden === "true"
      ) {
        delete toggle.dataset.annotationSummaryHidden;
        toggle.hidden = false;
        toggle.style.removeProperty("display");
      }
    });
  };

  const revealSummaryContent = details => {
    if (!details.open || innerWidth > 640) return;
    requestAnimationFrame(() => {
      const scrollContainer = details.parentElement;
      if (
        !scrollContainer ||
        scrollContainer.scrollHeight <= scrollContainer.clientHeight
      ) {
        return;
      }
      const containerRect = scrollContainer.getBoundingClientRect();
      const detailsRect = details.getBoundingClientRect();
      const clippedHeight = detailsRect.bottom - (containerRect.bottom - 12);
      if (clippedHeight > 0) {
        scrollContainer.scrollTop += clippedHeight;
      }
    });
  };

  const addTabletAnnotationSummaries = () => {
    serviceFrames.forEach(frame => {
      const callouts = [...frame.querySelectorAll(".annotation-callout")];
      if (!callouts.length || frame.querySelector(".tablet-annotations")) {
        return;
      }
      const target = frame.querySelector(
        ".opening-copy, .process-opening-copy, .journey-intro, " +
          ".proof-content, .method-copy, .editorial-copy, " +
          ".process-editorial-content, .map-interface",
      );
      if (!target) return;

      const details = document.createElement("details");
      details.className = "tablet-annotations";
      const summary = document.createElement("summary");
      summary.textContent = "Punkty na ilustracji";
      const list = document.createElement("ul");

      callouts.forEach(callout => {
        const source = callout.querySelector(".annotation-copy");
        if (!source) return;
        const item = document.createElement("li");
        item.innerHTML = source.innerHTML;
        list.append(item);
      });

      if (!list.children.length) return;
      details.append(summary, list);
      details.addEventListener("toggle", () => {
        syncMotionToggleVisibility();
        revealSummaryContent(details);
      });
      target.append(details);
      summaryHomes.set(details, target);
    });
  };

  const update = () => {
    serviceFrames.forEach(updateServiceFrame);
    aboutScenes.forEach(updateAboutScene);
    syncMotionToggleVisibility();
  };
  const updateOpenCallouts = () => {
    serviceFrames
      .filter(frame => frame.querySelector(".annotation-callout.is-open"))
      .forEach(updateServiceFrame);
    aboutScenes
      .filter(scene => scene.querySelector(".annotation.is-open"))
      .forEach(updateAboutScene);
  };

  addTabletAnnotationSummaries();
  update();
  addEventListener("load", update, { once: true });
  addEventListener("resize", update, { passive: true });
  let scrollUpdateQueued = false;
  addEventListener(
    "scroll",
    () => {
      if (scrollUpdateQueued) return;
      scrollUpdateQueued = true;
      requestAnimationFrame(() => {
        scrollUpdateQueued = false;
        updateOpenCallouts();
      });
    },
    { passive: true },
  );
  document.fonts?.ready.then(update);

  serviceFrames.forEach(frame => {
    frame.querySelectorAll(".annotation-callout").forEach(callout => {
      const refresh = () =>
        requestAnimationFrame(() => updateServiceFrame(frame));
      callout.addEventListener("pointerenter", refresh);
      callout
        .querySelector(".annotation-dot")
        ?.addEventListener("focus", refresh);
      callout
        .querySelector(".annotation-dot")
        ?.addEventListener("click", refresh);
    });
  });

  aboutScenes.forEach(scene => {
    scene.querySelectorAll(":scope .annotation").forEach(annotation => {
      const refresh = () =>
        requestAnimationFrame(() => updateAboutScene(scene));
      annotation.addEventListener("mouseenter", refresh);
      annotation
        .querySelector(".annotation-dot")
        ?.addEventListener("focus", refresh);
      annotation
        .querySelector(".annotation-dot")
        ?.addEventListener("click", refresh);
    });
  });

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(update);
    serviceFrames.forEach(frame => observer.observe(frame));
    aboutScenes.forEach(scene => observer.observe(scene));
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) updateServiceFrame(entry.target);
      });
    });
    serviceFrames.forEach(frame => observer.observe(frame));
  }
})();
