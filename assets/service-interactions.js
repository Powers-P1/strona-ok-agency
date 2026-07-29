const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

const closeCallout = callout => {
  callout.classList.remove("is-open");
  callout.querySelector(".annotation-dot")?.setAttribute("aria-expanded", "false");
  const frame = callout.closest(".campaign-frame, .social-frame");
  const line = frame?.querySelector(`[data-line="${callout.dataset.annotation}"]`);
  line?.classList.remove("is-open");
};

const openCallout = callout => {
  document.querySelectorAll(".annotation-callout.is-open").forEach(active => {
    if (active !== callout) closeCallout(active);
  });

  callout.classList.add("is-open");
  callout.querySelector(".annotation-dot")?.setAttribute("aria-expanded", "true");
  const frame = callout.closest(".campaign-frame, .social-frame");
  const line = frame?.querySelector(`[data-line="${callout.dataset.annotation}"]`);
  line?.classList.add("is-open");
};

document.querySelectorAll(".annotation-callout").forEach(callout => {
  const dot = callout.querySelector(".annotation-dot");
  const copy = callout.querySelector(".annotation-copy");
  if (!dot || !copy) return;

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

const closeProofItem = item => {
  const trigger = item.querySelector(".proof-trigger");
  const detail = item.querySelector(".proof-detail");

  item.classList.remove("is-open");
  trigger?.setAttribute("aria-expanded", "false");

  if (!detail) return;
  const hideDetail = () => {
    if (!item.classList.contains("is-open")) detail.hidden = true;
  };

  if (reducedMotion.matches) {
    hideDetail();
  } else {
    setTimeout(hideDetail, 360);
  }
};

const openProofItem = item => {
  document.querySelectorAll(".proof-item.is-open").forEach(active => {
    if (active !== item) closeProofItem(active);
  });

  const trigger = item.querySelector(".proof-trigger");
  const detail = item.querySelector(".proof-detail");
  if (detail) detail.hidden = false;

  requestAnimationFrame(() => {
    item.classList.add("is-open");
    trigger?.setAttribute("aria-expanded", "true");
  });
};

document.querySelectorAll(".proof-item").forEach(item => {
  const trigger = item.querySelector(".proof-trigger");
  if (!trigger) return;

  trigger.addEventListener("click", () => {
    if (item.classList.contains("is-open")) {
      closeProofItem(item);
    } else {
      openProofItem(item);
    }
  });
});

addEventListener("pointerdown", event => {
  if (event.target.closest(".annotation-callout")) return;
  document.querySelectorAll(".annotation-callout.is-open").forEach(closeCallout);
});

addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  document.querySelectorAll(".annotation-callout.is-open").forEach(closeCallout);
});
