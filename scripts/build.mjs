import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
  "_headers",
  "robots.txt",
  "sitemap.xml",
];

for (const file of staticFiles) {
  await cp(join(root, file), join(dist, file));
}

console.log(
  `OK: przygotowano ${htmlFiles.length} stron i konfigurację Cloudflare Pages w dist/.`,
);
