import { defineConfig, devices } from "@playwright/test";

const port = 1234;
const url = `http://localhost:${port}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: "75%",
  reporter: "html",
  use: {
    baseURL: url,
    // headless: false,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: { args: [`--remote-debugging-port=${port}`] },
      },
    },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],

  webServer: {
    /** do production build to not be penalized in lighthouse checks */
    command: `bun run build && bun run preview --port ${port}`,
    url,
    reuseExistingServer: true,
  },
});
