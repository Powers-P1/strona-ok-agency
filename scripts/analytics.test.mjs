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
  version: 2,
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
} = {}) {
  const head = new FakeElement("head");
  const body = new FakeElement("body");
  const documentListeners = new Map();
  const windowListeners = new Map();
  const document = {
    body,
    head,
    readyState: "complete",
    referrer,
    createElement: tagName => new FakeElement(tagName),
    addEventListener(name, listener) {
      documentListeners.set(name, listener);
    },
  };
  let reloadCount = 0;
  let replacedUrl = null;
  const location = new URL(url);
  location.reload = () => { reloadCount += 1; };
  const window = {
    location,
    crypto: { randomUUID: () => "runtime-event-id-12345" },
    history: {
      state: null,
      replaceState(_state, _title, nextUrl) {
        replacedUrl = String(nextUrl);
      },
    },
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

  return {
    body,
    button,
    commands,
    dispatchStorage,
    localStorage,
    pixelCommands,
    reloadCount: () => reloadCount,
    replacedUrl: () => replacedUrl,
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
  assert.equal(stored.version, 2);
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
  runtime.window.okAnalytics.generateLead("diagnosis", "lead-event-12345");

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
    url: "https://okagency.pl/jan@example.com?utm_source=google&email=other@example.com",
    localStorage: createStorage({ "ok-consent": consentValue("marketing") }),
  });
  const attribution = runtime.window.okAnalytics.attribution();
  assert.equal(attribution.first_touch.landing_page, "https://okagency.pl/?utm_source=google");
  assert.equal(runtime.replacedUrl(), "https://okagency.pl/?utm_source=google");
  assert.doesNotMatch(JSON.stringify(runtime.commands()), /jan@example\.com|other@example\.com/);
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
