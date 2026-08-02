import { readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { ASSET_VERSIONS } from "./asset-versions.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checkOnly = process.argv.includes("--check");
const escapePattern = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const htmlFiles = (await readdir(root, { withFileTypes: true }))
  .filter(entry => entry.isFile() && extname(entry.name) === ".html")
  .map(entry => entry.name)
  .sort();
const changedFiles = [];

for (const htmlFile of htmlFiles) {
  const path = join(root, htmlFile);
  const source = await readFile(path, "utf8");
  let next = source;

  for (const [asset, version] of Object.entries(ASSET_VERSIONS)) {
    const pattern = new RegExp(`(["'])(\\/?${escapePattern(asset)})(?:\\?v=[^"']*)?\\1`, "g");
    next = next.replace(pattern, (_match, quote, reference) => (
      `${quote}${reference}?v=${version}${quote}`
    ));
  }

  if (next === source) continue;
  changedFiles.push(htmlFile);
  if (!checkOnly) await writeFile(path, next, "utf8");
}

if (checkOnly && changedFiles.length) {
  console.error(`Niespójne wersje assetów: ${changedFiles.join(", ")}`);
  process.exitCode = 1;
} else if (checkOnly) {
  console.log(`OK: ${htmlFiles.length} stron używa wersji z scripts/asset-versions.mjs.`);
} else {
  console.log(`Zsynchronizowano wersje assetów w ${changedFiles.length} stronach.`);
}
