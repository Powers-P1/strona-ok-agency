# Inwentarz wyjątków systemowych

Raport jest generowany przez `node scripts/audit-system-exceptions.mjs --write`. Obejmuje źródła produkcyjne, podaje dokładny plik i linię oraz rozróżnia użycie tokenu od lokalnej definicji systemu typografii.

## Podsumowanie

- `!important`: **217**
- deklaracje typografii w lokalnych arkuszach tras: **980**
- lokalne przejęcia selektorów wspólnych komponentów/geometrii scen: **292**
- inline `style` w HTML: **28**
- mutacje stylu z JS: **58**

### Największe źródła `!important`

| Plik | Liczba |
| --- | --- |
| assets/site-navigation.css | 60 |
| assets/story-standard.css | 39 |
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
| assets/services/site-audit/styles.css | 1 |

### Największe lokalne źródła typografii

| Plik | Liczba |
| --- | --- |
| assets/services/about/styles.css | 136 |
| assets/services/process/styles.css | 113 |
| assets/services/diagnosis/styles.css | 112 |
| assets/services/web/styles.css | 88 |
| assets/services/social/styles.css | 81 |
| assets/services/campaign/styles.css | 77 |
| assets/legal-pages.css | 67 |
| assets/page-home.css | 67 |
| assets/page-menu.css | 67 |
| assets/services/site-audit/styles.css | 52 |
| assets/page-contact.css | 41 |
| assets/page-faq.css | 39 |
| assets/content-system.css | 32 |
| assets/visual-direction-scenes.v20260730-2.css | 8 |

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
| assets/page-contact.css | 407 | .js .panel > .page-title | — | route-debt |
| assets/page-contact.css | 407 | .js .panel > .page-title | — | route-debt |
| assets/page-contact.css | 507 | *, *::before, *::after | — | route-debt |
| assets/page-contact.css | 508 | *, *::before, *::after | — | route-debt |
| assets/page-contact.css | 509 | *, *::before, *::after | — | route-debt |
| assets/page-faq.css | 352 | .faq-page *, .faq-page *::before, .faq-page *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-faq.css | 353 | .faq-page *, .faq-page *::before, .faq-page *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 538 | html[data-motion="paused"] .copy > *, html[data-motion="paused"] .topbar | — | route-debt |
| assets/page-home.css | 539 | html[data-motion="paused"] .copy > *, html[data-motion="paused"] .topbar | — | route-debt |
| assets/page-home.css | 540 | html[data-motion="paused"] .copy > *, html[data-motion="paused"] .topbar | — | route-debt |
| assets/page-home.css | 742 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 743 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 744 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 745 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 749 | .stone-neural-canvas | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 753 | .copy > *, .topbar | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 754 | .copy > *, .topbar | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 755 | .copy > *, .topbar | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-home.css | 1341 | .home-intro__cta, .home-intro__cta::before, .home-intro__cta::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/page-menu.css | 681 | *, *::before, *::after | — | route-debt |
| assets/page-menu.css | 682 | *, *::before, *::after | — | route-debt |
| assets/page-menu.css | 683 | *, *::before, *::after | — | route-debt |
| assets/responsive-safety.css | 211 | /* The focused home state hides the measured intro and owns its own panel. */ .home-page .hero.is-focused .art-stage | — | shared-contract |
| assets/responsive-safety.css | 212 | /* The focused home state hides the measured intro and owns its own panel. */ .home-page .hero.is-focused .art-stage | — | shared-contract |
| assets/responsive-safety.css | 331 | [data-ok-safe-art] | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/scene-viewport.css | 37 | :is( .campaign-frame, .social-frame, .process-frame, .about-page .scene ) | — | shared-contract |
| assets/scene-viewport.css | 38 | :is( .campaign-frame, .social-frame, .process-frame, .about-page .scene ) | — | shared-contract |
| assets/scene-viewport.css | 39 | :is( .campaign-frame, .social-frame, .process-frame, .about-page .scene ) | — | shared-contract |
| assets/scene-viewport.css | 49 | .diagnosis-story, .diagnosis-story .story-stage | — | shared-contract |
| assets/scene-viewport.css | 50 | .diagnosis-story, .diagnosis-story .story-stage | — | shared-contract |
| assets/scene-viewport.css | 51 | .diagnosis-story, .diagnosis-story .story-stage | — | shared-contract |
| assets/services/about/styles.css | 378 | .model-points li | — | route-debt |
| assets/services/about/styles.css | 1912 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/about/styles.css | 1913 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/about/styles.css | 1914 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/about/styles.css | 1915 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/campaign/styles.css | 950 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/campaign/styles.css | 951 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/campaign/styles.css | 952 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
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
| assets/services/process/styles.css | 1223 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/process/styles.css | 1224 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/process/styles.css | 1225 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/site-audit/styles.css | 16 | .site-audit-page [hidden] | — | route-debt |
| assets/services/social/styles.css | 1040 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/social/styles.css | 1041 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/social/styles.css | 1042 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/web/styles.css | 1192 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/web/styles.css | 1193 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/services/web/styles.css | 1194 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
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
| assets/site-enhancements.css | 225 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-enhancements.css | 226 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-enhancements.css | 227 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-enhancements.css | 228 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-enhancements.css | 229 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-enhancements.css | 230 | *, *::before, *::after | @media (prefers-reduced-motion: reduce) | accessibility |
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
| assets/site-navigation.css | 197 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > a, .ok-nav-offer > summary | — | shared-contract |
| assets/site-navigation.css | 204 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > a, .ok-nav-offer > summary | — | shared-contract |
| assets/site-navigation.css | 277 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > a:not(.ok-nav-cta):hover, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a:not(.ok-nav-cta):focus-visible, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a.is-active, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a[aria-current="page"], .ok-nav-offer > summary:hover, .ok-nav-offer > summary:focus-visible, .ok-nav-offer > summary.is-active, .ok-nav-offer[open] > summary | — | shared-contract |
| assets/site-navigation.css | 292 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta | — | shared-contract |
| assets/site-navigation.css | 293 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta | — | shared-contract |
| assets/site-navigation.css | 294 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta | — | shared-contract |
| assets/site-navigation.css | 301 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta | — | shared-contract |
| assets/site-navigation.css | 308 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta:hover, body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta:focus-visible, body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta.is-active, body header[data-ok-global-nav] nav[data-ok-primary-nav] > .ok-nav-cta[aria-current="page"] | — | shared-contract |
| assets/site-navigation.css | 709 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | @media (max-width: 1180px), (max-aspect-ratio: 4 / 3) | shared-contract |
| assets/site-navigation.css | 710 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | @media (max-width: 1180px), (max-aspect-ratio: 4 / 3) | shared-contract |
| assets/site-navigation.css | 711 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | @media (max-width: 1180px), (max-aspect-ratio: 4 / 3) | shared-contract |
| assets/site-navigation.css | 712 | body header[data-ok-global-nav][data-ok-nav-state="detached"] | @media (max-width: 1180px), (max-aspect-ratio: 4 / 3) | shared-contract |
| assets/site-navigation.css | 827 | body header[data-ok-global-nav], body header[data-ok-global-nav] > a:first-child > img, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a::after, .ok-nav-offer > summary::after, .ok-nav-offer__mark, .ok-nav-trigger__signal::before, .ok-nav-trigger__signal::after, .ok-global-menu__surface, .ok-global-menu__nav a::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-navigation.css | 828 | body header[data-ok-global-nav], body header[data-ok-global-nav] > a:first-child > img, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a, body header[data-ok-global-nav] nav[data-ok-primary-nav] > a::after, .ok-nav-offer > summary::after, .ok-nav-offer__mark, .ok-nav-trigger__signal::before, .ok-nav-trigger__signal::after, .ok-global-menu__surface, .ok-global-menu__nav a::after | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/site-navigation.css | 837 | body header[data-ok-global-nav], body header[data-ok-global-nav][data-ok-nav-state="detached"], .ok-nav-offer__popover, .ok-global-menu__surface | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 838 | body header[data-ok-global-nav], body header[data-ok-global-nav][data-ok-nav-state="detached"], .ok-nav-offer__popover, .ok-global-menu__surface | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 839 | body header[data-ok-global-nav], body header[data-ok-global-nav][data-ok-nav-state="detached"], .ok-nav-offer__popover, .ok-global-menu__surface | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 840 | body header[data-ok-global-nav], body header[data-ok-global-nav][data-ok-nav-state="detached"], .ok-nav-offer__popover, .ok-global-menu__surface | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 849 | body header[data-ok-global-nav] nav[data-ok-primary-nav] > a, .ok-nav-offer > summary, .ok-nav-trigger, .ok-global-menu__close, .ok-global-menu__nav a | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 855 | .ok-nav-cta, .ok-global-menu__nav > .ok-global-menu__cta | @media (forced-colors: active) | shared-contract |
| assets/site-navigation.css | 872 | .ok-nav-trigger, .ok-global-menu, .ok-nav-slot | @media print | shared-contract |
| assets/site-navigation.css | 876 | body header[data-ok-global-nav] | @media print | shared-contract |
| assets/site-navigation.css | 880 | body header[data-ok-global-nav] nav[data-ok-primary-nav] | @media print | shared-contract |
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
| assets/story-standard.css | 93 | .proof-detail, .accordion-detail | — | shared-contract |
| assets/story-standard.css | 116 | .campaign-frame, .social-frame, .process-frame, .about-page .scene, .about-page .scene-art, .campaign-art, .proof-bloom | @media (prefers-reduced-motion: reduce) | accessibility |
| assets/story-standard.css | 117 | .campaign-frame, .social-frame, .process-frame, .about-page .scene, .about-page .scene-art, .campaign-art, .proof-bloom | @media (prefers-reduced-motion: reduce) | accessibility |

## Każda lokalna deklaracja typografii

| Plik | Linia | Selektor | Właściwość | Wartość | Kontekst | Klasyfikacja |
| --- | --- | --- | --- | --- | --- | --- |
| assets/content-system.css | 30 | .kicker | font-size | var(--ok-type-label) | — | semantic-token |
| assets/content-system.css | 31 | .kicker | font-weight | 650 | — | local-type-exception |
| assets/content-system.css | 32 | .kicker | letter-spacing | .16em | — | local-type-exception |
| assets/content-system.css | 33 | .kicker | line-height | 1.35 | — | local-type-exception |
| assets/content-system.css | 49 | .page-title, .section-title | font-family | var(--ok-font-display) | — | semantic-token |
| assets/content-system.css | 50 | .page-title, .section-title | font-weight | 600 | — | local-type-exception |
| assets/content-system.css | 51 | .page-title, .section-title | letter-spacing | -.01em | — | local-type-exception |
| assets/content-system.css | 52 | .page-title, .section-title | line-height | var(--ok-leading-display) | — | semantic-token |
| assets/content-system.css | 57 | .page-title | font-size | clamp(52px, 6.2vw, var(--ok-type-display-service)) | — | semantic-token |
| assets/content-system.css | 61 | .section-title | font-size | clamp(42px, 4.8vw, var(--ok-type-display-section)) | — | semantic-token |
| assets/content-system.css | 82 | .lead | font-size | max(16px, var(--ok-type-content)) | — | semantic-token |
| assets/content-system.css | 83 | .lead | line-height | var(--ok-leading-content) | — | semantic-token |
| assets/content-system.css | 116 | .field label, .field > span | font-size | max(15px, var(--ok-type-content)) | — | semantic-token |
| assets/content-system.css | 117 | .field label, .field > span | font-weight | 500 | — | local-type-exception |
| assets/content-system.css | 133 | .field input, .field select, .field textarea | font | inherit | — | local-type-exception |
| assets/content-system.css | 134 | .field input, .field select, .field textarea | font-size | max(16px, var(--ok-type-control)) | — | semantic-token |
| assets/content-system.css | 150 | .field textarea | line-height | var(--ok-leading-content) | — | semantic-token |
| assets/content-system.css | 167 | .field .error | font-size | var(--ok-type-content) | — | semantic-token |
| assets/content-system.css | 180 | .consent | font-size | var(--ok-type-content) | — | semantic-token |
| assets/content-system.css | 181 | .consent | line-height | var(--ok-leading-content) | — | semantic-token |
| assets/content-system.css | 251 | .submit | font | inherit | — | local-type-exception |
| assets/content-system.css | 252 | .submit | font-size | max(17px, var(--ok-type-control)) | — | semantic-token |
| assets/content-system.css | 253 | .submit | font-weight | 600 | — | local-type-exception |
| assets/content-system.css | 254 | .submit | letter-spacing | .02em | — | local-type-exception |
| assets/content-system.css | 274 | .submit .arr | font-size | max(19px, var(--ok-type-icon)) | — | semantic-token |
| assets/content-system.css | 286 | .secondary-action | font | inherit | — | local-type-exception |
| assets/content-system.css | 287 | .secondary-action | font-size | var(--ok-type-content) | — | semantic-token |
| assets/content-system.css | 288 | .secondary-action | font-weight | 550 | — | local-type-exception |
| assets/content-system.css | 299 | .form-status | font-size | var(--ok-type-content) | — | semantic-token |
| assets/content-system.css | 300 | .form-status | line-height | var(--ok-leading-content) | — | semantic-token |
| assets/content-system.css | 323 | .form--compact .submit | font-size | max(16px, var(--ok-type-control)) | — | semantic-token |
| assets/content-system.css | 335 | .page-title | font-size | clamp(52px, 17vw, 72px) | @media (max-width: 640px) | local-type-exception |
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
| assets/page-contact.css | 87 | .site-nav a | font-size | 12px | — | local-type-exception |
| assets/page-contact.css | 88 | .site-nav a | font-weight | 600 | — | local-type-exception |
| assets/page-contact.css | 89 | .site-nav a | letter-spacing | .16em | — | local-type-exception |
| assets/page-contact.css | 132 | .back-link | font-size | 15px | — | local-type-exception |
| assets/page-contact.css | 133 | .back-link | font-weight | 500 | — | local-type-exception |
| assets/page-contact.css | 153 | .proof li | font-size | 14px | — | local-type-exception |
| assets/page-contact.css | 154 | .proof li | line-height | 1.4 | — | local-type-exception |
| assets/page-contact.css | 200 | .direct-mail p, .context-note p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-contact.css | 201 | .direct-mail p, .context-note p | line-height | 1.45 | — | local-type-exception |
| assets/page-contact.css | 208 | .direct-mail a | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-contact.css | 209 | .direct-mail a | font-size | 23px | — | local-type-exception |
| assets/page-contact.css | 210 | .direct-mail a | font-weight | 600 | — | local-type-exception |
| assets/page-contact.css | 217 | .direct-mail small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-contact.css | 218 | .direct-mail small | line-height | 1.4 | — | local-type-exception |
| assets/page-contact.css | 228 | .context-note strong | font-size | 13px | — | local-type-exception |
| assets/page-contact.css | 240 | .contact-field-hint | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-contact.css | 241 | .contact-field-hint | line-height | 1.4 | — | local-type-exception |
| assets/page-contact.css | 250 | .mailto-helper | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-contact.css | 251 | .mailto-helper | line-height | 1.45 | — | local-type-exception |
| assets/page-contact.css | 264 | .validation-summary | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-contact.css | 265 | .validation-summary | font-weight | 600 | — | local-type-exception |
| assets/page-contact.css | 279 | .validation-summary::before, .field.is-invalid .error::before, .consent-error::before | font-size | 9px | — | local-type-exception |
| assets/page-contact.css | 280 | .validation-summary::before, .field.is-invalid .error::before, .consent-error::before | line-height | 1 | — | local-type-exception |
| assets/page-contact.css | 287 | .field.is-invalid .error | line-height | 1.35 | — | local-type-exception |
| assets/page-contact.css | 303 | .consent-error | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-contact.css | 304 | .consent-error | font-weight | 500 | — | local-type-exception |
| assets/page-contact.css | 327 | .flow-state > p | font-size | 14px | — | local-type-exception |
| assets/page-contact.css | 328 | .flow-state > p | line-height | 1.55 | — | local-type-exception |
| assets/page-contact.css | 336 | .state-email | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-contact.css | 337 | .state-email | font-size | 27px | — | local-type-exception |
| assets/page-contact.css | 338 | .state-email | font-weight | 600 | — | local-type-exception |
| assets/page-contact.css | 356 | .copy-address | font-weight | 600 | — | local-type-exception |
| assets/page-contact.css | 362 | .copy-feedback | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-contact.css | 363 | .copy-feedback | font-weight | 500 | — | local-type-exception |
| assets/page-contact.css | 457 | .site-nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 640px) | semantic-token |
| assets/page-contact.css | 457 | .site-nav a | letter-spacing | .12em | @media (max-width: 640px) | local-type-exception |
| assets/page-contact.css | 468 | .direct-mail a | font-size | 25px | @media (max-width: 640px) | local-type-exception |
| assets/page-contact.css | 471 | .mailto-helper | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 640px) | semantic-token |
| assets/page-contact.css | 472 | .flow-state > p | font-size | 15px | @media (max-width: 640px) | local-type-exception |
| assets/page-contact.css | 473 | .state-email | font-size | 26px | @media (max-width: 640px) | local-type-exception |
| assets/page-faq.css | 26 | body.faq-page | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/page-faq.css | 37 | .faq-skip | font-size | 13px | — | local-type-exception |
| assets/page-faq.css | 68 | .faq-kicker, .faq-list__label | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/page-faq.css | 69 | .faq-kicker, .faq-list__label | font-weight | 720 | — | local-type-exception |
| assets/page-faq.css | 70 | .faq-kicker, .faq-list__label | letter-spacing | .18em | — | local-type-exception |
| assets/page-faq.css | 71 | .faq-kicker, .faq-list__label | line-height | 1.4 | — | local-type-exception |
| assets/page-faq.css | 77 | .faq-intro h1 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-faq.css | 78 | .faq-intro h1 | font-size | clamp(58px, 6.3vw, 108px) | — | local-type-exception |
| assets/page-faq.css | 79 | .faq-intro h1 | font-weight | 430 | — | local-type-exception |
| assets/page-faq.css | 80 | .faq-intro h1 | letter-spacing | -.045em | — | local-type-exception |
| assets/page-faq.css | 81 | .faq-intro h1 | line-height | .82 | — | local-type-exception |
| assets/page-faq.css | 86 | .faq-intro h1 em | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-faq.css | 88 | .faq-intro h1 em | font-weight | 500 | — | local-type-exception |
| assets/page-faq.css | 95 | .faq-lead | font-size | clamp(16px, 1.15vw, 19px) | — | local-type-exception |
| assets/page-faq.css | 96 | .faq-lead | line-height | 1.65 | — | local-type-exception |
| assets/page-faq.css | 107 | .faq-intro__link | font-size | 13px | — | local-type-exception |
| assets/page-faq.css | 108 | .faq-intro__link | font-weight | 680 | — | local-type-exception |
| assets/page-faq.css | 148 | .faq-list summary | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-faq.css | 149 | .faq-list summary | font-size | clamp(25px, 2.15vw, 38px) | — | local-type-exception |
| assets/page-faq.css | 150 | .faq-list summary | font-weight | 480 | — | local-type-exception |
| assets/page-faq.css | 151 | .faq-list summary | line-height | 1.05 | — | local-type-exception |
| assets/page-faq.css | 164 | .faq-number | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/page-faq.css | 165 | .faq-number | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/page-faq.css | 166 | .faq-number | font-weight | 720 | — | local-type-exception |
| assets/page-faq.css | 167 | .faq-number | letter-spacing | .16em | — | local-type-exception |
| assets/page-faq.css | 225 | .faq-answer p | font-size | clamp(15px, 1.05vw, 18px) | — | local-type-exception |
| assets/page-faq.css | 226 | .faq-answer p | line-height | 1.7 | — | local-type-exception |
| assets/page-faq.css | 241 | .faq-cta p | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-faq.css | 242 | .faq-cta p | font-size | clamp(28px, 3vw, 46px) | — | local-type-exception |
| assets/page-faq.css | 243 | .faq-cta p | line-height | .98 | — | local-type-exception |
| assets/page-faq.css | 249 | .faq-cta p span | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-faq.css | 261 | .faq-cta a | font-size | 12px | — | local-type-exception |
| assets/page-faq.css | 262 | .faq-cta a | font-weight | 720 | — | local-type-exception |
| assets/page-faq.css | 263 | .faq-cta a | letter-spacing | .12em | — | local-type-exception |
| assets/page-faq.css | 292 | .faq-intro h1 | font-size | clamp(64px, 11vw, 104px) | @media (max-width: 980px) | local-type-exception |
| assets/page-faq.css | 309 | .faq-intro h1 | font-size | clamp(54px, 17vw, 76px) | @media (max-width: 600px) | local-type-exception |
| assets/page-faq.css | 314 | .faq-lead | font-size | 15px | @media (max-width: 600px) | local-type-exception |
| assets/page-faq.css | 322 | .faq-list summary | font-size | 25px | @media (max-width: 600px) | local-type-exception |
| assets/page-faq.css | 330 | .faq-answer p | font-size | 15px | @media (max-width: 600px) | local-type-exception |
| assets/page-home.css | 24 | body | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/page-home.css | 29 | button, a | font | inherit | — | local-type-exception |
| assets/page-home.css | 134 | .nav a | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/page-home.css | 135 | .nav a | font-weight | 600 | — | local-type-exception |
| assets/page-home.css | 136 | .nav a | letter-spacing | .17em | — | local-type-exception |
| assets/page-home.css | 178 | .scene-label, .detail-kicker | letter-spacing | .2em | — | local-type-exception |
| assets/page-home.css | 179 | .scene-label, .detail-kicker | font-weight | 600 | — | local-type-exception |
| assets/page-home.css | 183 | .detail-kicker | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/page-home.css | 203 | h1 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-home.css | 204 | h1 | font-weight | 500 | — | local-type-exception |
| assets/page-home.css | 206 | h1 | line-height | .775 | — | local-type-exception |
| assets/page-home.css | 207 | h1 | letter-spacing | -.062em | — | local-type-exception |
| assets/page-home.css | 220 | .descriptor | letter-spacing | .07em | — | local-type-exception |
| assets/page-home.css | 221 | .descriptor | line-height | 1.6 | — | local-type-exception |
| assets/page-home.css | 228 | .value-lead | font-size | clamp(.95rem, 1.05vw, 1.12rem) | — | local-type-exception |
| assets/page-home.css | 229 | .value-lead | line-height | 1.55 | — | local-type-exception |
| assets/page-home.css | 242 | .cta | font-weight | 600 | — | local-type-exception |
| assets/page-home.css | 243 | .cta | letter-spacing | .035em | — | local-type-exception |
| assets/page-home.css | 265 | .cta::after | font-size | 1.1rem | — | local-type-exception |
| assets/page-home.css | 441 | .detail h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-home.css | 442 | .detail h2 | font-size | clamp(3.7rem, 6vw, 6.8rem) | — | local-type-exception |
| assets/page-home.css | 443 | .detail h2 | line-height | .85 | — | local-type-exception |
| assets/page-home.css | 444 | .detail h2 | letter-spacing | -.045em | — | local-type-exception |
| assets/page-home.css | 445 | .detail h2 | font-weight | 500 | — | local-type-exception |
| assets/page-home.css | 452 | .detail p | line-height | 1.7 | — | local-type-exception |
| assets/page-home.css | 453 | .detail p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-home.css | 463 | .detail .anchor-spec | letter-spacing | .16em | — | local-type-exception |
| assets/page-home.css | 464 | .detail .anchor-spec | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/page-home.css | 465 | .detail .anchor-spec | line-height | 1.45 | — | local-type-exception |
| assets/page-home.css | 485 | .back | letter-spacing | .15em | — | local-type-exception |
| assets/page-home.css | 486 | .back | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/page-home.css | 574 | .nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 1024px) and (min-width: 641px) | semantic-token |
| assets/page-home.css | 606 | .detail h2 | font-size | clamp(4.8rem, 10vw, 6.2rem) | @media (max-width: 1024px) and (min-width: 641px) | local-type-exception |
| assets/page-home.css | 626 | .detail h2 | font-size | clamp(4rem, 8vw, 5rem) | @media (max-width: 1024px) and (min-width: 641px) and (orientation: landscape) | local-type-exception |
| assets/page-home.css | 631 | .detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 1024px) and (min-width: 641px) and (orientation: landscape) | semantic-token |
| assets/page-home.css | 632 | .detail p | line-height | 1.55 | @media (max-width: 1024px) and (min-width: 641px) and (orientation: landscape) | local-type-exception |
| assets/page-home.css | 662 | .nav a | font-size | .75rem | @media (max-width: 640px) | local-type-exception |
| assets/page-home.css | 663 | .nav a | letter-spacing | .12em | @media (max-width: 640px) | local-type-exception |
| assets/page-home.css | 687 | .detail h2 | font-size | clamp(3.5rem, 16vw, 5rem) | @media (max-width: 640px) | local-type-exception |
| assets/page-home.css | 692 | .detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 640px) | semantic-token |
| assets/page-home.css | 717 | .detail h2 | font-size | 3.25rem | @media (max-width: 640px) and (max-height: 720px) | local-type-exception |
| assets/page-home.css | 722 | .detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 640px) and (max-height: 720px) | semantic-token |
| assets/page-home.css | 723 | .detail p | line-height | 1.45 | @media (max-width: 640px) and (max-height: 720px) | local-type-exception |
| assets/page-home.css | 728 | .detail .anchor-spec | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 640px) and (max-height: 720px) | semantic-token |
| assets/page-home.css | 1078 | .nav a | font-size | clamp(.78rem, .55vw, .88rem) | — | local-type-exception |
| assets/page-home.css | 1079 | .nav a | letter-spacing | .18em | — | local-type-exception |
| assets/page-home.css | 1083 | .detail-kicker | font-size | .78rem | — | local-type-exception |
| assets/page-home.css | 1097 | .cta::after | font-size | 1.25rem | — | local-type-exception |
| assets/page-home.css | 1138 | .home-intro h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-home.css | 1139 | .home-intro h2 | font-weight | 500 | — | local-type-exception |
| assets/page-home.css | 1140 | .home-intro h2 | letter-spacing | -.035em | — | local-type-exception |
| assets/page-home.css | 1155 | .home-intro__copy p, .home-intro__trust | font-size | var(--ok-type-content, 15px) | — | semantic-token |
| assets/page-home.css | 1156 | .home-intro__copy p, .home-intro__trust | line-height | var(--ok-leading-content, 1.5) | — | semantic-token |
| assets/page-home.css | 1191 | .home-service span | font-size | 13px | — | local-type-exception |
| assets/page-home.css | 1192 | .home-service span | font-weight | 700 | — | local-type-exception |
| assets/page-home.css | 1193 | .home-service span | letter-spacing | .16em | — | local-type-exception |
| assets/page-home.css | 1199 | .home-service h3 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/page-home.css | 1200 | .home-service h3 | font-size | clamp(32px, 3.1vw, 48px) | — | local-type-exception |
| assets/page-home.css | 1201 | .home-service h3 | font-weight | 500 | — | local-type-exception |
| assets/page-home.css | 1202 | .home-service h3 | line-height | 1 | — | local-type-exception |
| assets/page-home.css | 1209 | .home-service p | font-size | 15px | — | local-type-exception |
| assets/page-home.css | 1210 | .home-service p | line-height | 1.65 | — | local-type-exception |
| assets/page-home.css | 1234 | .home-intro__cta | font-size | 14px | — | local-type-exception |
| assets/page-home.css | 1235 | .home-intro__cta | font-weight | 650 | — | local-type-exception |
| assets/page-home.css | 1236 | .home-intro__cta | letter-spacing | .025em | — | local-type-exception |
| assets/page-home.css | 1263 | .home-intro__cta::after | font-size | 1.15rem | — | local-type-exception |
| assets/page-home.css | 1303 | .home-intro__trust a | font-weight | 700 | — | local-type-exception |
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
| assets/services/about/styles.css | 287 | .lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 288 | .lead | line-height | 1.55 | — | local-type-exception |
| assets/services/about/styles.css | 322 | .chips li | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/about/styles.css | 323 | .chips li | font-weight | 650 | — | local-type-exception |
| assets/services/about/styles.css | 324 | .chips li | letter-spacing | .1em | — | local-type-exception |
| assets/services/about/styles.css | 394 | .facts strong, .model-points strong | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 395 | .facts strong, .model-points strong | font-size | 19px | — | local-type-exception |
| assets/services/about/styles.css | 396 | .facts strong, .model-points strong | font-weight | 600 | — | local-type-exception |
| assets/services/about/styles.css | 397 | .facts strong, .model-points strong | letter-spacing | .045em | — | local-type-exception |
| assets/services/about/styles.css | 403 | .row-index | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 404 | .row-index | font-size | 24px | — | local-type-exception |
| assets/services/about/styles.css | 405 | .row-index | font-weight | 400 | — | local-type-exception |
| assets/services/about/styles.css | 406 | .row-index | line-height | 1 | — | local-type-exception |
| assets/services/about/styles.css | 419 | .facts .row-content > span, .model-points .row-content > span | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 420 | .facts .row-content > span, .model-points .row-content > span | line-height | 1.5 | — | local-type-exception |
| assets/services/about/styles.css | 434 | .result | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 435 | .result | font-weight | 520 | — | local-type-exception |
| assets/services/about/styles.css | 436 | .result | line-height | 1.5 | — | local-type-exception |
| assets/services/about/styles.css | 473 | .primary-cta, .text-link | font-size | var(--ok-type-control, 15px) | — | semantic-token |
| assets/services/about/styles.css | 474 | .primary-cta, .text-link | font-weight | 600 | — | local-type-exception |
| assets/services/about/styles.css | 478 | .primary-cta span | font-size | inherit | — | local-type-exception |
| assets/services/about/styles.css | 564 | .portrait-frame figcaption | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/about/styles.css | 565 | .portrait-frame figcaption | font-weight | 650 | — | local-type-exception |
| assets/services/about/styles.css | 566 | .portrait-frame figcaption | letter-spacing | .13em | — | local-type-exception |
| assets/services/about/styles.css | 581 | .scene-02 h2 | font-size | clamp(54px, 4.25vw, 72px) | — | local-type-exception |
| assets/services/about/styles.css | 589 | .scene-03 h2 | font-size | clamp(54px, 4.35vw, 74px) | — | local-type-exception |
| assets/services/about/styles.css | 600 | .proof-statement | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 601 | .proof-statement | font-size | clamp(18px, 1.3vw, 23px) | — | local-type-exception |
| assets/services/about/styles.css | 602 | .proof-statement | line-height | 1.12 | — | local-type-exception |
| assets/services/about/styles.css | 610 | .scene-04 h2 | font-size | clamp(48px, 3.85vw, 66px) | — | local-type-exception |
| assets/services/about/styles.css | 616 | .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 644 | .accordion-index | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 645 | .accordion-index | font-size | 24px | — | local-type-exception |
| assets/services/about/styles.css | 646 | .accordion-index | line-height | 1 | — | local-type-exception |
| assets/services/about/styles.css | 655 | .accordion-label strong | font-size | 12px | — | local-type-exception |
| assets/services/about/styles.css | 656 | .accordion-label strong | font-weight | 650 | — | local-type-exception |
| assets/services/about/styles.css | 657 | .accordion-label strong | letter-spacing | .1em | — | local-type-exception |
| assets/services/about/styles.css | 663 | .accordion-label small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 664 | .accordion-label small | line-height | 1.42 | — | local-type-exception |
| assets/services/about/styles.css | 710 | .accordion-detail p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 711 | .accordion-detail p | line-height | 1.5 | — | local-type-exception |
| assets/services/about/styles.css | 717 | .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 752 | .mobile-details summary | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 753 | .mobile-details summary | font-size | 14px | — | local-type-exception |
| assets/services/about/styles.css | 754 | .mobile-details summary | font-weight | 600 | — | local-type-exception |
| assets/services/about/styles.css | 755 | .mobile-details summary | letter-spacing | .03em | — | local-type-exception |
| assets/services/about/styles.css | 768 | .mobile-details summary::after | font-family | var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/services/about/styles.css | 769 | .mobile-details summary::after | font-weight | 400 | — | local-type-exception |
| assets/services/about/styles.css | 779 | .mobile-details p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/about/styles.css | 780 | .mobile-details p | line-height | 1.45 | — | local-type-exception |
| assets/services/about/styles.css | 846 | h1 | font-size | clamp(58px, 5vw, 78px) | @media (max-height: 800px) and (min-width: 901px) | local-type-exception |
| assets/services/about/styles.css | 850 | h2 | font-size | clamp(48px, 4vw, 66px) | @media (max-height: 800px) and (min-width: 901px) | local-type-exception |
| assets/services/about/styles.css | 868 | .facts strong, .model-points strong | font-size | 17px | @media (max-height: 800px) and (min-width: 901px) | local-type-exception |
| assets/services/about/styles.css | 877 | .facts .row-content > span, .model-points .row-content > span, .scene-04 .lead, .accordion-label small, .accordion-detail p, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (max-height: 800px) and (min-width: 901px) | semantic-token |
| assets/services/about/styles.css | 885 | .accordion-label strong | font-size | 12px | @media (max-height: 800px) and (min-width: 901px) | local-type-exception |
| assets/services/about/styles.css | 957 | h1 | font-size | clamp(62px, 7vw, 74px) | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 962 | h2, .scene-03 h2 | font-size | clamp(48px, 5.4vw, 58px) | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 967 | .scene-02 h2, .scene-04 h2 | font-size | clamp(43px, 4.8vw, 51px) | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 973 | .lead, .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) | semantic-token |
| assets/services/about/styles.css | 989 | .facts strong, .model-points strong | font-size | 16px | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 994 | .facts .row-content > span, .model-points .row-content > span | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) | semantic-token |
| assets/services/about/styles.css | 995 | .facts .row-content > span, .model-points .row-content > span | line-height | 1.42 | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 1001 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) | semantic-token |
| assets/services/about/styles.css | 1029 | .proof-statement | font-size | 17px | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 1042 | .accordion-label strong | font-size | 12px | @media (min-width: 901px) and (max-width: 1100px) | local-type-exception |
| assets/services/about/styles.css | 1047 | .accordion-label small, .accordion-detail p | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) | semantic-token |
| assets/services/about/styles.css | 1082 | .site-header nav a | letter-spacing | .08em | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1140 | .kicker | font-size | 12px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1148 | h1 | font-size | clamp(43px, 12.4vw, 52px) | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1155 | h2, .scene-02 h2, .scene-03 h2, .scene-04 h2 | font-size | clamp(38px, 10.6vw, 45px) | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1161 | .lead, .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1162 | .lead, .scene-04 .lead | line-height | 1.48 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1172 | .chips li | font-size | 12px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1205 | .facts strong, .model-points strong | font-size | 15px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1211 | .facts .row-content > span, .model-points .row-content > span | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1212 | .facts .row-content > span, .model-points .row-content > span | line-height | 1.42 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1219 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1220 | .result, .scene-04 .result | line-height | 1.45 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1265 | .mobile-details summary | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1266 | .mobile-details summary | font-size | 14px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1267 | .mobile-details summary | font-weight | 600 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1268 | .mobile-details summary | letter-spacing | .03em | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1281 | .mobile-details summary::after | font-family | var(--ok-font-body, "Archivo", sans-serif) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1282 | .mobile-details summary::after | font-weight | 400 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1292 | .mobile-details p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1293 | .mobile-details p | line-height | 1.45 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1333 | .portrait-frame figcaption | font-size | 12px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1354 | .proof-statement | font-size | 16px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1369 | .accordion-index | font-size | 21px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1373 | .accordion-label strong | font-size | 12px | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1377 | .accordion-label small | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1378 | .accordion-label small | line-height | 1.4 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1391 | .accordion-detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1392 | .accordion-detail p | line-height | 1.48 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1433 | .about-page .scene-01 h1 | font-size | clamp(42px, 4.4vw, 46px) | @media (min-width: 821px) and (max-height: 700px) | local-type-exception |
| assets/services/about/styles.css | 1437 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | clamp(43px, 4.7vw, 49px) | @media (min-width: 821px) and (max-height: 700px) | local-type-exception |
| assets/services/about/styles.css | 1470 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | clamp(39px, 4.1vw, 43px) | @media (min-width: 821px) and (max-height: 620px) | local-type-exception |
| assets/services/about/styles.css | 1479 | .about-page .chips li | letter-spacing | .06em | @media (min-width: 821px) and (max-height: 620px) | local-type-exception |
| assets/services/about/styles.css | 1536 | .site-header nav a | letter-spacing | .11em | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1550 | h1 | font-size | 64px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1557 | h2, .scene-02 h2, .scene-03 h2, .scene-04 h2 | font-size | 50px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1562 | .lead, .scene-04 .lead | font-size | 14px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1566 | .chips li | font-size | 12px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1580 | .facts strong, .model-points strong | font-size | 16px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1585 | .facts .row-content > span, .model-points .row-content > span | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 600px) and (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1590 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 600px) and (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1595 | .mobile-details summary | font-size | 16px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1599 | .mobile-details p | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 600px) and (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1611 | .portrait-frame figcaption | font-size | 12px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1626 | .proof-statement | font-size | 18px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1635 | .accordion-label strong | font-size | 12px | @media (min-width: 600px) and (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1640 | .accordion-label small, .accordion-detail p | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 600px) and (max-width: 900px) | semantic-token |
| assets/services/about/styles.css | 1666 | .scene-04 .lead | line-height | 1.42 | @media (max-width: 900px) | local-type-exception |
| assets/services/about/styles.css | 1716 | .scene-02 h2 | font-size | clamp(34px, 9.5vw, 38px) | @media (max-width: 599px) | local-type-exception |
| assets/services/about/styles.css | 1720 | .scene-02 .lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 599px) | semantic-token |
| assets/services/about/styles.css | 1721 | .scene-02 .lead | line-height | 1.42 | @media (max-width: 599px) | local-type-exception |
| assets/services/about/styles.css | 1737 | .scene-02 .facts strong | font-size | 14px | @media (max-width: 599px) | local-type-exception |
| assets/services/about/styles.css | 1749 | .scene-02 .portrait-frame figcaption | letter-spacing | .06em | @media (max-width: 599px) | local-type-exception |
| assets/services/about/styles.css | 1795 | .scene-01 h1, .scene-03 h2 | font-size | clamp(38px, 11.5vw, 44px) | @media (max-width: 390px) and (max-height: 740px) | local-type-exception |
| assets/services/about/styles.css | 1799 | .scene-02 h2 | font-size | 31px | @media (max-width: 390px) and (max-height: 740px) | local-type-exception |
| assets/services/about/styles.css | 1805 | .scene-01 .lead, .scene-03 .lead | line-height | 1.35 | @media (max-width: 390px) and (max-height: 740px) | local-type-exception |
| assets/services/about/styles.css | 1819 | .mobile-details p | line-height | 1.35 | @media (max-width: 390px) and (max-height: 740px) | local-type-exception |
| assets/services/about/styles.css | 1888 | .about-page .scene-01 h1 | font-size | 46px | — | local-type-exception |
| assets/services/about/styles.css | 1892 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | 39px | — | local-type-exception |
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
| assets/services/campaign/styles.css | 314 | .journey-intro h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/campaign/styles.css | 315 | .journey-intro h2 | font-size | clamp(58px, 4.9vw, 82px) | — | local-type-exception |
| assets/services/campaign/styles.css | 316 | .journey-intro h2 | font-weight | 500 | — | local-type-exception |
| assets/services/campaign/styles.css | 317 | .journey-intro h2 | letter-spacing | .005em | — | local-type-exception |
| assets/services/campaign/styles.css | 323 | .journey-intro p | font-size | clamp(14px, .96vw, 17px) | — | local-type-exception |
| assets/services/campaign/styles.css | 324 | .journey-intro p | line-height | 1.55 | — | local-type-exception |
| assets/services/campaign/styles.css | 361 | .proof-content h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/campaign/styles.css | 362 | .proof-content h2 | font-size | clamp(58px, 4.65vw, 78px) | — | local-type-exception |
| assets/services/campaign/styles.css | 363 | .proof-content h2 | font-weight | 500 | — | local-type-exception |
| assets/services/campaign/styles.css | 364 | .proof-content h2 | letter-spacing | -.025em | — | local-type-exception |
| assets/services/campaign/styles.css | 376 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 377 | .proof-lead | line-height | 1.55 | — | local-type-exception |
| assets/services/campaign/styles.css | 401 | .proof-trigger | font | inherit | — | local-type-exception |
| assets/services/campaign/styles.css | 431 | .proof-index | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/campaign/styles.css | 432 | .proof-index | font-size | 24px | — | local-type-exception |
| assets/services/campaign/styles.css | 433 | .proof-index | line-height | 1 | — | local-type-exception |
| assets/services/campaign/styles.css | 442 | .proof-label strong | font-size | 12px | — | local-type-exception |
| assets/services/campaign/styles.css | 443 | .proof-label strong | font-weight | 650 | — | local-type-exception |
| assets/services/campaign/styles.css | 444 | .proof-label strong | letter-spacing | .09em | — | local-type-exception |
| assets/services/campaign/styles.css | 451 | .proof-label small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 452 | .proof-label small | line-height | 1.42 | — | local-type-exception |
| assets/services/campaign/styles.css | 480 | .proof-detail p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 481 | .proof-detail p | line-height | 1.45 | — | local-type-exception |
| assets/services/campaign/styles.css | 486 | .proof-detail b | font-weight | 650 | — | local-type-exception |
| assets/services/campaign/styles.css | 493 | .proof-output | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 494 | .proof-output | line-height | 1.48 | — | local-type-exception |
| assets/services/campaign/styles.css | 518 | .proof-primary | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 519 | .proof-primary | font-weight | 550 | — | local-type-exception |
| assets/services/campaign/styles.css | 551 | .proof-secondary | font-size | 12px | — | local-type-exception |
| assets/services/campaign/styles.css | 552 | .proof-secondary | font-weight | 550 | — | local-type-exception |
| assets/services/campaign/styles.css | 581 | .journey-note h3 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/campaign/styles.css | 582 | .journey-note h3 | font-weight | 500 | — | local-type-exception |
| assets/services/campaign/styles.css | 587 | .journey-note h3 b | font-size | clamp(48px, 3.25vw, 58px) | — | local-type-exception |
| assets/services/campaign/styles.css | 588 | .journey-note h3 b | font-weight | 400 | — | local-type-exception |
| assets/services/campaign/styles.css | 589 | .journey-note h3 b | line-height | .9 | — | local-type-exception |
| assets/services/campaign/styles.css | 594 | .journey-note h3 span | font-size | clamp(20px, 1.4vw, 25px) | — | local-type-exception |
| assets/services/campaign/styles.css | 595 | .journey-note h3 span | font-weight | 600 | — | local-type-exception |
| assets/services/campaign/styles.css | 596 | .journey-note h3 span | letter-spacing | .03em | — | local-type-exception |
| assets/services/campaign/styles.css | 602 | .journey-note p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 603 | .journey-note p | line-height | 1.55 | — | local-type-exception |
| assets/services/campaign/styles.css | 611 | .journey-note small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/campaign/styles.css | 612 | .journey-note small | line-height | 1.45 | — | local-type-exception |
| assets/services/campaign/styles.css | 692 | .opening-copy h1 | font-size | clamp(48px, 6.2vw, 64px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/campaign/styles.css | 701 | .proof-content h2 | font-size | clamp(48px, 5.4vw, 62px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/campaign/styles.css | 746 | .opening-copy h1 | font-size | clamp(48px, 14vw, 72px) | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 770 | .journey-intro h2 | font-size | clamp(54px, 16vw, 76px) | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 776 | .journey-intro > p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 802 | .journey-mobile-steps b | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 803 | .journey-mobile-steps b | font-size | 24px | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 804 | .journey-mobile-steps b | font-weight | 400 | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 813 | .journey-mobile-steps strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 814 | .journey-mobile-steps strong | letter-spacing | .08em | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 820 | .journey-mobile-steps small | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 821 | .journey-mobile-steps small | line-height | 1.4 | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 845 | .proof-content h2 | font-size | clamp(43px, 12.7vw, 56px) | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 850 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 865 | .proof-index | font-size | 20px | @media (max-width: 820px) | local-type-exception |
| assets/services/campaign/styles.css | 873 | .proof-label strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 878 | .proof-label small, .proof-detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 891 | .proof-output | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/campaign/styles.css | 919 | .campaign-proof .proof-content h2 | font-size | 36px | @media (max-width: 640px) and (max-height: 700px) | local-type-exception |
| assets/services/campaign/styles.css | 924 | .campaign-proof .proof-lead | line-height | 1.35 | @media (max-width: 640px) and (max-height: 700px) | local-type-exception |
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
| assets/services/process/styles.css | 314 | .journey-intro h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 315 | .journey-intro h2 | font-size | clamp(58px, 4.9vw, 82px) | — | local-type-exception |
| assets/services/process/styles.css | 316 | .journey-intro h2 | font-weight | 500 | — | local-type-exception |
| assets/services/process/styles.css | 317 | .journey-intro h2 | letter-spacing | .005em | — | local-type-exception |
| assets/services/process/styles.css | 323 | .journey-intro p | font-size | clamp(14px, .96vw, 17px) | — | local-type-exception |
| assets/services/process/styles.css | 324 | .journey-intro p | line-height | 1.55 | — | local-type-exception |
| assets/services/process/styles.css | 361 | .proof-content h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 362 | .proof-content h2 | font-size | clamp(58px, 4.65vw, 78px) | — | local-type-exception |
| assets/services/process/styles.css | 363 | .proof-content h2 | font-weight | 500 | — | local-type-exception |
| assets/services/process/styles.css | 364 | .proof-content h2 | letter-spacing | -.025em | — | local-type-exception |
| assets/services/process/styles.css | 376 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 377 | .proof-lead | line-height | 1.55 | — | local-type-exception |
| assets/services/process/styles.css | 401 | .proof-trigger | font | inherit | — | local-type-exception |
| assets/services/process/styles.css | 431 | .proof-index | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 432 | .proof-index | font-size | 24px | — | local-type-exception |
| assets/services/process/styles.css | 433 | .proof-index | line-height | 1 | — | local-type-exception |
| assets/services/process/styles.css | 442 | .proof-label strong | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/process/styles.css | 443 | .proof-label strong | font-weight | 650 | — | local-type-exception |
| assets/services/process/styles.css | 444 | .proof-label strong | letter-spacing | .09em | — | local-type-exception |
| assets/services/process/styles.css | 451 | .proof-label small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 452 | .proof-label small | line-height | 1.42 | — | local-type-exception |
| assets/services/process/styles.css | 480 | .proof-detail p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 481 | .proof-detail p | line-height | 1.45 | — | local-type-exception |
| assets/services/process/styles.css | 486 | .proof-detail b | font-weight | 650 | — | local-type-exception |
| assets/services/process/styles.css | 493 | .proof-output | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 494 | .proof-output | line-height | 1.48 | — | local-type-exception |
| assets/services/process/styles.css | 518 | .proof-primary | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 519 | .proof-primary | font-weight | 550 | — | local-type-exception |
| assets/services/process/styles.css | 551 | .proof-secondary | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/process/styles.css | 552 | .proof-secondary | font-weight | 550 | — | local-type-exception |
| assets/services/process/styles.css | 581 | .journey-note h3 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 582 | .journey-note h3 | font-weight | 500 | — | local-type-exception |
| assets/services/process/styles.css | 587 | .journey-note h3 b | font-size | clamp(48px, 3.25vw, 58px) | — | local-type-exception |
| assets/services/process/styles.css | 588 | .journey-note h3 b | font-weight | 400 | — | local-type-exception |
| assets/services/process/styles.css | 589 | .journey-note h3 b | line-height | .9 | — | local-type-exception |
| assets/services/process/styles.css | 594 | .journey-note h3 span | font-size | clamp(20px, 1.4vw, 25px) | — | local-type-exception |
| assets/services/process/styles.css | 595 | .journey-note h3 span | font-weight | 600 | — | local-type-exception |
| assets/services/process/styles.css | 596 | .journey-note h3 span | letter-spacing | .03em | — | local-type-exception |
| assets/services/process/styles.css | 602 | .journey-note p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 603 | .journey-note p | line-height | 1.55 | — | local-type-exception |
| assets/services/process/styles.css | 611 | .journey-note small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 612 | .journey-note small | line-height | 1.45 | — | local-type-exception |
| assets/services/process/styles.css | 692 | .opening-copy h1 | font-size | clamp(48px, 6.2vw, 64px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/process/styles.css | 701 | .proof-content h2 | font-size | clamp(48px, 5.4vw, 62px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/process/styles.css | 740 | .opening-copy h1 | font-size | clamp(48px, 14vw, 72px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 764 | .journey-intro h2 | font-size | clamp(54px, 16vw, 76px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 770 | .journey-intro > p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 796 | .journey-mobile-steps b | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 797 | .journey-mobile-steps b | font-size | 24px | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 798 | .journey-mobile-steps b | font-weight | 400 | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 807 | .journey-mobile-steps strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 808 | .journey-mobile-steps strong | letter-spacing | .08em | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 814 | .journey-mobile-steps small | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 815 | .journey-mobile-steps small | line-height | 1.4 | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 839 | .proof-content h2 | font-size | clamp(43px, 12.7vw, 56px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 844 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 859 | .proof-index | font-size | 20px | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 867 | .proof-label strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 872 | .proof-label small, .proof-detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 885 | .proof-output | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 931 | .process-act | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/process/styles.css | 932 | .process-act | font-weight | 650 | — | local-type-exception |
| assets/services/process/styles.css | 933 | .process-act | letter-spacing | .12em | — | local-type-exception |
| assets/services/process/styles.css | 946 | .process-editorial-content h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 947 | .process-editorial-content h2 | font-size | clamp(58px, 4.7vw, 79px) | — | local-type-exception |
| assets/services/process/styles.css | 948 | .process-editorial-content h2 | font-weight | 500 | — | local-type-exception |
| assets/services/process/styles.css | 949 | .process-editorial-content h2 | letter-spacing | -.025em | — | local-type-exception |
| assets/services/process/styles.css | 961 | .process-editorial-lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 962 | .process-editorial-lead | line-height | 1.58 | — | local-type-exception |
| assets/services/process/styles.css | 982 | .process-evidence-list article > b | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/process/styles.css | 983 | .process-evidence-list article > b | font-size | 25px | — | local-type-exception |
| assets/services/process/styles.css | 984 | .process-evidence-list article > b | font-weight | 400 | — | local-type-exception |
| assets/services/process/styles.css | 993 | .process-evidence-list strong | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/process/styles.css | 994 | .process-evidence-list strong | font-weight | 650 | — | local-type-exception |
| assets/services/process/styles.css | 995 | .process-evidence-list strong | letter-spacing | .09em | — | local-type-exception |
| assets/services/process/styles.css | 1001 | .process-evidence-list small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 1002 | .process-evidence-list small | line-height | 1.42 | — | local-type-exception |
| assets/services/process/styles.css | 1009 | .process-stage-output | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 1010 | .process-stage-output | line-height | 1.5 | — | local-type-exception |
| assets/services/process/styles.css | 1115 | .process-editorial-content h2 | font-size | clamp(48px, 5.5vw, 64px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/process/styles.css | 1165 | .process-act | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1174 | .process-editorial-content h2 | font-size | clamp(42px, 11.8vw, 52px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 1179 | .process-editorial-lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1194 | .process-evidence-list article > b | font-size | 21px | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 1198 | .process-evidence-list strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1203 | .process-evidence-list small, .process-stage-output | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1238 | .process-opening-copy h1 | font-size | clamp(74px, 6.15vw, 103px) | — | local-type-exception |
| assets/services/process/styles.css | 1243 | .process-opening-copy p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/process/styles.css | 1276 | .process-method-intro h2 | font-size | clamp(60px, 5.05vw, 84px) | — | local-type-exception |
| assets/services/process/styles.css | 1323 | .process-proof-content h2 | font-size | clamp(56px, 4.35vw, 73px) | — | local-type-exception |
| assets/services/process/styles.css | 1356 | .process-opening-copy h1 | font-size | clamp(58px, 7.3vw, 78px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/process/styles.css | 1369 | .process-proof-content h2 | font-size | clamp(48px, 5.2vw, 61px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/process/styles.css | 1401 | .process-opening-copy h1 | font-size | clamp(50px, 14.5vw, 68px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 1405 | .process-opening-copy p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1418 | .process-method-intro h2 | font-size | clamp(47px, 13.3vw, 62px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 1432 | .process-proof-content h2 | font-size | clamp(39px, 11.3vw, 50px) | @media (max-width: 820px) | local-type-exception |
| assets/services/process/styles.css | 1437 | .process-proof-content .proof-lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/process/styles.css | 1459 | .process-proof-content .proof-output | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/site-audit/styles.css | 12 | .site-audit-page | font-family | var(--ok-font-body) | — | semantic-token |
| assets/services/site-audit/styles.css | 48 | .audit-scope | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/site-audit/styles.css | 49 | .audit-scope | font-weight | 650 | — | local-type-exception |
| assets/services/site-audit/styles.css | 50 | .audit-scope | letter-spacing | var(--ok-tracking-label) | — | semantic-token |
| assets/services/site-audit/styles.css | 77 | .audit-hint, .audit-legal-note | font-size | var(--ok-type-content) | — | semantic-token |
| assets/services/site-audit/styles.css | 78 | .audit-hint, .audit-legal-note | line-height | var(--ok-leading-content) | — | semantic-token |
| assets/services/site-audit/styles.css | 115 | .audit-progress p:not(.kicker) | line-height | var(--ok-leading-content) | — | semantic-token |
| assets/services/site-audit/styles.css | 116 | .audit-progress__domain | font-weight | 700 | — | local-type-exception |
| assets/services/site-audit/styles.css | 149 | .audit-report__header p:not(.kicker, .audit-report__meta) | line-height | var(--ok-leading-content) | — | semantic-token |
| assets/services/site-audit/styles.css | 156 | .audit-report__meta | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/site-audit/styles.css | 157 | .audit-report__meta | font-weight | 650 | — | local-type-exception |
| assets/services/site-audit/styles.css | 168 | .audit-score strong | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/site-audit/styles.css | 169 | .audit-score strong | font-size | var(--ok-type-display-result) | — | semantic-token |
| assets/services/site-audit/styles.css | 170 | .audit-score strong | font-weight | 600 | — | local-type-exception |
| assets/services/site-audit/styles.css | 171 | .audit-score strong | line-height | .9 | — | local-type-exception |
| assets/services/site-audit/styles.css | 174 | .audit-score span | font-weight | 700 | — | local-type-exception |
| assets/services/site-audit/styles.css | 194 | .audit-category span | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/site-audit/styles.css | 195 | .audit-category span | font-weight | 700 | — | local-type-exception |
| assets/services/site-audit/styles.css | 196 | .audit-category span | letter-spacing | var(--ok-tracking-label) | — | semantic-token |
| assets/services/site-audit/styles.css | 197 | .audit-category span | line-height | 1.35 | — | local-type-exception |
| assets/services/site-audit/styles.css | 205 | .audit-category strong | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/site-audit/styles.css | 206 | .audit-category strong | font-size | var(--ok-type-display-card) | — | semantic-token |
| assets/services/site-audit/styles.css | 207 | .audit-category strong | font-weight | 600 | — | local-type-exception |
| assets/services/site-audit/styles.css | 213 | .audit-category small | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/site-audit/styles.css | 214 | .audit-category small | font-weight | 650 | — | local-type-exception |
| assets/services/site-audit/styles.css | 226 | .audit-report h3 | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/site-audit/styles.css | 227 | .audit-report h3 | font-size | var(--ok-type-display-card) | — | semantic-token |
| assets/services/site-audit/styles.css | 228 | .audit-report h3 | font-weight | 600 | — | local-type-exception |
| assets/services/site-audit/styles.css | 244 | .audit-priorities li | line-height | var(--ok-leading-content) | — | semantic-token |
| assets/services/site-audit/styles.css | 251 | .audit-priorities li::before | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/site-audit/styles.css | 252 | .audit-priorities li::before | font-weight | 700 | — | local-type-exception |
| assets/services/site-audit/styles.css | 259 | .audit-priorities p | font-size | var(--ok-type-content) | — | semantic-token |
| assets/services/site-audit/styles.css | 266 | .audit-strengths li | line-height | var(--ok-leading-content) | — | semantic-token |
| assets/services/site-audit/styles.css | 275 | .audit-limitations summary | font-weight | 700 | — | local-type-exception |
| assets/services/site-audit/styles.css | 276 | .audit-limitations ul | line-height | var(--ok-leading-content) | — | semantic-token |
| assets/services/site-audit/styles.css | 288 | .audit-details__intro | line-height | var(--ok-leading-content) | — | semantic-token |
| assets/services/site-audit/styles.css | 311 | .audit-check-group summary strong | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/site-audit/styles.css | 312 | .audit-check-group summary strong | font-size | var(--ok-type-display-card) | — | semantic-token |
| assets/services/site-audit/styles.css | 313 | .audit-check-group summary strong | font-weight | 600 | — | local-type-exception |
| assets/services/site-audit/styles.css | 318 | .audit-check-group summary span | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/site-audit/styles.css | 319 | .audit-check-group summary span | font-weight | 650 | — | local-type-exception |
| assets/services/site-audit/styles.css | 347 | .audit-check > div span, .audit-check small | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/site-audit/styles.css | 348 | .audit-check > div span, .audit-check small | font-weight | 650 | — | local-type-exception |
| assets/services/site-audit/styles.css | 354 | .audit-check p | font-size | var(--ok-type-content) | — | semantic-token |
| assets/services/site-audit/styles.css | 355 | .audit-check p | line-height | var(--ok-leading-content) | — | semantic-token |
| assets/services/site-audit/styles.css | 379 | .audit-method article > span | font-size | var(--ok-type-label) | — | semantic-token |
| assets/services/site-audit/styles.css | 380 | .audit-method article > span | font-weight | 700 | — | local-type-exception |
| assets/services/site-audit/styles.css | 381 | .audit-method article > span | letter-spacing | var(--ok-tracking-label) | — | semantic-token |
| assets/services/site-audit/styles.css | 386 | .audit-method h3 | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/site-audit/styles.css | 387 | .audit-method h3 | font-size | var(--ok-type-display-card) | — | semantic-token |
| assets/services/site-audit/styles.css | 388 | .audit-method h3 | font-weight | 600 | — | local-type-exception |
| assets/services/site-audit/styles.css | 394 | .audit-method article p, .audit-method__boundary | line-height | var(--ok-leading-content) | — | semantic-token |
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
| assets/services/social/styles.css | 314 | .journey-intro h2 | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/social/styles.css | 315 | .journey-intro h2 | font-size | clamp(58px, 4.9vw, 82px) | — | local-type-exception |
| assets/services/social/styles.css | 316 | .journey-intro h2 | font-weight | 500 | — | local-type-exception |
| assets/services/social/styles.css | 317 | .journey-intro h2 | letter-spacing | .005em | — | local-type-exception |
| assets/services/social/styles.css | 323 | .journey-intro p | font-size | clamp(var(--ok-type-content-min), .96vw, 17px) | — | semantic-token |
| assets/services/social/styles.css | 324 | .journey-intro p | line-height | 1.55 | — | local-type-exception |
| assets/services/social/styles.css | 361 | .proof-content h2 | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/social/styles.css | 362 | .proof-content h2 | font-size | clamp(58px, 4.65vw, 78px) | — | local-type-exception |
| assets/services/social/styles.css | 363 | .proof-content h2 | font-weight | 500 | — | local-type-exception |
| assets/services/social/styles.css | 364 | .proof-content h2 | letter-spacing | -.025em | — | local-type-exception |
| assets/services/social/styles.css | 376 | .proof-lead | font-size | clamp(var(--ok-type-content-min), .88vw, 15px) | — | semantic-token |
| assets/services/social/styles.css | 377 | .proof-lead | line-height | 1.55 | — | local-type-exception |
| assets/services/social/styles.css | 401 | .proof-trigger | font | inherit | — | local-type-exception |
| assets/services/social/styles.css | 431 | .proof-index | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/social/styles.css | 432 | .proof-index | font-size | 24px | — | local-type-exception |
| assets/services/social/styles.css | 433 | .proof-index | line-height | 1 | — | local-type-exception |
| assets/services/social/styles.css | 442 | .proof-label strong | font-size | 12px | — | local-type-exception |
| assets/services/social/styles.css | 443 | .proof-label strong | font-weight | 650 | — | local-type-exception |
| assets/services/social/styles.css | 444 | .proof-label strong | letter-spacing | .09em | — | local-type-exception |
| assets/services/social/styles.css | 451 | .proof-label small | font-size | var(--ok-type-content-min) | — | semantic-token |
| assets/services/social/styles.css | 452 | .proof-label small | line-height | 1.42 | — | local-type-exception |
| assets/services/social/styles.css | 480 | .proof-detail p | font-size | var(--ok-type-content-min) | — | semantic-token |
| assets/services/social/styles.css | 481 | .proof-detail p | line-height | 1.45 | — | local-type-exception |
| assets/services/social/styles.css | 486 | .proof-detail b | font-weight | 650 | — | local-type-exception |
| assets/services/social/styles.css | 493 | .proof-output | font-size | var(--ok-type-content-min) | — | semantic-token |
| assets/services/social/styles.css | 494 | .proof-output | line-height | 1.48 | — | local-type-exception |
| assets/services/social/styles.css | 518 | .proof-primary | font-size | 13px | — | local-type-exception |
| assets/services/social/styles.css | 519 | .proof-primary | font-weight | 550 | — | local-type-exception |
| assets/services/social/styles.css | 551 | .proof-secondary | font-size | 12px | — | local-type-exception |
| assets/services/social/styles.css | 552 | .proof-secondary | font-weight | 550 | — | local-type-exception |
| assets/services/social/styles.css | 581 | .journey-note h3 | font-family | var(--ok-font-display) | — | semantic-token |
| assets/services/social/styles.css | 582 | .journey-note h3 | font-weight | 500 | — | local-type-exception |
| assets/services/social/styles.css | 587 | .journey-note h3 b | font-size | clamp(48px, 3.25vw, 58px) | — | local-type-exception |
| assets/services/social/styles.css | 588 | .journey-note h3 b | font-weight | 400 | — | local-type-exception |
| assets/services/social/styles.css | 589 | .journey-note h3 b | line-height | .9 | — | local-type-exception |
| assets/services/social/styles.css | 594 | .journey-note h3 span | font-size | clamp(20px, 1.4vw, 25px) | — | local-type-exception |
| assets/services/social/styles.css | 595 | .journey-note h3 span | font-weight | 600 | — | local-type-exception |
| assets/services/social/styles.css | 596 | .journey-note h3 span | letter-spacing | .03em | — | local-type-exception |
| assets/services/social/styles.css | 602 | .journey-note p | font-size | clamp(var(--ok-type-content-min), .85vw, 15px) | — | semantic-token |
| assets/services/social/styles.css | 603 | .journey-note p | line-height | 1.55 | — | local-type-exception |
| assets/services/social/styles.css | 611 | .journey-note small | font-size | var(--ok-type-content-min) | — | semantic-token |
| assets/services/social/styles.css | 612 | .journey-note small | line-height | 1.45 | — | local-type-exception |
| assets/services/social/styles.css | 655 | .social-opening .opening-copy h1 | font-size | clamp(62px, 5vw, 84px) | — | local-type-exception |
| assets/services/social/styles.css | 776 | .opening-copy h1 | font-size | clamp(48px, 6.2vw, 64px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/social/styles.css | 785 | .proof-content h2 | font-size | clamp(48px, 5.4vw, 62px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/social/styles.css | 824 | .opening-copy h1 | font-size | clamp(48px, 14vw, 72px) | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 851 | .journey-intro h2 | font-size | clamp(54px, 16vw, 76px) | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 857 | .journey-intro > p | font-size | var(--ok-type-content-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 885 | .journey-mobile-steps b | font-family | var(--ok-font-display) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 886 | .journey-mobile-steps b | font-size | 24px | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 887 | .journey-mobile-steps b | font-weight | 400 | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 896 | .journey-mobile-steps strong | font-size | var(--ok-type-label-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 897 | .journey-mobile-steps strong | letter-spacing | .08em | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 903 | .journey-mobile-steps small | font-size | var(--ok-type-content-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 904 | .journey-mobile-steps small | line-height | 1.3 | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 928 | .proof-content h2 | font-size | clamp(38px, 11.6vw, 50px) | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 933 | .proof-lead | font-size | var(--ok-type-content-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 934 | .proof-lead | line-height | 1.3 | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 949 | .proof-index | font-size | 20px | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 957 | .proof-label strong | font-size | var(--ok-type-label-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 962 | .proof-label small, .proof-detail p | font-size | var(--ok-type-content-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 963 | .proof-label small, .proof-detail p | line-height | 1.3 | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 978 | .proof-output | font-size | var(--ok-type-content-min) | @media (max-width: 820px) | semantic-token |
| assets/services/social/styles.css | 979 | .proof-output | line-height | 1.25 | @media (max-width: 820px) | local-type-exception |
| assets/services/social/styles.css | 1007 | .social-signals .proof-content h2 | font-size | 36px | @media (max-width: 820px) and (max-height: 740px) | local-type-exception |
| assets/services/social/styles.css | 1012 | .social-signals .proof-lead | line-height | 1.25 | @media (max-width: 820px) and (max-height: 740px) | local-type-exception |
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
| assets/services/web/styles.css | 314 | .journey-intro h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/web/styles.css | 315 | .journey-intro h2 | font-size | clamp(58px, 4.9vw, 82px) | — | local-type-exception |
| assets/services/web/styles.css | 316 | .journey-intro h2 | font-weight | 500 | — | local-type-exception |
| assets/services/web/styles.css | 317 | .journey-intro h2 | letter-spacing | .005em | — | local-type-exception |
| assets/services/web/styles.css | 323 | .journey-intro p | font-size | clamp(14px, .96vw, 17px) | — | local-type-exception |
| assets/services/web/styles.css | 324 | .journey-intro p | line-height | 1.55 | — | local-type-exception |
| assets/services/web/styles.css | 361 | .proof-content h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/web/styles.css | 362 | .proof-content h2 | font-size | clamp(58px, 4.65vw, 78px) | — | local-type-exception |
| assets/services/web/styles.css | 363 | .proof-content h2 | font-weight | 500 | — | local-type-exception |
| assets/services/web/styles.css | 364 | .proof-content h2 | letter-spacing | -.025em | — | local-type-exception |
| assets/services/web/styles.css | 376 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 377 | .proof-lead | line-height | 1.55 | — | local-type-exception |
| assets/services/web/styles.css | 401 | .proof-trigger | font | inherit | — | local-type-exception |
| assets/services/web/styles.css | 431 | .proof-index | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/web/styles.css | 432 | .proof-index | font-size | 24px | — | local-type-exception |
| assets/services/web/styles.css | 433 | .proof-index | line-height | 1 | — | local-type-exception |
| assets/services/web/styles.css | 442 | .proof-label strong | font-size | 12px | — | local-type-exception |
| assets/services/web/styles.css | 443 | .proof-label strong | font-weight | 650 | — | local-type-exception |
| assets/services/web/styles.css | 444 | .proof-label strong | letter-spacing | .09em | — | local-type-exception |
| assets/services/web/styles.css | 451 | .proof-label small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 452 | .proof-label small | line-height | 1.42 | — | local-type-exception |
| assets/services/web/styles.css | 480 | .proof-detail p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 481 | .proof-detail p | line-height | 1.45 | — | local-type-exception |
| assets/services/web/styles.css | 486 | .proof-detail b | font-weight | 650 | — | local-type-exception |
| assets/services/web/styles.css | 493 | .proof-output | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 494 | .proof-output | line-height | 1.48 | — | local-type-exception |
| assets/services/web/styles.css | 518 | .proof-primary | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 519 | .proof-primary | font-weight | 550 | — | local-type-exception |
| assets/services/web/styles.css | 551 | .proof-secondary | font-size | 12px | — | local-type-exception |
| assets/services/web/styles.css | 552 | .proof-secondary | font-weight | 550 | — | local-type-exception |
| assets/services/web/styles.css | 581 | .journey-note h3 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/services/web/styles.css | 582 | .journey-note h3 | font-weight | 500 | — | local-type-exception |
| assets/services/web/styles.css | 587 | .journey-note h3 b | font-size | clamp(48px, 3.25vw, 58px) | — | local-type-exception |
| assets/services/web/styles.css | 588 | .journey-note h3 b | font-weight | 400 | — | local-type-exception |
| assets/services/web/styles.css | 589 | .journey-note h3 b | line-height | .9 | — | local-type-exception |
| assets/services/web/styles.css | 594 | .journey-note h3 span | font-size | clamp(20px, 1.4vw, 25px) | — | local-type-exception |
| assets/services/web/styles.css | 595 | .journey-note h3 span | font-weight | 600 | — | local-type-exception |
| assets/services/web/styles.css | 596 | .journey-note h3 span | letter-spacing | .03em | — | local-type-exception |
| assets/services/web/styles.css | 602 | .journey-note p | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 603 | .journey-note p | line-height | 1.55 | — | local-type-exception |
| assets/services/web/styles.css | 611 | .journey-note small | font-size | var(--ok-type-content-min, 14px) | — | semantic-token |
| assets/services/web/styles.css | 612 | .journey-note small | line-height | 1.45 | — | local-type-exception |
| assets/services/web/styles.css | 653 | .proof-content h2 | font-size | clamp(64px, 5.1vw, 86px) | @media (min-width: 1400px) and (min-height: 850px) | local-type-exception |
| assets/services/web/styles.css | 700 | .opening-copy h1 | font-size | clamp(48px, 6.2vw, 64px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/web/styles.css | 709 | .proof-content h2 | font-size | clamp(48px, 5.4vw, 62px) | @media (max-width: 1024px) | local-type-exception |
| assets/services/web/styles.css | 748 | .opening-copy h1 | font-size | clamp(48px, 14vw, 72px) | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 774 | .journey-intro h2 | font-size | clamp(54px, 16vw, 76px) | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 780 | .journey-intro > p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 806 | .journey-mobile-steps b | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 807 | .journey-mobile-steps b | font-size | 24px | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 808 | .journey-mobile-steps b | font-weight | 400 | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 817 | .journey-mobile-steps strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 818 | .journey-mobile-steps strong | letter-spacing | .08em | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 824 | .journey-mobile-steps small | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 825 | .journey-mobile-steps small | line-height | 1.4 | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 849 | .proof-content h2 | font-size | clamp(43px, 12.7vw, 56px) | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 854 | .proof-lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 869 | .proof-index | font-size | 20px | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 877 | .proof-label strong | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 882 | .proof-label small, .proof-detail p | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 895 | .proof-output | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 927 | .section-kicker | font-size | var(--ok-type-label-min, 12px) | — | semantic-token |
| assets/services/web/styles.css | 928 | .section-kicker | font-weight | 700 | — | local-type-exception |
| assets/services/web/styles.css | 929 | .section-kicker | letter-spacing | .14em | — | local-type-exception |
| assets/services/web/styles.css | 947 | .web-service .opening-copy h1 | font-size | clamp(68px, 5.55vw, 94px) | — | local-type-exception |
| assets/services/web/styles.css | 988 | .web-service .journey-intro h2 | font-size | clamp(56px, 4.55vw, 78px) | — | local-type-exception |
| assets/services/web/styles.css | 1044 | .web-service .proof-content h2 | font-size | clamp(56px, 4.3vw, 74px) | — | local-type-exception |
| assets/services/web/styles.css | 1053 | .web-service .opening-copy h1 | font-size | clamp(78px, 6.1vw, 108px) | @media (min-width: 1800px) and (min-height: 1000px) | local-type-exception |
| assets/services/web/styles.css | 1057 | .web-service :is(.journey-intro, .proof-content) h2 | font-size | clamp(64px, 4.9vw, 88px) | @media (min-width: 1800px) and (min-height: 1000px) | local-type-exception |
| assets/services/web/styles.css | 1121 | .web-service .opening-copy h1 | font-size | clamp(46px, 13vw, 64px) | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 1125 | .web-service .opening-scope | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/services/web/styles.css | 1154 | .web-service .proof-content h2 | font-size | clamp(39px, 11.8vw, 52px) | @media (max-width: 820px) | local-type-exception |
| assets/services/web/styles.css | 1159 | .web-service .section-kicker | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 820px) | semantic-token |
| assets/visual-direction-scenes.v20260730-2.css | 106 | .home-intro h2 | font-family | var(--ok-font-display, "Barlow Condensed", sans-serif) | — | semantic-token |
| assets/visual-direction-scenes.v20260730-2.css | 107 | .home-intro h2 | font-weight | 500 | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 109 | .home-intro h2 | letter-spacing | -.055em | — | local-type-exception |
| assets/visual-direction-scenes.v20260730-2.css | 163 | [data-scene-continuation-title] | font-size | var(--ok-type-display-section, clamp(58px, 7.8vh, 320px)) | — | semantic-token |
| assets/visual-direction-scenes.v20260730-2.css | 164 | [data-scene-continuation-title] | line-height | var(--ok-leading-display, 1.21) | — | semantic-token |
| assets/visual-direction-scenes.v20260730-2.css | 168 | [data-scene-frame][data-scene-continuation] > .proof-content h2 | line-height | var(--ok-leading-display, 1.21) | — | semantic-token |
| assets/visual-direction-scenes.v20260730-2.css | 174 | [data-scene-eyebrow] | font | 650 var(--ok-type-label, 12px)/1.2 var(--ok-font-body, "Archivo", sans-serif) | — | semantic-token |
| assets/visual-direction-scenes.v20260730-2.css | 175 | [data-scene-eyebrow] | letter-spacing | .16em | — | local-type-exception |

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
| assets/page-contact.css | 63 | /* ---------- header ---------- */ .site-header | position | absolute | — |
| assets/page-contact.css | 67 | /* ---------- header ---------- */ .site-header | z-index | 20 | — |
| assets/page-contact.css | 68 | /* ---------- header ---------- */ .site-header | display | flex | — |
| assets/page-contact.css | 79 | .site-nav | display | flex | — |
| assets/page-contact.css | 84 | .site-nav a | position | relative | — |
| assets/page-contact.css | 87 | .site-nav a | font-size | 12px | — |
| assets/page-contact.css | 96 | .site-nav a::after | position | absolute | — |
| assets/page-contact.css | 100 | .site-nav a::after | height | 2px | — |
| assets/page-contact.css | 368 | /* ---------- scena ---------- */ .scene | position | absolute | — |
| assets/page-contact.css | 373 | /* ---------- scena ---------- */ .scene | z-index | 0 | — |
| assets/page-contact.css | 375 | /* ---------- scena ---------- */ .scene | overflow | hidden | — |
| assets/page-contact.css | 378 | .scene img | position | absolute | — |
| assets/page-contact.css | 381 | .scene img | height | 100% | — |
| assets/page-contact.css | 383 | .scene img | position | 50% 62% | — |
| assets/page-contact.css | 430 | .site-header | position | static | — |
| assets/page-contact.css | 437 | .scene | position | relative | — |
| assets/page-contact.css | 439 | .scene | min-height | 54svh | — |
| assets/page-contact.css | 457 | .site-nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 640px) |
| assets/page-contact.css | 458 | .site-nav a:nth-child(2) | display | none | @media (max-width: 640px) |
| assets/page-home.css | 105 | .topbar | position | absolute | — |
| assets/page-home.css | 106 | .topbar | z-index | 20 | — |
| assets/page-home.css | 110 | .topbar | height | clamp(5.2rem, 10vh, 7rem) | — |
| assets/page-home.css | 111 | .topbar | display | flex | — |
| assets/page-home.css | 124 | .nav | display | flex | — |
| assets/page-home.css | 130 | .nav a | position | relative | — |
| assets/page-home.css | 134 | .nav a | font-size | var(--ok-type-label-min, 12px) | — |
| assets/page-home.css | 137 | .nav a | min-height | 44px | — |
| assets/page-home.css | 138 | .nav a | display | inline-flex | — |
| assets/page-home.css | 146 | .nav a::after | position | absolute | — |
| assets/page-home.css | 150 | .nav a::after | height | 1px | — |
| assets/page-home.css | 187 | .scene-label | display | flex | — |
| assets/page-home.css | 197 | .scene-label::before | height | 1px | — |
| assets/page-home.css | 339 | .scene-picture | position | relative | — |
| assets/page-home.css | 340 | .scene-picture | z-index | 1 | — |
| assets/page-home.css | 341 | .scene-picture | display | block | — |
| assets/page-home.css | 343 | .scene-picture | height | 100% | — |
| assets/page-home.css | 560 | .topbar | height | 6.3rem | @media (max-width: 1024px) and (min-width: 641px) |
| assets/page-home.css | 571 | .nav a | min-height | 44px | @media (max-width: 1024px) and (min-width: 641px) |
| assets/page-home.css | 572 | .nav a | display | inline-flex | @media (max-width: 1024px) and (min-width: 641px) |
| assets/page-home.css | 574 | .nav a | font-size | var(--ok-type-label-min, 12px) | @media (max-width: 1024px) and (min-width: 641px) |
| assets/page-home.css | 650 | .topbar | height | 5rem | @media (max-width: 640px) |
| assets/page-home.css | 657 | .nav a:nth-child(2) | display | none | @media (max-width: 640px) |
| assets/page-home.css | 659 | .nav a | min-height | 44px | @media (max-width: 640px) |
| assets/page-home.css | 660 | .nav a | display | inline-flex | @media (max-width: 640px) |
| assets/page-home.css | 662 | .nav a | font-size | .75rem | @media (max-width: 640px) |
| assets/page-home.css | 701 | .topbar | height | 4.5rem | @media (max-width: 640px) and (max-height: 720px) |
| assets/page-home.css | 1066 | .topbar | height | clamp(7rem, 9vh, 8.5rem) | — |
| assets/page-home.css | 1078 | .nav a | font-size | clamp(.78rem, .55vw, .88rem) | — |
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
| assets/scene-transitions.v20260804-1.css | 8 | /* One route-neutral seam contract for document and state-switch stories. */ .scene-seam | height | 100% | — |
| assets/scene-transitions.v20260804-1.css | 10 | /* One route-neutral seam contract for document and state-switch stories. */ .scene-seam | position | 50% 50% | — |
| assets/scene-transitions.v20260804-1.css | 12 | /* One route-neutral seam contract for document and state-switch stories. */ .scene-seam | position | relative | — |
| assets/scene-transitions.v20260804-1.css | 13 | /* One route-neutral seam contract for document and state-switch stories. */ .scene-seam | z-index | 4 | — |
| assets/scene-transitions.v20260804-1.css | 15 | /* One route-neutral seam contract for document and state-switch stories. */ .scene-seam | height | var(--scene-seam-reserve) | — |
| assets/scene-transitions.v20260804-1.css | 16 | /* One route-neutral seam contract for document and state-switch stories. */ .scene-seam | display | block | — |
| assets/scene-transitions.v20260804-1.css | 22 | .scene-seam__field | position | absolute | — |
| assets/scene-transitions.v20260804-1.css | 23 | .scene-seam__field | z-index | 0 | — |
| assets/scene-transitions.v20260804-1.css | 27 | .scene-seam__field | height | var(--scene-seam-depth) | — |
| assets/scene-transitions.v20260804-1.css | 28 | .scene-seam__field | display | block | — |
| assets/scene-transitions.v20260804-1.css | 29 | .scene-seam__field | overflow | hidden | — |
| assets/scene-transitions.v20260804-1.css | 36 | .scene-seam__field | position | center | — |
| assets/scene-transitions.v20260804-1.css | 37 | .scene-seam__field | position | center | — |
| assets/scene-transitions.v20260804-1.css | 54 | .scene-seam__atmosphere | position | absolute | — |
| assets/scene-transitions.v20260804-1.css | 55 | .scene-seam__atmosphere | z-index | 0 | — |
| assets/scene-transitions.v20260804-1.css | 57 | .scene-seam__atmosphere | display | block | — |
| assets/scene-transitions.v20260804-1.css | 58 | .scene-seam__atmosphere | overflow | hidden | — |
| assets/scene-transitions.v20260804-1.css | 64 | .scene-seam__atmosphere | position | center | — |
| assets/scene-transitions.v20260804-1.css | 65 | .scene-seam__atmosphere | position | center | — |
| assets/scene-transitions.v20260804-1.css | 71 | .scene-seam__atmosphere img | position | absolute | — |
| assets/scene-transitions.v20260804-1.css | 77 | .scene-seam__atmosphere img | height | var(--scene-seam-source-height) | — |
| assets/scene-transitions.v20260804-1.css | 78 | .scene-seam__atmosphere img | display | block | — |
| assets/scene-transitions.v20260804-1.css | 80 | .scene-seam__atmosphere img | position | var(--scene-seam-source-object-position) | — |
| assets/scene-transitions.v20260804-1.css | 91 | /* Generated pair assets are complete transition plates, not continuations of one endpoint artwork. Keep them full-bleed even when the source artwork is narrower than the viewport (for example the home hero sculpture). */ .scene-seam[data-scene-seam-material="asset"] .scene-seam__atmosphere img | height | 100% | — |
| assets/scene-transitions.v20260804-1.css | 93 | /* Generated pair assets are complete transition plates, not continuations of one endpoint artwork. Keep them full-bleed even when the source artwork is narrower than the viewport (for example the home hero sculpture). */ .scene-seam[data-scene-seam-material="asset"] .scene-seam__atmosphere img | position | center | — |
| assets/scene-transitions.v20260804-1.css | 162 | .scene-seam--switch | position | absolute | — |
| assets/scene-transitions.v20260804-1.css | 164 | .scene-seam--switch | height | auto | — |
| assets/scene-transitions.v20260804-1.css | 165 | .scene-seam--switch | display | none | — |
| assets/scene-transitions.v20260804-1.css | 167 | .scene-seam--switch | overflow | hidden | — |
| assets/scene-transitions.v20260804-1.css | 175 | .scene-seam--switch[data-scene-seam-state="active"] | display | block | — |
| assets/scene-transitions.v20260804-1.css | 221 | /* Compact atmosphere is complete; extracted art would duplicate it. */ .scene-seam__atmosphere img | height | 100% | @media (max-width: 820px) |
| assets/scene-transitions.v20260804-1.css | 223 | /* Compact atmosphere is complete; extracted art would duplicate it. */ .scene-seam__atmosphere img | position | center | @media (max-width: 820px) |
| assets/scene-transitions.v20260804-1.css | 265 | .scene-seam--switch[data-scene-seam-state="active"] | display | none | @media (prefers-reduced-motion: reduce) |
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
| assets/services/about/styles.css | 581 | .scene-02 h2 | font-size | clamp(54px, 4.25vw, 72px) | — |
| assets/services/about/styles.css | 589 | .scene-03 h2 | font-size | clamp(54px, 4.35vw, 74px) | — |
| assets/services/about/styles.css | 610 | .scene-04 h2 | font-size | clamp(48px, 3.85vw, 66px) | — |
| assets/services/about/styles.css | 616 | .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | — |
| assets/services/about/styles.css | 717 | .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | — |
| assets/services/about/styles.css | 832 | .scene-04 .accordion-trigger | min-height | 44px | @media (max-height: 800px) and (min-width: 901px) |
| assets/services/about/styles.css | 877 | .facts .row-content > span, .model-points .row-content > span, .scene-04 .lead, .accordion-label small, .accordion-detail p, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (max-height: 800px) and (min-width: 901px) |
| assets/services/about/styles.css | 900 | .scene-02 .portrait-frame | height | 68vh | @media (max-height: 800px) and (min-width: 1101px) |
| assets/services/about/styles.css | 908 | .scene-02 .facts li | min-height | 78px | @media (max-height: 800px) and (min-width: 1101px) |
| assets/services/about/styles.css | 920 | .scene-03 .model-points li | min-height | 68px | @media (max-height: 800px) and (min-width: 1101px) |
| assets/services/about/styles.css | 962 | h2, .scene-03 h2 | font-size | clamp(48px, 5.4vw, 58px) | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 967 | .scene-02 h2, .scene-04 h2 | font-size | clamp(43px, 4.8vw, 51px) | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 973 | .lead, .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 1001 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 1018 | .scene-01 .mobile-details, .tablet-details | display | block | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 1023 | .scene-02 .facts, .scene-03 .model-points | display | none | @media (min-width: 901px) and (max-width: 1100px) |
| assets/services/about/styles.css | 1086 | .scene::before | z-index | -2 | @media (max-width: 900px) |
| assets/services/about/styles.css | 1102 | .scene-01 .scene-art | position | 68% center | @media (max-width: 900px) |
| assets/services/about/styles.css | 1106 | .scene-02 .scene-art | position | 34% center | @media (max-width: 900px) |
| assets/services/about/styles.css | 1110 | .scene-03 .scene-art | position | 71% center | @media (max-width: 900px) |
| assets/services/about/styles.css | 1114 | .scene-04 .scene-art | position | 76% center | @media (max-width: 900px) |
| assets/services/about/styles.css | 1155 | h2, .scene-02 h2, .scene-03 h2, .scene-04 h2 | font-size | clamp(38px, 10.6vw, 45px) | @media (max-width: 900px) |
| assets/services/about/styles.css | 1161 | .lead, .scene-04 .lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) |
| assets/services/about/styles.css | 1162 | .lead, .scene-04 .lead | height | 1.48 | @media (max-width: 900px) |
| assets/services/about/styles.css | 1219 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 900px) |
| assets/services/about/styles.css | 1220 | .result, .scene-04 .result | height | 1.45 | @media (max-width: 900px) |
| assets/services/about/styles.css | 1433 | .about-page .scene-01 h1 | font-size | clamp(42px, 4.4vw, 46px) | @media (min-width: 821px) and (max-height: 700px) |
| assets/services/about/styles.css | 1437 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | clamp(43px, 4.7vw, 49px) | @media (min-width: 821px) and (max-height: 700px) |
| assets/services/about/styles.css | 1463 | .about-page .scene-03 .model-points li | min-height | 64px | @media (min-width: 821px) and (max-height: 700px) |
| assets/services/about/styles.css | 1470 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | clamp(39px, 4.1vw, 43px) | @media (min-width: 821px) and (max-height: 620px) |
| assets/services/about/styles.css | 1491 | .about-page .scene-04 .accordion-trigger | min-height | 44px | @media (min-width: 821px) and (max-height: 620px) |
| assets/services/about/styles.css | 1495 | .about-page .scene-03 .model-points li | min-height | 56px | @media (min-width: 821px) and (max-height: 620px) |
| assets/services/about/styles.css | 1501 | .scene-04 :is(.lead, .proof-statement, .result) | display | none | @media (max-width: 640px) and (max-height: 700px) |
| assets/services/about/styles.css | 1557 | h2, .scene-02 h2, .scene-03 h2, .scene-04 h2 | font-size | 50px | @media (min-width: 600px) and (max-width: 900px) |
| assets/services/about/styles.css | 1562 | .lead, .scene-04 .lead | font-size | 14px | @media (min-width: 600px) and (max-width: 900px) |
| assets/services/about/styles.css | 1590 | .result, .scene-04 .result | font-size | var(--ok-type-content-min, 14px) | @media (min-width: 600px) and (max-width: 900px) |
| assets/services/about/styles.css | 1651 | .scene-02 .tablet-details, .scene-03 .tablet-details | display | block | @media (max-width: 900px) |
| assets/services/about/styles.css | 1656 | .scene-02 .facts, .scene-03 .model-points | display | none | @media (max-width: 900px) |
| assets/services/about/styles.css | 1666 | .scene-04 .lead | height | 1.42 | @media (max-width: 900px) |
| assets/services/about/styles.css | 1674 | .scene-04 .accordion-trigger | min-height | 46px | @media (max-width: 900px) |
| assets/services/about/styles.css | 1702 | .scene-02 .portrait-frame | height | 72vh | @media (min-width: 850px) and (max-width: 900px) and (max-height: 800px) |
| assets/services/about/styles.css | 1716 | .scene-02 h2 | font-size | clamp(34px, 9.5vw, 38px) | @media (max-width: 599px) |
| assets/services/about/styles.css | 1720 | .scene-02 .lead | font-size | var(--ok-type-content-min, 14px) | @media (max-width: 599px) |
| assets/services/about/styles.css | 1721 | .scene-02 .lead | height | 1.42 | @media (max-width: 599px) |
| assets/services/about/styles.css | 1731 | .scene-02 .facts li | min-height | 72px | @media (max-width: 599px) |
| assets/services/about/styles.css | 1737 | .scene-02 .facts strong | font-size | 14px | @media (max-width: 599px) |
| assets/services/about/styles.css | 1741 | .scene-02 .portrait-frame | z-index | 10 | @media (max-width: 599px) |
| assets/services/about/styles.css | 1745 | .scene-02 .portrait-frame | height | 176px | @media (max-width: 599px) |
| assets/services/about/styles.css | 1768 | .scene-02 .portrait-frame | height | 150px | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1781 | .scene-01 .chips, .scene-02 .lead, .scene-02 .result, .scene-03 .result | display | none | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1786 | .scene-02 .kicker, :is(.scene-02, .scene-03) .mobile-details details:first-child > p:not(.mobile-context) | display | none | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1790 | :is(.scene-02, .scene-03) .mobile-details .mobile-context | display | block | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1795 | .scene-01 h1, .scene-03 h2 | font-size | clamp(38px, 11.5vw, 44px) | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1799 | .scene-02 h2 | font-size | 31px | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1805 | .scene-01 .lead, .scene-03 .lead | height | 1.35 | @media (max-width: 390px) and (max-height: 740px) |
| assets/services/about/styles.css | 1846 | .scene-04 .accordion-trigger | min-height | 44px | @media (max-width: 640px) |
| assets/services/about/styles.css | 1884 | .about-page .scene-02 .portrait-frame | height | 76vh | — |
| assets/services/about/styles.css | 1888 | .about-page .scene-01 h1 | font-size | 46px | — |
| assets/services/about/styles.css | 1892 | .about-page :is(.scene-02, .scene-03, .scene-04) h2 | font-size | 39px | — |
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
| assets/services/campaign/styles.css | 678 | .site-header | height | 84px | @media (max-width: 1024px) |
| assets/services/campaign/styles.css | 724 | .story-stage, .campaign-frame | min-height | 720px | @media (max-width: 820px) |
| assets/services/campaign/styles.css | 732 | .site-header nav a:nth-child(2) | display | none | @media (max-width: 820px) |
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
| assets/services/process/styles.css | 678 | .site-header | height | 84px | @media (max-width: 1024px) |
| assets/services/process/styles.css | 718 | .story-stage, .campaign-frame | min-height | 720px | @media (max-width: 820px) |
| assets/services/process/styles.css | 726 | .site-header nav a:nth-child(2) | display | none | @media (max-width: 820px) |
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
| assets/services/social/styles.css | 762 | .site-header | height | 84px | @media (max-width: 1024px) |
| assets/services/social/styles.css | 802 | .story-stage, .social-frame | min-height | 720px | @media (max-width: 820px) |
| assets/services/social/styles.css | 810 | .site-header nav a:nth-child(2) | display | none | @media (max-width: 820px) |
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
| assets/services/web/styles.css | 686 | .site-header | height | 84px | @media (max-width: 1024px) |
| assets/services/web/styles.css | 726 | .story-stage, .campaign-frame | min-height | 720px | @media (max-width: 820px) |
| assets/services/web/styles.css | 734 | .site-header nav a:nth-child(2) | display | none | @media (max-width: 820px) |
| assets/services/web/styles.css | 1095 | .web-service .story-stage, .web-service .campaign-frame | min-height | 100svh | @media (max-width: 820px) |

## Inline style w HTML

| Plik | Linia | Deklaracja |
| --- | --- | --- |
| kontakt.html | 93 | --i:0 |
| kontakt.html | 95 | --i:1 |
| kontakt.html | 98 | --d:0s |
| kontakt.html | 99 | --d:.09s |
| kontakt.html | 102 | --i:2 |
| kontakt.html | 104 | --i:3 |
| kontakt.html | 119 | --i:4 |
| kontakt.html | 131 | --i:5 |
| kontakt.html | 216 | --i:5 |
| kontakt.html | 225 | --i:5 |
| menu.html | 96 | --d:0s |
| menu.html | 97 | --d:.09s |
| menu.html | 106 | --i:0 |
| menu.html | 120 | --i:1 |
| menu.html | 134 | --i:2 |
| menu.html | 148 | --i:3 |
| o-nas.html | 131 | --x: 70%; --y: 62%; |
| o-nas.html | 135 | --x: 87%; --y: 75%; |
| o-nas.html | 139 | --x: 84%; --y: 35%; |
| o-nas.html | 143 | --x: 73%; --y: 80%; --leader: 12px; --about-copy-width: 240px; |
| o-nas.html | 204 | --x: 33%; --y: 72%; --leader: 48px; |
| o-nas.html | 208 | --x: 32.5%; --y: 35%; --leader: 32px; --copy-w: 195px; |
| o-nas.html | 212 | --x: 37%; --y: 76%; --leader: 38px; |
| o-nas.html | 216 | --x: 49%; --y: 73%; |
| o-nas.html | 271 | --x: 74%; --y: 62%; |
| o-nas.html | 275 | --x: 84%; --y: 37%; |
| o-nas.html | 279 | --x: 90%; --y: 73%; |
| o-nas.html | 283 | --x: 79%; --y: 80%; |

## Mutacje stylu z JavaScript

| Plik | Linia | Operacja |
| --- | --- | --- |
| assets/art-coordinate-system.js | 191 | .style.setProperty(property, value) |
| assets/art-coordinate-system.js | 259 | .style.setProperty(property, value, priority) |
| assets/art-coordinate-system.js | 260 | .style.removeProperty(property) |
| assets/art-coordinate-system.js | 1087 | .style.setProperty("left", \`${bounds.left}px\`) |
| assets/art-coordinate-system.js | 1088 | .style.setProperty("top", \`${bounds.top}px\`) |
| assets/art-coordinate-system.js | 1089 | .style.setProperty("width", \`${bounds.width}px\`) |
| assets/art-coordinate-system.js | 1090 | .style.setProperty("height", \`${bounds.height}px\`) |
| assets/page-contact.js | 18 | .style.translate = \`${(-cx * 10).toFixed(2)}px ${(-cy * 8).toFixed(2)}px\` |
| assets/page-contact.js | 220 | .style.position = "fixed" |
| assets/page-contact.js | 221 | .style.opacity = "0" |
| assets/responsive-safety.js | 120 | .style.setProperty("--ok-viewport-height-runtime", \`${viewportHeight}px\`) |
| assets/responsive-safety.js | 129 | .style.setProperty(\`--ok-type-${role}-runtime\`, resolvedValue) |
| assets/responsive-safety.js | 130 | .style.setProperty(\`--ok-type-${role}\`, resolvedValue) |
| assets/responsive-safety.js | 190 | .style.objectPosition = style.objectPosition |
| assets/responsive-safety.js | 191 | .style.transform = style.transform |
| assets/responsive-safety.js | 192 | .style.transformOrigin = style.transformOrigin |
| assets/responsive-safety.js | 660 | .style.removeProperty("--ok-safe-mask-image") |
| assets/responsive-safety.js | 682 | .style.removeProperty("--ok-safe-content-max-height") |
| assets/responsive-safety.js | 701 | .style.removeProperty("--ok-safe-curtain-mask") |
| assets/responsive-safety.js | 702 | .style.removeProperty("--ok-safe-required-height") |
| assets/responsive-safety.js | 739 | .style.removeProperty("--ok-safe-curtain-mask") |
| assets/responsive-safety.js | 749 | .style.removeProperty("--ok-safe-required-height") |
| assets/responsive-safety.js | 804 | .style.setProperty("--ok-safe-required-height", \`${requiredHeight}px\`) |
| assets/responsive-safety.js | 820 | .style.setProperty("--ok-safe-required-height", \`${requiredHeight}px\`) |
| assets/responsive-safety.js | 827 | .style.removeProperty("--ok-safe-curtain-mask") |
| assets/responsive-safety.js | 828 | .style.setProperty("--ok-safe-required-height", \`${requiredHeight}px\`) |
| assets/responsive-safety.js | 845 | .style.setProperty("--ok-safe-required-height", \`${requiredHeight}px\`) |
| assets/responsive-safety.js | 847 | .style.removeProperty("--ok-safe-required-height") |
| assets/responsive-safety.js | 854 | .style.setProperty("--ok-safe-required-height", \`${requiredHeight}px\`) |
| assets/responsive-safety.js | 856 | .style.removeProperty("--ok-safe-required-height") |
| assets/responsive-safety.js | 871 | .style.setProperty("--ok-safe-mask-image", directionalFeather.image) |
| assets/responsive-safety.js | 891 | .style.removeProperty("--ok-safe-card-height") |
| assets/responsive-safety.js | 899 | .style.setProperty("--ok-safe-card-height", \`${Math.ceil(textHeight + imageHeight + 24)}px\`) |
| assets/responsive-safety.js | 915 | .style.removeProperty("--ok-safe-card-height") |
| assets/responsive-safety.js | 924 | .style.setProperty("--ok-safe-card-height", \`${Math.ceil(textHeight + imageHeight + 24)}px\`) |
| assets/responsive-safety.js | 1047 | .style.removeProperty("--ok-safe-required-height") |
| assets/scene-transitions.v20260804-1.js | 196 | .style.removeProperty("--scene-seam-safe-exclusion-mask") |
| assets/scene-transitions.v20260804-1.js | 212 | .style.removeProperty("--scene-seam-reserve") |
| assets/scene-transitions.v20260804-1.js | 226 | .style.setProperty("--scene-seam-reserve", \`${reserve}px\`) |
| assets/scene-transitions.v20260804-1.js | 273 | .style.setProperty("--scene-seam-safe-exclusion-mask", exclusionSvg(fieldRect.width, fieldRect.height, maskHoles)) |
| assets/scene-transitions.v20260804-1.js | 353 | .style.setProperty("--scene-seam-source-left", \`${geometry.left}px\`) |
| assets/scene-transitions.v20260804-1.js | 354 | .style.setProperty("--scene-seam-source-width", \`${geometry.renderedWidth}px\`) |
| assets/scene-transitions.v20260804-1.js | 355 | .style.setProperty("--scene-seam-source-height", \`${extensionHeight}px\`) |
| assets/scene-transitions.v20260804-1.js | 356 | .style.setProperty("--scene-seam-source-object-fit", geometry.fit) |
| assets/scene-transitions.v20260804-1.js | 357 | .style.setProperty("--scene-seam-source-object-position", geometry.objectPosition) |
| assets/scene-transitions.v20260804-1.js | 450 | .style.setProperty("--scene-seam-matte", \`url("${matteUrl}")\`) |
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

