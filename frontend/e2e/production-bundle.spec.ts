import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, type Page, test } from "@playwright/test";

const testDir = dirname(fileURLToPath(import.meta.url));
const frontendRoot = resolve(testDir, "..");
const repoRoot = resolve(frontendRoot, "..");
const bundlePath = resolve(
  repoRoot,
  "custom_components/intelligent_load_controller/frontend/dist/intelligent-load-controller.js",
);

test.describe.configure({ mode: "serial" });

test.beforeAll(() => {
  execFileSync("npm", ["--prefix", frontendRoot, "run", "build"], {
    cwd: repoRoot,
    stdio: "inherit",
  });
});

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console error: ${message.text()}`);
    }
  });
  page.on("requestfailed", (request) => {
    if (request.resourceType() === "script") {
      errors.push(`script failed: ${request.url()} ${request.failure()?.errorText ?? ""}`);
    }
  });
  await page.route("https://bundle.invalid/", async (route) => {
    await route.fulfill({
      contentType: "text/html; charset=utf-8",
      body: "<!doctype html><html><body></body></html>",
    });
  });
  await page.route("https://bundle.invalid/intelligent-load-controller.js", async (route) => {
    await route.fulfill({
      contentType: "application/javascript; charset=utf-8",
      body: readFileSync(bundlePath, "utf8"),
    });
  });
  await page.goto("https://bundle.invalid/");
  await page.exposeFunction("__ilcProductionBundleErrors", () => errors);
});

test("production bundle registers the panel in Chromium without a fake process global", async ({
  page,
}) => {
  await loadProductionBundle(page);

  await expect(page.locator("intelligent-load-controller-panel")).toBeVisible();
  await expect(page.locator("intelligent-load-controller-panel").getByText("No controlled loads")).toBeVisible();
  await expectNoBrowserBundleErrors(page);
});

test("production panel remains visible when the optional chart component fails", async ({ page }) => {
  await page.evaluate(() => {
    const originalDefine = customElements.define.bind(customElements);
    customElements.define = (name, constructor, options) => {
      if (name === "ilc-site-snapshot-chart") {
        throw new Error("Forced chart registration failure");
      }
      return originalDefine(name, constructor, options);
    };
  });

  await loadProductionBundle(page, { loads: [{ load_id: "hot-water", name: "Hot water" }] });

  const panel = page.locator("intelligent-load-controller-panel");
  await expect(panel).toBeVisible();
  await expect(panel.getByText("Hot water")).toBeVisible();
  await expect(panel.getByText("Chart unavailable; textual site metrics remain available.")).toBeVisible();
  await expectNoBrowserBundleErrors(page);
});

async function loadProductionBundle(
  page: Page,
  options: { loads?: readonly Record<string, unknown>[] } = {},
): Promise<void> {
  expect(await page.evaluate(() => "process" in window)).toBe(false);
  await page.addScriptTag({ type: "module", url: "/intelligent-load-controller.js" });
  await page.evaluate(() => customElements.whenDefined("intelligent-load-controller-panel"));
  expect(await page.evaluate(() => customElements.get("intelligent-load-controller-panel") !== undefined)).toBe(
    true,
  );

  await page.evaluate((loads) => {
    const site = {
      entry_id: "production-bundle-site",
      site_id: "production-bundle-site",
      name: "Production bundle site",
      state: "idle",
      health: "healthy",
      active_load_count: 0,
      waiting_load_count: loads.length,
      grid_import: { value: 2300, unit: "W", quality: "measured" },
      grid_export: { value: 0, unit: "W", quality: "measured" },
      solar_production: { value: 1800, unit: "W", quality: "measured" },
      controlled_power: { value: 1200, unit: "W", quality: "measured" },
      updated_at: "2026-07-23T00:00:00Z",
    };
    const panel = document.createElement("intelligent-load-controller-panel");
    panel.hass = {
      language: "en",
      config: { currency: "AUD", time_zone: "Australia/Brisbane" },
      connection: {
        connected: true,
        async subscribeMessage() {
          return () => undefined;
        },
      },
      async callWS<TResponse>(message: Record<string, unknown>): Promise<TResponse> {
        let response: unknown;
        switch (message["type"]) {
          case "intelligent_load_controller/v1/site_list":
            response = { sites: [site] };
            break;
          case "intelligent_load_controller/v1/site_summary":
            response = site;
            break;
          case "intelligent_load_controller/v1/load_list":
            response = { loads };
            break;
          default:
            response = {};
        }
        return response as TResponse;
      },
    };
    document.body.append(panel);
  }, options.loads ?? []);
}

async function expectNoBrowserBundleErrors(page: Page): Promise<void> {
  const errors = await page.evaluate(async () => {
    const getErrors = window.__ilcProductionBundleErrors as () => Promise<string[]>;
    return getErrors();
  });
  expect(errors).toEqual([]);
}

declare global {
  interface Window {
    __ilcProductionBundleErrors?: () => Promise<string[]>;
  }
}
