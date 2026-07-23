import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";

import "../components/feedback/ilc-empty-state";
import "../components/loads/ilc-load-summary-card";
import { translate } from "../i18n";
import type { DashboardData, SiteSummary } from "../models/dashboard";
import type { HomeAssistant } from "../types/home-assistant";
import { formatCurrencyRate, formatDateTime, formatMeasurement } from "../utils/format";

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

    return html`
      ${this.renderMetrics(dashboard.site)}
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
          <h2 id="loads-title">${translate(this.hass, "load.list")}</h2>
          <span class="secondary">${dashboard.loads.length}</span>
        </div>
        ${dashboard.loads.length === 0
          ? html`
              <ilc-empty-state
                .heading=${translate(this.hass, "status.empty")}
                .message=${translate(this.hass, "status.emptyHint")}
              ></ilc-empty-state>
            `
          : html`<div class="load-grid">
              ${dashboard.loads.map(
                (load) => html`<ilc-load-summary-card .hass=${this.hass} .load=${load}></ilc-load-summary-card>`,
              )}
            </div>`}
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

  private renderMetrics(site: SiteSummary) {
    const metrics: ReadonlyArray<readonly [string, string]> = [
      [translate(this.hass, "site.import"), formatMeasurement(this.hass, site.grid_import)],
      [translate(this.hass, "site.export"), formatMeasurement(this.hass, site.grid_export)],
      [translate(this.hass, "site.solar"), formatMeasurement(this.hass, site.solar_production)],
      [translate(this.hass, "site.controlled"), formatMeasurement(this.hass, site.controlled_power)],
      [translate(this.hass, "site.activeLoads"), String(site.active_load_count)],
      [translate(this.hass, "site.waitingLoads"), String(site.waiting_load_count)],
      [translate(this.hass, "site.price"), formatCurrencyRate(this.hass, site.current_import_price)],
      [translate(this.hass, "site.costToday"), formatCurrencyRate(this.hass, site.controlled_cost_today)],
      [translate(this.hass, "site.energyToday"), formatMeasurement(this.hass, site.controlled_energy_today)],
      [translate(this.hass, "site.nextDeadline"), formatDateTime(this.hass, site.next_deadline)],
      [translate(this.hass, "site.health"), this.localizeHealth(site.health)],
    ];

    return html`
      <section aria-labelledby="metrics-title">
        <div class="section-header">
          <h2 id="metrics-title">${translate(this.hass, "site.metrics")}</h2>
        </div>
        <div class="metric-grid">
          ${metrics.map(
            ([label, value]) => html`
              <div class="panel-card metric">
                <dl>
                  <dt>${label}</dt>
                  <dd>${value}</dd>
                </dl>
              </div>
            `,
          )}
        </div>
      </section>
    `;
  }

  private localizeHealth(health: SiteSummary["health"]): string {
    return translate(this.hass, `health.${health}` as Parameters<typeof translate>[1]);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-overview-page": IlcOverviewPage;
  }
}

if (!customElements.get("ilc-overview-page")) {
  customElements.define("ilc-overview-page", IlcOverviewPage);
}
