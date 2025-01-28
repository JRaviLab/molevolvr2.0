import { createRequire } from "module";
import { expect, test } from "@playwright/test";

const analyses = createRequire(import.meta.url)("@/fixtures/analyses.json");

test("Example analyses show", async ({ page }) => {
  await page.goto("/");
  for (const { name } of analyses) expect(page.getByText(name));
});
