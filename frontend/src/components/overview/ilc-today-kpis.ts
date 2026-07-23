import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";

import {
  summariseTargets,
  type TargetSummary,
} from "../../features/overview/overview-presentation";
import { translate } from "../../i18n";
import type { LoadSummary, SiteSummary } from "../../models/dashboard";
import type { HomeAssistant } from "../../types/home-assistant";
import { formatCurrencyRate, formatDateTime, formatMeasurement } from "../../utils/format";

export class IlcTodayKpis extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public site?: SiteSummary;
  @property({ attribute: false }) public loads: readonly LoadSummary[] = [];

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    const site = this.site;
    if (!site) {
      return nothing;
    }
    const targets = summariseTargets(this.loads);

    return html`
      <section aria-labelledby="today-kpis-title">
        <div class="section-header">
          <div>
            <h2 id="today-kpis-title">${translate(this.hass, "overview.today")}</h2>
            <p class="secondary">${translate(this.hass, "overview.todayHint")}</p>
          </div>
        </div>
        <div class="kpi-grid">
          ${this.renderKpi("overview.kpi.energy", formatMeasurement(this.hass, site.controlled_energy_today))}
          ${this.renderKpi("overview.kpi.cost", formatCurrencyRate(this.hass, site.controlled_cost_today))}
          ${this.renderKpi("overview.kpi.targets", this.targetText(targets))}
          ${this.renderKpi("overview.kpi.active", String(site.active_load_count))}
          ${this.renderKpi("overview.kpi.nextDeadline", formatDateTime(this.hass, site.next_deadline))}
          ${this.renderKpi("overview.kpi.controlledPower", formatMeasurement(this.hass, site.controlled_power))}
        </div>
      </section>
    `;
  }

  private renderKpi(labelKey: Parameters<typeof translate>[1], value: string) {
    return html`
      <div class="kpi-card">
        <span>${translate(this.hass, labelKey)}</span>
        <strong>${value}</strong>
      </div>
    `;
  }

  private targetText(summary: TargetSummary): string {
    if (summary.total === 0) {
      return "—";
    }
    if (summary.impossible > 0 || summary.atRisk > 0) {
      return translate(this.hass, "overview.targets.riskShort", {
        risk: summary.impossible + summary.atRisk,
        total: summary.total,
      });
    }
    return translate(this.hass, "overview.targets.onTrackShort", {
      count: summary.complete + summary.onTrack,
      total: summary.total,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-today-kpis": IlcTodayKpis;
  }
}

if (!customElements.get("ilc-today-kpis")) {
  customElements.define("ilc-today-kpis", IlcTodayKpis);
}
