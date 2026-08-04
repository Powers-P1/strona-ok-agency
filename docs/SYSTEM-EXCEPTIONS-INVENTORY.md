# Inwentarz wyjątków systemowych

Raport jest generowany przez `node scripts/audit-system-exceptions.mjs --write`. Obejmuje źródła produkcyjne, podaje dokładny plik i linię oraz rozróżnia użycie tokenu od lokalnej definicji systemu typografii.

## Podsumowanie

- `!important`: **217**
- deklaracje typografii w lokalnych arkuszach tras: **952**
- lokalne przejęcia selektorów wspólnych komponentów/geometrii scen: **283**
- inline `style` w HTML: **28**
- mutacje stylu z JS: **48**

### Największe źródła `!important`

| Plik | Liczba |
| --- | --- |
| assets/site-navigation.css | 60 |
| assets/story-standard.css | 40 |
| assets/annotation-system.css | 27 |
| assets/site-enhancements.css | 22 |
| assets/services/diagnosis/styles.css | 13 |
| assets/page-home.css | 12 |
| assets/scene-viewport.css | 6 |
| assets/page-contact.css | 5 |
| assets/services/about/styles.css | 5 |
| assets/site-footer.css | 4 |
| assets/legal-pages.css | 3 |
| assets/page-menu.css | 3 |
| assets/responsive-safety.css | 3 |
| assets/services/campaign/styles.css | 3 |
| assets/services/process/styles.css | 3 |
| assets/services/social/styles.css | 3 |
| assets/services/web/styles.css | 3 |
| assets/page-faq.css | 2 |

### Największe lokalne źródła typografii

| Plik | Liczba |
| --- | --- |
| assets/services/about/styles.css | 139 |
| assets/services/process/styles.css | 114 |
| assets/services/diagnosis/styles.css | 112 |
| assets/services/web/styles.css | 89 |
| assets/services/social/styles.css | 86 |
| assets/services/campaign/styles.css | 78 |
| assets/page-contact.css | 74 |
| assets/page-home.css | 72 |
| assets/legal-pages.css | 67 |
| assets/page-menu.css | 67 |
| assets/page-faq.css | 39 |
| assets/visual-direction-scenes.v20260730-2.css | 15 |

## Każde użycie `!important`

| Plik | Linia | Selektor | Kontekst | Klasyfikacja |
| --- | --- | --- | --- | --- |
| assets/annotation-system.css | 102 | .annotation-dot | — | shared-contract |
| assets/annotation-system.css | 103 | .annotation-dot | — | shared-contract |
| assets/annotation-system.css | 104 | .annotation-dot | — | shared-contract |
| assets/annotation-system.css | 105 | .annotation-dot | — | shared-contract |
| assets/annotation-system.css | 108 | .annotation-dot | — | shared-contract |
| assets/annotation-system.css | 110 | .annotation-dot | — | shared-contract |
| assets/annotation-system.css | 111 | .annotation-dot | — | shared-contract |
| assets/annotation-system.css | 116 | .annotation-dot | — | shared-contract |
| assets/annotation-system.css | 186 | .annotation-dot:focus-visible | — | shared-contract |
| assets/annotation-system.css | 187 | .annotation-dot:focus-visible | — | shared-contract |
| assets/annotation-system.css | 188 | .annotation-dot:focus-visible | — | shared-contract |
| assets/annotation-system.css | 201 | .annotation-copy | — | shared-contract |
| assets/annotation-system.css | 205 | .annotation-copy | — | shared-contract |
| assets/annotation-system.css | 208 | .annotation-copy | — | shared-contract |
| assets/annotation-system.css | 237 | .annotation-copy strong, .annotation-copy h3 | — | shared-contract |
| assets/annotation-system.css | 242 | .annotation-copy strong, .annotation-copy h3 | — | shared-contract |
| assets/annotation-system.css | 251 | .annotation-copy > span, .annotation-copy > p, .annotation-copy > small | — | shared-contract |
| assets/annotation-system.css | 252 | .annotation-copy > span, .annotation-copy > p, .annotation-copy > small | — | shared-contract |
| assets/annotation-system.css | 253 | .annotation-copy > span, .annotation-copy > p, .annotation-copy > small | — | shared-contract |
| assets/annotation-system.css | 254 | .annotation-copy > span, .annotation-copy > p, .annotation-copy > small | — | shared-contract |
| assets/annotation-system.css | 263 | .scene-dark .annotation-copy, .campaign-journey .annotation-copy, .social-rhythm .annotation-copy, .process-frame[data-stage-bg="#06192b"] .annotation-copy | — | shared-contract |
| assets/annotation-system.css | 266 | .scene-dark .annotation-copy, .campaign-journey .annotation-copy, .social-rhythm .annotation-copy, .process-frame[data-stage-bg="#06192b"] .annotation-copy | — | shared-contract |
| assets/annotation-system.css | 281 | .scene-dark .annotation-copy > span, .scene-dark .annotation-copy > p, .scene-dark .annotation-copy > small, .campaign-journey .annotation-copy > span, .campaign-journey .annotation-copy > p, .campaign-journey .annotation-copy > small, .social-rhythm .annotation-copy > span, .social-rhythm .annotation-copy > p, .social-rhythm .annotation-copy > small, .process-frame[data-stage-bg="#06192b"] .annotation-copy > span, .process-frame[data-stage-bg="#06192b"] .annotation-copy > p, .process-frame[data-stage-bg="#06192b"] .annotation-copy > small | — | shared-contract |
| assets/annotation-system.css | 342 | .annotation-dot::before | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/annotation-system.css | 343 | .annotation-dot::before | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/annotation-system.css | 344 | .annotation-dot::before | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/annotation-system.css | 348 | .annotation-dot::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/legal-pages.css | 699 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/legal-pages.css | 700 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/legal-pages.css | 701 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-contact.css | 678 | .js .panel > .page-title | — | route-debt |
| assets/page-contact.css | 678 | .js .panel > .page-title | — | route-debt |
| assets/page-contact.css | 790 | *, *::before, *::after | — | route-debt |
| assets/page-contact.css | 791 | *, *::before, *::after | — | route-debt |
| assets/page-contact.css | 792 | *, *::before, *::after | — | route-debt |
| assets/page-faq.css | 396 | .faq-page *, .faq-page *::before, .faq-page *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-faq.css | 397 | .faq-page *, .faq-page *::before, .faq-page *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 540 | html[data-motion="paused"] .copy > *, html[data-motion="paused"] .topbar | — | route-debt |
| assets/page-home.css | 541 | html[data-motion="paused"] .copy > *, html[data-motion="paused"] .topbar | — | route-debt |
| assets/page-home.css | 542 | html[data-motion="paused"] .copy > *, html[data-motion="paused"] .topbar | — | route-debt |
| assets/page-home.css | 749 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 750 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 751 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 752 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 756 | .stone-neural-canvas | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 760 | .copy > *, .topbar | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 761 | .copy > *, .topbar | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 762 | .copy > *, .topbar | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 1356 | .home-intro__cta, .home-intro__cta::before, .home-intro__cta::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-menu.css | 681 | *, *::before, *::after | — | route-debt |
| assets/page-menu.css | 682 | *, *::before, *::after | — | route-debt |
| assets/page-menu.css | 683 | *, *::before, *::after | — | route-debt |
| assets/responsive-safety.css | 208 | /* The focused home state hides the measured intro and owns its own panel. */ .home-page .hero.is-focused .art-stage | — | shared-contract |
| assets/responsive-safety.css | 209 | /* The focused home state hides the measured intro and owns its own panel. */ .home-page .hero.is-focused .art-stage | — | shared-contract |
| assets/responsive-safety.css | 333 | [data-ok-safe-art] | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/scene-viewport.css | 28 | :is( .campaign-frame, .social-frame, .process-frame, .about-page .scene ) | — | shared-contract |
| assets/scene-viewport.css | 29 | :is( .campaign-frame, .social-frame, .process-frame, .about-page .scene ) | — | shared-contract |
| assets/scene-viewport.css | 30 | :is( .campaign-frame, .social-frame, .process-frame, .about-page .scene ) | — | shared-contract |
| assets/scene-viewport.css | 40 | .diagnosis-story, .diagnosis-story .story-stage | — | shared-contract |
| assets/scene-viewport.css | 41 | .diagnosis-story, .diagnosis-story .story-stage | — | shared-contract |
| assets/scene-viewport.css | 42 | .diagnosis-story, .diagnosis-story .story-stage | — | shared-contract |
| assets/services/about/styles.css | 379 | .model-points li | — | route-debt |
| assets/services/about/styles.css | 1948 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/about/styles.css | 1949 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/about/styles.css | 1950 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/about/styles.css | 1951 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/campaign/styles.css | 993 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/campaign/styles.css | 994 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/campaign/styles.css | 995 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/diagnosis/styles.css | 26 | .sr-only | — | accessibility |
| assets/services/diagnosis/styles.css | 27 | .sr-only | — | accessibility |
| assets/services/diagnosis/styles.css | 28 | .sr-only | — | accessibility |
| assets/services/diagnosis/styles.css | 29 | .sr-only | — | accessibility |
| assets/services/diagnosis/styles.css | 30 | .sr-only | — | accessibility |
| assets/services/diagnosis/styles.css | 31 | .sr-only | — | accessibility |
| assets/services/diagnosis/styles.css | 32 | .sr-only | — | accessibility |
| assets/services/diagnosis/styles.css | 33 | .sr-only | — | accessibility |
| assets/services/diagnosis/styles.css | 711 | *,*::before,*::after | @media (prefers-reduced-motion:reduce) | accessibility |
| assets/services/diagnosis/styles.css | 712 | *,*::before,*::after | @media (prefers-reduced-motion:reduce) | accessibility |
| assets/services/diagnosis/styles.css | 713 | *,*::before,*::after | @media (prefers-reduced-motion:reduce) | accessibility |
| assets/services/diagnosis/styles.css | 714 | *,*::before,*::after | @media (prefers-reduced-motion:reduce) | accessibility |
| assets/services/diagnosis/styles.css | 716 | .diagnosis-frame,.quiz-question | @media (prefers-reduced-motion:reduce) | accessibility |
| assets/services/process/styles.css | 1274 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/process/styles.css | 1275 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/process/styles.css | 1276 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/social/styles.css | 1104 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/social/styles.css | 1105 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/social/styles.css | 1106 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/web/styles.css | 1239 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/web/styles.css | 1240 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/web/styles.css | 1241 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-enhancements.css | 28 | .visually-hidden | — | accessibility |
| assets/site-enhancements.css | 29 | .visually-hidden | — | accessibility |
| assets/site-enhancements.css | 30 | .visually-hidden | — | accessibility |
| assets/site-enhancements.css | 31 | .visually-hidden | — | accessibility |
| assets/site-enhancements.css | 32 | .visually-hidden | — | accessibility |
| assets/site-enhancements.css | 33 | .visually-hidden | — | accessibility |
| assets/site-enhancements.css | 34 | .visually-hidden | — | accessibility |
| assets/site-enhancements.css | 35 | .visually-hidden | — | accessibility |
| assets/site-enhancements.css | 36 | .visually-hidden | — | accessibility |
| assets/site-enhancements.css | 116 | html[data-motion="paused"] | — | shared-contract |
| assets/site-enhancements.css | 122 | html[data-motion="paused"] *, html[data-motion="paused"] *::before, html[data-motion="paused"] *::after | — | shared-contract |
| assets/site-enhancements.css | 123 | html[data-motion="paused"] *, html[data-motion="paused"] *::before, html[data-motion="paused"] *::after | — | shared-contract |
| assets/site-enhancements.css | 124 | html[data-motion="paused"] *, html[data-motion="paused"] *::before, html[data-motion="paused"] *::after | — | shared-contract |
| assets/site-enhancements.css | 125 | html[data-motion="paused"] *, html[data-motion="paused"] *::before, html[data-motion="paused"] *::after | — | shared-contract |
| assets/site-enhancements.css | 126 | html[data-motion="paused"] *, html[data-motion="paused"] *::before, html[data-motion="paused"] *::after | — | shared-contract |
| assets/site-enhancements.css | 127 | html[data-motion="paused"] *, html[data-motion="paused"] *::before, html[data-motion="paused"] *::after | — | shared-contract |
| assets/site-enhancements.css | 371 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-enhancements.css | 372 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-enhancements.css | 373 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-enhancements.css | 374 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-enhancements.css | 375 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-enhancements.css | 376 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-footer.css | 463 | .site-footer *, .site-footer *::before, .site-footer *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-footer.css | 464 | .site-footer *, .site-footer *::before, .site-footer *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-footer.css | 465 | .site-footer *, .site-footer *::before, .site-footer *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-footer.css | 466 | .site-footer *, .site-footer *::before, .site-footer *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-navigation.css | 60 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 61 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 62 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 63 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 64 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 65 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 66 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 67 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 68 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 72 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 74 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 75 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 76 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 78 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 79 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 80 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 81 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 82 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 83 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 89 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 90 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 92 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 96 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 97 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 98 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 113 | body header[data-ok-global-nav]::after | — | shared-contract |
| assets/site-navigation.css | 117 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | — | shared-contract |
| assets/site-navigation.css | 118 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | — | shared-contract |
| assets/site-navigation.css | 119 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | — | shared-contract |
| assets/site-navigation.css | 120 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | — | shared-contract |
| assets/site-navigation.css | 121 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | — | shared-contract |
| assets/site-navigation.css | 122 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | — | shared-contract |
| assets/site-navigation.css | 130 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | — | shared-contract |
| assets/site-navigation.css | 152 | body header[data-ok-global-nav] > a:first-child > img | — | shared-contract |
| assets/site-navigation.css | 153 | body header[data-ok-global-nav] > a:first-child > img | — | shared-contract |
| assets/site-navigation.css | 155 | body header[data-ok-global-nav] > a:first-child > img | — | shared-contract |
| assets/site-navigation.css | 160 | body header[data-ok-global-nav][data-ok-nav-state="detached"] > a:first-child > img | — | shared-contract |
| assets/site-navigation.css | 191 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > a, .ok-nav-offer > summary | — | shared-contract |
| assets/site-navigation.css | 198 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > a, .ok-nav-offer > summary | — | shared-contract |
| assets/site-navigation.css | 271 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > a:not(.ok-nav-cta):hover, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a:not(.ok-nav-cta):focus-visible, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a.is-active, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a[aria-current="page"], .ok-nav-offer > summary:hover, .ok-nav-offer > summary:focus-visible, .ok-nav-offer > summary.is-active, .ok-nav-offer[open] > summary | — | shared-contract |
| assets/site-navigation.css | 286 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta | — | shared-contract |
| assets/site-navigation.css | 287 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta | — | shared-contract |
| assets/site-navigation.css | 288 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta | — | shared-contract |
| assets/site-navigation.css | 295 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta | — | shared-contract |
| assets/site-navigation.css | 302 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta:hover, body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta:focus-visible, body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta.is-active, body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta[aria-current="page"] | — | shared-contract |
| assets/site-navigation.css | 703 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | @media (max-width: 1180px), (max-aspect-ratio: 4 / 3) | shared-contract |
| assets/site-navigation.css | 704 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | @media (max-width: 1180px), (max-aspect-ratio: 4 / 3) | shared-contract |
| assets/site-navigation.css | 705 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | @media (max-width: 1180px), (max-aspect-ratio: 4 / 3) | shared-contract |
| assets/site-navigation.css | 706 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | @media (max-width: 1180px), (max-aspect-ratio: 4 / 3) | shared-contract |
| assets/site-navigation.css | 801 | body header[data-ok-global-nav], body header[data-ok-global-nav] > a:first-child > img, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a::after, .ok-nav-offer > summary::after, .ok-nav-offer__mark, .ok-nav-trigger__signal::before, .ok-nav-trigger__signal::after, .ok-global-menu__surface, .ok-global-menu__nav a::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-navigation.css | 802 | body header[data-ok-global-nav], body header[data-ok-global-nav] > a:first-child > img, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a::after, .ok-nav-offer > summary::after, .ok-nav-offer__mark, .ok-nav-trigger__signal::before, .ok-nav-trigger__signal::after, .ok-global-menu__surface, .ok-global-menu__nav a::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-navigation.css | 811 | body header[data-ok-global-nav], body header[data-ok-global-nav][data-ok-nav-state="detached"], .ok-nav-offer__popover, .ok-global-menu__surface | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 812 | body header[data-ok-global-nav], body header[data-ok-global-nav][data-ok-nav-state="detached"], .ok-nav-offer__popover, .ok-global-menu__surface | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 813 | body header[data-ok-global-nav], body header[data-ok-global-nav][data-ok-nav-state="detached"], .ok-nav-offer__popover, .ok-global-menu__surface | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 814 | body header[data-ok-global-nav], body header[data-ok-global-nav][data-ok-nav-state="detached"], .ok-nav-offer__popover, .ok-global-menu__surface | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 823 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > a, .ok-nav-offer > summary, .ok-nav-trigger, .ok-global-menu__close, .ok-global-menu__nav a | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 829 | .ok-nav-cta, .ok-global-menu__nav > .ok-global-menu__cta | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 846 | .ok-nav-trigger, .ok-global-menu, .ok-nav-slot | @media print | shared-contract |
| assets/site-navigation.css | 850 | body header[data-ok-global-nav] | @media print | shared-contract |
| assets/site-navigation.css | 854 | body header[data-ok-global-nav] nav[data-ok-primary-nav] | @media print | shared-contract |
| assets/story-standard.css | 12 | html | — | shared-contract |
| assets/story-standard.css | 13 | html | — | shared-contract |
| assets/story-standard.css | 17 | html::-webkit-scrollbar | — | shared-contract |
| assets/story-standard.css | 23 | .campaign-story, .social-story, .about-page .story | — | shared-contract |
| assets/story-standard.css | 24 | .campaign-story, .social-story, .about-page .story | — | shared-contract |
| assets/story-standard.css | 25 | .campaign-story, .social-story, .about-page .story | — | shared-contract |
| assets/story-standard.css | 29 | .story-stage | — | shared-contract |
| assets/story-standard.css | 30 | .story-stage | — | shared-contract |
| assets/story-standard.css | 31 | .story-stage | — | shared-contract |
| assets/story-standard.css | 32 | .story-stage | — | shared-contract |
| assets/story-standard.css | 33 | .story-stage | — | shared-contract |
| assets/story-standard.css | 34 | .story-stage | — | shared-contract |
| assets/story-standard.css | 41 | .campaign-frame, .social-frame, .process-frame, .about-page .scene | — | shared-contract |
| assets/story-standard.css | 42 | .campaign-frame, .social-frame, .process-frame, .about-page .scene | — | shared-contract |
| assets/story-standard.css | 43 | .campaign-frame, .social-frame, .process-frame, .about-page .scene | — | shared-contract |
| assets/story-standard.css | 44 | .campaign-frame, .social-frame, .process-frame, .about-page .scene | — | shared-contract |
| assets/story-standard.css | 45 | .campaign-frame, .social-frame, .process-frame, .about-page .scene | — | shared-contract |
| assets/story-standard.css | 46 | .campaign-frame, .social-frame, .process-frame, .about-page .scene | — | shared-contract |
| assets/story-standard.css | 47 | .campaign-frame, .social-frame, .process-frame, .about-page .scene | — | shared-contract |
| assets/story-standard.css | 48 | .campaign-frame, .social-frame, .process-frame, .about-page .scene | — | shared-contract |
| assets/story-standard.css | 49 | .campaign-frame, .social-frame, .process-frame, .about-page .scene | — | shared-contract |
| assets/story-standard.css | 50 | .campaign-frame, .social-frame, .process-frame, .about-page .scene | — | shared-contract |
| assets/story-standard.css | 51 | .campaign-frame, .social-frame, .process-frame, .about-page .scene | — | shared-contract |
| assets/story-standard.css | 52 | .campaign-frame, .social-frame, .process-frame, .about-page .scene | — | shared-contract |
| assets/story-standard.css | 53 | .campaign-frame, .social-frame, .process-frame, .about-page .scene | — | shared-contract |
| assets/story-standard.css | 54 | .campaign-frame, .social-frame, .process-frame, .about-page .scene | — | shared-contract |
| assets/story-standard.css | 55 | .campaign-frame, .social-frame, .process-frame, .about-page .scene | — | shared-contract |
| assets/story-standard.css | 73 | .campaign-art | — | shared-contract |
| assets/story-standard.css | 74 | .campaign-art | — | shared-contract |
| assets/story-standard.css | 75 | .campaign-art | — | shared-contract |
| assets/story-standard.css | 76 | .campaign-art | — | shared-contract |
| assets/story-standard.css | 80 | .about-page .scene-art | — | shared-contract |
| assets/story-standard.css | 81 | .about-page .scene-art | — | shared-contract |
| assets/story-standard.css | 82 | .about-page .scene-art | — | shared-contract |
| assets/story-standard.css | 83 | .about-page .scene-art | — | shared-contract |
| assets/story-standard.css | 84 | .about-page .scene-art | — | shared-contract |
| assets/story-standard.css | 89 | .scroll-cue span, .scroll-icon | — | shared-contract |
| assets/story-standard.css | 98 | .proof-detail, .accordion-detail | — | shared-contract |
| assets/story-standard.css | 131 | .campaign-frame, .social-frame, .process-frame, .about-page .scene, .about-page .scene-art, .campaign-art, .proof-bloom | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/story-standard.css | 132 | .campaign-frame, .social-frame, .process-frame, .about-page .scene, .about-page .scene-art, .campaign-art, .proof-bloom | @media (prefers-reduced-motion: reduce) | accessibility |

## Każda lokalna deklaracja typografii

| Plik | Linia | Selektor | Właściwość | Wartość | Kontekst | Klasyfikacja |
| --- | --- | --- | --- | --- | --- | --- |
| assets/legal-pages.css | 30 | body | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/legal-pages.css | 70 | .legal-skip | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/legal-pages.css | 71 | .legal-skip | font-weight | 650 | — | local-type-exception |
| assets/legal-pages.css | 84 | .legal-eyebrow | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/legal-pages.css | 85 | .legal-eyebrow | font-weight | 650 | — | local-type-exception |
| assets/legal-pages.css | 86 | .legal-eyebrow | letter-spacing | .18em | — | local-type-exception |
| assets/legal-pages.css | 87 | .legal-eyebrow | line-height | 1.3 | — | local-type-exception |
| assets/legal-pages.css | 125 | .legal-header nav a | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/legal-pages.css | 126 | .legal-header nav a | font-weight | 650 | — | local-type-exception |
| assets/legal-pages.css | 127 | .legal-header nav a | letter-spacing | .13em | — | local-type-exception |
| assets/legal-pages.css | 170 | .privacy-title | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/legal-pages.css | 171 | .privacy-title | font-size | clamp(76px, 6.2vw, 104px) | — | local-type-exception |
| assets/legal-pages.css | 172 | .privacy-title | font-weight | 500 | — | local-type-exception |
| assets/legal-pages.css | 173 | .privacy-title | letter-spacing | -.045em | — | local-type-exception |
| assets/legal-pages.css | 180 | .privacy-lead | font-size | var(--ok-type-content, 15px) | — | semantic-token |
| assets/legal-pages.css | 181 | .privacy-lead | line-height | 1.65 | — | local-type-exception |
| assets/legal-pages.css | 209 | .privacy-status__label | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/legal-pages.css | 210 | .privacy-status__label | font-weight | 700 | — | local-type-exception |
| assets/legal-pages.css | 211 | .privacy-status__label | letter-spacing | .17em | — | local-type-exception |
| assets/legal-pages.css | 221 | .privacy-status h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/legal-pages.css | 222 | .privacy-status h2 | font-size | max(30px, var(--ok-type-display-card, 30px)) | — | semantic-token |
| assets/legal-pages.css | 223 | .privacy-status h2 | font-weight | 500 | — | local-type-exception |
| assets/legal-pages.css | 224 | .privacy-status h2 | letter-spacing | -.01em | — | local-type-exception |
| assets/legal-pages.css | 225 | .privacy-status h2 | line-height | 1 | — | local-type-exception |
| assets/legal-pages.css | 231 | .privacy-status p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/legal-pages.css | 232 | .privacy-status p | line-height | 1.62 | — | local-type-exception |
| assets/legal-pages.css | 252 | .privacy-toc h2 | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/legal-pages.css | 253 | .privacy-toc h2 | font-weight | 700 | — | local-type-exception |
| assets/legal-pages.css | 254 | .privacy-toc h2 | letter-spacing | .18em | — | local-type-exception |
| assets/legal-pages.css | 271 | .privacy-toc a | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/legal-pages.css | 272 | .privacy-toc a | font-size | var(--ok-type-control, 16px) | — | semantic-token |
| assets/legal-pages.css | 299 | .policy-section h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/legal-pages.css | 300 | .policy-section h2 | font-size | max(28px, var(--ok-type-display-card, 28px)) | — | semantic-token |
| assets/legal-pages.css | 301 | .policy-section h2 | font-weight | 500 | — | local-type-exception |
| assets/legal-pages.css | 302 | .policy-section h2 | letter-spacing | -.01em | — | local-type-exception |
| assets/legal-pages.css | 308 | .policy-section h2 span | font-size | var(--ok-type-icon, 18px) | — | semantic-token |
| assets/legal-pages.css | 314 | .policy-section p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/legal-pages.css | 315 | .policy-section p | line-height | 1.6 | — | local-type-exception |
| assets/legal-pages.css | 334 | .fill-row strong | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/legal-pages.css | 335 | .fill-row strong | letter-spacing | .06em | — | local-type-exception |
| assets/legal-pages.css | 407 | .error-title | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/legal-pages.css | 408 | .error-title | font-size | clamp(78px, 7vw, 116px) | — | local-type-exception |
| assets/legal-pages.css | 409 | .error-title | font-weight | 500 | — | local-type-exception |
| assets/legal-pages.css | 410 | .error-title | letter-spacing | -.045em | — | local-type-exception |
| assets/legal-pages.css | 421 | .error-lead | font-size | 15px | — | local-type-exception |
| assets/legal-pages.css | 422 | .error-lead | line-height | 1.65 | — | local-type-exception |
| assets/legal-pages.css | 439 | .error-actions a | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/legal-pages.css | 440 | .error-actions a | font-weight | 650 | — | local-type-exception |
| assets/legal-pages.css | 441 | .error-actions a | letter-spacing | .08em | — | local-type-exception |
| assets/legal-pages.css | 483 | .error-number | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/legal-pages.css | 484 | .error-number | font-size | min(34vw, 520px) | — | local-type-exception |
| assets/legal-pages.css | 485 | .error-number | font-weight | 600 | — | local-type-exception |
| assets/legal-pages.css | 486 | .error-number | letter-spacing | -.08em | — | local-type-exception |
| assets/legal-pages.css | 487 | .error-number | line-height | .72 | — | local-type-exception |
| assets/legal-pages.css | 500 | .error-meta | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/legal-pages.css | 501 | .error-meta | font-weight | 650 | — | local-type-exception |
| assets/legal-pages.css | 502 | .error-meta | letter-spacing | .18em | — | local-type-exception |
| assets/legal-pages.css | 517 | .legal-header nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 1140px) | semantic-token |
| assets/legal-pages.css | 564 | .privacy-title | font-size | clamp(58px, 17vw, 72px) | @media (max-width: 640px) | local-type-exception |
| assets/legal-pages.css | 568 | .privacy-lead | font-size | 14px | @media (max-width: 640px) | local-type-exception |
| assets/legal-pages.css | 569 | .privacy-lead | line-height | 1.58 | @media (max-width: 640px) | local-type-exception |
| assets/legal-pages.css | 584 | .privacy-status h2 | font-size | 27px | @media (max-width: 640px) | local-type-exception |
| assets/legal-pages.css | 608 | .policy-section h2 | font-size | 25px | @media (max-width: 640px) | local-type-exception |
| assets/legal-pages.css | 609 | .policy-section h2 | line-height | 1.05 | @media (max-width: 640px) | local-type-exception |
| assets/legal-pages.css | 654 | .error-title | font-size | clamp(64px, 20vw, 82px) | @media (max-width: 640px) | local-type-exception |
| assets/legal-pages.css | 658 | .error-lead | font-size | 14px | @media (max-width: 640px) | local-type-exception |
| assets/legal-pages.css | 677 | .error-number | font-size | min(63vw, 260px) | @media (max-width: 640px) | local-type-exception |
| assets/page-contact.css | 25 | body | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/page-contact.css | 69 | .skip | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-contact.css | 102 | .site-nav a | font-size | 12px | — | local-type-exception |
| assets/page-contact.css | 103 | .site-nav a | font-weight | 600 | — | local-type-exception |
| assets/page-contact.css | 104 | .site-nav a | letter-spacing | .16em | — | local-type-exception |
| assets/page-contact.css | 147 | .back-link | font-size | 15px | — | local-type-exception |
| assets/page-contact.css | 148 | .back-link | font-weight | 500 | — | local-type-exception |
| assets/page-contact.css | 161 | .kicker | font-size | 12px | — | local-type-exception |
| assets/page-contact.css | 162 | .kicker | font-weight | 600 | — | local-type-exception |
| assets/page-contact.css | 163 | .kicker | letter-spacing | .18em | — | local-type-exception |
| assets/page-contact.css | 175 | .page-title | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-contact.css | 176 | .page-title | font-size | clamp(38px, 3.3vw, 58px) | — | local-type-exception |
| assets/page-contact.css | 177 | .page-title | font-weight | 600 | — | local-type-exception |
| assets/page-contact.css | 178 | .page-title | line-height | .98 | — | local-type-exception |
| assets/page-contact.css | 179 | .page-title | letter-spacing | -.01em | — | local-type-exception |
| assets/page-contact.css | 188 | .lead | font-size | clamp(14.5px, .95vw, 15.5px) | — | local-type-exception |
| assets/page-contact.css | 189 | .lead | line-height | 1.55 | — | local-type-exception |
| assets/page-contact.css | 205 | .proof li | font-size | 14px | — | local-type-exception |
| assets/page-contact.css | 206 | .proof li | line-height | 1.4 | — | local-type-exception |
| assets/page-contact.css | 240 | .field label | font-size | 15px | — | local-type-exception |
| assets/page-contact.css | 241 | .field label | font-weight | 500 | — | local-type-exception |
| assets/page-contact.css | 256 | .field input, .field select, .field textarea | font | inherit | — | local-type-exception |
| assets/page-contact.css | 257 | .field input, .field select, .field textarea | font-size | 16px | — | local-type-exception |
| assets/page-contact.css | 272 | .field textarea | line-height | 1.5 | — | local-type-exception |
| assets/page-contact.css | 286 | .field .error | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-contact.css | 314 | /* zgoda */ .consent | font-size | 14px | — | local-type-exception |
| assets/page-contact.css | 315 | /* zgoda */ .consent | line-height | 1.5 | — | local-type-exception |
| assets/page-contact.css | 387 | .submit | font-size | 17px | — | local-type-exception |
| assets/page-contact.css | 388 | .submit | font-weight | 600 | — | local-type-exception |
| assets/page-contact.css | 389 | .submit | letter-spacing | .02em | — | local-type-exception |
| assets/page-contact.css | 405 | .submit .arr | font-size | 19px | — | local-type-exception |
| assets/page-contact.css | 412 | .form-status | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-contact.css | 413 | .form-status | line-height | 1.5 | — | local-type-exception |
| assets/page-contact.css | 440 | .direct-mail p, .context-note p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-contact.css | 441 | .direct-mail p, .context-note p | line-height | 1.45 | — | local-type-exception |
| assets/page-contact.css | 448 | .direct-mail a | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-contact.css | 449 | .direct-mail a | font-size | 23px | — | local-type-exception |
| assets/page-contact.css | 450 | .direct-mail a | font-weight | 600 | — | local-type-exception |
| assets/page-contact.css | 457 | .direct-mail small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-contact.css | 458 | .direct-mail small | line-height | 1.4 | — | local-type-exception |
| assets/page-contact.css | 468 | .context-note strong | font-size | 13px | — | local-type-exception |
| assets/page-contact.css | 494 | .form--contact .submit | font-size | 16px | — | local-type-exception |
| assets/page-contact.css | 500 | .mailto-helper | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-contact.css | 501 | .mailto-helper | line-height | 1.45 | — | local-type-exception |
| assets/page-contact.css | 514 | .validation-summary | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-contact.css | 515 | .validation-summary | font-weight | 600 | — | local-type-exception |
| assets/page-contact.css | 529 | .validation-summary::before, .field.is-invalid .error::before, .consent-error::before | font-size | 9px | — | local-type-exception |
| assets/page-contact.css | 530 | .validation-summary::before, .field.is-invalid .error::before, .consent-error::before | line-height | 1 | — | local-type-exception |
| assets/page-contact.css | 537 | .field.is-invalid .error | line-height | 1.35 | — | local-type-exception |
| assets/page-contact.css | 553 | .consent-error | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-contact.css | 554 | .consent-error | font-weight | 500 | — | local-type-exception |
| assets/page-contact.css | 569 | .flow-state h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-contact.css | 570 | .flow-state h2 | font-size | clamp(34px, 2.7vw, 46px) | — | local-type-exception |
| assets/page-contact.css | 571 | .flow-state h2 | font-weight | 600 | — | local-type-exception |
| assets/page-contact.css | 572 | .flow-state h2 | line-height | 1 | — | local-type-exception |
| assets/page-contact.css | 582 | .flow-state > p | font-size | 14px | — | local-type-exception |
| assets/page-contact.css | 583 | .flow-state > p | line-height | 1.55 | — | local-type-exception |
| assets/page-contact.css | 591 | .state-email | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-contact.css | 592 | .state-email | font-size | 27px | — | local-type-exception |
| assets/page-contact.css | 593 | .state-email | font-weight | 600 | — | local-type-exception |
| assets/page-contact.css | 612 | .state-link | font | inherit | — | local-type-exception |
| assets/page-contact.css | 613 | .state-link | font-size | 13px | — | local-type-exception |
| assets/page-contact.css | 614 | .state-link | font-weight | 500 | — | local-type-exception |
| assets/page-contact.css | 627 | .copy-address | font-weight | 600 | — | local-type-exception |
| assets/page-contact.css | 633 | .copy-feedback | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-contact.css | 634 | .copy-feedback | font-weight | 500 | — | local-type-exception |
| assets/page-contact.css | 728 | .site-nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 640px) | semantic-token |
| assets/page-contact.css | 728 | .site-nav a | letter-spacing | .12em | @media (max-width: 640px) | local-type-exception |
| assets/page-contact.css | 741 | .direct-mail a | font-size | 25px | @media (max-width: 640px) | local-type-exception |
| assets/page-contact.css | 748 | .form--contact .field input, .form--contact .field select, .form--contact .field textarea | font-size | 16px | @media (max-width: 640px) | local-type-exception |
| assets/page-contact.css | 753 | .mailto-helper | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 640px) | semantic-token |
| assets/page-contact.css | 754 | .flow-state h2 | font-size | 39px | @media (max-width: 640px) | local-type-exception |
| assets/page-contact.css | 755 | .flow-state > p | font-size | 15px | @media (max-width: 640px) | local-type-exception |
| assets/page-contact.css | 756 | .state-email | font-size | 26px | @media (max-width: 640px) | local-type-exception |
| assets/page-faq.css | 31 | body.faq-page | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/page-faq.css | 55 | .faq-skip | font-size | 13px | — | local-type-exception |
| assets/page-faq.css | 86 | .faq-kicker, .faq-list__label | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/page-faq.css | 87 | .faq-kicker, .faq-list__label | font-weight | 720 | — | local-type-exception |
| assets/page-faq.css | 88 | .faq-kicker, .faq-list__label | letter-spacing | .18em | — | local-type-exception |
| assets/page-faq.css | 89 | .faq-kicker, .faq-list__label | line-height | 1.4 | — | local-type-exception |
| assets/page-faq.css | 95 | .faq-intro h1 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-faq.css | 96 | .faq-intro h1 | font-size | clamp(58px, 6.3vw, 108px) | — | local-type-exception |
| assets/page-faq.css | 97 | .faq-intro h1 | font-weight | 430 | — | local-type-exception |
| assets/page-faq.css | 98 | .faq-intro h1 | letter-spacing | -.045em | — | local-type-exception |
| assets/page-faq.css | 99 | .faq-intro h1 | line-height | .82 | — | local-type-exception |
| assets/page-faq.css | 104 | .faq-intro h1 em | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-faq.css | 106 | .faq-intro h1 em | font-weight | 500 | — | local-type-exception |
| assets/page-faq.css | 113 | .faq-lead | font-size | clamp(16px, 1.15vw, 19px) | — | local-type-exception |
| assets/page-faq.css | 114 | .faq-lead | line-height | 1.65 | — | local-type-exception |
| assets/page-faq.css | 125 | .faq-intro__link | font-size | 13px | — | local-type-exception |
| assets/page-faq.css | 126 | .faq-intro__link | font-weight | 680 | — | local-type-exception |
| assets/page-faq.css | 166 | .faq-list summary | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-faq.css | 167 | .faq-list summary | font-size | clamp(25px, 2.15vw, 38px) | — | local-type-exception |
| assets/page-faq.css | 168 | .faq-list summary | font-weight | 480 | — | local-type-exception |
| assets/page-faq.css | 169 | .faq-list summary | line-height | 1.05 | — | local-type-exception |
| assets/page-faq.css | 182 | .faq-number | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/page-faq.css | 183 | .faq-number | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/page-faq.css | 184 | .faq-number | font-weight | 720 | — | local-type-exception |
| assets/page-faq.css | 185 | .faq-number | letter-spacing | .16em | — | local-type-exception |
| assets/page-faq.css | 243 | .faq-answer p | font-size | clamp(15px, 1.05vw, 18px) | — | local-type-exception |
| assets/page-faq.css | 244 | .faq-answer p | line-height | 1.7 | — | local-type-exception |
| assets/page-faq.css | 259 | .faq-cta p | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-faq.css | 260 | .faq-cta p | font-size | clamp(28px, 3vw, 46px) | — | local-type-exception |
| assets/page-faq.css | 261 | .faq-cta p | line-height | .98 | — | local-type-exception |
| assets/page-faq.css | 267 | .faq-cta p span | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-faq.css | 279 | .faq-cta a | font-size | 12px | — | local-type-exception |
| assets/page-faq.css | 280 | .faq-cta a | font-weight | 720 | — | local-type-exception |
| assets/page-faq.css | 281 | .faq-cta a | letter-spacing | .12em | — | local-type-exception |
| assets/page-faq.css | 310 | .faq-intro h1 | font-size | clamp(64px, 11vw, 104px) | @media (max-width: 980px) | local-type-exception |
| assets/page-faq.css | 353 | .faq-intro h1 | font-size | clamp(54px, 17vw, 76px) | @media (max-width: 600px) | local-type-exception |
| assets/page-faq.css | 358 | .faq-lead | font-size | 15px | @media (max-width: 600px) | local-type-exception |
| assets/page-faq.css | 366 | .faq-list summary | font-size | 25px | @media (max-width: 600px) | local-type-exception |
| assets/page-faq.css | 374 | .faq-answer p | font-size | 15px | @media (max-width: 600px) | local-type-exception |
| assets/page-home.css | 24 | body | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/page-home.css | 29 | button, a | font | inherit | — | local-type-exception |
| assets/page-home.css | 136 | .nav a | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/page-home.css | 137 | .nav a | font-weight | 600 | — | local-type-exception |
| assets/page-home.css | 138 | .nav a | letter-spacing | .17em | — | local-type-exception |
| assets/page-home.css | 180 | .scene-label, .detail-kicker | letter-spacing | .2em | — | local-type-exception |
| assets/page-home.css | 181 | .scene-label, .detail-kicker | font-weight | 600 | — | local-type-exception |
| assets/page-home.css | 185 | .detail-kicker | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/page-home.css | 205 | h1 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-home.css | 206 | h1 | font-weight | 500 | — | local-type-exception |
| assets/page-home.css | 208 | h1 | line-height | .775 | — | local-type-exception |
| assets/page-home.css | 209 | h1 | letter-spacing | -.062em | — | local-type-exception |
| assets/page-home.css | 222 | .descriptor | letter-spacing | .07em | — | local-type-exception |
| assets/page-home.css | 223 | .descriptor | line-height | 1.6 | — | local-type-exception |
| assets/page-home.css | 230 | .value-lead | font-size | clamp(.95rem, 1.05vw, 1.12rem) | — | local-type-exception |
| assets/page-home.css | 231 | .value-lead | line-height | 1.55 | — | local-type-exception |
| assets/page-home.css | 244 | .cta | font-weight | 600 | — | local-type-exception |
| assets/page-home.css | 245 | .cta | letter-spacing | .035em | — | local-type-exception |
| assets/page-home.css | 267 | .cta::after | font-size | 1.1rem | — | local-type-exception |
| assets/page-home.css | 443 | .detail h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-home.css | 444 | .detail h2 | font-size | clamp(3.7rem, 6vw, 6.8rem) | — | local-type-exception |
| assets/page-home.css | 445 | .detail h2 | line-height | .85 | — | local-type-exception |
| assets/page-home.css | 446 | .detail h2 | letter-spacing | -.045em | — | local-type-exception |
| assets/page-home.css | 447 | .detail h2 | font-weight | 500 | — | local-type-exception |
| assets/page-home.css | 454 | .detail p | line-height | 1.7 | — | local-type-exception |
| assets/page-home.css | 455 | .detail p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-home.css | 465 | .detail .anchor-spec | letter-spacing | .16em | — | local-type-exception |
| assets/page-home.css | 466 | .detail .anchor-spec | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-home.css | 467 | .detail .anchor-spec | line-height | 1.45 | — | local-type-exception |
| assets/page-home.css | 487 | .back | letter-spacing | .15em | — | local-type-exception |
| assets/page-home.css | 488 | .back | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/page-home.css | 576 | .nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 1024px) and (min-width: 641px) | semantic-token |
| assets/page-home.css | 608 | .detail h2 | font-size | clamp(4.8rem, 10vw, 6.2rem) | @media (max-width: 1024px) and (min-width: 641px) | local-type-exception |
| assets/page-home.css | 628 | .detail h2 | font-size | clamp(4rem, 8vw, 5rem) | @media (max-width: 1024px) and (min-width: 641px) and (orientation: landscape) | local-type-exception |
| assets/page-home.css | 633 | .detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 1024px) and (min-width: 641px) and (orientation: landscape) | semantic-token |
| assets/page-home.css | 634 | .detail p | line-height | 1.55 | @media (max-width: 1024px) and (min-width: 641px) and (orientation: landscape) | local-type-exception |
| assets/page-home.css | 669 | .nav a | font-size | .75rem | @media (max-width: 640px) | local-type-exception |
| assets/page-home.css | 670 | .nav a | letter-spacing | .12em | @media (max-width: 640px) | local-type-exception |
| assets/page-home.css | 694 | .detail h2 | font-size | clamp(3.5rem, 16vw, 5rem) | @media (max-width: 640px) | local-type-exception |
| assets/page-home.css | 699 | .detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 640px) | semantic-token |
| assets/page-home.css | 724 | .detail h2 | font-size | 3.25rem | @media (max-width: 640px) and (max-height: 720px) | local-type-exception |
| assets/page-home.css | 729 | .detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 640px) and (max-height: 720px) | semantic-token |
| assets/page-home.css | 730 | .detail p | line-height | 1.45 | @media (max-width: 640px) and (max-height: 720px) | local-type-exception |
| assets/page-home.css | 735 | .detail .anchor-spec | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 640px) and (max-height: 720px) | semantic-token |
| assets/page-home.css | 1085 | .nav a | font-size | clamp(.78rem, .55vw, .88rem) | — | local-type-exception |
| assets/page-home.css | 1086 | .nav a | letter-spacing | .18em | — | local-type-exception |
| assets/page-home.css | 1090 | .detail-kicker | font-size | .78rem | — | local-type-exception |
| assets/page-home.css | 1104 | .cta::after | font-size | 1.25rem | — | local-type-exception |
| assets/page-home.css | 1135 | .home-intro__eyebrow | font-size | 13px | — | local-type-exception |
| assets/page-home.css | 1136 | .home-intro__eyebrow | font-weight | 700 | — | local-type-exception |
| assets/page-home.css | 1137 | .home-intro__eyebrow | letter-spacing | .18em | — | local-type-exception |
| assets/page-home.css | 1151 | .home-intro h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-home.css | 1152 | .home-intro h2 | font-size | clamp(52px, 7.4vw, 112px) | — | local-type-exception |
| assets/page-home.css | 1153 | .home-intro h2 | font-weight | 500 | — | local-type-exception |
| assets/page-home.css | 1154 | .home-intro h2 | line-height | .92 | — | local-type-exception |
| assets/page-home.css | 1155 | .home-intro h2 | letter-spacing | -.035em | — | local-type-exception |
| assets/page-home.css | 1170 | .home-intro__copy p, .home-intro__trust | font-size | clamp(16px, 1.25vw, 19px) | — | local-type-exception |
| assets/page-home.css | 1171 | .home-intro__copy p, .home-intro__trust | line-height | 1.72 | — | local-type-exception |
| assets/page-home.css | 1206 | .home-service span | font-size | 13px | — | local-type-exception |
| assets/page-home.css | 1207 | .home-service span | font-weight | 700 | — | local-type-exception |
| assets/page-home.css | 1208 | .home-service span | letter-spacing | .16em | — | local-type-exception |
| assets/page-home.css | 1214 | .home-service h3 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-home.css | 1215 | .home-service h3 | font-size | clamp(32px, 3.1vw, 48px) | — | local-type-exception |
| assets/page-home.css | 1216 | .home-service h3 | font-weight | 500 | — | local-type-exception |
| assets/page-home.css | 1217 | .home-service h3 | line-height | 1 | — | local-type-exception |
| assets/page-home.css | 1224 | .home-service p | font-size | 15px | — | local-type-exception |
| assets/page-home.css | 1225 | .home-service p | line-height | 1.65 | — | local-type-exception |
| assets/page-home.css | 1249 | .home-intro__cta | font-size | 14px | — | local-type-exception |
| assets/page-home.css | 1250 | .home-intro__cta | font-weight | 650 | — | local-type-exception |
| assets/page-home.css | 1251 | .home-intro__cta | letter-spacing | .025em | — | local-type-exception |
| assets/page-home.css | 1278 | .home-intro__cta::after | font-size | 1.15rem | — | local-type-exception |
| assets/page-home.css | 1318 | .home-intro__trust a | font-weight | 700 | — | local-type-exception |
| assets/page-menu.css | 23 | body | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/page-menu.css | 108 | .skip | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-menu.css | 148 | .header-nav a | font-size | 12px | — | local-type-exception |
| assets/page-menu.css | 149 | .header-nav a | font-weight | 650 | — | local-type-exception |
| assets/page-menu.css | 150 | .header-nav a | letter-spacing | .08em | — | local-type-exception |
| assets/page-menu.css | 194 | .page-title | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-menu.css | 195 | .page-title | font-size | clamp(72px, 8vw, 112px) | — | local-type-exception |
| assets/page-menu.css | 196 | .page-title | font-weight | 500 | — | local-type-exception |
| assets/page-menu.css | 198 | .page-title | line-height | .775 | — | local-type-exception |
| assets/page-menu.css | 199 | .page-title | letter-spacing | -.062em | — | local-type-exception |
| assets/page-menu.css | 209 | .menu-page .offer-intro p | font-size | clamp(15px, 1.25vw, 18px) | — | local-type-exception |
| assets/page-menu.css | 210 | .menu-page .offer-intro p | line-height | 1.6 | — | local-type-exception |
| assets/page-menu.css | 233 | .cards-note | font-size | 14px | — | local-type-exception |
| assets/page-menu.css | 234 | .cards-note | line-height | 1.5 | — | local-type-exception |
| assets/page-menu.css | 260 | .card-num | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-menu.css | 261 | .card-num | font-size | clamp(22px, 1.6vw, 28px) | — | local-type-exception |
| assets/page-menu.css | 262 | .card-num | font-weight | 500 | — | local-type-exception |
| assets/page-menu.css | 263 | .card-num | letter-spacing | .01em | — | local-type-exception |
| assets/page-menu.css | 280 | .card-title | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-menu.css | 281 | .card-title | font-size | clamp(28px, 2vw, 34px) | — | local-type-exception |
| assets/page-menu.css | 282 | .card-title | font-weight | 500 | — | local-type-exception |
| assets/page-menu.css | 283 | .card-title | line-height | .94 | — | local-type-exception |
| assets/page-menu.css | 284 | .card-title | letter-spacing | -.02em | — | local-type-exception |
| assets/page-menu.css | 290 | .card-quote | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-menu.css | 291 | .card-quote | line-height | 1.45 | — | local-type-exception |
| assets/page-menu.css | 297 | .card-effect | font-size | clamp(12px, .88vw, 13.5px) | — | local-type-exception |
| assets/page-menu.css | 298 | .card-effect | font-weight | 700 | — | local-type-exception |
| assets/page-menu.css | 299 | .card-effect | letter-spacing | .13em | — | local-type-exception |
| assets/page-menu.css | 306 | .card-effect-desc | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-menu.css | 307 | .card-effect-desc | line-height | 1.5 | — | local-type-exception |
| assets/page-menu.css | 314 | .card-arrow | font-size | 21px | — | local-type-exception |
| assets/page-menu.css | 315 | .card-arrow | line-height | 1 | — | local-type-exception |
| assets/page-menu.css | 483 | .menu-page .menu-stage .page-title | font-size | clamp(82px, 10svh, 112px) | @media (min-width: 1101px) | local-type-exception |
| assets/page-menu.css | 491 | .menu-page .menu-stage .offer-intro p | font-size | clamp(14px, 1.15vw, 17px) | @media (min-width: 1101px) | local-type-exception |
| assets/page-menu.css | 492 | .menu-page .menu-stage .offer-intro p | line-height | 1.5 | @media (min-width: 1101px) | local-type-exception |
| assets/page-menu.css | 512 | .menu-page .menu-stage .card-quote | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 1101px) | semantic-token |
| assets/page-menu.css | 513 | .menu-page .menu-stage .card-quote | line-height | 1.4 | @media (min-width: 1101px) | local-type-exception |
| assets/page-menu.css | 518 | .menu-page .menu-stage .card-effect | font-size | var(--ok-type-label-min, 12px) | @media (min-width: 1101px) | semantic-token |
| assets/page-menu.css | 523 | .menu-page .menu-stage .card-effect-desc | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 1101px) | semantic-token |
| assets/page-menu.css | 524 | .menu-page .menu-stage .card-effect-desc | line-height | 1.4 | @media (min-width: 1101px) | local-type-exception |
| assets/page-menu.css | 538 | .header-nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 640px) | semantic-token |
| assets/page-menu.css | 538 | .header-nav a | letter-spacing | .08em | @media (max-width: 640px) | local-type-exception |
| assets/page-menu.css | 544 | .page-title | font-size | clamp(54px, 17vw, 72px) | @media (max-width: 640px) | local-type-exception |
| assets/page-menu.css | 559 | .menu-page .menu-stage .page-title | font-size | clamp(72px, 11svh, 92px) | @media (min-width: 1101px) and (max-height: 800px) | local-type-exception |
| assets/page-menu.css | 560 | .menu-page .menu-stage .page-title | line-height | .82 | @media (min-width: 1101px) and (max-height: 800px) | local-type-exception |
| assets/page-menu.css | 570 | .menu-page .offer-intro p | font-size | 14px | @media (min-width: 1101px) and (max-height: 800px) | local-type-exception |
| assets/page-menu.css | 571 | .menu-page .offer-intro p | line-height | 1.45 | @media (min-width: 1101px) and (max-height: 800px) | local-type-exception |
| assets/page-menu.css | 579 | .menu-page .menu-stage .card-title | font-size | clamp(19px, 1.6vw, 26px) | @media (min-width: 1101px) and (max-height: 800px) | local-type-exception |
| assets/page-menu.css | 583 | .menu-page .menu-stage .card-quote | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 1101px) and (max-height: 800px) | semantic-token |
| assets/page-menu.css | 584 | .menu-page .menu-stage .card-quote | line-height | 1.35 | @media (min-width: 1101px) and (max-height: 800px) | local-type-exception |
| assets/page-menu.css | 588 | .menu-page .menu-stage .card-effect | font-size | var(--ok-type-label-min, 12px) | @media (min-width: 1101px) and (max-height: 800px) | semantic-token |
| assets/page-menu.css | 592 | .menu-page .menu-stage .card-effect-desc | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 1101px) and (max-height: 800px) | semantic-token |
| assets/page-menu.css | 593 | .menu-page .menu-stage .card-effect-desc | line-height | 1.35 | @media (min-width: 1101px) and (max-height: 800px) | local-type-exception |
| assets/page-menu.css | 598 | .cards-note | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 1101px) and (max-height: 800px) | semantic-token |
| assets/page-menu.css | 613 | .menu-page .menu-stage .page-title | font-size | clamp(58px, 10svh, 72px) | @media (min-width: 1101px) and (max-height: 720px) | local-type-exception |
| assets/page-menu.css | 614 | .menu-page .menu-stage .page-title | line-height | .82 | @media (min-width: 1101px) and (max-height: 720px) | local-type-exception |
| assets/page-menu.css | 627 | .menu-page .offer-intro p | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 1101px) and (max-height: 720px) | semantic-token |
| assets/page-menu.css | 628 | .menu-page .offer-intro p | line-height | 1.35 | @media (min-width: 1101px) and (max-height: 720px) | local-type-exception |
| assets/page-menu.css | 640 | .card-num | font-size | 20px | @media (min-width: 1101px) and (max-height: 720px) | local-type-exception |
| assets/page-menu.css | 646 | .menu-page .menu-stage .card-title | font-size | clamp(18px, 1.55vw, 23px) | @media (min-width: 1101px) and (max-height: 720px) | local-type-exception |
| assets/page-menu.css | 652 | .menu-page .menu-stage .card-quote | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 1101px) and (max-height: 720px) | semantic-token |
| assets/page-menu.css | 653 | .menu-page .menu-stage .card-quote | line-height | 1.28 | @media (min-width: 1101px) and (max-height: 720px) | local-type-exception |
| assets/page-menu.css | 658 | .menu-page .menu-stage .card-effect | font-size | var(--ok-type-label-min, 12px) | @media (min-width: 1101px) and (max-height: 720px) | semantic-token |
| assets/page-menu.css | 663 | .menu-page .menu-stage .card-effect-desc | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 1101px) and (max-height: 720px) | semantic-token |
| assets/page-menu.css | 664 | .menu-page .menu-stage .card-effect-desc | line-height | 1.28 | @media (min-width: 1101px) and (max-height: 720px) | local-type-exception |
| assets/page-menu.css | 669 | .card-arrow | font-size | 18px | @media (min-width: 1101px) and (max-height: 720px) | local-type-exception |
| assets/page-menu.css | 674 | .cards-note | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 1101px) and (max-height: 720px) | semantic-token |
| assets/services/about/styles.css | 32 | body | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 39 | button, a | font | inherit | — | local-type-exception |
| assets/services/about/styles.css | 127 | .site-header nav a | font-weight | 600 | — | local-type-exception |
| assets/services/about/styles.css | 128 | .site-header nav a | letter-spacing | .13em | — | local-type-exception |
| assets/services/about/styles.css | 243 | .kicker | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/about/styles.css | 244 | .kicker | font-weight | 650 | — | local-type-exception |
| assets/services/about/styles.css | 245 | .kicker | letter-spacing | .16em | — | local-type-exception |
| assets/services/about/styles.css | 259 | h1, h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 260 | h1, h2 | font-weight | 500 | — | local-type-exception |
| assets/services/about/styles.css | 261 | h1, h2 | letter-spacing | -.035em | — | local-type-exception |
| assets/services/about/styles.css | 266 | h1 | font-size | clamp(62px, 5.6vw, 94px) | — | local-type-exception |
| assets/services/about/styles.css | 270 | h2 | font-size | clamp(56px, 4.65vw, 78px) | — | local-type-exception |
| assets/services/about/styles.css | 288 | .lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 289 | .lead | line-height | 1.55 | — | local-type-exception |
| assets/services/about/styles.css | 323 | .chips li | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/about/styles.css | 324 | .chips li | font-weight | 650 | — | local-type-exception |
| assets/services/about/styles.css | 325 | .chips li | letter-spacing | .1em | — | local-type-exception |
| assets/services/about/styles.css | 395 | .facts strong, .model-points strong | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 396 | .facts strong, .model-points strong | font-size | 19px | — | local-type-exception |
| assets/services/about/styles.css | 397 | .facts strong, .model-points strong | font-weight | 600 | — | local-type-exception |
| assets/services/about/styles.css | 398 | .facts strong, .model-points strong | letter-spacing | .045em | — | local-type-exception |
| assets/services/about/styles.css | 404 | .row-index | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 405 | .row-index | font-size | 24px | — | local-type-exception |
| assets/services/about/styles.css | 406 | .row-index | font-weight | 400 | — | local-type-exception |
| assets/services/about/styles.css | 407 | .row-index | line-height | 1 | — | local-type-exception |
| assets/services/about/styles.css | 420 | .facts .row-content > span, .model-points .row-content > span | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 421 | .facts .row-content > span, .model-points .row-content > span | line-height | 1.5 | — | local-type-exception |
| assets/services/about/styles.css | 435 | .result | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 436 | .result | font-weight | 520 | — | local-type-exception |
| assets/services/about/styles.css | 437 | .result | line-height | 1.5 | — | local-type-exception |
| assets/services/about/styles.css | 474 | .primary-cta, .text-link | font-size | var(--ok-type-control, 15px) | — | semantic-token |
| assets/services/about/styles.css | 475 | .primary-cta, .text-link | font-weight | 600 | — | local-type-exception |
| assets/services/about/styles.css | 479 | .primary-cta span | font-size | inherit | — | local-type-exception |
| assets/services/about/styles.css | 565 | .portrait-frame figcaption | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/about/styles.css | 566 | .portrait-frame figcaption | font-weight | 650 | — | local-type-exception |
| assets/services/about/styles.css | 567 | .portrait-frame figcaption | letter-spacing | .13em | — | local-type-exception |
| assets/services/about/styles.css | 582 | .scene-02 h2 | font-size | clamp(54px, 4.25vw, 72px) | — | local-type-exception |
| assets/services/about/styles.css | 590 | .scene-03 h2 | font-size | clamp(54px, 4.35vw, 74px) | — | local-type-exception |
| assets/services/about/styles.css | 601 | .proof-statement | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 602 | .proof-statement | font-size | clamp(18px, 1.3vw, 23px) | — | local-type-exception |
| assets/services/about/styles.css | 603 | .proof-statement | line-height | 1.12 | — | local-type-exception |
| assets/services/about/styles.css | 611 | .scene-04 h2 | font-size | clamp(48px, 3.85vw, 66px) | — | local-type-exception |
| assets/services/about/styles.css | 617 | .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 645 | .accordion-index | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 646 | .accordion-index | font-size | 24px | — | local-type-exception |
| assets/services/about/styles.css | 647 | .accordion-index | line-height | 1 | — | local-type-exception |
| assets/services/about/styles.css | 656 | .accordion-label strong | font-size | 12px | — | local-type-exception |
| assets/services/about/styles.css | 657 | .accordion-label strong | font-weight | 650 | — | local-type-exception |
| assets/services/about/styles.css | 658 | .accordion-label strong | letter-spacing | .1em | — | local-type-exception |
| assets/services/about/styles.css | 664 | .accordion-label small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 665 | .accordion-label small | line-height | 1.42 | — | local-type-exception |
| assets/services/about/styles.css | 711 | .accordion-detail p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 712 | .accordion-detail p | line-height | 1.5 | — | local-type-exception |
| assets/services/about/styles.css | 718 | .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 753 | .mobile-details summary | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 754 | .mobile-details summary | font-size | 14px | — | local-type-exception |
| assets/services/about/styles.css | 755 | .mobile-details summary | font-weight | 600 | — | local-type-exception |
| assets/services/about/styles.css | 756 | .mobile-details summary | letter-spacing | .03em | — | local-type-exception |
| assets/services/about/styles.css | 769 | .mobile-details summary::after | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 770 | .mobile-details summary::after | font-weight | 400 | — | local-type-exception |
| assets/services/about/styles.css | 780 | .mobile-details p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 781 | .mobile-details p | line-height | 1.45 | — | local-type-exception |
| assets/services/about/styles.css | 801 | .scroll-cue | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/about/styles.css | 802 | .scroll-cue | font-weight | 600 | — | local-type-exception |
| assets/services/about/styles.css | 803 | .scroll-cue | letter-spacing | .1em | — | local-type-exception |
| assets/services/about/styles.css | 879 | h1 | font-size | clamp(58px, 5vw, 78px) | @media (max-height: 800px) and (min-width: 901px) | local-type-exception |
| assets/services/about/styles.css | 883 | h2 | font-size | clamp(48px, 4vw, 66px) | @media (max-height: 800px) and (min-width: 901px) | local-type-exception |
| assets/services/about/styles.css | 901 | .facts strong, .model-points strong | font-size | 17px | @media (max-height: 800px) and (min-width: 901px) | local-type-exception |
| assets/services/about/styles.css | 910 | .facts .row-content > span, .model-points .row-content > span, .scene-04 .lead, .accordion-label small, .accordion-detail p, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (max-height: 800px) and (min-width: 901px) | semantic-token |
| assets/services/about/styles.css | 918 | .accordion-label strong | font-size | 12px | @media (max-height: 800px) and (min-width: 901px) | local-type-exception |
| assets/services/about/styles.css | 990 | h1 | font-size | clamp(62px, 7vw, 74px) | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 995 | h2, .scene-03 h2 | font-size | clamp(48px, 5.4vw, 58px) | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 1000 | .scene-02 h2, .scene-04 h2 | font-size | clamp(43px, 4.8vw, 51px) | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 1006 | .lead, .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) | semantic-token |
| assets/services/about/styles.css | 1022 | .facts strong, .model-points strong | font-size | 16px | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 1027 | .facts .row-content > span, .model-points .row-content > span | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) | semantic-token |
| assets/services/about/styles.css | 1028 | .facts .row-content > span, .model-points .row-content > span | line-height | 1.42 | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 1034 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) | semantic-token |
| assets/services/about/styles.css | 1062 | .proof-statement | font-size | 17px | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 1075 | .accordion-label strong | font-size | 12px | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 1080 | .accordion-label small, .accordion-detail p | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) | semantic-token |
| assets/services/about/styles.css | 1115 | .site-header nav a | letter-spacing | .08em | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1173 | .kicker | font-size | 12px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1181 | h1 | font-size | clamp(43px, 12.4vw, 52px) | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1188 | h2, .scene-02 h2, .scene-03 h2, .scene-04 h2 | font-size | clamp(38px, 10.6vw, 45px) | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1194 | .lead, .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1195 | .lead, .scene-04 .lead | line-height | 1.48 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1205 | .chips li | font-size | 12px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1238 | .facts strong, .model-points strong | font-size | 15px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1244 | .facts .row-content > span, .model-points .row-content > span | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1245 | .facts .row-content > span, .model-points .row-content > span | line-height | 1.42 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1252 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1253 | .result, .scene-04 .result | line-height | 1.45 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1298 | .mobile-details summary | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1299 | .mobile-details summary | font-size | 14px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1300 | .mobile-details summary | font-weight | 600 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1301 | .mobile-details summary | letter-spacing | .03em | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1314 | .mobile-details summary::after | font-family | var(--ok-font-body, "Archivo", sans-serif) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1315 | .mobile-details summary::after | font-weight | 400 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1325 | .mobile-details p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1326 | .mobile-details p | line-height | 1.45 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1366 | .portrait-frame figcaption | font-size | 12px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1387 | .proof-statement | font-size | 16px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1402 | .accordion-index | font-size | 21px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1406 | .accordion-label strong | font-size | 12px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1410 | .accordion-label small | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1411 | .accordion-label small | line-height | 1.4 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1424 | .accordion-detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1425 | .accordion-detail p | line-height | 1.48 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1469 | .about-page .scene-01 h1 | font-size | clamp(42px, 4.4vw, 46px) | @media (min-width: 821px) and (max-height: 700px) | local-type-exception |
| assets/services/about/styles.css | 1473 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | clamp(43px, 4.7vw, 49px) | @media (min-width: 821px) and (max-height: 700px) | local-type-exception |
| assets/services/about/styles.css | 1506 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | clamp(39px, 4.1vw, 43px) | @media (min-width: 821px) and (max-height: 620px) | local-type-exception |
| assets/services/about/styles.css | 1515 | .about-page .chips li | letter-spacing | .06em | @media (min-width: 821px) and (max-height: 620px) | local-type-exception |
| assets/services/about/styles.css | 1572 | .site-header nav a | letter-spacing | .11em | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1586 | h1 | font-size | 64px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1593 | h2, .scene-02 h2, .scene-03 h2, .scene-04 h2 | font-size | 50px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1598 | .lead, .scene-04 .lead | font-size | 14px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1602 | .chips li | font-size | 12px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1616 | .facts strong, .model-points strong | font-size | 16px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1621 | .facts .row-content > span, .model-points .row-content > span | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 600px) and (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1626 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 600px) and (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1631 | .mobile-details summary | font-size | 16px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1635 | .mobile-details p | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 600px) and (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1647 | .portrait-frame figcaption | font-size | 12px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1662 | .proof-statement | font-size | 18px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1671 | .accordion-label strong | font-size | 12px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1676 | .accordion-label small, .accordion-detail p | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 600px) and (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1702 | .scene-04 .lead | line-height | 1.42 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1752 | .scene-02 h2 | font-size | clamp(34px, 9.5vw, 38px) | @media (max-width: 599px) | local-type-exception |
| assets/services/about/styles.css | 1756 | .scene-02 .lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 599px) | semantic-token |
| assets/services/about/styles.css | 1757 | .scene-02 .lead | line-height | 1.42 | @media (max-width: 599px) | local-type-exception |
| assets/services/about/styles.css | 1773 | .scene-02 .facts strong | font-size | 14px | @media (max-width: 599px) | local-type-exception |
| assets/services/about/styles.css | 1785 | .scene-02 .portrait-frame figcaption | letter-spacing | .06em | @media (max-width: 599px) | local-type-exception |
| assets/services/about/styles.css | 1831 | .scene-01 h1, .scene-03 h2 | font-size | clamp(38px, 11.5vw, 44px) | @media (max-width: 390px) and (max-height: 740px) | local-type-exception |
| assets/services/about/styles.css | 1835 | .scene-02 h2 | font-size | 31px | @media (max-width: 390px) and (max-height: 740px) | local-type-exception |
| assets/services/about/styles.css | 1841 | .scene-01 .lead, .scene-03 .lead | line-height | 1.35 | @media (max-width: 390px) and (max-height: 740px) | local-type-exception |
| assets/services/about/styles.css | 1855 | .mobile-details p | line-height | 1.35 | @media (max-width: 390px) and (max-height: 740px) | local-type-exception |
| assets/services/about/styles.css | 1924 | .about-page .scene-01 h1 | font-size | 46px | — | local-type-exception |
| assets/services/about/styles.css | 1928 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | 39px | — | local-type-exception |
| assets/services/campaign/styles.css | 28 | body | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/services/campaign/styles.css | 155 | .site-header nav a | font-weight | 650 | — | local-type-exception |
| assets/services/campaign/styles.css | 156 | .site-header nav a | letter-spacing | .08em | — | local-type-exception |
| assets/services/campaign/styles.css | 224 | .opening-copy h1 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/campaign/styles.css | 225 | .opening-copy h1 | font-size | clamp(64px, 5.15vw, 86px) | — | local-type-exception |
| assets/services/campaign/styles.css | 226 | .opening-copy h1 | font-weight | 500 | — | local-type-exception |
| assets/services/campaign/styles.css | 227 | .opening-copy h1 | letter-spacing | -.035em | — | local-type-exception |
| assets/services/campaign/styles.css | 239 | .opening-copy p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 240 | .opening-copy p | font-weight | 450 | — | local-type-exception |
| assets/services/campaign/styles.css | 241 | .opening-copy p | line-height | 1.55 | — | local-type-exception |
| assets/services/campaign/styles.css | 249 | .opening-scope | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/campaign/styles.css | 250 | .opening-scope | font-weight | 650 | — | local-type-exception |
| assets/services/campaign/styles.css | 251 | .opening-scope | letter-spacing | .08em | — | local-type-exception |
| assets/services/campaign/styles.css | 278 | .outline-cta | font-size | 15px | — | local-type-exception |
| assets/services/campaign/styles.css | 279 | .outline-cta | font-weight | 550 | — | local-type-exception |
| assets/services/campaign/styles.css | 310 | .scroll-cue | font-size | 12px | — | local-type-exception |
| assets/services/campaign/styles.css | 357 | .journey-intro h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/campaign/styles.css | 358 | .journey-intro h2 | font-size | clamp(58px, 4.9vw, 82px) | — | local-type-exception |
| assets/services/campaign/styles.css | 359 | .journey-intro h2 | font-weight | 500 | — | local-type-exception |
| assets/services/campaign/styles.css | 360 | .journey-intro h2 | letter-spacing | .005em | — | local-type-exception |
| assets/services/campaign/styles.css | 366 | .journey-intro p | font-size | clamp(14px, .96vw, 17px) | — | local-type-exception |
| assets/services/campaign/styles.css | 367 | .journey-intro p | line-height | 1.55 | — | local-type-exception |
| assets/services/campaign/styles.css | 404 | .proof-content h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/campaign/styles.css | 405 | .proof-content h2 | font-size | clamp(58px, 4.65vw, 78px) | — | local-type-exception |
| assets/services/campaign/styles.css | 406 | .proof-content h2 | font-weight | 500 | — | local-type-exception |
| assets/services/campaign/styles.css | 407 | .proof-content h2 | letter-spacing | -.025em | — | local-type-exception |
| assets/services/campaign/styles.css | 419 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 420 | .proof-lead | line-height | 1.55 | — | local-type-exception |
| assets/services/campaign/styles.css | 444 | .proof-trigger | font | inherit | — | local-type-exception |
| assets/services/campaign/styles.css | 474 | .proof-index | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/campaign/styles.css | 475 | .proof-index | font-size | 24px | — | local-type-exception |
| assets/services/campaign/styles.css | 476 | .proof-index | line-height | 1 | — | local-type-exception |
| assets/services/campaign/styles.css | 485 | .proof-label strong | font-size | 12px | — | local-type-exception |
| assets/services/campaign/styles.css | 486 | .proof-label strong | font-weight | 650 | — | local-type-exception |
| assets/services/campaign/styles.css | 487 | .proof-label strong | letter-spacing | .09em | — | local-type-exception |
| assets/services/campaign/styles.css | 494 | .proof-label small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 495 | .proof-label small | line-height | 1.42 | — | local-type-exception |
| assets/services/campaign/styles.css | 523 | .proof-detail p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 524 | .proof-detail p | line-height | 1.45 | — | local-type-exception |
| assets/services/campaign/styles.css | 529 | .proof-detail b | font-weight | 650 | — | local-type-exception |
| assets/services/campaign/styles.css | 536 | .proof-output | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 537 | .proof-output | line-height | 1.48 | — | local-type-exception |
| assets/services/campaign/styles.css | 561 | .proof-primary | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 562 | .proof-primary | font-weight | 550 | — | local-type-exception |
| assets/services/campaign/styles.css | 594 | .proof-secondary | font-size | 12px | — | local-type-exception |
| assets/services/campaign/styles.css | 595 | .proof-secondary | font-weight | 550 | — | local-type-exception |
| assets/services/campaign/styles.css | 624 | .journey-note h3 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/campaign/styles.css | 625 | .journey-note h3 | font-weight | 500 | — | local-type-exception |
| assets/services/campaign/styles.css | 630 | .journey-note h3 b | font-size | clamp(48px, 3.25vw, 58px) | — | local-type-exception |
| assets/services/campaign/styles.css | 631 | .journey-note h3 b | font-weight | 400 | — | local-type-exception |
| assets/services/campaign/styles.css | 632 | .journey-note h3 b | line-height | .9 | — | local-type-exception |
| assets/services/campaign/styles.css | 637 | .journey-note h3 span | font-size | clamp(20px, 1.4vw, 25px) | — | local-type-exception |
| assets/services/campaign/styles.css | 638 | .journey-note h3 span | font-weight | 600 | — | local-type-exception |
| assets/services/campaign/styles.css | 639 | .journey-note h3 span | letter-spacing | .03em | — | local-type-exception |
| assets/services/campaign/styles.css | 645 | .journey-note p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 646 | .journey-note p | line-height | 1.55 | — | local-type-exception |
| assets/services/campaign/styles.css | 654 | .journey-note small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 655 | .journey-note small | line-height | 1.45 | — | local-type-exception |
| assets/services/campaign/styles.css | 735 | .opening-copy h1 | font-size | clamp(48px, 6.2vw, 64px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/campaign/styles.css | 744 | .proof-content h2 | font-size | clamp(48px, 5.4vw, 62px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/campaign/styles.css | 789 | .opening-copy h1 | font-size | clamp(48px, 14vw, 72px) | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 813 | .journey-intro h2 | font-size | clamp(54px, 16vw, 76px) | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 819 | .journey-intro > p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 845 | .journey-mobile-steps b | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 846 | .journey-mobile-steps b | font-size | 24px | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 847 | .journey-mobile-steps b | font-weight | 400 | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 856 | .journey-mobile-steps strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 857 | .journey-mobile-steps strong | letter-spacing | .08em | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 863 | .journey-mobile-steps small | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 864 | .journey-mobile-steps small | line-height | 1.4 | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 888 | .proof-content h2 | font-size | clamp(43px, 12.7vw, 56px) | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 893 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 908 | .proof-index | font-size | 20px | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 916 | .proof-label strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 921 | .proof-label small, .proof-detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 934 | .proof-output | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 962 | .campaign-proof .proof-content h2 | font-size | 36px | @media (max-width: 640px) and (max-height: 700px) | local-type-exception |
| assets/services/campaign/styles.css | 967 | .campaign-proof .proof-lead | line-height | 1.35 | @media (max-width: 640px) and (max-height: 700px) | local-type-exception |
| assets/services/diagnosis/styles.css | 18 | body | font-family | var(--ok-font-body) | — | semantic-token |
| assets/services/diagnosis/styles.css | 22 | button | font | inherit | — | local-type-exception |
| assets/services/diagnosis/styles.css | 149 | .site-header nav a | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/diagnosis/styles.css | 150 | .site-header nav a | font-weight | 650 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 151 | .site-header nav a | letter-spacing | .08em | — | local-type-exception |
| assets/services/diagnosis/styles.css | 178 | .section-kicker | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/diagnosis/styles.css | 179 | .section-kicker | font-weight | 700 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 180 | .section-kicker | letter-spacing | .14em | — | local-type-exception |
| assets/services/diagnosis/styles.css | 200 | .opening-copy h1 | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/diagnosis/styles.css | 201 | .opening-copy h1 | font-size | var(--ok-type-display-service) | — | semantic-token |
| assets/services/diagnosis/styles.css | 202 | .opening-copy h1 | font-weight | 500 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 203 | .opening-copy h1 | letter-spacing | -.035em | — | local-type-exception |
| assets/services/diagnosis/styles.css | 204 | .opening-copy h1 | line-height | .92 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 210 | .opening-copy > p:not(.opening-privacy) | font-size | var(--ok-type-content) | — | semantic-token |
| assets/services/diagnosis/styles.css | 211 | .opening-copy > p:not(.opening-privacy) | line-height | 1.55 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 218 | .opening-scope | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/diagnosis/styles.css | 219 | .opening-scope | font-weight | 650 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 220 | .opening-scope | letter-spacing | .08em | — | local-type-exception |
| assets/services/diagnosis/styles.css | 243 | .outline-cta | font-size | var(--ok-type-control) | — | semantic-token |
| assets/services/diagnosis/styles.css | 244 | .outline-cta | font-weight | 550 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 261 | .opening-privacy | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/diagnosis/styles.css | 262 | .opening-privacy | font-size | var(--ok-type-content) | — | semantic-token |
| assets/services/diagnosis/styles.css | 263 | .opening-privacy | letter-spacing | .055em | — | local-type-exception |
| assets/services/diagnosis/styles.css | 294 | .map-intro h2 | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/diagnosis/styles.css | 295 | .map-intro h2 | font-size | var(--ok-type-display-section) | — | semantic-token |
| assets/services/diagnosis/styles.css | 296 | .map-intro h2 | font-weight | 500 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 297 | .map-intro h2 | letter-spacing | -.02em | — | local-type-exception |
| assets/services/diagnosis/styles.css | 298 | .map-intro h2 | line-height | .95 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 306 | .map-intro p | font-size | var(--ok-type-content) | — | semantic-token |
| assets/services/diagnosis/styles.css | 307 | .map-intro p | line-height | 1.42 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 337 | .quiz-progress | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/diagnosis/styles.css | 338 | .quiz-progress | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/diagnosis/styles.css | 339 | .quiz-progress | font-weight | 600 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 340 | .quiz-progress | letter-spacing | .11em | — | local-type-exception |
| assets/services/diagnosis/styles.css | 353 | .quiz-question h3 | font-size | var(--ok-type-display-question) | — | semantic-token |
| assets/services/diagnosis/styles.css | 354 | .quiz-question h3 | font-weight | 600 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 355 | .quiz-question h3 | letter-spacing | -.04em | — | local-type-exception |
| assets/services/diagnosis/styles.css | 356 | .quiz-question h3 | line-height | .98 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 362 | .quiz-question > p | font-size | var(--ok-type-content) | — | semantic-token |
| assets/services/diagnosis/styles.css | 363 | .quiz-question > p | line-height | 1.42 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 394 | .answers button b | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/diagnosis/styles.css | 395 | .answers button b | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/diagnosis/styles.css | 396 | .answers button b | font-weight | 500 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 398 | .answers button span | font-size | var(--ok-type-content) | — | semantic-token |
| assets/services/diagnosis/styles.css | 398 | .answers button span | font-weight | 520 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 398 | .answers button span | line-height | 1.25 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 401 | .answers button i | font-size | var(--ok-type-icon) | — | semantic-token |
| assets/services/diagnosis/styles.css | 428 | .quiz-back | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/diagnosis/styles.css | 429 | .quiz-back | font-weight | 600 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 436 | .quiz-privacy | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/diagnosis/styles.css | 437 | .quiz-privacy | font-size | var(--ok-type-content) | — | semantic-token |
| assets/services/diagnosis/styles.css | 438 | .quiz-privacy | letter-spacing | .06em | — | local-type-exception |
| assets/services/diagnosis/styles.css | 465 | .result-content h2 | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/diagnosis/styles.css | 466 | .result-content h2 | font-size | var(--ok-type-display-result) | — | semantic-token |
| assets/services/diagnosis/styles.css | 467 | .result-content h2 | font-weight | 500 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 468 | .result-content h2 | letter-spacing | -.035em | — | local-type-exception |
| assets/services/diagnosis/styles.css | 469 | .result-content h2 | line-height | .93 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 475 | .result-why | font-size | var(--ok-type-content) | — | semantic-token |
| assets/services/diagnosis/styles.css | 476 | .result-why | line-height | 1.48 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 481 | .steps-label | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/diagnosis/styles.css | 482 | .steps-label | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/diagnosis/styles.css | 483 | .steps-label | font-weight | 600 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 484 | .steps-label | letter-spacing | .13em | — | local-type-exception |
| assets/services/diagnosis/styles.css | 502 | .result-steps li | font-size | var(--ok-type-content) | — | semantic-token |
| assets/services/diagnosis/styles.css | 503 | .result-steps li | line-height | 1.38 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 509 | .result-steps li::before | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/diagnosis/styles.css | 510 | .result-steps li::before | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/diagnosis/styles.css | 512 | .result-disclaimer | font-size | var(--ok-type-content) | — | semantic-token |
| assets/services/diagnosis/styles.css | 516 | .result-availability | font-size | var(--ok-type-content) | — | semantic-token |
| assets/services/diagnosis/styles.css | 517 | .result-availability | line-height | 1.42 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 530 | .result-cta | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/diagnosis/styles.css | 531 | .result-cta | font-weight | 600 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 537 | .result-cta i | font-size | var(--ok-type-icon) | — | semantic-token |
| assets/services/diagnosis/styles.css | 548 | .contact-panel h2 | font-size | var(--ok-type-display-result) | — | semantic-token |
| assets/services/diagnosis/styles.css | 549 | .contact-intro | font-size | var(--ok-type-content) | — | semantic-token |
| assets/services/diagnosis/styles.css | 549 | .contact-intro | line-height | 1.45 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 554 | .result-lead-field span | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/diagnosis/styles.css | 555 | .result-lead-field span | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/diagnosis/styles.css | 556 | .result-lead-field span | font-weight | 600 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 557 | .result-lead-field span | letter-spacing | .08em | — | local-type-exception |
| assets/services/diagnosis/styles.css | 567 | .result-lead-field input | font-family | inherit | — | local-type-exception |
| assets/services/diagnosis/styles.css | 568 | .result-lead-field input | font-size | var(--ok-type-content) | — | semantic-token |
| assets/services/diagnosis/styles.css | 579 | .result-lead-status | font-size | var(--ok-type-content) | — | semantic-token |
| assets/services/diagnosis/styles.css | 579 | .result-lead-status | font-weight | 600 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 582 | .result-lead-note | font-size | var(--ok-type-content) | — | semantic-token |
| assets/services/diagnosis/styles.css | 582 | .result-lead-note | line-height | 1.4 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 592 | .result-controls button, .return-to-result | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/diagnosis/styles.css | 593 | .result-controls button, .return-to-result | font-weight | 600 | — | local-type-exception |
| assets/services/diagnosis/styles.css | 605 | .answers button span | font-size | var(--ok-type-content-min) | @media (max-width: 1200px) and (min-width:821px) | semantic-token |
| assets/services/diagnosis/styles.css | 611 | .map-intro h2 | font-size | 32px | @media (max-height: 780px) and (min-width:821px) | local-type-exception |
| assets/services/diagnosis/styles.css | 614 | .quiz-question h3 | font-size | 31px | @media (max-height: 780px) and (min-width:821px) | local-type-exception |
| assets/services/diagnosis/styles.css | 619 | .result-content h2 | font-size | 44px | @media (max-height: 780px) and (min-width:821px) | local-type-exception |
| assets/services/diagnosis/styles.css | 630 | .site-header nav a | font-size | var(--ok-type-label-min) | @media (max-width:820px) | semantic-token |
| assets/services/diagnosis/styles.css | 657 | .opening-copy h1 | font-size | clamp(48px,14vw,62px) | @media (max-width:820px) | local-type-exception |
| assets/services/diagnosis/styles.css | 669 | .map-intro h2 | font-size | 31px | @media (max-width:820px) | local-type-exception |
| assets/services/diagnosis/styles.css | 670 | .map-intro p | font-size | var(--ok-type-content-min) | @media (max-width:820px) | semantic-token |
| assets/services/diagnosis/styles.css | 672 | .quiz-progress | font-size | var(--ok-type-label-min) | @media (max-width:820px) | semantic-token |
| assets/services/diagnosis/styles.css | 673 | .quiz-question h3 | font-size | clamp(29px,8.2vw,35px) | @media (max-width:820px) | local-type-exception |
| assets/services/diagnosis/styles.css | 674 | .quiz-question > p | font-size | var(--ok-type-content-min) | @media (max-width:820px) | semantic-token |
| assets/services/diagnosis/styles.css | 677 | .answers button span | font-size | var(--ok-type-content-min) | @media (max-width:820px) | semantic-token |
| assets/services/diagnosis/styles.css | 678 | .quiz-privacy | font-size | var(--ok-type-label-min) | @media (max-width:820px) | semantic-token |
| assets/services/diagnosis/styles.css | 686 | .result-content .section-kicker | letter-spacing | .09em | @media (max-width:820px) | local-type-exception |
| assets/services/diagnosis/styles.css | 688 | .result-content h2 | font-size | clamp(34px,10vw,44px) | @media (max-width:820px) | local-type-exception |
| assets/services/diagnosis/styles.css | 689 | .result-why | font-size | var(--ok-type-content-min) | @media (max-width:820px) | semantic-token |
| assets/services/diagnosis/styles.css | 689 | .result-why | line-height | 1.25 | @media (max-width:820px) | local-type-exception |
| assets/services/diagnosis/styles.css | 692 | .result-steps li | font-size | var(--ok-type-content-min) | @media (max-width:820px) | semantic-token |
| assets/services/diagnosis/styles.css | 692 | .result-steps li | line-height | 1.25 | @media (max-width:820px) | local-type-exception |
| assets/services/diagnosis/styles.css | 694 | .result-availability | font-size | var(--ok-type-content-min) | @media (max-width:820px) | semantic-token |
| assets/services/diagnosis/styles.css | 694 | .result-availability | line-height | 1.2 | @media (max-width:820px) | local-type-exception |
| assets/services/diagnosis/styles.css | 698 | .contact-intro | font-size | var(--ok-type-content-min) | @media (max-width:820px) | semantic-token |
| assets/services/diagnosis/styles.css | 700 | .contact-panel h2 | font-size | clamp(34px,10vw,42px) | @media (max-width:820px) | local-type-exception |
| assets/services/diagnosis/styles.css | 705 | .result-lead-note | line-height | 1.35 | @media (max-width:820px) | local-type-exception |
| assets/services/process/styles.css | 28 | body | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 155 | .site-header nav a | font-weight | 650 | — | local-type-exception |
| assets/services/process/styles.css | 156 | .site-header nav a | letter-spacing | .08em | — | local-type-exception |
| assets/services/process/styles.css | 224 | .opening-copy h1 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 225 | .opening-copy h1 | font-size | clamp(64px, 5.15vw, 86px) | — | local-type-exception |
| assets/services/process/styles.css | 226 | .opening-copy h1 | font-weight | 500 | — | local-type-exception |
| assets/services/process/styles.css | 227 | .opening-copy h1 | letter-spacing | -.035em | — | local-type-exception |
| assets/services/process/styles.css | 239 | .opening-copy p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 240 | .opening-copy p | font-weight | 450 | — | local-type-exception |
| assets/services/process/styles.css | 241 | .opening-copy p | line-height | 1.55 | — | local-type-exception |
| assets/services/process/styles.css | 249 | .opening-scope | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/process/styles.css | 250 | .opening-scope | font-weight | 650 | — | local-type-exception |
| assets/services/process/styles.css | 251 | .opening-scope | letter-spacing | .08em | — | local-type-exception |
| assets/services/process/styles.css | 278 | .outline-cta | font-size | 15px | — | local-type-exception |
| assets/services/process/styles.css | 279 | .outline-cta | font-weight | 550 | — | local-type-exception |
| assets/services/process/styles.css | 310 | .scroll-cue | font-size | 12px | — | local-type-exception |
| assets/services/process/styles.css | 357 | .journey-intro h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 358 | .journey-intro h2 | font-size | clamp(58px, 4.9vw, 82px) | — | local-type-exception |
| assets/services/process/styles.css | 359 | .journey-intro h2 | font-weight | 500 | — | local-type-exception |
| assets/services/process/styles.css | 360 | .journey-intro h2 | letter-spacing | .005em | — | local-type-exception |
| assets/services/process/styles.css | 366 | .journey-intro p | font-size | clamp(14px, .96vw, 17px) | — | local-type-exception |
| assets/services/process/styles.css | 367 | .journey-intro p | line-height | 1.55 | — | local-type-exception |
| assets/services/process/styles.css | 404 | .proof-content h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 405 | .proof-content h2 | font-size | clamp(58px, 4.65vw, 78px) | — | local-type-exception |
| assets/services/process/styles.css | 406 | .proof-content h2 | font-weight | 500 | — | local-type-exception |
| assets/services/process/styles.css | 407 | .proof-content h2 | letter-spacing | -.025em | — | local-type-exception |
| assets/services/process/styles.css | 419 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 420 | .proof-lead | line-height | 1.55 | — | local-type-exception |
| assets/services/process/styles.css | 444 | .proof-trigger | font | inherit | — | local-type-exception |
| assets/services/process/styles.css | 474 | .proof-index | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 475 | .proof-index | font-size | 24px | — | local-type-exception |
| assets/services/process/styles.css | 476 | .proof-index | line-height | 1 | — | local-type-exception |
| assets/services/process/styles.css | 485 | .proof-label strong | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/process/styles.css | 486 | .proof-label strong | font-weight | 650 | — | local-type-exception |
| assets/services/process/styles.css | 487 | .proof-label strong | letter-spacing | .09em | — | local-type-exception |
| assets/services/process/styles.css | 494 | .proof-label small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 495 | .proof-label small | line-height | 1.42 | — | local-type-exception |
| assets/services/process/styles.css | 523 | .proof-detail p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 524 | .proof-detail p | line-height | 1.45 | — | local-type-exception |
| assets/services/process/styles.css | 529 | .proof-detail b | font-weight | 650 | — | local-type-exception |
| assets/services/process/styles.css | 536 | .proof-output | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 537 | .proof-output | line-height | 1.48 | — | local-type-exception |
| assets/services/process/styles.css | 561 | .proof-primary | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 562 | .proof-primary | font-weight | 550 | — | local-type-exception |
| assets/services/process/styles.css | 594 | .proof-secondary | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/process/styles.css | 595 | .proof-secondary | font-weight | 550 | — | local-type-exception |
| assets/services/process/styles.css | 624 | .journey-note h3 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 625 | .journey-note h3 | font-weight | 500 | — | local-type-exception |
| assets/services/process/styles.css | 630 | .journey-note h3 b | font-size | clamp(48px, 3.25vw, 58px) | — | local-type-exception |
| assets/services/process/styles.css | 631 | .journey-note h3 b | font-weight | 400 | — | local-type-exception |
| assets/services/process/styles.css | 632 | .journey-note h3 b | line-height | .9 | — | local-type-exception |
| assets/services/process/styles.css | 637 | .journey-note h3 span | font-size | clamp(20px, 1.4vw, 25px) | — | local-type-exception |
| assets/services/process/styles.css | 638 | .journey-note h3 span | font-weight | 600 | — | local-type-exception |
| assets/services/process/styles.css | 639 | .journey-note h3 span | letter-spacing | .03em | — | local-type-exception |
| assets/services/process/styles.css | 645 | .journey-note p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 646 | .journey-note p | line-height | 1.55 | — | local-type-exception |
| assets/services/process/styles.css | 654 | .journey-note small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 655 | .journey-note small | line-height | 1.45 | — | local-type-exception |
| assets/services/process/styles.css | 735 | .opening-copy h1 | font-size | clamp(48px, 6.2vw, 64px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/process/styles.css | 744 | .proof-content h2 | font-size | clamp(48px, 5.4vw, 62px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/process/styles.css | 783 | .opening-copy h1 | font-size | clamp(48px, 14vw, 72px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 807 | .journey-intro h2 | font-size | clamp(54px, 16vw, 76px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 813 | .journey-intro > p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 839 | .journey-mobile-steps b | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 840 | .journey-mobile-steps b | font-size | 24px | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 841 | .journey-mobile-steps b | font-weight | 400 | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 850 | .journey-mobile-steps strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 851 | .journey-mobile-steps strong | letter-spacing | .08em | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 857 | .journey-mobile-steps small | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 858 | .journey-mobile-steps small | line-height | 1.4 | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 882 | .proof-content h2 | font-size | clamp(43px, 12.7vw, 56px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 887 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 902 | .proof-index | font-size | 20px | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 910 | .proof-label strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 915 | .proof-label small, .proof-detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 928 | .proof-output | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 974 | .process-act | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/process/styles.css | 975 | .process-act | font-weight | 650 | — | local-type-exception |
| assets/services/process/styles.css | 976 | .process-act | letter-spacing | .12em | — | local-type-exception |
| assets/services/process/styles.css | 989 | .process-editorial-content h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 990 | .process-editorial-content h2 | font-size | clamp(58px, 4.7vw, 79px) | — | local-type-exception |
| assets/services/process/styles.css | 991 | .process-editorial-content h2 | font-weight | 500 | — | local-type-exception |
| assets/services/process/styles.css | 992 | .process-editorial-content h2 | letter-spacing | -.025em | — | local-type-exception |
| assets/services/process/styles.css | 1004 | .process-editorial-lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 1005 | .process-editorial-lead | line-height | 1.58 | — | local-type-exception |
| assets/services/process/styles.css | 1025 | .process-evidence-list article > b | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 1026 | .process-evidence-list article > b | font-size | 25px | — | local-type-exception |
| assets/services/process/styles.css | 1027 | .process-evidence-list article > b | font-weight | 400 | — | local-type-exception |
| assets/services/process/styles.css | 1036 | .process-evidence-list strong | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/process/styles.css | 1037 | .process-evidence-list strong | font-weight | 650 | — | local-type-exception |
| assets/services/process/styles.css | 1038 | .process-evidence-list strong | letter-spacing | .09em | — | local-type-exception |
| assets/services/process/styles.css | 1044 | .process-evidence-list small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 1045 | .process-evidence-list small | line-height | 1.42 | — | local-type-exception |
| assets/services/process/styles.css | 1052 | .process-stage-output | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 1053 | .process-stage-output | line-height | 1.5 | — | local-type-exception |
| assets/services/process/styles.css | 1166 | .process-editorial-content h2 | font-size | clamp(48px, 5.5vw, 64px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/process/styles.css | 1216 | .process-act | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1225 | .process-editorial-content h2 | font-size | clamp(42px, 11.8vw, 52px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 1230 | .process-editorial-lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1245 | .process-evidence-list article > b | font-size | 21px | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 1249 | .process-evidence-list strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1254 | .process-evidence-list small, .process-stage-output | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1289 | .process-opening-copy h1 | font-size | clamp(74px, 6.15vw, 103px) | — | local-type-exception |
| assets/services/process/styles.css | 1294 | .process-opening-copy p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 1331 | .process-method-intro h2 | font-size | clamp(60px, 5.05vw, 84px) | — | local-type-exception |
| assets/services/process/styles.css | 1378 | .process-proof-content h2 | font-size | clamp(56px, 4.35vw, 73px) | — | local-type-exception |
| assets/services/process/styles.css | 1411 | .process-opening-copy h1 | font-size | clamp(58px, 7.3vw, 78px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/process/styles.css | 1424 | .process-proof-content h2 | font-size | clamp(48px, 5.2vw, 61px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/process/styles.css | 1456 | .process-opening-copy h1 | font-size | clamp(50px, 14.5vw, 68px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 1460 | .process-opening-copy p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1473 | .process-method-intro h2 | font-size | clamp(47px, 13.3vw, 62px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 1487 | .process-proof-content h2 | font-size | clamp(39px, 11.3vw, 50px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 1492 | .process-proof-content .proof-lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1514 | .process-proof-content .proof-output | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 28 | body | font-family | var(--ok-font-body) | — | semantic-token |
| assets/services/social/styles.css | 155 | .site-header nav a | font-weight | 650 | — | local-type-exception |
| assets/services/social/styles.css | 156 | .site-header nav a | letter-spacing | .08em | — | local-type-exception |
| assets/services/social/styles.css | 224 | .opening-copy h1 | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/social/styles.css | 225 | .opening-copy h1 | font-size | clamp(64px, 5.15vw, 86px) | — | local-type-exception |
| assets/services/social/styles.css | 226 | .opening-copy h1 | font-weight | 500 | — | local-type-exception |
| assets/services/social/styles.css | 227 | .opening-copy h1 | letter-spacing | -.035em | — | local-type-exception |
| assets/services/social/styles.css | 239 | .opening-copy p | font-size | var(--ok-type-content-min) | — | semantic-token |
| assets/services/social/styles.css | 240 | .opening-copy p | font-weight | 450 | — | local-type-exception |
| assets/services/social/styles.css | 241 | .opening-copy p | line-height | 1.55 | — | local-type-exception |
| assets/services/social/styles.css | 249 | .opening-scope | font-size | var(--ok-type-label-min) | — | semantic-token |
| assets/services/social/styles.css | 250 | .opening-scope | font-weight | 650 | — | local-type-exception |
| assets/services/social/styles.css | 251 | .opening-scope | letter-spacing | .08em | — | local-type-exception |
| assets/services/social/styles.css | 278 | .outline-cta | font-size | 15px | — | local-type-exception |
| assets/services/social/styles.css | 279 | .outline-cta | font-weight | 550 | — | local-type-exception |
| assets/services/social/styles.css | 310 | .scroll-cue | font-size | 12px | — | local-type-exception |
| assets/services/social/styles.css | 357 | .journey-intro h2 | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/social/styles.css | 358 | .journey-intro h2 | font-size | clamp(58px, 4.9vw, 82px) | — | local-type-exception |
| assets/services/social/styles.css | 359 | .journey-intro h2 | font-weight | 500 | — | local-type-exception |
| assets/services/social/styles.css | 360 | .journey-intro h2 | letter-spacing | .005em | — | local-type-exception |
| assets/services/social/styles.css | 366 | .journey-intro p | font-size | clamp(var(--ok-type-content-min), .96vw, 17px) | — | semantic-token |
| assets/services/social/styles.css | 367 | .journey-intro p | line-height | 1.55 | — | local-type-exception |
| assets/services/social/styles.css | 404 | .proof-content h2 | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/social/styles.css | 405 | .proof-content h2 | font-size | clamp(58px, 4.65vw, 78px) | — | local-type-exception |
| assets/services/social/styles.css | 406 | .proof-content h2 | font-weight | 500 | — | local-type-exception |
| assets/services/social/styles.css | 407 | .proof-content h2 | letter-spacing | -.025em | — | local-type-exception |
| assets/services/social/styles.css | 419 | .proof-lead | font-size | clamp(var(--ok-type-content-min), .88vw, 15px) | — | semantic-token |
| assets/services/social/styles.css | 420 | .proof-lead | line-height | 1.55 | — | local-type-exception |
| assets/services/social/styles.css | 444 | .proof-trigger | font | inherit | — | local-type-exception |
| assets/services/social/styles.css | 474 | .proof-index | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/social/styles.css | 475 | .proof-index | font-size | 24px | — | local-type-exception |
| assets/services/social/styles.css | 476 | .proof-index | line-height | 1 | — | local-type-exception |
| assets/services/social/styles.css | 485 | .proof-label strong | font-size | 12px | — | local-type-exception |
| assets/services/social/styles.css | 486 | .proof-label strong | font-weight | 650 | — | local-type-exception |
| assets/services/social/styles.css | 487 | .proof-label strong | letter-spacing | .09em | — | local-type-exception |
| assets/services/social/styles.css | 494 | .proof-label small | font-size | var(--ok-type-content-min) | — | semantic-token |
| assets/services/social/styles.css | 495 | .proof-label small | line-height | 1.42 | — | local-type-exception |
| assets/services/social/styles.css | 523 | .proof-detail p | font-size | var(--ok-type-content-min) | — | semantic-token |
| assets/services/social/styles.css | 524 | .proof-detail p | line-height | 1.45 | — | local-type-exception |
| assets/services/social/styles.css | 529 | .proof-detail b | font-weight | 650 | — | local-type-exception |
| assets/services/social/styles.css | 536 | .proof-output | font-size | var(--ok-type-content-min) | — | semantic-token |
| assets/services/social/styles.css | 537 | .proof-output | line-height | 1.48 | — | local-type-exception |
| assets/services/social/styles.css | 561 | .proof-primary | font-size | 13px | — | local-type-exception |
| assets/services/social/styles.css | 562 | .proof-primary | font-weight | 550 | — | local-type-exception |
| assets/services/social/styles.css | 594 | .proof-secondary | font-size | 12px | — | local-type-exception |
| assets/services/social/styles.css | 595 | .proof-secondary | font-weight | 550 | — | local-type-exception |
| assets/services/social/styles.css | 624 | .journey-note h3 | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/social/styles.css | 625 | .journey-note h3 | font-weight | 500 | — | local-type-exception |
| assets/services/social/styles.css | 630 | .journey-note h3 b | font-size | clamp(48px, 3.25vw, 58px) | — | local-type-exception |
| assets/services/social/styles.css | 631 | .journey-note h3 b | font-weight | 400 | — | local-type-exception |
| assets/services/social/styles.css | 632 | .journey-note h3 b | line-height | .9 | — | local-type-exception |
| assets/services/social/styles.css | 637 | .journey-note h3 span | font-size | clamp(20px, 1.4vw, 25px) | — | local-type-exception |
| assets/services/social/styles.css | 638 | .journey-note h3 span | font-weight | 600 | — | local-type-exception |
| assets/services/social/styles.css | 639 | .journey-note h3 span | letter-spacing | .03em | — | local-type-exception |
| assets/services/social/styles.css | 645 | .journey-note p | font-size | clamp(var(--ok-type-content-min), .85vw, 15px) | — | semantic-token |
| assets/services/social/styles.css | 646 | .journey-note p | line-height | 1.55 | — | local-type-exception |
| assets/services/social/styles.css | 654 | .journey-note small | font-size | var(--ok-type-content-min) | — | semantic-token |
| assets/services/social/styles.css | 655 | .journey-note small | line-height | 1.45 | — | local-type-exception |
| assets/services/social/styles.css | 698 | .social-opening .opening-copy h1 | font-size | clamp(62px, 5vw, 84px) | — | local-type-exception |
| assets/services/social/styles.css | 778 | .social-terms | font-size | var(--ok-type-content-min) | — | semantic-token |
| assets/services/social/styles.css | 779 | .social-terms | line-height | 1.45 | — | local-type-exception |
| assets/services/social/styles.css | 831 | .opening-copy h1 | font-size | clamp(48px, 6.2vw, 64px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/social/styles.css | 840 | .proof-content h2 | font-size | clamp(48px, 5.4vw, 62px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/social/styles.css | 879 | .opening-copy h1 | font-size | clamp(48px, 14vw, 72px) | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 906 | .journey-intro h2 | font-size | clamp(54px, 16vw, 76px) | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 912 | .journey-intro > p | font-size | var(--ok-type-content-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 940 | .journey-mobile-steps b | font-family | var(--ok-font-display) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 941 | .journey-mobile-steps b | font-size | 24px | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 942 | .journey-mobile-steps b | font-weight | 400 | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 951 | .journey-mobile-steps strong | font-size | var(--ok-type-label-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 952 | .journey-mobile-steps strong | letter-spacing | .08em | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 958 | .journey-mobile-steps small | font-size | var(--ok-type-content-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 959 | .journey-mobile-steps small | line-height | 1.3 | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 984 | .proof-content h2 | font-size | clamp(38px, 11.6vw, 50px) | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 989 | .proof-lead | font-size | var(--ok-type-content-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 990 | .proof-lead | line-height | 1.3 | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 1005 | .proof-index | font-size | 20px | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 1013 | .proof-label strong | font-size | var(--ok-type-label-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 1018 | .proof-label small, .proof-detail p | font-size | var(--ok-type-content-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 1019 | .proof-label small, .proof-detail p | line-height | 1.3 | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 1034 | .proof-output | font-size | var(--ok-type-content-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 1035 | .proof-output | line-height | 1.25 | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 1040 | .social-terms | font-size | var(--ok-type-content-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 1041 | .social-terms | line-height | 1.25 | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 1070 | .social-signals .proof-content h2 | font-size | 36px | @media (max-width: 820px) and (max-height: 740px) | local-type-exception |
| assets/services/social/styles.css | 1075 | .social-signals .proof-lead | line-height | 1.25 | @media (max-width: 820px) and (max-height: 740px) | local-type-exception |
| assets/services/web/styles.css | 28 | body | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/services/web/styles.css | 155 | .site-header nav a | font-weight | 650 | — | local-type-exception |
| assets/services/web/styles.css | 156 | .site-header nav a | letter-spacing | .08em | — | local-type-exception |
| assets/services/web/styles.css | 224 | .opening-copy h1 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/web/styles.css | 225 | .opening-copy h1 | font-size | clamp(64px, 5.15vw, 86px) | — | local-type-exception |
| assets/services/web/styles.css | 226 | .opening-copy h1 | font-weight | 500 | — | local-type-exception |
| assets/services/web/styles.css | 227 | .opening-copy h1 | letter-spacing | -.035em | — | local-type-exception |
| assets/services/web/styles.css | 239 | .opening-copy p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 240 | .opening-copy p | font-weight | 450 | — | local-type-exception |
| assets/services/web/styles.css | 241 | .opening-copy p | line-height | 1.55 | — | local-type-exception |
| assets/services/web/styles.css | 249 | .opening-scope | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/web/styles.css | 250 | .opening-scope | font-weight | 650 | — | local-type-exception |
| assets/services/web/styles.css | 251 | .opening-scope | letter-spacing | .08em | — | local-type-exception |
| assets/services/web/styles.css | 278 | .outline-cta | font-size | 15px | — | local-type-exception |
| assets/services/web/styles.css | 279 | .outline-cta | font-weight | 550 | — | local-type-exception |
| assets/services/web/styles.css | 310 | .scroll-cue | font-size | 12px | — | local-type-exception |
| assets/services/web/styles.css | 357 | .journey-intro h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/web/styles.css | 358 | .journey-intro h2 | font-size | clamp(58px, 4.9vw, 82px) | — | local-type-exception |
| assets/services/web/styles.css | 359 | .journey-intro h2 | font-weight | 500 | — | local-type-exception |
| assets/services/web/styles.css | 360 | .journey-intro h2 | letter-spacing | .005em | — | local-type-exception |
| assets/services/web/styles.css | 366 | .journey-intro p | font-size | clamp(14px, .96vw, 17px) | — | local-type-exception |
| assets/services/web/styles.css | 367 | .journey-intro p | line-height | 1.55 | — | local-type-exception |
| assets/services/web/styles.css | 404 | .proof-content h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/web/styles.css | 405 | .proof-content h2 | font-size | clamp(58px, 4.65vw, 78px) | — | local-type-exception |
| assets/services/web/styles.css | 406 | .proof-content h2 | font-weight | 500 | — | local-type-exception |
| assets/services/web/styles.css | 407 | .proof-content h2 | letter-spacing | -.025em | — | local-type-exception |
| assets/services/web/styles.css | 419 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 420 | .proof-lead | line-height | 1.55 | — | local-type-exception |
| assets/services/web/styles.css | 444 | .proof-trigger | font | inherit | — | local-type-exception |
| assets/services/web/styles.css | 474 | .proof-index | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/web/styles.css | 475 | .proof-index | font-size | 24px | — | local-type-exception |
| assets/services/web/styles.css | 476 | .proof-index | line-height | 1 | — | local-type-exception |
| assets/services/web/styles.css | 485 | .proof-label strong | font-size | 12px | — | local-type-exception |
| assets/services/web/styles.css | 486 | .proof-label strong | font-weight | 650 | — | local-type-exception |
| assets/services/web/styles.css | 487 | .proof-label strong | letter-spacing | .09em | — | local-type-exception |
| assets/services/web/styles.css | 494 | .proof-label small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 495 | .proof-label small | line-height | 1.42 | — | local-type-exception |
| assets/services/web/styles.css | 523 | .proof-detail p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 524 | .proof-detail p | line-height | 1.45 | — | local-type-exception |
| assets/services/web/styles.css | 529 | .proof-detail b | font-weight | 650 | — | local-type-exception |
| assets/services/web/styles.css | 536 | .proof-output | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 537 | .proof-output | line-height | 1.48 | — | local-type-exception |
| assets/services/web/styles.css | 561 | .proof-primary | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 562 | .proof-primary | font-weight | 550 | — | local-type-exception |
| assets/services/web/styles.css | 594 | .proof-secondary | font-size | 12px | — | local-type-exception |
| assets/services/web/styles.css | 595 | .proof-secondary | font-weight | 550 | — | local-type-exception |
| assets/services/web/styles.css | 624 | .journey-note h3 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/web/styles.css | 625 | .journey-note h3 | font-weight | 500 | — | local-type-exception |
| assets/services/web/styles.css | 630 | .journey-note h3 b | font-size | clamp(48px, 3.25vw, 58px) | — | local-type-exception |
| assets/services/web/styles.css | 631 | .journey-note h3 b | font-weight | 400 | — | local-type-exception |
| assets/services/web/styles.css | 632 | .journey-note h3 b | line-height | .9 | — | local-type-exception |
| assets/services/web/styles.css | 637 | .journey-note h3 span | font-size | clamp(20px, 1.4vw, 25px) | — | local-type-exception |
| assets/services/web/styles.css | 638 | .journey-note h3 span | font-weight | 600 | — | local-type-exception |
| assets/services/web/styles.css | 639 | .journey-note h3 span | letter-spacing | .03em | — | local-type-exception |
| assets/services/web/styles.css | 645 | .journey-note p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 646 | .journey-note p | line-height | 1.55 | — | local-type-exception |
| assets/services/web/styles.css | 654 | .journey-note small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 655 | .journey-note small | line-height | 1.45 | — | local-type-exception |
| assets/services/web/styles.css | 696 | .proof-content h2 | font-size | clamp(64px, 5.1vw, 86px) | @media (min-width: 1400px) and (min-height: 850px) | local-type-exception |
| assets/services/web/styles.css | 743 | .opening-copy h1 | font-size | clamp(48px, 6.2vw, 64px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/web/styles.css | 752 | .proof-content h2 | font-size | clamp(48px, 5.4vw, 62px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/web/styles.css | 791 | .opening-copy h1 | font-size | clamp(48px, 14vw, 72px) | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 817 | .journey-intro h2 | font-size | clamp(54px, 16vw, 76px) | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 823 | .journey-intro > p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 849 | .journey-mobile-steps b | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 850 | .journey-mobile-steps b | font-size | 24px | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 851 | .journey-mobile-steps b | font-weight | 400 | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 860 | .journey-mobile-steps strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 861 | .journey-mobile-steps strong | letter-spacing | .08em | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 867 | .journey-mobile-steps small | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 868 | .journey-mobile-steps small | line-height | 1.4 | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 892 | .proof-content h2 | font-size | clamp(43px, 12.7vw, 56px) | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 897 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 912 | .proof-index | font-size | 20px | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 920 | .proof-label strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 925 | .proof-label small, .proof-detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 938 | .proof-output | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 970 | .section-kicker | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/web/styles.css | 971 | .section-kicker | font-weight | 700 | — | local-type-exception |
| assets/services/web/styles.css | 972 | .section-kicker | letter-spacing | .14em | — | local-type-exception |
| assets/services/web/styles.css | 990 | .web-service .opening-copy h1 | font-size | clamp(68px, 5.55vw, 94px) | — | local-type-exception |
| assets/services/web/styles.css | 1035 | .web-service .journey-intro h2 | font-size | clamp(56px, 4.55vw, 78px) | — | local-type-exception |
| assets/services/web/styles.css | 1091 | .web-service .proof-content h2 | font-size | clamp(56px, 4.3vw, 74px) | — | local-type-exception |
| assets/services/web/styles.css | 1100 | .web-service .opening-copy h1 | font-size | clamp(78px, 6.1vw, 108px) | @media (min-width: 1800px) and (min-height: 1000px) | local-type-exception |
| assets/services/web/styles.css | 1104 | .web-service :is(.journey-intro, .proof-content) h2 | font-size | clamp(64px, 4.9vw, 88px) | @media (min-width: 1800px) and (min-height: 1000px) | local-type-exception |
| assets/services/web/styles.css | 1168 | .web-service .opening-copy h1 | font-size | clamp(46px, 13vw, 64px) | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 1172 | .web-service .opening-scope | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 1201 | .web-service .proof-content h2 | font-size | clamp(39px, 11.8vw, 52px) | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 1206 | .web-service .section-kicker | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/visual-direction-scenes.v20260730-2.css | 102 | .home-intro__eyebrow, .decision-guide__eyebrow | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/visual-direction-scenes.v20260730-2.css | 103 | .home-intro__eyebrow, .decision-guide__eyebrow | font-weight | 600 | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 104 | .home-intro__eyebrow, .decision-guide__eyebrow | letter-spacing | .2em | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 115 | .home-intro h2, .decision-guide h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/visual-direction-scenes.v20260730-2.css | 116 | .home-intro h2, .decision-guide h2 | font-weight | 500 | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 118 | .home-intro h2, .decision-guide h2 | letter-spacing | -.055em | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 124 | .home-intro h2 | font-size | clamp(4.25rem, 8.35vw, 8.65rem) | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 125 | .home-intro h2 | line-height | .82 | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 191 | .decision-guide h2 | font-size | clamp(4rem, 7.35vw, 7.65rem) | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 192 | .decision-guide h2 | line-height | var(--ok-leading-display, 1.2) | — | semantic-token |
| assets/visual-direction-scenes.v20260730-2.css | 204 | .decision-guide__faq h2 | font-size | clamp(3rem, 4.8vw, 5rem) | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 205 | .decision-guide__faq h2 | line-height | var(--ok-leading-display, 1.21) | — | semantic-token |
| assets/visual-direction-scenes.v20260730-2.css | 270 | .home-intro h2 | font-size | clamp(3.55rem, 16vw, 5.4rem) | @media (max-width: 760px) | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 275 | .decision-guide h2 | font-size | clamp(3.35rem, 15.2vw, 5rem) | @media (max-width: 760px) | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 280 | .decision-guide__faq h2 | font-size | clamp(2.75rem, 12.5vw, 4rem) | @media (max-width: 760px) | local-type-exception |

## Lokalne przejęcia wspólnych komponentów i geometrii scen

| Plik | Linia | Selektor | Właściwość | Wartość | Kontekst |
| --- | --- | --- | --- | --- | --- |
| assets/legal-pages.css | 114 | .legal-header nav | display | flex | — |
| assets/legal-pages.css | 120 | .legal-header nav a | position | relative | — |
| assets/legal-pages.css | 121 | .legal-header nav a | min-height | 44px | — |
| assets/legal-pages.css | 122 | .legal-header nav a | display | grid | — |
| assets/legal-pages.css | 125 | .legal-header nav a | font-size | var(--ok-type-label-min, 12px) | — |
| assets/legal-pages.css | 134 | .legal-header nav a::after | position | absolute | — |
| assets/legal-pages.css | 138 | .legal-header nav a::after | height | 1px | — |
| assets/legal-pages.css | 517 | .legal-header nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 1140px) |
| assets/legal-pages.css | 554 | .legal-header nav a:nth-child(2) | display | none | @media (max-width: 640px) |
| assets/legal-pages.css | 622 | .error-page .legal-header nav a | display | grid | @media (max-width: 640px) |
| assets/legal-pages.css | 626 | .error-page .legal-header nav a:nth-child(2) | display | none | @media (max-width: 640px) |
| assets/page-contact.css | 78 | /* ---------- header ---------- */ .site-header | position | absolute | — |
| assets/page-contact.css | 82 | /* ---------- header ---------- */ .site-header | z-index | 20 | — |
| assets/page-contact.css | 83 | /* ---------- header ---------- */ .site-header | display | flex | — |
| assets/page-contact.css | 94 | .site-nav | display | flex | — |
| assets/page-contact.css | 99 | .site-nav a | position | relative | — |
| assets/page-contact.css | 102 | .site-nav a | font-size | 12px | — |
| assets/page-contact.css | 111 | .site-nav a::after | position | absolute | — |
| assets/page-contact.css | 115 | .site-nav a::after | height | 2px | — |
| assets/page-contact.css | 639 | /* ---------- scena ---------- */ .scene | position | absolute | — |
| assets/page-contact.css | 644 | /* ---------- scena ---------- */ .scene | z-index | 0 | — |
| assets/page-contact.css | 646 | /* ---------- scena ---------- */ .scene | overflow | hidden | — |
| assets/page-contact.css | 649 | .scene img | position | absolute | — |
| assets/page-contact.css | 652 | .scene img | height | 100% | — |
| assets/page-contact.css | 654 | .scene img | position | 50% 62% | — |
| assets/page-contact.css | 701 | .site-header | position | static | — |
| assets/page-contact.css | 708 | .scene | position | relative | — |
| assets/page-contact.css | 710 | .scene | min-height | 54svh | — |
| assets/page-contact.css | 728 | .site-nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 640px) |
| assets/page-contact.css | 729 | .site-nav a:nth-child(2) | display | none | @media (max-width: 640px) |
| assets/page-home.css | 107 | .topbar | position | absolute | — |
| assets/page-home.css | 108 | .topbar | z-index | 20 | — |
| assets/page-home.css | 112 | .topbar | height | clamp(5.2rem, 10vh, 7rem) | — |
| assets/page-home.css | 113 | .topbar | display | flex | — |
| assets/page-home.css | 126 | .nav | display | flex | — |
| assets/page-home.css | 132 | .nav a | position | relative | — |
| assets/page-home.css | 136 | .nav a | font-size | var(--ok-type-label-min, 12px) | — |
| assets/page-home.css | 139 | .nav a | min-height | 44px | — |
| assets/page-home.css | 140 | .nav a | display | inline-flex | — |
| assets/page-home.css | 148 | .nav a::after | position | absolute | — |
| assets/page-home.css | 152 | .nav a::after | height | 1px | — |
| assets/page-home.css | 189 | .scene-label | display | flex | — |
| assets/page-home.css | 199 | .scene-label::before | height | 1px | — |
| assets/page-home.css | 341 | .scene-picture | position | relative | — |
| assets/page-home.css | 342 | .scene-picture | z-index | 1 | — |
| assets/page-home.css | 343 | .scene-picture | display | block | — |
| assets/page-home.css | 345 | .scene-picture | height | 100% | — |
| assets/page-home.css | 562 | .topbar | height | 6.3rem | @media (max-width: 1024px) and (min-width: 641px) |
| assets/page-home.css | 573 | .nav a | min-height | 44px | @media (max-width: 1024px) and (min-width: 641px) |
| assets/page-home.css | 574 | .nav a | display | inline-flex | @media (max-width: 1024px) and (min-width: 641px) |
| assets/page-home.css | 576 | .nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 1024px) and (min-width: 641px) |
| assets/page-home.css | 657 | .topbar | height | 5rem | @media (max-width: 640px) |
| assets/page-home.css | 664 | .nav a:nth-child(2) | display | none | @media (max-width: 640px) |
| assets/page-home.css | 666 | .nav a | min-height | 44px | @media (max-width: 640px) |
| assets/page-home.css | 667 | .nav a | display | inline-flex | @media (max-width: 640px) |
| assets/page-home.css | 669 | .nav a | font-size | .75rem | @media (max-width: 640px) |
| assets/page-home.css | 708 | .topbar | height | 4.5rem | @media (max-width: 640px) and (max-height: 720px) |
| assets/page-home.css | 1073 | .topbar | height | clamp(7rem, 9vh, 8.5rem) | — |
| assets/page-home.css | 1085 | .nav a | font-size | clamp(.78rem, .55vw, .88rem) | — |
| assets/page-menu.css | 117 | /* ---------- header ---------- */ .site-header | height | var(--header-height) | — |
| assets/page-menu.css | 119 | /* ---------- header ---------- */ .site-header | display | flex | — |
| assets/page-menu.css | 138 | .header-nav | display | flex | — |
| assets/page-menu.css | 144 | .header-nav a | position | relative | — |
| assets/page-menu.css | 145 | .header-nav a | min-height | 44px | — |
| assets/page-menu.css | 146 | .header-nav a | display | grid | — |
| assets/page-menu.css | 148 | .header-nav a | font-size | 12px | — |
| assets/page-menu.css | 158 | .header-nav a::after | position | absolute | — |
| assets/page-menu.css | 162 | .header-nav a::after | height | 1px | — |
| assets/page-menu.css | 538 | .header-nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 640px) |
| assets/page-menu.css | 539 | .header-nav a:nth-child(2) | display | none | @media (max-width: 640px) |
| assets/services/about/styles.css | 66 | .site-header | position | fixed | — |
| assets/services/about/styles.css | 67 | .site-header | z-index | 50 | — |
| assets/services/about/styles.css | 71 | .site-header | height | var(--header-h) | — |
| assets/services/about/styles.css | 73 | .site-header | display | flex | — |
| assets/services/about/styles.css | 82 | .site-header::after | position | absolute | — |
| assets/services/about/styles.css | 86 | .site-header::after | height | 1px | — |
| assets/services/about/styles.css | 114 | .site-header nav | display | flex | — |
| assets/services/about/styles.css | 120 | .site-header nav a | position | relative | — |
| assets/services/about/styles.css | 122 | .site-header nav a | min-height | 44px | — |
| assets/services/about/styles.css | 124 | .site-header nav a | display | inline-flex | — |
| assets/services/about/styles.css | 134 | .site-header nav a::after | position | absolute | — |
| assets/services/about/styles.css | 138 | .site-header nav a::after | height | 1px | — |
| assets/services/about/styles.css | 168 | .scene | position | relative | — |
| assets/services/about/styles.css | 169 | .scene | z-index | 0 | — |
| assets/services/about/styles.css | 171 | .scene | overflow | hidden | — |
| assets/services/about/styles.css | 181 | .scene-art | position | absolute | — |
| assets/services/about/styles.css | 182 | .scene-art | z-index | 1 | — |
| assets/services/about/styles.css | 185 | .scene-art | height | 100% | — |
| assets/services/about/styles.css | 193 | .scene::before | position | absolute | — |
| assets/services/about/styles.css | 194 | .scene::before | z-index | 2 | — |
| assets/services/about/styles.css | 216 | /* Responsive safety may add an empty atelier plate below this semantic image. * It contains no duplicate tree, so the collision feather cannot ghost the * artwork edge. */ .scene-inner | position | absolute | — |
| assets/services/about/styles.css | 217 | /* Responsive safety may add an empty atelier plate below this semantic image. * It contains no duplicate tree, so the collision feather cannot ghost the * artwork edge. */ .scene-inner | z-index | 3 | — |
| assets/services/about/styles.css | 219 | /* Responsive safety may add an empty atelier plate below this semantic image. * It contains no duplicate tree, so the collision feather cannot ghost the * artwork edge. */ .scene-inner | overflow | visible | — |
| assets/services/about/styles.css | 582 | .scene-02 h2 | font-size | clamp(54px, 4.25vw, 72px) | — |
| assets/services/about/styles.css | 590 | .scene-03 h2 | font-size | clamp(54px, 4.35vw, 74px) | — |
| assets/services/about/styles.css | 611 | .scene-04 h2 | font-size | clamp(48px, 3.85vw, 66px) | — |
| assets/services/about/styles.css | 617 | .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | — |
| assets/services/about/styles.css | 718 | .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | — |
| assets/services/about/styles.css | 793 | .scroll-cue | position | absolute | — |
| assets/services/about/styles.css | 794 | .scroll-cue | z-index | 13 | — |
| assets/services/about/styles.css | 797 | .scroll-cue | display | flex | — |
| assets/services/about/styles.css | 801 | .scroll-cue | font-size | var(--ok-type-label-min, 12px) | — |
| assets/services/about/styles.css | 809 | .scroll-cue span | height | 28px | — |
| assets/services/about/styles.css | 810 | .scroll-cue span | display | grid | — |
| assets/services/about/styles.css | 818 | .scroll-cue svg | height | 15px | — |
| assets/services/about/styles.css | 865 | .scene-04 .accordion-trigger | min-height | 44px | @media (max-height: 800px) and (min-width: 901px) |
| assets/services/about/styles.css | 910 | .facts .row-content > span, .model-points .row-content > span, .scene-04 .lead, .accordion-label small, .accordion-detail p, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (max-height: 800px) and (min-width: 901px) |
| assets/services/about/styles.css | 933 | .scene-02 .portrait-frame | height | 68vh | @media (max-height: 800px) and (min-width: 1101px) |
| assets/services/about/styles.css | 941 | .scene-02 .facts li | min-height | 78px | @media (max-height: 800px) and (min-width: 1101px) |
| assets/services/about/styles.css | 953 | .scene-03 .model-points li | min-height | 68px | @media (max-height: 800px) and (min-width: 1101px) |
| assets/services/about/styles.css | 995 | h2, .scene-03 h2 | font-size | clamp(48px, 5.4vw, 58px) | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 1000 | .scene-02 h2, .scene-04 h2 | font-size | clamp(43px, 4.8vw, 51px) | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 1006 | .lead, .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 1034 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 1051 | .scene-01 .mobile-details, .tablet-details | display | block | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 1056 | .scene-02 .facts, .scene-03 .model-points | display | none | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 1119 | .scene::before | z-index | -2 | @media (max-width: 900px) |
| assets/services/about/styles.css | 1135 | .scene-01 .scene-art | position | 68% center | @media (max-width: 900px) |
| assets/services/about/styles.css | 1139 | .scene-02 .scene-art | position | 34% center | @media (max-width: 900px) |
| assets/services/about/styles.css | 1143 | .scene-03 .scene-art | position | 71% center | @media (max-width: 900px) |
| assets/services/about/styles.css | 1147 | .scene-04 .scene-art | position | 76% center | @media (max-width: 900px) |
| assets/services/about/styles.css | 1188 | h2, .scene-02 h2, .scene-03 h2, .scene-04 h2 | font-size | clamp(38px, 10.6vw, 45px) | @media (max-width: 900px) |
| assets/services/about/styles.css | 1194 | .lead, .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) |
| assets/services/about/styles.css | 1195 | .lead, .scene-04 .lead | height | 1.48 | @media (max-width: 900px) |
| assets/services/about/styles.css | 1252 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) |
| assets/services/about/styles.css | 1253 | .result, .scene-04 .result | height | 1.45 | @media (max-width: 900px) |
| assets/services/about/styles.css | 1429 | .scroll-cue | display | none | @media (max-width: 900px) |
| assets/services/about/styles.css | 1469 | .about-page .scene-01 h1 | font-size | clamp(42px, 4.4vw, 46px) | @media (min-width: 821px) and (max-height: 700px) |
| assets/services/about/styles.css | 1473 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | clamp(43px, 4.7vw, 49px) | @media (min-width: 821px) and (max-height: 700px) |
| assets/services/about/styles.css | 1499 | .about-page .scene-03 .model-points li | min-height | 64px | @media (min-width: 821px) and (max-height: 700px) |
| assets/services/about/styles.css | 1506 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | clamp(39px, 4.1vw, 43px) | @media (min-width: 821px) and (max-height: 620px) |
| assets/services/about/styles.css | 1527 | .about-page .scene-04 .accordion-trigger | min-height | 44px | @media (min-width: 821px) and (max-height: 620px) |
| assets/services/about/styles.css | 1531 | .about-page .scene-03 .model-points li | min-height | 56px | @media (min-width: 821px) and (max-height: 620px) |
| assets/services/about/styles.css | 1537 | .scene-04 :is(.lead, .proof-statement, .result) | display | none | @media (max-width: 640px) and (max-height: 700px) |
| assets/services/about/styles.css | 1593 | h2, .scene-02 h2, .scene-03 h2, .scene-04 h2 | font-size | 50px | @media (min-width: 600px) and (max-width: 900px) |
| assets/services/about/styles.css | 1598 | .lead, .scene-04 .lead | font-size | 14px | @media (min-width: 600px) and (max-width: 900px) |
| assets/services/about/styles.css | 1626 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 600px) and (max-width: 900px) |
| assets/services/about/styles.css | 1687 | .scene-02 .tablet-details, .scene-03 .tablet-details | display | block | @media (max-width: 900px) |
| assets/services/about/styles.css | 1692 | .scene-02 .facts, .scene-03 .model-points | display | none | @media (max-width: 900px) |
| assets/services/about/styles.css | 1702 | .scene-04 .lead | height | 1.42 | @media (max-width: 900px) |
| assets/services/about/styles.css | 1710 | .scene-04 .accordion-trigger | min-height | 46px | @media (max-width: 900px) |
| assets/services/about/styles.css | 1738 | .scene-02 .portrait-frame | height | 72vh | @media (min-width: 850px) and (max-width: 900px) and (max-height: 800px) |
| assets/services/about/styles.css | 1752 | .scene-02 h2 | font-size | clamp(34px, 9.5vw, 38px) | @media (max-width: 599px) |
| assets/services/about/styles.css | 1756 | .scene-02 .lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 599px) |
| assets/services/about/styles.css | 1757 | .scene-02 .lead | height | 1.42 | @media (max-width: 599px) |
| assets/services/about/styles.css | 1767 | .scene-02 .facts li | min-height | 72px | @media (max-width: 599px) |
| assets/services/about/styles.css | 1773 | .scene-02 .facts strong | font-size | 14px | @media (max-width: 599px) |
| assets/services/about/styles.css | 1777 | .scene-02 .portrait-frame | z-index | 10 | @media (max-width: 599px) |
| assets/services/about/styles.css | 1781 | .scene-02 .portrait-frame | height | 176px | @media (max-width: 599px) |
| assets/services/about/styles.css | 1804 | .scene-02 .portrait-frame | height | 150px | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1817 | .scene-01 .chips, .scene-02 .lead, .scene-02 .result, .scene-03 .result | display | none | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1822 | .scene-02 .kicker, :is(.scene-02, .scene-03) .mobile-details details:first-child > p:not(.mobile-context) | display | none | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1826 | :is(.scene-02, .scene-03) .mobile-details .mobile-context | display | block | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1831 | .scene-01 h1, .scene-03 h2 | font-size | clamp(38px, 11.5vw, 44px) | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1835 | .scene-02 h2 | font-size | 31px | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1841 | .scene-01 .lead, .scene-03 .lead | height | 1.35 | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1882 | .scene-04 .accordion-trigger | min-height | 44px | @media (max-width: 640px) |
| assets/services/about/styles.css | 1920 | .about-page .scene-02 .portrait-frame | height | 76vh | — |
| assets/services/about/styles.css | 1924 | .about-page .scene-01 h1 | font-size | 46px | — |
| assets/services/about/styles.css | 1928 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | 39px | — |
| assets/services/campaign/styles.css | 66 | .story-stage | position | sticky | — |
| assets/services/campaign/styles.css | 69 | .story-stage | height | 100svh | — |
| assets/services/campaign/styles.css | 70 | .story-stage | min-height | 680px | — |
| assets/services/campaign/styles.css | 71 | .story-stage | overflow | hidden | — |
| assets/services/campaign/styles.css | 78 | .campaign-frame | position | absolute | — |
| assets/services/campaign/styles.css | 81 | .campaign-frame | height | 100svh | — |
| assets/services/campaign/styles.css | 82 | .campaign-frame | min-height | 680px | — |
| assets/services/campaign/styles.css | 83 | .campaign-frame | overflow | hidden | — |
| assets/services/campaign/styles.css | 119 | .site-header | position | absolute | — |
| assets/services/campaign/styles.css | 120 | .site-header | z-index | 20 | — |
| assets/services/campaign/styles.css | 124 | .site-header | height | clamp(112px, 14.5vh, 136px) | — |
| assets/services/campaign/styles.css | 126 | .site-header | display | flex | — |
| assets/services/campaign/styles.css | 146 | .site-header nav | display | flex | — |
| assets/services/campaign/styles.css | 151 | .site-header nav a | position | relative | — |
| assets/services/campaign/styles.css | 152 | .site-header nav a | min-height | 44px | — |
| assets/services/campaign/styles.css | 153 | .site-header nav a | display | grid | — |
| assets/services/campaign/styles.css | 162 | .site-header nav a::after | position | absolute | — |
| assets/services/campaign/styles.css | 166 | .site-header nav a::after | height | 1px | — |
| assets/services/campaign/styles.css | 303 | .scroll-cue | position | absolute | — |
| assets/services/campaign/styles.css | 304 | .scroll-cue | z-index | 10 | — |
| assets/services/campaign/styles.css | 307 | .scroll-cue | display | flex | — |
| assets/services/campaign/styles.css | 310 | .scroll-cue | font-size | 12px | — |
| assets/services/campaign/styles.css | 721 | .site-header | height | 84px | @media (max-width: 1024px) |
| assets/services/campaign/styles.css | 767 | .story-stage, .campaign-frame | min-height | 720px | @media (max-width: 820px) |
| assets/services/campaign/styles.css | 775 | .site-header nav a:nth-child(2) | display | none | @media (max-width: 820px) |
| assets/services/diagnosis/styles.css | 58 | .diagnosis-story, .story-stage | position | relative | — |
| assets/services/diagnosis/styles.css | 60 | .diagnosis-story, .story-stage | height | 100svh | — |
| assets/services/diagnosis/styles.css | 64 | .story-stage | overflow | hidden | — |
| assets/services/diagnosis/styles.css | 70 | .diagnosis-frame | position | absolute | — |
| assets/services/diagnosis/styles.css | 71 | .diagnosis-frame | z-index | 1 | — |
| assets/services/diagnosis/styles.css | 74 | .diagnosis-frame | height | 100% | — |
| assets/services/diagnosis/styles.css | 75 | .diagnosis-frame | overflow | hidden | — |
| assets/services/diagnosis/styles.css | 87 | .diagnosis-frame.is-active | z-index | 2 | — |
| assets/services/diagnosis/styles.css | 120 | .site-header | position | absolute | — |
| assets/services/diagnosis/styles.css | 121 | .site-header | z-index | 20 | — |
| assets/services/diagnosis/styles.css | 125 | .site-header | height | clamp(112px, 14.5vh, 136px) | — |
| assets/services/diagnosis/styles.css | 127 | .site-header | display | flex | — |
| assets/services/diagnosis/styles.css | 141 | .site-header nav | display | flex | — |
| assets/services/diagnosis/styles.css | 145 | .site-header nav a | position | relative | — |
| assets/services/diagnosis/styles.css | 146 | .site-header nav a | min-height | 44px | — |
| assets/services/diagnosis/styles.css | 147 | .site-header nav a | display | grid | — |
| assets/services/diagnosis/styles.css | 149 | .site-header nav a | font-size | var(--ok-type-label) | — |
| assets/services/diagnosis/styles.css | 156 | .site-header nav a::after | position | absolute | — |
| assets/services/diagnosis/styles.css | 160 | .site-header nav a::after | height | 1px | — |
| assets/services/diagnosis/styles.css | 626 | .site-header | height | 82px | @media (max-width:820px) |
| assets/services/diagnosis/styles.css | 630 | .site-header nav a | font-size | var(--ok-type-label-min) | @media (max-width:820px) |
| assets/services/diagnosis/styles.css | 631 | .site-header nav a:nth-child(2) | display | none | @media (max-width:820px) |
| assets/services/process/styles.css | 66 | .story-stage | position | sticky | — |
| assets/services/process/styles.css | 69 | .story-stage | height | 100svh | — |
| assets/services/process/styles.css | 70 | .story-stage | min-height | 680px | — |
| assets/services/process/styles.css | 71 | .story-stage | overflow | hidden | — |
| assets/services/process/styles.css | 78 | .campaign-frame | position | absolute | — |
| assets/services/process/styles.css | 81 | .campaign-frame | height | 100svh | — |
| assets/services/process/styles.css | 82 | .campaign-frame | min-height | 680px | — |
| assets/services/process/styles.css | 83 | .campaign-frame | overflow | hidden | — |
| assets/services/process/styles.css | 119 | .site-header | position | absolute | — |
| assets/services/process/styles.css | 120 | .site-header | z-index | 20 | — |
| assets/services/process/styles.css | 124 | .site-header | height | clamp(112px, 14.5vh, 136px) | — |
| assets/services/process/styles.css | 126 | .site-header | display | flex | — |
| assets/services/process/styles.css | 146 | .site-header nav | display | flex | — |
| assets/services/process/styles.css | 151 | .site-header nav a | position | relative | — |
| assets/services/process/styles.css | 152 | .site-header nav a | min-height | 44px | — |
| assets/services/process/styles.css | 153 | .site-header nav a | display | grid | — |
| assets/services/process/styles.css | 162 | .site-header nav a::after | position | absolute | — |
| assets/services/process/styles.css | 166 | .site-header nav a::after | height | 1px | — |
| assets/services/process/styles.css | 303 | .scroll-cue | position | absolute | — |
| assets/services/process/styles.css | 304 | .scroll-cue | z-index | 10 | — |
| assets/services/process/styles.css | 307 | .scroll-cue | display | flex | — |
| assets/services/process/styles.css | 310 | .scroll-cue | font-size | 12px | — |
| assets/services/process/styles.css | 721 | .site-header | height | 84px | @media (max-width: 1024px) |
| assets/services/process/styles.css | 761 | .story-stage, .campaign-frame | min-height | 720px | @media (max-width: 820px) |
| assets/services/process/styles.css | 769 | .site-header nav a:nth-child(2) | display | none | @media (max-width: 820px) |
| assets/services/social/styles.css | 66 | .story-stage | position | sticky | — |
| assets/services/social/styles.css | 69 | .story-stage | height | 100svh | — |
| assets/services/social/styles.css | 70 | .story-stage | min-height | 680px | — |
| assets/services/social/styles.css | 71 | .story-stage | overflow | hidden | — |
| assets/services/social/styles.css | 78 | .social-frame | position | absolute | — |
| assets/services/social/styles.css | 81 | .social-frame | height | 100svh | — |
| assets/services/social/styles.css | 82 | .social-frame | min-height | 680px | — |
| assets/services/social/styles.css | 83 | .social-frame | overflow | hidden | — |
| assets/services/social/styles.css | 119 | .site-header | position | absolute | — |
| assets/services/social/styles.css | 120 | .site-header | z-index | 20 | — |
| assets/services/social/styles.css | 124 | .site-header | height | clamp(112px, 14.5vh, 136px) | — |
| assets/services/social/styles.css | 126 | .site-header | display | flex | — |
| assets/services/social/styles.css | 146 | .site-header nav | display | flex | — |
| assets/services/social/styles.css | 151 | .site-header nav a | position | relative | — |
| assets/services/social/styles.css | 152 | .site-header nav a | min-height | 44px | — |
| assets/services/social/styles.css | 153 | .site-header nav a | display | grid | — |
| assets/services/social/styles.css | 162 | .site-header nav a::after | position | absolute | — |
| assets/services/social/styles.css | 166 | .site-header nav a::after | height | 1px | — |
| assets/services/social/styles.css | 303 | .scroll-cue | position | absolute | — |
| assets/services/social/styles.css | 304 | .scroll-cue | z-index | 10 | — |
| assets/services/social/styles.css | 307 | .scroll-cue | display | flex | — |
| assets/services/social/styles.css | 310 | .scroll-cue | font-size | 12px | — |
| assets/services/social/styles.css | 817 | .site-header | height | 84px | @media (max-width: 1024px) |
| assets/services/social/styles.css | 857 | .story-stage, .social-frame | min-height | 720px | @media (max-width: 820px) |
| assets/services/social/styles.css | 865 | .site-header nav a:nth-child(2) | display | none | @media (max-width: 820px) |
| assets/services/web/styles.css | 66 | .story-stage | position | sticky | — |
| assets/services/web/styles.css | 69 | .story-stage | height | 100svh | — |
| assets/services/web/styles.css | 70 | .story-stage | min-height | 680px | — |
| assets/services/web/styles.css | 71 | .story-stage | overflow | hidden | — |
| assets/services/web/styles.css | 78 | .campaign-frame | position | absolute | — |
| assets/services/web/styles.css | 81 | .campaign-frame | height | 100svh | — |
| assets/services/web/styles.css | 82 | .campaign-frame | min-height | 680px | — |
| assets/services/web/styles.css | 83 | .campaign-frame | overflow | hidden | — |
| assets/services/web/styles.css | 119 | .site-header | position | absolute | — |
| assets/services/web/styles.css | 120 | .site-header | z-index | 20 | — |
| assets/services/web/styles.css | 124 | .site-header | height | clamp(112px, 14.5vh, 136px) | — |
| assets/services/web/styles.css | 126 | .site-header | display | flex | — |
| assets/services/web/styles.css | 146 | .site-header nav | display | flex | — |
| assets/services/web/styles.css | 151 | .site-header nav a | position | relative | — |
| assets/services/web/styles.css | 152 | .site-header nav a | min-height | 44px | — |
| assets/services/web/styles.css | 153 | .site-header nav a | display | grid | — |
| assets/services/web/styles.css | 162 | .site-header nav a::after | position | absolute | — |
| assets/services/web/styles.css | 166 | .site-header nav a::after | height | 1px | — |
| assets/services/web/styles.css | 303 | .scroll-cue | position | absolute | — |
| assets/services/web/styles.css | 304 | .scroll-cue | z-index | 10 | — |
| assets/services/web/styles.css | 307 | .scroll-cue | display | flex | — |
| assets/services/web/styles.css | 310 | .scroll-cue | font-size | 12px | — |
| assets/services/web/styles.css | 729 | .site-header | height | 84px | @media (max-width: 1024px) |
| assets/services/web/styles.css | 769 | .story-stage, .campaign-frame | min-height | 720px | @media (max-width: 820px) |
| assets/services/web/styles.css | 777 | .site-header nav a:nth-child(2) | display | none | @media (max-width: 820px) |
| assets/services/web/styles.css | 1142 | .web-service .story-stage, .web-service .campaign-frame | min-height | 100svh | @media (max-width: 820px) |

## Inline style w HTML

| Plik | Linia | Deklaracja |
| --- | --- | --- |
| kontakt.html | 90 | --i:0 |
| kontakt.html | 92 | --i:1 |
| kontakt.html | 95 | --d:0s |
| kontakt.html | 96 | --d:.09s |
| kontakt.html | 99 | --i:2 |
| kontakt.html | 101 | --i:3 |
| kontakt.html | 116 | --i:4 |
| kontakt.html | 128 | --i:5 |
| kontakt.html | 199 | --i:5 |
| kontakt.html | 208 | --i:5 |
| menu.html | 94 | --d:0s |
| menu.html | 95 | --d:.09s |
| menu.html | 104 | --i:0 |
| menu.html | 118 | --i:1 |
| menu.html | 132 | --i:2 |
| menu.html | 146 | --i:3 |
| o-nas.html | 127 | --x: 70%; --y: 62%; |
| o-nas.html | 131 | --x: 87%; --y: 75%; |
| o-nas.html | 135 | --x: 84%; --y: 35%; |
| o-nas.html | 139 | --x: 73%; --y: 80%; --leader: 12px; --about-copy-width: 240px; |
| o-nas.html | 191 | --x: 33%; --y: 72%; --leader: 48px; |
| o-nas.html | 195 | --x: 32.5%; --y: 35%; --leader: 32px; --copy-w: 195px; |
| o-nas.html | 199 | --x: 37%; --y: 76%; --leader: 38px; |
| o-nas.html | 203 | --x: 49%; --y: 73%; |
| o-nas.html | 248 | --x: 74%; --y: 62%; |
| o-nas.html | 252 | --x: 84%; --y: 37%; |
| o-nas.html | 256 | --x: 90%; --y: 73%; |
| o-nas.html | 260 | --x: 79%; --y: 80%; |

## Mutacje stylu z JavaScript

| Plik | Linia | Operacja |
| --- | --- | --- |
| assets/art-coordinate-system.js | 191 | .style.setProperty(property, value) |
| assets/art-coordinate-system.js | 248 | .style.setProperty(property, value, priority) |
| assets/art-coordinate-system.js | 249 | .style.removeProperty(property) |
| assets/art-coordinate-system.js | 948 | .style.setProperty("left", \`${bounds.left}px\`) |
| assets/art-coordinate-system.js | 949 | .style.setProperty("top", \`${bounds.top}px\`) |
| assets/art-coordinate-system.js | 950 | .style.setProperty("width", \`${bounds.width}px\`) |
| assets/art-coordinate-system.js | 951 | .style.setProperty("height", \`${bounds.height}px\`) |
| assets/page-contact.js | 18 | .style.translate = \`${(-cx * 10).toFixed(2)}px ${(-cy * 8).toFixed(2)}px\` |
| assets/page-contact.js | 180 | .style.position = "fixed" |
| assets/page-contact.js | 181 | .style.opacity = "0" |
| assets/responsive-safety.js | 114 | .style.setProperty("--ok-viewport-height-runtime", \`${viewportHeight}px\`) |
| assets/responsive-safety.js | 123 | .style.setProperty(\`--ok-type-${role}-runtime\`, resolvedValue) |
| assets/responsive-safety.js | 124 | .style.setProperty(\`--ok-type-${role}\`, resolvedValue) |
| assets/responsive-safety.js | 181 | .style.objectPosition = style.objectPosition |
| assets/responsive-safety.js | 182 | .style.transform = style.transform |
| assets/responsive-safety.js | 183 | .style.transformOrigin = style.transformOrigin |
| assets/responsive-safety.js | 526 | .style.removeProperty("--ok-safe-mask-image") |
| assets/responsive-safety.js | 548 | .style.removeProperty("--ok-safe-content-max-height") |
| assets/responsive-safety.js | 567 | .style.removeProperty("--ok-safe-curtain-mask") |
| assets/responsive-safety.js | 568 | .style.removeProperty("--ok-safe-required-height") |
| assets/responsive-safety.js | 603 | .style.removeProperty("--ok-safe-curtain-mask") |
| assets/responsive-safety.js | 613 | .style.removeProperty("--ok-safe-required-height") |
| assets/responsive-safety.js | 667 | .style.setProperty("--ok-safe-required-height", \`${requiredHeight}px\`) |
| assets/responsive-safety.js | 683 | .style.setProperty("--ok-safe-required-height", \`${requiredHeight}px\`) |
| assets/responsive-safety.js | 690 | .style.removeProperty("--ok-safe-curtain-mask") |
| assets/responsive-safety.js | 691 | .style.setProperty("--ok-safe-required-height", \`${requiredHeight}px\`) |
| assets/responsive-safety.js | 708 | .style.setProperty("--ok-safe-required-height", \`${requiredHeight}px\`) |
| assets/responsive-safety.js | 710 | .style.removeProperty("--ok-safe-required-height") |
| assets/responsive-safety.js | 717 | .style.setProperty("--ok-safe-required-height", \`${requiredHeight}px\`) |
| assets/responsive-safety.js | 719 | .style.removeProperty("--ok-safe-required-height") |
| assets/responsive-safety.js | 732 | .style.setProperty("--ok-safe-mask-image", directionalFeather.image) |
| assets/responsive-safety.js | 752 | .style.removeProperty("--ok-safe-card-height") |
| assets/responsive-safety.js | 760 | .style.setProperty("--ok-safe-card-height", \`${Math.ceil(textHeight + imageHeight + 24)}px\`) |
| assets/responsive-safety.js | 776 | .style.removeProperty("--ok-safe-card-height") |
| assets/responsive-safety.js | 785 | .style.setProperty("--ok-safe-card-height", \`${Math.ceil(textHeight + imageHeight + 24)}px\`) |
| assets/responsive-safety.js | 908 | .style.removeProperty("--ok-safe-required-height") |
| assets/service-interactions.js | 209 | .style.scrollBehavior = "auto" |
| assets/service-interactions.js | 211 | .style.scrollBehavior = previousBehavior |
| assets/tree-energy.js | 2045 | .style.width = \`${cssWidth}px\` |
| assets/tree-energy.js | 2046 | .style.height = \`${cssHeight}px\` |
| assets/tree-energy.js | 2059 | .style.width = \`${stoneCssWidth}px\` |
| assets/tree-energy.js | 2060 | .style.height = \`${stoneCssHeight}px\` |
| assets/tree-energy.js | 2214 | .style.setProperty("--px", "0px") |
| assets/tree-energy.js | 2215 | .style.setProperty("--py", "0px") |
| assets/tree-energy.js | 2256 | .style.setProperty("--px", \`${x}px\`) |
| assets/tree-energy.js | 2257 | .style.setProperty("--py", \`${y}px\`) |
| assets/tree-energy.js | 2262 | .style.setProperty("--px", "0px") |
| assets/tree-energy.js | 2263 | .style.setProperty("--py", "0px") |

