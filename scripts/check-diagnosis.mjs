import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const diagnosisPath = join(root, "assets", "services", "diagnosis", "script.js");
const diagnosisSource = await readFile(diagnosisPath, "utf8");
const diagnosisHtml = await readFile(join(root, "diagnoza.html"), "utf8");
const diagnosisStyles = await readFile(join(root, "assets", "services", "diagnosis", "styles.css"), "utf8");
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

const requiredDiagnosisCopy = [
  "Wynik dostajesz od razu — bez zapisu i podawania danych.",
  "Jeśli chcesz omówić wynik, przejdź do opcjonalnego kontaktu.",
  "Abyśmy mogli odpowiedzieć, podaj imię i e-mail.",
  "E-mail do odpowiedzi",
  "Poproś o kontakt",
  "Wróć do wyniku",
];
for (const copy of requiredDiagnosisCopy) {
  if (!diagnosisHtml.includes(copy)) failures.push(`Diagnoza: brak copy „${copy}”`);
}

const panelMatches = diagnosisHtml.match(/data-outcome-panel="(result|contact)"/g) || [];
if (panelMatches.length !== 2) failures.push("Diagnoza: ostatni akt musi mieć dokładnie dwa panele result/contact");
if (!/data-outcome-panel="result"[^>]*aria-hidden="false"/.test(diagnosisHtml)) {
  failures.push("Diagnoza: panel result nie jest początkowo dostępny");
}
if (!/data-outcome-panel="contact"[^>]*aria-hidden="true"[^>]*inert/.test(diagnosisHtml)) {
  failures.push("Diagnoza: panel contact nie jest początkowo ukryty przez aria-hidden i inert");
}
if (!diagnosisSource.includes('panel.setAttribute("aria-hidden", String(!active))') ||
    !diagnosisSource.includes("panel.inert = !active") ||
    !diagnosisSource.includes('showOutcomePanel("contact")') ||
    !diagnosisSource.includes('showOutcomePanel("result")')) {
  failures.push("Diagnoza: JS nie steruje rozłącznymi panelami, aria-hidden i inert");
}
if (!diagnosisHtml.includes('name="email" type="email"') || !diagnosisHtml.includes("required maxlength=\"254\"")) {
  failures.push("Diagnoza: e-mail nie jest wymagany");
}
if (!diagnosisHtml.includes('id="diagnosis-turnstile"') || !diagnosisSource.includes('fetch("/api/contact"')) {
  failures.push("Diagnoza: brak zachowanego Turnstile lub API /api/contact");
}
if (/\.diagnosis-frame\s*\{[^}]*overflow-y\s*:\s*auto/s.test(diagnosisStyles)) {
  failures.push("Diagnoza: niedozwolony wewnętrzny scroller ramki");
}
if (/\.result-lead-field\s*\{[^}]*flex(?:-basis)?\s*:/s.test(diagnosisStyles)) {
  failures.push("Diagnoza: pola kontaktu nie mogą opierać przepływu na flex-basis");
}

for (const token of [
  "--diagnosis-map-text: var(--ok-color-text-on-dark, var(--cream))",
  "--diagnosis-map-muted: var(--ok-color-text-muted-on-dark, #d2c2b4)",
]) {
  if (!diagnosisStyles.includes(token)) {
    failures.push(`Diagnoza: ciemna mapa nie korzysta z kontraktu ${token}`);
  }
}
if (/\.map-interface\s*\{[^}]*text-on-light/s.test(diagnosisStyles) ||
    /@media\s*\([^)]*min-width[^)]*\)[\s\S]*?\.map-interface\s*\{[^}]*text-on-light/s.test(diagnosisStyles)) {
  failures.push("Diagnoza: mapa na ciemnym tle nie moze uzywac tokenow text-on-light");
}

if (failures.length) {
  console.error(`Błędy Diagnozy (${failures.length}):`);
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log("OK: wyniki, mapowania i rozłączne stany result/contact Diagnozy spełniają kontrakt.");
}
