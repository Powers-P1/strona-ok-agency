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

  /* Short phones cannot keep the approved introduction permanently expanded
   * beside four proof rows. Build one extra disclosure from the existing lead
   * node so the copy remains available without creating a second content source. */
  document.querySelectorAll(".proof-content").forEach((content, index) => {
    const lead = content.querySelector(":scope > .proof-lead");
    const list = content.querySelector(":scope > .proof-list");
    if (!lead || !list || list.querySelector(":scope > .proof-context-item")) return;

    const item = document.createElement("article");
    const trigger = document.createElement("button");
    const indexSlot = document.createElement("span");
    const label = document.createElement("span");
    const title = document.createElement("strong");
    const hint = document.createElement("small");
    const icon = document.createElement("span");
    const panel = document.createElement("div");
    const paragraph = document.createElement("p");
    const panelId = `proof-context-${location.pathname.replace(/\W+/g, "-")}-${index + 1}`;

    item.className = "proof-item proof-context-item";
    trigger.className = "proof-trigger";
    trigger.type = "button";
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", panelId);
    indexSlot.className = "proof-index";
    indexSlot.setAttribute("aria-hidden", "true");
    label.className = "proof-label";
    title.textContent = "Kontekst";
    hint.textContent = "Założenia sekcji";
    icon.className = "proof-icon";
    icon.setAttribute("aria-hidden", "true");
    panel.className = "proof-detail";
    panel.id = panelId;
    panel.hidden = true;
    paragraph.textContent = lead.textContent.trim();

    label.append(title, hint);
    trigger.append(indexSlot, label, icon);
    panel.append(paragraph);
    item.append(trigger, panel);
    list.prepend(item);
  });

  const syncDisclosure = (item, open, { initial = false, immediate = false } = {}) => {
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
    if (initial || immediate || motionPaused()) hide();
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
      const compactViewport = matchMedia("(min-width: 821px) and (max-height: 730px)").matches;
      item.closest(".proof-list, .accordion")
        ?.querySelectorAll(disclosureSelector)
        .forEach(row => syncDisclosure(row, false, { immediate: compactViewport }));
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
    const detailsRows = [...group.querySelectorAll(":scope > details")];
    detailsRows.forEach(row => {
      row.querySelector(":scope > summary")?.addEventListener("click", () => {
        detailsRows.forEach(sibling => {
          if (sibling !== row) sibling.open = false;
        });
      });
      row.addEventListener("toggle", () => {
        if (!row.open) return;
        detailsRows.forEach(sibling => {
          if (sibling !== row) sibling.open = false;
        });
      });
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
