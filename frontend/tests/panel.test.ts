import { afterEach, describe, expect, it, vi } from "vitest";

import "../src/index";
import type { IntelligentLoadControllerPanel } from "../src/components/intelligent-load-controller-panel";
import type { HomeAssistant } from "../src/types/home-assistant";

function createHass(
  responder: (message: Record<string, unknown>) => unknown,
  connected = true,
): HomeAssistant {
  return {
    connection: { connected },
    callWS: async <TResponse>(message: Record<string, unknown>): Promise<TResponse> =>
      responder(message) as TResponse,
  };
}

async function waitForRender(): Promise<void> {
  await vi.waitFor(() => {
    const panel = document.querySelector(
      "intelligent-load-controller-panel",
    ) as IntelligentLoadControllerPanel | null;
    expect(panel?.shadowRoot?.querySelector(".empty-state")).not.toBeNull();
  });
}

function shellMain(panel: IntelligentLoadControllerPanel): HTMLElement | null {
  return panel.shadowRoot
    ?.querySelector("ilc-app-shell")
    ?.shadowRoot?.querySelector("main") ?? null;
}

function shellText(panel: IntelligentLoadControllerPanel): string {
  return panel.shadowRoot?.querySelector("ilc-app-shell")?.shadowRoot?.textContent ?? "";
}

afterEach(() => {
  document.body.replaceChildren();
  window.history.replaceState({}, "", "/");
});

describe("intelligent-load-controller-panel", () => {
  it("renders an accessible empty state after the typed dashboard requests complete", async () => {
    const panel = document.createElement(
      "intelligent-load-controller-panel",
    ) as IntelligentLoadControllerPanel;
    panel.hass = createHass((message) => {
      if (message["type"] === "intelligent_load_controller/v1/site_list") {
        return {
          sites: [
            {
              entry_id: "entry-home",
              site_id: "home",
              name: "Home",
              state: "idle",
              active_loads: 0,
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
          active_loads: 0,
          waiting_loads: 0,
        };
      }
      return { loads: [] };
    });
    document.body.append(panel);

    await waitForRender();

    expect(panel.shadowRoot?.textContent).toContain("No controlled loads have been configured yet.");
    expect(shellMain(panel)?.getAttribute("aria-busy")).toBe("false");
  });

  it("renders the redesigned overview hierarchy from backend summary fields", async () => {
    const panel = document.createElement(
      "intelligent-load-controller-panel",
    ) as IntelligentLoadControllerPanel;
    panel.hass = createHass((message) => {
      switch (message["type"]) {
        case "intelligent_load_controller/v1/site_list":
          return { sites: [{ entry_id: "entry-home", site_id: "home", name: "Home" }] };
        case "intelligent_load_controller/v1/site_summary":
          return {
            entry_id: "entry-home",
            site_id: "home",
            name: "Home",
            state: "idle",
            active_loads: 1,
            waiting_loads: 2,
            health: "warning",
            grid_import: { value: 0, unit: "W", quality: "measured" },
            grid_export: { value: 950, unit: "W", quality: "measured" },
            solar_production: { value: 3400, unit: "W", quality: "measured" },
            controlled_power: { value: 2400, unit: "W", quality: "measured" },
            controlled_energy_today: { value: 4.2, unit: "kWh", quality: "derived" },
            controlled_cost_today: { value: 1.15, currency: "AUD", unit: "kWh", quality: "derived" },
            next_deadline: "2026-07-23T20:00:00Z",
            updated_at: "2026-07-23T02:00:00Z",
          };
        case "intelligent_load_controller/v1/load_list":
          return {
            loads: [
              {
                load_id: "hot-water",
                name: "Hot water",
                type: "hot_water",
                state: "solar_run",
                reason_code: "solar_export_qualified",
                automatic_control: true,
                current_power: { value: 2400, unit: "W", quality: "measured" },
                target_status: "on_track",
              },
              {
                load_id: "ev",
                name: "EV charger",
                type: "ev_charger",
                state: "waiting_for_window",
                reason_code: "deadline_catchup",
                automatic_control: true,
                target_status: "at_risk",
              },
              {
                load_id: "pool",
                name: "Pool pump",
                type: "generic_binary",
                state: "waiting_for_window",
                reason_code: "lowest_cost_window",
                automatic_control: true,
                next_action: "Start during free period",
              },
            ],
          };
        default:
          return {};
      }
    });
    document.body.append(panel);

    await vi.waitFor(() => {
      expect(panel.shadowRoot?.textContent).toContain("Home Status");
      expect(panel.shadowRoot?.textContent).toContain("Watch closely");
      expect(panel.shadowRoot?.textContent).toContain("Live energy flow");
      expect(panel.shadowRoot?.textContent).toContain("Exporting 950 W to the grid.");
      expect(panel.shadowRoot?.textContent).toContain("Attention and opportunities");
      expect(panel.shadowRoot?.textContent).toContain("EV charger target at risk");
      expect(panel.shadowRoot?.textContent).toContain("Today summary");
      expect(panel.shadowRoot?.textContent).toContain("Running now");
      expect(panel.shadowRoot?.textContent).toContain("Starting soon");
    });
  });

  it("opens backend-provided attention destinations from the overview", async () => {
    const calls: Record<string, unknown>[] = [];
    const panel = document.createElement(
      "intelligent-load-controller-panel",
    ) as IntelligentLoadControllerPanel;
    panel.hass = createHass((message) => {
      calls.push(message);
      switch (message["type"]) {
        case "intelligent_load_controller/v1/site_list":
          return { sites: [{ entry_id: "entry-home", site_id: "home", name: "Home" }] };
        case "intelligent_load_controller/v1/site_summary":
          return {
            entry_id: "entry-home",
            site_id: "home",
            name: "Home",
            state: "idle",
            active_loads: 0,
            waiting_loads: 0,
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
            ],
          };
        case "intelligent_load_controller/v1/load_list":
          return { loads: [] };
        case "intelligent_load_controller/v1/configuration_read":
          return {
            site: {
              site_name: "Home",
              grid_sign_convention: "import_positive",
              config_revision: 1,
            },
            loads: [],
            schema: {},
          };
        default:
          return {};
      }
    });
    document.body.append(panel);

    await vi.waitFor(() => {
      expect(panel.shadowRoot?.textContent).toContain("Configuration needs attention");
    });
    const settingsButton = Array.from(panel.shadowRoot?.querySelectorAll("button") ?? []).find(
      (button) => button.textContent?.trim() === "Open settings",
    ) as HTMLButtonElement;
    settingsButton.click();

    await vi.waitFor(() => {
      expect(window.location.pathname).toBe("/intelligent-load-controller/settings");
      expect(calls).toContainEqual({
        type: "intelligent_load_controller/v1/configuration_read",
        entry_id: "entry-home",
      });
    });
  });

  it("shows a reconnecting state without issuing a websocket command", async () => {
    const callWS = vi.fn();
    const panel = document.createElement(
      "intelligent-load-controller-panel",
    ) as IntelligentLoadControllerPanel;
    panel.route = { path: "/load/hws" };
    panel.hass = {
      connection: { connected: false },
      callWS,
    };
    document.body.append(panel);
    await vi.waitFor(() => {
      expect(panel.shadowRoot?.querySelector("[data-state='reconnecting']")).not.toBeNull();
    });

    expect(panel.shadowRoot?.textContent).toContain("Reconnecting to Home Assistant");
    expect(shellText(panel)).toContain("Load details");
    expect(callWS).not.toHaveBeenCalled();
  });

  it("surfaces a backend failure with a retryable error state", async () => {
    const panel = document.createElement(
      "intelligent-load-controller-panel",
    ) as IntelligentLoadControllerPanel;
    panel.hass = createHass(() => {
      throw new Error("Service unavailable");
    });
    document.body.append(panel);

    await vi.waitFor(() => {
      expect(panel.shadowRoot?.querySelector("[data-state='error']")).not.toBeNull();
    });

    expect(panel.shadowRoot?.textContent).toContain("Unable to load Load Control");
    expect(panel.shadowRoot?.textContent).toContain("Service unavailable");
    expect(panel.shadowRoot?.querySelector(".retry-button")).not.toBeNull();
  });

  it("shows setup guidance when the global site list is empty", async () => {
    const calls: Record<string, unknown>[] = [];
    const panel = document.createElement(
      "intelligent-load-controller-panel",
    ) as IntelligentLoadControllerPanel;
    panel.hass = createHass((message) => {
      calls.push(message);
      return { sites: [] };
    });
    document.body.append(panel);

    await vi.waitFor(() => {
      expect(panel.shadowRoot?.textContent).toContain("No Load Control sites have been configured yet.");
    });

    expect(calls).toEqual([{ type: "intelligent_load_controller/v1/site_list" }]);
  });

  it("requires a selection before opening one of multiple sites", async () => {
    const calls: Record<string, unknown>[] = [];
    const panel = document.createElement(
      "intelligent-load-controller-panel",
    ) as IntelligentLoadControllerPanel;
    panel.hass = createHass((message) => {
      calls.push(message);
      if (message["type"] === "intelligent_load_controller/v1/site_list") {
        return {
          sites: [
            { entry_id: "entry-one", name: "First site" },
            { entry_id: "entry-two", name: "Second site" },
          ],
        };
      }
      if (message["type"] === "intelligent_load_controller/v1/site_summary") {
        return {
          entry_id: "entry-one",
          site_id: "one",
          name: "First site",
          state: "idle",
          active_loads: 0,
          waiting_loads: 0,
        };
      }
      return { loads: [] };
    });
    document.body.append(panel);

    await vi.waitFor(() => {
      expect(panel.shadowRoot?.querySelector(".site-selector select")).not.toBeNull();
    });
    expect(calls).toEqual([{ type: "intelligent_load_controller/v1/site_list" }]);

    (panel.shadowRoot?.querySelector(".site-selector button") as HTMLButtonElement).click();
    await vi.waitFor(() => {
      expect(calls).toEqual(
        expect.arrayContaining([
          { type: "intelligent_load_controller/v1/site_summary", entry_id: "entry-one" },
          { type: "intelligent_load_controller/v1/load_list", entry_id: "entry-one" },
        ]),
      );
    });
  });

  it("validates with the current revision and offers to reload after a configuration conflict", async () => {
    const calls: Record<string, unknown>[] = [];
    let configurationReads = 0;
    const panel = document.createElement(
      "intelligent-load-controller-panel",
    ) as IntelligentLoadControllerPanel;
    panel.hass = createHass((message) => {
      calls.push(message);
      switch (message["type"]) {
        case "intelligent_load_controller/v1/site_list":
          return { sites: [{ entry_id: "entry-home", site_id: "home", name: "Home" }] };
        case "intelligent_load_controller/v1/site_summary":
          return {
            entry_id: "entry-home",
            site_id: "home",
            name: "Home",
            state: "idle",
            active_loads: 0,
            waiting_loads: 0,
          };
        case "intelligent_load_controller/v1/load_list":
          return { loads: [] };
        case "intelligent_load_controller/v1/configuration_read":
          configurationReads += 1;
          return {
            site: {
              site_name: configurationReads === 1 ? "Home" : "Latest Home",
              grid_sign_convention: "import_positive",
              planning_horizon_hours: 24,
              planning_resolution_seconds: 300,
              config_revision: configurationReads === 1 ? 4 : 5,
            },
            loads: [],
            schema: {},
          };
        case "intelligent_load_controller/v1/configuration_validate":
          return { valid: true, config: {} };
        case "intelligent_load_controller/v1/configuration_update":
          throw { code: "config_conflict", message: "Changed elsewhere" };
        default:
          return {};
      }
    });
    document.body.append(panel);

    await waitForRender();
    const configureButton = Array.from(panel.shadowRoot?.querySelectorAll(".nav-button") ?? []).find(
      (button) => button.textContent?.trim().endsWith("Settings"),
    ) as HTMLButtonElement;
    configureButton.click();

    await vi.waitFor(() => {
      expect(panel.shadowRoot?.querySelector("input[name='site_name']")).not.toBeNull();
    });
    const nameInput = panel.shadowRoot?.querySelector("input[name='site_name']") as HTMLInputElement;
    nameInput.value = "Updated Home";
    nameInput.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    (panel.shadowRoot?.querySelector("form") as HTMLFormElement).dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true, composed: true }),
    );

    await vi.waitFor(() => {
      expect(panel.shadowRoot?.textContent).toContain("Reload latest settings");
    });
    expect(calls).toEqual(
      expect.arrayContaining([
        {
          type: "intelligent_load_controller/v1/configuration_update",
          entry_id: "entry-home",
          config: expect.objectContaining({ site_name: "Updated Home" }),
          if_revision: 4,
        },
      ]),
    );

    const reload = Array.from(panel.shadowRoot?.querySelectorAll("button") ?? []).find(
      (button) => button.textContent?.trim() === "Reload latest settings",
    ) as HTMLButtonElement;
    reload.click();
    await vi.waitFor(() => {
      expect((panel.shadowRoot?.querySelector("input[name='site_name']") as HTMLInputElement).value).toBe(
        "Latest Home",
      );
    });
  });

  it("loads plan, timeline, insights, and events only when their views are opened", async () => {
    const calls: Record<string, unknown>[] = [];
    const panel = document.createElement(
      "intelligent-load-controller-panel",
    ) as IntelligentLoadControllerPanel;
    panel.hass = createHass((message) => {
      calls.push(message);
      switch (message["type"]) {
        case "intelligent_load_controller/v1/site_list":
          return { sites: [{ entry_id: "entry-home", site_id: "home", name: "Home" }] };
        case "intelligent_load_controller/v1/site_summary":
          return {
            entry_id: "entry-home",
            site_id: "home",
            name: "Home",
            state: "idle",
            active_loads: 0,
            waiting_loads: 0,
          };
        case "intelligent_load_controller/v1/load_list":
          return { loads: [] };
        case "intelligent_load_controller/v1/current_plan":
          return null;
        case "intelligent_load_controller/v1/daily_timeline":
          return { intervals: [], generated_at: null };
        case "intelligent_load_controller/v1/historical_summary":
          return {
            daily_summaries: [
              {
                date: "2026-07-23",
                controlled_energy_kwh: 4.2,
                nested_payload: { raw: true },
              },
            ],
            data_quality: "unknown",
          };
        case "intelligent_load_controller/v1/event_journal":
          return { events: [] };
        default:
          return {};
      }
    });
    document.body.append(panel);

    await waitForRender();
    const buttonWithText = (text: string): HTMLButtonElement =>
      Array.from(panel.shadowRoot?.querySelectorAll(".nav-button") ?? []).find(
        (button) => button.textContent?.trim().endsWith(text),
      ) as HTMLButtonElement;

    buttonWithText("Plan").click();
    await vi.waitFor(() => {
      expect(window.location.pathname).toBe("/intelligent-load-controller/plan");
      expect(calls).toEqual(
        expect.arrayContaining([
          { type: "intelligent_load_controller/v1/current_plan", entry_id: "entry-home" },
          { type: "intelligent_load_controller/v1/daily_timeline", entry_id: "entry-home" },
        ]),
      );
    });
    buttonWithText("Insights").click();
    await vi.waitFor(() => {
      expect(window.location.pathname).toBe("/intelligent-load-controller/insights");
      expect(calls).toEqual(
        expect.arrayContaining([
          { type: "intelligent_load_controller/v1/historical_summary", entry_id: "entry-home" },
          { type: "intelligent_load_controller/v1/event_journal", entry_id: "entry-home" },
        ]),
      );
      expect(panel.shadowRoot?.textContent).toContain("controlled energy kwh");
      expect(panel.shadowRoot?.textContent).toContain("4.2");
      expect(panel.shadowRoot?.textContent).toContain("Detailed value available in Diagnostics");
      expect(panel.shadowRoot?.textContent).not.toContain('{"date"');
    });
  });

  it("opens a direct load route with the new /loads/:loadId path", async () => {
    const calls: Record<string, unknown>[] = [];
    const panel = document.createElement(
      "intelligent-load-controller-panel",
    ) as IntelligentLoadControllerPanel;
    panel.route = { path: "/loads/hot-water", prefix: "/intelligent-load-controller" };
    panel.hass = createHass((message) => {
      calls.push(message);
      switch (message["type"]) {
        case "intelligent_load_controller/v1/site_list":
          return { sites: [{ entry_id: "entry-home", site_id: "home", name: "Home" }] };
        case "intelligent_load_controller/v1/site_summary":
          return {
            entry_id: "entry-home",
            site_id: "home",
            name: "Home",
            state: "idle",
            active_loads: 0,
            waiting_loads: 1,
          };
        case "intelligent_load_controller/v1/load_list":
          return {
            loads: [
              {
                load_id: "hot-water",
                name: "Hot water",
                type: "hot_water",
                state: "idle",
                reason_code: "lowest_cost_window",
                automatic_control: true,
                config_revision: 9,
              },
            ],
          };
        case "intelligent_load_controller/v1/load_detail":
          return { load_id: "hot-water", presentation: "fixture" };
        default:
          return {};
      }
    });
    document.body.append(panel);

    await vi.waitFor(() => {
      expect(panel.shadowRoot?.textContent).toContain("Hot water");
      expect(shellText(panel)).toContain("Load details");
      expect(calls).toContainEqual({
        type: "intelligent_load_controller/v1/load_detail",
        entry_id: "entry-home",
        load_id: "hot-water",
      });
    });
  });

  it("changes Automatic control with the load revision returned by the backend", async () => {
    const calls: Record<string, unknown>[] = [];
    const panel = document.createElement(
      "intelligent-load-controller-panel",
    ) as IntelligentLoadControllerPanel;
    panel.hass = createHass((message) => {
      calls.push(message);
      switch (message["type"]) {
        case "intelligent_load_controller/v1/site_list":
          return { sites: [{ entry_id: "entry-home", site_id: "home", name: "Home" }] };
        case "intelligent_load_controller/v1/site_summary":
          return {
            entry_id: "entry-home",
            site_id: "home",
            name: "Home",
            state: "idle",
            active_loads: 0,
            waiting_loads: 1,
          };
        case "intelligent_load_controller/v1/load_list":
          return {
            loads: [
              {
                load_id: "hot-water",
                name: "Hot water",
                type: "hot_water",
                state: "idle",
                reason_code: "lowest_cost_window",
                automatic_control: true,
                config_revision: 9,
              },
            ],
          };
        case "intelligent_load_controller/v1/load_detail":
          return {};
        case "intelligent_load_controller/v1/automatic_control_set":
          return { automatic_control: false, config_revision: 10 };
        default:
          return {};
      }
    });
    document.body.append(panel);

    await vi.waitFor(() => {
      expect(panel.shadowRoot?.querySelector(".load-card")).not.toBeNull();
    });
    const openControls = Array.from(panel.shadowRoot?.querySelectorAll(".secondary-button") ?? []).find(
      (button) => button.textContent?.trim() === "Open controls",
    ) as HTMLButtonElement;
    openControls.click();
    await vi.waitFor(() => {
      expect(
        Array.from(panel.shadowRoot?.querySelectorAll("button") ?? []).some(
          (button) => button.textContent?.trim() === "Disable Automatic control",
        ),
      ).toBe(true);
    });
    const automaticButton = Array.from(panel.shadowRoot?.querySelectorAll("button") ?? []).find(
      (button) => button.textContent?.trim() === "Disable Automatic control",
    ) as HTMLButtonElement;
    automaticButton.click();

    await vi.waitFor(() => {
      expect(calls).toContainEqual({
        type: "intelligent_load_controller/v1/automatic_control_set",
        entry_id: "entry-home",
        load_id: "hot-water",
        enabled: false,
        if_revision: 9,
      });
    });
  });

  it("subscribes to scoped updates, refreshes from events, and tears down on reconnect", async () => {
    const calls: Record<string, unknown>[] = [];
    const updateCallbacks: Array<(message: unknown) => void> = [];
    const unsubscribe = vi.fn();
    const subscribeMessage = async <TMessage>(
      callback: (message: TMessage) => void,
      _message: Record<string, unknown>,
    ): Promise<() => void> => {
      updateCallbacks.push(callback as (message: unknown) => void);
      return unsubscribe;
    };
    const responder = (message: Record<string, unknown>): unknown => {
      calls.push(message);
      if (message["type"] === "intelligent_load_controller/v1/site_list") {
        return { sites: [{ entry_id: "entry-home", site_id: "home", name: "Home" }] };
      }
      if (message["type"] === "intelligent_load_controller/v1/site_summary") {
        return {
          entry_id: "entry-home",
          site_id: "home",
          name: "Home",
          state: "idle",
          active_loads: 0,
          waiting_loads: 0,
        };
      }
      return { loads: [] };
    };
    const connectedHass: HomeAssistant = {
      connection: { connected: true, subscribeMessage },
      callWS: async <TResponse>(message: Record<string, unknown>): Promise<TResponse> =>
        responder(message) as TResponse,
    };
    const panel = document.createElement(
      "intelligent-load-controller-panel",
    ) as IntelligentLoadControllerPanel;
    panel.hass = connectedHass;
    document.body.append(panel);

    await waitForRender();
    await vi.waitFor(() => {
      expect(updateCallbacks).toHaveLength(1);
    });
    const initialSummaryReads = calls.filter(
      (message) => message["type"] === "intelligent_load_controller/v1/site_summary",
    ).length;
    updateCallbacks[0]?.({ state: "idle" });
    await vi.waitFor(() => {
      expect(
        calls.filter(
          (message) => message["type"] === "intelligent_load_controller/v1/site_summary",
        ),
      ).toHaveLength(initialSummaryReads + 1);
    });

    panel.hass = {
      ...connectedHass,
      connection: { connected: false, subscribeMessage },
    };
    await vi.waitFor(() => {
      expect(panel.shadowRoot?.querySelector("[data-state='reconnecting']")).not.toBeNull();
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });

    panel.hass = connectedHass;
    await vi.waitFor(() => {
      expect(updateCallbacks).toHaveLength(2);
    });
    panel.remove();
    expect(unsubscribe).toHaveBeenCalledTimes(2);
  });

  it("keeps delete confirmation keyboard-contained and restores focus on dismissal", async () => {
    const panel = document.createElement(
      "intelligent-load-controller-panel",
    ) as IntelligentLoadControllerPanel;
    panel.hass = createHass((message) => {
      switch (message["type"]) {
        case "intelligent_load_controller/v1/site_list":
          return { sites: [{ entry_id: "entry-home", site_id: "home", name: "Home" }] };
        case "intelligent_load_controller/v1/site_summary":
          return {
            entry_id: "entry-home",
            site_id: "home",
            name: "Home",
            state: "idle",
            active_loads: 0,
            waiting_loads: 0,
          };
        case "intelligent_load_controller/v1/load_list":
          return { loads: [] };
        case "intelligent_load_controller/v1/configuration_read":
          return {
            site: { site_name: "Home", config_revision: 4 },
            loads: [
              {
                load_id: "pool-pump",
                display_name: "Pool pump",
                load_type: "generic_binary",
                config_revision: 7,
              },
            ],
            schema: {},
          };
        default:
          return {};
      }
    });
    document.body.append(panel);

    await waitForRender();
    const configureButton = Array.from(panel.shadowRoot?.querySelectorAll(".nav-button") ?? []).find(
      (button) => button.textContent?.trim().endsWith("Settings"),
    ) as HTMLButtonElement;
    configureButton.click();
    await vi.waitFor(() => {
      expect(panel.shadowRoot?.querySelector(".danger-button")).not.toBeNull();
    });

    const deleteButton = Array.from(panel.shadowRoot?.querySelectorAll(".danger-button") ?? []).find(
      (button) => button.textContent?.trim() === "Delete",
    ) as HTMLButtonElement;
    deleteButton.focus();
    deleteButton.click();
    await vi.waitFor(() => {
      expect(panel.shadowRoot?.querySelector("[role='dialog']")).not.toBeNull();
    });

    const dialog = panel.shadowRoot?.querySelector("[role='dialog']") as HTMLElement;
    const dialogButtons = Array.from(dialog.querySelectorAll<HTMLButtonElement>("button"));
    const confirmButton = dialogButtons[0];
    const cancelButton = dialogButtons[1];
    if (!confirmButton || !cancelButton) {
      throw new Error("Delete confirmation buttons are missing");
    }
    expect(panel.shadowRoot?.activeElement).toBe(confirmButton);

    cancelButton.focus();
    dialog.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true, composed: true }),
    );
    expect(panel.shadowRoot?.activeElement).toBe(confirmButton);

    dialog.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true, composed: true }),
    );
    await vi.waitFor(() => {
      expect(panel.shadowRoot?.querySelector("[role='dialog']")).toBeNull();
      expect(panel.shadowRoot?.activeElement).toBe(deleteButton);
    });
  });
});
