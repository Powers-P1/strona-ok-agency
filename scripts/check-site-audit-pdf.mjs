import { readFile, rm, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFDocument } from "pdf-lib";
import { buildAuditPdf } from "../assets/services/site-audit/pdf-export-source.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const keep = process.argv.includes("--keep");
const outputDirectory = path.join(root, "tmp", "pdfs");
const outputPath = path.join(outputDirectory, "site-audit-fixture.pdf");
const categories = ["performance", "seo", "accessibility", "technical", "security", "conversion", "trust"];
const labels = {
  performance: "Mobilna wydajność Lighthouse",
  seo: "Tytuł dokumentu",
  accessibility: "Etykiety pól formularzy",
  technical: "DNSSEC",
  security: "Content Security Policy",
  conversion: "Wezwania do działania",
  trust: "Informacje prawne i prywatność",
};
const checks = categories.map((category, index) => ({
  id: `${category}_fixture`,
  category,
  status: index % 3 === 0 ? "warning" : "pass",
  severity: index % 3 === 0 ? "medium" : "low",
  title: labels[category],
  observation: index % 3 === 0
    ? "Kontrola wykryła element, który warto dopracować i zweryfikować po wdrożeniu."
    : "Kontrola potwierdziła poprawną konfigurację w zakresie pasywnego pomiaru.",
  recommendation: index % 3 === 0 ? "Wprowadź zmianę systemowo i powtórz pomiar na środowisku produkcyjnym." : "",
  source: "Kontrolna próbka raportu 2.0",
  weight: 1,
}));
const report = {
  schemaVersion: "2.0",
  rulesetVersion: "2026.08.2",
  scannerVersion: "2.0.0",
  generatedAt: "2026-08-05T12:00:00.000Z",
  origin: "https://przykladowa-firma.pl",
  finalUrl: "https://przykladowa-firma.pl/",
  summary: "Podstawy działają, ale kilka elementów wymaga dopracowania w pierwszej kolejności.",
  overallScore: 82,
  confidence: "high",
  coverage: 100,
  categories: Object.fromEntries(categories.map((category, index) => [category, {
    score: index % 3 === 0 ? 72 : 94,
    status: index % 3 === 0 ? "warning" : "pass",
    checked: 1,
    total: 1,
    weight: 1,
  }])),
  priorities: checks.filter(check => check.status === "warning").slice(0, 3),
  strengths: checks.filter(check => check.status === "pass").map(check => check.title),
  checks,
  measurements: {},
  limitations: [
    "Audyt analizuje publicznie dostępne zasoby bez logowania i nie jest testem penetracyjnym.",
    "Wynik jest próbką kontrolną generatora PDF.",
  ],
  partial: false,
};

const originalFetch = globalThis.fetch;
globalThis.fetch = async url => {
  const value = String(url);
  const filename = value.endsWith("barlow-condensed-600.ttf") ? "barlow-condensed-600.ttf" : "archivo-variable.ttf";
  const bytes = await readFile(path.join(root, "assets", "fonts", "pdf", filename));
  return new Response(bytes, { status: 200, headers: { "content-type": "font/ttf" } });
};

try {
  const bytes = await buildAuditPdf(report);
  if (bytes.byteLength < 20_000) throw new Error("Wygenerowany PDF jest nieoczekiwanie mały.");
  const reopened = await PDFDocument.load(bytes);
  if (reopened.getPageCount() < 3) throw new Error("Wygenerowany PDF ma niepełny układ stron.");
  if (!reopened.getTitle()?.includes("przykladowa-firma.pl")) throw new Error("PDF nie zachował tytułu dokumentu.");
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputPath, bytes);
  console.log(`PDF audytu: ${reopened.getPageCount()} stron, ${bytes.byteLength} B, metadane i ponowne otwarcie OK.`);
  if (keep) console.log(outputPath);
} finally {
  globalThis.fetch = originalFetch;
  if (!keep) await rm(outputPath, { force: true });
}
