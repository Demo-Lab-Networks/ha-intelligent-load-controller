# Frontend pages

Phase 1 starts moving route-level presentation out of the root panel.

Page components should:

- render one route-level view;
- receive already-authoritative backend/API data as properties;
- dispatch user intent events instead of calling Home Assistant or mutating controller policy directly;
- keep raw diagnostic payloads out of ordinary operation pages;
- avoid owning cross-route state.

The root panel still orchestrates data loading and mutations during the Phase 1 migration. Later phases should move feature state into `frontend/src/state/` and type-specific view logic into `frontend/src/features/`.
