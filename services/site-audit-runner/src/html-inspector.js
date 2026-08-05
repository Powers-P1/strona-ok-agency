import { parse } from "parse5";

const CONTROL_TAGS = new Set(["input", "select", "textarea"]);
const TEXT_EXCLUDED_TAGS = new Set(["script", "style", "template", "noscript"]);

function attributes(node) {
  return Object.fromEntries((node.attrs || []).map(attribute => [attribute.name.toLowerCase(), attribute.value]));
}

function textContent(node) {
  if (!node) return "";
  if (node.nodeName === "#text") return node.value || "";
  if (TEXT_EXCLUDED_TAGS.has(node.tagName)) return "";
  return (node.childNodes || []).map(textContent).join(" ");
}

function rawTextContent(node) {
  if (!node) return "";
  if (node.nodeName === "#text") return node.value || "";
  return (node.childNodes || []).map(rawTextContent).join("");
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function absoluteHttpUrl(value, baseUrl) {
  try {
    const url = new URL(value, baseUrl);
    if (!new Set(["http:", "https:"]).has(url.protocol) || url.username || url.password) return null;
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

function structuredDataType(value) {
  if (Array.isArray(value)) return value.flatMap(structuredDataType);
  if (!value || typeof value !== "object") return [];
  const own = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]].filter(Boolean);
  const graph = Array.isArray(value["@graph"]) ? value["@graph"].flatMap(structuredDataType) : [];
  return [...own, ...graph].map(String).filter(Boolean);
}

export function inspectHtml(html, baseUrl) {
  const document = parse(String(html || ""), { sourceCodeLocationInfo: false });
  const result = {
    title: "",
    description: "",
    robotsMeta: "",
    canonical: "",
    lang: "",
    viewport: "",
    h1Count: 0,
    headingLevels: [],
    imageCount: 0,
    imageAltCount: 0,
    formCount: 0,
    inputCount: 0,
    labelCount: 0,
    structuredDataCount: 0,
    structuredDataValidCount: 0,
    structuredDataTypes: [],
    openGraphCount: 0,
    twitterCardCount: 0,
    hreflangCount: 0,
    links: [],
    privacyLink: false,
    text: "",
  };
  const links = new Set();
  const structuredTypes = new Set();

  function visit(node) {
    const tag = node.tagName;
    const attrs = attributes(node);
    if (tag === "html" && !result.lang) result.lang = normalizeText(attrs.lang);
    if (tag === "title" && !result.title) result.title = normalizeText(textContent(node));
    if (tag === "meta") {
      const key = String(attrs.name || attrs.property || "").toLowerCase();
      const content = normalizeText(attrs.content);
      if (key === "description" && !result.description) result.description = content;
      if (key === "robots" && !result.robotsMeta) result.robotsMeta = content;
      if (key === "viewport" && !result.viewport) result.viewport = content;
      if (key.startsWith("og:")) result.openGraphCount += 1;
      if (key.startsWith("twitter:")) result.twitterCardCount += 1;
    }
    if (tag === "link") {
      const rel = String(attrs.rel || "").toLowerCase().split(/\s+/);
      const href = absoluteHttpUrl(attrs.href, baseUrl);
      if (rel.includes("canonical") && href && !result.canonical) result.canonical = href;
      if (rel.includes("alternate") && normalizeText(attrs.hreflang)) result.hreflangCount += 1;
    }
    if (/^h[1-6]$/.test(tag || "")) {
      const level = Number(tag.slice(1));
      result.headingLevels.push(level);
      if (level === 1) result.h1Count += 1;
    }
    if (tag === "img") {
      result.imageCount += 1;
      if (Object.hasOwn(attrs, "alt")) result.imageAltCount += 1;
    }
    if (tag === "form") result.formCount += 1;
    if (tag === "label") result.labelCount += 1;
    if (CONTROL_TAGS.has(tag)) {
      const type = String(attrs.type || "").toLowerCase();
      if (tag !== "input" || !new Set(["hidden", "submit", "button", "reset", "image"]).has(type)) result.inputCount += 1;
    }
    if (tag === "a" && attrs.href) {
      const href = absoluteHttpUrl(attrs.href, baseUrl);
      if (href) {
        links.add(href);
        if (/\b(?:polityka-prywatnosci|privacy|ochrona-danych|regulamin|terms)\b/i.test(href)) result.privacyLink = true;
      }
    }
    if (tag === "script" && String(attrs.type || "").toLowerCase() === "application/ld+json") {
      result.structuredDataCount += 1;
      try {
        const parsed = JSON.parse(rawTextContent(node).trim());
        result.structuredDataValidCount += 1;
        for (const type of structuredDataType(parsed)) structuredTypes.add(type);
      } catch {
        // Invalid JSON-LD is reported explicitly by the analyzer.
      }
    }
    for (const child of node.childNodes || []) visit(child);
  }

  visit(document);
  result.links = [...links];
  result.structuredDataTypes = [...structuredTypes].slice(0, 12);
  result.text = normalizeText(textContent(document)).slice(0, 200_000);
  return result;
}

export function hasHeadingLevelSkip(levels) {
  for (let index = 1; index < levels.length; index += 1) {
    if (levels[index] - levels[index - 1] > 1) return true;
  }
  return false;
}
