import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const publicRoutes = [
  "/",
  "/work",
  "/services",
  "/about",
  "/contact",
  "/impressum",
  "/datenschutz",
  "/work/midnight-aeroline"
];
const themes = ["gpt-vintage", "vintage-light"] as const;

async function applyTheme(page: Page, theme: (typeof themes)[number]) {
  await page.evaluate((nextTheme) => {
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }, theme);
}

async function expectNoWcagViolations(page: Page, context: string) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  expect(
    results.violations,
    `${context}: ${results.violations
      .map((violation) => `${violation.id} (${violation.nodes.length})`)
      .join(", ")}`
  ).toEqual([]);
}

test("public pages meet automated WCAG A/AA checks in both themes", async ({
  page
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-1440",
    "Run one deterministic desktop audit."
  );

  await page.emulateMedia({ reducedMotion: "reduce" });

  for (const theme of themes) {
    for (const route of publicRoutes) {
      await page.goto(route);
      await applyTheme(page, theme);
      await expectNoWcagViolations(page, `${route} (${theme})`);
    }
  }
});

test("interactive light-theme states meet WCAG A/AA checks", async ({
  page
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-1440",
    "Run interactive states once."
  );
  await page.emulateMedia({ reducedMotion: "reduce" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await applyTheme(page, "vintage-light");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expectNoWcagViolations(page, "open mobile navigation");

  await page.goto("/contact");
  await applyTheme(page, "vintage-light");
  await page.locator('button[type="submit"]').click();
  await expectNoWcagViolations(page, "inquiry validation errors");

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/work/midnight-aeroline");
  await applyTheme(page, "vintage-light");
  await page.locator("[data-project-carousel-open]").click();
  await expectNoWcagViolations(page, "project lightbox");

  await page.goto("/admin");
  await applyTheme(page, "vintage-light");
  await expectNoWcagViolations(page, "admin workspace");
});
