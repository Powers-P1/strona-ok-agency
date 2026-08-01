(() => {
  "use strict";

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const motionPaused = () => (
    reducedMotion.matches || window.OKAgencyMotion?.isPaused()
  );

  const calloutSelector = ".annotation-callout, .annotation";
  const disclosureSelector = ".proof-item, .accordion-item";

  const calloutLine = callout => {
    const frame = callout.closest(
      ".campaign-frame, .social-frame, .process-frame, .diagnosis-frame, .about-page .scene",
    );
    const key = callout.dataset.annotation;
    return key ? frame?.querySelector(`[data-line="${key}"]`) : null;
  };

  const syncCallout = (callout, open) => {
    const dot = callout.querySelector(".annotation-dot");
    const copy = callout.querySelector(".annotation-copy");
    const wasOpen = callout.classList.contains("is-open");

    callout.classList.toggle("is-open", open);
    dot?.setAttribute("aria-expanded", String(open));
    copy?.removeAttribute("hidden");
    copy?.setAttribute("aria-hidden", String(!open));
    calloutLine(callout)?.classList.toggle("is-open", open);

    if (wasOpen !== open) {
      window.dispatchEvent(new CustomEvent("okagency:annotationchange", {
        detail: { callout, open },
      }));
    }
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

  const closeWithin = root => {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll(calloutSelector).forEach(closeCallout);
  };

  window.OKAgencyAnnotations = Object.freeze({
    close: callout => {
      if (callout?.matches?.(calloutSelector)) closeCallout(callout);
    },
    closeAll: () => closeAllCallouts(),
    closeWithin,
    isOpen: callout => Boolean(callout?.classList?.contains("is-open")),
    open: callout => {
      if (callout?.matches?.(calloutSelector)) openCallout(callout);
    },
  });

  document.querySelectorAll(calloutSelector).forEach(callout => {
    const dot = callout.querySelector(".annotation-dot");
    const copy = callout.querySelector(".annotation-copy");
    if (!dot || !copy) return;

    // Callouty są wskazówkami na żądanie. Każda podstrona zaczyna od
    // identycznego, zamkniętego stanu niezależnie od klas w HTML.
    callout.dataset.pinned = "false";
    syncCallout(callout, false);

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
      const scrollHost = document.scrollingElement;
      const scrollPosition = scrollHost?.scrollTop;
      const shouldOpen = trigger.getAttribute("aria-expanded") !== "true";
      item.closest(".proof-list, .accordion")
        ?.querySelectorAll(disclosureSelector)
        .forEach(row => syncDisclosure(row, false));
      if (shouldOpen) syncDisclosure(item, true);

      // Expanding a later row can make browser scroll anchoring move the whole
      // full-viewport scene. Preserve the user's current frame while the
      // disclosure state changes; focus remains on the activated trigger.
      if (scrollHost && Number.isFinite(scrollPosition)) {
        const restoreFrame = () => {
          const drift = Math.abs(scrollHost.scrollTop - scrollPosition);
          if (document.activeElement === trigger && drift < innerHeight / 2) {
            const previousBehavior = scrollHost.style.scrollBehavior;
            scrollHost.style.scrollBehavior = "auto";
            scrollHost.scrollTop = scrollPosition;
            scrollHost.style.scrollBehavior = previousBehavior;
          }
        };
        requestAnimationFrame(() => {
          restoreFrame();
          requestAnimationFrame(() => {
            restoreFrame();
          });
        });
        setTimeout(restoreFrame, 420);
      }
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
