import { mkdir } from "fs/promises";
import { join } from "path";
import { playAudit } from "playwright-lighthouse";
import { test } from "@playwright/test";
//import { paths } from "./axe.spec";
import analyses from "@/fixtures/analyses.json" with { type: "json" };
import { log } from "./util";

log();

export const paths = [
  "/testbed",
  "/", 
  "/load-analysis", 
  "/new-analysis",
  "/about",
  ...analyses.map((analysis) => `/analysis/${analysis.id}`),
];

const thresholds = {
  performance: 80,
  accessibility: 90,
  "best-practices": 85,
  seo: 85,
  pwa: 50,
};

const config = {
  extends: "lighthouse:default",
  settings: {
    formFactor: "desktop" as const,
    screenEmulation: { disabled: true },
    //emulatedUserAgent: "desktop",
    // Enable APCA contrast checking
    accessibilityScoring: "apca",
  },
};

const port = 1234;

// Ensure reports directory exists
const reportsDir = "lighthouse-reports";
await mkdir(reportsDir, { recursive: true });

// Generic page lighthouse test
const checkPage = (path: string) =>
  test(`Lighthouse check ${path}`, async ({ browser }) => {
    test.skip(
      browser.browserType().name() !== "chromium",
      "Lighthouse only works with Chromium",
    );

    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();

    // Sanitize path for filename
    const sanitizedPath = path.replace(/[\/\?#]/g, "-").replace(/^-|-$/g, "");
    const reportName = `lighthouse-${sanitizedPath}`;
    const reportPath = join(reportsDir, reportName);
    console.log(reportPath);
    console.log("Reports directory:", reportsDir);

    try {
      await page.goto(path);
      await page.waitForSelector("footer");
      await page.waitForTimeout(1000);

      await playAudit({
        page: page,
        thresholds: thresholds,
        port: port,
        config: config,
        reports: {
          formats: {
            html: true,
            json: true,
            csv: true,
          },
          name: reportName,
          directory: reportsDir,
        },
      });

      console.log(`Reports generated for ${path}:`);
      console.log(`- HTML: ${reportPath}.html`);
      console.log(`- JSON: ${reportPath}.json`);
      console.log(`- CSV: ${reportPath}.csv`);
    } catch (error) {
      console.error(`Error generating report for ${path}:`, error);
    } finally {
      await context.close();
    }
  });

// Check all pages
for (const path of paths) checkPage(path);
