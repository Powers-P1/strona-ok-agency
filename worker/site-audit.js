import {
  ApiError,
  MAX_CALLBACK_BYTES,
  NOTICE_VERSION,
  apiErrorResponse,
  encodeBase64Url,
  hmacHex,
  jsonResponse,
  normalizeOrigin,
  parseBearerToken,
  randomToken,
  readJson,
  requireSameOrigin,
  resolvePublicAddresses,
  sha256Hex,
  validateConsent,
  validateReport,
  verifySignedRequest,
  verifyTurnstile,
} from "./site-audit-core.js";

const TERMINAL_STATUSES = new Set(["completed", "partial", "failed"]);

function isoAfter(milliseconds) {
  return new Date(Date.now() + milliseconds).toISOString();
}

function publicJob(row) {
  const response = {
    jobId: row.id,
    origin: row.origin,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at,
    progress: row.status === "queued" ? 10 : row.status === "running" ? 55 : 100,
  };
  if (row.status === "completed" || row.status === "partial") {
    response.report = JSON.parse(row.report_json);
  }
  if (row.status === "failed") {
    response.failure = {
      code: row.failure_code || "audit_failed",
      message: "Nie udało się ukończyć audytu. Spróbuj ponownie później.",
    };
  }
  return response;
}

async function createAccessToken(env, jobId, expiresAt) {
  const pollToken = randomToken();
  const tokenHash = await sha256Hex(pollToken);
  await env.DB.prepare(
    "INSERT INTO job_access_tokens (job_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)",
  ).bind(jobId, tokenHash, expiresAt, new Date().toISOString()).run();
  return pollToken;
}

function rateLimitError(error) {
  const message = String(error?.message || error);
  if (message.includes("audit_global_daily_limit")) {
    return new ApiError(429, "daily_limit_reached", "Dzisiejszy limit audytów został wykorzystany. Wróć jutro.");
  }
  if (message.includes("audit_domain_daily_limit")) {
    return new ApiError(429, "domain_limit_reached", "Ta domena wykorzystała dziś limit trzech nowych audytów.");
  }
  return null;
}

async function startAudit(request, env) {
  requireSameOrigin(request, env.TURNSTILE_HOSTNAMES);
  const { value: payload } = await readJson(request);
  validateConsent(payload);
  const normalized = normalizeOrigin(payload.domain);

  await verifyTurnstile({
    token: payload.turnstileToken,
    secret: env.TURNSTILE_SECRET,
    remoteIp: request.headers.get("cf-connecting-ip") || "",
    hostnameConfig: env.TURNSTILE_HOSTNAMES,
  });
  await resolvePublicAddresses(normalized.hostname);

  const now = new Date().toISOString();
  const originHash = await sha256Hex(normalized.origin);
  const dedupeSince = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const existing = await env.DB.prepare(
    `SELECT id, origin, status, created_at, updated_at, expires_at, report_json, failure_code
       FROM audit_jobs
      WHERE origin_hash = ? AND ruleset_version = ? AND scanner_version = ?
        AND status IN ('completed', 'partial') AND created_at >= ? AND expires_at > ?
      ORDER BY created_at DESC LIMIT 1`,
  ).bind(originHash, env.RULESET_VERSION, env.SCANNER_VERSION, dedupeSince, now).first();

  if (existing) {
    const pollToken = await createAccessToken(env, existing.id, existing.expires_at);
    return jsonResponse(200, { ...publicJob(existing), pollToken, deduplicated: true });
  }

  const jobId = crypto.randomUUID();
  const expiresAt = isoAfter(7 * 24 * 60 * 60 * 1000);
  const pollToken = randomToken();
  const tokenHash = await sha256Hex(pollToken);
  const acceptedAt = now;
  const day = now.slice(0, 10);

  try {
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO audit_jobs
          (id, origin, hostname, origin_hash, status, notice_version, consent_accepted_at,
           ruleset_version, scanner_version, created_at, updated_at, expires_at)
         VALUES (?, ?, ?, ?, 'queued', ?, ?, ?, ?, ?, ?, ?)`,
      ).bind(
        jobId,
        normalized.origin,
        normalized.hostname,
        originHash,
        NOTICE_VERSION,
        acceptedAt,
        env.RULESET_VERSION,
        env.SCANNER_VERSION,
        now,
        now,
        expiresAt,
      ),
      env.DB.prepare(
        "INSERT INTO audit_rate_events (day, event_id, origin_hash, created_at) VALUES (?, ?, ?, ?)",
      ).bind(day, jobId, originHash, now),
      env.DB.prepare(
        "INSERT INTO job_access_tokens (job_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)",
      ).bind(jobId, tokenHash, expiresAt, now),
    ]);
  } catch (error) {
    throw rateLimitError(error) || error;
  }

  try {
    await env.AUDIT_QUEUE.send({ jobId });
  } catch (error) {
    await env.DB.prepare(
      "UPDATE audit_jobs SET status = 'failed', failure_code = 'queue_unavailable', updated_at = ? WHERE id = ?",
    ).bind(new Date().toISOString(), jobId).run();
    throw error;
  }

  return jsonResponse(202, {
    jobId,
    pollToken,
    status: "queued",
    progress: 10,
    createdAt: now,
    expiresAt,
    deduplicated: false,
  });
}

async function getAudit(request, env, jobId) {
  const pollToken = parseBearerToken(request);
  const tokenHash = await sha256Hex(pollToken);
  const now = new Date().toISOString();
  const row = await env.DB.prepare(
    `SELECT j.id, j.origin, j.status, j.created_at, j.updated_at, j.expires_at,
            j.report_json, j.failure_code
       FROM audit_jobs j
       JOIN job_access_tokens t ON t.job_id = j.id
      WHERE j.id = ? AND t.token_hash = ? AND t.expires_at > ? AND j.expires_at > ?
      LIMIT 1`,
  ).bind(jobId, tokenHash, now, now).first();
  if (!row) throw new ApiError(404, "audit_not_found", "Nie znaleziono audytu lub dostęp do niego wygasł.");
  return jsonResponse(200, publicJob(row));
}

async function saveCallback(request, env, jobId) {
  const { raw, value } = await readJson(request, MAX_CALLBACK_BYTES);
  const timestamp = request.headers.get("x-ok-timestamp");
  const nonce = request.headers.get("x-ok-nonce");
  const signature = request.headers.get("x-ok-signature");
  await verifySignedRequest({ timestamp, nonce, signature, rawBody: raw, secret: env.N8N_CALLBACK_HMAC_SECRET });

  const nonceResult = await env.DB.prepare(
    "INSERT INTO signature_nonces (nonce, created_at) VALUES (?, ?) ON CONFLICT(nonce) DO NOTHING",
  ).bind(nonce, new Date().toISOString()).run();
  if (!nonceResult.meta?.changes) throw new ApiError(409, "replayed_request", "To żądanie zostało już wykorzystane.");

  if (value?.jobId !== jobId || !new Set(["completed", "partial", "failed"]).has(value?.status)) {
    throw new ApiError(400, "invalid_callback", "Callback ma nieprawidłowy format.");
  }
  let reportJson = null;
  if (value.status !== "failed") reportJson = validateReport(value.report);
  const failureCode = value.status === "failed" && /^[a-z0-9_]{3,64}$/.test(value.failureCode || "")
    ? value.failureCode
    : null;
  const result = await env.DB.prepare(
    `UPDATE audit_jobs
        SET status = ?, report_json = ?, failure_code = ?, updated_at = ?
      WHERE id = ? AND status IN ('queued', 'running')`,
  ).bind(value.status, reportJson, failureCode, new Date().toISOString(), jobId).run();
  if (!result.meta?.changes) {
    const existing = await env.DB.prepare("SELECT status FROM audit_jobs WHERE id = ?").bind(jobId).first();
    if (!existing) throw new ApiError(404, "audit_not_found", "Nie znaleziono audytu.");
    if (!TERMINAL_STATUSES.has(existing.status)) throw new ApiError(409, "invalid_state", "Audyt ma nieprawidłowy stan.");
  }
  return jsonResponse(200, { accepted: true, jobId });
}

async function dispatchJob(message, env) {
  const jobId = message.body?.jobId;
  if (typeof jobId !== "string") {
    message.ack();
    return;
  }
  const job = await env.DB.prepare(
    "SELECT id, origin, status, ruleset_version, scanner_version FROM audit_jobs WHERE id = ?",
  ).bind(jobId).first();
  if (!job || TERMINAL_STATUSES.has(job.status)) {
    message.ack();
    return;
  }

  const payload = {
    jobId: job.id,
    origin: job.origin,
    callbackUrl: `${String(env.CALLBACK_BASE_URL).replace(/\/$/, "")}/api/site-audits/${job.id}/callback`,
    rulesetVersion: job.ruleset_version,
    scannerVersion: job.scanner_version,
  };
  const signedPayload = encodeBase64Url(JSON.stringify(payload));
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = randomToken(18);
  const signature = await hmacHex(env.WORKER_N8N_HMAC_SECRET, `${timestamp}.${nonce}.${signedPayload}`);
  const headers = {
    "content-type": "application/json",
    "x-ok-timestamp": timestamp,
    "x-ok-nonce": nonce,
    "x-ok-signature": signature,
  };
  if (env.CF_ACCESS_CLIENT_ID && env.CF_ACCESS_CLIENT_SECRET) {
    headers["cf-access-client-id"] = env.CF_ACCESS_CLIENT_ID;
    headers["cf-access-client-secret"] = env.CF_ACCESS_CLIENT_SECRET;
  }

  try {
    const response = await fetch(env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ signedPayload }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`n8n_${response.status}`);
    await env.DB.prepare(
      "UPDATE audit_jobs SET status = 'running', updated_at = ? WHERE id = ? AND status = 'queued'",
    ).bind(new Date().toISOString(), jobId).run();
    message.ack();
  } catch (error) {
    console.error(JSON.stringify({ event: "audit_dispatch_failed", jobId, message: error?.message || "unknown" }));
    message.retry();
  }
}

async function cleanup(env) {
  const now = new Date().toISOString();
  const stale = new Date(Date.now() - 45 * 60 * 1000).toISOString();
  const nonceCutoff = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const rateCutoff = new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  await env.DB.batch([
    env.DB.prepare(
      "UPDATE audit_jobs SET status = 'failed', failure_code = 'processing_timeout', updated_at = ? WHERE status IN ('queued', 'running') AND updated_at < ?",
    ).bind(now, stale),
    env.DB.prepare("DELETE FROM job_access_tokens WHERE expires_at <= ?").bind(now),
    env.DB.prepare("DELETE FROM audit_jobs WHERE expires_at <= ?").bind(now),
    env.DB.prepare("DELETE FROM signature_nonces WHERE created_at < ?").bind(nonceCutoff),
    env.DB.prepare("DELETE FROM audit_rate_events WHERE day < ?").bind(rateCutoff),
  ]);
}

export async function handleRequest(request, env) {
  try {
    const url = new URL(request.url);
    const callbackMatch = /^\/api\/site-audits\/([0-9a-f-]{36})\/callback$/.exec(url.pathname);
    const callbackOnlyHostname = String(env.CALLBACK_HOSTNAME || "").toLowerCase();
    if (callbackOnlyHostname && url.hostname.toLowerCase() === callbackOnlyHostname &&
        !(request.method === "POST" && callbackMatch)) {
      return jsonResponse(404, { error: { code: "not_found", message: "Nie znaleziono zasobu." } });
    }
    if (request.method === "POST" && url.pathname === "/api/site-audits") {
      return await startAudit(request, env);
    }
    const match = /^\/api\/site-audits\/([0-9a-f-]{36})(\/callback)?$/.exec(url.pathname);
    if (match && request.method === "GET" && !match[2]) return await getAudit(request, env, match[1]);
    if (match && request.method === "POST" && match[2]) return await saveCallback(request, env, match[1]);
    if (url.pathname.startsWith("/api/site-audits")) {
      return jsonResponse(405, { error: { code: "method_not_allowed", message: "Niedozwolona metoda." } }, { allow: "GET, POST" });
    }
    return jsonResponse(404, { error: { code: "not_found", message: "Nie znaleziono zasobu." } });
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export default {
  fetch(request, env) {
    return handleRequest(request, env);
  },
  async queue(batch, env) {
    await Promise.all(batch.messages.map(message => dispatchJob(message, env)));
  },
  scheduled(_event, env, ctx) {
    ctx.waitUntil(cleanup(env));
  },
};
