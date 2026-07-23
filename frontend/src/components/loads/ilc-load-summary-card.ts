import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";

import "../../components/status/ilc-status-pill";
import { translate } from "../../i18n";
import { localizeControllerState, localizeReasonCode } from "../../i18n/reasons";
import type { LoadProgress, LoadSummary } from "../../models/dashboard";
import type { HomeAssistant } from "../../types/home-assistant";
import { formatDateTime, formatMeasurement } from "../../utils/format";

export class IlcLoadSummaryCard extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public load?: LoadSummary;

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    const load = this.load;
    if (!load) {
      return nothing;
    }

    return html`
      <article class="load-card" aria-labelledby="load-${load.load_id}">
        <div class="load-header">
          <div>
            <h3 id="load-${load.load_id}">${load.name}</h3>
            <p class="secondary">${load.load_type}</p>
          </div>
          <ilc-status-pill
            .label=${localizeControllerState(this.hass, load.controller_state)}
          ></ilc-status-pill>
        </div>
        <p class="reason">${localizeReasonCode(this.hass, load.reason_code)}</p>
        ${load.fault
          ? html`<p class="fault" role="alert">${translate(this.hass, "load.fault")}</p>`
          : nothing}
        <dl class="load-meta">
          ${this.renderLoadMetric(
            translate(this.hass, "load.automatic"),
            load.automatic_control
              ? translate(this.hass, "value.enabled")
              : translate(this.hass, "value.disabled"),
          )}
          ${this.renderLoadMetric(
            translate(this.hass, "load.optimisation"),
            load.optimisation_mode ?? translate(this.hass, "value.unavailable"),
          )}
          ${this.renderLoadMetric(
            translate(this.hass, "load.power"),
            formatMeasurement(this.hass, load.current_power),
          )}
          ${this.renderLoadMetric(translate(this.hass, "load.progress"), this.formatProgress(load.progress))}
          ${this.renderLoadMetric(
            translate(this.hass, "load.deadline"),
            formatDateTime(this.hass, load.deadline),
          )}
          ${this.renderLoadMetric(
            translate(this.hass, "load.nextAction"),
            load.next_action ?? translate(this.hass, "value.unavailable"),
          )}
          ${this.renderLoadMetric(
            translate(this.hass, "load.manual"),
            load.manual_override ?? translate(this.hass, "value.no"),
          )}
        </dl>
        <div class="card-actions">
          <button class="secondary-button" type="button" @click=${this.openLoad}>
            ${translate(this.hass, "load.open")}
          </button>
          <button class="text-button" type="button" @click=${this.editLoad}>
            ${translate(this.hass, "load.edit")}
          </button>
        </div>
      </article>
    `;
  }

  private renderLoadMetric(label: string, value: string) {
    return html`<div><dt>${label}</dt><dd>${value}</dd></div>`;
  }

  private formatProgress(progress: LoadProgress | undefined): string {
    if (!progress) {
      return "—";
    }
    if (progress.percent !== undefined) {
      return `${new Intl.NumberFormat(this.locale, { maximumFractionDigits: 0 }).format(progress.percent)}%`;
    }
    if (progress.current !== undefined && progress.target !== undefined) {
      const unit = progress.unit ? ` ${progress.unit}` : "";
      return `${progress.current}/${progress.target}${unit}`;
    }
    return "—";
  }

  private get locale(): string {
    return this.hass?.locale?.language ?? this.hass?.language ?? navigator.language;
  }

  private readonly openLoad = (): void => {
    if (!this.load) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<{ loadId: string }>("ilc-open-load", {
        bubbles: true,
        composed: true,
        detail: { loadId: this.load.load_id },
      }),
    );
  };

  private readonly editLoad = (): void => {
    if (!this.load) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<{ loadId: string }>("ilc-edit-load", {
        bubbles: true,
        composed: true,
        detail: { loadId: this.load.load_id },
      }),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-load-summary-card": IlcLoadSummaryCard;
  }
}

if (!customElements.get("ilc-load-summary-card")) {
  customElements.define("ilc-load-summary-card", IlcLoadSummaryCard);
}
