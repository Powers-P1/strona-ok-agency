# Strona OK Agency

Jednostronicowa, responsywna wizytówka OK Agency — agencji marketingowej oferującej marketing online i tworzenie stron internetowych małym firmom i MŚP.

## Stack

- Astro 7 i TypeScript — statyczny, lekki wynik odpowiedni dla GitHub Pages
- nowoczesny CSS — własny system tokenów bez ciężkiej biblioteki UI
- Instrument Sans i Instrument Serif — fonty przechowywane lokalnie w paczkach npm
- Playwright i axe-core — testy responsywności, interakcji i podstaw dostępności
- GitHub Actions — CI i automatyczne wdrożenie Pages

## Praca lokalna

Wymagany Node.js 24+.

```powershell
npm ci
npm run dev
```

Strona działa lokalnie pod adresem `http://localhost:4321/`.

## Kontrola jakości

```powershell
npm run format:check
npm run lint
npm run typecheck
npm run test:e2e
npm run build
```

Pełny zestaw kontroli uruchamia `npm run check`.

## Publikacja

- Repozytorium: [Powers-P1/strona-ok-agency](https://github.com/Powers-P1/strona-ok-agency)
- Strona: [okagency.pl](https://okagency.pl/)
- Gałąź główna: `main`

Workflow wdrożeniowy buduje katalog `dist/` i publikuje go jako artefakt GitHub Pages pod domeną `okagency.pl`.

## Podgląd

![Widok desktopowy](docs/screenshots/desktop.png)

![Widok mobilny](docs/screenshots/mobile.png)

Decyzje projektowe i źródłowe makiety znajdują się w [docs/design-decisions.md](docs/design-decisions.md).
