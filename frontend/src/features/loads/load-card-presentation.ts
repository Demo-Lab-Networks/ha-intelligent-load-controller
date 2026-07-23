import type { MessageKey } from "../../i18n/messages";
import type { LoadSummary } from "../../models/dashboard";
import {
  isLoadRunning,
  loadStatusTone,
  loadTypeIcon,
  loadTypeLabelKey,
  type OverviewStatusTone,
} from "../overview/overview-presentation";

export type LoadKind = "hot_water" | "ev" | "battery" | "generic";

export interface LoadCardBadge {
  labelKey: MessageKey;
  tone: OverviewStatusTone;
}

export interface LoadCardPresentation {
  kind: LoadKind;
  tone: OverviewStatusTone;
  typeIcon: string;
  typeLabelKey: MessageKey;
  stateKey: MessageKey;
  progressLabelKey: MessageKey;
  primaryActionKey: MessageKey;
  nextActionFallbackKey: MessageKey;
  automaticTone: OverviewStatusTone;
  overrideLabelKey?: MessageKey;
  targetLabelKey?: MessageKey;
  badges: readonly LoadCardBadge[];
}

export function createLoadCardPresentation(load: LoadSummary): LoadCardPresentation {
  const kind = loadKind(load.load_type);
  const tone = loadStatusTone(load);
  const overrideLabelKey = overrideLabel(load.manual_override);
  const targetLabelKey = targetStatusLabel(load.target_status);
  return {
    kind,
    tone,
    typeIcon: loadTypeIcon(load.load_type),
    typeLabelKey: loadTypeLabelKey(load.load_type),
    stateKey: loadStateKey(load, kind),
    progressLabelKey: progressLabelKey(kind),
    primaryActionKey: primaryActionKey(load),
    nextActionFallbackKey: nextActionFallbackKey(load),
    automaticTone: load.automatic_control ? "success" : "neutral",
    overrideLabelKey,
    targetLabelKey,
    badges: [
      {
        labelKey: load.automatic_control ? "load.badge.automaticOn" : "load.badge.automaticOff",
        tone: load.automatic_control ? "success" : "neutral",
      },
      ...(overrideLabelKey ? [{ labelKey: overrideLabelKey, tone: "warning" as const }] : []),
      ...(targetLabelKey ? [{ labelKey: targetLabelKey, tone: targetTone(load.target_status) }] : []),
      ...(load.fault ? [{ labelKey: "load.badge.fault" as const, tone: "danger" as const }] : []),
    ],
  };
}

function loadKind(loadType: string): LoadKind {
  if (loadType.includes("hot") || loadType.includes("hws")) {
    return "hot_water";
  }
  if (loadType.includes("ev")) {
    return "ev";
  }
  if (loadType.includes("battery")) {
    return "battery";
  }
  return "generic";
}

function loadStateKey(load: LoadSummary, kind: LoadKind): MessageKey {
  if (load.fault) {
    return "load.summary.fault";
  }
  if (load.target_status === "impossible") {
    return "load.summary.impossible";
  }
  if (load.target_status === "at_risk") {
    return "load.summary.atRisk";
  }
  if (load.manual_override?.startsWith("indefinite")) {
    return "load.summary.manualIndefinite";
  }
  if (load.manual_override?.startsWith("timed")) {
    return "load.summary.manualTimed";
  }
  if (!load.automatic_control) {
    return "load.summary.notControlled";
  }
  if (load.target_status === "complete" || load.controller_state === "target_complete") {
    return stateByKind(kind, {
      hot_water: "load.summary.hwsReady",
      ev: "load.summary.evComplete",
      battery: "load.summary.batteryComplete",
      generic: "load.summary.complete",
    });
  }
  if (isLoadRunning(load)) {
    return stateByKind(kind, {
      hot_water: "load.summary.hwsHeating",
      ev: "load.summary.evCharging",
      battery: "load.summary.batteryCharging",
      generic: "load.summary.running",
    });
  }
  return stateByKind(kind, {
    hot_water: "load.summary.hwsWaiting",
    ev: "load.summary.evWaiting",
    battery: "load.summary.batteryWaiting",
    generic: "load.summary.waiting",
  });
}

function stateByKind(kind: LoadKind, values: Record<LoadKind, MessageKey>): MessageKey {
  return values[kind];
}

function progressLabelKey(kind: LoadKind): MessageKey {
  switch (kind) {
    case "ev":
      return "load.progress.soc";
    case "hot_water":
      return "load.progress.readiness";
    case "battery":
      return "load.progress.energy";
    case "generic":
      return "load.progress";
  }
}

function primaryActionKey(load: LoadSummary): MessageKey {
  if (load.fault || load.target_status === "impossible" || load.target_status === "at_risk") {
    return "load.action.reviewTarget";
  }
  if (load.manual_override) {
    return "load.action.manageOverride";
  }
  if (load.target_status === "complete" || load.controller_state === "target_complete") {
    return "load.action.viewDetails";
  }
  return "load.open";
}

function nextActionFallbackKey(load: LoadSummary): MessageKey {
  if (load.target_status === "complete" || load.controller_state === "target_complete") {
    return "load.nextAction.complete";
  }
  if (!load.automatic_control) {
    return "load.nextAction.notControlled";
  }
  return "value.unavailable";
}

function overrideLabel(value: LoadSummary["manual_override"]): MessageKey | undefined {
  switch (value) {
    case "timed_on":
      return "load.override.timedOn";
    case "timed_off":
      return "load.override.timedOff";
    case "indefinite_on":
      return "load.override.indefiniteOn";
    case "indefinite_off":
      return "load.override.indefiniteOff";
    default:
      return undefined;
  }
}

function targetStatusLabel(value: LoadSummary["target_status"]): MessageKey | undefined {
  switch (value) {
    case "on_track":
      return "load.target.onTrack";
    case "at_risk":
      return "load.target.atRisk";
    case "impossible":
      return "load.target.impossible";
    case "complete":
      return "load.target.complete";
    case "unknown":
      return "load.target.unknown";
    default:
      return undefined;
  }
}

function targetTone(value: LoadSummary["target_status"]): OverviewStatusTone {
  switch (value) {
    case "complete":
    case "on_track":
      return "success";
    case "at_risk":
      return "warning";
    case "impossible":
      return "danger";
    default:
      return "neutral";
  }
}
