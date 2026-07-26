import { expect, test, type Page } from "@playwright/test";

const routes = [
  "/",
  "/work",
  "/services",
  "/about",
  "/contact",
  "/impressum",
  "/datenschutz",
  "/work/midnight-aeroline",
  "/admin"
] as const;

function collectBrowserErrors(page: Page) {
  const errors: string[] = [];

  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  return errors;
}

for (const route of routes) {
  test(`${route} remains inside the viewport`, async ({ page }) => {
    const errors = collectBrowserErrors(page);
    const response = await page.goto(route, { waitUntil: "networkidle" });

    expect(response?.ok(), `${route} should return a successful response`).toBe(
      true
    );
    await expect(page.locator("h1")).toHaveCount(1);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(250);

    const diagnostics = await page.evaluate(() => ({
      horizontalOverflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
      brokenImages: Array.from(document.images)
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src)
    }));

    expect(diagnostics.horizontalOverflow).toBeLessThanOrEqual(0);
    expect(diagnostics.brokenImages).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("reduced motion hydrates without hiding content", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-320");
  const errors = collectBrowserErrors(page);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("h1")).toBeVisible();
  expect(errors).toEqual([]);
});

test("mobile navigation traps focus and closes with Escape", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-320");
  await page.goto("/", { waitUntil: "networkidle" });

  const trigger = page.locator('button[aria-controls="mobile-navigation"]');
  await trigger.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  const bounds = await dialog.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    };
  });

  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.top).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewportWidth);
  expect(bounds.bottom).toBeLessThanOrEqual(bounds.viewportHeight);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("theme menu supports roving keyboard focus", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-320");
  await page.goto("/", { waitUntil: "networkidle" });

  const trigger = page.getByRole("button", { name: /Choose theme/ });
  await trigger.click();

  const menu = page.getByRole("menu", { name: "Theme" });
  await expect(menu).toBeVisible();
  const focusedBefore = await page.evaluate(
    () => document.activeElement?.textContent?.trim() ?? ""
  );

  await page.keyboard.press("ArrowDown");
  const focusedAfter = await page.evaluate(
    () => document.activeElement?.textContent?.trim() ?? ""
  );

  expect(focusedAfter).not.toBe(focusedBefore);

  const bounds = await menu.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    };
  });

  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.top).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewportWidth);
  expect(bounds.bottom).toBeLessThanOrEqual(bounds.viewportHeight);

  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("selected-frame navigation uses full-height 15-percent overlays", async ({
  page
}, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile-"));
  await page.goto("/", { waitUntil: "networkidle" });

  const frame = page.locator('[data-selected-frame="center"]');
  const previous = page.locator('[data-selected-frame-control="previous"]');
  const next = page.locator('[data-selected-frame-control="next"]');

  await frame.scrollIntoViewIfNeeded();
  await expect(frame).toBeVisible();
  await expect(previous).toBeVisible();
  await expect(next).toBeVisible();
  await expect(page.getByRole("button", { name: "Hide Reel" })).toHaveCount(0);

  const dimensions = await frame.evaluate((element) => {
    const frameRect = element.getBoundingClientRect();
    const previousRect = element
      .querySelector<HTMLElement>('[data-selected-frame-control="previous"]')
      ?.getBoundingClientRect();
    const nextRect = element
      .querySelector<HTMLElement>('[data-selected-frame-control="next"]')
      ?.getBoundingClientRect();

    return {
      frameWidth: frameRect.width,
      frameHeight: frameRect.height,
      previousWidth: previousRect?.width ?? 0,
      previousHeight: previousRect?.height ?? 0,
      nextWidth: nextRect?.width ?? 0,
      nextHeight: nextRect?.height ?? 0
    };
  });

  expect(dimensions.previousHeight).toBeCloseTo(dimensions.frameHeight, 0);
  expect(dimensions.nextHeight).toBeCloseTo(dimensions.frameHeight, 0);
  expect(dimensions.previousWidth / dimensions.frameWidth).toBeCloseTo(0.15, 2);
  expect(dimensions.nextWidth / dimensions.frameWidth).toBeCloseTo(0.15, 2);

  const openControl = page.locator('[data-selected-frame-control="open"]');
  const initialLabel = await openControl.getAttribute("aria-label");
  await next.click();
  await expect(openControl).not.toHaveAttribute(
    "aria-label",
    initialLabel ?? ""
  );
});

test("admin field help remains inside the mobile viewport", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-320");
  await page.goto("/admin", { waitUntil: "networkidle" });

  const help = page
    .getByRole("button", { name: /Where is .* shown\?/ })
    .first();
  await help.scrollIntoViewIfNeeded();
  await help.focus();

  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  const bounds = await tooltip.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    };
  });

  expect(bounds.left).toBeGreaterThanOrEqual(0);
  expect(bounds.top).toBeGreaterThanOrEqual(0);
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewportWidth);
  expect(bounds.bottom).toBeLessThanOrEqual(bounds.viewportHeight);
});

test("admin switches to the lazy-loaded settings workspace", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-320");
  const errors = collectBrowserErrors(page);
  await page.goto("/admin", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: /Site Settings/ }).click();

  const settingsForm = page.locator("#site-settings-form");
  await expect(settingsForm).toBeVisible();
  await expect(
    settingsForm.getByText("Live site editor", { exact: true })
  ).toBeVisible();

  await page.getByRole("button", { name: /^Projects/ }).click();
  await expect(settingsForm).toBeHidden();
  expect(errors).toEqual([]);
});
