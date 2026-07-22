# OK Agency — decyzje projektowe

## Kierunki rozważone

1. **Editorial Signal** — biel, czerń, kobalt i limonkowy punkt; wielka typografia, techniczne linie sygnałowe i otwarte pasy treści.
2. **Warm Workshop** — cieplejsza paleta, bardziej miękka typografia i fotograficzny charakter małego studia.
3. **Digital Grid** — ciemny interfejs, gęstsza siatka oraz bardziej produktowy, technologiczny język.

Wybrany został **Editorial Signal**. Najczytelniej pokazuje ofertę małym firmom, jest charakterystyczny bez udawania dużej korporacji i pozwala osiągnąć wysoką wydajność bez stockowych zdjęć ani rozbudowanego JavaScriptu. Kierunek Warm Workshop był bardziej ludzki, ale mniej wyrazisty; Digital Grid wyglądał technologicznie, lecz zbyt łatwo mógł przypominać szablon SaaS.

## Źródła wizualne

- `docs/concepts/01-overview.png` — kolejność i rytm całej strony.
- `docs/concepts/02-hero.png` — nagłówek, pierwszy ekran i znak `OK`.
- `docs/concepts/03-services.png` — dwa otwarte rzędy usług.
- `docs/concepts/04-approach-audience.png` — kobaltowy proces i spokojna sekcja odbiorców.
- `docs/concepts/05-closing-footer.png` — ciemne zamknięcie i minimalna stopka.

Makiety są specyfikacją kierunku, nie źródłem treści biznesowych. Fragmenty wygenerowane przez model, które sugerują dodatkowe usługi, cztery etapy, wyniki albo kanał kontaktu, są odrzucone na rzecz autorytatywnych danych z briefu.

## System projektowy

### Kolory

- `--color-paper: #ffffff` — dokładna biel tła.
- `--color-ink: #0a0c0f` — główny tekst i ciemne pasy.
- `--color-cobalt: #1647f5` — główny akcent i sekcja procesu.
- `--color-cobalt-deep: #0d34ca` — stan aktywny i detal.
- `--color-signal: #cfff00` — jeden oszczędny punkt sygnałowy i fokus.
- `--color-muted: #5b606b` — tekst pomocniczy.
- `--color-rule: #cfd3da` — cienkie linie i separatory.

Kontrast: biały na kobalcie i czerni; czarny na limonce. Limonka nie jest używana do długiego tekstu.

### Typografia

- Instrument Sans Variable: nawigacja, treść, nagłówki, przyciski i wielki znak `OK`.
- Instrument Serif: wyłącznie zamykający nagłówek dla pojedynczego, redakcyjnego kontrastu.
- Skala oparta na `clamp()`: H1 ok. 54–82 px, H2 42–68 px, H3 28–42 px, tekst 17–22 px, UI 14–16 px.
- Nagłówki: ścisły tracking, zwarta interlinia; tekst: wygodna interlinia 1.5–1.65.

### Układ i odstępy

- Maksymalna szerokość treści: 1440 px.
- Boczne marginesy: 24 px mobile, 40 px tablet, 64 px desktop.
- Skala odstępów: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px.
- Sekcje korzystają z otwartych pasów i reguł, nie z kart.
- Breakpointy funkcjonalne: 640 px, 900 px i 1200 px.

### Krawędzie, cienie i obrazy

- Linie 1 px, lokalnie 2 px dla mocnych separatorów.
- Promień 0–4 px; przyciski pozostają niemal kwadratowe.
- Cienie tylko dla stanu menu mobilnego i wtedy bardzo subtelne.
- Brak fotografii produkcyjnej: motyw wizualny jest zbudowany jako tekst, CSS i SVG.

### Ruch i fokus

- Czas przejść: 160–240 ms dla sterowania, 480–700 ms dla wejścia linii sygnałowej.
- Ruch zmienia podkreślenie, przesunięcie strzałki lub długość linii; nie maskuje treści.
- `prefers-reduced-motion: reduce` wyłącza przewijanie płynne i animacje.
- Fokus: 3 px limonki z 2 px odsunięcia na ciemnym tle; na limonkowym elemencie czarny obrys.

## Model komponentów

- `SiteHeader`: wordmark, podstawowa nawigacja, CTA i menu mobilne.
- `SignalMark`: kodowy znak `OK`, linie i kwadrat sygnałowy.
- `ArrowIcon` i `TextLink`: spójne strzałki i interakcje.
- `ServiceRow`: numer, linia prowadząca, tytuł i opis.
- `ProcessRail`: trzy rzeczywiste, zadeklarowane kroki.
- `SiteFooter`: minimalna nawigacja i opis marki.

## Dozwolona treść pierwszego ekranu

- `OK Agency`
- `Usługi`
- `Jak działamy`
- `Dla kogo`
- `Poznaj usługi`
- `Marketing, który pomaga małym firmom rosnąć online.`
- `Łączymy marketing digitalowy i tworzenie stron internetowych — z myślą o potrzebach małych firm i MŚP.`
- `Poznaj zakres współpracy`
- `Zobacz, jak działamy`

Nie wolno dodawać eyebrow, badge, statystyki, logotypów klientów ani innych komunikatów dowodowych.

## Kolejność strony

1. Header i hero z dużym znakiem `OK`.
2. Usługi w dwóch poziomych rzędach.
3. Kobaltowy pas procesu z trzema krokami.
4. Sekcja `Dla małych firm, bez nadmiaru.` wyjaśniająca zakres bez fikcyjnych dowodów.
5. Ciemna sekcja końcowa z działającym CTA do usług.
6. Minimalna stopka.

## Świadome ograniczenia

- Brak danych kontaktowych jest traktowany jako `NONE`. Nie powstaje formularz ani wymyślony adres; główne CTA prowadzi do zakresu usług.
- Wygenerowane koncepcje pozostają w repozytorium jako dokumentacja, ale nie są ładowane przez stronę produkcyjną.
- Finalna karta Open Graph zostanie utworzona z prawdziwego renderu strony, dzięki czemu nie powstaje osobna, niespójna grafika.

## Ledger zgodności wizualnej

| Punkt porównania    | Dowód z koncepcji                                                                           | Dowód z renderu                                                          | Wynik / poprawka                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Pierwszy ekran      | `02-hero.png`: spokojny header, H1 po lewej, duże `OK` i dwa CTA                            | `docs/screenshots/desktop.png`: ta sama hierarchia i asymetryczna siatka | Zgodne; w 1024 px zmniejszono odstęp i tekst CTA, aby etykiety nie łamały się.                     |
| Paleta i tło        | Dokładna biel, czerń, kobalt i pojedynczy limonkowy węzeł                                   | Białe pasy, `#1647f5`, `#0a0c0f`, `#cfff00`                              | Zgodne; bez kremowego tła, gradientów i tintu na znaku.                                            |
| Model usług         | `03-services.png`: dwa duże poziome rzędy z numerami i linią sygnałową                      | Dwa semantyczne `article`, bez kart i ikonowego gridu                    | Zgodne; treść ograniczona do dwóch usług z briefu.                                                 |
| Proces              | `04-approach-audience.png`: kobaltowy pas, limonkowa numeracja i jedna łącząca linia        | Trzy kroki w jednej szynie, mobilnie układ pionowy                       | Zgodne z kierunkiem; celowo odrzucono czwarty, wygenerowany etap z overview jako nieautorytatywny. |
| Sekcja odbiorców    | Typograficzna, otwarta sekcja z dużym motywem po lewej i treścią po prawej                  | Konturowe `MŚP`, faktograficzne definicje zakresu i odbiorców            | Zgodne; brak fikcyjnych dowodów społecznych.                                                       |
| Zamknięcie i stopka | `05-closing-footer.png`: ciemny pas, serifowy nagłówek, limonkowe CTA i niebieska geometria | Ten sam kontrast, kierunek i minimalna stopka                            | Zgodne; CTA prowadzi do usług, bo kontakt nie został dostarczony.                                  |
| Responsywność       | Desktopowa specyfikacja z czytelną typografią i otwartym rytmem                             | Zrzuty 1440×900, 1024×768 i 390×844; bez poziomego overflow              | Zgodne; menu mobilne jest osobnym, klawiaturowo dostępnym stanem.                                  |

### Diff treści pierwszego ekranu

Wszystkie dziewięć dozwolonych ciągów jest obecnych i zachowuje kolejność. Nie dodano eyebrow, badge, statystyk, dowodów, danych kontaktowych ani nowego CTA. Wordmark, trzy etykiety nawigacji, CTA nagłówka, H1, lead oraz dwa CTA hero są zgodne z blokadą treści.

### Pozostałe świadome odstępstwa

- Pełny overview zawierał wygenerowane ikony, dodatkowe obietnice i cztery kroki. Nie zostały wdrożone, ponieważ naruszały źródło faktów.
- Koncepcja końcowa sekcji zamknięcia ma pierwszeństwo przed uproszczonym niebieskim pasem z overview; zachowuje ten sam system kolorystyczny i mocniejszy finał strony.
- Brak osobnej sekcji kontaktu i mailto jest zamierzony do czasu dostarczenia prawdziwego adresu e-mail.
