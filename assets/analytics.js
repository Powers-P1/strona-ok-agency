/* OK Agency — analityka kampanii (Meta Pixel + Google Ads gtag)
   WERSJA SZABLONU — przed wdrożeniem uzupełnić 2 identyfikatory:
     PIXEL_ID      → z Meta Events Manager (15-16 cyfr)
     AW-CONVERSION → z Google Ads, np. AW-123456789
     AW_LABEL_LEAD → etykieta konwersji "Wysłanie formularza", np. abcDEF123
     AW_LABEL_DIAG → etykieta konwersji "Ukończenie diagnozy"
   Plik docelowy: assets/analytics.js (kopiować 1:1 po uzupełnieniu ID)
*/
(() => {
  "use strict";

  const PIXEL_ID = "1057817209974571";    // ← META PIXEL ID
  const AW_ID = "AW-18361103115";         // ← GOOGLE ADS ID
  const AW_LABEL_LEAD = "O7kQCOLA1dkcEIvmoLNE"; // ← etykieta: wysłanie formularza
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
