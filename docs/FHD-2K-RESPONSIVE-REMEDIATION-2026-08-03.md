# FHD / 2K responsive system remediation

Data: 2026-08-03  
Status: zakończone; wdrożenie produkcyjne i niezależny mobile QA zweryfikowane

Branch implementacji: `agent/fhd-2k-responsive-remediation`

Branch raportu końcowego: `agent/fhd-2k-responsive-final-report`
Worktree: `G:\OK-Agency\.codex-worktrees\fhd-2k-responsive-remediation`  
Baseline: `origin/main` / `a9b53652908427ec432f3d7e48d0acaf2128210a`  
Baseline Pages: `511f002b-547c-4cb0-8e18-a8083bd04468`

## Cel i ograniczenia

Celem jest usunięcie ośmiu zgłoszonych regresji jako problemów systemowych, a nie serii lokalnych wyjątków. Współdzielone zachowanie ma mieć jednego właściciela, semantyczne tokeny oraz test runtime. Sceny desktopowe pozostają dokładnie `100svh`; rozwinięcie proof/accordion nie może tworzyć zagnieżdżonego scrolla, ujawniać kolejnej sceny ani skalować treści przez `transform`. Mobile `<=640px` zachowuje obecny kontrakt.

Nie wolno dodawać `!important`. Lokalny wyjątek jest dopuszczalny wyłącznie dla unikalnej kompozycji grafiki, po udokumentowaniu i dodaniu testu. Na etapie diagnozy nie znaleziono potrzeby nowego wyjątku trasowego.

## Materiał wejściowy i reprodukcja

Osiem załączonych wycinków obejrzano w oryginalnej rozdzielczości. Wymiary plików to odpowiednio: `910×713`, `732×651`, `253×156`, `235×120`, `198×188`, `1697×62`, `434×124`, `779×247`. Są to wycinki, nie deklaracje viewportów.

| # | Zgłoszenie | Reprodukcja na baseline | Dowód techniczny |
|---|---|---|---|
| 1 | Campaign proof wygląda na obcięty | Zbadano 1366×768 i zbliżony wycinek 912×709; obecny panel ma naturalną wysokość, `transform:none`, brak nested scrolla i clipu. Ryzyko wraca po powiększeniu współdzielonej typografii, dlatego każdy panel pozostaje w bramce. | Campaign 1366×768: `clip=0`, dolny luz CTA 156 px. |
| 2 | Grafika procesu nad tekstem i techniczny indeks sceny | Odtworzone w scenie realizacji. Maska w trybie `auto` na szerokim desktopie jest wyłączana, a kicker zawiera `03 / Realizacja`. | `data-ok-safe-art="idle"`, brak maski; indeks zapisany w HTML. |
| 3 | Kolizja linii nagłówka display | Odtworzona w proof przy 2K. | `font-size:112.32px`, `line-height:103.334px`; wysokość glifu ok. 134 px, czyli ok. 30.7 px przecięcia kolejnych wierszy. |
| 4 | Kolizja linii pytania w decision guide | Odtworzona w decision guide przy 2K. | `font-size:122.4px`, `line-height:100.368px`; ok. 45.64 px przecięcia kolejnych wierszy. Późny owner ustawia `line-height:.82`. |
| 5 | Brak maski ochronnej przy 2K | Odtworzone na `strony-internetowe#web-architecture` lokalnie i produkcyjnie w 2560×1440. Gałąź przechodzi przez napis. | Scena `idle`, `mask-image:none`, tryb `auto`; warunek JS wyłącza maskę dla niekompaktowego desktopu. |
| 6 | Nawigacja za mała przy 2K | Odtworzone w 2560×1440. | Semantyczny label ma 17.28 px, ale finalny link/summary 12 px / 14.4 px przez bardziej specyficzny selektor `site-navigation.css`; popover ma 13 px. |
| 7 | Szczegół proof przy 2K wygląda na obcięty | Odtworzono scenę i otwarto wiersz SEO. W stanie ustalonym tekst mieści się, ale fixed 13–15 px i ciasna geometria nie odpowiadają skali 2K. | Panel `77.05px`, `clip=0`, `transform:none`; realny klik CUA zachowuje `scrollY` i scenę. Auto-scroll locatora Playwright jest artefaktem harnessu. |
| 8 | Support grid za mały przy 2K | Odtworzone w 2560×1440. | Grid ma body 15 px i label 13 px przy semantycznych tokenach 22.32 / 17.28 px. |

Dodatkowo arbitralny resize 2560×1440 → 1920×1080 bez reloadu zachowuje stare absolutne `scrollY=4320`, przez co aktywny widok przesuwa się z `process-delivery` do następnej sceny. Obecne testy tego nie wykrywają.

Screenshoty baseline zapisano poza repo w `G:\OK-Agency\.tmp\fhd-2k-responsive-remediation-20260803`.

## Przyczyny źródłowe i właściciele

### 1. Typografia display

`assets/design-tokens.css` nie ma semantycznego tokenu interlinii display. Trasy powtarzają lokalne `.90–.92`, a późny `assets/visual-direction-scenes.v20260730-2.css` ustawia dla decision guide `.82`. To jest rzeczywista kolizja odpowiedzialności w cascade.

Właściciel docelowy: token w `assets/design-tokens.css` i jeden współdzielony selektor konsumentów w `assets/responsive-foundation.v20260730-8.css` / `assets/site-enhancements.css`. Lokalne deklaracje dla migrowanych nagłówków zostaną usunięte, nie nadpisane silniejszym selektorem.

### 2. Bezpieczna strefa grafiki

`assets/responsive-safety.js` zna rzeczywisty bbox widocznej treści, ale maskuje grafikę tylko w profilach kompaktowych lub przy ręcznym `data-ok-safe-mask="always"`. W trybie aktywnym tworzy jednowymiarowy gradient odsłaniający tylko największą stronę grafiki. Taki model potrafi niepotrzebnie wymazać całą resztę artworku.

Publiczny `getArtBounds()` publikuje dziś wersję 1 z `fullVisible` i `feather`; `assets/art-coordinate-system.js` używa ich unii jako prostokątnego obszaru dopuszczalnego dla ringów. Nowa maska musi zachować stabilność hotspotów. Docelowy kontrakt będzie publikował pełny prostokąt artworku oraz lokalny prostokąt chronionej treści/feather. Solver nadal sprawdza istniejące przeszkody content, więc lokalna dziura maski nie wymaga zredukowania całego artworku do jednego bocznego pasa.

Właściciel docelowy: `assets/responsive-safety.js` + `assets/responsive-safety.css`; konsument kontraktu: `assets/art-coordinate-system.js`. Aktywacja globalna dla scen usług/O nas na desktopie, opt-out tylko przez istniejące `never`; mobile pozostaje wyłączony przez wspólny owner.

### 3. Nawigacja i skala 2K+

`assets/site-navigation.css` jest właścicielem finalnego komponentu i przez wyższą specyficzność wygrywa z semantyczną deklaracją w foundation. Fixed 12/13 px, stała wysokość oraz szerokość logo nie skalują się wraz z systemem.

Właściciel docelowy: wyłącznie `assets/site-navigation.css`, konsumujący semantyczne role typu i współdzielone clampy geometrii. Reguły trasowe, które już przegrywają i próbują sterować fontem globalnego nagłówka, są martwą odpowiedzialnością i zostaną usunięte w dotkniętym zakresie. Media query mobile pozostaje źródłem prawdy dla `<=640px`.

### 4. Decision/support grid

`assets/site-enhancements.css` utrzymuje fixed 13/15 px dla eyebrow, nagłówków i body oraz statyczne paddings. To ten sam komponent na trasach, więc poprawka należy do jednego ownera.

Właściciel docelowy: `assets/site-enhancements.css`, wykorzystujący `--ok-type-label`, `--ok-type-content`, współdzielone leading i fluid spacing.

### 5. Proof/accordion/CTA i sceny

PR #92 usunął wcześniejszy `transform:scale` i nadał panelom naturalną wysokość. Bieżący baseline przechodzi istniejące testy komponentowe. Nie ma podstaw do prewencyjnej zmiany geometrii. Najpierw zostaną wzmocnione testy o każdy panel, minimum 18 px dolnego luzu i semantyczne role 2K+; owner proof zmieni się tylko, jeśli po migracji typografii test wykaże realne przekroczenie budżetu `100svh`.

Właściciel docelowy w razie potrzeby: istniejący shared owner w `assets/scene-viewport.css` / `assets/responsive-foundation.v20260730-8.css`, nigdy arkusz pojedynczej trasy.

### 6. Stabilność aktywnej sceny po resize

Sceny poprawnie przeliczają wysokość do nowego `100svh`, ale dokument zachowuje stare absolutne `scrollY`. Brakuje centralnego kotwiczenia sceny i względnego offsetu na czas rzeczywistej zmiany viewportu.

Właściciel docelowy: `assets/responsive-safety.js`. Kotwiczenie będzie desktop-only, rozróżni resize viewportu od `ResizeObserver` treści i nie zmieni kontraktu mobilnego ani normalnego scrollowania użytkownika.

### 7. Techniczne indeksy scen

`o-nas.html` na baseline ma już samo `O nas`. `proces.html` nadal zawiera `01 / Odkrycie`, `03 / Realizacja`, `04 / Optymalizacja`. Zostaną zmienione na etykiety bez numerów. Funkcjonalna numeracja list, etapów i disclosure pozostaje.

## Inwentarz cascade i dług

Generowany baseline `docs/SYSTEM-EXCEPTIONS-INVENTORY.md` raportuje 217 użyć `!important`, 983 lokalne deklaracje typografii, 297 lokalnych przejęć shared ownera, 28 inline styles i 46 runtime style mutations. To dług istniejący, nie zakres masowego refaktoru.

W tym zadaniu obowiązują mierzalne reguły:

- liczba `!important` nie wzrośnie;
- nowe zachowania współdzielone powstaną wyłącznie w wymienionych ownerach;
- przegrywające reguły line-height i globalnego nav w dotkniętych trasach zostaną usunięte;
- inwentarz zostanie wygenerowany ponownie po zmianach;
- każdy pozostawiony lokalny wyjątek z dotkniętego zakresu musi być opisany tutaj i pokryty testem. Aktualnie: brak planowanych wyjątków.

## Plan implementacji

- [x] Utworzyć świeży worktree/branch dokładnie z aktualnego `origin/main`.
- [x] Zarejestrować zakres w pliku koordynacyjnym i potwierdzić brak aktywnej kolizji.
- [x] Obejrzeć osiem obrazów w oryginalnej rozdzielczości.
- [x] Odtworzyć wskazane zachowania lokalnie i na baseline produkcji.
- [x] Zmapować computed cascade, publiczne kontrakty maski i braki testów.
- [x] Zapisać ten plan przed pierwszą edycją produkcyjną.
- [x] Dodać jeden semantyczny token leading display i przenieść do shared ownera wszystkich konsumentów w zakresie usług/O nas/decision guide.
- [x] Usunąć lokalne, przegrywające deklaracje leading dla migrowanych nagłówków.
- [x] Zastąpić jednowymiarową kurtynę maską lokalnej strefy bbox + margines + feather; aktywować ją globalnie na desktopowych scenach z artworkiem.
- [x] Rozszerzyć wersjonowany kontrakt bounds i dostosować solver hotspotów bez utraty poprawnych kotwic.
- [x] Przenieść finalną skalę nav 2K+ do `site-navigation.css` i usunąć martwe trasowe próby sterowania typografią nav.
- [x] Przenieść support grid/decision copy na semantyczne tokeny i fluid spacing w `site-enhancements.css`.
- [x] Usunąć techniczne prefiksy scen z `proces.html`; potwierdzić brak ich odpowiedników na pozostałych trasach.
- [x] Dodać centralne zachowanie zachowujące aktywną scenę i offset po arbitralnym resize desktopu bez reloadu.
- [x] Wzmocnić testy maski, leading/bbox, nav, support grid, resize oraz każdego panelu disclosure z minimum 18 px dolnego luzu.
- [x] Zmienić shared proof geometry tylko przy rzeczywistym failu po migracji; nie dodawać trasowych wyjątków.
- [x] Zsynchronizować centralne wersje assetów i wygenerować inwentarz wyjątków.
- [x] Wykonać iteracyjne testy właścicieli oraz wizualne before/after Browser QA.
- [x] Wykonać pełną bramkę lokalną i macierz viewportów.
- [x] Zlecić niezależny review subagentom w trybie high+; naprawić i ponownie sprawdzić ustalenia.
- [x] Commit, push, PR, CI, merge do `main`.
- [x] Potwierdzić Cloudflare Pages, production smoke, Production monitor i przekazać handoff mobile.
- [x] Zatrzymać task-local server/browser helpers, sfinalizować Browser i zostawić czysty worktree.

## Bramka testowa

### Viewporty obowiązkowe

`1366×768`, `1536×864`, `1920×1080`, `2560×1440`, `3840×2160`, `7680×4320`; krótkie `1152×600`, `1440×600`, `1440×640`; mobile `360×640`, `390×844`; dodatkowo reprezentatywne 16:10, 21:9 i 4:3 oraz arbitralne zmiany rozmiaru bez reloadu.

### Asercje runtime

- każda scena desktopowa ma wysokość równą `100svh`;
- każdy disclosure po realnym kliknięciu pozostaje w tej samej scenie, ma spójne `aria-expanded`/`hidden`, `clip=0`, `transform:none`, brak nested scrolla i co najmniej 18 px dolnego luzu;
- bboxy kolejnych renderowanych linii nagłówków nie przecinają się; próbki obejmują polskie znaki, `j/g/y`, znak zapytania i kropki;
- finalny nav, proof copy, support grid i labels konsumują role semantyczne 2K+;
- chroniony bbox tekstu wraz z marginesem nie zawiera kryjącego artworku, a grafika pozostaje widoczna poza strefą; wynik aktualizuje się po resize bez reloadu;
- aktywna scena oraz względny offset pozostają zachowane po zmianie width/height/aspect;
- brak realnego poziomego overflow, framework overlay oraz nowych warning/error w konsoli.

### Istniejące bramki i luka baseline

Baseline przechodzi `check:desktop-system-components`, `check:system-scale`, statyczny `check-responsive-safety` i statyczny `check-global-navigation`. `check:scene-disclosures` jest szeroki i przy domyślnym limicie czasu przekroczył 180 s; będzie uruchomiony z adekwatnym limitem po iteracyjnych testach różnicowych. Obecne testy nie mierzą: wszystkich paneli na 2K+, przecięcia bboxów linii, finalnej skali nav/support grid, szerokiej maski ani zachowania aktywnej sceny przy resize. Te luki są częścią implementacji, nie powodem do lokalnego obejścia.

## Artefakty QA

Before/after będą przechowywane w `G:\OK-Agency\.tmp\fhd-2k-responsive-remediation-20260803` i wymienione w finalnym raporcie. Dokument pozostanie checklistą wykonania; pola zostaną aktualizowane po zakończeniu każdej fazy.

## Wynik lokalnego QA

- pełna macierz disclosure: `5 tras × 14 viewportów`, wszystkie panele, minimum 18 px — PASS;
- geometria anotacji: `6 tras × 7 viewportów` — PASS;
- kontrakt FHD/2K/4K/8K, rzeczywista maska SVG i resize z offsetami 60%/35% — PASS w Chromium;
- 2K mask families i resize 60% — PASS w WebKit;
- desktop components, system scale, consent `13 × 2`, global navigation runtime, statyczne guardy i wersje assetów — PASS;
- `npm run build`, Pages Functions build, Worker dry-run i `git diff --check` — PASS;
- Browser QA: proof Kampanii FHD, Proces i maska WWW 2K, nav 2K, SEO proof 2K, support grid 2K oraz mobile 390 — PASS; brak błędów aplikacji w konsoli.
- niezależny review high+ znalazł i doprowadził do naprawy wyboru kotwicy resize, fałszywie dodatniego testu maski, mobilnego leadingu i skoku popoveru nav; ponowne testy Chromium/WebKit są zielone.

## Wynik publikacji

- PR implementacyjny [#93](https://github.com/Powers-P1/strona-ok-agency/pull/93) został scalony metodą squash do `main` jako `ac408e650aae9f0504b4882802a4748752113e82`.
- PR CI `30859989374` i ponowne CI `main` `30860901687` zakończyły pełną macierz wynikiem `SUCCESS`.
- Cloudflare Pages opublikował produkcję jako deployment `bf881793-5ec2-471c-b8d7-fe13e0467f81`; Contact Worker deploy `30860901724` i ręczny Production monitor `30861090992` zakończyły się `SUCCESS`.
- Produkcyjny Browser smoke na `okagency.pl` potwierdził assety `responsive-foundation.v20260730-8.css?v=20260803-8`, `design-tokens.css?v=20260803-8` i `responsive-safety.js?v=20260803-6`, pełne sceny FHD/2K, aktywną lokalną maskę SVG, nieobcięte proof/SEO, skalę nav/support grid oraz czystą konsolę.
- Lokalny serwer `127.0.0.1:7312` został zatrzymany, viewport Browser zresetowany, sesja Browser sfinalizowana, a task-local procesy sprawdzone przed końcowym commitem dokumentacji.

## Niezależny mobile QA

Handoff do taska `019fbdb6-9044-7302-b461-f33f659f616c` zakończył pełną, read-only macierz produkcyjną `360×640` i `390×844`. PR #93 nie wprowadził regresji mobile: wszystkie trasy poza dwoma wcześniejszymi problemami miały `0` poziomego overflow, nested scrolla, mobilnych anotacji, overlay i błędów konsoli; wszystkie disclosure/menu oraz pełny flow Diagnozy zostały realnie kliknięte.

Końcowa klasyfikacja to `FAIL / BASELINE`, nie fail wdrożenia:

- stała `.motion-toggle` zasłania środek drugorzędnego CTA na części scen; identyczne recty, przecięcia i hit-test odtworzono na czystym `a9b5365` dla WWW i Procesu w `360×640`;
- `.quiz-privacy` Diagnozy wypada poza `#diagnosis-map { overflow:hidden }` o 216 px w `360×640` i 12 px w `390×844`; identyczny wynik odtworzono na `a9b5365`, a arkusz Diagnozy nie był zmieniany w PR #93.

Zgodnie z ograniczeniem zakresu nie dodano łaty mobile. Pełne selektory, właściciele, metryki i screenshoty są zapisane w `G:\OK-Agency\.tmp\OKAGENCY_AGENT_COORDINATION.md`; naprawa wymaga osobnego uzgodnienia ownerów motion/CTA i Diagnozy.
