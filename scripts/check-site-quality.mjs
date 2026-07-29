import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const htmlFiles = (await readdir(root))
  .filter(name => name.endsWith(".html"))
  .sort();
const publicFiles = htmlFiles.filter(name => name !== "404.html");
const failures = [];

const decodeEntities = value => value
  .replaceAll("&amp;", "&")
  .replaceAll("&quot;", '"')
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">");

const attribute = (source, selector, attributeName = "content") => {
  const tags = [...source.matchAll(/<(?:meta|link)\b[^>]*>/gi)].map(match => match[0]);
  const tag = tags.find(selector);
  if (!tag) return "";
  const match = tag.match(new RegExp(`\\b${attributeName}=["']([^"']+)["']`, "i"));
  return match ? decodeEntities(match[1].trim()) : "";
};

const metaName = (source, name) => attribute(
  source,
  tag => new RegExp(`\\bname=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "i").test(tag),
);
const metaProperty = (source, name) => attribute(
  source,
  tag => new RegExp(`\\bproperty=["']${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "i").test(tag),
);
const canonical = source => attribute(
  source,
  tag => /\brel=["']canonical["']/i.test(tag),
  "href",
);

const routeFor = file => file === "index.html" ? "/" : `/${file.replace(/\.html$/i, "")}`;
const expectedUrls = new Set(publicFiles.map(file => `https://okagency.pl${routeFor(file)}`));
const sitemap = await readFile(join(root, "sitemap.xml"), "utf8");
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)].map(match => match[1].trim()));

for (const file of publicFiles) {
  const source = await readFile(join(root, file), "utf8");
  const expectedUrl = `https://okagency.pl${routeFor(file)}`;
  const title = source.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim() || "";
  const description = metaName(source, "description");
  const h1Count = (source.match(/<h1\b/gi) || []).length;

  if (!title || title.length < 20 || title.length > 65) failures.push(`${file}: tytuł ma ${title.length} znaków`);
  if (!description || description.length < 70 || description.length > 170) {
    failures.push(`${file}: opis ma ${description.length} znaków`);
  }
  if (canonical(source) !== expectedUrl) failures.push(`${file}: canonical nie odpowiada ${expectedUrl}`);
  if (h1Count !== 1) failures.push(`${file}: liczba H1 wynosi ${h1Count}, oczekiwano 1`);
  if (!sitemapUrls.has(expectedUrl)) failures.push(`${file}: brak adresu w sitemap.xml`);

  for (const property of ["og:title", "og:description", "og:type", "og:url", "og:image"]) {
    if (!metaProperty(source, property)) failures.push(`${file}: brak ${property}`);
  }
  if (metaProperty(source, "og:url") !== expectedUrl) failures.push(`${file}: og:url jest niespójny`);
  for (const name of ["twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
    if (!metaName(source, name)) failures.push(`${file}: brak ${name}`);
  }

  const jsonBlocks = [...source.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (!jsonBlocks.length) failures.push(`${file}: brak JSON-LD`);
  for (const [, json] of jsonBlocks) {
    try {
      const parsed = JSON.parse(json);
      const nodes = Array.isArray(parsed?.["@graph"]) ? parsed["@graph"] : [parsed];
      for (const node of nodes) {
        if (node?.["@type"] !== "FAQPage") continue;
        for (const question of node.mainEntity || []) {
          const name = question?.name || "";
          if (name && !source.includes(name)) failures.push(`${file}: FAQ JSON-LD nie ma widocznego pytania „${name}”`);
        }
      }
    } catch (error) {
      failures.push(`${file}: błędny JSON-LD (${error.message})`);
    }
  }

  if (!/href=["']\/assets\/fonts\.css["']/i.test(source)) failures.push(`${file}: brak lokalnych fontów`);
  if (!/href=["']\/assets\/site-enhancements\.css["']/i.test(source)) failures.push(`${file}: brak warstwy dostępności`);
  if (!/rel=["']icon["']/i.test(source)) failures.push(`${file}: brak jawnej ikony strony`);
  if (/href=["'][^"']*\.html(?:[?#"'])/i.test(source)) failures.push(`${file}: wewnętrzny link zawiera .html`);
  if (/fonts\.(?:googleapis|gstatic)\.com/i.test(source)) failures.push(`${file}: zewnętrzne Google Fonts`);
  if (/\[(?:DO UZUPEŁNIENIA|UZUPEŁNIJ)[^\]]*\]|TODO|FIXME/i.test(source)) failures.push(`${file}: znacznik roboczy`);
}

for (const url of sitemapUrls) {
  if (!expectedUrls.has(url)) failures.push(`sitemap.xml: nieznany lub nieindeksowany adres ${url}`);
}

const socialImage = join(root, "assets", "ok-agency-social.webp");
const socialInfo = await stat(socialImage).catch(() => null);
if (!socialInfo?.isFile() || socialInfo.size > 180_000) {
  failures.push(`grafika społecznościowa: brak albo rozmiar przekracza 180 kB`);
}

const requiredFiles = [
  "llms.txt",
  "llms-full.txt",
  "assets/fonts.css",
  "assets/motion-control.js",
  "dostepnosc.html",
];
for (const path of requiredFiles) {
  const info = await stat(join(root, path)).catch(() => null);
  if (!info?.isFile()) failures.push(`brak wymaganego pliku ${path}`);
}

const assetFiles = await readdir(join(root, "assets"), { recursive: true });
for (const path of assetFiles.filter(path => path.endsWith(".css"))) {
  const source = await readFile(join(root, "assets", path), "utf8");
  if (/fonts\.(?:googleapis|gstatic)\.com/i.test(source)) {
    failures.push(`assets/${path}: zewnętrzne Google Fonts`);
  }
}

const robots = await readFile(join(root, "robots.txt"), "utf8");
for (const rule of ["User-agent: OAI-SearchBot", "User-agent: ChatGPT-User", "User-agent: GPTBot", "Sitemap: https://okagency.pl/sitemap.xml"]) {
  if (!robots.includes(rule)) failures.push(`robots.txt: brak „${rule}”`);
}
if (!/User-agent:\s*GPTBot[\s\S]*?Disallow:\s*\/(?:\r?\n|$)/i.test(robots)) {
  failures.push("robots.txt: GPTBot nie jest oddzielony od crawlera wyszukiwania");
}

const buildScript = await readFile(join(root, "scripts", "build.mjs"), "utf8");
for (const file of ["llms.txt", "llms-full.txt"]) {
  if (!buildScript.includes(`"${file}"`)) failures.push(`build: ${file} nie jest kopiowany`);
}

if (publicFiles.length !== 11) failures.push(`liczba indeksowanych stron: ${publicFiles.length}, oczekiwano 11`);

if (failures.length) {
  console.error(`Błędy jakości serwisu (${failures.length}):`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`OK: ${publicFiles.length} stron ma spójne canonicale, metadane, OG/Twitter, H1, JSON-LD i wpisy sitemap.`);
  console.log("OK: polityka, dostępność, lokalne fonty, pliki AI i reguły crawlerów są obecne w artefakcie.");
}
