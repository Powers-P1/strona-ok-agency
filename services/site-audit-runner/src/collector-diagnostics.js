const CODE_PATTERN = /^[a-z0-9_]{2,64}$/;
const COLLECTOR_PATTERN = /^[a-z0-9_]{2,64}$/;

const TRANSIENT_CODES = new Set([
  "dns_timeout",
  "fetch_failed",
  "fetch_timeout",
  "network_error",
  "resolver_refused",
  "resolver_servfail",
  "resolver_timeout",
  "upstream_unavailable",
]);

export class CollectorError extends Error {
  constructor(code, { retryable = false, httpStatus = null } = {}) {
    super(code);
    this.name = "CollectorError";
    this.code = normalizeDiagnosticCode(code);
    this.retryable = Boolean(retryable);
    this.httpStatus = Number.isInteger(httpStatus) ? httpStatus : null;
  }
}

export function normalizeDiagnosticCode(value, fallback = "collector_failed") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
  return CODE_PATTERN.test(normalized) ? normalized : fallback;
}

export function codeFromError(error, fallback = "collector_failed") {
  if (error?.name === "AbortError" || error?.name === "TimeoutError") return "fetch_timeout";
  if (error instanceof TypeError && !error?.code) return "network_error";
  const raw = normalizeDiagnosticCode(error?.code || error?.name, fallback);
  const aliases = {
    eai_again: "dns_timeout",
    econnrefused: "network_error",
    econnreset: "network_error",
    enetunreach: "network_error",
    eservfail: "resolver_servfail",
    erefused: "resolver_refused",
    etimeout: "resolver_timeout",
  };
  return aliases[raw] || raw;
}

export function isRetryableDiagnostic(code) {
  return TRANSIENT_CODES.has(normalizeDiagnosticCode(code));
}

export function makeDiagnostic({
  collector,
  status = "unavailable",
  code,
  retryable,
  attempts = 1,
  durationMs = 0,
  httpStatus = null,
}) {
  const normalizedCollector = normalizeDiagnosticCode(collector, "collector");
  const normalizedCode = normalizeDiagnosticCode(code, "collector_failed");
  return {
    collector: COLLECTOR_PATTERN.test(normalizedCollector) ? normalizedCollector : "collector",
    status: new Set(["ok", "partial", "unavailable", "disabled"]).has(status) ? status : "unavailable",
    code: normalizedCode,
    retryable: typeof retryable === "boolean" ? retryable : isRetryableDiagnostic(normalizedCode),
    attempts: Math.max(0, Math.min(3, Math.round(Number(attempts) || 0))),
    durationMs: Math.max(0, Math.min(180_000, Math.round(Number(durationMs) || 0))),
    httpStatus: Number.isInteger(httpStatus) && httpStatus >= 100 && httpStatus <= 599 ? httpStatus : null,
  };
}

export function dedupeDiagnostics(values, limit = 40) {
  const seen = new Set();
  const result = [];
  for (const value of values || []) {
    const normalized = makeDiagnostic(value || {});
    const key = `${normalized.collector}:${normalized.status}:${normalized.code}:${normalized.httpStatus || 0}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
    if (result.length >= limit) break;
  }
  return result;
}
