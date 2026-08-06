(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const motionPaused = () => reduce || window.OKAgencyMotion?.isPaused();
  const fine = matchMedia("(pointer: fine)").matches;

  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
    window.setTimeout(() => document.body.classList.add("is-settled"), motionPaused() ? 0 : 1400);
  }));

  // delikatny paralaks sceny
  if (fine && !motionPaused()) {
    const img = document.querySelector(".scene img");
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    const tick = () => {
      cx += (tx - cx) * .05;
      cy += (ty - cy) * .05;
      img.style.translate = `${(-cx * 10).toFixed(2)}px ${(-cy * 8).toFixed(2)}px`;
      if (Math.abs(tx - cx) > .001 || Math.abs(ty - cy) > .001) raf = requestAnimationFrame(tick);
      else raf = null;
    };
    addEventListener("pointermove", e => {
      tx = e.clientX / innerWidth - .5;
      ty = e.clientY / innerHeight - .5;
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  }

  // formularz
  const CONTACT_EMAIL = "hello@okagency.pl";
  const form = document.getElementById("contact-form");
  const validationSummary = document.getElementById("validation-summary");
  const handoffState = document.getElementById("handoff-state");
  const fallbackState = document.getElementById("fallback-state");
  const handoffTitle = document.getElementById("handoff-title");
  const fallbackTitle = document.getElementById("fallback-title");
  const contextNote = document.getElementById("context-note");
  const contextNoteTitle = document.getElementById("context-note-title");
  const contextNoteCopy = document.getElementById("context-note-copy");
  let turnstileWidgetId = null;

  window.onContactTurnstileLoad = () => {
    turnstileWidgetId = window.turnstile.render("#contact-turnstile");
  };

  const resetTurnstile = () => {
    if (window.turnstile && turnstileWidgetId !== null) {
      window.turnstile.reset(turnstileWidgetId);
    }
  };
  const directBlock = document.getElementById("contact-direct");
  const fields = {
    name: document.getElementById("f-name"),
    email: document.getElementById("f-email"),
    topic: document.getElementById("f-topic"),
    message: document.getElementById("f-message"),
    consent: document.getElementById("f-consent"),
  };

  const contextMap = new Map([
    ["web", "Strona internetowa"],
    ["website", "Strona internetowa"],
    ["social", "Social media"],
    ["campaign", "Kampania płatna"],
    ["diagnosis", "Diagnoza / uporządkowanie problemu"],
    ["site-audit", "Strona internetowa"],
    ["process", "Proces współpracy"],
    ["about", "Inny temat"],
    ["conversation", "Diagnoza / uporządkowanie problemu"],
    ["none", "Inny temat"],
  ]);
  const params = new URLSearchParams(window.location.search);
  const context = params.get("context") || "";
  const source = params.get("source") || "";
  const mappedTopic = contextMap.get(context);

  if (mappedTopic) fields.topic.value = mappedTopic;

  if (source === "diagnosis" || source === "site-audit") {
    if (contextNoteTitle) {
      contextNoteTitle.textContent = source === "site-audit"
        ? "Przechodzisz z audytu WWW"
        : "Wracasz z Diagnozy";
    }
    contextNoteCopy.textContent = source === "site-audit"
      ? "Temat ustawiliśmy na podstawie wyniku audytu WWW. Możesz go zmienić."
      : mappedTopic
        ? "Temat ustawiliśmy na podstawie rekomendowanego kierunku. Możesz go zmienić."
        : "Wybierz temat, z którym chcesz przejść dalej.";
    contextNote.hidden = false;
    directBlock.classList.add("has-context");
  }

  const rules = {
    name: {
      errorId: "e-name",
      isValid: () => fields.name.value.trim().length >= 3,
    },
    email: {
      errorId: "e-email",
      isValid: () => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.value.trim()),
    },
    topic: {
      errorId: "e-topic",
      isValid: () => Boolean(fields.topic.value),
    },
    message: {
      errorId: "e-message",
      isValid: () => fields.message.value.trim().length >= 10,
    },
    consent: {
      errorId: "e-consent",
      isValid: () => fields.consent.checked,
    },
  };

  const setErrorDescription = (field, errorId, hasError) => {
    const ids = new Set((field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
    if (hasError) ids.add(errorId);
    else ids.delete(errorId);
    if (ids.size) field.setAttribute("aria-describedby", [...ids].join(" "));
    else field.removeAttribute("aria-describedby");
  };

  const validateField = key => {
    const field = fields[key];
    const rule = rules[key];
    const valid = rule.isValid();
    const wrap = field.closest(".field") || document.getElementById("consent-wrap");
    wrap.classList.toggle("is-invalid", !valid);
    setErrorDescription(field, rule.errorId, !valid);
    if (valid) field.removeAttribute("aria-invalid");
    else field.setAttribute("aria-invalid", "true");
    return valid;
  };

  let submitted = false;

  const updateValidationSummary = count => {
    if (!count) {
      validationSummary.hidden = true;
      validationSummary.textContent = "";
      return;
    }
    validationSummary.textContent = count === 1
      ? "Sprawdź 1 zaznaczone pole."
      : `Sprawdź ${count} zaznaczonych pól.`;
    validationSummary.hidden = false;
  };

  Object.entries(fields).forEach(([key, field]) => {
    ["input", "change", "blur"].forEach(eventName => {
      field.addEventListener(eventName, () => {
        if (!submitted) return;
        validateField(key);
        updateValidationSummary(form.querySelectorAll(".is-invalid").length);
      });
    });
  });

  const showState = (state, heading) => {
    form.hidden = true;
    handoffState.hidden = state !== handoffState;
    fallbackState.hidden = state !== fallbackState;
    state.hidden = false;
    heading.focus({ preventScroll: false });
  };

  const returnToForm = () => {
    handoffState.hidden = true;
    fallbackState.hidden = true;
    form.hidden = false;
    document.getElementById("copy-feedback").textContent = "";
    fields.name.focus({ preventScroll: false });
  };

  document.querySelectorAll("[data-return-to-form]").forEach(button => {
    button.addEventListener("click", returnToForm);
  });

  const copyFeedback = document.getElementById("copy-feedback");
  document.getElementById("copy-address").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
    } catch (error) {
      const copyField = document.createElement("textarea");
      copyField.value = CONTACT_EMAIL;
      copyField.setAttribute("readonly", "");
      copyField.style.position = "fixed";
      copyField.style.opacity = "0";
      document.body.appendChild(copyField);
      copyField.select();
      document.execCommand("copy");
      copyField.remove();
    }
    copyFeedback.textContent = "Adres skopiowany.";
  });

  form.addEventListener("submit", async e => {
    e.preventDefault();

    if (document.getElementById("f-fax").value) return;

    submitted = true;
    const results = Object.keys(fields).map(key => ({
      key,
      valid: validateField(key),
    }));
    const invalid = results.filter(result => !result.valid);

    if (invalid.length) {
      updateValidationSummary(invalid.length);
      fields[invalid[0].key].focus({ preventScroll: false });
      return;
    }

    updateValidationSummary(0);

    const turnstileToken = form.querySelector('[name="cf-turnstile-response"]')?.value || "";
    if (!turnstileToken) {
      validationSummary.textContent = "Potwierdź, że formularz wysyła człowiek.";
      validationSummary.hidden = false;
      document.getElementById("contact-turnstile").scrollIntoView({ block: "center" });
      return;
    }

    const v = id => document.getElementById(id).value.trim();
    const submitButton = form.querySelector(".submit");
    const email = v("f-email");
    const phone = v("f-phone");
    const analyticsEventId = window.okAnalytics?.createMarketingEventId?.() || "";
    const marketingContext = window.okAnalytics?.marketingContext?.() || { marketingConsent: false };
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: v("f-name"),
          email,
          phone,
          company: v("f-company"),
          topic: fields.topic.value,
          message: v("f-message"),
          fax: v("f-fax"),
          turnstileToken,
          attribution: window.okAnalytics?.attribution?.() || null,
          analyticsEventId,
          ...marketingContext,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) throw new Error("contact_send_failed");

      form.reset();
      resetTurnstile();
      showState(handoffState, handoffTitle);
      window.okAnalytics?.generateLead("contact", analyticsEventId, { email, phone });
    } catch {
      resetTurnstile();
      showState(fallbackState, fallbackTitle);
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
    }
  });

  // miękkie wyjście przy nawigacji
  if (!motionPaused()) {
    let routing = false;
    document.addEventListener("click", e => {
      const a = e.target.closest("a[href]");
      if (!a || routing) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === "_blank") return;
      const href = a.getAttribute("href");
      if (!href || /^(?:https?:|mailto:|tel:|#)/i.test(href)) return;
      const target = new URL(href, location.href);
      if (target.origin !== location.origin) return;
      e.preventDefault();
      routing = true;
      document.body.classList.add("is-leaving");
      setTimeout(() => { location.href = target.href; }, 300);
    });
  }
})();
