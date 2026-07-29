# OK Agency — sposób projektowania kolejnych podstron usługowych

Ten dokument jest handoffem dla agentów, którzy nie mają historii rozmowy. Opisuje zaakceptowany język wizualny, konstrukcję UX i sposób implementacji podstron usługowych w projekcie:

`G:\OK-Agency\05-website\hero_kimi`

## 1. Co jest źródłem prawdy

Referencją konstrukcyjną jest ukończona podstrona Kampanii:

- `kampanie.html`
- `assets/services/campaign/styles.css`
- `assets/services/campaign/script.js`

Pozostałe ukończone podstrony:

- `social-media.html`
- `strony-internetowe.html`
- `diagnoza.html`

Nie należy kopiować ich treści ani kadrów 1:1. Są wzorcem jakości, rytmu, interakcji i poziomu konkretu.

Projekt nadrzędny oraz menu zostały przygotowane przez KIMI. Przy pracy nad jedną podstroną usługową nie wolno samowolnie przebudowywać:

- `index.html`,
- `menu.html`,
- `kontakt.html`,
- innych ukończonych podstron.

## 2. Główny motyw wizualny

Każda scena musi wynikać z jednego świata:

- druciane drzewo wiśniowe,
- plecione miedziane konary i korzenie,
- szklane kwiaty wiśni,
- ciężki, przydymiony obsydian,
- świetlne włókna zatopione w przewodach,
- różowo-złote impulsy płynące wewnątrz fizycznej struktury.

To nie może zmienić się w:

- reklamę biżuterii,
- przypadkowe kryształy lub kamienie szlachetne,
- abstrakcyjne neonowe wstęgi,
- cyberpunkowy obwód drukowany,
- fantasy albo magiczne korzenie,
- płaskie linie domalowane nad renderem.

Światło zawsze ma wynikać z materiału i podążać po przewodzie, korzeniu lub włóknie.

### Bezwzględny scope lock dla nowych scen

Każda nowa scena ma pokazywać **ten sam, rozpoznawalny obiekt**, a nie nową interpretację motywu.

Przed wygenerowaniem assetu agent musi umieć dokończyć zdanie:

> „W tej scenie kamera pokazuje [konkretny fragment] tego samego drucianego drzewa wiśniowego osadzonego w tej samej obsydianowej podstawie.”

Dozwolone zmiany:

- pozycja i ogniskowa kamery,
- zbliżenie na korzeń, pień, konar, koronę, kwiat albo wnętrze obsydianu,
- jasna lub ciemna ekspozycja,
- kierunek i aktywność sygnału wewnątrz przewodów,
- głębia ostrości oraz intensywność kaustyki,
- ilość negatywnej przestrzeni potrzebnej na copy.

Niedozwolone zmiany:

- zastąpienie drzewa luźną siecią przewodów,
- rozłożenie korzeni na stole jak dekoracji lub biżuterii,
- utworzenie małego bonsai, nowej rzeźby albo innego kształtu podstawy,
- użycie osobnych kamieni jako nowej metafory danych,
- poprowadzenie zewnętrznej pętli kabla, która nie należy do drzewa,
- wprowadzenie nowego materiału, obiektu lub symbolu tylko dlatego, że „pasuje do tematu”,
- oddalenie się od głównego motywu pod pretekstem większej różnorodności scen.

Różnorodność uzyskujemy przez **filmowanie tego samego bohatera inaczej**, nie przez wymianę bohatera.

Nie oznacza to jednak obowiązku pokazywania obsydianowej podstawy w każdej scenie. Taki zabieg szybko robi się monotonny. Pełna „anatomia” motywu obejmuje:

- źródło i włókna wewnątrz obsydianu,
- korzenie przechodzące w pień,
- pleciony pień i jego węzły,
- główne konary,
- delikatne gałęzie,
- szklane kwiaty i pąki,
- sygnały przesyłane pomiędzy tymi częściami.

W dłuższej historii należy świadomie rozłożyć kadry pomiędzy różne części drzewa. Przykładowy rytm:

1. źródło w obsydianie,
2. korona lub pąki,
3. rozgałęzienia konarów,
4. pień i gotowy kwitnący konar,
5. sygnał wracający przez koronę,
6. finał ponownie zbierający energię w podstawie.

Scope lock dotyczy **tożsamości drzewa i materiałów**, a nie identycznego cropu ani obowiązkowej obecności kamienia.

W promptach ImageGen należy wpisywać wprost:

- „THE SAME mature braided-copper cherry tree”,
- „THE SAME wide smoked-obsidian base”,
- „preserve sculpture identity and material hierarchy”,
- „do not invent a new sculpture or detached wire network”.

Jako referencje należy podawać przede wszystkim zaakceptowane finalne assety z `assets/services/`, a nie luźne koncepty lub wcześniejsze odrzucone warianty.

## 3. Konstrukcja historii

Podstrona nie jest klasycznym one-pagerem ani serią kart. To sekwencja pełnoekranowych aktów.

Wzorzec Kampanii ma trzy akty:

1. otwarcie i obietnica,
2. sposób działania,
3. konkrety, mierniki lub dowód.

Jeżeli temat wymaga mocniejszego rozwinięcia, można użyć większej liczby scen. Każda dodatkowa scena musi jednak odpowiadać na osobne pytanie użytkownika. Nie dodajemy scen wyłącznie dla kolejnego ładnego kadru.

Podstrona Procesu używa sześciu scen:

1. obietnica procesu,
2. Odkrycie,
3. Kierunek,
4. Realizacja,
5. Optymalizacja,
6. standard współpracy.

Scroll pozostaje w pełni natywny. Sceny są kolejnymi sekcjami w zwykłym przepływie dokumentu — bez sticky stack, `scroll-snap`, `preventDefault`, przejmowania kółka lub swipe, ręcznego animowania `scrollY` i dociągania do punktów. Użytkownik może zatrzymać się w dowolnym miejscu, przewijać z dowolną prędkością oraz używać trackpada lub autoscrolla środkowym przyciskiem dokładnie tak, jak na standardowej stronie.

## 4. Rola copy

Obrazy budują emocję, ale treść musi udowadniać kompetencję. Copy nie może składać się wyłącznie z ogólnych haseł.

Każda scena powinna zawierać:

- jeden mocny nagłówek,
- krótki lead wyjaśniający znaczenie etapu,
- 3–4 konkretne elementy,
- jawnie nazwany rezultat etapu,
- przejście do kolejnego widoku.

Treść ma odpowiadać na pytania:

- Co dokładnie robicie?
- Po co to robicie?
- Jak wygląda decyzja lub odpowiedzialność?
- Co klient otrzymuje?
- Po czym poznamy, że etap jest zakończony?

Na podstronach ofertowych należy używać prawdziwych konkretów właściwych dla usługi. Przykład Kampanii: Meta Ads, Google Ads, CTR, CPC, CPA, ROAS, jakość leadów, lejek, analityka i optymalizacja.

Cały tekst interfejsu musi być natywnym HTML-em. ImageGen nie może generować:

- nagłówków,
- podpisów,
- czerwonych linii anotacji,
- przycisków,
- nawigacji,
- mierników ani tabel.

## 5. Generowanie assetów

Najpierw projektujemy całą historię, potem generujemy osobny raster dla każdego głównego aktu.

Zasady promptów:

- format 1672 × 941 lub ten sam stosunek 16:9,
- jasna informacja, po której stronie ma zostać przestrzeń na copy,
- bez tekstu, logo, UI i pseudonapisów,
- materiały muszą być realistyczne i zgodne z głównym drzewem,
- energia ma być zatopiona w przewodach,
- scena ma mieć fizyczne światło, cień, refrakcję i kontakt z podłożem,
- kolejne kadry powinny różnić się perspektywą, światłem i kompozycją.

Nie wolno używać jednego obrazu jako zwykłego tła dla wszystkich scen ani domalowywać kluczowych elementów grubymi SVG nad nietrafionym renderem.

Finalne obrazy zapisujemy jako WebP:

`assets/services/<nazwa-usługi>/`

Typowy format nazwy:

`<service>-art-<scene>-v1.webp`

Rekomendowane parametry konwersji:

- WebP,
- quality 95,
- method 6,
- zachowany natywny rozmiar 1672 × 941.

## 6. Interakcje

Podstrony używają dwóch rodzin interakcji.

### Punkty anotacji

- mała różowa kropka delikatnie pulsuje,
- po hoverze, focusie lub kliknięciu rozwija się cienka linia,
- pojawia się tytuł oraz 1–2 zdania konkretnego opisu,
- linia i tekst są kodem, nie częścią renderu,
- punkt musi być zmapowany do realnego miejsca na przewodzie albo węźle.

### Akordeony konkretów

- stosowane w scenie końcowej,
- jeden element może być otwarty,
- każdy wiersz pokazuje temat i krótką obietnicę,
- rozwinięcie zawiera operacyjny konkret,
- interakcja musi być dostępna z klawiatury i mieć prawidłowe `aria-expanded`.

Ruch:

- pomiędzy scenami nie ma crossfade'u, bluru, zmiany skali ani animacji zależnej od pozycji scrolla,
- odnośniki do kolejnych scen są zwykłymi linkami do identyfikatorów URL/hash,
- wskazówka „Przewiń” porusza się minimalnie góra–dół,
- nie dodajemy stałego wskaźnika numeru sceny,
- `prefers-reduced-motion` wyłącza zbędne mikroanimacje.

## 7. Implementacja

Projekt jest statyczny. Podstrona składa się z:

- pliku HTML w katalogu głównym,
- `assets/services/<service>/styles.css`,
- wspólnego `assets/service-interactions.js` dla anotacji i akordeonów,
- osobnych WebP dla każdej sceny,
- wspólnego `assets/route-motion.css`,
- wspólnego `assets/story-standard.css`, który utrzymuje sceny w normalnym przepływie dokumentu.

Używamy semantycznych:

- `main`,
- `section`,
- `header`,
- `nav`,
- `article`,
- prawdziwych linków i przycisków.

Każda scena:

- zajmuje pełny viewport,
- ma własny identyfikator URL/hash,
- posiada poprawne `aria-labelledby`,
- pozostaje dostępna w drzewie dokumentu i nie otrzymuje `aria-hidden` ani `inert` na podstawie pozycji scrolla.

Nawigacja musi prowadzić relatywnie:

- `menu.html`,
- `proces.html`,
- `kontakt.html`.

Nie wolno używać ścieżek prowadzących do folderów prototypowych ani `../../`.

## 8. Responsive

Desktop jest projektowany w natywnym widoku 1672 × 941.

Obowiązkowy test mobile:

- 390 × 844,
- brak poziomego overflow,
- CTA widoczne bez przycięcia,
- nagłówek nie nachodzi na nawigację,
- na mobile rozbudowane anotacje przechodzą w czytelną listę,
- tekst otrzymuje półprzezroczystą, rozmytą powierzchnię tylko wtedy, gdy obraz uniemożliwia czytanie,
- najważniejsza część renderu pozostaje widoczna dzięki kontrolowanemu `object-position`.

Należy również sprawdzić minimum jeden niższy laptop albo węższy desktop.

## 9. Obowiązkowe QA

Nie kończymy na sprawdzeniu kodu.

Każdy widok należy zweryfikować przynajmniej na dwa sposoby:

1. technicznie:
   - HTTP 200,
   - wszystkie assety istnieją,
   - `node --check` dla JS,
   - brak błędnych ścieżek,
   - brak błędów aplikacji w konsoli;
2. wizualnie i interakcyjnie:
   - screenshot desktop każdego aktu,
   - screenshot mobile przynajmniej otwarcia i najgęstszej sceny,
   - kliknięcie lub hover punktu anotacji,
   - otwarcie akordeonu,
   - przejście przez całą sekwencję,
   - sprawdzenie swobodnego zatrzymania pomiędzy scenami i braku automatycznego dociągania.

Przed oddaniem porównujemy:

- kompozycję i crop,
- typografię,
- kontrast i paletę,
- położenie punktów względem przewodów,
- gęstość treści,
- zachowanie przejść,
- mobile,
- dostępność interakcji.

## 10. Najważniejsze lekcje z dotychczasowych iteracji

- Nie zastępuj nietrafionego renderu grubą domalowaną krzywą albo „tasiemcem”.
- Nie wklejaj tekstu do grafiki. Tekst musi być czytelny, responsywny i dostępny.
- Nie twórz kolejnych stron z niemal identyczną kompozycją. Zachowaj system, ale zmieniaj kadr, światło i narrację.
- Nie odchodź od drucianego drzewa w kierunku luźnych klejnotów albo generycznego luksusu.
- Nie zostawiaj wielkich pustych pól bez roli. Pusta przestrzeń ma budować skupienie, nie zdradzać brak treści lub złe skalowanie.
- Nie oddawaj przejść, w których dwie sceny zatrzymują się nałożone na siebie.
- Nie traktuj strony jak slajdów i nie przejmuj gestów scrolla. Użytkownik kontroluje tempo, a warstwy wizualne odpowiadają na natywną pozycję dokumentu.
- Jeśli użytkownik szuka konkretów, musi je znaleźć bez czytania ściany tekstu.
- Nie próbuj ilustrować każdego etapu procesu nową metaforą. „Odkrycie” nie wymaga luźnej sieci i osobnych kamieni, a „Optymalizacja” nie wymaga zewnętrznej pętli przewodu. Znaczenie ma wynikać z kadru, światła, aktywności sygnału i kodowego copy.
- Jeżeli nowy render po ukryciu tekstu nie wygląda jak kadr z tej samej strony co hero, należy go odrzucić przed implementacją.

## 11. Poufność i dowód wiarygodności

Projekty, przy których Oliwia pracowała wcześniej, są objęte umowami o poufności. Brak publicznego portfolio jest świadomym ograniczeniem wynikającym z NDA, a nie luką, którą należy wypełnić fikcyjnymi albo anonimowymi realizacjami.

Bez osobnej, jednoznacznej zgody właścicielki projektu nie wolno:

- tworzyć podstrony „Realizacje”, „Portfolio” ani „Case studies”,
- publikować nazw klientów, logotypów, materiałów, ekranów ani wyników,
- budować anonimowych case studies pozwalających odtworzyć projekt lub rozpoznać klienta,
- używać w nawigacji etykiet obiecujących realizacje, których strona nie pokazuje,
- wymyślać opinii, metryk, cytatów lub rezultatów jako zastępstwa dla portfolio.

Jeżeli sekcja nie zawiera prawdziwych realizacji:

- „Case studies” na Kampaniach należy nazwać „Jak mierzymy” albo „Mierniki”,
- „Realizacje” na Stronach internetowych należy nazwać „Standard wykonania” albo „Co otrzymujesz”.

Wiarygodność budujemy przez:

- jawne wyjaśnienie ograniczenia NDA,
- zakres odpowiedzialności Oliwii,
- doświadczenie i kwalifikacje,
- opis sposobu podejmowania decyzji,
- standard procesu, komunikacji i kontroli jakości,
- stronę OK Agency jako własny przykład strategii, UX, designu i wykonania technicznego.

Rekomendowany sposób komunikacji:

> **Zamiast portfolio**  
> Nie pokażę Ci nazw klientów ani materiałów z ich projektów. Prace, przy których Oliwia pracowała wcześniej, są objęte umowami o poufności — i nie obchodzimy tych umów anonimowymi case studies.  
> Pokazujemy za to zakres odpowiedzialności, sposób podejmowania decyzji, doświadczenie, kwalifikacje i tę stronę — zaprojektowaną tym samym procesem, który otrzymuje klient.

Mocne, dopuszczalne skróty:

- „Zamiast nazw klientów pokazujemy sposób pracy.”
- „Nie obchodzimy umów o poufności anonimowymi case studies.”
- „Ta strona pokazuje nasz sposób myślenia i wykonania. Nie udaje dowodu wyników biznesowych klienta.”

Główne wyjaśnienie NDA powinno pojawić się na podstronie „O nas”. Na pozostałych stronach nie powtarzamy długiego uzasadnienia i nie tworzymy w nawigacji obietnicy portfolio. Referencją treści jest sekcja wiarygodności w:

`mockups/o-nas/index.html`

## 12. Interaktywna Diagnoza

`diagnoza.html` ma być użytecznym narzędziem pomagającym wybrać kierunek, a nie kolejną klasyczną podstroną sprzedażową. Powinna realizować obietnicę:

> „Cztery pytania, rekomendowany kierunek i pierwszy krok — od razu na ekranie.”

Diagnoza jest jedną trasą z pięcioma stanami interfejsu:

1. Pytanie 1 — główny objaw lub problem,
2. Pytanie 2 — obecne miejsce kontaktu odbiorcy z firmą,
3. Pytanie 3 — posiadane zasoby i poziom gotowości,
4. Pytanie 4 — najważniejszy oczekiwany rezultat,
5. rekomendacja z uzasadnieniem i pierwszym krokiem.

Rekomendowane pytania:

1. „Co dziś uwiera Cię najbardziej?”
2. „Gdzie dziś trafia ktoś, kto Cię szuka?”
3. „Co masz już gotowe?”
4. „Jaki rezultat jest dziś najważniejszy?”

Termin rozpoczęcia nie powinien wybierać usługi. Można zapytać o niego dopiero po rekomendacji albo w formularzu kontaktowym.

Diagnoza musi obsługiwać minimum pięć wyników:

- Strona internetowa,
- Social media,
- Kampania,
- Najpierw rozmowa i uporządkowanie problemu,
- Na razie żadna usługa.

Każdy wynik zawiera:

- nazwę rekomendowanego kierunku,
- krótkie i konkretne „dlaczego”,
- trzy pierwsze kroki,
- zastrzeżenie „To punkt startu, nie oferta ani wycena”,
- CTA do właściwej podstrony,
- CTA do kontaktu,
- możliwość rozpoczęcia diagnozy od nowa.

Zasady UX:

- jedno pytanie jest widoczne naraz,
- odpowiedzi są prawdziwymi przyciskami,
- użytkownik widzi postęp `01 / 04`,
- zawsze może wrócić do poprzedniego pytania,
- po zmianie stanu fokus przechodzi na nagłówek nowego pytania lub wyniku,
- odpowiedzi nie wymagają e-maila, zapisu ani zgody marketingowej,
- nie zapisujemy pełnych odpowiedzi w URL, analityce ani pamięci przeglądarki,
- do kontaktu przekazujemy wyłącznie wynik, np. `kontakt.html?context=campaign&source=diagnosis`,
- formularz kontaktowy powinien na tej podstawie wybrać temat zgłoszenia.

Na desktopie dopuszczalny jest stały panel wprowadzający po lewej i zmieniające się pytanie po prawej. Na mobile interfejs przechodzi w jedną kolumnę. Jest to sekwencja stanów formularza, nie pięć osobnych podstron i nie pięć niezależnych scen do przewijania.

Copy otwierające:

> **Zanim cokolwiek kupisz, nazwijmy problem.**  
> Odpowiadasz na cztery pytania i od razu na ekranie dostajesz rekomendowany kierunek oraz pierwszy krok. Bez zapisów, bez maila, bez zobowiązania.

Diagnoza nie może obiecywać wyniku „żadna usługa”, jeżeli logika nie potrafi go rzeczywiście zwrócić. Algorytm rekomendacji musi być deterministyczny, przetestowany dla remisów i nie może wybierać usługi wyłącznie na podstawie deklarowanego terminu.

## 13. Wspólna stopka

Serwis powinien używać jednej spójnej stopki. Stopka nie jest kolejnym aktem usługi, tylko terminalnym blokiem nawigacyjnym po ostatniej scenie lub treści strony.

Rekomendowana struktura:

1. **OK Agency**
   - Agencja marketingowa dla małych i średnich firm.
   - Praca zdalna, cała Polska.
2. **Kierunki**
   - Strony internetowe,
   - Social media,
   - Kampanie płatne,
   - Diagnoza.
3. **Agencja**
   - O nas,
   - Proces,
   - Kontakt,
   - Polityka prywatności.
4. **Kontakt**
   - `kontakt@okagency.pl`,
   - `© 2026 OK Agency`.

Stopka nie zawiera linku „Realizacje”, „Portfolio” ani „Case studies”. Może wyróżniać link „Zrób diagnozę — 4 pytania”.

Zasady implementacji:

- stopka ma być wspólnym, reużywalnym komponentem i używać jednego zestawu stylów,
- wszystkie linki mają być prawdziwymi linkami względnymi,
- „Polityka prywatności” musi prowadzić do istniejącej strony, nie do placeholdera,
- na mobile kolumny układają się pionowo bez poziomego overflow,
- stopka musi mieć wystarczający kontrast i czytelny tekst, bez mikrocopy poniżej rozsądnego minimum,
- na podstronach pełnoekranowych natywny przepływ dokumentu musi prowadzić bezpośrednio do stopki po ostatnim akcie,
- między ostatnim aktem a stopką nie dodajemy pustej strefy przekazania, gradientu ani elementu pośredniego,
- dodanie stopki nie może zwiększać liczby aktów merytorycznych podstrony usługowej.

## 14. Zakres zmian

Przed rozpoczęciem pracy zawsze ustal, którą podstronę wolno zmieniać. W tym repozytorium nad różnymi elementami mogą pracować różni agenci.

Zasada:

- modyfikuj tylko wskazaną podstronę i jej katalog assetów,
- nie synchronizuj z GitHubem bez polecenia,
- nie poprawiaj przy okazji hero, menu ani innych usług,
- zachowuj istniejące pliki użytkownika i cudze zmiany.
