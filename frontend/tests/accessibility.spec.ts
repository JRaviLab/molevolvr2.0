import registerAPCACheck from "apca-check";
import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import analyses from "@/fixtures/analyses.json" with { type: "json" };
import { log } from "./util";

log();

/** pages to test */
const paths = [
  "/testbed",
  "/",
  "/load-analysis",
  "/new-analysis",
  "/about",
  ...analyses.map((analysis) => `/analysis/${analysis.id}`),
];

/** NOT WORKING YET https://github.com/StackExchange/apca-check/issues/143 */
registerAPCACheck("bronze");

/** generic page axe test */
const checkPage = (path: string) =>
  test(`Accessibility check ${path}`, async ({ page, browserName }) => {
    /** axe tests should be independent of browser, so only run one */
    test.skip(browserName !== "chromium", "Only test Axe on chromium");

    /** navigate to page */
    await page.goto(path);

    /** wait for content to load */
    await page.waitForSelector("footer");
    await page.waitForTimeout(1000);

    /** axe check */
    const check = async () => {
      const { violations } = await new AxeBuilder({ page })
        /** https://github.com/dequelabs/axe-core/issues/3325 */
        .options({ rules: { "color-contrast": { enabled: false } } })
        .analyze();
      expect(violations).toEqual([]);
    };

    await check();
    /** check dark mode */
    await page
      .locator("header button[role='switch'][aria-label*='mode']")
      .click();
    await check();
  });

/** check all pages */
for (const path of paths) checkPage(path);
