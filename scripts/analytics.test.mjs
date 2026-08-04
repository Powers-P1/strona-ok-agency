import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const analyticsSource = await readFile(join(root, "assets", "analytics.js"), "utf8");
const diagnosisSource = await readFile(
  join(root, "assets", "services", "diagnosis", "script.js"),
  "utf8",
);

const consentValue = (level, at = new Date().toISOString()) => JSON.stringify({
  version: 3,
  level,
  at,
});

function createStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  const metrics = { get: 0, set: 0, remove: 0, clear: 0 };
  return {
    metrics,
    getItem(key) {
      metrics.get += 1;
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      metrics.set += 1;
      values.set(key, String(value));
    },
    removeItem(key) {
      metrics.remove += 1;
      values.delete(key);
    },
    clear() {
      metrics.clear += 1;
      values.clear();
    },
    value(key) {
      return values.get(key) ?? null;
    },
  };
}

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.children = [];
    this.listeners = new Map();
    this.attributes = new Map();
    this.className = "";
    this.textContent = "";
    this.parentNode = null;
  }

  append(...children) {
    for (const child of children) {
      this.children.push(child);
      if (child instanceof FakeElement) child.parentNode = this;
    }
  }

  appendChild(child) {
    this.append(child);
    return child;
  }

  addEventListener(name, listener) {
    const listeners = this.listeners.get(name) || [];
    listeners.push(listener);
    this.listeners.set(name, listeners);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  querySelector(selector) {
    if (selector.startsWith(".")) {
      const className = selector.slice(1);
      return this.find(element => element.className.split(/\s+/).includes(className));
    }
    return null;
  }

  find(predicate) {
    if (predicate(this)) return this;
    for (const child of this.children) {
      if (child instanceof FakeElement) {
        const found = child.find(predicate);
        if (found) return found;
      }
    }
    return null;
  }

  focus() {}

  remove() {
    if (!this.parentNode) return;
    this.parentNode.children = this.parentNode.children.filter(child => child !== this);
    this.parentNode = null;
  }

  click() {
    for (const listener of this.listeners.get("click") || []) listener({ target: this });
  }
}

function normalizeCommand(command) {
  return Array.from(command, value => {
    if (value && typeof value === "object" && !(value instanceof Date)) {
      return JSON.parse(JSON.stringify(value));
    }
    return value;
  });
}

function loadAnalytics({
  url = "https://okagency.pl/",
  referrer = "",
  localStorage = createStorage(),
  sessionStorage = createStorage(),
  existingIds = ["contact-form", "diagnosis-outcome"],
  replaceStateMode = "available",
  cookie = "",
} = {}) {
  let activeReplaceStateMode = replaceStateMode;
  const head = new FakeElement("head");
  const body = new FakeElement("body");
  const documentListeners = new Map();
  const windowListeners = new Map();
  const document = {
    body,
    head,
    readyState: "complete",
    referrer,
    cookie,
    createElement: tagName => new FakeElement(tagName),
    getElementById(id) {
      return existingIds.includes(id) ? { id } : null;
    },
    addEventListener(name, listener) {
      documentListeners.set(name, listener);
    },
  };
  let reloadCount = 0;
  let replacedUrl = null;
  const location = new URL(url);
  location.reload = () => { reloadCount += 1; };
  const history = {
    state: null,
  };
  if (activeReplaceStateMode !== "missing") {
    history.replaceState = (_state, _title, nextUrl) => {
      if (activeReplaceStateMode === "throw") throw new Error("replaceState unavailable");
      if (activeReplaceStateMode === "noop") return;
      replacedUrl = String(nextUrl);
      location.href = new URL(replacedUrl, location.href).href;
    };
  }
  const window = {
    location,
    crypto: { randomUUID: () => "runtime-event-id-12345" },
    history,
    addEventListener(name, listener) {
      const listeners = windowListeners.get(name) || [];
      listeners.push(listener);
      windowListeners.set(name, listeners);
    },
  };
  window.localStorage = localStorage;
  window.sessionStorage = sessionStorage;

  vm.runInNewContext(analyticsSource, {
    console,
    document,
    encodeURIComponent,
    localStorage,
    sessionStorage,
    URL,
    window,
  }, { filename: join(root, "assets", "analytics.js") });

  const commands = () => Array.from(window.dataLayer, normalizeCommand);
  const pixelCommands = () => Array.from(window.fbq?.queue || [], normalizeCommand);
  const scripts = () => head.children
    .filter(child => child instanceof FakeElement && child.tagName === "SCRIPT")
    .map(script => script.src);
  const button = text => body.find(element => (
    element.tagName === "BUTTON" && element.textContent === text
  ));
  const dispatchStorage = key => {
    for (const listener of windowListeners.get("storage") || []) listener({ key });
  };
  const dispatchWindow = (name, event = {}) => {
    for (const listener of windowListeners.get(name) || []) listener(event);
  };

  return {
    body,
    button,
    commands,
    dispatchStorage,
    dispatchWindow,
    localStorage,
    pixelCommands,
    reloadCount: () => reloadCount,
    replacedUrl: () => replacedUrl,
    setReplaceStateMode: mode => { activeReplaceStateMode = mode; },
    scripts,
    sessionStorage,
    window,
  };
}

const eventCommands = runtime => runtime.commands().filter(command => command[0] === "event");
const eventNames = runtime => eventCommands(runtime).map(command => command[1]);
const plain = value => JSON.parse(JSON.stringify(value));

test("defaults Consent Mode v2 to denied without custom events or attribution storage", () => {
  const sessionStorage = createStorage({ "ok-attribution": "stale" });
  const runtime = loadAnalytics({
    url: "https://okagency.pl/kontakt?utm_source=google&gclid=click-1&email=jan@example.com",
    referrer: "https://partner.example/path/user@example.com?secret=1",
    sessionStorage,
  });

  const first = runtime.commands()[0];
  assert.deepEqual(first.slice(0, 2), ["consent", "default"]);
  assert.deepEqual(first[2], {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500,
  });
  assert.deepEqual(eventNames(runtime), []);
  assert.deepEqual(runtime.scripts(), []);
  assert.equal(runtime.commands().some(command => command[0] === "config"), false);
  assert.equal(runtime.commands().some(command => command[0] === "config" && command[1].startsWith("AW-")), false);
  assert.equal(sessionStorage.metrics.get, 0, "attribution must not be read before consent");
  assert.equal(sessionStorage.metrics.set, 0, "attribution must not be written before consent");
  assert.ok(sessionStorage.metrics.remove >= 1, "stale attribution is cleared");

  runtime.window.okAnalytics.diagnosisStart();
  runtime.window.okAnalytics.diagnosisComplete("website");
  runtime.window.okAnalytics.generateLead("contact");
  assert.deepEqual(eventNames(runtime), []);
  assert.equal(runtime.window.okAnalytics.attribution(), null);

  assert.ok(runtime.button("Odrzuć"));
  assert.ok(runtime.button("Tylko analityka"));
  assert.ok(runtime.button("Analityka i reklamy"));

  assert.doesNotMatch(JSON.stringify(runtime.commands()), /jan@example\.com|secret=1/);
});

test("analytics-only grants GA4 but keeps Ads, Meta and marketing attribution disabled", () => {
  const runtime = loadAnalytics({
    url: "https://okagency.pl/kontakt?utm_source=google&gclid=click-1",
  });
  runtime.button("Tylko analityka").click();

  const stored = JSON.parse(runtime.localStorage.value("ok-consent"));
  assert.equal(stored.version, 3);
  assert.equal(stored.level, "analytics");
  const update = runtime.commands().findLast(command => command[0] === "consent" && command[1] === "update");
  assert.equal(update[2].analytics_storage, "granted");
  assert.equal(update[2].ad_storage, "denied");
  assert.equal(update[2].ad_user_data, "denied");
  assert.equal(update[2].ad_personalization, "denied");

  runtime.window.okAnalytics.diagnosisStart();
  runtime.window.okAnalytics.diagnosisComplete("campaign");
  runtime.window.okAnalytics.generateLead({ email: "pii@example.com" });

  assert.deepEqual(eventNames(runtime), [
    "page_view",
    "contact_view",
    "diagnosis_start",
    "diagnosis_complete",
    "generate_lead",
  ]);
  const pageView = eventCommands(runtime).find(command => command[1] === "page_view");
  assert.equal(pageView[2].page_location, "https://okagency.pl/kontakt");
  assert.doesNotMatch(JSON.stringify(eventCommands(runtime)), /pii@example\.com|gclid|utm_source/);
  assert.equal(runtime.commands().some(command => command[0] === "config" && command[1].startsWith("AW-")), false);
  assert.ok(runtime.scripts().some(src => src.includes("googletagmanager.com/gtag/js?id=G-D4EWVVL8ZK")));
  assert.equal(eventCommands(runtime).some(command => command[1] === "conversion"), false);
  assert.equal(runtime.window.fbq, undefined);
  assert.equal(runtime.window.okAnalytics.attribution(), null);
  assert.equal(runtime.window.okAnalytics.createMarketingEventId(), "");
  assert.equal(runtime.sessionStorage.metrics.set, 0);
  assert.equal(runtime.replacedUrl(), "https://okagency.pl/kontakt");

  const consentUpdates = runtime.commands().filter(command => (
    command[0] === "consent" && command[1] === "update"
  )).length;
  runtime.window.okConsent.revoke();
  assert.equal(runtime.reloadCount(), 1, "analytics downgrade requires an isolated reload");
  assert.equal(runtime.commands().filter(command => (
    command[0] === "consent" && command[1] === "update"
  )).length, consentUpdates, "downgrade must not ping the loaded Google tag");
});

test("marketing consent enables first-touch attribution and one Meta Contact event", () => {
  const localStorage = createStorage({ "ok-consent": consentValue("marketing") });
  const runtime = loadAnalytics({
    url: "https://okagency.pl/diagnoza?utm_source=google&utm_campaign=test&gclid=click-1&email=pii@example.com",
    referrer: "https://search.example/private/user@example.com?q=secret",
    localStorage,
    cookie: "_fbp=fb.1.1720000000000.browser-id; _fbc=fb.1.1720000000000.click-id",
  });

  assert.ok(runtime.commands().some(command => command[0] === "config" && command[1] === "AW-18361103115"));
  assert.ok(runtime.scripts().some(src => src.includes("facebook.net")));

  const attribution = runtime.window.okAnalytics.attribution();
  assert.equal(attribution.first_touch.utm_source, "google");
  assert.equal(attribution.first_touch.gclid, "click-1");
  assert.equal(attribution.first_touch.referrer, "https://search.example");
  assert.match(attribution.first_touch.landing_page, /utm_source=google/);
  assert.doesNotMatch(JSON.stringify(attribution), /pii@example\.com|secret/);

  runtime.window.okAnalytics.diagnosisStart();
  runtime.window.okAnalytics.diagnosisComplete("website");
  runtime.window.okAnalytics.generateLead(
    "diagnosis",
    "lead-event-12345",
    { email: " Lead@Example.COM ", phone: "501 234 567" },
  );

  for (const name of ["page_view", "diagnosis_start", "diagnosis_complete", "generate_lead"]) {
    assert.ok(eventNames(runtime).includes(name), `missing GA4 event ${name}`);
  }
  const pixel = runtime.pixelCommands();
  assert.equal(pixel.filter(command => command[0] === "track" && command[1] === "Contact").length, 1);
  assert.equal(pixel.some(command => command[0] === "track" && command[1] === "Lead"), false);
  const contact = pixel.find(command => command[0] === "track" && command[1] === "Contact");
  assert.equal(contact[3].eventID, "lead-event-12345");
  const conversion = eventCommands(runtime).find(command => command[1] === "conversion");
  assert.equal(conversion[2].transaction_id, "lead-event-12345");
  const userData = runtime.commands().find(command => command[0] === "set" && command[1] === "user_data");
  assert.deepEqual(userData[2], {
    email: "lead@example.com",
    phone_number: "+48501234567",
  });
  const conversionIndex = runtime.commands().findIndex(command => command[0] === "event" && command[1] === "conversion");
  const userDataClearIndex = runtime.commands().findIndex((command, index) => (
    index > conversionIndex
    && command[0] === "set"
    && command[1] === "user_data"
    && command[2]?.email === null
    && command[2]?.phone_number === null
  ));
  assert.ok(conversionIndex > runtime.commands().indexOf(userData));
  assert.ok(userDataClearIndex > conversionIndex);
  runtime.window.okAnalytics.diagnosisStart();
  const laterEvent = eventCommands(runtime).at(-1);
  assert.equal(laterEvent[1], "diagnosis_start");
  assert.doesNotMatch(JSON.stringify(laterEvent), /lead@example\.com|501234567/);
  assert.deepEqual(plain(runtime.window.okAnalytics.marketingContext()), {
    marketingConsent: true,
    eventSourceUrl: "https://okagency.pl/diagnoza?utm_source=google&utm_campaign=test&gclid=click-1",
    fbp: "fb.1.1720000000000.browser-id",
    fbc: "fb.1.1720000000000.click-id",
  });
});

test("enhanced conversion contact data never leaves analytics-only mode", () => {
  const runtime = loadAnalytics({
    localStorage: createStorage({ "ok-consent": consentValue("analytics") }),
    cookie: "_fbp=fb.1.1720000000000.browser-id",
  });
  runtime.window.okAnalytics.generateLead(
    "contact",
    "lead-event-12345",
    { email: "lead@example.com", phone: "+48 501 234 567" },
  );
  assert.equal(
    runtime.commands().some(command => command[0] === "set" && command[1] === "user_data"),
    false,
  );
  assert.deepEqual(plain(runtime.window.okAnalytics.marketingContext()), {
    marketingConsent: false,
  });
  assert.doesNotMatch(JSON.stringify(runtime.commands()), /lead@example\.com|501234567/);
});

test("revoke immediately blocks future Meta, Ads and GA4 custom events and clears attribution", () => {
  const localStorage = createStorage({ "ok-consent": consentValue("marketing") });
  const sessionStorage = createStorage();
  const runtime = loadAnalytics({
    url: "https://okagency.pl/?utm_source=meta&fbclid=click-2",
    localStorage,
    sessionStorage,
  });
  const eventCount = eventCommands(runtime).length;
  const pixelEventCount = runtime.pixelCommands().filter(command => (
    command[0] === "track" || command[0] === "trackCustom"
  )).length;
  const consentUpdateCount = runtime.commands().filter(command => (
    command[0] === "consent" && command[1] === "update"
  )).length;

  runtime.window.okConsent.revoke();
  assert.equal(runtime.window.okConsent.state(), "denied");
  assert.equal(runtime.window.okAnalytics.attribution(), null);
  assert.ok(sessionStorage.metrics.remove >= 1);
  assert.ok(runtime.pixelCommands().some(command => (
    command[0] === "consent" && command[1] === "revoke"
  )));
  assert.equal(runtime.reloadCount(), 1, "marketing revoke requires an isolated reload");
  assert.equal(runtime.commands().filter(command => (
    command[0] === "consent" && command[1] === "update"
  )).length, consentUpdateCount, "revoke must not ping the loaded Google tag");

  runtime.window.okAnalytics.diagnosisStart();
  runtime.window.okAnalytics.diagnosisComplete("social");
  runtime.window.okAnalytics.generateLead("contact", "blocked-event-1");
  assert.equal(eventCommands(runtime).length, eventCount);
  assert.equal(runtime.pixelCommands().filter(command => (
    command[0] === "track" || command[0] === "trackCustom"
  )).length, pixelEventCount);
});

test("localStorage downgrades isolate loaded vendors across tabs, including localStorage.clear", () => {
  const localStorage = createStorage({ "ok-consent": consentValue("marketing") });
  const runtime = loadAnalytics({ localStorage });

  const consentUpdateCount = runtime.commands().filter(command => (
    command[0] === "consent" && command[1] === "update"
  )).length;
  localStorage.setItem("ok-consent", consentValue("analytics"));
  runtime.dispatchStorage("ok-consent");
  assert.equal(runtime.window.okConsent.state(), "analytics");
  assert.equal(runtime.reloadCount(), 1);
  assert.equal(runtime.commands().filter(command => (
    command[0] === "consent" && command[1] === "update"
  )).length, consentUpdateCount);

  localStorage.clear();
  runtime.dispatchStorage(null);
  assert.equal(runtime.window.okConsent.state(), null);
  assert.equal(runtime.reloadCount(), 1, "only one reload is scheduled for the dying document");
});

test("first touch stays stable while last touch changes only for a new campaign", () => {
  const localStorage = createStorage({ "ok-consent": consentValue("marketing") });
  const sessionStorage = createStorage();

  const firstRuntime = loadAnalytics({
    url: "https://okagency.pl/?utm_source=google&utm_campaign=first&gclid=g-1",
    referrer: "https://google.com/search?q=agency",
    localStorage,
    sessionStorage,
  });
  const first = firstRuntime.window.okAnalytics.attribution();

  const internalRuntime = loadAnalytics({
    url: "https://okagency.pl/kontakt",
    referrer: "https://okagency.pl/diagnoza",
    localStorage,
    sessionStorage,
  });
  const internal = internalRuntime.window.okAnalytics.attribution();
  assert.deepEqual(plain(internal.first_touch), plain(first.first_touch));
  assert.deepEqual(plain(internal.last_touch), plain(first.last_touch));

  const nextRuntime = loadAnalytics({
    url: "https://okagency.pl/kontakt?utm_source=meta&utm_campaign=second&fbclid=f-2",
    referrer: "https://facebook.com/campaign/private-path",
    localStorage,
    sessionStorage,
  });
  const next = nextRuntime.window.okAnalytics.attribution();
  assert.deepEqual(plain(next.first_touch), plain(first.first_touch));
  assert.equal(next.last_touch.utm_source, "meta");
  assert.equal(next.last_touch.utm_campaign, "second");
  assert.equal(next.last_touch.fbclid, "f-2");
  assert.equal(next.last_touch.referrer, "https://facebook.com");
});

test("expired or v1 consent is invalidated and prompts again", () => {
  const expired = new Date(Date.now() - 181 * 24 * 60 * 60 * 1000).toISOString();
  for (const stored of [
    JSON.stringify({ version: 1, granted: true, at: new Date().toISOString() }),
    consentValue("marketing", expired),
  ]) {
    const localStorage = createStorage({ "ok-consent": stored });
    const runtime = loadAnalytics({
      localStorage,
      sessionStorage: createStorage({ "ok-attribution": "stale" }),
    });
    assert.equal(runtime.window.okConsent.state(), null);
    assert.ok(runtime.button("Analityka i reklamy"));
    assert.equal(runtime.scripts().some(src => src.includes("facebook.net")), false);
    assert.equal(localStorage.value("ok-consent"), null);
  }
});

test("page locations strip query and path values that look like PII", () => {
  const runtime = loadAnalytics({
    url: "https://okagency.pl/jan@example.com?utm_source=google&utm_campaign=tel501234567&utm_content=tel-%2B48%20501%20234%20567&gclid=click-ab123456789xyz&email=other@example.com#contact-form",
    localStorage: createStorage({ "ok-consent": consentValue("marketing") }),
  });
  const attribution = runtime.window.okAnalytics.attribution();
  assert.equal(
    attribution.first_touch.landing_page,
    "https://okagency.pl/?utm_source=google&gclid=click-ab123456789xyz",
  );
  assert.equal(attribution.first_touch.utm_campaign, undefined);
  assert.equal(attribution.first_touch.utm_content, undefined);
  assert.equal(attribution.first_touch.gclid, "click-ab123456789xyz");
  assert.equal(
    runtime.replacedUrl(),
    "https://okagency.pl/?utm_source=google&gclid=click-ab123456789xyz#contact-form",
  );
  const pageView = eventCommands(runtime).find(command => command[1] === "page_view");
  assert.equal(
    pageView[2].page_location,
    "https://okagency.pl/?utm_source=google&gclid=click-ab123456789xyz",
  );
  assert.doesNotMatch(
    JSON.stringify({ attribution, commands: runtime.commands() }),
    /jan@example\.com|other@example\.com|501234567|501%20234%20567|contact-form/,
  );
});

test("oversized attribution still replaces the browser URL with a sanitized fallback", () => {
  const gclid = `g-${"a".repeat(510)}`;
  const fbclid = `f-${"b".repeat(510)}`;
  const runtime = loadAnalytics({
    url: `https://okagency.pl/diagnoza?gclid=${gclid}&fbclid=${fbclid}&email=pii@example.com#diagnosis-outcome`,
    localStorage: createStorage({ "ok-consent": consentValue("marketing") }),
  });

  const replaced = runtime.replacedUrl();
  assert.ok(replaced, "sanitized browser URL must never be skipped");
  assert.ok(replaced.length <= 1000);
  assert.match(replaced, /gclid=g-/);
  assert.doesNotMatch(replaced, /fbclid|email|pii%40example\.com/i);
  assert.match(replaced, /#diagnosis-outcome$/);

  const pageView = eventCommands(runtime).find(command => command[1] === "page_view");
  assert.ok(pageView[2].page_location.length <= 1000);
  assert.match(pageView[2].page_location, /gclid=g-/);
  assert.doesNotMatch(pageView[2].page_location, /fbclid|email|pii%40example\.com|#diagnosis-outcome/i);
});

test("vendor URL keeps only an existing safe fragment and drops fragment PII", () => {
  const safeRuntime = loadAnalytics({
    url: "https://okagency.pl/kontakt?utm_source=google#contact-form",
    localStorage: createStorage({ "ok-consent": consentValue("marketing") }),
  });
  assert.match(safeRuntime.window.location.href, /#contact-form$/);
  assert.equal(safeRuntime.window.location.hash, "#contact-form");

  for (const hash of [
    "#jan%2540example%252Ecom",
    "#jan%25252540example%2525252Ecom",
    "#tel%252B48%252F501%252F234%252F567",
    "#not-an-existing-anchor",
  ]) {
    const runtime = loadAnalytics({
      url: `https://okagency.pl/kontakt?email=other@example.com${hash}`,
      localStorage: createStorage({ "ok-consent": consentValue("marketing") }),
    });
    assert.equal(runtime.replacedUrl(), "https://okagency.pl/kontakt");
    assert.equal(runtime.window.location.hash, "");
    assert.ok(runtime.scripts().some(src => src.includes("facebook.net")));
    assert.doesNotMatch(
      JSON.stringify({
        href: runtime.window.location.href,
        commands: runtime.commands(),
        pixel: runtime.pixelCommands(),
      }),
      /jan(?:%25|%40|@)|other(?:%40|@)|501(?:%2F|\/)?234(?:%2F|\/)?567|not-an-existing-anchor/i,
    );
  }
});

test("later fragment changes are scrubbed before subsequent vendor events", () => {
  const runtime = loadAnalytics({
    url: "https://okagency.pl/diagnoza?utm_source=google",
    localStorage: createStorage({ "ok-consent": consentValue("marketing") }),
  });

  runtime.window.location.hash = "#jan%2540example%252Ecom";
  runtime.dispatchWindow("hashchange");
  assert.equal(runtime.window.location.hash, "");

  runtime.window.location.hash = "#tel501234567";
  runtime.window.okAnalytics.diagnosisComplete("website");
  assert.equal(runtime.window.location.hash, "");

  runtime.window.location.hash = "#other%2540example%252Ecom";
  runtime.window.okAnalytics.generateLead("diagnosis", "lead-event-12345");
  assert.equal(runtime.window.location.hash, "");
  assert.doesNotMatch(
    JSON.stringify({ href: runtime.window.location.href, commands: runtime.commands() }),
    /jan|other|tel501|example(?:%252E|%2E|\.)com/i,
  );
});

test("deeply encoded contact data and labelled phone variants never enter attribution", () => {
  const runtime = loadAnalytics({
    url: "https://okagency.pl/jan%2540example%252Ecom?utm_source=google&utm_medium=%252B48%252F501%252F234%252F567&utm_campaign=jan%2540example%252Ecom&utm_content=tel501234567&utm_term=%2B48%C2%A0501%C2%A0234%C2%A0567&gclid=click-ab123456789xyz&gbraid=tel%252B48501234567&wbraid=jan%2540example%252Ecom&fbclid=+48501234567",
    localStorage: createStorage({ "ok-consent": consentValue("marketing") }),
  });
  const attribution = runtime.window.okAnalytics.attribution();

  assert.equal(
    attribution.first_touch.landing_page,
    "https://okagency.pl/?utm_source=google&gclid=click-ab123456789xyz",
  );
  assert.deepEqual(
    plain(Object.fromEntries(Object.entries(attribution.first_touch).filter(([key]) => key.startsWith("utm_") || key.endsWith("clid") || key.endsWith("braid")))),
    { utm_source: "google", gclid: "click-ab123456789xyz" },
  );
  assert.doesNotMatch(
    JSON.stringify({ attribution, commands: runtime.commands(), href: runtime.window.location.href }),
    /jan(?:%25|%40|@)|tel501|501(?:%2F|\/|\s)?234(?:%2F|\/|\s)?567/i,
  );
});

test("control and zero-width separators cannot hide contact data in paths or campaign values", () => {
  for (const unsafe of [
    "501\u200B234\u200B567",
    "tel\u200B501234567",
    "501\u0000 234\u0000 567",
    "jan\u200B@example.com",
    "tel/501234567",
    "tel501234567ext123",
  ]) {
    const encoded = encodeURIComponent(unsafe);
    const runtime = loadAnalytics({
      url: `https://okagency.pl/${encoded}?utm_content=${encoded}&gclid=click-ab123456789xyz`,
      localStorage: createStorage({ "ok-consent": consentValue("marketing") }),
    });
    const touch = runtime.window.okAnalytics.attribution().first_touch;
    assert.equal(touch.landing_page, "https://okagency.pl/?gclid=click-ab123456789xyz");
    assert.equal(touch.utm_content, undefined);
    assert.doesNotMatch(JSON.stringify(touch), /501|tel|jan|example/i);
  }
});

test("phone-number runs are removed from paths while safe click IDs remain", () => {
  for (const path of [
    "501234567",
    "tel/501234567",
    "lead/48501234567",
    "lead-501234567",
    "501234567.html",
    "id_48501234567_x",
  ]) {
    const runtime = loadAnalytics({
      url: `https://okagency.pl/${path}?gclid=click-ab123456789xyz`,
      localStorage: createStorage({ "ok-consent": consentValue("marketing") }),
    });
    const touch = runtime.window.okAnalytics.attribution().first_touch;
    assert.equal(touch.landing_page, "https://okagency.pl/?gclid=click-ab123456789xyz");
    assert.doesNotMatch(runtime.window.location.href, /501234567|48501234567/);
  }
});

test("dates, percent values and opaque technical IDs remain valid attribution", () => {
  const cases = [
    ["utm_term", "2026-08-03-01"],
    ["utm_medium", "50%-off"],
    ["utm_source", "50%25-off"],
    ["utm_content", "ad1234567890"],
    ["gclid", "1234567890"],
  ];
  for (const [key, value] of cases) {
    const params = { [key]: value };
    if (key !== "gclid") params.gclid = "click-ab123456789xyz";
    const query = new URLSearchParams(params);
    const runtime = loadAnalytics({
      url: `https://okagency.pl/diagnoza?${query}`,
      localStorage: createStorage({ "ok-consent": consentValue("marketing") }),
    });
    const touch = runtime.window.okAnalytics.attribution().first_touch;
    assert.equal(touch[key], value);
    assert.equal(touch.gclid, key === "gclid" ? value : "click-ab123456789xyz");
  }
});

test("unlabelled phone-length runs are rejected from non-technical campaign values", () => {
  for (const [key, value] of [
    ["utm_campaign", "1234567890"],
    ["utm_campaign", "jan-501234567"],
    ["utm_campaign", "campaign-1234567890"],
    ["utm_campaign", "campaign-1234567890-2"],
    ["utm_campaign", "1234567890-2"],
    ["utm_term", "summer-2026080312"],
    ["utm_content", "48501234567"],
  ]) {
    const query = new URLSearchParams({ [key]: value, gclid: "click-ab123456789xyz" });
    const runtime = loadAnalytics({
      url: `https://okagency.pl/diagnoza?${query}`,
      localStorage: createStorage({ "ok-consent": consentValue("marketing") }),
    });
    const touch = runtime.window.okAnalytics.attribution().first_touch;
    assert.equal(touch[key], undefined);
    assert.doesNotMatch(touch.landing_page, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.equal(touch.gclid, "click-ab123456789xyz");
  }
});

test("functional parameters have priority while final vendor URLs stay within 1000 characters", () => {
  const identifiers = {
    gclid: `g-${"f".repeat(510)}`,
    fbclid: `m-${"g".repeat(440)}`,
  };
  const baseRuntime = loadAnalytics({
    url: `https://okagency.pl/diagnoza?${new URLSearchParams(identifiers)}`,
    localStorage: createStorage({ "ok-consent": consentValue("marketing") }),
  });
  const basePageView = eventCommands(baseRuntime).find(command => command[1] === "page_view");
  assert.ok(basePageView[2].page_location.length > 980);
  assert.match(basePageView[2].page_location, /fbclid=m-/);

  const query = new URLSearchParams({
    ...identifiers,
    context: "diagnosis",
  });
  const runtime = loadAnalytics({
    url: `https://okagency.pl/kontakt?${query}`,
    localStorage: createStorage({ "ok-consent": consentValue("marketing") }),
  });
  const pageView = eventCommands(runtime).find(command => command[1] === "page_view");

  assert.ok(runtime.replacedUrl().length <= 1000);
  assert.ok(pageView[2].page_location.length <= 1000);
  assert.equal(new URL(runtime.replacedUrl()).searchParams.get("context"), "diagnosis");
  assert.equal(new URL(pageView[2].page_location).searchParams.get("context"), "diagnosis");
  assert.match(pageView[2].page_location, /gclid=g-/);
  assert.doesNotMatch(pageView[2].page_location, /fbclid/);
});

test("unsafe location blocks Google and Meta when replaceState is missing, throws or is ineffective", () => {
  for (const replaceStateMode of ["missing", "throw", "noop"]) {
    const runtime = loadAnalytics({
      url: "https://okagency.pl/kontakt?email=pii@example.com#jan@example.com",
      localStorage: createStorage({ "ok-consent": consentValue("marketing") }),
      replaceStateMode,
    });
    assert.equal(runtime.replacedUrl(), null);
    assert.equal(runtime.scripts().some(src => /googletagmanager|facebook\.net/.test(src)), false);
    assert.equal(runtime.pixelCommands().length, 0);
  }
});

test("analytics-to-marketing upgrade never grants vendors before an unsafe URL is scrubbed", () => {
  for (const replaceStateMode of ["throw", "noop"]) {
    const localStorage = createStorage({ "ok-consent": consentValue("analytics") });
    const runtime = loadAnalytics({ localStorage });
    const consentUpdatesBefore = runtime.commands().filter(command => (
      command[0] === "consent" && command[1] === "update"
    )).length;

    runtime.window.location.href = "https://okagency.pl/kontakt?email=pii@example.com#jan@example.com";
    runtime.setReplaceStateMode(replaceStateMode);
    localStorage.setItem("ok-consent", consentValue("marketing"));
    runtime.dispatchStorage("ok-consent");

    const consentUpdatesAfter = runtime.commands().filter(command => (
      command[0] === "consent" && command[1] === "update"
    )).length;
    assert.equal(consentUpdatesAfter, consentUpdatesBefore);
    assert.equal(runtime.scripts().some(src => src.includes("facebook.net")), false);
    assert.equal(runtime.pixelCommands().length, 0);
    assert.equal(runtime.commands().some(command => command[0] === "config" && command[1] === "AW-18361103115"), false);
  }
});

test("DiagnosisComplete tracker emits once per completion and resets for a new run", () => {
  const sandbox = {
    document: { querySelector: () => null },
    window: {},
  };
  vm.runInNewContext(diagnosisSource, sandbox, {
    filename: join(root, "assets", "services", "diagnosis", "script.js"),
  });
  const calls = [];
  const tracker = sandbox.window.OKAgencyDiagnosis.createCompletionTracker(outcome => calls.push(outcome));

  assert.equal(tracker.complete("website"), true);
  assert.equal(tracker.complete("social"), false);
  assert.deepEqual(calls, ["website"]);
  tracker.reset();
  assert.equal(tracker.complete("campaign"), true);
  assert.deepEqual(calls, ["website", "campaign"]);
});
