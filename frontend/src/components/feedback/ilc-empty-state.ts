import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";

export class IlcEmptyState extends LitElement {
  @property() public heading = "";
  @property() public message = "";

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    return html`
      <section class="panel-card empty-state" aria-live="polite">
        ${this.heading ? html`<h2>${this.heading}</h2>` : null}
        ${this.message ? html`<p class="secondary">${this.message}</p>` : null}
        <slot></slot>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-empty-state": IlcEmptyState;
  }
}

if (!customElements.get("ilc-empty-state")) {
  customElements.define("ilc-empty-state", IlcEmptyState);
}
