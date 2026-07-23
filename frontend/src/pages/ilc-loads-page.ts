import { html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";

import "../components/feedback/ilc-empty-state";
import "../components/loads/ilc-load-summary-card";
import {
  createLoadCataloguePresentation,
  LOAD_CATALOGUE_GROUPS,
  LOAD_CATALOGUE_SORTS,
  LOAD_CATALOGUE_STATUS_FILTERS,
  loadCatalogueGroupLabel,
  loadCatalogueSortLabel,
  loadCatalogueStatusFilterLabel,
  type LoadCatalogueGroup,
  type LoadCatalogueSort,
  type LoadCatalogueStatusFilter,
} from "../features/loads/load-catalogue";
import { translate } from "../i18n";
import type { LoadSummary } from "../models/dashboard";
import type { HomeAssistant } from "../types/home-assistant";

export class IlcLoadsPage extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public loads: readonly LoadSummary[] = [];
  @state() private query = "";
  @state() private sort: LoadCatalogueSort = "needs_attention";
  @state() private statusFilter: LoadCatalogueStatusFilter = "all";
  @state() private typeFilter = "all";
  @state() private group: LoadCatalogueGroup = "status";

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    const catalogue = createLoadCataloguePresentation(this.loads, {
      query: this.query,
      sort: this.sort,
      status: this.statusFilter,
      type: this.typeFilter,
      group: this.group,
    });

    return html`
      <section aria-labelledby="loads-catalogue-title">
        <div class="section-header">
          <div>
            <h2 id="loads-catalogue-title">${translate(this.hass, "load.catalogue")}</h2>
            <p class="secondary">${translate(this.hass, "load.catalogueHint")}</p>
          </div>
          <span class="secondary" aria-live="polite">
            ${translate(this.hass, "load.resultCount", {
              visible: catalogue.visibleCount,
              total: catalogue.totalCount,
            })}
          </span>
        </div>
        ${this.loads.length === 0
          ? html`
              <ilc-empty-state
                .heading=${translate(this.hass, "status.empty")}
                .message=${translate(this.hass, "status.emptyHint")}
              ></ilc-empty-state>
            `
          : html`
              ${this.renderControls(catalogue)}
              ${catalogue.visibleCount === 0
                ? html`
                    <ilc-empty-state
                      .heading=${translate(this.hass, "load.noMatches")}
                      .message=${translate(this.hass, "load.noMatchesHint")}
                    ></ilc-empty-state>
                  `
                : this.renderGroups(catalogue.groups)}
            `}
      </section>
    `;
  }

  private renderControls(catalogue: ReturnType<typeof createLoadCataloguePresentation>) {
    return html`
      <section class="panel-card load-catalogue-controls" aria-labelledby="load-catalogue-controls-title">
        <div>
          <h3 id="load-catalogue-controls-title">${translate(this.hass, "load.catalogueControls")}</h3>
          <p class="secondary">${translate(this.hass, "load.catalogueControlsHint")}</p>
        </div>
        <div class="form-grid" role="search">
          <label class="form-field" for="load-catalogue-search">
            ${translate(this.hass, "load.search")}
            <input
              id="load-catalogue-search"
              type="search"
              .value=${this.query}
              placeholder=${translate(this.hass, "load.searchPlaceholder")}
              autocomplete="off"
              @input=${this.updateQuery}
            />
          </label>
          <label class="form-field" for="load-catalogue-sort">
            ${translate(this.hass, "load.sort")}
            <select id="load-catalogue-sort" .value=${this.sort} @change=${this.updateSort}>
              ${LOAD_CATALOGUE_SORTS.map(
                (sort) => html`<option value=${sort}>${translate(this.hass, loadCatalogueSortLabel(sort))}</option>`,
              )}
            </select>
          </label>
          <label class="form-field" for="load-catalogue-status">
            ${translate(this.hass, "load.filter.status")}
            <select id="load-catalogue-status" .value=${this.statusFilter} @change=${this.updateStatusFilter}>
              ${LOAD_CATALOGUE_STATUS_FILTERS.map(
                (status) => html`
                  <option value=${status}>${translate(this.hass, loadCatalogueStatusFilterLabel(status))}</option>
                `,
              )}
            </select>
          </label>
          <label class="form-field" for="load-catalogue-type">
            ${translate(this.hass, "load.filter.type")}
            <select id="load-catalogue-type" .value=${this.typeFilter} @change=${this.updateTypeFilter}>
              <option value="all">${translate(this.hass, "load.filter.allTypes")}</option>
              ${catalogue.typeOptions.map(
                (option) => html`
                  <option value=${option.value}>
                    ${option.icon} ${translate(this.hass, option.labelKey)} (${option.count})
                  </option>
                `,
              )}
            </select>
          </label>
          <label class="form-field" for="load-catalogue-group">
            ${translate(this.hass, "load.groupBy")}
            <select id="load-catalogue-group" .value=${this.group} @change=${this.updateGroup}>
              ${LOAD_CATALOGUE_GROUPS.map(
                (group) => html`<option value=${group}>${translate(this.hass, loadCatalogueGroupLabel(group))}</option>`,
              )}
            </select>
          </label>
        </div>
      </section>
    `;
  }

  private renderGroups(groups: ReturnType<typeof createLoadCataloguePresentation>["groups"]) {
    return html`
      <div class="load-catalogue-groups">
        ${groups.map(
          (group, index) => html`
            <section class="load-catalogue-group" aria-labelledby=${`load-catalogue-group-${index}`}>
              <div class="load-catalogue-group-header">
                <h3 id=${`load-catalogue-group-${index}`}>
                  <span class="state-pill" data-tone=${group.tone}>
                    ${translate(this.hass, group.titleKey, group.titleValues)}
                  </span>
                </h3>
                <span class="secondary">
                  ${translate(this.hass, "load.groupCount", { count: group.loads.length })}
                </span>
              </div>
              <div class="load-grid">
                ${group.loads.map(
                  (load) => html`
                    <ilc-load-summary-card .hass=${this.hass} .load=${load}></ilc-load-summary-card>
                  `,
                )}
              </div>
            </section>
          `,
        )}
      </div>
    `;
  }

  private readonly updateQuery = (event: Event): void => {
    this.query = (event.currentTarget as HTMLInputElement).value;
  };

  private readonly updateSort = (event: Event): void => {
    this.sort = this.selectValue(event, LOAD_CATALOGUE_SORTS, "needs_attention");
  };

  private readonly updateStatusFilter = (event: Event): void => {
    this.statusFilter = this.selectValue(event, LOAD_CATALOGUE_STATUS_FILTERS, "all");
  };

  private readonly updateTypeFilter = (event: Event): void => {
    this.typeFilter = (event.currentTarget as HTMLSelectElement).value;
  };

  private readonly updateGroup = (event: Event): void => {
    this.group = this.selectValue(event, LOAD_CATALOGUE_GROUPS, "status");
  };

  private selectValue<TValue extends string>(
    event: Event,
    allowed: readonly TValue[],
    fallback: TValue,
  ): TValue {
    const value = (event.currentTarget as HTMLSelectElement).value;
    return allowed.includes(value as TValue) ? (value as TValue) : fallback;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-loads-page": IlcLoadsPage;
  }
}

if (!customElements.get("ilc-loads-page")) {
  customElements.define("ilc-loads-page", IlcLoadsPage);
}
