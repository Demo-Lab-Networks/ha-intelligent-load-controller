import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";

import type { DailyTimelineResponse } from "../../api/load-control-api";
import {
  createTodayTimelinePresentation,
  type TodayTimelineSegment,
} from "../../features/overview/overview-presentation";
import { translate } from "../../i18n";
import { localizeReasonCode } from "../../i18n/reasons";
import type { LoadSummary } from "../../models/dashboard";
import type { HomeAssistant } from "../../types/home-assistant";
import { formatMeasurement, formatTime } from "../../utils/format";

const MAX_DETAIL_ROWS = 5;

export class IlcTodayTimeline extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public loads: readonly LoadSummary[] = [];
  @property({ attribute: false }) public timeline?: DailyTimelineResponse;
  @property({ type: Boolean }) public loading = false;
  @property({ type: Boolean }) public unavailable = false;

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    const presentation = createTodayTimelinePresentation(this.timeline?.intervals, this.loads);
    const summary = this.summaryText(presentation.segments.length, presentation.loadCount, presentation.nextSegment);

    return html`
      <section class="panel-card today-timeline-card" aria-labelledby="today-timeline-title">
        <div class="section-header">
          <div>
            <h2 id="today-timeline-title">${translate(this.hass, "overview.timeline.title")}</h2>
            <p class="secondary">${translate(this.hass, "overview.timeline.hint")}</p>
          </div>
          <button class="secondary-button" type="button" @click=${this.openPlan}>
            ${translate(this.hass, "overview.timeline.openPlan")}
          </button>
        </div>
        ${this.loading
          ? html`
              <div class="timeline-placeholder" role="status" aria-live="polite">
                ${translate(this.hass, "overview.timeline.loading")}
              </div>
            `
          : this.unavailable
            ? html`<p class="secondary">${translate(this.hass, "overview.timeline.unavailable")}</p>`
          : presentation.segments.length === 0
            ? html`<p class="secondary">${translate(this.hass, "overview.timeline.empty")}</p>`
            : html`
                <p class="secondary timeline-summary">${summary}</p>
                <div class="timeline-strip" role="img" aria-label=${summary}>
                  ${presentation.currentPercent === undefined
                    ? nothing
                    : html`
                        <span
                          class="timeline-now"
                          style=${`left: ${presentation.currentPercent.toFixed(2)}%;`}
                          title=${translate(this.hass, "overview.timeline.now")}
                        ></span>
                      `}
                  ${presentation.segments.map(
                    (segment) => html`
                      <button
                        class="timeline-segment"
                        data-tone=${segment.tone}
                        style=${`left: ${segment.startPercent.toFixed(2)}%; width: ${segment.widthPercent.toFixed(2)}%;`}
                        title=${this.segmentLabel(segment)}
                        type="button"
                        @click=${() => this.openLoad(segment.loadId)}
                      >
                        <span class="sr-only">${this.segmentLabel(segment)}</span>
                      </button>
                    `,
                  )}
                </div>
                <ol class="timeline-detail-list">
                  ${presentation.segments.slice(0, MAX_DETAIL_ROWS).map(
                    (segment) => html`
                      <li>
                        <span class="timeline-dot" data-tone=${segment.tone}></span>
                        <div>
                          <strong>${segment.loadName}</strong>
                          <span class="secondary">
                            ${formatTime(this.hass, segment.startAt)}–${formatTime(this.hass, segment.endAt)}
                            · ${this.segmentReason(segment)}
                            ${segment.powerW === undefined
                              ? nothing
                              : html` · ${formatMeasurement(this.hass, { value: segment.powerW, unit: "W" })}`}
                          </span>
                        </div>
                      </li>
                    `,
                  )}
                </ol>
              `}
      </section>
    `;
  }

  private summaryText(intervalCount: number, loadCount: number, nextSegment: TodayTimelineSegment | undefined): string {
    if (!nextSegment) {
      return translate(this.hass, "overview.timeline.summaryNoNext", {
        count: intervalCount,
        loads: loadCount,
      });
    }
    return translate(this.hass, "overview.timeline.summary", {
      count: intervalCount,
      loads: loadCount,
      load: nextSegment.loadName,
      time: formatTime(this.hass, nextSegment.startAt),
    });
  }

  private segmentLabel(segment: TodayTimelineSegment): string {
    return translate(this.hass, "overview.timeline.segmentLabel", {
      load: segment.loadName,
      start: formatTime(this.hass, segment.startAt),
      end: formatTime(this.hass, segment.endAt),
      reason: this.segmentReason(segment),
    });
  }

  private segmentReason(segment: TodayTimelineSegment): string {
    return segment.reasonCode
      ? localizeReasonCode(this.hass, segment.reasonCode)
      : translate(this.hass, "overview.timeline.planned");
  }

  private openLoad(loadId: string | undefined): void {
    if (!loadId) {
      this.openPlan();
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

  private readonly openPlan = (): void => {
    this.dispatchEvent(
      new CustomEvent<{ view: "plan" }>("ilc-navigate", {
        bubbles: true,
        composed: true,
        detail: { view: "plan" },
      }),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-today-timeline": IlcTodayTimeline;
  }
}

if (!customElements.get("ilc-today-timeline")) {
  customElements.define("ilc-today-timeline", IlcTodayTimeline);
}
