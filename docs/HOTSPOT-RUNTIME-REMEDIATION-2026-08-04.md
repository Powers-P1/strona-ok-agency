# Hotspot runtime remediation — plan wykonania

Data: 2026-08-04
Owner: desktop/system
Worktree: `G:\OK-Agency\.codex-worktrees\hotspot-runtime-remediation`
Branch: `agent/hotspot-runtime-remediation`
Baza: `origin/main@9f670a7c39def6832a1eab680995d501e6ea6cdf`

## Cel

Ustabilizować desktopowy system punktów/anotacji na wszystkich obsługiwanych proporcjach i rozmiarach okna. Punkt może być widoczny tylko wtedy, gdy cały jego ring leży na dozwolonym fragmencie artefaktu i poza aktywną maską bezpieczeństwa. Przy zmianie geometrii punkt przechodzi na następną deterministyczną kotwicę tego samego artefaktu albo znika razem z kartą i przewodem.

## Nienaruszalne wymagania

- Maski bezpieczeństwa i ich efekt wizualny pozostają bez zmian.
- Mobile `<=640px` nadal nie renderuje punktów, linii ani tabeli „Punkty na ilustracji”.
- Brak nowych `!important`, wyjątków per rozdzielczość i lokalnych poprawek per scena.
- Runtime nie analizuje koloru obrazu przy każdym hoverze, scrollu ani kliku.
- Kotwice są liczone wyłącznie po zmianie geometrii obrazu, viewportu albo maski bezpieczeństwa.
- Hover/klik zmienia wyłącznie stan karty; nie może przeliczać ani przesuwać punktów.
- Każda anotacja rozwiązuje się niezależnie. Błąd jednego punktu nie może zrzucać całej sceny do fallbacku.
- Nie istnieje widoczny `AUTHORED FALLBACK`. Brak poprawnej kotwicy oznacza deterministyczne ukrycie anotacji.
- Ukryta anotacja traci kartę, przewód, stan otwarcia, fokus klawiatury i ekspozycję ARIA.
- Wychodząca karta zachowuje swoją ostatnią geometrię do końca animacji i nie przeskakuje przy szybkim A → B.

## Potwierdzona przyczyna

1. Obecny solver ma najwyżej trzy ręczne profile współrzędnych i rozwiązuje całą scenę all-or-nothing.
2. Jedna nieważna kotwica powoduje `AUTHORED FALLBACK`, który omija walidację artefaktu oraz maski bezpieczeństwa.
3. Runtime nie korzysta z istniejących placement maps (`energy`, `highlight`, `structure`); sprawdza je tylko audyt źródłowych współrzędnych.
4. Kierunkowy feather jest traktowany jako pełny prostokąt, więc punkt może pozostać nad prawie przezroczystą częścią grafiki.
5. Macierz testowa nie obejmuje kluczowych proporcji 1024×900 i 2560×900 oraz nie sprawdza finalnego piksela placement/safety mask.

## Kontrakt docelowy

### Kotwice

- Każda anotacja otrzymuje uporządkowany zestaw kandydatów powiązanych z tym samym artefaktem.
- Dla scen energetycznych kolejność klas to `energy → highlight → structure`, o ile dana anotacja dopuszcza degradację.
- Dla O nas i scen bez energii obowiązuje `structure`.
- Preferowana kotwica jest stabilna między kolejnymi pomiarami. Zmiana następuje tylko wtedy, gdy poprzednia przestaje być poprawna.

### Walidacja widocznego punktu

Środek ringa musi leżeć na dozwolonym poziomie placement map. Cały ring 44 px musi jednocześnie:

- leżeć wewnątrz kadru obrazu i bezpiecznego insetu sceny;
- nie przecinać treści, fixed UI ani dolnego marginesu sceny;
- znajdować się w w pełni widocznej części safety mask, nie w obszarze prawie przezroczystego featheru.

### Stany

- `placed`: punkt ma stabilną kotwicę, może być fokusowany i otwierany;
- `hidden`: brak bezpiecznej kotwicy; punkt, karta i przewód są wyłączone;
- brak stanu pośredniego, w którym widoczny jest punkt bez poprawnej kotwicy.

## Plan krok po kroku

### 0. Bramka organizacyjna i baseline

- [x] Utworzyć świeży worktree z aktualnego `origin/main`.
- [x] Sprawdzić plik koordynacyjny i brak konfliktującego `INTENT`.
- [x] Zapisać zakres produkcyjnych plików w koordynacji.
- [x] Utrwalić aktualne reprodukcje i testy, które dziś błędnie przechodzą.

### 1. Centralny model kandydatów placement map

- [x] Zmapować istniejący format placement maps i generator.
- [x] Zaprojektować jeden centralny format uporządkowanych kandydatów bez ręcznych wyjątków rozdzielczości.
- [x] Wygenerować kandydatów deterministycznie na etapie build/audytu albo wczytać istniejące mapy raz na scenę.
- [x] Dodać cache danych per obraz/maska; brak ciągłego samplowania.

### 2. Niezależny solver anotacji i maska bezpieczeństwa

- [x] Usunąć all-or-nothing dla sceny.
- [x] Walidować środek na placement map oraz pełny ring na kadrze, treści i safety mask.
- [x] Preferować poprzednią poprawną kotwicę, potem kolejnych kandydatów.
- [x] Usunąć widoczny procentowy `AUTHORED FALLBACK`.
- [x] Gdy brak kandydata, zwracać jawny stan `hidden`.

### 3. Semantyka ukrycia i stabilność interakcji

- [x] Ukrywać punkt, przewód i kartę jako jedną jednostkę.
- [x] Usuwać hidden hotspot z tab order i synchronizować ARIA.
- [x] Zamknąć aktywną kartę, jeśli jej kotwica znika po resize/mask change.
- [x] Oddzielić lifecycle kotwicy od lifecycle karty.
- [x] Zamrozić geometrię wychodzącej karty/przewodu do końca animacji A → B.

### 4. Testy kontraktu

- [x] Rozszerzyć macierz o granice 820/821, 900, 1024, 1100, 1180/1181.
- [x] Dodać 1280×720, 1512×800, 1920×900, 2560×900, 2560×1440, 4K, 8K i skrajne proporcje.
- [x] Zakazać `AUTHORED FALLBACK` na każdej trasie desktopowej.
- [x] Sprawdzać finalny piksel placement map i alpha safety mask dla całego ringa.
- [x] Sprawdzać poprawne ukrycie i brak focus/ARIA dla nieważnych punktów.
- [x] Sprawdzać stabilność resize, scroll, hover, klik i szybkie A → B.
- [x] Zachować 0 anotacji na mobile.

### 5. Różnicowy QA wizualny

- [x] Uruchomić tylko testy właścicieli zmienionych w danym kroku.
- [x] Obejrzeć screenshoty wszystkich sześciu tras w reprezentatywnej macierzy.
- [x] Potwierdzić: punkty na artefakcie, brak punktów pod maską, brak przeskoków.
- [x] Wykonać resize bez reloadu oraz szybkie przejścia A → B.
- [x] Sprawdzić Chromium i WebKit; konsola bez nowych błędów.

### 6. Bramka repozytorium i publikacja

- [x] Sprawdzić brak nowych `!important`, duplikatów i tymczasowych plików.
- [x] Uruchomić pełne quality/link/build dopiero po zielonych testach różnicowych.
- [x] Zaktualizować wersje assetów centralnie.
- [x] Commit, push, PR, CI, merge i Cloudflare Pages.
- [x] Produkcyjny smoke na domenie.
- [x] Przekazać stabilny hash agentowi mobile i uzyskać niezależny QA 360/390.
- [x] Posprzątać task-local serwery, procesy i artefakty.

## Rejestr wykonania i ponownego odczytu

Po każdym kroku ten dokument jest aktualizowany i w całości ponownie odczytywany przed następną edycją produkcyjną.

| Czas | Krok | Wynik / dowód | Odczyt planu |
|---|---|---|---|
| 2026-08-04 | 0 / start | Worktree `agent/hotspot-runtime-remediation` na `9f670a7`; brak konfliktującego aktywnego intentu | wykonany po zapisie |
| 2026-08-04 | 0 / koordynacja | Zakres i inwarianty zapisane w `.tmp/OKAGENCY_AGENT_COORDINATION.md` | wykonany przed baseline |
| 2026-08-04 | 0 / baseline | `/social-media` 1024×768 przechodzi obecny geometry audit; macierz nie zawiera 1024×900 ani 2560×900 i sprawdza percent fallback tylko dla About. `check:annotation-energy` na aktualnym mainie FAIL dla `web-architecture/journey-outcome` compact+short (12,8 px od wymaganego artefaktu). Pełna stara macierz przekracza 180 s, więc dalsze iteracje będą różnicowe. | wykonany przed krokiem 1 |
| 2026-08-04 | 1 / placement data | `responsive-safety.js` dekoduje placement PNG raz, zachowuje raster tierów i deterministyczne pule kandydatów co 4 px; ten sam cache jest dostępny przez `getPlacementMap/requestPlacementMap`. Maska wizualna bez zmian. `node --check` i `check-responsive-safety.mjs` PASS. | wykonany przed krokiem 2 |
| 2026-08-04 | 2 / solver | Solver rozwiązuje anotacje niezależnie, zachowuje poprzednią poprawną kotwicę, wymaga środka na tierze placement map i pełnego ringa w `fullVisible`, bez `AUTHORED FALLBACK`. QA renderu: O nas 2560×900 `solved` 4/4 na drzewie, Social 2560×900 `solved` 4/4 na liniach energii, WWW 1024×900 `solved` 4/4 na artefakcie, WWW 821×900 `partial` 3/4 z bezpiecznym ukryciem czwartej anotacji. Targeted geometry `/social-media` 1024×768, syntax, responsive-safety i diff-check PASS. | wykonany przed krokiem 3 |
| 2026-08-04 | 3 / state i interakcje | Hidden hotspot jest atomowo zamknięty i ma `aria-hidden`, `inert`, `disabled`, `tabindex=-1`, ukryty przewód oraz kartę. Aktywna karta `Oferta` po resize 1024→821 zamyka się i przechodzi w hidden. Rzeczywisty klik A→B przez CUA: drift kotwic 0 px, drift wychodzącej karty 0 px po 30 i 130 ms; zmienia się wyłącznie opacity. Targeted geometry WWW 1024×768 PASS. | wykonany przed krokiem 4 |
| 2026-08-04 | 4 / kontrakt wykonywalny | `check-annotation-geometry.mjs` waliduje finalny runtime: stan `placed/hidden`, wybrany piksel placement tier, pełny ring wyłącznie w `fullVisible`, focus/ARIA/przewód hidden, stabilność scroll/hover/klik/A→B i aktywny resize 1024→821. `check-annotation-energy.mjs` sprawdza maski źródłowe i finalne selekcje runtime. Pełna macierz 6 tras × 18 viewportów (360/390, granice 820/821 i 1180/1181, ultrawide, 4K, 8K) PASS; placement audit 6 tras PASS: 37 energy + 9 structure. | wykonany przed krokiem 5 |
| 2026-08-04 | 5 / QA wizualny | Obejrzano stabilne screenshoty wszystkich 6 tras przy 1024×900 i 2560×900: widoczne ringi leżą na gałęziach/żyłach/obiekcie, a brak bezpiecznej kotwicy przy 1024 skutkuje ukryciem, nie punktem na tle. Resize bez reloadu 1024→821 zachował 3 punkty i atomowo ukrył czwarty; rzeczywisty szybki A→B przez CUA dał 0 px driftu karty po 30/130 ms. WebKit 6 tras przy 1024×900, 2560×900 i 390×844 PASS; Chromium/WebKit O nas console/pageerror gate PASS. | wykonany przed krokiem 6 |
| 2026-08-04 | 6 / bramka przed publikacją | Brak nowych `!important`, TODO/FIXME/console.log i plików tymczasowych; `git diff --check` PASS. Centralne wersje: `art-coordinate-system.js?v=20260804-1`, `responsive-safety.js?v=20260804-18`, zsynchronizowane mechanicznie na 13 stronach. `npm run build`, Pages Functions, Worker dry-run, placement-energy 6 tras oraz różnicowa geometria WWW 1024×900 PASS. Inwentarz wyjątków zregenerowany przez właścicielski skrypt. | wykonany przed commit/publikacją |
| 2026-08-04 | 6 / CI retry | Pierwszy runner PR #107 zakończył pełną geometrię jednym timeoutem `O nas / 1512×982 / callout-leading` po sztucznym limicie 4 s. Identyczny przypadek lokalnie PASS 3/3, bez błędu runtime. Timeout otwarcia/zamknięcia testu ujednolicono z istniejącym `TIMEOUT=15s`; test nadal wymaga pełnego stanu open/closed i po patchu targeted PASS. Produkcyjny CSS/JS bez zmian. | wykonany przed ponownym push/CI |
| 2026-08-04 | 6 / Pages Node 24 | PR #107 scalony jako `39b6558`, pełny GitHub CI PASS. Pierwszy produkcyjny Pages build zatrzymał istniejący test analytics, ponieważ regex `/501|…/` objął timestamp `captured_at=…41.501Z`. Hotfix porównuje dokładny bezpieczny kształt danych po wydzieleniu timestampu. Analytics 33/33 PASS na lokalnym Node 22 i zgodnym z Pages Node 24; brak zmian produkcyjnego CSS/JS/HTML. | wykonany przed hotfix PR |
| 2026-08-04 | 6 / stabilizacja testu interakcji | Dwa linuxowe runnery zatrzymały się wyłącznie na `O nas / 1512×982 / callout-leading`, podczas gdy runtime i ten przypadek lokalnie przechodziły. Przyczyna: test wysyłał syntetyczny `pointerleave`, ale fizyczny kursor Playwright pozostawał nad ringiem; Chromium mógł ponownie wysłać wejście podczas przejmowania focusu i otworzyć zamykany dymek. Po pomiarze klatki zamknięcia test przesuwa teraz fizyczny kursor poza target. Produkcyjny przypadek 1512×982 PASS 5/5; brak zmian runtime CSS/JS/HTML. | wykonany przed test-only PR |
| 2026-08-04 | 6 / produkcja i mobile | Main `986ec53`, Pages `85e8ac7c-3cdd-4f2a-8af4-f442d05874c9` SUCCESS i HTTP 200. Produkcja: placement 37 energy + 9 structure, geometria O nas 1024×900/2560×900 oraz WWW 821×900 PASS. Niezależny mobile QA: 12 kombinacji 360×640/390×844 × 6 tras, 0 dotów/linii/kart/summary, 0 overflow/nested scroll, maski i menu PASS, konsola czysta. Task-local PID 203532/port 7154 zatrzymany, karty i viewport QA zresetowane, brak osieroconych helperów. | wykonany przed finalnym CI/merge |
| 2026-08-04 | 6 / zakończenie | PR #109 pełny CI `30948896905` SUCCESS, w tym wcześniej niestabilna geometria 1512×982. PR scalony jako `c2150df`; końcowy Pages production deployment `c33411eb-b891-48fc-ba9f-c3e1d699b07b` SUCCESS. Wszystkie pozycje planu odznaczone; runtime produkcyjny pozostaje w wersjach `art-coordinate-system.js?v=20260804-1` i `responsive-safety.js?v=20260804-18`. | wykonany po publikacji |

### Dowód baseline

- `assets/art-coordinate-system.js` nie zmienił kontraktu od reprodukcji: `solveAdapter` nadal zwraca `null` po jednym nierozwiązywalnym punkcie, a `solveAll` nadal uruchamia `applyAuthoredCopySafety`.
- Obecna macierz: 1512×982, 1512×800, 1440×900, 1280×720, 1024×768, 390×844 i 360×640.
- Problemowe, nieobjęte proporcje z reprodukcji: Social 821–1100×900, WWW 1024×900, O nas i Social 2560×900.
- `responsive-safety.js` ładuje placement map do własnego cache, ale publikuje solverowi tylko prostokąt `fullVisible/feather`; `art-coordinate-system.js` nie ma dostępu do pikseli mapy.

## Pliki planowane w zakresie

- `assets/art-coordinate-system.js` — właściciel runtime placement/state.
- `assets/responsive-safety.js` — tylko odczyt istniejącego kontraktu maski; zmiana wyłącznie jeśli trzeba opublikować numeryczną alpha/region bez zmiany wyglądu.
- `scripts/build-annotation-placement-masks.mjs` — centralne dane kandydatów, jeśli obecny format ich nie dostarcza.
- `scripts/check-annotation-energy.mjs` — finalna walidacja runtime/placement.
- `scripts/check-annotation-geometry.mjs` — macierz, brak fallbacku, hide/focus/ARIA i stabilność.
- HTML tras — wyłącznie centralny cache-bump lub mechanicznie wygenerowane metadane; bez ręcznych korekt pozycji per viewport.
- `scripts/asset-versions.mjs` i `package.json` — tylko jeśli wymagane przez wspólny kontrakt/test.

Zakres może zostać zawężony po kroku 1. Każde rozszerzenie wymaga aktualizacji planu i pliku koordynacyjnego przed edycją.
