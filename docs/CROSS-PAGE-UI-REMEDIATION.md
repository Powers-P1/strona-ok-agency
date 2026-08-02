# Systemowy plan napraw UI między podstronami

Data utworzenia: 2026-08-01
Status: **Fazy 0–10 zakończone i opublikowane**
Zakres tego dokumentu: system wspólny i desktop; mobile jest bramką regresji i osobnym zakresem koordynowanym z `MOBILE-QA-2026-08-01.md`.

## 1. Cel i reguły wykonania

Celem jest usunięcie zgłoszonych niespójności jednym, przewidywalnym systemem: wspólne tokeny typografii, jeden system punktów i dymków, jedna geometria scen, jedno źródło stopki oraz jasno wydzielone wyjątki kompozycyjne. Plan nie dopuszcza lokalnych łat maskujących przyczynę.

Reguły obowiązujące w każdej fazie:

- wspólna funkcja lub reguła ma jednego właściciela i jedno źródło prawdy;
- CSS podstrony przechowuje tylko jej unikalną kompozycję, nie kopię komponentu systemowego;
- nie dodajemy `!important` jako poprawki błędu;
- nie zmniejszamy całych grup treści przez `transform: scale(...)`;
- każda scena pozostaje jednym kadrem `100svh`, bez fragmentu kolejnej sceny i bez wewnętrznych scrollerów;
- nie zmieniamy maski ochronnej grafiki tylko po to, aby uratować źle położony punkt;
- ręcznie zatwierdzona alternatywna kotwica może być lokalna, ale jej wybór i walidacja są wspólne;
- po każdej fazie przechodzimy jej bramkę jakości i aktualizujemy checkboxy oraz dziennik wyników;
- `design-proposals/` pozostaje nietknięty;
- publikacja następuje po pełnej bramce integracyjnej i produkcyjnym smoke teście, w tym samym cyklu wykonawczym.

Poza zakresem: redesign treści i scen, zmiana samej maski artworku, rozszerzenie API kontaktowego o telefon/dowolny identyfikator oraz niezależne poprawianie mobilnego headera, mobilnych tabel, CTA i animacji hero.

## 2. Udokumentowana diagnoza bazowa

### Hotspoty i dymki

W sześciu trasach istnieją łącznie 53 punkty:

| Trasa | Liczba |
|---|---:|
| `/strony-internetowe` | 8 |
| `/kampanie` | 8 |
| `/social-media` | 8 |
| `/proces` | 10 |
| `/diagnoza` | 7 |
| `/o-nas` | 12 |

Potwierdzone pomiary produkcyjne przy 1280×720:

| Trasa i stan | Prostokąt otwartego dymka | Kolidujący punkt |
|---|---|---|
| `/strony-internetowe`, „Cel firmy” | x 894–1134, y 288–433 | „Wspólny kierunek”, x 938.7, y 312.2 — **wewnątrz dymka** |
| `/social-media`, „Charakter” | x 821–1061, y 202–325 | „Format”, x 958, y 319 — **wewnątrz dymka** |
| `/o-nas`, „Prowadzenie” | x 711–951, y 207–330 | „Dobór kompetencji”, x 920, y 316 — **wewnątrz dymka** |

Przyczyny w `assets/art-coordinate-system.v20260730-3.js`:

- algorytm chroni dymek przed jego własnym punktem, ale nie traktuje pozostałych punktów jako przeszkód;
- kolizje są tylko karane wynikiem, a nie odrzucane, więc najkorzystniejszy zły kandydat nadal wygrywa;
- dolny margines bezpieczeństwa dotyczy dymka, nie punktu ani jego poświaty;
- walidowany jest prostokąt sceny, nie faktycznie widoczny obszar artworku po masce;
- maska w `responsive-safety.js` nie publikuje wspólnemu silnikowi granic pełnej widoczności i featheru;
- bazowe `.annotation-*` są powielone w sześciu arkuszach tras, a późny override w `site-enhancements.css` nie daje jednej własności komponentu;
- Diagnoza ma własną kopię interakcji zamiast korzystać wyłącznie z `service-interactions.js`.

Obecny rdzeń punktu ma około 17 px, pierścień około 34 px i bardzo niską minimalną przezroczystość. Obszar dotykowy jest wystarczający, ale sygnał wizualny jest zbyt słaby.

### Typografia i kontrast

- Docelowe rodziny już wynikają z projektu: `Barlow Condensed` dla display oraz `Archivo` dla treści/UI.
- `page-faq.css` wymusza niezaładowany `Cormorant Garamond, Georgia, serif`, więc wynik różni się między systemami.
- Proces ma lokalne rozmiary 10.5–12.5 px, a `scene-viewport.css` dodatkowo skaluje całe grupy do `.84` lub `.76`; rzeczywisty tekst potrafi spaść poniżej 9 px.
- Lead „Ponad 6 lat pracowała…” używa półprzezroczystego koloru na aktywnym, jasnym detalu grafiki.
- Tytuł dymka „Prowadzenie” jest biały przez lokalny wyjątek w `about/styles.css`, mimo jasnego tła dymka.
- Zbędne `02` jest generowane przez `figcaption::after`, choć numer aktu jest już podany w kickerze sceny.

### Diagnoza

- Wynik i wymagany formularz tworzą jedną pionową kolumnę wewnątrz `100svh` z `overflow: hidden`.
- Breakpoint niskiego desktopu zmniejsza odstępy, ale nie rozdziela stanów; mobile próbuje ratować układ wewnętrznym scrollem.
- Copy obiecuje „bez maila”, podczas gdy HTML, JS i Worker wymagają e-maila do odpowiedzi.
- Bez zmiany API właściwym rozwiązaniem jest rozdzielenie wyniku i opcjonalnego kontaktu na dwa wzajemnie wykluczające się stany.

### Stopka

- `site-footer.js` generuje „Politykę prywatności” w kolumnie Agencja i ponownie w dolnym wierszu.
- „Dostępność” jest samotnym, mało precyzyjnym opisem linku do `/dostepnosc`.

## 3. Rejestr 16 zgłoszonych zrzutów

| # | Trasa / element | Przyczyna | Rozwiązanie systemowe lub lokalne | Kryterium odbioru |
|---:|---|---|---|---|
| 1 | Strony internetowe — „Cel firmy” | inny punkt nie jest przeszkodą dla dymka | wspólny solver kolizji i stan zasłonięcia siblingów | żaden widoczny punkt nie leży w dymku |
| 2 | Social media — „Charakter” | jak wyżej | wspólny solver; bez lokalnego przesuwania dymka | „Format” nie przecina dymka |
| 3 | O nas — „Kontekst” na jasnym kadrze/Mac | punkt jest w prostokącie sceny, lecz poza bezpiecznym artworkiem po masce | wspólna granica maski + zatwierdzona kotwica compact/short | cały rdzeń i pierścień leżą na widocznym drzewku |
| 4 | Social media — „Plan” | gęsty układ i brak twardego odrzucania kolizji | solver traktuje dymek, inne punkty, treść i UI jako przeszkody | brak przecięcia tekstu i punktów |
| 5 | Kampanie — „Meta + Google” | klaster czterech punktów | solver + zatwierdzone alternatywne kotwice | wszystkie powiązania pozostają czytelne |
| 6 | Diagnoza — dół wyniku/formularz | dwa wysokie stany w jednym pionowym przepływie | rozłączne stany result/contact | oba stany osobno mieszczą się w `100svh` |
| 7 | Proces — lista „Cel biznesowy…” | lokalne mikrorozmiary i skalowanie rodzica | tokeny fontu + system gęstości bez skali | treść ≥14 px, label ≥12 px |
| 8 | O nas, ciemna scena — punkt poza drzewkiem | brak wiedzy o faktycznie widocznym artworkcie | kontrakt maski + alternatywna kotwica | punkt nie leży na pustym/czarnym tle |
| 9 | O nas — zbędne `02` przy portrecie | dekoracyjny pseudo-element dubluje numer aktu | lokalne usunięcie generatora | pozostaje tylko znacząca numeracja sceny |
| 10 | O nas — „Ponad 6 lat…” | półprzezroczysty tekst na zmiennej grafice | wspólny token tekstu on-dark; lokalny scrim tylko jeśli nadal potrzebny | kontrast co najmniej 4.5:1 |
| 11 | O nas — „Prowadzenie” i kolidujące punkty | lokalny biały tytuł + brak kolizji siblingów | usunięcie wyjątku koloru + solver | granatowy tytuł i zero nakładania |
| 12 | O nas — punkt przy granicy następnej sceny | brak marginesu punktu i glow od dolnej krawędzi | wspólny safe inset + alternatywna kotwica | środek ≥88 px od dołu i ≥16 px od UI |
| 13 | Stopka — „Dostępność” | nieprecyzyjny label w złej grupie | widoczny label „Standard serwisu”, aria-label „Informacja o dostępności serwisu” | sensowny opis, zachowany href `/dostepnosc` |
| 14 | Stopka — powtórzona polityka | link w dwóch grupach | jedno źródło legal links | dokładnie jeden widoczny link |
| 15 | O nas — ponowne zbliżenie kolizji | ten sam brak przeszkód w solverze | naprawa wspólna, bez drugiej lokalnej łaty | przypadek objęty automatycznym audytem |
| 16 | FAQ — inny krój | lokalny, niezaładowany serif i fallback systemowy | centralna rola display oparta o Barlow Condensed | computed font należy do systemu |

## 4. Docelowa własność systemu

| Plik / moduł | Jedyna odpowiedzialność po migracji |
|---|---|
| `assets/fonts.css` | deklaracje `@font-face` |
| `assets/design-tokens.css` | rodziny, skala typograficzna, kontrast, odstępy, safe inset i parametry hotspotów |
| `assets/annotation-system.css` | wygląd punktu, dymka, linii, jasny/ciemny wariant, open/obscured i reduced motion |
| `assets/art-coordinate-system.js` | mapowanie współrzędnych, kolizje, krawędzie, bezpieczny artwork i wybór zatwierdzonej kotwicy |
| `assets/service-interactions.js` | wspólny stan calloutów: start zamknięty, klik, klawiatura, Escape, klik poza |
| `assets/responsive-safety.js` | obliczenie maski i publikacja numerycznych granic full-visible/feather |
| `assets/scene-viewport.css` | `100svh` i gęstość layoutu przez odstępy/siatkę, nigdy przez skalowanie treści |
| CSS danej trasy | wyłącznie unikalna kompozycja sceny i położenie elementów |
| HTML danej trasy | treść i ręcznie zatwierdzone kotwice `base` / `compact` / `short` |
| `assets/services/diagnosis/script.js` | quiz, rozłączne stany wynik/formularz i wysyłka; bez kopii obsługi hotspotów |
| `assets/site-footer.js` | jedno źródło struktury i treści stopki |

Kontrakt kotwic:

- `data-art-x/y` — zatwierdzona kotwica bazowa;
- `data-art-x-compact/y-compact` — kadr zwężony lub mocniej maskowany;
- `data-art-x-short/y-short` — niski desktop, wyłącznie gdy compact nie wystarcza;
- algorytm wybiera tylko spośród zatwierdzonych kotwic; nie clampuje punktu losowo po tle;
- jeśli chwilowy solve nie ma rozwiązania, system zachowuje ostatni poprawny układ; przy pierwszym solve pozostawia widoczne kotwice autorskie — nigdy nie ukrywa całej grupy;
- przy szerokości do 640 px punkty i linie są wyłączone centralnie — mobile nie uruchamia tego systemu.

Kontrakt maski po Fazie 4:

- każda maska ma naturalny rozmiar grafiki źródłowej (1672×941; dwa historyczne źródła 1671×941) i pozostaje niezależna od CSS-owego `cover`;
- `255` oznacza wyłącznie autorską, długą i smukłą smugę energii — białe refleksy metalu są odrzucane przez analizę komponentów;
- `128` oznacza świetlisty detal, `64` strukturę konaru/gałęzi/korzenia/kwiatu, a `0` zakazane tło; niższe poziomy są celowo wyraźnie ciemniejsze od energii również w podglądzie diagnostycznym;
- scena bez autorskiej smugi deklaruje `data-placement-energy="none"` i może korzystać wyłącznie z poziomu highlight/structure;
- przyszły połysk może konsumować wyłącznie najwyższy poziom maski, ale maska animacji nie steruje współrzędnymi punktów ani solverem runtime.

## 5. Kontrakt współpracy z agentem mobile

Dokument mobilny: `docs/MOBILE-QA-2026-08-01.md`. Ten dokument nie przejmuje ani nie nadpisuje jego checklisty.

Uzgodnienie z 2026-08-01 16:38:

- mobile: `G:\OK-Agency\.codex-mobile-remediation`, branch `agent/mobile-remediation`, baza `20a7f70`;
- desktop/system: `G:\OK-Agency\.codex-worktrees\cross-page-ui-remediation`, branch `agent/cross-page-ui-remediation`, baza `20a7f70`;
- Diagnoza HTML/CSS/JS należy wyłącznie do desktop/system i musi przejść odbiór 360/390 px;
- Social CSS/HTML, FAQ CSS i test motion są sekwencyjne: najpierw mały commit mobile, potem jego integracja do desktop/system;
- szczegółowy protokół i aktywne blokady są prowadzone poza repo w `G:\OK-Agency\.tmp\OKAGENCY_AGENT_COORDINATION.md`.
- decyzja z 2026-08-01 17:08: przy `max-width: 640px` wszystkie hotspoty i linie są centralnie ukryte; pełny system anotacji dotyczy desktop/tablet powyżej tego progu.

| Obszar | Właściciel podstawowy | Zasada integracji |
|---|---|---|
| mobilny header/menu i transparentność | agent mobile | ten plan wyłącznie testuje regresję |
| mobilna tabela, mobilne CTA i akordeony | agent mobile | brak zmian w tym planie |
| animacja drzewa i jump hero na mobile | agent mobile | brak zmian w tym planie |
| globalne tokeny fontów/kolorów | ten plan | agent mobile konsumuje tokeny, bez lokalnej redefinicji |
| system hotspotów i maski | ten plan | zachowanie mobile musi być uzgodnione przed edycją shared JS/CSS |
| `scene-viewport.css` | integracja wspólna | jeden wyznaczony edytor po porównaniu obu diffów |
| Diagnoza HTML/CSS/JS | integracja wspólna | stan wynik/contact projektujemy raz; nie wdrażamy dwóch konkurencyjnych wersji |
| shared nav/responsive foundation | agent mobile lub integrator | ten plan nie dotyka zakresów headera |
| stopka | ten plan | po zmianie pełny smoke mobile |

Twarda bramka przed implementacją:

- [x] zidentyfikować branch/worktree oraz bazowy stan agenta mobile;
- [x] zapisać listę planowanych plików wspólnych obu prac;
- [x] dla każdego wspólnego pliku wskazać jednego edytora lub kolejność commit/integracja;
- [x] najpierw zintegrować gotową zmianę mobile, potem oprzeć shared system na jej aktualnym kształcie;
- [x] nie edytować równolegle tych samych zakresów selektorów;
- [x] uzgodnić osobne worktree i branche obu agentów;
- [x] nowy shared plik jest preferowany wobec dopisywania drugiej warstwy override;
- [x] po każdej zmianie shared uruchomić macierz desktop oraz 390×844 i 360×640 jako regresję;
- [x] nie stage'ować `design-proposals/` ani cudzego `docs/MOBILE-QA-2026-08-01.md`.

## 6. Plan wykonania — kolejność obowiązkowa

Legenda: `[ ]` niewykonane, `[~]` w toku, `[x]` zakończone i przetestowane.

### Faza 0 — koordynacja i zamrożenie bazowej geometrii ✅

- [x] wykonać twardą bramkę współpracy z sekcji 5 — własność uzgodniona, `MOBILE FIRST` zintegrowany;
- [x] utworzyć osobny worktree i branch desktop/system z uzgodnionej bazy `20a7f70`;
- [x] pobrać commit `MOBILE FIRST` przed edycją plików sekwencyjnych — `24703f3` zintegrowany jako `07e4d8b`;
- [x] zapisać bazowe screenshoty i pomiary wszystkich zgłoszonych przypadków — 16 zrzutów użytkownika skatalogowane, trzy reprezentatywne kolizje ponownie zmierzone lokalnie przy 1280×720;
- [x] zinwentaryzować wszystkie 53 punkty: Web 8, Kampanie 8, Social 8, Proces 10, Diagnoza 7, O nas 12;
- [x] potwierdzić brak niepowiązanych zmian w zakresie commita — przed startem tylko ten dokument planu był nieśledzony w osobnym worktree.

Bramka: każdy problem ma właściciela, bazowy pomiar i niezachodzący zakres plików; `design-proposals/` nietknięty.

### Faza 1 — testy ochronne przed refaktorem ✅

- [x] dodać `scripts/check-ui-system.mjs` i włączyć go do `check:quality`;
- [x] wymusić 53 callouty, stabilne ID i komplet kotwic;
- [x] wykrywać lokalne bazowe `.annotation-dot`, `.annotation-copy`, `.annotation-wire` po migracji;
- [x] wykrywać niezatwierdzone rodziny fontów, znaczący tekst <14 px, label <12 px i skalowanie przodka treści;
- [x] wykrywać kopię diagnozowej interakcji, biały wyjątek `#callout-leading`, duplikat privacy i błędne copy;
- [x] przygotować kontrakt pod przeglądarkowy audyt wszystkich punktów: granice sceny, maska, kolizje, safe inset, hit target; wykonanie pełnej macierzy pozostaje w Fazie 9.

Bramka: testy prawidłowo czerwienią się na znanych problemach i nie obejmują zakresu mobilnego agenta poza testem regresji.

### Faza 2 — centralna typografia i gęstość scen ✅

- [x] dodać `assets/design-tokens.css` i załadować go globalnie;
- [x] ustalić role: display = Barlow Condensed, body/UI = Archivo;
- [x] pozostawić w `fonts.css` wyłącznie źródła fontów;
- [x] usunąć `Cormorant Garamond` i `Georgia` z FAQ, zachowując akcent przez rolę display, wagę i kolor;
- [x] przenieść Proces z 10.5–12.5 px na tokeny: treść ≥14 px, label ≥12 px;
- [x] usunąć `scale: .96/.90/.84/.76` z grup treści;
- [x] obsłużyć niski desktop tokenami odstępów, siatką i rozmiarem display, nie skalą;
- [x] potwierdzić `100svh` i brak fragmentu następnej sceny na wszystkich trasach — macierz 1902×912, 1512×800, 1280×720, 1024×768, 390×844 i 360×640 PASS; wszystkie rozwinięcia Social/Kampanie/Web/O nas mieszczą kadr, Diagnoza result/contact nie tworzy nested scrolla.

Bramka: tylko dwie zatwierdzone rodziny, brak znaczącego tekstu <14 px, brak `scale < 1` na przodku treści, wszystkie sceny mieszczą kadr.

### Faza 3 — migracja systemu anotacji bez zmiany wyglądu ✅

- [x] dodać `assets/annotation-system.css` jako jedyne źródło bazowego wyglądu;
- [x] załadować centralne tokeny i arkusz na sześciu trasach;
- [x] usunąć równoważne reguły bazowe z lokalnych arkuszy, pozostawiając kompozycję;
- [x] włączyć Diagnozę do `service-interactions.js` i usunąć duplikat obsługi;
- [x] ujednolicić start zamknięty, klik/touch/Enter/Space, Escape i klik poza;
- [x] wykonać no-op visual diff przed zmianą parametrów punktów;
- [x] zastąpić datowany moduł geometrii stabilną nazwą, a cache kontrolować query stringiem.

Status bramki: PASS w commicie `55ca7ac`, uzupełniony późniejszą korektą stabilności hover. Automatyczny audyt otworzył wszystkie 53 callouty przy 1280×720; pozycje i rozmiary 53 punktów oraz computed styles komponentu są identyczne z baseline. Dwa najdłuższe teksty zajęły o jedną linię mniej po pełnym załadowaniu Archivo, bez zmiany computed CSS. Na sześciu trasach hover utrzymany przez 420 ms, Enter/Space, Escape, klik poza i ARIA przeszły; aktywny punkt nie jest już chwilowo wyłączany przez guard solvera. Przy 390×844 i 360×640 widocznych jest 0 punktów/linii/podsumowań i nie ma poziomego overflow.

Bramka: computed styles i geometria nie zmieniły się w migracji; każda trasa ładuje jeden system; lokalne arkusze nie redefiniują komponentu.

### Faza 4 — geometria, maska i widoczność punktów ✅

- [x] powiększyć systemowo rdzeń do ok. 22 px, pierścień do 42–44 px i podnieść minimalną opacity;
- [x] zachować hit target co najmniej 44×44 px i czytelny stan paused/reduced-motion;
- [x] opublikować z `responsive-safety.js` niemutowalny kontrakt `getArtBounds()` w przestrzeni `scene-css-px` oraz zdarzenie `okagency:art-safety-change`, bez zmiany istniejących gradientów maski;
- [x] zastąpić dwa lokalne przebiegi jednym solverem grupy i adapterami zapisu dla service/About;
- [x] wybierać profile deterministycznie (`short → compact → base`, `compact → base`, `base`) i rozwiązywać całą grupę przez backtracking, nie zachłannie punkt po punkcie;
- [x] traktować pozostałe punkty, treść, header, motion toggle i scroll cue jako przeszkody;
- [x] twardo odrzucać kandydatury kolizyjne;
- [x] aktywny dymek układać poza wszystkimi pierścieniami siblingów; system nie posiada już stanu `is-obscured` i nie ukrywa punktów podczas otwarcia karty;
- [x] przesuwać dymek deterministycznie w siatce 24 px, gdy pozycja idealna koliduje z tekstem, headerem albo punktem; punkt i jego kotwica pozostają nieruchome;
- [x] wymagać, aby cały rdzeń/pierścień mieścił się na widocznym artworkcie, wliczając jawną strefę feather maski na kompaktowym desktopie;
- [x] dodać overlay diagnostyczny pokazujący source 1672×941, `fullVisible`, ring oraz przeszkody; dopiero na tej podstawie zatwierdzić pełne pary kotwic compact/short dla przypadków Web, Social, Kampanie i O nas;
- [x] wymusić środek punktu ≥88 px od dołu sceny i ≥16 px od dolnego UI;
- [x] usunąć cały generator i CSS „Punkty na ilustracji”; brak chwilowego rozwiązania zachowuje ostatni poprawny układ albo widoczne kotwice autorskie, nigdy zastępczą listę ani ukrytą grupę;
- [x] usunąć systemowo starą warstwę SVG `energy-shimmer` z HTML, CSS i solvera, bez naruszania pulsu samego hotspotu;
- [x] walidować hotspoty przez wielopoziomową maskę artworku: linia energii → świetlisty metaliczny detal → konar/gałąź/korzeń/kwiat; nigdy puste tło, tekst, maska ochronna ani krawędź kadru — poziom energii ponownie zawężony po przeglądzie użytkownika;
- [x] utrzymać maskę w naturalnych wymiarach źródła jako jedno źródło geometrii; przyszły połysk może konsumować najwyższy poziom maski, ale nie może sterować współrzędnymi punktów;
- [x] dodać audyt wszystkich jawnych profili `base` / `compact` / `short` przez `check:annotation-energy`;
- [x] wykonać i ręcznie ocenić screenshot każdej sceny z hotspotami względem samej grafiki — powtórzone po zawężeniu poziomu energii;
- [x] potwierdzić faktycznie wyrenderowane środki na energii oraz brak kolizji w pełnej macierzy sześciu tras i siedmiu viewportów — powtórzone po regeneracji masek.
- [x] usunąć trwały stan `annotations-unavailable` oraz cały stan `is-obscured`; scroll, resize, otwarcie dymka i nieudany solve nie mogą zmienić liczby widocznych punktów;
- [x] odtworzyć zgłoszoną sekwencję: otwarcie/zamknięcie punktu, przejście do kolejnej sceny, klik i powrót — 4/4 punkty pozostają widoczne bez odświeżenia;

Status bramki: PASS po ponownym przeglądzie. Generator najpierw odrzuca krótkie refleksy metalu, a dopiero później rozszerza zaakceptowany rdzeń energii o jeden piksel; poziomy diagnostyczne mają wartości 255 / 128 / 64 / 0. Audyt potwierdza 84 profile na energii, 31 na highlight i 9 na strukturze. Ręczne screeny Kampanii, obu scen Social i kompaktowej sceny Oliwii potwierdziły czytelne rozmieszczenie na grafice. Macierz 1512×982, 1512×800, 1440×900, 1280×720, 1024×768, 390×844 i 360×640 ponownie przeszła dla sześciu tras po usunięciu wszystkich ścieżek grupowego ukrywania. Test scrollu próbkuje widoczność po pierwszym `requestAnimationFrame`, a interakcje nadal czekają na końcowy solve lazy-loaded artworku.

Bramka: 53/53 punktów na widocznym artworkcie; zero punktów w dymku/tekście/UI; zero osieroconych punktów; wszystkie działają myszą, dotykiem i klawiaturą.

### Faza 5 — lokalne kontrasty i porządki O nas ✅

- [x] zastosować wspólny solidny token tekstu on-dark do „Ponad 6 lat…”;
- [x] jeśli kontrast nadal zależy od detalu grafiki, dodać jeden uzasadniony lokalny scrim kompozycyjny;
- [x] usunąć biały wyjątek tytułu „Prowadzenie”;
- [x] usunąć pseudo-element generujący zbędne `02`;
- [x] zatwierdzić ręcznie alternatywne kotwice scen O nas po testach maski;
- [x] sprawdzić wszystkie 12 punktów i oba motywy dymków;
- [x] poprawić kontrast tekstu mapy Diagnozy na jasnej części maski, bez zmiany geometrii i bez lokalnego zmniejszania fontu;

Status bramki: PASS. „Ponad 6 lat…” korzysta z pełnego tokenu `--ok-color-text-on-dark`, prawa część sceny Oliwii ma jeden lokalny scrim zgodny z kompozycją, a pseudo-`02` i biały wyjątek `#callout-leading` zostały usunięte. O nas: 12/12 punktów i interakcje PASS przy 1280×720, kompletna geometria PASS w siedmiu viewportach, oba motywy dymków odebrane wizualnie. Diagnoza używa na desktopie kontraktu `on-light` na jasnej części mapy, a przy ≤820 px zachowuje istniejący motyw `on-dark`; logika result/contact pozostaje PASS.

Bramka: kontrast ≥4.5:1, brak podwójnej numeracji, tytuły dymków zgodne z centralnym motywem, 12/12 punktów bez kolizji.

### Faza 6 — Diagnoza: rozłączne stany i prawdziwe copy ✅

Decyzja: **progresywne ujawnienie**, nie dwie kolumny. Dwie kolumny pozostają zbyt gęste przy 1280×720 i ponownie prowokują zmniejszanie tekstu.

- [x] uzgodnić z agentem mobile jednego właściciela plików Diagnozy;
- [x] rozdzielić ostatni akt na wzajemnie wykluczające się `result` i `contact`;
- [x] najpierw pokazać pełny wynik bez formularza;
- [x] CTA „Poproś o kontakt” przełącza na formularz, „Wróć do wyniku” przywraca wynik;
- [x] po zmianie stanu przenieść fokus na jego nagłówek i poprawnie sterować `aria-hidden`/`inert`;
- [x] usunąć oba stany z jednego pionowego przepływu oraz wewnętrzny scroller;
- [x] zachować obecne API `/api/contact`, Turnstile i wymagany e-mail;
- [x] użyć copy wyniku: „Wynik dostajesz od razu — bez zapisu i podawania danych.”;
- [x] dodać: „Jeśli chcesz omówić wynik, przejdź do opcjonalnego kontaktu.”;
- [x] w stanie formularza użyć: „Abyśmy mogli odpowiedzieć, podaj imię i e-mail.” oraz label „E-mail do odpowiedzi”.

Status bramki: PASS. Desktop 1280×720: wynik 512 px wysokości w scenie 720 px, brak overflow, zachowany wynik po powrocie. Mobile po integracji `9f9b3dd`: pełny flow 4 pytań PASS przy 360×640 i 390×844; brak poziomego overflow i nested scrolla, przy 360×640 ostatnia akcja kończy się 12 px nad ramą.

Bramka: wynik i kontakt osobno mieszczą `100svh`; brak clippingu i nested scrolla; przełączanie nie gubi wyniku/fokusu; obietnica bez danych nie sąsiaduje z wymaganym e-mailem.

### Faza 7 — jedna, czytelna stopka ✅

- [x] ograniczyć kolumnę Agencja do: O nas, Proces, FAQ, Kontakt;
- [x] pozostawić dokładnie jeden link „Polityka prywatności” w grupie legal;
- [x] zamienić widoczne „Dostępność” na „Standard serwisu”;
- [x] zachować href `/dostepnosc` i aria-label „Informacja o dostępności serwisu”;
- [x] w grupie legal pozostawić także „Ustawienia cookies”;
- [x] zaktualizować `site-footer.css` i dokumentację workflow bez lokalnych wariantów stopki.

Status bramki: PASS. Wspólny generator renderuje cztery linki Agencji i jedną grupę legal z trzema pozycjami. `check:ui-system` oraz `check:links` przechodzą; FAQ 1280×720 i 390×844 potwierdzają pełną widoczność, zero poziomego overflow i brak kolizji grupy legal z kontrolką ruchu. Na 390 px linki prawne składają się w czytelne dwa rzędy.

Bramka: każdy link prawny występuje raz, prowadzi do istniejącej strony, `aria-current` działa, a stopka jest osiągalna po ostatniej scenie.

### Faza 8 — czyszczenie i dokumentacja

- [x] usunąć martwe selektory, stare keyframes, duplikaty interakcji i nieużywane warianty współrzędnych;
- [x] usunąć nieużywaną deklarację Manrope, jeśli audyt potwierdzi brak konsumentów;
- [x] zaktualizować `AGENTS.md`, `SERVICE-PAGE-WORKFLOW.md` i `PRODUCTION-OPERATIONS.md` o własność systemu;
- [x] zaktualizować cache versions wspólnych assetów jednym kontrolowanym mechanizmem;
- [x] uzupełnić ten dokument o wyniki każdej bramki i odhaczyć elementy dopiero po pomiarze.

Status bramki: PASS. Lokalne definicje bazowego komponentu anotacji nie istnieją, cztery trasy korzystają ze wspólnych `ok-story-cue` i `ok-story-proof-bloom`, a martwy próg `min-height: 720px` został usunięty. Audyt potwierdził brak konsumentów Manrope, więc oba pliki binarne i nieaktualne wzmianki zostały usunięte. Pozostałe `--dot-*` / `--copy-*` są nadal odczytywane przez solver jako wejście preferowanej strony dymka; zachowano je świadomie, aby nie zmienić kompozycji 41 calloutów. `scripts/asset-versions.mjs` jest jednym rejestrem cache, 13/13 HTML przechodzi `check:asset-versions`, a `check:quality` przechodzi w całości.

Bramka: `rg` nie znajduje starych źródeł systemu; repo nie zawiera przypadkowych plików, a diff obejmuje wyłącznie zatwierdzony zakres.

### Faza 9 — pełna regresja lokalna

- [x] uruchomić `npm run check:quality`;
- [x] uruchomić `npm run check:links`;
- [x] uruchomić `npm run build`;
- [x] uruchomić `npm run check:pages-functions`;
- [x] uruchomić `npm run check:worker`;
- [x] przejść pełną macierz viewportów, tras, hotspotów i stanów z sekcji 7;
- [x] wykonać kontrolowany diff z pracą mobile i ponownie przejść 390×844 oraz 360×640;
- [x] wykonać ręczny smoke test Safari na Macu albo oznaczyć go jako jawnie oczekujący na urządzenie.

Status bramki: PASS lokalnie. `check:quality`, `check:links`, build, Pages Functions i Worker dry-run są zielone. Po ponownym otwarciu zgłoszenia audyt masek potwierdza 84 profile energy, 31 highlight i 9 structure, a pełna macierz sześciu tras × siedmiu viewportów ponownie przeszła bez `annotations-unavailable`. Audyt przeglądarkowy otwiera wszystkie anotacje na desktopie/tablecie, próbkuje ciągłą widoczność podczas scrollu przy 1280×720 i 1512×800 oraz potwierdza 0 elementów warstwy anotacji na 390×844 i 360×640. Prawdziwy hover jest utrzymywany przez 420 ms w automacie i 1,2 s w ręcznym odbiorze. Screenshoty WWW 1280, O nas 1280, Kampanie/Social/O nas 1024 oraz WWW 390 oceniono wizualnie: pełny kadr, brak kolejnej sceny, brak punktów na tle/tekście i brak warstwy anotacji na mobile. Konsola bez błędów i ostrzeżeń. Fizyczny Safari/Mac pozostaje jawnie do końcowego odbioru na urządzeniu; oba zgłoszone kadry Mac-like przechodzą automat.

Bramka: wszystkie komendy i automatyczne audyty zielone, brak błędów konsoli, brak niezatwierdzonych wizualnych regresji.

### Faza 10 — integracja, publikacja i produkcyjny odbiór

- [x] przejrzeć końcowy diff względem aktualnego `origin/main`, w tym cudzą pracę mobile;
- [x] przygotować logiczne commity bez `design-proposals/` i bez cudzych plików planu;
- [x] otworzyć PR, przejść CI i scalić bez nadpisywania równoległych zmian;
- [x] opublikować na produkcję natychmiast po zielonej bramce integracyjnej;
- [x] potwierdzić domenę, deployment URL, commit SHA i status monitora;
- [x] powtórzyć na domenie produkcyjnej krytyczne pomiary 1280×720, Mac-like i mobile regression;
- [x] wpisać wyniki, linki oraz końcowy status do tego dokumentu.

Status bramki: PASS. PR [#71](https://github.com/Powers-P1/strona-ok-agency/pull/71) został scalony do `main` jako `93771ef0574da6acd5b7b82aa4124d2e3fa210ae`; Cloudflare Pages opublikował deployment `a32ace6d-6af5-4633-acb9-376a8bf779ee`, a ręcznie uruchomiony monitor produkcji `30725556830` zakończył się sukcesem. Na `https://okagency.pl` działa `art-coordinate-system.js?v=20260801-6` bez `annotations-unavailable`, `hideAnnotations` i `is-obscured`. Sekwencja zgłoszona przez użytkownika utrzymuje 4/4 widoczne punkty przy każdym scrollu, kliknięciu w innej scenie i powrocie. Mac-like 1512×800 ma sceny dokładnie po 800 px i 0 overflow; mobile 390×844 zachowuje centralny kontrakt 0 widocznych anotacji. Końcowy follow-up rozszerza CSP o rzeczywiście wywoływany endpoint Google Ads consent-mode oraz obejmuje go testem jakości, bez zmian UI i geometrii.

Bramka końcowa: produkcja odpowiada commitowi z PR, 16 zgłoszeń ma dowód odbioru, a mobile i desktop korzystają ze wspólnych fundamentów bez wzajemnego nadpisania.

## 7. Macierz QA

### Viewporty

| Viewport | Cel |
|---|---|
| 1512×982 | typowy MacBook |
| 1512×800 | niski kadr zbliżony do zgłoszeń Mac |
| 1440×900 | standardowy desktop |
| 1280×720 | najbardziej ryzykowny niski desktop |
| 1024×768 | kadr przejściowy/tablet landscape |
| 390×844 | regresja mobile, zakres drugiego agenta |
| 360×640 | minimalna wysokość regresyjna mobile |

### Trasy i przepływy

- `/strony-internetowe`, `/kampanie`, `/social-media`, `/proces`, `/o-nas`: wszystkie sceny i wszystkie punkty;
- `/diagnoza`: cztery ścieżki odpowiedzi, wynik, przejście do kontaktu, walidacja, powrót do wyniku;
- `/faq`: computed font, rozwijanie, fokus i CTA;
- stopka: automatycznie wszystkie publiczne strony, wizualnie co najmniej jedna strona sceniczna, FAQ i polityka prywatności.

Dla każdego kadru i właściwej trasy:

- scena ma `height = 100svh`, nie pokazuje kolejnej sceny i nie tworzy nested scrolla;
- brak poziomego overflow;
- wszystkie widoczne punkty leżą na artworkcie, poza tekstem, UI i dymkami;
- każdy dymek otwiera się myszą, dotykiem i klawiaturą, zamyka Escape oraz kliknięciem poza;
- sprawdzony jest stan motion on, paused i `prefers-reduced-motion`;
- hit target ma minimum 44×44 px, a punkt pozostaje zauważalny bez animacji;
- znaczący tekst ma minimum 14 px, label 12 px, a computed rodzina jest zatwierdzona;
- nie ma błędów/ostrzeżeń konsoli ani clippingu;
- po ostatniej scenie można dotrzeć do stopki.

## 8. Niezmienne kryteria akceptacji

- [x] żadnego nowego `!important` użytego do łatania zgłoszeń;
- [x] wspólne zachowanie nie ma równoległej implementacji lokalnej;
- [x] każda scena jest pełnym kadrem `100svh`, bez nested scrolla;
- [x] 53/53 punkty są zauważalne, dostępne i geometrycznie bezpieczne;
- [x] otwarty dymek nigdy nie jest przecinany przez sibling point;
- [x] maska i solver korzystają z jednego kontraktu bezpiecznego artworku;
- [x] body/treść ≥14 px, labels ≥12 px, bez skali przodka;
- [x] wyłącznie Archivo i Barlow Condensed pełnią role wizualne systemu;
- [x] Diagnoza ma zgodne copy i dwa rozłączne, mieszczące się stany;
- [x] stopka ma jeden link polityki i widoczny label „Standard serwisu”;
- [x] zakres mobile nie został nadpisany i przechodzi jego własny plan QA;
- [x] produkcja jest zweryfikowana po publikacji, nie tylko lokalnie.

## 9. Dziennik realizacji

| Data | Faza | Commit / PR / deployment | Wynik bramki | Uwagi |
|---|---|---|---|---|
| 2026-08-01 | Plan | — | gotowy, bez zmian implementacyjnych | oczekuje na koordynację z agentem mobile |
| 2026-08-01 | Faza 0 | branch `agent/cross-page-ui-remediation` | PASS | osobne worktree; 53 punkty; bazowe pomiary; `24703f3` zintegrowany jako `07e4d8b` |
| 2026-08-01 | Faza 1 | `5eeaf12` | PASS bramki ochronnej | `check:ui-system` celowo wykrył bazowe 235 naruszeń w 9 grupach; po pierwszym cleanupie raport spadł do 139 naruszeń w 7 grupach i nadal blokuje regresje |
| 2026-08-01 | Integracja mobile | `24703f3` → `07e4d8b` | PASS bramki koordynacyjnej | ≤640 px anotacje, linie i podsumowanie są wyłączone centralnie |
| 2026-08-01 | Faza 6 — Diagnoza | `9f9b3dd` (mobile integration `a35edcc`) | PASS desktop + 360×640 + 390×844 | rozłączne result/contact, właściwe copy, fokus/inert, brak nested scrolla; pełny flow 4 pytań odebrany przez oba zadania |
| 2026-08-01 | Bazowa bramka mobile | `ac876e6` | PASS | Home/WWW/Social/Diagnoza/FAQ 360/390, WWW 1440, menu, overflow, konsola, quality/build; końcową regresję powtarzamy po cleanupie systemowym |
| 2026-08-01 | Faza 2 — typografia i pełny kadr | `ca56172` | PASS | tokeny Archivo/Barlow, body ≥14 px, labels ≥12 px, brak pomniejszającej skali; pełne sceny i disclosure PASS na desktop/tablet/390/360; opcjonalny kontakt Diagnozy przeprojektowany jako spójna karta i odebrany wizualnie |
| 2026-08-01 | Faza 3 — centralny system anotacji | `55ca7ac` | PASS | jedno źródło bazowego CSS i interakcji; 53/53 baseline geometry/style; sześć tras keyboard/outside/ARIA PASS; mobile 390/360 nadal centralnie ukryty |
| 2026-08-01 | Faza 4 — maski i solver geometrii | working tree | PASS po korekcie wizualnej | 14 masek w naturalnych wymiarach; filtr energii przed dylatacją; 84 energy / 31 highlight / 9 structure; 6 tras × 7 viewportów PASS; mobile 0 punktów/linii/summary |
| 2026-08-01 | Faza 5 — kontrast i porządki O nas/Diagnozy | working tree | PASS | solidny on-dark i jeden scrim O nas; bez pseudo-02 i białego wyjątku; mapa Diagnozy on-light na desktopie; hover calloutów stabilny i objęty automatycznym testem |
| 2026-08-01 | Faza 7 — wspólna stopka | working tree | PASS | Agencja 4 linki; jedna polityka; Standard serwisu z aria-label; cookies w legal; desktop 1280 i mobile 390 bez overflow i bez kolizji z kontrolką ruchu |
| 2026-08-01 | Faza 8 — cleanup i własność systemu | working tree | PASS | martwe lokalne keyframes i Manrope usunięte; właściciele UI udokumentowani; jeden manifest wersji assetów; 13/13 HTML i pełne `check:quality` PASS |
| 2026-08-01 | Faza 9 — pełna regresja lokalna | working tree | PASS | build + Pages/Worker dry-run; 6 tras × 7 viewportów; 53/53 stabilny hover/keyboard; desktop i mobile odebrane wizualnie; konsola czysta; fizyczny Safari/Mac jawnie oczekuje na urządzenie |
| 2026-08-01 | Reopen Fazy 5 — trwałe znikanie punktów | working tree | PASS po odtworzeniu zgłoszonej sekwencji | usunięto `annotations-unavailable`, zachowywany jest ostatni poprawny układ; brak grupowego ukrywania przy scroll/resize; kompaktowe kotwice i strefa feather przechodzą 6 tras × 7 viewportów |
| 2026-08-01 | Faza 10 — publikacja i produkcyjny odbiór | PR #71, `93771ef`, Pages `a32ace6d-6af5-4633-acb9-376a8bf779ee` | PASS | CI, Worker i monitor `30725556830` zielone; produkcja odtwarza sekwencję użytkownika z 4/4 punktami; Mac-like oraz mobile regression PASS; CSP consent-mode objęte follow-upem i testem statycznym |
