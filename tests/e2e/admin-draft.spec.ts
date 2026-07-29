import { expect, test } from "@playwright/test";
import { SITE_SETTINGS_DRAFT_STORAGE_KEY } from "../../lib/admin-site-settings-draft";

test("site settings text draft survives a reload", async ({
  page,
  viewport
}) => {
  test.skip(viewport?.width !== 1440, "Run draft recovery once.");

  const response = await page.goto("/admin");
  test.skip(!response?.ok(), "Admin is disabled in this environment.");

  await page.getByRole("tab", { name: /Site Settings/ }).click();
  const seoTitle = page.getByLabel("SEO title");
  const originalTitle = await seoTitle.inputValue();
  await seoTitle.fill(`${originalTitle} draft`);

  await expect
    .poll(() =>
      page.evaluate(
        (key) => Boolean(localStorage.getItem(key)),
        SITE_SETTINGS_DRAFT_STORAGE_KEY
      )
    )
    .toBe(true);

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("tab", { name: /Site Settings/ }).click();
  await expect(page.getByLabel("SEO title")).toHaveValue(
    `${originalTitle} draft`
  );

  await page.getByRole("button", { name: "Reset Settings" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset settings", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        (key) => localStorage.getItem(key),
        SITE_SETTINGS_DRAFT_STORAGE_KEY
      )
    )
    .toBeNull();
});
