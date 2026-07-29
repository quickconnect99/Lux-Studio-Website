import { expect, test } from "@playwright/test";

const allowMutations = process.env.E2E_ALLOW_CMS_MUTATIONS === "true";
const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

test("@cms-mutation authenticated site settings can be saved and restored", async ({
  page,
  viewport
}) => {
  test.skip(viewport?.width !== 1440, "Run the mutation test once.");
  test.skip(
    !allowMutations || !email || !password,
    "Requires an isolated Supabase test project and explicit mutation opt-in."
  );

  await page.goto("/admin");
  await page.getByPlaceholder("Admin email").fill(email!);
  await page.getByPlaceholder("Password").fill(password!);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page.getByText(email!)).toBeVisible();

  await page.getByRole("tab", { name: /Site Settings/ }).click();
  const seoTitle = page.getByLabel("SEO title");
  const originalTitle = await seoTitle.inputValue();
  const temporaryTitle = `${originalTitle} E2E`;

  try {
    await seoTitle.fill(temporaryTitle);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Site settings saved")).toBeVisible();
  } finally {
    await seoTitle.fill(originalTitle);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Site settings saved")).toBeVisible();
  }
});
