import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";

import { translate } from "../i18n";
import type { JsonObject } from "../models/dashboard";
import type { HomeAssistant } from "../types/home-assistant";

export class IlcDiagnosticsPage extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public diagnostics?: JsonObject;

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    return html`
      <section class="panel-card" aria-labelledby="diagnostics-title">
        <div class="section-header">
          <div>
            <h2 id="diagnostics-title">${translate(this.hass, "diagnostics.title")}</h2>
            <p class="secondary">${translate(this.hass, "diagnostics.description")}</p>
          </div>
        </div>
        ${this.diagnostics
          ? html`
              <details open>
                <summary>${translate(this.hass, "diagnostics.raw")}</summary>
                <pre>${JSON.stringify(this.diagnostics, null, 2)}</pre>
              </details>
            `
          : html`<p class="secondary">${translate(this.hass, "diagnostics.unavailable")}</p>`}
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-diagnostics-page": IlcDiagnosticsPage;
  }
}

if (!customElements.get("ilc-diagnostics-page")) {
  customElements.define("ilc-diagnostics-page", IlcDiagnosticsPage);
}
