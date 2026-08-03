import assert from "node:assert/strict";
import test from "node:test";

import {
  buildEmail,
  normalizeAttribution,
  normalizePayload,
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

test("deeply encoded PII and phone variants are rejected without losing numeric campaign IDs", () => {
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
    "https://okagency.pl/?utm_source=google&utm_campaign=1234567890&gclid=click-ab123456789xyz",
  );
  assert.equal(attribution.first_touch.utm_source, "50%25-off");
  assert.equal(attribution.first_touch.utm_campaign, "campaign-1234567890");
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
