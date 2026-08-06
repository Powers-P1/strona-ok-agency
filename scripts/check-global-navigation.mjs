import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { createServer } from "node:net";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright";
import { versionedAsset } from "./asset-versions.mjs";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicPages = readdirSync(projectRoot)
  .filter((name) => name.endsWith(".html"))
  .sort();

assert.ok(publicPages.length > 0, "At least one public HTML document is required.");
assert.ok(publicPages.includes("faq.html"), "The FAQ route must be a real HTML document.");

const expectedTopLevelOrder = ["offer", "about", "process", "faq", "contact"];
const expectedOfferRoutes = [
  "/menu",
  "/strony-internetowe",
  "/social-media",
  "/kampanie",
  "/diagnoza",
  "/diagnoza-www",
];
const desktopViewports = [
  { width: 1440, height: 900 },
  { width: 1280, height: 800 },
];
const routeForPage = pageName => (
  pageName === "index.html" ? "/" : `/${pageName.replace(/\.html$/, "")}`
);

const availablePort = () => new Promise((resolve, reject) => {
  const server = createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    server.close(() => resolve(address.port));
  });
});

const startAuditServer = async () => {
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = spawn(
    process.execPath,
    ["server.mjs", "--host", "127.0.0.1", "--port", String(port)],
    { cwd: projectRoot, stdio: "ignore" },
  );

  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return { baseUrl, server };
    } catch {
      // The local server may need a few scheduler turns before accepting requests.
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  server.kill();
  throw new Error(`Global navigation audit server did not start at ${baseUrl}`);
};

const auditComputedDropdownAlignment = async (browserType = chromium) => {
  const { baseUrl, server } = await startAuditServer();
  const browser = await browserType.launch({ headless: true });

  try {
    for (const viewport of desktopViewports) {
      const context = await browser.newContext({ viewport });
      try {
        for (const pageName of publicPages) {
          const page = await context.newPage();
          try {
            await page.goto(new URL(routeForPage(pageName), baseUrl).href, { waitUntil: "domcontentloaded" });
            const disclosure = page.locator(".ok-nav-offer > summary");
            const viewportLabel = `${pageName} at ${viewport.width}x${viewport.height}`;
            assert.equal(await disclosure.count(), 1, `${viewportLabel}: Oferta disclosure is missing at runtime.`);
            await disclosure.click();

            const headerLayer = await page.locator("header[data-ok-global-nav]").evaluate(element => (
              Number.parseInt(getComputedStyle(element).zIndex, 10)
            ));
            assert.ok(
              headerLayer >= 140,
              `${viewportLabel}: route CSS lowered the global navigation stacking layer.`,
            );

            const desktopMotionParent = await page.locator("[data-motion-toggle]").evaluate(element => (
              element.parentElement === document.body
            ));
            assert.equal(
              desktopMotionParent,
              true,
              `${viewportLabel}: desktop motion control is trapped inside a transformed header.`,
            );

            const links = await page.locator(".ok-nav-offer__popover > a").evaluateAll(elements => (
              elements.map(element => {
                const style = getComputedStyle(element);
                const bounds = element.getBoundingClientRect();
                const range = document.createRange();
                range.selectNodeContents(element);
                const textBounds = range.getBoundingClientRect();
                const paintedElement = document.elementFromPoint(
                  bounds.left + (bounds.width / 2),
                  bounds.top + (bounds.height / 2),
                );
                return {
                  display: style.display,
                  justifyContent: style.justifyContent,
                  textAlign: style.textAlign,
                  leftInset: textBounds.left - bounds.left,
                  paddingLeft: Number.parseFloat(style.paddingLeft),
                  ownsPaintedPoint: paintedElement === element || element.contains(paintedElement),
                };
              })
            ));

            assert.equal(
              links.length,
              expectedOfferRoutes.length,
              `${viewportLabel}: Oferta runtime link count changed.`,
            );
            links.forEach((link, index) => {
              const label = `${viewportLabel}: Oferta runtime link ${index + 1}`;
              assert.equal(link.display, "flex", `${label} must use the shared flex layout.`);
              assert.equal(link.justifyContent, "flex-start", `${label} is not left aligned.`);
              assert.equal(link.textAlign, "left", `${label} text alignment is not left.`);
              assert.ok(
                Math.abs(link.leftInset - link.paddingLeft) <= 1,
                `${label} content does not start at its declared left padding.`,
              );
              assert.equal(
                link.ownsPaintedPoint,
                true,
                `${label} is painted underneath route content.`,
              );
            });
          } finally {
            await page.close();
          }
        }
      } finally {
        await context.close();
      }
    }

    const compactViewport = { width: 390, height: 844 };
    const compactContext = await browser.newContext({ viewport: compactViewport });
    try {
      for (const pageName of publicPages) {
        const page = await compactContext.newPage();
        try {
          await page.goto(new URL(routeForPage(pageName), baseUrl).href, { waitUntil: "domcontentloaded" });
          const viewportLabel = `${pageName} at ${compactViewport.width}x${compactViewport.height}`;
          const compactState = await page.locator("[data-motion-toggle]").evaluate((element) => {
            const trigger = document.querySelector(".ok-nav-trigger");
            const motionBounds = element.getBoundingClientRect();
            const triggerBounds = trigger?.getBoundingClientRect();
            const overlap = triggerBounds
              ? Math.max(0, Math.min(motionBounds.right, triggerBounds.right) - Math.max(motionBounds.left, triggerBounds.left))
                * Math.max(0, Math.min(motionBounds.bottom, triggerBounds.bottom) - Math.max(motionBounds.top, triggerBounds.top))
              : -1;
            element.focus();
            const style = getComputedStyle(element);
            return {
              parentIsUtilityRail: element.parentElement?.hasAttribute("data-ok-nav-utilities") || false,
              overlap,
              outlineColor: style.outlineColor,
              outlineStyle: style.outlineStyle,
              horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            };
          });
          assert.equal(compactState.parentIsUtilityRail, true, `${viewportLabel}: motion control is outside the utility rail.`);
          assert.equal(compactState.overlap, 0, `${viewportLabel}: motion control overlaps MENU.`);
          assert.notEqual(compactState.outlineStyle, "none", `${viewportLabel}: motion control has no visible focus ring.`);
          assert.notEqual(compactState.outlineColor, "rgb(255, 255, 255)", `${viewportLabel}: focus ring is white on the light rail.`);
          assert.equal(compactState.horizontalOverflow, 0, `${viewportLabel}: utility rail creates horizontal overflow.`);
        } finally {
          await page.close();
        }
      }
    } finally {
      await compactContext.close();
    }
  } finally {
    await browser.close();
    server.kill();
  }
};

for (const page of publicPages) {
  const html = readFileSync(join(projectRoot, page), "utf8");
  const globalHeaders = html.match(/<header\b[^>]*\bdata-ok-global-nav\b[^>]*>/g) || [];
  const primaryNavs = html.match(/<nav\b[^>]*\bdata-ok-primary-nav\b[^>]*>/g) || [];
  const slots = html.match(/\bclass="ok-nav-slot"/g) || [];
  const sentinels = html.match(/\bdata-ok-nav-sentinel\b/g) || [];

  assert.equal(globalHeaders.length, 1, `${page}: expected exactly one global header.`);
  assert.equal(primaryNavs.length, 1, `${page}: expected exactly one primary navigation.`);
  assert.equal(slots.length, 1, `${page}: expected exactly one reserved navigation slot.`);
  assert.equal(sentinels.length, 1, `${page}: expected exactly one scroll sentinel.`);

  assert.match(
    html,
    new RegExp(versionedAsset("assets/site-navigation.css").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    `${page}: versioned global navigation CSS is missing.`,
  );
  assert.match(
    html,
    new RegExp(versionedAsset("assets/navigation.js").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
    `${page}: versioned global navigation script is missing.`,
  );
  assert.match(
    html,
    /<nav[^>]+aria-label="Główna nawigacja"[^>]+data-ok-primary-nav|<nav[^>]+data-ok-primary-nav[^>]+aria-label="Główna nawigacja"/,
    `${page}: the semantic primary navigation is missing.`,
  );

  const primaryStart = html.indexOf("data-ok-primary-nav");
  const primaryEnd = html.indexOf("</nav>", primaryStart);
  const primaryMarkup = html.slice(primaryStart, primaryEnd);
  const actualOrder = [...primaryMarkup.matchAll(/data-nav-link="([^"]+)"/g)]
    .map((match) => match[1]);
  assert.deepEqual(
    actualOrder,
    expectedTopLevelOrder,
    `${page}: primary destinations have the wrong order.`,
  );

  const actualOfferRoutes = [...primaryMarkup.matchAll(
    /href="([^"]+)"\s+data-offer-route/g,
  )].map((match) => match[1]);
  assert.deepEqual(
    actualOfferRoutes,
    expectedOfferRoutes,
    `${page}: Oferta disclosure has the wrong route contract.`,
  );

  assert.doesNotMatch(
    primaryMarkup,
    />Kontakt<\/a>/,
    `${page}: plain Kontakt must not duplicate the conversation CTA.`,
  );
  assert.match(
    primaryMarkup,
    /class="[^"]*\bok-nav-cta\b[^"]*"[^>]*>Porozmawiajmy<\/a>/,
    `${page}: conversation CTA is missing.`,
  );
}

const css = readFileSync(join(projectRoot, "assets", "site-navigation.css"), "utf8");
assert.match(
  css,
  /scroll-padding-top:\s*var\(--ok-nav-slot-height\)/,
  "Global anchor offset must use the navigation slot height.",
);
assert.match(
  css,
  /--ok-nav-docked-height:\s*clamp\(80px,\s*7vh,\s*224px\)/,
  "Docked rail must retain its 80px floor and scale with the desktop canvas.",
);
assert.match(
  css,
  /--ok-nav-floating-height:\s*clamp\(64px,\s*5\.6vh,\s*180px\)/,
  "Detached rail must retain its 64px floor and scale with the desktop canvas.",
);
assert.match(
  css,
  /--ok-nav-primary-type:\s*max\(12px,\s*var\(--ok-type-label,\s*12px\)\)/,
  "Primary navigation must consume the semantic label role without shrinking below 12px.",
);
assert.match(
  css,
  /--ok-nav-popover-type:\s*max\(13px,\s*var\(--ok-type-label,\s*12px\)\)/,
  "Oferta navigation must consume the semantic label role without shrinking below 13px.",
);
assert.match(css, /\[data-ok-nav-state="detached"\]/, "Detached state styles are required.");
assert.match(css, /border-radius:\s*16px/, "Detached rail must use a restrained radius.");
assert.match(
  css,
  /--ok-nav-floating-canvas:\s*var\(--ok-nav-canvas-solid\)/,
  "Detached rail must use the opaque shared canvas.",
);
assert.match(css, /--ok-nav-floating-filter:\s*none/, "Detached rail must not reveal page copy.");
assert.match(
  css,
  /\.ok-nav-offer__popover\s*\{[\s\S]*?justify-items:\s*stretch[\s\S]*?text-align:\s*left/,
  "Oferta popover must own its alignment independently of route styles.",
);
assert.match(
  css,
  /body header\[data-ok-global-nav\] \.ok-nav-offer__popover > a\s*\{[\s\S]*?display:\s*flex[\s\S]*?justify-content:\s*flex-start[\s\S]*?text-align:\s*left/,
  "Oferta links must override route-level flex centering with one left-aligned layout contract.",
);
assert.match(
  css,
  /body header\[data-ok-global-nav\] \.ok-nav-offer__popover > a\s*\{[\s\S]*?box-sizing:\s*border-box/,
  "Oferta links must keep their padding inside the popover grid width.",
);
assert.match(
  css,
  /@media \(max-width: 420px\)[\s\S]*--ok-nav-floating-canvas-filtered:\s*var\(--ok-nav-canvas-solid\)/,
  "Mobile detached rail must use an opaque canvas token.",
);
assert.match(
  css,
  /@media \(max-width: 420px\)[\s\S]*--ok-nav-floating-filter:\s*none/,
  "Mobile detached rail must not reveal page copy through backdrop blur.",
);
assert.match(css, /\.ok-nav-trigger[\s\S]*?min-height:\s*44px/, "MENU target must be at least 44px.");
assert.match(css, /:focus-visible/, "Visible keyboard focus styles are required.");
assert.match(css, /scroll-padding-top/, "Fixed header anchor offset is required.");
assert.match(css, /prefers-reduced-motion:\s*reduce/, "Reduced-motion handling is required.");
assert.match(css, /forced-colors:\s*active/, "Forced-colors handling is required.");

const script = readFileSync(join(projectRoot, "assets", "navigation.js"), "utf8");
for (const label of ["Oferta", "O nas", "Jak pracujemy", "FAQ", "Porozmawiajmy"]) {
  assert.ok(script.includes(label), `Compact menu must expose “${label}”.`);
}
assert.match(script, /IntersectionObserver/, "Scroll state must prefer IntersectionObserver.");
assert.match(script, /event\.key\s*!==\s*"Escape"/, "Oferta Escape handling is required.");
assert.match(script, /!offerDisclosure\.contains\(event\.target\)/, "Outside-click handling is required.");
assert.match(script, /aria-haspopup",\s*"dialog"/, "MENU must advertise a dialog.");
assert.match(script, /dialog\.showModal\(\)/, "Compact menu must open as a modal dialog.");
assert.match(script, /dialog\.addEventListener\("cancel"/, "Escape/cancel handling is required.");
assert.match(script, /event\.key\s*!==\s*"Tab"/, "Explicit dialog focus-loop handling is required.");
assert.match(script, /document\.activeElement\s*===\s*first/, "Backward focus wrapping is required.");
assert.match(script, /document\.activeElement\s*===\s*last/, "Forward focus wrapping is required.");
assert.match(script, /trigger\.focus\(\{\s*preventScroll:\s*true\s*\}\)/, "Focus must return to MENU.");
assert.match(script, /compactByLayoutViewport/, "Compact navigation must use the layout viewport profile.");
assert.match(script, /data-ok-nav-compact/, "Navigation must publish one shared compact/tall profile.");
assert.match(script, /ok-nav-utilities/, "Compact navigation must own a shared utility rail.");
assert.match(script, /utilities\.prepend\(motionToggle\)/, "Compact navigation must adopt the motion control.");
assert.match(script, /document\.body\.append\(motionToggle\)/, "Desktop must keep the fixed motion control outside transformed headers.");
assert.match(
  script,
  /window\.innerWidth\s*\/\s*window\.innerHeight/,
  "Compact/tall classification must follow the same layout viewport as CSS.",
);

const runtimeAudit = process.argv.includes("--runtime");
const webkitAudit = process.argv.includes("--webkit");
if (runtimeAudit) await auditComputedDropdownAlignment(webkitAudit ? webkit : chromium);

console.log(
  runtimeAudit
    ? `Global navigation source and computed-style checks passed for ${publicPages.length} public pages in ${webkitAudit ? "WebKit" : "Chromium"}.`
    : `Global navigation source checks passed for ${publicPages.length} public pages.`,
);
