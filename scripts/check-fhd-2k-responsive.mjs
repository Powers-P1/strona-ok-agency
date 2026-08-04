import { spawn } from "node:child_process";
import { createServer } from "node:net";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const WEBKIT_SMOKE = process.argv.includes("--webkit");
const DESKTOP_VIEWPORTS = [
  { width: 1920, height: 1080, name: "FHD" },
  { width: 2560, height: 1440, name: "2K" },
  { width: 3840, height: 2160, name: "4K" },
  { width: 7680, height: 4320, name: "8K" },
];
const VIEWPORTS = WEBKIT_SMOKE ? [DESKTOP_VIEWPORTS[1]] : DESKTOP_VIEWPORTS;
const MOBILE_VIEWPORT = { width: 390, height: 844, name: "mobile" };
const DISPLAY_CASES = [
  { route: "/dostepnosc", selector: ".privacy-title", name: "Accessibility document title" },
  { route: "/strony-internetowe", selector: "#web-decision-title", name: "Decision question" },
  { route: "/proces", selector: "#process-delivery h2", name: "Process delivery title" },
  { route: "/kampanie", selector: "#campaign-proof h2", name: "Campaign proof title" },
];
const MOBILE_DISPLAY_CASES = [
  { route: "/dostepnosc", selector: ".privacy-title", name: "Accessibility mobile title" },
  { route: "/strony-internetowe", selector: "#web-decision-title", name: "Decision mobile question" },
];
const MASK_FAMILY_CASES = [
  { route: "/strony-internetowe", selector: "#web-architecture", name: "Web architecture" },
  { route: "/kampanie", selector: "#campaign-opening", name: "Campaign opening" },
  { route: "/social-media", selector: "#social-opening", name: "Social opening" },
  { route: "/proces", selector: "#process-delivery", name: "Process delivery" },
  { route: "/o-nas", selector: "#about-model", name: "About model" },
  {
    route: "/diagnoza",
    selector: "#diagnosis-opening",
    name: "Diagnosis opening",
    viewport: { width: 768, height: 728 },
  },
];
const EPSILON = 2;
const failures = [];
let managedServer = null;

const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const availablePort = () => new Promise((resolvePort, reject) => {
  const probe = createServer();
  probe.once("error", reject);
  probe.listen(0, "127.0.0.1", () => {
    const address = probe.address();
    probe.close(() => resolvePort(address.port));
  });
});

const resolveBaseUrl = async () => {
  const requestedBaseUrl = process.argv.slice(2).find(argument => !argument.startsWith("--"));
  if (requestedBaseUrl) return requestedBaseUrl;
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  managedServer = spawn(
    process.execPath,
    ["server.mjs", "--host", "127.0.0.1", "--port", String(port)],
    { cwd: ROOT, stdio: "ignore" },
  );
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return baseUrl;
    } catch {
      // The task-local server may still be starting.
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 100));
  }
  throw new Error(`FHD/2K responsive audit server did not start at ${baseUrl}`);
};

const frames = (page, count = 3) => page.evaluate(frameCount => new Promise(resolveFrame => {
  const next = remaining => requestAnimationFrame(() => {
    if (remaining <= 1) resolveFrame();
    else next(remaining - 1);
  });
  next(frameCount);
}), count);

const waitForStablePage = async page => {
  await page.waitForLoadState("domcontentloaded");
  await page.evaluate(() => Promise.race([
    document.fonts?.ready || Promise.resolve(),
    new Promise(resolve => setTimeout(resolve, 3000)),
  ]));
  await frames(page);
};

const lineMetrics = (page, selector) => page.locator(selector).evaluate(element => {
  const range = document.createRange();
  range.selectNodeContents(element);
  const grouped = [];
  [...range.getClientRects()].filter(rect => rect.width > 1 && rect.height > 1).forEach(rect => {
    let line = grouped.find(candidate => Math.abs(candidate.top - rect.top) < 1);
    if (!line) {
      line = { top: rect.top, bottom: rect.bottom };
      grouped.push(line);
    } else {
      line.top = Math.min(line.top, rect.top);
      line.bottom = Math.max(line.bottom, rect.bottom);
    }
  });
  grouped.sort((first, second) => first.top - second.top);
  const overlaps = grouped.slice(1).map((line, index) => (
    Math.max(0, grouped[index].bottom - line.top)
  ));
  const style = getComputedStyle(element);
  return {
    text: element.textContent.trim(),
    fontSize: Number.parseFloat(style.fontSize),
    lineHeight: Number.parseFloat(style.lineHeight),
    lines: grouped.length,
    maxOverlap: overlaps.length ? Math.max(...overlaps) : 0,
  };
});

const auditDisplayCase = async (page, baseUrl, viewport, displayCase, textSamples) => {
  const label = `${displayCase.name}, ${viewport.name} ${viewport.width}x${viewport.height}`;
  await page.goto(new URL(displayCase.route, baseUrl).href, { waitUntil: "domcontentloaded" });
  await waitForStablePage(page);
  const target = page.locator(displayCase.selector).first();
  await target.waitFor({ state: "visible" });
  await target.evaluate(element => element.scrollIntoView({ block: "center", behavior: "auto" }));
  await frames(page);
  const metrics = await lineMetrics(page, displayCase.selector);
  textSamples.add(metrics.text);
  check(metrics.lines >= 2, `${label}: expected a multiline display sample, got ${metrics.lines} line(s)`);
  check(metrics.maxOverlap <= .1, `${label}: display line boxes overlap by ${metrics.maxOverlap.toFixed(2)}px`);
  check(
    metrics.lineHeight + .1 >= metrics.fontSize * 1.205,
    `${label}: line-height ${metrics.lineHeight}px is below the semantic display contract for ${metrics.fontSize}px`,
  );
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check(overflow <= EPSILON, `${label}: horizontal overflow ${overflow}px`);
};

const readMaskMetrics = async scene => scene.evaluate(async element => {
  const art = element.querySelector(":scope > .campaign-art, :scope > .scene-art");
  const content = element.querySelector("[data-ok-safe-content]");
  const bounds = window.OKAgencyResponsiveSafety.getArtBounds(element);
  const sceneRect = element.getBoundingClientRect();
  const actual = {
    top: Number.POSITIVE_INFINITY,
    right: Number.NEGATIVE_INFINITY,
    bottom: Number.NEGATIVE_INFINITY,
    left: Number.POSITIVE_INFINITY,
  };
  const include = rect => {
    if (!rect.width || !rect.height) return;
    actual.top = Math.min(actual.top, rect.top - sceneRect.top);
    actual.right = Math.max(actual.right, rect.right - sceneRect.left);
    actual.bottom = Math.max(actual.bottom, rect.bottom - sceneRect.top);
    actual.left = Math.min(actual.left, rect.left - sceneRect.left);
  };
  content?.querySelectorAll("h1,h2,h3,p,button,a,li,summary,label,input,select,textarea")
    .forEach(target => {
      const range = document.createRange();
      range.selectNodeContents(target);
      const rects = [...range.getClientRects()].filter(rect => rect.width && rect.height);
      if (rects.length) rects.forEach(include);
      else include(target.getBoundingClientRect());
    });
  return {
    version: bounds?.version,
    masked: bounds?.masked,
    shape: bounds?.maskShape,
    revealSide: bounds?.revealSide,
    protected: bounds?.protected,
    feather: bounds?.feather,
    fullVisible: bounds?.fullVisible,
    actual,
    state: art?.dataset.okSafeArt,
    datasetShape: art?.dataset.okSafeShape,
    maskImage: art ? getComputedStyle(art).maskImage : "none",
    sceneHeight: sceneRect.height,
    viewportHeight: innerHeight,
  };
});

const assertMaskContract = (mask, label, { full = false } = {}) => {
  check(mask.version === 2, `${label}: art bounds API version is ${mask.version}, expected 2`);
  check(mask.masked && mask.shape === "directional-feather", `${label}: art mask shape is ${mask.shape}`);
  check(mask.state === "active" && mask.datasetShape === "directional-feather", `${label}: PR49 feather is not active`);
  check(mask.maskImage.includes("linear-gradient"), `${label}: mask is not a continuous linear gradient`);
  check(["left", "right", "top", "bottom"].includes(mask.revealSide), `${label}: invalid reveal side ${mask.revealSide}`);
  check(mask.protected === null, `${label}: directional feather unexpectedly publishes a local protection box`);
  check(mask.feather?.width > 0 && mask.feather?.height > 0, `${label}: continuous feather region is empty`);
  check(mask.fullVisible?.width > 0 && mask.fullVisible?.height > 0, `${label}: fully visible artwork region is empty`);
  if (!full) return;
  check(Math.abs(mask.sceneHeight - mask.viewportHeight) <= EPSILON, `${label}: scene is not 100svh`);
};

const assertUnmaskedContract = (mask, label) => {
  check(mask.version === 2, `${label}: art bounds API version is ${mask.version}, expected 2`);
  check(!mask.masked && mask.shape === null, `${label}: roomy composition unexpectedly uses ${mask.shape}`);
  check(mask.state === "idle", `${label}: roomy artwork state is ${mask.state}`);
  check(mask.maskImage === "none", `${label}: roomy composition still has a computed mask`);
};

const auditMaskFamily = async (page, baseUrl, maskCase) => {
  const label = `${maskCase.name} mask family`;
  if (WEBKIT_SMOKE) console.log(`WebKit mask: ${maskCase.name}`);
  await page.setViewportSize(maskCase.viewport ?? { width: 1113, height: 728 });
  await page.goto(new URL(maskCase.route, baseUrl).href, { waitUntil: "domcontentloaded" });
  await waitForStablePage(page);
  await page.waitForFunction(() => window.OKAgencyResponsiveSafety?.getArtBounds);
  const scene = page.locator(maskCase.selector);
  await scene.evaluate(element => element.scrollIntoView({ block: "start", behavior: "auto" }));
  await frames(page, 4);
  assertMaskContract(await readMaskMetrics(scene), label, { full: true });
};

const auditWebSystem = async (page, baseUrl, viewport, navScale) => {
  const label = `Web system, ${viewport.name} ${viewport.width}x${viewport.height}`;
  await page.goto(new URL("/strony-internetowe", baseUrl).href, { waitUntil: "domcontentloaded" });
  await waitForStablePage(page);
  await page.waitForFunction(() => window.OKAgencyResponsiveSafety?.getArtBounds);

  const componentMetrics = await page.evaluate(() => {
    const rootStyle = getComputedStyle(document.documentElement);
    const number = (element, property) => Number.parseFloat(getComputedStyle(element)[property]);
    const header = document.querySelector('header[data-ok-global-nav]');
    const brand = header.querySelector(":scope > a:first-child img");
    const directLink = header.querySelector("nav[data-ok-primary-nav] > a");
    const popoverLink = header.querySelector(".ok-nav-offer__popover > a");
    const gridBody = document.querySelector(".decision-guide__item p");
    const gridLabel = document.querySelector(".decision-guide__item h3");
    return {
      roles: {
        label: Number.parseFloat(rootStyle.getPropertyValue("--ok-type-label")),
        content: Number.parseFloat(rootStyle.getPropertyValue("--ok-type-content")),
      },
      nav: {
        direct: number(directLink, "fontSize"),
        popover: number(popoverLink, "fontSize"),
        headerHeight: header.getBoundingClientRect().height,
        brandWidth: brand.getBoundingClientRect().width,
      },
      support: {
        body: number(gridBody, "fontSize"),
        label: number(gridLabel, "fontSize"),
        width: document.querySelector(".decision-guide__grid").getBoundingClientRect().width,
      },
    };
  });
  check(
    componentMetrics.nav.direct + .75 >= componentMetrics.roles.label,
    `${label}: direct nav ${componentMetrics.nav.direct}px is below label role ${componentMetrics.roles.label}px`,
  );
  check(
    componentMetrics.nav.popover + .75 >= componentMetrics.roles.label,
    `${label}: popover nav ${componentMetrics.nav.popover}px is below label role ${componentMetrics.roles.label}px`,
  );
  check(
    componentMetrics.support.body + .75 >= componentMetrics.roles.content,
    `${label}: support body ${componentMetrics.support.body}px is below content role ${componentMetrics.roles.content}px`,
  );
  check(
    componentMetrics.support.label + .75 >= componentMetrics.roles.label,
    `${label}: support label ${componentMetrics.support.label}px is below label role ${componentMetrics.roles.label}px`,
  );
  navScale.push({ viewport, ...componentMetrics.nav });

  const scene = page.locator("#web-opening");
  await scene.evaluate(element => element.scrollIntoView({ block: "start", behavior: "auto" }));
  await frames(page, 4);
  const openingMask = await readMaskMetrics(scene);
  if (viewport.width >= 7680) {
    assertMaskContract(openingMask, `${label}, scaled artwork collision`);
  } else {
    assertUnmaskedContract(openingMask, label);
  }
};

const auditResize = async (page, baseUrl, {
  route,
  sceneSelector,
  from,
  to,
  expectMask = false,
  offset = 0,
}) => {
  await page.setViewportSize(from);
  await page.goto(new URL(route, baseUrl).href, { waitUntil: "domcontentloaded" });
  await waitForStablePage(page);
  if (expectMask) await page.waitForFunction(() => window.OKAgencyResponsiveSafety?.getArtBounds);
  const scene = page.locator(sceneSelector);
  await scene.evaluate(element => element.scrollIntoView({ block: "start", behavior: "auto" }));
  if (offset) {
    await scene.evaluate((element, relativeOffset) => {
      document.scrollingElement.scrollTop += element.getBoundingClientRect().height * relativeOffset;
    }, offset);
  }
  await frames(page, 4);
  const before = await scene.evaluate((element, withMask) => {
    const art = element.querySelector(":scope > .campaign-art, :scope > .scene-art");
    const bounds = withMask ? window.OKAgencyResponsiveSafety.getArtBounds(element) : null;
    return {
      scrollY,
      top: element.getBoundingClientRect().top,
      height: element.getBoundingClientRect().height,
      feather: bounds?.feather || null,
      maskImage: art ? getComputedStyle(art).maskImage : null,
    };
  }, expectMask);
  await page.setViewportSize(to);
  await frames(page, 6);
  await page.waitForTimeout(120);
  const after = await scene.evaluate((element, withMask) => {
    const art = element.querySelector(":scope > .campaign-art, :scope > .scene-art");
    const bounds = withMask ? window.OKAgencyResponsiveSafety.getArtBounds(element) : null;
    return {
      scrollY,
      top: element.getBoundingClientRect().top,
      height: element.getBoundingClientRect().height,
      feather: bounds?.feather || null,
      maskImage: art ? getComputedStyle(art).maskImage : null,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  }, expectMask);
  const label = `${route} ${sceneSelector} resize ${from.width}x${from.height}→${to.width}x${to.height}`;
  const beforeOffset = -before.top / before.height;
  const afterOffset = -after.top / after.height;
  check(Math.abs(beforeOffset - offset) <= .01, `${label}: initial scene offset is ${beforeOffset.toFixed(3)}, expected ${offset}`);
  check(Math.abs(afterOffset - beforeOffset) <= .01, `${label}: scene offset shifted ${beforeOffset.toFixed(3)}→${afterOffset.toFixed(3)}`);
  check(Math.abs(after.height - to.height) <= EPSILON, `${label}: scene height ${after.height}px is not ${to.height}px`);
  check(after.overflow <= EPSILON, `${label}: horizontal overflow ${after.overflow}px`);
  if (expectMask) {
    check(before.maskImage !== after.maskImage, `${label}: mask image did not react to resize`);
    check(
      JSON.stringify(before.feather) !== JSON.stringify(after.feather),
      `${label}: directional feather did not react to resize`,
    );
  }
};

const auditBackdropFailureFallback = async (page, baseUrl) => {
  await page.route(/editorial-atelier-backdrop-.*\.webp/, route => route.abort());
  await page.goto(new URL("/social-media", baseUrl).href, { waitUntil: "domcontentloaded" });
  await page.locator("#social-opening[data-ok-safe-scene]").waitFor();
  await frames(page, 4);

  const fallback = await page.locator("#social-opening").evaluate(scene => ({
    protectionReady: scene.hasAttribute("data-ok-safe-protection-ready"),
    artState: scene.querySelector(".campaign-art")?.dataset.okSafeArt,
    copyBackground: getComputedStyle(scene.querySelector(".opening-copy")).backgroundColor,
  }));
  check(!fallback.protectionReady, "mobile backdrop failure: protection was marked ready");
  check(fallback.artState === "idle", `mobile backdrop failure: artwork state is ${fallback.artState}`);
  check(
    fallback.copyBackground !== "rgba(0, 0, 0, 0)"
      && fallback.copyBackground !== "transparent",
    `mobile backdrop failure: fallback copy background is ${fallback.copyBackground}`,
  );
};

const auditDeferredPlacementMaps = async (page, baseUrl) => {
  const requestedMaps = new Set();
  await page.route(/placement-mask-.*\.png/, async route => {
    requestedMaps.add(new URL(route.request().url()).pathname);
    await route.continue();
  });
  await page.goto(new URL("/proces", baseUrl).href, { waitUntil: "domcontentloaded" });
  await page.locator("#process-opening[data-ok-safe-protection-ready]").waitFor();
  await frames(page, 4);

  const availableMaps = await page.locator("[data-placement-mask]").count();
  check(requestedMaps.size > 0, "deferred placement maps: opening map was not requested");
  check(
    requestedMaps.size <= 2,
    `deferred placement maps: requested ${requestedMaps.size} maps before leaving the opening view`,
  );
  check(
    requestedMaps.size < availableMaps,
    `deferred placement maps: requested ${requestedMaps.size}/${availableMaps} maps on initial view`,
  );
};

let browser;
try {
  const baseUrl = await resolveBaseUrl();
  const browserType = WEBKIT_SMOKE ? webkit : chromium;
  browser = await browserType.launch({ headless: true });
  const navScale = [];
  const textSamples = new Set();

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
    await context.addInitScript(() => {
      localStorage.setItem("ok-consent", JSON.stringify({
        version: 3,
        level: "denied",
        at: new Date().toISOString(),
      }));
    });
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on("pageerror", error => runtimeErrors.push(error.message));
    page.on("console", message => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });
    try {
      if (!WEBKIT_SMOKE) {
        for (const displayCase of DISPLAY_CASES) {
          await auditDisplayCase(page, baseUrl, viewport, displayCase, textSamples);
        }
        await auditWebSystem(page, baseUrl, viewport, navScale);
      }
      check(runtimeErrors.length === 0, `${viewport.name}: runtime errors: ${runtimeErrors.join(" | ")}`);
    } finally {
      await page.close();
      await context.close();
    }
  }

  if (!WEBKIT_SMOKE) {
    const mobileContext = await browser.newContext({ viewport: MOBILE_VIEWPORT, reducedMotion: "reduce" });
    await mobileContext.addInitScript(() => {
      localStorage.setItem("ok-consent", JSON.stringify({ version: 3, level: "denied", at: new Date().toISOString() }));
    });
    const mobilePage = await mobileContext.newPage();
    try {
      for (const displayCase of MOBILE_DISPLAY_CASES) {
        await auditDisplayCase(mobilePage, baseUrl, MOBILE_VIEWPORT, displayCase, textSamples);
      }
    } finally {
      await mobilePage.close();
      await mobileContext.close();
    }

    const placementContext = await browser.newContext({ viewport: MOBILE_VIEWPORT, reducedMotion: "reduce" });
    await placementContext.addInitScript(() => {
      localStorage.setItem("ok-consent", JSON.stringify({ version: 3, level: "denied", at: new Date().toISOString() }));
    });
    const placementPage = await placementContext.newPage();
    try {
      await auditDeferredPlacementMaps(placementPage, baseUrl);
    } finally {
      await placementPage.close();
      await placementContext.close();
    }
  }

  const fallbackContext = await browser.newContext({ viewport: MOBILE_VIEWPORT, reducedMotion: "reduce" });
  await fallbackContext.addInitScript(() => {
    localStorage.setItem("ok-consent", JSON.stringify({ version: 3, level: "denied", at: new Date().toISOString() }));
  });
  const fallbackPage = await fallbackContext.newPage();
  try {
    await auditBackdropFailureFallback(fallbackPage, baseUrl);
  } finally {
    await fallbackPage.close();
    await fallbackContext.close();
  }

  navScale.slice(1).forEach((entry, index) => {
    const previous = navScale[index];
    check(entry.direct + .1 >= previous.direct, `${entry.viewport.name}: direct nav type shrank from ${previous.direct}px to ${entry.direct}px`);
    check(entry.headerHeight + .1 >= previous.headerHeight, `${entry.viewport.name}: nav height shrank`);
    check(entry.brandWidth + .1 >= previous.brandWidth, `${entry.viewport.name}: brand width shrank`);
  });
  if (!WEBKIT_SMOKE) {
    const combinedSamples = [...textSamples].join(" ");
    for (const glyph of ["j", "g", "y", "?", "."]) {
      check(combinedSamples.toLocaleLowerCase("pl").includes(glyph), `display samples do not cover glyph '${glyph}'`);
    }
    check(/[ąćęłńóśźż]/i.test(combinedSamples), "display samples do not cover Polish diacritics");
  }

  const resizeContext = await browser.newContext({
    viewport: { width: 2560, height: 1440 },
    reducedMotion: "reduce",
  });
  await resizeContext.addInitScript(() => {
    localStorage.setItem("ok-consent", JSON.stringify({ version: 3, level: "denied", at: new Date().toISOString() }));
  });
  const resizePage = await resizeContext.newPage();
  try {
    for (const maskCase of MASK_FAMILY_CASES) {
      await auditMaskFamily(resizePage, baseUrl, maskCase);
    }
    if (!WEBKIT_SMOKE) {
      await auditResize(resizePage, baseUrl, {
        route: "/kampanie",
        sceneSelector: "#campaign-opening",
        from: { width: 2560, height: 1440 },
        to: { width: 1920, height: 1080 },
        expectMask: true,
      });
    }
    if (WEBKIT_SMOKE) console.log("WebKit resize: Process delivery 60%");
    await auditResize(resizePage, baseUrl, {
      route: "/proces",
      sceneSelector: "#process-delivery",
      from: { width: 2560, height: 1440 },
      to: { width: 1920, height: 1080 },
      offset: .6,
    });
    if (!WEBKIT_SMOKE) {
      await auditResize(resizePage, baseUrl, {
        route: "/proces",
        sceneSelector: "#process-delivery",
        from: { width: 2560, height: 1080 },
        to: { width: 1440, height: 1080 },
        offset: .35,
      });
    }
    const acts = await resizePage.locator(".process-act").allTextContents();
    check(acts.every(label => !label.includes("/")), `process contains technical scene indices: ${acts.join(", ")}`);
  } finally {
    await resizePage.close();
    await resizeContext.close();
  }
} catch (error) {
  failures.push(`runner: ${error.stack || error.message}`);
} finally {
  await browser?.close().catch(() => {});
  managedServer?.kill();
}

if (failures.length) {
  console.error(`FHD/2K responsive audit failed with ${failures.length} violation(s):`);
  failures.forEach(message => console.error(`- ${message}`));
  process.exitCode = 1;
} else {
  console.log(`FHD/2K responsive audit passed in ${WEBKIT_SMOKE ? "WebKit" : "Chromium"}: ${VIEWPORTS.length} scale viewport(s), mobile leading, mask families and live resize anchors.`);
}
