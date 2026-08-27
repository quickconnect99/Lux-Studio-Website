import { expect, test, type Page } from "@playwright/test";
import {
  VINTAGE_DARK_THEME,
  VINTAGE_LIGHT_THEME,
  type ThemeId
} from "../../lib/themes";

const homeViewportProjects = [
  "mobile-390",
  "tablet-768",
  "desktop-1440",
  "wide-1920"
];

const themeCases: { id: ThemeId; label: string }[] = [
  { id: VINTAGE_LIGHT_THEME, label: "light" },
  { id: VINTAGE_DARK_THEME, label: "dark" }
];

/**
 * next/image inside a horizontally scrolling track (e.g. the "Frames in
 * Motion" strip) never enters the viewport through ordinary vertical page
 * scrolling, so its native `loading="lazy"` never fires and `img.complete`
 * stays false forever. Those frames are also clipped out of a `fullPage`
 * screenshot by the same scroll offset, so skipping ones that don't
 * currently overlap the viewport horizontally is correct, not just
 * convenient — they would never be visible in the screenshot either.
 */
async function waitForVisibleImagesToLoad(page: Page) {
  await page.waitForFunction(
    () =>
      Array.from(document.images).every((img) => {
        const rect = img.getBoundingClientRect();
        const horizontallyVisible =
          rect.right > 0 && rect.left < window.innerWidth;
        return !horizontallyVisible || (img.complete && img.naturalWidth > 0);
      }),
    undefined,
    { timeout: 30_000 }
  );
}

async function scrollThroughPage(page: Page) {
  await page.evaluate(async () => {
    const step = Math.max(window.innerHeight, 400);
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  });
}

/**
 * Navigates, scrolls the full page, and waits for every in-viewport image to
 * finish loading. Called twice per test: the first pass warms the Next.js
 * image optimizer cache (a cold `w=3840` variant can take several seconds to
 * generate) and triggers every native-lazy image at least once; the second,
 * compared pass then starts from a warm HTTP cache instead of racing it.
 */
async function primeHomePage(page: Page) {
  await page.goto("/");
  await scrollThroughPage(page);
  await waitForVisibleImagesToLoad(page);
}

for (const theme of themeCases) {
  test(`home page visual funnel remains stable (${theme.label})`, async ({
    page
  }, testInfo) => {
    test.skip(!homeViewportProjects.includes(testInfo.project.name));
    test.setTimeout(120_000);

    await page.addInitScript(
      (themeId) => localStorage.setItem("theme", themeId),
      theme.id
    );
    await page.emulateMedia({ reducedMotion: "reduce" });

    await primeHomePage(page);
    await primeHomePage(page);

    await expect(page).toHaveScreenshot(`home-shell-${theme.label}.png`, {
      animations: "disabled",
      fullPage: true,
      mask: [page.locator("video")],
      maxDiffPixelRatio: 0.01,
      timeout: 30_000
    });
  });
}

for (const theme of themeCases) {
  test(`mobile navigation visual state remains stable (${theme.label})`, async ({
    page
  }, testInfo) => {
    test.skip(testInfo.project.name !== "mobile-390");
    test.setTimeout(120_000);

    await page.addInitScript(
      (themeId) => localStorage.setItem("theme", themeId),
      theme.id
    );
    await page.emulateMedia({ reducedMotion: "reduce" });

    await primeHomePage(page);
    await primeHomePage(page);
    await page.evaluate(() => window.scrollTo(0, 0));

    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page).toHaveScreenshot(
      `mobile-navigation-${theme.label}.png`,
      {
        animations: "disabled",
        fullPage: false,
        mask: [page.locator("video")],
        maxDiffPixelRatio: 0.01,
        timeout: 30_000
      }
    );
  });
}
