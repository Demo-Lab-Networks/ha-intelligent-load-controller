import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";

import "../../components/status/ilc-status-pill";
import { createLoadCardPresentation } from "../../features/loads/load-card-presentation";
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
    const presentation = createLoadCardPresentation(load);

    return html`
      <article class="load-card load-summary-card" aria-labelledby="load-${load.load_id}" data-tone=${presentation.tone}>
        <div class="load-header">
          <div class="load-identity">
            <span class="load-type-icon" aria-hidden="true">${presentation.typeIcon}</span>
            <div>
              <h3 id="load-${load.load_id}">${load.name}</h3>
              <p class="secondary">${translate(this.hass, presentation.typeLabelKey)}</p>
            </div>
          </div>
          <ilc-status-pill
            .tone=${presentation.tone}
            .label=${localizeControllerState(this.hass, load.controller_state)}
          ></ilc-status-pill>
        </div>
        <p class="load-state-phrase">${translate(this.hass, presentation.stateKey)}</p>
        ${load.fault
          ? html`<p class="fault" role="alert">${translate(this.hass, "load.fault")}</p>`
          : nothing}
        <div class="load-focus-grid">
          ${this.renderFocusMetric("load.power", formatMeasurement(this.hass, load.current_power), "power")}
          ${this.renderFocusMetric(presentation.progressLabelKey, this.formatProgress(load.progress), "progress", load.progress?.percent)}
          ${this.renderFocusMetric(
            "load.nextAction",
            this.formatNextAction(load, presentation.nextActionFallbackKey),
            "next",
          )}
        </div>
        <div class="load-card-badges" aria-label=${translate(this.hass, "load.cardBadges")}>
          ${presentation.badges.map(
            (badge) => html`
              <span class="load-badge" data-tone=${badge.tone}>
                ${translate(this.hass, badge.labelKey)}
              </span>
            `,
          )}
        </div>
        <p class="reason">
          <strong>${translate(this.hass, "overview.why")}:</strong>
          ${localizeReasonCode(this.hass, load.reason_code)}
        </p>
        ${load.deadline
          ? html`
              <p class="secondary">
                <strong>${translate(this.hass, "load.deadline")}:</strong>
                ${formatDateTime(this.hass, load.deadline)}
              </p>
            `
          : nothing}
        <div class="card-actions">
          <button class="primary-button" type="button" @click=${this.openLoad}>
            ${translate(this.hass, presentation.primaryActionKey)}
          </button>
          <button class="text-button" type="button" @click=${this.editLoad}>
            ${translate(this.hass, "load.edit")}
          </button>
        </div>
      </article>
    `;
  }

  private renderFocusMetric(
    labelKey: Parameters<typeof translate>[1],
    value: string,
    kind: "power" | "progress" | "next",
    percent?: number,
  ) {
    return html`
      <div class="load-focus-metric" data-kind=${kind}>
        <span>${translate(this.hass, labelKey)}</span>
        <strong>${value}</strong>
        ${kind === "progress" && percent !== undefined
          ? html`
              <div
                class="load-progress-bar"
                role="progressbar"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow=${String(Math.round(percent))}
              >
                <span style=${`inline-size: ${Math.max(0, Math.min(100, percent)).toFixed(0)}%;`}></span>
              </div>
            `
          : nothing}
      </div>
    `;
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

  private formatNextAction(load: LoadSummary, fallbackKey: Parameters<typeof translate>[1]): string {
    if (load.next_action) {
      return load.next_action;
    }
    if (load.next_action_at) {
      const time = formatDateTime(this.hass, load.next_action_at);
      const reason = load.next_action_reason_code
        ? localizeReasonCode(this.hass, load.next_action_reason_code)
        : translate(this.hass, "value.unavailable");
      if (load.next_action_kind === "stop") {
        return translate(this.hass, "load.nextAction.stop", { time, reason });
      }
      return translate(this.hass, "load.nextAction.start", { time, reason });
    }
    return translate(this.hass, fallbackKey);
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
