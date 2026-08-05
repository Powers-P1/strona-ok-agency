import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { versionedAsset } from "./asset-versions.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const annotationPages = new Map([
  ["strony-internetowe.html", 8],
  ["kampanie.html", 8],
  ["social-media.html", 8],
  ["proces.html", 10],
  ["diagnoza.html", 7],
  ["o-nas.html", 12],
]);
const approvedFontFamilies = new Set(["Archivo", "Barlow Condensed"]);
const genericFontFamilies = new Set([
  "cursive",
  "emoji",
  "fangsong",
  "fantasy",
  "inherit",
  "initial",
  "math",
  "monospace",
  "revert",
  "revert-layer",
  "sans-serif",
  "serif",
  "system-ui",
  "ui-monospace",
  "ui-rounded",
  "ui-sans-serif",
  "ui-serif",
  "unset",
]);

const checks = [];
const addCheck = (name, failures) => checks.push({ name, failures });
const read = path => readFile(join(root, path), "utf8");
const exists = async path => (await stat(join(root, path)).catch(() => null))?.isFile() === true;
const toPosix = path => path.split(sep).join("/");
const lineAt = (source, index) => source.slice(0, index).split(/\r?\n/).length;
const location = (path, source, index) => `${toPosix(path)}:${lineAt(source, index)}`;
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const attribute = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${escapeRegExp(name)}(?:\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+)))?`, "i"));
  if (!match) return null;
  return match[1] ?? match[2] ?? match[3] ?? "";
};
const classList = tag => (attribute(tag, "class") || "").split(/\s+/).filter(Boolean);
const hasClass = (tag, className) => classList(tag).includes(className);
const normalizeAsset = href => href
  .replace(/[?#].*$/, "")
  .replace(/^https?:\/\/[^/]+/i, "")
  .replace(/^\.?\//, "")
  .replaceAll("\\", "/");
const stylesheetRefs = source => [...source.matchAll(/<link\b[^>]*>/gi)]
  .map(match => match[0])
  .filter(tag => /(?:^|\s)stylesheet(?:\s|$)/i.test(attribute(tag, "rel") || ""))
  .map(tag => normalizeAsset(attribute(tag, "href") || ""));
const scriptRefs = source => [...source.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)]
  .map(match => ({ raw: match[1], normalized: normalizeAsset(match[1]) }));
const stripComments = source => source.replace(/\/\*[\s\S]*?\*\//g, match => match.replace(/[^\r\n]/g, " "));
const cssRules = source => [...stripComments(source).matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .map(match => ({ selector: match[1].trim(), declarations: match[2], index: match.index }));
const cssProperties = declarations => [...declarations.matchAll(/([\w-]+)\s*:\s*([^;}]+)/g)]
  .map(match => ({ name: match[1].toLowerCase(), value: match[2].trim(), index: match.index }));
const compactText = source => source
  .replace(/<[^>]+>/g, " ")
  .replaceAll("&nbsp;", " ")
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replace(/\s+/g, " ")
  .trim();

const walkFiles = async (directory, extension) => {
  const entries = await readdir(join(root, directory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(path, extension));
    if (entry.isFile() && entry.name.endsWith(extension)) files.push(toPosix(path));
  }
  return files.sort();
};

const htmlPaths = (await readdir(root))
  .filter(name => name.endsWith(".html"))
  .sort();
const htmlSources = new Map(await Promise.all(htmlPaths.map(async path => [path, await read(path)])));
const cssPaths = await walkFiles("assets", ".css");
const cssSources = new Map(await Promise.all(cssPaths.map(async path => [path, await read(path)])));

// Shared assets must exist, expose the target contract, and be loaded once.
{
  const failures = [];
  const tokensPath = "assets/design-tokens.css";
  const annotationsPath = "assets/annotation-system.css";
  const tokensExist = await exists(tokensPath);
  const annotationsExist = await exists(annotationsPath);

  if (!tokensExist) failures.push(`${tokensPath}: brak centralnego pliku tokenów`);
  if (!annotationsExist) failures.push(`${annotationsPath}: brak centralnego systemu anotacji`);

  if (tokensExist) {
    const source = await read(tokensPath);
    const requiredPatterns = [
      [/:root\s*\{/, "bloku :root"],
      [/--[\w-]*(?:font|type)[\w-]*(?:body|content)[\w-]*\s*:/i, "tokenu kroju body/content"],
      [/--[\w-]*(?:font|type)[\w-]*display[\w-]*\s*:/i, "tokenu kroju display"],
      [/--[\w-]*(?:safe|scene)[\w-]*inset[\w-]*\s*:/i, "tokenu safe inset"],
      [/--[\w-]*(?:annotation|callout|hotspot)[\w-]*\s*:/i, "parametrów hotspotu"],
      [/\b14px\b/, "minimalnego rozmiaru treści 14px"],
      [/\b12px\b/, "minimalnego rozmiaru label 12px"],
      [/Barlow Condensed/, "roli Barlow Condensed"],
      [/Archivo/, "roli Archivo"],
    ];
    for (const [pattern, label] of requiredPatterns) {
      if (!pattern.test(source)) failures.push(`${tokensPath}: brak ${label}`);
    }
  }

  if (annotationsExist) {
    const source = await read(annotationsPath);
    const requiredPatterns = [
      [/\.annotation-dot\b/, ".annotation-dot"],
      [/\.annotation-copy\b/, ".annotation-copy"],
      [/\.annotation-wire\b/, ".annotation-wire"],
      [/\.is-open\b/, "stanu .is-open"],
      [/var\(--ok-annotation-core-size\b/, "tokenu rozmiaru rdzenia"],
      [/var\(--ok-annotation-ring-size\b/, "tokenu rozmiaru pierścienia"],
      [/html\[data-motion=["']paused["']\]/, "statycznego stanu paused"],
      [/@media\s*\([^)]*prefers-reduced-motion\s*:\s*reduce/i, "obsługi prefers-reduced-motion"],
    ];
    for (const [pattern, label] of requiredPatterns) {
      if (!pattern.test(source)) failures.push(`${annotationsPath}: brak ${label}`);
    }
    if (/\.is-obscured\b|\.annotations-unavailable\b/.test(source)) {
      failures.push(`${annotationsPath}: komponent nie może zawierać stanów ukrywających punkty`);
    }
  }

  for (const [path, source] of htmlSources) {
    const refs = stylesheetRefs(source);
    const tokenCount = refs.filter(ref => ref === tokensPath).length;
    if (tokenCount !== 1) failures.push(`${path}: design-tokens.css występuje ${tokenCount} razy zamiast raz`);
  }

  for (const path of annotationPages.keys()) {
    const refs = stylesheetRefs(htmlSources.get(path));
    const tokenIndex = refs.indexOf(tokensPath);
    const annotationIndexes = refs
      .map((ref, index) => ref === annotationsPath ? index : -1)
      .filter(index => index >= 0);
    if (annotationIndexes.length !== 1) {
      failures.push(`${path}: annotation-system.css występuje ${annotationIndexes.length} razy zamiast raz`);
    } else if (tokenIndex >= 0 && annotationIndexes[0] < tokenIndex) {
      failures.push(`${path}: annotation-system.css musi być za design-tokens.css`);
    }
  }
  addCheck("centralne tokeny i system anotacji", failures);
}

// Content-led routes share one editorial/form system. The audit route may
// compose report-specific grids, but must not grow its own palette, font stack
// or replacement controls.
{
  const failures = [];
  const systemPath = "assets/content-system.css";
  const routePath = "assets/services/site-audit/styles.css";
  const routeSource = cssSources.get(routePath) || "";

  if (!await exists(systemPath)) failures.push(`${systemPath}: brak centralnych prymitywów treści i formularza`);
  for (const htmlPath of ["kontakt.html", "diagnoza-www.html"]) {
    const refs = stylesheetRefs(htmlSources.get(htmlPath) || "");
    const count = refs.filter(ref => ref === systemPath).length;
    if (count !== 1) failures.push(`${htmlPath}: ${systemPath} występuje ${count} razy zamiast raz`);
  }

  for (const [pattern, label] of [
    [/--audit-[\w-]+\s*:/i, "lokalnej palety/tokenów --audit-*"],
    [/\b(?:Arial|Georgia)\b/i, "zapasowego kroju spoza systemu"],
  ]) {
    const match = routeSource.match(pattern);
    if (match) failures.push(`${location(routePath, routeSource, match.index)}: wykryto ${label}`);
  }

  for (const rule of cssRules(routeSource)) {
    for (const property of cssProperties(rule.declarations).filter(item => item.name === "font-family")) {
      if (!/^var\(--ok-font-(?:body|display)\)$/.test(property.value)) {
        failures.push(`${location(routePath, routeSource, rule.index)}: wykryto lokalną rodzinę fontu „${property.value}”`);
      }
    }
  }

  const sharedAppearance = /(?:^|,)\s*\.(?:kicker|page-title|section-title|lead|field|consent|submit|secondary-action|form-status)(?=\s|[,:>{+~]|$)/;
  const appearanceProperties = /^(?:background(?:-[\w-]+)?|border(?:-[\w-]+)?|box-shadow|color|font(?:-[\w-]+)?|letter-spacing|line-height|text-decoration(?:-[\w-]+)?)$/;
  for (const path of ["assets/page-contact.css", routePath]) {
    const source = cssSources.get(path) || "";
    for (const rule of cssRules(source)) {
      if (!sharedAppearance.test(rule.selector)) continue;
      const properties = cssProperties(rule.declarations).filter(property => appearanceProperties.test(property.name));
      if (properties.length) {
        failures.push(`${location(path, source, rule.index)}: ${rule.selector.replace(/\s+/g, " ")} nadpisuje wygląd wspólnego komponentu (${[...new Set(properties.map(property => property.name))].join(", ")})`);
      }
    }
  }
  addCheck("wspólny system treści i formularzy bez lokalnego mini-design-systemu", failures);
}

// Every annotation route loads one stable, cache-versioned geometry module.
{
  const failures = [];
  const stablePath = "assets/art-coordinate-system.js";
  const expectedReference = versionedAsset(stablePath);

  if (!await exists(stablePath)) failures.push(`${stablePath}: brak stabilnego modułu geometrii`);
  for (const path of annotationPages.keys()) {
    const refs = scriptRefs(htmlSources.get(path));
    const geometryRefs = refs.filter(({ normalized }) => normalized.startsWith("assets/art-coordinate-system"));
    if (geometryRefs.length !== 1) {
      failures.push(`${path}: moduł geometrii występuje ${geometryRefs.length} razy zamiast raz`);
      continue;
    }
    if (geometryRefs[0].raw !== expectedReference) {
      failures.push(`${path}: moduł geometrii ma referencję „${geometryRefs[0].raw}” zamiast „${expectedReference}”`);
    }
  }
  addCheck("stabilny, wersjonowany moduł geometrii anotacji", failures);
}

// One deterministic solver owns placement-map anchors, independent hidden state and copy safety.
{
  const failures = [];
  const path = "assets/art-coordinate-system.js";
  const source = await read(path);
  for (const [pattern, label] of [
    [/getArtBounds/, "publicznego kontraktu bezpiecznego obszaru"],
    [/okagency:art-safety-change/, "reakcji na zmianę maski"],
    [/okagency:annotationchange/, "reakcji na zmianę anotacji"],
    [/naturalPlacementCandidates/, "deterministycznego wyboru kandydatów placement map"],
    [/fixedAnchorLayouts/, "cache stałych kotwic niezależnego od interakcji"],
    [/placementTierOrder/, "hierarchii energy → highlight → structure"],
    [/lastAnchors/, "preferowania poprzedniej poprawnej kotwicy"],
    [/contains\(artBounds\.interactiveVisible, ring\)/, "twardego odrzucenia poza widocznym artworkiem i feather"],
    [/obstacles\.content\.some\(obstacle => intersects\(ring, obstacle\)\)/, "twardego odrzucenia kolizji punktu z treścią"],
    [/visibleCopies\.some\(sibling => intersects\(copyRect, sibling\)\)/, "odrzucenia kolizji otwartych dymków"],
    [/setAnnotationPlacementState/, "atomowego stanu placement/hidden pojedynczej anotacji"],
    [/const preservedCopies = exitingAnnotations\(\)/, "migawki zamykanych dymków"],
    [/preservedAttributeElements\.add\(path\)/, "ochrony linii zamykanego dymka"],
    [/retainedAttributes\.set\(element, attributes\)/, "zachowania runtime SVG podczas wyjścia dymka"],
    [/applyServiceSolution\(adapter, solution, preservedCopies\)/, "ochrony wyjścia dymka w scenach usług"],
    [/applyAboutSolution\(adapter, solution, preservedCopies\)/, "ochrony wyjścia dymka na O nas"],
    [/innerWidth <= 640/, "zachowania centralnego kontraktu mobile"],
    [/annotation-debug-overlay/, "debug overlay dla audytu kotwic"],
  ]) {
    if (!pattern.test(source)) failures.push(`${path}: brak ${label}`);
  }
  if (/\b(?:collision)?score\s*[:=(]/i.test(source)) {
    failures.push(`${path}: solver nie może akceptować kolizji przez score`);
  }
  if (/setProperty\(\s*["']display["'][\s\S]{0,80}["']important["']/i.test(source)) {
    failures.push(`${path}: solver nie może lokalnie ukrywać UI przez !important`);
  }
  if (/energy-shimmer|path\.glint|getTotalLength/.test(source)) {
    failures.push(`${path}: solver nie może zależeć od opcjonalnej animacji energy-shimmer`);
  }
  if (/tablet-annotations|uses-annotation-summary|Punkty na ilustracji/.test(source)) {
    failures.push(`${path}: usunięte podsumowanie ilustracji nie może wrócić`);
  }
  if (/applyAuthoredCopySafety|applyMeasuredConnectorGeometry|AUTHORED FALLBACK/.test(source)) {
    failures.push(`${path}: usunięty authored/measured fallback nie może wrócić`);
  }
  if (/annotations-unavailable|hideAnnotations|is-obscured/.test(source)) {
    failures.push(`${path}: solver nie może wrócić do grupowego ukrywania sceny`);
  }
  addCheck("deterministyczny solver geometrii i niezależny stan hidden", failures);
}

// Source anchors and rendered points follow energy → highlight → object hierarchy.
{
  const failures = [];
  const energyPath = "scripts/check-annotation-energy.mjs";
  const maskBuilderPath = "scripts/build-annotation-placement-masks.mjs";
  const geometryPath = "scripts/check-annotation-geometry.mjs";
  const packageSource = await read("package.json");
  if (!await exists(energyPath)) failures.push(`${energyPath}: brak audytu energii artworku`);
  if (!await exists(maskBuilderPath)) failures.push(`${maskBuilderPath}: brak generatora masek artworku`);
  if (!await exists(geometryPath)) failures.push(`${geometryPath}: brak audytu geometrii przeglądarkowej`);
  if (await exists(energyPath)) {
    const source = await read(energyPath);
    for (const [pattern, label] of [
      [/getImageData/, "rastrowej maski artworku"],
      [/nearestPlacement/, "deterministycznego wyszukania miejsca w artworku"],
      [/CENTER_TOLERANCE/, "jawnej tolerancji środka punktu"],
      [/centerPasses/, "twardej bramki zgodności kotwicy"],
    ]) {
      if (!pattern.test(source)) failures.push(`${energyPath}: brak ${label}`);
    }
  }
  if (await exists(geometryPath)) {
    const source = await read(geometryPath);
    if (/energy-shimmer|path\.glint/.test(source)) {
      failures.push(`${geometryPath}: geometria nie może traktować animacji jako źródła energii`);
    }
  }
  if (!/"check:annotation-energy"\s*:/.test(packageSource)) {
    failures.push("package.json: brak skryptu check:annotation-energy");
  }
  if (!/"build:annotation-masks"\s*:/.test(packageSource)) {
    failures.push("package.json: brak skryptu build:annotation-masks");
  }
  addCheck("hierarchia punktów: energia, światło, obiekt — nigdy tło", failures);
}

// One interaction owner exposes state changes and a small public API for the solver.
{
  const failures = [];
  const path = "assets/service-interactions.js";
  const source = await read(path);
  for (const [pattern, label] of [
    [/window\.OKAgencyAnnotations\s*=\s*Object\.freeze/, "zamrożonego API OKAgencyAnnotations"],
    [/okagency:annotationchange/, "zdarzenia okagency:annotationchange"],
    [/detail:\s*\{\s*callout,\s*open\s*\}/, "payloadu { callout, open }"],
    [/closeWithin/, "metody closeWithin"],
    [/content\.classList\.add\("has-proof-context-disclosure"\)/, "klasy enhancement ustawianej po wstawieniu disclosure"],
    [/createElementNS\("http:\/\/www\.w3\.org\/2000\/svg",\s*"svg"\)/, "wspólnej ikony SVG dla generowanego disclosure"],
    [/iconPath\.setAttribute\("d",\s*"M4 10h12M10 4v12"\)/, "geometrii plus/minus zgodnej z pozostałymi triggerami"],
  ]) {
    if (!pattern.test(source)) failures.push(`${path}: brak ${label}`);
  }
  for (const htmlPath of annotationPages.keys()) {
    const count = scriptRefs(htmlSources.get(htmlPath))
      .filter(({ normalized }) => normalized === path).length;
    if (count !== 1) failures.push(`${htmlPath}: ${path} występuje ${count} razy zamiast raz`);
  }
  addCheck("jeden właściciel interakcji i zdarzeń anotacji", failures);
}

// Every hotspot has one page-unique accessible ID and complete approved anchors.
// IDs may repeat between separate HTML documents; the browser ID namespace is per document.
{
  const failures = [];
  let total = 0;
  let totalUniqueIds = 0;

  for (const [path, expectedCount] of annotationPages) {
    const source = htmlSources.get(path);
    const pageIdLocations = new Map();
    const articles = [...source.matchAll(/<article\b(?=[^>]*(?:\bdata-annotation(?:\s*=|\s|>)|\bdata-callout(?:\s*=|\s|>)))[^>]*>[\s\S]*?<\/article>/gi)];
    total += articles.length;
    if (articles.length !== expectedCount) {
      failures.push(`${path}: znaleziono ${articles.length} calloutów zamiast ${expectedCount}`);
    }

    for (const article of articles) {
      const block = article[0];
      const openingTag = block.match(/^<article\b[^>]*>/i)?.[0] || "";
      const dotTag = [...block.matchAll(/<button\b[^>]*>/gi)]
        .map(match => match[0])
        .find(tag => hasClass(tag, "annotation-dot"));
      const copyTag = [...block.matchAll(/<[a-z][\w:-]*\b[^>]*>/gi)]
        .map(match => match[0])
        .find(tag => hasClass(tag, "annotation-copy"));
      const where = location(path, source, article.index);
      const controlledId = dotTag ? attribute(dotTag, "aria-controls") : null;
      const copyId = copyTag ? attribute(copyTag, "id") : null;

      if (!dotTag) failures.push(`${where}: callout nie ma button.annotation-dot`);
      if (!copyTag) failures.push(`${where}: callout nie ma elementu .annotation-copy`);
      if (!controlledId) {
        failures.push(`${where}: punkt nie ma niepustego aria-controls (stabilnego callout ID)`);
      } else {
        const entries = pageIdLocations.get(controlledId) || [];
        entries.push(where);
        pageIdLocations.set(controlledId, entries);
      }
      if (controlledId && copyId !== controlledId) {
        failures.push(`${where}: aria-controls="${controlledId}" nie wskazuje ID dymka (${copyId || "brak"})`);
      }

      const anchor = profile => {
        const suffix = profile ? `-${profile}` : "";
        return [attribute(openingTag, `data-art-x${suffix}`), attribute(openingTag, `data-art-y${suffix}`)];
      };
      const [baseX, baseY] = anchor("");
      if (baseX === null || baseY === null) {
        failures.push(`${where}: brak pełnej kotwicy base (data-art-x i data-art-y)`);
      } else if (![baseX, baseY].every(value => Number.isFinite(Number(value)))) {
        failures.push(`${where}: kotwica base nie jest numeryczna (${baseX}, ${baseY})`);
      }

      for (const profile of ["compact", "short"]) {
        const [x, y] = anchor(profile);
        if ((x === null) !== (y === null)) {
          failures.push(`${where}: niepełna kotwica ${profile}; x i y muszą występować razem`);
        } else if (x !== null && ![x, y].every(value => Number.isFinite(Number(value)))) {
          failures.push(`${where}: kotwica ${profile} nie jest numeryczna (${x}, ${y})`);
        }
      }
      const [compactX, compactY] = anchor("compact");
      const [shortX, shortY] = anchor("short");
      if (shortX !== null && shortY !== null && (compactX === null || compactY === null)) {
        failures.push(`${where}: kotwica short wymaga wcześniejszej pełnej kotwicy compact`);
      }
    }

    for (const [id, entries] of pageIdLocations) {
      if (entries.length > 1) failures.push(`${path}: callout ID "${id}" powtarza się w jednym dokumencie: ${entries.join(", ")}`);
    }
    if (pageIdLocations.size !== expectedCount) {
      failures.push(`${path}: znaleziono ${pageIdLocations.size} unikalnych callout ID zamiast ${expectedCount}`);
    }
    totalUniqueIds += pageIdLocations.size;
  }

  if (total !== 53) failures.push(`łącznie: znaleziono ${total} calloutów zamiast 53`);
  if (totalUniqueIds !== 53) {
    failures.push(`łącznie: znaleziono ${totalUniqueIds} unikalnych w obrębie stron callout ID zamiast 53`);
  }
  addCheck("53 callouty, ID unikalne na stronie i kotwice", failures);
}

// Component appearance belongs only to annotation-system.css; route CSS may only compose it.
{
  const failures = [];
  const centralPath = "assets/annotation-system.css";
  const ownedProperties = new Map([
    ["annotation-dot", /^(?:appearance|animation(?:-[\w-]+)?|background(?:-[\w-]+)?|border(?:-[\w-]+)?|box-shadow|color|cursor|height|min-height|min-width|opacity|outline(?:-[\w-]+)?|padding(?:-[\w-]+)?|transition(?:-[\w-]+)?|width)$/],
    ["annotation-copy", /^(?:background(?:-[\w-]+)?|border(?:-[\w-]+)?|box-shadow|color|font(?:-[\w-]+)?|line-height|max-width|opacity|padding(?:-[\w-]+)?|pointer-events|text-shadow|transition(?:-[\w-]+)?|width)$/],
    ["annotation-wire", /^(?:animation(?:-[\w-]+)?|fill|opacity|stroke(?:-[\w-]+)?|transition(?:-[\w-]+)?)$/],
  ]);

  for (const [path, source] of cssSources) {
    if (path === centralPath) continue;
    for (const rule of cssRules(source)) {
      for (const [className, propertyPattern] of ownedProperties) {
        if (!new RegExp(`\\.${escapeRegExp(className)}\\b`).test(rule.selector)) continue;
        const properties = cssProperties(rule.declarations)
          .map(property => property.name)
          .filter(name => propertyPattern.test(name));
        if (properties.length) {
          failures.push(`${location(path, source, rule.index)}: ${rule.selector.replace(/\s+/g, " ")} definiuje lokalnie ${[...new Set(properties)].join(", ")}`);
        }
      }
    }
  }
  addCheck("jedno źródło bazowego CSS anotacji", failures);
}

// Only the two loaded project families may be named in production CSS.
{
  const failures = [];
  const seen = new Set();
  for (const [path, source] of cssSources) {
    const pattern = /(?:^|[;{])\s*font-family\s*:\s*([^;}]+)/gim;
    for (const match of source.matchAll(pattern)) {
      const rawValue = match[1].trim();
      if (/^(?:var|env)\(/i.test(rawValue)) continue;
      const families = rawValue.split(",").map(value => value.trim().replace(/^(?:"([^"]*)"|'([^']*)')$/, "$1$2"));
      for (const family of families) {
        if (!family || approvedFontFamilies.has(family) || genericFontFamilies.has(family) || /^(?:var|env)\(/i.test(family)) continue;
        const key = `${path}\0${family.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        failures.push(`${location(path, source, match.index)}: niezatwierdzona rodzina fontu "${family}"`);
      }
    }
  }
  addCheck("zatwierdzone rodziny fontów", failures);
}

// Statically knowable text sizes must honor 14px content / 12px label floors.
{
  const failures = [];
  const typographyPaths = new Set([
    "assets/annotation-system.css",
    "assets/content-system.css",
    "assets/design-tokens.css",
    "assets/page-faq.css",
    "assets/scene-viewport.css",
    "assets/site-enhancements.css",
    "assets/story-standard.css",
    "assets/visual-direction-scenes.v20260730-2.css",
    ...["about", "campaign", "diagnosis", "process", "social", "web"].map(route => `assets/services/${route}/styles.css`),
  ]);
  const labelSelector = /(?:^|[-_.#\s])(?:button|caption|chips?|cue|cta|eyebrow|index|kicker|label|meta|nav|number|small|tag)(?:\b|[-_])/i;
  const contentSelector = /(?:annotation-copy|answer|body|content|copy|description|detail|lead|proof-statement|result-(?:why|steps)|row-content|(?:^|[\s>+~])(?:li|p)(?:\b|[.#:[ ]))/i;
  const numericSizes = value => [...value.matchAll(/(-?\d*\.?\d+)\s*(px|rem)\b/gi)]
    .map(match => Number(match[1]) * (match[2].toLowerCase() === "rem" ? 16 : 1))
    .filter(Number.isFinite);

  for (const path of typographyPaths) {
    const source = cssSources.get(path);
    if (!source) continue;
    for (const rule of cssRules(source)) {
      const threshold = labelSelector.test(rule.selector) ? 12 : contentSelector.test(rule.selector) ? 14 : null;
      if (!threshold) continue;
      for (const property of cssProperties(rule.declarations).filter(item => item.name === "font-size")) {
        const sizes = numericSizes(property.value);
        if (!sizes.length) continue;
        const minimum = Math.min(...sizes);
        if (minimum < threshold) {
          failures.push(`${location(path, source, rule.index)}: ${rule.selector.replace(/\s+/g, " ")} ma statyczne minimum ${minimum.toFixed(2).replace(/\.00$/, "")}px; wymagane >=${threshold}px`);
        }
      }
    }
  }
  addCheck("minimalna typografia treści i labeli", failures);
}

// Viewport and route styles must reflow content instead of shrinking whole groups.
{
  const failures = [];
  const scalingPaths = [
    "assets/scene-viewport.css",
    ...["about", "campaign", "diagnosis", "process", "social", "web"].map(route => `assets/services/${route}/styles.css`),
  ];
  const contentGroup = /(?:copy-panel|diagnosis-(?:content|panel)|editorial-content|faq-|opening-copy|proof-content|quiz(?:-|_)|result-content|result-lead|story-copy)/i;
  const factors = value => {
    const result = [];
    const direct = value.trim().match(/^(-?\d*\.?\d+)$/);
    if (direct) result.push(Number(direct[1]));
    for (const match of value.matchAll(/scale(?:3d|x|y)?\(\s*(-?\d*\.?\d+)/gi)) result.push(Number(match[1]));
    return result.filter(Number.isFinite);
  };

  for (const path of scalingPaths) {
    const source = cssSources.get(path);
    if (!source) continue;
    for (const rule of cssRules(source)) {
      if (path !== "assets/scene-viewport.css" && !contentGroup.test(rule.selector)) continue;
      for (const property of cssProperties(rule.declarations).filter(item => item.name === "scale" || item.name === "transform")) {
        const shrinking = factors(property.value).filter(value => value < 1);
        if (shrinking.length) {
          failures.push(`${location(path, source, rule.index)}: ${rule.selector.replace(/\s+/g, " ")} zmniejsza grupę treści przez ${property.name}: ${property.value}`);
        }
      }
    }
  }
  addCheck("brak skalowania grup treści scen", failures);
}

// Diagnosis owns quiz/result/contact only; shared callout behavior stays shared.
{
  const failures = [];
  const htmlPath = "diagnoza.html";
  const scriptPath = "assets/services/diagnosis/script.js";
  const html = htmlSources.get(htmlPath);
  const source = await read(scriptPath);
  const refs = scriptRefs(html).map(({ normalized }) => normalized);
  const sharedCount = refs.filter(ref => ref === "assets/service-interactions.js").length;
  if (sharedCount !== 1) failures.push(`${htmlPath}: service-interactions.js występuje ${sharedCount} razy zamiast raz`);

  const forbiddenInteractionSignatures = [
    [".annotation-callout", "lokalny wybór .annotation-callout"],
    [".annotation-dot", "lokalny wybór .annotation-dot"],
    [".annotation-copy", "lokalny wybór .annotation-copy"],
    ["closeCallout", "lokalna funkcja closeCallout"],
    ["openCallout", "lokalna funkcja openCallout"],
    ["data-line=", "lokalne sterowanie linią calloutu"],
  ];
  for (const [signature, label] of forbiddenInteractionSignatures) {
    const index = source.indexOf(signature);
    if (index >= 0) failures.push(`${location(scriptPath, source, index)}: ${label}; interakcja należy do service-interactions.js`);
  }

  const combinedText = compactText(`${html}\n${source}`);
  const requiredCopy = [
    "Wynik dostajesz od razu — bez zapisu i podawania danych.",
    "Jeśli chcesz omówić wynik, przejdź do opcjonalnego kontaktu.",
    "Abyśmy mogli odpowiedzieć, podaj imię i e-mail.",
    "E-mail do odpowiedzi",
    "Poproś o kontakt",
    "Wróć do wyniku",
  ];
  for (const copy of requiredCopy) {
    if (!combinedText.includes(copy)) failures.push(`${htmlPath}/${scriptPath}: brak docelowego copy „${copy}”`);
  }
  if (/bez\s+(?:e-?maila|maila)/i.test(combinedText)) {
    failures.push(`${htmlPath}: pozostawiono obietnicę „bez maila” obok formularza wymagającego e-maila`);
  }

  const stateMarker = state => new RegExp(
    `(?:data-outcome-panel=["']${state}["']|data-(?:diagnosis-)?(?:outcome-)?(?:state|view)=["']${state}["']|data-(?:diagnosis-)?${state}-(?:state|view)(?:=["'][^"']*["'])?)`,
    "i",
  );
  for (const state of ["result", "contact"]) {
    if (!stateMarker(state).test(html)) {
      failures.push(`${htmlPath}: brak stabilnego data-markera rozłącznego stanu ${state}`);
    }
  }
  if (!/(?:\.inert\s*=|toggleAttribute\(\s*["']inert|setAttribute\(\s*["']aria-hidden)/.test(source)) {
    failures.push(`${scriptPath}: przełączanie stanów nie steruje inert/aria-hidden`);
  }
  if (!/(?:focusAfterPaint|\.focus\s*\()/.test(source)) {
    failures.push(`${scriptPath}: przełączanie stanów nie przenosi fokusu na nagłówek`);
  }
  addCheck("Diagnoza: wspólna interakcja, prawdziwe copy i rozłączne stany", failures);
}

// The light callout title may not be overridden to white on the About route.
{
  const failures = [];
  const path = "assets/services/about/styles.css";
  const source = cssSources.get(path);
  for (const rule of cssRules(source)) {
    if (!/#callout-leading\b/.test(rule.selector)) continue;
    const colors = cssProperties(rule.declarations).filter(property => property.name === "color");
    for (const color of colors) {
      if (/^(?:#fff(?:fff|8f1)?|white|rgb(?:a)?\(\s*255\s*,\s*255\s*,\s*255\b)/i.test(color.value)) {
        failures.push(`${location(path, source, rule.index)}: #callout-leading ma biały wyjątek color: ${color.value}`);
      }
    }
  }
  addCheck("O nas: brak białego #callout-leading", failures);
}

// Decorative kickers name a section; numeric progress belongs only to
// functional controls such as the diagnosis progress and process steps.
{
  const failures = [];
  for (const [path, source] of htmlSources) {
    for (const match of source.matchAll(/<p\b[^>]*>[\s\S]*?<\/p>/gi)) {
      const tag = match[0].slice(0, match[0].indexOf(">") + 1);
      if (!hasClass(tag, "kicker") && !hasClass(tag, "detail-kicker")) continue;
      const text = compactText(match[0]);
      if (/\b\d{2}\s*$/.test(text)) {
        failures.push(`${location(path, source, match.index)}: decorative kicker contains numeric index "${text}"`);
      }
    }
  }
  addCheck("kickers: labels without decorative section numbers", failures);
}

// Illustrated scenes have one semantic artwork layer. Duplicate CSS
// backgrounds would remain visible below the shared mask and create a ghost.
{
  const failures = [];
  const aboutPath = "assets/services/about/styles.css";
  const enhancementPath = "assets/site-enhancements.css";
  const aboutSource = cssSources.get(aboutPath);
  const enhancementSource = cssSources.get(enhancementPath);
  for (const selector of [
    "#about-responsibility",
    "#about-oliwia",
    "#about-model",
    "#about-credibility",
  ]) {
    const escaped = escapeRegExp(selector);
    if (new RegExp(`${escaped}\\s*\\{[^}]*background-image`, "s").test(aboutSource)) {
      failures.push(`${aboutPath}: ${selector} duplicates its semantic scene image as a background`);
    }
  }
  if (/\.process-discovery-scene\s*\{[^}]*background-image/s.test(enhancementSource)) {
    failures.push(`${enhancementPath}: Process discovery duplicates its semantic artwork as a background`);
  }
  if (/\.campaign-opening\s*>\s*\.campaign-art\s*\{[^}]*(?:-webkit-)?mask-image\s*:\s*none/s.test(enhancementSource)) {
    failures.push(`${enhancementPath}: Campaign opening disables the shared artwork mask`);
  }
  addCheck("sceny ilustracyjne: jedna warstwa artworku i wspólna maska", failures);
}

// FAQ begins with the first useful question, not a redundant count label.
{
  const failures = [];
  const path = "faq.html";
  const source = htmlSources.get(path);
  if (/faq-list__label/.test(source) || /06\s+odpowiedzi\s*\/\s*bez\s+drobnego\s+druku/i.test(source)) {
    failures.push(`${path}: redundant answer-count label returned`);
  }
  addCheck("FAQ: bez redundantnej etykiety liczby odpowiedzi", failures);
}

// Contact uses a seamless paper field; the old bitmap contained a horizontal
// pink horizon that moved across form controls with the viewport.
{
  const failures = [];
  const path = "assets/page-contact.css";
  const source = cssSources.get(path);
  if (!source.includes("--contact-paper-background:")) {
    failures.push(`${path}: missing the shared seamless form background token`);
  }
  if (/paper-plate\.webp/i.test(source)) {
    failures.push(`${path}: the form reuses the bitmap with a moving pink horizon`);
  }
  addCheck("Kontakt: seamless form background without a moving horizon", failures);
}

// Footer has one legal privacy link and one explicit accessibility label.
{
  const failures = [];
  const path = "assets/site-footer.js";
  const source = await read(path);
  const privacyHrefCount = (source.match(/["']\/polityka-prywatnosci["']/g) || []).length;
  const accessibilityHrefCount = (source.match(/["']\/dostepnosc["']/g) || []).length;
  if (privacyHrefCount !== 1) failures.push(`${path}: /polityka-prywatnosci występuje ${privacyHrefCount} razy zamiast raz`);
  if (accessibilityHrefCount !== 1) failures.push(`${path}: /dostepnosc występuje ${accessibilityHrefCount} razy zamiast raz`);
  for (const text of [
    "Polityka prywatności",
    "Standard serwisu",
    "Informacja o dostępności serwisu",
    "Ustawienia cookies",
  ]) {
    const count = source.split(text).length - 1;
    if (count !== 1) failures.push(`${path}: tekst „${text}” występuje ${count} razy zamiast raz`);
  }
  if (!/aria-label/i.test(source) || !source.includes("Informacja o dostępności serwisu")) {
    failures.push(`${path}: link Standard serwisu nie ma wymaganego aria-label`);
  }
  addCheck("stopka: pojedyncze legal links i Standard serwisu", failures);
}

const failedChecks = checks.filter(check => check.failures.length);
if (failedChecks.length) {
  const failureCount = failedChecks.reduce((sum, check) => sum + check.failures.length, 0);
  console.error(`Błędy kontraktu systemu UI (${failureCount} w ${failedChecks.length}/${checks.length} grupach):`);
  for (const check of checks) {
    if (!check.failures.length) {
      console.error(`\n✓ ${check.name}`);
      continue;
    }
    console.error(`\n✗ ${check.name} (${check.failures.length})`);
    const limit = 30;
    check.failures.slice(0, limit).forEach(failure => console.error(`  - ${failure}`));
    if (check.failures.length > limit) {
      console.error(`  - … pominięto ${check.failures.length - limit} dalszych błędów tej grupy`);
    }
  }
  process.exitCode = 1;
} else {
  console.log(`OK: ${checks.length} grup kontraktu systemu UI jest spójnych.`);
  console.log("OK: 53/53 calloutów ma ID unikalne w obrębie dokumentu i kompletne kotwice; komponent, typografia, Diagnoza i stopka mają jedno źródło prawdy.");
}
