/* OK Agency — analityka kampanii (Meta Pixel + Google Ads gtag) + zgody
   WERSJA SZABLONU — przed wdrożeniem uzupełnić identyfikatory:
     PIXEL_ID      → z Meta Events Manager (15-16 cyfr)
     AW-CONVERSION → z Google Ads, np. AW-123456789
     AW_LABEL_LEAD → etykieta konwersji "Wysłanie formularza", np. abcDEF123
     AW_LABEL_DIAG → etykieta konwersji "Ukończenie diagnozy"
   Plik docelowy: assets/analytics.js (kopiować 1:1 po uzupełnieniu ID)

   Zgody: Google Consent Mode v2 startuje z "denied" i jest aktualizowany
   dopiero po decyzji użytkownika. Piksel Meta nie ładuje się w ogóle,
   dopóki zgoda nie zostanie udzielona.
*/
(() => {
  "use strict";

  const PIXEL_ID = "1057817209974571";    // ← META PIXEL ID
  const AW_ID = "AW-18361103115";         // ← GOOGLE ADS ID
  const AW_LABEL_LEAD = "O7kQCOLA1dkcEIvmoLNE"; // ← etykieta: wysłanie formularza
  const AW_LABEL_DIAG = "AW_LABEL_DIAG";  // ← etykieta: ukończenie diagnozy

  const configured = v => v && !/^(PIXEL_ID|AW-CONVERSION|AW_LABEL)/.test(v);

  /* ---------- przechowywanie decyzji ---------- */

  const STORAGE_KEY = "ok-consent";
  const POLICY_VERSION = 1; // podbić, gdy zmieni się zakres zgód — banner pojawi się ponownie

  const readDecision = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== POLICY_VERSION) return null;
      return parsed.granted === true;
    } catch {
      return null;
    }
  };

  const saveDecision = granted => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: POLICY_VERSION,
        granted,
        at: new Date().toISOString(),
      }));
    } catch {
      /* tryb prywatny — decyzja obowiązuje do końca sesji */
    }
  };

  /* ---------- Google tag: domyślnie bez zgody ---------- */

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };

  if (configured(AW_ID)) {
    // Consent Mode v2 — musi zostać ustawione przed załadowaniem gtag.js.
    window.gtag("consent", "default", {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      functionality_storage: "granted",
      security_storage: "granted",
      wait_for_update: 500,
    });

    const tag = document.createElement("script");
    tag.async = true;
    tag.src = `https://www.googletagmanager.com/gtag/js?id=${AW_ID}`;
    document.head.appendChild(tag);
    window.gtag("js", new Date());
    window.gtag("config", AW_ID);
  }

  /* ---------- Meta Pixel: dopiero po zgodzie ---------- */

  let pixelStarted = false;

  const startPixel = () => {
    if (pixelStarted || !configured(PIXEL_ID)) return;
    pixelStarted = true;

    const n = (window.fbq = window.fbq || function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);

    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
  };

  const applyDecision = granted => {
    if (configured(AW_ID)) {
      window.gtag("consent", "update", {
        ad_storage: granted ? "granted" : "denied",
        ad_user_data: granted ? "granted" : "denied",
        ad_personalization: granted ? "granted" : "denied",
        analytics_storage: granted ? "granted" : "denied",
      });
    }
    if (granted) startPixel();
  };

  /* ---------- banner ---------- */

  let banner = null;

  const closeBanner = () => {
    if (!banner) return;
    banner.remove();
    banner = null;
  };

  const decide = granted => {
    saveDecision(granted);
    applyDecision(granted);
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
      "Używamy plików cookie, żeby mierzyć skuteczność reklam. Bez Twojej zgody nie uruchamiamy narzędzi marketingowych. Szczegóły w ",
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
    reject.textContent = "Odrzucam";
    reject.addEventListener("click", () => decide(false));

    const accept = document.createElement("button");
    accept.type = "button";
    accept.className = "ok-consent__button ok-consent__button--solid";
    accept.textContent = "Akceptuję";
    accept.addEventListener("click", () => decide(true));

    actions.append(reject, accept);
    wrap.append(text, actions);
    return wrap;
  };

  const openBanner = () => {
    if (banner) return;
    banner = buildBanner();
    document.body.appendChild(banner);
    banner.querySelector(".ok-consent__button--ghost")?.focus({ preventScroll: true });
  };

  /* ---------- start ---------- */

  const decision = readDecision();

  if (decision === null) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", openBanner, { once: true });
    } else {
      openBanner();
    }
  } else {
    applyDecision(decision);
  }

  // Pozwala wycofać lub zmienić zgodę w dowolnym momencie.
  window.okConsent = {
    state: () => readDecision(),
    open: openBanner,
    revoke: () => decide(false),
  };

  /* ---------- API dla stron ---------- */
  window.okAnalytics = {
    /** Konwersja główna: wysłanie formularza kontaktowego. */
    lead() {
      if (configured(PIXEL_ID) && window.fbq) {
        window.fbq("track", "Lead");
        // Contact — zdarzenie, na które optymalizuje zestaw reklam w Meta
        window.fbq("track", "Contact");
      }
      if (configured(AW_ID) && window.gtag && configured(AW_LABEL_LEAD)) {
        window.gtag("event", "conversion", { send_to: `${AW_ID}/${AW_LABEL_LEAD}` });
      }
    },
    /** Konwersja wtórna: ukończenie diagnozy. */
    diagnoza() {
      if (configured(PIXEL_ID) && window.fbq) {
        window.fbq("trackCustom", "DiagnosisComplete");
      }
      if (configured(AW_ID) && window.gtag && configured(AW_LABEL_DIAG)) {
        window.gtag("event", "conversion", { send_to: `${AW_ID}/${AW_LABEL_DIAG}` });
      }
    },
  };
})();
