import { playAudit } from "playwright-lighthouse";
import { chromium, test } from "@playwright/test";
import { paths } from "./paths";
import { log } from "./util";

log();

const port = 1234;

const thresholds = {
  performance: 80,
  accessibility: 90,
  "best-practices": 85,
  seo: 85,
  pwa: 0,
};

const config = {
  extends: "lighthouse:default",
  settings: {
    formFactor: "desktop" as const,
    screenEmulation: { disabled: true },
    accessibilityScoring: "apca",
  },
};

/** output directory */
const directory = "lighthouse";

const checkPage = (path: string) =>
  test(`Lighthouse check ${path}`, async ({ browserName }) => {
    test.skip(browserName !== "chromium", "Lighthouse only works in Chromium");

    /** launch chromium with necessary flags */
    const browser = await chromium.launch({
      args: [`--remote-debugging-port=${port}`],
    });
    const page = await browser.newPage();

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

    /** clean up */
    await browser.close();
  });

/** check all pages */
for (const path of paths) checkPage(path);
