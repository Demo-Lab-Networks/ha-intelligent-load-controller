import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";

import type { AttentionItem } from "../../features/overview/overview-presentation";
import { translate } from "../../i18n";
import type { MessageKey } from "../../i18n/messages";
import type { HomeAssistant } from "../../types/home-assistant";

export class IlcAttentionList extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public items: readonly AttentionItem[] = [];

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    if (this.items.length === 0) {
      return nothing;
    }

    return html`
      <section class="panel-card attention-list" aria-labelledby="attention-title">
        <div class="section-header">
          <div>
            <h2 id="attention-title">${translate(this.hass, "overview.attention")}</h2>
            <p class="secondary">${translate(this.hass, "overview.attentionHint")}</p>
          </div>
        </div>
        <div class="attention-items">
          ${this.items.map(
            (item) => html`
              <article class="attention-item" data-severity=${item.severity}>
                <div>
                  <span class="attention-severity">${translate(this.hass, `severity.${item.severity}` as MessageKey)}</span>
                  <h3>${translate(this.hass, item.titleKey, item.values)}</h3>
                  <p>${translate(this.hass, item.summaryKey, item.values)}</p>
                </div>
                ${this.renderAction(item)}
              </article>
            `,
          )}
        </div>
      </section>
    `;
  }

  private renderAction(item: AttentionItem) {
    if (item.action === "load_detail" && item.affectedLoadId) {
      return html`
        <button
          class="text-button"
          type="button"
          @click=${() => this.openLoad(item.affectedLoadId)}
        >
          ${translate(this.hass, "load.open")}
        </button>
      `;
    }
    if (item.action === "settings") {
      return html`
        <button
          class="text-button"
          type="button"
          @click=${() => this.openView("configure")}
        >
          ${translate(this.hass, "settings.open")}
        </button>
      `;
    }
    if (item.action === "diagnostics") {
      return html`
        <button
          class="text-button"
          type="button"
          @click=${() => this.openView("diagnostics")}
        >
          ${translate(this.hass, "diagnostics.open")}
        </button>
      `;
    }
    if (item.affectedLoadId) {
      return html`
        <button
          class="text-button"
          type="button"
          @click=${() => this.openLoad(item.affectedLoadId)}
        >
          ${translate(this.hass, "load.open")}
        </button>
      `;
    }
    return nothing;
  }

  private openView(view: "configure" | "diagnostics"): void {
    this.dispatchEvent(
      new CustomEvent<{ view: "configure" | "diagnostics" }>("ilc-navigate", {
        bubbles: true,
        composed: true,
        detail: { view },
      }),
    );
  }

  private openLoad(loadId: string | undefined): void {
    if (!loadId) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<{ loadId: string }>("ilc-open-load", {
        bubbles: true,
        composed: true,
        detail: { loadId },
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-attention-list": IlcAttentionList;
  }
}

if (!customElements.get("ilc-attention-list")) {
  customElements.define("ilc-attention-list", IlcAttentionList);
}
