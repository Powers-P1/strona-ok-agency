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
      primary: ["Umów rozmowę", "/kontakt?context=conversation&source=diagnosis"],
      secondary: ["Zobacz proces", "/proces?from=diagnosis"]
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

  window.OKAgencyDiagnosis = Object.freeze({ calculateOutcome });

  const tool = document.querySelector("[data-diagnosis-tool]");
  if (!tool) return;

  const frames = Array.from(tool.querySelectorAll("[data-act]"));
  const questions = Array.from(tool.querySelectorAll("[data-question-step]"));
  const announcer = tool.querySelector("[data-diagnosis-announcer]");
  const resultTitle = tool.querySelector("#result-title");
  const resultWhy = tool.querySelector("[data-result-why]");
  const resultSteps = Array.from(tool.querySelectorAll("[data-result-step]"));
  const resultPrimary = tool.querySelector("[data-result-primary]");
  const resultSecondary = tool.querySelector("[data-result-secondary]");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const answers = {};
  let currentQuestion = 1;

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

  const setResultLink = (anchor, data) => {
    anchor.setAttribute("href", data[1]);
    anchor.querySelector("span").textContent = data[0];
  };

  const renderResult = outcome => {
    const copy = RESULTS[outcome];
    resultTitle.textContent = copy.title;
    resultWhy.textContent = copy.why;
    resultSteps.forEach((item, index) => { item.textContent = copy.steps[index]; });
    setResultLink(resultPrimary, copy.primary);
    setResultLink(resultSecondary, copy.secondary);
    if (announcer) announcer.textContent = `Wynik diagnozy: ${copy.title}`;
  };

  tool.addEventListener("click", event => {
    if (event.target.closest("[data-start-diagnosis]")) {
      showAct("map", false);
      showQuestion(1);
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
        window.okAnalytics?.diagnoza();
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

    if (event.target.closest("[data-restart]")) {
      Object.keys(answers).forEach(key => delete answers[key]);
      syncPressed();
      showQuestion(1);
      showAct("opening");
    }
  });

  const closeCallout = callout => {
    callout.classList.remove("is-open");
    callout.querySelector(".annotation-dot")?.setAttribute("aria-expanded", "false");
    callout.querySelector(".annotation-copy")?.setAttribute("aria-hidden", "true");
    callout.closest(".diagnosis-frame")
      ?.querySelector(`[data-line="${callout.dataset.annotation}"]`)
      ?.classList.remove("is-open");
  };

  const openCallout = callout => {
    tool.querySelectorAll(".annotation-callout.is-open").forEach(active => {
      if (active !== callout) closeCallout(active);
    });
    callout.classList.add("is-open");
    callout.querySelector(".annotation-dot")?.setAttribute("aria-expanded", "true");
    callout.querySelector(".annotation-copy")?.setAttribute("aria-hidden", "false");
    callout.closest(".diagnosis-frame")
      ?.querySelector(`[data-line="${callout.dataset.annotation}"]`)
      ?.classList.add("is-open");
  };

  tool.querySelectorAll(".annotation-callout").forEach(callout => {
    const dot = callout.querySelector(".annotation-dot");
    const copy = callout.querySelector(".annotation-copy");
    copy.setAttribute(
      "aria-hidden",
      String(!callout.classList.contains("is-open")),
    );
    let closeTimer;
    const cancelClose = () => clearTimeout(closeTimer);
    const queueClose = () => {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        if (!callout.matches(":focus-within") && !copy.matches(":hover")) closeCallout(callout);
      }, 140);
    };
    dot.addEventListener("pointerenter", () => openCallout(callout));
    dot.addEventListener("pointerleave", queueClose);
    dot.addEventListener("focus", () => openCallout(callout));
    dot.addEventListener("blur", queueClose);
    dot.addEventListener("click", event => {
      event.stopPropagation();
      openCallout(callout);
    });
    copy.addEventListener("pointerenter", cancelClose);
    copy.addEventListener("pointerleave", queueClose);
  });

  addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    tool.querySelectorAll(".annotation-callout.is-open").forEach(closeCallout);
  });
})();
