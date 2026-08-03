import { spawn } from "node:child_process";
import { createServer } from "node:net";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DESKTOP_VIEWPORTS = [
  { width: 1024, height: 768, name: "1024 sanity" },
  { width: 1440, height: 900, name: "1440 sanity" },
  { width: 2560, height: 1440, name: "2K" },
  { width: 3840, height: 2160, name: "4K" },
  { width: 7680, height: 4320, name: "8K" },
];
const MOBILE_VIEWPORT = { width: 390, height: 844, name: "390 mobile smoke" };
const SERVICE_PROOFS = [
  { route: "/strony-internetowe", scene: "#web-proof", name: "WWW proof" },
  { route: "/social-media", scene: "#social-signals", name: "Social proof" },
  { route: "/proces", scene: "#process-proof", name: "Process proof" },
];
const MOBILE_ROUTES = [
  ...SERVICE_PROOFS.map(({ route }) => route),
  "/o-nas",
  "/dostepnosc",
];
const EPSILON = 2;
const failures = [];
let managedServer = null;

const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const viewportLabel = viewport => `${viewport.name} (${viewport.width}x${viewport.height})`;
const fontRoleCheck = (metrics, role, label) => {
  metrics.forEach(({ selector, size }) => {
    check(
      size + .75 >= role,
      `${label}: ${selector} is ${size}px, below the semantic control role ${role}px`,
    );
  });
};
const textRoleCheck = (metrics, role, label) => {
  metrics.forEach(({ selector, size }) => {
    check(
      size + .75 >= role,
      `${label}: ${selector} is ${size}px, below its semantic role ${role}px`,
    );
  });
};

const availablePort = () => new Promise((resolvePort, reject) => {
  const probe = createServer();
  probe.once("error", reject);
  probe.listen(0, "127.0.0.1", () => {
    const address = probe.address();
    probe.close(() => resolvePort(address.port));
  });
});

const resolveBaseUrl = async () => {
  if (process.argv[2]) return process.argv[2];

  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  managedServer = spawn(
    process.execPath,
    ["server.mjs", "--host", "127.0.0.1", "--port", String(port)],
    { cwd: ROOT, stdio: "ignore" },
  );

  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return baseUrl;
    } catch {
      // The local static server may still be starting.
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 100));
  }

  throw new Error(`Desktop component audit server did not start at ${baseUrl}`);
};

const frames = page => page.evaluate(() => new Promise(resolveFrame => {
  requestAnimationFrame(() => requestAnimationFrame(resolveFrame));
}));

const waitForStablePage = async page => {
  await page.waitForLoadState("domcontentloaded");
  await page.evaluate(async () => {
    await document.fonts?.ready;
  });
  await frames(page);
};

const semanticRoles = page => page.evaluate(() => {
  const measure = role => {
    const probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    probe.style.cssText = [
      "position:fixed",
      "left:-10000px",
      "visibility:hidden",
      "pointer-events:none",
      `font-size:var(--ok-type-${role})`,
    ].join(";");
    document.body.append(probe);
    const value = Number.parseFloat(getComputedStyle(probe).fontSize);
    probe.remove();
    return value;
  };
  const roles = {
    content: measure("content"),
    label: measure("label"),
    control: measure("control"),
    displayCard: measure("display-card"),
  };
  return roles;
});

const openFirstDisclosure = async (page, sceneSelector, triggerSelector) => {
  const trigger = page.locator(`${sceneSelector} ${triggerSelector}:visible`).first();
  await trigger.waitFor({ state: "visible" });
  const panelId = await trigger.getAttribute("aria-controls");
  const expanded = await trigger.getAttribute("aria-expanded");
  if (expanded !== "true") await trigger.click();
  await page.waitForFunction(
    ({ scene, selector, controlledPanel }) => {
      const control = [...document.querySelectorAll(`${scene} ${selector}`)]
        .find(element => element.getAttribute("aria-controls") === controlledPanel);
      return control?.getAttribute("aria-expanded") === "true"
        && controlledPanel
        && document.getElementById(controlledPanel)?.hidden === false;
    },
    { scene: sceneSelector, selector: triggerSelector, controlledPanel: panelId },
  );
  await frames(page);
};

const auditServiceProof = async (page, baseUrl, viewport, proof) => {
  const label = `${proof.name}, ${viewportLabel(viewport)}`;
  await page.goto(new URL(proof.route, baseUrl).href, { waitUntil: "domcontentloaded" });
  await waitForStablePage(page);
  await page.locator(proof.scene).scrollIntoViewIfNeeded();
  await page.locator(proof.scene).evaluate(element => element.scrollIntoView({ block: "start" }));
  await frames(page);
  await openFirstDisclosure(page, proof.scene, ".proof-trigger");
  const roles = await semanticRoles(page);
  const metrics = await page.locator(proof.scene).evaluate((scene, epsilon) => {
    const visible = element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none"
        && style.visibility !== "hidden"
        && Number(style.opacity) > .01
        && rect.width > 0
        && rect.height > 0;
    };
    const rect = element => {
      const bounds = element.getBoundingClientRect();
      return { top: bounds.top, right: bounds.right, bottom: bounds.bottom, left: bounds.left };
    };
    const fontMetrics = selector => [...scene.querySelectorAll(selector)]
      .filter(visible)
      .map(element => ({ selector, size: Number.parseFloat(getComputedStyle(element).fontSize) }));
    const openItem = scene.querySelector(".proof-item.is-open");
    const detail = openItem?.querySelector(".proof-detail:not([hidden])");
    const nextTrigger = openItem?.nextElementSibling?.querySelector(".proof-trigger");
    const sceneRect = rect(scene);
    const actionRects = [...scene.querySelectorAll(".proof-actions, .proof-primary, .proof-secondary")]
      .filter(visible)
      .map(element => ({ selector: `.${element.classList[0]}`, ...rect(element) }));
    const documentElement = document.documentElement;
    return {
      panel: detail ? {
        clientHeight: detail.clientHeight,
        scrollHeight: detail.scrollHeight,
        bottom: rect(detail).bottom,
      } : null,
      nextTriggerTop: nextTrigger ? rect(nextTrigger).top : null,
      sceneRect,
      actionRects,
      controls: fontMetrics(".proof-primary, .proof-secondary"),
      labels: fontMetrics(".proof-trigger .proof-label strong"),
      content: fontMetrics(".proof-trigger .proof-label small, .proof-detail p"),
      horizontalOverflow: documentElement.scrollWidth - documentElement.clientWidth,
      nestedSceneScroll: /(auto|scroll)/.test(getComputedStyle(scene).overflowY)
        && scene.scrollHeight > scene.clientHeight + epsilon,
    };
  }, EPSILON);

  check(Boolean(metrics.panel), `${label}: first disclosure did not expose a panel`);
  if (metrics.panel) {
    check(
      metrics.panel.scrollHeight <= metrics.panel.clientHeight + EPSILON,
      `${label}: disclosure clips ${metrics.panel.scrollHeight - metrics.panel.clientHeight}px`,
    );
    if (metrics.nextTriggerTop !== null) {
      check(
        metrics.panel.bottom <= metrics.nextTriggerTop + EPSILON,
        `${label}: open detail overlaps the next trigger by ${(metrics.panel.bottom - metrics.nextTriggerTop).toFixed(1)}px`,
      );
    }
  }
  metrics.actionRects.forEach(action => {
    check(
      action.top >= metrics.sceneRect.top - EPSILON
        && action.bottom <= metrics.sceneRect.bottom + EPSILON,
      `${label}: ${action.selector} leaves the scene (${action.top.toFixed(1)}–${action.bottom.toFixed(1)} vs ${metrics.sceneRect.top.toFixed(1)}–${metrics.sceneRect.bottom.toFixed(1)})`,
    );
  });
  fontRoleCheck(metrics.controls, roles.control, label);
  textRoleCheck(metrics.labels, roles.label, label);
  textRoleCheck(metrics.content, roles.content, label);
  check(metrics.horizontalOverflow <= EPSILON, `${label}: horizontal overflow ${metrics.horizontalOverflow}px`);
  check(!metrics.nestedSceneScroll, `${label}: proof scene creates a nested vertical scroller`);
};

const auditAbout = async (page, baseUrl, viewport) => {
  const baseLabel = `About, ${viewportLabel(viewport)}`;
  await page.goto(new URL("/o-nas#about-model", baseUrl).href, { waitUntil: "domcontentloaded" });
  await waitForStablePage(page);
  await page.waitForFunction(() => document.querySelector("#about-model")?.classList.contains("is-active"));
  await page.locator("#about-model").evaluate(element => element.scrollIntoView({ block: "start" }));
  await frames(page);
  const roles = await semanticRoles(page);
  const model = await page.locator("#about-model").evaluate((scene, epsilon) => {
    const visible = element => {
      const style = getComputedStyle(element);
      const bounds = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && bounds.width > 0 && bounds.height > 0;
    };
    const bounds = element => element.getBoundingClientRect();
    const sceneRect = bounds(scene);
    const copyRect = bounds(scene.querySelector(".copy-panel"));
    const actionRect = bounds(scene.querySelector(".actions"));
    const fonts = selector => [...document.querySelectorAll(selector)].filter(visible).map(element => ({
      selector,
      size: Number.parseFloat(getComputedStyle(element).fontSize),
    }));
    const clippedRows = [...scene.querySelectorAll(".model-points li")]
      .filter(visible)
      .map((element, index) => ({
        index: index + 1,
        vertical: element.scrollHeight - element.clientHeight,
        horizontal: element.scrollWidth - element.clientWidth,
      }))
      .filter(row => row.vertical > epsilon || row.horizontal > epsilon);
    return {
      scene: { top: sceneRect.top, bottom: sceneRect.bottom },
      copy: { top: copyRect.top, bottom: copyRect.bottom },
      actions: { top: actionRect.top, bottom: actionRect.bottom },
      chips: fonts("#about-responsibility .chips li"),
      labels: fonts("#about-model .model-points strong"),
      content: fonts("#about-model .model-points .row-content > span"),
      controls: fonts("#about-model .text-link"),
      clippedRows,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  }, EPSILON);

  check(model.copy.top >= model.scene.top - EPSILON && model.copy.bottom <= model.scene.bottom + EPSILON,
    `${baseLabel} model: copy panel leaves its scene`);
  check(model.actions.top >= model.scene.top - EPSILON && model.actions.bottom <= model.scene.bottom + EPSILON,
    `${baseLabel} model: actions leave their scene`);
  check(model.clippedRows.length === 0, `${baseLabel} model: clipped rows ${JSON.stringify(model.clippedRows)}`);
  textRoleCheck(model.chips, roles.label, `${baseLabel} responsibility chips`);
  textRoleCheck(model.labels, roles.label, `${baseLabel} model`);
  textRoleCheck(model.content, roles.content, `${baseLabel} model`);
  fontRoleCheck(model.controls, roles.control, `${baseLabel} model`);
  check(model.horizontalOverflow <= EPSILON, `${baseLabel} model: horizontal overflow ${model.horizontalOverflow}px`);

  await page.evaluate(() => {
    location.hash = "about-credibility";
  });
  await page.waitForFunction(() => document.querySelector("#about-credibility")?.classList.contains("is-active"));
  await page.locator("#about-credibility").evaluate(element => element.scrollIntoView({ block: "start" }));
  await frames(page);
  await openFirstDisclosure(page, "#about-credibility", ".accordion-trigger");
  const credibility = await page.locator("#about-credibility").evaluate((scene, epsilon) => {
    const visible = element => {
      const style = getComputedStyle(element);
      const bounds = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && bounds.width > 0 && bounds.height > 0;
    };
    const rect = element => element.getBoundingClientRect();
    const fonts = selector => [...scene.querySelectorAll(selector)].filter(visible).map(element => ({
      selector,
      size: Number.parseFloat(getComputedStyle(element).fontSize),
    }));
    const sceneRect = rect(scene);
    const copyRect = rect(scene.querySelector(".copy-panel"));
    const actionsRect = rect(scene.querySelector(".actions"));
    const openItem = scene.querySelector(".accordion-item.is-open");
    const detail = openItem?.querySelector(".accordion-detail:not([hidden])");
    const nextTrigger = openItem?.nextElementSibling?.querySelector(".accordion-trigger");
    return {
      scene: { top: sceneRect.top, bottom: sceneRect.bottom },
      copy: { top: copyRect.top, bottom: copyRect.bottom },
      actions: { top: actionsRect.top, bottom: actionsRect.bottom },
      panel: detail ? {
        clientHeight: detail.clientHeight,
        scrollHeight: detail.scrollHeight,
        bottom: rect(detail).bottom,
      } : null,
      nextTriggerTop: nextTrigger ? rect(nextTrigger).top : null,
      labels: fonts(".accordion-label strong"),
      content: fonts(".accordion-label small, .accordion-detail p"),
      controls: fonts(".primary-cta, .primary-cta span, .text-link"),
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      nestedSceneScroll: /(auto|scroll)/.test(getComputedStyle(scene).overflowY)
        && scene.scrollHeight > scene.clientHeight + epsilon,
    };
  }, EPSILON);

  check(Boolean(credibility.panel), `${baseLabel} credibility: first disclosure did not expose a panel`);
  if (credibility.panel) {
    check(
      credibility.panel.scrollHeight <= credibility.panel.clientHeight + EPSILON,
      `${baseLabel} credibility: disclosure clips ${credibility.panel.scrollHeight - credibility.panel.clientHeight}px`,
    );
    if (credibility.nextTriggerTop !== null) {
      check(
        credibility.panel.bottom <= credibility.nextTriggerTop + EPSILON,
        `${baseLabel} credibility: open detail overlaps the next trigger by ${(credibility.panel.bottom - credibility.nextTriggerTop).toFixed(1)}px`,
      );
    }
  }
  check(
    credibility.copy.top >= credibility.scene.top - EPSILON
      && credibility.copy.bottom <= credibility.scene.bottom + EPSILON,
    `${baseLabel} credibility: copy panel leaves its scene`,
  );
  check(
    credibility.actions.top >= credibility.scene.top - EPSILON
      && credibility.actions.bottom <= credibility.scene.bottom + EPSILON,
    `${baseLabel} credibility: actions leave their scene`,
  );
  textRoleCheck(credibility.labels, roles.label, `${baseLabel} credibility`);
  textRoleCheck(credibility.content, roles.content, `${baseLabel} credibility`);
  fontRoleCheck(credibility.controls, roles.control, `${baseLabel} credibility`);
  check(credibility.horizontalOverflow <= EPSILON, `${baseLabel} credibility: horizontal overflow ${credibility.horizontalOverflow}px`);
  check(!credibility.nestedSceneScroll, `${baseLabel} credibility: scene creates a nested vertical scroller`);

  await page.waitForSelector("#site-footer");
  const footer = await page.locator("#site-footer").evaluate(element => {
    const rect = element.getBoundingClientRect();
    const font = selector => Number.parseFloat(getComputedStyle(element.querySelector(selector)).fontSize);
    return {
      height: rect.height,
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      clientHeight: element.clientHeight,
      scrollHeight: element.scrollHeight,
      description: font(".site-footer__description"),
      heading: font(".site-footer__heading"),
    };
  });
  check(
    footer.height <= Math.max(900, viewport.height * .65),
    `${baseLabel} footer: ${footer.height.toFixed(1)}px is disproportionately tall`,
  );
  check(
    footer.description <= Math.max(31, roles.displayCard) + .75,
    `${baseLabel} footer: description grew to ${footer.description}px (display-card role ${roles.displayCard}px)`,
  );
  check(
    footer.heading <= Math.max(13, roles.control) + .75,
    `${baseLabel} footer: heading grew to ${footer.heading}px (control role ${roles.control}px)`,
  );
  check(footer.scrollWidth <= footer.clientWidth + EPSILON, `${baseLabel} footer: horizontal content is clipped`);
  check(footer.scrollHeight <= footer.clientHeight + EPSILON, `${baseLabel} footer: vertical content is clipped`);
};

const auditLegal = async (page, baseUrl, viewport) => {
  const label = `Standard serwisu, ${viewportLabel(viewport)}`;
  await page.goto(new URL("/dostepnosc", baseUrl).href, { waitUntil: "domcontentloaded" });
  await waitForStablePage(page);
  const roles = await semanticRoles(page);
  const metrics = await page.evaluate(() => {
    const size = selector => Number.parseFloat(getComputedStyle(document.querySelector(selector)).fontSize);
    return {
      body: size("body"),
      lead: size(".privacy-lead"),
      policy: size(".policy-section p"),
      eyebrow: size(".legal-eyebrow"),
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  ["body", "lead", "policy"].forEach(key => {
    check(
      Math.abs(metrics[key] - roles.content) <= .75,
      `${label}: ${key} is ${metrics[key]}px instead of content role ${roles.content}px`,
    );
  });
  check(
    Math.abs(metrics.eyebrow - roles.label) <= .75,
    `${label}: eyebrow is ${metrics.eyebrow}px instead of label role ${roles.label}px`,
  );
  check(metrics.horizontalOverflow <= EPSILON, `${label}: horizontal overflow ${metrics.horizontalOverflow}px`);
};

const auditMobileSmoke = async (page, baseUrl) => {
  for (const route of MOBILE_ROUTES) {
    const label = `${route}, ${viewportLabel(MOBILE_VIEWPORT)}`;
    await page.goto(new URL(route, baseUrl).href, { waitUntil: "domcontentloaded" });
    await waitForStablePage(page);
    const metrics = await page.evaluate(() => {
      const visible = element => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none"
          && style.visibility !== "hidden"
          && Number(style.opacity) > .01
          && rect.width > 1
          && rect.height > 1;
      };
      const sceneSelector = [
        ".campaign-frame",
        ".social-frame",
        ".process-frame",
        ".about-page .scene",
      ].join(",");
      const sceneHeights = [...document.querySelectorAll(sceneSelector)]
        .filter(visible)
        .map(element => ({ id: element.id, height: element.getBoundingClientRect().height }));
      const nestedScrollers = [...document.querySelectorAll("main *")]
        .filter(element => {
          if (!visible(element)) return false;
          const style = getComputedStyle(element);
          return /(auto|scroll)/.test(style.overflowY)
            && element.scrollHeight > element.clientHeight + 2;
        })
        .map(element => `${element.tagName.toLowerCase()}.${[...element.classList].join(".")}`);
      return {
        documentWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        sceneHeights,
        nestedScrollers,
      };
    });
    check(
      metrics.documentWidth <= metrics.clientWidth + EPSILON,
      `${label}: horizontal overflow ${metrics.documentWidth - metrics.clientWidth}px`,
    );
    check(metrics.nestedScrollers.length === 0, `${label}: nested scrollers ${metrics.nestedScrollers.join(", ")}`);
    metrics.sceneHeights.forEach(scene => {
      check(
        Math.abs(scene.height - MOBILE_VIEWPORT.height) <= EPSILON,
        `${label}: scene ${scene.id} is ${scene.height}px instead of ${MOBILE_VIEWPORT.height}px`,
      );
    });
  }
};

let browser;
try {
  const baseUrl = await resolveBaseUrl();
  browser = await chromium.launch({ headless: true });

  for (const viewport of DESKTOP_VIEWPORTS) {
    console.log(`Desktop component audit: ${viewportLabel(viewport)}...`);
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    await context.addInitScript(() => {
      localStorage.setItem("ok-consent", JSON.stringify({
        version: 2,
        level: "denied",
        at: "2026-08-03T00:00:00.000Z",
      }));
    });
    await context.route("**/*", async route => {
      const request = route.request();
      const requestUrl = new URL(request.url());
      if (requestUrl.hostname !== "127.0.0.1") {
        await route.abort();
      } else if (["image", "media"].includes(request.resourceType())) {
        await route.abort();
      } else {
        await route.continue();
      }
    });
    const page = await context.newPage();
    page.setDefaultTimeout(12_000);
    page.setDefaultNavigationTimeout(20_000);
    try {
      for (const proof of SERVICE_PROOFS) {
        await auditServiceProof(page, baseUrl, viewport, proof);
      }
      await auditAbout(page, baseUrl, viewport);
      await auditLegal(page, baseUrl, viewport);
    } catch (error) {
      failures.push(`${viewportLabel(viewport)} runner: ${error.message}`);
    } finally {
      await context.close();
    }
  }

  console.log(`Desktop component audit: ${viewportLabel(MOBILE_VIEWPORT)}...`);
  const mobileContext = await browser.newContext({
    viewport: MOBILE_VIEWPORT,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await mobileContext.addInitScript(() => {
    localStorage.setItem("ok-consent", JSON.stringify({
      version: 2,
      level: "denied",
      at: "2026-08-03T00:00:00.000Z",
    }));
  });
  const mobilePage = await mobileContext.newPage();
  try {
    await auditMobileSmoke(mobilePage, baseUrl);
  } catch (error) {
    failures.push(`${viewportLabel(MOBILE_VIEWPORT)} runner: ${error.message}`);
  } finally {
    await mobileContext.close();
  }
} catch (error) {
  failures.push(`runner: ${error.message}`);
} finally {
  await browser?.close().catch(() => {});
  managedServer?.kill();
}

if (failures.length) {
  console.error(`Desktop system component audit failed with ${failures.length} violation(s):`);
  failures.forEach(message => console.error(`- ${message}`));
  process.exitCode = 1;
} else {
  console.log(
    `Desktop system component audit passed: ${DESKTOP_VIEWPORTS.length} desktop profiles, `
    + `${SERVICE_PROOFS.length} proof components, About model/credibility/footer, `
    + "Standard serwisu typography and one 390px mobile smoke.",
  );
}
