import { readFile, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFile(join(root, path), "utf8");
const failures = [];
const requireText = (source, text, message) => {
  if (!source.includes(text)) failures.push(message);
};
const reject = (source, pattern, message) => {
  if (pattern.test(source)) failures.push(message);
};

const publicPages = [
  "404.html",
  "diagnoza.html",
  "dostepnosc.html",
  "faq.html",
  "index.html",
  "kampanie.html",
  "kontakt.html",
  "menu.html",
  "o-nas.html",
  "polityka-prywatnosci.html",
  "proces.html",
  "social-media.html",
  "strony-internetowe.html",
];
const storyPages = [
  "kampanie.html",
  "o-nas.html",
  "proces.html",
  "social-media.html",
  "strony-internetowe.html",
];
const serviceStyleFiles = [
  "assets/services/about/styles.css",
  "assets/services/campaign/styles.css",
  "assets/services/diagnosis/styles.css",
  "assets/services/process/styles.css",
  "assets/services/social/styles.css",
  "assets/services/web/styles.css",
];

const [
  aboutHtml,
  aboutCss,
  aboutScript,
  enhancementsCss,
  safetyCss,
  storyCss,
  interactions,
  routeMotion,
] = await Promise.all([
  read("o-nas.html"),
  read("assets/services/about/styles.css"),
  read("assets/services/about/script.js"),
  read("assets/site-enhancements.css"),
  read("assets/responsive-safety.css"),
  read("assets/story-standard.css"),
  read("assets/service-interactions.js"),
  read("assets/route-motion.css").catch(() => ""),
]);

for (const page of publicPages) {
  const html = await read(page);
  requireText(
    html,
    "assets/route-motion.css?v=20260801-2",
    `${page}: brak wspólnego route-motion.css`,
  );
  requireText(
    html,
    "/assets/site-enhancements.css?v=20260801-2",
    `${page}: niespójna wersja site-enhancements.css`,
  );
}

for (const page of storyPages) {
  const html = await read(page);
  requireText(
    html,
    "assets/story-standard.css?v=20260801-2",
    `${page}: brak wspólnego modelu scen`,
  );
  requireText(
    html,
    "assets/service-interactions.js?v=20260801-3",
    `${page}: brak wspólnych interakcji`,
  );
}

requireText(routeMotion, "--ok-motion-spring", "brak wspólnego easing ruchu");
requireText(routeMotion, "--ok-motion-cue-duration", "brak wspólnego czasu scroll cue");
requireText(storyCss, ".about-page .scene", "O nas nie korzysta ze wspólnego modelu scen");
requireText(storyCss, "ok-story-cue", "scroll cue nie ma wspólnej animacji");
requireText(interactions, '".annotation-callout, .annotation"', "callouty nie korzystają ze wspólnego skryptu");
requireText(interactions, '".proof-item, .accordion-item"', "akordeony nie korzystają ze wspólnego skryptu");
requireText(interactions, "window.OKAgencyMotion?.isPaused()", "interakcje ignorują globalną pauzę");
requireText(interactions, 'callout.dataset.pinned = "false"', "callouty nie startują systemowo ze stanu zamkniętego");

reject(aboutCss, /overflow:\s*hidden;\s*overscroll-behavior:\s*none;/, "O nas nadal blokuje dokument");
reject(aboutCss, /\.scene\s*\{[^}]*filter:\s*blur/s, "O nas nadal ma lokalny blur scen");
reject(aboutCss, /\.scene\s*\{[^}]*opacity:\s*0/s, "O nas nadal ukrywa sceny lokalnym systemem");
reject(aboutCss, /\.scene\.is-active\s*\{/, "O nas nadal ma lokalny crossfade aktywnej sceny");
reject(aboutScript, /syncCallout|syncAccordionItem|mobile-details/, "O nas duplikuje wspólne interakcje");
reject(aboutHtml, /class="annotation[^\"]*\bis-open\b/, "O nas nadal otwiera callout przy starcie");
reject(aboutHtml, /class="annotation-dot"[^>]*aria-expanded="true"/, "O nas ma niespójny stan aria calloutu przy starcie");
reject(aboutCss, /\.annotation:(?:hover|focus-within).*\.annotation-copy/, "O nas omija wspólny mechanizm otwierania calloutów");
reject(enhancementsCss, /about-page/, "site-enhancements.css nadal zawiera wyjątki O nas");
reject(safetyCss, /about-page/, "responsive-safety.css nadal zawiera wyjątki O nas");

for (const file of serviceStyleFiles) {
  const css = await read(file);
  requireText(
    css,
    "--ease: var(--ok-motion-spring)",
    `${file}: lokalny easing nie korzysta ze wspólnego tokenu`,
  );
  reject(
    css,
    /--ease:\s*cubic-bezier/,
    `${file}: lokalny easing nadpisuje wspólny system ruchu`,
  );
}

const routeInfo = await stat(join(root, "assets", "route-motion.css")).catch(() => null);
if (!routeInfo?.isFile()) failures.push("brak assets/route-motion.css");

if (failures.length) {
  console.error(`Błędy systemu ruchu (${failures.length}):`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log("OK: wszystkie strony korzystają z jednego systemu ruchu, scen i interakcji.");
}
