import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const host = "okagency.pl";
const key = "2382e47d9da34145abc8ae8f95f6c510";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sitemap = await readFile(join(root, "sitemap.xml"), "utf8");
const urlList = [...sitemap.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map(match => match[1]);

if (!urlList.length) throw new Error("sitemap.xml nie zawiera adresów do zgłoszenia");
if (urlList.some(url => new URL(url).hostname !== host)) {
  throw new Error(`sitemap.xml zawiera adres spoza ${host}`);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList,
  }),
});

if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow odrzucił zgłoszenie: HTTP ${response.status} ${await response.text()}`);
}

console.log(`OK: IndexNow przyjął ${urlList.length} adresów (HTTP ${response.status}).`);
