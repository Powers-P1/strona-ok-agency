const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
};

const ALLOWED_ORIGINS = new Set([
  "https://okagency.pl",
  "https://www.okagency.pl",
]);

const EXPECTED_TURNSTILE_ACTION = "contact";
const MAX_BODY_BYTES = 16_384;

const LIMITS = {
  name: 100,
  email: 254,
  phone: 50,
  company: 150,
  topic: 100,
  message: 5000,
  fax: 200,
};

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

function clean(value, limit) {
  return typeof value === "string"
    ? value.replace(/\0/g, "").trim().slice(0, limit)
    : "";
}

function normalizePayload(input) {
  return Object.fromEntries(
    Object.entries(LIMITS).map(([key, limit]) => [key, clean(input?.[key], limit)]),
  );
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function safeHeader(value) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

async function readJsonBody(request) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return { error: "too_large" };
  }
  if (!request.body) return { error: "invalid_json" };

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        return { error: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return { error: "invalid_json" };
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return { value: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { error: "invalid_json" };
  }
}

async function verifyTurnstile(token, secret, remoteip, hostnameConfig) {
  const expectedHostnames = new Set(
    (hostnameConfig ?? "")
      .split(",")
      .map(hostname => hostname.trim())
      .filter(Boolean),
  );

  if (
    typeof token !== "string"
    || token.length === 0
    || token.length > 2048
    || typeof secret !== "string"
    || secret.length === 0
    || expectedHostnames.size === 0
  ) {
    return false;
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });
  if (remoteip) body.set("remoteip", remoteip);

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        signal: AbortSignal.timeout(10_000),
        body,
      },
    );
    if (!response.ok) return false;

    const result = await response.json();
    return result.success === true
      && result.action === EXPECTED_TURNSTILE_ACTION
      && expectedHostnames.has(result.hostname);
  } catch {
    return false;
  }
}

function buildEmail(payload, from, to) {
  return {
    from: {
      email: from,
      name: "Formularz OK Agency",
    },
    to,
    replyTo: payload.email,
    subject: safeHeader(
      `[${payload.topic}] ${payload.name}${payload.company ? ` — ${payload.company}` : ""}`,
    ),
    text: [
      `Temat: ${payload.topic}`,
      `Imię i nazwisko: ${payload.name}`,
      `E-mail: ${payload.email}`,
      payload.phone ? `Telefon: ${payload.phone}` : null,
      payload.company ? `Firma: ${payload.company}` : null,
      "",
      payload.message,
    ].filter(value => value !== null).join("\n"),
  };
}

async function handleContact(request, env) {
  const origin = request.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return json({ ok: false, error: "origin" }, 403);
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return json({ ok: false, error: "content_type" }, 415);
  }

  if (
    !env.TURNSTILE_SECRET
    || !env.TURNSTILE_HOSTNAMES
    || !env.SEND_EMAIL
    || !env.CONTACT_FROM
    || !env.CONTACT_TO
  ) {
    console.error(JSON.stringify({ event: "contact_form_configuration_missing" }));
    return json({ ok: false, error: "unavailable" }, 503);
  }

  const parsed = await readJsonBody(request);
  if (parsed.error === "too_large") {
    return json({ ok: false, error: "too_large" }, 413);
  }
  if (parsed.error) {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const payload = normalizePayload(parsed.value);
  if (payload.fax) return json({ ok: true });
  if (
    payload.name.length < 3
    || !isValidEmail(payload.email)
    || !payload.topic
    || payload.message.length < 10
  ) {
    return json({ ok: false, error: "validation" }, 400);
  }

  const turnstileToken = clean(parsed.value?.turnstileToken, 2048);
  const verified = await verifyTurnstile(
    turnstileToken,
    env.TURNSTILE_SECRET,
    request.headers.get("CF-Connecting-IP"),
    env.TURNSTILE_HOSTNAMES,
  );
  if (!verified) return json({ ok: false, error: "challenge" }, 403);

  try {
    await env.SEND_EMAIL.send(
      buildEmail(payload, env.CONTACT_FROM, env.CONTACT_TO),
    );
  } catch (error) {
    console.error(JSON.stringify({
      event: "contact_email_send_failed",
      code: typeof error?.code === "string" ? error.code : "unknown",
    }));
    return json({ ok: false, error: "send" }, 502);
  }

  console.log(JSON.stringify({ event: "contact_email_sent" }));
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/contact") {
      return json({ ok: false, error: "not_found" }, 404);
    }
    if (request.method !== "POST") {
      return json(
        { ok: false, error: "method" },
        405,
        { allow: "POST" },
      );
    }
    return handleContact(request, env);
  },
};
