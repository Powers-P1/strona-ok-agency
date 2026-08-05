import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";

const PAGE = Object.freeze({ width: 595.28, height: 841.89, margin: 48 });
const COLORS = Object.freeze({
  navy: rgb(7 / 255, 26 / 255, 44 / 255),
  muted: rgb(74 / 255, 87 / 255, 98 / 255),
  paper: rgb(234 / 255, 217 / 255, 203 / 255),
  cream: rgb(240 / 255, 223 / 255, 207 / 255),
  accent: rgb(181 / 255, 36 / 255, 84 / 255),
  white: rgb(1, 1, 1),
});

const CATEGORY_LABELS = Object.freeze({
  performance: "Wydajność",
  seo: "SEO i indeksowanie",
  accessibility: "Dostępność",
  technical: "Domena i DNS",
  security: "HTTPS i bezpieczeństwo",
  conversion: "Konwersja i UX",
  trust: "Zaufanie i treść",
});

const STATUS_LABELS = Object.freeze({
  pass: "Zaliczone",
  warning: "Do sprawdzenia",
  fail: "Problem",
  unknown: "Nieweryfikowalne",
  not_applicable: "Nie dotyczy",
});

const CONFIDENCE_LABELS = Object.freeze({
  high: "pełny pomiar",
  medium: "pomiar częściowy",
  low: "ograniczony pomiar",
});

const cleanText = (value, fallback = "") => String(value ?? fallback)
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const dateLabel = value => {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("pl-PL", { dateStyle: "long", timeStyle: "short" }).format(date);
};

const safeFilenamePart = value => cleanText(value, "strona")
  .replace(/^https?:\/\//i, "")
  .replace(/[^a-z0-9.-]+/gi, "-")
  .replace(/^-+|-+$/g, "")
  .slice(0, 80) || "strona";

const wrapText = (text, font, size, maxWidth) => {
  const paragraphs = cleanText(text).split(/\n+/);
  const lines = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      if (font.widthOfTextAtSize(word, size) <= maxWidth) {
        line = word;
        continue;
      }
      let fragment = "";
      for (const character of word) {
        const candidateFragment = `${fragment}${character}`;
        if (font.widthOfTextAtSize(candidateFragment, size) > maxWidth && fragment) {
          lines.push(fragment);
          fragment = character;
        } else fragment = candidateFragment;
      }
      line = fragment;
    }
    if (line) lines.push(line);
  }
  return lines.length ? lines : [""];
};

const fetchFont = async url => {
  const response = await fetch(url, { credentials: "same-origin" });
  if (!response.ok) throw new Error(`Nie udało się pobrać fontu raportu (${response.status}).`);
  return response.arrayBuffer();
};

const createWriter = (pdf, fonts) => {
  let page;
  let y;
  const contentWidth = PAGE.width - (2 * PAGE.margin);

  const newPage = ({ dark = false } = {}) => {
    page = pdf.addPage([PAGE.width, PAGE.height]);
    page.drawRectangle({ x: 0, y: 0, width: PAGE.width, height: PAGE.height, color: dark ? COLORS.navy : COLORS.paper });
    y = PAGE.height - PAGE.margin;
    return page;
  };

  const ensure = height => {
    if (!page || y - height < PAGE.margin + 24) newPage();
  };

  const rule = ({ color = COLORS.navy, opacity = 0.18, gap = 14 } = {}) => {
    ensure(gap * 2);
    page.drawLine({ start: { x: PAGE.margin, y }, end: { x: PAGE.width - PAGE.margin, y }, thickness: 0.7, color, opacity });
    y -= gap;
  };

  const text = (value, {
    font = fonts.body,
    size = 10.2,
    color = COLORS.navy,
    lineHeight = size * 1.42,
    maxWidth = contentWidth,
    x = PAGE.margin,
    gapAfter = 8,
  } = {}) => {
    const lines = wrapText(value, font, size, maxWidth);
    ensure((lines.length * lineHeight) + gapAfter);
    for (const line of lines) {
      page.drawText(line, { x, y: y - size, size, font, color });
      y -= lineHeight;
    }
    y -= gapAfter;
    return lines.length;
  };

  const heading = (value, { size = 24, gapBefore = 14, gapAfter = 12 } = {}) => {
    ensure(size * 2 + gapBefore + gapAfter);
    y -= gapBefore;
    return text(value, { font: fonts.display, size, lineHeight: size * 1.02, gapAfter });
  };

  const kicker = value => text(cleanText(value).toUpperCase(), {
    font: fonts.bodyBold,
    size: 7.8,
    color: COLORS.accent,
    lineHeight: 10,
    gapAfter: 7,
  });

  const item = (title, observation, recommendation, status) => {
    const marker = status === "fail" || status === "warning" ? COLORS.accent : COLORS.muted;
    const available = PAGE.width - PAGE.margin * 2 - 18;
    const titleLines = wrapText(`${cleanText(title)} · ${STATUS_LABELS[status] || status}`, fonts.bodyBold, 10.3, available);
    const observationLines = wrapText(observation, fonts.body, 9.3, available);
    const recommendationLines = recommendation ? wrapText(`Zalecenie: ${recommendation}`, fonts.body, 9.3, available) : [];
    const height = 12 + titleLines.length * 13 + observationLines.length * 13 + recommendationLines.length * 13 + 10;
    ensure(height);
    page.drawRectangle({ x: PAGE.margin, y: y - height + 5, width: 3, height: height - 5, color: marker });
    text(titleLines.join(" "), { font: fonts.bodyBold, size: 10.3, lineHeight: 13, maxWidth: available, x: PAGE.margin + 15, gapAfter: 2 });
    text(observation, { size: 9.3, lineHeight: 13, color: COLORS.navy, maxWidth: available, x: PAGE.margin + 15, gapAfter: 2 });
    if (recommendation) text(`Zalecenie: ${recommendation}`, { size: 9.3, lineHeight: 13, color: COLORS.muted, maxWidth: available, x: PAGE.margin + 15, gapAfter: 8 });
  };

  return { newPage, ensure, rule, text, heading, kicker, item, getPage: () => page, getY: () => y, setY: value => { y = value; }, contentWidth };
};

export async function buildAuditPdf(report) {
  if (report?.schemaVersion !== "2.0" || !Array.isArray(report?.checks)) {
    throw new Error("Raport ma nieobsługiwany format.");
  }

  const [bodyBytes, displayBytes] = await Promise.all([
    fetchFont("/assets/fonts/pdf/archivo-variable.ttf"),
    fetchFont("/assets/fonts/pdf/barlow-condensed-600.ttf"),
  ]);
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const body = await pdf.embedFont(bodyBytes, { subset: true });
  const bodyBold = await pdf.embedFont(bodyBytes, { subset: true, customName: "Archivo Bold" });
  const display = await pdf.embedFont(displayBytes, { subset: true });
  const fonts = { body, bodyBold, display };
  const writer = createWriter(pdf, fonts);

  pdf.setTitle(`Audyt strony WWW — ${cleanText(report.origin, "strona")}`);
  pdf.setAuthor("OK Agency");
  pdf.setSubject("Pasywna diagnostyka publicznie dostępnej strony WWW");
  pdf.setKeywords(["audyt strony", "SEO", "DNS", "HTTPS", "dostępność", "wydajność"]);
  pdf.setCreator("OK Agency — rozszerzona diagnostyka");
  pdf.setProducer("OK Agency — generator lokalny w przeglądarce");
  pdf.setCreationDate(new Date(report.generatedAt || Date.now()));

  const cover = writer.newPage({ dark: true });
  cover.drawText("OK AGENCY", { x: PAGE.margin, y: PAGE.height - PAGE.margin - 12, size: 10, font: bodyBold, color: COLORS.cream });
  cover.drawText("ROZSZERZONA DIAGNOSTYKA", { x: PAGE.margin, y: PAGE.height - 178, size: 9, font: bodyBold, color: COLORS.accent });
  const titleLines = wrapText("Audyt strony WWW", display, 49, PAGE.width - PAGE.margin * 2);
  let coverY = PAGE.height - 222;
  for (const line of titleLines) {
    cover.drawText(line, { x: PAGE.margin, y: coverY, size: 49, font: display, color: COLORS.cream });
    coverY -= 49;
  }
  cover.drawText(cleanText(report.origin, "Nieznana domena"), { x: PAGE.margin, y: coverY - 28, size: 12, font: body, color: COLORS.cream, maxWidth: PAGE.width - PAGE.margin * 2 });
  cover.drawText(String(report.overallScore ?? "—"), { x: PAGE.margin, y: 178, size: 80, font: display, color: COLORS.cream });
  cover.drawText("/ 100", { x: PAGE.margin + 106, y: 184, size: 12, font: bodyBold, color: COLORS.cream });
  cover.drawText(`${CONFIDENCE_LABELS[report.confidence] || "pomiar"} · pokrycie ${report.coverage ?? "—"}%`, { x: PAGE.margin, y: 136, size: 9.5, font: body, color: COLORS.cream });
  cover.drawText(dateLabel(report.generatedAt), { x: PAGE.margin, y: PAGE.margin, size: 8.5, font: body, color: COLORS.cream });

  writer.newPage();
  writer.kicker("Wynik w skrócie");
  writer.heading("Najpierw fundament.");
  writer.text(report.summary || "Raport podsumowuje wynik pasywnej analizy publicznie dostępnych zasobów.", { size: 12, lineHeight: 17, gapAfter: 18 });
  writer.rule();
  writer.kicker("Wyniki kategorii");
  for (const [key, label] of Object.entries(CATEGORY_LABELS)) {
    const category = report.categories?.[key] || {};
    writer.ensure(28);
    const y = writer.getY();
    writer.getPage().drawText(label, { x: PAGE.margin, y: y - 11, size: 9.8, font: bodyBold, color: COLORS.navy });
    const scoreText = category.score === null || category.score === undefined ? "—" : String(category.score);
    writer.getPage().drawText(`${scoreText} / 100 · ${STATUS_LABELS[category.status] || "Brak danych"}`, {
      x: PAGE.width - PAGE.margin - 140,
      y: y - 11,
      size: 8.8,
      font: body,
      color: category.status === "fail" || category.status === "warning" ? COLORS.accent : COLORS.muted,
    });
    writer.setY(y - 25);
  }

  writer.heading("Najważniejsze priorytety", { size: 25, gapBefore: 24 });
  const priorities = Array.isArray(report.priorities) ? report.priorities : [];
  if (!priorities.length) writer.text("W zakresie tego pasywnego testu nie wykryto istotnego problemu.");
  priorities.forEach((priority, index) => {
    writer.kicker(`Priorytet ${String(index + 1).padStart(2, "0")}`);
    writer.text(priority.title, { font: bodyBold, size: 11, gapAfter: 3 });
    writer.text(priority.observation, { gapAfter: 3 });
    if (priority.recommendation) writer.text(`Następny krok: ${priority.recommendation}`, { color: COLORS.muted, gapAfter: 12 });
  });

  writer.ensure(220);
  writer.heading("Pełne wyniki sprawdzeń", { size: 28, gapBefore: 28 });
  for (const [key, label] of Object.entries(CATEGORY_LABELS)) {
    const categoryChecks = report.checks.filter(check => check.category === key);
    if (!categoryChecks.length) continue;
    writer.ensure(150);
    writer.kicker(label);
    const category = report.categories?.[key];
    writer.text(`${category?.score ?? "—"} / 100 · ${category?.checked ?? 0}/${category?.total ?? 0} sprawdzonych`, { font: bodyBold, gapAfter: 10 });
    for (const check of categoryChecks) {
      const recommendation = new Set(["fail", "warning", "unknown"]).has(check.status) ? check.recommendation : "";
      writer.item(check.title, check.observation, recommendation, check.status);
    }
    writer.rule({ gap: 18 });
  }

  writer.heading("Mocne strony i ograniczenia", { size: 27, gapBefore: 24 });
  writer.kicker("Mocne strony");
  for (const strength of report.strengths || []) writer.text(`• ${strength}`, { gapAfter: 4 });
  writer.kicker("Ograniczenia");
  for (const limitation of report.limitations || []) writer.text(`• ${limitation}`, { gapAfter: 4, color: COLORS.muted });
  writer.kicker("Metodologia");
  writer.text("Audyt obejmuje wyłącznie publiczne odpowiedzi DNS oraz HTTP/HTTPS. Nie wykonuje logowania, brute force, skanowania portów ani prób wykorzystania podatności. Wynik jest wskazówką diagnostyczną, nie testem penetracyjnym ani gwarancją bezpieczeństwa.", { color: COLORS.muted });

  const pages = pdf.getPages();
  pages.forEach((pdfPage, index) => {
    if (index === 0) return;
    pdfPage.drawText("OK Agency · rozszerzona diagnostyka", { x: PAGE.margin, y: 22, size: 7.5, font: body, color: COLORS.muted });
    const number = `${index + 1} / ${pages.length}`;
    pdfPage.drawText(number, { x: PAGE.width - PAGE.margin - body.widthOfTextAtSize(number, 7.5), y: 22, size: 7.5, font: body, color: COLORS.muted });
  });

  return pdf.save();
}

export async function downloadAuditPdf(report) {
  const bytes = await buildAuditPdf(report);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const date = new Date(report.generatedAt || Date.now()).toISOString().slice(0, 10);
  anchor.href = url;
  anchor.download = `audyt-okagency-${safeFilenamePart(report.origin)}-${date}.pdf`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
