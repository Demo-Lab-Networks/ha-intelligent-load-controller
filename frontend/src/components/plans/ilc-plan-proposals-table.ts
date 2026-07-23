import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";

import type { CurrentPlanResponse } from "../../api/load-control-api";
import { translate } from "../../i18n";
import { localizeReasonCode } from "../../i18n/reasons";
import type { HomeAssistant } from "../../types/home-assistant";

export class IlcPlanProposalsTable extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public plan?: CurrentPlanResponse | null;

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    const proposals = this.plan?.proposals ?? [];
    if (proposals.length === 0) {
      return nothing;
    }

    return html`
      <h3>${translate(this.hass, "plan.proposals")}</h3>
      <div class="table-wrap">
        <table aria-label=${translate(this.hass, "plan.proposals")}>
          <thead>
            <tr>
              <th>${translate(this.hass, "plan.load")}</th>
              <th>${translate(this.hass, "plan.authorised")}</th>
              <th>${translate(this.hass, "plan.reason")}</th>
            </tr>
          </thead>
          <tbody>
            ${proposals.map(
              (proposal) => html`
                <tr>
                  <td>${proposal.load_id ?? "—"}</td>
                  <td>
                    ${proposal.authorized
                      ? translate(this.hass, "value.yes")
                      : translate(this.hass, "value.no")}
                  </td>
                  <td>
                    ${proposal.reason_code
                      ? localizeReasonCode(this.hass, proposal.reason_code)
                      : proposal.message ?? "—"}
                  </td>
                </tr>
              `,
            )}
          </tbody>
        </table>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-plan-proposals-table": IlcPlanProposalsTable;
  }
}

if (!customElements.get("ilc-plan-proposals-table")) {
  customElements.define("ilc-plan-proposals-table", IlcPlanProposalsTable);
}
