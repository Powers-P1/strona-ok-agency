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
    };
  };

  const rememberServiceCallout = callout => {
    if (serviceGeometry.has(callout)) return serviceGeometry.get(callout);
    const style = getComputedStyle(callout);
    const values = {
      dotX: percentage(style.getPropertyValue("--dot-x")),
      dotY: percentage(style.getPropertyValue("--dot-y")),
      copyLeft: percentage(style.getPropertyValue("--copy-left")),
      copyRight: percentage(style.getPropertyValue("--copy-right")),
      copyTop: percentage(style.getPropertyValue("--copy-top")),
    };
    serviceGeometry.set(callout, values);
    return values;
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

    frame.querySelectorAll(".annotation-callout").forEach(callout => {
      const original = rememberServiceCallout(callout);
      const dotX = mapCoordinate(
        geometry.left,
        geometry.width,
        original.dotX,
      );
      const dotY = mapCoordinate(
        geometry.top,
        geometry.height,
        original.dotY,
      );
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
      if (copyLeft !== null) {
        callout.style.setProperty("--copy-left", `${copyLeft}px`);
      }
      if (copyRight !== null) {
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
      const boundedTop = clamp(
        copyTop ?? safeInset,
        safeInset,
        frame.clientHeight - copyHeight - safeInset,
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
    const referenceInnerHeight = geometry.naturalHeight - referenceHeader;

    inner.querySelectorAll(":scope > .annotation").forEach(annotation => {
      const original = rememberAboutAnnotation(annotation);
      if (original.x !== null) {
        annotation.style.setProperty(
          "--x",
          `${geometry.left + geometry.width * original.x}px`,
        );
      }
      if (original.y !== null) {
        const sourceY =
          referenceHeader + referenceInnerHeight * original.y;
        annotation.style.setProperty(
          "--y",
          `${geometry.top + sourceY * geometry.scale - headerHeight}px`,
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

  if ("ResizeObserver" in window) {
    const observer = new ResizeObserver(update);
    serviceFrames.forEach(frame => observer.observe(frame));
    aboutScenes.forEach(scene => observer.observe(scene));
  }
})();
