# Third-Party Notices

**Status:** Pre-release direct-dependency inventory  
**Reviewed:** 2026-07-22  
**Lock source:** [`frontend/package-lock.json`](frontend/package-lock.json) (lockfile version 3)

This notice inventory records the direct frontend packages presently locked for
the project. The frontend is bundled locally; these packages are not loaded
from a runtime CDN. The licences below are the SPDX identifiers declared in the
locked package metadata. This is not yet a complete transitive-dependency SBOM,
redistribution notice package, security assessment, or public-release approval.

| Component | Locked version | Licence | Source | Use |
| --- | --- | --- | --- | --- |
| [Lit](https://github.com/lit/lit) | 3.3.3 | [BSD-3-Clause](https://spdx.org/licenses/BSD-3-Clause.html) | [locked npm archive](https://registry.npmjs.org/lit/-/lit-3.3.3.tgz) | Locally bundled panel components |
| [Apache ECharts](https://github.com/apache/echarts) | 6.1.0 | [Apache-2.0](https://spdx.org/licenses/Apache-2.0.html) | [locked npm archive](https://registry.npmjs.org/echarts/-/echarts-6.1.0.tgz) | Locally bundled charts and timeline |
| [Vite](https://github.com/vitejs/vite) | 8.1.5 | [MIT](https://spdx.org/licenses/MIT.html) | [locked npm archive](https://registry.npmjs.org/vite/-/vite-8.1.5.tgz) | Development/build tool only |
| [TypeScript](https://github.com/microsoft/TypeScript) | 7.0.2 | [Apache-2.0](https://spdx.org/licenses/Apache-2.0.html) | [locked npm archive](https://registry.npmjs.org/typescript/-/typescript-7.0.2.tgz) | Development type-checking/build only |
| [Vitest](https://github.com/vitest-dev/vitest) | 4.1.10 | [MIT](https://spdx.org/licenses/MIT.html) | [locked npm archive](https://registry.npmjs.org/vitest/-/vitest-4.1.10.tgz) | Frontend unit tests only |
| [Playwright](https://github.com/microsoft/playwright) (`@playwright/test`) | 1.61.1 | [Apache-2.0](https://spdx.org/licenses/Apache-2.0.html) | [locked npm archive](https://registry.npmjs.org/@playwright/test/-/test-1.61.1.tgz) | End-to-end/accessibility test runner only |
| [axe Playwright](https://github.com/dequelabs/axe-core-npm) (`@axe-core/playwright`) | 4.12.1 | [MPL-2.0](https://spdx.org/licenses/MPL-2.0.html) | [locked npm archive](https://registry.npmjs.org/@axe-core/playwright/-/playwright-4.12.1.tgz) | Accessibility assertions only |

The direct declarations in [`frontend/package.json`](frontend/package.json)
match these locked versions. The lockfile records the archive URL and integrity
hash for each package. Before a public release, maintainers must generate and
review a complete transitive inventory/SBOM, preserve any required notices or
licence texts, assess vulnerability advisories, and record the results as
release evidence. See [`docs/DEPENDENCY_REVIEW.md`](docs/DEPENDENCY_REVIEW.md)
for the current review boundary and outstanding work.
