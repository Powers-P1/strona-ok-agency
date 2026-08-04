import assert from "node:assert/strict";
import test from "node:test";
import { handleRequest } from "./site-audit.js";
import {
  ApiError,
  NOTICE_VERSION,
  constantTimeEqualHex,
  hmacHex,
  isPublicIp,
  normalizeOrigin,
  resolvePublicAddresses,
  validateConsent,
  validateReport,
  verifySignedRequest,
  verifyTurnstile,
} from "./site-audit-core.js";

test("normalizeOrigin przyjmuje domenę i usuwa ścieżkę", () => {
  assert.deepEqual(normalizeOrigin("HTTPS://WWW.Example.com/oferta?q=1"), {
    origin: "https://www.example.com",
    hostname: "www.example.com",
    protocol: "https:",
  });
});

for (const input of [
  "localhost",
  "http://127.0.0.1",
  "http://[::1]",
  "http://example.com:8080",
  "http://service.internal",
  "file:///etc/passwd",
  "https://user:pass@example.com",
]) {
  test(`normalizeOrigin blokuje ${input}`, () => {
    assert.throws(() => normalizeOrigin(input), ApiError);
  });
}

test("klasyfikacja IP blokuje zakresy prywatne, metadata i dokumentacyjne", () => {
  for (const ip of ["10.0.0.1", "127.0.0.1", "169.254.169.254", "172.16.0.1", "192.168.1.1", "100.64.0.1", "::1", "fc00::1", "fe80::1", "2001:db8::1", "::ffff:127.0.0.1"]) {
    assert.equal(isPublicIp(ip), false, ip);
  }
  for (const ip of ["1.1.1.1", "8.8.8.8", "2606:4700:4700::1111"]) {
    assert.equal(isPublicIp(ip), true, ip);
  }
});

test("DNS odrzuca domenę wskazującą choćby jeden prywatny adres", async () => {
  const fetchImpl = async url => {
    const type = new URL(url).searchParams.get("type");
    return new Response(JSON.stringify({
      Status: 0,
      Answer: type === "A" ? [{ type: 1, data: "93.184.216.34" }, { type: 1, data: "127.0.0.1" }] : [],
    }), { status: 200 });
  };
  await assert.rejects(() => resolvePublicAddresses("example.com", fetchImpl), error => error.code === "private_target");
});

test("Turnstile wymaga success, właściwej akcji i hosta", async () => {
  const fetchImpl = async () => new Response(JSON.stringify({
    success: true,
    action: "site_audit",
    hostname: "okagency.pl",
  }), { status: 200 });
  await verifyTurnstile({
    token: "token",
    secret: "secret",
    remoteIp: "203.0.113.1",
    hostnameConfig: "okagency.pl,www.okagency.pl",
    fetchImpl,
  });
});

test("zgoda wymaga dokładnej wersji klauzuli", () => {
  assert.doesNotThrow(() => validateConsent({ consent: { accepted: true, noticeVersion: NOTICE_VERSION } }));
  assert.throws(() => validateConsent({ consent: { accepted: true, noticeVersion: "old" } }), ApiError);
});

test("podpis HMAC ma tolerancję czasu i porównanie stałoczasowe", async () => {
  const now = 1_800_000_000_000;
  const timestamp = String(Math.floor(now / 1000));
  const nonce = "nonce_abcdefghijklmnop";
  const rawBody = '{"jobId":"abc"}';
  const signature = await hmacHex("top-secret", `${timestamp}.${nonce}.${rawBody}`);
  assert.equal(constantTimeEqualHex(signature, signature), true);
  await verifySignedRequest({ timestamp, nonce, signature, rawBody, secret: "top-secret", now });
  await assert.rejects(
    () => verifySignedRequest({ timestamp, nonce, signature: `${signature.slice(0, -1)}0`, rawBody, secret: "top-secret", now }),
    error => error.code === "invalid_signature",
  );
});

test("raport ma ścisły schemat wyników", () => {
  const report = {
    schemaVersion: "1.0",
    summary: "Test",
    categories: Object.fromEntries(["performance", "seo", "accessibility", "conversion", "trust"].map(key => [key, { score: 80 }])),
  };
  assert.equal(validateReport(report), JSON.stringify(report));
  report.categories.seo.score = 101;
  assert.throws(() => validateReport(report), ApiError);
});

test("host workers.dev udostępnia wyłącznie podpisany callback", async () => {
  const env = {
    CALLBACK_HOSTNAME: "okagency-site-audit-api.example.workers.dev",
    N8N_CALLBACK_HMAC_SECRET: "callback-secret",
  };
  const intake = await handleRequest(new Request(
    "https://okagency-site-audit-api.example.workers.dev/api/site-audits",
    { method: "POST", headers: { "content-type": "application/json" }, body: "{}" },
  ), env);
  assert.equal(intake.status, 404);

  const callback = await handleRequest(new Request(
    "https://okagency-site-audit-api.example.workers.dev/api/site-audits/00000000-0000-4000-8000-000000000000/callback",
    { method: "POST", headers: { "content-type": "application/json" }, body: "{}" },
  ), env);
  assert.equal(callback.status, 401);
});
