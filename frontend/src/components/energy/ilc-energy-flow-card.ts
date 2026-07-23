import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";

import {
  classifySiteFlow,
  type SiteFlowDirection,
} from "../../features/overview/overview-presentation";
import { translate } from "../../i18n";
import type { MessageKey } from "../../i18n/messages";
import type { Measurement, SiteSummary } from "../../models/dashboard";
import type { HomeAssistant } from "../../types/home-assistant";
import { formatMeasurement } from "../../utils/format";

export class IlcEnergyFlowCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public site?: SiteSummary;

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    const site = this.site;
    if (!site) {
      return nothing;
    }
    const flow = classifySiteFlow(site);

    return html`
      <section class="panel-card energy-flow-card" aria-labelledby="energy-flow-title">
        <div class="section-header">
          <div>
            <h2 id="energy-flow-title">${translate(this.hass, "overview.energyFlow")}</h2>
            <p class="secondary">${this.flowSummary(site, flow)}</p>
          </div>
        </div>
        <div class="energy-flow" role="img" aria-label=${this.accessibleSummary(site, flow)}>
          ${this.renderNode("solar", translate(this.hass, "site.solar"), site.solar_production)}
          <span class="flow-link" aria-hidden="true">→</span>
          ${this.renderNode("controlled", translate(this.hass, "site.controlled"), site.controlled_power)}
          <span class="flow-link" aria-hidden="true">${flow === "exporting" ? "→" : "↔"}</span>
          ${this.renderGridNode(site, flow)}
        </div>
      </section>
    `;
  }

  private renderNode(kind: string, label: string, measurement: Measurement | undefined) {
    return html`
      <div class="energy-node" data-kind=${kind} data-quality=${measurement?.quality ?? "unknown"}>
        <span>${label}</span>
        <strong>${formatMeasurement(this.hass, measurement)}</strong>
        <small>${translate(this.hass, `quality.${measurement?.quality ?? "unknown"}` as MessageKey)}</small>
      </div>
    `;
  }

  private renderGridNode(site: SiteSummary, flow: SiteFlowDirection) {
    const measurement = flow === "exporting" ? site.grid_export : site.grid_import;
    const label =
      flow === "exporting"
        ? translate(this.hass, "site.export")
        : flow === "importing"
          ? translate(this.hass, "site.import")
          : translate(this.hass, "overview.grid");
    return this.renderNode("grid", label, measurement);
  }

  private flowSummary(site: SiteSummary, flow: SiteFlowDirection): string {
    switch (flow) {
      case "exporting":
        return translate(this.hass, "overview.flowSummary.exporting", {
          value: formatMeasurement(this.hass, site.grid_export),
        });
      case "importing":
        return translate(this.hass, "overview.flowSummary.importing", {
          value: formatMeasurement(this.hass, site.grid_import),
        });
      case "balanced":
        return translate(this.hass, "overview.flowSummary.balanced");
      case "unknown":
        return translate(this.hass, "overview.flowSummary.unknown");
    }
  }

  private accessibleSummary(site: SiteSummary, flow: SiteFlowDirection): string {
    return translate(this.hass, "overview.energyFlowAccessible", {
      flow: translate(this.hass, `overview.flow.${flow}` as MessageKey),
      solar: formatMeasurement(this.hass, site.solar_production),
      controlled: formatMeasurement(this.hass, site.controlled_power),
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-energy-flow-card": IlcEnergyFlowCard;
  }
}

if (!customElements.get("ilc-energy-flow-card")) {
  customElements.define("ilc-energy-flow-card", IlcEnergyFlowCard);
}
