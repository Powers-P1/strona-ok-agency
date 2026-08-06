import { readFile } from "node:fs/promises";
import { createHmac, randomBytes, randomUUID } from "node:crypto";

const envFile = process.env.AUDIT_STAGING_ENV_FILE;
const origin = process.env.AUDIT_TEST_ORIGIN || "https://okagency.pl";
const webhook = process.env.AUDIT_N8N_WEBHOOK || "http://127.0.0.1:5678/webhook/okagency-site-audit-intake";
if (!envFile) throw new Error("Set AUDIT_STAGING_ENV_FILE to the protected staging env file.");

const secrets = Object.fromEntries(
  (await readFile(envFile, "utf8"))
    .split(/\r?\n/)
    .filter(line => line && !line.startsWith("#"))
    .map(line => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
);
const secret = secrets.WORKER_N8N_HMAC_SECRET;
if (!secret || secret.length < 32) throw new Error("Missing WORKER_N8N_HMAC_SECRET.");

const jobId = randomUUID();
const task = {
  jobId,
  origin,
  callbackUrl: `https://okagency.pl/api/site-audits/${jobId}/callback`,
  rulesetVersion: "2026.08.2",
  scannerVersion: "2.0.4",
};
const signedPayload = Buffer.from(JSON.stringify(task)).toString("base64url");
const timestamp = String(Math.floor(Date.now() / 1000));
const nonce = randomBytes(18).toString("base64url");
const signature = createHmac("sha256", secret).update(`${timestamp}.${nonce}.${signedPayload}`).digest("hex");
const response = await fetch(webhook, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-ok-timestamp": timestamp,
    "x-ok-nonce": nonce,
    "x-ok-signature": signature,
  },
  body: JSON.stringify({ signedPayload }),
  signal: AbortSignal.timeout(10_000),
});
console.log(JSON.stringify({ jobId, accepted: response.ok, status: response.status }));
if (!response.ok) process.exitCode = 1;
