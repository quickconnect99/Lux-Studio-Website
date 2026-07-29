import { expect, test } from "@playwright/test";

test("home page visual shell remains stable", async ({ page, viewport }) => {
  test.skip(viewport?.width !== 1440, "Keep a single visual baseline.");

  await page.goto("/");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page).toHaveScreenshot("home-shell.png", {
    animations: "disabled",
    fullPage: false,
    mask: [page.locator("video"), page.locator("img")],
    maxDiffPixelRatio: 0.01
  });
});
