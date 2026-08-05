import { build } from "esbuild";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(root, "assets", "generated");

await mkdir(outputDirectory, { recursive: true });
await build({
  entryPoints: [path.join(root, "assets", "services", "site-audit", "pdf-export-source.js")],
  outfile: path.join(outputDirectory, "site-audit-pdf.js"),
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["es2022"],
  minify: true,
  legalComments: "eof",
  sourcemap: false,
});

console.log("Zbudowano lokalny generator PDF audytu.");
