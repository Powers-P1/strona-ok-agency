import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { chromium, webkit } from "playwright";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fullAudit = process.argv.includes("--full");
const captureScreenshots = process.argv.includes("--screenshots");
const engineSmoke = process.argv.includes("--engine-smoke");
const diagnosisShortOnly = process.argv.includes("--diagnosis-short-only");
const browserType = process.argv.includes("--webkit") ? webkit : chromium;
const browserName = browserType === webkit ? "webkit" : "chromium";

const publicRoutes = [
  "/",
  "/menu",
  "/strony-internetowe",
  "/social-media",
  "/kampanie",
  "/diagnoza",
  "/proces",
  "/o-nas",
  "/kontakt",
  "/faq",
  "/polityka-prywatnosci",
  "/dostepnosc",
  "/404",
];

const coreViewports = [
  { width: 1024, height: 768 },
  { width: 1365, height: 1218 },
  { width: 2560, height: 1440 },
  { width: 3840, height: 2160 },
  { width: 7680, height: 4320 },
];

const ratioViewports = [
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
  { width: 2560, height: 1600 },
  { width: 2560, height: 1080 },
  { width: 3440, height: 1440 },
  { width: 3840, height: 1080 },
  { width: 5120, height: 1440 },
  { width: 7680, height: 2160 },
  { width: 1024, height: 1366 },
  { width: 1440, height: 2560 },
  { width: 2160, height: 3840 },
];

const viewportName = viewport => `${viewport.width}x${viewport.height}`;
const expectedContentSize = height => Math.min(48, Math.max(14, height * .0155));
const expectedRoleSize = (height, ratio, floor, ceiling) => (
  Math.min(ceiling, Math.max(floor, height * ratio))
);

const availablePort = () => new Promise((resolvePort, reject) => {
  const server = createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    server.close(() => resolvePort(address.port));
  });
});

const startAuditServer = async () => {
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = spawn(
    process.execPath,
    ["server.mjs", "--host", "127.0.0.1", "--port", String(port)],
    { cwd: projectRoot, stdio: "ignore" },
  );

  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return { baseUrl, server };
    } catch {
      // The local server may still be starting.
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 100));
  }

  server.kill();
  throw new Error(`System scale audit server did not start at ${baseUrl}`);
};

const waitForStablePage = async page => {
  await page.waitForLoadState("domcontentloaded");
  await page.evaluate(async () => {
    await document.fonts?.ready;
    const visibleImages = [...document.images].filter(image => {
      const rect = image.getBoundingClientRect();
      return rect.bottom >= -innerHeight && rect.top <= innerHeight * 2;
    });
    await Promise.race([
      Promise.all(visibleImages.map(image => (
        image.complete
          ? Promise.resolve()
          : new Promise(resolveImage => {
            image.addEventListener("load", resolveImage, { once: true });
            image.addEventListener("error", resolveImage, { once: true });
          })
      ))),
      new Promise(resolveWait => setTimeout(resolveWait, 1500)),
    ]);
  });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        scroll-behavior: auto !important;
      }
    `,
  });
  if (await page.locator(".home-page .hero").count()) {
    await page.waitForFunction(() => (
      Boolean(window.OKAgencyResponsiveSafety)
      && document.querySelector(".hero")?.hasAttribute("data-ok-safe-scene")
    ));
    await page.evaluate(() => window.OKAgencyResponsiveSafety.refresh());
    await page.evaluate(() => new Promise(resolveFrame => (
      requestAnimationFrame(() => requestAnimationFrame(resolveFrame))
    )));
  }
  await page.waitForTimeout(80);
};

const auditDocument = async (page, route, viewport) => {
  const metrics = await page.evaluate(() => {
    const root = document.documentElement;
    const rootStyle = getComputedStyle(root);
    const bodyStyle = getComputedStyle(document.body);
    const visible = element => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none"
        && style.visibility !== "hidden"
        && Number(style.opacity) > .01
        && rect.width > 1
        && rect.height > 1;
    };
    const nestedScrollers = [...document.querySelectorAll("main *")]
      .filter(element => {
        if (!visible(element)) return false;
        const style = getComputedStyle(element);
        return /(auto|scroll)/.test(style.overflowY)
          && element.scrollHeight > element.clientHeight + 2;
      })
      .map(element => ({
        selector: `${element.tagName.toLowerCase()}.${[...element.classList].join(".")}`,
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
      }));
    const sceneSelectors = [
      ".hero",
      ".campaign-frame",
      ".social-frame",
      ".process-frame",
      ".about-page .scene",
      ".diagnosis-story .story-stage",
    ];
    const scenes = [...document.querySelectorAll(sceneSelectors.join(","))]
      .filter(visible)
      .map(element => {
        const rect = element.getBoundingClientRect();
        const copy = element.matches(".hero") ? element.querySelector(".copy") : null;
        const copyRect = copy?.getBoundingClientRect();
        return {
          id: element.id || element.className,
          height: rect.height,
          minHeight: getComputedStyle(element).minHeight,
          maxHeight: getComputedStyle(element).maxHeight,
          requiredHeight: getComputedStyle(element).getPropertyValue("--ok-safe-required-height").trim(),
          copyRect: copyRect
            ? [copyRect.top, copyRect.bottom, copyRect.height].map(Math.round)
            : null,
        };
      });
    return {
      viewport: [innerWidth, innerHeight],
      documentWidth: root.scrollWidth,
      clientWidth: root.clientWidth,
      bodyFont: Number(bodyStyle.fontSize.replace("px", "")),
      contentToken: rootStyle.getPropertyValue("--ok-type-content").trim(),
      nestedScrollers,
      scenes,
    };
  });

  const label = `${route} at ${viewportName(viewport)}`;
  assert.ok(
    metrics.documentWidth <= metrics.clientWidth + 1,
    `${label}: horizontal overflow ${metrics.documentWidth - metrics.clientWidth}px`,
  );
  assert.deepEqual(metrics.nestedScrollers, [], `${label}: nested vertical scroller detected`);
  assert.ok(
    metrics.bodyFont >= expectedContentSize(viewport.height) - .6,
    `${label}: body font ${metrics.bodyFont}px is below the shared ${expectedContentSize(viewport.height).toFixed(2)}px role`,
  );
  const resolvedContentToken = Number(metrics.contentToken.replace("px", ""));
  assert.ok(
    /clamp\(.+1\.55vh.+48px\)/.test(metrics.contentToken)
      || Math.abs(resolvedContentToken - expectedContentSize(viewport.height)) <= .6,
    `${label}: route replaced the shared content role (${metrics.contentToken})`,
  );
  for (const scene of metrics.scenes) {
    assert.ok(
      Math.abs(scene.height - viewport.height) <= 2,
      `${label}: scene ${scene.id} is ${scene.height}px instead of one ${viewport.height}px viewport; ${JSON.stringify(scene)}`,
    );
  }
};

const createAuditPage = async (browser, viewport) => {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await context.addInitScript(() => {
    localStorage.setItem("ok-consent", JSON.stringify({
      version: 1,
      granted: false,
      at: "2026-08-03T00:00:00.000Z",
    }));
  });
  await context.route("**/*", async route => {
    const requestUrl = new URL(route.request().url());
    if (requestUrl.hostname === "127.0.0.1") await route.continue();
    else await route.abort();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(12_000);
  page.setDefaultNavigationTimeout(20_000);
  return { context, page };
};

const auditAllRoutes = async (browser, baseUrl) => {
  const viewports = fullAudit
    ? coreViewports
    : engineSmoke
      ? coreViewports.slice(0, 3)
      : coreViewports.slice(0, 4);
  for (const viewport of viewports) {
    console.log(`System scale: public routes ${viewportName(viewport)}...`);
    const { context, page } = await createAuditPage(browser, viewport);
    try {
      for (const route of publicRoutes) {
        await page.goto(new URL(route, baseUrl).href, { waitUntil: "domcontentloaded" });
        await waitForStablePage(page);
        await auditDocument(page, route, viewport);
      }
    } finally {
      await context.close();
    }
  }
};

const homeState = page => page.evaluate(() => {
  const hero = document.querySelector(".hero");
  const rig = document.querySelector(".image-rig");
  const image = document.querySelector(".sculpture");
  const copy = document.querySelector(".copy");
  const rigStyle = getComputedStyle(rig);
  const imageRect = image.getBoundingClientRect();
  const copyRect = copy.getBoundingClientRect();
  const copyHeading = copy.querySelector("h1");
  const descriptor = copy.querySelector(".descriptor");
  return {
    mode: hero.dataset.okSafeMobileHero || "desktop",
    compactProfile: document.documentElement.getAttribute("data-ok-nav-compact"),
    viewportWidth: innerWidth,
    source: image.currentSrc.split("/").at(-1),
    scale: rigStyle.scale,
    transform: rigStyle.transform,
    imageRect: [imageRect.x, imageRect.y, imageRect.width, imageRect.height].map(Math.round),
    copyRect: [copyRect.x, copyRect.y, copyRect.width, copyRect.height].map(Math.round),
    copyBottom: Math.round(copyRect.bottom),
    headingSize: getComputedStyle(copyHeading).fontSize,
    descriptorSize: getComputedStyle(descriptor).fontSize,
    copyMaxWidth: getComputedStyle(copy).maxWidth,
    viewportHeight: innerHeight,
  };
});

const auditHomeRatiosAndResize = async (browser, baseUrl) => {
  console.log("System scale: home art direction and resize matrix...");
  const { context, page } = await createAuditPage(browser, { width: 1365, height: 1218 });
  const waitForProfile = compact => page.waitForFunction((expectedCompact) => {
    const image = document.querySelector(".sculpture");
    const source = image?.currentSrc || "";
    const profile = document.documentElement.getAttribute("data-ok-nav-compact");
    const rootStyle = getComputedStyle(document.documentElement);
    const contentRole = Number(rootStyle.getPropertyValue("--ok-type-content").replace("px", ""));
    const expectedContentRole = Math.min(48, Math.max(14, innerHeight * .0155));
    const descriptorRole = Number(
      getComputedStyle(document.querySelector(".copy .descriptor")).fontSize.replace("px", ""),
    );
    const labelRole = Number(
      getComputedStyle(document.querySelector(".copy .scene-label")).fontSize.replace("px", ""),
    );
    const controlRole = Number(
      getComputedStyle(document.querySelector(".copy .cta")).fontSize.replace("px", ""),
    );
    const expectedLabelRole = Math.min(32, Math.max(12, innerHeight * .012));
    const expectedControlRole = Math.min(42, Math.max(15, innerHeight * .0145));
    const typeScaleIsCurrent = Math.abs(contentRole - expectedContentRole) <= .6
      && Math.abs(descriptorRole - expectedContentRole) <= .6
      && Math.abs(labelRole - expectedLabelRole) <= .6
      && Math.abs(controlRole - expectedControlRole) <= .6;
    return expectedCompact
      ? /scene-compact-v2/.test(source) && profile === "tall" && typeScaleIsCurrent
      : !/compact|mobile/.test(source) && profile === null && typeScaleIsCurrent;
  }, compact);
  try {
    await page.goto(new URL("/", baseUrl).href, { waitUntil: "domcontentloaded" });
    await waitForStablePage(page);
    await waitForProfile(true);
    const compactBefore = await homeState(page);
    assert.equal(compactBefore.mode, "compact", "1365x1218 must use the compact 4:3 art direction");
    assert.match(compactBefore.source, /scene-compact-v2/, "1365x1218 loaded the wrong home artwork");
    assert.equal(compactBefore.scale, "none", "compact home artwork must not be compositor-scaled");
    assert.equal(compactBefore.transform, "none", "compact home artwork must not be transformed");
    assert.ok(compactBefore.copyBottom < 1218, "1365x1218 home copy leaves the first viewport");

    await page.setViewportSize({ width: 1920, height: 1080 });
    await waitForProfile(false);
    const desktop = await homeState(page);
    assert.doesNotMatch(desktop.source, /compact|mobile/, "1920x1080 kept a compact home artwork");

    await page.setViewportSize({ width: 1365, height: 1218 });
    await waitForProfile(true);
    /* WebKit on Windows can stall while waitForFunction repeatedly forces
     * layout across a picture-source switch. Use one quiet window and one
     * terminal measurement; the assertion below still proves history-free
     * geometry without turning the audit itself into a source of instability. */
    await page.waitForTimeout(browserName === "webkit" ? 2200 : 160);
    const compactAfter = await homeState(page);
    const visualHomeState = ({ mode: _mode, ...state }) => state;
    assert.deepEqual(
      visualHomeState(compactAfter),
      visualHomeState(compactBefore),
      "home art direction depends on resize history",
    );

    const matrix = fullAudit
      ? ratioViewports
      : engineSmoke
        ? []
        : ratioViewports.slice(0, 8);
    for (const viewport of matrix) {
      await page.setViewportSize(viewport);
      await page.waitForFunction(({ width, height }) => {
        const root = document.documentElement;
        const viewportToken = Number(
          getComputedStyle(root).getPropertyValue("--ok-viewport-height-runtime").replace("px", ""),
        );
        const heroHeight = document.querySelector(".hero").getBoundingClientRect().height;
        return innerWidth === width
          && innerHeight === height
          && Math.abs(viewportToken - height) <= 1
          && Math.abs(heroHeight - height) <= 2;
      }, viewport);
      await auditDocument(page, "/ (resize)", viewport);
      const state = await homeState(page);
      assert.ok(state.copyBottom < viewport.height + 2, `${viewportName(viewport)} home copy is clipped`);
      if (viewport.width <= 1180 || viewport.width / viewport.height <= 4 / 3) {
        assert.match(state.source, /compact|mobile/, `${viewportName(viewport)} missed compact/portrait art direction`);
        assert.equal(state.scale, "none", `${viewportName(viewport)} compositor-scales the full home plate`);
      }
    }

    if (captureScreenshots) {
      const output = resolve(projectRoot, "..", "..", ".tmp", "system-scale-visuals");
      await mkdir(output, { recursive: true });
      await page.setViewportSize({ width: 1365, height: 1218 });
      await waitForProfile(true);
      await page.locator(".sculpture").evaluate(async image => {
        if (typeof image.decode !== "function") return;
        await image.decode().catch(() => {});
      });
      await page.evaluate(() => new Promise(resolveFrame => (
        requestAnimationFrame(() => requestAnimationFrame(resolveFrame))
      )));
      await page.screenshot({ path: join(output, `${browserName}-home-1365x1218.png`) });
    }
  } finally {
    await context.close();
  }
};

const auditDiagnosisScale = async (browser, baseUrl) => {
  console.log("System scale: Diagnosis semantic type through 8K...");
  const viewports = engineSmoke
    ? [
        { width: 2560, height: 1440 },
      ]
    : fullAudit
    ? [
        { width: 2560, height: 1440 },
        { width: 3840, height: 2160 },
        { width: 7680, height: 4320 },
        { width: 2560, height: 1080 },
        { width: 7680, height: 2160 },
      ]
    : [
        { width: 2560, height: 1440 },
        { width: 3840, height: 2160 },
        { width: 7680, height: 4320 },
      ];

  for (const viewport of viewports) {
    const { context, page } = await createAuditPage(browser, viewport);
    try {
      await page.goto(new URL("/diagnoza", baseUrl).href, { waitUntil: "domcontentloaded" });
      await waitForStablePage(page);
      await page.locator("[data-start-diagnosis]").click();
      await page.waitForFunction(() => {
        const map = document.querySelector("#diagnosis-map");
        const art = map?.querySelector(".campaign-art");
        return map?.classList.contains("is-active")
          && art?.complete
          && art.naturalWidth > 0;
      });
      await page.locator("#diagnosis-map .campaign-art").evaluate(async art => {
        if (typeof art.decode !== "function") return;
        await art.decode().catch(() => {});
      });
      await page.waitForTimeout(120);
      for (let step = 1; step <= 4; step += 1) {
        const metrics = await page.evaluate(() => {
          const size = selector => Number(getComputedStyle(document.querySelector(selector)).fontSize.replace("px", ""));
          const rect = selector => {
            const bounds = document.querySelector(selector).getBoundingClientRect();
            return { top: bounds.top, right: bounds.right, bottom: bounds.bottom, left: bounds.left };
          };
          const activeQuestion = document.querySelector(".quiz-question.is-active");
          const answerRows = [...activeQuestion.querySelectorAll(".answers button")];
          const backControl = activeQuestion.querySelector(".quiz-back");
          const questionContentBottom = Math.max(
            ...answerRows.map(row => row.getBoundingClientRect().bottom),
            backControl?.getBoundingClientRect().bottom || 0,
          );
          return {
            step: Number(activeQuestion.dataset.questionStep),
            body: size("body"),
            mapHeading: size(".map-intro h2"),
            mapLead: size(".map-intro p"),
            question: size(".quiz-question.is-active h3"),
            answer: size(".quiz-question.is-active .answers span"),
            mapBackground: getComputedStyle(document.querySelector("#diagnosis-map")).backgroundColor,
            interfaceRect: rect(".map-interface"),
            sceneRect: rect("#diagnosis-map"),
            shellRect: rect(".quiz-shell"),
            privacyRect: rect(".quiz-privacy"),
            questionContentBottom,
            smallestAnswerRow: Math.min(...answerRows.map(row => row.getBoundingClientRect().height)),
            horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          };
        });
        const label = `Diagnosis ${viewportName(viewport)} question ${step}`;
        assert.equal(metrics.step, step, `${label}: wrong active question`);
        assert.ok(metrics.body >= expectedContentSize(viewport.height) - .6, `${label}: body role is too small`);
        assert.ok(metrics.mapLead >= expectedContentSize(viewport.height) - .6, `${label}: map lead bypasses content role`);
        assert.ok(metrics.answer >= expectedContentSize(viewport.height) - .6, `${label}: answer bypasses content role`);
        assert.equal(metrics.mapBackground, "rgb(7, 26, 44)", `${label}: dark map has no dark loading fallback`);
        assert.ok(
          metrics.mapHeading >= expectedRoleSize(viewport.height, .078, 58, 320) - .8,
          `${label}: map heading bypasses section role`,
        );
        assert.ok(
          metrics.question >= expectedRoleSize(viewport.height, .047, 28, 192) - .8,
          `${label}: question bypasses question role`,
        );
        assert.ok(metrics.interfaceRect.left >= -1, `${label}: interface leaves the left viewport edge`);
        assert.ok(metrics.interfaceRect.right <= viewport.width + 1, `${label}: interface leaves the right viewport edge`);
        assert.ok(metrics.interfaceRect.top >= -1, `${label}: interface leaves the top viewport edge`);
        assert.ok(metrics.interfaceRect.bottom <= viewport.height + 2, `${label}: interface is clipped at the scene bottom`);
        assert.ok(
          metrics.privacyRect.top >= metrics.questionContentBottom + 2,
          `${label}: privacy note overlaps the answer controls by ${(metrics.questionContentBottom - metrics.privacyRect.top).toFixed(1)}px`,
        );
        assert.ok(
          metrics.shellRect.bottom >= metrics.questionContentBottom - 1,
          `${label}: active question leaves the natural question stack`,
        );
        assert.ok(
          metrics.smallestAnswerRow >= expectedRoleSize(viewport.height, .0375, 46, 150) - 1,
          `${label}: answer row ${metrics.smallestAnswerRow}px bypasses the shared interactive-row role`,
        );
        assert.ok(metrics.horizontalOverflow <= 1, `${label}: horizontal overflow ${metrics.horizontalOverflow}px`);

        if (step < 4) {
          await page.locator(`.quiz-question.is-active [data-question="q${step}"]`).first().click();
          await page.waitForFunction(nextStep => (
            Number(document.querySelector(".quiz-question.is-active")?.dataset.questionStep) === nextStep
          ), step + 1);
        }
      }

      if (captureScreenshots && viewport.width <= 3840) {
        const output = resolve(projectRoot, "..", "..", ".tmp", "system-scale-visuals");
        await mkdir(output, { recursive: true });
        await page.screenshot({ path: join(output, `${browserName}-diagnosis-${viewportName(viewport)}.png`) });
      }
    } finally {
      await context.close();
    }
  }

  /* A failed lazy artwork must degrade to the semantic dark fallback instead
   * of leaving the start action permanently disabled after the error event. */
  const { context, page } = await createAuditPage(browser, { width: 2560, height: 1440 });
  try {
    await page.route("**/diagnosis-art-map-v1.webp*", route => route.abort());
    await page.goto(new URL("/diagnoza", baseUrl).href, { waitUntil: "domcontentloaded" });
    await waitForStablePage(page);
    await page.locator("#diagnosis-map .campaign-art").evaluate(art => { art.loading = "eager"; });
    await page.waitForFunction(() => {
      const art = document.querySelector("#diagnosis-map .campaign-art");
      return art?.complete && art.naturalWidth === 0;
    });
    await page.evaluate(() => document.querySelector("[data-start-diagnosis]")?.click());
    await page.waitForFunction(() => document.querySelector("#diagnosis-map")?.classList.contains("is-active"));
    const startState = await page.locator("[data-start-diagnosis]").evaluate(button => ({
      disabled: button.disabled,
      busy: button.hasAttribute("aria-busy"),
    }));
    assert.deepEqual(startState, { disabled: false, busy: false }, "Diagnosis failed art locks the start action");
  } finally {
    await context.close();
  }
};

const auditDiagnosisShortDesktop = async (browser, baseUrl) => {
  console.log("System scale: Diagnosis short desktop composition...");
  const viewport = { width: 1366, height: 600 };
  const { context, page } = await createAuditPage(browser, viewport);
  try {
    await page.goto(new URL("/diagnoza", baseUrl).href, { waitUntil: "domcontentloaded" });
    await waitForStablePage(page);
    await page.locator("[data-start-diagnosis]").click();
    await page.waitForFunction(() => document.querySelector("#diagnosis-map")?.classList.contains("is-active"));
    await page.waitForTimeout(500);

    for (let step = 1; step <= 4; step += 1) {
      const metrics = await page.evaluate(() => {
        const activeQuestion = document.querySelector(".quiz-question.is-active");
        const answerRows = [...activeQuestion.querySelectorAll(".answers button")];
        const backControl = activeQuestion.querySelector(".quiz-back");
        const controls = [...answerRows, backControl].filter(control => control?.getClientRects().length);
        const rect = element => element.getBoundingClientRect();
        const interfaceRect = rect(document.querySelector(".map-interface"));
        const privacyRect = rect(document.querySelector(".quiz-privacy"));
        return {
          step: Number(activeQuestion.dataset.questionStep),
          mapHeading: Number.parseFloat(getComputedStyle(document.querySelector(".map-intro h2")).fontSize),
          question: Number.parseFloat(getComputedStyle(activeQuestion.querySelector("h3")).fontSize),
          interfaceTop: interfaceRect.top,
          interfaceBottom: interfaceRect.bottom,
          privacyTop: privacyRect.top,
          controlsBottom: Math.max(...controls.map(control => rect(control).bottom)),
          smallestAnswerRow: Math.min(...answerRows.map(row => rect(row).height)),
          horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        };
      });
      const label = `Diagnosis 1366x600 question ${step}`;
      assert.equal(metrics.step, step, `${label}: wrong active question`);
      assert.ok(metrics.mapHeading <= 32.5, `${label}: compact map heading was overridden (${metrics.mapHeading}px)`);
      assert.ok(metrics.question <= 31.5, `${label}: compact question heading was overridden (${metrics.question}px)`);
      assert.ok(metrics.interfaceTop >= 81 && metrics.interfaceTop <= 83, `${label}: compact interface top is ${metrics.interfaceTop}px`);
      assert.ok(metrics.interfaceBottom <= viewport.height + 1, `${label}: interface is clipped at ${metrics.interfaceBottom}px`);
      assert.ok(metrics.privacyTop >= metrics.controlsBottom + 2, `${label}: privacy note overlaps controls`);
      assert.ok(metrics.smallestAnswerRow >= 39, `${label}: answer row is too short (${metrics.smallestAnswerRow}px)`);
      assert.ok(metrics.horizontalOverflow <= 1, `${label}: horizontal overflow ${metrics.horizontalOverflow}px`);

      if (step < 4) {
        await page.locator(`.quiz-question.is-active [data-question="q${step}"]`).first().click();
        await page.waitForFunction(nextStep => (
          Number(document.querySelector(".quiz-question.is-active")?.dataset.questionStep) === nextStep
        ), step + 1);
      }
    }
  } finally {
    await context.close();
  }
};

const { baseUrl, server } = await startAuditServer();
const browser = await browserType.launch({ headless: true });

try {
  if (diagnosisShortOnly) {
    await auditDiagnosisShortDesktop(browser, baseUrl);
  } else {
    await auditAllRoutes(browser, baseUrl);
    await auditHomeRatiosAndResize(browser, baseUrl);
    await auditDiagnosisScale(browser, baseUrl);
    await auditDiagnosisShortDesktop(browser, baseUrl);
  }
} finally {
  await browser.close();
  server.kill();
}

if (diagnosisShortOnly) {
  console.log(`OK: Diagnoza ${browserName} — kompaktowa kompozycja 1366x600.`);
} else {
  console.log(
    `OK: system skali ${browserName} — ${publicRoutes.length} tras, `
    + `${fullAudit ? coreViewports.length : engineSmoke ? 3 : coreViewports.length - 1} bazowych viewportów, `
    + `${engineSmoke ? "profile 4:3/16:9" : "proporcje 4:3–32:9"}, resize oraz typografia Diagnozy do ${engineSmoke ? "2K" : "8K"}`
    + `${fullAudit ? ", także pion" : ""}.`,
  );
}
