import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";

import "../components/feedback/ilc-empty-state";
import "../components/loads/ilc-load-summary-card";
import { translate } from "../i18n";
import type { LoadSummary } from "../models/dashboard";
import type { HomeAssistant } from "../types/home-assistant";

export class IlcLoadsPage extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public loads: readonly LoadSummary[] = [];

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    return html`
      <section aria-labelledby="loads-catalogue-title">
        <div class="section-header">
          <div>
            <h2 id="loads-catalogue-title">${translate(this.hass, "load.catalogue")}</h2>
            <p class="secondary">${translate(this.hass, "load.catalogueHint")}</p>
          </div>
          <span class="secondary">${this.loads.length}</span>
        </div>
        ${this.loads.length === 0
          ? html`
              <ilc-empty-state
                .heading=${translate(this.hass, "status.empty")}
                .message=${translate(this.hass, "status.emptyHint")}
              ></ilc-empty-state>
            `
          : html`<div class="load-grid">
              ${this.loads.map(
                (load) => html`<ilc-load-summary-card .hass=${this.hass} .load=${load}></ilc-load-summary-card>`,
              )}
            </div>`}
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-loads-page": IlcLoadsPage;
  }
}

if (!customElements.get("ilc-loads-page")) {
  customElements.define("ilc-loads-page", IlcLoadsPage);
}
