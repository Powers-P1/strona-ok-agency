import process from "node:process";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ROUTES = [
  "/",
  "/menu",
  "/strony-internetowe",
  "/social-media",
  "/kampanie",
  "/diagnoza",
  "/proces",
  "/o-nas",
  "/kontakt",
  "/polityka-prywatnosci",
  "/dostepnosc",
  "/faq",
  "/404.html",
];
const VIEWPORTS = [
  { width: 320, height: 568, stacked: true },
  { width: 560, height: 700, stacked: false },
];
const BUTTON_LABELS = ["Odrzuć", "Tylko analityka", "Analityka i reklamy"];
const failures = [];
let managedServer = null;

const availablePort = () => new Promise((resolve, reject) => {
  const server = createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const address = server.address();
    server.close(() => resolve(address.port));
  });
});

const resolveBaseUrl = async () => {
  if (process.argv[2]) return process.argv[2].replace(/\/$/, "");
  const port = await availablePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  managedServer = spawn(
    process.execPath,
    ["server.mjs", "--host", "127.0.0.1", "--port", String(port)],
    { cwd: ROOT, stdio: "ignore" },
  );
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return baseUrl;
    } catch {
      // Serwer może potrzebować kilku obrotów pętli zdarzeń.
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Consent QA server did not start at ${baseUrl}`);
};

const inspectBanner = page => page.evaluate(expectedLabels => {
  const dialog = document.querySelector(".ok-consent");
  const actions = dialog?.querySelector(".ok-consent__actions");
  const buttons = [...(dialog?.querySelectorAll(".ok-consent__button") || [])];
  const dialogRect = dialog?.getBoundingClientRect();
  const actionStyle = actions ? getComputedStyle(actions) : null;
  const buttonRects = buttons.map(button => button.getBoundingClientRect());
  const labels = buttons.map(button => button.textContent.trim());
  const rows = new Set(buttonRects.map(rect => Math.round(rect.top)));
  const inside = Boolean(dialogRect) && buttonRects.every(rect => (
    rect.left >= dialogRect.left - 1
    && rect.right <= dialogRect.right + 1
    && rect.left >= -1
    && rect.right <= innerWidth + 1
  ));
  return {
    actionWrap: actionStyle?.flexWrap || "",
    buttons: buttonRects.length,
    dialogInsideViewport: Boolean(dialogRect)
      && dialogRect.left >= -1
      && dialogRect.right <= innerWidth + 1
      && dialogRect.top >= -1
      && dialogRect.bottom <= innerHeight + 1,
    inside,
    labels,
    labelsMatch: JSON.stringify(labels) === JSON.stringify(expectedLabels),
    noHorizontalOverflow: document.documentElement.scrollWidth <= innerWidth + 1,
    rows: rows.size,
  };
}, BUTTON_LABELS);

let browser;
try {
  const baseUrl = await resolveBaseUrl();
  browser = await chromium.launch({ headless: true });

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport });
    await context.addInitScript(() => {
      localStorage.removeItem("ok-consent");
      sessionStorage.removeItem("ok-attribution");
    });
    const page = await context.newPage();
    await page.route("**/*", route => {
      const type = route.request().resourceType();
      return type === "image" || type === "media" ? route.abort() : route.continue();
    });

    for (const route of ROUTES) {
      const errors = [];
      const onPageError = error => errors.push(error.message);
      page.on("pageerror", onPageError);
      await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded", timeout: 30_000 });
      await page.locator(".ok-consent").waitFor({ state: "visible", timeout: 10_000 });
      const result = await inspectBanner(page);
      page.off("pageerror", onPageError);

      const issues = [];
      if (errors.length) issues.push(`JavaScript errors: ${errors.join(" | ")}`);
      if (result.buttons !== 3 || !result.labelsMatch) {
        issues.push(`missing or reordered consent actions: ${JSON.stringify(result.labels)}`);
      }
      if (!result.inside || !result.dialogInsideViewport) issues.push("dialog or action clipped outside viewport");
      if (!result.noHorizontalOverflow) issues.push("document creates horizontal overflow");
      if (result.actionWrap !== "wrap") issues.push(`actions use flex-wrap: ${result.actionWrap || "unset"}`);
      if (viewport.stacked && result.rows !== 3) issues.push(`expected 3 stacked rows, got ${result.rows}`);
      if (issues.length) failures.push(`${route} @ ${viewport.width}x${viewport.height}: ${issues.join("; ")}`);
    }

    await context.close();
  }
} finally {
  await browser?.close();
  managedServer?.kill();
}

if (failures.length) {
  console.error(`Consent responsive audit failed:\n- ${failures.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(`Consent responsive audit passed for ${ROUTES.length} routes × ${VIEWPORTS.length} viewports.`);
}
