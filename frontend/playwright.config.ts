import { defineConfig, devices } from "@playwright/test";

const port = "1234";
const url = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests",
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
    // { name: "Mobile Chrome", use: { ...devices["Pixel 5"] } },
    // { name: "Mobile Safari", use: { ...devices["iPhone 12"] } },
  ],

  webServer: {
    command: `bun run dev --port ${port}`,
    url,
    reuseExistingServer: !process.env.CI,
  },
});
