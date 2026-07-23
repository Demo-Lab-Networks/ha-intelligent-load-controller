import type { MessageKey } from "../../i18n/messages";
import type { PlanIntervalResponse } from "../../api/load-control-api";
import type {
  DashboardData,
  LoadSummary,
  SiteAttentionItem,
  SiteSummary,
} from "../../models/dashboard";

export type SiteFlowDirection = "exporting" | "importing" | "balanced" | "unknown";
export type OverviewStatusLevel = "ok" | "info" | "warning" | "critical" | "unknown";
export type OverviewStatusTone = "neutral" | "info" | "success" | "warning" | "danger";
export type AttentionSeverity = "critical" | "warning" | "info";
export type AttentionAction = "load_detail" | "settings" | "diagnostics";
export type OverviewLoadGroupKey = "attention" | "running" | "upcoming" | "waiting" | "complete";
export type TimelineSegmentTone = "planned" | "solar" | "free" | "manual" | "catch_up";

export interface TargetSummary {
  total: number;
  complete: number;
  onTrack: number;
  atRisk: number;
  impossible: number;
  unknown: number;
}

export interface AttentionItem {
  id: string;
  code?: string;
  severity: AttentionSeverity;
  titleKey: MessageKey;
  summaryKey: MessageKey;
  values: Readonly<Record<string, string | number>>;
  affectedLoadId?: string;
  action?: AttentionAction;
}

export interface OverviewHeroPresentation {
  level: OverviewStatusLevel;
  tone: OverviewStatusTone;
  titleKey: MessageKey;
  summaryKey: MessageKey;
  summaryValues: Readonly<Record<string, string | number>>;
  flow: SiteFlowDirection;
  primaryReasonCode?: string;
  nextAction?: string;
  nextActionAt?: string;
  nextActionKind?: "start" | "stop";
  nextActionDisplayName?: string;
  nextActionReasonCode?: string;
  targetSummary: TargetSummary;
}

export interface OverviewLoadGroup {
  key: OverviewLoadGroupKey;
  titleKey: MessageKey;
  loads: readonly LoadSummary[];
}

export interface TodayTimelineSegment {
  id: string;
  loadId?: string;
  loadName: string;
  startAt: string;
  endAt: string;
  startPercent: number;
  widthPercent: number;
  powerW?: number;
  reasonCode?: string;
  tone: TimelineSegmentTone;
}

export interface TodayTimelinePresentation {
  segments: readonly TodayTimelineSegment[];
  loadCount: number;
  windowStartAt?: string;
  windowEndAt?: string;
  currentPercent?: number;
  nextSegment?: TodayTimelineSegment;
}

export interface OverviewPresentation {
  hero: OverviewHeroPresentation;
  attention: readonly AttentionItem[];
  loadGroups: readonly OverviewLoadGroup[];
}

const RUNNING_STATES = new Set([
  "scheduled_run",
  "free_period_run",
  "solar_run",
  "low_cost_run",
  "deadline_catchup",
  "variable_power_run",
  "minimum_on_hold",
  "manual_on",
]);

const WAITING_STATES = new Set([
  "idle",
  "waiting_for_window",
  "solar_qualifying",
  "minimum_off_hold",
  "blocked_by_site_limit",
  "blocked_by_higher_priority",
]);

export function createOverviewPresentation(dashboard: DashboardData): OverviewPresentation {
  const targetSummary = dashboard.site.presentation?.target_summary ?? summariseTargets(dashboard.loads);
  const attention = createAttentionItems(dashboard);
  const runningLoads = dashboard.loads.filter(isLoadRunning);
  const waitingLoads = dashboard.loads.filter((load) => !isLoadRunning(load) && WAITING_STATES.has(load.controller_state));
  const flow = dashboard.site.presentation?.flow_direction ?? classifySiteFlow(dashboard.site);
  const hero = createHeroPresentation(dashboard, {
    attention,
    flow,
    runningLoads,
    targetSummary,
    waitingLoads,
  });

  return {
    hero,
    attention,
    loadGroups: groupOverviewLoads(dashboard.loads),
  };
}

export function classifySiteFlow(site: SiteSummary): SiteFlowDirection {
  const importW = Math.max(0, site.grid_import?.value ?? 0);
  const exportW = Math.max(0, site.grid_export?.value ?? 0);
  if (importW === 0 && exportW === 0 && !site.grid_import && !site.grid_export) {
    return "unknown";
  }
  if (exportW > importW && exportW > 0) {
    return "exporting";
  }
  if (importW > exportW && importW > 0) {
    return "importing";
  }
  return "balanced";
}

export function summariseTargets(loads: readonly LoadSummary[]): TargetSummary {
  const summary: TargetSummary = {
    total: loads.length,
    complete: 0,
    onTrack: 0,
    atRisk: 0,
    impossible: 0,
    unknown: 0,
  };
  for (const load of loads) {
    switch (load.target_status) {
      case "complete":
        summary.complete += 1;
        break;
      case "on_track":
        summary.onTrack += 1;
        break;
      case "at_risk":
        summary.atRisk += 1;
        break;
      case "impossible":
        summary.impossible += 1;
        break;
      default:
        summary.unknown += 1;
        break;
    }
  }
  return summary;
}

export function createAttentionItems(dashboard: DashboardData): readonly AttentionItem[] {
  const backendAttention = createBackendAttentionItems(dashboard.site.attention);
  const fallbackAttention = createFallbackAttentionItems(dashboard);
  if (backendAttention.length > 0) {
    const covered = new Set(backendAttention.map(attentionCoverageKey));
    const hasBackendSiteAttention = backendAttention.some((item) => !item.affectedLoadId);
    return [
      ...backendAttention,
      ...fallbackAttention.filter(
        (item) =>
          !(item.code === "site_health" && hasBackendSiteAttention) &&
          !covered.has(attentionCoverageKey(item)),
      ),
    ];
  }

  return fallbackAttention;
}

function createFallbackAttentionItems(dashboard: DashboardData): readonly AttentionItem[] {
  const items: AttentionItem[] = [];
  if (dashboard.site.health === "error") {
    items.push({
      id: "site-health-error",
      code: "site_health",
      severity: "critical",
      titleKey: "overview.attention.siteError",
      summaryKey: "overview.attention.siteHealthSummary",
      values: { site: dashboard.site.name },
    });
  } else if (dashboard.site.health === "warning") {
    items.push({
      id: "site-health-warning",
      code: "site_health",
      severity: "warning",
      titleKey: "overview.attention.siteWarning",
      summaryKey: "overview.attention.siteHealthSummary",
      values: { site: dashboard.site.name },
    });
  }

  for (const load of dashboard.loads) {
    if (load.fault) {
      items.push({
        id: `${load.load_id}:fault`,
        code: "load_fault",
        severity: "critical",
        titleKey: "overview.attention.loadFault",
        summaryKey: "overview.attention.loadFaultSummary",
        values: { load: load.name },
        affectedLoadId: load.load_id,
        action: "load_detail",
      });
      continue;
    }
    if (load.target_status === "impossible") {
      items.push({
        id: `${load.load_id}:impossible`,
        code: "target_impossible",
        severity: "critical",
        titleKey: "overview.attention.targetImpossible",
        summaryKey: "overview.attention.targetImpossibleSummary",
        values: { load: load.name },
        affectedLoadId: load.load_id,
        action: "load_detail",
      });
      continue;
    }
    if (load.target_status === "at_risk") {
      items.push({
        id: `${load.load_id}:risk`,
        code: "target_at_risk",
        severity: "warning",
        titleKey: "overview.attention.targetAtRisk",
        summaryKey: "overview.attention.targetAtRiskSummary",
        values: { load: load.name },
        affectedLoadId: load.load_id,
        action: "load_detail",
      });
      continue;
    }
    if (load.manual_override?.startsWith("indefinite")) {
      items.push({
        id: `${load.load_id}:indefinite-override`,
        code: "manual_indefinite_override",
        severity: "warning",
        titleKey: "overview.attention.indefiniteOverride",
        summaryKey: "overview.attention.indefiniteOverrideSummary",
        values: { load: load.name },
        affectedLoadId: load.load_id,
        action: "load_detail",
      });
      continue;
    }
    if (load.manual_override?.startsWith("timed")) {
      items.push({
        id: `${load.load_id}:timed-override`,
        code: "manual_timed_boost",
        severity: "info",
        titleKey: "overview.attention.timedOverride",
        summaryKey: "overview.attention.timedOverrideSummary",
        values: { load: load.name },
        affectedLoadId: load.load_id,
        action: "load_detail",
      });
    }
  }

  return items;
}

function attentionCoverageKey(item: AttentionItem): string {
  return `${item.code ?? item.id}:${item.affectedLoadId ?? "site"}`;
}

function createBackendAttentionItems(items: readonly SiteAttentionItem[] | undefined): readonly AttentionItem[] {
  if (!items || items.length === 0) {
    return [];
  }
  return [...items]
    .sort((left, right) => left.rank - right.rank || left.id.localeCompare(right.id))
    .map((item) => {
      const copy = attentionCopyForCode(item.code);
      const affectedName = item.display_name ?? item.affected_id ?? "site";
      return {
        id: item.id,
        code: item.code,
        severity: item.severity,
        titleKey: copy.titleKey,
        summaryKey: copy.summaryKey,
        values: {
          code: item.code,
          load: affectedName,
          site: affectedName,
        },
        affectedLoadId: item.affected_kind === "load" ? item.affected_id : undefined,
        action: attentionAction(item.action),
      };
    });
}

function attentionAction(action: string | undefined): AttentionAction | undefined {
  if (action === "load_detail" || action === "settings" || action === "diagnostics") {
    return action;
  }
  return undefined;
}

function attentionCopyForCode(code: string): { titleKey: MessageKey; summaryKey: MessageKey } {
  switch (code) {
    case "duplicate_actuator_binding":
      return {
        titleKey: "overview.attention.duplicateActuator",
        summaryKey: "overview.attention.duplicateActuatorSummary",
      };
    case "configuration_invalid":
      return {
        titleKey: "overview.attention.configurationInvalid",
        summaryKey: "overview.attention.configurationInvalidSummary",
      };
    case "load_configuration_invalid":
      return {
        titleKey: "overview.attention.loadConfigurationInvalid",
        summaryKey: "overview.attention.loadConfigurationInvalidSummary",
      };
    case "input_missing":
      return {
        titleKey: "overview.attention.inputMissing",
        summaryKey: "overview.attention.inputMissingSummary",
      };
    case "actuator_unavailable":
      return {
        titleKey: "overview.attention.actuatorUnavailable",
        summaryKey: "overview.attention.actuatorUnavailableSummary",
      };
    case "actuator_feedback_mismatch":
      return {
        titleKey: "overview.attention.feedbackMismatch",
        summaryKey: "overview.attention.feedbackMismatchSummary",
      };
    case "target_impossible":
      return {
        titleKey: "overview.attention.targetImpossible",
        summaryKey: "overview.attention.targetImpossibleSummary",
      };
    case "target_at_risk":
      return {
        titleKey: "overview.attention.targetAtRisk",
        summaryKey: "overview.attention.targetAtRiskSummary",
      };
    case "deadline_approaching":
      return {
        titleKey: "overview.attention.deadlineApproaching",
        summaryKey: "overview.attention.deadlineApproachingSummary",
      };
    case "manual_indefinite_override":
      return {
        titleKey: "overview.attention.indefiniteOverride",
        summaryKey: "overview.attention.indefiniteOverrideSummary",
      };
    case "manual_timed_boost":
      return {
        titleKey: "overview.attention.timedOverride",
        summaryKey: "overview.attention.timedOverrideSummary",
      };
    default:
      return {
        titleKey: "overview.attention.backendItem",
        summaryKey: "overview.attention.backendItemSummary",
      };
  }
}

export function groupOverviewLoads(loads: readonly LoadSummary[]): readonly OverviewLoadGroup[] {
  const attentionLoadIds = new Set(
    loads
      .filter((load) => loadNeedsAttention(load))
      .map((load) => load.load_id),
  );
  const groups: OverviewLoadGroup[] = [
    {
      key: "attention",
      titleKey: "overview.loads.needsAttention",
      loads: loads.filter((load) => attentionLoadIds.has(load.load_id)),
    },
    {
      key: "running",
      titleKey: "overview.loads.runningNow",
      loads: loads.filter((load) => !attentionLoadIds.has(load.load_id) && isLoadRunning(load)),
    },
    {
      key: "upcoming",
      titleKey: "overview.loads.startingSoon",
      loads: loads.filter(
        (load) =>
          !attentionLoadIds.has(load.load_id) &&
          !isLoadRunning(load) &&
          load.next_action !== undefined,
      ),
    },
    {
      key: "waiting",
      titleKey: "overview.loads.waiting",
      loads: loads.filter(
        (load) =>
          !attentionLoadIds.has(load.load_id) &&
          !isLoadRunning(load) &&
          load.next_action === undefined &&
          load.target_status !== "complete" &&
          load.controller_state !== "target_complete",
      ),
    },
    {
      key: "complete",
      titleKey: "overview.loads.complete",
      loads: loads.filter((load) => load.target_status === "complete" || load.controller_state === "target_complete"),
    },
  ];

  return groups.filter((group) => group.loads.length > 0);
}

export function isLoadRunning(load: LoadSummary): boolean {
  return RUNNING_STATES.has(load.controller_state) || (load.current_power?.value ?? 0) > 0;
}

export function createTodayTimelinePresentation(
  intervals: readonly PlanIntervalResponse[] | undefined,
  loads: readonly LoadSummary[],
  now: Date = new Date(),
): TodayTimelinePresentation {
  const loadNames = new Map(loads.map((load) => [load.load_id, load.name]));
  const parsed = (intervals ?? [])
    .map((interval, index) => {
      const start = Date.parse(interval.start_at ?? "");
      const end = Date.parse(interval.end_at ?? "");
      if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
        return undefined;
      }
      return { interval, index, start, end };
    })
    .filter((item): item is NonNullable<typeof item> => item !== undefined)
    .sort((left, right) => left.start - right.start || left.end - right.end);

  if (parsed.length === 0) {
    return {
      segments: [],
      loadCount: 0,
    };
  }

  const first = parsed[0];
  if (!first) {
    return {
      segments: [],
      loadCount: 0,
    };
  }

  const windowStart = first.start;
  const windowEnd = Math.max(...parsed.map((item) => item.end));
  const windowDuration = Math.max(1, windowEnd - windowStart);
  const loadIds = new Set<string>();
  const segments = parsed.map(({ interval, index, start, end }) => {
    const loadId = interval.load_id;
    if (loadId) {
      loadIds.add(loadId);
    }
    const startPercent = clampPercent(((start - windowStart) / windowDuration) * 100);
    const widthPercent = Math.max(1.5, clampPercent(((end - start) / windowDuration) * 100));
    return {
      id: `${interval.load_id ?? "site"}:${interval.start_at}:${interval.end_at}:${index}`,
      loadId,
      loadName: loadId ? loadNames.get(loadId) ?? loadId : "Site",
      startAt: interval.start_at ?? new Date(start).toISOString(),
      endAt: interval.end_at ?? new Date(end).toISOString(),
      startPercent,
      widthPercent: Math.min(widthPercent, 100 - startPercent),
      powerW: interval.power_w,
      reasonCode: interval.reason_code,
      tone: toneForTimelineReason(interval.reason_code),
    };
  });
  const nowMs = now.getTime();
  const currentPercent =
    Number.isFinite(nowMs) && nowMs >= windowStart && nowMs <= windowEnd
      ? clampPercent(((nowMs - windowStart) / windowDuration) * 100)
      : undefined;
  const nextSegment = Number.isFinite(nowMs)
    ? segments.find((segment) => Date.parse(segment.endAt) >= nowMs)
    : segments[0];

  return {
    segments,
    loadCount: loadIds.size,
    windowStartAt: new Date(windowStart).toISOString(),
    windowEndAt: new Date(windowEnd).toISOString(),
    currentPercent,
    nextSegment,
  };
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function toneForTimelineReason(reasonCode: string | undefined): TimelineSegmentTone {
  if (!reasonCode) {
    return "planned";
  }
  if (reasonCode.includes("manual")) {
    return "manual";
  }
  if (reasonCode.includes("solar")) {
    return "solar";
  }
  if (reasonCode.includes("free")) {
    return "free";
  }
  if (reasonCode.includes("deadline") || reasonCode.includes("catchup")) {
    return "catch_up";
  }
  return "planned";
}

export function loadNeedsAttention(load: LoadSummary): boolean {
  return load.fault === true || load.target_status === "impossible" || load.target_status === "at_risk";
}

export function loadTypeIcon(loadType: string): string {
  if (loadType.includes("hot") || loadType.includes("hws")) {
    return "♨";
  }
  if (loadType.includes("ev")) {
    return "⚡";
  }
  if (loadType.includes("battery")) {
    return "▰";
  }
  return "●";
}

export function loadTypeLabelKey(loadType: string): MessageKey {
  if (loadType.includes("hot") || loadType.includes("hws")) {
    return "load.type.hws";
  }
  if (loadType.includes("ev")) {
    return "load.type.ev";
  }
  if (loadType.includes("battery")) {
    return "load.type.battery";
  }
  return "load.type.generic";
}

export function loadStatusTone(load: LoadSummary): OverviewStatusTone {
  if (load.fault || load.target_status === "impossible") {
    return "danger";
  }
  if (load.target_status === "at_risk" || load.manual_override?.startsWith("indefinite")) {
    return "warning";
  }
  if (load.target_status === "complete" || load.controller_state === "target_complete") {
    return "success";
  }
  if (isLoadRunning(load)) {
    return "info";
  }
  return "neutral";
}

function createHeroPresentation(
  dashboard: DashboardData,
  context: {
    attention: readonly AttentionItem[];
    flow: SiteFlowDirection;
    runningLoads: readonly LoadSummary[];
    targetSummary: TargetSummary;
    waitingLoads: readonly LoadSummary[];
  },
): OverviewHeroPresentation {
  const fallback = createFallbackHeroPresentation(dashboard, context);
  const presentation = dashboard.site.presentation;
  if (presentation === undefined) {
    return fallback;
  }
  const summaryKey = statusSummaryKey(presentation.summary_code);
  return {
    ...fallback,
    level: presentation.status_level ?? fallback.level,
    tone: presentation.status_level ? toneForSiteLevel(presentation.status_level) : fallback.tone,
    titleKey: statusTitleKey(presentation.status_code) ?? fallback.titleKey,
    summaryKey: summaryKey ?? fallback.summaryKey,
    summaryValues: summaryKey ? (presentation.summary_values ?? fallback.summaryValues) : fallback.summaryValues,
    flow: presentation.flow_direction ?? fallback.flow,
    primaryReasonCode: presentation.decision_reason_code ?? fallback.primaryReasonCode,
    nextActionAt: presentation.next_action_at ?? fallback.nextActionAt,
    nextActionKind: presentation.next_action_kind ?? fallback.nextActionKind,
    nextActionDisplayName: presentation.next_action_display_name ?? fallback.nextActionDisplayName,
    nextActionReasonCode: presentation.next_action_reason_code ?? fallback.nextActionReasonCode,
    targetSummary: presentation.target_summary ?? fallback.targetSummary,
  };
}

function createFallbackHeroPresentation(
  dashboard: DashboardData,
  context: {
    attention: readonly AttentionItem[];
    flow: SiteFlowDirection;
    runningLoads: readonly LoadSummary[];
    targetSummary: TargetSummary;
    waitingLoads: readonly LoadSummary[];
  },
): OverviewHeroPresentation {
  const firstCritical = context.attention.find((item) => item.severity === "critical");
  const firstWarning = context.attention.find((item) => item.severity === "warning");
  const primaryLoad = context.runningLoads[0] ?? context.waitingLoads[0] ?? dashboard.loads[0];
  if (firstCritical) {
    return {
      level: "critical",
      tone: "danger",
      titleKey: "overview.status.needsAttention",
      summaryKey: "overview.status.attentionSummary",
      summaryValues: { count: context.attention.length },
      flow: context.flow,
      primaryReasonCode: primaryLoad?.reason_code,
      nextAction: primaryLoad?.next_action,
      nextActionAt: primaryLoad?.next_action_at,
      nextActionKind: primaryLoad?.next_action_kind,
      nextActionDisplayName: primaryLoad?.name,
      nextActionReasonCode: primaryLoad?.next_action_reason_code,
      targetSummary: context.targetSummary,
    };
  }
  if (firstWarning) {
    return {
      level: "warning",
      tone: "warning",
      titleKey: "overview.status.watch",
      summaryKey: "overview.status.attentionSummary",
      summaryValues: { count: context.attention.length },
      flow: context.flow,
      primaryReasonCode: primaryLoad?.reason_code,
      nextAction: primaryLoad?.next_action,
      nextActionAt: primaryLoad?.next_action_at,
      nextActionKind: primaryLoad?.next_action_kind,
      nextActionDisplayName: primaryLoad?.name,
      nextActionReasonCode: primaryLoad?.next_action_reason_code,
      targetSummary: context.targetSummary,
    };
  }
  const runningLoad = context.runningLoads[0];
  if (context.runningLoads.length > 0) {
    return {
      level: "info",
      tone: "info",
      titleKey: "overview.status.controlling",
      summaryKey: "overview.status.activeSummary",
      summaryValues: {
        active: context.runningLoads.length,
        waiting: dashboard.site.waiting_load_count,
      },
      flow: context.flow,
      primaryReasonCode: runningLoad?.reason_code,
      nextAction: runningLoad?.next_action ?? primaryLoad?.next_action,
      nextActionAt: runningLoad?.next_action_at ?? primaryLoad?.next_action_at,
      nextActionKind: runningLoad?.next_action_kind ?? primaryLoad?.next_action_kind,
      nextActionDisplayName: runningLoad?.name ?? primaryLoad?.name,
      nextActionReasonCode: runningLoad?.next_action_reason_code ?? primaryLoad?.next_action_reason_code,
      targetSummary: context.targetSummary,
    };
  }
  return {
    level: dashboard.site.health === "healthy" ? "ok" : "unknown",
    tone: dashboard.site.health === "healthy" ? "success" : "neutral",
    titleKey:
      context.flow === "exporting"
        ? "overview.status.exporting"
        : context.flow === "importing"
          ? "overview.status.importing"
          : "overview.status.monitoring",
    summaryKey: "overview.status.monitoringSummary",
    summaryValues: {
      waiting: dashboard.site.waiting_load_count,
      total: dashboard.loads.length,
    },
    flow: context.flow,
    primaryReasonCode: primaryLoad?.reason_code,
    nextAction: primaryLoad?.next_action,
    nextActionAt: primaryLoad?.next_action_at,
    nextActionKind: primaryLoad?.next_action_kind,
    nextActionDisplayName: primaryLoad?.name,
    nextActionReasonCode: primaryLoad?.next_action_reason_code,
    targetSummary: context.targetSummary,
  };
}

function toneForSiteLevel(level: OverviewStatusLevel): OverviewStatusTone {
  switch (level) {
    case "critical":
      return "danger";
    case "warning":
      return "warning";
    case "info":
      return "info";
    case "ok":
      return "success";
    case "unknown":
      return "neutral";
  }
}

function statusTitleKey(code: string | undefined): MessageKey | undefined {
  switch (code) {
    case "needs_attention":
      return "overview.status.needsAttention";
    case "watch":
      return "overview.status.watch";
    case "controlling":
      return "overview.status.controlling";
    case "exporting":
      return "overview.status.exporting";
    case "importing":
      return "overview.status.importing";
    case "monitoring":
      return "overview.status.monitoring";
    default:
      return undefined;
  }
}

function statusSummaryKey(code: string | undefined): MessageKey | undefined {
  switch (code) {
    case "attention":
      return "overview.status.attentionSummary";
    case "active":
      return "overview.status.activeSummary";
    case "monitoring":
      return "overview.status.monitoringSummary";
    default:
      return undefined;
  }
}
