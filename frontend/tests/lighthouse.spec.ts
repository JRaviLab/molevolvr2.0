import type { Config } from "lighthouse";
import type { Browser } from "playwright";
import { chromium, test } from "@playwright/test";
import getPort from "get-port";
import { playAudit } from "playwright-lighthouse";
import { paths } from "./paths";
import { log } from "./util";

log();

const thresholds = {
  /** https://github.com/abhinaba-ghosh/playwright-lighthouse/issues/31 */
  performance: 0,
  accessibility: 90,
  "best-practices": 85,
  seo: 70,
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

/** extend standard playwright test function */
/** https://github.com/abhinaba-ghosh/playwright-lighthouse?tab=readme-ov-file#usage-with-playwright-test-runner */
const _test = test.extend<object, { port: number; browser: Browser }>({
  port: [
    /** https://github.com/microsoft/playwright/issues/14590 */
    // eslint-disable-next-line
    async ({}, use) => {
      /** get unique port for each worker to support parallel tests */
      const port = await getPort();
      await use(port);
    },
    { scope: "worker" },
  ],
  browser: [
    async ({ port }, use) => {
      /** open browser with flag to support remote control */
      const browser = await chromium.launch({
        args: [`--remote-debugging-port=${port}`],
      });
      await use(browser);
    },
    { scope: "worker" },
  ],
});

const checkPage = (path: string) =>
  _test(`Lighthouse check ${path}`, async ({ browserName, page, port }) => {
    test.skip(browserName !== "chromium", "Lighthouse only works in Chromium");

    /** test can be slow on ci on very large page (e.g. testbed) */
    test.setTimeout(2 * 60 * 1000);

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
await Promise.all(paths.map(checkPage));
