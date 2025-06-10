import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { paths } from "./paths";
import { log } from "./util";

log();

/** generic page axe test */
const checkPage = (path: string) =>
  test(`Axe check ${path}`, async ({ browserName, page }) => {
    /** axe tests should be independent of browser, so only run one */
    test.skip(browserName !== "chromium", "Only test Axe on chromium");

    /** test can be slow on ci on very large page (e.g. testbed) */
    test.setTimeout(2 * 60 * 1000);

    /** navigate to page */
    await page.goto(path);

    /** wait for content to load */
    await page.waitForSelector("footer");
    await page.waitForTimeout(1000);

    /** axe check */
    const check = async () => {
      /** get page violations */
      const { violations } = await new AxeBuilder({ page })
        .exclude(".axe-ignore")
        .analyze();

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

      /** log errors */
      if (criticals.length) {
        const json = JSON.stringify(criticals, null, 2);
        console.error(json);
        /** just log warnings on non-critical violations */
        test.info().annotations.push({
          type: "Axe Error",
          description: json,
        });
      }

      /** fail test on critical violations */
      expect(criticals.length).toBe(0);

      /** just log warnings on non-critical violations */
      test.info().annotations.push({
        type: "Axe Warning",
        description: JSON.stringify(warnings, null, 2),
      });
    };

    await check();
    /** check dark mode */
    await page
      .locator("header button[role='switch'][aria-label*='mode']")
      .click();
    await check();
  });

/** check all pages */
await Promise.all(paths.map(checkPage));
