(() => {
  "use strict";

  const ROUTES = Object.freeze({
    offer: "menu.html",
    process: "proces.html",
    contact: "kontakt.html",
  });

  const CONTEXTS = Object.freeze({
    web: {
      href: "strony-internetowe.html",
      returnLabel: "Wróć do stron internetowych",
      topic: "Strona internetowa",
    },
    social: {
      href: "social-media.html",
      returnLabel: "Wróć do social media",
      topic: "Social media",
    },
    campaign: {
      href: "kampanie.html",
      returnLabel: "Wróć do kampanii",
      topic: "Kampania płatna",
    },
    diagnosis: {
      href: "diagnoza.html",
      returnLabel: "Wróć do diagnozy",
      topic: "Diagnoza",
    },
    process: {
      href: "proces.html",
      returnLabel: "Wróć do procesu",
      topic: "Coś innego",
    },
  });

  const fileName = location.pathname.split("/").pop() || "index.html";
  const sectionByFile = Object.freeze({
    "menu.html": "offer",
    "strony-internetowe.html": "offer",
    "social-media.html": "offer",
    "kampanie.html": "offer",
    "diagnoza.html": "offer",
    "proces.html": "process",
    "kontakt.html": "contact",
  });
  const currentSection = sectionByFile[fileName] || "";

  document.querySelectorAll("[data-nav-link]").forEach(link => {
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
  const sourceKey = fileName === "proces.html" ? params.get("from") : params.get("context");
  const source = CONTEXTS[sourceKey];

  if (fileName === "proces.html") {
    const contactContext = source && sourceKey !== "process" ? sourceKey : "process";

    document.querySelectorAll('a[href^="kontakt.html"]').forEach(link => {
      const target = new URL(link.getAttribute("href"), location.href);
      target.searchParams.set("context", contactContext);
      target.searchParams.set("source", "process");
      link.setAttribute("href", `${target.pathname.split("/").pop()}${target.search}${target.hash}`);
    });

    if (source) {
      document.querySelectorAll("[data-context-return]").forEach(link => {
        link.href = source.href;
        link.textContent = source.returnLabel;
      });
    }
  }

  if (fileName === "kontakt.html") {
    const backLink = document.querySelector("[data-context-back]");
    if (backLink && source) {
      backLink.href = source.href;
      const label = backLink.querySelector("[data-context-back-label]");
      if (label) label.textContent = source.returnLabel;
    }

    const topic = document.getElementById("f-topic");
    if (topic && source?.topic && !topic.value) {
      const option = [...topic.options].find(item => item.value === source.topic);
      if (option) topic.value = source.topic;
    }
  }
})();
