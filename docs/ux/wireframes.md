# Phase 0 wireframes

**Status:** Low-fidelity IA and layout sketches.  
**Prototype:** See `docs/ux/prototypes/phase-1-shell.html`.

## Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Load Control · Home                              Fresh 12s ago · Healthy    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Overview  Loads  Plan  Insights  Settings                         Replan    │
├─────────────────────────────────────────────────────────────────────────────┤
│ ┌ Home Status ───────────────────────────────┐ ┌ Attention ───────────────┐ │
│ │ Using excess solar                         │ │ HWS target at risk       │ │
│ │ Hot Water using 3.6 kW. All targets ok.    │ │ Explain · Open load      │ │
│ │ Next: EV charge at 11:00, free period.     │ └──────────────────────────┘ │
│ │ Why: free grid before departure. Explain   │ ┌ Today summary ──────────┐ │
│ └────────────────────────────────────────────┘ │ 8.4 kWh · $0.42 · 2/3    │ │
│ ┌ Live energy flow ──────────────────────────┐ └──────────────────────────┘ │
│ │ Solar → Home / Controlled loads / Export   │                              │
│ │ Grid import/export shown as direction      │                              │
│ └────────────────────────────────────────────┘                              │
│ ┌ Active and upcoming loads ───────────────────────────────────────────────┐ │
│ │ Running now | Starting soon | Waiting | Complete | Needs attention        │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
│ ┌ Today timeline: tariff · solar/export · planned/actual load rows ───────┐ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

Mobile:

```text
┌──────────────────────────────┐
│ Load Control · Home          │
│ Using excess solar           │
│ Next: EV at 11:00 · Explain  │
├──────────────────────────────┤
│ Live energy flow             │
├──────────────────────────────┤
│ Attention / opportunities    │
├──────────────────────────────┤
│ Running now                  │
├──────────────────────────────┤
│ Today timeline               │
├──────────────────────────────┤
│ Overview Loads Plan Insights Settings │
└──────────────────────────────┘
```

## Loads

```text
Header: Loads · 8 configured · 1 needs attention
Search | Sort: Needs attention | Filter: All types

Needs attention
  [EV Charger] Target at risk · 42% → 80% by 06:30 · Open

Running now
  [Hot Water] Heating from solar · 3.6 kW · Ready by 05:30 · Boost

Waiting
  [Pool Pump] Waiting for free period · Starts 11:00 · Run now
```

## Load detail

```text
Back to Loads · Hot Water · Automatic on
Now: Heating from excess solar · 3.6 kW
Next: Hold until target runtime complete · 42 min remaining
Why: Solar export has qualified and morning guarantee remains on track

Actions: Boost 30m / 1h / Custom · Clear override · Configure

Target progress | Today timeline | Source split | Cost | Learning | Events
```

## Plan

```text
Plan · Today · Generated 10:42 · Replan
Narrative: Hot Water completes during free-energy window; EV waits for lowest tariff before departure.

Tariff band: paid | free | paid
Solar/export band
Load rows:
  Hot Water    planned ███ actual ██ deadline |
  EV Charger   blocked ░ planned █████ departure |
  Pool Pump    manual ██

Warnings link to affected load.
Accessible table alternative below/accordion.
```

## Insights

```text
Insights · Day / Week / Month · Date range
Key answers:
  Controlled energy · Cost · Source contribution · Targets met · Manual interventions

Charts:
  Runtime by load
  Source split
  Target performance

Activity feed:
  10:42 Hot Water started · Solar export qualified · Open
  09:15 EV target at risk · Forecast unavailable · Open
```

## Settings

```text
Settings
Site setup
  Identity · Grid and solar · Tariffs · Limits · Notifications · Advanced planning
Loads
  Add load wizard · Edit · Duplicate · Delete

Wizard:
Identity → Actuator → Feedback → Target → Strategy → Schedule → Safety → Boost → Learning → Review
Preview panel: read-only, non-actuating, conflicts and plan estimate.
```

