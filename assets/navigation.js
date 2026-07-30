(() => {
  "use strict";

  const ROUTES = Object.freeze({
    offer: "/menu",
    process: "/proces",
    contact: "/kontakt",
  });

  const LABELS = Object.freeze({
    offer: "Oferta",
    process: "Jak pracujemy",
    contact: "Kontakt",
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

  const routeKeyForLink = (link) => {
    if (link.dataset.navLink && ROUTES[link.dataset.navLink]) {
      return link.dataset.navLink;
    }

    const path = new URL(link.getAttribute("href") || "/", location.href)
      .pathname
      .replace(/\.html$/i, "")
      .replace(/\/+$/, "") || "/";

    if (path === "/menu") return "offer";
    if (path === "/proces") return "process";
    if (path === "/kontakt") return "contact";
    return "";
  };

  const normalizeNavigation = (header) => {
    const navigation = header.querySelector(":scope > nav[aria-label]");
    if (!navigation) return null;

    const existingLinks = [...navigation.querySelectorAll(":scope > a")];
    const linksByKey = new Map();

    existingLinks.forEach((link) => {
      const key = routeKeyForLink(link);
      if (key && !linksByKey.has(key)) linksByKey.set(key, link);
    });

    const normalizedLinks = Object.keys(ROUTES).map((key) => {
      const link = linksByKey.get(key) || document.createElement("a");
      if (!link.getAttribute("href")) link.setAttribute("href", ROUTES[key]);
      link.dataset.navLink = key;
      link.textContent = LABELS[key];
      return link;
    });

    navigation.replaceChildren(...normalizedLinks);
    navigation.dataset.okPrimaryNav = "";

    const logo = header.querySelector(":scope > a:first-child img");
    if (logo?.getAttribute("src")?.includes("ok-agency-wordmark-cream.svg")) {
      logo.setAttribute(
        "src",
        logo.getAttribute("src").replace(
          "ok-agency-wordmark-cream.svg",
          "ok-agency-wordmark-navy.svg",
        ),
      );
    }

    const trigger = document.createElement("button");
    trigger.className = "ok-nav-trigger";
    trigger.type = "button";
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", "ok-global-menu");
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-label", "Otwórz menu główne");
    trigger.innerHTML = [
      '<span class="ok-nav-trigger__label">Menu</span>',
      '<span class="ok-nav-trigger__signal" aria-hidden="true"></span>',
    ].join("");

    header.append(trigger);
    header.dataset.okGlobalNav = "";

    return { header, navigation, trigger };
  };

  const headers = [
    ...document.querySelectorAll(
      "header.topbar, header.site-header, header.legal-header",
    ),
  ]
    .map(normalizeNavigation)
    .filter(Boolean);

  if (!headers.length) return;

  if (headers.length > 1) {
    headers.forEach(({ navigation }, index) => {
      navigation.setAttribute(
        "aria-label",
        `Główna nawigacja — sekcja ${index + 1} z ${headers.length}`,
      );
    });
  }

  const updateActiveState = (root = document) => {
    root.querySelectorAll("[data-nav-link]").forEach((link) => {
      const isActive = link.dataset.navLink === currentSection;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  updateActiveState();

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

  const dialog = document.createElement("dialog");
  dialog.className = "ok-global-menu";
  dialog.id = "ok-global-menu";
  dialog.setAttribute("aria-modal", "true");
  dialog.setAttribute("aria-labelledby", "ok-global-menu-title");
  dialog.innerHTML = `
    <div class="ok-global-menu__surface">
      <div class="ok-global-menu__rail">
        <a class="ok-global-menu__brand" href="/" aria-label="OK Agency — strona główna">
          <img src="/assets/ok-agency-wordmark-navy.svg" alt="OK Agency" width="417" height="103">
        </a>
        <button class="ok-global-menu__close" type="button" aria-label="Zamknij menu główne">
          <span>Zamknij</span>
          <span class="ok-global-menu__close-mark" aria-hidden="true"></span>
        </button>
      </div>
      <nav class="ok-global-menu__nav" aria-labelledby="ok-global-menu-title">
        <span id="ok-global-menu-title" class="visually-hidden">Menu główne</span>
        <a href="/menu" data-nav-link="offer">Oferta</a>
        <a href="/proces" data-nav-link="process">Jak pracujemy</a>
        <a href="/kontakt" data-nav-link="contact">Kontakt</a>
      </nav>
      <p class="ok-global-menu__meta">OK Agency · Ładnie to za mało</p>
    </div>
  `;
  document.body.append(dialog);
  updateActiveState(dialog);

  const closeButton = dialog.querySelector(".ok-global-menu__close");
  const compactQuery = window.matchMedia(
    "(max-width: 1180px), (max-aspect-ratio: 4/3)",
  );
  let activeTrigger = null;

  const syncDialogLinks = (navigation) => {
    Object.keys(ROUTES).forEach((key) => {
      const sourceLink = navigation.querySelector(`[data-nav-link="${key}"]`);
      const dialogLink = dialog.querySelector(`[data-nav-link="${key}"]`);
      if (sourceLink && dialogLink) {
        dialogLink.setAttribute("href", sourceLink.getAttribute("href"));
      }
    });
    updateActiveState(dialog);
  };

  const closeMenu = () => {
    if (!dialog.open) return;
    dialog.close();
  };

  const openMenu = ({ navigation, trigger }) => {
    if (dialog.open) return;

    activeTrigger = trigger;
    syncDialogLinks(navigation);
    trigger.setAttribute("aria-expanded", "true");
    document.body.classList.add("ok-nav-open");
    dialog.showModal();

    requestAnimationFrame(() => {
      dialog.querySelector(".ok-global-menu__nav a")?.focus();
    });
  };

  headers.forEach((entry) => {
    entry.trigger.addEventListener("click", () => openMenu(entry));
  });

  closeButton.addEventListener("click", closeMenu);

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeMenu();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeMenu();
  });

  dialog.querySelectorAll(".ok-global-menu__nav a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("ok-nav-open");
    headers.forEach(({ trigger }) => trigger.setAttribute("aria-expanded", "false"));

    const returnTarget = activeTrigger;
    activeTrigger = null;
    if (returnTarget?.isConnected && compactQuery.matches) {
      returnTarget.focus({ preventScroll: true });
    }
  });

  compactQuery.addEventListener("change", ({ matches }) => {
    if (!matches) closeMenu();
  });
})();
