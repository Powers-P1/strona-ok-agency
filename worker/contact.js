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

const ATTRIBUTION_KEYS = Object.freeze([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
]);
const ATTRIBUTION_KEY_SET = new Set(ATTRIBUTION_KEYS);
const ATTRIBUTION_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
const ATTRIBUTION_CLOCK_SKEW_MS = 5 * 60 * 1000;
const ALLOWED_ATTRIBUTION_HOSTS = new Set([
  "okagency.pl",
  "www.okagency.pl",
]);

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
  const payload = Object.fromEntries(
    Object.entries(LIMITS).map(([key, limit]) => [key, clean(input?.[key], limit)]),
  );
  payload.attribution = normalizeAttribution(input?.attribution);
  const analyticsEventId = clean(input?.analyticsEventId, 100);
  payload.analyticsEventId = /^[A-Za-z0-9._:-]{8,100}$/.test(analyticsEventId)
    ? analyticsEventId
    : "";
  return payload;
}

function cleanAttributionValue(value, limit) {
  if (typeof value !== "string") return "";
  const cleaned = value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, limit);
  return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(cleaned) ? "" : cleaned;
}

function attributionParamsFromUrl(url) {
  const result = {};
  for (const [rawKey, rawValue] of url.searchParams) {
    const key = rawKey.toLowerCase();
    if (!ATTRIBUTION_KEY_SET.has(key) || Object.hasOwn(result, key)) continue;
    const value = cleanAttributionValue(rawValue, key.startsWith("utm_") ? 200 : 512);
    if (value) result[key] = value;
  }
  return result;
}

function cleanAttributionUrl(value, keepAttribution) {
  if (typeof value !== "string" || !value) return "";
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) return "";
    if (
      keepAttribution
      && (
        url.protocol !== "https:"
        || url.port
        || !ALLOWED_ATTRIBUTION_HOSTS.has(url.hostname)
      )
    ) return "";
    if (!keepAttribution) return url.origin.slice(0, 1000);
    url.username = "";
    url.password = "";
    let decodedPath = url.pathname;
    try {
      decodedPath = decodeURIComponent(decodedPath);
    } catch {
      /* pozostaw zakodowaną ścieżkę do kontroli poniżej */
    }
    if (
      /[^\s/@]+@[^\s/]+\.[^\s/]+/.test(decodedPath)
      || /(?:^|\/)\+?\d[\d(). -]{6,}\d(?:\/|$)/.test(decodedPath)
    ) url.pathname = "/";
    const params = keepAttribution ? attributionParamsFromUrl(url) : {};
    url.hash = "";
    url.search = "";
    for (const key of ATTRIBUTION_KEYS) {
      if (params[key]) url.searchParams.set(key, params[key]);
    }
    const normalized = url.toString();
    return normalized.length <= 1000 ? normalized : "";
  } catch {
    return "";
  }
}

function normalizeTouch(input) {
  if (!input || typeof input !== "object") return null;
  const timestamp = Date.parse(input.captured_at);
  const landingPage = cleanAttributionUrl(input.landing_page, true);
  const age = Date.now() - timestamp;
  if (
    !Number.isFinite(timestamp)
    || age < -ATTRIBUTION_CLOCK_SKEW_MS
    || age > ATTRIBUTION_MAX_AGE_MS
    || !landingPage
  ) return null;

  const touch = {
    captured_at: new Date(timestamp).toISOString(),
    landing_page: landingPage,
  };
  const referrer = cleanAttributionUrl(input.referrer, false);
  if (referrer) touch.referrer = referrer;
  for (const key of ATTRIBUTION_KEYS) {
    const value = cleanAttributionValue(input[key], key.startsWith("utm_") ? 200 : 512);
    if (value) touch[key] = value;
  }
  return touch;
}

function normalizeAttribution(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const firstTouch = normalizeTouch(input.first_touch);
  const lastTouch = normalizeTouch(input.last_touch);
  if (!firstTouch || !lastTouch) return null;
  return { first_touch: firstTouch, last_touch: lastTouch };
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function safeHeader(value) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function attributionLines(attribution) {
  if (!attribution) return [];
  const labels = {
    captured_at: "czas",
    landing_page: "landing",
    referrer: "referrer",
    utm_source: "utm_source",
    utm_medium: "utm_medium",
    utm_campaign: "utm_campaign",
    utm_content: "utm_content",
    utm_term: "utm_term",
    gclid: "gclid",
    gbraid: "gbraid",
    wbraid: "wbraid",
    fbclid: "fbclid",
  };
  const formatTouch = (title, touch) => [
    title,
    ...Object.entries(labels)
      .filter(([key]) => touch[key])
      .map(([key, label]) => `- ${label}: ${touch[key]}`),
  ];
  return [
    "",
    "Atrybucja kampanii (dane przekazane przez przeglądarkę):",
    ...formatTouch("First touch:", attribution.first_touch),
    ...formatTouch("Last touch:", attribution.last_touch),
  ];
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
      payload.analyticsEventId ? `Identyfikator zdarzenia: ${payload.analyticsEventId}` : null,
      ...attributionLines(payload.attribution),
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

export {
  buildEmail,
  normalizeAttribution,
  normalizePayload,
};
