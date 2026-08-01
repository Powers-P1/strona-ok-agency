import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const htmlFiles = (await readdir(root))
  .filter(name => name.endsWith(".html"))
  .sort();

const failures = [];
const hrefPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi;
const idPattern = /\bid=["']([^"']+)["']/gi;
const assetPattern = /<(?:link|script)\b[^>]*(?:href|src)=["']([^"']+)["'][^>]*>/gi;

for (const file of htmlFiles) {
  const source = await readFile(join(root, file), "utf8");
  const ids = new Set([...source.matchAll(idPattern)].map(match => match[1]));

  for (const match of source.matchAll(assetPattern)) {
    const href = match[1];
    if (/^(?:https?:|data:)/i.test(href)) continue;
    const path = href.split(/[?#]/)[0];
    if (!path) continue;
    if (!extname(path)) continue;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const target = path.startsWith("/")
      ? resolve(root, cleanPath)
      : resolve(root, dirname(file), cleanPath);
    try {
      if (!(await stat(target)).isFile()) failures.push(`${file}: brak zasobu ${href}`);
    } catch {
      failures.push(`${file}: brak zasobu ${href}`);
    }
  }

  for (const match of source.matchAll(hrefPattern)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|javascript:)/i.test(href)) continue;

    const [pathAndQuery, hash = ""] = href.split("#");
    const path = pathAndQuery.split("?")[0];

    if (!path && hash && !ids.has(hash)) {
      failures.push(`${file}: brak kotwicy #${hash}`);
      continue;
    }

    if (!path) continue;
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    let target = path.startsWith("/")
      ? resolve(root, cleanPath || "index.html")
      : resolve(root, dirname(file), cleanPath);

    if (!extname(target)) target = `${target}.html`;

    try {
      if (!(await stat(target)).isFile()) failures.push(`${file}: ${href} nie prowadzi do pliku`);
    } catch {
      failures.push(`${file}: brak celu ${href}`);
      continue;
    }

    if (hash && target.endsWith(".html")) {
      const targetSource = await readFile(target, "utf8");
      const targetIds = new Set([...targetSource.matchAll(idPattern)].map(item => item[1]));
      if (!targetIds.has(hash)) failures.push(`${file}: ${href} wskazuje brakującą kotwicę`);
    }
  }
}

if (failures.length) {
  console.error(`Błędy nawigacji (${failures.length}):`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`OK: sprawdzono ${htmlFiles.length} stron, wszystkie lokalne linki i kotwice istnieją.`);
}
