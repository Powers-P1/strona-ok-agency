import process from "node:process";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DEFAULT_VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 1440, height: 640 },
  { width: 1440, height: 600 },
  { width: 1280, height: 720 },
  { width: 1024, height: 640 },
  { width: 1024, height: 600 },
  { width: 900, height: 620 },
  { width: 821, height: 620 },
  { width: 390, height: 844 },
  { width: 360, height: 640 },
];
const DEFAULT_ROUTES = [
  "/strony-internetowe",
  "/kampanie",
  "/social-media",
  "/proces",
  "/o-nas",
];
const VIEWPORTS = process.env.SCENE_AUDIT_VIEWPORTS
  ? process.env.SCENE_AUDIT_VIEWPORTS.split(",").map(value => {
    const [width, height] = value.split("x").map(Number);
    if (!width || !height) throw new Error(`Invalid SCENE_AUDIT_VIEWPORTS entry: ${value}`);
    return { width, height };
  })
  : DEFAULT_VIEWPORTS;
const ROUTES = process.env.SCENE_AUDIT_ROUTES
  ? process.env.SCENE_AUDIT_ROUTES.split(",").map(route => route.trim()).filter(Boolean)
  : DEFAULT_ROUTES;
const SCENE_SELECTOR = [
  ".campaign-frame",
  ".social-frame",
  ".process-frame",
  ".about-page .scene",
].join(",");
const ACTION_SELECTOR = ".proof-actions, .actions, .outline-cta";
const DISCLOSURE_SELECTOR = [
  ".proof-item .proof-trigger",
  ".accordion-item .accordion-trigger",
  ".mobile-details summary",
].join(",");
const failures = [];
let managedServer = null;

const availablePort = () => new Promise((resolve, reject) => {
  const server = createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    server.close(() => resolve(address.port));
  });
});

const resolveBaseUrl = async () => {
  if (process.argv[2]) return process.argv[2];
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
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
      // The local server may need a few scheduler turns before accepting requests.
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Local QA server did not start at ${baseUrl}`);
};

const frames = page => page.evaluate(() => new Promise(resolve => {
  requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}));

const layoutIssues = (scene, expectedScrollTop, {
  checkActions = true,
  checkDisclosureClipping = true,
} = {}) => scene.evaluate((element, {
  expected,
  actionSelector,
  shouldCheckActions,
  shouldCheckDisclosureClipping,
}) => {
  const issues = [];
  const sceneRect = element.getBoundingClientRect();
  if (Math.abs(element.clientHeight - innerHeight) > 2) {
    issues.push(`scene is ${element.clientHeight}px instead of ${innerHeight}px`);
  }
  if (
    /(auto|scroll)/.test(getComputedStyle(element).overflowY)
    && element.scrollHeight > element.clientHeight + 1
  ) issues.push("scene creates a nested vertical scroller");
  if (Math.abs(document.scrollingElement.scrollTop - expected) > 1) {
    issues.push(`viewport drifted ${Math.abs(document.scrollingElement.scrollTop - expected).toFixed(1)}px`);
  }

  const header = document.querySelector(".site-header");
  const proof = element.querySelector(".proof-content");
  if (header && proof && Math.abs(sceneRect.top) <= 2) {
    const headerRect = header.getBoundingClientRect();
    const proofRect = proof.getBoundingClientRect();
    const requiredGap = innerWidth >= 821 ? 8 : 0;
    if (proofRect.top < headerRect.bottom + requiredGap) {
      issues.push(`proof content starts ${(headerRect.bottom - proofRect.top).toFixed(1)}px under the header`);
    }
  }

  const visible = target => {
    const bounds = target.getBoundingClientRect();
    const style = getComputedStyle(target);
    return bounds.width > 0 && bounds.height > 0
      && style.display !== "none" && style.visibility !== "hidden";
  };
  if (shouldCheckActions) {
    const requiredClearance = innerWidth >= 821 ? 11 : 0;
    [...element.querySelectorAll(actionSelector)].filter(visible).forEach((action, index) => {
      const clearance = sceneRect.bottom - action.getBoundingClientRect().bottom;
      if (clearance < requiredClearance) {
        issues.push(`action ${index + 1} has ${clearance.toFixed(1)}px bottom clearance`);
      }
    });
  }

  if (shouldCheckDisclosureClipping) {
    element.querySelectorAll([
      ".proof-item.is-open .proof-detail:not([hidden])",
      ".accordion-item.is-open .accordion-detail:not([hidden])",
    ].join(",")).forEach((panel, index) => {
      if (panel.scrollHeight > panel.clientHeight + 2) {
        issues.push(
          `open disclosure ${index + 1} clips ${panel.scrollHeight - panel.clientHeight}px of content`,
        );
      }
    });
  }
  return issues;
}, {
  expected: expectedScrollTop,
  actionSelector: ACTION_SELECTOR,
  shouldCheckActions: checkActions,
  shouldCheckDisclosureClipping: checkDisclosureClipping,
});

const auditScene = async (page, scene, label) => {
  await scene.scrollIntoViewIfNeeded();
  await scene.evaluate(element => element.scrollIntoView({ block: "start", behavior: "auto" }));
  await frames(page);
  if (await scene.locator(".proof-item.is-open, .accordion-item.is-open").count()) {
    await page.waitForTimeout(420);
  }
  const sceneScrollTop = await page.evaluate(() => document.scrollingElement.scrollTop);
  const compactViewport = page.viewportSize().width >= 821 && page.viewportSize().height <= 730;

  (await layoutIssues(scene, sceneScrollTop)).forEach(message => failures.push(`${label}: ${message}`));

  const triggers = scene.locator(DISCLOSURE_SELECTOR);
  for (let index = 0; index < await triggers.count(); index += 1) {
    const trigger = triggers.nth(index);
    if (!await trigger.isVisible()) continue;
    const isOpen = await trigger.evaluate(element => (
      element.matches("summary")
        ? element.parentElement?.open === true
        : element.getAttribute("aria-expanded") === "true"
    ));
    let previousPanel = null;
    if (!isOpen && !await trigger.evaluate(element => element.matches("summary"))) {
      previousPanel = await trigger.evaluate(element => {
        const group = element.closest(".proof-list, .accordion");
        const previous = group?.querySelector('[aria-expanded="true"]');
        return previous?.getAttribute("aria-controls") || null;
      });
      await trigger.evaluate(element => element.click());
      if (previousPanel && !(page.viewportSize().width >= 821 && page.viewportSize().height <= 730)) {
        const hiddenImmediately = await page.locator(`#${previousPanel}`).evaluate(panel => panel.hidden);
        if (hiddenImmediately) failures.push(`${label}, disclosure ${index + 1}: previous panel skipped its closing transition`);
      }
    } else if (!isOpen) {
      await trigger.click();
    }
    (await layoutIssues(scene, sceneScrollTop, {
      checkActions: compactViewport,
      checkDisclosureClipping: false,
    })).forEach(message => {
      failures.push(`${label}, disclosure ${index + 1} immediate: ${message}`);
    });
    await frames(page);
    (await layoutIssues(scene, sceneScrollTop, {
      checkActions: compactViewport,
      checkDisclosureClipping: false,
    })).forEach(message => {
      failures.push(`${label}, disclosure ${index + 1} framed: ${message}`);
    });
    await page.waitForTimeout(420);
    (await layoutIssues(scene, sceneScrollTop)).forEach(message => {
      failures.push(`${label}, disclosure ${index + 1} settled: ${message}`);
    });
    const multipleOpen = await trigger.evaluate(element => {
      if (element.matches("summary")) {
        const group = element.closest(".mobile-details");
        return group ? group.querySelectorAll(":scope > details[open]").length > 1 : false;
      }
      const group = element.closest(".proof-list, .accordion");
      return group ? group.querySelectorAll('[aria-expanded="true"]').length > 1 : false;
    });
    if (multipleOpen) failures.push(`${label}, disclosure ${index + 1}: more than one row remains open`);
  }
};

const BASE_URL = await resolveBaseUrl();
const browser = await chromium.launch({ headless: true });
try {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport, reducedMotion: "no-preference" });
    await context.addInitScript(() => {
      localStorage.setItem("ok-consent", JSON.stringify({
        version: 1,
        granted: false,
        at: "scene-disclosure-audit",
      }));
    });
    try {
      for (const route of ROUTES) {
        const page = await context.newPage();
        try {
          await page.goto(new URL(route, BASE_URL).href, { waitUntil: "domcontentloaded" });
          await page.evaluate(async () => {
            if (document.fonts) await document.fonts.ready;
          });
          await frames(page);
          const scenes = page.locator(SCENE_SELECTOR);
          for (let index = 0; index < await scenes.count(); index += 1) {
            await auditScene(
              page,
              scenes.nth(index),
              `${route} ${viewport.width}x${viewport.height} scene ${index + 1}`,
            );
          }
        } catch (error) {
          failures.push(`${route} ${viewport.width}x${viewport.height}: ${error.message}`);
        } finally {
          await page.close();
        }
      }
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
  managedServer?.kill();
}

if (failures.length) {
  console.error(`Scene disclosure audit failed with ${failures.length} violation(s):`);
  failures.forEach(message => console.error(`- ${message}`));
  process.exitCode = 1;
} else {
  console.log(`Scene disclosure audit passed: ${ROUTES.length} routes, ${VIEWPORTS.length} low-height viewports.`);
}
