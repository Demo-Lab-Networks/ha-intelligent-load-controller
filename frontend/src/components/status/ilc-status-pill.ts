import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";

export type IlcStatusTone = "neutral" | "info" | "success" | "warning" | "danger";

export class IlcStatusPill extends LitElement {
  @property() public tone: IlcStatusTone = "neutral";
  @property() public label = "";

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    return html`<span class="state-pill" data-tone=${this.tone}>${this.label}</span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-status-pill": IlcStatusPill;
  }
}

if (!customElements.get("ilc-status-pill")) {
  customElements.define("ilc-status-pill", IlcStatusPill);
}
