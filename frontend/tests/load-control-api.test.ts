import { describe, expect, it, vi } from "vitest";

import { LoadControlApi, LoadControlApiError } from "../src/api/load-control-api";
import type { HomeAssistant } from "../src/types/home-assistant";

function createHass(
  responder: (message: Record<string, unknown>) => unknown,
): HomeAssistant {
  return {
    connection: { connected: true },
    callWS: async <TResponse>(message: Record<string, unknown>): Promise<TResponse> =>
      responder(message) as TResponse,
  };
}

describe("LoadControlApi", () => {
  it("uses versioned typed commands to build a dashboard", async () => {
    const calls: Record<string, unknown>[] = [];
    const api = new LoadControlApi(
      createHass((message) => {
        calls.push(message);
        if (message["type"] === "intelligent_load_controller/v1/site_list") {
          return {
            sites: [
              {
                entry_id: "entry-home",
                site_id: "home",
                name: "Home",
                state: "idle",
                active_loads: 1,
                waiting_loads: 0,
              },
            ],
          };
        }
        if (message["type"] === "intelligent_load_controller/v1/site_summary") {
          return {
            entry_id: "entry-home",
            site_id: "home",
            name: "Home",
            state: "idle",
            active_loads: 1,
            waiting_loads: 0,
            total_controlled_power_w: 3400,
            grid_import: { value: 500, unit: "W", quality: "measured" },
            grid_export: { value: 0, unit: "W", quality: "measured" },
            solar_production: { value: 2900, unit: "W", quality: "measured" },
            controlled_energy_today: { value: 4.2, unit: "kWh", quality: "derived" },
            controlled_cost_today: { value: 1.25, currency: "AUD", unit: "kWh", quality: "derived" },
            next_deadline: "2026-07-23T20:00:00Z",
            attention_count: 2,
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
              {
                id: "load:hws:actuator_unavailable",
                code: "actuator_unavailable",
                rank: 1,
                severity: "critical",
                affected_kind: "load",
                affected_id: "hws",
                display_name: "Hot water",
                action: "load_detail",
              },
              {
                id: "ignored",
                code: "ignored",
                rank: "not-a-number",
                severity: "warning",
              },
            ],
          };
        }
        return {
          loads: [
            {
              load_id: "hws",
              name: "Hot water",
              type: "hot_water",
              state: "idle",
              reason_code: "lowest_cost_window",
              automatic_control: true,
              fault: true,
            },
          ],
        };
      }),
    );

    await expect(api.getSites()).resolves.toMatchObject([{ entry_id: "entry-home" }]);
    await expect(api.getDashboard("entry-home")).resolves.toMatchObject({
      site: {
        site_id: "home",
        controller_state: "idle",
        active_load_count: 1,
        grid_import: { value: 500, unit: "W", quality: "measured" },
        solar_production: { value: 2900, unit: "W", quality: "measured" },
        controlled_energy_today: { value: 4.2, unit: "kWh", quality: "derived" },
        controlled_cost_today: { value: 1.25, currency: "AUD", unit: "kWh", quality: "derived" },
        next_deadline: "2026-07-23T20:00:00Z",
        attention_count: 2,
        attention: [
          {
            id: "load:hws:actuator_unavailable",
            code: "actuator_unavailable",
            rank: 1,
            severity: "critical",
            affected_kind: "load",
            affected_id: "hws",
            display_name: "Hot water",
            action: "load_detail",
          },
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
      loads: [{ load_id: "hws", load_type: "hot_water", controller_state: "idle", fault: true }],
    });
    expect(calls).toEqual(
      expect.arrayContaining([
        {
          type: "intelligent_load_controller/v1/site_list",
        },
        {
          type: "intelligent_load_controller/v1/site_summary",
          entry_id: "entry-home",
        },
        {
          type: "intelligent_load_controller/v1/load_list",
          entry_id: "entry-home",
        },
      ]),
    );
  });

  it("normalises websocket failures to a stable API error", async () => {
    const hass = createHass(() => {
      throw { code: "permission_denied", message: "Denied" };
    });
    const api = new LoadControlApi(hass);

    await expect(api.request("site_summary", { entry_id: "entry-home" })).rejects.toEqual(
      new LoadControlApiError("Denied", "permission_denied"),
    );
  });

  it("sends revision-aware configuration, load mutation, and manual-control commands", async () => {
    const calls: Record<string, unknown>[] = [];
    const api = new LoadControlApi(
      createHass((message) => {
        calls.push(message);
        if (message["type"] === "intelligent_load_controller/v1/current_plan") {
          return null;
        }
        if (message["type"] === "intelligent_load_controller/v1/daily_timeline") {
          return {
            generated_at: "2026-07-23T00:00:00Z",
            intervals: [
              {
                load_id: "hws",
                start_at: "2026-07-23T01:00:00Z",
                end_at: "2026-07-23T02:00:00Z",
                power_w: 2400,
                reason_code: "solar_export_qualified",
              },
              {
                load_id: "ignored",
                start_at: "2026-07-23T01:00:00Z",
                power_w: "not-a-number",
              },
            ],
          };
        }
        return {};
      }),
    );

    await api.updateSite("entry-home", { site_name: "Home" }, 4);
    await api.updateLoad("entry-home", "load-1", { display_name: "Hot water" }, 8);
    await api.duplicateLoad("entry-home", "load-1", 8);
    await api.deleteLoad("entry-home", "load-1", 8);
    await api.startOverride("entry-home", "load-1", "on", { duration_seconds: 1_800 });
    await api.setAutomaticControl("entry-home", "load-1", false, 8);
    await api.getDiagnostics("entry-home");
    await expect(api.getCurrentPlan("entry-home")).resolves.toBeNull();
    await expect(api.getDailyTimeline("entry-home")).resolves.toEqual({
      generated_at: "2026-07-23T00:00:00Z",
      intervals: [
        {
          load_id: "hws",
          start_at: "2026-07-23T01:00:00Z",
          end_at: "2026-07-23T02:00:00Z",
          power_w: 2400,
          reason_code: "solar_export_qualified",
        },
      ],
    });

    expect(calls).toEqual(
      expect.arrayContaining([
        {
          type: "intelligent_load_controller/v1/configuration_update",
          entry_id: "entry-home",
          config: { site_name: "Home" },
          if_revision: 4,
        },
        {
          type: "intelligent_load_controller/v1/load_update",
          entry_id: "entry-home",
          load_id: "load-1",
          config: { display_name: "Hot water" },
          if_revision: 8,
        },
        {
          type: "intelligent_load_controller/v1/load_duplicate",
          entry_id: "entry-home",
          load_id: "load-1",
          if_revision: 8,
        },
        {
          type: "intelligent_load_controller/v1/load_delete",
          entry_id: "entry-home",
          load_id: "load-1",
          if_revision: 8,
        },
        {
          type: "intelligent_load_controller/v1/override_start",
          entry_id: "entry-home",
          load_id: "load-1",
          desired_state: "on",
          duration_seconds: 1_800,
        },
        {
          type: "intelligent_load_controller/v1/automatic_control_set",
          entry_id: "entry-home",
          load_id: "load-1",
          enabled: false,
          if_revision: 8,
        },
        {
          type: "intelligent_load_controller/v1/diagnostics",
          entry_id: "entry-home",
        },
        {
          type: "intelligent_load_controller/v1/current_plan",
          entry_id: "entry-home",
        },
        {
          type: "intelligent_load_controller/v1/daily_timeline",
          entry_id: "entry-home",
        },
      ]),
    );
  });

  it("uses Home Assistant's scoped subscription API for live site updates", async () => {
    const callback = vi.fn();
    const unsubscribe = vi.fn();
    const subscribeMessage = vi.fn(
      async <TMessage>(
        _callback: (message: TMessage) => void,
        _message: Record<string, unknown>,
      ): Promise<() => void> => unsubscribe,
    );
    const api = new LoadControlApi({
      callWS: async <TResponse>(): Promise<TResponse> => ({} as TResponse),
      connection: { connected: true, subscribeMessage },
    });

    await expect(api.subscribeUpdates("entry-home", callback)).resolves.toBe(unsubscribe);
    expect(subscribeMessage).toHaveBeenCalledWith(callback, {
      type: "intelligent_load_controller/v1/subscribe_updates",
      entry_id: "entry-home",
    });
  });
});
