(() => {
  "use strict";

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const motionPaused = () => (
    reducedMotion.matches || window.OKAgencyMotion?.isPaused()
  );

  const calloutSelector = ".annotation-callout, .annotation";
  const disclosureSelector = ".proof-item, .accordion-item";

  const calloutLine = callout => {
    const frame = callout.closest(".campaign-frame, .social-frame, .process-frame");
    const key = callout.dataset.annotation;
    return key ? frame?.querySelector(`[data-line="${key}"]`) : null;
  };

  const syncCallout = (callout, open) => {
    const dot = callout.querySelector(".annotation-dot");
    const copy = callout.querySelector(".annotation-copy");

    callout.classList.toggle("is-open", open);
    dot?.setAttribute("aria-expanded", String(open));
    copy?.removeAttribute("hidden");
    copy?.setAttribute("aria-hidden", String(!open));
    calloutLine(callout)?.classList.toggle("is-open", open);
  };

  const closeCallout = callout => {
    delete callout.dataset.preview;
    callout.dataset.pinned = "false";
    syncCallout(callout, false);
  };

  const closeAllCallouts = except => {
    document.querySelectorAll(calloutSelector).forEach(callout => {
      if (callout !== except) closeCallout(callout);
    });
  };

  const openCallout = (callout, { preview = false } = {}) => {
    closeAllCallouts(callout);
    if (preview) callout.dataset.preview = "true";
    else callout.dataset.pinned = "true";
    syncCallout(callout, true);
  };

  document.querySelectorAll(calloutSelector).forEach(callout => {
    const dot = callout.querySelector(".annotation-dot");
    const copy = callout.querySelector(".annotation-copy");
    if (!dot || !copy) return;

    callout.dataset.pinned = String(callout.classList.contains("is-open"));
    syncCallout(callout, callout.classList.contains("is-open"));

    let closeTimer = 0;
    const cancelClose = () => clearTimeout(closeTimer);
    const previewOpen = () => {
      if (callout.dataset.pinned === "true") return;
      openCallout(callout, { preview: true });
    };
    const queueClose = () => {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        if (callout.dataset.pinned !== "true" && !callout.matches(":focus-within")) {
          closeCallout(callout);
        }
      }, motionPaused() ? 0 : 140);
    };

    dot.addEventListener("pointerenter", previewOpen);
    dot.addEventListener("pointerleave", queueClose);
    dot.addEventListener("focus", previewOpen);
    dot.addEventListener("blur", queueClose);
    dot.addEventListener("click", event => {
      event.stopPropagation();
      const shouldOpen = callout.dataset.pinned !== "true";
      closeAllCallouts();
      if (shouldOpen) openCallout(callout);
    });

    copy.addEventListener("pointerenter", cancelClose);
    copy.addEventListener("pointerleave", queueClose);
  });

  const disclosureParts = item => ({
    trigger: item.querySelector(".proof-trigger, .accordion-trigger"),
    panel: item.querySelector(".proof-detail, .accordion-detail"),
  });

  const syncDisclosure = (item, open, { initial = false } = {}) => {
    const { trigger, panel } = disclosureParts(item);
    item.classList.toggle("is-open", open);
    trigger?.setAttribute("aria-expanded", String(open));
    if (!panel) return;

    if (open) {
      panel.hidden = false;
      panel.setAttribute("aria-hidden", "false");
      return;
    }

    panel.setAttribute("aria-hidden", "true");
    const hide = () => {
      if (!item.classList.contains("is-open")) panel.hidden = true;
    };
    if (initial || motionPaused()) hide();
    else setTimeout(hide, 380);
  };

  document.querySelectorAll(disclosureSelector).forEach(item => {
    const { trigger } = disclosureParts(item);
    if (!trigger) return;
    syncDisclosure(item, item.classList.contains("is-open"), { initial: true });

    trigger.addEventListener("click", () => {
      const shouldOpen = trigger.getAttribute("aria-expanded") !== "true";
      item.closest(".proof-list, .accordion")
        ?.querySelectorAll(disclosureSelector)
        .forEach(row => syncDisclosure(row, false));
      if (shouldOpen) syncDisclosure(item, true);
    });
  });

  document.querySelectorAll(".mobile-details").forEach(group => {
    group.querySelectorAll("details").forEach(detail => {
      detail.addEventListener("toggle", () => {
        if (!detail.open) return;
        group.querySelectorAll("details").forEach(sibling => {
          if (sibling !== detail) sibling.open = false;
        });
      });
    });
  });

  addEventListener("pointerdown", event => {
    if (!event.target.closest(calloutSelector)) closeAllCallouts();
  });

  addEventListener("keydown", event => {
    if (event.key === "Escape") closeAllCallouts();
  });
})();
