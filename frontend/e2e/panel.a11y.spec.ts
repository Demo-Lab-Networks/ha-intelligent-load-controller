import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("@a11y loads empty state is keyboard and screen-reader reachable", async ({ page }) => {
  await page.goto("/?empty=1&route=/loads");

  const panel = page.locator("intelligent-load-controller-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByText("No controlled loads have been configured yet.")).toBeVisible();

  const accessibility = await new AxeBuilder({ page })
    .include("intelligent-load-controller-panel")
    .analyze();
  expect(accessibility.violations).toEqual([]);
});

test("@a11y populated overview exposes a text equivalent for its chart", async ({ page }) => {
  await page.goto("/");

  const panel = page.locator("intelligent-load-controller-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(panel.locator("ilc-site-snapshot-chart")).toBeVisible();
  await expect(panel.locator("dt").filter({ hasText: "Grid import" })).toBeVisible();

  const accessibility = await new AxeBuilder({ page })
    .include("intelligent-load-controller-panel")
    .analyze();
  expect(accessibility.violations).toEqual([]);
});

test("@a11y direct load route keeps controls reachable", async ({ page }) => {
  await page.goto("/?route=/load/hot-water");

  const panel = page.locator("intelligent-load-controller-panel");
  await expect(panel.getByRole("heading", { name: "Hot water" })).toBeVisible();
  await expect(panel.getByText("Controls and overrides")).toBeVisible();
  await expect(panel.getByRole("button", { name: "Disable Automatic control" })).toBeVisible();

  const accessibility = await new AxeBuilder({ page })
    .include("intelligent-load-controller-panel")
    .analyze();
  expect(accessibility.violations).toEqual([]);
});

test("@a11y narrow layout keeps primary navigation usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?route=/plan");

  const panel = page.locator("intelligent-load-controller-panel");
  await expect(panel.getByRole("navigation", { name: "Intelligent Load Controller pages" })).toBeVisible();
  await expect(panel.getByRole("button", { name: "Overview" })).toBeVisible();
  await expect(panel.getByText("No current plan is available yet.")).toBeVisible();

  const accessibility = await new AxeBuilder({ page })
    .include("intelligent-load-controller-panel")
    .analyze();
  expect(accessibility.violations).toEqual([]);
});
