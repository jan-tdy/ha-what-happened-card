import { LitElement, html, nothing, type TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
import { formatDateTime, formatRelative, formatTime } from "./format";
import { subscribeLogbook } from "./logbook";
import { t } from "./strings";
import { TraceCache, extractActions, type ActionEvent } from "./trace";
import { findTapoVacuums, vacuumItems, type HistoryRun, type VacuumData } from "./vacuum";
import { cardStyles } from "./styles";
import { hasTarget, resolveTargetEntities } from "./targets";
import {
  DEFAULTS,
  buildTimeline,
  effectiveHours,
  entryKey,
  passesFilters,
  plainSentence,
} from "./timeline";
import type {
  Actor,
  DayGroup,
  HomeAssistant,
  LogbookEntry,
  TimelineItem,
  WhatHappenedConfig,
} from "./types";

const MAX_BUFFER = 3000;
const TICK_MS = 60_000;

@customElement("what-happened-card")
export class WhatHappenedCard extends LitElement {
  static styles = cardStyles;

  static async getConfigElement(): Promise<HTMLElement> {
    await import("./editor");
    return document.createElement("what-happened-card-editor");
  }

  static getStubConfig(): Partial<WhatHappenedConfig> {
    return { title: "What happened", hours_to_show: 24, max_entries: 50 };
  }

  @state() private _config?: WhatHappenedConfig;
  @state() private _groups: DayGroup[] = [];
  @state() private _loading = true;
  @state() private _error?: string;
  @state() private _now = Date.now();
  @state() private _expandedGroups = new Set<string>();

  private _hass?: HomeAssistant;
  private _entries = new Map<string, LogbookEntry>();
  private _allowed?: Set<string>;
  private _subKey?: string;
  private _unsub?: () => void;
  private _subToken = 0;
  private _tick?: number;
  private _recomputeTimer?: number;
  private _vacuums = new Map<string, VacuumData>();
  private _vacKey?: string;
  private _vacUnsubs: Array<() => void> = [];
  private _vacToken = 0;
  private _traces?: TraceCache;
  private _traceBudget = 0;
  private _registryRefs: unknown[] = [];

  public setConfig(config: WhatHappenedConfig): void {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    if (
      config.target !== undefined &&
      (typeof config.target !== "object" || config.target === null)
    ) {
      throw new Error("`target` must be an object with entity_id, device_id, area_id or label_id");
    }
    this._config = { ...config };
    this._subKey = undefined; // force re-evaluation of the subscription
    this._vacKey = undefined;
    this._ensureSubscription();
    this._scheduleRecompute();
  }

  set hass(hass: HomeAssistant) {
    const first = !this._hass;
    this._hass = hass;
    this._traces?.setHass(hass);
    const registries = [hass.entities, hass.devices, hass.areas];
    const registriesChanged = registries.some((r, i) => r !== this._registryRefs[i]);
    this._registryRefs = registries;
    if (first || registriesChanged) {
      this._ensureSubscription();
      this._scheduleRecompute();
    }
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  public getCardSize(): number {
    const config = this._config;
    if (config?.max_height) return Math.max(3, Math.ceil(config.max_height / 50));
    const count = this._groups.reduce((n, g) => n + g.items.length, 0);
    return Math.min(12, Math.max(3, Math.ceil(count * 1.2) + 1));
  }

  /** Sections view: default size and resize limits (users resize with the handles). */
  public getGridOptions() {
    return { columns: 12, rows: 6, min_columns: 3, min_rows: 2 };
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._tick = window.setInterval(() => {
      this._now = Date.now();
      this._refreshHistories();
      this._recompute();
    }, TICK_MS);
    if (this._hass && this._config) {
      this._subKey = undefined;
      this._vacKey = undefined;
      this._ensureSubscription();
      this._scheduleRecompute();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this._tick);
    window.clearTimeout(this._recomputeTimer);
    this._unsubscribe();
    this._unsubscribeVacuums();
    this._subKey = undefined;
    this._vacKey = undefined;
  }

  // ---------------------------------------------------------------- data

  private _unsubscribe(): void {
    this._subToken++;
    this._unsub?.();
    this._unsub = undefined;
  }

  private _ensureSubscription(): void {
    this._ensureLogbook();
    this._ensureVacuums();
  }

  // ----------------------------------------------- TapoVac-ADV (tapo_rv30)

  private _unsubscribeVacuums(): void {
    this._vacToken++;
    for (const unsub of this._vacUnsubs) unsub();
    this._vacUnsubs = [];
  }

  private _vacuumVisible(id: string, config: WhatHappenedConfig): boolean {
    if (this._allowed && !this._allowed.has(id)) return false;
    if (config.exclude_entities?.includes(id)) return false;
    if (config.include_domains?.length && !config.include_domains.includes("vacuum")) return false;
    return !config.exclude_domains?.includes("vacuum");
  }

  private _ensureVacuums(): void {
    const hass = this._hass;
    const config = this._config;
    if (!hass || !config || !this.isConnected) return;

    const ids =
      config.vacuum_details === false
        ? []
        : findTapoVacuums(hass).filter((id) => this._vacuumVisible(id, config));
    const key = JSON.stringify([...ids].sort());
    if (key === this._vacKey) return;
    this._vacKey = key;
    this._unsubscribeVacuums();
    this._vacuums.clear();
    const token = this._vacToken;

    for (const id of ids) {
      const data: VacuumData = { entityId: id, log: [], runs: [] };
      this._vacuums.set(id, data);
      hass.connection
        .subscribeMessage<{ log?: VacuumData["log"] }>(
          (view) => {
            if (token !== this._vacToken) return;
            data.log = view.log ?? [];
            this._refreshHistory(data);
            this._scheduleRecompute();
          },
          { type: "tapo_rv30/planner/subscribe", entity_id: id },
        )
        .then((unsub) => {
          if (token !== this._vacToken) unsub();
          else this._vacUnsubs.push(unsub);
        })
        .catch(() => undefined); // the planner is optional: history alone still works
      this._refreshHistory(data);
    }
  }

  private _refreshHistory(data: VacuumData): void {
    const hass = this._hass;
    if (!hass) return;
    const token = this._vacToken;
    hass
      .callWS<{ runs?: HistoryRun[] }>({ type: "tapo_rv30/history/list", entity_id: data.entityId })
      .then((result) => {
        if (token !== this._vacToken) return;
        data.runs = (result.runs ?? []).filter((r) => r.started);
        this._scheduleRecompute();
      })
      .catch(() => undefined);
  }

  private _refreshHistories(): void {
    for (const data of this._vacuums.values()) this._refreshHistory(data);
  }

  private _ensureLogbook(): void {
    const hass = this._hass;
    const config = this._config;
    if (!hass || !config || !this.isConnected) return;

    let allowed: Set<string> | undefined;
    if (hasTarget(config.target)) allowed = resolveTargetEntities(hass, config.target!);

    const hours = effectiveHours(config);
    const key = JSON.stringify([hours, allowed ? [...allowed].sort() : null]);
    if (key === this._subKey) {
      this._allowed = allowed;
      return;
    }
    this._subKey = key;
    this._allowed = allowed;
    this._unsubscribe();
    this._entries.clear();
    this._error = undefined;

    if (allowed && allowed.size === 0) {
      this._loading = false;
      return;
    }

    this._loading = true;
    const token = this._subToken;
    const start = new Date(Date.now() - hours * 3_600_000);
    subscribeLogbook(
      hass,
      (events) => {
        if (token !== this._subToken) return;
        // Filter before buffering so the size cap never evicts entries that would match.
        // Unavailable/unknown stay in the buffer: the timeline needs them to recognize a
        // return to the previous state, and hides them itself.
        const cfg = this._config;
        for (const event of events) {
          if (cfg && !passesFilters(event, cfg, this._allowed, this._hass, false, true)) continue;
          this._entries.set(entryKey(event), event);
        }
        if (this._entries.size > MAX_BUFFER) this._trimBuffer();
        this._loading = false;
        this._scheduleRecompute();
      },
      start,
      allowed ? [...allowed] : undefined,
    )
      .then((unsub) => {
        if (token !== this._subToken) unsub();
        else this._unsub = unsub;
      })
      .catch((err: unknown) => {
        if (token !== this._subToken) return;
        this._loading = false;
        this._error = err instanceof Error ? err.message : "Could not load the logbook";
      });
  }

  private _trimBuffer(): void {
    const sorted = [...this._entries.entries()].sort((a, b) => b[1].when - a[1].when);
    this._entries = new Map(sorted.slice(0, MAX_BUFFER));
  }

  private _scheduleRecompute(): void {
    window.clearTimeout(this._recomputeTimer);
    this._recomputeTimer = window.setTimeout(() => this._recompute(), 50);
  }

  private _recompute(): void {
    if (!this._hass || !this._config) return;
    this._now = Date.now();
    this._traceBudget = 40;
    const groups = buildTimeline(
      this._hass,
      this._entries.values(),
      this._config,
      this._now,
      this._allowed,
      this._extraItems(),
      this._resolveRun,
    );
    this._groups = groups;
  }

  /** What a run said or sent, read from its trace; undefined until the trace has loaded. */
  private _resolveRun = (run: TimelineItem): ActionEvent[] | undefined => {
    const hass = this._hass;
    if (!hass || !run.entityId) return undefined;
    const cache = (this._traces ??= new TraceCache(hass));
    const trace = cache.lookup(run.entityId, run.when, 15_000);
    if (trace) return extractActions(trace);
    if (this._traceBudget-- > 0) {
      cache.ensure(run.entityId, run.when, 15_000)?.then(() => this._scheduleRecompute());
    }
    return undefined;
  };

  private _extraItems() {
    const hass = this._hass;
    const config = this._config;
    const vacuums = new Set<string>();
    const items = [];
    if (hass && config) {
      for (const data of this._vacuums.values()) {
        if (!data.log.length && !data.runs.length) continue;
        vacuums.add(data.entityId);
        items.push(...vacuumItems(hass, data, config));
      }
    }
    return { items, vacuums };
  }

  // ------------------------------------------------------------ interaction

  private _moreInfo(entityId: string | undefined): void {
    if (!entityId) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }),
    );
  }

  private _onRowClick(item: TimelineItem): void {
    if ((this._config?.tap_action ?? DEFAULTS.tap_action) === "none") return;
    this._moreInfo(item.entityId);
  }

  private _onRowKey(ev: KeyboardEvent, item: TimelineItem): void {
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      this._onRowClick(item);
    }
  }

  private _toggleGroup(ev: Event, key: string): void {
    ev.stopPropagation();
    const next = new Set(this._expandedGroups);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this._expandedGroups = next;
  }

  // ----------------------------------------------------------------- render

  protected render(): TemplateResult | typeof nothing {
    const config = this._config;
    if (!config) return nothing;
    const total = this._groups.reduce((n, g) => n + g.items.length, 0);
    const lastGroup = this._groups[this._groups.length - 1];
    const lastKey = lastGroup?.items[lastGroup.items.length - 1]?.key;

    return html`
      <ha-card
        class=${classMap({
          compact: config.compact ?? DEFAULTS.compact,
          "has-header": !!config.title,
        })}
        style=${styleMap({ "--wh-max-height": config.max_height ? `${config.max_height}px` : "" })}
      >
        ${config.title ? html`<h1 class="card-header">${config.title}</h1>` : nothing}
        <div class="scroll">
          ${
            this._error
              ? html`<ha-alert alert-type="error">${this._error}</ha-alert>`
              : this._loading && total === 0
                ? html`<div class="state">Loading…</div>`
                : total === 0
                  ? this._renderEmpty(config)
                  : html`<ol>
                      ${this._groups.map((group) => this._renderGroup(group, config, lastKey))}
                    </ol>`
          }
        </div>
      </ha-card>
    `;
  }

  private _renderEmpty(config: WhatHappenedConfig): TemplateResult {
    const hours = effectiveHours(config);
    const span =
      hours % 24 === 0 && hours > 24
        ? `${hours / 24} days`
        : hours === 1
          ? "hour"
          : `${hours} hours`;
    const text = hours === 1 ? "No activity in the last hour" : `No activity in the last ${span}`;
    return html`<div class="state">
      <ha-icon icon="mdi:timeline-clock-outline"></ha-icon>${text}
    </div>`;
  }

  private _renderGroup(
    group: DayGroup,
    config: WhatHappenedConfig,
    lastKey: string | undefined,
  ): TemplateResult {
    const headers = config.show_day_headers ?? DEFAULTS.show_day_headers;
    return html`
      ${headers ? html`<li class="day" role="presentation">${group.label}</li>` : nothing}
      ${group.items.map((item) => this._renderItem(item, config, item.key === lastKey))}
    `;
  }

  private _renderIcon(item: TimelineItem): TemplateResult {
    const stateObj =
      item.entityId && !item.fixedIcon ? this._hass?.states[item.entityId] : undefined;
    // Entities get their icon from <ha-state-icon>, as the HA design guidelines require.
    // The wrapper centers the glyph in the circle whatever size the icon element reports.
    return html`<span class="glyph"
      >${
        stateObj
          ? html`<ha-state-icon
              .hass=${this._hass}
              .stateObj=${stateObj}
              .stateValue=${item.stateValue}
            ></ha-state-icon>`
          : html`<ha-icon .icon=${item.icon}></ha-icon>`
      }</span
    >`;
  }

  private _renderItem(
    item: TimelineItem,
    config: WhatHappenedConfig,
    last: boolean,
  ): TemplateResult {
    const avatars = config.show_avatars ?? DEFAULTS.show_avatars;
    const showCause = config.show_cause ?? DEFAULTS.show_cause;
    const clickable = !!item.entityId && (config.tap_action ?? DEFAULTS.tap_action) !== "none";
    const photo = avatars && item.picture;
    const grouped = !!item.groupCount && item.groupCount > 1;

    return html`
      <li class=${classMap({ item: true, last })}>
        <div class="rail">
          <div
            class=${classMap({ node: true, photo: !!photo, grouped })}
            style=${styleMap({ "--accent": item.accent })}
          >
            ${
              photo
                ? html`<img class="photo-img" src=${item.picture!} alt="" loading="lazy" />`
                : this._renderIcon(item)
            }
          </div>
          <div class="line"></div>
        </div>
        <div
          class=${classMap({ row: true, clickable })}
          style=${styleMap({ "--accent": item.accent })}
          role=${clickable ? "button" : "text"}
          tabindex=${clickable ? "0" : "-1"}
          aria-label=${plainSentence(item)}
          @click=${() => this._onRowClick(item)}
          @keydown=${(ev: KeyboardEvent) => this._onRowKey(ev, item)}
        >
          <div class="body">
            <div class="primary">
              ${
                item.text ? item.text : html`<span class="subject">${item.name}</span> ${item.verb}`
              }
              ${item.count > 1 ? html`<span class="count">×${item.count}</span>` : nothing}
            </div>
            ${
              item.details?.length
                ? html`<div class="secondary">${item.details.join(" · ")}</div>`
                : nothing
            }
            ${showCause ? this._renderCause(item, avatars) : nothing}
            ${showCause ? this._renderVia(item) : nothing} ${this._renderEffects(item)}
            ${grouped ? this._renderGroupCaption(item, config) : nothing}
            ${grouped && this._expandedGroups.has(item.key) ? this._renderGroupMembers(item) : nothing}
          </div>
          ${this._renderTime(item, config)}
        </div>
      </li>
    `;
  }

  private _renderAvatar(actor: Actor): TemplateResult {
    return actor.picture
      ? html`<img class="avatar" src=${actor.picture} alt="" loading="lazy" />`
      : html`<span class="avatar initial">${actor.name.charAt(0).toUpperCase()}</span>`;
  }

  private _renderCause(item: TimelineItem, avatars: boolean): TemplateResult | typeof nothing {
    const cause = item.cause;
    if (!cause || (!cause.actor && !cause.trigger)) return nothing;
    // A script started by a person: "by Ján, via FIND Phone".
    const actor = cause.by ?? cause.actor;
    const via = cause.by ? cause.actor : undefined;
    const interactive =
      !!actor?.entityId && (this._config?.tap_action ?? DEFAULTS.tap_action) !== "none";
    return html`
      <div class="secondary">
        ${
          actor
            ? html`by${avatars && actor.kind === "user" ? this._renderAvatar(actor) : nothing}
              ${
                interactive
                  ? this._actorLink(actor)
                  : html`<span title=${actor.detail ?? actor.name}>${actor.name}</span>`
              }`
            : nothing
        }${via ? html`, via ${this._actorLink(via)}` : nothing}${actor && cause.trigger ? ", " : nothing}${
          cause.trigger ? html`${actor ? "triggered by" : "by"} ${cause.trigger}` : nothing
        }
      </div>
    `;
  }

  /** A name that opens its entity. A span, not a button, so long names wrap like text. */
  private _actorLink(actor: Actor): TemplateResult {
    const open = (ev: Event) => {
      ev.stopPropagation();
      this._moreInfo(actor.entityId);
    };
    return html`<span
      class="link"
      role="button"
      tabindex="0"
      title=${actor.detail ? `${actor.name} – ${actor.detail}` : actor.name}
      @click=${open}
      @keydown=${(ev: KeyboardEvent) => {
        ev.stopPropagation();
        if (ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          this._moreInfo(actor.entityId);
        }
      }}
      >${actor.name}</span
    >`;
  }

  private _renderVia(item: TimelineItem): TemplateResult | typeof nothing {
    if (!item.via?.length) return nothing;
    const interactive = (this._config?.tap_action ?? DEFAULTS.tap_action) !== "none";
    return html`<div class="secondary">
      via
      ${item.via.map(
        (actor, i) =>
          html`${i ? ", " : nothing}${
            actor.entityId && interactive ? this._actorLink(actor) : actor.name
          }`,
      )}
    </div>`;
  }

  /** What one action caused: a line per thing, under the entry that started it. */
  /** "5 changes in the last 2 min", with a chevron that reveals the earlier actions. */
  private _renderGroupCaption(item: TimelineItem, config: WhatHappenedConfig): TemplateResult {
    const minutes = config.group_window_minutes ?? DEFAULTS.group_window_minutes;
    const lang = this._hass?.locale?.language;
    const text = t("{count} changes in the last {minutes} min", lang, {
      count: item.groupCount!,
      minutes,
    });
    const expanded = this._expandedGroups.has(item.key);
    return html`
      <div
        class="secondary group-caption"
        role="button"
        tabindex="0"
        aria-expanded=${expanded ? "true" : "false"}
        @click=${(ev: Event) => this._toggleGroup(ev, item.key)}
        @keydown=${(ev: KeyboardEvent) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            this._toggleGroup(ev, item.key);
          }
        }}
      >
        <ha-icon class="chevron" icon=${expanded ? "mdi:chevron-up" : "mdi:chevron-down"}></ha-icon>
        ${text}
      </div>
    `;
  }

  /** The earlier actions folded into a grouped entry, oldest first. */
  private _renderGroupMembers(item: TimelineItem): TemplateResult {
    const interactive = (this._config?.tap_action ?? DEFAULTS.tap_action) !== "none";
    return html`<ul class="group-members">
      ${item.group?.map((member) => {
        const stateObj =
          member.entityId && !member.fixedIcon ? this._hass?.states[member.entityId] : undefined;
        const clickable = interactive && !!member.entityId;
        return html`<li
          class=${classMap({ "group-member": true, clickable })}
          role=${clickable ? "button" : "text"}
          tabindex=${clickable ? "0" : "-1"}
          @click=${(ev: Event) => {
            if (!clickable) return;
            ev.stopPropagation();
            this._moreInfo(member.entityId);
          }}
          @keydown=${(ev: KeyboardEvent) => {
            if ((ev.key === "Enter" || ev.key === " ") && clickable) {
              ev.stopPropagation();
              ev.preventDefault();
              this._moreInfo(member.entityId);
            }
          }}
        >
          <span class="gm-icon"
            >${
              stateObj
                ? html`<ha-state-icon
                    .hass=${this._hass}
                    .stateObj=${stateObj}
                    .stateValue=${member.stateValue}
                  ></ha-state-icon>`
                : html`<ha-icon .icon=${member.icon}></ha-icon>`
            }</span
          >
          <span class="gm-text"><span class="gm-name">${member.name}</span> ${member.verb}</span>
          <span class="gm-time">${formatTime(member.when, this._hass)}</span>
        </li>`;
      })}
    </ul>`;
  }

  private _renderEffects(item: TimelineItem): TemplateResult | typeof nothing {
    if (!item.effects?.length) return nothing;
    const interactive = (this._config?.tap_action ?? DEFAULTS.tap_action) !== "none";
    return html`<ul class="effects">
      ${item.effects.map((effect) => {
        const stateObj =
          effect.entityId && !effect.fixedIcon ? this._hass?.states[effect.entityId] : undefined;
        const clickable = interactive && !!effect.entityId;
        return html`<li
          class=${classMap({ effect: true, clickable })}
          style=${styleMap({ "--accent": effect.accent })}
          role=${clickable ? "button" : "text"}
          tabindex=${clickable ? "0" : "-1"}
          @click=${(ev: Event) => {
            if (!clickable) return;
            ev.stopPropagation();
            this._moreInfo(effect.entityId);
          }}
          @keydown=${(ev: KeyboardEvent) => {
            if (ev.key === "Enter" || ev.key === " ") {
              ev.stopPropagation();
              ev.preventDefault();
              if (clickable) this._moreInfo(effect.entityId);
            }
          }}
        >
          <span class="e-icon"
            >${
              stateObj
                ? html`<ha-state-icon
                    .hass=${this._hass}
                    .stateObj=${stateObj}
                    .stateValue=${effect.stateValue}
                  ></ha-state-icon>`
                : html`<ha-icon .icon=${effect.icon}></ha-icon>`
            }</span
          >
          <span class="e-text"
            ><span class="e-name">${effect.name}</span> ${effect.verb}${
              effect.count && effect.count > 1
                ? html`<span class="e-count"> ×${effect.count}</span>`
                : nothing
            }${
              effect.details?.length
                ? html`<span class="e-details"> · ${effect.details.join(" · ")}</span>`
                : nothing
            }</span
          >
        </li>`;
      })}
    </ul>`;
  }

  private _renderTime(item: TimelineItem, config: WhatHappenedConfig): TemplateResult {
    const mode = config.time_display ?? DEFAULTS.time_display;
    const abs = formatTime(item.when, this._hass);
    const rel = formatRelative(item.when, this._now, this._hass);
    return html`
      <div class="time" title=${formatDateTime(item.when, this._hass)}>
        ${mode !== "relative" ? html`<span class="abs">${abs}</span>` : nothing}
        ${mode !== "absolute" ? html`<span class="rel">${rel}</span>` : nothing}
      </div>
    `;
  }
}
