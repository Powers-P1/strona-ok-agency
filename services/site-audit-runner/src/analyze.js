import { REPORT_CATEGORY_KEYS, REPORT_SCHEMA_VERSION } from "../../../worker/site-audit-core.js";
import { codeFromError, dedupeDiagnostics, isRetryableDiagnostic, makeDiagnostic } from "./collector-diagnostics.js";
import { hasHeadingLevelSkip, inspectHtml } from "./html-inspector.js";

const CATEGORY_WEIGHTS = Object.freeze({
  performance: 20,
  seo: 20,
  accessibility: 15,
  technical: 15,
  security: 15,
  conversion: 10,
  trust: 5,
});
const STATUS_SCORE = Object.freeze({ pass: 100, warning: 55, fail: 0 });
const SEVERITY_ORDER = Object.freeze({ high: 0, medium: 1, low: 2, info: 3 });

const clamp = value => Math.max(0, Math.min(100, Math.round(value)));
const truncate = (value, max = 1_000) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const list = (values, fallback = "brak") => values?.length ? values.map(value => truncate(value, 180)).join(", ") : fallback;

function headerValue(headers, name) {
  const value = headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value.join(", ") : String(value || "");
}

function makeCheck({ id, category, status, severity = "medium", title, observation, recommendation = "", source, weight = 1 }) {
  return {
    id,
    category,
    status,
    severity,
    title: truncate(title, 180),
    observation: truncate(observation, 1_200),
    recommendation: truncate(recommendation, 1_200),
    source: truncate(source, 160),
    weight,
  };
}

function thresholdStatus(value, good, warning, lowerIsBetter = true) {
  if (!Number.isFinite(value)) return "unknown";
  if (lowerIsBetter) return value <= good ? "pass" : value <= warning ? "warning" : "fail";
  return value >= good ? "pass" : value >= warning ? "warning" : "fail";
}

function parseHsts(value) {
  const maxAge = /(?:^|;)\s*max-age\s*=\s*(\d+)/i.exec(value)?.[1];
  return {
    maxAge: maxAge ? Number(maxAge) : null,
    includeSubDomains: /(?:^|;)\s*includesubdomains\b/i.test(value),
    preload: /(?:^|;)\s*preload\b/i.test(value),
  };
}

function categorySummary(checks, key) {
  const categoryChecks = checks.filter(check => check.category === key);
  const scorable = categoryChecks.filter(check => Object.hasOwn(STATUS_SCORE, check.status));
  const totalWeight = scorable.reduce((sum, check) => sum + check.weight, 0);
  const score = totalWeight > 0
    ? clamp(scorable.reduce((sum, check) => sum + STATUS_SCORE[check.status] * check.weight, 0) / totalWeight)
    : null;
  const hasHighFailure = categoryChecks.some(check => check.status === "fail" && check.severity === "high");
  const hasIssue = categoryChecks.some(check => check.status === "fail" || check.status === "warning");
  const status = score === null ? "unknown" : hasHighFailure ? "fail" : hasIssue ? "warning" : "pass";
  return {
    score,
    status,
    checked: scorable.length,
    total: categoryChecks.filter(check => check.status !== "not_applicable").length,
    weight: CATEGORY_WEIGHTS[key],
  };
}

function pageSpeedUnavailableObservation(pagespeed) {
  const code = pagespeed?.diagnostic?.code;
  const messages = {
    disabled: "Pomiar Lighthouse jest wyłączony w konfiguracji usługi.",
    missing_api_key: "Pomiar Lighthouse jest niedostępny z powodu niepełnej konfiguracji usługi.",
    invalid_api_key: "Pomiar Lighthouse jest niedostępny z powodu błędnej konfiguracji dostępu do usługi.",
    access_denied: "Usługa PageSpeed Insights odrzuciła dostęp do pomiaru.",
    quota_exceeded: "Pomiar Lighthouse jest chwilowo niedostępny z powodu wykorzystania limitu usługi.",
    fetch_timeout: "Pomiar Lighthouse przekroczył bezpieczny limit czasu.",
    network_error: "Nie udało się połączyć z usługą PageSpeed Insights.",
    upstream_unavailable: "Usługa PageSpeed Insights jest chwilowo niedostępna.",
    response_too_large: "Odpowiedź PageSpeed Insights przekroczyła bezpieczny limit rozmiaru.",
    invalid_response: "PageSpeed Insights zwrócił odpowiedź, której nie udało się wiarygodnie odczytać.",
    incomplete_result: "PageSpeed Insights nie zwrócił wszystkich wymaganych kategorii Lighthouse.",
  };
  return messages[code] || "PageSpeed Insights nie zwrócił wiarygodnego wyniku dla tej kontroli.";
}

function pageSpeedCheck(checks, id, category, title, value, sourceKey, unavailableObservation, good = 80, warning = 50) {
  checks.push(makeCheck({
    id,
    category,
    status: thresholdStatus(value, good, warning, false),
    severity: "high",
    title,
    observation: Number.isFinite(value) ? `Wynik Lighthouse: ${value}/100.` : unavailableObservation,
    recommendation: Number.isFinite(value) && value < good ? "Przejrzyj szczegółowe zalecenia Lighthouse i zacznij od elementów o największym wpływie." : "",
    source: sourceKey,
    weight: 2,
  }));
}

export function analyzeSnapshot(snapshot, pagespeed = null, technicalProfile = {}, metadata = {}) {
  const inspection = inspectHtml(snapshot.body, snapshot.url);
  const dns = technicalProfile.dns || {};
  const resources = technicalProfile.resources || {};
  const pageSpeedObservation = pageSpeedUnavailableObservation(pagespeed);
  const pageSpeedComplete = Boolean(pagespeed) && (pagespeed.status === undefined || pagespeed.status === "ok");
  const diagnostics = dedupeDiagnostics([
    ...(pagespeed?.diagnostic ? [pagespeed.diagnostic] : []),
    ...(technicalProfile.diagnostics || []),
  ]);
  const unavailableDiagnostics = (...collectors) => diagnostics.filter(item =>
    item.status === "unavailable" && collectors.includes(item.collector));
  const hasUnavailableDiagnostic = (...collectors) => unavailableDiagnostics(...collectors).length > 0;
  const unavailableObservation = (label, ...collectors) => {
    const codes = [...new Set(unavailableDiagnostics(...collectors).map(item => item.code))];
    return `Nie udało się wiarygodnie sprawdzić ${label}${codes.length ? ` (kod: ${codes.join(", ")})` : ""}.`;
  };
  const text = inspection.text.toLowerCase();
  const textMatches = expression => [...text.matchAll(expression)].length;
  const htmlMatches = expression => [...snapshot.body.matchAll(expression)].length;
  const ctaCount = textMatches(/\b(?:kontakt|wycen|umów|zamów|sprawdź|zadzwoń|napisz|kup|rezerwuj|rozpocznij|porozmawiajmy)\b/gi);
  const offerSignals = textMatches(/\b(?:oferta|usługi|cennik|pakiet|dla kogo|korzyści|realizacja)\b/gi);
  const trustSignals = textMatches(/\b(?:opinie|referencje|portfolio|realizacje|certyfikat|doświadczenie|klienci|case study|o nas)\b/gi);
  const contactSignals = htmlMatches(/(?:mailto:|tel:|\/kontakt\b|contact\b)/gi);
  const checks = [];
  const htmlBytes = Buffer.byteLength(snapshot.body);

  pageSpeedCheck(checks, "performance_lighthouse", "performance", "Mobilna wydajność Lighthouse", pagespeed?.performanceScore, "Google PageSpeed Insights", pageSpeedObservation);
  checks.push(makeCheck({
    id: "performance_lcp",
    category: "performance",
    status: thresholdStatus(pagespeed?.metrics?.lcpMs, 2_500, 4_000),
    severity: "high",
    title: "Largest Contentful Paint",
    observation: Number.isFinite(pagespeed?.metrics?.lcpMs) ? `LCP: ${Math.round(pagespeed.metrics.lcpMs)} ms.` : pageSpeedObservation,
    recommendation: "Ogranicz ciężar elementu nad linią zgięcia, zoptymalizuj obraz główny i zasoby blokujące renderowanie.",
    source: "Google PageSpeed Insights",
    weight: 2,
  }));
  checks.push(makeCheck({
    id: "performance_cls",
    category: "performance",
    status: thresholdStatus(pagespeed?.metrics?.cls, 0.1, 0.25),
    severity: "medium",
    title: "Cumulative Layout Shift",
    observation: Number.isFinite(pagespeed?.metrics?.cls) ? `CLS: ${pagespeed.metrics.cls.toFixed(3)}.` : pageSpeedObservation,
    recommendation: "Rezerwuj miejsce na obrazy, fonty i elementy dynamiczne, aby układ nie przesuwał się podczas ładowania.",
    source: "Google PageSpeed Insights",
  }));
  checks.push(makeCheck({
    id: "performance_tbt",
    category: "performance",
    status: thresholdStatus(pagespeed?.metrics?.tbtMs, 200, 600),
    severity: "medium",
    title: "Total Blocking Time",
    observation: Number.isFinite(pagespeed?.metrics?.tbtMs) ? `TBT: ${Math.round(pagespeed.metrics.tbtMs)} ms.` : pageSpeedObservation,
    recommendation: "Podziel długie zadania JavaScript, usuń nieużywany kod i opóźnij skrypty drugorzędne.",
    source: "Google PageSpeed Insights",
  }));
  checks.push(makeCheck({
    id: "performance_response_time",
    category: "performance",
    status: thresholdStatus(snapshot.durationMs, 800, 1_800),
    severity: "medium",
    title: "Czas pobrania dokumentu",
    observation: `Pobranie strony z przekierowaniami trwało ${snapshot.durationMs} ms.`,
    recommendation: "Sprawdź czas odpowiedzi serwera, warstwę cache i liczbę przekierowań przed dokumentem końcowym.",
    source: "Pasywny pomiar HTTP OK Agency",
  }));
  checks.push(makeCheck({
    id: "performance_html_size",
    category: "performance",
    status: thresholdStatus(htmlBytes, 350_000, 900_000),
    severity: "low",
    title: "Rozmiar dokumentu HTML",
    observation: `Dokument HTML ma ${Math.round(htmlBytes / 1_024)} KiB.`,
    recommendation: "Usuń zbędny HTML i dane osadzane bezpośrednio w dokumencie; ciężkie dane ładuj dopiero wtedy, gdy są potrzebne.",
    source: "Dokument HTML strony głównej",
  }));

  pageSpeedCheck(checks, "seo_lighthouse", "seo", "Podstawowe SEO Lighthouse", pagespeed?.seoScore, "Google PageSpeed Insights", pageSpeedObservation);
  checks.push(makeCheck({
    id: "seo_title",
    category: "seo",
    status: !inspection.title ? "fail" : inspection.title.length >= 20 && inspection.title.length <= 65 ? "pass" : "warning",
    severity: "high",
    title: "Tytuł strony",
    observation: inspection.title ? `Tytuł ma ${inspection.title.length} znaków: „${inspection.title}”.` : "Nie znaleziono znacznika title.",
    recommendation: "Dodaj unikalny tytuł opisujący ofertę i markę; zwykle warto utrzymać około 20-65 znaków.",
    source: "HTML strony głównej",
    weight: 2,
  }));
  checks.push(makeCheck({
    id: "seo_description",
    category: "seo",
    status: !inspection.description ? "fail" : inspection.description.length >= 70 && inspection.description.length <= 170 ? "pass" : "warning",
    severity: "medium",
    title: "Opis meta",
    observation: inspection.description ? `Opis meta ma ${inspection.description.length} znaków.` : "Nie znaleziono meta description.",
    recommendation: "Dodaj konkretny opis korzyści i zawartości strony, dopasowany do intencji wyszukiwania.",
    source: "HTML strony głównej",
  }));
  let canonicalStatus = "fail";
  let canonicalObservation = "Nie znaleziono adresu canonical.";
  if (inspection.canonical) {
    canonicalStatus = new URL(inspection.canonical).origin === new URL(snapshot.url).origin ? "pass" : "warning";
    canonicalObservation = `Canonical wskazuje: ${inspection.canonical}`;
  }
  checks.push(makeCheck({ id: "seo_canonical", category: "seo", status: canonicalStatus, severity: "medium", title: "Adres kanoniczny", observation: canonicalObservation, recommendation: "Ustaw canonical na właściwy publiczny adres wersji końcowej i zachowaj spójność hosta oraz protokołu.", source: "HTML strony głównej" }));
  checks.push(makeCheck({
    id: "seo_h1",
    category: "seo",
    status: inspection.h1Count === 1 ? "pass" : inspection.h1Count === 0 ? "fail" : "warning",
    severity: "medium",
    title: "Główny nagłówek H1",
    observation: `Znaleziono ${inspection.h1Count} nagłówków H1.`,
    recommendation: "Zastosuj jeden czytelny nagłówek H1 opisujący główny temat strony.",
    source: "HTML strony głównej",
  }));
  checks.push(makeCheck({
    id: "seo_indexability",
    category: "seo",
    status: /\bnoindex\b/i.test(inspection.robotsMeta) ? "fail" : "pass",
    severity: "high",
    title: "Możliwość indeksowania strony głównej",
    observation: inspection.robotsMeta ? `Dyrektywa robots: ${inspection.robotsMeta}` : "Nie znaleziono dyrektywy noindex w HTML.",
    recommendation: "Usuń noindex, jeżeli strona ma być widoczna w wynikach wyszukiwania.",
    source: "Meta robots strony głównej",
    weight: 2,
  }));
  checks.push(makeCheck({ id: "seo_robots", category: "seo", status: resources.robots?.available ? "pass" : resources.robots?.error ? "unknown" : "warning", severity: "low", title: "Plik robots.txt", observation: resources.robots?.available ? `robots.txt odpowiada statusem ${resources.robots.status}.` : resources.robots?.error ? unavailableObservation("robots.txt", "robots", "public_resources") : `Nie potwierdzono dostępnego robots.txt${resources.robots?.status ? ` (status ${resources.robots.status})` : ""}.`, recommendation: "Opublikuj prosty robots.txt i wskaż w nim mapę witryny.", source: "Publiczny zasób /robots.txt" }));
  const availableSitemaps = (resources.sitemaps || []).filter(item => item.available);
  const sitemapUnavailable = !availableSitemaps.length && hasUnavailableDiagnostic("sitemap", "public_resources");
  checks.push(makeCheck({ id: "seo_sitemap", category: "seo", status: availableSitemaps.length ? "pass" : sitemapUnavailable ? "unknown" : "warning", severity: "medium", title: "Mapa witryny", observation: availableSitemaps.length ? `Znaleziono ${availableSitemaps.length} map; zadeklarowano ${availableSitemaps.reduce((sum, item) => sum + item.urlCount, 0)} adresów.` : sitemapUnavailable ? unavailableObservation("mapy XML", "sitemap", "public_resources") : "Nie potwierdzono dostępnej mapy XML.", recommendation: "Opublikuj sitemap.xml i wskaż ją w robots.txt oraz Google Search Console.", source: "robots.txt i sitemap.xml" }));
  checks.push(makeCheck({ id: "seo_structured_data", category: "seo", status: inspection.structuredDataCount === 0 ? "warning" : inspection.structuredDataValidCount === inspection.structuredDataCount ? "pass" : "warning", severity: "low", title: "Dane strukturalne", observation: inspection.structuredDataCount ? `${inspection.structuredDataValidCount}/${inspection.structuredDataCount} bloków JSON-LD ma poprawny JSON; typy: ${list(inspection.structuredDataTypes)}.` : "Nie znaleziono danych JSON-LD.", recommendation: "Dodaj tylko dane strukturalne zgodne z rzeczywistą treścią i zweryfikuj ich składnię.", source: "HTML strony głównej" }));
  checks.push(makeCheck({ id: "seo_social_metadata", category: "seo", status: inspection.openGraphCount >= 4 && inspection.twitterCardCount >= 1 ? "pass" : "warning", severity: "low", title: "Metadane udostępniania", observation: `Open Graph: ${inspection.openGraphCount} pól; Twitter/X: ${inspection.twitterCardCount} pól.`, recommendation: "Uzupełnij tytuł, opis, obraz i adres dla Open Graph oraz kart społecznościowych.", source: "HTML strony głównej" }));
  const crawledPages = resources.crawledPages || [];
  const brokenPages = crawledPages.filter(page => !page.status || page.status >= 400);
  checks.push(makeCheck({
    id: "seo_internal_sample",
    category: "seo",
    status: crawledPages.length === 0 ? "unknown" : brokenPages.length === 0 ? "pass" : brokenPages.length / crawledPages.length <= 0.2 ? "warning" : "fail",
    severity: "medium",
    title: "Próbka podstron wewnętrznych",
    observation: crawledPages.length ? `Sprawdzono ${crawledPages.length} podstron; ${brokenPages.length} nie zwróciło poprawnej odpowiedzi.` : "Nie zebrano wystarczającej próbki podstron.",
    recommendation: "Napraw niedziałające adresy i przekieruj trwale usunięte treści do właściwych odpowiedników.",
    source: `Ograniczony crawl do ${resources.crawlLimit || 0} adresów`,
  }));
  const sampledTitles = crawledPages.map(page => page.title?.trim()).filter(Boolean);
  checks.push(makeCheck({ id: "seo_sample_title_uniqueness", category: "seo", status: sampledTitles.length < 2 ? "not_applicable" : new Set(sampledTitles).size === sampledTitles.length ? "pass" : "warning", severity: "low", title: "Unikalność tytułów w próbce", observation: sampledTitles.length < 2 ? "Za mała próbka, aby porównać tytuły." : `${new Set(sampledTitles).size}/${sampledTitles.length} tytułów w próbce jest unikalnych.`, recommendation: "Nadaj każdej indeksowanej podstronie własny tytuł odpowiadający jej tematowi.", source: "Ograniczony crawl podstron" }));

  pageSpeedCheck(checks, "accessibility_lighthouse", "accessibility", "Dostępność Lighthouse", pagespeed?.accessibilityScore, "Google PageSpeed Insights", pageSpeedObservation);
  const altRatio = inspection.imageCount === 0 ? null : inspection.imageAltCount / inspection.imageCount;
  checks.push(makeCheck({ id: "accessibility_image_alt", category: "accessibility", status: altRatio === null ? "not_applicable" : altRatio === 1 ? "pass" : altRatio >= 0.8 ? "warning" : "fail", severity: "medium", title: "Atrybuty alt obrazów", observation: altRatio === null ? "Strona główna nie zawiera obrazów HTML." : `${inspection.imageAltCount}/${inspection.imageCount} obrazów ma atrybut alt.`, recommendation: "Dodaj sensowne teksty alternatywne, a obrazy dekoracyjne oznacz pustym alt.", source: "HTML strony głównej" }));
  const labelRatio = inspection.inputCount === 0 ? null : Math.min(1, inspection.labelCount / inspection.inputCount);
  checks.push(makeCheck({ id: "accessibility_form_labels", category: "accessibility", status: labelRatio === null ? "not_applicable" : labelRatio === 1 ? "pass" : labelRatio >= 0.8 ? "warning" : "fail", severity: "medium", title: "Etykiety pól formularzy", observation: labelRatio === null ? "Nie znaleziono pól formularza wymagających etykiety." : `Pola: ${inspection.inputCount}; etykiety: ${inspection.labelCount}.`, recommendation: "Powiąż każde pole z widoczną etykietą label albo równoważną nazwą dostępną.", source: "HTML strony głównej" }));
  checks.push(makeCheck({ id: "accessibility_language", category: "accessibility", status: inspection.lang ? "pass" : "fail", severity: "high", title: "Język dokumentu", observation: inspection.lang ? `Język dokumentu: ${inspection.lang}.` : "Element html nie określa języka.", recommendation: "Dodaj poprawny atrybut lang do elementu html.", source: "HTML strony głównej" }));
  checks.push(makeCheck({ id: "accessibility_viewport", category: "accessibility", status: inspection.viewport ? "pass" : "fail", severity: "high", title: "Konfiguracja viewport", observation: inspection.viewport || "Nie znaleziono meta viewport.", recommendation: "Dodaj responsywny meta viewport bez blokowania skalowania użytkownika.", source: "HTML strony głównej" }));
  checks.push(makeCheck({ id: "accessibility_headings", category: "accessibility", status: !inspection.headingLevels.length ? "fail" : hasHeadingLevelSkip(inspection.headingLevels) ? "warning" : "pass", severity: "medium", title: "Kolejność nagłówków", observation: inspection.headingLevels.length ? `Kolejność poziomów: ${inspection.headingLevels.slice(0, 30).join(" → ")}.` : "Nie znaleziono nagłówków.", recommendation: "Buduj logiczną hierarchię i nie pomijaj poziomów bez uzasadnienia strukturalnego.", source: "HTML strony głównej" }));

  const ipv4 = dns.addresses?.ipv4 || [];
  const ipv6 = dns.addresses?.ipv6 || [];
  const addressResolutionUnavailable = hasUnavailableDiagnostic("dns_target_ipv4", "dns_target_ipv6", "dns_profile");
  checks.push(makeCheck({ id: "technical_dns_resolution", category: "technical", status: ipv4.length || ipv6.length ? "pass" : addressResolutionUnavailable ? "unknown" : "fail", severity: "high", title: "Rozwiązywanie domeny", observation: ipv4.length || ipv6.length ? `A: ${list(ipv4)}; AAAA: ${list(ipv6)}.` : addressResolutionUnavailable ? unavailableObservation("rekordów A i AAAA", "dns_target_ipv4", "dns_target_ipv6", "dns_profile") : "Nie znaleziono publicznego rekordu A ani AAAA.", recommendation: "Skonfiguruj co najmniej jeden publiczny rekord A lub AAAA prowadzący do właściwej usługi.", source: "Publiczny DNS", weight: 2 }));
  const ipv6Unavailable = hasUnavailableDiagnostic("dns_target_ipv6", "dns_profile");
  checks.push(makeCheck({ id: "technical_ipv6", category: "technical", status: ipv6.length ? "pass" : ipv6Unavailable ? "unknown" : "warning", severity: "low", title: "Obsługa IPv6", observation: ipv6.length ? `Rekordy AAAA: ${list(ipv6)}.` : ipv6Unavailable ? unavailableObservation("rekordu AAAA", "dns_target_ipv6", "dns_profile") : "Nie znaleziono rekordu AAAA.", recommendation: "Rozważ IPv6, jeżeli hosting i warstwa bezpieczeństwa obsługują go w pełnym zakresie.", source: "Publiczny DNS" }));
  const dnssec = dns.dnssec || {};
  const dnssecUnavailable = hasUnavailableDiagnostic("dnssec_answer", "dnssec_ds", "dns_profile");
  const dnssecStatus = dnssecUnavailable ? "unknown" : dnssec.dsPresent ? dnssec.validatedAnswer ? "pass" : "fail" : "warning";
  checks.push(makeCheck({ id: "technical_dnssec", category: "technical", status: dnssecStatus, severity: dnssec.dsPresent && !dnssec.validatedAnswer ? "high" : "low", title: "DNSSEC", observation: dnssecUnavailable ? unavailableObservation("DNSSEC", "dnssec_answer", "dnssec_ds", "dns_profile") : dnssec.dsPresent ? `Rekord DS jest obecny; walidacja odpowiedzi: ${dnssec.validatedAnswer ? "poprawna" : "niepotwierdzona"}.` : "Nie znaleziono rekordu DS dla strefy.", recommendation: dnssec.dsPresent ? "Sprawdź łańcuch zaufania DS/DNSKEY u operatora DNS i rejestratora." : "Rozważ włączenie DNSSEC i zsynchronizowanie rekordu DS u rejestratora.", source: "Cloudflare DNS-over-HTTPS i rekord DS", weight: 2 }));
  const caaUnavailable = hasUnavailableDiagnostic("dns_caa", "dns_profile");
  checks.push(makeCheck({ id: "technical_caa", category: "technical", status: dns.caa?.length ? "pass" : caaUnavailable ? "unknown" : "warning", severity: "low", title: "Rekordy CAA", observation: dns.caa?.length ? dns.caa.map(record => `${record.tag}=${record.value}`).join(", ") : caaUnavailable ? unavailableObservation("rekordów CAA", "dns_caa", "dns_profile") : "Nie znaleziono rekordów CAA.", recommendation: "Rozważ ograniczenie wystawców certyfikatów rekordami CAA, jeżeli proces ich odnawiania jest pod kontrolą.", source: "Publiczny DNS" }));
  const nameserversUnavailable = hasUnavailableDiagnostic("dns_nameservers", "dns_profile");
  checks.push(makeCheck({ id: "technical_nameservers", category: "technical", status: nameserversUnavailable ? "unknown" : !dns.nameservers?.length ? "fail" : dns.nameservers.length >= 2 ? "pass" : "warning", severity: "medium", title: "Serwery nazw", observation: nameserversUnavailable ? unavailableObservation("serwerów nazw", "dns_nameservers", "dns_profile") : `NS: ${list(dns.nameservers)}.`, recommendation: "Zapewnij co najmniej dwa niezależnie dostępne serwery nazw.", source: "Publiczny DNS" }));
  const ttlValues = dns.addresses?.ttl || [];
  checks.push(makeCheck({ id: "technical_dns_ttl", category: "technical", status: !ttlValues.length ? "unknown" : Math.min(...ttlValues) >= 300 && Math.max(...ttlValues) <= 86_400 ? "pass" : "warning", severity: "low", title: "TTL rekordów adresowych", observation: ttlValues.length ? `Zaobserwowane TTL: ${ttlValues.join(", ")} s.` : "Resolver nie zwrócił informacji TTL.", recommendation: "Unikaj skrajnie krótkich TTL bez potrzeby operacyjnej i bardzo długich TTL przed planowanymi migracjami.", source: "Publiczny DNS" }));
  const alternateRelevant = Boolean(dns.alternateHostname);
  const alternateResolves = Boolean(dns.alternateAddresses?.ipv4?.length || dns.alternateAddresses?.ipv6?.length);
  const alternateConverges = resources.alternateProbe?.ok && new URL(resources.alternateProbe.finalUrl).origin === new URL(snapshot.url).origin;
  const alternateUnavailable = hasUnavailableDiagnostic("dns_alternate_ipv4", "dns_alternate_ipv6", "alternate_host");
  checks.push(makeCheck({ id: "technical_apex_www", category: "technical", status: !alternateRelevant ? "not_applicable" : alternateUnavailable && !alternateResolves ? "unknown" : !alternateResolves ? "warning" : alternateConverges ? "pass" : "warning", severity: "medium", title: "Spójność domeny głównej i www", observation: !alternateRelevant ? "Badany host nie jest domeną główną ani standardowym wariantem www." : alternateUnavailable && !alternateResolves ? unavailableObservation("wariantu domeny głównej i www", "dns_alternate_ipv4", "dns_alternate_ipv6", "alternate_host") : !alternateResolves ? `${dns.alternateHostname} nie ma publicznego rekordu adresowego.` : `Wariant ${dns.alternateHostname} ${alternateConverges ? "prowadzi do tego samego hosta końcowego" : "nie prowadzi jednoznacznie do tego samego hosta końcowego"}.`, recommendation: "Wybierz jeden host kanoniczny i przekieruj drugi wariant pojedynczym przekierowaniem trwałym.", source: "DNS i pasywny pomiar HTTP" }));
  const mailEnabled = Boolean(dns.mx?.length);
  const mailDetectionUnavailable = hasUnavailableDiagnostic("dns_mx", "dns_profile");
  const spfUnavailable = hasUnavailableDiagnostic("dns_txt", "dns_profile") || mailDetectionUnavailable;
  const dmarcUnavailable = hasUnavailableDiagnostic("dns_dmarc", "dns_profile") || mailDetectionUnavailable;
  checks.push(makeCheck({ id: "technical_spf", category: "technical", status: spfUnavailable ? "unknown" : !mailEnabled ? "not_applicable" : dns.spf?.length ? "pass" : "warning", severity: "medium", title: "SPF domeny pocztowej", observation: spfUnavailable ? unavailableObservation("rekordów MX lub SPF", "dns_mx", "dns_txt", "dns_profile") : !mailEnabled ? "Nie wykryto rekordów MX; kontrola poczty nie ma zastosowania." : dns.spf?.length ? `SPF: ${list(dns.spf)}.` : "Domena ma MX, ale nie znaleziono rekordu SPF.", recommendation: "Opublikuj jeden poprawny rekord SPF obejmujący rzeczywistych nadawców poczty.", source: "Rekordy MX i TXT strefy" }));
  checks.push(makeCheck({ id: "technical_dmarc", category: "technical", status: dmarcUnavailable ? "unknown" : !mailEnabled ? "not_applicable" : dns.dmarc?.length ? "pass" : "warning", severity: "medium", title: "DMARC domeny pocztowej", observation: dmarcUnavailable ? unavailableObservation("rekordów MX lub DMARC", "dns_mx", "dns_dmarc", "dns_profile") : !mailEnabled ? "Nie wykryto rekordów MX; kontrola poczty nie ma zastosowania." : dns.dmarc?.length ? `DMARC: ${list(dns.dmarc)}.` : "Domena ma MX, ale nie znaleziono rekordu DMARC.", recommendation: "Dodaj DMARC, rozpocznij od monitoringu raportów i zaostrzaj politykę po potwierdzeniu poprawnego SPF/DKIM.", source: "Rekord TXT _dmarc" }));
  checks.push(makeCheck({ id: "technical_dkim", category: "technical", status: "not_applicable", severity: "info", title: "DKIM", observation: mailEnabled ? "Automatyczna kontrola DKIM wymaga znajomości selektora i nie jest wiarygodna przez zgadywanie nazw." : "Nie wykryto rekordów MX.", recommendation: "Zweryfikuj selektor DKIM u dostawcy poczty; audyt celowo nie zgaduje selektorów.", source: "Granica pasywnego audytu" }));

  const finalUrl = new URL(snapshot.url);
  const isHttps = finalUrl.protocol === "https:";
  pageSpeedCheck(checks, "security_lighthouse", "security", "Dobre praktyki Lighthouse", pagespeed?.bestPracticesScore, "Google PageSpeed Insights", pageSpeedObservation, 80, 50);
  checks.push(makeCheck({ id: "security_https", category: "security", status: isHttps ? "pass" : "fail", severity: "high", title: "HTTPS strony końcowej", observation: `Adres końcowy: ${snapshot.url}`, recommendation: "Udostępniaj całą stronę przez HTTPS i przekieruj ruch HTTP.", source: "Pasywny pomiar HTTP", weight: 2 }));
  const httpProbe = resources.httpProbe;
  checks.push(makeCheck({ id: "security_http_redirect", category: "security", status: !httpProbe || httpProbe.error ? "unknown" : new URL(httpProbe.finalUrl).protocol === "https:" ? "pass" : "fail", severity: "high", title: "Przekierowanie HTTP do HTTPS", observation: !httpProbe || httpProbe.error ? unavailableObservation("przekierowania HTTP do HTTPS", "http_redirect", "public_resources") : `HTTP kończy się pod adresem ${httpProbe.finalUrl}; przekierowania: ${httpProbe.redirects.length}.`, recommendation: "Skieruj każdy wariant HTTP bezpośrednio do kanonicznego adresu HTTPS.", source: "Pasywny pomiar wariantu HTTP", weight: 2 }));
  const validTo = snapshot.tls?.validTo ? Date.parse(snapshot.tls.validTo) : NaN;
  const daysToExpiry = Number.isFinite(validTo) ? Math.floor((validTo - Date.now()) / 86_400_000) : null;
  checks.push(makeCheck({ id: "security_certificate", category: "security", status: !isHttps ? "not_applicable" : daysToExpiry === null ? "unknown" : daysToExpiry < 7 ? "fail" : daysToExpiry < 30 ? "warning" : "pass", severity: "high", title: "Ważność certyfikatu TLS", observation: daysToExpiry === null ? "Nie odczytano terminu ważności certyfikatu." : `Certyfikat jest ważny jeszcze około ${daysToExpiry} dni; wystawca: ${snapshot.tls?.issuer || "nieustalony"}.`, recommendation: "Skonfiguruj automatyczne odnawianie i alarm przed wygaśnięciem certyfikatu.", source: "Publiczne połączenie TLS", weight: 2 }));
  checks.push(makeCheck({ id: "security_tls_protocol", category: "security", status: !snapshot.tls?.protocol ? "unknown" : new Set(["TLSv1.2", "TLSv1.3"]).has(snapshot.tls.protocol) ? "pass" : "fail", severity: "high", title: "Wersja TLS", observation: snapshot.tls?.protocol ? `Uzgodniony protokół: ${snapshot.tls.protocol}.` : "Nie odczytano wersji protokołu TLS.", recommendation: "Wyłącz przestarzałe protokoły i pozostaw TLS 1.2 oraz 1.3.", source: "Publiczne połączenie TLS" }));
  const hstsValue = headerValue(snapshot.headers, "strict-transport-security");
  const hsts = parseHsts(hstsValue);
  const hstsStatus = !isHttps ? "not_applicable" : !hstsValue ? "warning" : hsts.maxAge >= 31_536_000 ? "pass" : hsts.maxAge > 0 ? "warning" : "fail";
  checks.push(makeCheck({ id: "security_hsts", category: "security", status: hstsStatus, severity: "medium", title: "Strict-Transport-Security", observation: hstsValue || "Nagłówek HSTS nie jest wysyłany.", recommendation: "Włącz HSTS po potwierdzeniu pełnej obsługi HTTPS; includeSubDomains i preload stosuj dopiero po audycie wszystkich subdomen.", source: "Nagłówki odpowiedzi HTTPS" }));
  const csp = headerValue(snapshot.headers, "content-security-policy");
  const cspReportOnly = headerValue(snapshot.headers, "content-security-policy-report-only");
  const weakCsp = /(?:default-src|script-src)[^;]*(?:\*|'unsafe-inline'|'unsafe-eval')/i.test(csp);
  checks.push(makeCheck({ id: "security_csp", category: "security", status: !csp ? "warning" : weakCsp ? "warning" : "pass", severity: "medium", title: "Content Security Policy", observation: csp ? `CSP jest aktywna${weakCsp ? ", ale zawiera szerokie źródła lub unsafe-*" : ""}.` : cspReportOnly ? "CSP działa wyłącznie w trybie report-only." : "Nie znaleziono CSP.", recommendation: "Wdrażaj CSP etapami, ogranicz źródła skryptów i preferuj nonce lub hashe zamiast unsafe-inline.", source: "Nagłówki odpowiedzi HTTPS" }));
  const frameProtected = Boolean(headerValue(snapshot.headers, "x-frame-options") || /frame-ancestors/i.test(csp));
  checks.push(makeCheck({ id: "security_frame_protection", category: "security", status: frameProtected ? "pass" : "warning", severity: "medium", title: "Ochrona przed osadzaniem", observation: frameProtected ? "Znaleziono X-Frame-Options lub dyrektywę CSP frame-ancestors." : "Nie znaleziono ochrony przed niekontrolowanym osadzaniem strony.", recommendation: "Ustaw frame-ancestors w CSP, a dla zgodności możesz zachować X-Frame-Options.", source: "Nagłówki odpowiedzi HTTPS" }));
  const nosniff = /\bnosniff\b/i.test(headerValue(snapshot.headers, "x-content-type-options"));
  checks.push(makeCheck({ id: "security_nosniff", category: "security", status: nosniff ? "pass" : "warning", severity: "low", title: "X-Content-Type-Options", observation: nosniff ? "Serwer wysyła nosniff." : "Nie znaleziono wartości nosniff.", recommendation: "Dodaj X-Content-Type-Options: nosniff.", source: "Nagłówki odpowiedzi HTTPS" }));
  const referrerPolicy = headerValue(snapshot.headers, "referrer-policy");
  checks.push(makeCheck({ id: "security_referrer_policy", category: "security", status: referrerPolicy ? "pass" : "warning", severity: "low", title: "Referrer-Policy", observation: referrerPolicy || "Nie znaleziono Referrer-Policy.", recommendation: "Ustaw politykę odpowiednią do analityki i prywatności, np. strict-origin-when-cross-origin.", source: "Nagłówki odpowiedzi HTTPS" }));
  const permissionsPolicy = headerValue(snapshot.headers, "permissions-policy");
  checks.push(makeCheck({ id: "security_permissions_policy", category: "security", status: permissionsPolicy ? "pass" : "warning", severity: "low", title: "Permissions-Policy", observation: permissionsPolicy || "Nie znaleziono Permissions-Policy.", recommendation: "Ogranicz nieużywane funkcje przeglądarki, jeżeli strona ich nie potrzebuje.", source: "Nagłówki odpowiedzi HTTPS" }));
  const cookies = snapshot.headers?.["set-cookie"] ? (Array.isArray(snapshot.headers["set-cookie"]) ? snapshot.headers["set-cookie"] : [snapshot.headers["set-cookie"]]) : [];
  const insecureCookies = cookies.filter(cookie => isHttps && !/;\s*secure\b/i.test(cookie));
  const missingSameSite = cookies.filter(cookie => !/;\s*samesite=/i.test(cookie));
  checks.push(makeCheck({ id: "security_cookie_flags", category: "security", status: cookies.length === 0 ? "not_applicable" : insecureCookies.length ? "fail" : missingSameSite.length ? "warning" : "pass", severity: "medium", title: "Flagi publicznie ustawianych cookies", observation: cookies.length === 0 ? "Strona główna nie ustawiła cookies w badanej odpowiedzi." : `Cookies: ${cookies.length}; bez Secure: ${insecureCookies.length}; bez SameSite: ${missingSameSite.length}.`, recommendation: "Cookies sesyjne oznacz Secure, HttpOnly i właściwym SameSite; wyjątki dokumentuj świadomie.", source: "Nagłówki Set-Cookie strony głównej" }));
  checks.push(makeCheck({ id: "security_redirect_chain", category: "security", status: snapshot.redirects.length <= 2 ? "pass" : "warning", severity: "low", title: "Łańcuch przekierowań", observation: `Przed stroną końcową wykonano ${snapshot.redirects.length} przekierowań.`, recommendation: "Skróć przekierowania do jednego skoku prowadzącego do hosta kanonicznego.", source: "Pasywny pomiar HTTP" }));

  checks.push(makeCheck({ id: "conversion_cta", category: "conversion", status: ctaCount >= 2 ? "pass" : ctaCount === 1 ? "warning" : "fail", severity: "high", title: "Wezwania do działania", observation: `Znaleziono około ${ctaCount} czytelnych sygnałów działania.`, recommendation: "Ustal jedno główne CTA i powtarzaj je w miejscach odpowiadających kolejnym etapom decyzji.", source: "Widoczny tekst strony głównej", weight: 2 }));
  checks.push(makeCheck({ id: "conversion_offer", category: "conversion", status: offerSignals >= 2 ? "pass" : offerSignals === 1 ? "warning" : "fail", severity: "medium", title: "Czytelność oferty", observation: `Znaleziono około ${offerSignals} sygnałów opisujących ofertę lub korzyści.`, recommendation: "Wyjaśnij dla kogo jest oferta, jaki problem rozwiązuje i co użytkownik otrzyma.", source: "Widoczny tekst strony głównej" }));
  checks.push(makeCheck({ id: "conversion_contact", category: "conversion", status: contactSignals >= 1 ? "pass" : "fail", severity: "high", title: "Dostępność kontaktu", observation: contactSignals ? `Znaleziono ${contactSignals} sygnałów kontaktu.` : "Nie znaleziono bezpośredniego sposobu kontaktu.", recommendation: "Dodaj widoczny kontakt lub formularz w kluczowych miejscach ścieżki.", source: "Linki i HTML strony głównej", weight: 2 }));
  checks.push(makeCheck({ id: "conversion_form", category: "conversion", status: inspection.formCount >= 1 ? "pass" : "warning", severity: "low", title: "Formularz lub ścieżka działania", observation: `Formularze na stronie głównej: ${inspection.formCount}.`, recommendation: "Jeżeli kontakt jest głównym celem, skróć drogę do prostego formularza lub innej jednoznacznej akcji.", source: "HTML strony głównej" }));
  checks.push(makeCheck({ id: "conversion_content_depth", category: "conversion", status: inspection.text.length >= 500 ? "pass" : "warning", severity: "low", title: "Zakres treści decyzyjnej", observation: `Widoczna treść ma około ${inspection.text.length} znaków.`, recommendation: "Dodaj informacje potrzebne do decyzji, ale utrzymaj jasną hierarchię i usuń powtórzenia.", source: "Widoczny tekst strony głównej" }));

  checks.push(makeCheck({ id: "trust_contact_identity", category: "trust", status: contactSignals ? "pass" : "fail", severity: "high", title: "Możliwość identyfikacji i kontaktu", observation: contactSignals ? "Strona udostępnia co najmniej jedną bezpośrednią drogę kontaktu." : "Nie znaleziono bezpośredniego kontaktu.", recommendation: "Pokaż dane kontaktowe i informacje identyfikujące podmiot odpowiedzialny za stronę.", source: "HTML strony głównej", weight: 2 }));
  checks.push(makeCheck({ id: "trust_privacy", category: "trust", status: inspection.privacyLink ? "pass" : "warning", severity: "medium", title: "Informacje prawne i prywatność", observation: inspection.privacyLink ? "Znaleziono odnośnik do polityki prywatności lub dokumentu prawnego." : "Nie znaleziono jednoznacznego odnośnika do polityki prywatności lub regulaminu.", recommendation: "Udostępnij aktualne dokumenty prawne w stałym, łatwo dostępnym miejscu.", source: "Linki strony głównej" }));
  const organizationTypes = inspection.structuredDataTypes.filter(type => /(?:Organization|LocalBusiness|Person|Corporation)/i.test(type));
  checks.push(makeCheck({ id: "trust_structured_identity", category: "trust", status: organizationTypes.length ? "pass" : "warning", severity: "low", title: "Dane strukturalne podmiotu", observation: organizationTypes.length ? `Znaleziono typy: ${organizationTypes.join(", ")}.` : "Nie znaleziono danych strukturalnych opisujących podmiot.", recommendation: "Dodaj zgodne z prawdą dane Organization lub właściwy typ LocalBusiness, jeżeli pasuje do działalności.", source: "JSON-LD strony głównej" }));
  checks.push(makeCheck({ id: "trust_proof", category: "trust", status: trustSignals >= 2 ? "pass" : trustSignals === 1 ? "warning" : "fail", severity: "medium", title: "Dowody wiarygodności", observation: `Znaleziono około ${trustSignals} sygnałów realizacji, doświadczenia lub opinii.`, recommendation: "Pokaż możliwe do zweryfikowania realizacje, proces, opinie lub doświadczenie bez składania nieudokumentowanych obietnic.", source: "Widoczny tekst strony głównej" }));

  const categories = Object.fromEntries(REPORT_CATEGORY_KEYS.map(key => [key, categorySummary(checks, key)]));
  const scoredCategories = REPORT_CATEGORY_KEYS.filter(key => Number.isInteger(categories[key].score));
  const categoryWeight = scoredCategories.reduce((sum, key) => sum + CATEGORY_WEIGHTS[key], 0);
  const overallScore = clamp(scoredCategories.reduce((sum, key) => sum + categories[key].score * CATEGORY_WEIGHTS[key], 0) / categoryWeight);
  const relevantChecks = checks.filter(check => check.status !== "not_applicable");
  const knownChecks = relevantChecks.filter(check => check.status !== "unknown");
  const coverage = relevantChecks.length ? knownChecks.length / relevantChecks.length : 0;
  const confidence = coverage >= 0.85 && pageSpeedComplete ? "high" : coverage >= 0.65 ? "medium" : "low";
  const priorities = checks
    .filter(check => check.status === "fail" || check.status === "warning")
    .sort((left, right) => SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity]
      || (left.status === right.status ? 0 : left.status === "fail" ? -1 : 1)
      || right.weight - left.weight)
    .slice(0, 5);
  const strengths = checks
    .filter(check => check.status === "pass" && check.severity !== "info")
    .sort((left, right) => SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity] || right.weight - left.weight)
    .slice(0, 8)
    .map(check => check.title);
  const partial = confidence !== "high";

  return {
    schemaVersion: REPORT_SCHEMA_VERSION,
    rulesetVersion: truncate(metadata.rulesetVersion || "unknown", 80),
    scannerVersion: truncate(metadata.scannerVersion || "unknown", 40),
    generatedAt: new Date().toISOString(),
    origin: snapshot.requestedOrigin,
    finalUrl: snapshot.url,
    summary: overallScore >= 80
      ? "Strona ma solidne podstawy. Największy efekt da dopracowanie kilku konkretnych punktów wskazanych w raporcie."
      : overallScore >= 60
        ? "Podstawy działają, ale bariery techniczne lub treściowe ograniczają widoczność, bezpieczeństwo albo konwersję."
        : "Strona wymaga uporządkowania fundamentów. Zacznij od problemów o wysokiej ważności i dopiero potem przejdź do optymalizacji.",
    overallScore,
    confidence,
    coverage: Math.round(coverage * 100),
    categories,
    priorities,
    strengths,
    checks,
    diagnostics,
    measurements: {
      responseMs: snapshot.durationMs,
      htmlBytes,
      redirects: snapshot.redirects.length,
      httpVersion: snapshot.httpVersion || null,
      tls: snapshot.tls ? {
        protocol: snapshot.tls.protocol,
        validTo: snapshot.tls.validTo,
        issuer: snapshot.tls.issuer,
      } : null,
      pagespeed: pagespeed?.metrics || null,
      dns: {
        zone: dns.zone || null,
        ipv4Count: ipv4.length,
        ipv6Count: ipv6.length,
        nameserverCount: dns.nameservers?.length || 0,
        mxCount: dns.mx?.length || 0,
      },
      crawl: {
        checked: crawledPages.length,
        broken: brokenPages.length,
        sitemapCount: availableSitemaps.length,
      },
    },
    limitations: [
      "Audyt analizuje publicznie dostępne zasoby bez logowania i nie jest testem penetracyjnym.",
      ...(pageSpeedComplete
        ? ["PageSpeed jest pomiarem laboratoryjnym z konkretnego momentu i może naturalnie różnić się między uruchomieniami."]
        : [`Kontrole Lighthouse są częściowe lub nieweryfikowalne. ${pageSpeedObservation}`]),
      ...(diagnostics.some(item => item.collector !== "pagespeed" && item.status === "unavailable")
        ? [truncate(`Część pomocniczych kolektorów była niedostępna: ${[...new Set(diagnostics.filter(item => item.collector !== "pagespeed" && item.status === "unavailable").map(item => item.collector))].slice(0, 8).join(", ")}. Przyczyny zapisano w diagnostyce raportu.`, 500)]
        : []),
      `Crawl jest celowo ograniczony do maksymalnie ${resources.crawlLimit || 0} publicznych podstron tego samego hosta i respektuje robots.txt.`,
      "DKIM nie jest zgadywany, ponieważ wiarygodna kontrola wymaga znajomości selektora używanego przez dostawcę poczty.",
      "Heurystyki konwersji i zaufania wskazują sygnały, ale nie zastępują badań z użytkownikami, danych analitycznych ani oceny prawnej.",
    ],
    partial,
  };
}

function emptyPageSpeedResult(status, code, {
  attempts = 0,
  durationMs = 0,
  retryable = false,
  httpStatus = null,
} = {}) {
  return {
    status,
    performanceScore: null,
    accessibilityScore: null,
    seoScore: null,
    bestPracticesScore: null,
    metrics: null,
    diagnostic: makeDiagnostic({
      collector: "pagespeed",
      status,
      code,
      retryable,
      attempts,
      durationMs,
      httpStatus,
    }),
  };
}

async function readBoundedJson(response, maxBytes) {
  const declaredLength = Number(response.headers.get("content-length") || 0);
  if (declaredLength > maxBytes) throw Object.assign(new Error("response_too_large"), { code: "response_too_large" });
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > maxBytes) throw Object.assign(new Error("response_too_large"), { code: "response_too_large" });
  try {
    return JSON.parse(Buffer.from(buffer).toString("utf8"));
  } catch {
    throw Object.assign(new Error("invalid_response"), { code: "invalid_response" });
  }
}

function pageSpeedHttpErrorCode(response, data) {
  if (response.status === 429) return "quota_exceeded";
  if (response.status === 401) return "invalid_api_key";
  if (response.status === 403) {
    const detail = `${data?.error?.status || ""} ${data?.error?.message || ""}`.toLowerCase();
    return detail.includes("api key") || detail.includes("api_key") ? "invalid_api_key" : "access_denied";
  }
  if (response.status >= 500) return "upstream_unavailable";
  return "http_error";
}

export async function fetchPageSpeed(origin, {
  apiKey = "",
  enabled = true,
  fetchImpl = fetch,
  timeoutMs = 90_000,
  maxAttempts = 2,
  retryDelayMs = 250,
  sleepImpl = delay => new Promise(resolve => setTimeout(resolve, delay)),
} = {}) {
  if (!enabled) return emptyPageSpeedResult("disabled", "disabled");
  if (!String(apiKey).trim()) return emptyPageSpeedResult("unavailable", "missing_api_key");
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", origin);
  endpoint.searchParams.set("strategy", "mobile");
  for (const category of ["performance", "accessibility", "seo", "best-practices"]) endpoint.searchParams.append("category", category);
  endpoint.searchParams.set("key", String(apiKey).trim());
  const startedAt = Date.now();
  let attempts = 0;
  let lastFailure = emptyPageSpeedResult("unavailable", "network_error");

  while (attempts < Math.max(1, Math.min(3, maxAttempts))) {
    attempts += 1;
    const elapsed = Date.now() - startedAt;
    const remainingMs = timeoutMs - elapsed;
    if (remainingMs <= 0) {
      return emptyPageSpeedResult("unavailable", "fetch_timeout", { attempts, durationMs: elapsed, retryable: true });
    }
    try {
      const response = await fetchImpl(endpoint, { signal: AbortSignal.timeout(remainingMs) });
      if (!response.ok) {
        let errorBody = null;
        try {
          errorBody = await readBoundedJson(response, 65_536);
        } catch {
          // Status HTTP remains authoritative when an error body is absent or malformed.
        }
        const code = pageSpeedHttpErrorCode(response, errorBody);
        const retryable = response.status >= 500;
        lastFailure = emptyPageSpeedResult("unavailable", code, {
          attempts,
          durationMs: Date.now() - startedAt,
          retryable,
          httpStatus: response.status,
        });
        if (!retryable || attempts >= maxAttempts || Date.now() - startedAt + retryDelayMs >= timeoutMs) return lastFailure;
        await sleepImpl(retryDelayMs);
        continue;
      }

      const data = await readBoundedJson(response, 15_000_000);
      const categories = data.lighthouseResult?.categories || {};
      const audits = data.lighthouseResult?.audits || {};
      const score = key => Number.isFinite(categories[key]?.score) ? Math.round(categories[key].score * 100) : null;
      const result = {
        performanceScore: score("performance"),
        accessibilityScore: score("accessibility"),
        seoScore: score("seo"),
        bestPracticesScore: score("best-practices"),
      };
      const scoreCount = Object.values(result).filter(Number.isFinite).length;
      const status = scoreCount === 4 ? "ok" : scoreCount > 0 ? "partial" : "unavailable";
      const code = scoreCount === 4 ? "ok" : "incomplete_result";
      return {
        status,
        ...result,
        metrics: scoreCount > 0 ? {
          lcpMs: audits["largest-contentful-paint"]?.numericValue ?? null,
          cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
          tbtMs: audits["total-blocking-time"]?.numericValue ?? null,
          speedIndexMs: audits["speed-index"]?.numericValue ?? null,
        } : null,
        diagnostic: makeDiagnostic({
          collector: "pagespeed",
          status,
          code,
          retryable: false,
          attempts,
          durationMs: Date.now() - startedAt,
          httpStatus: response.status,
        }),
      };
    } catch (error) {
      const code = codeFromError(error, "network_error");
      const retryable = isRetryableDiagnostic(code);
      lastFailure = emptyPageSpeedResult("unavailable", code, {
        attempts,
        durationMs: Date.now() - startedAt,
        retryable,
      });
      if (!retryable || attempts >= maxAttempts || Date.now() - startedAt + retryDelayMs >= timeoutMs) return lastFailure;
      await sleepImpl(retryDelayMs);
    }
  }
  return lastFailure;
}
