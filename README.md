# Intelligent Load Controller

Intelligent Load Controller is a local Home Assistant integration for coordinating flexible electrical loads as one site-level system. Its deterministic planner, authoritative site arbitrator, Home Assistant backend, and bundled sidebar panel schedule HWS, generic loads, EV charging, and generic battery charging while preferring valid lower-cost energy periods.

## Project status

**Development alpha; simulated environments only.** The repository contains the architecture baseline and an implemented/tested development integration, but it is not a public HACS release or approved for live electrical control. Do not use it to control live electrical equipment.

The compatibility floor is Home Assistant Core 2025.4.0. The integration uses UI-first configuration, config subentries, and a bundled `/intelligent-load-controller` sidebar panel. It is local-only and does not require YAML or a manual Lovelace resource for normal use.

See [implementation status](docs/IMPLEMENTATION_STATUS.md) for verified development evidence and the remaining release blockers.

## Safety

This software is not electrical protection. Any controlled circuit needs appropriately rated switching equipment; appliance thermostats and safety protection must remain operational. Electrical work must comply with local requirements and be performed by licensed electricians where required. The project does not provide wiring instructions.

## Architecture baseline

- [Product specification](docs/PRODUCT_SPECIFICATION.md)
- [Control model](docs/CONTROL_MODEL.md)
- [Frontend and UX specification](docs/FRONTEND_UX_SPECIFICATION.md)
- [Test plan](docs/TEST_PLAN.md)
- [Traceability matrix](docs/TRACEABILITY_MATRIX.md)
- [Roadmap](docs/ROADMAP.md)
- [Architecture decisions](docs/architecture/adr)
- [Dependency review](docs/DEPENDENCY_REVIEW.md)
- [External prerequisites](docs/EXTERNAL_PREREQUISITES.md)

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md), [AGENTS.md](AGENTS.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), and [SECURITY.md](SECURITY.md) before contributing. Every behavioural change needs tests, localisation/accessibility consideration where visible, and traceability updates.

## Licence

Apache-2.0. See [LICENSE](LICENSE).
