# OK Agency

Oficjalny, wielostronicowy serwis OK Agency publikowany pod
[okagency.pl](https://okagency.pl).

## Praca lokalna

Wymagany jest Node.js 22 lub nowszy.

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

Polecenie `build` przygotowuje w `dist/` wyłącznie pliki publikowane przez
GitHub Pages. Materiały robocze i mockupy nie trafiają do repozytorium ani na
serwer produkcyjny.

## Publikacja

Zmiany na gałęzi `main` są automatycznie sprawdzane i wdrażane przez GitHub
Actions. Domena `okagency.pl` korzysta z DNS Cloudflare i wskazuje na GitHub
Pages.
