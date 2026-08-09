import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFile(join(root, path), "utf8");

const [
  analytics,
  diagnosisClient,
  siteAuditClient,
  contactClient,
  diagnosisHtml,
  siteAuditHtml,
  contactHtml,
  headers,
  privacy,
] = await Promise.all([
  read("assets/analytics.js"),
  read("assets/services/diagnosis/script.js"),
  read("assets/services/site-audit/script.js"),
  read("assets/page-contact.js"),
  read("diagnoza.html"),
  read("diagnoza-www.html"),
  read("kontakt.html"),
  read("_headers"),
  read("polityka-prywatnosci.html"),
]);

test("all diagnosis stages are wired without sending answer values", () => {
  for (const event of [
    "diagnosis_view",
    "diagnosis_start",
    "diagnosis_step_completed",
    "diagnosis_complete",
    "diagnosis_result_cta_click",
    "diagnosis_contact_open",
    "diagnosis_form_start",
    "diagnosis_submit_attempt",
    "diagnosis_validation_error",
    "diagnosis_submit_error",
    "generate_lead",
  ]) assert.match(analytics, new RegExp("[\"']" + event + "[\"']"), "missing " + event);

  for (const method of [
    "diagnosisStart",
    "diagnosisStepCompleted",
    "diagnosisComplete",
    "diagnosisResultCtaClicked",
    "diagnosisContactOpened",
    "formStarted",
    "formSubmitAttempt",
    "formValidationError",
    "formSubmitError",
    "generateLead",
  ]) assert.match(diagnosisClient, new RegExp("okAnalytics\\?\\." + method), "missing client call " + method);

  assert.doesNotMatch(analytics, /answer_value|answer_text|field_value|message_content/);
});

test("site audit and contact diagnostics cover starts, validation, failures and confirmed leads", () => {
  for (const method of [
    "siteAuditFormStarted",
    "siteAuditSubmitAttempt",
    "siteAuditValidationError",
    "siteAuditStarted",
    "siteAuditCompleted",
    "siteAuditFailed",
  ]) assert.match(siteAuditClient, new RegExp("okAnalytics\\?\\." + method), "missing site audit call " + method);

  for (const method of [
    "contactFormStarted",
    "contactSubmitAttempt",
    "contactValidationError",
    "contactSubmitError",
    "generateLead",
  ]) assert.match(contactClient, new RegExp("okAnalytics\\?\\." + method), "missing contact call " + method);

  assert.match(diagnosisClient, /response\.ok[^\n]+result\.ok[^\n]+throw/);
  assert.match(contactClient, /response\.ok[^\n]+result\.ok[^\n]+throw/);
});

test("Clarity is consent-gated, production-only, CSP-allowed and masks sensitive UI", () => {
  assert.match(analytics, /isProductionHost/);
  assert.match(analytics, /consentv2/);
  assert.match(analytics, /analytics_Storage:\s*analyticsGranted\s*\?\s*"granted"\s*:\s*"denied"/);
  assert.match(analytics, /www\.clarity\.ms\/tag/);
  assert.match(headers, /script-src[^;]*www\.clarity\.ms/);
  assert.match(headers, /connect-src[^;]*\*\.clarity\.ms[^;]*c\.bing\.com/);
  assert.match(diagnosisHtml, /data-result-lead-form data-clarity-mask="true"/);
  assert.equal((diagnosisHtml.match(/data-question-step="[1-4]" data-clarity-mask="true"/g) || []).length, 4);
  assert.match(siteAuditHtml, /data-audit-form data-clarity-mask="true"/);
  assert.match(contactHtml, /id="contact-form" data-clarity-mask="true"/);
  assert.match(privacy, /Microsoft Clarity/);
});

test("production tracking asset version is consistent on every public HTML page", async () => {
  const publicPages = [
    "404.html",
    "diagnoza.html",
    "diagnoza-www.html",
    "dostepnosc.html",
    "faq.html",
    "index.html",
    "kampanie.html",
    "kontakt.html",
    "menu.html",
    "o-nas.html",
    "polityka-prywatnosci.html",
    "proces.html",
    "social-media.html",
    "strony-internetowe.html",
  ];
  for (const page of publicPages) {
    const source = await read(page);
    assert.match(source, /\/assets\/analytics\.js\?v=20260810-1/, page + " has stale analytics asset");
  }
});
