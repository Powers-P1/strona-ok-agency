/* OK Agency — zgody, atrybucja kampanii i analityka reklamowa.

   Google Consent Mode v2 działa w wariancie Basic: stan "denied" jest ustawiany
   lokalnie przed decyzją, ale Google tag nie ładuje się i nie wysyła requestów.
   GA4 startuje po zgodzie analitycznej, a Google Ads i Meta dopiero marketingowej.
   Meta Pixel reaguje natychmiast na wycofanie zgody.
*/
(() => {
  "use strict";

  const PIXEL_ID = "1057817209974571";
  const GOOGLE_ADS_ID = "AW-18361103115";
  const GA4_ID = "G-D4EWVVL8ZK";
  const GOOGLE_ADS_LEAD_LABEL = "O7kQCOLA1dkcEIvmoLNE";
  // Brak osobnej akcji Google Ads dla ukończenia diagnozy — zdarzenie trafia do GA4.
  const GOOGLE_ADS_DIAGNOSIS_LABEL = "";

  const CONSENT_STORAGE_KEY = "ok-consent";
  const CONSENT_POLICY_VERSION = 2;
  const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
  const CONSENT_CLOCK_SKEW_MS = 5 * 60 * 1000;
  const ATTRIBUTION_STORAGE_KEY = "ok-attribution";
  const ATTRIBUTION_VERSION = 1;

  const ATTRIBUTION_KEYS = Object.freeze([
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "gbraid",
    "wbraid",
    "fbclid",
  ]);
  const ATTRIBUTION_KEY_SET = new Set(ATTRIBUTION_KEYS);
  const DIAGNOSIS_OUTCOMES = new Set([
    "website",
    "social",
    "campaign",
    "conversation",
    "none",
  ]);
  const FORM_TYPES = new Set(["contact", "diagnosis"]);
  const CONSENT_LEVELS = new Set(["denied", "analytics", "marketing"]);

  const hasMeta = /^\d{10,20}$/.test(PIXEL_ID);
  const hasGoogleAds = /^AW-\d+$/.test(GOOGLE_ADS_ID);
  const hasGa4 = /^G-[A-Z0-9]+$/.test(GA4_ID);
  const hasGoogleAdsLead = /^[A-Za-z0-9_-]+$/.test(GOOGLE_ADS_LEAD_LABEL);
  const hasGoogleAdsDiagnosis = /^[A-Za-z0-9_-]+$/.test(GOOGLE_ADS_DIAGNOSIS_LABEL);
  const hasGoogleTag = hasGoogleAds || hasGa4;

  /* ---------- bezpieczne dane strony i kampanii ---------- */

  const cleanValue = (value, limit = 300) => {
    if (typeof value !== "string") return "";
    const cleaned = value
      .replace(/[\u0000-\u001f\u007f]/g, "")
      .trim()
      .slice(0, limit);
    // Parametry kampanii nie mogą stać się kanałem wysyłki adresu e-mail do GA4.
    return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(cleaned) ? "" : cleaned;
  };

  const attributionParamsFromUrl = value => {
    const result = {};
    try {
      const url = new URL(value, window.location.href);
      for (const [rawKey, rawValue] of url.searchParams) {
        const key = rawKey.toLowerCase();
        if (!ATTRIBUTION_KEY_SET.has(key) || Object.hasOwn(result, key)) continue;
        const cleaned = cleanValue(rawValue, key.startsWith("utm_") ? 200 : 512);
        if (cleaned) result[key] = cleaned;
      }
    } catch {
      /* błędny URL nie trafia do pomiaru */
    }
    return result;
  };

  const safeUrl = (value, keepAttribution = false) => {
    if (!value) return "";
    try {
      const url = new URL(value, window.location.href);
      if (!/^https?:$/.test(url.protocol)) return "";
      url.username = "";
      url.password = "";
      let decodedPath = url.pathname;
      try {
        decodedPath = decodeURIComponent(decodedPath);
      } catch {
        /* pozostaw zakodowaną ścieżkę do kontroli poniżej */
      }
      if (
        /[^\s/@]+@[^\s/]+\.[^\s/]+/.test(decodedPath)
        || /(?:^|\/)\+?\d[\d(). -]{6,}\d(?:\/|$)/.test(decodedPath)
      ) url.pathname = "/";
      url.hash = "";
      url.search = "";
      if (keepAttribution) {
        const params = attributionParamsFromUrl(value);
        for (const key of ATTRIBUTION_KEYS) {
          if (params[key]) url.searchParams.set(key, params[key]);
        }
      }
      const normalized = url.toString();
      return normalized.length <= 1000 ? normalized : "";
    } catch {
      return "";
    }
  };

  const safeReferrer = value => {
    if (!value) return "";
    try {
      const url = new URL(value, window.location.href);
      return /^https?:$/.test(url.protocol) ? url.origin : "";
    } catch {
      return "";
    }
  };

  const SAFE_FUNCTIONAL_PARAMS = Object.freeze({
    context: new Set([
      "web", "website", "social", "campaign", "diagnosis",
      "process", "about", "conversation", "none",
    ]),
    source: new Set(["diagnosis", "process"]),
    from: new Set([
      "web", "website", "social", "campaign", "diagnosis",
      "process", "about", "conversation", "none",
    ]),
  });

  const withFunctionalParams = baseValue => {
    if (!baseValue) return "";
    try {
      const target = new URL(baseValue);
      const source = new URL(window.location.href);
      for (const [key, allowed] of Object.entries(SAFE_FUNCTIONAL_PARAMS)) {
        const value = source.searchParams.get(key);
        if (allowed.has(value)) target.searchParams.set(key, value);
      }
      return target.toString();
    } catch {
      return baseValue;
    }
  };

  const analyticsPageLocation = withFunctionalParams(safeUrl(window.location.href, false));
  const marketingPageLocation = withFunctionalParams(safeUrl(window.location.href, true));
  const currentReferrer = safeReferrer(document.referrer);
  const currentCampaignParams = attributionParamsFromUrl(window.location.href);
  const currentTouch = Object.freeze({
    captured_at: new Date().toISOString(),
    landing_page: marketingPageLocation,
    referrer: currentReferrer,
    ...currentCampaignParams,
  });

  const hasExternalReferrer = (() => {
    if (!currentReferrer) return false;
    try {
      return new URL(currentReferrer).origin !== window.location.origin;
    } catch {
      return false;
    }
  })();
  const hasCampaignSignal = Object.keys(currentCampaignParams).length > 0;

  /* ---------- decyzja o zgodzie ---------- */

  const discardStoredDecision = () => {
    try {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
    } catch {
      /* storage może być niedostępne */
    }
    return null;
  };

  const readDecision = () => {
    try {
      const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (
        !parsed
        || parsed.version !== CONSENT_POLICY_VERSION
        || !CONSENT_LEVELS.has(parsed.level)
      ) return discardStoredDecision();
      const decidedAt = Date.parse(parsed.at);
      const age = Date.now() - decidedAt;
      if (
        !Number.isFinite(decidedAt)
        || age < -CONSENT_CLOCK_SKEW_MS
        || age > CONSENT_MAX_AGE_MS
      ) return discardStoredDecision();
      return parsed.level;
    } catch {
      return discardStoredDecision();
    }
  };

  const saveDecision = level => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({
        version: CONSENT_POLICY_VERSION,
        level,
        at: new Date().toISOString(),
      }));
    } catch {
      /* w trybie prywatnym decyzja obowiązuje do końca widoku */
    }
  };

  let decision = readDecision();
  let analyticsGranted = decision === "analytics" || decision === "marketing";
  let marketingGranted = decision === "marketing";

  /* ---------- Google tag i Consent Mode v2 ---------- */

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  const setGoogleConsent = level => {
    if (!hasGoogleTag) return;
    const analytics = level === "analytics" || level === "marketing";
    const marketing = level === "marketing";
    window.gtag("consent", "update", {
      ad_storage: marketing ? "granted" : "denied",
      ad_user_data: marketing ? "granted" : "denied",
      ad_personalization: marketing ? "granted" : "denied",
      analytics_storage: analytics ? "granted" : "denied",
    });
  };

  let googleTagLoaded = false;
  let ga4Configured = false;
  let googleAdsConfigured = false;

  const prepareVendorLocation = () => {
    const target = marketingGranted ? marketingPageLocation : analyticsPageLocation;
    if (!target || !window.history?.replaceState || target === window.location.href) return;
    window.history.replaceState(window.history.state, "", target);
  };

  const loadGoogleTag = () => {
    prepareVendorLocation();
    if (googleTagLoaded || !hasGoogleTag) return;
    googleTagLoaded = true;
    const loaderId = hasGa4 ? GA4_ID : GOOGLE_ADS_ID;
    const tag = document.createElement("script");
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(loaderId)}`;
    document.head.appendChild(tag);
    window.gtag("js", new Date());
  };

  const configureGa4 = () => {
    if (!analyticsGranted || !hasGa4 || ga4Configured) return;
    loadGoogleTag();
    ga4Configured = true;
    window.gtag("config", GA4_ID, {
      send_page_view: false,
      page_location: analyticsPageLocation,
      page_referrer: currentReferrer,
    });
  };

  const configureGoogleAds = () => {
    if (!marketingGranted || !hasGoogleAds || googleAdsConfigured) return;
    prepareVendorLocation();
    loadGoogleTag();
    googleAdsConfigured = true;
    window.gtag("config", GOOGLE_ADS_ID, {
      page_location: marketingPageLocation,
      page_referrer: currentReferrer,
    });
  };

  if (hasGoogleTag) {
    // W Basic Mode polecenie pozostaje lokalnie w dataLayer do chwili zgody.
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      functionality_storage: "granted",
      security_storage: "granted",
      wait_for_update: 500,
    });
  }

  /* ---------- atrybucja first/last touch ---------- */

  let volatileAttribution = null;

  const normalizeStoredTouch = input => {
    if (!input || typeof input !== "object") return null;
    const touch = {
      captured_at: cleanValue(input.captured_at, 40),
      landing_page: safeUrl(input.landing_page, true),
      referrer: safeReferrer(input.referrer),
    };
    for (const key of ATTRIBUTION_KEYS) {
      const value = cleanValue(input[key], key.startsWith("utm_") ? 200 : 512);
      if (value) touch[key] = value;
    }
    return touch.landing_page ? touch : null;
  };

  const readAttribution = () => {
    if (!marketingGranted) return null;
    try {
      const raw = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
      if (!raw) return volatileAttribution;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== ATTRIBUTION_VERSION) return null;
      const firstTouch = normalizeStoredTouch(parsed.first_touch);
      const lastTouch = normalizeStoredTouch(parsed.last_touch);
      if (!firstTouch || !lastTouch) return null;
      return { version: ATTRIBUTION_VERSION, first_touch: firstTouch, last_touch: lastTouch };
    } catch {
      return volatileAttribution;
    }
  };

  const writeAttribution = attribution => {
    if (!marketingGranted) return;
    volatileAttribution = attribution;
    try {
      sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
    } catch {
      /* pamięć widoku zachowuje atrybucję, gdy sessionStorage jest niedostępne */
    }
  };

  const clearAttribution = () => {
    volatileAttribution = null;
    try {
      sessionStorage.removeItem(ATTRIBUTION_STORAGE_KEY);
    } catch {
      /* brak dostępu do storage nie blokuje wycofania zgody w pamięci */
    }
  };

  const captureAttribution = () => {
    if (!marketingGranted) return;
    const stored = readAttribution();
    const touch = normalizeStoredTouch(currentTouch);
    if (!touch) return;

    const attribution = {
      version: ATTRIBUTION_VERSION,
      first_touch: stored?.first_touch || touch,
      last_touch: stored?.last_touch || touch,
    };
    if (!stored || hasCampaignSignal || hasExternalReferrer) {
      attribution.last_touch = touch;
    }
    writeAttribution(attribution);
  };

  const attributionForLead = () => {
    if (!marketingGranted) return null;
    const stored = readAttribution();
    if (!stored) return null;
    return {
      first_touch: { ...stored.first_touch },
      last_touch: { ...stored.last_touch },
    };
  };

  /* ---------- Meta Pixel ---------- */

  let pixelStarted = false;
  let metaPageViewSent = false;

  const startPixel = () => {
    if (!marketingGranted || !hasMeta) return;
    prepareVendorLocation();

    if (pixelStarted) {
      window.fbq?.("consent", "grant");
      return;
    }
    pixelStarted = true;

    const n = (window.fbq = window.fbq || function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = n.queue || [];

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);

    window.fbq("consent", "grant");
    window.fbq("init", PIXEL_ID);
    if (!metaPageViewSent) {
      metaPageViewSent = true;
      window.fbq("track", "PageView");
    }
  };

  const revokePixel = () => {
    if (!pixelStarted || !window.fbq) return;
    window.fbq("consent", "revoke");
  };

  /* ---------- zdarzenia ---------- */

  let pageViewSent = false;
  let contactViewSent = false;

  const ga4Event = (name, parameters = {}) => {
    if (!analyticsGranted || !hasGa4) return;
    window.gtag("event", name, {
      ...parameters,
      send_to: GA4_ID,
    });
  };

  const sendPageEvents = () => {
    if (!analyticsGranted || !hasGa4) return;
    if (!pageViewSent) {
      pageViewSent = true;
      ga4Event("page_view", {
        page_location: marketingGranted ? marketingPageLocation : analyticsPageLocation,
        page_referrer: currentReferrer,
      });
    }
    const contactPath = window.location.pathname.replace(/\/+$/, "") === "/kontakt";
    if (contactPath && !contactViewSent) {
      contactViewSent = true;
      ga4Event("contact_view");
    }
  };

  let reloadRequested = false;
  const requestControlledReload = () => {
    if (reloadRequested) return;
    reloadRequested = true;
    window.location.reload();
  };

  const applyDecision = level => {
    const nextAnalyticsGranted = level === "analytics" || level === "marketing";
    const nextMarketingGranted = level === "marketing";
    const losesLoadedAnalytics = googleTagLoaded
      && analyticsGranted
      && !nextAnalyticsGranted;
    const losesLoadedMarketing = (googleAdsConfigured || pixelStarted)
      && marketingGranted
      && !nextMarketingGranted;

    if (losesLoadedAnalytics || losesLoadedMarketing) {
      analyticsGranted = nextAnalyticsGranted;
      marketingGranted = nextMarketingGranted;
      decision = level;
      // Nie wysyłamy consent update do już załadowanego vendora. Nowy dokument
      // uruchomi tylko destinations dozwolone przez zapisaną decyzję.
      revokePixel();
      clearAttribution();
      requestControlledReload();
      return;
    }

    analyticsGranted = nextAnalyticsGranted;
    marketingGranted = nextMarketingGranted;
    decision = level;
    setGoogleConsent(level);
    configureGa4();
    configureGoogleAds();

    if (!marketingGranted) {
      revokePixel();
      clearAttribution();
    } else {
      captureAttribution();
      startPixel();
    }
    if (analyticsGranted) sendPageEvents();
  };

  const diagnosisStart = () => {
    ga4Event("diagnosis_start");
  };

  const diagnosisComplete = outcome => {
    const safeOutcome = DIAGNOSIS_OUTCOMES.has(outcome) ? outcome : "none";
    ga4Event("diagnosis_complete", { diagnosis_outcome: safeOutcome });

    if (marketingGranted && hasMeta && window.fbq) {
      window.fbq("trackCustom", "DiagnosisComplete", {
        diagnosis_outcome: safeOutcome,
      });
    }
    if (
      marketingGranted
      && hasGoogleAds
      && hasGoogleAdsDiagnosis
    ) {
      window.gtag("event", "conversion", {
        send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_DIAGNOSIS_LABEL}`,
      });
    }
  };

  let fallbackEventCounter = 0;
  const createEventId = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    fallbackEventCounter += 1;
    return `ok-${Date.now()}-${fallbackEventCounter}`;
  };

  const normalizeEventId = value => (
    typeof value === "string" && /^[A-Za-z0-9._:-]{8,100}$/.test(value)
      ? value
      : ""
  );

  const createMarketingEventId = () => (marketingGranted ? createEventId() : "");

  const generateLead = (formType, suppliedEventId) => {
    const safeFormType = FORM_TYPES.has(formType) ? formType : "contact";
    const eventId = marketingGranted
      ? normalizeEventId(suppliedEventId) || createEventId()
      : "";
    ga4Event("generate_lead", { form_type: safeFormType });

    if (marketingGranted && hasMeta && window.fbq) {
      // Jeden standardowy event zgodny z optymalizacją zestawu reklam.
      // eventID umożliwia deduplikację, jeśli CAPI zostanie spięte z tym samym ID.
      window.fbq("track", "Contact", {}, { eventID: eventId });
    }
    if (marketingGranted && hasGoogleAds && hasGoogleAdsLead) {
      window.gtag("event", "conversion", {
        send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_LEAD_LABEL}`,
        transaction_id: eventId,
      });
    }
  };

  /* ---------- banner ---------- */

  let banner = null;

  const closeBanner = () => {
    if (!banner) return;
    banner.remove();
    banner = null;
  };

  const decide = level => {
    saveDecision(level);
    applyDecision(level);
    closeBanner();
  };

  const buildBanner = () => {
    const wrap = document.createElement("section");
    wrap.className = "ok-consent";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-live", "polite");
    wrap.setAttribute("aria-label", "Zgoda na pliki cookie");

    const text = document.createElement("div");
    text.className = "ok-consent__text";

    const title = document.createElement("p");
    title.className = "ok-consent__title";
    title.textContent = "Zanim ruszymy dalej";
    text.appendChild(title);

    const body = document.createElement("p");
    body.className = "ok-consent__body";
    body.append(
      "Możesz zgodzić się tylko na pomiar statystyczny GA4 albo również na atrybucję i narzędzia reklamowe. Przed wyborem i po odrzuceniu nie uruchamiamy narzędzi Google ani Meta. Szczegóły w ",
    );
    const link = document.createElement("a");
    link.href = "/polityka-prywatnosci";
    link.textContent = "polityce prywatności";
    body.appendChild(link);
    body.append(".");
    text.appendChild(body);

    const actions = document.createElement("div");
    actions.className = "ok-consent__actions";

    const reject = document.createElement("button");
    reject.type = "button";
    reject.className = "ok-consent__button ok-consent__button--ghost";
    reject.textContent = "Odrzuć";
    reject.addEventListener("click", () => decide("denied"));

    const analyticsOnly = document.createElement("button");
    analyticsOnly.type = "button";
    analyticsOnly.className = "ok-consent__button ok-consent__button--ghost";
    analyticsOnly.textContent = "Tylko analityka";
    analyticsOnly.addEventListener("click", () => decide("analytics"));

    const acceptMarketing = document.createElement("button");
    acceptMarketing.type = "button";
    acceptMarketing.className = "ok-consent__button ok-consent__button--solid";
    acceptMarketing.textContent = "Analityka i reklamy";
    acceptMarketing.addEventListener("click", () => decide("marketing"));

    actions.append(reject, analyticsOnly, acceptMarketing);
    wrap.append(text, actions);
    return wrap;
  };

  const openBanner = () => {
    if (banner) return;
    banner = buildBanner();
    document.body.appendChild(banner);
    banner.querySelector(".ok-consent__button--ghost")?.focus({ preventScroll: true });
  };

  const applyMissingDecision = () => {
    const vendorsLoaded = googleTagLoaded || pixelStarted;
    decision = null;
    analyticsGranted = false;
    marketingGranted = false;
    revokePixel();
    clearAttribution();
    if (vendorsLoaded) {
      requestControlledReload();
      return;
    }
    openBanner();
  };

  /* ---------- start i publiczne API ---------- */

  if (decision === null) {
    clearAttribution();
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", openBanner, { once: true });
    } else {
      openBanner();
    }
  } else {
    applyDecision(decision);
  }

  window.okConsent = Object.freeze({
    state: () => decision,
    open: openBanner,
    revoke: () => decide("denied"),
  });

  window.addEventListener("storage", event => {
    if (event.key !== null && event.key !== CONSENT_STORAGE_KEY) return;
    const nextDecision = readDecision();
    if (nextDecision === null) {
      applyMissingDecision();
      return;
    }
    applyDecision(nextDecision);
    closeBanner();
  });

  window.okAnalytics = Object.freeze({
    diagnosisStart,
    diagnosisComplete,
    generateLead,
    createMarketingEventId,
    attribution: attributionForLead,
    // Aliasy zachowują kompatybilność z istniejącymi wywołaniami stron.
    lead: generateLead,
    diagnoza: diagnosisComplete,
  });
})();
