(() => {
  "use strict";

  const ROUTES = Object.freeze({
    offer: "/menu",
    about: "/o-nas",
    process: "/proces",
    faq: "/faq",
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
    "diagnoza-www": "offer",
    "o-nas": "about",
    proces: "process",
    faq: "faq",
    kontakt: "contact",
  });
  const currentSection = sectionByRoute[routeName] || "";

  const headers = [...document.querySelectorAll("header[data-ok-global-nav]")];
  const header = headers[0];
  if (!header) return;

  if (headers.length > 1) {
    console.error(`OK Agency navigation: expected one global header, found ${headers.length}.`);
  }

  const navigation = header.querySelector("nav[data-ok-primary-nav]");
  const slot = document.querySelector(".ok-nav-slot");
  const sentinel = slot?.querySelector("[data-ok-nav-sentinel]");
  const offerDisclosure = navigation?.querySelector("[data-ok-offer]");

  const updateActiveState = (root = document) => {
    root.querySelectorAll("[data-nav-link]").forEach((item) => {
      const isActive = item.dataset.navLink === currentSection;
      item.classList.toggle("is-active", isActive);

      if (item.matches("a")) {
        if (isActive) item.setAttribute("aria-current", "page");
        else item.removeAttribute("aria-current");
      }
    });

    root.querySelectorAll("[data-offer-route]").forEach((link) => {
      const target = new URL(link.getAttribute("href") || "/", location.href)
        .pathname
        .replace(/\.html$/i, "")
        .replace(/\/+$/, "");
      const isCurrent = target === `/${routeName}`;
      if (isCurrent) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  };

  updateActiveState();

  const setDetached = (detached) => {
    header.dataset.okNavState = detached ? "detached" : "docked";
  };

  if ("IntersectionObserver" in window && sentinel) {
    const observer = new IntersectionObserver(
      ([entry]) => setDetached(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
  } else {
    const syncDetached = () => setDetached(window.scrollY > 24);
    syncDetached();
    addEventListener("scroll", syncDetached, { passive: true });
  }

  if (offerDisclosure) {
    document.addEventListener("pointerdown", (event) => {
      if (offerDisclosure.open && !offerDisclosure.contains(event.target)) {
        offerDisclosure.open = false;
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || !offerDisclosure.open) return;
      offerDisclosure.open = false;
      offerDisclosure.querySelector("summary")?.focus({ preventScroll: true });
    });
  }

  const params = new URLSearchParams(location.search);
  const sourceKey = routeName === "proces"
    ? params.get("from")
    : params.get("context");
  const source = CONTEXTS[sourceKey];

  if (routeName === "proces") {
    const contactContext = source && sourceKey !== "process"
      ? (sourceKey === "website" ? "web" : sourceKey)
      : "process";

    document.querySelectorAll('a[href*="/kontakt"]').forEach((link) => {
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

  if (!navigation) return;

  const trigger = document.createElement("button");
  trigger.className = "ok-nav-trigger";
  trigger.type = "button";
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", "ok-global-menu");
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.setAttribute("aria-label", "Otwórz menu główne");
  trigger.innerHTML = `
    <span class="ok-nav-trigger__label">Menu</span>
    <span class="ok-nav-trigger__signal" aria-hidden="true"></span>
  `;
  header.append(trigger);
  header.dataset.okNavReady = "";

  const linkHref = (key) => (
    navigation.querySelector(`[data-nav-link="${key}"]`)?.getAttribute("href")
    || ROUTES[key]
  );

  const offerLinks = [...navigation.querySelectorAll("[data-offer-route]")]
    .map((link) => link.outerHTML)
    .join("");

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
        <details class="ok-global-menu__offer" open>
          <summary data-nav-link="offer">Oferta</summary>
          <div class="ok-global-menu__offer-links">${offerLinks}</div>
        </details>
        <a href="${linkHref("about")}" data-nav-link="about">O nas</a>
        <a href="${linkHref("process")}" data-nav-link="process">Jak pracujemy</a>
        <a href="${linkHref("faq")}" data-nav-link="faq">FAQ</a>
        <a class="ok-global-menu__cta" href="${linkHref("contact")}" data-nav-link="contact">Porozmawiajmy</a>
      </nav>
      <p class="ok-global-menu__meta">OK Agency · Ładnie to za mało</p>
    </div>
  `;
  document.body.append(dialog);
  updateActiveState(dialog);

  const closeButton = dialog.querySelector(".ok-global-menu__close");
  const firstMenuTarget = dialog.querySelector(".ok-global-menu__offer > summary");
  const compactQuery = window.matchMedia(
    "(max-width: 1180px), (max-aspect-ratio: 4/3)",
  );
  const compactByLayoutViewport = () => (
    window.innerWidth <= 1180
    || window.innerWidth / window.innerHeight <= 4 / 3
  );

  const closeMenu = () => {
    if (dialog.open) dialog.close();
  };

  let compactFrame = 0;
  const syncCompactProfile = () => {
    compactFrame = 0;
    const compact = compactQuery.matches || compactByLayoutViewport();
    if (compact) {
      document.documentElement.setAttribute(
        "data-ok-nav-compact",
        window.innerWidth <= 1180 ? "narrow" : "tall",
      );
    } else {
      document.documentElement.removeAttribute("data-ok-nav-compact");
    }
    if (!compact) closeMenu();
  };
  const scheduleCompactProfile = () => {
    if (compactFrame) return;
    compactFrame = requestAnimationFrame(syncCompactProfile);
  };

  const openMenu = () => {
    if (dialog.open) return;
    offerDisclosure?.removeAttribute("open");
    trigger.setAttribute("aria-expanded", "true");
    document.body.classList.add("ok-nav-open");
    dialog.showModal();
    requestAnimationFrame(() => firstMenuTarget?.focus());
  };

  trigger.addEventListener("click", openMenu);
  closeButton.addEventListener("click", closeMenu);

  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeMenu();
  });

  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;

    const focusable = [...dialog.querySelectorAll(
      'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
    )].filter((item) => item.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeMenu();
  });

  dialog.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("ok-nav-open");
    trigger.setAttribute("aria-expanded", "false");
    if (trigger.isConnected && compactQuery.matches) {
      trigger.focus({ preventScroll: true });
    }
  });

  compactQuery.addEventListener("change", scheduleCompactProfile);
  window.addEventListener("resize", scheduleCompactProfile, { passive: true });
  window.visualViewport?.addEventListener("resize", scheduleCompactProfile, { passive: true });
  if ("ResizeObserver" in window) {
    new ResizeObserver(scheduleCompactProfile).observe(document.documentElement);
  }
  syncCompactProfile();
})();
