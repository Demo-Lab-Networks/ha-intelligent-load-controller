import { describe, expect, it } from "vitest";

import {
  classifySiteFlow,
  createOverviewPresentation,
  groupOverviewLoads,
  summariseTargets,
} from "../src/features/overview/overview-presentation";
import type { DashboardData, LoadSummary, SiteSummary } from "../src/models/dashboard";

const baseSite: SiteSummary = {
  site_id: "site",
  name: "Home",
  controller_state: "idle",
  active_load_count: 0,
  waiting_load_count: 0,
  health: "healthy",
};

function load(overrides: Partial<LoadSummary>): LoadSummary {
  return {
    load_id: "load",
    name: "Load",
    load_type: "generic_binary",
    controller_state: "idle",
    reason_code: "lowest_cost_window",
    automatic_control: true,
    ...overrides,
  };
}

describe("overview presentation", () => {
  it("classifies live site flow from backend-provided import and export measurements", () => {
    expect(
      classifySiteFlow({
        ...baseSite,
        grid_export: { value: 1200, unit: "W", quality: "measured" },
        grid_import: { value: 0, unit: "W", quality: "measured" },
      }),
    ).toBe("exporting");
    expect(
      classifySiteFlow({
        ...baseSite,
        grid_import: { value: 800, unit: "W", quality: "measured" },
        grid_export: { value: 0, unit: "W", quality: "measured" },
      }),
    ).toBe("importing");
  });

  it("summarises backend target statuses without parsing reason text", () => {
    expect(
      summariseTargets([
        load({ target_status: "complete" }),
        load({ load_id: "hws", target_status: "on_track" }),
        load({ load_id: "ev", target_status: "at_risk" }),
        load({ load_id: "battery", target_status: "impossible" }),
      ]),
    ).toEqual({
      total: 4,
      complete: 1,
      onTrack: 1,
      atRisk: 1,
      impossible: 1,
      unknown: 0,
    });
  });

  it("creates attention items and operational load groups from backend state fields", () => {
    const dashboard: DashboardData = {
      site: {
        ...baseSite,
        health: "warning",
        active_load_count: 1,
        waiting_load_count: 3,
      },
      loads: [
        load({
          load_id: "hws",
          name: "Hot water",
          load_type: "hot_water",
          controller_state: "solar_run",
          current_power: { value: 2400, unit: "W", quality: "measured" },
          target_status: "on_track",
        }),
        load({
          load_id: "ev",
          name: "EV",
          load_type: "ev_charger",
          target_status: "at_risk",
        }),
        load({
          load_id: "pool",
          name: "Pool",
          next_action: "Start during free period",
        }),
        load({
          load_id: "battery",
          name: "Battery charger",
          load_type: "battery_charger",
          target_status: "complete",
        }),
      ],
    };

    const presentation = createOverviewPresentation(dashboard);
    expect(presentation.hero.titleKey).toBe("overview.status.watch");
    expect(presentation.attention.map((item) => item.id)).toEqual([
      "site-health-warning",
      "ev:risk",
    ]);
    expect(groupOverviewLoads(dashboard.loads).map((group) => [group.key, group.loads.map((item) => item.load_id)])).toEqual([
      ["attention", ["ev"]],
      ["running", ["hws"]],
      ["upcoming", ["pool"]],
      ["complete", ["battery"]],
    ]);
  });
});
