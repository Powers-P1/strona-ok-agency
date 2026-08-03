# Inwentarz wyjątków systemowych

Raport jest generowany przez `node scripts/audit-system-exceptions.mjs --write`. Obejmuje źródła produkcyjne, podaje dokładny plik i linię oraz rozróżnia użycie tokenu od lokalnej definicji systemu typografii.

## Podsumowanie

- `!important`: **217**
- deklaracje typografii w lokalnych arkuszach tras: **982**
- lokalne przejęcia selektorów wspólnych komponentów/geometrii scen: **296**
- inline `style` w HTML: **28**
- mutacje stylu z JS: **45**

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
| assets/services/about/styles.css | 146 |
| assets/services/process/styles.css | 121 |
| assets/services/diagnosis/styles.css | 112 |
| assets/services/web/styles.css | 94 |
| assets/services/social/styles.css | 91 |
| assets/services/campaign/styles.css | 83 |
| assets/page-contact.css | 74 |
| assets/page-home.css | 72 |
| assets/legal-pages.css | 69 |
| assets/page-menu.css | 67 |
| assets/page-faq.css | 39 |
| assets/visual-direction-scenes.v20260730-2.css | 14 |

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
| assets/legal-pages.css | 701 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/legal-pages.css | 702 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/legal-pages.css | 703 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
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
| assets/page-home.css | 1355 | .home-intro__cta, .home-intro__cta::before, .home-intro__cta::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-menu.css | 681 | *, *::before, *::after | — | route-debt |
| assets/page-menu.css | 682 | *, *::before, *::after | — | route-debt |
| assets/page-menu.css | 683 | *, *::before, *::after | — | route-debt |
| assets/responsive-safety.css | 148 | /* The focused home state hides the measured intro and owns its own panel. */ .home-page .hero.is-focused .art-stage | — | shared-contract |
| assets/responsive-safety.css | 149 | /* The focused home state hides the measured intro and owns its own panel. */ .home-page .hero.is-focused .art-stage | — | shared-contract |
| assets/responsive-safety.css | 273 | [data-ok-safe-art] | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/scene-viewport.css | 28 | :is( .campaign-frame, .social-frame, .process-frame, .about-page .scene ) | — | shared-contract |
| assets/scene-viewport.css | 29 | :is( .campaign-frame, .social-frame, .process-frame, .about-page .scene ) | — | shared-contract |
| assets/scene-viewport.css | 30 | :is( .campaign-frame, .social-frame, .process-frame, .about-page .scene ) | — | shared-contract |
| assets/scene-viewport.css | 40 | .diagnosis-story, .diagnosis-story .story-stage | — | shared-contract |
| assets/scene-viewport.css | 41 | .diagnosis-story, .diagnosis-story .story-stage | — | shared-contract |
| assets/scene-viewport.css | 42 | .diagnosis-story, .diagnosis-story .story-stage | — | shared-contract |
| assets/services/about/styles.css | 386 | .model-points li | — | route-debt |
| assets/services/about/styles.css | 1959 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/about/styles.css | 1960 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/about/styles.css | 1961 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/about/styles.css | 1962 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/campaign/styles.css | 1004 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/campaign/styles.css | 1005 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/campaign/styles.css | 1006 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
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
| assets/services/process/styles.css | 1286 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/process/styles.css | 1287 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/process/styles.css | 1288 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/social/styles.css | 1134 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/social/styles.css | 1135 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/social/styles.css | 1136 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/web/styles.css | 1247 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/web/styles.css | 1248 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/web/styles.css | 1249 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
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
| assets/site-enhancements.css | 365 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-enhancements.css | 366 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-enhancements.css | 367 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-enhancements.css | 368 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-enhancements.css | 369 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-enhancements.css | 370 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-footer.css | 463 | .site-footer *, .site-footer *::before, .site-footer *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-footer.css | 464 | .site-footer *, .site-footer *::before, .site-footer *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-footer.css | 465 | .site-footer *, .site-footer *::before, .site-footer *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-footer.css | 466 | .site-footer *, .site-footer *::before, .site-footer *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-navigation.css | 56 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 57 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 58 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 59 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 60 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 61 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 62 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 63 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 64 | .ok-global-menu .visually-hidden | — | accessibility |
| assets/site-navigation.css | 68 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 70 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 71 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 72 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 74 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 75 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 76 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 77 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 78 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 79 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 85 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 86 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 88 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 92 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 93 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 94 | body header[data-ok-global-nav] | — | shared-contract |
| assets/site-navigation.css | 109 | body header[data-ok-global-nav]::after | — | shared-contract |
| assets/site-navigation.css | 113 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | — | shared-contract |
| assets/site-navigation.css | 114 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | — | shared-contract |
| assets/site-navigation.css | 115 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | — | shared-contract |
| assets/site-navigation.css | 116 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | — | shared-contract |
| assets/site-navigation.css | 117 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | — | shared-contract |
| assets/site-navigation.css | 118 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | — | shared-contract |
| assets/site-navigation.css | 126 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | — | shared-contract |
| assets/site-navigation.css | 148 | body header[data-ok-global-nav] > a:first-child > img | — | shared-contract |
| assets/site-navigation.css | 149 | body header[data-ok-global-nav] > a:first-child > img | — | shared-contract |
| assets/site-navigation.css | 151 | body header[data-ok-global-nav] > a:first-child > img | — | shared-contract |
| assets/site-navigation.css | 156 | body header[data-ok-global-nav][data-ok-nav-state="detached"] > a:first-child > img | — | shared-contract |
| assets/site-navigation.css | 187 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > a, .ok-nav-offer > summary | — | shared-contract |
| assets/site-navigation.css | 194 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > a, .ok-nav-offer > summary | — | shared-contract |
| assets/site-navigation.css | 267 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > a:not(.ok-nav-cta):hover, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a:not(.ok-nav-cta):focus-visible, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a.is-active, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a[aria-current="page"], .ok-nav-offer > summary:hover, .ok-nav-offer > summary:focus-visible, .ok-nav-offer > summary.is-active, .ok-nav-offer[open] > summary | — | shared-contract |
| assets/site-navigation.css | 282 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta | — | shared-contract |
| assets/site-navigation.css | 283 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta | — | shared-contract |
| assets/site-navigation.css | 284 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta | — | shared-contract |
| assets/site-navigation.css | 291 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta | — | shared-contract |
| assets/site-navigation.css | 298 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta:hover, body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta:focus-visible, body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta.is-active, body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta[aria-current="page"] | — | shared-contract |
| assets/site-navigation.css | 699 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | @media (max-width: 1180px), (max-aspect-ratio: 4 / 3) | shared-contract |
| assets/site-navigation.css | 700 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | @media (max-width: 1180px), (max-aspect-ratio: 4 / 3) | shared-contract |
| assets/site-navigation.css | 701 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | @media (max-width: 1180px), (max-aspect-ratio: 4 / 3) | shared-contract |
| assets/site-navigation.css | 702 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | @media (max-width: 1180px), (max-aspect-ratio: 4 / 3) | shared-contract |
| assets/site-navigation.css | 797 | body header[data-ok-global-nav], body header[data-ok-global-nav] > a:first-child > img, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a::after, .ok-nav-offer > summary::after, .ok-nav-offer__mark, .ok-nav-trigger__signal::before, .ok-nav-trigger__signal::after, .ok-global-menu__surface, .ok-global-menu__nav a::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-navigation.css | 798 | body header[data-ok-global-nav], body header[data-ok-global-nav] > a:first-child > img, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a::after, .ok-nav-offer > summary::after, .ok-nav-offer__mark, .ok-nav-trigger__signal::before, .ok-nav-trigger__signal::after, .ok-global-menu__surface, .ok-global-menu__nav a::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-navigation.css | 807 | body header[data-ok-global-nav], body header[data-ok-global-nav][data-ok-nav-state="detached"], .ok-nav-offer__popover, .ok-global-menu__surface | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 808 | body header[data-ok-global-nav], body header[data-ok-global-nav][data-ok-nav-state="detached"], .ok-nav-offer__popover, .ok-global-menu__surface | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 809 | body header[data-ok-global-nav], body header[data-ok-global-nav][data-ok-nav-state="detached"], .ok-nav-offer__popover, .ok-global-menu__surface | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 810 | body header[data-ok-global-nav], body header[data-ok-global-nav][data-ok-nav-state="detached"], .ok-nav-offer__popover, .ok-global-menu__surface | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 819 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > a, .ok-nav-offer > summary, .ok-nav-trigger, .ok-global-menu__close, .ok-global-menu__nav a | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 825 | .ok-nav-cta, .ok-global-menu__nav > .ok-global-menu__cta | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 842 | .ok-nav-trigger, .ok-global-menu, .ok-nav-slot | @media print | shared-contract |
| assets/site-navigation.css | 846 | body header[data-ok-global-nav] | @media print | shared-contract |
| assets/site-navigation.css | 850 | body header[data-ok-global-nav] nav[data-ok-primary-nav] | @media print | shared-contract |
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
| assets/legal-pages.css | 174 | .privacy-title | line-height | .84 | — | local-type-exception |
| assets/legal-pages.css | 181 | .privacy-lead | font-size | var(--ok-type-content, 15px) | — | semantic-token |
| assets/legal-pages.css | 182 | .privacy-lead | line-height | 1.65 | — | local-type-exception |
| assets/legal-pages.css | 210 | .privacy-status__label | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/legal-pages.css | 211 | .privacy-status__label | font-weight | 700 | — | local-type-exception |
| assets/legal-pages.css | 212 | .privacy-status__label | letter-spacing | .17em | — | local-type-exception |
| assets/legal-pages.css | 222 | .privacy-status h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/legal-pages.css | 223 | .privacy-status h2 | font-size | max(30px, var(--ok-type-display-card, 30px)) | — | semantic-token |
| assets/legal-pages.css | 224 | .privacy-status h2 | font-weight | 500 | — | local-type-exception |
| assets/legal-pages.css | 225 | .privacy-status h2 | letter-spacing | -.01em | — | local-type-exception |
| assets/legal-pages.css | 226 | .privacy-status h2 | line-height | 1 | — | local-type-exception |
| assets/legal-pages.css | 232 | .privacy-status p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/legal-pages.css | 233 | .privacy-status p | line-height | 1.62 | — | local-type-exception |
| assets/legal-pages.css | 253 | .privacy-toc h2 | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/legal-pages.css | 254 | .privacy-toc h2 | font-weight | 700 | — | local-type-exception |
| assets/legal-pages.css | 255 | .privacy-toc h2 | letter-spacing | .18em | — | local-type-exception |
| assets/legal-pages.css | 272 | .privacy-toc a | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/legal-pages.css | 273 | .privacy-toc a | font-size | var(--ok-type-control, 16px) | — | semantic-token |
| assets/legal-pages.css | 300 | .policy-section h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/legal-pages.css | 301 | .policy-section h2 | font-size | max(28px, var(--ok-type-display-card, 28px)) | — | semantic-token |
| assets/legal-pages.css | 302 | .policy-section h2 | font-weight | 500 | — | local-type-exception |
| assets/legal-pages.css | 303 | .policy-section h2 | letter-spacing | -.01em | — | local-type-exception |
| assets/legal-pages.css | 309 | .policy-section h2 span | font-size | var(--ok-type-icon, 18px) | — | semantic-token |
| assets/legal-pages.css | 315 | .policy-section p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/legal-pages.css | 316 | .policy-section p | line-height | 1.6 | — | local-type-exception |
| assets/legal-pages.css | 335 | .fill-row strong | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/legal-pages.css | 336 | .fill-row strong | letter-spacing | .06em | — | local-type-exception |
| assets/legal-pages.css | 408 | .error-title | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/legal-pages.css | 409 | .error-title | font-size | clamp(78px, 7vw, 116px) | — | local-type-exception |
| assets/legal-pages.css | 410 | .error-title | font-weight | 500 | — | local-type-exception |
| assets/legal-pages.css | 411 | .error-title | letter-spacing | -.045em | — | local-type-exception |
| assets/legal-pages.css | 412 | .error-title | line-height | .82 | — | local-type-exception |
| assets/legal-pages.css | 423 | .error-lead | font-size | 15px | — | local-type-exception |
| assets/legal-pages.css | 424 | .error-lead | line-height | 1.65 | — | local-type-exception |
| assets/legal-pages.css | 441 | .error-actions a | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/legal-pages.css | 442 | .error-actions a | font-weight | 650 | — | local-type-exception |
| assets/legal-pages.css | 443 | .error-actions a | letter-spacing | .08em | — | local-type-exception |
| assets/legal-pages.css | 485 | .error-number | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/legal-pages.css | 486 | .error-number | font-size | min(34vw, 520px) | — | local-type-exception |
| assets/legal-pages.css | 487 | .error-number | font-weight | 600 | — | local-type-exception |
| assets/legal-pages.css | 488 | .error-number | letter-spacing | -.08em | — | local-type-exception |
| assets/legal-pages.css | 489 | .error-number | line-height | .72 | — | local-type-exception |
| assets/legal-pages.css | 502 | .error-meta | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/legal-pages.css | 503 | .error-meta | font-weight | 650 | — | local-type-exception |
| assets/legal-pages.css | 504 | .error-meta | letter-spacing | .18em | — | local-type-exception |
| assets/legal-pages.css | 519 | .legal-header nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 1140px) | semantic-token |
| assets/legal-pages.css | 566 | .privacy-title | font-size | clamp(58px, 17vw, 72px) | @media (max-width: 640px) | local-type-exception |
| assets/legal-pages.css | 570 | .privacy-lead | font-size | 14px | @media (max-width: 640px) | local-type-exception |
| assets/legal-pages.css | 571 | .privacy-lead | line-height | 1.58 | @media (max-width: 640px) | local-type-exception |
| assets/legal-pages.css | 586 | .privacy-status h2 | font-size | 27px | @media (max-width: 640px) | local-type-exception |
| assets/legal-pages.css | 610 | .policy-section h2 | font-size | 25px | @media (max-width: 640px) | local-type-exception |
| assets/legal-pages.css | 611 | .policy-section h2 | line-height | 1.05 | @media (max-width: 640px) | local-type-exception |
| assets/legal-pages.css | 656 | .error-title | font-size | clamp(64px, 20vw, 82px) | @media (max-width: 640px) | local-type-exception |
| assets/legal-pages.css | 660 | .error-lead | font-size | 14px | @media (max-width: 640px) | local-type-exception |
| assets/legal-pages.css | 679 | .error-number | font-size | min(63vw, 260px) | @media (max-width: 640px) | local-type-exception |
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
| assets/page-home.css | 1084 | .nav a | font-size | clamp(.78rem, .55vw, .88rem) | — | local-type-exception |
| assets/page-home.css | 1085 | .nav a | letter-spacing | .18em | — | local-type-exception |
| assets/page-home.css | 1089 | .detail-kicker | font-size | .78rem | — | local-type-exception |
| assets/page-home.css | 1103 | .cta::after | font-size | 1.25rem | — | local-type-exception |
| assets/page-home.css | 1134 | .home-intro__eyebrow | font-size | 13px | — | local-type-exception |
| assets/page-home.css | 1135 | .home-intro__eyebrow | font-weight | 700 | — | local-type-exception |
| assets/page-home.css | 1136 | .home-intro__eyebrow | letter-spacing | .18em | — | local-type-exception |
| assets/page-home.css | 1150 | .home-intro h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-home.css | 1151 | .home-intro h2 | font-size | clamp(52px, 7.4vw, 112px) | — | local-type-exception |
| assets/page-home.css | 1152 | .home-intro h2 | font-weight | 500 | — | local-type-exception |
| assets/page-home.css | 1153 | .home-intro h2 | line-height | .92 | — | local-type-exception |
| assets/page-home.css | 1154 | .home-intro h2 | letter-spacing | -.035em | — | local-type-exception |
| assets/page-home.css | 1169 | .home-intro__copy p, .home-intro__trust | font-size | clamp(16px, 1.25vw, 19px) | — | local-type-exception |
| assets/page-home.css | 1170 | .home-intro__copy p, .home-intro__trust | line-height | 1.72 | — | local-type-exception |
| assets/page-home.css | 1205 | .home-service span | font-size | 13px | — | local-type-exception |
| assets/page-home.css | 1206 | .home-service span | font-weight | 700 | — | local-type-exception |
| assets/page-home.css | 1207 | .home-service span | letter-spacing | .16em | — | local-type-exception |
| assets/page-home.css | 1213 | .home-service h3 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-home.css | 1214 | .home-service h3 | font-size | clamp(32px, 3.1vw, 48px) | — | local-type-exception |
| assets/page-home.css | 1215 | .home-service h3 | font-weight | 500 | — | local-type-exception |
| assets/page-home.css | 1216 | .home-service h3 | line-height | 1 | — | local-type-exception |
| assets/page-home.css | 1223 | .home-service p | font-size | 15px | — | local-type-exception |
| assets/page-home.css | 1224 | .home-service p | line-height | 1.65 | — | local-type-exception |
| assets/page-home.css | 1248 | .home-intro__cta | font-size | 14px | — | local-type-exception |
| assets/page-home.css | 1249 | .home-intro__cta | font-weight | 650 | — | local-type-exception |
| assets/page-home.css | 1250 | .home-intro__cta | letter-spacing | .025em | — | local-type-exception |
| assets/page-home.css | 1277 | .home-intro__cta::after | font-size | 1.15rem | — | local-type-exception |
| assets/page-home.css | 1317 | .home-intro__trust a | font-weight | 700 | — | local-type-exception |
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
| assets/services/about/styles.css | 127 | .site-header nav a | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/about/styles.css | 128 | .site-header nav a | font-weight | 600 | — | local-type-exception |
| assets/services/about/styles.css | 129 | .site-header nav a | letter-spacing | .13em | — | local-type-exception |
| assets/services/about/styles.css | 244 | .kicker | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/about/styles.css | 245 | .kicker | font-weight | 650 | — | local-type-exception |
| assets/services/about/styles.css | 246 | .kicker | letter-spacing | .16em | — | local-type-exception |
| assets/services/about/styles.css | 260 | h1, h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 261 | h1, h2 | font-weight | 500 | — | local-type-exception |
| assets/services/about/styles.css | 262 | h1, h2 | letter-spacing | -.035em | — | local-type-exception |
| assets/services/about/styles.css | 263 | h1, h2 | line-height | .9 | — | local-type-exception |
| assets/services/about/styles.css | 268 | h1 | font-size | clamp(62px, 5.6vw, 94px) | — | local-type-exception |
| assets/services/about/styles.css | 272 | .scene-01 h1 | line-height | var(--about-hero-heading-leading, .9) | — | local-type-exception |
| assets/services/about/styles.css | 276 | h2 | font-size | clamp(56px, 4.65vw, 78px) | — | local-type-exception |
| assets/services/about/styles.css | 294 | .lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 295 | .lead | line-height | 1.55 | — | local-type-exception |
| assets/services/about/styles.css | 330 | .chips li | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/about/styles.css | 331 | .chips li | font-weight | 650 | — | local-type-exception |
| assets/services/about/styles.css | 332 | .chips li | letter-spacing | .1em | — | local-type-exception |
| assets/services/about/styles.css | 402 | .facts strong, .model-points strong | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 403 | .facts strong, .model-points strong | font-size | 19px | — | local-type-exception |
| assets/services/about/styles.css | 404 | .facts strong, .model-points strong | font-weight | 600 | — | local-type-exception |
| assets/services/about/styles.css | 405 | .facts strong, .model-points strong | letter-spacing | .045em | — | local-type-exception |
| assets/services/about/styles.css | 411 | .row-index | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 412 | .row-index | font-size | 24px | — | local-type-exception |
| assets/services/about/styles.css | 413 | .row-index | font-weight | 400 | — | local-type-exception |
| assets/services/about/styles.css | 414 | .row-index | line-height | 1 | — | local-type-exception |
| assets/services/about/styles.css | 427 | .facts .row-content > span, .model-points .row-content > span | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 428 | .facts .row-content > span, .model-points .row-content > span | line-height | 1.5 | — | local-type-exception |
| assets/services/about/styles.css | 442 | .result | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 443 | .result | font-weight | 520 | — | local-type-exception |
| assets/services/about/styles.css | 444 | .result | line-height | 1.5 | — | local-type-exception |
| assets/services/about/styles.css | 481 | .primary-cta, .text-link | font-size | var(--ok-type-control, 15px) | — | semantic-token |
| assets/services/about/styles.css | 482 | .primary-cta, .text-link | font-weight | 600 | — | local-type-exception |
| assets/services/about/styles.css | 486 | .primary-cta span | font-size | inherit | — | local-type-exception |
| assets/services/about/styles.css | 572 | .portrait-frame figcaption | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/about/styles.css | 573 | .portrait-frame figcaption | font-weight | 650 | — | local-type-exception |
| assets/services/about/styles.css | 574 | .portrait-frame figcaption | letter-spacing | .13em | — | local-type-exception |
| assets/services/about/styles.css | 589 | .scene-02 h2 | font-size | clamp(54px, 4.25vw, 72px) | — | local-type-exception |
| assets/services/about/styles.css | 597 | .scene-03 h2 | font-size | clamp(54px, 4.35vw, 74px) | — | local-type-exception |
| assets/services/about/styles.css | 608 | .proof-statement | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 609 | .proof-statement | font-size | clamp(18px, 1.3vw, 23px) | — | local-type-exception |
| assets/services/about/styles.css | 610 | .proof-statement | line-height | 1.12 | — | local-type-exception |
| assets/services/about/styles.css | 618 | .scene-04 h2 | font-size | clamp(48px, 3.85vw, 66px) | — | local-type-exception |
| assets/services/about/styles.css | 624 | .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 652 | .accordion-index | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 653 | .accordion-index | font-size | 24px | — | local-type-exception |
| assets/services/about/styles.css | 654 | .accordion-index | line-height | 1 | — | local-type-exception |
| assets/services/about/styles.css | 663 | .accordion-label strong | font-size | 12px | — | local-type-exception |
| assets/services/about/styles.css | 664 | .accordion-label strong | font-weight | 650 | — | local-type-exception |
| assets/services/about/styles.css | 665 | .accordion-label strong | letter-spacing | .1em | — | local-type-exception |
| assets/services/about/styles.css | 671 | .accordion-label small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 672 | .accordion-label small | line-height | 1.42 | — | local-type-exception |
| assets/services/about/styles.css | 718 | .accordion-detail p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 719 | .accordion-detail p | line-height | 1.5 | — | local-type-exception |
| assets/services/about/styles.css | 725 | .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 760 | .mobile-details summary | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 761 | .mobile-details summary | font-size | 14px | — | local-type-exception |
| assets/services/about/styles.css | 762 | .mobile-details summary | font-weight | 600 | — | local-type-exception |
| assets/services/about/styles.css | 763 | .mobile-details summary | letter-spacing | .03em | — | local-type-exception |
| assets/services/about/styles.css | 776 | .mobile-details summary::after | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 777 | .mobile-details summary::after | font-weight | 400 | — | local-type-exception |
| assets/services/about/styles.css | 787 | .mobile-details p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 788 | .mobile-details p | line-height | 1.45 | — | local-type-exception |
| assets/services/about/styles.css | 808 | .scroll-cue | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/about/styles.css | 809 | .scroll-cue | font-weight | 600 | — | local-type-exception |
| assets/services/about/styles.css | 810 | .scroll-cue | letter-spacing | .1em | — | local-type-exception |
| assets/services/about/styles.css | 886 | h1 | font-size | clamp(58px, 5vw, 78px) | @media (max-height: 800px) and (min-width: 901px) | local-type-exception |
| assets/services/about/styles.css | 890 | h2 | font-size | clamp(48px, 4vw, 66px) | @media (max-height: 800px) and (min-width: 901px) | local-type-exception |
| assets/services/about/styles.css | 908 | .facts strong, .model-points strong | font-size | 17px | @media (max-height: 800px) and (min-width: 901px) | local-type-exception |
| assets/services/about/styles.css | 917 | .facts .row-content > span, .model-points .row-content > span, .scene-04 .lead, .accordion-label small, .accordion-detail p, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (max-height: 800px) and (min-width: 901px) | semantic-token |
| assets/services/about/styles.css | 925 | .accordion-label strong | font-size | 12px | @media (max-height: 800px) and (min-width: 901px) | local-type-exception |
| assets/services/about/styles.css | 997 | h1 | font-size | clamp(62px, 7vw, 74px) | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 1002 | h2, .scene-03 h2 | font-size | clamp(48px, 5.4vw, 58px) | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 1007 | .scene-02 h2, .scene-04 h2 | font-size | clamp(43px, 4.8vw, 51px) | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 1013 | .lead, .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) | semantic-token |
| assets/services/about/styles.css | 1029 | .facts strong, .model-points strong | font-size | 16px | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 1034 | .facts .row-content > span, .model-points .row-content > span | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) | semantic-token |
| assets/services/about/styles.css | 1035 | .facts .row-content > span, .model-points .row-content > span | line-height | 1.42 | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 1041 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) | semantic-token |
| assets/services/about/styles.css | 1069 | .proof-statement | font-size | 17px | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 1082 | .accordion-label strong | font-size | 12px | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 1087 | .accordion-label small, .accordion-detail p | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) | semantic-token |
| assets/services/about/styles.css | 1122 | .site-header nav a | font-size | 12px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1123 | .site-header nav a | letter-spacing | .08em | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1181 | .kicker | font-size | 12px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1189 | h1 | font-size | clamp(43px, 12.4vw, 52px) | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1190 | h1 | line-height | .88 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1197 | h2, .scene-02 h2, .scene-03 h2, .scene-04 h2 | font-size | clamp(38px, 10.6vw, 45px) | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1198 | h2, .scene-02 h2, .scene-03 h2, .scene-04 h2 | line-height | .9 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1204 | .lead, .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1205 | .lead, .scene-04 .lead | line-height | 1.48 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1215 | .chips li | font-size | 12px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1248 | .facts strong, .model-points strong | font-size | 15px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1254 | .facts .row-content > span, .model-points .row-content > span | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1255 | .facts .row-content > span, .model-points .row-content > span | line-height | 1.42 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1262 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1263 | .result, .scene-04 .result | line-height | 1.45 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1308 | .mobile-details summary | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1309 | .mobile-details summary | font-size | 14px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1310 | .mobile-details summary | font-weight | 600 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1311 | .mobile-details summary | letter-spacing | .03em | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1324 | .mobile-details summary::after | font-family | var(--ok-font-body, "Archivo", sans-serif) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1325 | .mobile-details summary::after | font-weight | 400 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1335 | .mobile-details p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1336 | .mobile-details p | line-height | 1.45 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1376 | .portrait-frame figcaption | font-size | 12px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1397 | .proof-statement | font-size | 16px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1412 | .accordion-index | font-size | 21px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1416 | .accordion-label strong | font-size | 12px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1420 | .accordion-label small | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1421 | .accordion-label small | line-height | 1.4 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1434 | .accordion-detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1435 | .accordion-detail p | line-height | 1.48 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1479 | .about-page .scene-01 h1 | font-size | clamp(42px, 4.4vw, 46px) | @media (min-width: 821px) and (max-height: 700px) | local-type-exception |
| assets/services/about/styles.css | 1483 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | clamp(43px, 4.7vw, 49px) | @media (min-width: 821px) and (max-height: 700px) | local-type-exception |
| assets/services/about/styles.css | 1516 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | clamp(39px, 4.1vw, 43px) | @media (min-width: 821px) and (max-height: 620px) | local-type-exception |
| assets/services/about/styles.css | 1525 | .about-page .chips li | letter-spacing | .06em | @media (min-width: 821px) and (max-height: 620px) | local-type-exception |
| assets/services/about/styles.css | 1582 | .site-header nav a | font-size | 12px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1583 | .site-header nav a | letter-spacing | .11em | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1597 | h1 | font-size | 64px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1604 | h2, .scene-02 h2, .scene-03 h2, .scene-04 h2 | font-size | 50px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1609 | .lead, .scene-04 .lead | font-size | 14px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1613 | .chips li | font-size | 12px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1627 | .facts strong, .model-points strong | font-size | 16px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1632 | .facts .row-content > span, .model-points .row-content > span | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 600px) and (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1637 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 600px) and (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1642 | .mobile-details summary | font-size | 16px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1646 | .mobile-details p | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 600px) and (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1658 | .portrait-frame figcaption | font-size | 12px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1673 | .proof-statement | font-size | 18px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1682 | .accordion-label strong | font-size | 12px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1687 | .accordion-label small, .accordion-detail p | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 600px) and (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1713 | .scene-04 .lead | line-height | 1.42 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1763 | .scene-02 h2 | font-size | clamp(34px, 9.5vw, 38px) | @media (max-width: 599px) | local-type-exception |
| assets/services/about/styles.css | 1767 | .scene-02 .lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 599px) | semantic-token |
| assets/services/about/styles.css | 1768 | .scene-02 .lead | line-height | 1.42 | @media (max-width: 599px) | local-type-exception |
| assets/services/about/styles.css | 1784 | .scene-02 .facts strong | font-size | 14px | @media (max-width: 599px) | local-type-exception |
| assets/services/about/styles.css | 1796 | .scene-02 .portrait-frame figcaption | letter-spacing | .06em | @media (max-width: 599px) | local-type-exception |
| assets/services/about/styles.css | 1842 | .scene-01 h1, .scene-03 h2 | font-size | clamp(38px, 11.5vw, 44px) | @media (max-width: 390px) and (max-height: 740px) | local-type-exception |
| assets/services/about/styles.css | 1846 | .scene-02 h2 | font-size | 31px | @media (max-width: 390px) and (max-height: 740px) | local-type-exception |
| assets/services/about/styles.css | 1852 | .scene-01 .lead, .scene-03 .lead | line-height | 1.35 | @media (max-width: 390px) and (max-height: 740px) | local-type-exception |
| assets/services/about/styles.css | 1866 | .mobile-details p | line-height | 1.35 | @media (max-width: 390px) and (max-height: 740px) | local-type-exception |
| assets/services/about/styles.css | 1935 | .about-page .scene-01 h1 | font-size | 46px | — | local-type-exception |
| assets/services/about/styles.css | 1939 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | 39px | — | local-type-exception |
| assets/services/campaign/styles.css | 28 | body | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/services/campaign/styles.css | 155 | .site-header nav a | font-size | 12px | — | local-type-exception |
| assets/services/campaign/styles.css | 156 | .site-header nav a | font-weight | 650 | — | local-type-exception |
| assets/services/campaign/styles.css | 157 | .site-header nav a | letter-spacing | .08em | — | local-type-exception |
| assets/services/campaign/styles.css | 225 | .opening-copy h1 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/campaign/styles.css | 226 | .opening-copy h1 | font-size | clamp(64px, 5.15vw, 86px) | — | local-type-exception |
| assets/services/campaign/styles.css | 227 | .opening-copy h1 | font-weight | 500 | — | local-type-exception |
| assets/services/campaign/styles.css | 228 | .opening-copy h1 | letter-spacing | -.035em | — | local-type-exception |
| assets/services/campaign/styles.css | 229 | .opening-copy h1 | line-height | .92 | — | local-type-exception |
| assets/services/campaign/styles.css | 241 | .opening-copy p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 242 | .opening-copy p | font-weight | 450 | — | local-type-exception |
| assets/services/campaign/styles.css | 243 | .opening-copy p | line-height | 1.55 | — | local-type-exception |
| assets/services/campaign/styles.css | 251 | .opening-scope | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/campaign/styles.css | 252 | .opening-scope | font-weight | 650 | — | local-type-exception |
| assets/services/campaign/styles.css | 253 | .opening-scope | letter-spacing | .08em | — | local-type-exception |
| assets/services/campaign/styles.css | 280 | .outline-cta | font-size | 15px | — | local-type-exception |
| assets/services/campaign/styles.css | 281 | .outline-cta | font-weight | 550 | — | local-type-exception |
| assets/services/campaign/styles.css | 312 | .scroll-cue | font-size | 12px | — | local-type-exception |
| assets/services/campaign/styles.css | 359 | .journey-intro h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/campaign/styles.css | 360 | .journey-intro h2 | font-size | clamp(58px, 4.9vw, 82px) | — | local-type-exception |
| assets/services/campaign/styles.css | 361 | .journey-intro h2 | font-weight | 500 | — | local-type-exception |
| assets/services/campaign/styles.css | 362 | .journey-intro h2 | letter-spacing | .005em | — | local-type-exception |
| assets/services/campaign/styles.css | 363 | .journey-intro h2 | line-height | .91 | — | local-type-exception |
| assets/services/campaign/styles.css | 369 | .journey-intro p | font-size | clamp(14px, .96vw, 17px) | — | local-type-exception |
| assets/services/campaign/styles.css | 370 | .journey-intro p | line-height | 1.55 | — | local-type-exception |
| assets/services/campaign/styles.css | 407 | .proof-content h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/campaign/styles.css | 408 | .proof-content h2 | font-size | clamp(58px, 4.65vw, 78px) | — | local-type-exception |
| assets/services/campaign/styles.css | 409 | .proof-content h2 | font-weight | 500 | — | local-type-exception |
| assets/services/campaign/styles.css | 410 | .proof-content h2 | letter-spacing | -.025em | — | local-type-exception |
| assets/services/campaign/styles.css | 411 | .proof-content h2 | line-height | .92 | — | local-type-exception |
| assets/services/campaign/styles.css | 423 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 424 | .proof-lead | line-height | 1.55 | — | local-type-exception |
| assets/services/campaign/styles.css | 448 | .proof-trigger | font | inherit | — | local-type-exception |
| assets/services/campaign/styles.css | 478 | .proof-index | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/campaign/styles.css | 479 | .proof-index | font-size | 24px | — | local-type-exception |
| assets/services/campaign/styles.css | 480 | .proof-index | line-height | 1 | — | local-type-exception |
| assets/services/campaign/styles.css | 489 | .proof-label strong | font-size | 12px | — | local-type-exception |
| assets/services/campaign/styles.css | 490 | .proof-label strong | font-weight | 650 | — | local-type-exception |
| assets/services/campaign/styles.css | 491 | .proof-label strong | letter-spacing | .09em | — | local-type-exception |
| assets/services/campaign/styles.css | 498 | .proof-label small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 499 | .proof-label small | line-height | 1.42 | — | local-type-exception |
| assets/services/campaign/styles.css | 527 | .proof-detail p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 528 | .proof-detail p | line-height | 1.45 | — | local-type-exception |
| assets/services/campaign/styles.css | 533 | .proof-detail b | font-weight | 650 | — | local-type-exception |
| assets/services/campaign/styles.css | 540 | .proof-output | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 541 | .proof-output | line-height | 1.48 | — | local-type-exception |
| assets/services/campaign/styles.css | 565 | .proof-primary | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 566 | .proof-primary | font-weight | 550 | — | local-type-exception |
| assets/services/campaign/styles.css | 598 | .proof-secondary | font-size | 12px | — | local-type-exception |
| assets/services/campaign/styles.css | 599 | .proof-secondary | font-weight | 550 | — | local-type-exception |
| assets/services/campaign/styles.css | 628 | .journey-note h3 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/campaign/styles.css | 629 | .journey-note h3 | font-weight | 500 | — | local-type-exception |
| assets/services/campaign/styles.css | 634 | .journey-note h3 b | font-size | clamp(48px, 3.25vw, 58px) | — | local-type-exception |
| assets/services/campaign/styles.css | 635 | .journey-note h3 b | font-weight | 400 | — | local-type-exception |
| assets/services/campaign/styles.css | 636 | .journey-note h3 b | line-height | .9 | — | local-type-exception |
| assets/services/campaign/styles.css | 641 | .journey-note h3 span | font-size | clamp(20px, 1.4vw, 25px) | — | local-type-exception |
| assets/services/campaign/styles.css | 642 | .journey-note h3 span | font-weight | 600 | — | local-type-exception |
| assets/services/campaign/styles.css | 643 | .journey-note h3 span | letter-spacing | .03em | — | local-type-exception |
| assets/services/campaign/styles.css | 649 | .journey-note p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 650 | .journey-note p | line-height | 1.55 | — | local-type-exception |
| assets/services/campaign/styles.css | 658 | .journey-note small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 659 | .journey-note small | line-height | 1.45 | — | local-type-exception |
| assets/services/campaign/styles.css | 737 | .site-header nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 1024px) | semantic-token |
| assets/services/campaign/styles.css | 746 | .opening-copy h1 | font-size | clamp(48px, 6.2vw, 64px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/campaign/styles.css | 755 | .proof-content h2 | font-size | clamp(48px, 5.4vw, 62px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/campaign/styles.css | 800 | .opening-copy h1 | font-size | clamp(48px, 14vw, 72px) | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 824 | .journey-intro h2 | font-size | clamp(54px, 16vw, 76px) | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 830 | .journey-intro > p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 856 | .journey-mobile-steps b | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 857 | .journey-mobile-steps b | font-size | 24px | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 858 | .journey-mobile-steps b | font-weight | 400 | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 867 | .journey-mobile-steps strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 868 | .journey-mobile-steps strong | letter-spacing | .08em | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 874 | .journey-mobile-steps small | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 875 | .journey-mobile-steps small | line-height | 1.4 | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 899 | .proof-content h2 | font-size | clamp(43px, 12.7vw, 56px) | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 904 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 919 | .proof-index | font-size | 20px | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 927 | .proof-label strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 932 | .proof-label small, .proof-detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 945 | .proof-output | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 973 | .campaign-proof .proof-content h2 | font-size | 36px | @media (max-width: 640px) and (max-height: 700px) | local-type-exception |
| assets/services/campaign/styles.css | 978 | .campaign-proof .proof-lead | line-height | 1.35 | @media (max-width: 640px) and (max-height: 700px) | local-type-exception |
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
| assets/services/process/styles.css | 155 | .site-header nav a | font-size | 12px | — | local-type-exception |
| assets/services/process/styles.css | 156 | .site-header nav a | font-weight | 650 | — | local-type-exception |
| assets/services/process/styles.css | 157 | .site-header nav a | letter-spacing | .08em | — | local-type-exception |
| assets/services/process/styles.css | 225 | .opening-copy h1 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 226 | .opening-copy h1 | font-size | clamp(64px, 5.15vw, 86px) | — | local-type-exception |
| assets/services/process/styles.css | 227 | .opening-copy h1 | font-weight | 500 | — | local-type-exception |
| assets/services/process/styles.css | 228 | .opening-copy h1 | letter-spacing | -.035em | — | local-type-exception |
| assets/services/process/styles.css | 229 | .opening-copy h1 | line-height | .92 | — | local-type-exception |
| assets/services/process/styles.css | 241 | .opening-copy p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 242 | .opening-copy p | font-weight | 450 | — | local-type-exception |
| assets/services/process/styles.css | 243 | .opening-copy p | line-height | 1.55 | — | local-type-exception |
| assets/services/process/styles.css | 251 | .opening-scope | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/process/styles.css | 252 | .opening-scope | font-weight | 650 | — | local-type-exception |
| assets/services/process/styles.css | 253 | .opening-scope | letter-spacing | .08em | — | local-type-exception |
| assets/services/process/styles.css | 280 | .outline-cta | font-size | 15px | — | local-type-exception |
| assets/services/process/styles.css | 281 | .outline-cta | font-weight | 550 | — | local-type-exception |
| assets/services/process/styles.css | 312 | .scroll-cue | font-size | 12px | — | local-type-exception |
| assets/services/process/styles.css | 359 | .journey-intro h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 360 | .journey-intro h2 | font-size | clamp(58px, 4.9vw, 82px) | — | local-type-exception |
| assets/services/process/styles.css | 361 | .journey-intro h2 | font-weight | 500 | — | local-type-exception |
| assets/services/process/styles.css | 362 | .journey-intro h2 | letter-spacing | .005em | — | local-type-exception |
| assets/services/process/styles.css | 363 | .journey-intro h2 | line-height | .91 | — | local-type-exception |
| assets/services/process/styles.css | 369 | .journey-intro p | font-size | clamp(14px, .96vw, 17px) | — | local-type-exception |
| assets/services/process/styles.css | 370 | .journey-intro p | line-height | 1.55 | — | local-type-exception |
| assets/services/process/styles.css | 407 | .proof-content h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 408 | .proof-content h2 | font-size | clamp(58px, 4.65vw, 78px) | — | local-type-exception |
| assets/services/process/styles.css | 409 | .proof-content h2 | font-weight | 500 | — | local-type-exception |
| assets/services/process/styles.css | 410 | .proof-content h2 | letter-spacing | -.025em | — | local-type-exception |
| assets/services/process/styles.css | 411 | .proof-content h2 | line-height | .92 | — | local-type-exception |
| assets/services/process/styles.css | 423 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 424 | .proof-lead | line-height | 1.55 | — | local-type-exception |
| assets/services/process/styles.css | 448 | .proof-trigger | font | inherit | — | local-type-exception |
| assets/services/process/styles.css | 478 | .proof-index | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 479 | .proof-index | font-size | 24px | — | local-type-exception |
| assets/services/process/styles.css | 480 | .proof-index | line-height | 1 | — | local-type-exception |
| assets/services/process/styles.css | 489 | .proof-label strong | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/process/styles.css | 490 | .proof-label strong | font-weight | 650 | — | local-type-exception |
| assets/services/process/styles.css | 491 | .proof-label strong | letter-spacing | .09em | — | local-type-exception |
| assets/services/process/styles.css | 498 | .proof-label small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 499 | .proof-label small | line-height | 1.42 | — | local-type-exception |
| assets/services/process/styles.css | 527 | .proof-detail p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 528 | .proof-detail p | line-height | 1.45 | — | local-type-exception |
| assets/services/process/styles.css | 533 | .proof-detail b | font-weight | 650 | — | local-type-exception |
| assets/services/process/styles.css | 540 | .proof-output | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 541 | .proof-output | line-height | 1.48 | — | local-type-exception |
| assets/services/process/styles.css | 565 | .proof-primary | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 566 | .proof-primary | font-weight | 550 | — | local-type-exception |
| assets/services/process/styles.css | 598 | .proof-secondary | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/process/styles.css | 599 | .proof-secondary | font-weight | 550 | — | local-type-exception |
| assets/services/process/styles.css | 628 | .journey-note h3 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 629 | .journey-note h3 | font-weight | 500 | — | local-type-exception |
| assets/services/process/styles.css | 634 | .journey-note h3 b | font-size | clamp(48px, 3.25vw, 58px) | — | local-type-exception |
| assets/services/process/styles.css | 635 | .journey-note h3 b | font-weight | 400 | — | local-type-exception |
| assets/services/process/styles.css | 636 | .journey-note h3 b | line-height | .9 | — | local-type-exception |
| assets/services/process/styles.css | 641 | .journey-note h3 span | font-size | clamp(20px, 1.4vw, 25px) | — | local-type-exception |
| assets/services/process/styles.css | 642 | .journey-note h3 span | font-weight | 600 | — | local-type-exception |
| assets/services/process/styles.css | 643 | .journey-note h3 span | letter-spacing | .03em | — | local-type-exception |
| assets/services/process/styles.css | 649 | .journey-note p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 650 | .journey-note p | line-height | 1.55 | — | local-type-exception |
| assets/services/process/styles.css | 658 | .journey-note small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 659 | .journey-note small | line-height | 1.45 | — | local-type-exception |
| assets/services/process/styles.css | 737 | .site-header nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 1024px) | semantic-token |
| assets/services/process/styles.css | 746 | .opening-copy h1 | font-size | clamp(48px, 6.2vw, 64px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/process/styles.css | 755 | .proof-content h2 | font-size | clamp(48px, 5.4vw, 62px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/process/styles.css | 794 | .opening-copy h1 | font-size | clamp(48px, 14vw, 72px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 818 | .journey-intro h2 | font-size | clamp(54px, 16vw, 76px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 824 | .journey-intro > p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 850 | .journey-mobile-steps b | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 851 | .journey-mobile-steps b | font-size | 24px | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 852 | .journey-mobile-steps b | font-weight | 400 | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 861 | .journey-mobile-steps strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 862 | .journey-mobile-steps strong | letter-spacing | .08em | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 868 | .journey-mobile-steps small | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 869 | .journey-mobile-steps small | line-height | 1.4 | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 893 | .proof-content h2 | font-size | clamp(43px, 12.7vw, 56px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 898 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 913 | .proof-index | font-size | 20px | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 921 | .proof-label strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 926 | .proof-label small, .proof-detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 939 | .proof-output | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 985 | .process-act | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/process/styles.css | 986 | .process-act | font-weight | 650 | — | local-type-exception |
| assets/services/process/styles.css | 987 | .process-act | letter-spacing | .12em | — | local-type-exception |
| assets/services/process/styles.css | 1000 | .process-editorial-content h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 1001 | .process-editorial-content h2 | font-size | clamp(58px, 4.7vw, 79px) | — | local-type-exception |
| assets/services/process/styles.css | 1002 | .process-editorial-content h2 | font-weight | 500 | — | local-type-exception |
| assets/services/process/styles.css | 1003 | .process-editorial-content h2 | letter-spacing | -.025em | — | local-type-exception |
| assets/services/process/styles.css | 1004 | .process-editorial-content h2 | line-height | .92 | — | local-type-exception |
| assets/services/process/styles.css | 1016 | .process-editorial-lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 1017 | .process-editorial-lead | line-height | 1.58 | — | local-type-exception |
| assets/services/process/styles.css | 1037 | .process-evidence-list article > b | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 1038 | .process-evidence-list article > b | font-size | 25px | — | local-type-exception |
| assets/services/process/styles.css | 1039 | .process-evidence-list article > b | font-weight | 400 | — | local-type-exception |
| assets/services/process/styles.css | 1048 | .process-evidence-list strong | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/process/styles.css | 1049 | .process-evidence-list strong | font-weight | 650 | — | local-type-exception |
| assets/services/process/styles.css | 1050 | .process-evidence-list strong | letter-spacing | .09em | — | local-type-exception |
| assets/services/process/styles.css | 1056 | .process-evidence-list small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 1057 | .process-evidence-list small | line-height | 1.42 | — | local-type-exception |
| assets/services/process/styles.css | 1064 | .process-stage-output | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 1065 | .process-stage-output | line-height | 1.5 | — | local-type-exception |
| assets/services/process/styles.css | 1178 | .process-editorial-content h2 | font-size | clamp(48px, 5.5vw, 64px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/process/styles.css | 1228 | .process-act | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1237 | .process-editorial-content h2 | font-size | clamp(42px, 11.8vw, 52px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 1242 | .process-editorial-lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1257 | .process-evidence-list article > b | font-size | 21px | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 1261 | .process-evidence-list strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1266 | .process-evidence-list small, .process-stage-output | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1301 | .process-opening-copy h1 | font-size | clamp(74px, 6.15vw, 103px) | — | local-type-exception |
| assets/services/process/styles.css | 1302 | .process-opening-copy h1 | line-height | .9 | — | local-type-exception |
| assets/services/process/styles.css | 1307 | .process-opening-copy p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 1344 | .process-method-intro h2 | font-size | clamp(60px, 5.05vw, 84px) | — | local-type-exception |
| assets/services/process/styles.css | 1391 | .process-proof-content h2 | font-size | clamp(56px, 4.35vw, 73px) | — | local-type-exception |
| assets/services/process/styles.css | 1424 | .process-opening-copy h1 | font-size | clamp(58px, 7.3vw, 78px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/process/styles.css | 1437 | .process-proof-content h2 | font-size | clamp(48px, 5.2vw, 61px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/process/styles.css | 1469 | .process-opening-copy h1 | font-size | clamp(50px, 14.5vw, 68px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 1473 | .process-opening-copy p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1486 | .process-method-intro h2 | font-size | clamp(47px, 13.3vw, 62px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 1500 | .process-proof-content h2 | font-size | clamp(39px, 11.3vw, 50px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 1505 | .process-proof-content .proof-lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1527 | .process-proof-content .proof-output | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 28 | body | font-family | var(--ok-font-body) | — | semantic-token |
| assets/services/social/styles.css | 155 | .site-header nav a | font-size | 12px | — | local-type-exception |
| assets/services/social/styles.css | 156 | .site-header nav a | font-weight | 650 | — | local-type-exception |
| assets/services/social/styles.css | 157 | .site-header nav a | letter-spacing | .08em | — | local-type-exception |
| assets/services/social/styles.css | 225 | .opening-copy h1 | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/social/styles.css | 226 | .opening-copy h1 | font-size | clamp(64px, 5.15vw, 86px) | — | local-type-exception |
| assets/services/social/styles.css | 227 | .opening-copy h1 | font-weight | 500 | — | local-type-exception |
| assets/services/social/styles.css | 228 | .opening-copy h1 | letter-spacing | -.035em | — | local-type-exception |
| assets/services/social/styles.css | 229 | .opening-copy h1 | line-height | .92 | — | local-type-exception |
| assets/services/social/styles.css | 241 | .opening-copy p | font-size | var(--ok-type-content-min) | — | semantic-token |
| assets/services/social/styles.css | 242 | .opening-copy p | font-weight | 450 | — | local-type-exception |
| assets/services/social/styles.css | 243 | .opening-copy p | line-height | 1.55 | — | local-type-exception |
| assets/services/social/styles.css | 251 | .opening-scope | font-size | var(--ok-type-label-min) | — | semantic-token |
| assets/services/social/styles.css | 252 | .opening-scope | font-weight | 650 | — | local-type-exception |
| assets/services/social/styles.css | 253 | .opening-scope | letter-spacing | .08em | — | local-type-exception |
| assets/services/social/styles.css | 280 | .outline-cta | font-size | 15px | — | local-type-exception |
| assets/services/social/styles.css | 281 | .outline-cta | font-weight | 550 | — | local-type-exception |
| assets/services/social/styles.css | 312 | .scroll-cue | font-size | 12px | — | local-type-exception |
| assets/services/social/styles.css | 359 | .journey-intro h2 | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/social/styles.css | 360 | .journey-intro h2 | font-size | clamp(58px, 4.9vw, 82px) | — | local-type-exception |
| assets/services/social/styles.css | 361 | .journey-intro h2 | font-weight | 500 | — | local-type-exception |
| assets/services/social/styles.css | 362 | .journey-intro h2 | letter-spacing | .005em | — | local-type-exception |
| assets/services/social/styles.css | 363 | .journey-intro h2 | line-height | .91 | — | local-type-exception |
| assets/services/social/styles.css | 369 | .journey-intro p | font-size | clamp(var(--ok-type-content-min), .96vw, 17px) | — | semantic-token |
| assets/services/social/styles.css | 370 | .journey-intro p | line-height | 1.55 | — | local-type-exception |
| assets/services/social/styles.css | 407 | .proof-content h2 | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/social/styles.css | 408 | .proof-content h2 | font-size | clamp(58px, 4.65vw, 78px) | — | local-type-exception |
| assets/services/social/styles.css | 409 | .proof-content h2 | font-weight | 500 | — | local-type-exception |
| assets/services/social/styles.css | 410 | .proof-content h2 | letter-spacing | -.025em | — | local-type-exception |
| assets/services/social/styles.css | 411 | .proof-content h2 | line-height | .92 | — | local-type-exception |
| assets/services/social/styles.css | 423 | .proof-lead | font-size | clamp(var(--ok-type-content-min), .88vw, 15px) | — | semantic-token |
| assets/services/social/styles.css | 424 | .proof-lead | line-height | 1.55 | — | local-type-exception |
| assets/services/social/styles.css | 448 | .proof-trigger | font | inherit | — | local-type-exception |
| assets/services/social/styles.css | 478 | .proof-index | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/social/styles.css | 479 | .proof-index | font-size | 24px | — | local-type-exception |
| assets/services/social/styles.css | 480 | .proof-index | line-height | 1 | — | local-type-exception |
| assets/services/social/styles.css | 489 | .proof-label strong | font-size | 12px | — | local-type-exception |
| assets/services/social/styles.css | 490 | .proof-label strong | font-weight | 650 | — | local-type-exception |
| assets/services/social/styles.css | 491 | .proof-label strong | letter-spacing | .09em | — | local-type-exception |
| assets/services/social/styles.css | 498 | .proof-label small | font-size | var(--ok-type-content-min) | — | semantic-token |
| assets/services/social/styles.css | 499 | .proof-label small | line-height | 1.42 | — | local-type-exception |
| assets/services/social/styles.css | 527 | .proof-detail p | font-size | var(--ok-type-content-min) | — | semantic-token |
| assets/services/social/styles.css | 528 | .proof-detail p | line-height | 1.45 | — | local-type-exception |
| assets/services/social/styles.css | 533 | .proof-detail b | font-weight | 650 | — | local-type-exception |
| assets/services/social/styles.css | 540 | .proof-output | font-size | var(--ok-type-content-min) | — | semantic-token |
| assets/services/social/styles.css | 541 | .proof-output | line-height | 1.48 | — | local-type-exception |
| assets/services/social/styles.css | 565 | .proof-primary | font-size | 13px | — | local-type-exception |
| assets/services/social/styles.css | 566 | .proof-primary | font-weight | 550 | — | local-type-exception |
| assets/services/social/styles.css | 598 | .proof-secondary | font-size | 12px | — | local-type-exception |
| assets/services/social/styles.css | 599 | .proof-secondary | font-weight | 550 | — | local-type-exception |
| assets/services/social/styles.css | 628 | .journey-note h3 | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/social/styles.css | 629 | .journey-note h3 | font-weight | 500 | — | local-type-exception |
| assets/services/social/styles.css | 634 | .journey-note h3 b | font-size | clamp(48px, 3.25vw, 58px) | — | local-type-exception |
| assets/services/social/styles.css | 635 | .journey-note h3 b | font-weight | 400 | — | local-type-exception |
| assets/services/social/styles.css | 636 | .journey-note h3 b | line-height | .9 | — | local-type-exception |
| assets/services/social/styles.css | 641 | .journey-note h3 span | font-size | clamp(20px, 1.4vw, 25px) | — | local-type-exception |
| assets/services/social/styles.css | 642 | .journey-note h3 span | font-weight | 600 | — | local-type-exception |
| assets/services/social/styles.css | 643 | .journey-note h3 span | letter-spacing | .03em | — | local-type-exception |
| assets/services/social/styles.css | 649 | .journey-note p | font-size | clamp(var(--ok-type-content-min), .85vw, 15px) | — | semantic-token |
| assets/services/social/styles.css | 650 | .journey-note p | line-height | 1.55 | — | local-type-exception |
| assets/services/social/styles.css | 658 | .journey-note small | font-size | var(--ok-type-content-min) | — | semantic-token |
| assets/services/social/styles.css | 659 | .journey-note small | line-height | 1.45 | — | local-type-exception |
| assets/services/social/styles.css | 703 | .social-opening .opening-copy h1 | font-size | clamp(62px, 5vw, 84px) | — | local-type-exception |
| assets/services/social/styles.css | 783 | .social-terms | font-size | var(--ok-type-content-min) | — | semantic-token |
| assets/services/social/styles.css | 784 | .social-terms | line-height | 1.45 | — | local-type-exception |
| assets/services/social/styles.css | 852 | .site-header nav a | font-size | var(--ok-type-label-min) | @media (max-width: 1024px) | semantic-token |
| assets/services/social/styles.css | 861 | .opening-copy h1 | font-size | clamp(48px, 6.2vw, 64px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/social/styles.css | 870 | .proof-content h2 | font-size | clamp(48px, 5.4vw, 62px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/social/styles.css | 909 | .opening-copy h1 | font-size | clamp(48px, 14vw, 72px) | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 936 | .journey-intro h2 | font-size | clamp(54px, 16vw, 76px) | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 942 | .journey-intro > p | font-size | var(--ok-type-content-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 970 | .journey-mobile-steps b | font-family | var(--ok-font-display) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 971 | .journey-mobile-steps b | font-size | 24px | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 972 | .journey-mobile-steps b | font-weight | 400 | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 981 | .journey-mobile-steps strong | font-size | var(--ok-type-label-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 982 | .journey-mobile-steps strong | letter-spacing | .08em | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 988 | .journey-mobile-steps small | font-size | var(--ok-type-content-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 989 | .journey-mobile-steps small | line-height | 1.3 | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 1014 | .proof-content h2 | font-size | clamp(38px, 11.6vw, 50px) | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 1019 | .proof-lead | font-size | var(--ok-type-content-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 1020 | .proof-lead | line-height | 1.3 | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 1035 | .proof-index | font-size | 20px | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 1043 | .proof-label strong | font-size | var(--ok-type-label-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 1048 | .proof-label small, .proof-detail p | font-size | var(--ok-type-content-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 1049 | .proof-label small, .proof-detail p | line-height | 1.3 | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 1064 | .proof-output | font-size | var(--ok-type-content-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 1065 | .proof-output | line-height | 1.25 | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 1070 | .social-terms | font-size | var(--ok-type-content-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 1071 | .social-terms | line-height | 1.25 | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 1100 | .social-signals .proof-content h2 | font-size | 36px | @media (max-width: 820px) and (max-height: 740px) | local-type-exception |
| assets/services/social/styles.css | 1105 | .social-signals .proof-lead | line-height | 1.25 | @media (max-width: 820px) and (max-height: 740px) | local-type-exception |
| assets/services/web/styles.css | 28 | body | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/services/web/styles.css | 155 | .site-header nav a | font-size | 12px | — | local-type-exception |
| assets/services/web/styles.css | 156 | .site-header nav a | font-weight | 650 | — | local-type-exception |
| assets/services/web/styles.css | 157 | .site-header nav a | letter-spacing | .08em | — | local-type-exception |
| assets/services/web/styles.css | 225 | .opening-copy h1 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/web/styles.css | 226 | .opening-copy h1 | font-size | clamp(64px, 5.15vw, 86px) | — | local-type-exception |
| assets/services/web/styles.css | 227 | .opening-copy h1 | font-weight | 500 | — | local-type-exception |
| assets/services/web/styles.css | 228 | .opening-copy h1 | letter-spacing | -.035em | — | local-type-exception |
| assets/services/web/styles.css | 229 | .opening-copy h1 | line-height | .92 | — | local-type-exception |
| assets/services/web/styles.css | 241 | .opening-copy p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 242 | .opening-copy p | font-weight | 450 | — | local-type-exception |
| assets/services/web/styles.css | 243 | .opening-copy p | line-height | 1.55 | — | local-type-exception |
| assets/services/web/styles.css | 251 | .opening-scope | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/web/styles.css | 252 | .opening-scope | font-weight | 650 | — | local-type-exception |
| assets/services/web/styles.css | 253 | .opening-scope | letter-spacing | .08em | — | local-type-exception |
| assets/services/web/styles.css | 280 | .outline-cta | font-size | 15px | — | local-type-exception |
| assets/services/web/styles.css | 281 | .outline-cta | font-weight | 550 | — | local-type-exception |
| assets/services/web/styles.css | 312 | .scroll-cue | font-size | 12px | — | local-type-exception |
| assets/services/web/styles.css | 359 | .journey-intro h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/web/styles.css | 360 | .journey-intro h2 | font-size | clamp(58px, 4.9vw, 82px) | — | local-type-exception |
| assets/services/web/styles.css | 361 | .journey-intro h2 | font-weight | 500 | — | local-type-exception |
| assets/services/web/styles.css | 362 | .journey-intro h2 | letter-spacing | .005em | — | local-type-exception |
| assets/services/web/styles.css | 363 | .journey-intro h2 | line-height | .91 | — | local-type-exception |
| assets/services/web/styles.css | 369 | .journey-intro p | font-size | clamp(14px, .96vw, 17px) | — | local-type-exception |
| assets/services/web/styles.css | 370 | .journey-intro p | line-height | 1.55 | — | local-type-exception |
| assets/services/web/styles.css | 407 | .proof-content h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/web/styles.css | 408 | .proof-content h2 | font-size | clamp(58px, 4.65vw, 78px) | — | local-type-exception |
| assets/services/web/styles.css | 409 | .proof-content h2 | font-weight | 500 | — | local-type-exception |
| assets/services/web/styles.css | 410 | .proof-content h2 | letter-spacing | -.025em | — | local-type-exception |
| assets/services/web/styles.css | 411 | .proof-content h2 | line-height | .92 | — | local-type-exception |
| assets/services/web/styles.css | 423 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 424 | .proof-lead | line-height | 1.55 | — | local-type-exception |
| assets/services/web/styles.css | 448 | .proof-trigger | font | inherit | — | local-type-exception |
| assets/services/web/styles.css | 478 | .proof-index | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/web/styles.css | 479 | .proof-index | font-size | 24px | — | local-type-exception |
| assets/services/web/styles.css | 480 | .proof-index | line-height | 1 | — | local-type-exception |
| assets/services/web/styles.css | 489 | .proof-label strong | font-size | 12px | — | local-type-exception |
| assets/services/web/styles.css | 490 | .proof-label strong | font-weight | 650 | — | local-type-exception |
| assets/services/web/styles.css | 491 | .proof-label strong | letter-spacing | .09em | — | local-type-exception |
| assets/services/web/styles.css | 498 | .proof-label small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 499 | .proof-label small | line-height | 1.42 | — | local-type-exception |
| assets/services/web/styles.css | 527 | .proof-detail p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 528 | .proof-detail p | line-height | 1.45 | — | local-type-exception |
| assets/services/web/styles.css | 533 | .proof-detail b | font-weight | 650 | — | local-type-exception |
| assets/services/web/styles.css | 540 | .proof-output | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 541 | .proof-output | line-height | 1.48 | — | local-type-exception |
| assets/services/web/styles.css | 565 | .proof-primary | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 566 | .proof-primary | font-weight | 550 | — | local-type-exception |
| assets/services/web/styles.css | 598 | .proof-secondary | font-size | 12px | — | local-type-exception |
| assets/services/web/styles.css | 599 | .proof-secondary | font-weight | 550 | — | local-type-exception |
| assets/services/web/styles.css | 628 | .journey-note h3 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/web/styles.css | 629 | .journey-note h3 | font-weight | 500 | — | local-type-exception |
| assets/services/web/styles.css | 634 | .journey-note h3 b | font-size | clamp(48px, 3.25vw, 58px) | — | local-type-exception |
| assets/services/web/styles.css | 635 | .journey-note h3 b | font-weight | 400 | — | local-type-exception |
| assets/services/web/styles.css | 636 | .journey-note h3 b | line-height | .9 | — | local-type-exception |
| assets/services/web/styles.css | 641 | .journey-note h3 span | font-size | clamp(20px, 1.4vw, 25px) | — | local-type-exception |
| assets/services/web/styles.css | 642 | .journey-note h3 span | font-weight | 600 | — | local-type-exception |
| assets/services/web/styles.css | 643 | .journey-note h3 span | letter-spacing | .03em | — | local-type-exception |
| assets/services/web/styles.css | 649 | .journey-note p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 650 | .journey-note p | line-height | 1.55 | — | local-type-exception |
| assets/services/web/styles.css | 658 | .journey-note small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 659 | .journey-note small | line-height | 1.45 | — | local-type-exception |
| assets/services/web/styles.css | 700 | .proof-content h2 | font-size | clamp(64px, 5.1vw, 86px) | @media (min-width: 1400px) and (min-height: 850px) | local-type-exception |
| assets/services/web/styles.css | 742 | .site-header nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 1024px) | semantic-token |
| assets/services/web/styles.css | 751 | .opening-copy h1 | font-size | clamp(48px, 6.2vw, 64px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/web/styles.css | 760 | .proof-content h2 | font-size | clamp(48px, 5.4vw, 62px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/web/styles.css | 799 | .opening-copy h1 | font-size | clamp(48px, 14vw, 72px) | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 825 | .journey-intro h2 | font-size | clamp(54px, 16vw, 76px) | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 831 | .journey-intro > p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 857 | .journey-mobile-steps b | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 858 | .journey-mobile-steps b | font-size | 24px | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 859 | .journey-mobile-steps b | font-weight | 400 | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 868 | .journey-mobile-steps strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 869 | .journey-mobile-steps strong | letter-spacing | .08em | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 875 | .journey-mobile-steps small | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 876 | .journey-mobile-steps small | line-height | 1.4 | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 900 | .proof-content h2 | font-size | clamp(43px, 12.7vw, 56px) | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 905 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 920 | .proof-index | font-size | 20px | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 928 | .proof-label strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 933 | .proof-label small, .proof-detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 946 | .proof-output | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 978 | .section-kicker | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/web/styles.css | 979 | .section-kicker | font-weight | 700 | — | local-type-exception |
| assets/services/web/styles.css | 980 | .section-kicker | letter-spacing | .14em | — | local-type-exception |
| assets/services/web/styles.css | 998 | .web-service .opening-copy h1 | font-size | clamp(68px, 5.55vw, 94px) | — | local-type-exception |
| assets/services/web/styles.css | 1043 | .web-service .journey-intro h2 | font-size | clamp(56px, 4.55vw, 78px) | — | local-type-exception |
| assets/services/web/styles.css | 1099 | .web-service .proof-content h2 | font-size | clamp(56px, 4.3vw, 74px) | — | local-type-exception |
| assets/services/web/styles.css | 1108 | .web-service .opening-copy h1 | font-size | clamp(78px, 6.1vw, 108px) | @media (min-width: 1800px) and (min-height: 1000px) | local-type-exception |
| assets/services/web/styles.css | 1112 | .web-service :is(.journey-intro, .proof-content) h2 | font-size | clamp(64px, 4.9vw, 88px) | @media (min-width: 1800px) and (min-height: 1000px) | local-type-exception |
| assets/services/web/styles.css | 1176 | .web-service .opening-copy h1 | font-size | clamp(46px, 13vw, 64px) | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 1180 | .web-service .opening-scope | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 1209 | .web-service .proof-content h2 | font-size | clamp(39px, 11.8vw, 52px) | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 1214 | .web-service .section-kicker | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/visual-direction-scenes.v20260730-2.css | 102 | .home-intro__eyebrow, .decision-guide__eyebrow | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/visual-direction-scenes.v20260730-2.css | 103 | .home-intro__eyebrow, .decision-guide__eyebrow | font-weight | 600 | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 104 | .home-intro__eyebrow, .decision-guide__eyebrow | letter-spacing | .2em | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 115 | .home-intro h2, .decision-guide h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/visual-direction-scenes.v20260730-2.css | 116 | .home-intro h2, .decision-guide h2 | font-weight | 500 | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 118 | .home-intro h2, .decision-guide h2 | line-height | .82 | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 119 | .home-intro h2, .decision-guide h2 | letter-spacing | -.055em | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 125 | .home-intro h2 | font-size | clamp(4.25rem, 8.35vw, 8.65rem) | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 191 | .decision-guide h2 | font-size | clamp(4rem, 7.35vw, 7.65rem) | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 203 | .decision-guide__faq h2 | font-size | clamp(3rem, 4.8vw, 5rem) | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 204 | .decision-guide__faq h2 | line-height | .88 | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 268 | .home-intro h2 | font-size | clamp(3.55rem, 16vw, 5.4rem) | @media (max-width: 760px) | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 273 | .decision-guide h2 | font-size | clamp(3.35rem, 15.2vw, 5rem) | @media (max-width: 760px) | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 278 | .decision-guide__faq h2 | font-size | clamp(2.75rem, 12.5vw, 4rem) | @media (max-width: 760px) | local-type-exception |

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
| assets/legal-pages.css | 519 | .legal-header nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 1140px) |
| assets/legal-pages.css | 556 | .legal-header nav a:nth-child(2) | display | none | @media (max-width: 640px) |
| assets/legal-pages.css | 624 | .error-page .legal-header nav a | display | grid | @media (max-width: 640px) |
| assets/legal-pages.css | 628 | .error-page .legal-header nav a:nth-child(2) | display | none | @media (max-width: 640px) |
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
| assets/page-home.css | 1072 | .topbar | height | clamp(7rem, 9vh, 8.5rem) | — |
| assets/page-home.css | 1084 | .nav a | font-size | clamp(.78rem, .55vw, .88rem) | — |
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
| assets/services/about/styles.css | 127 | .site-header nav a | font-size | var(--ok-type-label-min, 12px) | — |
| assets/services/about/styles.css | 135 | .site-header nav a::after | position | absolute | — |
| assets/services/about/styles.css | 139 | .site-header nav a::after | height | 1px | — |
| assets/services/about/styles.css | 169 | .scene | position | relative | — |
| assets/services/about/styles.css | 170 | .scene | z-index | 0 | — |
| assets/services/about/styles.css | 172 | .scene | overflow | hidden | — |
| assets/services/about/styles.css | 182 | .scene-art | position | absolute | — |
| assets/services/about/styles.css | 183 | .scene-art | z-index | 1 | — |
| assets/services/about/styles.css | 186 | .scene-art | height | 100% | — |
| assets/services/about/styles.css | 194 | .scene::before | position | absolute | — |
| assets/services/about/styles.css | 195 | .scene::before | z-index | 2 | — |
| assets/services/about/styles.css | 217 | /* The semantic scene image is the only artwork layer. A duplicate background * would remain visible underneath the shared safety mask and create a ghosted * tree edge at compact desktop widths. */ .scene-inner | position | absolute | — |
| assets/services/about/styles.css | 218 | /* The semantic scene image is the only artwork layer. A duplicate background * would remain visible underneath the shared safety mask and create a ghosted * tree edge at compact desktop widths. */ .scene-inner | z-index | 3 | — |
| assets/services/about/styles.css | 220 | /* The semantic scene image is the only artwork layer. A duplicate background * would remain visible underneath the shared safety mask and create a ghosted * tree edge at compact desktop widths. */ .scene-inner | overflow | visible | — |
| assets/services/about/styles.css | 272 | .scene-01 h1 | height | var(--about-hero-heading-leading, .9) | — |
| assets/services/about/styles.css | 589 | .scene-02 h2 | font-size | clamp(54px, 4.25vw, 72px) | — |
| assets/services/about/styles.css | 597 | .scene-03 h2 | font-size | clamp(54px, 4.35vw, 74px) | — |
| assets/services/about/styles.css | 618 | .scene-04 h2 | font-size | clamp(48px, 3.85vw, 66px) | — |
| assets/services/about/styles.css | 624 | .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | — |
| assets/services/about/styles.css | 725 | .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | — |
| assets/services/about/styles.css | 800 | .scroll-cue | position | absolute | — |
| assets/services/about/styles.css | 801 | .scroll-cue | z-index | 13 | — |
| assets/services/about/styles.css | 804 | .scroll-cue | display | flex | — |
| assets/services/about/styles.css | 808 | .scroll-cue | font-size | var(--ok-type-label-min, 12px) | — |
| assets/services/about/styles.css | 816 | .scroll-cue span | height | 28px | — |
| assets/services/about/styles.css | 817 | .scroll-cue span | display | grid | — |
| assets/services/about/styles.css | 825 | .scroll-cue svg | height | 15px | — |
| assets/services/about/styles.css | 872 | .scene-04 .accordion-trigger | min-height | 44px | @media (max-height: 800px) and (min-width: 901px) |
| assets/services/about/styles.css | 917 | .facts .row-content > span, .model-points .row-content > span, .scene-04 .lead, .accordion-label small, .accordion-detail p, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (max-height: 800px) and (min-width: 901px) |
| assets/services/about/styles.css | 940 | .scene-02 .portrait-frame | height | 68vh | @media (max-height: 800px) and (min-width: 1101px) |
| assets/services/about/styles.css | 948 | .scene-02 .facts li | min-height | 78px | @media (max-height: 800px) and (min-width: 1101px) |
| assets/services/about/styles.css | 960 | .scene-03 .model-points li | min-height | 68px | @media (max-height: 800px) and (min-width: 1101px) |
| assets/services/about/styles.css | 1002 | h2, .scene-03 h2 | font-size | clamp(48px, 5.4vw, 58px) | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 1007 | .scene-02 h2, .scene-04 h2 | font-size | clamp(43px, 4.8vw, 51px) | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 1013 | .lead, .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 1041 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 1058 | .scene-01 .mobile-details, .tablet-details | display | block | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 1063 | .scene-02 .facts, .scene-03 .model-points | display | none | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 1122 | .site-header nav a | font-size | 12px | @media (max-width: 900px) |
| assets/services/about/styles.css | 1127 | .scene::before | z-index | -2 | @media (max-width: 900px) |
| assets/services/about/styles.css | 1143 | .scene-01 .scene-art | position | 68% center | @media (max-width: 900px) |
| assets/services/about/styles.css | 1147 | .scene-02 .scene-art | position | 34% center | @media (max-width: 900px) |
| assets/services/about/styles.css | 1151 | .scene-03 .scene-art | position | 71% center | @media (max-width: 900px) |
| assets/services/about/styles.css | 1155 | .scene-04 .scene-art | position | 76% center | @media (max-width: 900px) |
| assets/services/about/styles.css | 1197 | h2, .scene-02 h2, .scene-03 h2, .scene-04 h2 | font-size | clamp(38px, 10.6vw, 45px) | @media (max-width: 900px) |
| assets/services/about/styles.css | 1198 | h2, .scene-02 h2, .scene-03 h2, .scene-04 h2 | height | .9 | @media (max-width: 900px) |
| assets/services/about/styles.css | 1204 | .lead, .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) |
| assets/services/about/styles.css | 1205 | .lead, .scene-04 .lead | height | 1.48 | @media (max-width: 900px) |
| assets/services/about/styles.css | 1262 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) |
| assets/services/about/styles.css | 1263 | .result, .scene-04 .result | height | 1.45 | @media (max-width: 900px) |
| assets/services/about/styles.css | 1439 | .scroll-cue | display | none | @media (max-width: 900px) |
| assets/services/about/styles.css | 1479 | .about-page .scene-01 h1 | font-size | clamp(42px, 4.4vw, 46px) | @media (min-width: 821px) and (max-height: 700px) |
| assets/services/about/styles.css | 1483 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | clamp(43px, 4.7vw, 49px) | @media (min-width: 821px) and (max-height: 700px) |
| assets/services/about/styles.css | 1509 | .about-page .scene-03 .model-points li | min-height | 64px | @media (min-width: 821px) and (max-height: 700px) |
| assets/services/about/styles.css | 1516 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | clamp(39px, 4.1vw, 43px) | @media (min-width: 821px) and (max-height: 620px) |
| assets/services/about/styles.css | 1537 | .about-page .scene-04 .accordion-trigger | min-height | 44px | @media (min-width: 821px) and (max-height: 620px) |
| assets/services/about/styles.css | 1541 | .about-page .scene-03 .model-points li | min-height | 56px | @media (min-width: 821px) and (max-height: 620px) |
| assets/services/about/styles.css | 1547 | .scene-04 :is(.lead, .proof-statement, .result) | display | none | @media (max-width: 640px) and (max-height: 700px) |
| assets/services/about/styles.css | 1582 | .site-header nav a | font-size | 12px | @media (min-width: 600px) and (max-width: 900px) |
| assets/services/about/styles.css | 1604 | h2, .scene-02 h2, .scene-03 h2, .scene-04 h2 | font-size | 50px | @media (min-width: 600px) and (max-width: 900px) |
| assets/services/about/styles.css | 1609 | .lead, .scene-04 .lead | font-size | 14px | @media (min-width: 600px) and (max-width: 900px) |
| assets/services/about/styles.css | 1637 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 600px) and (max-width: 900px) |
| assets/services/about/styles.css | 1698 | .scene-02 .tablet-details, .scene-03 .tablet-details | display | block | @media (max-width: 900px) |
| assets/services/about/styles.css | 1703 | .scene-02 .facts, .scene-03 .model-points | display | none | @media (max-width: 900px) |
| assets/services/about/styles.css | 1713 | .scene-04 .lead | height | 1.42 | @media (max-width: 900px) |
| assets/services/about/styles.css | 1721 | .scene-04 .accordion-trigger | min-height | 46px | @media (max-width: 900px) |
| assets/services/about/styles.css | 1749 | .scene-02 .portrait-frame | height | 72vh | @media (min-width: 850px) and (max-width: 900px) and (max-height: 800px) |
| assets/services/about/styles.css | 1763 | .scene-02 h2 | font-size | clamp(34px, 9.5vw, 38px) | @media (max-width: 599px) |
| assets/services/about/styles.css | 1767 | .scene-02 .lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 599px) |
| assets/services/about/styles.css | 1768 | .scene-02 .lead | height | 1.42 | @media (max-width: 599px) |
| assets/services/about/styles.css | 1778 | .scene-02 .facts li | min-height | 72px | @media (max-width: 599px) |
| assets/services/about/styles.css | 1784 | .scene-02 .facts strong | font-size | 14px | @media (max-width: 599px) |
| assets/services/about/styles.css | 1788 | .scene-02 .portrait-frame | z-index | 10 | @media (max-width: 599px) |
| assets/services/about/styles.css | 1792 | .scene-02 .portrait-frame | height | 176px | @media (max-width: 599px) |
| assets/services/about/styles.css | 1815 | .scene-02 .portrait-frame | height | 150px | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1828 | .scene-01 .chips, .scene-02 .lead, .scene-02 .result, .scene-03 .result | display | none | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1833 | .scene-02 .kicker, :is(.scene-02, .scene-03) .mobile-details details:first-child > p:not(.mobile-context) | display | none | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1837 | :is(.scene-02, .scene-03) .mobile-details .mobile-context | display | block | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1842 | .scene-01 h1, .scene-03 h2 | font-size | clamp(38px, 11.5vw, 44px) | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1846 | .scene-02 h2 | font-size | 31px | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1852 | .scene-01 .lead, .scene-03 .lead | height | 1.35 | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1893 | .scene-04 .accordion-trigger | min-height | 44px | @media (max-width: 640px) |
| assets/services/about/styles.css | 1931 | .about-page .scene-02 .portrait-frame | height | 76vh | — |
| assets/services/about/styles.css | 1935 | .about-page .scene-01 h1 | font-size | 46px | — |
| assets/services/about/styles.css | 1939 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | 39px | — |
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
| assets/services/campaign/styles.css | 155 | .site-header nav a | font-size | 12px | — |
| assets/services/campaign/styles.css | 163 | .site-header nav a::after | position | absolute | — |
| assets/services/campaign/styles.css | 167 | .site-header nav a::after | height | 1px | — |
| assets/services/campaign/styles.css | 305 | .scroll-cue | position | absolute | — |
| assets/services/campaign/styles.css | 306 | .scroll-cue | z-index | 10 | — |
| assets/services/campaign/styles.css | 309 | .scroll-cue | display | flex | — |
| assets/services/campaign/styles.css | 312 | .scroll-cue | font-size | 12px | — |
| assets/services/campaign/styles.css | 728 | .site-header | height | 84px | @media (max-width: 1024px) |
| assets/services/campaign/styles.css | 737 | .site-header nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 1024px) |
| assets/services/campaign/styles.css | 778 | .story-stage, .campaign-frame | min-height | 720px | @media (max-width: 820px) |
| assets/services/campaign/styles.css | 786 | .site-header nav a:nth-child(2) | display | none | @media (max-width: 820px) |
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
| assets/services/process/styles.css | 155 | .site-header nav a | font-size | 12px | — |
| assets/services/process/styles.css | 163 | .site-header nav a::after | position | absolute | — |
| assets/services/process/styles.css | 167 | .site-header nav a::after | height | 1px | — |
| assets/services/process/styles.css | 305 | .scroll-cue | position | absolute | — |
| assets/services/process/styles.css | 306 | .scroll-cue | z-index | 10 | — |
| assets/services/process/styles.css | 309 | .scroll-cue | display | flex | — |
| assets/services/process/styles.css | 312 | .scroll-cue | font-size | 12px | — |
| assets/services/process/styles.css | 728 | .site-header | height | 84px | @media (max-width: 1024px) |
| assets/services/process/styles.css | 737 | .site-header nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 1024px) |
| assets/services/process/styles.css | 772 | .story-stage, .campaign-frame | min-height | 720px | @media (max-width: 820px) |
| assets/services/process/styles.css | 780 | .site-header nav a:nth-child(2) | display | none | @media (max-width: 820px) |
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
| assets/services/social/styles.css | 155 | .site-header nav a | font-size | 12px | — |
| assets/services/social/styles.css | 163 | .site-header nav a::after | position | absolute | — |
| assets/services/social/styles.css | 167 | .site-header nav a::after | height | 1px | — |
| assets/services/social/styles.css | 305 | .scroll-cue | position | absolute | — |
| assets/services/social/styles.css | 306 | .scroll-cue | z-index | 10 | — |
| assets/services/social/styles.css | 309 | .scroll-cue | display | flex | — |
| assets/services/social/styles.css | 312 | .scroll-cue | font-size | 12px | — |
| assets/services/social/styles.css | 843 | .site-header | height | 84px | @media (max-width: 1024px) |
| assets/services/social/styles.css | 852 | .site-header nav a | font-size | var(--ok-type-label-min) | @media (max-width: 1024px) |
| assets/services/social/styles.css | 887 | .story-stage, .social-frame | min-height | 720px | @media (max-width: 820px) |
| assets/services/social/styles.css | 895 | .site-header nav a:nth-child(2) | display | none | @media (max-width: 820px) |
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
| assets/services/web/styles.css | 155 | .site-header nav a | font-size | 12px | — |
| assets/services/web/styles.css | 163 | .site-header nav a::after | position | absolute | — |
| assets/services/web/styles.css | 167 | .site-header nav a::after | height | 1px | — |
| assets/services/web/styles.css | 305 | .scroll-cue | position | absolute | — |
| assets/services/web/styles.css | 306 | .scroll-cue | z-index | 10 | — |
| assets/services/web/styles.css | 309 | .scroll-cue | display | flex | — |
| assets/services/web/styles.css | 312 | .scroll-cue | font-size | 12px | — |
| assets/services/web/styles.css | 733 | .site-header | height | 84px | @media (max-width: 1024px) |
| assets/services/web/styles.css | 742 | .site-header nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 1024px) |
| assets/services/web/styles.css | 777 | .story-stage, .campaign-frame | min-height | 720px | @media (max-width: 820px) |
| assets/services/web/styles.css | 785 | .site-header nav a:nth-child(2) | display | none | @media (max-width: 820px) |
| assets/services/web/styles.css | 1150 | .web-service .story-stage, .web-service .campaign-frame | min-height | 100svh | @media (max-width: 820px) |

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
| assets/art-coordinate-system.js | 931 | .style.setProperty("left", \`${bounds.left}px\`) |
| assets/art-coordinate-system.js | 932 | .style.setProperty("top", \`${bounds.top}px\`) |
| assets/art-coordinate-system.js | 933 | .style.setProperty("width", \`${bounds.width}px\`) |
| assets/art-coordinate-system.js | 934 | .style.setProperty("height", \`${bounds.height}px\`) |
| assets/page-contact.js | 18 | .style.translate = \`${(-cx * 10).toFixed(2)}px ${(-cy * 8).toFixed(2)}px\` |
| assets/page-contact.js | 180 | .style.position = "fixed" |
| assets/page-contact.js | 181 | .style.opacity = "0" |
| assets/responsive-safety.js | 105 | .style.setProperty("--ok-viewport-height-runtime", \`${viewportHeight}px\`) |
| assets/responsive-safety.js | 114 | .style.setProperty(\`--ok-type-${role}-runtime\`, resolvedValue) |
| assets/responsive-safety.js | 115 | .style.setProperty(\`--ok-type-${role}\`, resolvedValue) |
| assets/responsive-safety.js | 285 | .style.removeProperty("--ok-safe-mask-image") |
| assets/responsive-safety.js | 307 | .style.removeProperty("--ok-safe-content-max-height") |
| assets/responsive-safety.js | 326 | .style.removeProperty("--ok-safe-curtain-mask") |
| assets/responsive-safety.js | 327 | .style.removeProperty("--ok-safe-required-height") |
| assets/responsive-safety.js | 356 | .style.removeProperty("--ok-safe-curtain-mask") |
| assets/responsive-safety.js | 366 | .style.removeProperty("--ok-safe-required-height") |
| assets/responsive-safety.js | 421 | .style.setProperty("--ok-safe-required-height", \`${requiredHeight}px\`) |
| assets/responsive-safety.js | 437 | .style.setProperty("--ok-safe-required-height", \`${requiredHeight}px\`) |
| assets/responsive-safety.js | 444 | .style.removeProperty("--ok-safe-curtain-mask") |
| assets/responsive-safety.js | 445 | .style.setProperty("--ok-safe-required-height", \`${requiredHeight}px\`) |
| assets/responsive-safety.js | 456 | .style.setProperty("--ok-safe-required-height", \`${requiredHeight}px\`) |
| assets/responsive-safety.js | 458 | .style.removeProperty("--ok-safe-required-height") |
| assets/responsive-safety.js | 465 | .style.setProperty("--ok-safe-required-height", \`${requiredHeight}px\`) |
| assets/responsive-safety.js | 467 | .style.removeProperty("--ok-safe-required-height") |
| assets/responsive-safety.js | 509 | .style.setProperty("--ok-safe-mask-image", maskImage) |
| assets/responsive-safety.js | 533 | .style.removeProperty("--ok-safe-card-height") |
| assets/responsive-safety.js | 541 | .style.setProperty("--ok-safe-card-height", \`${Math.ceil(textHeight + imageHeight + 24)}px\`) |
| assets/responsive-safety.js | 557 | .style.removeProperty("--ok-safe-card-height") |
| assets/responsive-safety.js | 566 | .style.setProperty("--ok-safe-card-height", \`${Math.ceil(textHeight + imageHeight + 24)}px\`) |
| assets/responsive-safety.js | 607 | .style.removeProperty("--ok-safe-required-height") |
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

