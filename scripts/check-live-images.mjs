import process from "node:process";
import { chromium } from "@playwright/test";

const target = process.argv[2];
const checkAllProjects = process.argv.includes("--all");

if (!target) {
  console.error(
    "Usage: node scripts/check-live-images.mjs https://your-domain.tld [--all]"
  );
  process.exit(1);
}

const baseUrl = new URL(target);
baseUrl.pathname = "";
baseUrl.search = "";
baseUrl.hash = "";

async function scrollThroughPage(page) {
  let previousHeight = 0;

  for (let pass = 0; pass < 3; pass += 1) {
    const height = await page.evaluate(() => document.body.scrollHeight);

    for (let y = 0; y < height; y += 700) {
      await page.evaluate((nextY) => window.scrollTo(0, nextY), y);
      await page.waitForTimeout(80);
    }

    if (height === previousHeight) {
      break;
    }

    previousHeight = height;
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1_000);
  await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {
    // Large direct-image fallbacks can keep the network busy. DOM image state
    // below is the authoritative success check.
  });
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 }
});

const discoveryPage = await context.newPage();
await discoveryPage.goto(new URL("/work", baseUrl).toString(), {
  waitUntil: "networkidle",
  timeout: 60_000
});
const projectPaths = await discoveryPage
  .locator('a[href^="/work/"]')
  .evaluateAll((links) => [
    ...new Set(
      links
        .map((link) => link.getAttribute("href"))
        .filter((href) => Boolean(href))
    )
  ]);
await discoveryPage.close();

const paths = [
  "/",
  "/work",
  ...(checkAllProjects ? projectPaths : projectPaths.slice(0, 1))
];
const reports = [];

for (const path of paths) {
  const page = await context.newPage();
  const optimizerPaymentResponses = [];
  const failedImageRequests = [];

  page.on("response", (response) => {
    if (
      response.request().resourceType() === "image" &&
      response.status() === 402 &&
      response.url().includes("/_next/image")
    ) {
      optimizerPaymentResponses.push(response.url());
    }
  });
  page.on("requestfailed", (request) => {
    if (request.resourceType() === "image") {
      failedImageRequests.push({
        url: request.url(),
        error: request.failure()?.errorText ?? "unknown"
      });
    }
  });

  const response = await page.goto(new URL(path, baseUrl).toString(), {
    waitUntil: "domcontentloaded",
    timeout: 60_000
  });
  await scrollThroughPage(page);

  const images = await page.locator("img").evaluateAll((nodes) =>
    nodes.map((image) => ({
      alt: image.alt,
      src: image.currentSrc || image.src,
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      delivery: image.dataset.imageDelivery ?? "native"
    }))
  );
  const brokenImages = images.filter(
    (image) => !image.complete || image.naturalWidth === 0
  );

  reports.push({
    path,
    status: response?.status() ?? null,
    imageCount: images.length,
    recoveredImages: images.filter(
      (image) => image.delivery === "direct" || image.delivery === "fallback"
    ).length,
    optimizerPaymentResponses: optimizerPaymentResponses.length,
    failedImageRequests,
    brokenImages
  });

  await page.close();
}

await browser.close();

let failed = false;
for (const report of reports) {
  const statusOk =
    report.status !== null && report.status >= 200 && report.status < 400;
  const imagesOk =
    report.brokenImages.length === 0 && report.failedImageRequests.length === 0;
  const passed = statusOk && imagesOk;
  failed ||= !passed;

  console.log(
    `${passed ? "PASS" : "FAIL"} ${report.path} status=${report.status}` +
      ` images=${report.imageCount}` +
      ` recovered=${report.recoveredImages}` +
      ` optimizer402=${report.optimizerPaymentResponses}`
  );

  for (const image of report.brokenImages) {
    console.error(`  broken: ${image.alt || "(decorative)"} ${image.src}`);
  }
  for (const request of report.failedImageRequests) {
    console.error(`  request failed: ${request.error} ${request.url}`);
  }
}

const totals = reports.reduce(
  (summary, report) => ({
    pages: summary.pages + 1,
    images: summary.images + report.imageCount,
    recoveredImages: summary.recoveredImages + report.recoveredImages,
    optimizerPaymentResponses:
      summary.optimizerPaymentResponses + report.optimizerPaymentResponses,
    brokenImages: summary.brokenImages + report.brokenImages.length
  }),
  {
    pages: 0,
    images: 0,
    recoveredImages: 0,
    optimizerPaymentResponses: 0,
    brokenImages: 0
  }
);

console.log(
  `SUMMARY pages=${totals.pages} images=${totals.images}` +
    ` recovered=${totals.recoveredImages}` +
    ` optimizer402=${totals.optimizerPaymentResponses}` +
    ` broken=${totals.brokenImages}`
);

if (failed) {
  process.exit(1);
}
