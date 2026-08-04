(() => {
  "use strict";

  const ORDER = ["website", "social", "campaign"];
  const POINTS = {
    q1: {
      offer: { website: 4 },
      rhythm: { social: 4 },
      leads: { campaign: 4 },
      mixed: {}
    },
    q2: {
      "site-strong": { social: 1, campaign: 2 },
      "site-weak": { website: 3 },
      "social-only": { website: 2, social: 1 },
      direct: { website: 3 },
      fragmented: { website: 1, social: 1 }
    },
    q3: {
      basics: { website: 3 },
      site: { social: 2, campaign: 1 },
      stack: { campaign: 3 },
      pieces: { website: 1, social: 1, campaign: 1 },
      changing: {}
    },
    q4: {
      website: { website: 4 },
      social: { social: 4 },
      campaign: { campaign: 4 },
      talk: {},
      none: {}
    }
  };

  const RESULTS = {
    website: {
      title: "Najpierw strona internetowa.",
      why: "Masz ofertę i potrzebujesz lepszych zapytań, ale odbiorca nie ma jednego miejsca, które jasno tłumaczy wartość i prowadzi do kontaktu. Kampania lub regularne social media byłyby dziś ruchem przed fundamentem.",
      steps: [
        "Nazwij jedno zadanie strony i główną decyzję użytkownika.",
        "Ułóż strukturę treści wokół pytań klientów.",
        "Dopiero potem określ zakres projektu, pomiar i wycenę."
      ],
      primary: ["Zobacz strony internetowe", "/strony-internetowe"],
      secondary: ["Przejdź do kontaktu", "/kontakt?context=web&source=diagnosis"]
    },
    social: {
      title: "Najpierw social media.",
      why: "Masz działające miejsce, do którego możesz kierować odbiorców, ale marka znika między pojedynczymi publikacjami. Największą różnicę zrobi teraz powtarzalny rytm i kilka formatów, które zespół naprawdę utrzyma.",
      steps: [
        "Ustal rolę każdego kanału i wybierz jeden kanał główny.",
        "Zbuduj 3–4 powtarzalne formaty treści.",
        "Zaplanuj pierwsze cztery tygodnie i prosty sposób oceny rytmu."
      ],
      primary: ["Zobacz social media", "/social-media"],
      secondary: ["Przejdź do kontaktu", "/kontakt?context=social&source=diagnosis"]
    },
    campaign: {
      title: "Najpierw kampania.",
      why: "Oferta, miejsce docelowe i podstawy pomiaru są gotowe. Brakuje kontrolowanego sposobu pozyskiwania ruchu i kryterium, które pokaże, czy budżet naprawdę pracuje.",
      steps: [
        "Nazwij jedno zadanie kampanii i jedną główną konwersję.",
        "Ustal próg opłacalności oraz sposób pomiaru.",
        "Uruchom ograniczony test i oceniaj jakość, nie samą liczbę kliknięć."
      ],
      primary: ["Zobacz kampanie", "/kampanie"],
      secondary: ["Przejdź do kontaktu", "/kontakt?context=campaign&source=diagnosis"]
    },
    conversation: {
      title: "Najpierw rozmowa.",
      why: "Odpowiedzi wskazują na kilka zależnych blokad albo nie tworzą jednego wyraźnego kierunku. Wybór usługi na siłę byłby zgadywaniem.",
      steps: [
        "Ustal cel biznesowy, kontekst i realne ograniczenia.",
        "Oddziel główną przyczynę od widocznych objawów.",
        "Wybierz kolejność działań i nazwij to, czego nie robić teraz."
      ],
      primary: ["Zobacz proces", "/proces?from=diagnosis"],
      secondary: ["Przejdź do kontaktu", "/kontakt?context=conversation&source=diagnosis"]
    },
    none: {
      title: "Na razie żadna usługa.",
      why: "Nie ma jeszcze konkretnego celu, który strona, social media lub kampania miałyby wesprzeć. Najuczciwszą rekomendacją jest wstrzymać zakup i wrócić, gdy będzie jasna decyzja biznesowa.",
      steps: [
        "Nazwij zmianę biznesową, którą marketing miałby wspierać.",
        "Zbierz fakty o obecnej sytuacji zamiast tworzyć listę działań.",
        "Wróć do diagnozy, gdy będzie wiadomo, po czym poznasz poprawę."
      ],
      primary: ["Wróć do oferty", "/menu"],
      secondary: ["Zadaj jedno pytanie", "/kontakt?context=none&source=diagnosis"]
    }
  };

  function calculateOutcome(input) {
    const answers = input && typeof input === "object" ? input : {};
    if (answers.q4 === "none") return "none";
    if (answers.q4 === "talk") return "conversation";
    if (answers.q3 === "changing") return "conversation";

    const scores = { website: 0, social: 0, campaign: 0 };
    ["q1", "q2", "q3", "q4"].forEach(question => {
      const values = POINTS[question][answers[question]] || {};
      ORDER.forEach(service => { scores[service] += values[service] || 0; });
    });

    const campaignAllowed =
      answers.q3 === "stack" ||
      (answers.q2 === "site-strong" && answers.q3 === "site");

    const ranking = ORDER
      .filter(service => service !== "campaign" || campaignAllowed)
      .map(service => ({ service, score: scores[service] }))
      .sort((a, b) => (b.score - a.score) || (ORDER.indexOf(a.service) - ORDER.indexOf(b.service)));

    return ranking[0].score - ranking[1].score <= 2
      ? "conversation"
      : ranking[0].service;
  }

  function createCompletionTracker(track) {
    let tracked = false;
    return Object.freeze({
      reset() {
        tracked = false;
      },
      complete(outcome) {
        if (tracked) return false;
        tracked = true;
        track?.(outcome);
        return true;
      },
    });
  }

  window.OKAgencyDiagnosis = Object.freeze({ calculateOutcome, createCompletionTracker });

  const tool = document.querySelector("[data-diagnosis-tool]");
  if (!tool) return;

  const frames = Array.from(tool.querySelectorAll("[data-act]"));
  const questions = Array.from(tool.querySelectorAll("[data-question-step]"));
  const announcer = tool.querySelector("[data-diagnosis-announcer]");
  const resultTitle = tool.querySelector("#result-title");
  const resultWhy = tool.querySelector("[data-result-why]");
  const resultSteps = Array.from(tool.querySelectorAll("[data-result-step]"));
  const resultPrimary = tool.querySelector("[data-result-primary]");
  const outcomePanels = Array.from(tool.querySelectorAll("[data-outcome-panel]"));
  const contactTitle = tool.querySelector("#contact-title");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const answers = {};
  let currentQuestion = 1;
  const diagnosisCompletionTracker = createCompletionTracker(outcome => {
    window.okAnalytics?.diagnosisComplete(outcome);
  });
  const artReadiness = new WeakMap();

  const ensureFrameArtReady = frame => {
    const art = frame?.querySelector(".campaign-art");
    if (!art) return Promise.resolve();
    if (artReadiness.has(art)) return artReadiness.get(art);

    art.loading = "eager";
    /* `complete` is also true after an image error. Resolve that state and
     * let the semantic scene fallback render; attaching an error listener
     * after the event has fired would otherwise lock the start controls. */
    const loaded = art.complete
      ? Promise.resolve()
      : new Promise(resolve => {
          art.addEventListener("load", resolve, { once: true });
          art.addEventListener("error", resolve, { once: true });
        });
    const ready = loaded.then(async () => {
      if (!art.naturalWidth) return;
      if (typeof art.decode !== "function") return;
      await art.decode().catch(() => {});
    });
    artReadiness.set(art, ready);
    return ready;
  };

  const focusAfterPaint = element => {
    requestAnimationFrame(() => requestAnimationFrame(() => element?.focus({ preventScroll: true })));
  };

  const showAct = (name, focus = true) => {
    const next = frames.find(frame => frame.dataset.act === name);
    if (!next) return;

    frames.forEach(frame => {
      const active = frame === next;
      frame.classList.toggle("is-active", active);
      frame.setAttribute("aria-hidden", String(!active));
      frame.inert = !active;
    });

    if (themeColor) themeColor.content = name === "map" ? "#071a2c" : "#ead9cb";
    scrollTo({ top: tool.offsetTop, behavior: "auto" });
    if (!focus) return;

    const heading = name === "opening"
      ? next.querySelector("#opening-title")
      : name === "outcome"
        ? resultTitle
        : next.querySelector(".quiz-question.is-active h3");
    focusAfterPaint(heading);
  };

  const syncPressed = () => {
    tool.querySelectorAll("[data-question][data-value]").forEach(button => {
      button.setAttribute(
        "aria-pressed",
        String(answers[button.dataset.question] === button.dataset.value)
      );
    });
  };

  const clearAfter = step => {
    for (let index = step + 1; index <= 4; index += 1) delete answers[`q${index}`];
    syncPressed();
  };

  const showQuestion = step => {
    const next = questions.find(question => Number(question.dataset.questionStep) === step);
    if (!next) return;

    questions.forEach(question => {
      const active = question === next;
      question.classList.toggle("is-active", active);
      question.setAttribute("aria-hidden", String(!active));
      question.inert = !active;
    });

    currentQuestion = step;
    syncPressed();
    if (announcer) announcer.textContent = `Pytanie ${step} z 4`;
    scrollTo({ top: tool.offsetTop, behavior: "auto" });
    focusAfterPaint(next.querySelector("h3"));
  };

  let currentOutcome = null;
  let currentOutcomePanel = "result";
  let ensureLeadTurnstile = () => {};

  const showOutcomePanel = (name, focus = true) => {
    const next = outcomePanels.find(panel => panel.dataset.outcomePanel === name);
    if (!next) return;

    outcomePanels.forEach(panel => {
      const active = panel === next;
      panel.classList.toggle("is-active", active);
      panel.setAttribute("aria-hidden", String(!active));
      panel.inert = !active;
    });

    currentOutcomePanel = name;
    if (name === "contact") ensureLeadTurnstile();
    scrollTo({ top: tool.offsetTop, behavior: "auto" });
    if (announcer) {
      announcer.textContent = name === "contact"
        ? "Opcjonalny formularz kontaktowy."
        : `Wynik diagnozy: ${RESULTS[currentOutcome]?.title || ""}`;
    }
    if (focus) focusAfterPaint(name === "contact" ? contactTitle : resultTitle);
  };

  const setResultLink = (anchor, data) => {
    anchor.setAttribute("href", data[1]);
    anchor.querySelector("span").textContent = data[0];
  };

  const renderResult = outcome => {
    const copy = RESULTS[outcome];
    currentOutcome = outcome;
    resultTitle.textContent = copy.title;
    resultWhy.textContent = copy.why;
    resultSteps.forEach((item, index) => { item.textContent = copy.steps[index]; });
    setResultLink(resultPrimary, copy.primary);
    showOutcomePanel("result", false);
    if (announcer) announcer.textContent = `Wynik diagnozy: ${copy.title}`;
  };

  const mapFrame = frames.find(frame => frame.dataset.act === "map");
  const outcomeFrame = frames.find(frame => frame.dataset.act === "outcome");
  const startButtons = Array.from(tool.querySelectorAll("[data-start-diagnosis]"));
  let mapActivation = null;
  const enterMap = () => {
    if (mapActivation) return mapActivation;
    startButtons.forEach(button => {
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
    });
    mapActivation = ensureFrameArtReady(mapFrame).then(() => {
      showAct("map", false);
      showQuestion(1);
      void ensureFrameArtReady(outcomeFrame);
    }).finally(() => {
      startButtons.forEach(button => {
        button.disabled = false;
        button.removeAttribute("aria-busy");
      });
      mapActivation = null;
    });
    return mapActivation;
  };

  startButtons.forEach(button => {
    button.addEventListener("pointerenter", () => { void ensureFrameArtReady(mapFrame); }, { once: true });
    button.addEventListener("focus", () => { void ensureFrameArtReady(mapFrame); }, { once: true });
  });

  tool.addEventListener("click", event => {
    if (event.target.closest("[data-start-diagnosis]")) {
      diagnosisCompletionTracker.reset();
      window.okAnalytics?.diagnosisStart();
      void enterMap();
      return;
    }

    const answer = event.target.closest("[data-question][data-value]");
    if (answer) {
      const step = Number(answer.closest("[data-question-step]").dataset.questionStep);
      clearAfter(step);
      answers[answer.dataset.question] = answer.dataset.value;
      syncPressed();

      if (step < 4) {
        showQuestion(step + 1);
      } else {
        renderResult(calculateOutcome(answers));
        showAct("outcome");
        diagnosisCompletionTracker.complete(currentOutcome);
      }
      return;
    }

    if (event.target.closest("[data-back]") && currentQuestion > 1) {
      showQuestion(currentQuestion - 1);
      return;
    }

    if (event.target.closest("[data-change-answers]")) {
      showAct("map", false);
      showQuestion(4);
      return;
    }

    if (event.target.closest("[data-show-contact]")) {
      showOutcomePanel("contact");
      return;
    }

    if (event.target.closest("[data-show-result]")) {
      showOutcomePanel("result");
      return;
    }

    if (event.target.closest("[data-restart]")) {
      diagnosisCompletionTracker.reset();
      Object.keys(answers).forEach(key => delete answers[key]);
      syncPressed();
      showQuestion(1);
      showAct("opening");
    }
  });

  /* ---------- formularz kontaktowy na ekranie wyniku ---------- */

  const leadForm = tool.querySelector("[data-result-lead-form]");

  if (leadForm) {
    const leadStatus = leadForm.querySelector("[data-result-lead-status]");
    const leadSubmit = leadForm.querySelector(".result-lead-submit");
    const leadName = leadForm.querySelector("#rl-name");
    const leadEmail = leadForm.querySelector("#rl-email");
    const leadFax = leadForm.querySelector("#rl-fax");
    let leadWidgetId = null;
    let leadSent = false;

    ensureLeadTurnstile = () => {
      if (window.turnstile && leadWidgetId === null) {
        leadWidgetId = window.turnstile.render("#diagnosis-turnstile");
      }
    };

    window.onDiagnosisTurnstileLoad = () => {
      if (currentOutcomePanel === "contact") ensureLeadTurnstile();
    };

    const resetLeadTurnstile = () => {
      if (window.turnstile && leadWidgetId !== null) window.turnstile.reset(leadWidgetId);
    };

    const setLeadStatus = (text, tone) => {
      leadStatus.textContent = text;
      leadStatus.dataset.tone = tone || "";
    };

    // Treść wiadomości powstaje z wyniku diagnozy — użytkownik podaje tylko imię i e-mail.
    const buildLeadMessage = () => {
      const copy = RESULTS[currentOutcome];
      const chosen = ["q1", "q2", "q3", "q4"]
        .map((key, index) => `${index + 1}. ${answers[key] || "—"}`)
        .join("\n");
      return [
        `Zgłoszenie z diagnozy marketingowej.`,
        ``,
        `Wynik: ${copy.title}`,
        `Uzasadnienie: ${copy.why}`,
        ``,
        `Rekomendowane pierwsze kroki:`,
        ...copy.steps.map((step, index) => `${index + 1}) ${step}`),
        ``,
        `Odpowiedzi w diagnozie:`,
        chosen,
      ].join("\n");
    };

    leadForm.addEventListener("submit", async event => {
      event.preventDefault();

      if (leadFax.value) return;
      if (leadSent) return;
      if (!currentOutcome) {
        setLeadStatus("Najpierw ukończ diagnozę.", "error");
        return;
      }

      const name = leadName.value.trim();
      const email = leadEmail.value.trim();

      if (name.length < 3) {
        setLeadStatus("Podaj imię — co najmniej 3 znaki.", "error");
        leadName.focus();
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        setLeadStatus("Podaj poprawny adres e-mail.", "error");
        leadEmail.focus();
        return;
      }

      const turnstileToken = leadForm.querySelector('[name="cf-turnstile-response"]')?.value || "";
      if (!turnstileToken) {
        setLeadStatus("Potwierdź, że formularz wysyła człowiek.", "error");
        return;
      }

      leadSubmit.disabled = true;
      leadSubmit.setAttribute("aria-busy", "true");
      setLeadStatus("Wysyłamy…", "");
      const analyticsEventId = window.okAnalytics?.createMarketingEventId?.() || "";
      const marketingContext = window.okAnalytics?.marketingContext?.() || { marketingConsent: false };

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone: "",
            company: "",
            topic: `Diagnoza: ${RESULTS[currentOutcome].title}`,
            message: buildLeadMessage(),
            fax: "",
            turnstileToken,
            attribution: window.okAnalytics?.attribution?.() || null,
            analyticsEventId,
            ...marketingContext,
          }),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.ok !== true) throw new Error("lead_send_failed");

        leadSent = true;
        leadForm.reset();
        resetLeadTurnstile();
        setLeadStatus("Dziękujemy — odezwiemy się z konkretem.", "success");
        leadForm.querySelectorAll("input, button").forEach(element => { element.disabled = true; });
        window.okAnalytics?.generateLead("diagnosis", analyticsEventId, { email });
      } catch {
        resetLeadTurnstile();
        setLeadStatus("Nie udało się wysłać. Napisz na hello@okagency.pl albo spróbuj z formularza kontaktowego.", "error");
      } finally {
        if (!leadSent) {
          leadSubmit.disabled = false;
          leadSubmit.removeAttribute("aria-busy");
        }
      }
    });
  }
})();
