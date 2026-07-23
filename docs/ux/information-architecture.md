# Information architecture contract

**Status:** Phase 0 target IA for the frontend redesign.  
**Implementation starts:** Phase 1 application shell.

## Top-level routes

| Route | Destination | Purpose | Primary questions answered |
| --- | --- | --- | --- |
| `/intelligent-load-controller` | Overview | Everyday operational dashboard. | What is happening now? Is anything wrong? What happens next? Why? |
| `/intelligent-load-controller/loads` | Loads | Searchable/sortable catalogue of controlled loads. | Which loads exist? Which need attention? Which are active or upcoming? |
| `/intelligent-load-controller/loads/:loadId` | Load detail | Type-specific operational dashboard and controls. | What is this load doing now/next/why? What safe action can I take? |
| `/intelligent-load-controller/plan` | Plan | Visual planning workspace. | When will each load run, under which tariff/source, and why? |
| `/intelligent-load-controller/insights` | Insights | History, performance, and activity feed. | What happened, what did it cost, were targets met, and where did energy come from? |
| `/intelligent-load-controller/settings` | Settings | Guided site/load configuration. | How do I set up or change behaviour safely? |
| `/intelligent-load-controller/diagnostics` | Diagnostics | Admin/developer diagnostics, raw payloads, export, health. | What technical data helps support or debugging? |

## Navigation rules

- The router is the source of truth. Buttons, mobile nav, breadcrumbs, and browser back/forward all update the same route model.
- Navigation items contain icon and text. Actions such as Boost, Replan, Save, Delete, and Export are never navigation destinations.
- Desktop/wide tablet uses a compact top navigation or app rail inside the panel content area. It must not duplicate Home Assistant’s sidebar.
- Narrow/mobile uses a stable bottom navigation for Overview, Loads, Plan, Insights, and Settings. Diagnostics stays behind an admin/contextual entry.
- Load detail shows a breadcrumb/back affordance to Loads or the originating route.
- Missing/deleted/inaccessible load routes render a missing-load page with recovery actions rather than redirecting silently or showing blank content.
- Selected site remains visible in the page header and site selector; multiple-site future support should not require redesigning the route model.

## Page hierarchy

```text
App shell
├── Site context/header
├── Primary navigation
├── Notification/attention centre
└── Routed page outlet
    ├── Overview
    │   ├── Home Status hero
    │   ├── Live energy flow
    │   ├── Attention and opportunities
    │   ├── Today summary
    │   ├── Active/upcoming loads
    │   └── Compressed today timeline
    ├── Loads
    │   ├── Search/sort/filter controls
    │   ├── Grouped load catalogue
    │   └── Load cards
    ├── Load detail
    │   ├── Identity/state/actions
    │   ├── Now / Next / Why
    │   ├── Type-specific status
    │   ├── Timeline/source/cost/learning/events
    │   └── Configuration shortcut
    ├── Plan
    │   ├── Date controls and plan narrative
    │   ├── Timeline workspace
    │   └── Accessible details table
    ├── Insights
    │   ├── Range controls
    │   ├── Designed summaries and charts
    │   └── Activity feed
    ├── Settings
    │   ├── Site setup sections
    │   ├── Load wizard
    │   ├── Schedule editor
    │   └── Review/preview/conflict handling
    └── Diagnostics
        ├── Health
        ├── Redacted raw payloads
        ├── Export
        └── Developer troubleshooting
```

