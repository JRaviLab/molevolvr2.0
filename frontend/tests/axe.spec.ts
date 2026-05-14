import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { paths } from "./paths";
import { log, stringify } from "./util";

log();

/** generic page axe test */
const checkPage = (path: string) =>
  test(`Axe check page "${path}"`, async ({ browserName, page }) => {
    /** axe tests should be independent of browser, so only run one */
    test.skip(browserName !== "chromium", "Only test Axe on chromium");

    /** test can be slow on ci on very large page (e.g. testbed) */
    test.setTimeout(1 * 60 * 1000);

    /** navigate to page */
    await page.goto(path);

    /** wait for some content to render */
    await expect(page.locator("footer")).toBeVisible();

    /** axe check */
    const check = async () => {
      /** get page violations */
      const { violations } = await new AxeBuilder({ page }).analyze();

      /** split up critical/non-critical */
      const { critical = [], warning = [] } = Object.groupBy(
        violations,
        ({ id }) => {
          /** https://github.com/dequelabs/axe-core/issues/3325#issuecomment-2383832705 */
          if (id === "color-contrast") return "warning";
          else return "critical";
        },
      );

      test.info().annotations.push({
        type: "Axe violations",
        description: stringify(critical),
      });

      test.info().annotations.push({
        type: "Axe warnings",
        description: stringify(warning),
      });

      /** fail test on critical */
      expect(critical?.length).toBe(0);
    };

    /** check page */
    await check();
    /** turn on dark mode */
    await page.getByLabel(/dark mode/i).click();
    /** check page again */
    await check();
  });

/** check all pages */
await Promise.all(paths.map(checkPage));
