import process from "node:process";
import { chromium } from "playwright";

const DEFAULT_BASE_URL = "http://127.0.0.1:7133";
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
  { width: 1512, height: 982 },
  { width: 1512, height: 800 },
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
  { width: 360, height: 640 },
];

const TIMEOUT = 15_000;
const failures = [];
const requestedRoute = process.env.OK_ANNOTATION_ROUTE || "";
const requestedViewport = process.env.OK_ANNOTATION_VIEWPORT || "";
const consentInit = () => {
  localStorage.setItem("ok-consent", JSON.stringify({
    version: 1,
    granted: false,
    at: "geometry-audit",
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

    return callouts.every(callout => visible(callout.querySelector(".annotation-dot")));
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

  const visibleDots = callouts
    .map((callout, calloutIndex) => ({
      callout,
      calloutIndex,
      dot: callout.querySelector(".annotation-dot"),
      key: keyFor(callout, calloutIndex),
    }))
    .filter(item => visible(item.dot));
  const lines = [...scene.querySelectorAll(".annotation-lines")].filter(visible);
  if (scene.classList.contains("annotations-unavailable")) {
    issue("mode", "scene uses the removed annotations-unavailable hidden mode");
  }

  if (visibleDots.length !== callouts.length) {
    issue("mode", `points mode exposes ${visibleDots.length}/${callouts.length} dots`);
  }

  const art = scene.querySelector(":scope > .campaign-art, :scope > .scene-art");
  const api = window.OKAgencyResponsiveSafety;
  const bounds = api?.getArtBounds?.(scene) || (art && api?.getArtBounds?.(art));
  const fullVisible = bounds?.fullVisible;
  const feather = bounds?.feather;
  const artVisible = fullVisible && feather
    ? {
      left: Math.min(fullVisible.left, feather.left),
      top: Math.min(fullVisible.top, feather.top),
      right: Math.max(fullVisible.right, feather.right),
      bottom: Math.max(fullVisible.bottom, feather.bottom),
    }
    : fullVisible;
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
    if (artSafe && !inside(artSafe, dotRect)) issue(key, "full 44px target leaves the visible art and feather region");
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
  }, { timeout: 4_000 });
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
  }, { timeout: 4_000 });
};

const waitForNoObscured = async page => {
  await page.waitForFunction(() => !document.querySelector(
    ".annotation-callout.is-obscured, .annotation.is-obscured, .annotation-wire.is-obscured",
  ), null, { timeout: 4_000 });
};

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

  for (const offset of offsets) {
    scrollTo(0, sceneTop + offset);
    window.dispatchEvent(new CustomEvent("okagency:art-safety-change", {
      detail: { source: "annotation-scroll-visibility-audit" },
    }));
    await nextFrame();

    if (scene.classList.contains("annotations-unavailable")) {
      issues.push(`scroll offset ${offset}px activates the removed hidden mode`);
    }

    const hidden = callouts.filter(callout => {
      const dot = callout.querySelector(".annotation-dot");
      const style = getComputedStyle(dot);
      return callout.classList.contains("is-obscured")
        || style.display === "none"
        || style.visibility === "hidden"
        || Number.parseFloat(style.opacity || "1") <= .01;
    });
    if (hidden.length) {
      issues.push(`scroll offset ${offset}px hides ${hidden.length}/${callouts.length} points during solve`);
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
  allCloseMethods,
) => {
  const dot = page.locator(SCENE_SELECTOR).nth(sceneIndex)
    .locator(CALLOUT_SELECTOR).nth(calloutIndex).locator(".annotation-dot");

  try {
    await page.keyboard.press("Escape");
    await dot.hover();
    await waitForOpen(page, sceneIndex, calloutIndex);
    await page.waitForTimeout(420);
    recordInteractionIssues(
      route,
      viewport,
      sceneId,
      await openState(page, sceneIndex, calloutIndex),
      "hover/stable",
    );
    await page.mouse.move(2, 2);
    await waitForClosed(page, sceneIndex, calloutIndex);
    await waitForNoObscured(page);

    await dot.focus();
    await page.keyboard.press("Enter");
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

    await page.keyboard.press("Space");
    await waitForClosed(page, sceneIndex, calloutIndex);
    await waitForNoObscured(page);
    recordInteractionIssues(
      route,
      viewport,
      sceneId,
      await closedState(page, sceneIndex, calloutIndex),
      "Space/close",
    );

    await page.keyboard.press("Enter");
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

    await page.keyboard.press("Enter");
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
  try {
    const url = new URL(route.path, baseUrl).href;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: TIMEOUT });
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
            canonical && calloutIndex === result.pointIndexes[0],
          );
        }
      }
    }
  } catch (error) {
    addFailure(route.path, viewport, "document", "runner", error.message);
  } finally {
    await page.close().catch(() => {});
  }
};

const auditRouteScrollVisibility = async (context, baseUrl, route, viewport) => {
  const page = await context.newPage();
  try {
    await page.goto(new URL(route.path, baseUrl).href, {
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

const parseBaseUrl = value => {
  try {
    return new URL(value || DEFAULT_BASE_URL);
  } catch {
    throw new Error(`Invalid base URL: ${value}`);
  }
};

let browser;
try {
  const baseUrl = parseBaseUrl(process.argv[2]);
  const selectedRoutes = requestedRoute
    ? ROUTES.filter(route => route.path === requestedRoute)
    : ROUTES;
  const selectedViewports = requestedViewport
    ? VIEWPORTS.filter(viewport => viewportName(viewport) === requestedViewport)
    : VIEWPORTS;
  if (!selectedRoutes.length) throw new Error(`Unknown annotation route filter: ${requestedRoute}`);
  if (!selectedViewports.length) throw new Error(`Unknown annotation viewport filter: ${requestedViewport}`);
  browser = await chromium.launch({ headless: true });

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
  }
} catch (error) {
  addFailure("runner", "n/a", "runner", "fatal", error.message);
} finally {
  await browser?.close().catch(() => {});
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
    + `${requestedViewport || `${VIEWPORTS.length} viewports`}.`,
  );
}
