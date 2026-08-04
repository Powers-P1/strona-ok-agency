import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { versionedAsset } from "./asset-versions.mjs";

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
const designTokens = await read("assets/design-tokens.css");
const homeCss = await read("assets/page-home.css");
const socialCss = await read("assets/services/social/styles.css");
const faqCss = await read("assets/page-faq.css");

const failures = [];
const requireText = (source, text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireText(
  homeCss,
  "@media (min-width: 1025px) and (min-aspect-ratio: 1672 / 941)",
  "Home hero must feather image-rig from the source artwork aspect ratio",
);

pages.forEach((page, index) => {
  const html = htmlFiles[index];
  requireText(html, `/${versionedAsset("assets/responsive-safety.css")}`, `${page}: brak responsive-safety.css`);
  requireText(html, `/${versionedAsset("assets/responsive-safety.js")}`, `${page}: brak responsive-safety.js`);
});

requireText(
  script,
  "new ResizeObserver(schedule)",
  "ResizeObserver must schedule a stable measure without clearing scene height",
);
if (/new ResizeObserver\(scheduleViewportMeasure\)/.test(script)) {
  failures.push("ResizeObserver creates a shrink/grow loop by clearing observed scene height");
}

for (const token of [
  "ResizeObserver",
  "MutationObserver",
  "visualViewport",
  "visualContentGeometry",
  "stableContentRect",
  "document.fonts?.ready.then(() => requestAnimationFrame(schedule))",
  "data-ok-tall-portrait",
  "okSafeCurtain",
  "okSafeMobileHero",
  "okSafeCompactFit",
  "getHomeHeroLayout",
  "shortLandscape",
  "data-ok-safe-cards",
  "data-ok-safe-menu-overflow",
  'document.fonts.status !== "loaded"',
  "OKAgencyResponsiveSafety",
  "getArtBounds",
  "scene-css-px",
  "okagency:art-safety-change",
  "artBoundsChanged",
  "deepFreeze",
  "Object.isFrozen",
  "fullVisible",
  "protected",
  "feather",
  "typeRoles",
  "publishViewportTypeScale",
  "--ok-viewport-height-runtime",
  "--ok-type-${role}-runtime",
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
requireText(
  css,
  '[data-ok-safe-scene][data-ok-safe-protection-ready]',
  "CSS usuwa awaryjny kontrast zanim tonalne tło i mapa kolizji są gotowe",
);
requireText(css, ".home-page .hero", "CSS nie ma reflow hero");
requireText(css, "mask-image: var(--ok-safe-mask-image)", "CSS nie korzysta z dynamicznego featheru");
requireText(
  css,
  "@media (max-width: 1180px), (max-aspect-ratio: 4 / 3)",
  "CSS nie przełącza atomowo kompozycji 4:3 i mobile",
);
requireText(css, ".home-page .hero .hero-backdrop", "compact hero nadal zależy od runtime przy ukrywaniu backing plate");
requireText(css, "will-change: auto", "compact hero nadal wymusza stałe kafle GPU");
requireText(css, "filter: none", "compact raster hero nadal tworzy osobną filtrowaną warstwę GPU");
requireText(css, "@media (max-aspect-ratio: 2 / 3)", "CSS nie ma osobnego kadru portretowego");
requireText(css, "object-position: 56% bottom", "portretowe drzewko nie jest zakotwiczone do dołu kadru");
requireText(css, "top: calc(100% - 36.43vw)", "animacja podstawy nie podąża za dolnym kadrowaniem");
requireText(storyCss, ".about-page .scene", "wspólny model scen nie obejmuje O nas");
requireText(
  sceneViewport,
  "--ok-scene-viewport-height: var(--ok-viewport-height, 100svh)",
  "wspólny model scen nie korzysta z centralnej wysokości layout viewportu",
);
requireText(sceneViewport, "html.ok-scene-page .ok-nav-slot", "wspólny model nie usuwa slotu nawigacji z geometrii scen");
requireText(sceneViewport, "max-height: var(--ok-scene-viewport-height) !important", "wspólny model pozwala scenom wyjść poza kadr");
requireText(sceneViewport, ".diagnosis-story .story-stage", "wspólny model wysokości nie obejmuje Diagnozy");
requireText(storyCss, "filter: none !important", "wspólny model nadal może rozmywać sceny O nas");
requireText(css, '[data-ok-safe-cards="stacked"]', "CSS nie ma bezpiecznego układu kart");
requireText(css, "@media (max-height: 720px)", "CSS nie ma obsługi niskiego okna");
requireText(css, '[data-ok-safe-compact-fit="first-view"]', "mobile hero nie ma stabilnej wysokości 100svh");
requireText(css, ".social-frame, .process-frame) > .scroll-cue", "mobile nadal pokazuje zasłaniające podpowiedzi przewijania");
requireText(socialCss, ".proof-item.is-open .proof-detail", "Social nie ma mobilnego kontraktu rozwiniętych sygnałów");
requireText(socialCss, "max-height: none", "rozwinięty sygnał nadal może być przycięty stałą wysokością");
requireText(faqCss, "grid-template-columns: minmax(0, 1fr)", "FAQ nie zeruje minimalnej szerokości mobilnej kolumny");
requireText(faqCss, "overflow-wrap: anywhere", "CTA FAQ nie chroni długiej etykiety przed przycięciem");

requireText(script, "document.createRange()", "JS nie mierzy faktycznie renderowanych rectów tekstu");
requireText(script, 'layout.scene.dataset.okSafeMask || "auto"', "JS nie ma deklaratywnego trybu maski sceny");
requireText(script, 'artMaskMode === "always"', "JS nie obsługuje wymuszonej ochrony scen wskazanych przez projekt");
requireText(script, 'artMaskMode === "never"', "JS nie obsługuje jawnego wyłączenia maski");
requireText(script, "--ok-safe-mask-image", "JS nie generuje płynnej maski grafiki");
requireText(script, 'shape: "directional-feather"', "JS nie publikuje ciągłego featheru PR49");
requireText(script, "const compact = viewportWidth <= 1180", "JS nie ogranicza automatycznej maski do ciasnych kompozycji");
requireText(script, "pendingSceneAnchor", "JS nie zachowuje aktywnej sceny podczas resize");
requireText(script, "restoreSceneAnchor", "JS nie odtwarza względnego offsetu aktywnej sceny");
requireText(script, "copySafeZone", "JS nie utrzymuje jednego źródła progu bezpiecznej strefy hero");
requireText(script, "homeLayout.copyFitsFirstView", "JS nie utrzymuje kompaktowego hero w pierwszym widoku");
requireText(script, 'Math.ceil(viewportHeight)', "JS nie kotwiczy kompaktowego hero do jednego viewportu");
requireText(script, '"accessible-overflow"', "JS nie zachowuje dostępnego reflow po powiększeniu tekstu");
requireText(script, "viewportWidth <= 1180 || viewportRatio <= 4 / 3", "JS nie ma wspólnego progu kompaktowego hero");
if (/visualViewport\?\.width|visualViewport\?\.height/.test(script)) {
  failures.push("klasyfikacja scen używa opóźnionego visualViewport zamiast layout viewportu media queries");
}
requireText(
  script,
  'layout.scene.style.removeProperty("--ok-safe-required-height")',
  "pomiar scen grow zależy od wysokości opublikowanej dla poprzedniego viewportu",
);
requireText(
  script,
  'window.addEventListener("resize", scheduleViewportMeasure',
  "resize nie zeruje synchronicznie wysokości opublikowanej przez poprzedni viewport",
);
requireText(script, "needsRemeasure", "zdarzenie resize zgłoszone w trakcie pomiaru jest bezpowrotnie gubione");
requireText(
  script,
  'matchMedia("(max-width: 1180px), (max-aspect-ratio: 4/3)")',
  "JS nie reaguje na atomowe przełączenie art direction przez media query",
);
requireText(script, "homeLayout.portrait", "JS nie rozróżnia assetu kompaktowego i portretowego");
requireText(script, "viewportWidth * 1.35", "JS nie rozróżnia wysokiego portretu od krótkiego okna");
requireText(css, ":root[data-ok-tall-portrait]", "CSS nie korzysta ze wspólnego profilu wysokiego portretu");
requireText(css, "var(--ok-viewport-height, 100svh)", "CSS nie korzysta z centralnej wysokości layout viewportu");
requireText(
  await read("assets/responsive-foundation.v20260730-8.css"),
  "@media (min-width: 1025px) and (min-height: 781px)",
  "wspólna skala Diagnozy nadpisuje kompaktową kompozycję krótkiego desktopu",
);
requireText(
  designTokens,
  "--ok-viewport-height: 100svh;",
  "centralna wysokość scen nie jest zakotwiczona bezpośrednio do small viewportu",
);
requireText(
  script,
  'root.style.setProperty("--ok-viewport-height-runtime", `${viewportHeight}px`)',
  "JS nie publikuje oddzielnego pomiaru runtime podczas resize",
);
if (script.includes('root.style.setProperty("--ok-viewport-height",')) {
  failures.push("JS nie może nadpisywać kontraktu scen 100svh wartością window.innerHeight");
}
if (designTokens.includes("--ok-viewport-height: var(--ok-viewport-height-runtime")) {
  failures.push("publiczny kontrakt scen nie może aliasować pomiaru runtime");
}
requireText(
  script,
  'root.style.setProperty(`--ok-type-${role}`, resolvedValue)',
  "JS nie publikuje końcowych tokenów semantycznych odpornych na cache WebKit",
);
requireText(script, "contentBottomWithin", "JS nie mierzy stabilnej wysokości treści względem sceny");
requireText(script, "element.getClientRects().length > 0", "JS traktuje dzieci ukrytych kontenerów jak widoczną treść");

requireText(
  htmlFiles[pages.indexOf("kampanie.html")],
  'data-ok-safe-backdrop="light"',
  "Kampanie nie deklarują tonalnej płyty sceny",
);
requireText(
  htmlFiles[pages.indexOf("proces.html")],
  'data-ok-safe-backdrop="dark"',
  "Proces nie deklaruje ciemnej tonalnej płyty sceny",
);

requireText(script, "placementMapReady", "JS nie czeka na mapę kolizji przed usunięciem awaryjnego kontrastu");
requireText(
  script,
  'toggleAttribute("data-ok-safe-protection-ready", protectionReady)',
  "JS nie publikuje gotowości tonalnej ochrony dla bezpiecznego fallbacku",
);
requireText(script, "const artBounds = new WeakMap()", "JS does not index scene/art safety bounds in a WeakMap");
requireText(script, "getArtBounds: sceneOrArt => artBounds.get(sceneOrArt) || null", "public responsive safety API does not expose getArtBounds(sceneOrArt)");
requireText(script, "artBounds.set(layout.scene, record)", "JS does not publish safety bounds under the scene key");
requireText(script, "artBounds.set(layout.art, record)", "JS does not publish safety bounds under the artwork key");
requireText(script, 'coordinateSpace: "scene-css-px"', "JS does not declare scene-relative CSS pixel coordinates");
requireText(script, "masked: Boolean(mask)", "JS does not distinguish masked and unmasked artwork");
requireText(script, "maskShape: mask?.shape", "JS does not publish the directional mask shape");
requireText(script, "revealSide: mask?.revealSide ?? null", "JS does not publish the visible artwork side");
requireText(script, "protected: protectedArea", "JS does not preserve the shared artwork bounds contract");
requireText(script, "if (artBoundsChanged)", "JS does not consolidate bounds events per measurement cycle");
requireText(script, 'new CustomEvent("okagency:art-safety-change"', "JS does not emit the artwork safety change event");
requireText(script, "detail: { version: 2 }", "artwork safety event does not expose contract version 2");
requireText(script, "Object.values(value).forEach(deepFreeze)", "artwork bounds are not frozen recursively");
requireText(script, "const record = deepFreeze({", "public artwork bounds record is not deep-frozen");

for (const maskToken of [
  "buildPlacementMap",
  "placementIntersects",
  "buildDirectionalFeather",
  'shape: "directional-feather"',
  "linear-gradient(to right",
  "hasArtworkCollision",
  'layout.art.dataset.okSafeReveal = directionalFeather.revealSide',
  'layout.art.dataset.okSafeShape = directionalFeather.shape',
  'layout.art.style.setProperty("--ok-safe-mask-image", directionalFeather.image);',
]) {
  requireText(script, maskToken, `responsive-safety.js: PR49 feather contract changed: ${maskToken}`);
}

if (/buildTonalTextFlowMask|destination-out|local-hole|svgMask|encodeURIComponent\(svgMask\)/.test(script)) {
  failures.push("responsive safety przywróciła lokalne otwory zamiast jednego featheru PR49");
}

if (/makeScrollRegion|dataset\.okSafeScroll\s*=/.test(script)) {
  failures.push("responsive safety nadal tworzy zagnieżdżone regiony przewijania");
}
if (/\[data-ok-safe-content\]\[data-ok-safe-scroll/.test(css)) {
  failures.push("responsive safety nadal styluje zagnieżdżone scrollery treści");
}
if (/:is\(\.campaign-frame, \.social-frame, \.process-frame\)[^{]*\{[^}]*(?:min-|max-)?height\s*:/s.test(css)) {
  failures.push("responsive safety nadal lokalnie nadpisuje globalną wysokość scen");
}

requireText(css, "scale: none", "CSS nie utrzymuje kompaktowej płyty hero w naturalnej skali");
if (/ok-home-compact-art-scale|\bartScale\b/.test(`${css}\n${script}`)) {
  failures.push("responsive safety zawiera historyczne skalowanie całej płyty hero");
}
if (/data-ok-safe-mobile-hero[^}]*!important/s.test(css)) {
  failures.push("kompaktowy profil hero nie może opierać się na !important");
}

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
]) {
  requireText(css, token, `mobile annotation cleanup: brak ${token}`);
}

if (!/html\.ok-scene-page\s+:is\([\s\S]*?\.annotation-lines,\s*[\s\S]*?\.annotation-callout,\s*[\s\S]*?\.annotation\s*\)\s*\{[\s\S]*?display:\s*none/.test(css)) {
  failures.push("mobile annotation cleanup: wspólny selektor nie ukrywa pełnej warstwy anotacji");
}

if (/tablet-annotations|uses-annotation-summary|Punkty na ilustracji/.test(css)) {
  failures.push("responsive safety nie może przywracać usuniętego podsumowania ilustracji");
}

if (failures.length) {
  console.error(`Błędy responsive safety (${failures.length}):`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`OK: ${pages.length} stron ładuje wspólny system ochrony treści bez ingerencji w rozmiary fontów.`);
}
