# User journeys

**Status:** Phase 0 journey contract.  
**Audience:** Home Assistant users configuring and operating local flexible-load control.

## Everyday check: “Is everything okay?”

1. User opens Load Control from the HA sidebar.
2. Overview hero states the current site condition, control mode, target status, next action, and reason.
3. Attention feed is absent if no action is needed; otherwise it shows ranked items with plain-language guidance.
4. Active/upcoming loads show what is running now and what will start soon.
5. User can open a load or plan detail without losing site context.

Success measure: within five seconds the user can answer import/export, active loads, target risk, attention, next action, reason, and safe quick action.

## Investigate a surprising load

1. User sees a load running or waiting unexpectedly.
2. They open the load detail from Overview or Loads.
3. The page shows Now / Next / Why using backend-authoritative reason and next-action fields.
4. Type-specific fields explain what matters for that load: HWS runtime/guarantee, EV SOC/departure, battery permitted windows, generic configured target.
5. User can Boost, clear override, change Automatic, or jump to configuration if appropriate.

Success measure: the explanation is comprehensible without reading event IDs or raw planner payloads.

## See future operation

1. User opens Plan.
2. The page shows date controls, plan generated time, data-quality/forecast notes, and a short narrative.
3. The visual timeline shows load rows, planned/actual/manual/blocked segments, tariff/free/solar bands, current time, and deadlines.
4. Warnings link to affected loads.
5. A table/text alternative remains available.

Success measure: the user understands planned future behaviour before reading a table.

## Configure a new HWS or EV

1. User opens Settings and selects Add load.
2. Wizard asks for identity/type, actuator, feedback, target, strategy, schedule/deadline, safety, Boost, learning, and review.
3. Each step shows current entity state/freshness where available and validates inline using backend schema.
4. Preview is labelled non-actuating and shows estimated plan/risks before save.
5. Save uses `if_revision` and handles conflicts without silent overwrite.

Success measure: no YAML is required; the user understands assumptions and consequences.

## Recover from a fault

1. Attention feed shows a ranked hard fault, stale data, actuator failure, or impossible target.
2. The item includes severity, explanation, affected load/site, and next action.
3. The relevant page shows fault details, last valid data time, and available repairs/diagnostics.
4. Raw payloads are available only in Diagnostics.

Success measure: the user sees what is wrong and whether automatic control is still safe.

## Mobile quick action

1. User opens Load Control on a phone.
2. Bottom navigation exposes Overview, Loads, Plan, Insights, Settings.
3. Main values and actions remain 44px touch-friendly with no horizontal overflow.
4. Boost/override feedback is immediate and expiry is visible.

Success measure: everyday checks and safe actions are usable at 320px width.

