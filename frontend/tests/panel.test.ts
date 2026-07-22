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

afterEach(() => {
  document.body.replaceChildren();
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
    expect(panel.shadowRoot?.querySelector("main")?.getAttribute("aria-busy")).toBe("false");
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
    expect(panel.shadowRoot?.textContent).toContain("Load details");
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
      (button) => button.textContent?.trim() === "Configure",
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

  it("loads plan, timeline, history, and events only when their views are opened", async () => {
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
          return { daily_summaries: [], data_quality: "unknown" };
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
        (button) => button.textContent?.trim() === text,
      ) as HTMLButtonElement;

    buttonWithText("Plan").click();
    await vi.waitFor(() => {
      expect(calls).toEqual(
        expect.arrayContaining([
          { type: "intelligent_load_controller/v1/current_plan", entry_id: "entry-home" },
          { type: "intelligent_load_controller/v1/daily_timeline", entry_id: "entry-home" },
        ]),
      );
    });
    buttonWithText("History").click();
    await vi.waitFor(() => {
      expect(calls).toEqual(
        expect.arrayContaining([
          { type: "intelligent_load_controller/v1/historical_summary", entry_id: "entry-home" },
          { type: "intelligent_load_controller/v1/event_journal", entry_id: "entry-home" },
        ]),
      );
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
      (button) => button.textContent?.trim() === "Configure",
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
