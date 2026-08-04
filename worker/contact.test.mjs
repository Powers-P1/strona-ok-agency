import assert from "node:assert/strict";
import test from "node:test";

import {
  MAX_BODY_BYTES,
  buildMetaConversionEvent,
  buildEmail,
  normalizeAttribution,
  normalizePayload,
  readJsonBody,
} from "./contact.js";

const timestamp = () => new Date().toISOString();

const touch = overrides => ({
  captured_at: timestamp(),
  landing_page: "https://okagency.pl/diagnoza?utm_source=google&gclid=click-1&email=pii@example.com",
  referrer: "https://partner.example/private/user@example.com?secret=1",
  utm_source: "google",
  gclid: "click-1",
  ...overrides,
});

test("normalizes allowlisted attribution and strips URL PII and unknown fields", () => {
  const attribution = normalizeAttribution({
    first_touch: touch({ unknown: "drop-me" }),
    last_touch: touch({ utm_campaign: "brand" }),
    injected: "drop-me",
  });

  assert.equal(attribution.first_touch.landing_page, "https://okagency.pl/diagnoza?utm_source=google&gclid=click-1");
  assert.equal(attribution.first_touch.referrer, "https://partner.example");
  assert.equal(attribution.first_touch.unknown, undefined);
  assert.equal(attribution.last_touch.utm_campaign, "brand");
  assert.doesNotMatch(JSON.stringify(attribution), /pii@example\.com|secret=1|drop-me/);
});

test("deeply encoded PII and phone variants are rejected without losing safe attribution", () => {
  const unsafeLanding = "https://okagency.pl/jan%2540example%252Ecom?utm_source=google&utm_campaign=1234567890&utm_content=tel501234567&gclid=click-ab123456789xyz&wbraid=jan%2540example%252Ecom";
  const attribution = normalizeAttribution({
    first_touch: touch({
      landing_page: unsafeLanding,
      utm_source: "50%25-off",
      utm_campaign: "campaign-1234567890",
      utm_content: "2026-08-03-01",
      utm_medium: "+48\u00a0501\u00a0234\u00a0567",
      utm_term: "+48/501/234/567",
      wbraid: "jan%2540example%252Ecom",
      fbclid: " 48501234567",
    }),
    last_touch: touch({
      landing_page: unsafeLanding,
      utm_campaign: "1234567890",
      utm_content: "2026-08-03",
    }),
  });

  assert.equal(
    attribution.first_touch.landing_page,
    "https://okagency.pl/?utm_source=google&gclid=click-ab123456789xyz",
  );
  assert.equal(attribution.first_touch.utm_source, "50%25-off");
  assert.equal(attribution.first_touch.utm_campaign, undefined);
  assert.equal(attribution.first_touch.utm_content, "2026-08-03-01");
  assert.equal(attribution.first_touch.utm_medium, undefined);
  assert.equal(attribution.first_touch.utm_term, undefined);
  assert.equal(attribution.first_touch.wbraid, undefined);
  assert.equal(attribution.first_touch.fbclid, undefined);
  assert.doesNotMatch(
    JSON.stringify(attribution),
    /jan(?:%25|%40|@)|tel501|501(?:%2F|\/|\s)?234(?:%2F|\/|\s)?567/i,
  );
});

test("Worker keeps click IDs but rejects phone-length UTM runs", () => {
  const landingPage = "https://okagency.pl/diagnoza?utm_campaign=jan-501234567&utm_content=48501234567&gclid=1234567890";
  const attribution = normalizeAttribution({
    first_touch: touch({
      landing_page: landingPage,
      utm_campaign: "jan-501234567",
      utm_content: "48501234567",
      gclid: "1234567890",
    }),
    last_touch: touch({
      landing_page: landingPage,
      utm_campaign: "1234567890",
      utm_content: "48501234567",
      gclid: "1234567890",
    }),
  });
  assert.equal(
    attribution.first_touch.landing_page,
    "https://okagency.pl/diagnoza?gclid=1234567890",
  );
  assert.equal(attribution.first_touch.utm_campaign, undefined);
  assert.equal(attribution.last_touch.utm_campaign, undefined);
  assert.equal(attribution.first_touch.utm_content, undefined);
  assert.equal(attribution.last_touch.utm_content, undefined);
  assert.equal(attribution.first_touch.gclid, "1234567890");
});

test("Worker rejects contact data hidden with control or zero-width separators", () => {
  for (const unsafe of [
    "501\u200B234\u200B567",
    "tel\u200B501234567",
    "501\u0000 234\u0000 567",
    "jan\u200B@example.com",
    "tel/501234567",
    "tel501234567ext123",
  ]) {
    const encoded = encodeURIComponent(unsafe);
    const landingPage = `https://okagency.pl/${encoded}?utm_content=${encoded}&gclid=click-ab123456789xyz`;
    const attribution = normalizeAttribution({
      first_touch: touch({ landing_page: landingPage, utm_content: unsafe }),
      last_touch: touch({ landing_page: landingPage, utm_content: unsafe }),
    });
    assert.equal(
      attribution.first_touch.landing_page,
      "https://okagency.pl/?gclid=click-ab123456789xyz",
    );
    assert.equal(attribution.first_touch.utm_content, undefined);
    assert.doesNotMatch(JSON.stringify(attribution.first_touch), /501|tel|jan/i);
  }
});

test("Worker strips phone-number runs from paths while retaining safe click IDs", () => {
  for (const path of [
    "501234567",
    "tel/501234567",
    "lead/48501234567",
    "lead-501234567",
    "501234567.html",
    "id_48501234567_x",
  ]) {
    const landingPage = `https://okagency.pl/${path}?gclid=click-ab123456789xyz`;
    const attribution = normalizeAttribution({
      first_touch: touch({ landing_page: landingPage }),
      last_touch: touch({ landing_page: landingPage }),
    });
    assert.equal(
      attribution.first_touch.landing_page,
      "https://okagency.pl/?gclid=click-ab123456789xyz",
    );
  }
});

test("oversized Worker attribution is reduced to a valid URL within the final limit", () => {
  const query = new URLSearchParams({
    utm_source: "a".repeat(200),
    utm_medium: "b".repeat(200),
    utm_campaign: "c".repeat(200),
    utm_content: "d".repeat(200),
    utm_term: "e".repeat(200),
    gclid: `g-${"f".repeat(510)}`,
    fbclid: `m-${"g".repeat(510)}`,
  });
  const landingPage = `https://okagency.pl/diagnoza?${query}`;
  const attribution = normalizeAttribution({
    first_touch: touch({ landing_page: landingPage }),
    last_touch: touch({ landing_page: landingPage }),
  });

  assert.ok(attribution);
  assert.ok(attribution.first_touch.landing_page.length <= 1000);
  assert.match(attribution.first_touch.landing_page, /^https:\/\/okagency\.pl\/diagnoza\?/);
});

test("rejects foreign landing hosts and stale attribution", () => {
  assert.equal(normalizeAttribution({
    first_touch: touch({ landing_page: "https://attacker.example/landing?gclid=fake" }),
    last_touch: touch({}),
  }), null);

  assert.equal(normalizeAttribution({
    first_touch: touch({ landing_page: "http://okagency.pl/diagnoza?gclid=fake" }),
    last_touch: touch({}),
  }), null);

  const scrubbed = normalizeAttribution({
    first_touch: touch({
      landing_page: "https://user:secret@okagency.pl/jan@example.com?utm_source=google",
    }),
    last_touch: touch({}),
  });
  assert.equal(scrubbed.first_touch.landing_page, "https://okagency.pl/?utm_source=google");
  assert.doesNotMatch(JSON.stringify(scrubbed), /user:secret|jan@example\.com/);

  const stale = new Date(Date.now() - 181 * 24 * 60 * 60 * 1000).toISOString();
  assert.equal(normalizeAttribution({
    first_touch: touch({ captured_at: stale }),
    last_touch: touch({}),
  }), null);
});

test("sanitizes event ID and includes accepted attribution in the email", () => {
  const payload = normalizePayload({
    name: "Jan Kowalski",
    email: "jan@example.com",
    phone: "",
    company: "OK",
    topic: "Strona internetowa",
    message: "Proszę o kontakt w sprawie strony.",
    fax: "",
    analyticsEventId: "lead-event-12345\r\nBcc: attacker@example.com",
    attribution: {
      first_touch: touch({}),
      last_touch: touch({ utm_campaign: "brand" }),
    },
  });
  assert.equal(payload.analyticsEventId, "");

  payload.analyticsEventId = "lead-event-12345";
  const email = buildEmail(payload, "forms@okagency.pl", "hello@okagency.pl");
  assert.match(email.text, /Identyfikator zdarzenia: lead-event-12345/);
  assert.match(email.text, /Atrybucja kampanii \(dane przekazane przez przeglądarkę\)/);
  assert.match(email.text, /utm_campaign: brand/);
  assert.doesNotMatch(email.text, /pii@example\.com|secret=1/);
});

test("builds a consented Meta Contact server event with hashed contact data", async () => {
  const payload = normalizePayload({
    name: "Jan Kowalski",
    email: " Lead@Example.COM ",
    phone: "501 234 567",
    company: "",
    topic: "Diagnoza: Strona",
    message: "Proszę o kontakt w sprawie diagnozy.",
    fax: "",
    analyticsEventId: "lead-event-12345",
    marketingConsent: true,
    eventSourceUrl: "https://okagency.pl/diagnoza?utm_source=meta#result",
    fbp: "fb.1.1720000000000.browser-id",
    fbc: "fb.1.1720000000000.click-id",
  });
  const request = new Request("https://okagency.pl/api/contact", {
    headers: {
      "CF-Connecting-IP": "203.0.113.10",
      "user-agent": "OK Agency analytics test",
    },
  });
  const event = await buildMetaConversionEvent(payload, request, 1_720_000_000_000);

  assert.equal(event.event_name, "Contact");
  assert.equal(event.event_time, 1_720_000_000);
  assert.equal(event.event_id, "lead-event-12345");
  assert.equal(event.event_source_url, "https://okagency.pl/diagnoza");
  assert.equal(event.action_source, "website");
  assert.equal(event.user_data.client_ip_address, "203.0.113.10");
  assert.equal(event.user_data.client_user_agent, "OK Agency analytics test");
  assert.equal(event.user_data.fbp, "fb.1.1720000000000.browser-id");
  assert.equal(event.user_data.fbc, "fb.1.1720000000000.click-id");
  assert.match(event.user_data.em[0], /^[a-f0-9]{64}$/);
  assert.match(event.user_data.ph[0], /^[a-f0-9]{64}$/);
  assert.doesNotMatch(JSON.stringify(event), /lead@example\.com|501[\s-]?234[\s-]?567/i);
  assert.equal(event.custom_data.form_type, "diagnosis");
});

test("never builds a Meta server event without explicit marketing consent", async () => {
  const payload = normalizePayload({
    email: "lead@example.com",
    analyticsEventId: "lead-event-12345",
    marketingConsent: false,
    eventSourceUrl: "https://evil.example/private",
    fbp: "not-an-fbp",
    fbc: "not-an-fbc",
  });
  const event = await buildMetaConversionEvent(
    payload,
    new Request("https://okagency.pl/api/contact"),
  );
  assert.equal(event, null);
  assert.equal(payload.eventSourceUrl, "");
  assert.equal(payload.fbp, "");
  assert.equal(payload.fbc, "");
});

test("scrubs contact data from an allowed CAPI source path", () => {
  for (const eventSourceUrl of [
    "https://okagency.pl/jan%2540example%252Ecom?utm_source=meta",
    "https://www.okagency.pl/tel%252B48%252F501%252F234%252F567#result",
  ]) {
    const payload = normalizePayload({
      email: "lead@example.com",
      analyticsEventId: "lead-event-12345",
      marketingConsent: true,
      eventSourceUrl,
    });
    assert.match(payload.eventSourceUrl, /^https:\/\/(?:www\.)?okagency\.pl\/$/);
    assert.doesNotMatch(payload.eventSourceUrl, /jan|example|501|234|567/i);
  }
});

test("request-size budget accepts the largest valid Unicode form with full attribution", async () => {
  const unicode = "😀";
  const maxTouch = {
    captured_at: timestamp(),
    landing_page: `https://okagency.pl/${"a".repeat(978)}`,
    referrer: `https://${"a".repeat(240)}.pl`,
    utm_source: unicode.repeat(200),
    utm_medium: unicode.repeat(200),
    utm_campaign: unicode.repeat(200),
    utm_content: unicode.repeat(200),
    utm_term: unicode.repeat(200),
    gclid: unicode.repeat(512),
    gbraid: unicode.repeat(512),
    wbraid: unicode.repeat(512),
    fbclid: unicode.repeat(512),
  };
  const body = JSON.stringify({
    name: unicode.repeat(100),
    email: `${"a".repeat(240)}@x.pl`,
    phone: unicode.repeat(50),
    company: unicode.repeat(150),
    topic: unicode.repeat(100),
    message: unicode.repeat(5000),
    fax: "",
    turnstileToken: "x".repeat(2048),
    attribution: { first_touch: maxTouch, last_touch: { ...maxTouch } },
    analyticsEventId: "x".repeat(100),
  });
  const byteLength = new TextEncoder().encode(body).byteLength;
  assert.ok(byteLength > 16_384, "fixture must cover the previous request-size failure");
  assert.ok(byteLength <= MAX_BODY_BYTES, "valid payload must fit the Worker budget");

  const parsed = await readJsonBody(new Request("https://okagency.pl/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  }));
  assert.equal(parsed.error, undefined);
  assert.equal(parsed.value.message.length, 5000 * 2);
});
