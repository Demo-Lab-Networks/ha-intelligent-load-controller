import { afterEach, describe, expect, it } from "vitest";

import "../src/components/overview/ilc-home-status-hero";
import type { OverviewHeroPresentation } from "../src/features/overview/overview-presentation";
import type { SiteSummary } from "../src/models/dashboard";
import type { HomeAssistant } from "../src/types/home-assistant";

const hass: HomeAssistant = {
  connection: { connected: true },
  language: "en",
  locale: { language: "en" },
  config: { time_zone: "UTC" },
  callWS: async <TResponse>(): Promise<TResponse> => ({}) as TResponse,
};

const site: SiteSummary = {
  site_id: "site",
  name: "Home",
  controller_state: "idle",
  active_load_count: 0,
  waiting_load_count: 1,
  health: "healthy",
  grid_import: { value: 500, unit: "W", quality: "measured" },
  grid_export: { value: 0, unit: "W", quality: "measured" },
  controlled_power: { value: 0, unit: "W", quality: "measured" },
};

const presentation: OverviewHeroPresentation = {
  level: "warning",
  tone: "warning",
  titleKey: "overview.status.watch",
  summaryKey: "overview.status.attentionSummary",
  summaryValues: { count: 1 },
  flow: "importing",
  primaryReasonCode: "input_missing",
  nextActionAt: "2026-07-23T11:00:00Z",
  nextActionKind: "start",
  nextActionDisplayName: "Hot water",
  nextActionReasonCode: "lowest_cost_window",
  targetSummary: {
    total: 1,
    complete: 0,
    onTrack: 1,
    atRisk: 0,
    impossible: 0,
    unknown: 0,
  },
};

afterEach(() => {
  document.body.replaceChildren();
});

describe("ilc-home-status-hero", () => {
  it("renders structured backend next-action fields with localized reason text", async () => {
    const hero = document.createElement("ilc-home-status-hero");
    hero.hass = hass;
    hero.site = site;
    hero.presentation = presentation;
    document.body.append(hero);

    await hero.updateComplete;

    expect(hero.textContent).toContain("Start Hot water");
    expect(hero.textContent).toContain("This is the lowest-cost valid window.");
    expect(hero.textContent).toContain("Required site input data is unavailable or stale.");
  });
});
