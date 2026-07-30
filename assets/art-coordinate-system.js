(() => {
  const serviceFrames = [
    ...document.querySelectorAll(
      ".campaign-frame, .social-frame, .process-frame, .diagnosis-frame",
    ),
  ];
  const aboutScenes = [...document.querySelectorAll(".scene")];
  const serviceGeometry = new WeakMap();
  const aboutGeometry = new WeakMap();
  const summaryHomes = new WeakMap();

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
      const copyLeft = mapCoordinate(
        geometry.left,
        geometry.width,
        original.copyLeft,
      );
      const copyTop = mapCoordinate(
        geometry.top,
        geometry.height,
        original.copyTop,
      );
      const copyRight =
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
      if (original.copyLeft === null) {
        callout.style.setProperty("--copy-left", "auto");
      }
      if (original.copyRight === null) {
        callout.style.setProperty("--copy-right", "auto");
      }
      if (copyLeft !== null) {
        callout.style.setProperty("--copy-left", `${copyLeft}px`);
      }
      if (copyRight !== null) {
        callout.style.setProperty("--copy-left", "auto");
        callout.style.setProperty("--copy-right", `${copyRight}px`);
      }
      if (copyTop !== null) {
        callout.style.setProperty("--copy-top", `${copyTop}px`);
      }

      const copy = callout.querySelector(".annotation-copy");
      if (!copy) return;
      const safeInset = 24;
      const copyWidth = copy.offsetWidth;
      const copyHeight = copy.offsetHeight;
      const frameRect = frame.getBoundingClientRect();
      const frameIsVisible =
        frameRect.bottom > safeInset &&
        frameRect.top < innerHeight - safeInset;
      const visibleMinimumTop = frameIsVisible
        ? Math.max(safeInset, -frameRect.top + safeInset)
        : safeInset;
      const visibleMaximumTop = frameIsVisible
        ? Math.min(
            frame.clientHeight - copyHeight - 76,
            innerHeight - frameRect.top - copyHeight - safeInset,
          )
        : frame.clientHeight - copyHeight - 76;
      const boundedTop = clamp(
        copyTop ?? safeInset,
        visibleMinimumTop,
        visibleMaximumTop,
      );
      callout.style.setProperty("--copy-top", `${boundedTop}px`);

      if (copyLeft !== null) {
        const boundedLeft = clamp(
          copyLeft,
          safeInset,
          frame.clientWidth - copyWidth - safeInset,
        );
        callout.style.setProperty("--copy-left", `${boundedLeft}px`);
      } else if (copyRight !== null) {
        const desiredLeft = frame.clientWidth - copyRight - copyWidth;
        const boundedLeft = clamp(
          desiredLeft,
          safeInset,
          frame.clientWidth - copyWidth - safeInset,
        );
        callout.style.setProperty(
          "--copy-right",
          `${frame.clientWidth - boundedLeft - copyWidth}px`,
        );
      }

      const renderedLeft = copy.offsetLeft;
      const renderedTop = copy.offsetTop;
      const overlapsDot =
        dotX !== null &&
        dotY !== null &&
        dotX >= renderedLeft - 22 &&
        dotX <= renderedLeft + copyWidth + 22 &&
        dotY >= renderedTop - 22 &&
        dotY <= renderedTop + copyHeight + 22;
      if (overlapsDot) {
        const copyIsLeft = renderedLeft + copyWidth / 2 <= dotX;
        const separatedLeft = copyIsLeft
          ? dotX - copyWidth - 30
          : dotX + 30;
        const boundedLeft = clamp(
          separatedLeft,
          safeInset,
          frame.clientWidth - copyWidth - safeInset,
        );
        callout.style.setProperty("--copy-left", `${boundedLeft}px`);
        callout.style.setProperty("--copy-right", "auto");
      }
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
      copy.style.setProperty("--copy-shift-y", "0px");
      annotation.style.removeProperty("--leader-height");
      const copyTop =
        headerHeight + annotation.offsetTop + copy.offsetTop;
      const sceneRect = scene.getBoundingClientRect();
      const sceneIsVisible =
        sceneRect.bottom > 16 && sceneRect.top < innerHeight - 16;
      const minimumTop = sceneIsVisible
        ? Math.max(headerHeight + 16, -sceneRect.top + 16)
        : headerHeight + 16;
      const maximumBottom = sceneIsVisible
        ? Math.min(
            scene.clientHeight - 76,
            innerHeight - sceneRect.top - 76,
          )
        : scene.clientHeight - 76;
      let shift = 0;
      if (copyTop < minimumTop) {
        shift = minimumTop - copyTop;
      } else if (copyTop + copy.offsetHeight > maximumBottom) {
        shift = maximumBottom - copyTop - copy.offsetHeight;
      }
      copy.style.setProperty("--copy-shift-y", `${shift}px`);
      const drop = parseFloat(
        getComputedStyle(annotation).getPropertyValue("--drop"),
      );
      if (Number.isFinite(drop)) {
        annotation.style.setProperty(
          "--leader-height",
          `${Math.max(0, drop + shift)}px`,
        );
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
      target.append(details);
      summaryHomes.set(details, target);
    });
  };

  const update = () => {
    serviceFrames.forEach(updateServiceFrame);
    aboutScenes.forEach(updateAboutScene);
  };

  addTabletAnnotationSummaries();
  update();
  addEventListener("load", update, { once: true });
  addEventListener("resize", update, { passive: true });
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
