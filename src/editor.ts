import { LitElement, css, html, nothing, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { DEFAULTS, LIMITS } from "./timeline";
import type { HomeAssistant, WhatHappenedConfig } from "./types";

type Schema = Array<Record<string, unknown>>;

const DE_UI: Record<string, string> = {
  Title: "Titel", "Show day headings (Today, Yesterday)": "Tagesüberschriften anzeigen (Heute, Gestern)", "Time window": "Zeitraum", "Maximum number of entries": "Maximale Anzahl Einträge", Order: "Sortierung", "Only show activity of": "Nur Aktivitäten von", "Hide these entities": "Diese Entitäten ausblenden", "Hide these devices": "Diese Geräte ausblenden", "Also show these entities": "Diese Entitäten zusätzlich anzeigen", "Also show these domains": "Diese Domains zusätzlich anzeigen", "Also show these labels": "Diese Labels zusätzlich anzeigen", "Icon colors": "Symbolfarben", "Only these domains": "Nur diese Domains", "Hide these domains": "Diese Domains ausblenden", "Show why it happened (who / what / trigger)": "Ursache anzeigen (wer / was / Auslöser)", "Show profile pictures": "Profilbilder anzeigen", "Show state color": "Statusfarbe anzeigen", "Compact layout": "Kompakte Darstellung", Time: "Zeit", "Tap action": "Aktion beim Tippen", "Maximum height": "Maximale Höhe", "TapoVac-ADV: show cleaning runs with rooms, duration and reason": "TapoVac-ADV: Reinigungen mit Räumen, Dauer und Ursache anzeigen", "What to show": "Was anzeigen", "Automation and script runs": "Automatisierungs- und Skriptläufe", "Show what automations said or sent (needs an admin user)": "Anzeigen, was Automatisierungen gesagt oder gesendet haben (Admin erforderlich)", "Very frequent entities": "Sehr häufige Entitäten", "Include diagnostic, configuration and hidden entities": "Diagnose-, Konfigurations- und versteckte Entitäten einbeziehen", "Hide unavailable / unknown states": "Nicht verfügbar / unbekannte Zustände ausblenden", "Merge rapid repeats of the same event": "Schnelle Wiederholungen desselben Ereignisses zusammenfassen", "Group a device's different actions together": "Aktionen eines Geräts gruppieren", "Grouping window": "Gruppierungszeitraum", "Newest first": "Neueste zuerst", "Oldest first": "Älteste zuerst", "Domain or entity id": "Domain oder Entity-ID", "Color": "Farbe", "Clock time and relative": "Uhrzeit und relativ", "Clock time only": "Nur Uhrzeit", "Relative only": "Nur relativ", "Open more info": "Mehr-Info öffnen", "Do nothing": "Keine Aktion", "Things that happened (recommended)": "Relevante Ereignisse (empfohlen)", "Everything, including sensors and clocks": "Alles, einschließlich Sensoren und Zeitgeber", "Only what they said or sent (recommended)": "Nur Gesagtes oder Gesendetes (empfohlen)", "Every run": "Jeder Lauf", Never: "Nie", "Summarize in one entry": "In einem Eintrag zusammenfassen", Hide: "Ausblenden", "Show every entry": "Jeden Eintrag anzeigen", "What to include": "Inhalt", Appearance: "Darstellung", Rules: "Regeln", "Leave empty to show no title.": "Leer lassen, um keinen Titel anzuzeigen.", "Pixels. Only needed in Masonry and Panel views. In Sections views, resize the card with its handles.": "Pixel. Nur in Masonry- und Panel-Ansichten nötig. In Sections-Ansichten die Karte über die Griffe skalieren.", "keep visible": "sichtbar lassen",
  "Pick a domain (light, input_boolean, …) or a single entity and the color of its icons. An entity beats its domain.": "Wähle eine Domain (light, input_boolean, …) oder eine einzelne Entität und die Farbe ihrer Symbole. Eine Entität hat Vorrang vor ihrer Domain.",
  "Shown even when the default view would hide them (helpers, buttons, diagnostic entities, restart noise, very frequent entities). Pick an automation or script to always list its runs. Also the way to keep one entity of a hidden device visible.": "Werden auch angezeigt, wenn sie in der Standardansicht ausgeblendet würden (Helfer, Buttons, Diagnose-Entitäten, Neustart-Ereignisse, sehr häufige Entitäten). Automationen oder Skripte auswählen, deren Läufe immer angezeigt werden sollen. Auch zum Einblenden einzelner Entitäten eines ausgeblendeten Geräts.",
  'Every entity of these devices is hidden, handy for a device with many sensors (a presence sensor, a laptop). Add an entity to "Also show these entities" to keep just that one visible.': 'Alle Entitäten dieser Geräte werden ausgeblendet – sinnvoll bei Geräten mit vielen Sensoren (z. B. Präsenzsensor oder Laptop). Unter „Diese Entitäten zusätzlich anzeigen“ können einzelne Entitäten sichtbar bleiben.',
  'Everything carrying one of these labels (entities and devices) is shown like an entity in the list above. Handy for a "watch this" label.': 'Alle Entitäten und Geräte mit diesen Labels werden wie die oben ausgewählten Entitäten angezeigt. Praktisch für ein Label zum Beobachten.',
  "Added to the default view, e.g. sensor or update. Pick from the list or type your own.": "Zur Standardansicht hinzugefügt, z. B. sensor oder update. Aus der Liste auswählen oder eigenen Wert eingeben.",
  "How far back the timeline reaches, in hours (1 – 720).": "Wie weit die Timeline zurückreicht, in Stunden (1–720).",
  "Between 1 and 500. Rapid repeats count as one entry when merging is on.": "Zwischen 1 und 500. Schnelle Wiederholungen zählen bei aktivierter Zusammenfassung als ein Eintrag.",
  "Leave empty to show everything. Choose areas, devices, entities or labels to narrow it.": "Leer lassen, um alles anzuzeigen. Bereiche, Geräte, Entitäten oder Labels zur Einschränkung auswählen.",
  "Leave empty for all domains. Pick from the list or type your own.": "Leer lassen, um alle Domains einzubeziehen. Aus der Liste auswählen oder eigenen Wert eingeben.",
  "Recommended hides clocks, text and number sensors and update entities.": "Die empfohlene Auswahl blendet Zeitgeber, Text- und Zahlensensoren sowie Update-Entitäten aus.",
  "Most runs are plumbing. By default only what a run said on a speaker or sent as a notification is shown, as its own entry.": "Die meisten Automatisierungsläufe sind technische Abläufe. Standardmäßig wird nur angezeigt, was sie über einen Lautsprecher ausgegeben oder als Benachrichtigung gesendet haben – jeweils als eigener Eintrag.",
  "Entities with at least 10 entries at a pace of one per hour or faster, such as a clock sensor or an automation that runs every 15 minutes.": "Entitäten mit mindestens 10 Einträgen und einer Frequenz von mindestens einem Eintrag pro Stunde, z. B. Zeitgeber oder Automationen im 15-Minuten-Takt.",
  "A chatty device (a laptop, a presence sensor with many sub-sensors) gets one expandable entry instead of one row per sensor.": "Ein Gerät mit vielen Ereignissen (z. B. Laptop oder Präsenzsensor mit vielen Unter-Sensoren) wird als aufklappbarer Eintrag statt mit einer Zeile pro Sensor angezeigt.",
  "How close together, in minutes, actions of one device have to be.": "Wie viele Minuten Aktionen desselben Geräts auseinanderliegen dürfen, um gruppiert zu werden.",
  "Domain or entity id": "Domain oder Entity-ID", "Color": "Farbe", "Newest first": "Neueste zuerst", "Oldest first": "Älteste zuerst", "Open more info": "Mehr-Info öffnen", "Do nothing": "Keine Aktion", "Things that happened (recommended)": "Relevante Ereignisse (empfohlen)", "Everything, including sensors and clocks": "Alles, einschließlich Sensoren und Zeitgeber", "Only what they said or sent (recommended)": "Nur Gesagtes oder Gesendetes (empfohlen)", "Every run": "Jeder Lauf", "Never": "Nie", "Summarize in one entry": "In einem Eintrag zusammenfassen", "Hide": "Ausblenden", "Show every entry": "Jeden Eintrag anzeigen", "What to include": "Inhalt", "Appearance": "Darstellung", "Rules": "Regeln", "Pixels. Only needed in Masonry and Panel views. In Sections views, resize the card with its handles.": "Pixel. Nur in Masonry- und Panel-Ansichten nötig. In Sections-Ansichten die Karte über die Griffe skalieren."
};

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

  private _computeLabel = (schema: { name: string }): string => { const label = LABELS[schema.name] ?? schema.name; return this._isGerman() ? (DE_UI[label] ?? label) : label; };
  private _computeHelper = (schema: { name: string }): string | undefined => { const helper = HELPERS[schema.name]; return helper && this._isGerman() ? (DE_UI[helper] ?? helper) : helper; };

  private _isGerman(): boolean { return (this.hass?.locale?.language ?? "").toLowerCase().startsWith("de"); }

  private _localizeSchema(schema: Schema): Schema { if (!this._isGerman()) return schema; const translate = (v: any): any => { if (Array.isArray(v)) return v.map(translate); if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, val]) => [k, translate(val)])); if (typeof v === "string") return DE_UI[v] ?? v; return v; }; return translate(schema); }

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
            <p class="device-exceptions-title">${name}: ${this._isGerman() ? "sichtbar lassen" : "keep visible"}</p>
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
      .schema=${this._localizeSchema(schema)}
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
          <ha-expansion-panel outlined .header=${this._isGerman() ? (DE_UI[panel.header] ?? panel.header) : panel.header} .expanded=${panel.id === "source"}>
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
