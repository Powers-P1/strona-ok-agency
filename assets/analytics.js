/* OK Agency — analityka kampanii (Meta Pixel + Google Ads gtag)
   PIXEL_ID uzupełniony: 1057817209974571 (Meta Events Manager)
   AW-CONVERSION → z Google Ads, np. AW-123456789 (do uzupełnienia przy starcie Google Ads)
   AW_LABEL_LEAD → etykieta konwersji "Wysłanie formularza", np. abcDEF123
   AW_LABEL_DIAG → etykieta konwersji "Ukończenie diagnozy"
   Deploy trigger: 2026-07-31 (wymuszenie przebudowania Cloudflare Pages)
*/
(() => {
  "use strict";

  const PIXEL_ID = "1057817209974571";    // ← META PIXEL ID
  const AW_ID = "AW-CONVERSION";          // ← GOOGLE ADS ID
  const AW_LABEL_LEAD = "AW_LABEL_LEAD";  // ← etykieta: wysłanie formularza
  const AW_LABEL_DIAG = "AW_LABEL_DIAG";  // ← etykieta: ukończenie diagnozy

  const configured = v => v && !/^(PIXEL_ID|AW-CONVERSION|AW_LABEL)/.test(v);

  /* ---------- Meta Pixel (base code) ---------- */
  if (configured(PIXEL_ID)) {
    const n = (window.fbq = window.fbq || function () {
      n.queue.push(arguments);
    });
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
    window.fbq("init", PIXEL_ID);
    window.fbq("track", "PageView");
  }

  /* ---------- Google tag (gtag.js) ---------- */
  if (configured(AW_ID)) {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${AW_ID}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", AW_ID);
  }

  /* ---------- API dla stron ---------- */
  window.okAnalytics = {
    /** Konwersja główna: wysłanie formularza kontaktowego. */
    lead() {
      if (configured(PIXEL_ID) && window.fbq) window.fbq("track", "Lead");
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
