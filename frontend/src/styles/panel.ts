import { css } from "lit";

import { ilcDesignTokens } from "../design/tokens";

export const panelStyles = [ilcDesignTokens, css`
    :host {
      box-sizing: border-box;
      color: var(--primary-text-color);
      display: block;
      min-block-size: 100vh;
      background: var(--primary-background-color);
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
    }

    *,
    *::before,
    *::after {
      box-sizing: inherit;
    }

    main {
      margin: 0 auto;
      max-inline-size: 100rem;
      padding: clamp(1rem, 3vw, 2rem);
    }

    .page-header,
    .section-header,
    .load-header,
    .status-banner,
    .metric {
      align-items: center;
      display: flex;
      gap: 0.75rem;
      justify-content: space-between;
    }

    .page-header {
      align-items: flex-start;
      margin-block-end: 1.5rem;
    }

    h1,
    h2,
    h3,
    p {
      margin: 0;
    }

    h1 {
      font-size: clamp(1.5rem, 3vw, 2.25rem);
      line-height: 1.2;
    }

    h2 {
      font-size: 1.125rem;
    }

    .secondary,
    .metric dt,
    .load-meta dt,
    .reason,
    .updated {
      color: var(--secondary-text-color);
    }

    .refresh-button,
    .retry-button {
      align-items: center;
      background: var(--primary-color);
      border: 0;
      border-radius: var(--ha-card-border-radius, 0.75rem);
      color: var(--text-primary-color, var(--primary-text-color));
      cursor: pointer;
      display: inline-flex;
      font: inherit;
      justify-content: center;
      min-block-size: 2.75rem;
      min-inline-size: 2.75rem;
      padding: 0.5rem 1rem;
    }

    .refresh-button[disabled],
    .retry-button[disabled] {
      cursor: not-allowed;
      opacity: 0.6;
    }

    button:focus-visible {
      outline: 0.1875rem solid var(--secondary-color);
      outline-offset: 0.1875rem;
    }

    .status-banner,
    .panel-card,
    .load-card {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 0.75rem);
    }

    .status-banner {
      border-inline-start: 0.25rem solid var(--info-color, var(--primary-color));
      margin-block: 1rem;
      padding: 1rem;
    }

    .status-banner[data-state="error"] {
      border-inline-start-color: var(--ilc-status-danger, var(--error-color, var(--primary-color)));
    }

    .status-banner[data-state="reconnecting"] {
      border-inline-start-color: var(--ilc-status-warning, var(--warning-color, var(--primary-color)));
    }

    .status-banner[data-state="success"] {
      border-inline-start-color: var(--ilc-status-success, var(--success-color, var(--primary-color)));
    }

    .status-banner[data-state="warning"] {
      border-inline-start-color: var(--ilc-status-warning, var(--warning-color, var(--primary-color)));
    }

    .skeleton-grid,
    .metric-grid,
    .load-grid {
      display: grid;
      gap: 0.875rem;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));
    }

    .skeleton {
      animation: pulse 1.6s ease-in-out infinite;
      background: var(--divider-color);
      border-radius: var(--ha-card-border-radius, 0.75rem);
      min-block-size: 7rem;
    }

    @keyframes pulse {
      50% {
        opacity: 0.45;
      }
    }

    .panel-card {
      margin-block: 1rem;
      padding: 1rem;
    }

    .sr-only {
      block-size: 1px;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      inline-size: 1px;
      overflow: hidden;
      position: absolute;
      white-space: nowrap;
    }

    .home-status-hero {
      background:
        linear-gradient(
          135deg,
          color-mix(in srgb, var(--ilc-accent, var(--primary-color)) 14%, transparent),
          transparent 62%
        ),
        var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 0.75rem);
      display: grid;
      gap: clamp(1rem, 3vw, 2rem);
      grid-template-columns: minmax(0, 1fr) minmax(14rem, 0.34fr);
      margin-block: 1rem;
      padding: clamp(1rem, 3vw, 1.5rem);
    }

    .home-status-hero[data-level="critical"] {
      border-inline-start: 0.35rem solid var(--ilc-status-danger, var(--error-color, var(--primary-color)));
    }

    .home-status-hero[data-level="warning"] {
      border-inline-start: 0.35rem solid var(--ilc-status-warning, var(--warning-color, var(--primary-color)));
    }

    .hero-copy,
    .hero-explainers,
    .hero-values,
    .attention-items,
    .overview-load-groups {
      display: grid;
      gap: 1rem;
    }

    .eyebrow-row {
      align-items: center;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .eyebrow,
    .attention-severity {
      color: var(--secondary-text-color);
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .home-status-hero h2 {
      font-size: clamp(1.75rem, 4vw, 3rem);
      line-height: 1.05;
    }

    .hero-summary {
      color: var(--primary-text-color);
      font-size: clamp(1rem, 1.8vw, 1.2rem);
      max-inline-size: 64rem;
    }

    .hero-explainers {
      grid-template-columns: repeat(4, minmax(0, 1fr));
      margin: 0;
    }

    .hero-explainers div,
    .hero-values div,
    .kpi-card,
    .energy-node {
      background: color-mix(in srgb, var(--secondary-background-color) 72%, transparent);
      border: 1px solid color-mix(in srgb, var(--divider-color) 74%, transparent);
      border-radius: var(--ilc-radius-md, var(--ha-card-border-radius, 0.75rem));
      min-inline-size: 0;
      padding: 0.875rem;
    }

    .hero-explainers dt,
    .hero-values span,
    .kpi-card span,
    .energy-node span,
    .energy-node small {
      color: var(--secondary-text-color);
      font-size: 0.82rem;
      font-weight: 600;
    }

    .hero-explainers dd,
    .hero-values strong,
    .kpi-card strong,
    .energy-node strong {
      display: block;
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0.25rem 0 0;
      overflow-wrap: anywhere;
    }

    .hero-values {
      align-content: start;
    }

    .energy-flow-card {
      overflow: hidden;
    }

    .energy-flow {
      align-items: stretch;
      display: grid;
      gap: 0.75rem;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
    }

    .energy-node {
      border-block-start: 0.25rem solid var(--ilc-energy-controlled, var(--primary-color));
      display: grid;
      gap: 0.15rem;
      min-block-size: 6rem;
    }

    .energy-node[data-kind="solar"] {
      border-block-start-color: var(--ilc-energy-solar);
    }

    .energy-node[data-kind="grid"] {
      border-block-start-color: var(--ilc-energy-grid-import);
    }

    .energy-node[data-kind="controlled"] {
      border-block-start-color: var(--ilc-energy-controlled);
    }

    .flow-link {
      align-self: center;
      color: var(--secondary-text-color);
      font-size: 1.5rem;
      font-weight: 700;
    }

    .attention-list {
      border-inline-start: 0.25rem solid var(--ilc-status-warning, var(--warning-color, var(--primary-color)));
    }

    .attention-item {
      align-items: start;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 0.75rem);
      display: flex;
      gap: 1rem;
      justify-content: space-between;
      padding: 1rem;
    }

    .attention-item h3 {
      margin-block: 0.15rem 0.35rem;
    }

    .attention-item[data-severity="critical"] {
      border-inline-start: 0.25rem solid var(--ilc-status-danger, var(--error-color, var(--primary-color)));
    }

    .attention-item[data-severity="warning"] {
      border-inline-start: 0.25rem solid var(--ilc-status-warning, var(--warning-color, var(--primary-color)));
    }

    .attention-item[data-severity="info"] {
      border-inline-start: 0.25rem solid var(--ilc-status-info, var(--primary-color));
    }

    .kpi-grid {
      display: grid;
      gap: 0.875rem;
      grid-template-columns: repeat(6, minmax(0, 1fr));
    }

    .kpi-card {
      background: var(--card-background-color);
      min-block-size: 6rem;
    }

    .today-timeline-card {
      display: grid;
      gap: 1rem;
    }

    .timeline-summary {
      max-inline-size: 70rem;
    }

    .timeline-placeholder {
      background: color-mix(in srgb, var(--secondary-background-color) 72%, transparent);
      border: 1px dashed var(--divider-color);
      border-radius: var(--ilc-radius-md, var(--ha-card-border-radius, 0.75rem));
      color: var(--secondary-text-color);
      padding: 1rem;
    }

    .timeline-strip {
      background:
        linear-gradient(90deg, color-mix(in srgb, var(--divider-color) 50%, transparent) 1px, transparent 1px),
        color-mix(in srgb, var(--secondary-background-color) 72%, transparent);
      background-size: 25% 100%;
      border: 1px solid var(--divider-color);
      border-radius: var(--ilc-radius-pill);
      min-block-size: 3rem;
      overflow: hidden;
      position: relative;
    }

    .timeline-segment {
      background: var(--ilc-energy-controlled);
      block-size: 1.25rem;
      border: 0;
      border-radius: var(--ilc-radius-pill);
      cursor: pointer;
      inset-block-start: 50%;
      min-inline-size: 0.75rem;
      opacity: 0.9;
      padding: 0;
      position: absolute;
      transform: translateY(-50%);
    }

    .timeline-segment:hover,
    .timeline-segment:focus-visible {
      opacity: 1;
      transform: translateY(-50%) scaleY(1.18);
    }

    .timeline-segment[data-tone="solar"],
    .timeline-dot[data-tone="solar"] {
      background: var(--ilc-energy-solar);
    }

    .timeline-segment[data-tone="free"],
    .timeline-dot[data-tone="free"] {
      background: var(--ilc-energy-grid-export);
    }

    .timeline-segment[data-tone="manual"],
    .timeline-dot[data-tone="manual"] {
      background: var(--ilc-status-warning);
    }

    .timeline-segment[data-tone="catch_up"],
    .timeline-dot[data-tone="catch_up"] {
      background: var(--ilc-status-danger);
    }

    .timeline-now {
      background: var(--primary-text-color);
      block-size: 100%;
      inline-size: 0.15rem;
      inset-block-start: 0;
      position: absolute;
      z-index: 2;
    }

    .timeline-detail-list {
      display: grid;
      gap: 0.65rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .timeline-detail-list li {
      align-items: start;
      display: grid;
      gap: 0.65rem;
      grid-template-columns: auto minmax(0, 1fr);
    }

    .timeline-detail-list strong,
    .timeline-detail-list span {
      display: block;
    }

    .timeline-dot {
      background: var(--ilc-energy-controlled);
      block-size: 0.8rem;
      border-radius: 50%;
      inline-size: 0.8rem;
      margin-block-start: 0.25rem;
    }

    .overview-load-group {
      display: grid;
      gap: 0.75rem;
    }

    .overview-load-group h3 {
      color: var(--secondary-text-color);
      font-size: 0.92rem;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .chart-fallback {
      display: grid;
      gap: 1rem;
    }

    .metric {
      align-items: flex-start;
      flex-direction: column;
      min-block-size: 6.5rem;
      padding: 1rem;
    }

    .metric dd,
    .load-meta dd {
      font-size: 1.125rem;
      font-weight: 600;
      margin: 0;
      overflow-wrap: anywhere;
    }

    .metric dl,
    .load-meta {
      margin: 0;
    }

    .section-header {
      margin-block-end: 1rem;
    }

    .load-grid {
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
    }

    .load-card {
      min-inline-size: 0;
      padding: 1rem;
    }

    .load-summary-card {
      border-block-start: 0.25rem solid var(--divider-color);
      display: grid;
      gap: 0.85rem;
    }

    .load-summary-card[data-tone="danger"] {
      border-block-start-color: var(--ilc-status-danger, var(--error-color, var(--primary-color)));
    }

    .load-summary-card[data-tone="warning"] {
      border-block-start-color: var(--ilc-status-warning, var(--warning-color, var(--primary-color)));
    }

    .load-summary-card[data-tone="info"] {
      border-block-start-color: var(--ilc-status-info, var(--primary-color));
    }

    .load-summary-card[data-tone="success"] {
      border-block-start-color: var(--ilc-status-success, var(--success-color, var(--primary-color)));
    }

    .load-header {
      align-items: flex-start;
    }

    .load-header h3 {
      font-size: 1.125rem;
      overflow-wrap: anywhere;
    }

    .load-identity {
      align-items: center;
      display: flex;
      gap: 0.75rem;
      min-inline-size: 0;
    }

    .load-type-icon {
      align-items: center;
      background: color-mix(in srgb, var(--ilc-accent, var(--primary-color)) 14%, transparent);
      border-radius: var(--ilc-radius-pill, 999px);
      display: inline-flex;
      flex: 0 0 auto;
      font-size: 1.2rem;
      inline-size: 2.4rem;
      justify-content: center;
      min-block-size: 2.4rem;
    }

    .load-state-phrase {
      font-size: 1rem;
      font-weight: 700;
    }

    .state-pill {
      background: var(--secondary-background-color);
      border-radius: 999px;
      color: var(--secondary-text-color);
      display: inline-flex;
      font-size: 0.8125rem;
      padding: 0.25rem 0.5rem;
      text-align: end;
    }

    .state-pill[data-tone="info"] {
      background: color-mix(in srgb, var(--ilc-status-info, var(--primary-color)) 16%, transparent);
      color: var(--primary-text-color);
    }

    .state-pill[data-tone="success"] {
      background: color-mix(in srgb, var(--ilc-status-success, var(--success-color, var(--primary-color))) 16%, transparent);
      color: var(--primary-text-color);
    }

    .state-pill[data-tone="warning"] {
      background: color-mix(in srgb, var(--ilc-status-warning, var(--warning-color, var(--primary-color))) 18%, transparent);
      color: var(--primary-text-color);
    }

    .state-pill[data-tone="danger"] {
      background: color-mix(in srgb, var(--ilc-status-danger, var(--error-color, var(--primary-color))) 16%, transparent);
      color: var(--primary-text-color);
    }

    .load-meta {
      display: grid;
      gap: 0.625rem;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .load-meta > div {
      min-inline-size: 0;
    }

    .fault {
      color: var(--error-color, var(--primary-text-color));
      font-weight: 600;
    }

    .empty-state {
      display: grid;
      gap: 0.75rem;
      justify-items: start;
      min-block-size: 14rem;
      place-content: center start;
    }

    .site-selector {
      display: grid;
      gap: 1rem;
      max-inline-size: 34rem;
    }

    .site-selector label {
      display: grid;
      font-weight: 600;
      gap: 0.5rem;
    }

    .site-selector select {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 0.75rem);
      color: var(--primary-text-color);
      font: inherit;
      min-block-size: 2.75rem;
      padding-inline: 0.75rem;
    }

    .site-selector select:focus-visible {
      outline: 0.1875rem solid var(--secondary-color);
      outline-offset: 0.1875rem;
    }

    .updated {
      font-size: 0.875rem;
      margin-block-start: 1rem;
    }

    .workspace-nav {
      display: flex;
      gap: 0.5rem;
      margin-block: 0 1rem;
      overflow-x: auto;
      padding-block-end: 0.25rem;
      scrollbar-width: thin;
    }

    .nav-button,
    .secondary-button,
    .danger-button,
    .primary-button,
    .text-button {
      align-items: center;
      background: var(--secondary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 0.75rem);
      color: var(--primary-text-color);
      cursor: pointer;
      display: inline-flex;
      font: inherit;
      justify-content: center;
      min-block-size: 2.75rem;
      padding: 0.5rem 0.875rem;
      text-align: center;
    }

    .nav-button {
      flex: 0 0 auto;
      gap: 0.375rem;
      white-space: nowrap;
    }

    .nav-button[aria-current="page"],
    .primary-button {
      background: var(--ilc-accent, var(--primary-color));
      border-color: var(--ilc-accent, var(--primary-color));
      color: var(--ilc-text-on-accent, var(--text-primary-color, var(--primary-text-color)));
    }

    .nav-icon {
      font-size: 1rem;
      line-height: 1;
    }

    .danger-button {
      border-color: var(--ilc-status-danger, var(--error-color, var(--primary-color)));
      color: var(--ilc-status-danger, var(--error-color, var(--primary-text-color)));
    }

    .text-button {
      background: transparent;
      border-color: transparent;
      color: var(--primary-color);
      padding-inline: 0.25rem;
    }

    .nav-button[disabled],
    .secondary-button[disabled],
    .danger-button[disabled],
    .primary-button[disabled],
    .text-button[disabled] {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .card-actions,
    .form-actions,
    .inline-actions,
    .override-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.625rem;
    }

    .card-actions {
      margin-block-start: 1rem;
    }

    .form-grid {
      display: grid;
      gap: 0.875rem;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
    }

    .form-field {
      display: grid;
      font-weight: 600;
      gap: 0.375rem;
      min-inline-size: 0;
    }

    .form-field input,
    .form-field select {
      background: var(--primary-background-color);
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 0.5rem);
      color: var(--primary-text-color);
      font: inherit;
      inline-size: 100%;
      min-block-size: 2.75rem;
      padding-inline: 0.75rem;
    }

    .form-field input[type="checkbox"] {
      accent-color: var(--primary-color);
      block-size: 1.25rem;
      inline-size: 1.25rem;
      min-block-size: auto;
      padding: 0;
    }

    .checkbox-field {
      align-items: center;
      display: flex;
      gap: 0.625rem;
      min-block-size: 2.75rem;
    }

    .form-field input:focus-visible,
    .form-field select:focus-visible {
      outline: 0.1875rem solid var(--secondary-color);
      outline-offset: 0.125rem;
    }

    .section-copy {
      margin-block-end: 1rem;
    }

    .action-status {
      margin-block: 0 1rem;
    }

    .issue-list {
      margin: 0.75rem 0 0;
      padding-inline-start: 1.25rem;
    }

    .issue-path {
      color: var(--secondary-text-color);
      font-size: 0.875rem;
    }

    .table-wrap {
      max-inline-size: 100%;
      overflow-x: auto;
    }

    table {
      border-collapse: collapse;
      inline-size: 100%;
      min-inline-size: 34rem;
    }

    th,
    td {
      border-block-end: 1px solid var(--divider-color);
      padding: 0.625rem;
      text-align: start;
      vertical-align: top;
    }

    th {
      color: var(--secondary-text-color);
      font-size: 0.875rem;
      font-weight: 600;
    }

    .plan-summary {
      display: grid;
      gap: 0.5rem;
      margin-block-end: 1rem;
    }

    .summary-fields {
      display: grid;
      gap: 0.35rem;
      margin: 0;
    }

    .summary-fields div {
      display: grid;
      gap: 0.25rem;
      grid-template-columns: minmax(8rem, 0.35fr) minmax(0, 1fr);
    }

    .summary-fields dt {
      color: var(--secondary-text-color);
      text-transform: capitalize;
    }

    .summary-fields dd {
      margin: 0;
      overflow-wrap: anywhere;
    }

    details summary {
      cursor: pointer;
      font-weight: 600;
    }

    details pre {
      background: var(--secondary-background-color);
      border-radius: var(--ha-card-border-radius, 0.5rem);
      max-block-size: 20rem;
      overflow: auto;
      padding: 0.75rem;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .dialog-backdrop {
      align-items: center;
      background: color-mix(in srgb, var(--primary-background-color) 45%, transparent);
      display: flex;
      inset: 0;
      justify-content: center;
      padding: 1rem;
      position: fixed;
      z-index: 10;
    }

    .dialog-card {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 0.75rem);
      box-shadow: var(--ha-card-box-shadow, 0 0.25rem 1rem rgb(0 0 0 / 0.25));
      max-inline-size: 32rem;
      padding: 1.25rem;
    }

    .dialog-card p {
      margin-block: 0.75rem 1rem;
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton {
        animation: none;
      }
    }

    @media (min-width: 37.501rem) and (max-width: 63.99rem) {
      .home-status-hero,
      .hero-explainers,
      .kpi-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .hero-copy {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 75rem) {
      .hero-explainers {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .kpi-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    @media (max-width: 37.5rem) {
      .workspace-nav {
        background: color-mix(in srgb, var(--ilc-surface-card, var(--card-background-color)) 94%, transparent);
        border: 1px solid var(--ilc-border-subtle, var(--divider-color));
        border-radius: var(--ilc-radius-lg, 1rem);
        box-shadow: var(--ilc-elevation-card, var(--ha-card-box-shadow, none));
        bottom: 0.5rem;
        display: grid;
        gap: 0.25rem;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        margin-block: 0 1rem;
        overflow: visible;
        padding: 0.375rem;
        position: sticky;
        z-index: 4;
      }

      .nav-button {
        border-color: transparent;
        flex-direction: column;
        font-size: 0.72rem;
        gap: 0.1875rem;
        min-block-size: 3rem;
        min-inline-size: 0;
        padding: 0.35rem 0.25rem;
      }

      .nav-button:last-child {
        display: none;
      }

      .load-meta {
        grid-template-columns: 1fr;
      }

      .home-status-hero {
        grid-template-columns: 1fr;
      }

      .hero-explainers,
      .kpi-grid,
      .energy-flow {
        grid-template-columns: 1fr;
      }

      .flow-link {
        justify-self: center;
        transform: rotate(90deg);
      }

      .summary-fields div {
        grid-template-columns: 1fr;
      }

      .form-actions > *,
      .override-actions > * {
        flex: 1 1 100%;
      }
    }
  `];
