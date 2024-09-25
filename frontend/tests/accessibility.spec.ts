import { configureAxe, getViolations, injectAxe } from "axe-playwright";
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

/** axe rule overrides */
const rules = [
  /**
   * color contrast standards are often not correct:
   *
   * https://github.com/w3c/wcag/issues/695
   * https://uxmovement.com/buttons/the-myths-of-color-contrast-accessibility/
   * https://github.com/Myndex/SAPC-APCA
   * https://twitter.com/AlPackah/status/1773375760125857949
   * https://twitter.com/DanHollick/status/1417895151003865090
   * https://twitter.com/DanHollick/status/1468958644364402702
   * https://twitter.com/argyleink/status/1329091518032867328
   */
  { id: "color-contrast", enabled: false },
];

/** generic page axe test */
const checkPage = (path: string) =>
  test(`Accessibility check ${path}`, async ({ page, browserName }) => {
    test.skip(browserName !== "chromium", "Only test Axe on chromium");

    /** navigate to page */
    await page.goto(path);

    /** wait for content to load */
    await page.waitForSelector("footer");
    await page.waitForTimeout(1000);

    /** setup axe */
    await injectAxe(page);
    await configureAxe(page, { rules });

    /** axe check */
    const violations = await getViolations(page);
    const violationsMessage = JSON.stringify(violations, null, 2);
    expect(violationsMessage).toBe("[]");
  });

/** check all pages */
for (const path of paths) checkPage(path);
