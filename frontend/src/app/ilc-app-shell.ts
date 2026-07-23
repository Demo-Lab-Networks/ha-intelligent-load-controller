import { css, html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";

import { translate } from "../i18n";
import type { HomeAssistant } from "../types/home-assistant";

export class IlcAppShell extends LitElement {
  public static override styles = css`
    :host {
      box-sizing: border-box;
      color: var(--ilc-text-primary, var(--primary-text-color));
      display: block;
      min-block-size: 100vh;
    }

    *,
    *::before,
    *::after {
      box-sizing: inherit;
    }

    main {
      margin: 0 auto;
      max-inline-size: var(--ilc-content-max, 100rem);
      padding: clamp(1rem, 3vw, 2rem);
    }

    .page-header {
      align-items: flex-start;
      display: flex;
      gap: var(--ilc-space-md, 1rem);
      justify-content: space-between;
      margin-block-end: var(--ilc-space-lg, 1.5rem);
    }

    h1,
    p {
      margin: 0;
    }

    h1 {
      font-size: clamp(1.5rem, 3vw, 2.25rem);
      line-height: 1.2;
    }

    .secondary {
      color: var(--ilc-text-secondary, var(--secondary-text-color));
    }

    .refresh-button {
      align-items: center;
      background: var(--ilc-accent, var(--primary-color));
      border: 0;
      border-radius: var(--ilc-radius-md, var(--ha-card-border-radius, 0.75rem));
      color: var(--ilc-text-on-accent, var(--text-primary-color, var(--primary-text-color)));
      cursor: pointer;
      display: inline-flex;
      font: inherit;
      justify-content: center;
      min-block-size: var(--ilc-touch-target, 2.75rem);
      min-inline-size: var(--ilc-touch-target, 2.75rem);
      padding: 0.5rem 1rem;
    }

    .refresh-button[disabled] {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .refresh-button:focus-visible {
      outline: 0.1875rem solid var(--ilc-focus, var(--secondary-color));
      outline-offset: 0.1875rem;
    }

    @media (max-width: 37.5rem) {
      .page-header {
        flex-direction: column;
      }

      .refresh-button {
        inline-size: 100%;
      }
    }
  `;

  @property({ attribute: false }) public hass?: HomeAssistant;
  @property() public pageTitle = "";
  @property() public subtitle = "";
  @property({ type: Boolean }) public refreshing = false;
  @property({ type: Boolean }) public connected = true;
  @property({ type: Boolean }) public busy = false;

  protected override render() {
    return html`
      <main aria-busy=${String(this.busy)}>
        <header class="page-header">
          <div>
            <h1>${this.pageTitle}</h1>
            ${this.subtitle ? html`<p class="secondary">${this.subtitle}</p>` : nothing}
          </div>
          <button
            class="refresh-button"
            type="button"
            ?disabled=${this.refreshing || !this.connected}
            @click=${this.requestRefresh}
          >
            ${translate(this.hass, "status.refresh")}
          </button>
        </header>
        <slot name="navigation"></slot>
        <slot></slot>
      </main>
    `;
  }

  private readonly requestRefresh = (): void => {
    this.dispatchEvent(new CustomEvent("ilc-refresh", { bubbles: true, composed: true }));
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-app-shell": IlcAppShell;
  }
}

if (!customElements.get("ilc-app-shell")) {
  customElements.define("ilc-app-shell", IlcAppShell);
}
