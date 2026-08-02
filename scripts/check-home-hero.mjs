import { readFile, stat } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFile(join(root, path), "utf8");
const require = createRequire(import.meta.url);
const { getHomeHeroLayout } = require("../assets/responsive-safety.js");
const [html, homeCss, foundationCss, enhancementsCss, motion, loader, energy] = await Promise.all([
  read("index.html"),
  read("assets/page-home.css"),
  read("assets/responsive-foundation.v20260730-8.css"),
  read("assets/site-enhancements.css"),
  read("assets/motion-control.js"),
  read("assets/tree-map-loader.js"),
  read("assets/tree-energy.js"),
]);

const failures = [];
const requireText = (source, text, message) => {
  if (!source.includes(text)) failures.push(message);
};

for (const width of [640, 960, 1280, 1672, 2560, 3344, 3840]) {
  requireText(html, `editorial-atelier-scene-v1-${width}.avif ${width}w`, `brak AVIF ${width}w w srcset`);
}
for (const file of [
  "assets/editorial-atelier-scene-v1-1672.avif",
  "assets/editorial-atelier-scene-v1-2560.avif",
  "assets/editorial-atelier-scene-v1-3344.avif",
  "assets/editorial-atelier-scene-v1-3840.avif",
]) {
  const info = await stat(join(root, file)).catch(() => null);
  if (!info?.isFile()) failures.push(`brak pliku ${file}`);
  else if (info.size > 300_000) failures.push(`${file} przekracza budżet 300 kB`);
}
for (const width of [960, 1672, 2560, 3840]) {
  for (const format of ["avif", "webp"]) {
    const file = `assets/editorial-atelier-backdrop-v2-${width}.${format}`;
    const info = await stat(join(root, file)).catch(() => null);
    if (!info?.isFile()) failures.push(`brak pliku ${file}`);
    else if (info.size > 100_000) failures.push(`${file} przekracza budżet 100 kB`);
  }
}
for (const width of [480, 768, 941]) {
  for (const format of ["avif", "webp"]) {
    const file = `assets/editorial-atelier-scene-mobile-v1-${width}.${format}`;
    const info = await stat(join(root, file)).catch(() => null);
    if (!info?.isFile()) failures.push(`brak pliku ${file}`);
    else if (info.size > 120_000) failures.push(`${file} przekracza budżet 120 kB`);
  }
}
for (const width of [768, 1024, 1440]) {
  for (const format of ["avif", "webp"]) {
    const file = `assets/editorial-atelier-scene-compact-v2-${width}.${format}`;
    const info = await stat(join(root, file)).catch(() => null);
    if (!info?.isFile()) failures.push(`brak pliku ${file}`);
    else if (info.size > 120_000) failures.push(`${file} przekracza budżet 120 kB`);
  }
}

requireText(html, 'media="(max-aspect-ratio: 2/3)"', "hero nie ma osobnego źródła dla pionowego mobile");
requireText(
  html,
  'media="(max-width: 1180px), (max-aspect-ratio: 4/3)"',
  "hero nie przełącza atomowo art direction przed utratą bezpiecznej geometrii",
);
requireText(html, "editorial-atelier-scene-mobile-v1-941.avif 941w", "mobilny srcset nie ma źródła 941 px AVIF");
requireText(html, "editorial-atelier-scene-mobile-v1-941.webp 941w", "mobilny srcset nie ma źródła 941 px WebP");
requireText(html, "editorial-atelier-scene-compact-v2-1440.avif 1440w", "kompaktowy srcset nie ma źródła 1440 px AVIF");
requireText(html, "editorial-atelier-scene-compact-v2-1440.webp 1440w", "kompaktowy srcset nie ma źródła 1440 px WebP");
requireText(html, 'imagesizes="(max-width: 640px) and (max-height: 720px) 216vw', "preload nie rozróżnia krótkiego mobile");
requireText(html, "(min-aspect-ratio: 2/3) and (max-aspect-ratio: 4/5) 145vw", "sizes nie opisuje wysokiego desktopu 2:3–4:5");
requireText(html, "178vh", "sizes nie opisuje wysokościowego desktopu");
requireText(html, 'width="1672"', "obraz hero nie ma bazowej szerokości 1672");
requireText(html, 'height="941"', "obraz hero nie ma bazowej wysokości 941");
requireText(html, 'class="hero-backdrop"', "hero nie ma pełnoekranowej płyty tła");
requireText(html, "editorial-atelier-backdrop-v2-3840.avif 3840w", "tło hero nie ma wariantu 3840 AVIF");
requireText(loader, "/assets/tree-energy.js?v=20260801-2", "loader nie unieważnia cache poprawionej animacji");
requireText(energy, "Number.isFinite(flash.duration)", "animacja nie chroni gradientu przed wartością NaN");
requireText(homeCss, ".hero-backdrop img", "płyta tła hero nie ma pełnoekranowego układu");
requireText(
  foundationCss,
  "font-size: clamp(68px, min(10.5vw, 12.5svh), 120px);",
  "tryb stacked nie ma płynnej skali H1 68–120 px zależnej od szerokości i wysokości",
);
if (foundationCss.includes("data-ok-safe-compact-density")) {
  failures.push("hero nie może zachowywać lepkiego stanu zmniejszonej typografii");
}
requireText(
  foundationCss,
  "@media (min-width: 1181px) and (max-aspect-ratio: 4 / 3)",
  "wysoki desktop nie ma dedykowanej skali typografii hero",
);
requireText(
  foundationCss,
  "font-size: clamp(7.5rem, min(12.5vw, 12.5svh), 11.25rem);",
  "nagłówek hero na wysokim desktopie nie zachowuje skali desktopowej",
);
requireText(html, "responsive-foundation.v20260730-8.css", "strona główna nie ładuje wersjonowanej warstwy kaskady");
const desktopHomeType = foundationCss.indexOf("font-size: var(--ok-home-display);");
const stackedHomeType = foundationCss.lastIndexOf("font-size: clamp(68px, min(10.5vw, 12.5svh), 120px);");
if (desktopHomeType < 0 || stackedHomeType <= desktopHomeType) {
  failures.push("stan stacked musi występować po desktopowym --ok-home-display w kaskadzie");
}
if (homeCss.includes("font-size: clamp(68px, min(10.5vw, 12.5svh), 120px);")) {
  failures.push("page-home.css nie może duplikować typografii należącej do responsive-foundation.css");
}
const responsiveOwnerViolations = [
  ["h1", "font-size"],
  [".copy", "top"],
  [".copy", "left"],
  [".copy", "width"],
  [".scene-label", "font-size"],
  [".descriptor", "font-size"],
  [".cta", "font-size"],
  [".cta", "margin-top"],
];
for (const [selector, property] of responsiveOwnerViolations) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedProperty = property.replace("-", "\\-");
  const declaration = new RegExp(
    `(?:^|\\})\\s*${escapedSelector}\\s*\\{[^}]*\\b${escapedProperty}\\s*:`,
    "m",
  );
  if (declaration.test(homeCss)) {
    failures.push(`page-home.css nie może definiować ${selector} / ${property}; właścicielem jest responsive foundation`);
  }
}
if (foundationCss.includes("@media (min-width: 1025px) and (max-aspect-ratio: 2 / 3)")) {
  failures.push("responsive foundation zawiera martwy profil 2:3 nadpisywany przez końcowy stan stacked");
}

const resizeFixture = viewportHeight => getHomeHeroLayout({
  viewportWidth: 1024,
  viewportHeight,
  sceneTop: 0,
  contentBottom: 295,
  gap: 24,
});
const shortBeforeResize = resizeFixture(500);
const tallAfterResize = resizeFixture(768);
const shortAfterResize = resizeFixture(500);

if (!shortBeforeResize.copyFitsFirstView) {
  failures.push("niski viewport 1024x500 nie powinien tworzyć pustej rezerwy pod treścią");
}
if (!tallAfterResize.copyFitsFirstView) {
  failures.push("viewport 1024x768 powinien wrócić do układu mieszczącego się w pierwszym widoku");
}
if (JSON.stringify(shortBeforeResize) !== JSON.stringify(shortAfterResize)) {
  failures.push("wynik hero zależy od historii resize zamiast od aktualnego viewportu");
}
if (shortBeforeResize.copySafeZone !== 1 || tallAfterResize.copySafeZone !== .6) {
  failures.push("krótki landscape powinien wykorzystać pełną wysokość, a wysoki compact zachować strefę grafiki");
}
if (shortBeforeResize.requiredHeight !== 500) {
  failures.push(`niski viewport 1024x500 ma sztuczną wysokość ${shortBeforeResize.requiredHeight}px`);
}

requireText(homeCss, "@media (min-width: 1025px) and (min-aspect-ratio: 1672 / 941)", "brak reguły szerokiego desktopu");
requireText(homeCss, "height: 100svh;", "szeroki desktop nie jest skalowany wysokością");
requireText(homeCss, "@media (min-width: 641px) and (max-aspect-ratio: 2 / 3)", "brak art direction 9:16");

requireText(motion, 'root.classList.add("motion-intro-enabled")', "brak jednorazowego stanu intro");
requireText(homeCss, 'html[data-motion="paused"] .copy > *', "pauza nie wymusza widocznej treści hero");
requireText(homeCss, "animation: none !important;", "pauza nie kończy animacji wejścia");
if (enhancementsCss.includes("animation-play-state: paused !important")) {
  failures.push("globalna pauza nadal zamraża animację w bieżącej klatce");
}

requireText(loader, "pendingIntent", "loader nie pamięta intencji użytkownika");
requireText(loader, 'return "mobile-lite"', "loader nie uruchamia lekkiego profilu animacji na telefonie");
requireText(loader, "heroEffectsProfile", "loader nie publikuje centralnego profilu efektów hero");
requireText(loader, 'connection?.addEventListener?.("change", syncEligibility)', "loader nie reaguje na zmianę save-data");
requireText(loader, "scheduleAmbientStart", "loader nie ma lekkiego startu po load/idle");
requireText(loader, "cancelAmbientStart", "loader nie anuluje oczekującego startu po zmianie preferencji");
requireText(loader, "cancelIdleCallback", "loader nie anuluje requestIdleCallback");
requireText(loader, "loadGeneration", "loader nie unieważnia trwającego ładowania po zatrzymaniu efektów");
requireText(loader, "scriptPromises", "loader skryptów nie jest idempotentny");
if (/addEventListener\("(?:pointerenter|focus)"[\s\S]{0,120}\{\s*once:\s*true/.test(loader)) {
  failures.push("loader nadal zużywa pointerenter/focus jednorazowo");
}
requireText(energy, "pixelBudgetDpr", "canvas nie ma adaptacyjnego budżetu pikseli");
requireText(energy, 'dataset.heroEffectsProfile === "disabled"', "renderer nie respektuje centralnej polityki efektów");
if (energy.includes("window.scrollTo(")) {
  failures.push("animacja hero nie może wymuszać pozycji scrolla");
}

requireText(energy, "responsiveArtMaps", "canvas impulsow nie ma map responsywnych kompozycji");
requireText(energy, 'sourceMatch: "editorial-atelier-scene-compact-v2"', "canvas impulsow nie obsluguje kompozycji 4:3");
requireText(energy, 'sourceMatch: "editorial-atelier-scene-mobile-v1"', "canvas impulsow nie obsluguje kompozycji portretowej");
requireText(energy, "syncArtTransform();", "canvas impulsow nie synchronizuje transformacji po resize");
requireText(energy, 'sculpture.addEventListener("load", resizeCanvas)', "canvas impulsow nie reaguje na podmiane obrazu");
const responsiveSafetyCss = await read("assets/responsive-safety.css");
requireText(
  responsiveSafetyCss,
  '[data-ok-safe-compact-fit="first-view"]',
  "mobilne hero nie ma stabilnego kontraktu pierwszego viewportu",
);
if (
  /data-ok-safe-mobile-hero[^}]*light-canvas[^}]*display:\s*none/s.test(
    responsiveSafetyCss,
  )
) {
  failures.push("responsywna warstwa bezpieczenstwa nie moze ukrywac impulsow drzewa");
}

if (failures.length) {
  console.error(`Błędy hero (${failures.length}):`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log("OK: hero ma responsywne źródła do 3840 px, bezstanowy resize, art direction, bezpieczną pauzę i odporny loader sygnałów.");
}
