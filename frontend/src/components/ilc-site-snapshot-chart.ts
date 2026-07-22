import { BarChart } from "echarts/charts";
import {
  AriaComponent,
  GridComponent,
  TitleComponent,
  TooltipComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import type { ECharts } from "echarts/core";
import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";

import type { SiteSummary } from "../models/dashboard";
import type { HomeAssistant } from "../types/home-assistant";
import { translate } from "../i18n";

echarts.use([AriaComponent, BarChart, GridComponent, SVGRenderer, TitleComponent, TooltipComponent]);

@customElement("ilc-site-snapshot-chart")
export class IlcSiteSnapshotChart extends LitElement {
  public static override styles = css`
    :host {
      display: block;
      min-inline-size: 0;
    }

    #chart {
      block-size: 15rem;
      inline-size: 100%;
    }
  `;

  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public site?: SiteSummary;

  @query("#chart") private chartElement?: HTMLDivElement;
  private chart?: ECharts;
  private resizeObserver?: ResizeObserver;

  protected override firstUpdated(): void {
    this.createChart();
  }

  protected override updated(): void {
    this.updateChart();
  }

  public override disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
    this.chart?.dispose();
    this.chart = undefined;
    super.disconnectedCallback();
  }

  protected override render() {
    return html`<div
      id="chart"
      role="img"
      aria-label=${translate(this.hass, "site.snapshotDescription")}
    ></div>`;
  }

  private createChart(): void {
    if (!this.chartElement || this.chart) {
      return;
    }

    this.chart = echarts.init(this.chartElement, undefined, { renderer: "svg" });
    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.chart?.resize());
      this.resizeObserver.observe(this.chartElement);
    }
  }

  private updateChart(): void {
    this.createChart();
    if (!this.chart || !this.site) {
      return;
    }

    const labels = [
      translate(this.hass, "site.import"),
      translate(this.hass, "site.export"),
      translate(this.hass, "site.solar"),
      translate(this.hass, "site.controlled"),
    ];
    const values = [
      this.site.grid_import?.value ?? 0,
      this.site.grid_export?.value ?? 0,
      this.site.solar_production?.value ?? 0,
      this.site.controlled_power?.value ?? 0,
    ];

    this.chart.setOption({
      animation: false,
      aria: {
        enabled: true,
        description: translate(this.hass, "site.snapshotDescription"),
      },
      grid: { top: 28, right: 12, bottom: 30, left: 48 },
      textStyle: { color: "var(--primary-text-color)" },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: labels,
        axisLabel: { color: "var(--secondary-text-color)" },
        axisLine: { lineStyle: { color: "var(--divider-color)" } },
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "var(--secondary-text-color)" },
        splitLine: { lineStyle: { color: "var(--divider-color)" } },
      },
      series: [
        {
          name: translate(this.hass, "site.snapshot"),
          type: "bar",
          data: values,
          itemStyle: { color: "var(--primary-color)" },
        },
      ],
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-site-snapshot-chart": IlcSiteSnapshotChart;
  }
}
