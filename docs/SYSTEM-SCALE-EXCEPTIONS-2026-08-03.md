# System skali, proporcji i wyjątków — 2026-08-03

## Cel

Jedna wspólna umowa renderowania ma utrzymywać pełny kadr sceny, ciągłe tło i porównywalną czytelność typografii niezależnie od rozdzielczości, proporcji, DPR i zmiany rozmiaru okna. Zakres obejmuje wszystkie publiczne trasy od 1024 px do 7680 px szerokości oraz istniejący kontrakt mobile.

Docelowy przepływ:

`trasa → profil viewportu → wspólne role typograficzne i geometria sceny → lokalna kompozycja bez przejmowania globalnych ownerów`

## Zasady implementacji

- Wspólne role typografii należą do `assets/design-tokens.css` i `assets/responsive-foundation.v20260730-8.css`.
- Klasyfikacja viewportu, reflow i ochrona kolizji należą do `assets/responsive-safety.css` oraz `assets/responsive-safety.js`.
- Pliki tras mogą ustawiać kompozycję i kolory, ale nie mogą tworzyć własnego systemu skali, wysokości viewportu, globalnej nawigacji ani kontraktu anotacji.
- Brak nowych `!important`. Istniejące użycia są jawnie raportowane i klasyfikowane.
- Sceny ilustrowane pozostają jednym kadrem `100svh`; przy realnym przepełnieniu treści dokument rośnie naturalnie, bez wewnętrznych scrollerów i bez skalowania całego DOM.
- Mobile `<=640px` zachowuje obecny kontrakt: brak hotspotów i linii anotacji.

## Macierz odbioru

| Profil | Viewporty referencyjne |
| --- | --- |
| 4:3 / wysoki desktop | 1024×768, 1365×1218, 2048×1536 |
| 16:10 | 1440×900, 2560×1600, 3840×2400 |
| 16:9 | 1920×1080, 2560×1440, 3840×2160, 7680×4320 |
| 21:9 | 2560×1080, 3440×1440, 5120×2160 |
| 32:9 | 3840×1080, 5120×1440, 7680×2160 |
| pion | 1024×1366, 1440×2560, 2160×3840 |
| resize | 1365×1218 → 1920×1080 → 1024×768 bez reloadu |

## Plan i status

- [x] Reprodukcja produkcyjna wysokiego kadru strony głównej i pomiar warstw.
- [x] Potwierdzenie lokalnych, nisko zakończonych skal typografii w Diagnozie.
- [x] Usunięcie dynamicznego powiększania pełnej płyty hero przy zachowaniu bezpiecznego art direction 4:3.
- [x] Wprowadzenie wspólnych płynnych ról typograficznych do 8K i migracja Diagnozy.
- [x] Automatyczny audyt wszystkich wyjątków, lokalnych ownerów i `!important`.
- [x] Chromium + WebKit: geometria, kontrast, overflow, stabilność resize i screenshoty.
- [x] Pełny build/quality/link/UI oraz niezależny review.
- [ ] Integracja, publikacja i smoke produkcyjny.

## Potwierdzone źródła regresji

1. Bezpieczny kadr 4:3 jest właściwym art direction dla wysokiego desktopu, ale był dodatkowo skalowany razem z całym rastrem i canvase’em do `1.22`. To zbędne powiększenie tworzy zależne od silnika warstwy kompozytowe i widoczne granice przy zmianie skali/DPR.
2. Diagnoza nie używa wspólnych ról dla mapy, pytań, odpowiedzi i wyniku. Lokalne maksima `38–62px` dla nagłówków i stałe `12–15px` dla treści kończą wzrost znacznie wcześniej niż pozostałe sceny.
3. Repo ma historyczne wyjątki poza systemem. Pełny, generowany wykaz zostanie umieszczony poniżej przez `scripts/audit-system-exceptions.mjs`, aby następne zmiany nie opierały się na ręcznej, niepełnej liście.

## Wykaz wyjątków

Pełny wykaz generuje `scripts/audit-system-exceptions.mjs` do [SYSTEM-EXCEPTIONS-INVENTORY.md](SYSTEM-EXCEPTIONS-INVENTORY.md). Każdy wpis zawiera plik, linię, selektor, deklarację, kontekst media oraz klasyfikację.

Stan po migracji:

- `!important`: **217**,
- deklaracje typografii w lokalnych arkuszach tras: **983**,
- lokalne przejęcia selektorów wspólnych komponentów/geometrii scen: **297**,
- inline `style` w HTML: **28**,
- mutacje stylu z JS: **46**.

## Wynik macierzy renderowania

- Chromium: wszystkie 13 tras przy 1024×768, 1365×1218, 2560×1440, 3840×2160 i 7680×4320.
- Dodatkowe proporcje: 16:10, 21:9, 32:9 oraz pion do 2160×3840.
- WebKit: wszystkie 13 tras przy 1024×768, 1365×1218 i 2560×1440 oraz resize 4:3 → 16:9 → 4:3 bez zależności od historii.
- Diagnoza: semantyczna skala treści, pytań, odpowiedzi i wyniku zweryfikowana do 8K; ciemna scena ma własne ciemne tło awaryjne podczas zimnego ładowania grafiki.
- Strona główna: brak skalowania pełnego rastra/canvasu; wariant compact jest przypięty do kadru obrazu i nie tworzy prostokątnego szwu.
- Diagnoza: naturalna, wspólna siatka pytania rezerwuje wysokość najdłuższego z czterech kroków; odpowiedzi, „Wstecz” i nota prywatności nie nakładają się przy 2K/4K/8K. Błąd pobrania grafiki przechodzi do semantycznego tła awaryjnego i nie blokuje startu.
- O nas: sceny przekazują autorską szerokość panelu przez wspólny token railu. Punkty pozostają przypięte do obrazu, a karty i CTA nie przecinają treści przy 1024–1512 px ani w niskim oknie.
- Runtime: ResizeObserver wykonuje stabilny pomiar treści bez zerowania opublikowanej wysokości sceny; reset wysokości pozostaje wyłącznie odpowiedzialnością prawdziwej zmiany viewportu.
- Inwentarz obejmuje każdy produkcyjny CSS spoza jawnego rejestru wspólnych właścicieli, w tym `visual-direction-scenes.v20260730-2.css`.
