# Pomiar lejków OK Agency — konfiguracja produkcyjna

Stan: 10 sierpnia 2026 r.

## Zakres i koszt

- GA4 Standard, Google Ads tag, Meta Pixel i Meta Conversions API: bez dodatkowego abonamentu.
- Microsoft Clarity: plan bezpłatny, projekt `OK Agency`, ID `y03fqcii96`.
- Cloudflare Worker formularza i CAPI: istniejąca infrastruktura, bez nowej płatnej usługi.
- Nie używamy GTM, BigQuery, Hotjara ani płatnych wtyczek.

## Zasady danych

- Skrypty Google, Meta i Clarity nie ładują się przed zgodą.
- GA4 i Clarity uruchamiają się po zgodzie „Tylko analityka” lub „Analityka i reklamy”.
- Google Ads, Meta Pixel, CAPI i atrybucja marketingowa uruchamiają się dopiero po zgodzie „Analityka i reklamy”.
- Zewnętrzne zdarzenia produkcyjne są dozwolone wyłącznie na okagency.pl i www.okagency.pl.
- Podglądy Cloudflare Pages, localhost i staging nie wysyłają danych do GA4, Google Ads, Meta ani Clarity i nie proszą Workera o CAPI.
- Żadne zdarzenie nie zawiera imienia, e-maila, telefonu, domeny, wiadomości ani konkretnych odpowiedzi.
- generate_lead jest emitowane wyłącznie po odpowiedzi API potwierdzającej przyjęcie formularza.

## Lejek /diagnoza

| Kolejność | Zdarzenie GA4/Clarity | Parametry dozwolone |
|---:|---|---|
| 1 | diagnosis_view | brak |
| 2 | diagnosis_start | brak |
| 3–6 | diagnosis_step_completed | step_number: 1–4 |
| 7 | diagnosis_complete | diagnosis_outcome: allowlista |
| 8a | diagnosis_result_cta_click | brak |
| 8b | diagnosis_contact_open | brak |
| 9 | diagnosis_form_start | form_type=diagnosis |
| 10 | diagnosis_submit_attempt | form_type=diagnosis |
| błąd | diagnosis_validation_error | ogólne error_type |
| błąd | diagnosis_submit_error | ogólne error_type |
| sukces | generate_lead | form_type=diagnosis |

Meta otrzymuje tylko zdarzenia przydatne do raportowania i optymalizacji: PageView, DiagnosisComplete, DiagnosisContactOpened oraz potwierdzony Contact. Contact z Pixela i CAPI używa tego samego event_id.

## Lejek /diagnoza-www

| Kolejność | Zdarzenie GA4/Clarity | Parametry dozwolone |
|---:|---|---|
| 1 | site_audit_view | brak |
| 2 | site_audit_form_start | brak |
| 3 | site_audit_submit_attempt | brak |
| błąd | site_audit_validation_error | ogólne error_type |
| 4 | site_audit_started | audit_result_source: new albo cached |
| 5 | site_audit_completed | status, pewność, punktacja i pokrycie |
| błąd | site_audit_failed | ogólne error_type |
| 6a | site_audit_pdf_downloaded | brak |
| 6b | site_audit_contact_clicked | brak |

Wpisana domena nigdy nie jest parametrem GA4, Meta ani Clarity.

## Lejek /kontakt

contact_view → contact_form_start → contact_submit_attempt → generate_lead.

Błędy są raportowane jako contact_validation_error lub contact_submit_error z ogólną kategorią techniczną. Treść pól pozostaje poza analityką.

## GA4 — raporty i wymiary

Własne wymiary o zakresie zdarzenia:

- diagnosis_outcome
- step_number
- form_type
- error_type
- audit_result_source
- audit_status
- audit_confidence
- audit_score_band

Eksploracje lejka:

1. /diagnoza: od diagnosis_view do generate_lead.
2. /diagnoza-www: od site_audit_view do site_audit_contact_clicked.
3. Formularz kontaktowy: od contact_view do generate_lead.

Podziały: source/medium, campaign, content, urządzenie, przeglądarka, nowy/powracający. generate_lead jest jedyną kluczową konwersją biznesową. Ukończenie diagnozy i audytu pozostaje zdarzeniem pomocniczym.

## UTM

Meta:

utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}_{{campaign.id}}&utm_content={{ad.name}}_{{ad.id}}&utm_term={{adset.name}}_{{adset.id}}

Google Search:

utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={creative}&utm_term={keyword}

Nowa kreacja Meta prowadząca do /diagnoza-www ma używać tego samego schematu i nie może kierować do /diagnoza.

## QA

- Parametr ok_qa=1 oznacza kontrolowany ruch wewnętrzny w GA4/Clarity, ale nie jest zapisywany jako atrybucja kampanii.
- Przed zgodą nie mogą pojawić się żądania do Google, Meta ani Clarity.
- Formularze i cztery bloki odpowiedzi mają data-clarity-mask="true".
- Testy automatyczne sprawdzają pojedyncze wywołania, host produkcyjny, PII, zgodę, CSP, CAPI i wspólny event_id.
- Historycznego ruchu qa_meta_pageview / qa nie usuwa się z surowej historii; należy wykluczyć go w eksploracjach i raportach.
