import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";

import { translate } from "../i18n";
import type { HomeAssistant } from "../types/home-assistant";
import type { IlcWorkspaceView } from "./ilc-router";
import { topLevelViewFor } from "./ilc-router";

type NavigationView = Exclude<IlcWorkspaceView, "load">;

interface NavigationItem {
  view: NavigationView;
  labelKey: Parameters<typeof translate>[1];
  icon: string;
  primary: boolean;
}

const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { view: "dashboard", labelKey: "nav.overview", icon: "⌂", primary: true },
  { view: "loads", labelKey: "nav.loads", icon: "◫", primary: true },
  { view: "plan", labelKey: "nav.plan", icon: "▤", primary: true },
  { view: "history", labelKey: "nav.insights", icon: "◌", primary: true },
  { view: "configure", labelKey: "nav.settings", icon: "⚙", primary: true },
  { view: "diagnostics", labelKey: "nav.diagnostics", icon: "◇", primary: false },
];

export class IlcNavigation extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property() public activeView: IlcWorkspaceView = "dashboard";
  @property({ type: Boolean }) public disabled = false;
  @property({ type: Boolean }) public showDiagnostics = true;

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    const activeView = topLevelViewFor(this.activeView);
    return html`
      <nav class="workspace-nav" aria-label=${translate(this.hass, "nav.label")}>
        ${NAVIGATION_ITEMS.filter((item) => item.primary || this.showDiagnostics).map(
          (item) => html`
            <button
              class="nav-button"
              type="button"
              aria-current=${activeView === item.view ? "page" : nothing}
              ?disabled=${this.disabled}
              @click=${() => this.navigate(item.view)}
            >
              <span class="nav-icon" aria-hidden="true">${item.icon}</span>
              <span>${translate(this.hass, item.labelKey)}</span>
            </button>
          `,
        )}
      </nav>
    `;
  }

  private navigate(view: NavigationView): void {
    this.dispatchEvent(
      new CustomEvent<{ view: NavigationView }>("ilc-navigate", {
        bubbles: true,
        composed: true,
        detail: { view },
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-navigation": IlcNavigation;
  }
}

if (!customElements.get("ilc-navigation")) {
  customElements.define("ilc-navigation", IlcNavigation);
}
