(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // miękkie wejście
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
  }));

  // Po wejściu strony hover nie dziedziczy już opóźnień animacji startowej.
  const settle = () => document.body.classList.add("is-settled");
  document.querySelector(".cards")?.addEventListener("pointerover", settle, { once: true });
  setTimeout(settle, 2100);

  // miękkie wyjście przy nawigacji
  if (!reduce) {
    let routing = false;
    document.addEventListener("click", e => {
      const a = e.target.closest("a[href$='.html']");
      if (!a || routing) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("http")) return;
      e.preventDefault();
      routing = true;
      document.body.classList.add("is-leaving");
      setTimeout(() => { location.href = href; }, 300);
    });
  }
})();
