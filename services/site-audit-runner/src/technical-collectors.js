import dns from "node:dns/promises";
import robotsParser from "robots-parser";
import { CollectorError, codeFromError, dedupeDiagnostics, isRetryableDiagnostic, makeDiagnostic } from "./collector-diagnostics.js";
import { inspectHtml } from "./html-inspector.js";
import { AUDIT_USER_AGENT, safeFetch } from "./safe-fetch.js";

const DNS_JSON_ENDPOINT = "https://cloudflare-dns.com/dns-query";
const MAX_CRAWL_PAGES = 8;
const HEAD_INCONCLUSIVE_STATUSES = new Set([403, 404, 405, 501]);
const DNS_ABSENCE_CODES = new Set(["enodata", "enotfound", "notfound", "nodata"]);

async function optional(operation, fallback, { diagnostics = null, collector = "dns", absenceCodes = DNS_ABSENCE_CODES } = {}) {
  const startedAt = Date.now();
  try {
    return await operation();
  } catch (error) {
    const code = codeFromError(error, "resolver_failed");
    if (diagnostics && !absenceCodes.has(code)) {
      diagnostics.push(makeDiagnostic({
        collector,
        status: "unavailable",
        code,
        retryable: isRetryableDiagnostic(code),
        durationMs: Date.now() - startedAt,
      }));
    }
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

async function findZoneApex(hostname, resolver, diagnostics) {
  const labels = hostname.split(".");
  for (let index = 0; index < labels.length - 1; index += 1) {
    const candidate = labels.slice(index).join(".");
    const soa = await optional(() => resolver.resolveSoa(candidate), null, { diagnostics, collector: "dns_soa" });
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
  if (!response.ok) {
    throw new CollectorError(response.status >= 500 ? "upstream_unavailable" : response.status === 429 ? "quota_exceeded" : "http_error", {
      retryable: response.status >= 500,
      httpStatus: response.status,
    });
  }
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength > 65_536) throw new CollectorError("response_too_large");
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > 65_536) throw new CollectorError("response_too_large");
  let body;
  try {
    body = JSON.parse(Buffer.from(buffer).toString("utf8"));
  } catch {
    throw new CollectorError("invalid_response");
  }
  if (![0, 3].includes(Number(body.Status))) {
    throw new CollectorError(Number(body.Status) === 2 ? "resolver_servfail" : "invalid_response", {
      retryable: Number(body.Status) === 2,
    });
  }
  return {
    status: Number(body.Status),
    authenticatedData: body.AD === true,
    answers: Array.isArray(body.Answer) ? body.Answer.slice(0, 32) : [],
  };
}

async function resolveHostAddresses(hostname, resolver, diagnostics, collectorPrefix) {
  const [ipv4, ipv6] = await Promise.all([
    optional(() => resolver.resolve4(hostname, { ttl: true }), [], { diagnostics, collector: `${collectorPrefix}_ipv4` }),
    optional(() => resolver.resolve6(hostname, { ttl: true }), [], { diagnostics, collector: `${collectorPrefix}_ipv6` }),
  ]);
  return {
    ipv4: normalizeAddressRecords(ipv4),
    ipv6: normalizeAddressRecords(ipv6),
    ttl: unique([...ipv4, ...ipv6].map(record => typeof record === "object" ? Number(record.ttl) : null).filter(Number.isFinite)),
  };
}

export async function collectDnsProfile(hostname, { resolver = dns, fetchImpl = fetch } = {}) {
  const diagnostics = [];
  const zone = await findZoneApex(hostname, resolver, diagnostics);
  const alternateHostname = hostname === zone.hostname
    ? `www.${zone.hostname}`
    : hostname === `www.${zone.hostname}` ? zone.hostname : null;

  const [addresses, cnames, nameservers, caa, mx, zoneTxt, dmarcTxt, dnssecAnswer, dsAnswer, alternateAddresses] = await Promise.all([
    resolveHostAddresses(hostname, resolver, diagnostics, "dns_target"),
    optional(() => resolver.resolveCname(hostname), [], { diagnostics, collector: "dns_cname" }),
    optional(() => resolver.resolveNs(zone.hostname), [], { diagnostics, collector: "dns_nameservers" }),
    optional(() => resolver.resolveCaa(zone.hostname), [], { diagnostics, collector: "dns_caa" }),
    optional(() => resolver.resolveMx(zone.hostname), [], { diagnostics, collector: "dns_mx" }),
    optional(() => resolver.resolveTxt(zone.hostname), [], { diagnostics, collector: "dns_txt" }),
    optional(() => resolver.resolveTxt(`_dmarc.${zone.hostname}`), [], { diagnostics, collector: "dns_dmarc" }),
    optional(() => queryDnsJson(hostname, "A", fetchImpl), null, { diagnostics, collector: "dnssec_answer", absenceCodes: new Set() }),
    optional(() => queryDnsJson(zone.hostname, "DS", fetchImpl), null, { diagnostics, collector: "dnssec_ds", absenceCodes: new Set() }),
    alternateHostname ? resolveHostAddresses(alternateHostname, resolver, diagnostics, "dns_alternate") : Promise.resolve(null),
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
    diagnostics: dedupeDiagnostics(diagnostics),
  };
}

export async function probeUrl(url, { fetcher = safeFetch, ...options } = {}) {
  const startedAt = Date.now();
  try {
    let result = await fetcher(url, { ...options, method: "HEAD", maxBytes: 65_536 });
    if (HEAD_INCONCLUSIVE_STATUSES.has(result.status)) {
      result = await fetcher(url, { ...options, method: "GET", maxBytes: 65_536 });
    }
    return {
      ok: result.status >= 200 && result.status < 400,
      status: result.status,
      finalUrl: result.url,
      redirects: result.redirects,
      headers: result.headers,
      tls: result.tls,
      httpVersion: result.httpVersion,
      durationMs: result.durationMs ?? Date.now() - startedAt,
    };
  } catch (error) {
    return { ok: false, status: 0, error: codeFromError(error, "fetch_failed"), redirects: [], durationMs: Date.now() - startedAt };
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

  let robots = { status: 0, available: false, body: "", sitemapUrls: [], durationMs: 0 };
  const robotsStartedAt = Date.now();
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
      durationMs: response.durationMs ?? Date.now() - robotsStartedAt,
    };
  } catch (error) {
    robots.error = codeFromError(error, "fetch_failed");
    robots.durationMs = Date.now() - robotsStartedAt;
  }

  const sitemapCandidates = unique([...robots.sitemapUrls, standardSitemapUrl]).filter(value => {
    try { return new URL(value, origin).hostname === finalUrl.hostname; } catch { return false; }
  }).slice(0, 3);
  const sitemapResults = [];
  for (const sitemapValue of sitemapCandidates) {
    const sitemapStartedAt = Date.now();
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
        durationMs: response.durationMs ?? Date.now() - sitemapStartedAt,
      });
    } catch (error) {
      sitemapResults.push({ url: sitemapValue, status: 0, available: false, error: codeFromError(error, "fetch_failed"), locations: [], durationMs: Date.now() - sitemapStartedAt });
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
    const pageStartedAt = Date.now();
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
        durationMs: response.durationMs ?? Date.now() - pageStartedAt,
      };
    } catch (error) {
      return { url, status: 0, error: codeFromError(error, "fetch_failed"), durationMs: Date.now() - pageStartedAt };
    }
  });

  const [httpProbe, alternateProbe] = await Promise.all([httpProbePromise, alternateProbePromise]);
  const diagnostics = [];
  const recordFailure = (collector, value) => {
    if (!value?.error) return;
    diagnostics.push(makeDiagnostic({
      collector,
      status: "unavailable",
      code: value.error,
      retryable: isRetryableDiagnostic(value.error),
      durationMs: value.durationMs || 0,
    }));
  };
  recordFailure("http_redirect", httpProbe);
  recordFailure("alternate_host", alternateProbe);
  recordFailure("robots", robots);
  for (const sitemap of sitemapResults) recordFailure("sitemap", sitemap);
  for (const page of pages) recordFailure("crawl_page", page);
  return {
    httpProbe,
    alternateProbe,
    robots: { status: robots.status, available: robots.available, error: robots.error || null, durationMs: robots.durationMs || 0 },
    sitemaps: sitemapResults.map(result => ({
      url: result.url,
      status: result.status,
      available: result.available,
      urlCount: result.locations.length,
      error: result.error || null,
      durationMs: result.durationMs || 0,
    })),
    crawledPages: pages,
    crawlLimit: MAX_CRAWL_PAGES,
    diagnostics: dedupeDiagnostics(diagnostics),
  };
}

export async function collectTechnicalProfile(snapshot, options = {}) {
  const hostname = new URL(snapshot.url).hostname;
  const diagnostics = [];
  let dnsProfile;
  try {
    dnsProfile = await collectDnsProfile(hostname, options);
    diagnostics.push(...(dnsProfile.diagnostics || []));
  } catch (error) {
    const code = codeFromError(error, "dns_profile_failed");
    diagnostics.push(makeDiagnostic({
      collector: "dns_profile",
      status: "unavailable",
      code,
      retryable: isRetryableDiagnostic(code),
    }));
    dnsProfile = {
      hostname,
      zone: hostname,
      addresses: { ipv4: [], ipv6: [], ttl: [] },
      cname: [],
      nameservers: [],
      caa: [],
      mx: [],
      spf: [],
      dmarc: [],
      dnssec: { dsPresent: false, validatedAnswer: false, dsRecords: [] },
      alternateHostname: null,
      alternateAddresses: null,
      diagnostics: [],
    };
  }

  let resources;
  try {
    resources = await collectPublicResources(snapshot, dnsProfile, options);
    diagnostics.push(...(resources.diagnostics || []));
  } catch (error) {
    const code = codeFromError(error, "public_resources_failed");
    diagnostics.push(makeDiagnostic({
      collector: "public_resources",
      status: "unavailable",
      code,
      retryable: isRetryableDiagnostic(code),
    }));
    resources = {
      httpProbe: null,
      alternateProbe: null,
      robots: { status: 0, available: false, error: code },
      sitemaps: [],
      crawledPages: [],
      crawlLimit: MAX_CRAWL_PAGES,
      diagnostics: [],
    };
  }
  return { dns: dnsProfile, resources, diagnostics: dedupeDiagnostics(diagnostics) };
}
