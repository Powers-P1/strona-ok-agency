import { createServer } from "node:http";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { REPORT_SCHEMA_VERSION } from "../../../worker/site-audit-core.js";
import { analyzeSnapshot, fetchPageSpeed } from "./analyze.js";
import { ScanError, safeFetch } from "./safe-fetch.js";
import { collectTechnicalProfile } from "./technical-collectors.js";

const PORT = Number(process.env.PORT || 8080);
const MAX_BODY_BYTES = 131_072;
const nonceCache = new Map();

function logCollectorDiagnostics(jobId, diagnostics) {
  for (const diagnostic of diagnostics || []) {
    const payload = {
      event: "audit_collector_result",
      jobId,
      collector: diagnostic.collector,
      status: diagnostic.status,
      code: diagnostic.code,
      retryable: diagnostic.retryable,
      attempts: diagnostic.attempts,
      durationMs: diagnostic.durationMs,
      httpStatus: diagnostic.httpStatus,
    };
    const logger = diagnostic.status === "unavailable" ? console.error : console.log;
    logger(JSON.stringify(payload));
  }
}

function base64UrlDecode(value) {
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

function base64UrlEncode(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function hmac(secret, value) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function equalHex(left, right) {
  if (!/^[a-f\d]{64}$/i.test(left || "") || !/^[a-f\d]{64}$/i.test(right || "")) return false;
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new ScanError("payload_too_large", "Żądanie jest zbyt duże.");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new ScanError("invalid_json", "Nieprawidłowy JSON.");
  }
}

function consumeWorkerSignature(request, signedPayload) {
  const secret = process.env.WORKER_N8N_HMAC_SECRET;
  const timestamp = String(request.headers["x-ok-timestamp"] || "");
  const nonce = String(request.headers["x-ok-nonce"] || "");
  const signature = String(request.headers["x-ok-signature"] || "");
  if (!secret || !/^\d{10}$/.test(timestamp) || !/^[A-Za-z0-9_-]{16,128}$/.test(nonce)) {
    throw new ScanError("invalid_signature", "Nieprawidłowy podpis.");
  }
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp)) > 300) throw new ScanError("expired_signature", "Podpis wygasł.");
  const expected = hmac(secret, `${timestamp}.${nonce}.${signedPayload}`);
  if (!equalHex(expected, signature)) throw new ScanError("invalid_signature", "Nieprawidłowy podpis.");
  const expiresAt = Date.now() + 5 * 60 * 1000;
  for (const [storedNonce, expiry] of nonceCache) if (expiry < Date.now()) nonceCache.delete(storedNonce);
  if (nonceCache.has(nonce)) throw new ScanError("replayed_request", "Podpis został już wykorzystany.");
  nonceCache.set(nonce, expiresAt);
}

function decodeTask(signedPayload) {
  if (typeof signedPayload !== "string" || !/^[A-Za-z0-9_-]{40,4096}$/.test(signedPayload)) {
    throw new ScanError("invalid_task", "Nieprawidłowe zadanie.");
  }
  let task;
  try {
    task = JSON.parse(base64UrlDecode(signedPayload));
  } catch {
    throw new ScanError("invalid_task", "Nieprawidłowe zadanie.");
  }
  if (!/^[0-9a-f-]{36}$/.test(task.jobId || "") || typeof task.origin !== "string" || typeof task.callbackUrl !== "string" ||
      typeof task.rulesetVersion !== "string" || task.rulesetVersion.length > 80 ||
      typeof task.scannerVersion !== "string" || task.scannerVersion.length > 40) {
    throw new ScanError("invalid_task", "Nieprawidłowe zadanie.");
  }
  const callback = new URL(task.callbackUrl);
  const allowedHosts = new Set(String(process.env.CALLBACK_HOSTNAMES || "okagency.pl,www.okagency.pl").split(",").map(value => value.trim()).filter(Boolean));
  if (callback.protocol !== "https:" || !allowedHosts.has(callback.hostname) || callback.pathname !== `/api/site-audits/${task.jobId}/callback`) {
    throw new ScanError("invalid_callback", "Niedozwolony adres callback.");
  }
  return task;
}

function createCompletionToken(task) {
  const payload = base64UrlEncode(JSON.stringify({
    jobId: task.jobId,
    callbackUrl: task.callbackUrl,
    expiresAt: Date.now() + 30 * 60 * 1000,
  }));
  return `${payload}.${hmac(process.env.RUNNER_SESSION_SECRET, payload)}`;
}

function verifyCompletionToken(token) {
  const [payload, signature, extra] = String(token || "").split(".");
  if (!payload || !signature || extra || !process.env.RUNNER_SESSION_SECRET || !equalHex(hmac(process.env.RUNNER_SESSION_SECRET, payload), signature)) {
    throw new ScanError("invalid_completion_token", "Nieprawidłowy token zakończenia.");
  }
  let data;
  try {
    data = JSON.parse(base64UrlDecode(payload));
  } catch {
    throw new ScanError("invalid_completion_token", "Nieprawidłowy token zakończenia.");
  }
  if (data.expiresAt < Date.now()) throw new ScanError("expired_completion_token", "Token zakończenia wygasł.");
  return data;
}

async function postCallback(callbackUrl, body) {
  const raw = JSON.stringify(body);
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = randomBytes(18).toString("base64url");
  const signature = hmac(process.env.N8N_CALLBACK_HMAC_SECRET, `${timestamp}.${nonce}.${raw}`);
  const response = await fetch(callbackUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-ok-timestamp": timestamp,
      "x-ok-nonce": nonce,
      "x-ok-signature": signature,
    },
    body: raw,
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new ScanError("callback_failed", `Callback zwrócił ${response.status}.`, true);
}

async function handleScan(request, response, body) {
  consumeWorkerSignature(request, body.signedPayload);
  const task = decodeTask(body.signedPayload);
  try {
    let page;
    try {
      page = await safeFetch(task.origin, { accept: "text/html,application/xhtml+xml;q=0.9" });
    } catch (error) {
      if (!error?.retryable) throw error;
      page = await safeFetch(task.origin, { accept: "text/html,application/xhtml+xml;q=0.9" });
    }
    const contentType = String(page.headers["content-type"] || "").toLowerCase();
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      throw new ScanError("unsupported_content", "Strona główna nie zwróciła dokumentu HTML.");
    }
    if (page.status < 200 || page.status >= 400) throw new ScanError("http_error", `Strona zwróciła status ${page.status}.`, page.status >= 500);
    const snapshot = { ...page, requestedOrigin: task.origin };
    const [pagespeed, technicalProfile] = await Promise.all([
      fetchPageSpeed(task.origin, {
        apiKey: process.env.PAGESPEED_API_KEY || "",
        enabled: process.env.PAGESPEED_ENABLED !== "false",
      }),
      collectTechnicalProfile(snapshot),
    ]);
    logCollectorDiagnostics(task.jobId, [
      ...(pagespeed?.diagnostic ? [pagespeed.diagnostic] : []),
      ...(technicalProfile.diagnostics || []),
    ]);
    const report = analyzeSnapshot(snapshot, pagespeed, technicalProfile, {
      rulesetVersion: task.rulesetVersion,
      scannerVersion: task.scannerVersion,
    });
    console.log(JSON.stringify({
      event: "audit_scan_completed",
      jobId: task.jobId,
      status: report.partial ? "partial" : "completed",
      overallScore: report.overallScore,
      diagnosticCount: report.diagnostics.length,
    }));
    sendJson(response, 200, {
      jobId: task.jobId,
      completionToken: createCompletionToken(task),
      report,
    });
  } catch (error) {
    const failureCode = error instanceof ScanError ? error.code : "audit_failed";
    try {
      await postCallback(task.callbackUrl, { jobId: task.jobId, status: "failed", failureCode });
    } catch (callbackError) {
      console.error(JSON.stringify({ event: "audit_failure_callback_failed", jobId: task.jobId, message: callbackError?.message || "unknown" }));
    }
    throw error;
  }
}

async function handleFinalize(response, body) {
  const completion = verifyCompletionToken(body.completionToken);
  if (body.jobId !== completion.jobId || !body.report || body.report.schemaVersion !== REPORT_SCHEMA_VERSION) {
    throw new ScanError("invalid_report", "Nieprawidłowy raport.");
  }
  const status = body.report.partial ? "partial" : "completed";
  await postCallback(completion.callbackUrl, { jobId: completion.jobId, status, report: body.report });
  console.log(JSON.stringify({ event: "audit_callback_completed", jobId: completion.jobId, status }));
  sendJson(response, 200, { accepted: true, jobId: completion.jobId, status });
}

async function handleFailure(response, body) {
  const completion = verifyCompletionToken(body.completionToken);
  const failureCode = /^[a-z0-9_]{3,64}$/.test(body.failureCode || "") ? body.failureCode : "audit_failed";
  await postCallback(completion.callbackUrl, { jobId: completion.jobId, status: "failed", failureCode });
  sendJson(response, 200, { accepted: true, jobId: completion.jobId, status: "failed" });
}

export function createAuditServer() {
  return createServer(async (request, response) => {
    try {
      if (request.method === "GET" && request.url === "/health") return sendJson(response, 200, { status: "ok", version: "2.0.3" });
      if (request.method !== "POST") return sendJson(response, 405, { error: { code: "method_not_allowed" } });
      const body = await readJson(request);
      if (request.url === "/scan") return await handleScan(request, response, body);
      if (request.url === "/finalize") return await handleFinalize(response, body);
      if (request.url === "/fail") return await handleFailure(response, body);
      return sendJson(response, 404, { error: { code: "not_found" } });
    } catch (error) {
      const code = error instanceof ScanError ? error.code : "internal_error";
      const status = new Set(["invalid_signature", "expired_signature", "replayed_request", "invalid_completion_token", "expired_completion_token"]).has(code) ? 401
        : code === "payload_too_large" ? 413
          : code === "internal_error" ? 500 : 400;
      console.error(JSON.stringify({ event: "audit_runner_error", code, retryable: Boolean(error?.retryable), message: error?.message || "unknown" }));
      return sendJson(response, status, { error: { code, retryable: Boolean(error?.retryable) } });
    }
  });
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}`) {
  for (const key of ["WORKER_N8N_HMAC_SECRET", "N8N_CALLBACK_HMAC_SECRET", "RUNNER_SESSION_SECRET"]) {
    if (!process.env[key] || process.env[key].length < 32) throw new Error(`Missing or weak ${key}`);
  }
  createAuditServer().listen(PORT, "0.0.0.0", () => {
    console.log(JSON.stringify({ event: "audit_runner_started", port: PORT }));
  });
}
