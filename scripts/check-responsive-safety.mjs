import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFile(join(root, path), "utf8");
const pages = [
  "index.html",
  "menu.html",
  "strony-internetowe.html",
  "social-media.html",
  "kampanie.html",
  "diagnoza.html",
  "proces.html",
  "o-nas.html",
  "kontakt.html",
  "polityka-prywatnosci.html",
  "dostepnosc.html",
  "404.html",
];

const [css, script, ...htmlFiles] = await Promise.all([
  read("assets/responsive-safety.css"),
  read("assets/responsive-safety.js"),
  ...pages.map(read),
]);
const storyCss = await read("assets/story-standard.css");
const sceneViewport = await read("assets/scene-viewport.css");
const socialCss = await read("assets/services/social/styles.css");
const faqCss = await read("assets/page-faq.css");

const failures = [];
const requireText = (source, text, message) => {
  if (!source.includes(text)) failures.push(message);
};

pages.forEach((page, index) => {
  const html = htmlFiles[index];
  requireText(html, "/assets/responsive-safety.css?v=20260801-4", `${page}: brak responsive-safety.css`);
  requireText(html, "/assets/responsive-safety.js?v=20260801-2", `${page}: brak responsive-safety.js`);
});

for (const token of [
  "ResizeObserver",
  "MutationObserver",
  "visualViewport",
  "visualContentRect",
  "stableContentRect",
  "element.scrollWidth",
  "element.scrollHeight",
  "document.fonts?.ready.then(() => requestAnimationFrame(schedule))",
  "data-ok-tall-portrait",
  "okSafeCurtain",
  "okSafeMobileHero",
  "okSafeCompactFit",
  "getHomeHeroLayout",
  "shortLandscape",
  "artScale",
  "data-ok-safe-cards",
  "data-ok-safe-menu-overflow",
  'document.fonts.status !== "loaded"',
  "OKAgencyResponsiveSafety",
]) {
  requireText(script, token, `responsive-safety.js: brak ${token}`);
}

for (const selector of [
  ".home-page .hero",
  ".campaign-frame",
  ".social-frame",
  ".process-frame",
  ".diagnosis-frame",
  ".about-page .scene",
  ".error-page",
]) {
  requireText(script, selector, `responsive-safety.js: brak obsługi ${selector}`);
}

requireText(css, '[data-ok-safe-art="active"]', "CSS nie ma aktywnej osłony grafiki");
requireText(css, ".home-page .hero", "CSS nie ma reflow hero");
requireText(css, "mask-image: var(--ok-safe-mask-image)", "CSS nie korzysta z dynamicznego featheru");
requireText(css, "[data-ok-safe-mobile-hero] .sculpture", "CSS nie ma dedykowanej kompozycji 4:3 i mobile");
requireText(css, 'data-ok-safe-mobile-hero="portrait"] .sculpture', "CSS nie ma osobnego kadru portretowego");
requireText(css, "object-position: 56% bottom", "portretowe drzewko nie jest zakotwiczone do dołu kadru");
requireText(css, "top: calc(100% - 36.43vw)", "animacja podstawy nie podąża za dolnym kadrowaniem");
requireText(storyCss, ".about-page .scene", "wspólny model scen nie obejmuje O nas");
requireText(sceneViewport, "--ok-scene-viewport-height: 100svh", "wspólny model nie wypełnia sceną całego viewportu");
requireText(sceneViewport, "html.ok-scene-page .ok-nav-slot", "wspólny model nie usuwa slotu nawigacji z geometrii scen");
requireText(sceneViewport, "max-height: var(--ok-scene-viewport-height) !important", "wspólny model pozwala scenom wyjść poza kadr");
requireText(sceneViewport, ".diagnosis-story .story-stage", "wspólny model wysokości nie obejmuje Diagnozy");
requireText(storyCss, "filter: none !important", "wspólny model nadal może rozmywać sceny O nas");
requireText(css, ".tablet-annotations ul", "podsumowania ilustracji nadal mogą tworzyć lokalny scroller");
requireText(css, '[data-ok-safe-cards="stacked"]', "CSS nie ma bezpiecznego układu kart");
requireText(css, "@media (max-height: 720px)", "CSS nie ma obsługi niskiego okna");
requireText(css, '[data-ok-safe-compact-fit="first-view"]', "mobile hero nie ma stabilnej wysokości 100svh");
requireText(css, ".social-frame, .process-frame) > .scroll-cue", "mobile nadal pokazuje zasłaniające podpowiedzi przewijania");
requireText(socialCss, ".proof-item.is-open .proof-detail", "Social nie ma mobilnego kontraktu rozwiniętych sygnałów");
requireText(socialCss, "max-height: none", "rozwinięty sygnał nadal może być przycięty stałą wysokością");
requireText(faqCss, "grid-template-columns: minmax(0, 1fr)", "FAQ nie zeruje minimalnej szerokości mobilnej kolumny");
requireText(faqCss, "overflow-wrap: anywhere", "CTA FAQ nie chroni długiej etykiety przed przycięciem");

requireText(script, "allowedSides", "JS nie wybiera najbezpieczniejszej strony grafiki");
requireText(script, "--ok-safe-mask-image", "JS nie generuje liniowego featheru grafiki");
requireText(script, "copySafeZone", "JS nie utrzymuje jednego źródła progu bezpiecznej strefy hero");
requireText(script, "homeLayout.copyFitsFirstView", "JS nie utrzymuje kompaktowego hero w pierwszym widoku");
requireText(script, 'Math.ceil(viewportHeight)', "JS nie kotwiczy kompaktowego hero do jednego viewportu");
requireText(script, '"accessible-overflow"', "JS nie zachowuje dostępnego reflow po powiększeniu tekstu");
requireText(script, "viewportWidth <= 1180 || viewportRatio <= 4 / 3", "JS nie ma wspólnego progu kompaktowego hero");
requireText(script, "homeLayout.portrait", "JS nie rozróżnia assetu kompaktowego i portretowego");
requireText(script, "viewportWidth * 1.35", "JS nie rozróżnia wysokiego portretu od krótkiego okna");
requireText(css, ":root[data-ok-tall-portrait]", "CSS nie korzysta ze wspólnego profilu wysokiego portretu");
requireText(css, "min-height: max(100svh, var(--ok-safe-required-height", "CSS nie honoruje wyliczonej wysokości hero");
requireText(script, "contentBottomWithin", "JS nie mierzy stabilnej wysokości treści względem sceny");
requireText(script, "element.getClientRects().length > 0", "JS traktuje dzieci ukrytych kontenerów jak widoczną treść");

if (/makeScrollRegion|dataset\.okSafeScroll\s*=/.test(script)) {
  failures.push("responsive safety nadal tworzy zagnieżdżone regiony przewijania");
}
if (/\[data-ok-safe-content\]\[data-ok-safe-scroll/.test(css)) {
  failures.push("responsive safety nadal styluje zagnieżdżone scrollery treści");
}
if (/:is\(\.campaign-frame, \.social-frame, \.process-frame\)[^{]*\{[^}]*(?:min-|max-)?height\s*:/s.test(css)) {
  failures.push("responsive safety nadal lokalnie nadpisuje globalną wysokość scen");
}

requireText(
  css,
  "scale: var(--ok-home-compact-art-scale, 1)",
  "CSS nie stosuje wyliczonej skali kompaktowego kadru hero",
);

if (/\bfont-size\s*:/.test(css)) {
  failures.push("responsive-safety.css nie może zmieniać rozmiarów fontów");
}
if (/ok-safe-(?:radius|center)/.test(`${css}\n${script}`)) {
  failures.push("responsive safety nie może używać dawnej eliptycznej maski kolizji");
}
for (const deadToken of [
  "okSafeStack",
  "--ok-safe-art-start",
  "data-ok-narrow-viewport",
  "data-ok-short-viewport",
  "data-ok-sequential-viewport",
  "okSafeCompactDensity",
  "data-ok-safe-compact-density",
]) {
  if (`${css}\n${script}`.includes(deadToken)) {
    failures.push(`responsive safety zawiera martwy mechanizm ${deadToken}`);
  }
}
if (/transform\s*:\s*scale\([^1]/.test(css)) {
  failures.push("responsive-safety.css nie może skalować treści w dół");
}

for (const token of [
  "html.ok-scene-page :is(",
  ".annotation-lines,",
  ".annotation-callout,",
  ".annotation,",
  ".tablet-annotations",
  "html.ok-scene-page .uses-annotation-summary .tablet-annotations",
]) {
  requireText(css, token, `mobile annotation cleanup: brak ${token}`);
}

if (failures.length) {
  console.error(`Błędy responsive safety (${failures.length}):`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`OK: ${pages.length} stron ładuje wspólny system ochrony treści bez ingerencji w rozmiary fontów.`);
}
