import type {
  DashboardData,
  JsonObject,
  JsonValue,
  LoadProgress,
  LoadSummary,
  Measurement,
  SiteSummary,
} from "../models/dashboard";
import type { HomeAssistant, HomeAssistantUnsubscribe } from "../types/home-assistant";

/** Matches the backend's `WEBSOCKET_PREFIX`; the path is the API version. */
export const API_NAMESPACE = "intelligent_load_controller/v1";
export const API_VERSION = 1;

type EntryRequest = {
  entry_id: string;
};

type LoadRequest = EntryRequest & {
  load_id: string;
};

type OverrideRequest = LoadRequest & {
  desired_state: "on" | "off";
  duration_seconds?: number;
  expires_at?: string;
  indefinite?: boolean;
};

export interface ValidationIssue {
  path: string;
  code: string;
  message: string;
}

export interface ConfigurationReadResponse {
  site: JsonObject;
  loads: readonly JsonObject[];
  schema: JsonObject;
}

export interface ConfigurationValidationResponse {
  valid: boolean;
  config?: JsonObject;
  issues?: readonly ValidationIssue[];
}

export interface PlanIntervalResponse {
  load_id?: string;
  start_at?: string;
  end_at?: string;
  power_w?: number;
  solar_allocated_w?: number;
  expected_cost?: string;
  reason_code?: string;
}

export interface PlanLoadResponse {
  load_id?: string;
  required_slots?: number;
  scheduled_slots?: number;
  unmet_slots?: number;
  expected_cost?: string;
  reason_codes?: readonly string[];
}

export interface PlanProposalResponse {
  load_id?: string;
  requested?: boolean;
  authorized?: boolean;
  reason_code?: string;
  message?: string;
}

export interface CurrentPlanResponse {
  generated_at?: string;
  horizon_end_at?: string | null;
  slot_seconds?: number;
  intervals?: readonly PlanIntervalResponse[];
  loads?: readonly PlanLoadResponse[];
  warnings?: readonly string[];
  next_action?: string | null;
  preview_only?: boolean;
  reason?: string;
  proposals?: readonly PlanProposalResponse[];
}

export interface DailyTimelineResponse {
  generated_at?: string | null;
  intervals: readonly PlanIntervalResponse[];
}

export interface HistoricalSummaryResponse {
  daily_summaries: readonly JsonObject[];
  data_quality?: string;
}

export interface EventJournalEntry {
  timestamp?: string;
  load_id?: string | null;
  state?: string;
  reason_code?: string;
  message?: string;
  configuration_revision?: number;
}

export interface EventJournalResponse {
  events: readonly EventJournalEntry[];
}

export interface ConfigurationPreviewResponse extends ConfigurationValidationResponse {
  plan?: CurrentPlanResponse | null;
  preview_only?: boolean;
}

export interface ApiRequests {
  site_list: Record<string, never>;
  site_summary: EntryRequest;
  load_list: EntryRequest;
  load_detail: LoadRequest;
  current_plan: EntryRequest;
  daily_timeline: EntryRequest;
  historical_summary: EntryRequest;
  event_journal: EntryRequest & { load_id?: string };
  configuration_schema: EntryRequest;
  configuration_read: EntryRequest;
  configuration_validate: EntryRequest & { payload: JsonObject };
  configuration_preview: EntryRequest & { payload: JsonObject };
  configuration_update: EntryRequest & { config: JsonObject; if_revision: number };
  load_add: EntryRequest & { config: JsonObject };
  load_update: LoadRequest & { config: JsonObject; if_revision: number };
  load_duplicate: LoadRequest & { if_revision: number; display_name?: string };
  load_delete: LoadRequest & { if_revision: number };
  override_start: OverrideRequest;
  override_clear: LoadRequest;
  automatic_control_set: LoadRequest & { enabled: boolean; if_revision: number };
  replan: EntryRequest & { load_id?: string };
  csv_export: EntryRequest;
  diagnostics: EntryRequest & { load_id?: string };
  learning_status: EntryRequest & { load_id?: string };
  learning_reset: LoadRequest;
}

/**
 * Bounded v1 backend response. The coordinator can omit unavailable sensor
 * data; this facade converts it to the stable panel view model below.
 */
export interface SiteSummaryResponse {
  entry_id?: string;
  site_id?: string;
  name?: string;
  state?: string;
  controller_state?: string;
  active_loads?: number;
  active_load_count?: number;
  waiting_loads?: number;
  waiting_load_count?: number;
  total_controlled_power_w?: number;
  controlled_power?: Measurement;
  health?: SiteSummary["health"];
  updated_at?: string;
  last_replan_at?: string;
  warnings?: readonly unknown[];
}

export interface LoadListItemResponse {
  load_id?: string;
  name?: string;
  type?: string;
  load_type?: string;
  state?: string;
  controller_state?: string;
  reason_code?: string;
  config_revision?: number;
  automatic_control?: boolean;
  optimisation_mode?: string;
  priority?: number;
  override?: unknown;
  manual_override?: LoadSummary["manual_override"];
  current_power?: Measurement;
  current_power_w?: number;
  progress?: LoadProgress;
  deadline?: string;
  next_action?: string;
  target_status?: LoadSummary["target_status"];
  fault?: boolean;
}

export interface ApiResponses {
  site_list: { sites: readonly SiteSummaryResponse[] };
  site_summary: SiteSummaryResponse;
  load_list: { loads: readonly LoadListItemResponse[] };
  load_detail: JsonObject;
  current_plan: CurrentPlanResponse | null;
  daily_timeline: DailyTimelineResponse;
  historical_summary: HistoricalSummaryResponse;
  event_journal: EventJournalResponse;
  configuration_schema: JsonObject;
  configuration_read: ConfigurationReadResponse;
  configuration_validate: ConfigurationValidationResponse;
  configuration_preview: ConfigurationPreviewResponse;
  configuration_update: JsonObject;
  load_add: JsonObject;
  load_update: JsonObject;
  load_duplicate: JsonObject;
  load_delete: { deleted: boolean };
  override_start: JsonObject;
  override_clear: { cleared: boolean };
  automatic_control_set: JsonObject;
  replan: JsonObject;
  csv_export: { filename: string; content_type: string; content: string };
  diagnostics: JsonObject;
  learning_status: JsonObject;
  learning_reset: { reset: boolean };
}

export type ApiOperation = keyof ApiRequests;

export class LoadControlApiError extends Error {
  public constructor(
    message: string,
    public readonly code = "unknown_error",
  ) {
    super(message);
    this.name = "LoadControlApiError";
  }
}

function errorFrom(error: unknown): LoadControlApiError {
  if (error instanceof LoadControlApiError) {
    return error;
  }

  if (typeof error === "object" && error !== null) {
    const candidate = error as { message?: unknown; code?: unknown };
    if (typeof candidate.message === "string") {
      return new LoadControlApiError(
        candidate.message,
        typeof candidate.code === "string" ? candidate.code : "websocket_error",
      );
    }
  }

  return new LoadControlApiError(
    error instanceof Error ? error.message : "Unknown websocket error",
  );
}

/**
 * The only frontend gateway to integration WebSocket commands. The command
 * namespace carries the schema version so the backend can safely evolve it.
 */
export class LoadControlApi {
  public constructor(private readonly hass: HomeAssistant) {}

  public async request<TOperation extends ApiOperation>(
    operation: TOperation,
    payload: ApiRequests[TOperation],
  ): Promise<ApiResponses[TOperation]> {
    try {
      return await this.hass.callWS<ApiResponses[TOperation]>({
        type: `${API_NAMESPACE}/${operation}`,
        ...payload,
      });
    } catch (error) {
      throw errorFrom(error);
    }
  }

  public async getSites(): Promise<readonly SiteSummaryResponse[]> {
    const response = await this.request("site_list", {});
    return response.sites;
  }

  public async getDashboard(entryId: string): Promise<DashboardData> {
    const request: EntryRequest = { entry_id: entryId };
    const [site, list] = await Promise.all([
      this.request("site_summary", request),
      this.request("load_list", request),
    ]);

    return {
      site: normalizeSiteSummary(site),
      loads: list.loads.map(normalizeLoadSummary),
    };
  }

  public getConfiguration(entryId: string): Promise<ConfigurationReadResponse> {
    return this.request("configuration_read", { entry_id: entryId });
  }

  public validateConfiguration(
    entryId: string,
    payload: JsonObject,
  ): Promise<ConfigurationValidationResponse> {
    return this.request("configuration_validate", { entry_id: entryId, payload });
  }

  public previewConfiguration(
    entryId: string,
    payload: JsonObject,
  ): Promise<ConfigurationPreviewResponse> {
    return this.request("configuration_preview", { entry_id: entryId, payload });
  }

  public updateSite(
    entryId: string,
    config: JsonObject,
    ifRevision: number,
  ): Promise<JsonObject> {
    return this.request("configuration_update", {
      entry_id: entryId,
      config,
      if_revision: ifRevision,
    });
  }

  public addLoad(entryId: string, config: JsonObject): Promise<JsonObject> {
    return this.request("load_add", { entry_id: entryId, config });
  }

  public updateLoad(
    entryId: string,
    loadId: string,
    config: JsonObject,
    ifRevision: number,
  ): Promise<JsonObject> {
    return this.request("load_update", {
      entry_id: entryId,
      load_id: loadId,
      config,
      if_revision: ifRevision,
    });
  }

  public duplicateLoad(
    entryId: string,
    loadId: string,
    ifRevision: number,
    displayName?: string,
  ): Promise<JsonObject> {
    return this.request("load_duplicate", {
      entry_id: entryId,
      load_id: loadId,
      if_revision: ifRevision,
      ...(displayName === undefined ? {} : { display_name: displayName }),
    });
  }

  public deleteLoad(
    entryId: string,
    loadId: string,
    ifRevision: number,
  ): Promise<{ deleted: boolean }> {
    return this.request("load_delete", {
      entry_id: entryId,
      load_id: loadId,
      if_revision: ifRevision,
    });
  }

  public startOverride(
    entryId: string,
    loadId: string,
    desiredState: "on" | "off",
    options: Pick<OverrideRequest, "duration_seconds" | "expires_at" | "indefinite"> = {},
  ): Promise<JsonObject> {
    return this.request("override_start", {
      entry_id: entryId,
      load_id: loadId,
      desired_state: desiredState,
      ...options,
    });
  }

  public clearOverride(entryId: string, loadId: string): Promise<{ cleared: boolean }> {
    return this.request("override_clear", { entry_id: entryId, load_id: loadId });
  }

  public setAutomaticControl(
    entryId: string,
    loadId: string,
    enabled: boolean,
    ifRevision: number,
  ): Promise<JsonObject> {
    return this.request("automatic_control_set", {
      entry_id: entryId,
      load_id: loadId,
      enabled,
      if_revision: ifRevision,
    });
  }

  public getLoadDetail(entryId: string, loadId: string): Promise<JsonObject> {
    return this.request("load_detail", { entry_id: entryId, load_id: loadId });
  }

  public getCurrentPlan(entryId: string): Promise<CurrentPlanResponse | null> {
    return this.request("current_plan", { entry_id: entryId });
  }

  public getDailyTimeline(entryId: string): Promise<DailyTimelineResponse> {
    return this.request("daily_timeline", { entry_id: entryId });
  }

  public getHistoricalSummary(entryId: string): Promise<HistoricalSummaryResponse> {
    return this.request("historical_summary", { entry_id: entryId });
  }

  public getEventJournal(entryId: string, loadId?: string): Promise<EventJournalResponse> {
    return this.request("event_journal", {
      entry_id: entryId,
      ...(loadId === undefined ? {} : { load_id: loadId }),
    });
  }

  public replan(entryId: string, loadId?: string): Promise<JsonObject> {
    return this.request("replan", {
      entry_id: entryId,
      ...(loadId === undefined ? {} : { load_id: loadId }),
    });
  }

  /** Subscribe only to one site; event payloads are refreshed through reads. */
  public subscribeUpdates(
    entryId: string,
    callback: (summary: SiteSummaryResponse) => void,
  ): Promise<HomeAssistantUnsubscribe | undefined> {
    const connection = this.hass.connection;
    if (!connection?.subscribeMessage) {
      return Promise.resolve(undefined);
    }
    return connection.subscribeMessage(callback, {
      type: `${API_NAMESPACE}/subscribe_updates`,
      entry_id: entryId,
    });
  }
}

function normalizeSiteSummary(response: SiteSummaryResponse): SiteSummary {
  const warnings = response.warnings ?? [];
  const health = isHealth(response.health)
    ? response.health
    : warnings.length > 0
      ? "warning"
      : "healthy";

  return {
    site_id: response.site_id ?? response.entry_id ?? "site",
    name: response.name ?? "Load Control",
    controller_state: response.controller_state ?? response.state ?? "initialising",
    controlled_power:
      response.controlled_power ?? measurementFromWatts(response.total_controlled_power_w),
    active_load_count: response.active_load_count ?? response.active_loads ?? 0,
    waiting_load_count: response.waiting_load_count ?? response.waiting_loads ?? 0,
    health,
    updated_at: response.updated_at ?? response.last_replan_at,
  };
}

function normalizeLoadSummary(response: LoadListItemResponse): LoadSummary {
  const state = response.controller_state ?? response.state ?? "initialising";
  return {
    load_id: response.load_id ?? "unknown",
    name: response.name ?? response.load_id ?? "unknown",
    load_type: response.load_type ?? response.type ?? "unknown",
    controller_state: state,
    reason_code: response.reason_code ?? "configuration_invalid",
    config_revision: response.config_revision,
    automatic_control: response.automatic_control ?? false,
    optimisation_mode: response.optimisation_mode,
    priority: response.priority,
    manual_override: response.manual_override ?? overrideMode(response.override),
    current_power: response.current_power ?? measurementFromWatts(response.current_power_w),
    progress: response.progress,
    deadline: response.deadline,
    next_action: response.next_action,
    target_status: response.target_status,
    fault: response.fault ?? state === "fault",
  };
}

function measurementFromWatts(value: number | undefined): Measurement | undefined {
  return value === undefined ? undefined : { value, unit: "W" };
}

function overrideMode(value: unknown): LoadSummary["manual_override"] | undefined {
  if (value === "timed_on" || value === "timed_off" || value === "indefinite_on" || value === "indefinite_off") {
    return value;
  }
  if (typeof value !== "object" || value === null) {
    return undefined;
  }
  const override = value as Record<string, unknown>;
  const desiredState = override["desired_state"];
  const hasExpiry = typeof override["expires_at"] === "string";
  if (desiredState === "on") {
    return hasExpiry ? "timed_on" : "indefinite_on";
  }
  if (desiredState === "off") {
    return hasExpiry ? "timed_off" : "indefinite_off";
  }
  return undefined;
}

function isHealth(value: unknown): value is SiteSummary["health"] {
  return value === "healthy" || value === "warning" || value === "error" || value === "unknown";
}

export type { JsonValue };
