/** Browser-only Home Assistant facade used by the Playwright accessibility smoke test. */

import "../src/index";
import type { HomeAssistant } from "../src/types/home-assistant";

const site = {
  entry_id: "playwright-site",
  site_id: "playwright-site",
  name: "Playwright Load Control",
  state: "idle",
  config_revision: 3,
  active_loads: 0,
  waiting_loads: 1,
  total_controlled_power_w: 1_200,
  controlled_power: { value: 1_200, unit: "W", quality: "measured" },
  grid_import: { value: 2_300, unit: "W", quality: "measured" },
  solar_production: { value: 1_800, unit: "W", quality: "measured" },
};
const emptyInstallation = new URLSearchParams(window.location.search).has("empty");

const hass: HomeAssistant = {
  language: "en",
  config: { currency: "AUD" },
  connection: {
    connected: true,
    async subscribeMessage<TMessage>(
      _callback: (message: TMessage) => void,
      _message: Record<string, unknown>,
    ): Promise<() => void> {
      return () => undefined;
    },
  },
  async callWS<TResponse>(message: Record<string, unknown>): Promise<TResponse> {
    switch (message["type"]) {
      case "intelligent_load_controller/v1/site_list":
        return { sites: [site] } as TResponse;
      case "intelligent_load_controller/v1/site_summary":
        return site as TResponse;
      case "intelligent_load_controller/v1/load_list":
        return {
          loads: emptyInstallation
            ? []
            : [
                {
                  load_id: "hot-water",
                  name: "Hot water",
                  type: "hot_water",
                  state: "idle",
                  reason_code: "lowest_cost_window",
                  automatic_control: true,
                  config_revision: 7,
                },
              ],
        } as TResponse;
      case "intelligent_load_controller/v1/configuration_read":
        return {
          site: {
            site_name: site.name,
            grid_sign_convention: "import_positive",
            planning_horizon_hours: 24,
            planning_resolution_seconds: 300,
            config_revision: 0,
          },
          loads: [],
          schema: {},
        } as TResponse;
      default:
        return {} as TResponse;
    }
  },
};

const panel = document.createElement("intelligent-load-controller-panel");
panel.hass = hass;
panel.route = { path: window.location.pathname, prefix: "/intelligent-load-controller" };
document.body.append(panel);

window.addEventListener("popstate", () => {
  panel.route = { path: window.location.pathname, prefix: "/intelligent-load-controller" };
});
