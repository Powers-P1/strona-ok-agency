import dns from "node:dns/promises";
import robotsParser from "robots-parser";
import { inspectHtml } from "./html-inspector.js";
import { AUDIT_USER_AGENT, safeFetch } from "./safe-fetch.js";

const DNS_JSON_ENDPOINT = "https://cloudflare-dns.com/dns-query";
const MAX_CRAWL_PAGES = 8;

async function optional(operation, fallback) {
  try {
    return await operation();
  } catch {
    return fallback;
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeAddressRecords(records) {
  return unique((records || []).map(record => typeof record === "string" ? record : record?.address));
}

function normalizeTxt(records) {
  return unique((records || []).map(parts => Array.isArray(parts) ? parts.join("") : String(parts || "")).filter(Boolean));
}

async function findZoneApex(hostname, resolver) {
  const labels = hostname.split(".");
  for (let index = 0; index < labels.length - 1; index += 1) {
    const candidate = labels.slice(index).join(".");
    const soa = await optional(() => resolver.resolveSoa(candidate), null);
    if (soa) return { hostname: candidate, soa };
  }
  return { hostname, soa: null };
}

async function queryDnsJson(name, type, fetchImpl) {
  const endpoint = new URL(DNS_JSON_ENDPOINT);
  endpoint.searchParams.set("name", name);
  endpoint.searchParams.set("type", type);
  endpoint.searchParams.set("do", "true");
  const response = await fetchImpl(endpoint, {
    headers: { accept: "application/dns-json" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) return null;
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength > 65_536) return null;
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > 65_536) return null;
  const body = JSON.parse(Buffer.from(buffer).toString("utf8"));
  return {
    status: Number(body.Status),
    authenticatedData: body.AD === true,
    answers: Array.isArray(body.Answer) ? body.Answer.slice(0, 32) : [],
  };
}

async function resolveHostAddresses(hostname, resolver) {
  const [ipv4, ipv6] = await Promise.all([
    optional(() => resolver.resolve4(hostname, { ttl: true }), []),
    optional(() => resolver.resolve6(hostname, { ttl: true }), []),
  ]);
  return {
    ipv4: normalizeAddressRecords(ipv4),
    ipv6: normalizeAddressRecords(ipv6),
    ttl: unique([...ipv4, ...ipv6].map(record => typeof record === "object" ? Number(record.ttl) : null).filter(Number.isFinite)),
  };
}

export async function collectDnsProfile(hostname, { resolver = dns, fetchImpl = fetch } = {}) {
  const zone = await findZoneApex(hostname, resolver);
  const alternateHostname = hostname === zone.hostname
    ? `www.${zone.hostname}`
    : hostname === `www.${zone.hostname}` ? zone.hostname : null;

  const [addresses, cnames, nameservers, caa, mx, zoneTxt, dmarcTxt, dnssecAnswer, dsAnswer, alternateAddresses] = await Promise.all([
    resolveHostAddresses(hostname, resolver),
    optional(() => resolver.resolveCname(hostname), []),
    optional(() => resolver.resolveNs(zone.hostname), []),
    optional(() => resolver.resolveCaa(zone.hostname), []),
    optional(() => resolver.resolveMx(zone.hostname), []),
    optional(() => resolver.resolveTxt(zone.hostname), []),
    optional(() => resolver.resolveTxt(`_dmarc.${zone.hostname}`), []),
    optional(() => queryDnsJson(hostname, "A", fetchImpl), null),
    optional(() => queryDnsJson(zone.hostname, "DS", fetchImpl), null),
    alternateHostname ? resolveHostAddresses(alternateHostname, resolver) : Promise.resolve(null),
  ]);

  const txt = normalizeTxt(zoneTxt);
  const dmarc = normalizeTxt(dmarcTxt).filter(value => /^v=DMARC1\b/i.test(value));
  const spf = txt.filter(value => /^v=spf1\b/i.test(value));
  const dsRecords = (dsAnswer?.answers || []).filter(answer => Number(answer.type) === 43).map(answer => String(answer.data || "")).filter(Boolean);
  return {
    hostname,
    zone: zone.hostname,
    addresses,
    cname: unique(cnames.map(String)).slice(0, 12),
    nameservers: unique(nameservers.map(String)).slice(0, 12),
    caa: (caa || []).slice(0, 12).map(record => ({
      critical: Number(record.critical || 0),
      tag: record.issue ? "issue" : record.issuewild ? "issuewild" : record.iodef ? "iodef" : "unknown",
      value: String(record.issue || record.issuewild || record.iodef || ""),
    })),
    mx: (mx || []).sort((left, right) => left.priority - right.priority).slice(0, 12).map(record => ({
      priority: Number(record.priority),
      exchange: String(record.exchange || ""),
    })),
    spf: spf.slice(0, 4),
    dmarc: dmarc.slice(0, 4),
    dnssec: {
      dsPresent: dsRecords.length > 0,
      validatedAnswer: dnssecAnswer?.authenticatedData === true,
      dsRecords: dsRecords.slice(0, 8),
    },
    alternateHostname,
    alternateAddresses,
  };
}

async function probeUrl(url, options = {}) {
  try {
    let result = await safeFetch(url, { ...options, method: "HEAD", maxBytes: 65_536 });
    if (new Set([405, 501]).has(result.status)) result = await safeFetch(url, { ...options, method: "GET" });
    return {
      ok: result.status >= 200 && result.status < 400,
      status: result.status,
      finalUrl: result.url,
      redirects: result.redirects,
      headers: result.headers,
      tls: result.tls,
      httpVersion: result.httpVersion,
    };
  } catch (error) {
    return { ok: false, status: 0, error: error?.code || "fetch_failed", redirects: [] };
  }
}

function sitemapLocations(xml, baseUrl) {
  const locations = [];
  for (const match of String(xml || "").matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)) {
    const decoded = match[1]
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .trim();
    try {
      locations.push(new URL(decoded, baseUrl).href);
    } catch {
      // Invalid sitemap entries are ignored and reflected by the valid URL count.
    }
  }
  return unique(locations).slice(0, 2_000);
}

function isCrawlablePage(url, origin) {
  try {
    const candidate = new URL(url);
    if (candidate.origin !== origin) return false;
    if (/\.(?:avif|css|gif|ico|jpe?g|js|json|mp4|pdf|png|svg|webm|webp|woff2?|xml)(?:$|\?)/i.test(candidate.pathname)) return false;
    candidate.hash = "";
    return true;
  } catch {
    return false;
  }
}

async function mapWithConcurrency(values, concurrency, mapper) {
  const results = new Array(values.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, values.length) }, worker));
  return results;
}

export async function collectPublicResources(snapshot, dnsProfile, { resolver = dns } = {}) {
  const finalUrl = new URL(snapshot.url);
  const origin = finalUrl.origin;
  const robotsUrl = new URL("/robots.txt", origin).href;
  const standardSitemapUrl = new URL("/sitemap.xml", origin).href;
  const httpProbePromise = probeUrl(`http://${dnsProfile.hostname}/`, { resolver, timeoutMs: 8_000 });
  const alternateProbePromise = dnsProfile.alternateHostname
    ? probeUrl(`https://${dnsProfile.alternateHostname}/`, { resolver, timeoutMs: 8_000 })
    : Promise.resolve(null);

  let robots = { status: 0, available: false, body: "", sitemapUrls: [] };
  try {
    const response = await safeFetch(robotsUrl, {
      resolver,
      maxRedirects: 3,
      maxBytes: 262_144,
      timeoutMs: 8_000,
      accept: "text/plain,text/*;q=0.8",
    });
    robots = {
      status: response.status,
      available: response.status >= 200 && response.status < 300,
      body: response.status >= 200 && response.status < 300 ? response.body : "",
      sitemapUrls: [...response.body.matchAll(/^\s*sitemap\s*:\s*(\S+)\s*$/gim)].map(match => match[1]).slice(0, 8),
    };
  } catch (error) {
    robots.error = error?.code || "fetch_failed";
  }

  const sitemapCandidates = unique([...robots.sitemapUrls, standardSitemapUrl]).filter(value => {
    try { return new URL(value, origin).hostname === finalUrl.hostname; } catch { return false; }
  }).slice(0, 3);
  const sitemapResults = [];
  for (const sitemapValue of sitemapCandidates) {
    try {
      const sitemapUrl = new URL(sitemapValue, origin).href;
      const response = await safeFetch(sitemapUrl, {
        resolver,
        maxRedirects: 3,
        maxBytes: 524_288,
        timeoutMs: 10_000,
        accept: "application/xml,text/xml,text/plain;q=0.8",
      });
      sitemapResults.push({
        url: sitemapUrl,
        status: response.status,
        available: response.status >= 200 && response.status < 300,
        locations: response.status >= 200 && response.status < 300 ? sitemapLocations(response.body, sitemapUrl) : [],
      });
    } catch (error) {
      sitemapResults.push({ url: sitemapValue, status: 0, available: false, error: error?.code || "fetch_failed", locations: [] });
    }
  }

  const homeInspection = inspectHtml(snapshot.body, snapshot.url);
  const sitemapPages = sitemapResults.flatMap(result => result.locations).filter(url => !/\.xml(?:$|\?)/i.test(url));
  const candidates = unique([...sitemapPages, ...homeInspection.links])
    .filter(url => isCrawlablePage(url, origin))
    .filter(url => new URL(url).href !== finalUrl.href)
    .slice(0, MAX_CRAWL_PAGES * 3);
  const robotsRules = robots.available ? robotsParser(robotsUrl, robots.body) : null;
  const allowedCandidates = candidates.filter(url => robotsRules?.isAllowed(url, AUDIT_USER_AGENT) !== false).slice(0, MAX_CRAWL_PAGES);
  const pages = await mapWithConcurrency(allowedCandidates, 2, async url => {
    try {
      const response = await safeFetch(url, {
        resolver,
        maxRedirects: 3,
        maxBytes: 393_216,
        timeoutMs: 10_000,
        accept: "text/html,application/xhtml+xml;q=0.9",
      });
      const contentType = String(response.headers["content-type"] || "").toLowerCase();
      const inspection = contentType.includes("html") && response.status >= 200 && response.status < 400
        ? inspectHtml(response.body, response.url)
        : null;
      return {
        url,
        finalUrl: response.url,
        status: response.status,
        redirects: response.redirects.length,
        title: inspection?.title || "",
        h1Count: inspection?.h1Count ?? null,
        noindex: inspection ? /\bnoindex\b/i.test(inspection.robotsMeta) : null,
      };
    } catch (error) {
      return { url, status: 0, error: error?.code || "fetch_failed" };
    }
  });

  const [httpProbe, alternateProbe] = await Promise.all([httpProbePromise, alternateProbePromise]);
  return {
    httpProbe,
    alternateProbe,
    robots: { status: robots.status, available: robots.available, error: robots.error || null },
    sitemaps: sitemapResults.map(result => ({
      url: result.url,
      status: result.status,
      available: result.available,
      urlCount: result.locations.length,
      error: result.error || null,
    })),
    crawledPages: pages,
    crawlLimit: MAX_CRAWL_PAGES,
  };
}

export async function collectTechnicalProfile(snapshot, options = {}) {
  const hostname = new URL(snapshot.url).hostname;
  const dnsProfile = await collectDnsProfile(hostname, options);
  const resources = await collectPublicResources(snapshot, dnsProfile, options);
  return { dns: dnsProfile, resources };
}
