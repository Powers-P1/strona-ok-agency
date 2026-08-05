(() => {
  "use strict";

  const NOTICE_VERSION = "site-audit-v2-2026-08-05";
  const STORAGE_KEY = "ok-site-audit-job-v2";
  const POLL_DELAYS = [2000, 3000, 5000, 8000, 10000];
  const CATEGORY_LABELS = {
    performance: "Wydajność",
    seo: "SEO i indeksowanie",
    accessibility: "Dostępność",
    technical: "Domena i DNS",
    security: "HTTPS i bezpieczeństwo",
    conversion: "Konwersja i UX",
    trust: "Zaufanie i treść",
  };
  const STATUS_LABELS = {
    pass: "Zaliczone",
    warning: "Do sprawdzenia",
    fail: "Problem",
    unknown: "Nieweryfikowalne",
    not_applicable: "Nie dotyczy",
  };
  const CONFIDENCE_LABELS = {
    high: "Pełny pomiar",
    medium: "Pomiar częściowy",
    low: "Ograniczony pomiar",
  };

  const root = document.querySelector("[data-site-audit]");
  if (!root) return;

  const form = root.querySelector("[data-audit-form]");
  const domainInput = form?.elements.domain;
  const consentInput = form?.elements.authorization;
  const submit = form?.querySelector("button[type='submit']");
  const formStatus = root.querySelector("[data-audit-form-status]");
  const progress = root.querySelector("[data-audit-progress]");
  const progressTitle = root.querySelector("#audit-progress-title");
  const progressCopy = root.querySelector("[data-audit-progress-copy]");
  const progressDomain = root.querySelector("[data-audit-progress-domain]");
  const reportSection = root.querySelector("[data-audit-report]");
  const reportTitle = root.querySelector("#audit-report-title");
  const downloadButton = root.querySelector("[data-audit-download]");
  const downloadStatus = root.querySelector("[data-audit-download-status]");
  let turnstileWidgetId = null;
  let turnstileToken = "";
  let polling = false;
  let pollGeneration = 0;
  let currentReport = null;

  function setStatus(message, state = "") {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.dataset.state = state;
  }

  function setDownloadStatus(message, state = "") {
    if (!downloadStatus) return;
    downloadStatus.textContent = message;
    downloadStatus.dataset.state = state;
  }

  function setBusy(busy) {
    if (submit) {
      submit.disabled = busy;
      submit.setAttribute("aria-busy", busy ? "true" : "false");
    }
    if (domainInput) domainInput.disabled = busy;
    if (consentInput) consentInput.disabled = busy;
    form?.setAttribute("aria-busy", busy ? "true" : "false");
  }

  function resetTurnstile() {
    turnstileToken = "";
    if (window.turnstile && turnstileWidgetId !== null) window.turnstile.reset(turnstileWidgetId);
  }

  window.onSiteAuditTurnstileLoad = () => {
    if (!window.turnstile || turnstileWidgetId !== null) return;
    turnstileWidgetId = window.turnstile.render("#site-audit-turnstile", {
      sitekey: "0x4AAAAAAEA1pgmTfeMdKXil",
      action: "site_audit",
      size: "flexible",
      theme: "light",
      callback: token => { turnstileToken = token; setStatus(""); },
      "expired-callback": () => { turnstileToken = ""; },
      "error-callback": () => {
        turnstileToken = "";
        setStatus("Nie udało się załadować zabezpieczenia. Odśwież stronę i spróbuj ponownie.", "error");
      },
    });
  };

  function saveJob(job) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(job)); } catch { /* Prywatny tryb może blokować storage. */ }
  }

  function readJob() {
    try {
      const value = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "null");
      if (!value?.jobId || !value?.pollToken || !value?.expiresAt) return null;
      if (Date.parse(value.expiresAt) <= Date.now()) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return value;
    } catch {
      return null;
    }
  }

  function clearJob() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* no-op */ }
  }

  function showProgress(origin, status = "queued") {
    currentReport = null;
    reportSection.hidden = true;
    progress.hidden = false;
    progress.setAttribute("aria-busy", "true");
    progressDomain.textContent = origin || "";
    if (status === "running") {
      progressCopy.textContent = "Sprawdzamy DNS, HTTPS, strukturę, ograniczoną próbkę podstron i mobilny pomiar PageSpeed.";
    } else {
      progressCopy.textContent = "Zadanie czeka w bezpiecznej kolejce. Zwykle trwa to od kilkunastu sekund do około dwóch minut.";
    }
  }

  function addListItems(container, values, factory) {
    container.replaceChildren();
    for (const value of values || []) container.append(factory(value));
  }

  function categoryCard(key, category) {
    const article = document.createElement("article");
    article.className = "audit-category";
    article.dataset.status = category?.status || "unknown";
    const label = document.createElement("span");
    label.textContent = CATEGORY_LABELS[key] || key;
    const score = document.createElement("strong");
    score.textContent = String(category?.score ?? "—");
    const suffix = document.createElement("small");
    suffix.textContent = category?.score === null ? STATUS_LABELS[category?.status] || "Brak danych" : `/ 100 · ${STATUS_LABELS[category?.status] || ""}`;
    article.append(label, score, suffix);
    return article;
  }

  function priorityItem(finding) {
    const item = document.createElement("li");
    const title = document.createElement("strong");
    title.textContent = finding?.title || "Element do poprawy";
    const detail = document.createElement("p");
    detail.textContent = finding?.observation || finding?.detail || "";
    const recommendation = document.createElement("p");
    recommendation.className = "audit-priority__action";
    recommendation.textContent = finding?.recommendation || "";
    item.append(title, detail);
    if (recommendation.textContent) item.append(recommendation);
    return item;
  }

  function textItem(value) {
    const item = document.createElement("li");
    item.textContent = String(value || "");
    return item;
  }

  function checkItem(check) {
    const item = document.createElement("li");
    item.className = "audit-check";
    item.dataset.status = check?.status || "unknown";
    const header = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = check?.title || "Kontrola";
    const status = document.createElement("span");
    status.textContent = STATUS_LABELS[check?.status] || "Nieznany status";
    header.append(title, status);
    const observation = document.createElement("p");
    observation.textContent = check?.observation || "";
    const source = document.createElement("small");
    source.textContent = check?.source ? `Źródło: ${check.source}` : "";
    item.append(header, observation);
    if (check?.recommendation && new Set(["fail", "warning", "unknown"]).has(check.status)) {
      const recommendation = document.createElement("p");
      recommendation.className = "audit-check__recommendation";
      recommendation.textContent = check.recommendation;
      item.append(recommendation);
    }
    if (source.textContent) item.append(source);
    return item;
  }

  function checkGroup(key, report, open = false) {
    const category = report.categories[key];
    const details = document.createElement("details");
    details.className = "audit-check-group";
    details.open = open;
    const summary = document.createElement("summary");
    const label = document.createElement("strong");
    label.textContent = CATEGORY_LABELS[key] || key;
    const meta = document.createElement("span");
    meta.textContent = `${category?.score ?? "—"}/100 · ${category?.checked ?? 0}/${category?.total ?? 0} sprawdzonych`;
    summary.append(label, meta);
    const checks = document.createElement("ul");
    checks.className = "audit-checks";
    const categoryChecks = (report.checks || []).filter(check => check.category === key);
    addListItems(checks, categoryChecks, checkItem);
    details.append(summary, checks);
    return details;
  }

  function renderReport(job) {
    const report = job.report;
    if (report?.schemaVersion !== "2.0" || !report?.categories || !Array.isArray(report.checks)) {
      return showFailure("Raport ma nieprawidłowy format. Uruchom audyt ponownie.");
    }
    currentReport = report;
    progress.hidden = true;
    progress.setAttribute("aria-busy", "false");
    reportSection.hidden = false;
    root.querySelector("[data-audit-summary]").textContent = report.summary || "";
    root.querySelector("[data-audit-origin]").textContent = report.origin || job.origin || "";
    root.querySelector("[data-audit-confidence]").textContent = `${CONFIDENCE_LABELS[report.confidence] || "Pomiar częściowy"} · pokrycie ${report.coverage ?? "—"}%`;
    root.querySelector("[data-audit-overall]").textContent = String(report.overallScore ?? "—");

    const categoryKeys = Object.keys(CATEGORY_LABELS);
    const firstIssueKey = categoryKeys.find(key => new Set(["fail", "warning"]).has(report.categories[key]?.status));
    root.querySelector("[data-audit-categories]").replaceChildren(...categoryKeys.map(key => categoryCard(key, report.categories[key])));
    root.querySelector("[data-audit-check-groups]").replaceChildren(...categoryKeys.map(key => checkGroup(key, report, key === firstIssueKey)));
    addListItems(root.querySelector("[data-audit-priorities]"), report.priorities || [], priorityItem);
    addListItems(root.querySelector("[data-audit-strengths]"), report.strengths || [], textItem);
    addListItems(root.querySelector("[data-audit-limitations]"), report.limitations || [], textItem);

    if (!(report.priorities || []).length) {
      const empty = document.createElement("li");
      empty.textContent = "Nie wykryliśmy istotnego problemu w zakresie tego pasywnego testu.";
      root.querySelector("[data-audit-priorities]").append(empty);
    }
    if (!(report.strengths || []).length) {
      const empty = document.createElement("li");
      empty.textContent = "Audyt nie zebrał wystarczających danych, aby wskazać mocne strony.";
      root.querySelector("[data-audit-strengths]").append(empty);
    }
    setDownloadStatus("");
    reportTitle.focus({ preventScroll: true });
    reportSection.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    setBusy(false);
  }

  function showFailure(message) {
    currentReport = null;
    progress.hidden = true;
    progress.setAttribute("aria-busy", "false");
    setBusy(false);
    setStatus(message, "error");
    form?.scrollIntoView({ block: "center" });
  }

  async function requestJson(url, options = {}, timeoutMs = 15_000) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const error = new Error(data?.error?.message || "Żądanie nie powiodło się.");
        error.code = data?.error?.code || "request_failed";
        error.status = response.status;
        throw error;
      }
      return data;
    } finally {
      clearTimeout(timeout);
    }
  }

  async function pollJob(job) {
    if (polling) return;
    polling = true;
    const generation = ++pollGeneration;
    let attempt = 0;
    try {
      while (generation === pollGeneration) {
        const data = await requestJson(`/api/site-audits/${encodeURIComponent(job.jobId)}`, {
          headers: { authorization: `Bearer ${job.pollToken}` },
        });
        showProgress(data.origin || job.origin, data.status);
        saveJob({ ...job, origin: data.origin || job.origin, expiresAt: data.expiresAt || job.expiresAt });
        if (data.status === "completed" || data.status === "partial") {
          renderReport(data);
          return;
        }
        if (data.status === "failed") {
          showFailure(data.failure?.message || "Nie udało się ukończyć audytu. Spróbuj ponownie później.");
          return;
        }
        await new Promise(resolve => setTimeout(resolve, POLL_DELAYS[Math.min(attempt, POLL_DELAYS.length - 1)]));
        attempt += 1;
      }
    } catch (error) {
      if (error.name === "AbortError") showFailure("Połączenie trwało zbyt długo. Sprawdź sieć i spróbuj ponownie.");
      else if (error.status === 404) { clearJob(); showFailure("Dostęp do tego audytu wygasł. Uruchom nowy test."); }
      else showFailure(error.message || "Nie udało się pobrać wyniku. Spróbuj ponownie.");
    } finally {
      polling = false;
    }
  }

  form?.addEventListener("submit", async event => {
    event.preventDefault();
    setStatus("");
    if (!domainInput.value.trim()) {
      setStatus("Podaj domenę do sprawdzenia.", "error");
      domainInput.focus();
      return;
    }
    if (!consentInput.checked) {
      setStatus("Potwierdź, że możesz zlecić analizę tej domeny.", "error");
      consentInput.focus();
      return;
    }
    if (!turnstileToken) {
      setStatus("Dokończ weryfikację zabezpieczenia.", "error");
      document.getElementById("site-audit-turnstile")?.scrollIntoView({ block: "center" });
      return;
    }

    setBusy(true);
    setStatus("Przyjmujemy zadanie…");
    const submittedDomain = domainInput.value.trim();
    const token = turnstileToken;
    try {
      const data = await requestJson("/api/site-audits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          domain: submittedDomain,
          turnstileToken: token,
          consent: { accepted: true, noticeVersion: NOTICE_VERSION },
        }),
      });
      resetTurnstile();
      const job = {
        jobId: data.jobId,
        pollToken: data.pollToken,
        origin: data.origin || submittedDomain,
        expiresAt: data.expiresAt,
      };
      saveJob(job);
      setStatus(data.deduplicated ? "Pokazujemy aktualny raport z ostatnich 24 godzin." : "Audyt został przyjęty.", "success");
      if (data.status === "completed" || data.status === "partial") renderReport(data);
      else { showProgress(job.origin, data.status); progressTitle.focus({ preventScroll: true }); await pollJob(job); }
    } catch (error) {
      resetTurnstile();
      const messages = {
        domain_limit_reached: "Ta domena wykorzystała dziś limit trzech nowych audytów.",
        daily_limit_reached: "Dzisiejszy limit audytów został wykorzystany. Wróć jutro.",
        private_target: "Ta domena wskazuje na niedozwolony adres sieciowy.",
        dns_not_found: "Domena nie wskazuje na publiczny serwer WWW.",
        turnstile_failed: "Weryfikacja zabezpieczenia wygasła. Spróbuj ponownie.",
      };
      showFailure(messages[error.code] || error.message || "Nie udało się uruchomić audytu.");
    }
  });

  downloadButton?.addEventListener("click", async () => {
    if (!currentReport || !root.dataset.auditPdfModule) return;
    downloadButton.disabled = true;
    downloadButton.setAttribute("aria-busy", "true");
    setDownloadStatus("Przygotowujemy raport PDF…");
    try {
      const pdf = await import(root.dataset.auditPdfModule);
      await pdf.downloadAuditPdf(currentReport);
      setDownloadStatus("Raport PDF został pobrany.", "success");
    } catch (error) {
      console.error("site_audit_pdf_failed", error);
      setDownloadStatus("Nie udało się przygotować PDF. Spróbuj ponownie.", "error");
    } finally {
      downloadButton.disabled = false;
      downloadButton.removeAttribute("aria-busy");
    }
  });

  root.querySelector("[data-audit-new]")?.addEventListener("click", () => {
    pollGeneration += 1;
    polling = false;
    currentReport = null;
    clearJob();
    reportSection.hidden = true;
    progress.hidden = true;
    setBusy(false);
    setStatus("");
    setDownloadStatus("");
    domainInput.value = "";
    consentInput.checked = false;
    resetTurnstile();
    domainInput.focus();
    form.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  const restored = readJob();
  if (restored) {
    setBusy(true);
    showProgress(restored.origin, "queued");
    pollJob(restored);
  }
})();
