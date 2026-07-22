export type JsonPrimitive = boolean | number | string | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export interface JsonObject {
  readonly [key: string]: JsonValue;
}

export type DataQuality = "measured" | "derived" | "estimated" | "unknown";

export interface Measurement {
  value: number;
  unit: string;
  quality?: DataQuality;
}

export interface CurrencyRate {
  value: number;
  currency: string;
  unit: string;
  quality?: DataQuality;
}

/** Stable dashboard contract returned by `site_summary` version 1. */
export interface SiteSummary {
  site_id: string;
  name: string;
  controller_state: string;
  grid_import?: Measurement;
  grid_export?: Measurement;
  solar_production?: Measurement;
  phase_a_power?: Measurement;
  phase_b_power?: Measurement;
  phase_c_power?: Measurement;
  controlled_power?: Measurement;
  active_load_count: number;
  waiting_load_count: number;
  current_import_price?: CurrencyRate;
  controlled_energy_today?: Measurement;
  controlled_cost_today?: CurrencyRate;
  next_deadline?: string;
  health: "healthy" | "warning" | "error" | "unknown";
  updated_at?: string;
}

export interface LoadProgress {
  current?: number;
  target?: number;
  unit?: string;
  percent?: number;
}

/** Stable card contract returned by `load_list` version 1. */
export interface LoadSummary {
  load_id: string;
  name: string;
  load_type: string;
  controller_state: string;
  reason_code: string;
  config_revision?: number;
  reason?: string;
  automatic_control: boolean;
  optimisation_mode?: string;
  priority?: number;
  manual_override?: "timed_on" | "timed_off" | "indefinite_on" | "indefinite_off";
  current_power?: Measurement;
  progress?: LoadProgress;
  deadline?: string;
  next_action?: string;
  target_status?: "on_track" | "at_risk" | "impossible" | "complete" | "unknown";
  fault?: boolean;
}

export interface DashboardData {
  site: SiteSummary;
  loads: readonly LoadSummary[];
}

export interface LoadDetail extends LoadSummary {
  event_count?: number;
  diagnostics_available?: boolean;
}

export interface PlanInterval {
  start: string;
  end: string;
  source: string;
  requested_power?: Measurement;
}

export interface CurrentPlan {
  generated_at: string;
  intervals: readonly PlanInterval[];
  warnings: readonly string[];
}

export interface DailyTimeline {
  date: string;
  intervals: readonly PlanInterval[];
}
