export const AUDIT_ACTION = "site_audit";
export const NOTICE_VERSION = "site-audit-v2-2026-08-05";
export const REPORT_SCHEMA_VERSION = "2.0";
export const REPORT_CATEGORY_KEYS = Object.freeze([
  "performance",
  "seo",
  "accessibility",
  "technical",
  "security",
  "conversion",
  "trust",
]);
export const REPORT_CHECK_STATUSES = Object.freeze(["pass", "warning", "fail", "unknown", "not_applicable"]);
export const MAX_REQUEST_BYTES = 8_192;
export const MAX_CALLBACK_BYTES = 131_072;
export const MAX_REPORT_BYTES = 102_400;
export const SIGNATURE_TOLERANCE_SECONDS = 300;

const RESERVED_SUFFIXES = [
  ".internal",
  ".invalid",
  ".lan",
  ".local",
  ".localhost",
  ".onion",
  ".test",
];

const encoder = new TextEncoder();

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function jsonResponse(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extraHeaders,
    },
  });
}

export function apiErrorResponse(error) {
  if (error instanceof ApiError) {
    return jsonResponse(error.status, { error: { code: error.code, message: error.message } });
  }
  console.error(JSON.stringify({ event: "site_audit_api_error", message: error?.message || "unknown" }));
  return jsonResponse(500, {
    error: { code: "internal_error", message: "Nie udało się obsłużyć żądania." },
  });
}

export async function readJson(request, maxBytes = MAX_REQUEST_BYTES) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().startsWith("application/json")) {
    throw new ApiError(415, "unsupported_media_type", "Wymagany jest format JSON.");
  }
  const declaredLength = Number(request.headers.get("content-length") || 0);
  if (declaredLength > maxBytes) {
    throw new ApiError(413, "payload_too_large", "Żądanie jest zbyt duże.");
  }
  const raw = await request.text();
  if (encoder.encode(raw).byteLength > maxBytes) {
    throw new ApiError(413, "payload_too_large", "Żądanie jest zbyt duże.");
  }
  try {
    return { raw, value: JSON.parse(raw) };
  } catch {
    throw new ApiError(400, "invalid_json", "Nieprawidłowy format JSON.");
  }
}

function stripIpv6Brackets(hostname) {
  return hostname.startsWith("[") && hostname.endsWith("]")
    ? hostname.slice(1, -1)
    : hostname;
}

export function isIpv4(value) {
  const parts = value.split(".");
  return parts.length === 4 && parts.every(part => /^\d{1,3}$/.test(part) && Number(part) <= 255);
}

export function isPublicIpv4(value) {
  if (!isIpv4(value)) return false;
  const [a, b, c] = value.split(".").map(Number);
  if (a === 0 || a === 10 || a === 127) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 0 && c === 0) return false;
  if (a === 192 && b === 0 && c === 2) return false;
  if (a === 192 && b === 168) return false;
  if (a === 198 && (b === 18 || b === 19)) return false;
  if (a === 198 && b === 51 && c === 100) return false;
  if (a === 203 && b === 0 && c === 113) return false;
  if (a >= 224) return false;
  return true;
}

function parseIpv6Hextets(input) {
  const value = stripIpv6Brackets(input).toLowerCase().split("%")[0];
  if (!value.includes(":")) return null;
  const halves = value.split("::");
  if (halves.length > 2) return null;
  const expandSide = side => {
    if (!side) return [];
    const parts = side.split(":");
    const result = [];
    for (const part of parts) {
      if (isIpv4(part)) {
        const octets = part.split(".").map(Number);
        result.push((octets[0] << 8) | octets[1], (octets[2] << 8) | octets[3]);
      } else if (/^[0-9a-f]{1,4}$/.test(part)) {
        result.push(Number.parseInt(part, 16));
      } else {
        return null;
      }
    }
    return result;
  };
  const left = expandSide(halves[0]);
  const right = expandSide(halves[1] || "");
  if (!left || !right) return null;
  if (halves.length === 1 && left.length !== 8) return null;
  const zeros = halves.length === 2 ? 8 - left.length - right.length : 0;
  if (zeros < 1 && halves.length === 2) return null;
  const hextets = [...left, ...Array(zeros).fill(0), ...right];
  return hextets.length === 8 ? hextets : null;
}

export function isIpv6(value) {
  return parseIpv6Hextets(value) !== null;
}

export function isPublicIpv6(value) {
  const parts = parseIpv6Hextets(value);
  if (!parts) return false;
  if (parts.every(part => part === 0)) return false;
  if (parts.slice(0, 7).every(part => part === 0) && parts[7] === 1) return false;
  if ((parts[0] & 0xfe00) === 0xfc00) return false;
  if ((parts[0] & 0xffc0) === 0xfe80) return false;
  if ((parts[0] & 0xff00) === 0xff00) return false;
  if (parts[0] === 0x2001 && parts[1] === 0x0db8) return false;
  const mapped = parts.slice(0, 5).every(part => part === 0) && parts[5] === 0xffff;
  if (mapped) {
    const ipv4 = `${parts[6] >> 8}.${parts[6] & 255}.${parts[7] >> 8}.${parts[7] & 255}`;
    return isPublicIpv4(ipv4);
  }
  return true;
}

export function isPublicIp(value) {
  return isIpv4(value) ? isPublicIpv4(value) : isPublicIpv6(value);
}

export function normalizeOrigin(input) {
  if (typeof input !== "string" || input.trim().length === 0 || input.length > 512) {
    throw new ApiError(400, "invalid_domain", "Podaj prawidłową domenę.");
  }
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(input.trim())
    ? input.trim()
    : `https://${input.trim()}`;
  let url;
  try {
    url = new URL(candidate);
  } catch {
    throw new ApiError(400, "invalid_domain", "Podaj prawidłową domenę.");
  }
  if (!new Set(["http:", "https:"]).has(url.protocol) || url.username || url.password) {
    throw new ApiError(400, "invalid_domain", "Dozwolone są wyłącznie publiczne adresy HTTP i HTTPS.");
  }
  if ((url.protocol === "http:" && url.port && url.port !== "80") ||
      (url.protocol === "https:" && url.port && url.port !== "443")) {
    throw new ApiError(400, "invalid_port", "Dozwolone są wyłącznie porty 80 i 443.");
  }
  const hostname = stripIpv6Brackets(url.hostname).toLowerCase().replace(/\.$/, "");
  if (!hostname || hostname === "localhost" || isIpv4(hostname) || isIpv6(hostname)) {
    throw new ApiError(400, "invalid_domain", "Adres IP i domeny lokalne nie mogą być audytowane.");
  }
  if (RESERVED_SUFFIXES.some(suffix => hostname.endsWith(suffix))) {
    throw new ApiError(400, "invalid_domain", "Domena lokalna lub zastrzeżona nie może być audytowana.");
  }
  if (hostname.length > 253 || !hostname.includes(".")) {
    throw new ApiError(400, "invalid_domain", "Podaj pełną publiczną domenę.");
  }
  const labels = hostname.split(".");
  if (labels.some(label => label.length === 0 || label.length > 63 || !/^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i.test(label))) {
    throw new ApiError(400, "invalid_domain", "Podaj prawidłową domenę.");
  }
  const protocol = url.protocol;
  const defaultPort = (protocol === "https:" && (!url.port || url.port === "443")) ||
    (protocol === "http:" && (!url.port || url.port === "80"));
  const port = defaultPort ? "" : `:${url.port}`;
  return { origin: `${protocol}//${hostname}${port}`, hostname, protocol };
}

export async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function hmacHex(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return [...new Uint8Array(signature)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export function constantTimeEqualHex(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  const leftBytes = encoder.encode(left.toLowerCase());
  const rightBytes = encoder.encode(right.toLowerCase());
  let mismatch = leftBytes.length ^ rightBytes.length;
  const length = Math.max(leftBytes.length, rightBytes.length);
  for (let index = 0; index < length; index += 1) {
    mismatch |= (leftBytes[index] || 0) ^ (rightBytes[index] || 0);
  }
  return mismatch === 0;
}

export function randomToken(bytes = 32) {
  const buffer = new Uint8Array(bytes);
  crypto.getRandomValues(buffer);
  let binary = "";
  for (const byte of buffer) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function encodeBase64Url(value) {
  const bytes = encoder.encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function allowedHostnames(config) {
  return new Set(String(config || "").split(",").map(value => value.trim().toLowerCase()).filter(Boolean));
}

export function requireSameOrigin(request, hostnameConfig) {
  const origin = request.headers.get("origin");
  if (!origin) throw new ApiError(403, "forbidden_origin", "Nie można potwierdzić pochodzenia żądania.");
  let hostname;
  try {
    hostname = new URL(origin).hostname.toLowerCase();
  } catch {
    throw new ApiError(403, "forbidden_origin", "Nie można potwierdzić pochodzenia żądania.");
  }
  if (!allowedHostnames(hostnameConfig).has(hostname)) {
    throw new ApiError(403, "forbidden_origin", "Ta domena nie może uruchomić audytu.");
  }
}

export async function resolvePublicAddresses(hostname, fetchImpl = fetch) {
  const query = async type => {
    const endpoint = new URL("https://cloudflare-dns.com/dns-query");
    endpoint.searchParams.set("name", hostname);
    endpoint.searchParams.set("type", type);
    const response = await fetchImpl(endpoint, {
      headers: { accept: "application/dns-json" },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new ApiError(422, "dns_unavailable", "Nie udało się sprawdzić DNS domeny.");
    const data = await response.json();
    if (![0, 3].includes(data.Status)) throw new ApiError(422, "dns_unavailable", "Nie udało się sprawdzić DNS domeny.");
    const expectedType = type === "A" ? 1 : 28;
    return (data.Answer || []).filter(answer => answer.type === expectedType).map(answer => String(answer.data));
  };
  let addresses;
  try {
    addresses = (await Promise.all([query("A"), query("AAAA")])).flat();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(422, "dns_unavailable", "Nie udało się sprawdzić DNS domeny.");
  }
  if (addresses.length === 0) {
    throw new ApiError(422, "dns_not_found", "Domena nie wskazuje na publiczny serwer WWW.");
  }
  if (addresses.some(address => !isPublicIp(address))) {
    throw new ApiError(400, "private_target", "Domena wskazuje na niedozwolony adres sieciowy.");
  }
  return [...new Set(addresses)];
}

export async function verifyTurnstile({ token, secret, remoteIp, hostnameConfig, fetchImpl = fetch }) {
  if (typeof token !== "string" || token.length === 0 || token.length > 2048 || !secret) {
    throw new ApiError(403, "turnstile_failed", "Potwierdź, że nie jesteś automatem.");
  }
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  let result;
  try {
    const response = await fetchImpl("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`siteverify_${response.status}`);
    result = await response.json();
  } catch {
    throw new ApiError(403, "turnstile_failed", "Nie udało się potwierdzić zabezpieczenia. Spróbuj ponownie.");
  }
  if (!result.success || result.action !== AUDIT_ACTION || !allowedHostnames(hostnameConfig).has(String(result.hostname || "").toLowerCase())) {
    throw new ApiError(403, "turnstile_failed", "Nie udało się potwierdzić zabezpieczenia. Spróbuj ponownie.");
  }
  return true;
}

export function validateConsent(payload) {
  if (payload?.consent?.accepted !== true || payload?.consent?.noticeVersion !== NOTICE_VERSION) {
    throw new ApiError(400, "consent_required", "Potwierdź upoważnienie do zlecenia pasywnego audytu.");
  }
}

export function parseBearerToken(request) {
  const header = request.headers.get("authorization") || "";
  const match = /^Bearer\s+([A-Za-z0-9_-]{40,128})$/i.exec(header);
  if (!match) throw new ApiError(401, "invalid_token", "Brak prawidłowego tokenu raportu.");
  return match[1];
}

export async function verifySignedRequest({ timestamp, nonce, signature, rawBody, secret, now = Date.now() }) {
  if (!/^\d{10}$/.test(String(timestamp || "")) || !/^[A-Za-z0-9_-]{16,128}$/.test(String(nonce || "")) ||
      !/^[a-f\d]{64}$/i.test(String(signature || "")) || !secret) {
    throw new ApiError(401, "invalid_signature", "Nieprawidłowy podpis żądania.");
  }
  const drift = Math.abs(Math.floor(now / 1000) - Number(timestamp));
  if (drift > SIGNATURE_TOLERANCE_SECONDS) {
    throw new ApiError(401, "expired_signature", "Podpis żądania wygasł.");
  }
  const expected = await hmacHex(secret, `${timestamp}.${nonce}.${rawBody}`);
  if (!constantTimeEqualHex(expected, signature)) {
    throw new ApiError(401, "invalid_signature", "Nieprawidłowy podpis żądania.");
  }
}

export function validateReport(report) {
  if (!report || typeof report !== "object" || Array.isArray(report)) {
    throw new ApiError(400, "invalid_report", "Raport ma nieprawidłowy format.");
  }
  const encoded = JSON.stringify(report);
  if (encoder.encode(encoded).byteLength > MAX_REPORT_BYTES) {
    throw new ApiError(413, "report_too_large", "Raport przekracza dozwolony rozmiar.");
  }
  if (report.schemaVersion !== REPORT_SCHEMA_VERSION || typeof report.summary !== "string" || report.summary.length > 1000) {
    throw new ApiError(400, "invalid_report", "Raport ma nieprawidłowy format.");
  }
  if (!Number.isInteger(report.overallScore) || report.overallScore < 0 || report.overallScore > 100) {
    throw new ApiError(400, "invalid_report", "Raport zawiera nieprawidłowy wynik.");
  }
  if (!new Set(["high", "medium", "low"]).has(report.confidence)) {
    throw new ApiError(400, "invalid_report", "Raport zawiera nieprawidłowy poziom pewności.");
  }
  if (!Number.isInteger(report.coverage) || report.coverage < 0 || report.coverage > 100 || typeof report.partial !== "boolean") {
    throw new ApiError(400, "invalid_report", "Raport zawiera nieprawidłowe pokrycie pomiaru.");
  }
  if (typeof report.rulesetVersion !== "string" || report.rulesetVersion.length > 80 ||
      typeof report.scannerVersion !== "string" || report.scannerVersion.length > 40 ||
      typeof report.generatedAt !== "string" || !Number.isFinite(Date.parse(report.generatedAt))) {
    throw new ApiError(400, "invalid_report", "Raport zawiera nieprawidłowe metadane.");
  }
  const allowedStatuses = new Set(REPORT_CHECK_STATUSES);
  if (!report.categories || Object.keys(report.categories).length !== REPORT_CATEGORY_KEYS.length ||
      Object.keys(report.categories).some(key => !REPORT_CATEGORY_KEYS.includes(key))) {
    throw new ApiError(400, "invalid_report", "Raport zawiera nieprawidłowy zestaw kategorii.");
  }
  for (const key of REPORT_CATEGORY_KEYS) {
    const category = report.categories?.[key];
    const score = category?.score;
    if ((!Number.isInteger(score) && score !== null) || (Number.isInteger(score) && (score < 0 || score > 100))) {
      throw new ApiError(400, "invalid_report", "Raport zawiera nieprawidłowy wynik.");
    }
    if (!allowedStatuses.has(category?.status) || !Number.isInteger(category?.checked) || !Number.isInteger(category?.total) ||
        category.checked < 0 || category.total < 0 || category.checked > category.total) {
      throw new ApiError(400, "invalid_report", "Raport zawiera nieprawidłową kategorię.");
    }
  }
  if (!Array.isArray(report.checks) || report.checks.length === 0 || report.checks.length > 120) {
    throw new ApiError(400, "invalid_report", "Raport zawiera nieprawidłową listę kontroli.");
  }
  const ids = new Set();
  const allowedSeverities = new Set(["high", "medium", "low", "info"]);
  for (const check of report.checks) {
    if (!check || typeof check !== "object" || !/^[a-z0-9_]{3,80}$/.test(check.id || "") || ids.has(check.id)) {
      throw new ApiError(400, "invalid_report", "Raport zawiera nieprawidłową kontrolę.");
    }
    ids.add(check.id);
    if (!REPORT_CATEGORY_KEYS.includes(check.category) || !allowedStatuses.has(check.status) || !allowedSeverities.has(check.severity)) {
      throw new ApiError(400, "invalid_report", "Raport zawiera nieprawidłową kontrolę.");
    }
    if (!Number.isFinite(check.weight) || check.weight <= 0 || check.weight > 10) {
      throw new ApiError(400, "invalid_report", "Raport zawiera nieprawidłową wagę kontroli.");
    }
    for (const [field, maxLength] of [["title", 180], ["observation", 1200], ["recommendation", 1200], ["source", 160]]) {
      if (typeof check[field] !== "string" || check[field].length > maxLength) {
        throw new ApiError(400, "invalid_report", "Raport zawiera zbyt długą kontrolę.");
      }
    }
  }
  if (!Array.isArray(report.priorities) || report.priorities.length > 5 || report.priorities.some(item => {
    const source = report.checks.find(check => check.id === item?.id);
    return !source || item.title !== source.title || item.observation !== source.observation ||
      item.recommendation !== source.recommendation || item.status !== source.status || item.category !== source.category;
  })) {
    throw new ApiError(400, "invalid_report", "Raport zawiera nieprawidłowe priorytety.");
  }
  if (!Array.isArray(report.strengths) || report.strengths.length > 8 || report.strengths.some(value => typeof value !== "string" || value.length > 300)) {
    throw new ApiError(400, "invalid_report", "Raport zawiera nieprawidłowe mocne strony.");
  }
  if (!Array.isArray(report.limitations) || report.limitations.length > 12 || report.limitations.some(value => typeof value !== "string" || value.length > 500)) {
    throw new ApiError(400, "invalid_report", "Raport zawiera nieprawidłowe ograniczenia.");
  }
  return encoded;
}
