import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.route("**/*", (route) => {
    if (["GET", "HEAD", "OPTIONS"].includes(route.request().method()))
      return route.continue();
    return route.abort();
  });
});

test("every home inquiry CTA opens contact", async ({ page }) => {
  await page.goto("/");
  const actions = page.getByRole("link", {
    name: "Start A Project",
    exact: true
  });
  await expect(actions).toHaveCount(2);
  for (const action of await actions.all())
    await expect(action).toHaveAttribute("href", "/contact");
});

test("related work applies real project categories and unknown categories stay empty", async ({
  page
}) => {
  await page.goto("/services");
  const links = await page
    .getByRole("link", { name: "Related Work", exact: true })
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("href"))
    );
  expect(links).toHaveLength(4);
  for (const href of links) {
    await page.goto(href!, { waitUntil: "networkidle" });
    await expect(page.locator("[data-work-result-status]")).toContainText(
      " in "
    );
    const count = await page.locator("[data-work-project]").count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(7);
  }
  await page.goto("/work?category=Missing%20category");
  await expect(page.locator("[data-work-project]")).toHaveCount(0);
  await page
    .getByRole("button", { name: "View Full Portfolio", exact: true })
    .click();
  await expect(page.locator("[data-work-project]")).toHaveCount(7);
});

test("contact fields appear in the first mobile viewport and success has a focused confirmation", async ({
  page
}) => {
  await page.goto("/contact?service=Brand%20Campaign");
  const name = page.locator('[data-inquiry-field="name"]');
  await expect(name).toBeVisible();
  const box = await name.boundingBox();
  expect(box!.y + box!.height).toBeLessThan(844);
  await name.fill("GUI test");
  await page
    .getByRole("textbox", { name: "Email", exact: true })
    .fill("gui@example.invalid");
  await page
    .locator('[data-inquiry-field="brief"]')
    .fill("A local interface test for campaign film production and stills.");
  await page.waitForTimeout(3600);
  await page.route("**/api/inquiries", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "Please try again." })
    })
  );
  await page.getByRole("button", { name: "Send Inquiry", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Please try again." })
  ).toBeVisible();
  await expect(name).toHaveValue("GUI test");
  await page.route("**/api/inquiries", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Inquiry received." })
    })
  );
  await page.getByRole("button", { name: "Send Inquiry", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Inquiry received", exact: true })
  ).toBeVisible();
  await expect(page.getByRole("status")).toBeFocused();
  await page
    .getByRole("button", { name: "Send another inquiry", exact: true })
    .click();
  await expect(name).toHaveValue("");
  await expect(page.locator('[data-inquiry-field="serviceType"]')).toHaveValue(
    "Brand Campaign"
  );
});

test("mobile lightbox navigation occupies one row", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Expand still 1", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Image lightbox" })
  ).toBeVisible();
  const previous = await page
    .locator('[data-lightbox-control="previous"]')
    .boundingBox();
  const next = await page
    .locator('[data-lightbox-control="next"]')
    .boundingBox();
  expect(previous!.y).toBe(next!.y);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Expand still 1", exact: true })
  ).toBeFocused();
});
