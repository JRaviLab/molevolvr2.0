import { defineConfig, devices } from "@playwright/test";

const port = 1234;
const url = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: "75%",
  reporter: "html",
  use: { baseURL: url },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],

  webServer: {
    /** dev mode penalizes lighthouse performance checks */
    command: `bun run build && bun run preview --port ${port}`,
    url,
    reuseExistingServer: true,
  },
});
