import type { HomeAssistant } from "../types/home-assistant";
import { translate } from "./index";
import { messages, type MessageKey } from "./messages";

const controllerStates = new Set<string>([
  "disabled",
  "initialising",
  "not_controlled",
  "idle",
  "waiting_for_window",
  "scheduled_run",
  "free_period_run",
  "solar_qualifying",
  "solar_run",
  "low_cost_run",
  "deadline_catchup",
  "variable_power_run",
  "minimum_on_hold",
  "minimum_off_hold",
  "manual_on",
  "manual_off",
  "target_complete",
  "blocked_by_site_limit",
  "blocked_by_higher_priority",
  "input_unavailable",
  "actuator_unavailable",
  "fault",
]);

export function localizeControllerState(
  hass: HomeAssistant | undefined,
  state: string,
): string {
  const key = `state.${state}` as MessageKey;
  return controllerStates.has(state) ? translate(hass, key) : state;
}

export function localizeReasonCode(
  hass: HomeAssistant | undefined,
  reasonCode: string,
): string {
  const key = `reason.${reasonCode}` as MessageKey;
  return key in messages.en ? translate(hass, key) : reasonCode;
}
