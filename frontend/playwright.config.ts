import { defineConfig, devices } from "@playwright/test";

const port = "1234";
const url = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests",
  //testMatch: "tests/lighthouse.spec.ts", //This runs light house test for only the lighhouse.spec.ts file
  fullyParallel: true,
  reporter: "html",
  use: {
    baseURL: url,
    // headless: false,
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],

  webServer: {
    command: process.env.CI
      ? `bun run build && bun run start --port ${port}` // production build for CI/Lighthouse
      : `bun run dev --port ${port}`, // dev build for regular testing
    url,
    reuseExistingServer: !process.env.CI,
  },
});
