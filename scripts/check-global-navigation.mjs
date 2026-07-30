import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicPages = readdirSync(projectRoot)
  .filter((name) => name.endsWith(".html"))
  .sort();

assert.equal(publicPages.length, 12, "Expected the 12 public HTML documents.");

for (const page of publicPages) {
  const html = readFileSync(join(projectRoot, page), "utf8");

  assert.match(
    html,
    /assets\/site-navigation\.css\?v=20260730-2/,
    `${page}: versioned global navigation CSS is missing.`,
  );
  assert.match(
    html,
    /assets\/navigation\.js\?v=20260730-2/,
    `${page}: versioned global navigation script is missing.`,
  );
  assert.match(
    html,
    /<header class="[^"]*(?:topbar|site-header|legal-header)[^"]*">/,
    `${page}: a supported global header is missing.`,
  );
  assert.match(
    html,
    /<nav[^>]+aria-label="Główna nawigacja"/,
    `${page}: the semantic primary navigation is missing.`,
  );
}

const css = readFileSync(join(projectRoot, "assets", "site-navigation.css"), "utf8");
assert.match(css, /--ok-nav-rail-height:\s*80px/, "Spacious rail must be 80px.");
assert.match(
  css,
  /@media\s*\(max-width:\s*1180px\),\s*\(max-aspect-ratio:\s*4\s*\/\s*3\)/,
  "Compact state must use the shared 1180px / 4:3 spatial query.",
);
assert.match(css, /--ok-nav-rail-height:\s*68px/, "Compact rail must be 68px.");
assert.match(css, /\.ok-nav-trigger[\s\S]*?min-height:\s*44px/, "MENU target must be at least 44px.");
assert.match(css, /:focus-visible/, "Visible keyboard focus styles are required.");
assert.match(css, /scroll-padding-top/, "Sticky/fixed header anchor offset is required.");
assert.match(css, /prefers-reduced-motion:\s*reduce/, "Reduced-motion handling is required.");
assert.match(css, /forced-colors:\s*active/, "Forced-colors handling is required.");

const script = readFileSync(join(projectRoot, "assets", "navigation.js"), "utf8");
for (const label of ["Oferta", "Jak pracujemy", "Kontakt"]) {
  assert.ok(script.includes(label), `Compact menu must expose “${label}”.`);
}
assert.match(script, /aria-haspopup",\s*"dialog"/, "MENU must advertise a dialog.");
assert.match(script, /dialog\.showModal\(\)/, "Compact menu must open as a modal dialog.");
assert.match(script, /dialog\.addEventListener\("cancel"/, "Escape/cancel handling is required.");
assert.match(script, /returnTarget\.focus\(\{\s*preventScroll:\s*true\s*\}\)/, "Focus must return to MENU.");
assert.match(
  script,
  /"\(max-width:\s*1180px\),\s*\(max-aspect-ratio:\s*4\/3\)"/,
  "JavaScript must follow the same shared compact-state contract.",
);
assert.match(script, /data\.okGlobalNav|dataset\.okGlobalNav/, "Progressive enhancement marker is required.");

console.log(
  `Global navigation check passed for ${publicPages.length} public pages.`,
);
