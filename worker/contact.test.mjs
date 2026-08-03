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
