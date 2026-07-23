import { describe, expect, it } from "vitest";

import {
  createLoadCataloguePresentation,
  type LoadCatalogueFilters,
} from "../src/features/loads/load-catalogue";
import type { LoadSummary } from "../src/models/dashboard";

const BASE_FILTERS: LoadCatalogueFilters = {
  query: "",
  sort: "needs_attention",
  status: "all",
  type: "all",
  group: "status",
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

describe("load catalogue presentation", () => {
  it("filters by search, status, and type without mutating load summaries", () => {
    const loads = [
      load({ load_id: "hws", name: "Hot water", load_type: "hot_water", area: "Plant" }),
      load({
        load_id: "ev",
        name: "Family EV",
        load_type: "binary_ev",
        target_status: "at_risk",
        area: "Garage",
      }),
      load({ load_id: "pool", name: "Pool pump", load_type: "generic_binary", area: "Yard" }),
    ];

    const presentation = createLoadCataloguePresentation(loads, {
      ...BASE_FILTERS,
      query: "garage",
      status: "needs_attention",
      type: "binary_ev",
    });

    expect(presentation.totalCount).toBe(3);
    expect(presentation.visibleCount).toBe(1);
    expect(presentation.groups.flatMap((group) => group.loads).map((item) => item.load_id)).toEqual(["ev"]);
    expect(presentation.typeOptions.map((option) => option.value)).toEqual([
      "binary_ev",
      "generic_binary",
      "hot_water",
    ]);
  });

  it("sorts attention, active, priority, power, deadline, and name deterministically", () => {
    const loads = [
      load({ load_id: "pool", name: "Pool pump", current_power: { value: 650, unit: "W" }, priority: 30 }),
      load({
        load_id: "ev",
        name: "EV charger",
        controller_state: "scheduled_run",
        current_power: { value: 7200, unit: "W" },
        priority: 80,
        deadline: "2026-07-23T10:00:00Z",
      }),
      load({
        load_id: "hws",
        name: "Hot water",
        target_status: "impossible",
        current_power: { value: 2400, unit: "W" },
        priority: 50,
        deadline: "2026-07-23T08:00:00Z",
      }),
    ];

    const ordered = (sort: LoadCatalogueFilters["sort"]): readonly string[] =>
      createLoadCataloguePresentation(loads, { ...BASE_FILTERS, sort, group: "none" }).groups.flatMap(
        (group) => group.loads.map((item) => item.load_id),
      );

    expect(ordered("needs_attention")).toEqual(["hws", "ev", "pool"]);
    expect(ordered("active_first")).toEqual(["ev", "hws", "pool"]);
    expect(ordered("priority")).toEqual(["ev", "hws", "pool"]);
    expect(ordered("highest_power")).toEqual(["ev", "hws", "pool"]);
    expect(ordered("earliest_deadline")).toEqual(["hws", "ev", "pool"]);
    expect(ordered("name")).toEqual(["EV charger", "Hot water", "Pool pump"].map((name) => {
      const item = loads.find((candidate) => candidate.name === name);
      if (!item) {
        throw new Error(`Missing fixture ${name}`);
      }
      return item.load_id;
    }));
  });

  it("groups visible loads by status, type, area, and priority", () => {
    const loads = [
      load({ load_id: "hws", name: "Hot water", load_type: "hot_water", area: "Plant", priority: 50 }),
      load({
        load_id: "ev",
        name: "EV charger",
        load_type: "binary_ev",
        controller_state: "scheduled_run",
        area: "Garage",
        priority: 90,
      }),
      load({
        load_id: "boost",
        name: "Boosted charger",
        manual_override: "indefinite_on",
        area: "Garage",
      }),
      load({ load_id: "done", name: "Battery", load_type: "battery_charger", target_status: "complete" }),
    ];

    const grouped = (group: LoadCatalogueFilters["group"]) =>
      createLoadCataloguePresentation(loads, { ...BASE_FILTERS, group }).groups;

    expect(grouped("status").map((group) => group.key)).toEqual([
      "manual",
      "running",
      "waiting",
      "complete",
    ]);
    expect(grouped("type").map((group) => group.titleKey)).toEqual([
      "load.type.battery",
      "load.type.ev",
      "load.type.generic",
      "load.type.hws",
    ]);
    expect(grouped("area").map((group) => group.titleValues?.["area"] ?? group.titleKey)).toEqual([
      "Garage",
      "Plant",
      "load.group.noArea",
    ]);
    expect(grouped("priority").map((group) => group.titleValues?.["priority"] ?? group.titleKey)).toEqual([
      "90",
      "50",
      "load.group.noPriority",
    ]);
  });
});
