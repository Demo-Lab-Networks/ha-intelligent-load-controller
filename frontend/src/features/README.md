# Frontend features

Feature modules hold route-specific presentation modelling that is too involved for a page template but must not become backend authority.

Rules:

- consume typed API/model data only;
- do not call Home Assistant or WebSocket APIs directly;
- do not calculate safety, allocation, optimisation, or actuator eligibility;
- prefer stable backend fields and reason codes over parsing English text;
- keep functions deterministic and unit-tested.

Current feature modules:

- `overview/` maps site/load summaries and daily timeline intervals into Overview presentation state.
- `loads/` maps backend load summaries into type-aware card presentation state and safe navigation/action labels.
