import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";

import { translate } from "../i18n";
import { localizeReasonCode } from "../i18n/reasons";
import type { JsonObject, LoadSummary } from "../models/dashboard";
import type { HomeAssistant } from "../types/home-assistant";

export type OverrideDesiredState = "on" | "off";

export class IlcLoadDetailPage extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public load?: LoadSummary;
  @property({ attribute: false }) public loadDetail?: JsonObject;
  @property({ type: Number }) public overrideDurationMinutes = 30;

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    const load = this.load;
    if (!load) {
      return html`
        <section class="panel-card empty-state" aria-live="polite">
          <h2>${translate(this.hass, "load.details")}</h2>
          <p class="secondary">${translate(this.hass, "value.unavailable")}</p>
          <button class="secondary-button" type="button" @click=${this.backToLoads}>
            ${translate(this.hass, "nav.loads")}
          </button>
        </section>
      `;
    }

    return html`
      <section class="panel-card" aria-labelledby="load-controls-title">
        <div class="section-header">
          <div>
            <h2 id="load-controls-title">${load.name}</h2>
            <p class="secondary">${translate(this.hass, "load.details")}</p>
          </div>
          <button class="text-button" type="button" @click=${this.backToLoads}>
            ${translate(this.hass, "nav.loads")}
          </button>
        </div>
        <p class="reason">${localizeReasonCode(this.hass, load.reason_code)}</p>
        <label class="form-field">
          <span>${translate(this.hass, "load.duration")}</span>
          <input
            type="number"
            min="1"
            inputmode="numeric"
            .value=${String(this.overrideDurationMinutes)}
            @input=${this.updateOverrideDuration}
          />
        </label>
        <div class="override-actions">
          <button
            class="secondary-button"
            type="button"
            @click=${() => this.setAutomaticControl(!load.automatic_control)}
          >
            ${translate(
              this.hass,
              load.automatic_control ? "load.disableAutomatic" : "load.enableAutomatic",
            )}
          </button>
          <button class="primary-button" type="button" @click=${() => this.startOverride("on", false)}>
            ${translate(this.hass, "load.timedOn")}
          </button>
          <button class="secondary-button" type="button" @click=${() => this.startOverride("off", false)}>
            ${translate(this.hass, "load.timedOff")}
          </button>
          <button class="secondary-button" type="button" @click=${() => this.startOverride("on", true)}>
            ${translate(this.hass, "load.indefiniteOn")}
          </button>
          <button class="secondary-button" type="button" @click=${() => this.startOverride("off", true)}>
            ${translate(this.hass, "load.indefiniteOff")}
          </button>
          <button class="danger-button" type="button" @click=${this.clearOverride}>
            ${translate(this.hass, "load.clearOverride")}
          </button>
        </div>
        ${this.loadDetail
          ? html`
              <details>
                <summary>${translate(this.hass, "config.advanced")}</summary>
                <pre>${JSON.stringify(this.loadDetail, null, 2)}</pre>
              </details>
            `
          : nothing}
      </section>
    `;
  }

  private readonly backToLoads = (): void => {
    this.dispatchEvent(new CustomEvent("ilc-back-to-loads", { bubbles: true, composed: true }));
  };

  private readonly updateOverrideDuration = (event: Event): void => {
    const target = event.currentTarget as HTMLInputElement;
    const minutes = Number(target.value);
    this.dispatchEvent(
      new CustomEvent<{ minutes: number }>("ilc-override-duration-change", {
        bubbles: true,
        composed: true,
        detail: { minutes: Number.isFinite(minutes) ? minutes : 0 },
      }),
    );
  };

  private setAutomaticControl(enabled: boolean): void {
    if (!this.load) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<{ load: LoadSummary; enabled: boolean }>("ilc-set-automatic-control", {
        bubbles: true,
        composed: true,
        detail: { load: this.load, enabled },
      }),
    );
  }

  private startOverride(desiredState: OverrideDesiredState, indefinite: boolean): void {
    if (!this.load) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<{ loadId: string; desiredState: OverrideDesiredState; indefinite: boolean }>(
        "ilc-start-override",
        {
          bubbles: true,
          composed: true,
          detail: { loadId: this.load.load_id, desiredState, indefinite },
        },
      ),
    );
  }

  private readonly clearOverride = (): void => {
    if (!this.load) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<{ loadId: string }>("ilc-clear-override", {
        bubbles: true,
        composed: true,
        detail: { loadId: this.load.load_id },
      }),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-load-detail-page": IlcLoadDetailPage;
  }
}

if (!customElements.get("ilc-load-detail-page")) {
  customElements.define("ilc-load-detail-page", IlcLoadDetailPage);
}
