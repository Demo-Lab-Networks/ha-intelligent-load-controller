import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("@a11y panel empty state is keyboard and screen-reader reachable", async ({ page }) => {
  await page.goto("/?empty=1");

  const panel = page.locator("intelligent-load-controller-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByText("No controlled loads have been configured yet.")).toBeVisible();

  const accessibility = await new AxeBuilder({ page })
    .include("intelligent-load-controller-panel")
    .analyze();
  expect(accessibility.violations).toEqual([]);
});

test("@a11y populated dashboard exposes a text equivalent for its chart", async ({ page }) => {
  await page.goto("/");

  const panel = page.locator("intelligent-load-controller-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByText("Hot water")).toBeVisible();
  await expect(panel.locator("ilc-site-snapshot-chart")).toBeVisible();
  await expect(panel.locator("dt").filter({ hasText: "Grid import" })).toBeVisible();

  const accessibility = await new AxeBuilder({ page })
    .include("intelligent-load-controller-panel")
    .analyze();
  expect(accessibility.violations).toEqual([]);
});
