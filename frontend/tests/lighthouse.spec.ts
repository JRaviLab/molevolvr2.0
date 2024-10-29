import type { Config } from "lighthouse";
import { playAudit } from "playwright-lighthouse";
import { test } from "@playwright/test";
import { paths } from "./paths";
import { log } from "./util";

log();

const port = 1234;

const thresholds = {
  /** https://github.com/abhinaba-ghosh/playwright-lighthouse/issues/31 */
  performance: 0,
  accessibility: 90,
  "best-practices": 85,
  seo: 70,
  pwa: 0,
};

const config: Config = {
  extends: "lighthouse:default",
  settings: {
    formFactor: "desktop",
    screenEmulation: { disabled: true },
  },
};

/** output directory */
const directory = "lighthouse-report";

const checkPage = (path: string) =>
  test(`Lighthouse check ${path}`, async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Lighthouse only works in Chromium");

    /** navigate to page */
    await page.goto(path);

    /** wait for content to load */
    await page.waitForSelector("footer");
    await page.waitForTimeout(1000);

    /** run check */
    await playAudit({
      page,
      thresholds,
      port,
      config,
      reports: {
        formats: { html: true },
        name: path.replace(/[/?#]/g, "-").replace(/^-|-$/g, ""),
        directory,
      },
    });
  });

/** check all pages */
for (const path of paths) checkPage(path);
