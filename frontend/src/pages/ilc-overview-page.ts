import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";

import "../components/energy/ilc-energy-flow-card";
import "../components/feedback/ilc-empty-state";
import "../components/loads/ilc-load-summary-card";
import "../components/overview/ilc-attention-list";
import "../components/overview/ilc-home-status-hero";
import "../components/overview/ilc-today-kpis";
import { createOverviewPresentation } from "../features/overview/overview-presentation";
import { translate } from "../i18n";
import type { DashboardData, SiteSummary } from "../models/dashboard";
import type { HomeAssistant } from "../types/home-assistant";
import { formatDateTime, formatMeasurement } from "../utils/format";

export type IlcChartComponentState = "loading" | "ready" | "failed";

export class IlcOverviewPage extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public dashboard?: DashboardData;
  @property() public chartComponentState: IlcChartComponentState = "loading";

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    const dashboard = this.dashboard;
    if (!dashboard) {
      return nothing;
    }
    const presentation = createOverviewPresentation(dashboard);

    return html`
      <ilc-home-status-hero
        .hass=${this.hass}
        .site=${dashboard.site}
        .presentation=${presentation.hero}
      ></ilc-home-status-hero>
      <ilc-energy-flow-card .hass=${this.hass} .site=${dashboard.site}></ilc-energy-flow-card>
      <ilc-attention-list
        .hass=${this.hass}
        .items=${presentation.attention}
        @ilc-open-load=${this.redispatchLoadEvent}
      ></ilc-attention-list>
      <ilc-today-kpis .hass=${this.hass} .site=${dashboard.site} .loads=${dashboard.loads}></ilc-today-kpis>
      <section class="panel-card" aria-labelledby="snapshot-title">
        <div class="section-header">
          <div>
            <h2 id="snapshot-title">${translate(this.hass, "site.snapshot")}</h2>
            <p class="secondary">${translate(this.hass, "site.snapshotDescription")}</p>
          </div>
        </div>
        ${this.renderSnapshotChart(dashboard.site)}
      </section>
      <section aria-labelledby="loads-title">
        <div class="section-header">
          <div>
            <h2 id="loads-title">${translate(this.hass, "overview.activeUpcoming")}</h2>
            <p class="secondary">${translate(this.hass, "overview.activeUpcomingHint")}</p>
          </div>
          <span class="secondary">${dashboard.loads.length}</span>
        </div>
        ${dashboard.loads.length === 0
          ? html`
              <ilc-empty-state
                .heading=${translate(this.hass, "status.empty")}
                .message=${translate(this.hass, "status.emptyHint")}
              ></ilc-empty-state>
            `
          : html`
              <div class="overview-load-groups">
                ${presentation.loadGroups.map(
                  (group) => html`
                    <section class="overview-load-group" aria-labelledby=${`load-group-${group.key}`}>
                      <h3 id=${`load-group-${group.key}`}>${translate(this.hass, group.titleKey)}</h3>
                      <div class="load-grid">
                        ${group.loads.map(
                          (load) => html`
                            <ilc-load-summary-card
                              .hass=${this.hass}
                              .load=${load}
                              @ilc-open-load=${this.redispatchLoadEvent}
                              @ilc-edit-load=${this.redispatchEditEvent}
                            ></ilc-load-summary-card>
                          `,
                        )}
                      </div>
                    </section>
                  `,
                )}
              </div>
            `}
      </section>
      <p class="updated" aria-live="polite">
        ${translate(this.hass, "status.updated", {
          time: formatDateTime(this.hass, dashboard.site.updated_at),
        })}
      </p>
    `;
  }

  private renderSnapshotChart(site: SiteSummary) {
    if (this.chartComponentState === "ready") {
      return html`<ilc-site-snapshot-chart .hass=${this.hass} .site=${site}></ilc-site-snapshot-chart>`;
    }

    const message =
      this.chartComponentState === "failed"
        ? translate(this.hass, "site.snapshotChartUnavailable")
        : translate(this.hass, "site.snapshotChartLoading");
    return html`
      <div class="chart-fallback" role="status" aria-live="polite">
        <p class="secondary">${message}</p>
        <div class="metric-grid" aria-label=${translate(this.hass, "site.metrics")}>
          ${this.renderSnapshotMetric(translate(this.hass, "site.import"), formatMeasurement(this.hass, site.grid_import))}
          ${this.renderSnapshotMetric(translate(this.hass, "site.export"), formatMeasurement(this.hass, site.grid_export))}
          ${this.renderSnapshotMetric(
            translate(this.hass, "site.solar"),
            formatMeasurement(this.hass, site.solar_production),
          )}
          ${this.renderSnapshotMetric(
            translate(this.hass, "site.controlled"),
            formatMeasurement(this.hass, site.controlled_power),
          )}
        </div>
      </div>
    `;
  }

  private renderSnapshotMetric(label: string, value: string) {
    return html`
      <div class="panel-card metric">
        <dl>
          <dt>${label}</dt>
          <dd>${value}</dd>
        </dl>
      </div>
    `;
  }

  private readonly redispatchLoadEvent = (event: CustomEvent<{ loadId: string }>): void => {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("ilc-open-load", {
        bubbles: true,
        composed: true,
        detail: event.detail,
      }),
    );
  };

  private readonly redispatchEditEvent = (event: CustomEvent<{ loadId: string }>): void => {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent("ilc-edit-load", {
        bubbles: true,
        composed: true,
        detail: event.detail,
      }),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-overview-page": IlcOverviewPage;
  }
}

if (!customElements.get("ilc-overview-page")) {
  customElements.define("ilc-overview-page", IlcOverviewPage);
}
