import { formatPolishCount } from "./polish-copy.js";

function parseHsts(value) {
  const maxAge = /(?:^|;)\s*max-age\s*=\s*(\d+)/i.exec(value)?.[1];
  return {
    maxAge: maxAge ? Number(maxAge) : null,
    includeSubDomains: /(?:^|;)\s*includesubdomains\b/i.test(value),
    preload: /(?:^|;)\s*preload\b/i.test(value),
  };
}

export function evaluateHsts(value, isHttps = true) {
  const header = String(value || "").replace(/\s+/g, " ").trim().slice(0, 600);
  if (!isHttps) {
    return {
      status: "not_applicable",
      observation: "Kontrola HSTS dotyczy wyłącznie strony końcowej dostępnej przez HTTPS.",
      recommendation: "",
    };
  }

  if (!header) {
    return {
      status: "warning",
      observation: "Nagłówek HSTS nie jest wysyłany.",
      recommendation: "Włącz HSTS po potwierdzeniu pełnej obsługi HTTPS; zacznij od kontrolowanego max-age, a includeSubDomains i preload stosuj dopiero po audycie wszystkich subdomen.",
    };
  }

  const parsed = parseHsts(header);
  if (!Number.isFinite(parsed.maxAge) || parsed.maxAge === 0) {
    return {
      status: "fail",
      observation: Number.isFinite(parsed.maxAge)
        ? `Nagłówek HSTS ustawia max-age=0, więc polityka jest wyłączona. Nagłówek: ${header}`
        : `Nagłówek HSTS nie zawiera poprawnej dyrektywy max-age. Nagłówek: ${header}`,
      recommendation: "Włącz HSTS z poprawną dyrektywą max-age po potwierdzeniu pełnej obsługi HTTPS; includeSubDomains i preload stosuj dopiero po audycie wszystkich subdomen.",
    };
  }

  const days = Math.floor(parsed.maxAge / 86_400);
  const directives = [parsed.includeSubDomains ? "includeSubDomains" : "", parsed.preload ? "preload" : ""]
    .filter(Boolean)
    .join(", ");
  const observation = `HSTS jest aktywny: max-age=${parsed.maxAge} s (${formatPolishCount(days, { one: "dzień", few: "dni", many: "dni" })})${directives ? `; dodatkowe dyrektywy: ${directives}` : ""}.`;
  if (parsed.maxAge < 31_536_000) {
    return {
      status: "warning",
      observation,
      recommendation: "HSTS jest już aktywny. Po potwierdzeniu pełnej obsługi HTTPS wydłuż max-age do co najmniej 31536000 sekund (1 rok); includeSubDomains i preload stosuj dopiero po audycie wszystkich subdomen.",
    };
  }

  return { status: "pass", observation, recommendation: "" };
}
