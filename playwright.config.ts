import { defineConfig } from "@playwright/test";

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 2,
  reporter: [
    [process.env.CI ? "line" : "list"],
    ["html", { open: "never" }]
  ],
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
    }
  ],
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
