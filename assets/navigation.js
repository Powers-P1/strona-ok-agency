(() => {
  "use strict";

  const ROUTES = Object.freeze({
    offer: "/menu",
    process: "/proces",
    contact: "/kontakt",
  });

  const CONTEXTS = Object.freeze({
    web: {
      href: "/strony-internetowe",
      returnLabel: "Wróć do stron internetowych",
      topic: "Strona internetowa",
    },
    website: {
      href: "/strony-internetowe",
      returnLabel: "Wróć do stron internetowych",
      topic: "Strona internetowa",
    },
    social: {
      href: "/social-media",
      returnLabel: "Wróć do social media",
      topic: "Social media",
    },
    campaign: {
      href: "/kampanie",
      returnLabel: "Wróć do kampanii",
      topic: "Kampania płatna",
    },
    diagnosis: {
      href: "/diagnoza",
      returnLabel: "Wróć do diagnozy",
      topic: "Diagnoza / uporządkowanie problemu",
    },
    process: {
      href: "/proces",
      returnLabel: "Wróć do procesu",
      topic: "Proces współpracy",
    },
    about: {
      href: "/o-nas",
      returnLabel: "Wróć do O nas",
      topic: "Inny temat",
    },
    conversation: {
      href: "/diagnoza",
      returnLabel: "Wróć do diagnozy",
      topic: "Diagnoza / uporządkowanie problemu",
    },
    none: {
      href: "/diagnoza",
      returnLabel: "Wróć do diagnozy",
      topic: "Inny temat",
    },
  });

  const routeName = (() => {
    const last = location.pathname.split("/").filter(Boolean).pop() || "index";
    return last.replace(/\.html$/i, "");
  })();

  const sectionByRoute = Object.freeze({
    menu: "offer",
    "strony-internetowe": "offer",
    "social-media": "offer",
    kampanie: "offer",
    diagnoza: "offer",
    proces: "process",
    kontakt: "contact",
  });
  const currentSection = sectionByRoute[routeName] || "";

  const repeatedMainNavigation = [
    ...document.querySelectorAll('main nav[aria-label="Główna nawigacja"]'),
  ];
  if (repeatedMainNavigation.length > 1) {
    repeatedMainNavigation.forEach((navigation, index) => {
      navigation.setAttribute(
        "aria-label",
        `Główna nawigacja — sekcja ${index + 1} z ${repeatedMainNavigation.length}`,
      );
    });
  }

  document.querySelectorAll("[data-nav-link]").forEach((link) => {
    const key = link.dataset.navLink;
    if (ROUTES[key] && !link.getAttribute("href")) link.href = ROUTES[key];

    link.classList.toggle("is-active", key === currentSection);
    if (key === currentSection) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const params = new URLSearchParams(location.search);
  const sourceKey = routeName === "proces" ? params.get("from") : params.get("context");
  const source = CONTEXTS[sourceKey];

  if (routeName === "proces") {
    const contactContext = source && sourceKey !== "process"
      ? (sourceKey === "website" ? "web" : sourceKey)
      : "process";

    document.querySelectorAll('a[href*="kontakt"]').forEach((link) => {
      const target = new URL(link.getAttribute("href"), location.href);
      if (!/\/kontakt(?:\.html)?$/i.test(target.pathname)) return;
      target.searchParams.set("context", contactContext);
      target.searchParams.set("source", "process");
      link.setAttribute("href", `/kontakt${target.search}${target.hash}`);
    });

    if (source) {
      document.querySelectorAll("[data-context-return]").forEach((link) => {
        link.href = source.href;
        link.textContent = source.returnLabel;
      });
    }
  }

  if (routeName === "kontakt") {
    const backLink = document.querySelector("[data-context-back]");
    if (backLink && source) {
      backLink.href = source.href;
      const label = backLink.querySelector("[data-context-back-label]");
      if (label) label.textContent = source.returnLabel;
    }

    const topic = document.getElementById("f-topic");
    if (topic && source?.topic && !topic.value) {
      const option = [...topic.options].find((item) => item.value === source.topic);
      if (option) topic.value = source.topic;
    }
  }
})();
