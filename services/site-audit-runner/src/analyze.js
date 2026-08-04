const normalizeText = value => String(value || "").replace(/<[^>]+>/g, " ").replace(/&(?:nbsp|#160);/gi, " ").replace(/\s+/g, " ").trim();
const clamp = value => Math.max(0, Math.min(100, Math.round(value)));

function firstMatch(html, expression) {
  return normalizeText(expression.exec(html)?.[1] || "");
}

function metaContent(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return firstMatch(html, new RegExp(`<meta\\b(?=[^>]*(?:name|property)=["']${escaped}["'])[^>]*content=["']([^"']*)["'][^>]*>`, "i")) ||
    firstMatch(html, new RegExp(`<meta\\b(?=[^>]*content=["']([^"']*)["'])[^>]*(?:name|property)=["']${escaped}["'][^>]*>`, "i"));
}

function countMatches(value, expression) {
  return [...value.matchAll(expression)].length;
}

function headerValue(headers, name) {
  const value = headers[name.toLowerCase()];
  return Array.isArray(value) ? value.join(", ") : String(value || "");
}

function makeFinding(id, category, severity, title, detail, recommendation) {
  return { id, category, severity, title, detail, recommendation };
}

function scoreBoolean(value, points) {
  return value ? points : 0;
}

export function analyzeSnapshot(snapshot, pagespeed = null) {
  const html = snapshot.body;
  const title = firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const description = metaContent(html, "description");
  const robotsMeta = metaContent(html, "robots");
  const canonical = firstMatch(html, /<link\b(?=[^>]*rel=["'][^"']*canonical[^"']*["'])[^>]*href=["']([^"']+)["']/i);
  const lang = firstMatch(html, /<html\b[^>]*lang=["']([^"']+)["']/i);
  const viewport = metaContent(html, "viewport");
  const h1Count = countMatches(html, /<h1\b[^>]*>/gi);
  const headingCount = countMatches(html, /<h[1-6]\b[^>]*>/gi);
  const imageCount = countMatches(html, /<img\b[^>]*>/gi);
  const imageAltCount = countMatches(html, /<img\b(?=[^>]*\balt=["'][^"']*["'])[^>]*>/gi);
  const formCount = countMatches(html, /<form\b[^>]*>/gi);
  const inputCount = countMatches(html, /<(?:input|select|textarea)\b[^>]*>/gi);
  const labelCount = countMatches(html, /<label\b[^>]*>/gi);
  const structuredDataCount = countMatches(html, /<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>/gi);
  const text = normalizeText(html).toLowerCase();
  const ctaCount = countMatches(text, /\b(?:kontakt|wycen|umów|zamów|sprawdź|zadzwoń|napisz|kup|rezerwuj|rozpocznij|porozmawiajmy)\b/gi);
  const offerSignals = countMatches(text, /\b(?:oferta|usługi|cennik|pakiet|dla kogo|korzyści|realizacja)\b/gi);
  const trustSignals = countMatches(text, /\b(?:opinie|referencje|portfolio|realizacje|certyfikat|doświadczenie|klienci|case study|o nas)\b/gi);
  const contactSignals = countMatches(html, /(?:mailto:|tel:|\/kontakt\b|contact\b)/gi);
  const securityHeaders = {
    hsts: Boolean(headerValue(snapshot.headers, "strict-transport-security")),
    csp: Boolean(headerValue(snapshot.headers, "content-security-policy")),
    frameProtection: Boolean(headerValue(snapshot.headers, "x-frame-options") || /frame-ancestors/i.test(headerValue(snapshot.headers, "content-security-policy"))),
    nosniff: /nosniff/i.test(headerValue(snapshot.headers, "x-content-type-options")),
    referrerPolicy: Boolean(headerValue(snapshot.headers, "referrer-policy")),
  };

  const seoScore = clamp(
    scoreBoolean(title.length >= 20 && title.length <= 65, 20) +
    scoreBoolean(description.length >= 70 && description.length <= 170, 18) +
    scoreBoolean(Boolean(canonical), 12) +
    scoreBoolean(h1Count === 1, 15) +
    scoreBoolean(Boolean(lang), 8) +
    scoreBoolean(Boolean(viewport), 7) +
    scoreBoolean(structuredDataCount > 0, 10) +
    scoreBoolean(!/noindex/i.test(robotsMeta), 10),
  );
  const altRatio = imageCount === 0 ? 1 : imageAltCount / imageCount;
  const labelRatio = inputCount === 0 ? 1 : Math.min(1, labelCount / inputCount);
  const accessibilityScore = pagespeed?.accessibilityScore ?? clamp(
    scoreBoolean(Boolean(lang), 20) +
    scoreBoolean(Boolean(viewport), 15) +
    altRatio * 35 +
    labelRatio * 20 +
    scoreBoolean(headingCount > 0 && h1Count === 1, 10),
  );
  const conversionScore = clamp(
    scoreBoolean(ctaCount >= 1, 22) +
    scoreBoolean(ctaCount >= 2, 8) +
    scoreBoolean(offerSignals >= 2, 20) +
    scoreBoolean(contactSignals >= 1, 18) +
    scoreBoolean(formCount >= 1, 12) +
    scoreBoolean(trustSignals >= 2, 12) +
    scoreBoolean(text.length >= 500, 8),
  );
  const trustScore = clamp(
    scoreBoolean(snapshot.url.startsWith("https://"), 25) +
    scoreBoolean(Boolean(snapshot.tls?.validTo), 10) +
    Object.values(securityHeaders).filter(Boolean).length * 8 +
    scoreBoolean(trustSignals >= 2, 15) +
    scoreBoolean(contactSignals >= 1, 10),
  );
  const performanceScore = pagespeed?.performanceScore ?? clamp(
    70 - Math.max(0, snapshot.durationMs - 1000) / 80 - Math.max(0, Buffer.byteLength(html) - 300_000) / 20_000,
  );

  const findings = [];
  const strengths = [];
  if (!title) findings.push(makeFinding("seo_title_missing", "seo", "high", "Brak tytułu strony", "Strona główna nie ma znacznika title.", "Dodaj unikalny tytuł opisujący ofertę i markę."));
  else if (title.length < 20 || title.length > 65) findings.push(makeFinding("seo_title_length", "seo", "medium", "Tytuł wymaga korekty", `Tytuł ma ${title.length} znaków.`, "Utrzymaj tytuł w przybliżeniu między 20 a 65 znakami."));
  else strengths.push("Tytuł strony ma czytelną długość.");
  if (!description) findings.push(makeFinding("seo_description_missing", "seo", "medium", "Brak opisu meta", "Nie znaleziono meta description.", "Dodaj konkretny opis korzyści i zawartości strony."));
  else strengths.push("Strona ma opis meta.");
  if (h1Count !== 1) findings.push(makeFinding("seo_h1_structure", "seo", "medium", "Niejasna hierarchia H1", `Znaleziono ${h1Count} nagłówków H1.`, "Zostaw jeden główny nagłówek H1 i uporządkuj dalsze poziomy."));
  else strengths.push("Strona ma jeden główny nagłówek H1.");
  if (altRatio < 0.8) findings.push(makeFinding("a11y_image_alt", "accessibility", "medium", "Część obrazów nie ma tekstów alternatywnych", `${Math.round(altRatio * 100)}% obrazów ma atrybut alt.`, "Uzupełnij sensowne alty, a dekoracyjne grafiki oznacz pustym alt."));
  if (!viewport) findings.push(makeFinding("mobile_viewport", "accessibility", "high", "Brak konfiguracji viewport", "Strona może być trudna w obsłudze na telefonie.", "Dodaj responsywny meta viewport."));
  if (ctaCount === 0) findings.push(makeFinding("conversion_cta", "conversion", "high", "Brak wyraźnego wezwania do działania", "Nie znaleziono jednoznacznego działania dla użytkownika.", "Dodaj jedno główne CTA powiązane z celem strony."));
  else strengths.push("Strona prowadzi do konkretnego działania.");
  if (contactSignals === 0) findings.push(makeFinding("conversion_contact", "conversion", "high", "Trudno znaleźć kontakt", "Nie znaleziono bezpośredniego sposobu kontaktu.", "Dodaj widoczny kontakt lub formularz w kluczowych miejscach."));
  if (!securityHeaders.hsts && snapshot.url.startsWith("https://")) findings.push(makeFinding("trust_hsts", "trust", "medium", "Brak HSTS", "Serwer nie wysyła nagłówka Strict-Transport-Security.", "Włącz HSTS po potwierdzeniu pełnej obsługi HTTPS."));
  if (!securityHeaders.csp) findings.push(makeFinding("trust_csp", "trust", "medium", "Brak polityki CSP", "Nie znaleziono Content-Security-Policy.", "Dodaj i stopniowo zaostrzaj politykę CSP."));
  if (snapshot.url.startsWith("https://")) strengths.push("Strona działa przez HTTPS.");
  if (structuredDataCount > 0) strengths.push("Strona zawiera dane strukturalne.");

  if (pagespeed?.performanceScore >= 80) strengths.push("Mobilna wydajność PageSpeed jest dobra.");
  if (performanceScore < 50) findings.push(makeFinding("performance_slow", "performance", "high", "Niska wydajność strony", "Pomiar wskazuje na wolne ładowanie lub ciężki dokument.", "Zacznij od LCP, obrazów nad linią zgięcia i blokującego JavaScriptu."));

  const scores = { performance: performanceScore, seo: seoScore, accessibility: accessibilityScore, conversion: conversionScore, trust: trustScore };
  const average = clamp(Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length);
  const severityOrder = { high: 0, medium: 1, low: 2 };
  const sortedFindings = findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  const partial = !pagespeed;

  return {
    schemaVersion: "1.0",
    generatedAt: new Date().toISOString(),
    origin: snapshot.requestedOrigin,
    finalUrl: snapshot.url,
    summary: average >= 80
      ? "Strona ma solidne podstawy. Największy efekt da dopracowanie kilku konkretnych punktów."
      : average >= 60
        ? "Podstawy działają, ale kilka barier ogranicza widoczność, zaufanie lub konwersję."
        : "Strona wymaga uporządkowania fundamentów. Zacznij od priorytetów wskazanych poniżej.",
    overallScore: average,
    confidence: partial ? "medium" : "high",
    categories: Object.fromEntries(Object.entries(scores).map(([key, score]) => [key, { score }])),
    priorities: sortedFindings.slice(0, 5),
    strengths: [...new Set(strengths)].slice(0, 5),
    findings: sortedFindings,
    measurements: {
      responseMs: snapshot.durationMs,
      htmlBytes: Buffer.byteLength(html),
      redirects: snapshot.redirects.length,
      pagespeed: pagespeed?.metrics || null,
    },
    limitations: [
      "Audyt analizuje publicznie dostępne zasoby bez logowania i nie jest testem penetracyjnym.",
      ...(partial ? ["PageSpeed nie zwrócił pełnego pomiaru; wydajność oszacowano na podstawie odpowiedzi strony."] : []),
      "Heurystyki konwersji wskazują sygnały techniczne i treściowe, ale nie zastępują badań z użytkownikami ani danych analitycznych.",
    ],
    partial,
  };
}

export async function fetchPageSpeed(origin, { apiKey = "", enabled = true, fetchImpl = fetch } = {}) {
  if (!enabled) return null;
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", origin);
  endpoint.searchParams.set("strategy", "mobile");
  for (const category of ["performance", "accessibility", "seo", "best-practices"]) endpoint.searchParams.append("category", category);
  if (apiKey) endpoint.searchParams.set("key", apiKey);
  try {
    const response = await fetchImpl(endpoint, { signal: AbortSignal.timeout(90_000) });
    if (!response.ok) return null;
    const declaredLength = Number(response.headers.get("content-length") || 0);
    if (declaredLength > 15_000_000) return null;
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > 15_000_000) return null;
    const data = JSON.parse(Buffer.from(buffer).toString("utf8"));
    const categories = data.lighthouseResult?.categories || {};
    const audits = data.lighthouseResult?.audits || {};
    const score = key => Number.isFinite(categories[key]?.score) ? Math.round(categories[key].score * 100) : null;
    return {
      performanceScore: score("performance"),
      accessibilityScore: score("accessibility"),
      seoScore: score("seo"),
      bestPracticesScore: score("best-practices"),
      metrics: {
        lcpMs: audits["largest-contentful-paint"]?.numericValue ?? null,
        cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
        tbtMs: audits["total-blocking-time"]?.numericValue ?? null,
        speedIndexMs: audits["speed-index"]?.numericValue ?? null,
      },
    };
  } catch {
    return null;
  }
}
