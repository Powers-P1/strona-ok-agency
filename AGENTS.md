# OK Agency — instrukcje repozytorium

## Zakres

- Właściwym katalogiem projektu jest `G:\OK-Agency\05-website\hero_kimi`.
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
- `scripts/build.mjs` tworzy katalog `dist/` dla GitHub Pages.
- Główna domena: `https://okagency.pl`.
- Repozytorium: `Powers-P1/strona-ok-agency`.

## Zasady zmian

- Traktuj istniejący wygląd i treść jako zatwierdzony kierunek.
- Nie wymyślaj danych firmy, klientów, wyników, nagród ani danych kontaktowych.
- Zachowuj semantykę HTML, obsługę klawiatury i `prefers-reduced-motion`.
- Nie dodawaj trackerów, analityki ani nowych zewnętrznych integracji bez
  wyraźnej zgody.
- Aktualizuj mapę nawigacji i sitemapę, gdy dodajesz albo usuwasz stronę.

## Wymagane sprawdzenia

```powershell
npm run check:links
npm run build
```

## Publikacja

- Gałąź produkcyjna: `main`.
- CI i GitHub Pages są skonfigurowane w `.github/workflows/`.
- Artefakt wdrożeniowy musi pochodzić z `dist/`.
- Po wdrożeniu sprawdź `https://okagency.pl` i kluczowe podstrony.
