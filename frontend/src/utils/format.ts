import type { CurrencyRate, Measurement } from "../models/dashboard";
import type { HomeAssistant } from "../types/home-assistant";

function localeFor(hass?: HomeAssistant): string {
  return hass?.locale?.language ?? hass?.language ?? navigator.language;
}

function timeZoneFor(hass?: HomeAssistant): string | undefined {
  return hass?.config?.time_zone;
}

export function formatMeasurement(
  hass: HomeAssistant | undefined,
  measurement: Measurement | undefined,
): string {
  if (!measurement) {
    return "—";
  }

  return `${new Intl.NumberFormat(localeFor(hass), {
    maximumFractionDigits: Math.abs(measurement.value) < 10 ? 2 : 0,
  }).format(measurement.value)} ${measurement.unit}`;
}

export function formatCurrencyRate(
  hass: HomeAssistant | undefined,
  rate: CurrencyRate | undefined,
): string {
  if (!rate) {
    return "—";
  }

  try {
    const value = new Intl.NumberFormat(localeFor(hass), {
      style: "currency",
      currency: rate.currency,
      maximumFractionDigits: 3,
    }).format(rate.value);
    return `${value}/${rate.unit}`;
  } catch {
    return `${rate.value} ${rate.currency}/${rate.unit}`;
  }
}

export function formatDateTime(
  hass: HomeAssistant | undefined,
  value: string | undefined,
): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  };
  const timeZone = timeZoneFor(hass);

  try {
    return new Intl.DateTimeFormat(localeFor(hass), {
      ...options,
      ...(timeZone === undefined ? {} : { timeZone }),
    }).format(parsed);
  } catch {
    // A malformed timezone must not make the whole panel unreadable. Home
    // Assistant's own configuration remains authoritative and will surface
    // the configuration problem elsewhere.
    return new Intl.DateTimeFormat(localeFor(hass), options).format(parsed);
  }
}

export function formatTime(
  hass: HomeAssistant | undefined,
  value: string | undefined,
): string {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const options: Intl.DateTimeFormatOptions = {
    timeStyle: "short",
  };
  const timeZone = timeZoneFor(hass);

  try {
    return new Intl.DateTimeFormat(localeFor(hass), {
      ...options,
      ...(timeZone === undefined ? {} : { timeZone }),
    }).format(parsed);
  } catch {
    return new Intl.DateTimeFormat(localeFor(hass), options).format(parsed);
  }
}
