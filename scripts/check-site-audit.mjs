import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = relative => readFile(path.join(root, relative), "utf8");

const [html, client, policy, accessibility, sitemap, navigation, workerConfig, migration] = await Promise.all([
  read("diagnoza-www.html"),
  read("assets/services/site-audit/script.js"),
  read("polityka-prywatnosci.html"),
  read("dostepnosc.html"),
  read("sitemap.xml"),
  read("assets/navigation.js"),
  read("wrangler.site-audit.jsonc"),
  read("migrations/site-audit/0001_jobs.sql"),
]);

const noticeVersion = "site-audit-v1-2026-08-04";

assert.match(html, /name="authorization"[^>]*required/);
assert.doesNotMatch(html, /name="authorization"[^>]*checked/);
assert.match(html, /data-action="site_audit"/);
assert.match(html, /polityka-prywatnosci#rozszerzona-diagnostyka/);
assert.match(client, new RegExp(`NOTICE_VERSION = ["']${noticeVersion}["']`));
assert.match(client, /textContent/);
assert.doesNotMatch(client, /innerHTML\s*=/);
assert.match(client, /sessionStorage\.setItem/);
assert.match(policy, /id="rozszerzona-diagnostyka"/);
assert.match(policy, /7 dniach/);
assert.match(policy, /Nie loguje się, nie zgaduje haseł, nie skanuje portów/);
assert.match(accessibility, /Rozszerzona diagnostyka WWW/);
assert.match(sitemap, /https:\/\/okagency\.pl\/diagnoza-www/);
assert.match(navigation, /"diagnoza-www": "offer"/);
assert.match(workerConfig, /"binding": "DB"/);
assert.match(workerConfig, /"binding": "AUDIT_QUEUE"/);
assert.match(workerConfig, /"dead_letter_queue": "okagency-site-audits-dlq"/);
assert.match(migration, /daily_global_limit[^\n]*100/i);
assert.match(migration, /daily_domain_limit[^\n]*3/i);

const workflowDir = path.join(root, "n8n", "workflows");
const workflowNames = (await readdir(workflowDir)).filter(name => name.endsWith(".json"));
assert.equal(workflowNames.length, 6, "Oczekiwano sześciu workflowów AUDIT-*");

const workflows = await Promise.all(workflowNames.map(async name => JSON.parse(await readFile(path.join(workflowDir, name), "utf8"))));
assert.ok(workflows.some(workflow => workflow.name === "AUDIT-00 Intake & Orchestrator"));
assert.ok(workflows.some(workflow => workflow.name === "AUDIT-40 Score & Report"));
assert.ok(workflows.every(workflow => workflow.name.startsWith("AUDIT-")));

const serialized = JSON.stringify(workflows);
assert.match(serialized, /x-ok-signature/i);
assert.doesNotMatch(serialized, /0x4AAAAA[A-Za-z0-9_-]{20,}/, "Sekret Turnstile nie może trafić do workflowów");
assert.doesNotMatch(serialized, /sk-[A-Za-z0-9_-]{16,}/, "Klucz dostawcy AI nie może trafić do workflowów");

const operations = await read("docs/SITE-AUDIT-OPERATIONS.md");
for (const binding of ["TURNSTILE_SECRET", "WORKER_N8N_HMAC_SECRET", "N8N_CALLBACK_HMAC_SECRET", "N8N_WEBHOOK_URL", "CF_ACCESS_CLIENT_ID", "CF_ACCESS_CLIENT_SECRET"]) {
  assert.match(operations, new RegExp(`\\b${binding}\\b`), `Brak ${binding} w instrukcji operacyjnej`);
}

console.log("Rozszerzona diagnostyka: kontrakt strony, polityki, Workera i n8n jest spójny.");
