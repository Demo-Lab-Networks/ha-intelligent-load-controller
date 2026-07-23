import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";

import "../../components/status/ilc-status-pill";
import type { OverviewHeroPresentation } from "../../features/overview/overview-presentation";
import { translate } from "../../i18n";
import type { MessageKey } from "../../i18n/messages";
import { localizeReasonCode } from "../../i18n/reasons";
import type { SiteSummary } from "../../models/dashboard";
import type { HomeAssistant } from "../../types/home-assistant";
import { formatDateTime, formatMeasurement } from "../../utils/format";

export class IlcHomeStatusHero extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public site?: SiteSummary;
  @property({ attribute: false }) public presentation?: OverviewHeroPresentation;

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    const site = this.site;
    const presentation = this.presentation;
    if (!site || !presentation) {
      return nothing;
    }

    return html`
      <section class="home-status-hero" aria-labelledby="overview-status-title" data-level=${presentation.level}>
        <div class="hero-copy">
          <div class="eyebrow-row">
            <span class="eyebrow">${translate(this.hass, "overview.homeStatus")}</span>
            <ilc-status-pill
              .tone=${presentation.tone}
              .label=${translate(this.hass, `overview.flow.${presentation.flow}` as MessageKey)}
            ></ilc-status-pill>
          </div>
          <h2 id="overview-status-title">${translate(this.hass, presentation.titleKey)}</h2>
          <p class="hero-summary">
            ${translate(this.hass, presentation.summaryKey, presentation.summaryValues)}
          </p>
          <dl class="hero-explainers">
            <div>
              <dt>${translate(this.hass, "overview.currentFlow")}</dt>
              <dd>${this.renderFlowPhrase(site, presentation)}</dd>
            </div>
            <div>
              <dt>${translate(this.hass, "overview.targets")}</dt>
              <dd>${this.renderTargetSummary(presentation)}</dd>
            </div>
            <div>
              <dt>${translate(this.hass, "overview.next")}</dt>
              <dd>
                ${presentation.nextAction ??
                (site.next_deadline
                  ? translate(this.hass, "overview.nextDeadline", {
                      time: formatDateTime(this.hass, site.next_deadline),
                    })
                  : translate(this.hass, "overview.noNextAction"))}
              </dd>
            </div>
            <div>
              <dt>${translate(this.hass, "overview.why")}</dt>
              <dd>
                ${presentation.primaryReasonCode
                  ? localizeReasonCode(this.hass, presentation.primaryReasonCode)
                  : translate(this.hass, "overview.monitoringReason")}
              </dd>
            </div>
          </dl>
        </div>
        <div class="hero-values" aria-label=${translate(this.hass, "overview.heroMeasurements")}>
          ${this.renderHeroValue(translate(this.hass, "site.import"), formatMeasurement(this.hass, site.grid_import))}
          ${this.renderHeroValue(translate(this.hass, "site.export"), formatMeasurement(this.hass, site.grid_export))}
          ${this.renderHeroValue(translate(this.hass, "site.controlled"), formatMeasurement(this.hass, site.controlled_power))}
        </div>
      </section>
    `;
  }

  private renderFlowPhrase(site: SiteSummary, presentation: OverviewHeroPresentation) {
    switch (presentation.flow) {
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

  private renderTargetSummary(presentation: OverviewHeroPresentation): string {
    const summary = presentation.targetSummary;
    if (summary.total === 0) {
      return translate(this.hass, "overview.targets.none");
    }
    if (summary.impossible > 0 || summary.atRisk > 0) {
      return translate(this.hass, "overview.targets.risk", {
        risk: summary.impossible + summary.atRisk,
        total: summary.total,
      });
    }
    if (summary.complete === summary.total) {
      return translate(this.hass, "overview.targets.complete", { total: summary.total });
    }
    return translate(this.hass, "overview.targets.onTrack", {
      count: summary.complete + summary.onTrack,
      total: summary.total,
    });
  }

  private renderHeroValue(label: string, value: string) {
    return html`
      <div>
        <span>${label}</span>
        <strong>${value}</strong>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-home-status-hero": IlcHomeStatusHero;
  }
}

if (!customElements.get("ilc-home-status-hero")) {
  customElements.define("ilc-home-status-hero", IlcHomeStatusHero);
}
