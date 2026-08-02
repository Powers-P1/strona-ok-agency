import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const STYLE_HASHES_PLACEHOLDER = "{{STYLE_ATTRIBUTE_HASHES}}";
const CLOUDFLARE_HEADERS_LINE_LIMIT = 2_000;

function sha256(value) {
  return createHash("sha256").update(value, "utf8").digest("base64");
}

export async function renderHeaders(root, htmlFiles) {
  const styleValues = new Set();

  for (const file of htmlFiles) {
    const html = await readFile(join(root, file), "utf8");

    if (/<style(?:\s|>)/i.test(html)) {
      throw new Error(`${file}: style inline jest zabroniony przez CSP.`);
    }

    const inlineScripts = [
      ...html.matchAll(/<script(?=[\s>])(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi),
    ].filter(match => !/\btype=["']application\/(?:ld\+)?json["']/i.test(match[0]));
    if (inlineScripts.length > 0) {
      throw new Error(`${file}: wykonywalny skrypt inline jest zabroniony przez CSP.`);
    }

    for (const match of html.matchAll(/\sstyle=(["'])(.*?)\1/gi)) {
      styleValues.add(match[2]);
    }
  }

  const styleHashes = [...styleValues]
    .map(value => `'sha256-${sha256(value)}'`)
    .sort()
    .join(" ");

  const template = await readFile(join(root, "_headers"), "utf8");
  if (template.includes("'unsafe-inline'")) {
    throw new Error("_headers: unsafe-inline jest zabronione.");
  }
  if (!template.includes(STYLE_HASHES_PLACEHOLDER)) {
    throw new Error(`_headers: brak ${STYLE_HASHES_PLACEHOLDER}.`);
  }

  const headers = template.replace(STYLE_HASHES_PLACEHOLDER, styleHashes);
  const oversizedLine = headers
    .split(/\r?\n/)
    .find(line => line.length > CLOUDFLARE_HEADERS_LINE_LIMIT);
  if (oversizedLine) {
    throw new Error(
      `_headers: linia ma ${oversizedLine.length} znaków; limit Cloudflare Pages to ${CLOUDFLARE_HEADERS_LINE_LIMIT}.`,
    );
  }

  return {
    headers,
    styleHashCount: styleValues.size,
  };
}
