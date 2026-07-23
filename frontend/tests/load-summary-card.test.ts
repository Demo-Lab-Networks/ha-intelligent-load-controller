import { afterEach, describe, expect, it } from "vitest";

import "../src/components/loads/ilc-load-summary-card";
import type { IlcLoadSummaryCard } from "../src/components/loads/ilc-load-summary-card";
import type { LoadSummary } from "../src/models/dashboard";
import type { HomeAssistant } from "../src/types/home-assistant";

const hass: HomeAssistant = {
  connection: { connected: true },
  language: "en",
  locale: { language: "en" },
  config: { time_zone: "UTC" },
  callWS: async <TResponse>(): Promise<TResponse> => ({}) as TResponse,
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

afterEach(() => {
  document.body.replaceChildren();
});

describe("ilc-load-summary-card", () => {
  it("renders structured backend next-action fields with localized reason text", async () => {
    const card = document.createElement("ilc-load-summary-card") as IlcLoadSummaryCard;
    card.hass = hass;
    card.load = load({
      next_action_at: "2026-07-23T11:00:00Z",
      next_action_kind: "start",
      next_action_reason_code: "lowest_cost_window",
    });
    document.body.append(card);

    await card.updateComplete;

    expect(card.textContent).toContain("Start");
    expect(card.textContent).toContain("This is the lowest-cost valid window.");
  });

  it("renders backend target progress with an accessible progress bar", async () => {
    const card = document.createElement("ilc-load-summary-card") as IlcLoadSummaryCard;
    card.hass = hass;
    card.load = load({
      progress: { current: 15, target: 30, unit: "min", percent: 50 },
      target_status: "at_risk",
    });
    document.body.append(card);

    await card.updateComplete;

    const progress = card.querySelector('[role="progressbar"]');
    expect(card.textContent).toContain("50%");
    expect(card.textContent).toContain("Target at risk");
    expect(progress?.getAttribute("aria-valuenow")).toBe("50");
  });
});
