import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

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
];

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
    /assets\/site-navigation\.css\?v=20260730-4/,
    `${page}: versioned global navigation CSS is missing.`,
  );
  assert.match(
    html,
    /assets\/navigation\.js\?v=20260730-4/,
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
assert.match(css, /--ok-nav-docked-height:\s*80px/, "Docked rail must be 80px.");
assert.match(css, /--ok-nav-floating-height:\s*64px/, "Detached rail must be 64px.");
assert.match(css, /\[data-ok-nav-state="detached"\]/, "Detached state styles are required.");
assert.match(css, /border-radius:\s*16px/, "Detached rail must use a restrained radius.");
assert.match(css, /backdrop-filter:\s*blur\(20px\)/, "Detached material blur is required.");
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

console.log(
  `Global navigation check passed for ${publicPages.length} public pages.`,
);
