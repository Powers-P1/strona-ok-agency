# OK Agency

Oficjalny, wielostronicowy serwis OK Agency publikowany pod
[okagency.pl](https://okagency.pl).

## Praca lokalna

Lokalnie wymagany jest Node.js 22 lub nowszy. Cloudflare Pages buduje stronę
na Node.js 24 zgodnie z `.nvmrc`.

```powershell
npm install
npm run dev
```

Serwer lokalny udostępnia stronę pod `http://127.0.0.1:7100/`.

## Weryfikacja

```powershell
npm run check:links
npm run build
```

Polecenie `build` przygotowuje w `dist/` wyłącznie pliki produkcyjne oraz
nagłówki bezpieczeństwa Cloudflare Pages generowane na podstawie `_headers`.

## Publikacja

Cloudflare Pages jest połączone z repozytorium GitHub:

- push do `main` uruchamia produkcyjny build i deploy,
- pozostałe gałęzie oraz pull requesty otrzymują wdrożenia podglądowe,
- polecenie budowania: `npm run build`,
- katalog wynikowy: `dist`.

Konfiguracja formularza i jego Workera znajduje się w
`wrangler.contact.jsonc`. Przekierowania `www` oraz domeny alternatywnej są
obsługiwane przez Cloudflare Redirect Rules.

Kompletna dokumentacja produkcji, DNS, poczty, sekretów, monitoringu i
procedur utrzymaniowych znajduje się w
[`docs/PRODUCTION-OPERATIONS.md`](docs/PRODUCTION-OPERATIONS.md).
