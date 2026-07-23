import { describe, expect, it } from "vitest";

import {
  classifySiteFlow,
  createTodayTimelinePresentation,
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

  it("prefers backend-ranked attention items when the site summary provides them", () => {
    const presentation = createOverviewPresentation({
      site: {
        ...baseSite,
        health: "warning",
        attention: [
          {
            id: "site:configuration_invalid",
            code: "configuration_invalid",
            rank: 9,
            severity: "warning",
            affected_kind: "site",
            display_name: "Home",
            action: "settings",
          },
          {
            id: "load:hws:manual_indefinite_override",
            code: "manual_indefinite_override",
            rank: 5,
            severity: "warning",
            affected_kind: "load",
            affected_id: "hws",
            display_name: "Hot water",
            action: "load_detail",
          },
        ],
      },
      loads: [
        load({
          load_id: "hws",
          name: "Hot water",
          manual_override: "indefinite_on",
        }),
      ],
    });

    expect(presentation.attention.map((item) => item.id)).toEqual([
      "load:hws:manual_indefinite_override",
      "site:configuration_invalid",
    ]);
    expect(presentation.attention[0]).toMatchObject({
      titleKey: "overview.attention.indefiniteOverride",
      affectedLoadId: "hws",
      action: "load_detail",
    });
    expect(presentation.attention[1]).toMatchObject({
      titleKey: "overview.attention.configurationInvalid",
      action: "settings",
    });
    expect(presentation.attention).toHaveLength(2);
  });

  it("keeps non-duplicated typed-field attention when the backend feed is only partial", () => {
    const presentation = createOverviewPresentation({
      site: {
        ...baseSite,
        attention: [
          {
            id: "site:input_missing",
            code: "input_missing",
            rank: 6,
            severity: "warning",
            affected_kind: "site",
            display_name: "Home",
            action: "diagnostics",
          },
        ],
      },
      loads: [
        load({
          load_id: "ev",
          name: "EV charger",
          target_status: "at_risk",
        }),
      ],
    });

    expect(presentation.attention.map((item) => item.id)).toEqual([
      "site:input_missing",
      "ev:risk",
    ]);
    expect(presentation.attention[1]).toMatchObject({
      code: "target_at_risk",
      titleKey: "overview.attention.targetAtRisk",
      affectedLoadId: "ev",
      action: "load_detail",
    });
  });

  it("maps backend load fault attention codes to specific user-facing copy", () => {
    const presentation = createOverviewPresentation({
      site: {
        ...baseSite,
        attention: [
          {
            id: "load:hws:actuator_feedback_mismatch",
            code: "actuator_feedback_mismatch",
            rank: 1,
            severity: "critical",
            affected_kind: "load",
            affected_id: "hws",
            display_name: "Hot water",
            action: "load_detail",
          },
          {
            id: "load:invalid:0:load_configuration_invalid",
            code: "load_configuration_invalid",
            rank: 9,
            severity: "warning",
            affected_kind: "load",
            display_name: "Broken load",
            action: "settings",
          },
        ],
      },
      loads: [],
    });

    expect(presentation.attention.map((item) => item.titleKey)).toEqual([
      "overview.attention.feedbackMismatch",
      "overview.attention.loadConfigurationInvalid",
    ]);
    expect(presentation.attention[0]).toMatchObject({
      summaryKey: "overview.attention.feedbackMismatchSummary",
      affectedLoadId: "hws",
      action: "load_detail",
    });
    expect(presentation.attention[1]).toMatchObject({
      summaryKey: "overview.attention.loadConfigurationInvalidSummary",
      action: "settings",
    });
  });

  it("maps backend target and deadline attention without duplicating fallback load risk", () => {
    const presentation = createOverviewPresentation({
      site: {
        ...baseSite,
        attention: [
          {
            id: "load:ev:target_impossible",
            code: "target_impossible",
            rank: 3,
            severity: "critical",
            affected_kind: "load",
            affected_id: "ev",
            display_name: "EV charger",
            action: "load_detail",
          },
          {
            id: "load:hws:target_at_risk",
            code: "target_at_risk",
            rank: 4,
            severity: "warning",
            affected_kind: "load",
            affected_id: "hws",
            display_name: "Hot water",
            action: "load_detail",
          },
          {
            id: "load:pool:deadline_approaching",
            code: "deadline_approaching",
            rank: 8,
            severity: "info",
            affected_kind: "load",
            affected_id: "pool",
            display_name: "Pool pump",
            action: "load_detail",
          },
        ],
      },
      loads: [
        load({ load_id: "ev", name: "EV charger", target_status: "impossible" }),
        load({ load_id: "hws", name: "Hot water", target_status: "at_risk" }),
      ],
    });

    expect(presentation.attention.map((item) => item.id)).toEqual([
      "load:ev:target_impossible",
      "load:hws:target_at_risk",
      "load:pool:deadline_approaching",
    ]);
    expect(presentation.attention.map((item) => item.titleKey)).toEqual([
      "overview.attention.targetImpossible",
      "overview.attention.targetAtRisk",
      "overview.attention.deadlineApproaching",
    ]);
    expect(presentation.attention.every((item) => item.action === "load_detail")).toBe(true);
  });

  it("creates a compressed today timeline from backend intervals without inventing decisions", () => {
    const timeline = createTodayTimelinePresentation(
      [
        {
          load_id: "pool",
          start_at: "2026-07-23T02:00:00Z",
          end_at: "2026-07-23T03:00:00Z",
          power_w: 900,
          reason_code: "free_period_run",
        },
        {
          load_id: "hws",
          start_at: "2026-07-23T00:00:00Z",
          end_at: "2026-07-23T01:00:00Z",
          power_w: 2400,
          reason_code: "solar_export_qualified",
        },
        {
          load_id: "ignored",
          start_at: "bad",
          end_at: "2026-07-23T01:00:00Z",
        },
      ],
      [
        load({ load_id: "hws", name: "Hot water" }),
        load({ load_id: "pool", name: "Pool pump" }),
      ],
      new Date("2026-07-23T00:30:00Z"),
    );

    expect(timeline.loadCount).toBe(2);
    expect(timeline.currentPercent).toBeCloseTo(16.67, 2);
    expect(timeline.segments.map((segment) => [segment.loadName, segment.tone])).toEqual([
      ["Hot water", "solar"],
      ["Pool pump", "free"],
    ]);
    expect(timeline.nextSegment).toMatchObject({
      loadId: "hws",
      reasonCode: "solar_export_qualified",
    });
  });
});
