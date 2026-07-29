import { defineConfig } from "@playwright/test";

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;
const useProductionServer =
  Boolean(process.env.CI) || process.env.PLAYWRIGHT_USE_PRODUCTION === "true";
const chromiumProjects = [
  {
    name: "mobile-320",
    use: { viewport: { width: 320, height: 568 } }
  },
  {
    name: "mobile-390",
    use: { viewport: { width: 390, height: 844 } }
  },
  {
    name: "tablet-768",
    use: { viewport: { width: 768, height: 1024 } }
  },
  {
    name: "desktop-1440",
    use: { viewport: { width: 1440, height: 1000 } }
  },
  {
    name: "wide-1920",
    use: { viewport: { width: 1920, height: 1080 } }
  }
];

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 2,
  reporter: [[process.env.CI ? "line" : "list"], ["html", { open: "never" }]],
  snapshotPathTemplate:
    "{testDir}/{testFilePath}-snapshots/{arg}-{projectName}{ext}",
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL,
    channel: process.env.CI ? undefined : "chrome",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure"
  },
  projects: [
    ...chromiumProjects,
    ...(process.env.CI
      ? [
          {
            name: "webkit-mobile-390",
            use: {
              browserName: "webkit" as const,
              viewport: { width: 390, height: 844 },
              hasTouch: true,
              isMobile: true
            }
          }
        ]
      : [])
  ],
  webServer: {
    command: useProductionServer
      ? `npm run start:prod -- --hostname 127.0.0.1 --port ${port}`
      : `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    env: useProductionServer
      ? {}
      : {
          NEXT_DIST_DIR: ".next-playwright"
        },
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
