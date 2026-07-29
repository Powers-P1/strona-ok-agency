import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const diagnosisPath = join(root, "assets", "services", "diagnosis", "script.js");
const diagnosisSource = await readFile(diagnosisPath, "utf8");
const contactSource = await readFile(join(root, "assets", "page-contact.js"), "utf8");
const contactHtml = await readFile(join(root, "kontakt.html"), "utf8");
const sandbox = {
  window: {},
  document: { querySelector: () => null },
};

vm.runInNewContext(diagnosisSource, sandbox, { filename: diagnosisPath });
const calculateOutcome = sandbox.window.OKAgencyDiagnosis?.calculateOutcome;
const failures = [];

if (typeof calculateOutcome !== "function") {
  failures.push("API calculateOutcome nie jest dostępne");
} else {
  const cases = [
    ["website", { q1: "offer", q2: "site-weak", q3: "basics", q4: "website" }],
    ["social", { q1: "rhythm", q2: "site-strong", q3: "site", q4: "social" }],
    ["campaign", { q1: "leads", q2: "site-strong", q3: "stack", q4: "campaign" }],
    ["conversation", { q1: "mixed", q2: "fragmented", q3: "pieces", q4: "talk" }],
    ["none", { q1: "mixed", q2: "fragmented", q3: "pieces", q4: "none" }],
  ];

  for (const [expected, answers] of cases) {
    const actual = calculateOutcome(answers);
    if (actual !== expected) failures.push(`wynik ${expected}: otrzymano ${actual}`);
  }
}

const routes = [
  "/kontakt?context=web&source=diagnosis",
  "/kontakt?context=social&source=diagnosis",
  "/kontakt?context=campaign&source=diagnosis",
  "/kontakt?context=conversation&source=diagnosis",
  "/kontakt?context=none&source=diagnosis",
];
for (const route of routes) {
  if (!diagnosisSource.includes(route)) failures.push(`Diagnoza: brak trasy ${route}`);
}

const mappings = new Map([
  ["web", "Strona internetowa"],
  ["website", "Strona internetowa"],
  ["social", "Social media"],
  ["campaign", "Kampania płatna"],
  ["conversation", "Diagnoza / uporządkowanie problemu"],
  ["none", "Inny temat"],
]);
for (const [context, topic] of mappings) {
  if (!contactSource.includes(`["${context}", "${topic}"]`)) failures.push(`Kontakt: brak mapowania ${context}`);
  if (!contactHtml.includes(`value="${topic}"`)) failures.push(`Kontakt: brak opcji „${topic}”`);
}

if (failures.length) {
  console.error(`Błędy Diagnozy (${failures.length}):`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log("OK: pięć wyników Diagnozy i sześć mapowań kontaktu działa deterministycznie.");
}
