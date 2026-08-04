import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.OK_AGENCY_BASE_URL || "https://okagency.pl";
const outputDir = resolve(".tmp", "production-art-safety");
const routes = [
  "/strony-internetowe",
  "/social-media",
  "/kampanie",
  "/proces",
  "/o-nas",
  "/diagnoza",
];
const viewports = [
  { name: "desktop-2048x1053", width: 2048, height: 1053 },
  { name: "mobile-390x844", width: 390, height: 844 },
];
const closeEnough = value => Math.abs(value) <= 1;

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const failures = [];

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      reducedMotion: "reduce",
    });
    await context.addInitScript(() => {
      localStorage.setItem("ok-consent", JSON.stringify({
        version: 3,
        level: "denied",
        at: new Date().toISOString(),
      }));
    });

    for (const route of routes) {
      const page = await context.newPage();
      const runtimeErrors = [];
      page.on("console", message => {
        if (message.type() === "error") runtimeErrors.push(`console: ${message.text()}`);
      });
      page.on("pageerror", error => runtimeErrors.push(`page: ${error.message}`));

      const response = await page.goto(`${baseUrl}${route}`, {
        waitUntil: "networkidle",
        timeout: 45_000,
      });
      await page.waitForFunction(
        () => document.querySelectorAll("[data-ok-safe-backdrop-layer]").length > 0,
        { timeout: 20_000 },
      );
      await page.waitForTimeout(300);

      const result = await page.evaluate(() => {
        const cssHref = [...document.styleSheets]
          .map(sheet => sheet.href)
          .find(href => href?.includes("/assets/responsive-safety.css"));
        const layers = [...document.querySelectorAll("[data-ok-safe-backdrop-layer]")]
          .map(backdrop => {
            const scene = backdrop.closest("[data-ok-safe-scene]");
            const artwork = scene?.querySelector(":scope > .campaign-art, :scope > .scene-art");
            const backdropRect = backdrop.getBoundingClientRect();
            const artworkRect = artwork?.getBoundingClientRect();
            const style = getComputedStyle(backdrop);
            return {
              scene: scene?.id || scene?.className || "unknown-scene",
              position: style.position,
              objectFit: style.objectFit,
              pointerEvents: style.pointerEvents,
              delta: artworkRect ? {
                x: backdropRect.x - artworkRect.x,
                y: backdropRect.y - artworkRect.y,
                width: backdropRect.width - artworkRect.width,
                height: backdropRect.height - artworkRect.height,
              } : null,
            };
          });
        return {
          cssHref,
          layers,
          horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
        };
      });

      const routeFailures = [];
      if (response?.status() !== 200) routeFailures.push(`HTTP ${response?.status() ?? "no response"}`);
      if (!result.cssHref) routeFailures.push("responsive-safety.css is not loaded");
      if (!result.layers.length) routeFailures.push("no tonal backdrop layers");
      if (result.horizontalOverflow > 1) routeFailures.push(`horizontal overflow ${result.horizontalOverflow}px`);
      routeFailures.push(...runtimeErrors);

      for (const layer of result.layers) {
        if (layer.position !== "absolute") {
          routeFailures.push(`${layer.scene}: backdrop position is ${layer.position}, expected absolute`);
        }
        if (layer.objectFit !== "cover") {
          routeFailures.push(`${layer.scene}: backdrop object-fit is ${layer.objectFit}, expected cover`);
        }
        if (layer.pointerEvents !== "none") {
          routeFailures.push(`${layer.scene}: backdrop intercepts pointer events`);
        }
        if (!layer.delta || !Object.values(layer.delta).every(closeEnough)) {
          routeFailures.push(`${layer.scene}: backdrop/artwork bounds differ: ${JSON.stringify(layer.delta)}`);
        }
      }

      if (routeFailures.length) {
        const slug = route.slice(1).replaceAll("/", "-") || "home";
        const screenshot = resolve(outputDir, `${viewport.name}-${slug}.png`);
        await page.screenshot({ path: screenshot, fullPage: true });
        failures.push(...routeFailures.map(failure => `${viewport.name} ${route}: ${failure}`));
        console.error(`FAIL ${viewport.name} ${route}; screenshot: ${screenshot}`);
      } else {
        console.log(`OK ${viewport.name} ${route}: ${result.layers.length} backdrop layer(s)`);
      }
      await page.close();
    }
    await context.close();
  }
} finally {
  await browser.close();
}

if (failures.length) {
  console.error(`\nProduction artwork safety failures (${failures.length}):`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log("\nOK: production artwork backdrops match their artwork on every illustrated route.");
}
