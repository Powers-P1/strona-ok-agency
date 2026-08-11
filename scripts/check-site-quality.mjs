import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const htmlFiles = (await readdir(root))
  .filter(name => name.endsWith(".html"))
  .sort();
const publicFiles = htmlFiles.filter(name => name !== "404.html");
const failures = [];
const retiredTransitionPattern = /\b(?:scene-seam__art|scene-seam__bridge|scene-derived|data-scene-continuation-art|campaign-seam-art-to-dark|diagnosis-seam-atmosphere-v1)\b/i;

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
const headers = await readFile(join(root, "_headers"), "utf8");
if (!/^\s*Referrer-Policy:\s*origin\s*$/mi.test(headers)) {
  failures.push("_headers: Referrer-Policy musi ograniczać referrer do origin");
}
const contentSecurityPolicy = headers.match(/^\s*Content-Security-Policy:\s*(.+)$/m)?.[1] || "";
const cspDirectives = new Map(contentSecurityPolicy
  .split(";")
  .map(directive => directive.trim().split(/\s+/))
  .filter(parts => parts[0])
  .map(([name, ...values]) => [name, new Set(values)]));
if (!cspDirectives.has("upgrade-insecure-requests")) {
  failures.push("_headers: CSP nie wymusza upgrade-insecure-requests");
}

const cspAllowsHost = (directive, host) => {
  const sources = cspDirectives.get(directive) || new Set();
  if (sources.has(host)) return true;
  return [...sources].some(source => (
    source.startsWith("*.")
    && host.endsWith(source.slice(1))
    && host !== source.slice(2)
  ));
};

const requiredCspHosts = {
  "frame-src": ["www.googletagmanager.com", "td.doubleclick.net"],
  "script-src": [
    "connect.facebook.net",
    "www.clarity.ms",
    "www.googletagmanager.com",
    "www.googleadservices.com",
    "www.google.com",
    "pagead2.googlesyndication.com",
    "googleads.g.doubleclick.net",
  ],
  "img-src": [
    "www.facebook.com",
    "www.googletagmanager.com",
    "www.google-analytics.com",
    "www.googleadservices.com",
    "www.google.com",
    "www.google.pl",
    "pagead2.googlesyndication.com",
    "googleads.g.doubleclick.net",
  ],
  "connect-src": [
    "www.facebook.com",
    "www.clarity.ms",
    "c.bing.com",
    "www.google-analytics.com",
    "region1.analytics.google.com",
    "www.googleadservices.com",
    "www.google.com",
    "www.google.pl",
    "pagead2.googlesyndication.com",
    "ad.doubleclick.net",
  ],
};

for (const [directive, hosts] of Object.entries(requiredCspHosts)) {
  for (const host of hosts) {
    if (!cspAllowsHost(directive, host)) {
      failures.push(`_headers: ${directive} blokuje wymagany endpoint ${host}`);
    }
  }
}

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
  const schemaNodes = [];
  if (!jsonBlocks.length) failures.push(`${file}: brak JSON-LD`);
  for (const [, json] of jsonBlocks) {
    try {
      const parsed = JSON.parse(json);
      const nodes = Array.isArray(parsed?.["@graph"]) ? parsed["@graph"] : [parsed];
      schemaNodes.push(...nodes);
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

  if (file !== "index.html") {
    const breadcrumbs = schemaNodes.find(node => node?.["@type"] === "BreadcrumbList");
    const items = breadcrumbs?.itemListElement || [];
    if (!breadcrumbs) {
      failures.push(`${file}: brak BreadcrumbList`);
    } else {
      if (items[0]?.item !== "https://okagency.pl/") failures.push(`${file}: BreadcrumbList nie zaczyna się od strony głównej`);
      if (items.at(-1)?.item !== expectedUrl) failures.push(`${file}: BreadcrumbList nie kończy się bieżącym adresem`);
      if (items.some((item, index) => item?.position !== index + 1)) failures.push(`${file}: nieciągłe pozycje BreadcrumbList`);
    }
  }

  const imageTags = [...source.matchAll(/<img\b[^>]*>/gis)].map(match => match[0]);
  for (const image of imageTags) {
    if (!/\bwidth=["'][^"']+["']/i.test(image) || !/\bheight=["'][^"']+["']/i.test(image)) {
      failures.push(`${file}: obraz bez jawnych wymiarów`);
    }
  }

  if (!/href=["']\/assets\/fonts\.css(?:\?[^"']*)?["']/i.test(source)) failures.push(`${file}: brak lokalnych fontów`);
  if (!/href=["']\/assets\/site-enhancements\.css(?:\?[^"']*)?["']/i.test(source)) failures.push(`${file}: brak warstwy dostępności`);
  if (!/src=["']\/assets\/motion-control\.js\?v=[\d-]+["']/i.test(source)) failures.push(`${file}: motion-control.js bez wersjonowania cache`);
  if (!/rel=["']icon["']/i.test(source)) failures.push(`${file}: brak jawnej ikony strony`);
  if (/href=["'][^"']*\.html(?:[?#"'])/i.test(source)) failures.push(`${file}: wewnętrzny link zawiera .html`);
  if (/fonts\.(?:googleapis|gstatic)\.com/i.test(source)) failures.push(`${file}: zewnętrzne Google Fonts`);
  if (/\[(?:DO UZUPEŁNIENIA|UZUPEŁNIJ)[^\]]*\]|TODO|FIXME/i.test(source)) failures.push(`${file}: znacznik roboczy`);
  if (retiredTransitionPattern.test(source)) {
    failures.push(`${file}: przejście zawiera wycofany renderer, marker lub dekoracyjny asset`);
  }

  if (file === "index.html") {
    const homeIntro = source.match(/<section class=["']home-intro["'][\s\S]*?<\/section>/i)?.[0] || "";
    const homeIntroTag = source.match(/<section\b(?=[^>]*\bclass=["'][^"']*\bhome-intro\b)[^>]*>/i)?.[0] || "";
    const homeIntroText = decodeEntities(homeIntro.replace(/<[^>]+>/g, " "));
    const homeIntroWords = homeIntroText.match(/\p{L}[\p{L}\p{M}’'-]*/gu) || [];
    if (homeIntroWords.length < 150 || homeIntroWords.length > 250) {
      failures.push(`${file}: blok home-intro ma ${homeIntroWords.length} słów zamiast 150–250`);
    }
    if (!/\bdata-scene-seam-profile=["']shallow["']/i.test(homeIntroTag)) {
      failures.push(`${file}: przejście hero nie korzysta ze wspólnego płytkiego profilu`);
    }
    for (const tier of ["default", "low", "compact"]) {
      if (!new RegExp(`\\bdata-scene-seam-atmosphere-${tier}=["'][^"']*home-hero-intro-v12`, "i").test(homeIntroTag)) {
        failures.push(`${file}: przejście hero nie ma wariantu v12 dla ${tier}`);
      }
    }
  }

  if (/\bdata-scene-flow=["']document["']/i.test(source)) {
    const frameTags = [...source.matchAll(/<section\b[^>]*\bdata-scene-frame\b[^>]*>/gi)]
      .map(match => ({ index: match.index, tag: match[0] }));
    const hasAttribute = (tag, name) => new RegExp(`\\b${name}(?:\\s*=|\\s|>)`, "i").test(`${tag}>`);
    const tone = tag => tag.match(/\bdata-scene-tone=["']([^"']+)["']/i)?.[1]?.toLowerCase() || "";

    for (let index = 0; index < frameTags.length - 1; index += 1) {
      const current = frameTags[index];
      const next = frameTags[index + 1];
      const between = source.slice(current.index + current.tag.length, next.index);
      const authored = [...between.matchAll(
        /<div\b(?=[^>]*\bclass=["'][^"']*\bscene-seam\b)(?=[^>]*\bdata-scene-seam-source(?:\s*=|\s|>))[^>]*>/gi,
      )].length;
      const generated = hasAttribute(current.tag, "data-scene-boundary-source")
        && hasAttribute(next.tag, "data-scene-boundary-target")
        && hasAttribute(next.tag, "data-scene-continuation");

      const hasExactlyOneContract = (authored === 1 && !generated)
        || (authored === 0 && generated);
      if (!hasExactlyOneContract) {
        failures.push(`${file}: granica scen ${index + 1}→${index + 2} nie ma dokładnie jednego kontraktu przejścia`);
      }
      if (generated && (tone(current.tag) !== "light" || tone(next.tag) !== "light")) {
        failures.push(`${file}: generowana granica scen ${index + 1}→${index + 2} nie jest wspieraną parą light→light`);
      }
    }
  }

  if (["strony-internetowe.html", "social-media.html", "kampanie.html"].includes(file)) {
    const faqSceneId = {
      "kampanie.html": "campaign-faq",
      "social-media.html": "social-faq",
      "strony-internetowe.html": "web-faq",
    }[file];
    const faqSection = source.match(new RegExp(
      `<section\\b(?=[^>]*\\bid=["']${faqSceneId}["'])[^>]*>[\\s\\S]*?<\\/section>`,
      "i",
    ))?.[0] || "";
    if (
      !/\baria-labelledby=["'][^"']+["']/i.test(faqSection)
      || !/\bdata-scene-frame\b/i.test(faqSection)
      || !/\bclass=["'][^"']*\bproof-list\b/i.test(faqSection)
    ) {
      failures.push(`${file}: FAQ nie jest semantyczną sekcją`);
    }
    for (const image of imageTags.filter(tag => /\bclass=["'][^"']*\bcampaign-art\b/i.test(tag))) {
      if (!/\bsrcset=["'][^"']+["']/i.test(image) || !/\bsizes=["'][^"']+["']/i.test(image)) {
        failures.push(`${file}: grafika usługi nie ma responsywnego srcset i sizes`);
      }
    }
  }

  if (file === "kontakt.html" && !/<div\b[^>]*class=["'][^"']*\bcf-turnstile\b[^"']*["'][^>]*data-size=["']flexible["']/i.test(source)) {
    failures.push(`${file}: Turnstile nie używa wariantu flexible`);
  }

  if (file === "o-nas.html") {
    for (const target of ["1", "2", "3"]) {
      if (!new RegExp(`<button\\b[^>]*data-go=["']${target}["'][^>]*>`, "i").test(source)) {
        failures.push(`${file}: brak głównego CTA data-go="${target}"`);
      }
    }
  }
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
  "assets/editorial-atelier-scene-v1-1280.avif",
  "dostepnosc.html",
];
for (const path of requiredFiles) {
  const info = await stat(join(root, path)).catch(() => null);
  if (!info?.isFile()) failures.push(`brak wymaganego pliku ${path}`);
}

const assetFiles = await readdir(join(root, "assets"), { recursive: true });
for (const path of assetFiles.filter(path => /\.(?:css|js)$/i.test(path))) {
  const source = await readFile(join(root, "assets", path), "utf8");
  if (path.endsWith(".css") && /fonts\.(?:googleapis|gstatic)\.com/i.test(source)) {
    failures.push(`assets/${path}: zewnętrzne Google Fonts`);
  }
  if (retiredTransitionPattern.test(source)) {
    failures.push(`assets/${path}: kod przywraca wycofany renderer, marker lub dekoracyjny asset`);
  }
}

const robots = await readFile(join(root, "robots.txt"), "utf8");
if (!robots.includes("Sitemap: https://okagency.pl/sitemap.xml")) {
  failures.push("robots.txt: brak odwołania do sitemap.xml");
}
const robotSections = robots.split(/(?=^User-agent:)/m);
const hasRobotPolicy = (bot, directive) => robotSections.some(section => {
  const lines = section.split(/\r?\n/).map(line => line.trim());
  return lines[0]?.toLowerCase() === `user-agent: ${bot}`.toLowerCase()
    && lines.some(line => line.toLowerCase() === directive.toLowerCase());
});
for (const searchBot of [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Googlebot",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-SearchBot",
  "Claude-User",
]) {
  if (!hasRobotPolicy(searchBot, "Allow: /")) failures.push(`robots.txt: ${searchBot} nie ma Allow: /`);
}
for (const trainingBot of ["GPTBot", "ClaudeBot", "Google-Extended"]) {
  if (!hasRobotPolicy(trainingBot, "Disallow: /")) failures.push(`robots.txt: ${trainingBot} nie ma Disallow: /`);
}

const buildScript = await readFile(join(root, "scripts", "build.mjs"), "utf8");
for (const file of ["llms.txt", "llms-full.txt", "2382e47d9da34145abc8ae8f95f6c510.txt"]) {
  if (!buildScript.includes(`"${file}"`)) failures.push(`build: ${file} nie jest kopiowany`);
}

if (publicFiles.length !== sitemapUrls.size) {
  failures.push(`liczba indeksowanych stron (${publicFiles.length}) nie odpowiada sitemap.xml (${sitemapUrls.size})`);
}

if (failures.length) {
  console.error(`Błędy jakości serwisu (${failures.length}):`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`OK: ${publicFiles.length} stron ma spójne canonicale, metadane, OG/Twitter, H1, JSON-LD i wpisy sitemap.`);
  console.log("OK: polityka, dostępność, lokalne fonty, pliki AI i reguły crawlerów są obecne w artefakcie.");
}
