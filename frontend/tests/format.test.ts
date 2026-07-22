import { describe, expect, it } from "vitest";

import { formatDateTime } from "../src/utils/format";
import type { HomeAssistant } from "../src/types/home-assistant";

describe("formatDateTime", () => {
  it("uses Home Assistant's configured timezone instead of the browser timezone", () => {
    const hass: HomeAssistant = {
      language: "en-GB",
      config: { time_zone: "Australia/Brisbane" },
      callWS: async <TResponse>(): Promise<TResponse> => ({} as TResponse),
    };
    const instant = "2026-01-01T00:00:00Z";
    const expected = new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Australia/Brisbane",
    }).format(new Date(instant));

    expect(formatDateTime(hass, instant)).toBe(expected);
  });

  it("falls back to the browser timezone if a persisted timezone is invalid", () => {
    const hass: HomeAssistant = {
      language: "en-GB",
      config: { time_zone: "not/a-timezone" },
      callWS: async <TResponse>(): Promise<TResponse> => ({} as TResponse),
    };

    expect(() => formatDateTime(hass, "2026-01-01T00:00:00Z")).not.toThrow();
  });
});
