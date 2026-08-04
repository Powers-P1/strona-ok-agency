import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workflowsDir = join(root, "n8n", "workflows");
const apiUrl = String(process.env.N8N_API_URL || "http://127.0.0.1:5678/api/v1").replace(/\/$/, "");
const apiKey = process.env.N8N_API_KEY;
const activate = process.argv.includes("--activate");

if (!apiKey) throw new Error("Ustaw N8N_API_KEY w środowisku procesu. Nie zapisuj klucza w repozytorium.");

async function api(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-n8n-api-key": apiKey,
      ...(options.headers || {}),
    },
    signal: AbortSignal.timeout(30_000),
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(`n8n API ${response.status}: ${body?.message || "request failed"}`);
  return body;
}

function writableWorkflow(template) {
  return {
    name: template.name,
    nodes: template.nodes,
    connections: template.connections,
    settings: template.settings || {},
  };
}

async function readTemplate(file, replacements = {}) {
  let source = await readFile(join(workflowsDir, file), "utf8");
  for (const [placeholder, value] of Object.entries(replacements)) source = source.replaceAll(placeholder, value);
  return JSON.parse(source);
}

const list = await api("/workflows?limit=100");
const existing = new Map((list.data || []).map(workflow => [workflow.name, workflow]));

async function upsert(template) {
  const current = existing.get(template.name);
  const body = JSON.stringify(writableWorkflow(template));
  const saved = current
    ? await api(`/workflows/${current.id}`, { method: "PUT", body })
    : await api("/workflows", { method: "POST", body });
  existing.set(saved.name, saved);
  console.log(`${current ? "updated" : "created"}: ${saved.name} (${saved.id})`);
  return saved;
}

const definitions = [
  ["AUDIT-10-web-seo.json", "__AUDIT_10_ID__"],
  ["AUDIT-20-conversion.json", "__AUDIT_20_ID__"],
  ["AUDIT-30-trust-security.json", "__AUDIT_30_ID__"],
  ["AUDIT-40-score-report.json", "__AUDIT_40_ID__"],
  ["AUDIT-99-error-handler.json", "__AUDIT_99_ID__"],
];
const ids = {};
for (const [file, placeholder] of definitions) {
  const saved = await upsert(await readTemplate(file));
  ids[placeholder] = saved.id;
}
const orchestrator = await upsert(await readTemplate("AUDIT-00-intake-orchestrator.json", ids));

if (activate) {
  await api(`/workflows/${orchestrator.id}/activate`, { method: "POST", body: "{}" });
  console.log(`activated: ${orchestrator.name} (${orchestrator.id})`);
} else {
  console.log("Orchestrator pozostaje nieaktywny. Użyj --activate dopiero po uruchomieniu audit-runnera.");
}
