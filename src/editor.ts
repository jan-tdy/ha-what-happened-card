import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { DEFAULTS, LIMITS } from "./timeline";
import type { HomeAssistant, WhatHappenedConfig } from "./types";

type Schema = Array<Record<string, unknown>>;

const COMMON_DOMAINS = [
  "alarm_control_panel",
  "automation",
  "binary_sensor",
  "button",
  "climate",
  "cover",
  "device_tracker",
  "fan",
  "input_boolean",
  "light",
  "lock",
  "media_player",
  "person",
  "scene",
  "script",
  "sensor",
  "siren",
  "sun",
  "switch",
  "update",
  "vacuum",
].map((value) => ({ value, label: value }));

const LABELS: Record<string, string> = {
  title: "Title",
  show_day_headers: "Show day headings (Today, Yesterday)",
  hours_to_show: "Time window",
  max_entries: "Maximum number of entries",
  order: "Order",
  target: "Only show activity of",
  exclude_entities: "Hide these entities",
  hide_devices: "Hide these devices",
  also_show_entities: "Also show these entities",
  also_show_domains: "Also show these domains",
  also_show_labels: "Also show these labels",
  colors: "Icon colors",
  include_domains: "Only these domains",
  exclude_domains: "Hide these domains",
  show_cause: "Show why it happened (who / what / trigger)",
  show_avatars: "Show profile pictures",
  state_color: "Show state color",
  compact: "Compact layout",
  time_display: "Time",
  tap_action: "Tap action",
  max_height: "Maximum height",
  vacuum_details: "TapoVac-ADV: show cleaning runs with rooms, duration and reason",
  activity: "What to show",
  automation_runs: "Automation and script runs",
  show_actions: "Show what automations said or sent (needs an admin user)",
  chatty: "Very frequent entities",
  show_diagnostic: "Include diagnostic, configuration and hidden entities",
  hide_unavailable: "Hide unavailable / unknown states",
  collapse_repeats: "Merge rapid repeats of the same event",
  group_device_actions: "Group a device's different actions together",
  group_window_minutes: "Grouping window",
};

const HELPERS: Record<string, string> = {
  colors:
    "Pick a domain (light, input_boolean, …) or a single entity and the color of its icons. An entity beats its domain.",
  title: "Leave empty to show no title.",
  also_show_entities:
    "Shown even when the default view would hide them (helpers, buttons, diagnostic entities, restart noise, very frequent entities). Pick an automation or script to always list its runs. Also the way to keep one entity of a hidden device visible.",
  hide_devices:
    'Every entity of these devices is hidden, handy for a device with many sensors (a presence sensor, a laptop). Add an entity to "Also show these entities" to keep just that one visible.',
  also_show_labels:
    'Everything carrying one of these labels (entities and devices) is shown like an entity in the list above. Handy for a "watch this" label.',
  also_show_domains:
    "Added to the default view, e.g. sensor or update. Pick from the list or type your own.",
  hours_to_show: "How far back the timeline reaches, in hours (1 – 720).",
  max_entries: "Between 1 and 500. Rapid repeats count as one entry when merging is on.",
  target: "Leave empty to show everything. Choose areas, devices, entities or labels to narrow it.",
  include_domains: "Leave empty for all domains. Pick from the list or type your own.",
  activity: "Recommended hides clocks, text and number sensors and update entities.",
  automation_runs:
    "Most runs are plumbing. By default only what a run said on a speaker or sent as a notification is shown, as its own entry.",
  chatty:
    "Entities with at least 10 entries at a pace of one per hour or faster, such as a clock sensor or an automation that runs every 15 minutes.",
  max_height:
    "Pixels. Only needed in Masonry and Panel views. In Sections views, resize the card with its handles.",
  group_device_actions:
    "A chatty device (a laptop, a presence sensor with many sub-sensors) gets one expandable entry instead of one row per sensor.",
  group_window_minutes: "How close together, in minutes, actions of one device have to be.",
};

const BASE_SCHEMA: Schema = [
  { name: "title", selector: { text: {} } },
  { name: "show_day_headers", selector: { boolean: {} } },
  {
    type: "grid",
    name: "",
    schema: [
      {
        name: "hours_to_show",
        selector: {
          number: {
            min: LIMITS.hours[0],
            max: LIMITS.hours[1],
            step: 1,
            mode: "box",
            unit_of_measurement: "h",
          },
        },
      },
      {
        name: "max_entries",
        selector: {
          number: { min: LIMITS.entries[0], max: LIMITS.entries[1], step: 1, mode: "box" },
        },
      },
    ],
  },
  {
    name: "order",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "newest_first", label: "Newest first" },
          { value: "oldest_first", label: "Oldest first" },
        ],
      },
    },
  },
];

const SOURCE_SCHEMA: Schema = [
  { name: "target", selector: { target: {} } },
  { name: "exclude_entities", selector: { entity: { multiple: true } } },
  { name: "hide_devices", selector: { device: { multiple: true } } },
  { name: "also_show_entities", selector: { entity: { multiple: true } } },
  { name: "also_show_labels", selector: { label: { multiple: true } } },
  {
    name: "also_show_domains",
    selector: {
      select: { multiple: true, custom_value: true, mode: "dropdown", options: COMMON_DOMAINS },
    },
  },
  {
    name: "include_domains",
    selector: {
      select: { multiple: true, custom_value: true, mode: "dropdown", options: COMMON_DOMAINS },
    },
  },
  {
    name: "exclude_domains",
    selector: {
      select: { multiple: true, custom_value: true, mode: "dropdown", options: COMMON_DOMAINS },
    },
  },
];

const DISPLAY_SCHEMA: Schema = [
  {
    name: "colors",
    selector: {
      object: {
        multiple: true,
        label_field: "match",
        fields: {
          match: { label: "Domain or entity id", required: true, selector: { text: {} } },
          color: { label: "Color", required: true, selector: { ui_color: {} } },
        },
      },
    },
  },
  { name: "show_cause", selector: { boolean: {} } },
  { name: "show_avatars", selector: { boolean: {} } },

  { name: "state_color", selector: { boolean: {} } },
  { name: "compact", selector: { boolean: {} } },
  {
    name: "time_display",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "both", label: "Clock time and relative" },
          { value: "absolute", label: "Clock time only" },
          { value: "relative", label: "Relative only" },
        ],
      },
    },
  },
  {
    name: "tap_action",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "more-info", label: "Open more info" },
          { value: "none", label: "Do nothing" },
        ],
      },
    },
  },
  {
    name: "max_height",
    selector: { number: { min: 100, max: 2000, step: 10, mode: "box", unit_of_measurement: "px" } },
  },
];

const RULES_SCHEMA: Schema = [
  {
    name: "activity",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "meaningful", label: "Things that happened (recommended)" },
          { value: "everything", label: "Everything, including sensors and clocks" },
        ],
      },
    },
  },
  {
    name: "automation_runs",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "actions", label: "Only what they said or sent (recommended)" },
          { value: "all", label: "Every run" },
          { value: "none", label: "Never" },
        ],
      },
    },
  },
  {
    name: "chatty",
    selector: {
      select: {
        mode: "dropdown",
        options: [
          { value: "summarize", label: "Summarize in one entry" },
          { value: "hide", label: "Hide" },
          { value: "show", label: "Show every entry" },
        ],
      },
    },
  },
  { name: "show_actions", selector: { boolean: {} } },
  { name: "show_diagnostic", selector: { boolean: {} } },
  { name: "vacuum_details", selector: { boolean: {} } },
  { name: "hide_unavailable", selector: { boolean: {} } },
  { name: "collapse_repeats", selector: { boolean: {} } },
  { name: "group_device_actions", selector: { boolean: {} } },
  {
    name: "group_window_minutes",
    selector: {
      number: {
        min: LIMITS.groupWindow[0],
        max: LIMITS.groupWindow[1],
        step: 1,
        mode: "box",
        unit_of_measurement: "min",
      },
    },
  },
];

const PANELS: Array<{ id: string; header: string; icon: string; schema: Schema }> = [
  { id: "source", header: "What to include", icon: "mdi:filter-variant", schema: SOURCE_SCHEMA },
  { id: "display", header: "Appearance", icon: "mdi:palette-outline", schema: DISPLAY_SCHEMA },
  { id: "rules", header: "Rules", icon: "mdi:tune-variant", schema: RULES_SCHEMA },
];

@customElement("what-happened-card-editor")
export class WhatHappenedCardEditor extends LitElement {
  @property({ attribute: false }) public hass?: HomeAssistant;
  @state() private _config?: WhatHappenedConfig;

  public setConfig(config: WhatHappenedConfig): void {
    this._config = config;
  }

  private _data(): Record<string, unknown> {
    // Show effective defaults in the form so toggles reflect what the card does.
    return { ...DEFAULTS, ...this._config } as Record<string, unknown>;
  }

  private _computeLabel = (schema: { name: string }): string => LABELS[schema.name] ?? schema.name;
  private _computeHelper = (schema: { name: string }): string | undefined => HELPERS[schema.name];

  private _valueChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    if (!this._config) return;
    const value = ev.detail.value as Record<string, unknown>;
    const config: Record<string, unknown> = { type: this._config.type };
    // Keep the YAML tidy: only store values that differ from defaults or were set before.
    for (const [key, val] of Object.entries(value)) {
      if (key === "type") continue;
      const empty =
        val === undefined ||
        val === "" ||
        (Array.isArray(val) && val.length === 0) ||
        (key === "target" && (!val || Object.keys(val as object).length === 0));
      if (empty) continue;
      const isDefault = (DEFAULTS as Record<string, unknown>)[key] === val;
      if (isDefault && !(key in this._config)) continue;
      config[key] = val;
    }
    this._config = config as unknown as WhatHappenedConfig;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Entities of a hidden device, so one of them can still be picked back in. Modest on
   * purpose: a plain checkbox list, not a full picker. */
  private _deviceEntities(deviceId: string): Array<{ entityId: string; name: string }> {
    const hass = this.hass;
    if (!hass?.entities) return [];
    return Object.values(hass.entities)
      .filter((e) => e.device_id === deviceId)
      .map((e) => ({
        entityId: e.entity_id,
        name: hass.states[e.entity_id]?.attributes.friendly_name ?? e.entity_id,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  private _toggleAlsoShow(entityId: string, checked: boolean): void {
    if (!this._config) return;
    const current = this._config.also_show_entities ?? [];
    const also_show_entities = checked
      ? [...new Set([...current, entityId])]
      : current.filter((id) => id !== entityId);
    this._config = { ...this._config, also_show_entities };
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _renderDeviceExceptions(): TemplateResult | typeof nothing {
    const hideDevices = this._config?.hide_devices;
    if (!hideDevices?.length || !this.hass) return nothing;
    const alsoShown = new Set(this._config?.also_show_entities ?? []);
    return html`
      <div class="device-exceptions">
        ${hideDevices.map((deviceId) => {
          const entities = this._deviceEntities(deviceId);
          if (!entities.length) return nothing;
          const name = this.hass?.devices?.[deviceId]?.name ?? deviceId;
          return html`
            <p class="device-exceptions-title">${name}: keep visible</p>
            <ul class="device-exceptions-list">
              ${entities.map(
                (e) => html`
                  <li>
                    <label>
                      <input
                        type="checkbox"
                        .checked=${alsoShown.has(e.entityId)}
                        @change=${(ev: Event) =>
                          this._toggleAlsoShow(e.entityId, (ev.target as HTMLInputElement).checked)}
                      />
                      ${e.name}
                    </label>
                  </li>
                `,
              )}
            </ul>
          `;
        })}
      </div>
    `;
  }

  private _form(schema: Schema): TemplateResult {
    return html`<ha-form
      .hass=${this.hass}
      .data=${this._data()}
      .schema=${schema}
      .computeLabel=${this._computeLabel}
      .computeHelper=${this._computeHelper}
      @value-changed=${this._valueChanged}
    ></ha-form>`;
  }

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    return html`
      ${this._form(BASE_SCHEMA)}
      ${PANELS.map(
        (panel) => html`
          <ha-expansion-panel outlined .header=${panel.header} .expanded=${panel.id === "source"}>
            <ha-icon slot="leading-icon" .icon=${panel.icon}></ha-icon>
            <div class="panel-content">
              ${this._form(panel.schema)}
              ${panel.id === "source" ? this._renderDeviceExceptions() : nothing}
            </div>
          </ha-expansion-panel>
        `,
      )}
    `;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    ha-expansion-panel {
      display: block;
      --expansion-panel-content-padding: 0;
      border-radius: var(--ha-card-border-radius, 12px);
    }
    ha-expansion-panel ha-icon {
      color: var(--secondary-text-color);
    }
    .panel-content {
      padding: 0 16px 16px;
    }
    .device-exceptions {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid var(--divider-color);
    }
    .device-exceptions-title {
      margin: 8px 0 4px;
      font-size: 0.9em;
      color: var(--secondary-text-color);
    }
    .device-exceptions-list {
      list-style: none;
      margin: 0 0 8px;
      padding: 0;
    }
    .device-exceptions-list label {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 2px 0;
      font-size: 0.9em;
    }
  `;
}
