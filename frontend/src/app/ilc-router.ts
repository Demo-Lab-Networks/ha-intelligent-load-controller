export type IlcWorkspaceView =
  | "dashboard"
  | "loads"
  | "plan"
  | "history"
  | "configure"
  | "diagnostics"
  | "load";

export interface IlcRouteState {
  view: IlcWorkspaceView;
  loadId?: string;
}

const PANEL_URL_SEGMENT = "intelligent-load-controller";

function decodeRouteSegment(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseIlcRoute(path = ""): IlcRouteState {
  const cleanPath = path.split(/[?#]/u)[0] ?? "";
  const segments = cleanPath.split("/").filter(Boolean);
  const panelIndex = segments.lastIndexOf(PANEL_URL_SEGMENT);
  const routeSegments = panelIndex >= 0 ? segments.slice(panelIndex + 1) : segments;
  const [first, second] = routeSegments;

  if ((first === "loads" || first === "load") && second) {
    return { view: "load", loadId: decodeRouteSegment(second) };
  }
  if (first === "loads") {
    return { view: "loads" };
  }
  if (first === "plan") {
    return { view: "plan" };
  }
  if (first === "insights" || first === "history") {
    return { view: "history" };
  }
  if (first === "settings" || first === "configure") {
    return { view: "configure" };
  }
  if (first === "diagnostics") {
    return { view: "diagnostics" };
  }
  return { view: "dashboard" };
}

export function routePathForState(basePath: string, state: IlcRouteState): string {
  const base = normaliseBasePath(basePath);
  switch (state.view) {
    case "dashboard":
      return base;
    case "loads":
      return `${base}/loads`;
    case "load":
      return `${base}/loads/${encodeURIComponent(state.loadId ?? "")}`;
    case "plan":
      return `${base}/plan`;
    case "history":
      return `${base}/insights`;
    case "configure":
      return `${base}/settings`;
    case "diagnostics":
      return `${base}/diagnostics`;
  }
}

export function normaliseBasePath(path: string | undefined): string {
  if (!path) {
    return `/${PANEL_URL_SEGMENT}`;
  }
  const cleanPath = path.split(/[?#]/u)[0] ?? "";
  const segments = cleanPath.split("/").filter(Boolean);
  const panelIndex = segments.lastIndexOf(PANEL_URL_SEGMENT);
  const baseSegments = panelIndex >= 0 ? segments.slice(0, panelIndex + 1) : segments;
  if (baseSegments.length === 0) {
    return `/${PANEL_URL_SEGMENT}`;
  }
  return `/${baseSegments.join("/")}`;
}

export function topLevelViewFor(view: IlcWorkspaceView): Exclude<IlcWorkspaceView, "load"> {
  return view === "load" ? "loads" : view;
}
