# OK Agency — instrukcje repozytorium

## Zakres

- Właściwym katalogiem projektu jest `G:\OK-Agency`.
- Produkcyjne strony HTML znajdują się w katalogu głównym, a ich zasoby w
  `assets/`.
- `05-editorial-atelier/`, `mockups/` i `_src/` są lokalnymi materiałami
  roboczymi. Nie dodawaj ich do repozytorium ani artefaktu produkcyjnego.
- Zachowuj dokumentację historyczną w `docs/concepts/`,
  `docs/screenshots/` i `docs/design-decisions.md`.

## Architektura

- Statyczny, wielostronicowy serwis HTML/CSS/JavaScript bez frameworka
  produkcyjnego.
- `server.mjs` służy wyłącznie do lokalnego podglądu.
- `scripts/build.mjs` tworzy katalog `dist/` dla Cloudflare Pages.
- Główna domena: `https://okagency.pl`.
- Repozytorium: `Powers-P1/strona-ok-agency`.

## Zasady zmian

- Traktuj istniejący wygląd i treść jako zatwierdzony kierunek.
- Nie wymyślaj danych firmy, klientów, wyników, nagród ani danych kontaktowych.
- Zachowuj semantykę HTML, obsługę klawiatury i `prefers-reduced-motion`.
- Nie dodawaj trackerów, analityki ani nowych zewnętrznych integracji bez
  wyraźnej zgody.
- Aktualizuj mapę nawigacji i sitemapę, gdy dodajesz albo usuwasz stronę.
- Po zmianie hostingu, domen, DNS, poczty, Workera, sekretów, workflowów albo
  zabezpieczeń aktualizuj `docs/PRODUCTION-OPERATIONS.md`.
- Reguły dotyczące co najmniej dwóch tras (layout scen, nawigacja, ruch,
  responsywność, typografia, stopka) implementuj wyłącznie we wspólnym zasobie
  i wspólnym tokenie. Nie naprawiaj problemu systemowego wyjątkami per strona.
- Lokalne arkusze i skrypty mogą zawierać tylko kompozycję oraz zachowanie
  unikalne dla danej podstrony. Po przeniesieniu reguły globalnej usuń martwe
  selektory, duplikaty, nieużywaną logikę i nieaktualne testy.
- Każda scena podstrony scenicznej musi zajmować pełny kadr: `100svh`.
  Globalna nawigacja jest warstwą nakładaną i nie pomniejsza wysokości sceny;
  jej slot w przepływie jest zerowany wspólnie dla wszystkich stron scenicznych.
  Treść ma być przeorganizowana przez
  breakpointy; nie wolno wydłużać sceny, dodawać wewnętrznych scrollerów ani
  przywracać minimalnego progu wysokości większego od dostępnego kadru.
- Każda zmiana wspólnego kontraktu UI wymaga testu regresji obejmującego
  wszystkie korzystające z niego trasy oraz aktualizacji wersji zasobu.
- Właściciele wspólnego UI: `assets/design-tokens.css` (typografia i tokeny),
  `assets/scene-viewport.css` (pełny kadr), `assets/annotation-system.css`
  (wygląd anotacji), `assets/art-coordinate-system.js` (geometria i maski),
  `assets/service-interactions.js` (interakcje), `assets/responsive-safety.css`
  (kontrakt mobile) oraz `assets/site-footer.js` i `assets/site-footer.css`
  (stopka). Nie duplikuj ich odpowiedzialności w arkuszach tras.
- Wersje wspólnych assetów są własnością `scripts/asset-versions.mjs`.
  Po ich zmianie uruchom `npm run sync:asset-versions`, a przed commitem
  `npm run check:asset-versions`; nie poprawiaj query stringów ręcznie per HTML.

## Wymagane sprawdzenia

```powershell
npm run check:links
npm run check:quality
npm run build
```

Przy zmianie wspólnego kontraktu skali, typografii, pełnego kadru albo
responsywności uruchom dodatkowo `npm run check:system-scale` po ustabilizowaniu
zmian. Podczas iteracji używaj najwęższego testu odpowiadającego zmienianemu
kontraktowi; pełną bramkę uruchamiaj raz przed PR.

## Publikacja

- Gałąź produkcyjna: `main`.
- Cloudflare Pages jest połączone z repozytorium GitHub i automatycznie
  wdraża zmiany z `main`.
- Artefakt wdrożeniowy musi pochodzić z `dist/`.
- Po wdrożeniu sprawdź `https://okagency.pl` i kluczowe podstrony.
- Szczegóły infrastruktury i procedury awaryjne są opisane w
  `docs/PRODUCTION-OPERATIONS.md`.
