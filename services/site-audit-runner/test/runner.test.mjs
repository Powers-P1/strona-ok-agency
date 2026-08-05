import assert from "node:assert/strict";
import test from "node:test";
import { analyzeSnapshot, fetchPageSpeed } from "../src/analyze.js";
import { inspectHtml } from "../src/html-inspector.js";
import { readTlsMetadata, ScanError, resolveAndVet, safeFetch, validateTargetUrl } from "../src/safe-fetch.js";
import { collectDnsProfile, probeUrl } from "../src/technical-collectors.js";
import { validateReport } from "../../../worker/site-audit-core.js";

test("runner blokuje URL-e lokalne i niestandardowe porty", () => {
  for (const value of ["http://localhost", "http://127.0.0.1", "http://[::1]", "https://example.com:8443", "file:///etc/passwd"]) {
    assert.throws(() => validateTargetUrl(value), ScanError, value);
  }
});

test("runner odrzuca odpowiedź DNS zawierającą adres prywatny", async () => {
  const resolver = {
    resolve4: async () => ["93.184.216.34", "169.254.169.254"],
    resolve6: async () => [],
  };
  await assert.rejects(() => resolveAndVet("example.com", resolver), error => error.code === "private_target");
});

test("inspektor HTML używa parsera dokumentu i nie zwraca surowej treści", () => {
  const inspection = inspectHtml(`<!doctype html><html lang="pl"><head>
    <title>Test</title><link rel="canonical" href="/oferta">
    <script type="application/ld+json">{"@type":"Organization"}</script>
  </head><body><h1>Oferta</h1><a href="/kontakt">Kontakt</a><img src="x.jpg" alt=""></body></html>`, "https://example.com/");
  assert.equal(inspection.canonical, "https://example.com/oferta");
  assert.deepEqual(inspection.structuredDataTypes, ["Organization"]);
  assert.equal(inspection.imageAltCount, 1);
  assert.equal(inspection.links[0], "https://example.com/kontakt");
  assert.equal(Object.hasOwn(inspection, "html"), false);
});

test("runner dopuszcza wyłącznie pasywne metody GET i HEAD", async () => {
  await assert.rejects(() => safeFetch("https://example.com", { method: "POST" }), error => error.code === "invalid_method");
});

test("metadane TLS są kopiowane zanim gniazdo zostanie odłączone", () => {
  let attached = true;
  const socket = {
    getProtocol: () => attached ? "TLSv1.3" : null,
    getPeerCertificate: () => attached ? {
      valid_from: "Aug 01 00:00:00 2026 GMT",
      valid_to: "Oct 30 23:59:59 2026 GMT",
      issuer: { O: "Example CA" },
      subject: { CN: "example.com" },
      subjectaltname: "DNS:example.com",
      fingerprint256: "AA:BB",
    } : {},
  };
  const metadata = readTlsMetadata(socket);
  attached = false;
  assert.equal(metadata.protocol, "TLSv1.3");
  assert.equal(metadata.validTo, "Oct 30 23:59:59 2026 GMT");
  assert.equal(metadata.issuer, "Example CA");
});

test("sonda HTTP potwierdza przekierowanie przez GET, gdy HEAD jest niekonkluzywny", async () => {
  const calls = [];
  const fetcher = async (_url, options) => {
    calls.push(options);
    if (options.method === "HEAD") {
      return { status: 403, url: "http://example.com/", redirects: [], headers: {}, tls: null, httpVersion: "1.1" };
    }
    return {
      status: 200,
      url: "https://example.com/",
      redirects: [{ status: 301, from: "http://example.com/", to: "https://example.com/" }],
      headers: {},
      tls: { protocol: "TLSv1.3" },
      httpVersion: "2",
    };
  };

  const result = await probeUrl("http://example.com/", { fetcher, timeoutMs: 8_000 });
  assert.deepEqual(calls.map(call => call.method), ["HEAD", "GET"]);
  assert.ok(calls.every(call => call.maxBytes === 65_536));
  assert.equal(result.ok, true);
  assert.equal(result.finalUrl, "https://example.com/");
  assert.equal(result.redirects.length, 1);
});

test("kolektor DNS rozróżnia strefę, DNSSEC i konfigurację poczty", async () => {
  const resolver = {
    resolveSoa: async name => name === "example.com" ? { nsname: "ns1.example.net" } : Promise.reject(new Error("not found")),
    resolve4: async name => name === "example.com" ? [{ address: "93.184.216.34", ttl: 3600 }] : [{ address: "93.184.216.35", ttl: 3600 }],
    resolve6: async () => [{ address: "2001:db8::1", ttl: 3600 }],
    resolveCname: async () => [],
    resolveNs: async () => ["ns1.example.net", "ns2.example.net"],
    resolveCaa: async () => [{ critical: 0, issue: "letsencrypt.org" }],
    resolveMx: async () => [{ priority: 10, exchange: "mail.example.com" }],
    resolveTxt: async name => name.startsWith("_dmarc.") ? [["v=DMARC1; p=reject"]] : [["v=spf1 -all"]],
  };
  const fetchImpl = async url => {
    const type = new URL(url).searchParams.get("type");
    const body = type === "DS"
      ? { Status: 0, AD: true, Answer: [{ type: 43, data: "12345 13 2 abc" }] }
      : { Status: 0, AD: true, Answer: [{ type: 1, data: "93.184.216.34" }] };
    return new Response(JSON.stringify(body), { status: 200, headers: { "content-type": "application/dns-json" } });
  };
  const profile = await collectDnsProfile("example.com", { resolver, fetchImpl });
  assert.equal(profile.zone, "example.com");
  assert.equal(profile.dnssec.dsPresent, true);
  assert.equal(profile.dnssec.validatedAnswer, true);
  assert.deepEqual(profile.spf, ["v=spf1 -all"]);
  assert.deepEqual(profile.dmarc, ["v=DMARC1; p=reject"]);
  assert.equal(profile.alternateHostname, "www.example.com");
});

test("analiza zwraca siedem kategorii, pełne kontrole i poprawny kontrakt 2.0", () => {
  const html = `<!doctype html><html lang="pl"><head>
    <title>Przykładowa firma — skuteczna usługa dla biznesu</title>
    <meta name="description" content="Pomagamy firmom uporządkować sprzedaż i marketing dzięki konkretnej usłudze dopasowanej do potrzeb zespołu i klientów.">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="canonical" href="https://example.com">
    <meta property="og:title" content="Firma"><meta property="og:description" content="Opis"><meta property="og:url" content="https://example.com"><meta property="og:image" content="https://example.com/social.jpg">
    <meta name="twitter:card" content="summary_large_image">
    <script type="application/ld+json">{"@type":"Organization"}</script>
  </head><body><h1>Usługa dla Twojej firmy</h1><p>${"Oferta i korzyści dla klientów. ".repeat(30)}</p>
    <a href="/kontakt">Umów kontakt</a><form><label>E-mail<input type="email"></label></form>
    <img src="x.jpg" alt="Zespół firmy"><a href="/polityka-prywatnosci">Polityka prywatności</a><p>Portfolio, realizacje i doświadczenie klientów.</p>
  </body></html>`;
  const report = analyzeSnapshot({
    body: html,
    requestedOrigin: "https://example.com",
    url: "https://example.com/",
    status: 200,
    durationMs: 500,
    redirects: [],
    headers: {
      "strict-transport-security": "max-age=31536000",
      "content-security-policy": "default-src 'self'; frame-ancestors 'none'",
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin",
      "permissions-policy": "camera=(), microphone=()",
    },
    tls: { validTo: "2030-01-01", protocol: "TLSv1.3" },
  }, {
    performanceScore: 91,
    accessibilityScore: 95,
    seoScore: 96,
    bestPracticesScore: 94,
    metrics: { lcpMs: 1200, cls: 0.03, tbtMs: 80, speedIndexMs: 1500 },
  }, {
    dns: {
      zone: "example.com",
      addresses: { ipv4: ["93.184.216.34"], ipv6: ["2001:db8::1"], ttl: [3600] },
      nameservers: ["ns1.example.net", "ns2.example.net"],
      caa: [{ tag: "issue", value: "letsencrypt.org" }],
      mx: [{ priority: 10, exchange: "mail.example.com" }],
      spf: ["v=spf1 -all"],
      dmarc: ["v=DMARC1; p=reject"],
      dnssec: { dsPresent: true, validatedAnswer: true },
      alternateHostname: "www.example.com",
      alternateAddresses: { ipv4: ["93.184.216.34"], ipv6: [] },
    },
    resources: {
      httpProbe: { ok: true, finalUrl: "https://example.com/", redirects: [{ status: 301 }] },
      alternateProbe: { ok: true, finalUrl: "https://example.com/", redirects: [{ status: 301 }] },
      robots: { available: true, status: 200 },
      sitemaps: [{ available: true, status: 200, urlCount: 4 }],
      crawledPages: [
        { url: "https://example.com/", finalUrl: "https://example.com/", status: 200, title: "Strona główna" },
        { url: "https://example.com/oferta", finalUrl: "https://example.com/oferta", status: 200, title: "Oferta" },
      ],
      crawlLimit: 8,
    },
  }, { rulesetVersion: "2026.08.2", scannerVersion: "2.0.1" });
  assert.equal(report.schemaVersion, "2.0");
  assert.deepEqual(Object.keys(report.categories), ["performance", "seo", "accessibility", "technical", "security", "conversion", "trust"]);
  assert.ok(report.overallScore >= 80);
  assert.equal(report.partial, false);
  assert.ok(report.strengths.length >= 3);
  assert.ok(report.checks.length >= 40);
  assert.doesNotThrow(() => validateReport(report));
});

test("PageSpeed degraduje się bezpiecznie po błędzie API", async () => {
  let calls = 0;
  const result = await fetchPageSpeed("https://example.com", {
    apiKey: "test-api-key",
    fetchImpl: async () => {
      calls += 1;
      return new Response(JSON.stringify({ error: { status: "RESOURCE_EXHAUSTED", message: "quota" } }), { status: 429 });
    },
  });
  assert.equal(result.status, "unavailable");
  assert.equal(result.diagnostic.code, "quota_exceeded");
  assert.equal(result.diagnostic.httpStatus, 429);
  assert.equal(result.diagnostic.retryable, false);
  assert.equal(calls, 1);
});

test("PageSpeed nie wykonuje anonimowego wywołania bez klucza", async () => {
  let calls = 0;
  const result = await fetchPageSpeed("https://example.com", {
    fetchImpl: async () => {
      calls += 1;
      throw new Error("fetch nie powinien zostać wywołany");
    },
  });
  assert.equal(result.status, "unavailable");
  assert.equal(result.diagnostic.code, "missing_api_key");
  assert.equal(result.diagnostic.attempts, 0);
  assert.equal(calls, 0);
});

test("PageSpeed ponawia wyłącznie przejściowy błąd i zapisuje liczbę prób", async () => {
  let calls = 0;
  const payload = {
    lighthouseResult: {
      categories: {
        performance: { score: 0.81 },
        accessibility: { score: 0.95 },
        seo: { score: 0.96 },
        "best-practices": { score: 0.9 },
      },
      audits: {
        "largest-contentful-paint": { numericValue: 1800 },
        "cumulative-layout-shift": { numericValue: 0.04 },
        "total-blocking-time": { numericValue: 120 },
        "speed-index": { numericValue: 2100 },
      },
    },
  };
  const result = await fetchPageSpeed("https://example.com", {
    apiKey: "test-api-key",
    retryDelayMs: 1,
    sleepImpl: async () => {},
    fetchImpl: async () => {
      calls += 1;
      return calls === 1
        ? new Response(JSON.stringify({ error: { status: "UNAVAILABLE" } }), { status: 503 })
        : new Response(JSON.stringify(payload), { status: 200 });
    },
  });
  assert.equal(result.status, "ok");
  assert.equal(result.performanceScore, 81);
  assert.equal(result.diagnostic.code, "ok");
  assert.equal(result.diagnostic.attempts, 2);
  assert.equal(calls, 2);
});

test("błąd resolvera nie udaje braku konfiguracji DNS", async () => {
  const resolverFailure = Object.assign(new Error("servfail"), { code: "ESERVFAIL" });
  const noData = Object.assign(new Error("no data"), { code: "ENODATA" });
  const resolver = {
    resolveSoa: async name => name === "example.com" ? { nsname: "ns1.example.net" } : Promise.reject(noData),
    resolve4: async () => [{ address: "93.184.216.34", ttl: 3600 }],
    resolve6: async () => Promise.reject(noData),
    resolveCname: async () => Promise.reject(noData),
    resolveNs: async () => Promise.reject(resolverFailure),
    resolveCaa: async () => Promise.reject(noData),
    resolveMx: async () => Promise.reject(noData),
    resolveTxt: async () => Promise.reject(noData),
  };
  const fetchImpl = async () => new Response(JSON.stringify({ Status: 0, AD: false, Answer: [] }), { status: 200 });
  const profile = await collectDnsProfile("example.com", { resolver, fetchImpl });
  assert.ok(profile.diagnostics.some(item => item.collector === "dns_nameservers" && item.code === "resolver_servfail"));
  assert.equal(profile.diagnostics.some(item => item.collector === "dns_caa"), false);
});

test("raport pokazuje awarię kolektora DNS jako unknown zamiast fałszywego fail", () => {
  const report = analyzeSnapshot({
    body: "<!doctype html><html lang=\"pl\"><head><title>Przykładowa strona firmy</title><meta name=\"viewport\" content=\"width=device-width\"></head><body><h1>Oferta</h1></body></html>",
    requestedOrigin: "https://example.com",
    url: "https://example.com/",
    status: 200,
    durationMs: 300,
    redirects: [],
    headers: {},
    tls: { validTo: "2030-01-01", protocol: "TLSv1.3" },
  }, {
    status: "ok",
    performanceScore: 90,
    accessibilityScore: 90,
    seoScore: 90,
    bestPracticesScore: 90,
    metrics: { lcpMs: 1200, cls: 0.02, tbtMs: 80 },
  }, {
    dns: {
      zone: "example.com",
      addresses: { ipv4: ["93.184.216.34"], ipv6: [], ttl: [3600] },
      nameservers: [],
      caa: [], mx: [], spf: [], dmarc: [],
      dnssec: { dsPresent: false, validatedAnswer: false },
    },
    resources: { robots: { available: false, status: 404 }, sitemaps: [], crawledPages: [], crawlLimit: 8 },
    diagnostics: [{ collector: "dns_nameservers", status: "unavailable", code: "resolver_servfail", retryable: true, attempts: 1, durationMs: 25, httpStatus: null }],
  }, { rulesetVersion: "2026.08.2", scannerVersion: "2.0.1" });
  const check = report.checks.find(item => item.id === "technical_nameservers");
  assert.equal(check.status, "unknown");
  assert.match(check.observation, /resolver_servfail/);
  assert.doesNotThrow(() => validateReport(report));
});
