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

test("project description follows metadata and remains readable", async ({
  page
}) => {
  await page.goto("/work/midnight-aeroline", { waitUntil: "networkidle" });

  const metadata = page.locator("[data-metadata-grid]");
  const description = page.locator("[data-project-description]");
  await expect(metadata).toBeVisible();
  await expect(description).toBeVisible();

  const layout = await page.evaluate(() => {
    const metadataElement = document.querySelector<HTMLElement>(
      "[data-metadata-grid]"
    );
    const descriptionElement = document.querySelector<HTMLElement>(
      "[data-project-description]"
    );
    const descriptionCopy = descriptionElement?.querySelector("p:last-child");
    const metadataRect = metadataElement?.getBoundingClientRect();
    const descriptionRect = descriptionElement?.getBoundingClientRect();

    return {
      metadataBottom: metadataRect?.bottom ?? 0,
      descriptionTop: descriptionRect?.top ?? 0,
      descriptionFontSize: descriptionCopy
        ? Number.parseFloat(getComputedStyle(descriptionCopy).fontSize)
        : 0,
      horizontalOverflow:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
    };
  });

  expect(layout.descriptionTop).toBeGreaterThanOrEqual(
    layout.metadataBottom - 1
  );
  expect(layout.descriptionFontSize).toBeGreaterThanOrEqual(16);
  expect(layout.horizontalOverflow).toBeLessThanOrEqual(0);
});

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

  const frame = page.locator('[data-selected-frame="center"]');
  await frame.scrollIntoViewIfNeeded();
  await page.locator('[data-selected-frame-control="next"]').click();
  await expect(frame.locator("[data-selected-frame-image]")).toHaveCount(1);

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

test("mobile header displays the company logo", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-320");
  await page.goto("/", { waitUntil: "networkidle" });

  const logo = page.locator("header img[data-company-logo]");
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute("src", /lux-studio-logo\.svg/);
});

test("sun and moon switch only between Vintage Dark and Vintage Light", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-320");
  await page.addInitScript(() => {
    localStorage.setItem("theme", "obsidian");
  });
  await page.goto("/", { waitUntil: "networkidle" });

  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-theme", "gpt-vintage");

  const switchToLight = page.getByRole("button", {
    name: "Switch to Vintage Light"
  });
  await switchToLight.click();
  await expect(root).toHaveAttribute("data-theme", "vintage-light");
  await expect(
    page.getByRole("button", { name: "Switch to Vintage Dark" })
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("theme")))
    .toBe("vintage-light");

  await page.getByRole("button", { name: "Switch to Vintage Dark" }).click();
  await expect(root).toHaveAttribute("data-theme", "gpt-vintage");
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("theme")))
    .toBe("gpt-vintage");
});

test("hero reel sound can be enabled by the viewer", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/", { waitUntil: "networkidle" });

  const video = page.locator("video[data-hero-reel]");
  await expect(video).toBeVisible();
  await expect(video).toHaveJSProperty("muted", true);

  await page.getByRole("button", { name: "Turn hero reel sound on" }).click();

  await expect(video).toHaveJSProperty("muted", false);
  const playback = await video.evaluate((element) => {
    const media = element as HTMLVideoElement;
    return {
      paused: media.paused,
      volume: media.volume,
      duration: media.duration,
      readyState: media.readyState
    };
  });

  expect(playback.paused).toBe(false);
  expect(playback.volume).toBe(1);
  expect(playback.duration).toBeGreaterThan(0);
  expect(playback.readyState).toBeGreaterThanOrEqual(2);
  await expect(
    page.getByRole("button", { name: "Turn hero reel sound off" })
  ).toBeVisible();
});

test("Frames in Motion opens the related project in the same tab", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/", { waitUntil: "networkidle" });

  const strip = page.getByRole("region", {
    name: /Frames in Motion projects/
  });
  const projectLinks = strip.locator('a[data-project-frame-link="true"]');

  await strip.scrollIntoViewIfNeeded();
  await strip.focus();
  await expect(strip.locator(".marquee-track")).toHaveCSS(
    "animation-play-state",
    "paused"
  );

  const visibleLinkIndex = await projectLinks.evaluateAll((links) =>
    links.findIndex((link) => {
      const rect = link.getBoundingClientRect();
      return (
        rect.right > 0 &&
        rect.left < window.innerWidth &&
        rect.bottom > 0 &&
        rect.top < window.innerHeight
      );
    })
  );
  expect(visibleLinkIndex).toBeGreaterThanOrEqual(0);

  const visibleProjectLink = projectLinks.nth(visibleLinkIndex);
  await expect(visibleProjectLink).toHaveAttribute("href", /^\/work\/.+/);
  await expect(visibleProjectLink).not.toHaveAttribute("target", "_blank");
  await visibleProjectLink.click();
  await expect(page).toHaveURL(/\/work\/[^/?#]+$/);
});

test("Shot With Intent and Frames in Motion use the same heading size", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/", { waitUntil: "networkidle" });

  const shotHeading = page.getByRole("heading", {
    name: /Shot\s+With Intent/i
  });
  const motionHeading = page.getByRole("heading", {
    name: /Frames\s+In Motion/i
  });

  const [shotSize, motionSize] = await Promise.all([
    shotHeading.evaluate((element) => getComputedStyle(element).fontSize),
    motionHeading.evaluate((element) => getComputedStyle(element).fontSize)
  ]);

  expect(motionSize).toBe(shotSize);
});

test("footer uses the Instagram icon", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(
    page.locator('footer a[aria-label="Instagram"] svg.lucide-instagram')
  ).toBeVisible();
  await expect(
    page.locator('footer a[aria-label="Instagram"] svg.lucide-camera')
  ).toHaveCount(0);
});

test("legal notice appends the legal form to the company name", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/impressum", { waitUntil: "networkidle" });

  const companyNameRow = page
    .getByText("Company Name", { exact: true })
    .locator("..");
  await expect(
    companyNameRow.getByText("Lux Studio GmbH", { exact: true })
  ).toBeVisible();
  await expect(page.getByText("Legal Form", { exact: true })).toHaveCount(0);
});

test("selected-frame navigation uses full-height 15-percent overlays", async ({
  page
}) => {
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
  const imageLayers = frame.locator("[data-selected-frame-image]");
  const initialLabel = await openControl.getAttribute("aria-label");

  await expect(imageLayers).toHaveCount(1);
  await next.click();
  await expect(imageLayers).toHaveCount(2);
  await expect(openControl).not.toHaveAttribute(
    "aria-label",
    initialLabel ?? ""
  );
  await expect(imageLayers).toHaveCount(1, { timeout: 2_000 });
});

test("lightbox uses a large frame and full-height rectangular navigation", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/", { waitUntil: "networkidle" });

  const selectedFrame = page.locator('[data-selected-frame="center"]');
  await selectedFrame.scrollIntoViewIfNeeded();
  const selectedFrameBounds = await selectedFrame.boundingBox();

  await page.locator('[data-selected-frame-control="open"]').click();

  const dialog = page.getByRole("dialog", { name: "Image lightbox" });
  const lightboxFrame = dialog.locator("[data-lightbox-frame]");
  const previous = dialog.locator('[data-lightbox-control="previous"]');
  const next = dialog.locator('[data-lightbox-control="next"]');

  await expect(dialog).toBeVisible();
  await expect(lightboxFrame).toBeVisible();
  await expect(previous).toBeVisible();
  await expect(next).toBeVisible();

  const dimensions = await lightboxFrame.evaluate((element) => {
    const frameRect = element.getBoundingClientRect();
    const previousRect = element
      .querySelector<HTMLElement>('[data-lightbox-control="previous"]')
      ?.getBoundingClientRect();
    const nextRect = element
      .querySelector<HTMLElement>('[data-lightbox-control="next"]')
      ?.getBoundingClientRect();

    return {
      frameWidth: frameRect.width,
      frameHeight: frameRect.height,
      previousWidth: previousRect?.width ?? 0,
      previousHeight: previousRect?.height ?? 0,
      nextWidth: nextRect?.width ?? 0,
      nextHeight: nextRect?.height ?? 0,
      viewportWidth: window.innerWidth
    };
  });

  expect(dimensions.frameWidth / dimensions.viewportWidth).toBeGreaterThan(0.9);
  expect(dimensions.frameWidth).toBeGreaterThan(
    (selectedFrameBounds?.width ?? 0) * 1.5
  );
  expect(dimensions.previousHeight).toBeCloseTo(dimensions.frameHeight, 0);
  expect(dimensions.nextHeight).toBeCloseTo(dimensions.frameHeight, 0);
  expect(dimensions.previousHeight).toBeGreaterThan(
    dimensions.previousWidth * 3
  );
  expect(dimensions.nextHeight).toBeGreaterThan(dimensions.nextWidth * 3);
});

test("project carousel opens fullscreen and keeps image navigation", async ({
  page
}, testInfo) => {
  test.skip(!["mobile-390", "desktop-1440"].includes(testInfo.project.name));
  await page.goto("/work/midnight-aeroline", { waitUntil: "networkidle" });

  const carousel = page.locator("[data-project-carousel]");
  await carousel.scrollIntoViewIfNeeded();
  const fullscreenTrigger = carousel.locator("[data-project-carousel-open]");
  await fullscreenTrigger.click();

  const dialog = page.getByRole("dialog", { name: "Image lightbox" });
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Close lightbox" })
  ).toBeFocused();
  await expect(dialog.locator("img").first()).toHaveAttribute("alt", /.+/);

  await dialog.locator('[data-lightbox-control="next"]').click();
  await expect(dialog.getByText(/2 \/ \d+/)).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(fullscreenTrigger).toBeFocused();
});

test("project sharing metadata uses the first project image", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/work/midnight-aeroline", { waitUntil: "networkidle" });

  const projectPoster = await page
    .locator("video[poster]")
    .getAttribute("poster");
  const openGraphImage = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  const twitterImage = await page
    .locator('meta[name="twitter:image"]')
    .getAttribute("content");

  expect(projectPoster).toBeTruthy();
  expect(openGraphImage).toBeTruthy();
  expect(twitterImage).toBe(openGraphImage);
  expect(new URL(openGraphImage!).pathname).toBe(
    new URL(projectPoster!, page.url()).pathname
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "article"
  );
});

test("home hero atmosphere and copy follow the active theme", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/", { waitUntil: "networkidle" });

  const themeStyles = await page.evaluate(() => {
    const atmosphere = document.querySelector<HTMLElement>(
      "[data-home-hero-atmosphere]"
    );
    const copy = document.querySelector<HTMLElement>("[data-home-hero-copy] p");

    function getThemeStyles(theme: "vintage-light" | "gpt-vintage") {
      document.documentElement.setAttribute("data-theme", theme);

      return {
        atmosphere:
          atmosphere === null
            ? ""
            : window.getComputedStyle(atmosphere).backgroundImage,
        copyColor: copy === null ? "" : window.getComputedStyle(copy).color
      };
    }

    return {
      light: getThemeStyles("vintage-light"),
      dark: getThemeStyles("gpt-vintage")
    };
  });

  expect(themeStyles.light.atmosphere).not.toBe("");
  expect(themeStyles.dark.atmosphere).not.toBe("");
  expect(themeStyles.dark.atmosphere).not.toBe(themeStyles.light.atmosphere);
  expect(themeStyles.dark.copyColor).not.toBe(themeStyles.light.copyColor);
  expect(themeStyles.dark.atmosphere).not.toContain(
    "rgba(255, 255, 255, 0.86)"
  );
});

test("about places the team gallery below the team profiles", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/about", { waitUntil: "networkidle" });

  await expect(
    page.locator('img[alt^="Lux Studio founder visual"]')
  ).toHaveCount(0);

  const profilesHeading = page.getByRole("heading", {
    name: /People\s+Behind The Work/i
  });
  const galleryHeading = page.getByRole("heading", {
    name: /People\s+At Work/i
  });

  await expect(profilesHeading).toBeVisible();
  await expect(galleryHeading).toBeVisible();

  const profilesBox = await profilesHeading.boundingBox();
  const galleryBox = await galleryHeading.boundingBox();
  expect(galleryBox?.y ?? 0).toBeGreaterThan(profilesBox?.y ?? 0);
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

  await settingsForm.getByRole("button", { name: "04 About" }).click();
  await expect(
    settingsForm.getByText("Team Gallery", { exact: true })
  ).toBeVisible();
  await expect(
    settingsForm.getByRole("button", { name: "Upload Files" })
  ).toBeVisible();

  await page.getByRole("button", { name: /^Projects/ }).click();
  await expect(settingsForm).toBeHidden();
  expect(errors).toEqual([]);
});

test("admin exposes independent homepage frame collections", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/admin", { waitUntil: "networkidle" });

  await page.getByRole("button", { name: /Site Settings/ }).click();
  const settingsForm = page.locator("#site-settings-form");
  await settingsForm.getByRole("button", { name: "01 Home" }).click();

  await expect(
    settingsForm.getByText("Shot With Intent", { exact: true })
  ).toBeVisible();
  await expect(
    settingsForm.getByText("Frames in Motion", { exact: true })
  ).toBeVisible();
  await expect(settingsForm.getByText(/no eight-image limit/i)).toBeVisible();
});
