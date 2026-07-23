import { html, LitElement, nothing, type PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";

import "../app/ilc-app-shell";
import "../app/ilc-navigation";
import "../components/feedback/ilc-alert";
import "../components/feedback/ilc-empty-state";
import "../components/plans/ilc-plan-interval-table";
import "../pages/ilc-diagnostics-page";
import "../pages/ilc-insights-page";
import "../pages/ilc-loads-page";
import "../pages/ilc-overview-page";
import "../pages/ilc-plan-page";
import {
  normaliseBasePath,
  parseIlcRoute,
  routePathForState,
  type IlcWorkspaceView,
} from "../app/ilc-router";
import {
  LoadControlApi,
  LoadControlApiError,
  type ConfigurationPreviewResponse,
  type ConfigurationReadResponse,
  type CurrentPlanResponse,
  type DailyTimelineResponse,
  type EventJournalEntry,
  type HistoricalSummaryResponse,
  type SiteSummaryResponse,
  type ValidationIssue,
} from "../api/load-control-api";
import { translate } from "../i18n";
import { localizeReasonCode } from "../i18n/reasons";
import type { DashboardData, JsonObject, JsonValue, LoadSummary } from "../models/dashboard";
import type {
  HomeAssistant,
  HomeAssistantUnsubscribe,
  PanelInfo,
  PanelRoute,
} from "../types/home-assistant";
import { panelStyles } from "../styles/panel";

type ViewState = "loading" | "reconnecting" | "error" | "no_sites" | "select_site" | "empty" | "ready";
type ChartComponentState = "loading" | "ready" | "failed";
type SiteChoice = SiteSummaryResponse & { entry_id: string };
type WorkspaceView = IlcWorkspaceView;
type EditableConfig = Record<string, JsonValue>;

interface DeleteConfirmation {
  loadId: string;
  displayName: string;
  ifRevision: number;
}

export class IntelligentLoadControllerPanel extends LitElement {
  public static override styles = panelStyles;

  /** Home Assistant injects this property when it instantiates the panel. */
  @property({ attribute: false }) public hass?: HomeAssistant;

  /** Home Assistant injects the current layout width mode for custom panels. */
  @property({ attribute: false }) public narrow?: boolean;

  /** Home Assistant injects custom-panel metadata and config. */
  @property({ attribute: false }) public panel?: PanelInfo;

  /** Home Assistant injects this property whenever panel routing changes. */
  @property({ attribute: false }) public route?: PanelRoute;

  @state() private viewState: ViewState = "loading";
  @state() private dashboard?: DashboardData;
  @state() private errorMessage?: string;
  @state() private refreshing = false;
  @state() private availableSites: readonly SiteChoice[] = [];
  @state() private selectedEntryId?: string;
  @state() private workspaceView: WorkspaceView = "dashboard";
  @state() private selectedLoadId?: string;
  @state() private configuration?: ConfigurationReadResponse;
  @state() private siteDraft?: EditableConfig;
  @state() private loadDraft?: EditableConfig;
  @state() private editingLoadId?: string;
  @state() private currentPlan?: CurrentPlanResponse | null;
  @state() private dailyTimeline?: DailyTimelineResponse;
  @state() private history?: HistoricalSummaryResponse;
  @state() private events?: readonly EventJournalEntry[];
  @state() private loadDetail?: JsonObject;
  @state() private diagnostics?: JsonObject;
  @state() private sectionLoading?: WorkspaceView;
  @state() private actionMessage?: string;
  @state() private actionError?: string;
  @state() private actionErrorCode?: string;
  @state() private configurationIssues: readonly ValidationIssue[] = [];
  @state() private configurationPreview?: ConfigurationPreviewResponse;
  @state() private deleteConfirmation?: DeleteConfirmation;
  @state() private overrideDurationMinutes = 30;
  @state() private chartComponentState: ChartComponentState = customElements.get("ilc-site-snapshot-chart")
    ? "ready"
    : "loading";

  @query(".dialog-card .danger-button") private deleteConfirmationButton?: HTMLButtonElement;

  private requestSequence = 0;
  private hasLoaded = false;
  private wasConnected = false;
  private subscribedEntryId?: string;
  private subscriptionGeneration = 0;
  private subscriptionRefreshPending = false;
  private updateUnsubscribe?: HomeAssistantUnsubscribe;
  private deleteDialogTrigger?: HTMLElement;
  private chartComponentLoad?: Promise<void>;
  private readonly onNetworkChange = (): void => {
    if (this.isWebsocketConnected()) {
      void this.refresh();
    } else {
      this.unsubscribeUpdates();
      this.viewState = "reconnecting";
    }
  };
  private readonly onPopState = (): void => {
    this.syncRoute(window.location.pathname);
  };

  public override connectedCallback(): void {
    super.connectedCallback();
    this.loadChartComponent();
    window.addEventListener("online", this.onNetworkChange);
    window.addEventListener("offline", this.onNetworkChange);
    window.addEventListener("popstate", this.onPopState);
  }

  public override disconnectedCallback(): void {
    this.unsubscribeUpdates();
    window.removeEventListener("online", this.onNetworkChange);
    window.removeEventListener("offline", this.onNetworkChange);
    window.removeEventListener("popstate", this.onPopState);
    super.disconnectedCallback();
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    const connected = this.isWebsocketConnected();
    const routeChanged = changedProperties.has("route");

    if (routeChanged) {
      this.syncRoute();
    }

    if (!this.hass) {
      this.unsubscribeUpdates();
      this.dashboard = undefined;
      this.errorMessage = undefined;
      this.availableSites = [];
      this.selectedEntryId = undefined;
      this.resetWorkspaceData();
      this.viewState = "loading";
      this.hasLoaded = false;
      this.wasConnected = false;
      return;
    }

    if (!connected) {
      this.unsubscribeUpdates();
      this.viewState = "reconnecting";
      this.wasConnected = false;
      return;
    }

    if ((!this.hasLoaded || !this.wasConnected || routeChanged) && !this.refreshing) {
      queueMicrotask(() => void this.refresh());
    }
    this.wasConnected = true;
  }

  public async refresh(): Promise<void> {
    const hass = this.hass;
    if (!hass) {
      return;
    }
    if (!this.isWebsocketConnected()) {
      this.unsubscribeUpdates();
      this.viewState = "reconnecting";
      return;
    }

    const sequence = ++this.requestSequence;
    this.refreshing = true;
    this.errorMessage = undefined;
    if (!this.dashboard) {
      this.viewState = "loading";
    }

    try {
      const api = new LoadControlApi(hass);
      let entryId = this.selectedEntryId;
      if (!entryId) {
        const sites = await api.getSites();
        if (sequence !== this.requestSequence) {
          return;
        }
        this.availableSites = sites.filter(isSelectableSite);
        if (this.availableSites.length === 0) {
          this.unsubscribeUpdates();
          this.dashboard = undefined;
          this.viewState = "no_sites";
          this.hasLoaded = true;
          return;
        }
        if (this.availableSites.length > 1) {
          this.selectedEntryId = this.availableSites[0]?.entry_id;
          this.dashboard = undefined;
          this.viewState = "select_site";
          this.hasLoaded = true;
          return;
        }
        entryId = this.availableSites[0]?.entry_id;
        this.selectedEntryId = entryId;
      }
      if (!entryId) {
        this.unsubscribeUpdates();
        this.viewState = "no_sites";
        this.hasLoaded = true;
        return;
      }

      const dashboard = await api.getDashboard(entryId);
      if (sequence !== this.requestSequence) {
        return;
      }
      this.dashboard = dashboard;
      this.viewState = dashboard.loads.length === 0 ? "empty" : "ready";
      this.hasLoaded = true;
      void this.ensureUpdateSubscription(entryId);
      if (this.workspaceView !== "dashboard") {
        void this.ensureWorkspaceData(this.workspaceView);
      }
    } catch (error) {
      if (sequence !== this.requestSequence) {
        return;
      }
      this.errorMessage = error instanceof Error ? error.message : undefined;
      this.viewState = "error";
      this.hasLoaded = true;
    } finally {
      if (sequence === this.requestSequence) {
        this.refreshing = false;
        if (this.subscriptionRefreshPending) {
          void this.flushSubscriptionRefresh();
        }
      }
    }
  }

  protected override render() {
    return html`
      <ilc-app-shell
        .hass=${this.hass}
        .pageTitle=${this.pageTitle()}
        .subtitle=${this.dashboard?.site.name ?? translate(this.hass, "app.title")}
        .refreshing=${this.refreshing}
        .connected=${this.isWebsocketConnected()}
        .busy=${this.refreshing || this.viewState === "loading"}
        @ilc-refresh=${() => void this.refresh()}
      >
        ${this.renderBody()}
      </ilc-app-shell>
    `;
  }

  private renderBody() {
    switch (this.viewState) {
      case "loading":
        return this.renderLoading();
      case "reconnecting":
        return this.renderReconnecting();
      case "error":
        return this.renderError();
      case "no_sites":
        return this.renderNoSites();
      case "select_site":
        return this.renderSiteSelector();
      case "empty":
      case "ready":
        return this.dashboard ? this.renderWorkspace(this.dashboard) : this.renderLoading();
    }
  }

  private renderWorkspace(dashboard: DashboardData) {
    return html`
      <ilc-navigation
        slot="navigation"
        .hass=${this.hass}
        .activeView=${this.workspaceView}
        .disabled=${this.refreshing}
        @ilc-navigate=${this.handleNavigation}
      ></ilc-navigation>
      ${this.renderActionStatus()}
      ${this.sectionLoading === this.workspaceView ? this.renderSectionLoading() : nothing}
      ${this.workspaceView === "dashboard"
        ? html`
            <ilc-overview-page
              .hass=${this.hass}
              .dashboard=${dashboard}
              .chartComponentState=${this.chartComponentState}
              @ilc-open-load=${this.handleOpenLoad}
              @ilc-edit-load=${this.handleEditLoad}
            ></ilc-overview-page>
          `
        : this.workspaceView === "loads"
          ? html`
              <ilc-loads-page
                .hass=${this.hass}
                .loads=${dashboard.loads}
                @ilc-open-load=${this.handleOpenLoad}
                @ilc-edit-load=${this.handleEditLoad}
              ></ilc-loads-page>
            `
        : this.workspaceView === "plan"
          ? html`
              <ilc-plan-page
                .hass=${this.hass}
                .plan=${this.currentPlan}
                .timeline=${this.dailyTimeline}
                @ilc-replan=${() => void this.replan()}
              ></ilc-plan-page>
            `
          : this.workspaceView === "history"
            ? html`
                <ilc-insights-page
                  .hass=${this.hass}
                  .history=${this.history}
                  .events=${this.events ?? []}
                ></ilc-insights-page>
              `
            : this.workspaceView === "configure"
              ? this.renderConfiguration()
              : this.workspaceView === "diagnostics"
                ? html`<ilc-diagnostics-page .hass=${this.hass} .diagnostics=${this.diagnostics}></ilc-diagnostics-page>`
              : this.renderLoadControls(dashboard)}
      ${this.renderDeleteConfirmation()}
    `;
  }

  private renderActionStatus() {
    if (!this.actionMessage && !this.actionError) {
      return nothing;
    }
    return html`
      <section
        class="status-banner action-status"
        data-state=${this.actionError ? "error" : "success"}
        aria-live="polite"
      >
        <p>${this.actionError ?? this.actionMessage}</p>
        ${this.actionError && this.isConflictError()
          ? html`
              <button class="secondary-button" type="button" @click=${() => void this.reloadConfiguration()}>
                ${translate(this.hass, "status.reloadLatest")}
              </button>
            `
          : nothing}
      </section>
    `;
  }

  private renderSectionLoading() {
    return html`<ilc-alert .message=${translate(this.hass, "status.loadingSection")}></ilc-alert>`;
  }

  private renderLoading() {
    return html`
      <section aria-live="polite" aria-label=${translate(this.hass, "status.loading")}>
        <p class="secondary">${translate(this.hass, "status.loading")}</p>
        <div class="skeleton-grid" aria-hidden="true">
          <div class="skeleton"></div>
          <div class="skeleton"></div>
          <div class="skeleton"></div>
          <div class="skeleton"></div>
        </div>
      </section>
    `;
  }

  private renderReconnecting() {
    return html`
      <ilc-alert
        tone="reconnecting"
        live="assertive"
        .heading=${translate(this.hass, "status.reconnecting")}
        .message=${translate(this.hass, "status.connectionHint")}
      ></ilc-alert>
    `;
  }

  private renderError() {
    return html`
      <section class="status-banner" data-state="error" aria-live="assertive">
        <div>
          <h2>${translate(this.hass, "status.error")}</h2>
          ${this.errorMessage ? html`<p class="secondary">${this.errorMessage}</p>` : nothing}
        </div>
        <button class="retry-button" type="button" @click=${() => void this.refresh()}>
          ${translate(this.hass, "status.retry")}
        </button>
      </section>
    `;
  }

  private renderNoSites() {
    return html`
      <ilc-empty-state
        .heading=${translate(this.hass, "status.noSites")}
        .message=${translate(this.hass, "status.noSitesHint")}
      ></ilc-empty-state>
    `;
  }

  private renderSiteSelector() {
    return html`
      <section class="panel-card empty-state" aria-live="polite">
        <div class="site-selector">
          <div>
            <h2>${translate(this.hass, "status.selectSite")}</h2>
            <p class="secondary">${translate(this.hass, "status.selectSiteHint")}</p>
          </div>
          <label>
            ${translate(this.hass, "status.siteLabel")}
            <select .value=${this.selectedEntryId ?? ""} @change=${this.handleSiteChange}>
              ${this.availableSites.map(
                (site) => html`<option value=${site.entry_id}>${site.name ?? site.entry_id}</option>`,
              )}
            </select>
          </label>
          <button class="retry-button" type="button" @click=${() => void this.openSelectedSite()}>
            ${translate(this.hass, "status.openSite")}
          </button>
        </div>
      </section>
    `;
  }

  private loadChartComponent(): void {
    if (this.chartComponentState === "ready" || this.chartComponentLoad) {
      return;
    }

    this.chartComponentLoad = import("./ilc-site-snapshot-chart")
      .then(() => {
        this.chartComponentState = customElements.get("ilc-site-snapshot-chart") ? "ready" : "failed";
      })
      .catch((error: unknown) => {
        console.warn("Load Control chart component failed to load; keeping textual fallback visible.", error);
        this.chartComponentState = "failed";
      });
  }

  private renderConfiguration() {
    const configuration = this.configuration;
    if (!configuration) {
      return html`
        <section class="panel-card empty-state" aria-live="polite">
          <h2>${translate(this.hass, "app.settings")}</h2>
          <button class="secondary-button" type="button" @click=${() => void this.reloadConfiguration()}>
            ${translate(this.hass, "status.retry")}
          </button>
        </section>
      `;
    }

    const site = this.siteDraft ?? editableCopy(configuration.site);
    return html`
      <section class="panel-card" aria-labelledby="site-configuration-title">
        <div class="section-header">
          <div>
            <h2 id="site-configuration-title">${translate(this.hass, "site.configuration")}</h2>
            <p class="secondary">${translate(this.hass, "status.previewOnly")}</p>
          </div>
        </div>
        <form @submit=${(event: Event) => void this.saveSite(event)}>
          <div class="form-grid">
            ${this.renderTextField("site_name", translate(this.hass, "site.name"), site, this.updateSiteDraft)}
            ${this.renderSelectField(
              "grid_sign_convention",
              translate(this.hass, "site.signConvention"),
              site,
              ["import_positive", "export_positive"],
              this.updateSiteDraft,
            )}
            ${this.renderNumberField(
              "planning_horizon_hours",
              translate(this.hass, "site.planningHorizon"),
              site,
              this.updateSiteDraft,
              false,
            )}
            ${this.renderNumberField(
              "planning_resolution_seconds",
              translate(this.hass, "site.planningResolution"),
              site,
              this.updateSiteDraft,
              false,
            )}
            ${this.renderNumberField(
              "soft_import_limit_w",
              translate(this.hass, "site.softImportLimit"),
              site,
              this.updateSiteDraft,
              true,
            )}
            ${this.renderNumberField(
              "hard_import_limit_w",
              translate(this.hass, "site.hardImportLimit"),
              site,
              this.updateSiteDraft,
              true,
            )}
            ${this.renderNumberField(
              "max_controlled_power_w",
              translate(this.hass, "site.maxControlledPower"),
              site,
              this.updateSiteDraft,
              true,
            )}
          </div>
          <div class="form-actions">
            <button class="primary-button" type="submit">${translate(this.hass, "site.save")}</button>
            <button class="secondary-button" type="button" @click=${() => void this.validateDraft("site")}>
              ${translate(this.hass, "config.validate")}
            </button>
            <button class="secondary-button" type="button" @click=${() => void this.previewDraft("site")}>
              ${translate(this.hass, "config.preview")}
            </button>
          </div>
        </form>
        ${this.renderConfigurationFeedback()}
        <details>
          <summary>${translate(this.hass, "config.advanced")}</summary>
          <pre>${JSON.stringify(configuration.site, null, 2)}</pre>
        </details>
      </section>
      <section class="panel-card" aria-labelledby="load-configuration-title">
        <div class="section-header">
          <h2 id="load-configuration-title">${translate(this.hass, "load.configuration")}</h2>
          <button class="secondary-button" type="button" @click=${this.startAddingLoad}>
            ${translate(this.hass, "load.add")}
          </button>
        </div>
        ${this.renderConfiguredLoads(configuration.loads)}
        ${this.loadDraft ? this.renderLoadEditor() : nothing}
      </section>
    `;
  }

  private renderConfiguredLoads(loads: readonly JsonObject[]) {
    if (loads.length === 0) {
      return html`<p class="secondary">${translate(this.hass, "status.empty")}</p>`;
    }
    return html`
      <div class="load-grid">
        ${loads.map((config) => {
          const loadId = stringFrom(config["load_id"]);
          const displayName = stringFrom(config["display_name"]) ?? loadId ?? "—";
          return html`
            <article class="load-card">
              <h3>${displayName}</h3>
              <p class="secondary">${stringFrom(config["load_type"]) ?? "—"}</p>
              <div class="card-actions">
                <button
                  class="secondary-button"
                  type="button"
                  ?disabled=${!loadId}
                  @click=${() => this.startEditingLoad(config)}
                >
                  ${translate(this.hass, "load.edit")}
                </button>
                <button
                  class="text-button"
                  type="button"
                  ?disabled=${!loadId}
                  @click=${() => void this.duplicateConfiguredLoad(config)}
                >
                  ${translate(this.hass, "load.duplicate")}
                </button>
                <button
                  class="danger-button"
                  type="button"
                  ?disabled=${!loadId}
                  @click=${(event: Event) => this.requestDeleteLoad(config, displayName, event.currentTarget)}
                >
                  ${translate(this.hass, "load.delete")}
                </button>
              </div>
            </article>
          `;
        })}
      </div>
    `;
  }

  private renderLoadEditor() {
    const load = this.loadDraft;
    if (!load) {
      return nothing;
    }
    const editing = this.editingLoadId !== undefined;
    return html`
      <section class="panel-card" aria-labelledby="load-editor-title">
        <div class="section-header">
          <h3 id="load-editor-title">${editing ? translate(this.hass, "load.edit") : translate(this.hass, "load.add")}</h3>
          <button class="text-button" type="button" @click=${this.cancelLoadEditor}>
            ${translate(this.hass, "load.cancelEdit")}
          </button>
        </div>
        <form @submit=${(event: Event) => void this.saveLoad(event)}>
          <div class="form-grid">
            ${this.renderTextField("display_name", translate(this.hass, "load.name"), load, this.updateLoadDraft)}
            ${this.renderSelectField(
              "load_type",
              translate(this.hass, "load.type"),
              load,
              this.loadTypeOptions(),
              this.updateLoadDraft,
            )}
            ${this.renderSelectField(
              "optimisation_mode",
              translate(this.hass, "load.optimisation"),
              load,
              this.optimisationModeOptions(),
              this.updateLoadDraft,
            )}
            ${this.renderNumberField(
              "expected_power_w",
              translate(this.hass, "load.expectedPower"),
              load,
              this.updateLoadDraft,
              false,
            )}
            ${this.renderNumberField(
              "priority",
              translate(this.hass, "load.priority"),
              load,
              this.updateLoadDraft,
              false,
            )}
            ${this.renderSelectField(
              "phase_assignment",
              translate(this.hass, "load.phase"),
              load,
              ["unknown", "a", "b", "c", "three_phase"],
              this.updateLoadDraft,
            )}
            ${this.renderCheckboxField(
              "automatic_control",
              translate(this.hass, "load.automatic"),
              load,
              this.updateLoadDraft,
            )}
          </div>
          <div class="form-actions">
            <button class="primary-button" type="submit">${translate(this.hass, "load.save")}</button>
            <button class="secondary-button" type="button" @click=${() => void this.validateDraft("load")}>
              ${translate(this.hass, "config.validate")}
            </button>
            <button class="secondary-button" type="button" @click=${() => void this.previewDraft("load")}>
              ${translate(this.hass, "config.preview")}
            </button>
          </div>
        </form>
        ${this.renderConfigurationFeedback()}
      </section>
    `;
  }

  private renderTextField(
    name: string,
    label: string,
    config: EditableConfig,
    onInput: (event: Event) => void,
  ) {
    return html`
      <label class="form-field">
        <span>${label}</span>
        <input name=${name} .value=${stringFrom(config[name]) ?? ""} @input=${onInput} />
      </label>
    `;
  }

  private renderNumberField(
    name: string,
    label: string,
    config: EditableConfig,
    onInput: (event: Event) => void,
    nullable: boolean,
  ) {
    return html`
      <label class="form-field">
        <span>${label}</span>
        <input
          name=${name}
          type="number"
          inputmode="decimal"
          .value=${numberText(config[name])}
          data-nullable=${String(nullable)}
          @input=${onInput}
        />
      </label>
    `;
  }

  private renderSelectField(
    name: string,
    label: string,
    config: EditableConfig,
    options: readonly string[],
    onChange: (event: Event) => void,
  ) {
    const current = stringFrom(config[name]) ?? options[0] ?? "";
    return html`
      <label class="form-field">
        <span>${label}</span>
        <select name=${name} .value=${current} @change=${onChange}>
          ${options.map((option) => html`<option value=${option}>${option}</option>`)}
        </select>
      </label>
    `;
  }

  private renderCheckboxField(
    name: string,
    label: string,
    config: EditableConfig,
    onChange: (event: Event) => void,
  ) {
    return html`
      <label class="checkbox-field">
        <input name=${name} type="checkbox" ?checked=${booleanFrom(config[name], true)} @change=${onChange} />
        <span>${label}</span>
      </label>
    `;
  }

  private renderConfigurationFeedback() {
    const preview = this.configurationPreview;
    if (this.configurationIssues.length === 0 && !preview) {
      return nothing;
    }
    return html`
      ${this.configurationIssues.length > 0
        ? html`
            <section class="status-banner" data-state="error" aria-live="polite">
              <h3>${translate(this.hass, "config.issues")}</h3>
              <ul class="issue-list">
                ${this.configurationIssues.map(
                  (issue) => html`
                    <li>
                      <span>${issue.message}</span>
                      <span class="issue-path">${issue.path}</span>
                    </li>
                  `,
                )}
              </ul>
            </section>
          `
        : nothing}
      ${preview
        ? html`
            <section class="panel-card" aria-labelledby="preview-result-title">
              <h3 id="preview-result-title">${translate(this.hass, "config.previewResult")}</h3>
              <p class="secondary">${translate(this.hass, "status.previewOnly")}</p>
              ${preview.plan
                ? html`
                    <ilc-plan-interval-table
                      .hass=${this.hass}
                      .intervals=${preview.plan.intervals ?? []}
                    ></ilc-plan-interval-table>
                  `
                : nothing}
            </section>
          `
        : nothing}
    `;
  }

  private renderLoadControls(dashboard: DashboardData) {
    const load = dashboard.loads.find((candidate) => candidate.load_id === this.selectedLoadId);
    if (!load) {
      return html`
        <section class="panel-card empty-state" aria-live="polite">
          <h2>${translate(this.hass, "load.details")}</h2>
          <p class="secondary">${translate(this.hass, "value.unavailable")}</p>
          <button class="secondary-button" type="button" @click=${() => void this.selectWorkspaceView("loads")}>
            ${translate(this.hass, "nav.loads")}
          </button>
        </section>
      `;
    }
    return html`
      <section class="panel-card" aria-labelledby="load-controls-title">
        <div class="section-header">
          <div>
            <h2 id="load-controls-title">${load.name}</h2>
            <p class="secondary">${translate(this.hass, "load.details")}</p>
          </div>
          <button class="text-button" type="button" @click=${() => void this.selectWorkspaceView("loads")}>
            ${translate(this.hass, "nav.loads")}
          </button>
        </div>
        <p class="reason">${localizeReasonCode(this.hass, load.reason_code)}</p>
        <label class="form-field">
          <span>${translate(this.hass, "load.duration")}</span>
          <input
            type="number"
            min="1"
            inputmode="numeric"
            .value=${String(this.overrideDurationMinutes)}
            @input=${this.updateOverrideDuration}
          />
        </label>
        <div class="override-actions">
          <button
            class="secondary-button"
            type="button"
            @click=${() => void this.setAutomaticControl(load, !load.automatic_control)}
          >
            ${translate(
              this.hass,
              load.automatic_control ? "load.disableAutomatic" : "load.enableAutomatic",
            )}
          </button>
          <button class="primary-button" type="button" @click=${() => void this.applyOverride(load.load_id, "on", false)}>
            ${translate(this.hass, "load.timedOn")}
          </button>
          <button class="secondary-button" type="button" @click=${() => void this.applyOverride(load.load_id, "off", false)}>
            ${translate(this.hass, "load.timedOff")}
          </button>
          <button class="secondary-button" type="button" @click=${() => void this.applyOverride(load.load_id, "on", true)}>
            ${translate(this.hass, "load.indefiniteOn")}
          </button>
          <button class="secondary-button" type="button" @click=${() => void this.applyOverride(load.load_id, "off", true)}>
            ${translate(this.hass, "load.indefiniteOff")}
          </button>
          <button class="danger-button" type="button" @click=${() => void this.clearLoadOverride(load.load_id)}>
            ${translate(this.hass, "load.clearOverride")}
          </button>
        </div>
        ${this.loadDetail
          ? html`
              <details>
                <summary>${translate(this.hass, "config.advanced")}</summary>
                <pre>${JSON.stringify(this.loadDetail, null, 2)}</pre>
              </details>
            `
          : nothing}
      </section>
    `;
  }

  private renderDeleteConfirmation() {
    const confirmation = this.deleteConfirmation;
    if (!confirmation) {
      return nothing;
    }
    return html`
      <div class="dialog-backdrop" @keydown=${this.handleDeleteDialogKeydown}>
        <section
          class="dialog-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-load-title"
          aria-describedby="delete-load-description"
        >
          <h2 id="delete-load-title">${translate(this.hass, "dialog.deleteTitle")}</h2>
          <p id="delete-load-description">
            ${translate(this.hass, "dialog.deleteBody", { name: confirmation.displayName })}
          </p>
          <div class="form-actions">
            <button class="danger-button" type="button" @click=${() => void this.confirmDeleteLoad()}>
              ${translate(this.hass, "dialog.confirmDelete")}
            </button>
            <button class="secondary-button" type="button" @click=${this.cancelDeleteLoad}>
              ${translate(this.hass, "dialog.cancel")}
            </button>
          </div>
        </section>
      </div>
    `;
  }

  private readonly handleNavigation = (event: Event): void => {
    const detail = (event as CustomEvent<{ view?: WorkspaceView }>).detail;
    if (!detail?.view) {
      return;
    }
    void this.selectWorkspaceView(detail.view);
  };

  private readonly handleOpenLoad = (event: Event): void => {
    const loadId = (event as CustomEvent<{ loadId?: string }>).detail?.loadId;
    if (!loadId) {
      return;
    }
    void this.openLoad(loadId);
  };

  private readonly handleEditLoad = (event: Event): void => {
    const loadId = (event as CustomEvent<{ loadId?: string }>).detail?.loadId;
    if (!loadId) {
      return;
    }
    void this.editConfiguredLoad(loadId);
  };

  private async selectWorkspaceView(view: WorkspaceView, pushRoute = true): Promise<void> {
    this.workspaceView = view;
    if (view !== "load") {
      this.selectedLoadId = undefined;
    }
    this.actionMessage = undefined;
    this.actionError = undefined;
    this.actionErrorCode = undefined;
    if (pushRoute) {
      this.pushRoute({ view });
    }
    await this.ensureWorkspaceData(view);
  }

  private async ensureWorkspaceData(view: WorkspaceView, force = false): Promise<void> {
    const entryId = this.selectedEntryId;
    const hass = this.hass;
    if (!entryId || !hass || view === "dashboard") {
      return;
    }
    if (!force && this.hasWorkspaceData(view)) {
      return;
    }
    if (this.sectionLoading === view) {
      return;
    }

    this.sectionLoading = view;
    try {
      const api = new LoadControlApi(hass);
      if (view === "configure") {
        const configuration = await api.getConfiguration(entryId);
        this.configuration = configuration;
        this.siteDraft = editableCopy(configuration.site);
        this.loadDraft = undefined;
        this.editingLoadId = undefined;
        this.configurationIssues = [];
        this.configurationPreview = undefined;
      } else if (view === "plan") {
        const [plan, timeline] = await Promise.all([
          api.getCurrentPlan(entryId),
          api.getDailyTimeline(entryId),
        ]);
        this.currentPlan = plan;
        this.dailyTimeline = timeline;
      } else if (view === "history") {
        const [history, eventJournal] = await Promise.all([
          api.getHistoricalSummary(entryId),
          api.getEventJournal(entryId),
        ]);
        this.history = history;
        this.events = eventJournal.events;
      } else if (view === "diagnostics") {
        this.diagnostics = await api.getDiagnostics(entryId);
      } else if (view === "load" && this.selectedLoadId) {
        this.loadDetail = await api.getLoadDetail(entryId, this.selectedLoadId);
      }
    } catch (error) {
      this.setActionFailure(error);
    } finally {
      if (this.sectionLoading === view) {
        this.sectionLoading = undefined;
      }
    }
  }

  private hasWorkspaceData(view: WorkspaceView): boolean {
    switch (view) {
      case "dashboard":
        return true;
      case "configure":
        return this.configuration !== undefined;
      case "plan":
        return this.currentPlan !== undefined || this.dailyTimeline !== undefined;
      case "history":
        return this.history !== undefined || this.events !== undefined;
      case "diagnostics":
        return this.diagnostics !== undefined;
      case "loads":
        return true;
      case "load":
        return this.loadDetail !== undefined;
    }
  }

  private async reloadConfiguration(): Promise<void> {
    const clearConflict = this.isConflictError();
    this.configuration = undefined;
    this.siteDraft = undefined;
    this.loadDraft = undefined;
    this.editingLoadId = undefined;
    this.configurationIssues = [];
    this.configurationPreview = undefined;
    await this.ensureWorkspaceData("configure", true);
    if (clearConflict && this.configuration) {
      this.actionError = undefined;
      this.actionErrorCode = undefined;
      this.actionMessage = undefined;
    }
  }

  private async validateDraft(kind: "site" | "load"): Promise<boolean> {
    const entryId = this.selectedEntryId;
    const draft = kind === "site" ? this.siteDraft : this.loadDraft;
    if (!entryId || !draft || !this.hass) {
      return false;
    }
    try {
      const response = await new LoadControlApi(this.hass).validateConfiguration(entryId, {
        kind,
        config: draft,
      });
      this.configurationIssues = response.issues ?? [];
      this.configurationPreview = undefined;
      this.actionError = undefined;
      this.actionErrorCode = undefined;
      this.actionMessage = translate(
        this.hass,
        response.valid ? "status.valid" : "status.invalid",
      );
      return response.valid;
    } catch (error) {
      this.setActionFailure(error);
      return false;
    }
  }

  private async previewDraft(kind: "site" | "load"): Promise<void> {
    const entryId = this.selectedEntryId;
    const draft = kind === "site" ? this.siteDraft : this.loadDraft;
    if (!entryId || !draft || !this.hass) {
      return;
    }
    try {
      const response = await new LoadControlApi(this.hass).previewConfiguration(entryId, {
        kind,
        config: draft,
      });
      this.configurationIssues = response.issues ?? [];
      this.configurationPreview = response;
      this.actionError = undefined;
      this.actionErrorCode = undefined;
      this.actionMessage = translate(
        this.hass,
        response.valid ? "status.previewOnly" : "status.invalid",
      );
    } catch (error) {
      this.setActionFailure(error);
    }
  }

  private async saveSite(event: Event): Promise<void> {
    event.preventDefault();
    const entryId = this.selectedEntryId;
    const draft = this.siteDraft;
    const current = this.configuration?.site;
    if (!entryId || !draft || !current || !this.hass || !(await this.validateDraft("site"))) {
      return;
    }
    try {
      await new LoadControlApi(this.hass).updateSite(entryId, draft, revisionFrom(current));
      this.setActionSuccess("status.saved");
      await this.refresh();
      await this.reloadConfiguration();
    } catch (error) {
      this.setActionFailure(error);
    }
  }

  private readonly startAddingLoad = (): void => {
    this.editingLoadId = undefined;
    this.loadDraft = {
      display_name: translate(this.hass, "load.defaultName"),
      load_type: "generic_binary",
      expected_power_w: 0,
      optimisation_mode: "cost_optimised_hybrid",
      automatic_control: true,
      priority: 50,
      phase_assignment: "unknown",
      phase_count: 1,
    };
    this.configurationIssues = [];
    this.configurationPreview = undefined;
  };

  private startEditingLoad(config: JsonObject): void {
    const loadId = stringFrom(config["load_id"]);
    if (!loadId) {
      return;
    }
    this.editingLoadId = loadId;
    this.loadDraft = editableCopy(config);
    this.configurationIssues = [];
    this.configurationPreview = undefined;
  }

  private readonly cancelLoadEditor = (): void => {
    this.loadDraft = undefined;
    this.editingLoadId = undefined;
    this.configurationIssues = [];
    this.configurationPreview = undefined;
  };

  private async saveLoad(event: Event): Promise<void> {
    event.preventDefault();
    const entryId = this.selectedEntryId;
    const draft = this.loadDraft;
    const editingLoadId = this.editingLoadId;
    if (!entryId || !draft || !this.hass || !(await this.validateDraft("load"))) {
      return;
    }
    try {
      const api = new LoadControlApi(this.hass);
      if (editingLoadId) {
        const current = this.configuration?.loads.find(
          (load) => stringFrom(load["load_id"]) === editingLoadId,
        );
        if (!current) {
          throw new LoadControlApiError(
            "The load configuration is no longer available. Refresh before saving.",
            "config_conflict",
          );
        }
        await api.updateLoad(entryId, editingLoadId, draft, revisionFrom(current));
        this.setActionSuccess("load.updated");
      } else {
        await api.addLoad(entryId, draft);
        this.setActionSuccess("load.added");
      }
      await this.refresh();
      await this.reloadConfiguration();
    } catch (error) {
      this.setActionFailure(error);
    }
  }

  private async duplicateConfiguredLoad(config: JsonObject): Promise<void> {
    const loadId = stringFrom(config["load_id"]);
    if (!loadId || !this.selectedEntryId || !this.hass) {
      return;
    }
    try {
      await new LoadControlApi(this.hass).duplicateLoad(
        this.selectedEntryId,
        loadId,
        revisionFrom(config),
      );
      this.setActionSuccess("load.duplicated");
      await this.refresh();
      await this.reloadConfiguration();
    } catch (error) {
      this.setActionFailure(error);
    }
  }

  private requestDeleteLoad(
    config: JsonObject,
    displayName: string,
    trigger: EventTarget | null,
  ): void {
    const loadId = stringFrom(config["load_id"]);
    if (!loadId) {
      return;
    }
    try {
      this.deleteDialogTrigger = trigger instanceof HTMLElement ? trigger : undefined;
      this.deleteConfirmation = { loadId, displayName, ifRevision: revisionFrom(config) };
      void this.updateComplete.then(() => this.deleteConfirmationButton?.focus());
    } catch (error) {
      this.setActionFailure(error);
    }
  }

  private readonly cancelDeleteLoad = (): void => {
    this.closeDeleteConfirmation();
  };

  private async confirmDeleteLoad(): Promise<void> {
    const confirmation = this.deleteConfirmation;
    if (!confirmation || !this.selectedEntryId || !this.hass) {
      return;
    }
    try {
      await new LoadControlApi(this.hass).deleteLoad(
        this.selectedEntryId,
        confirmation.loadId,
        confirmation.ifRevision,
      );
      this.closeDeleteConfirmation();
      this.setActionSuccess("load.deleted");
      await this.refresh();
      await this.reloadConfiguration();
    } catch (error) {
      this.setActionFailure(error);
    }
  }

  private readonly updateSiteDraft = (event: Event): void => {
    if (!this.siteDraft) {
      return;
    }
    this.siteDraft = this.updatedDraft(this.siteDraft, event);
    this.configurationIssues = [];
    this.configurationPreview = undefined;
  };

  private readonly updateLoadDraft = (event: Event): void => {
    if (!this.loadDraft) {
      return;
    }
    this.loadDraft = this.updatedDraft(this.loadDraft, event);
    this.configurationIssues = [];
    this.configurationPreview = undefined;
  };

  private updatedDraft(current: EditableConfig, event: Event): EditableConfig {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement)) {
      return current;
    }
    let value: JsonValue;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      value = target.checked;
    } else if (target instanceof HTMLInputElement && target.type === "number") {
      if (target.value === "") {
        value = target.dataset["nullable"] === "true" ? null : "";
      } else {
        const numericValue = Number(target.value);
        value = Number.isFinite(numericValue) ? numericValue : target.value;
      }
    } else {
      value = target.value;
    }
    return { ...current, [target.name]: value };
  }

  private async openLoad(loadId: string): Promise<void> {
    this.selectedLoadId = loadId;
    this.workspaceView = "load";
    this.loadDetail = undefined;
    this.pushRoute({ view: "load", loadId });
    await this.ensureWorkspaceData("load", true);
  }

  private async editConfiguredLoad(loadId: string): Promise<void> {
    await this.selectWorkspaceView("configure");
    const config = this.configuration?.loads.find((load) => stringFrom(load["load_id"]) === loadId);
    if (config) {
      this.startEditingLoad(config);
    }
  }

  private readonly updateOverrideDuration = (event: Event): void => {
    const target = event.currentTarget as HTMLInputElement;
    const minutes = Number(target.value);
    this.overrideDurationMinutes = Number.isFinite(minutes) ? minutes : 0;
  };

  private async applyOverride(
    loadId: string,
    desiredState: "on" | "off",
    indefinite: boolean,
  ): Promise<void> {
    if (!this.selectedEntryId || !this.hass) {
      return;
    }
    const durationSeconds = Math.round(this.overrideDurationMinutes * 60);
    if (!indefinite && durationSeconds <= 0) {
      this.actionMessage = undefined;
      this.actionError = translate(this.hass, "status.invalid");
      this.actionErrorCode = "invalid_request";
      return;
    }
    try {
      await new LoadControlApi(this.hass).startOverride(this.selectedEntryId, loadId, desiredState, {
        ...(indefinite ? { indefinite: true } : { duration_seconds: durationSeconds }),
      });
      this.setActionSuccess("load.overrideUpdated");
      this.loadDetail = undefined;
      await this.refresh();
      await this.ensureWorkspaceData("load", true);
    } catch (error) {
      this.setActionFailure(error);
    }
  }

  private async clearLoadOverride(loadId: string): Promise<void> {
    if (!this.selectedEntryId || !this.hass) {
      return;
    }
    try {
      await new LoadControlApi(this.hass).clearOverride(this.selectedEntryId, loadId);
      this.setActionSuccess("load.overrideCleared");
      this.loadDetail = undefined;
      await this.refresh();
      await this.ensureWorkspaceData("load", true);
    } catch (error) {
      this.setActionFailure(error);
    }
  }

  private async setAutomaticControl(load: LoadSummary, enabled: boolean): Promise<void> {
    if (!this.selectedEntryId || !this.hass) {
      return;
    }
    if (
      load.config_revision === undefined ||
      !Number.isInteger(load.config_revision)
    ) {
      this.setActionFailure(
        new LoadControlApiError(
          "The load configuration revision is unavailable. Refresh before changing Automatic control.",
          "config_conflict",
        ),
      );
      return;
    }
    try {
      await new LoadControlApi(this.hass).setAutomaticControl(
        this.selectedEntryId,
        load.load_id,
        enabled,
        load.config_revision,
      );
      this.setActionSuccess("load.automaticUpdated");
      this.loadDetail = undefined;
      await this.refresh();
      await this.ensureWorkspaceData("load", true);
    } catch (error) {
      this.setActionFailure(error);
    }
  }

  private async replan(): Promise<void> {
    if (!this.selectedEntryId || !this.hass) {
      return;
    }
    try {
      await new LoadControlApi(this.hass).replan(this.selectedEntryId);
      this.currentPlan = undefined;
      this.dailyTimeline = undefined;
      this.setActionSuccess("status.updatedPlan");
      await this.refresh();
      await this.ensureWorkspaceData("plan", true);
    } catch (error) {
      this.setActionFailure(error);
    }
  }

  private handleSiteChange(event: Event): void {
    this.selectedEntryId = (event.currentTarget as HTMLSelectElement).value;
  }

  private async openSelectedSite(): Promise<void> {
    if (!this.selectedEntryId) {
      return;
    }
    this.unsubscribeUpdates();
    this.dashboard = undefined;
    this.resetWorkspaceData();
    this.viewState = "loading";
    await this.refresh();
  }

  private resetWorkspaceData(): void {
    this.workspaceView = "dashboard";
    this.selectedLoadId = undefined;
    this.configuration = undefined;
    this.siteDraft = undefined;
    this.loadDraft = undefined;
    this.editingLoadId = undefined;
    this.currentPlan = undefined;
    this.dailyTimeline = undefined;
    this.history = undefined;
    this.events = undefined;
    this.loadDetail = undefined;
    this.diagnostics = undefined;
    this.sectionLoading = undefined;
    this.actionMessage = undefined;
    this.actionError = undefined;
    this.actionErrorCode = undefined;
    this.configurationIssues = [];
    this.configurationPreview = undefined;
    this.deleteConfirmation = undefined;
    this.deleteDialogTrigger = undefined;
  }

  private async ensureUpdateSubscription(entryId: string): Promise<void> {
    const hass = this.hass;
    if (!hass || !this.isWebsocketConnected()) {
      return;
    }
    if (this.subscribedEntryId === entryId && this.updateUnsubscribe) {
      return;
    }

    this.unsubscribeUpdates();
    const generation = this.subscriptionGeneration;
    try {
      const unsubscribe = await new LoadControlApi(hass).subscribeUpdates(entryId, () => {
        if (
          generation !== this.subscriptionGeneration ||
          entryId !== this.selectedEntryId ||
          entryId !== this.subscribedEntryId ||
          !this.isWebsocketConnected()
        ) {
          return;
        }
        this.requestSubscriptionRefresh();
      });
      if (
        !unsubscribe ||
        generation !== this.subscriptionGeneration ||
        entryId !== this.selectedEntryId ||
        !this.isWebsocketConnected()
      ) {
        unsubscribe?.();
        return;
      }
      this.subscribedEntryId = entryId;
      this.updateUnsubscribe = unsubscribe;
    } catch {
      // Live updates are progressive enhancement only. The dashboard remains
      // safe and usable through its authoritative reads and manual refresh.
    }
  }

  private unsubscribeUpdates(): void {
    const unsubscribe = this.updateUnsubscribe;
    this.updateUnsubscribe = undefined;
    this.subscribedEntryId = undefined;
    this.subscriptionGeneration += 1;
    this.subscriptionRefreshPending = false;
    unsubscribe?.();
  }

  private requestSubscriptionRefresh(): void {
    this.subscriptionRefreshPending = true;
    if (!this.refreshing) {
      void this.flushSubscriptionRefresh();
    }
  }

  private async flushSubscriptionRefresh(): Promise<void> {
    if (!this.subscriptionRefreshPending || this.refreshing) {
      return;
    }
    this.subscriptionRefreshPending = false;
    await this.refresh();
  }

  private closeDeleteConfirmation(): void {
    const trigger = this.deleteDialogTrigger;
    this.deleteConfirmation = undefined;
    this.deleteDialogTrigger = undefined;
    queueMicrotask(() => {
      if (trigger?.isConnected) {
        trigger.focus();
        return;
      }
      this.renderRoot.querySelector<HTMLButtonElement>(".refresh-button, .nav-button")?.focus();
    });
  }

  private readonly handleDeleteDialogKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      this.closeDeleteConfirmation();
      return;
    }
    if (event.key !== "Tab") {
      return;
    }
    const buttons = Array.from(
      this.renderRoot.querySelectorAll<HTMLButtonElement>(".dialog-card button:not([disabled])"),
    );
    const first = buttons[0];
    const last = buttons.at(-1);
    if (!first || !last) {
      return;
    }
    const activeElement = this.shadowRoot?.activeElement ?? document.activeElement;
    if (event.shiftKey && activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  private syncRoute(path = this.route?.path ?? window.location.pathname): void {
    const route = parseIlcRoute(path);
    this.workspaceView = route.view;
    this.selectedLoadId = route.loadId;
    if (this.hasLoaded && this.workspaceView !== "dashboard") {
      queueMicrotask(() => void this.ensureWorkspaceData(this.workspaceView));
    }
  }

  private pushRoute(route: Parameters<typeof routePathForState>[1]): void {
    if (typeof window === "undefined") {
      return;
    }
    const nextPath = routePathForState(this.panelBasePath(), route);
    if (window.location.pathname === nextPath) {
      return;
    }
    window.history.pushState({}, "", nextPath);
  }

  private panelBasePath(): string {
    return normaliseBasePath(this.route?.prefix ?? window.location.pathname);
  }

  private setActionSuccess(key: Parameters<typeof translate>[1]): void {
    this.actionMessage = translate(this.hass, key);
    this.actionError = undefined;
    this.actionErrorCode = undefined;
  }

  private setActionFailure(error: unknown): void {
    const apiError = error instanceof LoadControlApiError ? error : undefined;
    this.actionMessage = undefined;
    this.actionErrorCode = apiError?.code;
    this.actionError = apiError?.code === "config_conflict"
      ? translate(this.hass, "status.conflict")
      : error instanceof Error
        ? error.message
        : translate(this.hass, "status.error");
  }

  private isConflictError(): boolean {
    return this.actionErrorCode === "config_conflict";
  }

  private loadTypeOptions(): readonly string[] {
    return this.schemaOptions("load", "load_type", [
      "action_pair",
      "battery_charger",
      "battery_load",
      "binary_ev",
      "generic_binary",
      "hot_water",
      "variable_ev",
    ]);
  }

  private optimisationModeOptions(): readonly string[] {
    return this.schemaOptions("load", "optimisation_mode", [
      "cheapest_tariff",
      "cost_optimised_hybrid",
      "custom_priority",
      "disabled",
      "free_energy_only",
      "manual",
      "schedule_only",
      "solar_preferred_guarantee",
      "solar_surplus_only",
    ]);
  }

  private schemaOptions(sectionName: string, fieldName: string, fallback: readonly string[]): readonly string[] {
    const section = objectFrom(this.configuration?.schema[sectionName]);
    const fields = section ? objectFrom(section["fields"]) : undefined;
    const field = fields ? objectFrom(fields[fieldName]) : undefined;
    const options = field?.["options"];
    if (Array.isArray(options) && options.every((option) => typeof option === "string")) {
      return options;
    }
    return fallback;
  }

  private pageTitle(): string {
    switch (this.workspaceView) {
      case "load":
        return translate(this.hass, "app.loadRoute");
      case "loads":
        return translate(this.hass, "app.loads");
      case "plan":
        return translate(this.hass, "app.plan");
      case "history":
        return translate(this.hass, "app.insights");
      case "configure":
        return translate(this.hass, "app.settings");
      case "diagnostics":
        return translate(this.hass, "app.diagnostics");
      case "dashboard":
        return translate(this.hass, "app.overview");
    }
  }

  private isWebsocketConnected(): boolean {
    return this.hass?.connection?.connected !== false;
  }
}

function isSelectableSite(site: SiteSummaryResponse): site is SiteChoice {
  return typeof site.entry_id === "string" && site.entry_id.length > 0;
}

function editableCopy(config: JsonObject): EditableConfig {
  return { ...config };
}

function stringFrom(value: JsonValue | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function booleanFrom(value: JsonValue | undefined, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function numberText(value: JsonValue | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

function revisionFrom(config: JsonObject): number {
  const revision = config["config_revision"];
  if (typeof revision === "number" && Number.isInteger(revision)) {
    return revision;
  }
  throw new LoadControlApiError(
    "The configuration revision is unavailable. Refresh before saving.",
    "config_conflict",
  );
}

function objectFrom(value: JsonValue | undefined): JsonObject | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as JsonObject)
    : undefined;
}

declare global {
  interface HTMLElementTagNameMap {
    "intelligent-load-controller-panel": IntelligentLoadControllerPanel;
  }
}

if (!customElements.get("intelligent-load-controller-panel")) {
  customElements.define("intelligent-load-controller-panel", IntelligentLoadControllerPanel);
}
