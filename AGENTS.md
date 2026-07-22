# Agent and Contributor Operating Rules

1. Read the product specification, relevant ADRs, traceability matrix, and existing instructions before changing code.
2. Preserve local operation. Never use production Home Assistant entities, credentials, recordings, or live electrical loads in tests.
3. Never weaken safety, remove tests, silence warnings, or lower type checks to obtain a pass.
4. Keep policy pure: no Home Assistant imports, direct wall-clock calls, I/O, or mutation in the controller engine. Inject time.
5. Keep adapters at the Home Assistant/device boundary and the site arbitrator as final automatic-action authority.
6. Preview is read-only and non-actuating. Startup, reload, migration, diagnostics, and panel loading must not switch outputs blindly.
7. Preserve schema/store migrations, absolute override expiry, DST policy, bounded recovery state, and stable entity/statistic identifiers.
8. Add appropriate backend, integration, frontend, E2E, simulation, and accessibility tests for every behavioural change.
9. Use stable reason codes; localise visible strings and do not parse backend English text in the frontend.
10. Maintain keyboard/screen-reader/reduced-motion/theme behaviour for visible changes.
11. Record material decisions in ADRs; review licences and supply-chain impact before adding dependencies.
12. Update traceability, docs, diagnostics/redaction, and release evidence continuously.
13. Use focused commits and avoid unrelated edits or destructive Git operations.
14. Do not claim completion, PASS, or a phase exit without recorded evidence for every linked gate.
