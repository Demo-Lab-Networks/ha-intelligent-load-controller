import { css } from "lit";

export const ilcDesignTokens = css`
  :host {
    --ilc-space-2xs: 0.25rem;
    --ilc-space-xs: 0.5rem;
    --ilc-space-sm: 0.75rem;
    --ilc-space-md: 1rem;
    --ilc-space-lg: 1.5rem;
    --ilc-space-xl: 2rem;
    --ilc-radius-sm: 0.5rem;
    --ilc-radius-md: var(--ha-card-border-radius, 0.75rem);
    --ilc-radius-lg: 1rem;
    --ilc-radius-pill: 999px;
    --ilc-surface-page: var(--primary-background-color);
    --ilc-surface-card: var(--card-background-color);
    --ilc-surface-muted: var(--secondary-background-color);
    --ilc-border-subtle: var(--divider-color);
    --ilc-text-primary: var(--primary-text-color);
    --ilc-text-secondary: var(--secondary-text-color);
    --ilc-text-on-accent: var(--text-primary-color, var(--primary-text-color));
    --ilc-accent: var(--primary-color);
    --ilc-focus: var(--secondary-color, var(--primary-color));
    --ilc-status-info: var(--info-color, var(--primary-color));
    --ilc-status-success: var(--success-color, #008a45);
    --ilc-status-warning: var(--warning-color, #b36b00);
    --ilc-status-danger: var(--error-color, #c62828);
    --ilc-energy-solar: color-mix(in srgb, var(--warning-color, #f9a825) 88%, var(--primary-text-color));
    --ilc-energy-grid-import: color-mix(in srgb, var(--primary-color) 82%, var(--primary-text-color));
    --ilc-energy-grid-export: color-mix(in srgb, var(--success-color, #008a45) 78%, var(--primary-text-color));
    --ilc-energy-controlled: color-mix(in srgb, var(--accent-color, var(--primary-color)) 74%, var(--primary-text-color));
    --ilc-elevation-card: var(--ha-card-box-shadow, 0 0.125rem 0.5rem rgb(0 0 0 / 0.16));
    --ilc-motion-fast: 120ms ease;
    --ilc-motion-medium: 180ms ease;
    --ilc-touch-target: 2.75rem;
    --ilc-content-max: 100rem;
  }
`;
