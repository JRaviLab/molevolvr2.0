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
      /** get page violations */
      const { violations } = await new AxeBuilder({ page }).analyze();

      const warnRules = [
        /** just warn about color-contrast violations */
        /** https://github.com/dequelabs/axe-core/issues/3325#issuecomment-2383832705 */
        "color-contrast",
      ];

      /** split up critical/non-critical violations */
      const isCritical =
        (match: boolean) => (violation: (typeof violations)[number]) =>
          !warnRules.includes(violation.id) === match;
      const criticals = violations.filter(isCritical(true));
      const warnings = violations.filter(isCritical(false));

      /** fail test on critical violations */
      expect(criticals).toEqual([]);
      /** just console log warnings on non-critical violations */
      console.warn(warnings);
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
