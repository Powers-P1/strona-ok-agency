(() => {
  const mounts = document.querySelectorAll("[data-site-footer]");
  if (!mounts.length) return;

  const currentPath = (location.pathname.split("/").filter(Boolean).pop() || "index")
    .replace(/\.html$/i, "");
  const directionLinks = [
    ["Strony internetowe", "/strony-internetowe"],
    ["Social media", "/social-media"],
    ["Kampanie płatne", "/kampanie"],
    ["Diagnoza", "/diagnoza"]
  ];
  const agencyLinks = [
    ["O nas", "/o-nas"],
    ["Proces", "/proces"],
    ["FAQ", "/faq"],
    ["Kontakt", "/kontakt"],
    ["Polityka prywatności", "/polityka-prywatnosci"],
    ["Dostępność", "/dostepnosc"]
  ];

  const linkMarkup = (label, href) => {
    const route = href.split("/").filter(Boolean).pop() || "index";
    const current = currentPath === route ? ' aria-current="page"' : "";
    return `<li><a href="${href}"${current}>${label}</a></li>`;
  };

  mounts.forEach(mount => {
    if (mount.querySelector(".site-footer")) return;

    const footer = document.createElement("footer");
    footer.className = "site-footer";
    footer.id = "site-footer";
    footer.innerHTML = `
      <div class="site-footer__top">
        <section class="site-footer__brand" aria-labelledby="site-footer-brand-title">
          <a class="site-footer__wordmark" href="/" aria-label="OK Agency — strona główna">
            <img src="/assets/ok-agency-wordmark-cream.svg" alt="OK Agency" width="417" height="103">
          </a>
          <h2 class="site-footer__description" id="site-footer-brand-title">
            Agencja marketingowa dla małych i średnich firm.
            <span>Pracujemy zdalnie — w całej Polsce.</span>
          </h2>
        </section>

        <a class="site-footer__diagnosis" href="/diagnoza"${currentPath === "diagnoza" ? ' aria-current="page"' : ""}>
          <strong>Zrób diagnozę — 4 pytania</strong>
          <small>Rekomendowany kierunek i pierwszy krok od razu na ekranie.</small>
          <span class="site-footer__diagnosis-icon" aria-hidden="true">↗</span>
        </a>
      </div>

      <div class="site-footer__signal" aria-hidden="true"></div>

      <div class="site-footer__lower">
        <nav aria-labelledby="site-footer-directions-title">
          <h2 class="site-footer__heading" id="site-footer-directions-title">Kierunki</h2>
          <ul class="site-footer__links">
            ${directionLinks.map(([label, href]) => linkMarkup(label, href)).join("")}
          </ul>
        </nav>

        <nav aria-labelledby="site-footer-agency-title">
          <h2 class="site-footer__heading" id="site-footer-agency-title">Agencja</h2>
          <ul class="site-footer__links">
            ${agencyLinks.map(([label, href]) => linkMarkup(label, href)).join("")}
          </ul>
        </nav>

        <address class="site-footer__contact">
          <h2 class="site-footer__heading">Kontakt</h2>
          <a class="site-footer__email" href="mailto:hello@okagency.pl">hello@okagency.pl</a>
          <p class="site-footer__work-mode">Zdalnie / cała Polska</p>
        </address>
      </div>

      <div class="site-footer__bottom">
        <p>© 2026 OK Agency</p>
        <a href="/polityka-prywatnosci"${currentPath === "polityka-prywatnosci" ? ' aria-current="page"' : ""}>Prywatność / jasne zasady</a>
      </div>`;

    mount.replaceChildren(footer);
  });
})();
