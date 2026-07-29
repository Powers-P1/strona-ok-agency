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
konfigurację Cloudflare Pages z `_headers` i `_redirects`.

## Publikacja

Cloudflare Pages jest połączone z repozytorium GitHub:

- push do `main` uruchamia produkcyjny build i deploy,
- pozostałe gałęzie oraz pull requesty otrzymują wdrożenia podglądowe,
- polecenie budowania: `npm run build`,
- katalog wynikowy: `dist`.

Konfiguracja projektu dla Wranglera znajduje się w `wrangler.jsonc`.
