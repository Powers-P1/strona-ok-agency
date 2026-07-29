import { EmailMessage } from "cloudflare:email";

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

const ALLOWED_ORIGINS = new Set([
  "https://okagency.pl",
  "https://www.okagency.pl",
]);

const EXPECTED_TURNSTILE_ACTION = "contact";

const LIMITS = {
  name: 100,
  email: 254,
  phone: 50,
  company: 150,
  topic: 100,
  message: 5000,
  fax: 200,
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
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

function encodeBase64Utf8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary).replace(/.{1,76}/g, "$&\r\n").trimEnd();
}

function safeHeader(value) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function buildRawEmail(payload, from, to) {
  const subject = safeHeader(
    `[${payload.topic}] ${payload.name}${payload.company ? ` — ${payload.company}` : ""}`,
  );
  const body = [
    `Temat: ${payload.topic}`,
    `Imię i nazwisko: ${payload.name}`,
    `E-mail: ${payload.email}`,
    payload.phone ? `Telefon: ${payload.phone}` : null,
    payload.company ? `Firma: ${payload.company}` : null,
    "",
    payload.message,
  ].filter(value => value !== null).join("\n");

  return [
    `From: Formularz OK Agency <${safeHeader(from)}>`,
    `To: ${safeHeader(to)}`,
    `Reply-To: ${safeHeader(payload.email)}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    encodeBase64Utf8(body),
  ].join("\r\n");
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

export async function onRequestPost({ request, env }) {
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
    console.error("contact_form_configuration_missing");
    return json({ ok: false, error: "unavailable" }, 503);
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const payload = normalizePayload(input);
  if (payload.fax) return json({ ok: true });
  if (
    payload.name.length < 3
    || !isValidEmail(payload.email)
    || !payload.topic
    || payload.message.length < 10
  ) {
    return json({ ok: false, error: "validation" }, 400);
  }

  const turnstileToken = clean(input?.turnstileToken, 2048);
  if (!turnstileToken) return json({ ok: false, error: "challenge" }, 400);

  const verified = await verifyTurnstile(
    turnstileToken,
    env.TURNSTILE_SECRET,
    request.headers.get("CF-Connecting-IP"),
    env.TURNSTILE_HOSTNAMES,
  );
  if (!verified) return json({ ok: false, error: "challenge" }, 400);

  try {
    const raw = buildRawEmail(payload, env.CONTACT_FROM, env.CONTACT_TO);
    await env.SEND_EMAIL.send(
      new EmailMessage(env.CONTACT_FROM, env.CONTACT_TO, raw),
    );
  } catch (error) {
    console.error("contact_email_send_failed", {
      name: error instanceof Error ? error.name : "unknown",
    });
    return json({ ok: false, error: "send" }, 502);
  }

  return json({ ok: true });
}

export function onRequest() {
  return json({ ok: false, error: "method" }, 405);
}
