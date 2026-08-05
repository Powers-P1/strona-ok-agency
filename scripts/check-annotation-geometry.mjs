import process from "node:process";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SCENE_SELECTOR = [
  ".campaign-frame",
  ".social-frame",
  ".process-frame",
  ".diagnosis-frame",
  ".about-page .scene",
].join(",");
const CALLOUT_SELECTOR = ".annotation-callout, .annotation";
const CONTENT_SELECTOR = [
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
const FIXED_UI_SELECTOR = ".site-header, .motion-toggle, .scroll-cue";

const ROUTES = [
  { path: "/strony-internetowe", callouts: 8 },
  { path: "/kampanie", callouts: 8 },
  { path: "/social-media", callouts: 8 },
  { path: "/proces", callouts: 10 },
  { path: "/diagnoza", callouts: 7 },
  { path: "/o-nas", callouts: 12 },
];

const VIEWPORTS = [
  { width: 820, height: 900 },
  { width: 821, height: 900 },
  { width: 900, height: 900 },
  { width: 1024, height: 900 },
  { width: 1100, height: 900 },
  { width: 1180, height: 900 },
  { width: 1181, height: 900 },
  { width: 1280, height: 720 },
  { width: 1512, height: 982 },
  { width: 1512, height: 800 },
  { width: 1920, height: 900 },
  { width: 2560, height: 900 },
  { width: 2560, height: 1440 },
  { width: 3440, height: 1440 },
  { width: 3840, height: 2160 },
  { width: 7680, height: 4320 },
  { width: 390, height: 844 },
  { width: 360, height: 640 },
];

const TIMEOUT = 15_000;
const failures = [];
const requestedRoute = process.env.OK_ANNOTATION_ROUTE || "";
const requestedViewport = process.env.OK_ANNOTATION_VIEWPORT || "";
const webkitAudit = process.argv.includes("--webkit");
const browserType = webkitAudit ? webkit : chromium;
const consentInit = () => {
  localStorage.setItem("ok-consent", JSON.stringify({
    version: 3,
    level: "denied",
    at: new Date().toISOString(),
  }));
};

const viewportName = viewport => `${viewport.width}x${viewport.height}`;

const addFailure = (route, viewport, scene, key, message) => {
  failures.push({
    route,
    viewport: typeof viewport === "string" ? viewport : viewportName(viewport),
    scene: scene || "document",
    key: key || "general",
    message,
  });
};

const frames = async page => {
  await page.evaluate(() => new Promise(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  }));
};

const settleLayout = async page => {
  await page.evaluate(async () => {
    window.OKAgencyResponsiveSafety?.refresh?.();
    window.dispatchEvent(new CustomEvent("okagency:art-safety-change", {
      detail: { source: "annotation-geometry-audit" },
    }));
    await new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    });
  });
};

const waitForDocumentReady = async page => {
  await page.evaluate(async () => {
    if (document.fonts) await document.fonts.ready;
  });
  await page.waitForFunction(() => {
    const api = window.OKAgencyResponsiveSafety;
    if (document.fonts?.status && document.fonts.status !== "loaded") return false;
    return typeof api?.getArtBounds === "function";
  }, null, { timeout: TIMEOUT });
  await settleLayout(page);
};

const activateScene = async (page, route, index) => {
  if (route === "/o-nas" && index > 0) {
    await page.evaluate(nextIndex => {
      document.querySelector(`[data-go="${nextIndex}"]`)?.click();
    }, index);
  } else if (route === "/diagnoza" && index === 1) {
    await page.evaluate(() => document.querySelector("[data-start-diagnosis]")?.click());
  } else if (route === "/diagnoza" && index === 2) {
    for (let step = 1; step <= 4; step += 1) {
      await page.evaluate(() => {
        document.querySelector(".quiz-question.is-active [data-question][data-value]")?.click();
      });
      await frames(page);
    }
  }

  const scene = page.locator(SCENE_SELECTOR).nth(index);
  await scene.evaluate(element => element.scrollIntoView({ block: "start", behavior: "auto" }));
  await page.waitForFunction(({ selector, sceneIndex }) => {
    const current = document.querySelectorAll(selector)[sceneIndex];
    if (!current) return false;
    const art = current.querySelector(":scope > .campaign-art, :scope > .scene-art");
    return !art || (art.complete && art.naturalWidth > 0);
  }, { selector: SCENE_SELECTOR, sceneIndex: index }, { timeout: TIMEOUT });
  await settleLayout(page);
};

const waitForSceneMode = async (page, index, mobile) => {
  await page.waitForFunction(({ selector, sceneIndex, isMobile }) => {
    const scene = document.querySelectorAll(selector)[sceneIndex];
    if (!scene) return false;
    if (scene.matches("[inert]") || scene.closest("[inert]") || scene.getAttribute("aria-hidden") === "true") {
      return false;
    }
    const callouts = [...scene.querySelectorAll(".annotation-callout, .annotation")];
    if (!callouts.length || isMobile) return true;
    if (scene.querySelector(".is-obscured")) return false;

    const art = scene.querySelector(":scope > .campaign-art, :scope > .scene-art");
    const api = window.OKAgencyResponsiveSafety;
    if (!(api?.getArtBounds?.(scene) || (art && api?.getArtBounds?.(art)))) return false;

    const visible = element => {
      if (!element || element.hidden) return false;
      const bounds = element.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return false;
      for (let node = element; node instanceof Element; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden") return false;
        if (Number.parseFloat(style.opacity || "1") <= 0.01) return false;
      }
      return true;
    };

    return callouts.every(callout => {
      const state = callout.dataset.okAnchorState;
      if (state === "placed") return visible(callout.querySelector(".annotation-dot"));
      if (state === "hidden") return !visible(callout.querySelector(".annotation-dot"));
      return false;
    });
  }, { selector: SCENE_SELECTOR, sceneIndex: index, isMobile: mobile }, { timeout: TIMEOUT });
};

const auditScene = async (page, index, mobile) => page.evaluate(({
  selector,
  sceneIndex,
  isMobile,
  calloutSelector,
  contentSelector,
  fixedUiSelector,
}) => {
  const SAFE_INSET = 24;
  const BOTTOM_CLEARANCE = 88;
  const UI_CLEARANCE = 16;
  const TARGET_SIZE = 44;
  const TOLERANCE = 1;
  const issues = [];
  const scene = document.querySelectorAll(selector)[sceneIndex];
  if (!scene) return { id: `scene-${sceneIndex + 1}`, issues: [{ key: "scene", message: "missing scene" }], pointIndexes: [] };

  const sceneId = scene.id || scene.dataset.act || `scene-${sceneIndex + 1}`;
  const callouts = [...scene.querySelectorAll(calloutSelector)];
  const sceneRect = scene.getBoundingClientRect();
  const issue = (key, message) => issues.push({ key, message });
  const keyFor = (callout, calloutIndex) => (
    callout.dataset.annotation
    || callout.querySelector(".annotation-dot")?.getAttribute("aria-controls")
    || callout.id
    || `callout-${calloutIndex + 1}`
  );
  const box = bounds => ({
    left: bounds.left,
    top: bounds.top,
    right: bounds.right,
    bottom: bounds.bottom,
    width: bounds.width,
    height: bounds.height,
  });
  const visible = element => {
    if (!element || element.hidden) return false;
    const bounds = element.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return false;
    for (let node = element; node instanceof Element; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") return false;
      if (Number.parseFloat(style.opacity || "1") <= 0.01) return false;
    }
    return true;
  };
  const visibleComponent = element => (
    visible(element)
    || [...element.querySelectorAll(".annotation-dot, .annotation-copy, path, summary")].some(visible)
  );
  const intersects = (first, second) => (
    first.left < second.right
    && first.right > second.left
    && first.top < second.bottom
    && first.bottom > second.top
  );
  const expand = (bounds, amount) => ({
    left: bounds.left - amount,
    top: bounds.top - amount,
    right: bounds.right + amount,
    bottom: bounds.bottom + amount,
  });
  const inside = (outer, inner) => (
    inner.left >= outer.left - TOLERANCE
    && inner.top >= outer.top - TOLERANCE
    && inner.right <= outer.right + TOLERANCE
    && inner.bottom <= outer.bottom + TOLERANCE
  );

  if (Math.abs(scene.clientHeight - innerHeight) > 2) {
    issue("scene-height", `scene clientHeight ${scene.clientHeight}px differs from 100svh ${innerHeight}px`);
  }
  const sceneStyle = getComputedStyle(scene);
  const sceneScrollsX = /(auto|scroll)/.test(sceneStyle.overflowX)
    && scene.scrollWidth > scene.clientWidth + 1;
  const sceneScrollsY = /(auto|scroll)/.test(sceneStyle.overflowY)
    && scene.scrollHeight > scene.clientHeight + 1;
  if (sceneScrollsX || sceneScrollsY) {
    issue(
      "scene-overflow",
      `scene creates a scroll container: scroll ${scene.scrollWidth}x${scene.scrollHeight}, client ${scene.clientWidth}x${scene.clientHeight}`,
    );
  }

  [...scene.querySelectorAll("*")].forEach((element, nestedIndex) => {
    const style = getComputedStyle(element);
    const scrollsX = /(auto|scroll)/.test(style.overflowX) && element.scrollWidth > element.clientWidth + 1;
    const scrollsY = /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1;
    if (!scrollsX && !scrollsY) return;
    const label = element.id
      ? `#${element.id}`
      : element.classList.length
        ? `.${[...element.classList].slice(0, 2).join(".")}`
        : `${element.tagName.toLowerCase()}-${nestedIndex + 1}`;
    issue("nested-scroll", `${label} creates a nested scroll container`);
  });

  const documentWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  if (documentWidth > document.documentElement.clientWidth + 1) {
    issue("horizontal-overflow", `document scrollWidth ${documentWidth}px exceeds clientWidth ${document.documentElement.clientWidth}px`);
  }

  if (isMobile) {
    const visibleMobile = [...scene.querySelectorAll(
      ".annotation, .annotation-callout, .annotation-lines",
    )].filter(visibleComponent);
    visibleMobile.forEach((element, hiddenIndex) => {
      const key = element.dataset.annotation || element.id || `mobile-element-${hiddenIndex + 1}`;
      issue(key, `mobile must hide ${element.className.baseVal || element.className || element.tagName}`);
    });
    return { id: sceneId, issues, pointIndexes: [] };
  }

  const calloutStates = callouts.map((callout, calloutIndex) => ({
      callout,
      calloutIndex,
      dot: callout.querySelector(".annotation-dot"),
      copy: callout.querySelector(".annotation-copy"),
      key: keyFor(callout, calloutIndex),
      state: callout.dataset.okAnchorState,
    }));
  const visibleDots = calloutStates.filter(item => item.state === "placed" && visible(item.dot));
  const lines = [...scene.querySelectorAll(".annotation-lines")].filter(visible);
  const art = scene.querySelector(":scope > .campaign-art, :scope > .scene-art");
  if (scene.classList.contains("annotations-unavailable")) {
    issue("mode", "scene uses the removed annotations-unavailable hidden mode");
  }
  if (scene.textContent.includes("AUTHORED FALLBACK")) issue("mode", "scene exposes AUTHORED FALLBACK");

  calloutStates.forEach(({ callout, dot, copy, key, state }) => {
    if (state !== "placed" && state !== "hidden") {
      issue(key, `anchor state is ${state || "missing"}, expected placed or hidden`);
      return;
    }
    if (state === "placed") {
      if (!visible(dot)) issue(key, "placed anchor dot is not visible");
      if (callout.getAttribute("aria-hidden") === "true" || callout.inert) {
        issue(key, "placed callout remains hidden or inert");
      }
      if (dot.disabled || dot.tabIndex < 0 || dot.getAttribute("aria-hidden") === "true") {
        issue(key, "placed dot is disabled or removed from accessibility tree");
      }
      return;
    }

    const wireId = callout.dataset.line;
    const wire = wireId ? document.getElementById(wireId) : null;
    const path = wire?.querySelector("path");
    if (visible(dot) || visible(copy)) issue(key, "hidden anchor still exposes its dot or copy");
    if (callout.getAttribute("aria-hidden") !== "true" || !callout.inert) {
      issue(key, "hidden callout must be aria-hidden and inert");
    }
    if (!dot.disabled || dot.tabIndex !== -1 || dot.getAttribute("aria-hidden") !== "true") {
      issue(key, "hidden dot remains enabled, focusable, or exposed to ARIA");
    }
    if (dot.getAttribute("aria-expanded") !== "false" || copy?.getAttribute("aria-hidden") !== "true") {
      issue(key, "hidden annotation retains an open or exposed copy state");
    }
    if (wire?.classList.contains("is-open") || (path && getComputedStyle(path).visibility !== "hidden")) {
      issue(key, "hidden annotation retains a visible/open wire");
    }
  });

  const api = window.OKAgencyResponsiveSafety;
  const bounds = api?.getArtBounds?.(scene) || (art && api?.getArtBounds?.(art));
  const fullVisible = bounds?.fullVisible;
  const artVisible = fullVisible;
  if (!artVisible) issue("art-bounds", "OKAgencyResponsiveSafety.getArtBounds() has no fullVisible rect");

  const sceneSafe = {
    left: sceneRect.left + SAFE_INSET,
    top: sceneRect.top + SAFE_INSET,
    right: sceneRect.right - SAFE_INSET,
    bottom: sceneRect.bottom - SAFE_INSET,
  };
  const artSafe = artVisible && {
    left: sceneRect.left + artVisible.left,
    top: sceneRect.top + artVisible.top,
    right: sceneRect.left + artVisible.right,
    bottom: sceneRect.top + artVisible.bottom,
  };
  const content = [...scene.querySelectorAll(contentSelector)].filter(visible).map(element => box(element.getBoundingClientRect()));
  const fixedUi = [...document.querySelectorAll(fixedUiSelector)].filter(visible).map(element => box(element.getBoundingClientRect()));

  visibleDots.forEach(({ dot, key }) => {
    const dotRect = box(dot.getBoundingClientRect());
    const centerY = dotRect.top - sceneRect.top + dotRect.height / 2;
    if (dotRect.width + TOLERANCE < TARGET_SIZE || dotRect.height + TOLERANCE < TARGET_SIZE) {
      issue(key, `target is ${dotRect.width.toFixed(1)}x${dotRect.height.toFixed(1)}px, expected at least 44x44`);
    }
    if (!inside(sceneSafe, dotRect)) issue(key, "full 44px target leaves the scene 24px safe inset");
    if (artSafe && !inside(artSafe, dotRect)) issue(key, "full 44px target leaves the fully visible safety-mask region");
    if (sceneRect.height - centerY + TOLERANCE < BOTTOM_CLEARANCE) {
      issue(key, `target center has ${(sceneRect.height - centerY).toFixed(1)}px bottom clearance, expected at least 88px`);
    }
    if (fixedUi.some(obstacle => intersects(dotRect, expand(obstacle, UI_CLEARANCE)))) {
      issue(key, "target intersects the 16px header/motion/cue clearance");
    }
    if (content.some(obstacle => intersects(dotRect, obstacle))) {
      issue(key, "target intersects protected scene content");
    }
  });

  for (let firstIndex = 0; firstIndex < visibleDots.length; firstIndex += 1) {
    const first = visibleDots[firstIndex];
    const firstRect = box(first.dot.getBoundingClientRect());
    for (let secondIndex = firstIndex + 1; secondIndex < visibleDots.length; secondIndex += 1) {
      const second = visibleDots[secondIndex];
      if (intersects(firstRect, box(second.dot.getBoundingClientRect()))) {
        issue(first.key, `target intersects sibling target ${second.key}`);
      }
    }
  }

  if (callouts.length) {
    const snapshotEntries = window.OKAgencyAnnotationGeometryDebug?.snapshot?.() || [];
    const calloutKeys = new Set(calloutStates.map(item => item.key));
    const debugSnapshot = snapshotEntries.find(entry => entry.scene === scene.id)
      || snapshotEntries.find(entry => (
        entry.selected?.length === callouts.length
        && entry.selected.every(selection => calloutKeys.has(selection.key))
      ));
    if (!debugSnapshot) {
      issue("debug", `runtime audit snapshot is unavailable; received ${snapshotEntries.map(entry => entry.scene || "unnamed").join(", ") || "none"}`);
    } else {
      if (!new Set(["solved", "partial", "hidden"]).has(debugSnapshot.status)) {
        issue("mode", `runtime status is ${debugSnapshot.status || "missing"}`);
      }
      if (debugSnapshot.selected?.length !== callouts.length) {
        issue("debug", `runtime snapshot exposes ${debugSnapshot.selected?.length || 0}/${callouts.length} selections`);
      }
      const placementMap = api?.getPlacementMap?.(scene) || (art && api?.getPlacementMap?.(art));
      debugSnapshot.selected?.forEach((selection, selectionIndex) => {
        if (selection.state !== "placed") return;
        const key = selection.key || keyFor(callouts[selectionIndex], selectionIndex);
        const minimum = selection.tier === "energy" ? 220 : selection.tier === "highlight" ? 96 : 1;
        const value = placementMap?.tierAt?.(selection.naturalX, selection.naturalY);
        if (!Number.isFinite(value) || value < minimum || value !== selection.value) {
          issue(key, `selected ${selection.tier || "unknown"} placement pixel is ${value}, expected at least ${minimum}`);
        }
      });
    }
  }

  return {
    id: sceneId,
    issues,
    pointIndexes: visibleDots.map(item => item.calloutIndex),
  };
}, {
  selector: SCENE_SELECTOR,
  sceneIndex: index,
  isMobile: mobile,
  calloutSelector: CALLOUT_SELECTOR,
  contentSelector: CONTENT_SELECTOR,
  fixedUiSelector: FIXED_UI_SELECTOR,
});

const waitForOpen = async (page, sceneIndex, calloutIndex) => {
  await page.waitForFunction(({ selector, sceneNumber, calloutNumber }) => {
    const callout = document.querySelectorAll(selector)[sceneNumber]
      ?.querySelectorAll(".annotation-callout, .annotation")[calloutNumber];
    const dot = callout?.querySelector(".annotation-dot");
    const copy = callout?.querySelector(".annotation-copy");
    return Boolean(
      callout?.classList.contains("is-open")
      && dot?.getAttribute("aria-expanded") === "true"
      && copy?.getAttribute("aria-hidden") === "false"
      && Number.parseFloat(getComputedStyle(copy).opacity || "0") > 0.99
    );
  }, {
    selector: SCENE_SELECTOR,
    sceneNumber: sceneIndex,
    calloutNumber: calloutIndex,
  }, { timeout: TIMEOUT });
};

const waitForClosed = async (page, sceneIndex, calloutIndex) => {
  await page.waitForFunction(({ selector, sceneNumber, calloutNumber }) => {
    const callout = document.querySelectorAll(selector)[sceneNumber]
      ?.querySelectorAll(".annotation-callout, .annotation")[calloutNumber];
    const dot = callout?.querySelector(".annotation-dot");
    const copy = callout?.querySelector(".annotation-copy");
    return Boolean(
      callout
      && !callout.classList.contains("is-open")
      && dot?.getAttribute("aria-expanded") === "false"
      && copy?.getAttribute("aria-hidden") === "true"
      && Number.parseFloat(getComputedStyle(copy).opacity || "0") <= 0.01
    );
  }, {
    selector: SCENE_SELECTOR,
    sceneNumber: sceneIndex,
    calloutNumber: calloutIndex,
  }, { timeout: TIMEOUT });
};

const waitForNoObscured = async page => {
  await page.waitForFunction(() => !document.querySelector(
    ".annotation-callout.is-obscured, .annotation.is-obscured, .annotation-wire.is-obscured",
  ), null, { timeout: TIMEOUT });
};

const anchorCenters = async (page, sceneIndex) => page.evaluate(({
  selector,
  sceneNumber,
}) => {
  const scene = document.querySelectorAll(selector)[sceneNumber];
  const sceneRect = scene.getBoundingClientRect();
  return [...scene.querySelectorAll(".annotation-callout, .annotation")].map(callout => {
    const dot = callout.querySelector(".annotation-dot");
    const bounds = dot.getBoundingClientRect();
    return {
      key: callout.dataset.annotation || dot.getAttribute("aria-controls"),
      x: bounds.left - sceneRect.left + bounds.width / 2,
      y: bounds.top - sceneRect.top + bounds.height / 2,
    };
  });
}, { selector: SCENE_SELECTOR, sceneNumber: sceneIndex });

const anchorMovementIssues = (baseline, current, state) => {
  const issues = [];
  baseline.forEach((anchor, index) => {
    const next = current[index];
    if (!next || next.key !== anchor.key) {
      issues.push(`${state}: anchor order changed for ${anchor.key || `callout-${index + 1}`}`);
      return;
    }
    const distance = Math.hypot(next.x - anchor.x, next.y - anchor.y);
    if (distance > .5) {
      issues.push(`${state}: ${anchor.key} moved ${distance.toFixed(2)}px after interaction`);
    }
  });
  return issues;
};

const closingCopyLayoutIssues = async (page, sceneIndex, calloutIndex) => page.evaluate(async ({
  selector,
  sceneNumber,
  calloutNumber,
}) => {
  const scene = document.querySelectorAll(selector)[sceneNumber];
  const callout = scene.querySelectorAll(".annotation-callout, .annotation")[calloutNumber];
  const dot = callout.querySelector(".annotation-dot");
  const copy = callout.querySelector(".annotation-copy");
  const initial = { left: copy.offsetLeft, top: copy.offsetTop };
  const samples = [];
  const started = performance.now();
  dot.dispatchEvent(new PointerEvent("pointerleave", {
    bubbles: false,
    pointerType: "mouse",
  }));

  while (performance.now() - started < 520) {
    await new Promise(resolve => requestAnimationFrame(resolve));
    const opacity = Number.parseFloat(getComputedStyle(copy).opacity || "0");
    if (opacity > .01) {
      samples.push({
        left: copy.offsetLeft,
        top: copy.offsetTop,
        opacity,
      });
    }
  }

  return samples.flatMap(sample => {
    const movement = Math.hypot(sample.left - initial.left, sample.top - initial.top);
    return movement > .5
      ? [`closing copy layout moved ${movement.toFixed(2)}px while still visible`]
      : [];
  });
}, {
  selector: SCENE_SELECTOR,
  sceneNumber: sceneIndex,
  calloutNumber: calloutIndex,
});

const switchingCopyLayoutIssues = async (
  page,
  sceneIndex,
  firstCalloutIndex,
  secondCalloutIndex,
) => page.evaluate(async ({
  selector,
  sceneNumber,
  firstNumber,
  secondNumber,
}) => {
  const scene = document.querySelectorAll(selector)[sceneNumber];
  const callouts = [...scene.querySelectorAll(".annotation-callout, .annotation")];
  const first = callouts[firstNumber];
  const second = callouts[secondNumber];
  const firstCopy = first?.querySelector(".annotation-copy");
  const secondCopy = second?.querySelector(".annotation-copy");
  const api = window.OKAgencyAnnotations;
  if (!first || !second || !firstCopy || !secondCopy || !api) {
    return ["A→B transition setup is unavailable"];
  }

  const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));
  const anchorCenters = () => {
    const sceneRect = scene.getBoundingClientRect();
    return callouts.map(callout => {
      const dot = callout.querySelector(".annotation-dot");
      const bounds = dot.getBoundingClientRect();
      return {
        x: bounds.left - sceneRect.left + bounds.width / 2,
        y: bounds.top - sceneRect.top + bounds.height / 2,
      };
    });
  };

  api.closeAll();
  await nextFrame();
  api.open(first);
  await nextFrame();
  await nextFrame();
  await nextFrame();

  const initialCopy = { left: firstCopy.offsetLeft, top: firstCopy.offsetTop };
  const initialAnchors = anchorCenters();
  let maximumCopyMovement = 0;
  let maximumAnchorMovement = 0;
  let secondBecameVisible = false;
  const started = performance.now();

  api.open(second);
  while (performance.now() - started < 520) {
    await nextFrame();
    const firstOpacity = Number.parseFloat(getComputedStyle(firstCopy).opacity || "0");
    if (firstOpacity > .01) {
      maximumCopyMovement = Math.max(
        maximumCopyMovement,
        Math.hypot(
          firstCopy.offsetLeft - initialCopy.left,
          firstCopy.offsetTop - initialCopy.top,
        ),
      );
    }
    secondBecameVisible ||= (
      second.classList.contains("is-open")
      && Number.parseFloat(getComputedStyle(secondCopy).opacity || "0") > .01
    );
    anchorCenters().forEach((anchor, index) => {
      maximumAnchorMovement = Math.max(
        maximumAnchorMovement,
        Math.hypot(
          anchor.x - initialAnchors[index].x,
          anchor.y - initialAnchors[index].y,
        ),
      );
    });
  }

  api.closeAll();
  const closingStarted = performance.now();
  while (performance.now() - closingStarted < 520) await nextFrame();

  const issues = [];
  if (maximumCopyMovement > .5) {
    issues.push(
      `A→B transition moved the exiting A copy ${maximumCopyMovement.toFixed(2)}px while visible`,
    );
  }
  if (maximumAnchorMovement > .5) {
    issues.push(
      `A→B transition moved an artwork anchor ${maximumAnchorMovement.toFixed(2)}px`,
    );
  }
  if (!secondBecameVisible) issues.push("A→B transition did not reveal the B copy");
  return issues;
}, {
  selector: SCENE_SELECTOR,
  sceneNumber: sceneIndex,
  firstNumber: firstCalloutIndex,
  secondNumber: secondCalloutIndex,
});

const openState = async (page, sceneIndex, calloutIndex) => page.evaluate(({
  selector,
  sceneNumber,
  calloutNumber,
  contentSelector,
  fixedUiSelector,
}) => {
  const issues = [];
  const scene = document.querySelectorAll(selector)[sceneNumber];
  const callouts = [...scene.querySelectorAll(".annotation-callout, .annotation")];
  const callout = callouts[calloutNumber];
  const dot = callout.querySelector(".annotation-dot");
  const copy = callout.querySelector(".annotation-copy");
  const key = callout.dataset.annotation || dot.getAttribute("aria-controls") || `callout-${calloutNumber + 1}`;
  const issue = message => issues.push(message);
  const visible = element => {
    if (!element || element.hidden) return false;
    const bounds = element.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return false;
    for (let node = element; node instanceof Element; node = node.parentElement) {
      const style = getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") return false;
      if (Number.parseFloat(style.opacity || "1") <= 0.01) return false;
    }
    return true;
  };
  const rect = element => {
    const bounds = element.getBoundingClientRect();
    return { left: bounds.left, top: bounds.top, right: bounds.right, bottom: bounds.bottom };
  };
  const intersects = (first, second) => (
    first.left < second.right
    && first.right > second.left
    && first.top < second.bottom
    && first.bottom > second.top
  );
  const expand = (bounds, amount) => ({
    left: bounds.left - amount,
    top: bounds.top - amount,
    right: bounds.right + amount,
    bottom: bounds.bottom + amount,
  });

  if (!callout.classList.contains("is-open")) issue("wrapper lacks is-open");
  if (dot.getAttribute("aria-expanded") !== "true") issue("dot aria-expanded is not true");
  if (!dot.getAttribute("aria-controls") || dot.getAttribute("aria-controls") !== copy.id) {
    issue("aria-controls does not reference the callout copy");
  }
  if (copy.getAttribute("aria-hidden") !== "false") issue("copy aria-hidden is not false");
  if (!visible(copy)) issue("copy is not visibly open");

  const openCallouts = [...document.querySelectorAll(".annotation-callout.is-open, .annotation.is-open")];
  if (openCallouts.length !== 1 || openCallouts[0] !== callout) {
    issue(`${openCallouts.length} callouts are open; expected only the exercised callout`);
  }
  if (visible(copy)) {
    const copyRect = rect(copy);
    const dotRect = rect(dot);
    const sceneRect = rect(scene);
    const safeScene = {
      left: sceneRect.left + 24,
      top: sceneRect.top + 24,
      right: sceneRect.right - 24,
      bottom: sceneRect.bottom - 24,
    };
    if (
      copyRect.left < safeScene.left - 1
      || copyRect.top < safeScene.top - 1
      || copyRect.right > safeScene.right + 1
      || copyRect.bottom > safeScene.bottom + 1
    ) issue("copy leaves the scene 24px safe inset");

    if (intersects(copyRect, dotRect)) {
      issue("copy intersects its own target");
    }

    callouts.forEach((sibling, siblingIndex) => {
      const siblingDot = sibling.querySelector(".annotation-dot");
      const siblingKey = sibling.dataset.annotation || `callout-${siblingIndex + 1}`;
      if (sibling.classList.contains("is-obscured")) {
        issue(`${siblingKey} uses the removed is-obscured hidden state`);
      }
      if (sibling !== callout && intersects(copyRect, rect(siblingDot))) {
        issue(`copy intersects sibling target ${siblingKey}`);
      }
      const wire = sibling.dataset.annotation
        ? scene.querySelector(`[data-line="${sibling.dataset.annotation}"]`)
        : null;
      if (wire?.classList.contains("is-obscured")) {
        issue(`${siblingKey} wire uses the removed is-obscured hidden state`);
      }
    });
    [...document.querySelectorAll(
      ".annotation-callout.is-obscured, .annotation.is-obscured, .annotation-wire.is-obscured",
    )].filter(element => !scene.contains(element)).forEach(() => {
      issue("an unrelated scene retains is-obscured");
    });
    [...scene.querySelectorAll(contentSelector)].filter(visible).forEach(element => {
      if (intersects(copyRect, rect(element))) issue(`copy intersects protected content ${element.className}`);
    });
    [...document.querySelectorAll(fixedUiSelector)].filter(visible).forEach(element => {
      if (intersects(copyRect, expand(rect(element), 16))) {
        issue(`copy intersects the 16px UI clearance around ${element.className}`);
      }
    });
    callouts.filter(sibling => sibling !== callout && sibling.classList.contains("is-open"))
      .map(sibling => sibling.querySelector(".annotation-copy"))
      .filter(visible)
      .forEach(siblingCopy => {
        if (intersects(copyRect, rect(siblingCopy))) issue("copy intersects an open sibling copy");
      });

    const dotCenter = {
      x: (dotRect.left + dotRect.right) / 2,
      y: (dotRect.top + dotRect.bottom) / 2,
    };
    const distanceToSegment = (point, start, end) => {
      const lengthSquared = (end.x - start.x) ** 2 + (end.y - start.y) ** 2;
      const ratio = lengthSquared
        ? Math.max(0, Math.min(1, (
          ((point.x - start.x) * (end.x - start.x))
          + ((point.y - start.y) * (end.y - start.y))
        ) / lengthSquared))
        : 0;
      return Math.hypot(
        point.x - (start.x + ratio * (end.x - start.x)),
        point.y - (start.y + ratio * (end.y - start.y)),
      );
    };
    const distanceToCopyEdge = point => Math.min(
      distanceToSegment(
        point,
        { x: copyRect.left, y: copyRect.top },
        { x: copyRect.right, y: copyRect.top },
      ),
      distanceToSegment(
        point,
        { x: copyRect.right, y: copyRect.top },
        { x: copyRect.right, y: copyRect.bottom },
      ),
      distanceToSegment(
        point,
        { x: copyRect.right, y: copyRect.bottom },
        { x: copyRect.left, y: copyRect.bottom },
      ),
      distanceToSegment(
        point,
        { x: copyRect.left, y: copyRect.bottom },
        { x: copyRect.left, y: copyRect.top },
      ),
    );

    if (callout.classList.contains("annotation-callout")) {
      const wire = callout.dataset.annotation
        ? scene.querySelector(`.annotation-wire[data-line="${callout.dataset.annotation}"]`)
        : null;
      const path = wire?.querySelector("path");
      const svg = path?.closest("svg");
      const pathStyle = path && getComputedStyle(path);
      const effectivelyVisible = element => {
        let opacity = 1;
        for (let current = element; current && current !== document; current = current.parentElement) {
          const currentStyle = getComputedStyle(current);
          if (
            currentStyle.display === "none"
            || currentStyle.visibility === "hidden"
            || currentStyle.visibility === "collapse"
          ) return false;
          opacity *= Number.parseFloat(currentStyle.opacity || "1");
        }
        return opacity > .99;
      };
      const values = path?.getAttribute("d")?.match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
      const viewBox = svg?.getAttribute("viewBox")?.trim().split(/\s+/).map(Number) || [];
      const width = Number.parseFloat(svg?.style.width || "");
      const height = Number.parseFloat(svg?.style.height || "");
      const left = Number.parseFloat(svg?.style.left || "0");
      const top = Number.parseFloat(svg?.style.top || "0");
      if (!wire?.classList.contains("is-open") || !path || values.length < 4 || viewBox.length !== 4) {
        issue("open service callout has no active connector path");
      } else if (
        !effectivelyVisible(path)
        || pathStyle.stroke === "none"
      ) {
        issue("open service connector path is not visibly rendered");
      } else if (![width, height, left, top].every(Number.isFinite)) {
        issue("service connector has incomplete runtime geometry");
      } else {
        const mapPoint = (x, y) => ({
          x: sceneRect.left + left + ((x - viewBox[0]) / viewBox[2]) * width,
          y: sceneRect.top + top + ((y - viewBox[1]) / viewBox[3]) * height,
        });
        const start = mapPoint(values[0], values[1]);
        const end = mapPoint(values.at(-2), values.at(-1));
        if (Math.hypot(start.x - dotCenter.x, start.y - dotCenter.y) > 1.5) {
          issue("connector does not start at its target center");
        }
        if (distanceToCopyEdge(end) > 1.5) {
          issue("connector does not terminate at the callout edge");
        }
      }
    } else {
      const style = getComputedStyle(callout);
      const leaderStyle = getComputedStyle(callout, "::before");
      const length = Number.parseFloat(style.getPropertyValue("--leader-length"));
      const angle = Number.parseFloat(style.getPropertyValue("--leader-angle"));
      const leaderWidth = Number.parseFloat(leaderStyle.width);
      const leaderLeft = Number.parseFloat(leaderStyle.left);
      const leaderTop = Number.parseFloat(leaderStyle.top);
      const leaderHeight = Number.parseFloat(leaderStyle.height);
      const matrixValues = leaderStyle.transform.match(/^matrix\(([^)]+)\)$/)?.[1]
        ?.split(",")
        .map(Number);
      const originParts = leaderStyle.transformOrigin.split(/\s+/);
      const originValue = (value, size) => value?.endsWith("%")
        ? Number.parseFloat(value) * size / 100
        : Number.parseFloat(value);
      const originX = originValue(originParts[0], leaderWidth);
      const originY = originValue(originParts[1], leaderHeight);
      if (
        leaderStyle.display === "none"
        || leaderStyle.visibility === "hidden"
        || Number.parseFloat(leaderStyle.opacity || "0") <= .99
        || leaderStyle.backgroundColor === "rgba(0, 0, 0, 0)"
      ) {
        issue("open about connector is not visibly rendered");
      } else if (
        !Number.isFinite(length)
        || !Number.isFinite(angle)
        || !Number.isFinite(leaderWidth)
        || !Number.isFinite(leaderLeft)
        || !Number.isFinite(leaderTop)
        || !Number.isFinite(leaderHeight)
        || !Number.isFinite(originX)
        || !Number.isFinite(originY)
        || !matrixValues
        || matrixValues.length !== 6
        || length <= 0
      ) {
        issue("about connector has incomplete runtime geometry");
      } else {
        const calloutRect = callout.getBoundingClientRect();
        const transformPoint = (x, y) => ({
          x: calloutRect.left + leaderLeft + originX
            + matrixValues[0] * (x - originX)
            + matrixValues[2] * (y - originY)
            + matrixValues[4],
          y: calloutRect.top + leaderTop + originY
            + matrixValues[1] * (x - originX)
            + matrixValues[3] * (y - originY)
            + matrixValues[5],
        });
        const start = transformPoint(0, leaderHeight / 2);
        const end = transformPoint(leaderWidth, leaderHeight / 2);
        if (Math.hypot(start.x - dotCenter.x, start.y - dotCenter.y) > 1.5) {
          issue("about connector does not start at its target center");
        }
        if (distanceToCopyEdge(end) > 1.5) {
          issue("about connector does not terminate at the callout edge");
        }
      }
    }
  }

  return { key, issues };
}, {
  selector: SCENE_SELECTOR,
  sceneNumber: sceneIndex,
  calloutNumber: calloutIndex,
  contentSelector: CONTENT_SELECTOR,
  fixedUiSelector: FIXED_UI_SELECTOR,
});

const closedState = async (page, sceneIndex, calloutIndex) => page.evaluate(({
  selector,
  sceneNumber,
  calloutNumber,
}) => {
  const callout = document.querySelectorAll(selector)[sceneNumber]
    .querySelectorAll(".annotation-callout, .annotation")[calloutNumber];
  const dot = callout.querySelector(".annotation-dot");
  const copy = callout.querySelector(".annotation-copy");
  const issues = [];
  if (callout.classList.contains("is-open")) issues.push("wrapper retains is-open");
  if (dot.getAttribute("aria-expanded") !== "false") issues.push("dot aria-expanded is not false");
  if (copy.getAttribute("aria-hidden") !== "true") issues.push("copy aria-hidden is not true");
  return {
    key: callout.dataset.annotation || dot.getAttribute("aria-controls") || `callout-${calloutNumber + 1}`,
    issues,
  };
}, { selector: SCENE_SELECTOR, sceneNumber: sceneIndex, calloutNumber: calloutIndex });

const recordInteractionIssues = (route, viewport, scene, state, prefix) => {
  state.issues.forEach(message => addFailure(route, viewport, scene, state.key, `${prefix}: ${message}`));
};

const auditScrollVisibility = async (page, sceneIndex) => page.evaluate(async ({
  selector,
  sceneNumber,
}) => {
  window.OKAgencyAnnotations?.closeAll?.();
  const scene = document.querySelectorAll(selector)[sceneNumber];
  const callouts = [...scene.querySelectorAll(".annotation-callout, .annotation")];
  const originalY = scrollY;
  const sceneTop = originalY + scene.getBoundingClientRect().top;
  const offsets = [0, 24, 56, 92, 128, 160];
  const issues = [];
  const nextFrame = () => new Promise(resolve => requestAnimationFrame(resolve));
  const centers = () => {
    const art = scene.querySelector(":scope > .campaign-art, :scope > .scene-art");
    const artRect = art?.getBoundingClientRect();
    const reference = artRect?.width > 0 && artRect?.height > 0
      ? artRect
      : scene.getBoundingClientRect();
    return callouts.map(callout => {
      const state = callout.dataset.okAnchorState;
      const dotRect = callout.querySelector(".annotation-dot").getBoundingClientRect();
      return {
        state,
        x: (dotRect.left - reference.left + dotRect.width / 2) / reference.width,
        y: (dotRect.top - reference.top + dotRect.height / 2) / reference.height,
      };
    });
  };
  const stableCenters = centers();

  for (const offset of offsets) {
    scrollTo(0, sceneTop + offset);
    window.dispatchEvent(new CustomEvent("okagency:art-safety-change", {
      detail: { source: "annotation-scroll-visibility-audit" },
    }));
    await nextFrame();

    centers().forEach((point, index) => {
      const baseline = stableCenters[index];
      if (point.state !== baseline.state) {
        issues.push(`scroll offset ${offset}px changes point ${index + 1} state ${baseline.state}→${point.state}`);
        return;
      }
      if (point.state !== "placed") return;
      const movement = Math.hypot(
        (point.x - baseline.x) * scene.clientWidth,
        (point.y - baseline.y) * scene.clientHeight,
      );
      if (movement > .5) {
        issues.push(`scroll offset ${offset}px moves point ${index + 1} by ${movement.toFixed(2)}px relative to artwork`);
      }
    });

    if (scene.classList.contains("annotations-unavailable")) {
      issues.push(`scroll offset ${offset}px activates the removed hidden mode`);
    }

    await nextFrame();
  }

  scrollTo(0, originalY);
  await nextFrame();
  await nextFrame();
  return issues;
}, { selector: SCENE_SELECTOR, sceneNumber: sceneIndex });

const exercisePoint = async (
  page,
  route,
  viewport,
  sceneIndex,
  sceneId,
  calloutIndex,
  availableIndexes,
  allCloseMethods,
) => {
  const dot = page.locator(SCENE_SELECTOR).nth(sceneIndex)
    .locator(CALLOUT_SELECTOR).nth(calloutIndex).locator(".annotation-dot");

  try {
    await page.keyboard.press("Escape");
    await dot.scrollIntoViewIfNeeded();
    await settleLayout(page);
    const stableAnchors = await anchorCenters(page, sceneIndex);
    await dot.hover();
    await waitForOpen(page, sceneIndex, calloutIndex);
    await page.waitForTimeout(420);
    anchorMovementIssues(
      stableAnchors,
      await anchorCenters(page, sceneIndex),
      "hover/open",
    ).forEach(message => (
      addFailure(route, viewport, sceneId, `callout-${calloutIndex + 1}`, message)
    ));
    recordInteractionIssues(
      route,
      viewport,
      sceneId,
      await openState(page, sceneIndex, calloutIndex),
      "hover/stable",
    );
    const closingIssues = await closingCopyLayoutIssues(page, sceneIndex, calloutIndex);
    closingIssues.forEach(message => (
      addFailure(route, viewport, sceneId, `callout-${calloutIndex + 1}`, message)
    ));
    // The synthetic pointerleave above measures the closing frame without moving
    // Playwright's physical pointer. Move it off the target before keyboard checks
    // so Chromium cannot re-enter the same dot while focus is being transferred.
    await page.mouse.move(1, 1);
    await waitForClosed(page, sceneIndex, calloutIndex);
    await waitForNoObscured(page);
    anchorMovementIssues(
      stableAnchors,
      await anchorCenters(page, sceneIndex),
      "hover/close",
    ).forEach(message => (
      addFailure(route, viewport, sceneId, `callout-${calloutIndex + 1}`, message)
    ));

    if (allCloseMethods) {
      const secondCalloutIndex = availableIndexes.find(index => index !== calloutIndex);
      if (Number.isInteger(secondCalloutIndex)) {
        const switchingIssues = await switchingCopyLayoutIssues(
          page,
          sceneIndex,
          calloutIndex,
          secondCalloutIndex,
        );
        switchingIssues.forEach(message => (
          addFailure(
            route,
            viewport,
            sceneId,
            `callout-${calloutIndex + 1}→${secondCalloutIndex + 1}`,
            message,
          )
        ));
      }
    }

    // Keep the key event bound to the audited control. A layout refresh can
    // legitimately move focus between frames on slower CI runners; locator.press
    // restores focus and still exercises the browser's real keyboard activation.
    await dot.press("Enter");
    await waitForOpen(page, sceneIndex, calloutIndex);
    await settleLayout(page);
    recordInteractionIssues(
      route,
      viewport,
      sceneId,
      await openState(page, sceneIndex, calloutIndex),
      "Enter/open",
    );

    if (!allCloseMethods) {
      await page.keyboard.press("Escape");
      await waitForClosed(page, sceneIndex, calloutIndex);
      await waitForNoObscured(page);
      recordInteractionIssues(
        route,
        viewport,
        sceneId,
        await closedState(page, sceneIndex, calloutIndex),
        "Escape/close",
      );
      return;
    }

    await dot.press("Space");
    await waitForClosed(page, sceneIndex, calloutIndex);
    await waitForNoObscured(page);
    recordInteractionIssues(
      route,
      viewport,
      sceneId,
      await closedState(page, sceneIndex, calloutIndex),
      "Space/close",
    );

    await dot.press("Enter");
    await waitForOpen(page, sceneIndex, calloutIndex);
    await page.keyboard.press("Escape");
    await waitForClosed(page, sceneIndex, calloutIndex);
    await waitForNoObscured(page);
    recordInteractionIssues(
      route,
      viewport,
      sceneId,
      await closedState(page, sceneIndex, calloutIndex),
      "Escape/close",
    );

    await dot.press("Enter");
    await waitForOpen(page, sceneIndex, calloutIndex);
    await page.locator("body").dispatchEvent("pointerdown", {
      bubbles: true,
      button: 0,
      pointerType: "mouse",
    });
    await waitForClosed(page, sceneIndex, calloutIndex);
    await waitForNoObscured(page);
    recordInteractionIssues(
      route,
      viewport,
      sceneId,
      await closedState(page, sceneIndex, calloutIndex),
      "outside pointerdown/close",
    );
  } catch (error) {
    const key = await dot.getAttribute("aria-controls").catch(() => null) || `callout-${calloutIndex + 1}`;
    addFailure(route, viewport, sceneId, key, `interaction audit failed: ${error.message}`);
    await page.keyboard.press("Escape").catch(() => {});
  }
};

const auditRoute = async (context, baseUrl, route, viewport) => {
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on("console", message => {
    if (message.type() === "error") runtimeErrors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", error => runtimeErrors.push(`pageerror: ${error.message}`));
  try {
    const url = new URL(route.path, baseUrl);
    url.searchParams.set("audit", "hotspots");
    await page.goto(url.href, { waitUntil: "domcontentloaded", timeout: TIMEOUT });
    await waitForDocumentReady(page);

    const calloutCount = await page.locator(CALLOUT_SELECTOR).count();
    if (calloutCount !== route.callouts) {
      addFailure(
        route.path,
        viewport,
        "document",
        "callout-count",
        `found ${calloutCount} callouts, expected ${route.callouts}`,
      );
    }

    const sceneCount = await page.locator(SCENE_SELECTOR).count();
    const mobile = viewport.width <= 640;
    for (let sceneIndex = 0; sceneIndex < sceneCount; sceneIndex += 1) {
      try {
        await activateScene(page, route.path, sceneIndex);
        await waitForSceneMode(page, sceneIndex, mobile);
      } catch (error) {
        addFailure(
          route.path,
          viewport,
          `scene-${sceneIndex + 1}`,
          "readiness",
          `scene did not settle: ${error.message}`,
        );
      }

      let result;
      try {
        result = await auditScene(page, sceneIndex, mobile);
      } catch (error) {
        addFailure(
          route.path,
          viewport,
          `scene-${sceneIndex + 1}`,
          "runner",
          `scene audit failed: ${error.message}`,
        );
        continue;
      }
      result.issues.forEach(({ key, message }) => {
        addFailure(route.path, viewport, result.id, key, message);
      });

      if (!mobile) {
        const canonical = viewport.width === 1280 && viewport.height === 720;
        const compactRepresentative = viewport.width === 1024 && viewport.height === 768;
        const wideRepresentative = viewport.width === 1512 && viewport.height === 982;
        const interactionIndexes = canonical || compactRepresentative
          ? result.pointIndexes
          : wideRepresentative
            ? result.pointIndexes.slice(0, 1)
            : [];
        for (const calloutIndex of interactionIndexes) {
          await exercisePoint(
            page,
            route.path,
            viewport,
            sceneIndex,
            result.id,
            calloutIndex,
            result.pointIndexes,
            canonical && calloutIndex === result.pointIndexes[0],
          );
        }
      }
    }
  } catch (error) {
    addFailure(route.path, viewport, "document", "runner", error.message);
  } finally {
    [...new Set(runtimeErrors)].forEach(message => {
      addFailure(route.path, viewport, "document", "console", message);
    });
    await page.close().catch(() => {});
  }
};

const auditRouteScrollVisibility = async (context, baseUrl, route, viewport) => {
  const page = await context.newPage();
  try {
    const url = new URL(route.path, baseUrl);
    url.searchParams.set("audit", "hotspots");
    await page.goto(url.href, {
      waitUntil: "domcontentloaded",
      timeout: TIMEOUT,
    });
    await waitForDocumentReady(page);
    const sceneCount = await page.locator(SCENE_SELECTOR).count();
    for (let sceneIndex = 0; sceneIndex < sceneCount; sceneIndex += 1) {
      await activateScene(page, route.path, sceneIndex);
      await waitForSceneMode(page, sceneIndex, false);
      const sceneId = await page.locator(SCENE_SELECTOR).nth(sceneIndex)
        .getAttribute("id") || `scene-${sceneIndex + 1}`;
      const scrollIssues = await auditScrollVisibility(page, sceneIndex);
      scrollIssues.forEach(message => {
        addFailure(route.path, viewport, sceneId, "scroll-visibility", message);
      });
    }
  } catch (error) {
    addFailure(route.path, viewport, "document", "scroll-visibility-runner", error.message);
  } finally {
    await page.close().catch(() => {});
  }
};

const auditMotionMode = async (browser, baseUrl, mode) => {
  const viewport = { width: 1280, height: 720 };
  const context = await browser.newContext({
    viewport,
    reducedMotion: mode === "reduced" ? "reduce" : "no-preference",
  });
  await context.addInitScript(consentInit);
  const page = await context.newPage();
  try {
    await page.goto(new URL("/strony-internetowe", baseUrl).href, {
      waitUntil: "domcontentloaded",
      timeout: TIMEOUT,
    });
    await waitForDocumentReady(page);
    await activateScene(page, "/strony-internetowe", 0);
    if (mode === "paused") {
      await page.evaluate(() => window.OKAgencyMotion?.setPaused?.(true));
      await settleLayout(page);
    }

    const result = await page.evaluate(() => {
      const dots = [...document.querySelectorAll(".annotation-dot")];
      const dot = dots.find(element => {
        const bounds = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return bounds.width > 0
          && bounds.height > 0
          && style.display !== "none"
          && style.visibility !== "hidden"
          && Number.parseFloat(style.opacity || "1") > 0.01;
      });
      if (!dot) return { key: "motion", issues: ["no representative visible annotation dot"] };
      const core = getComputedStyle(dot, "::before");
      const ring = getComputedStyle(dot, "::after");
      const issues = [];
      const visiblePseudo = style => (
        style.display !== "none"
        && style.visibility !== "hidden"
        && Number.parseFloat(style.opacity || "0") > 0.01
        && Number.parseFloat(style.width || "0") > 0
        && Number.parseFloat(style.height || "0") > 0
      );
      const animationsOff = style => style.animationName
        .split(",")
        .every(name => name.trim() === "none");
      if (!visiblePseudo(core)) issues.push("annotation core is not visible");
      if (!visiblePseudo(ring)) issues.push("annotation ring is not visible");
      if (!animationsOff(core)) issues.push(`annotation core animation remains ${core.animationName}`);
      if (!animationsOff(ring)) issues.push(`annotation ring animation remains ${ring.animationName}`);
      return {
        key: dot.getAttribute("aria-controls") || "motion",
        issues,
      };
    });
    result.issues.forEach(message => {
      addFailure(
        "/strony-internetowe",
        `${viewportName(viewport)}-${mode}`,
        "representative",
        result.key,
        message,
      );
    });
  } catch (error) {
    addFailure(
      "/strony-internetowe",
      `${viewportName(viewport)}-${mode}`,
      "representative",
      "runner",
      error.message,
    );
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
};

const auditResizeState = async (browser, baseUrl) => {
  const wide = { width: 1024, height: 900 };
  const compact = { width: 821, height: 900 };
  const context = await browser.newContext({ viewport: wide, reducedMotion: "no-preference" });
  await context.addInitScript(consentInit);
  const page = await context.newPage();
  const route = "/strony-internetowe";
  try {
    const url = new URL(route, baseUrl);
    url.searchParams.set("audit", "hotspots");
    await page.goto(url.href, { waitUntil: "domcontentloaded", timeout: TIMEOUT });
    await waitForDocumentReady(page);
    await activateScene(page, route, 0);
    await waitForSceneMode(page, 0, false);
    const initial = await page.evaluate(selector => {
      const scene = document.querySelectorAll(selector)[0];
      return [...scene.querySelectorAll(".annotation-callout, .annotation")].map(callout => ({
        key: callout.dataset.annotation,
        state: callout.dataset.okAnchorState,
      }));
    }, SCENE_SELECTOR);

    await page.setViewportSize(compact);
    await settleLayout(page);
    await waitForSceneMode(page, 0, false);
    const compactStates = await page.evaluate(selector => {
      const scene = document.querySelectorAll(selector)[0];
      return [...scene.querySelectorAll(".annotation-callout, .annotation")].map(callout => ({
        key: callout.dataset.annotation,
        state: callout.dataset.okAnchorState,
      }));
    }, SCENE_SELECTOR);
    const hiddenKey = compactStates.find(entry => entry.state === "hidden")?.key;
    if (!hiddenKey) {
      addFailure(route, `${viewportName(wide)}→${viewportName(compact)}`, "web-opening", "resize", "representative resize did not exercise a hidden anchor");
      return;
    }

    await page.setViewportSize(wide);
    await settleLayout(page);
    await waitForSceneMode(page, 0, false);
    const targetIndex = initial.findIndex(entry => entry.key === hiddenKey && entry.state === "placed");
    if (targetIndex < 0) {
      addFailure(route, `${viewportName(wide)}→${viewportName(compact)}`, "web-opening", hiddenKey, "anchor is not placed before compact resize");
      return;
    }
    await page.evaluate(({ selector, index }) => {
      const callout = document.querySelectorAll(selector)[0]
        ?.querySelectorAll(".annotation-callout, .annotation")[index];
      window.OKAgencyAnnotations?.open?.(callout);
    }, { selector: SCENE_SELECTOR, index: targetIndex });
    await waitForOpen(page, 0, targetIndex);

    await page.setViewportSize(compact);
    await settleLayout(page);
    await waitForSceneMode(page, 0, false);
    const hiddenState = await page.evaluate(({ selector, index }) => {
      const callout = document.querySelectorAll(selector)[0]
        .querySelectorAll(".annotation-callout, .annotation")[index];
      const dot = callout.querySelector(".annotation-dot");
      const copy = callout.querySelector(".annotation-copy");
      const wire = document.querySelector(`[data-line="${callout.dataset.line}"]`);
      return {
        state: callout.dataset.okAnchorState,
        open: callout.classList.contains("is-open"),
        calloutHidden: callout.getAttribute("aria-hidden"),
        inert: callout.inert,
        disabled: dot.disabled,
        tabIndex: dot.tabIndex,
        expanded: dot.getAttribute("aria-expanded"),
        copyHidden: copy.getAttribute("aria-hidden"),
        wireOpen: wire?.classList.contains("is-open") || false,
      };
    }, { selector: SCENE_SELECTOR, index: targetIndex });
    const expected = hiddenState.state === "hidden"
      && !hiddenState.open
      && hiddenState.calloutHidden === "true"
      && hiddenState.inert
      && hiddenState.disabled
      && hiddenState.tabIndex === -1
      && hiddenState.expanded === "false"
      && hiddenState.copyHidden === "true"
      && !hiddenState.wireOpen;
    if (!expected) {
      addFailure(route, `${viewportName(wide)}→${viewportName(compact)}`, "web-opening", hiddenKey, `active anchor did not close atomically: ${JSON.stringify(hiddenState)}`);
    }
  } catch (error) {
    addFailure(route, `${viewportName(wide)}→${viewportName(compact)}`, "web-opening", "resize-runner", error.message);
  } finally {
    await page.close().catch(() => {});
    await context.close().catch(() => {});
  }
};

const parseBaseUrl = value => {
  try {
    return new URL(value);
  } catch {
    throw new Error(`Invalid base URL: ${value}`);
  }
};

let managedServer = null;
const availablePort = () => new Promise((resolve, reject) => {
  const server = createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    server.close(() => resolve(address.port));
  });
});

const resolveBaseUrl = async value => {
  if (value) return parseBaseUrl(value);
  const port = await availablePort();
  const baseUrl = new URL(`http://127.0.0.1:${port}`);
  managedServer = spawn(
    process.execPath,
    ["server.mjs", "--host", "127.0.0.1", "--port", String(port)],
    { cwd: ROOT, stdio: "ignore" },
  );
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return baseUrl;
    } catch {
      // The isolated repository server may still be starting.
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Local annotation server did not start at ${baseUrl}`);
};

let browser;
try {
  const baseUrl = await resolveBaseUrl(process.argv[2]);
  const selectedRoutes = requestedRoute
    ? ROUTES.filter(route => route.path === requestedRoute)
    : ROUTES;
  const requestedViewportMatch = /^(\d+)x(\d+)$/.exec(requestedViewport);
  const selectedViewports = requestedViewport
    ? requestedViewportMatch
      ? [{ width: Number(requestedViewportMatch[1]), height: Number(requestedViewportMatch[2]) }]
      : []
    : VIEWPORTS;
  if (!selectedRoutes.length) throw new Error(`Unknown annotation route filter: ${requestedRoute}`);
  if (!selectedViewports.length) throw new Error(`Unknown annotation viewport filter: ${requestedViewport}`);
  browser = await browserType.launch({ headless: true });

  for (const viewport of selectedViewports) {
    console.log(`Annotation geometry: ${viewportName(viewport)}`);
    const context = await browser.newContext({ viewport, reducedMotion: "no-preference" });
    await context.addInitScript(consentInit);
    try {
      for (const route of selectedRoutes) {
        await auditRoute(context, baseUrl, route, viewport);
        if (
          (viewport.width === 1280 && viewport.height === 720)
          || (viewport.width === 1512 && viewport.height === 800)
        ) {
          await auditRouteScrollVisibility(context, baseUrl, route, viewport);
        }
      }
    } finally {
      await context.close().catch(() => {});
    }
  }

  if (!requestedRoute && !requestedViewport) {
    await auditMotionMode(browser, baseUrl, "paused");
    await auditMotionMode(browser, baseUrl, "reduced");
    await auditResizeState(browser, baseUrl);
  }
} catch (error) {
  addFailure("runner", "n/a", "runner", "fatal", error.message);
} finally {
  await browser?.close().catch(() => {});
  managedServer?.kill();
}

if (failures.length) {
  console.error(`\nAnnotation geometry audit failed with ${failures.length} violation(s):`);
  failures.forEach(({ route, viewport, scene, key, message }) => {
    console.error(`- ${route} | ${viewport} | ${scene} | ${key}: ${message}`);
  });
  process.exitCode = 1;
} else {
  console.log(
    `\nAnnotation geometry audit passed: ${requestedRoute || "6 routes"}, `
    + `${requestedViewport || `${VIEWPORTS.length} viewports`} in ${webkitAudit ? "WebKit" : "Chromium"}.`,
  );
}
