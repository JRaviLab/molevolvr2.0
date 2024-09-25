import { expect, test } from "@playwright/test";
import analyses from "@/fixtures/analyses.json" with { type: "json" };

test("Example analyses show", async ({ page }) => {
  await page.goto("/");
  for (const { name } of analyses) expect(page.getByText(name));
});
