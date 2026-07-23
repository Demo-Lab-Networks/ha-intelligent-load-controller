import type { MessageKey } from "../../i18n/messages";
import type { LoadSummary } from "../../models/dashboard";
import {
  isLoadRunning,
  loadNeedsAttention,
  loadStatusTone,
  loadTypeIcon,
  loadTypeLabelKey,
  type OverviewStatusTone,
} from "../overview/overview-presentation";

export const LOAD_CATALOGUE_SORTS = [
  "needs_attention",
  "active_first",
  "earliest_deadline",
  "priority",
  "highest_power",
  "name",
] as const;

export const LOAD_CATALOGUE_STATUS_FILTERS = [
  "all",
  "needs_attention",
  "running",
  "waiting",
  "complete",
  "manual",
  "not_controlled",
] as const;

export const LOAD_CATALOGUE_GROUPS = ["none", "status", "type", "area", "priority"] as const;

export type LoadCatalogueSort = (typeof LOAD_CATALOGUE_SORTS)[number];
export type LoadCatalogueStatusFilter = (typeof LOAD_CATALOGUE_STATUS_FILTERS)[number];
export type LoadCatalogueGroup = (typeof LOAD_CATALOGUE_GROUPS)[number];

export interface LoadCatalogueFilters {
  query: string;
  sort: LoadCatalogueSort;
  status: LoadCatalogueStatusFilter;
  type: string;
  group: LoadCatalogueGroup;
}

export interface LoadCatalogueTypeOption {
  value: string;
  icon: string;
  labelKey: MessageKey;
  count: number;
}

export interface LoadCatalogueGroupResult {
  key: string;
  titleKey: MessageKey;
  titleValues?: Readonly<Record<string, string | number>>;
  tone: OverviewStatusTone;
  loads: readonly LoadSummary[];
}

export interface LoadCataloguePresentation {
  totalCount: number;
  visibleCount: number;
  typeOptions: readonly LoadCatalogueTypeOption[];
  groups: readonly LoadCatalogueGroupResult[];
}

type CatalogueStatusGroup =
  | "needs_attention"
  | "manual"
  | "not_controlled"
  | "running"
  | "complete"
  | "waiting";

const STATUS_GROUP_ORDER: readonly CatalogueStatusGroup[] = [
  "needs_attention",
  "manual",
  "not_controlled",
  "running",
  "waiting",
  "complete",
];

const STATUS_GROUP_TITLES: Record<CatalogueStatusGroup, MessageKey> = {
  needs_attention: "load.statusFilter.needsAttention",
  manual: "load.statusFilter.manual",
  not_controlled: "load.statusFilter.notControlled",
  running: "load.statusFilter.running",
  waiting: "load.statusFilter.waiting",
  complete: "load.statusFilter.complete",
};

export function createLoadCataloguePresentation(
  loads: readonly LoadSummary[],
  filters: LoadCatalogueFilters,
): LoadCataloguePresentation {
  const typeOptions = createTypeOptions(loads);
  const filtered = loads
    .filter((load) => matchesQuery(load, filters.query))
    .filter((load) => matchesStatus(load, filters.status))
    .filter((load) => filters.type === "all" || load.load_type === filters.type);
  const sorted = sortLoads(filtered, filters.sort);
  const groups = groupLoads(sorted, filters.group);

  return {
    totalCount: loads.length,
    visibleCount: sorted.length,
    typeOptions,
    groups,
  };
}

export function loadCatalogueSortLabel(sort: LoadCatalogueSort): MessageKey {
  switch (sort) {
    case "needs_attention":
      return "load.sort.needsAttention";
    case "active_first":
      return "load.sort.activeFirst";
    case "earliest_deadline":
      return "load.sort.earliestDeadline";
    case "priority":
      return "load.sort.priority";
    case "highest_power":
      return "load.sort.highestPower";
    case "name":
      return "load.sort.name";
  }
}

export function loadCatalogueStatusFilterLabel(status: LoadCatalogueStatusFilter): MessageKey {
  switch (status) {
    case "all":
      return "load.statusFilter.all";
    case "needs_attention":
      return "load.statusFilter.needsAttention";
    case "running":
      return "load.statusFilter.running";
    case "waiting":
      return "load.statusFilter.waiting";
    case "complete":
      return "load.statusFilter.complete";
    case "manual":
      return "load.statusFilter.manual";
    case "not_controlled":
      return "load.statusFilter.notControlled";
  }
}

export function loadCatalogueGroupLabel(group: LoadCatalogueGroup): MessageKey {
  switch (group) {
    case "none":
      return "load.group.none";
    case "status":
      return "load.group.byStatus";
    case "type":
      return "load.group.byType";
    case "area":
      return "load.group.byArea";
    case "priority":
      return "load.group.byPriority";
  }
}

function createTypeOptions(loads: readonly LoadSummary[]): readonly LoadCatalogueTypeOption[] {
  const byType = new Map<string, LoadCatalogueTypeOption>();
  for (const load of loads) {
    const existing = byType.get(load.load_type);
    if (existing) {
      byType.set(load.load_type, { ...existing, count: existing.count + 1 });
      continue;
    }
    byType.set(load.load_type, {
      value: load.load_type,
      icon: loadTypeIcon(load.load_type),
      labelKey: loadTypeLabelKey(load.load_type),
      count: 1,
    });
  }
  return [...byType.values()].sort(
    (left, right) => left.labelKey.localeCompare(right.labelKey) || left.value.localeCompare(right.value),
  );
}

function matchesQuery(load: LoadSummary, rawQuery: string): boolean {
  const query = rawQuery.trim().toLocaleLowerCase();
  if (!query) {
    return true;
  }
  return [
    load.name,
    load.load_id,
    load.load_type,
    load.controller_state,
    load.reason_code,
    load.optimisation_mode,
    load.area,
    load.priority?.toString(),
  ]
    .filter((value): value is string => value !== undefined)
    .some((value) => value.toLocaleLowerCase().includes(query));
}

function matchesStatus(load: LoadSummary, status: LoadCatalogueStatusFilter): boolean {
  switch (status) {
    case "all":
      return true;
    case "needs_attention":
      return loadNeedsAttention(load);
    case "running":
      return isLoadRunning(load);
    case "waiting":
      return catalogueStatusGroup(load) === "waiting";
    case "complete":
      return isLoadComplete(load);
    case "manual":
      return load.manual_override !== undefined;
    case "not_controlled":
      return !load.automatic_control;
  }
}

function sortLoads(loads: readonly LoadSummary[], sort: LoadCatalogueSort): readonly LoadSummary[] {
  return [...loads].sort((left, right) => {
    switch (sort) {
      case "needs_attention":
        return (
          attentionRank(left) - attentionRank(right) ||
          compareRunning(left, right) ||
          comparePowerDescending(left, right) ||
          compareNames(left, right)
        );
      case "active_first":
        return compareRunning(left, right) || comparePowerDescending(left, right) || compareNames(left, right);
      case "earliest_deadline":
        return compareDeadlines(left, right) || compareNames(left, right);
      case "priority":
        return comparePriorityDescending(left, right) || compareNames(left, right);
      case "highest_power":
        return comparePowerDescending(left, right) || compareNames(left, right);
      case "name":
        return compareNames(left, right);
    }
  });
}

function groupLoads(
  loads: readonly LoadSummary[],
  group: LoadCatalogueGroup,
): readonly LoadCatalogueGroupResult[] {
  if (loads.length === 0) {
    return [];
  }
  switch (group) {
    case "none":
      return [
        {
          key: "all",
          titleKey: "load.group.all",
          tone: "neutral",
          loads,
        },
      ];
    case "status":
      return STATUS_GROUP_ORDER.map((key) => {
        const groupedLoads = loads.filter((load) => catalogueStatusGroup(load) === key);
        return {
          key,
          titleKey: STATUS_GROUP_TITLES[key],
          tone: key === "needs_attention" ? strongestTone(groupedLoads) : toneForStatusGroup(key),
          loads: groupedLoads,
        };
      }).filter((result) => result.loads.length > 0);
    case "type":
      return groupByKey(loads, (load) => load.load_type)
        .map(([key, groupedLoads]) => ({
          key: `type:${key}`,
          titleKey: loadTypeLabelKey(key),
          tone: strongestTone(groupedLoads),
          loads: groupedLoads,
        }))
        .sort((left, right) => left.titleKey.localeCompare(right.titleKey) || left.key.localeCompare(right.key));
    case "area":
      return groupByKey(loads, (load) => load.area?.trim() || "")
        .map(([key, groupedLoads]) => {
          const titleKey: MessageKey = key ? "load.group.area" : "load.group.noArea";
          return {
            key: `area:${key || "unassigned"}`,
            titleKey,
            titleValues: key ? { area: key } : undefined,
            tone: strongestTone(groupedLoads),
            loads: groupedLoads,
          };
        })
        .sort((left, right) => {
          if (left.key === "area:unassigned") {
            return 1;
          }
          if (right.key === "area:unassigned") {
            return -1;
          }
          return left.key.localeCompare(right.key);
        });
    case "priority":
      return groupByKey(loads, (load) => load.priority?.toString() ?? "")
        .map(([key, groupedLoads]) => {
          const titleKey: MessageKey = key ? "load.group.priority" : "load.group.noPriority";
          return {
            key: `priority:${key || "none"}`,
            titleKey,
            titleValues: key ? { priority: key } : undefined,
            tone: strongestTone(groupedLoads),
            loads: groupedLoads,
          };
        })
        .sort((left, right) => priorityGroupRank(left.key) - priorityGroupRank(right.key));
  }
}

function groupByKey(
  loads: readonly LoadSummary[],
  keyForLoad: (load: LoadSummary) => string,
): readonly [string, readonly LoadSummary[]][] {
  const groups = new Map<string, LoadSummary[]>();
  for (const load of loads) {
    const key = keyForLoad(load);
    const existing = groups.get(key);
    if (existing) {
      existing.push(load);
    } else {
      groups.set(key, [load]);
    }
  }
  return [...groups.entries()];
}

function catalogueStatusGroup(load: LoadSummary): CatalogueStatusGroup {
  if (loadNeedsAttention(load)) {
    return "needs_attention";
  }
  if (load.manual_override !== undefined) {
    return "manual";
  }
  if (!load.automatic_control) {
    return "not_controlled";
  }
  if (isLoadRunning(load)) {
    return "running";
  }
  if (isLoadComplete(load)) {
    return "complete";
  }
  return "waiting";
}

function isLoadComplete(load: LoadSummary): boolean {
  return load.target_status === "complete" || load.controller_state === "target_complete";
}

function attentionRank(load: LoadSummary): number {
  if (load.fault || load.target_status === "impossible") {
    return 0;
  }
  if (load.target_status === "at_risk") {
    return 1;
  }
  if (load.manual_override?.startsWith("indefinite")) {
    return 2;
  }
  if (load.manual_override?.startsWith("timed")) {
    return 3;
  }
  if (!load.automatic_control) {
    return 4;
  }
  if (isLoadRunning(load)) {
    return 5;
  }
  return 6;
}

function compareRunning(left: LoadSummary, right: LoadSummary): number {
  return Number(isLoadRunning(right)) - Number(isLoadRunning(left));
}

function comparePowerDescending(left: LoadSummary, right: LoadSummary): number {
  return (right.current_power?.value ?? 0) - (left.current_power?.value ?? 0);
}

function comparePriorityDescending(left: LoadSummary, right: LoadSummary): number {
  return (right.priority ?? Number.NEGATIVE_INFINITY) - (left.priority ?? Number.NEGATIVE_INFINITY);
}

function compareDeadlines(left: LoadSummary, right: LoadSummary): number {
  const leftTime = deadlineTime(left);
  const rightTime = deadlineTime(right);
  if (leftTime === undefined && rightTime === undefined) {
    return 0;
  }
  if (leftTime === undefined) {
    return 1;
  }
  if (rightTime === undefined) {
    return -1;
  }
  return leftTime - rightTime;
}

function deadlineTime(load: LoadSummary): number | undefined {
  if (!load.deadline) {
    return undefined;
  }
  const parsed = Date.parse(load.deadline);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function compareNames(left: LoadSummary, right: LoadSummary): number {
  return left.name.localeCompare(right.name, undefined, { sensitivity: "base", numeric: true });
}

function toneForStatusGroup(group: CatalogueStatusGroup): OverviewStatusTone {
  switch (group) {
    case "needs_attention":
      return "warning";
    case "manual":
      return "warning";
    case "not_controlled":
      return "neutral";
    case "running":
      return "info";
    case "waiting":
      return "neutral";
    case "complete":
      return "success";
  }
}

function strongestTone(loads: readonly LoadSummary[]): OverviewStatusTone {
  const tones = loads.map(loadStatusTone);
  if (tones.includes("danger")) {
    return "danger";
  }
  if (tones.includes("warning")) {
    return "warning";
  }
  if (tones.includes("info")) {
    return "info";
  }
  if (tones.includes("success")) {
    return "success";
  }
  return "neutral";
}

function priorityGroupRank(key: string): number {
  const priority = Number(key.replace("priority:", ""));
  return Number.isFinite(priority) ? -priority : Number.POSITIVE_INFINITY;
}
