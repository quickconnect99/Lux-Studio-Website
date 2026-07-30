import { expect, test } from "@playwright/test";

test("images retry their direct source when the optimizer returns 402", async ({
  page
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-1440",
    "One browser is sufficient for the optimizer delivery-state test."
  );

  let rejectedOptimizerRequests = 0;
  await page.route(/\/_next\/image\?/, async (route) => {
    rejectedOptimizerRequests += 1;
    await route.fulfill({
      status: 402,
      contentType: "text/plain",
      headers: {
        "x-vercel-error": "OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED"
      },
      body: "Image optimization payment required"
    });
  });

  const response = await page.goto("/work", { waitUntil: "domcontentloaded" });
  expect(response?.ok()).toBe(true);

  const firstImage = page.locator("img[data-image-delivery]").first();
  await expect(firstImage).toBeVisible();
  await expect
    .poll(() =>
      firstImage.evaluate((element) => {
        const image = element as HTMLImageElement;

        return (
          image.dataset.imageDelivery !== "optimized" &&
          image.complete &&
          image.naturalWidth > 0 &&
          !image.currentSrc.includes("/_next/image")
        );
      })
    )
    .toBe(true);

  expect(rejectedOptimizerRequests).toBeGreaterThan(0);
});
