import type { ECharts } from "echarts/core";
import { css, html, LitElement } from "lit";
import { property, query, state } from "lit/decorators.js";

import type { SiteSummary } from "../models/dashboard";
import type { HomeAssistant } from "../types/home-assistant";
import { translate } from "../i18n";

type EchartsCoreModule = typeof import("echarts/core");

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

  @state() private chartFailed = false;

  @query("#chart") private chartElement?: HTMLDivElement;
  private chart?: ECharts;
  private chartLibrary?: EchartsCoreModule;
  private chartLoad?: Promise<EchartsCoreModule>;
  private resizeObserver?: ResizeObserver;

  protected override firstUpdated(): void {
    void this.updateChart();
  }

  protected override updated(): void {
    void this.updateChart();
  }

  public override disconnectedCallback(): void {
    this.resizeObserver?.disconnect();
    this.chart?.dispose();
    this.chart = undefined;
    super.disconnectedCallback();
  }

  protected override render() {
    if (this.chartFailed) {
      return html`
        <p class="chart-fallback" role="status">
          ${translate(this.hass, "site.snapshotChartUnavailable")}
        </p>
      `;
    }

    return html`<div
      id="chart"
      role="img"
      aria-label=${translate(this.hass, "site.snapshotDescription")}
    ></div>`;
  }

  private async createChart(): Promise<void> {
    if (!this.chartElement || this.chart) {
      return;
    }

    try {
      const echarts = await this.loadChartLibrary();
      this.chart = echarts.init(this.chartElement, undefined, { renderer: "svg" });
      if (typeof ResizeObserver !== "undefined") {
        this.resizeObserver = new ResizeObserver(() => this.chart?.resize());
        this.resizeObserver.observe(this.chartElement);
      }
    } catch (error: unknown) {
      console.warn("Load Control site snapshot chart failed; keeping textual dashboard metrics visible.", error);
      this.chartFailed = true;
    }
  }

  private async updateChart(): Promise<void> {
    await this.createChart();
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

  private async loadChartLibrary(): Promise<EchartsCoreModule> {
    if (this.chartLibrary) {
      return this.chartLibrary;
    }
    if (!this.chartLoad) {
      this.chartLoad = Promise.all([
        import("echarts/core"),
        import("echarts/charts"),
        import("echarts/components"),
        import("echarts/renderers"),
      ]).then(([echarts, charts, components, renderers]) => {
        echarts.use([
          components.AriaComponent,
          charts.BarChart,
          components.GridComponent,
          renderers.SVGRenderer,
          components.TitleComponent,
          components.TooltipComponent,
        ]);
        this.chartLibrary = echarts;
        return echarts;
      });
    }
    return this.chartLoad;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-site-snapshot-chart": IlcSiteSnapshotChart;
  }
}

if (!customElements.get("ilc-site-snapshot-chart")) {
  customElements.define("ilc-site-snapshot-chart", IlcSiteSnapshotChart);
}
