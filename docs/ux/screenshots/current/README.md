# Current UI screenshot baseline

Captured from the local Vite/Playwright fixture harness on 2026-07-23.

These screenshots are evidence for Phase 0 current-state analysis only. They are not final visual-regression baselines for the redesigned UI and are not live HAOS screenshots.

## Matrix

| Page/state | Desktop light | Desktop dark | Mobile light | Mobile dark |
| --- | --- | --- | --- | --- |
| Overview | `overview-desktop-light.png` | `overview-desktop-dark.png` | `overview-mobile-light.png` | `overview-mobile-dark.png` |
| Plan | `plan-desktop-light.png` | `plan-desktop-dark.png` | `plan-mobile-light.png` | `plan-mobile-dark.png` |
| History/current Insights | `insights-current-history-desktop-light.png` | `insights-current-history-desktop-dark.png` | `insights-current-history-mobile-light.png` | `insights-current-history-mobile-dark.png` |
| Configuration/current Settings | `settings-current-configure-desktop-light.png` | `settings-current-configure-desktop-dark.png` | `settings-current-configure-mobile-light.png` | `settings-current-configure-mobile-dark.png` |
| Load detail/current controls | `load-detail-desktop-light.png` | `load-detail-desktop-dark.png` | `load-detail-mobile-light.png` | `load-detail-mobile-dark.png` |
| Empty loads | `empty-loads-desktop-light.png` | `empty-loads-desktop-dark.png` | `empty-loads-mobile-light.png` | `empty-loads-mobile-dark.png` |

## Capture caveats

- Data is simulated through `frontend/e2e/harness.ts`.
- Desktop viewport: 1280×800.
- Mobile viewport: 390×844.
- Theme styles were provided as Home Assistant-like CSS custom properties.
- The capture exposed current chart lifecycle warnings that should be fixed before redesigned visual baselines are approved.

