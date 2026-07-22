import type { HomeAssistant } from "../types/home-assistant";
import { messages, type MessageKey } from "./messages";

type MessageValues = Readonly<Record<string, string | number>>;

function languageFor(hass?: HomeAssistant): string {
  return hass?.locale?.language ?? hass?.language ?? navigator.language;
}

export function translate(
  hass: HomeAssistant | undefined,
  key: MessageKey,
  values: MessageValues = {},
): string {
  const language = languageFor(hass).toLowerCase();
  const catalogue = messages[language as keyof typeof messages] ?? messages.en;
  const template = catalogue[key] ?? messages.en[key];

  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name: string) => {
    const value = values[name];
    return value === undefined ? match : String(value);
  });
}
