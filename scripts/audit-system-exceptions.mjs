import assert from "node:assert/strict";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(root, "docs/SYSTEM-EXCEPTIONS-INVENTORY.md");
const shouldWrite = process.argv.includes("--write");
const shouldCheck = process.argv.includes("--check");
const normalizeEol = value => value.replace(/\r\n/g, "\n");
const ignoredSourceRoots = Object.freeze([
  ".git/",
  ".wrangler/",
  "05-editorial-atelier/",
  "_src/",
  "dist/",
  "mockups/",
  "node_modules/",
]);

const sharedOwners = new Set([
  "assets/annotation-system.css",
  "assets/design-tokens.css",
  "assets/fonts.css",
  "assets/responsive-foundation.v20260730-8.css",
  "assets/responsive-safety.css",
  "assets/route-motion.css",
  "assets/scene-viewport.css",
  "assets/site-enhancements.css",
  "assets/site-footer.css",
  "assets/site-navigation.css",
  "assets/story-standard.css",
]);

/* Every production stylesheet outside the explicit shared-owner registry is
 * route/composition CSS and must appear in the exception inventory. Keeping
 * this definition open-ended prevents a newly added route stylesheet from
 * silently escaping the audit. */
const routeCss = path => (
  path.startsWith("assets/")
  && path.endsWith(".css")
  && !sharedOwners.has(path)
);

const walk = async directory => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async entry => {
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) return walk(absolute);
    return [absolute];
  }));
  return nested.flat();
};

const normalize = absolute => relative(root, absolute).replaceAll("\\", "/");
const lineAt = (source, offset) => source.slice(0, offset).split("\n").length;
const compact = value => value.replace(/\s+/g, " ").trim();

const blockContexts = source => {
  const blocks = [];
  const stack = [];
  let tokenStart = 0;
  let quote = "";
  let comment = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (comment) {
      if (char === "*" && next === "/") {
        comment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (char === "\\") index += 1;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "/" && next === "*") {
      comment = true;
      index += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "{") {
      const header = compact(source.slice(tokenStart, index));
      const block = {
        header,
        start: index + 1,
        end: source.length,
        parent: stack.at(-1) || null,
      };
      blocks.push(block);
      stack.push(block);
      tokenStart = index + 1;
      continue;
    }
    if (char === "}") {
      const block = stack.pop();
      if (block) block.end = index;
      tokenStart = index + 1;
      continue;
    }
    if (char === ";") tokenStart = index + 1;
  }
  return blocks;
};

const contextAt = (blocks, offset) => {
  const containing = blocks.filter(block => block.start <= offset && offset <= block.end);
  const selectorBlock = [...containing].reverse().find(block => !block.header.startsWith("@"));
  const atRules = containing.filter(block => block.header.startsWith("@")).map(block => block.header);
  return {
    selector: selectorBlock?.header || "(root)",
    atRules,
  };
};

const markdownCell = value => compact(String(value)).replaceAll("|", "\\|").replaceAll("`", "\\`");
const table = (headers, rows) => {
  if (!rows.length) return "_Brak wpisów._\n";
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map(row => `| ${row.map(markdownCell).join(" | ")} |`),
    "",
  ].join("\n");
};

const allFiles = await walk(root);
const sourceFiles = allFiles
  .map(absolute => ({ absolute, path: normalize(absolute) }))
  .filter(({ path }) => (
    !ignoredSourceRoots.some(prefix => path.startsWith(prefix))
    && /\.(?:css|js|html)$/.test(path)
  ));

const importantEntries = [];
const typographyEntries = [];
const ownerEntries = [];
const inlineStyleEntries = [];
const runtimeStyleEntries = [];

for (const file of sourceFiles) {
  const source = await readFile(file.absolute, "utf8");
  const blocks = file.path.endsWith(".css") ? blockContexts(source) : [];

  for (const match of source.matchAll(/!important\b/g)) {
    const context = file.path.endsWith(".css") ? contextAt(blocks, match.index) : { selector: "(code)", atRules: [] };
    const selector = context.selector;
    const classification = /(?:sr-only|visually-hidden)|prefers-reduced-motion/.test(`${selector} ${context.atRules.join(" ")}`)
      ? "accessibility"
      : sharedOwners.has(file.path)
        ? "shared-contract"
        : routeCss(file.path)
          ? "route-debt"
          : "other";
    importantEntries.push([
      file.path,
      lineAt(source, match.index),
      selector,
      context.atRules.join(" → ") || "—",
      classification,
    ]);
  }

  if (routeCss(file.path)) {
    const declarationPattern = /\b(font(?:-family|-size|-weight)?|line-height|letter-spacing)\s*:\s*([^;{}]+)(?:;|(?=}))/g;
    for (const match of source.matchAll(declarationPattern)) {
      const context = contextAt(blocks, match.index);
      const value = compact(match[2]);
      const tokenized = /var\(--ok-(?:type|font|leading|tracking)/.test(value);
      typographyEntries.push([
        file.path,
        lineAt(source, match.index),
        context.selector,
        match[1],
        value,
        context.atRules.join(" → ") || "—",
        tokenized ? "semantic-token" : "local-type-exception",
      ]);
    }

    const sharedSelector = /(?:site-header|topbar|header-nav|site-nav|\bnav\b|site-footer|annotation|scroll-cue|story-stage|campaign-frame|social-frame|process-frame|diagnosis-frame|\.scene(?:\b|[-_]))/;
    const ownershipProperty = /\b(position|z-index|display|height|min-height|max-height|overflow(?:-[xy])?|font-family|font-size)\s*:\s*([^;{}]+)(?:;|(?=}))/g;
    for (const match of source.matchAll(ownershipProperty)) {
      const context = contextAt(blocks, match.index);
      if (!sharedSelector.test(context.selector)) continue;
      ownerEntries.push([
        file.path,
        lineAt(source, match.index),
        context.selector,
        match[1],
        compact(match[2]),
        context.atRules.join(" → ") || "—",
      ]);
    }
  }

  if (file.path.endsWith(".html")) {
    for (const match of source.matchAll(/\sstyle=(?:"([^"]*)"|'([^']*)')/g)) {
      inlineStyleEntries.push([
        file.path,
        lineAt(source, match.index),
        compact(match[1] || match[2] || ""),
      ]);
    }
  }

  if (file.path.endsWith(".js")) {
    const runtimePattern = /\.style\.(?:setProperty|removeProperty)\([^\n;]+|\.style\.[A-Za-z]+\s*=\s*[^\n;]+/g;
    for (const match of source.matchAll(runtimePattern)) {
      runtimeStyleEntries.push([
        file.path,
        lineAt(source, match.index),
        compact(match[0]),
      ]);
    }
  }
}

const countByFile = entries => [...entries.reduce((map, entry) => {
  map.set(entry[0], (map.get(entry[0]) || 0) + 1);
  return map;
}, new Map())].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

const report = `# Inwentarz wyjątków systemowych

Raport jest generowany przez \`node scripts/audit-system-exceptions.mjs --write\`. Obejmuje źródła produkcyjne, podaje dokładny plik i linię oraz rozróżnia użycie tokenu od lokalnej definicji systemu typografii.

## Podsumowanie

- \`!important\`: **${importantEntries.length}**
- deklaracje typografii w lokalnych arkuszach tras: **${typographyEntries.length}**
- lokalne przejęcia selektorów wspólnych komponentów/geometrii scen: **${ownerEntries.length}**
- inline \`style\` w HTML: **${inlineStyleEntries.length}**
- mutacje stylu z JS: **${runtimeStyleEntries.length}**

### Największe źródła \`!important\`

${table(["Plik", "Liczba"], countByFile(importantEntries))}
### Największe lokalne źródła typografii

${table(["Plik", "Liczba"], countByFile(typographyEntries))}
## Każde użycie \`!important\`

${table(["Plik", "Linia", "Selektor", "Kontekst", "Klasyfikacja"], importantEntries)}
## Każda lokalna deklaracja typografii

${table(["Plik", "Linia", "Selektor", "Właściwość", "Wartość", "Kontekst", "Klasyfikacja"], typographyEntries)}
## Lokalne przejęcia wspólnych komponentów i geometrii scen

${table(["Plik", "Linia", "Selektor", "Właściwość", "Wartość", "Kontekst"], ownerEntries)}
## Inline style w HTML

${table(["Plik", "Linia", "Deklaracja"], inlineStyleEntries)}
## Mutacje stylu z JavaScript

${table(["Plik", "Linia", "Operacja"], runtimeStyleEntries)}
`;

if (shouldWrite) {
  await writeFile(outputPath, report, "utf8");
  console.log(`Zapisano ${normalize(outputPath)}.`);
} else if (shouldCheck) {
  const current = await readFile(outputPath, "utf8").catch(() => "");
  assert.equal(
    normalizeEol(current),
    normalizeEol(report),
    "SYSTEM-EXCEPTIONS-INVENTORY.md jest nieaktualny. Uruchom: npm run audit:system-exceptions",
  );
  console.log("OK: inwentarz wyjątków systemowych jest kompletny i aktualny.");
} else {
  process.stdout.write(report);
}
