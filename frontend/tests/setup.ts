/** ECharts measures labels through canvas even when its SVG renderer is used. */
const measureContext = {
  measureText: (text: string) => ({ width: text.length * 8 }),
};

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  configurable: true,
  value: () => measureContext,
});

/** Give the chart host deterministic dimensions in JSDOM so ECharts exercises
 * its normal SVG rendering path instead of warning about a zero-sized DOM. */
Object.defineProperties(HTMLDivElement.prototype, {
  clientHeight: {
    configurable: true,
    get(this: HTMLDivElement): number {
      return this.id === "chart" ? 240 : 0;
    },
  },
  clientWidth: {
    configurable: true,
    get(this: HTMLDivElement): number {
      return this.id === "chart" ? 480 : 0;
    },
  },
});
