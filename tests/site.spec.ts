import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "compact", width: 1024, height: 768 },
  { name: "mobile", width: 390, height: 844 },
];

const collectConsoleErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
};

test("renders the business offer and primary navigation without runtime errors", async ({
  page,
}) => {
  const consoleErrors = collectConsoleErrors(page);

  await page.goto("./");

  await expect(page).toHaveTitle(/OK Agency/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Marketing, który pomaga małym firmom rosnąć online.",
  );
  await expect(
    page.getByRole("heading", { name: "Dwa obszary. Jeden spójny kierunek." }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Poznaj zakres współpracy" }).click();
  await expect(page).toHaveURL(/#uslugi$/);
  await expect(page.locator("#uslugi")).toBeInViewport();

  expect(consoleErrors).toEqual([]);
});

test("all on-page links resolve to real targets", async ({ page }) => {
  await page.goto("./");

  const hrefs = await page
    .locator("a[href]")
    .evaluateAll((links) =>
      links
        .map((link) => link.getAttribute("href"))
        .filter((href): href is string => Boolean(href)),
    );

  for (const href of hrefs) {
    if (href.startsWith("#")) {
      await expect(page.locator(href)).toHaveCount(1);
    }
  }
});

test("metadata assets use the custom production domain", async ({ page }) => {
  await page.goto("./");

  await expect(page.locator('link[rel="icon"]')).toHaveAttribute("href", "/favicon.svg");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://okagency.pl/og-image.png",
  );
});

test("mobile menu opens, remains keyboard accessible and closes after navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./");

  const toggle = page.locator("[data-menu-toggle]");
  await expect(toggle).toHaveAccessibleName("Otwórz menu");
  await toggle.focus();
  await expect(toggle).toBeFocused();
  await toggle.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(toggle).toHaveAccessibleName("Zamknij menu");

  await page.locator("header").getByRole("link", { name: "Jak działamy", exact: true }).click();
  await expect(page).toHaveURL(/#jak-dzialamy$/);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("layout has no horizontal overflow at required viewports", async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("./");

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));

    expect(dimensions.scrollWidth, viewport.name).toBeLessThanOrEqual(dimensions.clientWidth);
  }
});

test("passes automated accessibility checks", async ({ page }) => {
  await page.goto("./");

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test("respects reduced motion and captures required visual evidence", async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("./");

    const scrollBehavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(scrollBehavior).toBe("auto");

    await page.screenshot({
      path: path.resolve(`docs/screenshots/${viewport.name}.png`),
      fullPage: true,
    });
  }
});
