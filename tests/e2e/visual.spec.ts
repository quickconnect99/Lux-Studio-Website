import { expect, test } from "@playwright/test";

test("home page visual funnel remains stable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");

  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page).toHaveScreenshot("home-shell.png", {
    animations: "disabled",
    fullPage: true,
    mask: [page.locator("video"), page.locator("img")],
    maxDiffPixelRatio: 0.01
  });
});

test("mobile navigation visual state remains stable", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");

  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page).toHaveScreenshot("mobile-navigation.png", {
    animations: "disabled",
    fullPage: false,
    mask: [page.locator("img")],
    maxDiffPixelRatio: 0.01
  });
});
