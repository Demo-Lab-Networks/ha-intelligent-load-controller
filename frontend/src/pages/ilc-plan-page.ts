import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";

import "../components/plans/ilc-plan-interval-table";
import "../components/plans/ilc-plan-proposals-table";
import type { CurrentPlanResponse, DailyTimelineResponse } from "../api/load-control-api";
import { translate } from "../i18n";
import type { HomeAssistant } from "../types/home-assistant";
import { formatDateTime } from "../utils/format";

export class IlcPlanPage extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public plan?: CurrentPlanResponse | null;
  @property({ attribute: false }) public timeline?: DailyTimelineResponse;

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    const intervals = this.plan?.intervals ?? [];
    const timelineIntervals = this.timeline?.intervals ?? [];

    return html`
      <section class="panel-card" aria-labelledby="current-plan-title">
        <div class="section-header">
          <div>
            <h2 id="current-plan-title">${translate(this.hass, "plan.current")}</h2>
            ${this.plan?.generated_at
              ? html`<p class="secondary">
                  ${translate(this.hass, "plan.generated", {
                    time: formatDateTime(this.hass, this.plan.generated_at),
                  })}
                </p>`
              : nothing}
          </div>
          <button class="secondary-button" type="button" @click=${this.replan}>
            ${translate(this.hass, "plan.replan")}
          </button>
        </div>
        ${this.plan
          ? html`
              <div class="plan-summary">
                <p>
                  <strong>${translate(this.hass, "plan.nextAction")}:</strong>
                  ${formatDateTime(this.hass, this.plan.next_action ?? undefined)}
                </p>
                ${this.plan.warnings?.length
                  ? html`<p class="secondary">${this.plan.warnings.join(", ")}</p>`
                  : nothing}
              </div>
              <ilc-plan-interval-table .hass=${this.hass} .intervals=${intervals}></ilc-plan-interval-table>
              <ilc-plan-proposals-table .hass=${this.hass} .plan=${this.plan}></ilc-plan-proposals-table>
            `
          : html`<p class="secondary">${translate(this.hass, "status.noPlan")}</p>`}
      </section>
      <section class="panel-card" aria-labelledby="timeline-title">
        <div class="section-header">
          <div>
            <h2 id="timeline-title">${translate(this.hass, "plan.timeline")}</h2>
            ${this.timeline?.generated_at
              ? html`<p class="secondary">
                  ${translate(this.hass, "plan.generated", {
                    time: formatDateTime(this.hass, this.timeline.generated_at),
                  })}
                </p>`
              : nothing}
          </div>
        </div>
        <ilc-plan-interval-table .hass=${this.hass} .intervals=${timelineIntervals}></ilc-plan-interval-table>
      </section>
    `;
  }

  private readonly replan = (): void => {
    this.dispatchEvent(new CustomEvent("ilc-replan", { bubbles: true, composed: true }));
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-plan-page": IlcPlanPage;
  }
}

if (!customElements.get("ilc-plan-page")) {
  customElements.define("ilc-plan-page", IlcPlanPage);
}
