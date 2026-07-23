import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";

import type { PlanIntervalResponse } from "../../api/load-control-api";
import { translate } from "../../i18n";
import { localizeReasonCode } from "../../i18n/reasons";
import type { HomeAssistant } from "../../types/home-assistant";
import { formatDateTime, formatMeasurement } from "../../utils/format";

export class IlcPlanIntervalTable extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public intervals: readonly PlanIntervalResponse[] = [];

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    if (this.intervals.length === 0) {
      return html`<p class="secondary">${translate(this.hass, "plan.noIntervals")}</p>`;
    }

    return html`
      <div class="table-wrap">
        <table aria-label=${translate(this.hass, "plan.intervals")}>
          <thead>
            <tr>
              <th>${translate(this.hass, "plan.load")}</th>
              <th>${translate(this.hass, "plan.start")}</th>
              <th>${translate(this.hass, "plan.end")}</th>
              <th>${translate(this.hass, "plan.power")}</th>
              <th>${translate(this.hass, "plan.reason")}</th>
            </tr>
          </thead>
          <tbody>
            ${this.intervals.map(
              (interval) => html`
                <tr>
                  <td>${interval.load_id ?? "—"}</td>
                  <td>${formatDateTime(this.hass, interval.start_at)}</td>
                  <td>${formatDateTime(this.hass, interval.end_at)}</td>
                  <td>${this.formatWatts(interval.power_w)}</td>
                  <td>
                    ${interval.reason_code
                      ? localizeReasonCode(this.hass, interval.reason_code)
                      : "—"}
                  </td>
                </tr>
              `,
            )}
          </tbody>
        </table>
      </div>
    `;
  }

  private formatWatts(value: number | undefined): string {
    return value === undefined ? "—" : formatMeasurement(this.hass, { value, unit: "W" });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-plan-interval-table": IlcPlanIntervalTable;
  }
}

if (!customElements.get("ilc-plan-interval-table")) {
  customElements.define("ilc-plan-interval-table", IlcPlanIntervalTable);
}
