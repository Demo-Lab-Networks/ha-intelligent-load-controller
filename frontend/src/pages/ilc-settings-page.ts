import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";

import "../components/plans/ilc-plan-interval-table";
import type {
  ConfigurationPreviewResponse,
  ConfigurationReadResponse,
  ValidationIssue,
} from "../api/load-control-api";
import { translate } from "../i18n";
import type { JsonObject, JsonValue } from "../models/dashboard";
import type { HomeAssistant } from "../types/home-assistant";

export type EditableConfig = Record<string, JsonValue>;
export type DraftKind = "site" | "load";

export class IlcSettingsPage extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @property({ attribute: false }) public configuration?: ConfigurationReadResponse;
  @property({ attribute: false }) public siteDraft?: EditableConfig;
  @property({ attribute: false }) public loadDraft?: EditableConfig;
  @property() public editingLoadId?: string;
  @property({ attribute: false }) public configurationIssues: readonly ValidationIssue[] = [];
  @property({ attribute: false }) public configurationPreview?: ConfigurationPreviewResponse;
  @property({ attribute: false }) public loadTypeOptions: readonly string[] = [];
  @property({ attribute: false }) public optimisationModeOptions: readonly string[] = [];

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  protected override render() {
    const configuration = this.configuration;
    if (!configuration) {
      return html`
        <section class="panel-card empty-state" aria-live="polite">
          <h2>${translate(this.hass, "app.settings")}</h2>
          <button class="secondary-button" type="button" @click=${this.reloadConfiguration}>
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
        <form @submit=${this.saveSite}>
          <div class="form-grid">
            ${this.renderTextField("site_name", translate(this.hass, "site.name"), site, "site")}
            ${this.renderSelectField(
              "grid_sign_convention",
              translate(this.hass, "site.signConvention"),
              site,
              ["import_positive", "export_positive"],
              "site",
            )}
            ${this.renderNumberField(
              "planning_horizon_hours",
              translate(this.hass, "site.planningHorizon"),
              site,
              false,
              "site",
            )}
            ${this.renderNumberField(
              "planning_resolution_seconds",
              translate(this.hass, "site.planningResolution"),
              site,
              false,
              "site",
            )}
            ${this.renderNumberField(
              "soft_import_limit_w",
              translate(this.hass, "site.softImportLimit"),
              site,
              true,
              "site",
            )}
            ${this.renderNumberField(
              "hard_import_limit_w",
              translate(this.hass, "site.hardImportLimit"),
              site,
              true,
              "site",
            )}
            ${this.renderNumberField(
              "max_controlled_power_w",
              translate(this.hass, "site.maxControlledPower"),
              site,
              true,
              "site",
            )}
          </div>
          <div class="form-actions">
            <button class="primary-button" type="submit">${translate(this.hass, "site.save")}</button>
            <button class="secondary-button" type="button" @click=${() => this.validateDraft("site")}>
              ${translate(this.hass, "config.validate")}
            </button>
            <button class="secondary-button" type="button" @click=${() => this.previewDraft("site")}>
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
                  @click=${() => this.duplicateConfiguredLoad(config)}
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
        <form @submit=${this.saveLoad}>
          <div class="form-grid">
            ${this.renderTextField("display_name", translate(this.hass, "load.name"), load, "load")}
            ${this.renderSelectField(
              "load_type",
              translate(this.hass, "load.type"),
              load,
              this.loadTypeOptions,
              "load",
            )}
            ${this.renderSelectField(
              "optimisation_mode",
              translate(this.hass, "load.optimisation"),
              load,
              this.optimisationModeOptions,
              "load",
            )}
            ${this.renderNumberField(
              "expected_power_w",
              translate(this.hass, "load.expectedPower"),
              load,
              false,
              "load",
            )}
            ${this.renderNumberField(
              "priority",
              translate(this.hass, "load.priority"),
              load,
              false,
              "load",
            )}
            ${this.renderSelectField(
              "phase_assignment",
              translate(this.hass, "load.phase"),
              load,
              ["unknown", "a", "b", "c", "three_phase"],
              "load",
            )}
            ${this.renderCheckboxField(
              "automatic_control",
              translate(this.hass, "load.automatic"),
              load,
              "load",
            )}
          </div>
          <div class="form-actions">
            <button class="primary-button" type="submit">${translate(this.hass, "load.save")}</button>
            <button class="secondary-button" type="button" @click=${() => this.validateDraft("load")}>
              ${translate(this.hass, "config.validate")}
            </button>
            <button class="secondary-button" type="button" @click=${() => this.previewDraft("load")}>
              ${translate(this.hass, "config.preview")}
            </button>
          </div>
        </form>
        ${this.renderConfigurationFeedback()}
      </section>
    `;
  }

  private renderTextField(name: string, label: string, config: EditableConfig, kind: DraftKind) {
    return html`
      <label class="form-field">
        <span>${label}</span>
        <input name=${name} .value=${stringFrom(config[name]) ?? ""} @input=${(event: Event) => this.updateDraft(kind, event)} />
      </label>
    `;
  }

  private renderNumberField(
    name: string,
    label: string,
    config: EditableConfig,
    nullable: boolean,
    kind: DraftKind,
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
          @input=${(event: Event) => this.updateDraft(kind, event)}
        />
      </label>
    `;
  }

  private renderSelectField(
    name: string,
    label: string,
    config: EditableConfig,
    options: readonly string[],
    kind: DraftKind,
  ) {
    const current = stringFrom(config[name]) ?? options[0] ?? "";
    return html`
      <label class="form-field">
        <span>${label}</span>
        <select name=${name} .value=${current} @change=${(event: Event) => this.updateDraft(kind, event)}>
          ${options.map((option) => html`<option value=${option}>${option}</option>`)}
        </select>
      </label>
    `;
  }

  private renderCheckboxField(name: string, label: string, config: EditableConfig, kind: DraftKind) {
    return html`
      <label class="checkbox-field">
        <input
          name=${name}
          type="checkbox"
          ?checked=${booleanFrom(config[name], true)}
          @change=${(event: Event) => this.updateDraft(kind, event)}
        />
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

  private readonly reloadConfiguration = (): void => {
    this.dispatchEvent(new CustomEvent("ilc-reload-configuration", { bubbles: true, composed: true }));
  };

  private readonly saveSite = (event: Event): void => {
    event.preventDefault();
    this.dispatchEvent(new CustomEvent("ilc-save-site", { bubbles: true, composed: true }));
  };

  private readonly saveLoad = (event: Event): void => {
    event.preventDefault();
    this.dispatchEvent(new CustomEvent("ilc-save-load", { bubbles: true, composed: true }));
  };

  private validateDraft(kind: DraftKind): void {
    this.dispatchEvent(
      new CustomEvent<{ kind: DraftKind }>("ilc-validate-draft", {
        bubbles: true,
        composed: true,
        detail: { kind },
      }),
    );
  }

  private previewDraft(kind: DraftKind): void {
    this.dispatchEvent(
      new CustomEvent<{ kind: DraftKind }>("ilc-preview-draft", {
        bubbles: true,
        composed: true,
        detail: { kind },
      }),
    );
  }

  private updateDraft(kind: DraftKind, event: Event): void {
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLSelectElement)) {
      return;
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
    this.dispatchEvent(
      new CustomEvent<{ kind: DraftKind; name: string; value: JsonValue }>("ilc-draft-change", {
        bubbles: true,
        composed: true,
        detail: { kind, name: target.name, value },
      }),
    );
  }

  private readonly startAddingLoad = (): void => {
    this.dispatchEvent(new CustomEvent("ilc-start-add-load", { bubbles: true, composed: true }));
  };

  private startEditingLoad(config: JsonObject): void {
    this.dispatchEvent(
      new CustomEvent<{ config: JsonObject }>("ilc-start-edit-load", {
        bubbles: true,
        composed: true,
        detail: { config },
      }),
    );
  }

  private duplicateConfiguredLoad(config: JsonObject): void {
    this.dispatchEvent(
      new CustomEvent<{ config: JsonObject }>("ilc-duplicate-load", {
        bubbles: true,
        composed: true,
        detail: { config },
      }),
    );
  }

  private requestDeleteLoad(config: JsonObject, displayName: string, trigger: EventTarget | null): void {
    this.dispatchEvent(
      new CustomEvent<{ config: JsonObject; displayName: string; trigger: EventTarget | null }>(
        "ilc-request-delete-load",
        {
          bubbles: true,
          composed: true,
          detail: { config, displayName, trigger },
        },
      ),
    );
  }

  private readonly cancelLoadEditor = (): void => {
    this.dispatchEvent(new CustomEvent("ilc-cancel-load-editor", { bubbles: true, composed: true }));
  };
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
  return typeof value === "number" ? String(value) : typeof value === "string" ? value : "";
}

declare global {
  interface HTMLElementTagNameMap {
    "ilc-settings-page": IlcSettingsPage;
  }
}

if (!customElements.get("ilc-settings-page")) {
  customElements.define("ilc-settings-page", IlcSettingsPage);
}
