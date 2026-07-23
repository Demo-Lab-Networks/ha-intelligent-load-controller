# Intelligent Load Controller design system

**Status:** Phase 0 design contract; implementation begins in Phase 1.  
**Principle:** Original, restrained, theme-aware energy-control interface. No proprietary visual copying.

## Token families

| Family | Token examples | Mapping rule |
| --- | --- | --- |
| Spacing | `--ilc-space-1` through `--ilc-space-8` | 4px base scale; map to `rem` values to respect browser zoom. |
| Typography | `--ilc-font-size-title`, `--ilc-font-size-value`, `--ilc-line-height-body` | Use HA/body font where present; keep primary values large and secondary metadata quiet. |
| Surface | `--ilc-surface-base`, `--ilc-surface-panel`, `--ilc-surface-raised`, `--ilc-surface-subtle` | Map to HA background/card/secondary variables; avoid hardcoded light/dark surfaces. |
| Border/radius | `--ilc-border-subtle`, `--ilc-radius-card`, `--ilc-radius-pill` | Map to HA divider/card radius where possible. |
| Elevation | `--ilc-shadow-raised`, `--ilc-shadow-overlay` | Use sparingly; hierarchy should mostly come from spacing, type, and grouping. |
| Motion | `--ilc-duration-fast`, `--ilc-duration-normal`, `--ilc-ease-standard` | Disable nonessential animation under `prefers-reduced-motion`. |
| Focus | `--ilc-focus-ring`, `--ilc-focus-offset` | Always visible and contrast-safe. |
| Status | `--ilc-status-ok`, `warning`, `critical`, `info`, `manual`, `disabled` | Colour plus icon/text; never colour-only. |
| Energy source | `--ilc-energy-solar`, `grid-import`, `grid-export`, `controlled`, `battery`, `free`, `paid` | Semantically stable across all charts and flows; final colours require contrast/colour-blind review. |
| Load type | `--ilc-load-hws`, `ev`, `battery`, `generic` | Use as accents only; avoid conflicting with status severity. |
| Data quality | `measured`, `derived`, `estimated`, `learned`, `stale`, `unknown` | Display with text labels or chips, not only chart opacity. |
| Timeline states | `planned`, `actual`, `manual`, `blocked`, `deadline`, `current-time` | Consistent legend and textual alternative required. |

## Proposed token defaults

```css
:host {
  --ilc-space-1: 0.25rem;
  --ilc-space-2: 0.5rem;
  --ilc-space-3: 0.75rem;
  --ilc-space-4: 1rem;
  --ilc-space-5: 1.5rem;
  --ilc-space-6: 2rem;
  --ilc-radius-card: var(--ha-card-border-radius, 0.875rem);
  --ilc-radius-pill: 999px;
  --ilc-surface-base: var(--primary-background-color);
  --ilc-surface-panel: var(--card-background-color);
  --ilc-surface-subtle: var(--secondary-background-color);
  --ilc-text-primary: var(--primary-text-color);
  --ilc-text-secondary: var(--secondary-text-color);
  --ilc-border-subtle: var(--divider-color);
  --ilc-status-critical: var(--error-color);
  --ilc-status-warning: var(--warning-color, #b7791f);
  --ilc-status-ok: var(--success-color, #15803d);
  --ilc-status-info: var(--info-color, var(--primary-color));
  --ilc-energy-solar: #d99a00;
  --ilc-energy-grid-import: #64748b;
  --ilc-energy-grid-export: #38bdf8;
  --ilc-energy-controlled: var(--primary-color);
  --ilc-energy-battery: #16a34a;
}
```

Colour values above are starting points only. Phase 1/2 must validate them in light, dark, high-contrast, and colour-blind review before treating them as final.

## Component primitives

| Primitive | Purpose | Accessibility rule |
| --- | --- | --- |
| App shell | Site context, route outlet, responsive navigation. | One `main`, semantic page heading, skip-friendly focus order. |
| Page header | Title, site, freshness, primary page action. | Actions have labels and are not hidden in nav. |
| Status pill | Compact status/data-quality display. | Includes text and optional icon; no colour-only meaning. |
| Alert/attention item | Backend-ranked issue/opportunity. | Severity, affected object, explanation, destination/action. |
| Metric cluster | Small set of meaningful KPIs. | Avoid walls of equal cards; expose units and quality. |
| Energy flow | Node/edge current-power view. | Textual summary and reduced-motion support. |
| Timeline row | Planned/actual/manual/blocked operation. | Keyboard-readable table/text alternative. |
| Boost control | Intentional override action. | Clear duration, expiry, effect, pending/success/error feedback. |
| Wizard step | Guided configuration. | Step label, validation association, unsaved guard, review. |

## Layout breakpoints

| Width | Navigation | Layout |
| --- | --- | --- |
| 320–599 | Bottom navigation, one-column cards, compact hero. | No horizontal overflow; primary action near content. |
| 600–1023 | Top nav or compact rail, two-column where useful. | Load catalogue may use grouped list. |
| 1024+ | Top nav/app rail, supporting panes for attention/detail. | Overview can use hero + flow + attention/timeline composition. |

## Copy and tone

- Prefer “Using excess solar”, “Target at risk”, “Waiting for free period”, “Automatic control is off” over raw state names.
- Backend reason codes remain stable; frontend localises reason codes and renders backend-provided presentation fields.
- Avoid vague copy such as “Something went wrong”. Explain missing site, missing load, stale data, permission denied, and action conflict specifically.

