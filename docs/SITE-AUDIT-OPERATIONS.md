# Rozszerzona diagnostyka WWW — instrukcja operacyjna

## Zakres i granice

Usługa wykonuje wyłącznie pasywną analizę publicznych rekordów DNS i zasobów HTTP/HTTPS domeny wskazanej przez użytkownika. Nie loguje się, nie skanuje portów, nie zgaduje haseł, nie omija zabezpieczeń i nie wykonuje prób eksploatacji. Przed uruchomieniem użytkownik potwierdza własność domeny albo upoważnienie; zapisujemy wersję informacji i czas akceptacji.

Kontrakt raportu `2.0` obejmuje siedem kategorii: wydajność, SEO i indeksowanie, dostępność, domenę i DNS, HTTPS i bezpieczeństwo, konwersję i UX oraz zaufanie i treść. Runner sprawdza A/AAAA, NS, CAA, MX, SPF, DMARC i DNSSEC, certyfikat TLS, przekierowania, nagłówki bezpieczeństwa, robots.txt, do 3 map XML oraz maksymalnie 8 publicznych podstron tego samego hosta. Crawl ma współbieżność 2, respektuje robots.txt, odrzuca prywatne i zastrzeżone adresy po każdym rozwiązaniu DNS oraz przekierowaniu i stosuje limity czasu i rozmiaru odpowiedzi.

Limity startowe:

- 100 nowych audytów na dobę globalnie;
- 3 nowe audyty jednej domeny na dobę;
- deduplikacja aktualnego wyniku przez 24 godziny;
- retencja zadania i raportu przez 7 dni.

Limity są przechowywane w tabeli `service_config`, więc można je zmienić bez publikowania nowej wersji Workera.

## Przepływ

1. `/diagnoza-www` wysyła domenę, token Turnstile i wersję zgody do `POST /api/site-audits`.
2. Worker weryfikuje Origin, JSON, zgodę, Turnstile, nazwę domeny i publiczne rekordy DNS.
3. D1 transakcyjnie egzekwuje limity, zapisuje zadanie oraz skrót losowego tokenu odczytu.
4. Queue dostarcza zadanie do Workera, który podpisuje je HMAC i wysyła do prywatnego webhooka n8n.
5. n8n orkiestruje deterministyczny runner: Web/SEO, DNS i zasoby techniczne, konwersja, zaufanie i bezpieczeństwo, a następnie raport w schemacie `2.0`.
6. Runner podpisuje callback do Workera. Worker sprawdza czas, nonce, HMAC, token ukończenia i schemat raportu.
7. Przeglądarka odpytuje `GET /api/site-audits/:id` z losowym tokenem Bearer przechowywanym tylko w `sessionStorage`.
8. Na żądanie użytkownika przeglądarka składa pełny, przeszukiwalny PDF lokalnie z odebranego raportu i lokalnych fontów Archivo oraz Barlow Condensed. Pobranie nie uruchamia osobnego backendu i nie przekazuje wyniku dodatkowej usłudze.

## Zasoby Cloudflare

Stan produkcyjny od 2026-08-04:

| Zasób | Nazwa / binding | Cel |
|---|---|---|
| Worker | `okagency-site-audit-api` | API, producent i konsument Queue, cleanup |
| D1 | `okagency-site-audits` / `DB` | zadania, limity, nonce i konfiguracja |
| Queue | `okagency-site-audits` / `AUDIT_QUEUE` | dostarczenie zadania do n8n |
| DLQ | `okagency-site-audits-dlq` | zadania po wyczerpaniu prób |
| Turnstile | istniejący widget dla `okagency.pl` | ochrona intake; akcja `site_audit` |
| Cron | `*/5 * * * *` | timeouty i usuwanie danych po retencji |

Identyfikator produkcyjnej D1 jest zapisany w `wrangler.site-audit.jsonc`. Worker ma dwie trasy API w strefie, producenta i konsumenta Queue oraz cron cleanup. Publiczny host `workers.dev` przyjmuje wyłącznie podpisany callback; intake i polling zwracają tam `404`.

## Sekrety i zmienne

Żadnego sekretu nie wpisujemy do repozytorium, wiadomości ani konfiguracji `vars`.

Sekrety Workera:

- `TURNSTILE_SECRET` — sekret istniejącego widgetu;
- `WORKER_N8N_HMAC_SECRET` — podpis Worker → n8n;
- `N8N_CALLBACK_HMAC_SECRET` — podpis runner → Worker;
- `N8N_WEBHOOK_URL` — adres chronionego webhooka produkcyjnego n8n;
- `CF_ACCESS_CLIENT_ID` i `CF_ACCESS_CLIENT_SECRET` — dodatkowa bramka nagłówkowa przed webhookiem VPS.

Zmienne Workera:

- `CALLBACK_BASE_URL=https://okagency-site-audit-api.oli-struska.workers.dev`;
- `CALLBACK_HOSTNAME=okagency-site-audit-api.oli-struska.workers.dev`;
- `TURNSTILE_HOSTNAMES=okagency.pl,www.okagency.pl`;
- `RULESET_VERSION=2026.08.2` i `SCANNER_VERSION=2.0.0`.

Sekrety n8n/runnera muszą mieć te same wartości HMAC. Opcjonalny `PAGESPEED_API_KEY` trafia wyłącznie do magazynu sekretów środowiska runnera. Brak klucza nie zatrzymuje audytu — raport jest oznaczany jako częściowy.

## Wymagania VPS

Produkcja działa na `vps-eea6bbe0.vps.ovh.net` w OVHcloud, Warszawa: Ubuntu 24.04, 2 vCPU, 4 GB RAM i 40 GB dysku. Port n8n jest związany wyłącznie z `127.0.0.1:5678`; Caddy publikuje tylko dokładną ścieżkę webhooka oraz `/healthz`. Runner pozostaje w prywatnej sieci Docker bez publicznego portu.

Wdrożenie produkcyjne powinno zachować ograniczenia ze stagingu: read-only filesystem runnera, `cap_drop: ALL`, `no-new-privileges`, limit CPU/RAM, przypięty obraz po digest, task runners w n8n i wyłączone community packages.

Bot Fight Mode w strefie może blokować serwerowy callback przed dotarciem do trasy Workera. Dlatego callback używa wąskiego hosta `workers.dev`, na którym kod dopuszcza wyłącznie `POST /api/site-audits/:id/callback`. HMAC, pięciominutowe okno czasu i jednorazowy nonce pozostają obowiązkowe.

Caddy musi redagować `Cf-Access-Client-Id`, `Cf-Access-Client-Secret` i `X-Ok-Signature` w access logu. Po każdym podejrzeniu ujawnienia sekret bramki należy obrócić jednocześnie w `.env` VPS i sekrecie Workera.

## Kolejność wdrożenia

1. Wykonać backup n8n i bazy.
2. Utworzyć D1, Queue i DLQ; wpisać prawdziwy `database_id`.
3. Zastosować migrację `migrations/site-audit/0001_jobs.sql` najpierw lokalnie, potem zdalnie.
4. Wgrać sekrety Workera bez wyświetlania ich w terminalu lub logach.
5. Wdrożyć n8n i runner, ale pozostawić publiczny intake wyłączony.
6. Wykonać podpisany test webhooka oraz callbacku na domenie kontrolowanej przez OK Agency.
7. Wdrożyć Worker, uruchomić test przeglądarkowy i dopiero potem opublikować link w nawigacji.
8. Przez pierwszą dobę obserwować Queue, DLQ, odsetek raportów częściowych, czas realizacji i błędy callbacku.

Pilot kontraktu `1.0` po finalnej rotacji sekretów zakończył się 2026-08-04 statusem `partial`, wynikiem 79/100, pięcioma kategoriami, poprawnym callbackiem i zapisem raportu w D1. Przed publikacją kontraktu `2.0` należy wykonać nowy pilot siedmiu kategorii; brak `PAGESPEED_API_KEY` nie blokuje pozostałych kontroli, ale obniża poziom pewności raportu.

## Monitoring i reakcja

- Alert: wiadomość w DLQ, powtarzający się `callback_failed`, wzrost zadań `failed`, brak ukończeń przez 15 minut przy aktywnej kolejce.
- Nie logować domen wraz z tokenem odczytu, treści HTML, sekretów, pełnego IP ani pełnych podpisanych payloadów.
- Zadanie `running` przekraczające timeout ma zostać oznaczone jako `failed`; cron usuwa dane po retencji.
- Przy awarii PageSpeed pozostawić usługę aktywną jako częściową. Przy błędzie DNS/SSRF nie obchodzić blokady ręcznie.
- Monitorować czas i rozmiar odpowiedzi kolektora DNS/crawla; nie podnosić limitów ani liczby podstron bez ponownej analizy ryzyka SSRF, obciążenia domen docelowych i zasobów VPS.

## Rollback

1. Usuń link do `/diagnoza-www` z wejść publicznych albo ustaw kontrolowany komunikat serwisowy.
2. Wyłącz konsumenta Queue lub ustaw limit globalny na `0`, zachowując możliwość odczytu gotowych raportów.
3. Wycofaj Worker do poprzedniej wersji. Nie usuwaj D1, dopóki zadania nie wygasną albo nie zostaną bezpiecznie wyeksportowane.
4. Po naprawie uruchom test na domenie kontrolowanej, sprawdź callback i dopiero przywróć limit.

## Kontrole przed publikacją

```powershell
npm ci
npm run check:site-audit
npm run build
```

Przed uruchomieniem publicznym treść polityki prywatności i oświadczenia o upoważnieniu powinna zostać sprawdzona przez osobę świadczącą obsługę prawną. Dokumentacja techniczna opisuje rzeczywisty przepływ, ale nie jest poradą prawną.
