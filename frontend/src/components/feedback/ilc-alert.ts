import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";

export type IlcAlertTone = "info" | "success" | "warning" | "error" | "reconnecting";

export class IlcAlert extends LitElement {
  @property() public tone: IlcAlertTone = "info";
  @property() public heading = "";
  @property() public message = "";
  @property() public live: "off" | "polite" | "assertive" = "polite";

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    return html`
      <section class="status-banner" data-state=${this.tone} aria-live=${this.live}>
        <div>
          ${this.heading ? html`<h2>${this.heading}</h2>` : null}
          ${this.message ? html`<p class="secondary">${this.message}</p>` : null}
          <slot></slot>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-alert": IlcAlert;
  }
}

if (!customElements.get("ilc-alert")) {
  customElements.define("ilc-alert", IlcAlert);
}
