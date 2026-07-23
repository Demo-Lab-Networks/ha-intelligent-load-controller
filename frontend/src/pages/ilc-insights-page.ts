import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";

import type { EventJournalEntry, HistoricalSummaryResponse } from "../api/load-control-api";
import { translate } from "../i18n";
import { localizeControllerState, localizeReasonCode } from "../i18n/reasons";
import type { JsonObject, JsonValue } from "../models/dashboard";
import type { HomeAssistant } from "../types/home-assistant";
import { formatDateTime } from "../utils/format";

export class IlcInsightsPage extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public history?: HistoricalSummaryResponse;
  @property({ attribute: false }) public events: readonly EventJournalEntry[] = [];

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    return html`
      <section class="panel-card" aria-labelledby="history-title">
        <div class="section-header">
          <div>
            <h2 id="history-title">${translate(this.hass, "history.title")}</h2>
            ${this.history?.data_quality
              ? html`<p class="secondary">
                  ${translate(this.hass, "history.quality", { quality: this.history.data_quality })}
                </p>`
              : null}
          </div>
        </div>
        ${this.renderHistoricalSummaries(this.history?.daily_summaries ?? [])}
      </section>
      <section class="panel-card" aria-labelledby="events-title">
        <div class="section-header">
          <h2 id="events-title">${translate(this.hass, "events.title")}</h2>
          <span class="secondary">${this.events.length}</span>
        </div>
        ${this.renderEvents(this.events)}
      </section>
    `;
  }

  private renderHistoricalSummaries(summaries: readonly JsonObject[]) {
    if (summaries.length === 0) {
      return html`<p class="secondary">${translate(this.hass, "status.noHistory")}</p>`;
    }
    return html`
      <div class="table-wrap">
        <table aria-label=${translate(this.hass, "history.title")}>
          <thead>
            <tr>
              <th>${translate(this.hass, "events.time")}</th>
              <th>${translate(this.hass, "events.message")}</th>
            </tr>
          </thead>
          <tbody>
            ${summaries.map(
              (summary) => html`
                <tr>
                  <td>${stringFrom(summary["date"]) ?? stringFrom(summary["day"]) ?? "—"}</td>
                  <td>${this.renderSummaryFields(summary)}</td>
                </tr>
              `,
            )}
          </tbody>
        </table>
      </div>
    `;
  }

  private renderSummaryFields(summary: JsonObject) {
    const entries = Object.entries(summary).filter(([key]) => key !== "date" && key !== "day");
    if (entries.length === 0) {
      return "—";
    }
    return html`
      <dl class="summary-fields">
        ${entries.map(
          ([key, value]) => html`
            <div>
              <dt>${humanizeKey(key)}</dt>
              <dd>${formatJsonValue(this.hass, value)}</dd>
            </div>
          `,
        )}
      </dl>
    `;
  }

  private renderEvents(events: readonly EventJournalEntry[]) {
    if (events.length === 0) {
      return html`<p class="secondary">${translate(this.hass, "status.noEvents")}</p>`;
    }
    return html`
      <div class="table-wrap">
        <table aria-label=${translate(this.hass, "events.title")}>
          <thead>
            <tr>
              <th>${translate(this.hass, "events.time")}</th>
              <th>${translate(this.hass, "events.load")}</th>
              <th>${translate(this.hass, "events.state")}</th>
              <th>${translate(this.hass, "events.reason")}</th>
              <th>${translate(this.hass, "events.message")}</th>
            </tr>
          </thead>
          <tbody>
            ${events.map(
              (event) => html`
                <tr>
                  <td>${formatDateTime(this.hass, event.timestamp)}</td>
                  <td>${event.load_id ?? "—"}</td>
                  <td>${event.state ? localizeControllerState(this.hass, event.state) : "—"}</td>
                  <td>
                    ${event.reason_code
                      ? localizeReasonCode(this.hass, event.reason_code)
                      : "—"}
                  </td>
                  <td>${event.message ?? "—"}</td>
                </tr>
              `,
            )}
          </tbody>
        </table>
      </div>
    `;
  }
}

function stringFrom(value: JsonValue | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function humanizeKey(key: string): string {
  return key.replaceAll("_", " ");
}

function formatJsonValue(hass: HomeAssistant | undefined, value: JsonValue): string {
  if (value === null || value === undefined) {
    return "—";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return new Intl.NumberFormat(hass?.locale?.language ?? hass?.language ?? navigator.language, {
      maximumFractionDigits: Math.abs(value) < 10 ? 2 : 0,
    }).format(value);
  }
  if (typeof value === "boolean") {
    return value ? translate(hass, "value.yes") : translate(hass, "value.no");
  }
  return translate(hass, "history.complexValue");
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-insights-page": IlcInsightsPage;
  }
}

if (!customElements.get("ilc-insights-page")) {
  customElements.define("ilc-insights-page", IlcInsightsPage);
}
