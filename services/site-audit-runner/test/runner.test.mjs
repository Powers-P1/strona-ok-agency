import assert from "node:assert/strict";
import test from "node:test";
import { analyzeSnapshot, fetchPageSpeed } from "../src/analyze.js";
import { ScanError, resolveAndVet, validateTargetUrl } from "../src/safe-fetch.js";

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

test("analiza HTML zwraca pięć kategorii i konkretne priorytety", () => {
  const html = `<!doctype html><html lang="pl"><head>
    <title>Przykładowa firma — skuteczna usługa dla biznesu</title>
    <meta name="description" content="Pomagamy firmom uporządkować sprzedaż i marketing dzięki konkretnej usłudze dopasowanej do potrzeb zespołu i klientów.">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="canonical" href="https://example.com">
    <script type="application/ld+json">{"@type":"Organization"}</script>
  </head><body><h1>Usługa dla Twojej firmy</h1><p>${"Oferta i korzyści dla klientów. ".repeat(30)}</p>
    <a href="/kontakt">Umów kontakt</a><form><label>E-mail<input type="email"></label></form>
    <img src="x.jpg" alt="Zespół firmy"><p>Portfolio, realizacje i doświadczenie klientów.</p>
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
    },
    tls: { validTo: "2030-01-01", protocol: "TLSv1.3" },
  }, { performanceScore: 91, accessibilityScore: 95, metrics: { lcpMs: 1200 } });
  assert.equal(report.schemaVersion, "1.0");
  assert.deepEqual(Object.keys(report.categories), ["performance", "seo", "accessibility", "conversion", "trust"]);
  assert.ok(report.overallScore >= 80);
  assert.equal(report.partial, false);
  assert.ok(report.strengths.length >= 3);
});

test("PageSpeed degraduje się bezpiecznie po błędzie API", async () => {
  const result = await fetchPageSpeed("https://example.com", {
    fetchImpl: async () => new Response("quota", { status: 429 }),
  });
  assert.equal(result, null);
});
