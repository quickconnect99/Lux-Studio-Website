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
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        })
    );

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

test("repository media uses a bounded browser cache", async ({
  request
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");

  const response = await request.head("/media/hero-showreel.mp4");
  const cacheControl = response.headers()["cache-control"] ?? "";

  expect(response.ok()).toBe(true);
  expect(cacheControl).toContain("max-age=3600");
  expect(cacheControl).toContain("stale-while-revalidate=86400");
  expect(cacheControl).not.toContain("immutable");
});

test("work shows every filtered project without a load-more action", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/work", { waitUntil: "networkidle" });

  await expect(page.getByRole("button", { name: /load more/i })).toHaveCount(0);

  const projects = page.locator("[data-work-project]");
  const status = page.locator("[data-work-result-status]");
  await expect(status).toBeVisible();
  const announcedCount = Number(
    (await status.textContent())?.match(/Showing\s+(\d+)\s+projects/)?.[1]
  );

  expect(announcedCount).toBeGreaterThan(0);
  await expect(projects).toHaveCount(announcedCount);
});

test("mobile work filters communicate horizontal scrolling", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-320");
  await page.goto("/work", { waitUntil: "networkidle" });

  const categoryFilters = page.locator(".mobile-scroll-affordance").last();
  await expect(categoryFilters).toBeVisible();

  const filterLayout = await categoryFilters.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      overflows: element.scrollWidth > element.clientWidth,
      maskImage: styles.maskImage || styles.webkitMaskImage
    };
  });

  expect(filterLayout.overflows).toBe(true);
  expect(filterLayout.maskImage).not.toBe("none");
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
  await expect(page.locator("video[data-hero-reel]")).toHaveJSProperty(
    "paused",
    true
  );
  await expect(
    page.getByRole("button", { name: "Play showreel video" })
  ).toBeVisible();

  const frame = page.locator('[data-selected-frame="center"]');
  await frame.scrollIntoViewIfNeeded();
  await page.locator('[data-selected-frame-control="next"]').click();
  await expect(frame.locator("[data-selected-frame-image]")).toHaveCount(1);

  expect(errors).toEqual([]);
});

test("skip link is the first keyboard target and focuses the content", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/", { waitUntil: "networkidle" });

  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("unknown routes keep the public shell and stay out of search results", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");

  for (const route of ["/missing-route", "/work/missing-project"]) {
    const response = await page.goto(route, { waitUntil: "networkidle" });

    if (route === "/missing-route") {
      expect(response?.status(), `${route} should return HTTP 404`).toBe(404);
    } else {
      // Next.js can return 200 for a notFound() discovered after streaming
      // starts. The generated noindex directive below is the SEO safeguard.
      expect([200, 404]).toContain(response?.status());
    }
    await expect(page.locator("header")).toHaveCount(1);
    await expect(page.locator("footer")).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: /frame missing/i })
    ).toBeVisible();
    const robotsDirectives = await page
      .locator('meta[name="robots"]')
      .evaluateAll((elements) =>
        elements.map((element) => element.getAttribute("content") ?? "")
      );
    expect(robotsDirectives.length).toBeGreaterThan(0);
    expect(
      robotsDirectives.every((directive) => directive.includes("noindex")),
      `${route} should not emit an indexable robots directive`
    ).toBe(true);
    await expect(page).toHaveTitle(/Page Not Found/);
  }
});

test("robots and sitemap expose the intended crawl signals", async ({
  request
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");

  const [robotsResponse, sitemapResponse] = await Promise.all([
    request.get("/robots.txt"),
    request.get("/sitemap.xml")
  ]);
  const robots = await robotsResponse.text();
  const sitemap = await sitemapResponse.text();

  expect(robotsResponse.ok()).toBe(true);
  expect(robots).toContain("Disallow: /api/");
  expect(sitemapResponse.ok()).toBe(true);
  expect(sitemap).toContain("<changefreq>");
  expect(sitemap).toContain("<priority>");
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
  await expect(dialog).toHaveAccessibleName("Navigation");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  const links = dialog.getByRole("link");
  const closeButton = dialog.getByRole("button", { name: "Close navigation" });
  await expect(closeButton).toBeVisible();
  await expect(links.first()).toBeFocused();
  await links.last().focus();
  await page.keyboard.press("Tab");
  await expect(closeButton).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(links.last()).toBeFocused();

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

  await closeButton.click();
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("navigation exposes the current page to assistive technology", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/services", { waitUntil: "networkidle" });

  const currentLink = page.locator('header nav a[aria-current="page"]');
  await expect(currentLink).toContainText("Services");
});

test("work filters expose named semantic groups", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/work", { waitUntil: "networkidle" });

  const categoryGroup = page.getByRole("group", { name: "Category" });
  await expect(categoryGroup).toBeVisible();
  await expect(
    categoryGroup.getByRole("button", { name: "All categories" })
  ).toHaveAttribute("aria-pressed", "true");

  const businessGroup = page.getByRole("group", { name: "Business" });
  if ((await businessGroup.count()) > 0) {
    await expect(
      businessGroup.getByRole("button", { name: "All businesses" })
    ).toHaveAttribute("aria-pressed", "true");
  }
});

test("service CTA carries the selected service into the inquiry", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/services", { waitUntil: "networkidle" });

  const startBrief = page.getByRole("link", { name: "Start A Brief" }).first();
  const href = await startBrief.getAttribute("href");
  expect(href).toMatch(/^\/contact\?service=/);
  await startBrief.click();

  await expect(page).toHaveURL(/\/contact\?service=/);
  await expect(page.getByLabel("Service Type")).not.toHaveValue("");
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

test("hero reel follows visibility and preserves a manual pause", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/", { waitUntil: "networkidle" });

  const video = page.locator("video[data-hero-reel]");
  await expect(video).toBeVisible();
  await expect(video).toHaveJSProperty("muted", true);
  await expect
    .poll(() =>
      video.evaluate((element) => (element as HTMLVideoElement).paused)
    )
    .toBe(false);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(video).toHaveJSProperty("paused", true);

  await video.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      video.evaluate((element) => (element as HTMLVideoElement).paused)
    )
    .toBe(false);

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

  await page.getByRole("button", { name: "Pause showreel video" }).click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty("paused", true);
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

test("Frames in Motion offers a persistent playback control", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/", { waitUntil: "networkidle" });

  const strip = page.getByRole("region", {
    name: /Frames in Motion projects/
  });
  const track = strip.locator(".marquee-track");
  const playbackButton = page.locator("[data-motion-strip-toggle]");

  await strip.scrollIntoViewIfNeeded();
  await expect(playbackButton).toHaveAccessibleName("Pause strip");
  await playbackButton.click();
  await expect(playbackButton).toHaveAttribute("aria-pressed", "true");
  await expect(playbackButton).toHaveAccessibleName("Play strip");
  await expect(track).toHaveCSS("animation-play-state", "paused");

  await page.reload({ waitUntil: "domcontentloaded" });
  const restoredPlayButton = page.locator("[data-motion-strip-toggle]");
  await expect(restoredPlayButton).toHaveAccessibleName("Play strip");
  await expect(restoredPlayButton).toHaveAttribute("aria-pressed", "true");
  await restoredPlayButton.click();
  await expect(restoredPlayButton).toHaveAttribute("aria-pressed", "false");
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

test("project detail ends with a direct inquiry action", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/work/midnight-aeroline", { waitUntil: "networkidle" });

  const heading = page.getByRole("heading", {
    name: "Create Something Similar"
  });
  await expect(heading).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Start A Brief" })
  ).toHaveAttribute("href", "/contact");
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

test("about never presents vehicle demo assets as team portraits", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/about", { waitUntil: "networkidle" });

  await expect(page.locator('img[src*="demo-car-02"]')).toHaveCount(0);
  await expect(page.locator('img[src*="demo-car-03"]')).toHaveCount(0);

  const profilesHeading = page.getByRole("heading", {
    name: /People\s+Behind The Work/i
  });
  const galleryHeading = page.getByRole("heading", {
    name: /People\s+At Work/i
  });

  if (
    (await profilesHeading.count()) > 0 &&
    (await galleryHeading.count()) > 0
  ) {
    const profilesBox = await profilesHeading.boundingBox();
    const galleryBox = await galleryHeading.boundingBox();
    expect(galleryBox?.y ?? 0).toBeGreaterThan(profilesBox?.y ?? 0);
  }
});

test("admin mobile site preview stacks by simulated container width", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/admin", { waitUntil: "networkidle" });

  await page.getByRole("tab", { name: /Site Settings/ }).click();
  const settingsForm = page.locator("#site-settings-form");
  await settingsForm.getByRole("tab", { name: "01 Home" }).click();
  await settingsForm.getByRole("button", { name: "Mobile preview" }).click();

  const canvas = settingsForm.locator(".site-settings-preview-canvas");
  await expect(canvas).toHaveCSS("max-width", "430px");
  await expect(canvas.getByText("Menu", { exact: true })).toBeVisible();
  const columns = await canvas
    .locator("[data-preview-stack]")
    .first()
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns);
  expect(columns.trim().split(/\s+/)).toHaveLength(1);
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

test("admin uses its own workspace chrome", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/admin", { waitUntil: "networkidle" });

  await expect(page.locator("main[data-admin-workspace]")).toBeVisible();
  await expect(page.locator("header img[data-company-logo]")).toHaveCount(0);
  await expect(page.locator("footer")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: /Lux Studio Admin workspace/i })
  ).toBeVisible();
});

test("admin mobile workspace switches between projects editor and preview", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/admin", { waitUntil: "networkidle" });

  const projectsMode = page.locator('[data-admin-workspace-mode="projects"]');
  const editMode = page.locator('[data-admin-workspace-mode="edit"]');
  const previewMode = page.locator('[data-admin-workspace-mode="preview"]');
  const projectPane = page.locator("#admin-project-list-pane");
  const editorPane = page.locator("#admin-project-editor-pane");
  const previewPane = page.locator("#admin-project-preview-pane");

  await expect(editMode).toHaveAttribute("aria-selected", "true");
  await expect(editorPane).toBeVisible();
  await expect(projectPane).toBeHidden();
  await expect(previewPane).toBeHidden();

  await projectsMode.click();
  await expect(projectPane).toBeVisible();
  await expect(editorPane).toBeHidden();

  await previewMode.click();
  await expect(previewPane).toBeVisible();
  await expect(
    previewPane.getByText("Quick Preview", { exact: true })
  ).toBeVisible();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("admin mobile gallery cards expose non-drag reorder controls", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-390");
  await page.goto("/admin", { waitUntil: "networkidle" });

  const firstGalleryItem = page.locator("[data-gallery-item]").first();
  await firstGalleryItem.scrollIntoViewIfNeeded();
  await expect(
    firstGalleryItem.getByRole("button", { name: "Move up" })
  ).toBeVisible();
  await expect(
    firstGalleryItem.getByRole("button", { name: "Move down" })
  ).toBeVisible();
});

test("admin live preview opens text editing with one click", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/admin", { waitUntil: "networkidle" });

  const previewPane = page.locator("#admin-project-preview-pane");
  const projectTitle = previewPane.getByRole("button", {
    name: "Edit Project title"
  });

  await projectTitle.click();
  await expect(previewPane.getByRole("textbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(projectTitle).toBeVisible();
});

test("admin switches to the lazy-loaded settings workspace", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-320");
  const errors = collectBrowserErrors(page);
  await page.goto("/admin", { waitUntil: "networkidle" });

  await page.getByRole("tab", { name: /Site Settings/ }).click();

  const settingsForm = page.locator("#site-settings-form");
  await expect(settingsForm).toBeVisible();
  await expect(
    settingsForm.getByText("Live site editor", { exact: true })
  ).toBeVisible();

  await settingsForm.getByRole("tab", { name: "04 About" }).click();
  await expect(
    settingsForm.getByText("Team Gallery", { exact: true })
  ).toBeVisible();
  await expect(
    settingsForm.getByRole("button", { name: "Upload Files" })
  ).toBeVisible();

  await page.getByRole("tab", { name: /^Projects/ }).click();
  await expect(settingsForm).toBeHidden();
  expect(errors).toEqual([]);
});

test("admin keeps a newly added team member editable and marks it dirty", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/admin", { waitUntil: "networkidle" });

  await page.getByRole("tab", { name: /Site Settings/ }).click();
  const settingsForm = page.locator("#site-settings-form");
  await settingsForm.getByRole("tab", { name: "04 About" }).click();

  const members = settingsForm.locator("[data-admin-team-member]");
  const addMemberButton = settingsForm.getByRole("button", {
    name: "Add member"
  });
  await expect(addMemberButton).toBeVisible();
  const initialCount = await members.count();
  await addMemberButton.click();
  await expect(members).toHaveCount(initialCount + 1);

  const nameInput = members.last().getByLabel("Name");
  await nameInput.click();
  await nameInput.press("ControlOrMeta+A");
  await nameInput.pressSequentially("Jamie Doe");

  await expect(nameInput).toBeFocused();
  await expect(nameInput).toHaveValue("Jamie Doe");
  await expect(
    settingsForm.getByRole("button", { name: "Save changes" })
  ).toBeVisible();

  await members
    .last()
    .locator('input[type="file"]')
    .setInputFiles("public/images/demo-car-01.jpg");
  await expect(
    members.last().getByText("Queued: demo-car-01.jpg")
  ).toBeVisible();
  await members.last().getByRole("button", { name: "Move member up" }).click();

  const movedMember = members.nth(initialCount - 1);
  await expect(movedMember.getByLabel("Name")).toHaveValue("Jamie Doe");
  await expect(movedMember.getByText("Queued: demo-car-01.jpg")).toBeVisible();
});

test("admin exposes independent homepage frame collections", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/admin", { waitUntil: "networkidle" });

  await page.getByRole("tab", { name: /Site Settings/ }).click();
  const settingsForm = page.locator("#site-settings-form");
  await settingsForm.getByRole("tab", { name: "01 Home" }).click();

  await expect(
    settingsForm.getByText("Shot With Intent", { exact: true })
  ).toBeVisible();
  await expect(
    settingsForm.getByText("Frames in Motion", { exact: true })
  ).toBeVisible();
  await expect(settingsForm.getByText(/no eight-image limit/i)).toBeVisible();

  const libraryToggles = settingsForm.locator(
    "[data-project-frame-library-toggle]"
  );
  await expect(libraryToggles).toHaveCount(2);
  await expect(libraryToggles.first()).toHaveAttribute(
    "aria-expanded",
    "false"
  );
  await expect(
    settingsForm.locator("[data-project-frame-library-content]")
  ).toHaveCount(0);

  await libraryToggles.first().click();
  await expect(libraryToggles.first()).toHaveAttribute("aria-expanded", "true");
  await expect(
    settingsForm.locator("[data-project-frame-library-content]")
  ).toHaveCount(1);
});

test("admin protects unsaved project changes before creating a new project", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/admin", { waitUntil: "networkidle" });

  const title = page.locator("[data-admin-project-title]");
  await expect(title).toBeVisible();
  await title.fill("Unsaved recovery test");
  await page.getByRole("button", { name: "New project" }).click();

  await expect(
    page.getByRole("heading", {
      name: "Save changes before starting a new project?"
    })
  ).toBeVisible();
  await expect(title).toHaveValue("Unsaved recovery test");

  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(title).toHaveValue("Unsaved recovery test");

  await page.getByRole("button", { name: "New project" }).click();
  await page.getByRole("button", { name: "Discard changes" }).click();
  await expect(title).toHaveValue("New Project");
});

test("admin restores an unsaved project draft after reload", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/admin", { waitUntil: "networkidle" });

  const title = page.locator("[data-admin-project-title]");
  await title.fill("Recovered after reload");
  await expect
    .poll(() =>
      page.evaluate(() =>
        Object.keys(localStorage).some((key) =>
          key.startsWith("admin-project-draft:")
        )
      )
    )
    .toBe(true);

  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("[data-admin-project-title]")).toHaveValue(
    "Recovered after reload"
  );
  await expect(
    page.getByText(/Unsaved draft from .* restored\./)
  ).toBeVisible();
});

test("admin save shortcut and reset follow the active settings tab", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1440");
  await page.goto("/admin", { waitUntil: "networkidle" });
  await page.getByRole("tab", { name: /Site Settings/ }).click();

  const settingsForm = page.locator("#site-settings-form");
  const workVisibility = settingsForm.locator(
    '[data-site-navigation="navigationWork"]'
  );
  await expect(workVisibility).toHaveAttribute("aria-pressed", "true");
  await workVisibility.click();
  await expect(workVisibility).toHaveAttribute("aria-pressed", "false");

  await page.keyboard.press("Control+s");
  await expect(
    page.getByText(/Connect Supabase to persist global links/)
  ).toBeVisible();

  await page.getByRole("button", { name: "Reset Settings" }).click();
  await expect(
    page.getByRole("heading", { name: "Reset site settings?" })
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset settings", exact: true })
    .click();
  await expect(workVisibility).toHaveAttribute("aria-pressed", "true");
});

test("admin action bars do not cover mobile form fields", async ({
  page
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-320");
  await page.goto("/admin", { waitUntil: "networkidle" });

  await expect(page.locator("[data-admin-project-actions]")).toHaveCSS(
    "position",
    "static"
  );
  await page.getByRole("tab", { name: /Site Settings/ }).click();
  await expect(page.locator("[data-admin-settings-actions]")).toHaveCSS(
    "position",
    "static"
  );
});
