/**
 * Minimal public Home Assistant surface consumed by the panel. Keeping this
 * small prevents the frontend from coupling to private Home Assistant types.
 */
export type HomeAssistantUnsubscribe = () => void;

export interface HomeAssistantConnection {
  /** `false` while the websocket is reconnecting. Omitted by older shells. */
  connected?: boolean;
  /** Standard frontend connection API for scoped WebSocket subscriptions. */
  subscribeMessage?<TMessage>(
    callback: (message: TMessage) => void,
    message: Record<string, unknown>,
  ): Promise<HomeAssistantUnsubscribe>;
}

export interface HomeAssistantLocale {
  language?: string;
}

export interface HomeAssistantConfig {
  currency?: string;
  /** IANA timezone configured by Home Assistant (for example Australia/Brisbane). */
  time_zone?: string;
}

export interface HomeAssistant {
  callWS<TResponse>(message: Record<string, unknown>): Promise<TResponse>;
  connection?: HomeAssistantConnection;
  language?: string;
  locale?: HomeAssistantLocale;
  config?: HomeAssistantConfig;
}

/** Home Assistant passes this to registered panels when the route changes. */
export interface PanelRoute {
  path?: string;
  prefix?: string;
}
