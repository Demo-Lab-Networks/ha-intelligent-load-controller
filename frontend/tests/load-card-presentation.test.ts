import { describe, expect, it } from "vitest";

import { createLoadCardPresentation } from "../src/features/loads/load-card-presentation";
import type { LoadSummary } from "../src/models/dashboard";

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

describe("load card presentation", () => {
  it("uses hot-water-specific vocabulary for controlled heating", () => {
    expect(
      createLoadCardPresentation(
        load({
          load_type: "hot_water",
          controller_state: "solar_run",
          current_power: { value: 2400, unit: "W" },
          target_status: "on_track",
        }),
      ),
    ).toMatchObject({
      kind: "hot_water",
      stateKey: "load.summary.hwsHeating",
      progressLabelKey: "load.progress.readiness",
      primaryActionKey: "load.open",
      targetLabelKey: "load.target.onTrack",
    });
  });

  it("prioritises review actions and EV vocabulary when a target is at risk", () => {
    expect(
      createLoadCardPresentation(
        load({
          load_type: "binary_ev",
          controller_state: "waiting_for_window",
          target_status: "at_risk",
        }),
      ),
    ).toMatchObject({
      kind: "ev",
      tone: "warning",
      stateKey: "load.summary.atRisk",
      progressLabelKey: "load.progress.soc",
      primaryActionKey: "load.action.reviewTarget",
      targetLabelKey: "load.target.atRisk",
    });
  });

  it("surfaces manual override management without issuing card-level actuator actions", () => {
    const presentation = createLoadCardPresentation(
      load({
        manual_override: "indefinite_on",
      }),
    );

    expect(presentation).toMatchObject({
      stateKey: "load.summary.manualIndefinite",
      primaryActionKey: "load.action.manageOverride",
      overrideLabelKey: "load.override.indefiniteOn",
    });
    expect(presentation.badges.map((badge) => badge.labelKey)).toContain("load.override.indefiniteOn");
  });

  it("keeps completed battery loads quiet and detail-oriented", () => {
    expect(
      createLoadCardPresentation(
        load({
          load_type: "battery_charger",
          controller_state: "target_complete",
          target_status: "complete",
        }),
      ),
    ).toMatchObject({
      kind: "battery",
      tone: "success",
      stateKey: "load.summary.batteryComplete",
      progressLabelKey: "load.progress.energy",
      primaryActionKey: "load.action.viewDetails",
    });
  });
});
