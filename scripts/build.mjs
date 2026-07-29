import { cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderHeaders } from "./csp.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

const rootFiles = await readdir(root, { withFileTypes: true });
const htmlFiles = rootFiles
  .filter(entry => entry.isFile() && entry.name.endsWith(".html"))
  .map(entry => entry.name);

for (const file of htmlFiles) {
  await cp(join(root, file), join(dist, file));
}

await cp(join(root, "assets"), join(dist, "assets"), { recursive: true });

const staticFiles = [
  "robots.txt",
  "sitemap.xml",
  "llms.txt",
  "llms-full.txt",
];

for (const file of staticFiles) {
  await cp(join(root, file), join(dist, file));
}

const { headers, styleHashCount } = await renderHeaders(root, htmlFiles);
await writeFile(join(dist, "_headers"), headers, "utf8");

await cp(join(root, ".well-known"), join(dist, ".well-known"), { recursive: true });

console.log(
  `OK: przygotowano ${htmlFiles.length} stron, CSP (${styleHashCount} haszy stylów) i konfigurację Cloudflare Pages w dist/.`,
);
