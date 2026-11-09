import { firstEntityId, resolveCause, runTrigger } from "./context";
import { ACTOR_ICONS, fallbackIcon, stateColor } from "./appearance";
import { convertRuns } from "./runs";
import type { ActionEvent } from "./trace";
import { REPLACED_STATES, REPLACE_WINDOW_MS } from "./vacuum";
import {
  RESTART_EXEMPT_DOMAINS,
  hasKnownCause,
  isMeaningful,
  isRunEntry,
  pickedEntities,
} from "./relevance";
import { groupBursts, hideGroupMembers, summarizeChatty } from "./noise";
import { applyColors } from "./colors";
import { groupEffects } from "./effects";
import { foldTrackers, smartFilteringOn } from "./people";
import { dayKey, formatDayLabel } from "./format";
import { describeState } from "./state-message";
import type {
  DayGroup,
  HomeAssistant,
  LogbookEntry,
  TimelineItem,
  WhatHappenedConfig,
} from "./types";

export const DEFAULTS = {
  hours_to_show: 24,
  max_entries: 50,
  order: "newest_first",
  show_cause: true,
  show_avatars: true,
  show_day_headers: true,
  state_color: true,
  compact: false,
  time_display: "both",
  tap_action: "more-info",
  vacuum_details: true,
  hide_unavailable: true,
  activity: "meaningful",
  automation_runs: "actions",
  show_actions: true,
  chatty: "summarize",
  show_diagnostic: false,
  collapse_repeats: true,
} as const;

export const LIMITS = { hours: [1, 720], entries: [1, 500] } as const;

const CHAIN_WINDOW_MS = 60 * 1000;
const COLLAPSE_WINDOW_MS = 10 * 60 * 1000;
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

export function entryKey(entry: LogbookEntry): string {
  return [entry.when, entry.entity_id ?? entry.name, entry.state ?? entry.message, entry.context_id]
    .map((v) => v ?? "")
    .join("|");
}

function clamp(value: unknown, [min, max]: readonly [number, number], fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function effectiveHours(config: WhatHappenedConfig): number {
  return clamp(config.hours_to_show, LIMITS.hours, DEFAULTS.hours_to_show);
}

export function effectiveMaxEntries(config: WhatHappenedConfig): number {
  return clamp(config.max_entries, LIMITS.entries, DEFAULTS.max_entries);
}

function domainOf(entry: LogbookEntry): string {
  return entry.domain ?? entry.entity_id?.split(".")[0] ?? "homeassistant";
}

const GAP_STATES = new Set(["unavailable", "unknown"]);

/** Config filters shared by the live buffer (ingest) and the timeline builder. */
export function passesFilters(
  entry: LogbookEntry,
  config: WhatHappenedConfig,
  allowed: Set<string> | undefined,
  hass?: HomeAssistant,
  /** Skip the "is it worth showing" checks (an entry that started an automation). */
  forceMeaningful = false,
  /**
   * Let `unavailable` / `unknown` through even with `hide_unavailable`. The live buffer keeps
   * them so `recoveryKeys` can tell a return to the previous state; the timeline still hides them.
   */
  keepGaps = false,
): boolean {
  const domain = domainOf(entry);
  if (
    !forceMeaningful &&
    hass &&
    entry.entity_id &&
    !(config.show_diagnostic ?? DEFAULTS.show_diagnostic)
  ) {
    const reg = hass.entities?.[entry.entity_id];
    const picked = pickedEntities(config, hass).has(entry.entity_id);
    // Diagnostic, config and hidden entities are noise unless the user asked for them by name.
    if (reg && (reg.entity_category || reg.hidden) && !picked) return false;
  }
  if (allowed && (!entry.entity_id || !allowed.has(entry.entity_id))) return false;
  if (entry.entity_id && config.exclude_entities?.includes(entry.entity_id)) return false;
  if (config.include_domains?.length && !config.include_domains.includes(domain)) return false;
  if (config.exclude_domains?.includes(domain)) return false;
  if (
    !forceMeaningful &&
    (config.activity ?? DEFAULTS.activity) === "meaningful" &&
    !isMeaningful(entry, config, hass)
  ) {
    return false;
  }
  const hideUnavailable = config.hide_unavailable ?? DEFAULTS.hide_unavailable;
  if (hideUnavailable && !keepGaps && GAP_STATES.has(entry.state ?? "")) return false;
  return true;
}

/**
 * Keys of entries that only report an entity coming back after `unavailable` or `unknown` in
 * the state it had before the gap (a cloud integration reconnecting, a device rebooting).
 * Nothing changed, so with `hide_unavailable` such a line would read as an event that never
 * happened, like "problem resolved" for a problem that was never there. A return that a person
 * or an action caused is kept, and so is the first return in the window when the state before
 * it is unknown. A return that only follows another entity (a template sensor coming back with
 * its source) is still no change.
 */
function causedByAction(e: LogbookEntry): boolean {
  return Boolean(e.context_user_id || e.context_service || e.context_event_type);
}

export function recoveryKeys(entries: Iterable<LogbookEntry>): Set<string> {
  const byEntity = new Map<string, LogbookEntry[]>();
  for (const e of entries) {
    if (!e.entity_id || e.state === undefined || e.message !== undefined) continue;
    const list = byEntity.get(e.entity_id);
    if (list) list.push(e);
    else byEntity.set(e.entity_id, [e]);
  }
  const keys = new Set<string>();
  for (const list of byEntity.values()) {
    list.sort((a, b) => a.when - b.when);
    let before: string | undefined;
    let inGap = false;
    for (const e of list) {
      if (GAP_STATES.has(e.state!)) {
        inGap = true;
        continue;
      }
      if (inGap && before === e.state && !causedByAction(e)) keys.add(entryKey(e));
      before = e.state;
      inGap = false;
    }
  }
  return keys;
}

function toItem(
  hass: HomeAssistant,
  entry: LogbookEntry,
  config: WhatHappenedConfig,
): TimelineItem {
  const domain = domainOf(entry);
  const stateObj = entry.entity_id ? hass.states[entry.entity_id] : undefined;
  const name =
    entry.name ?? stateObj?.attributes.friendly_name ?? entry.entity_id ?? "Home Assistant";

  let verb: string;
  let tone: TimelineItem["tone"] = "neutral";
  let cause = resolveCause(hass, entry);

  if (entry.state !== undefined && entry.message === undefined) {
    ({ verb, tone } = describeState(
      hass,
      domain,
      entry.entity_id,
      entry.state,
      entry.attributes?.event_type,
    ));
  } else {
    const message = entry.message ?? "did something";
    const triggered = message.match(/^triggered(?: by (.+))?$/);
    if (triggered) {
      verb = "was triggered";
      tone = "active";
      const trigger = runTrigger(hass, entry);
      if (trigger) {
        const raw = entry.source ?? message.replace(/^triggered by /, "");
        cause = { ...cause, trigger, triggerEntityId: firstEntityId(raw) };
      }
    } else {
      verb = message;
      tone = /(error|fail)/i.test(message) ? "alert" : "neutral";
    }
  }

  const actor = cause?.actor;
  if (actor && !actor.icon) actor.icon = ACTOR_ICONS[actor.kind];

  const isPerson = domain === "person";
  const picture = isPerson ? stateObj?.attributes.entity_picture : undefined;
  const useColor = config.state_color ?? DEFAULTS.state_color;

  return {
    key: entryKey(entry),
    when: entry.when * 1000,
    entityId: entry.entity_id,
    domain,
    name,
    verb,
    tone,
    icon: fallbackIcon(domain, entry.icon),
    stateValue: entry.state,
    picture,
    isPerson,
    isRun: isRunEntry(entry),
    cause,
    count: 1,
    accent: stateColor(domain, stateObj?.attributes.device_class, entry.state, tone, useColor),
  };
}

function causeSignature(item: TimelineItem): string {
  const c = item.cause;
  return `${c?.actor?.kind ?? ""}:${c?.actor?.name ?? ""}:${c?.trigger ?? ""}`;
}

/** A vacuum's plain "cleaning"/"docked" line is dropped when the integration has its own entry for it. */
function isStandIn(
  entry: LogbookEntry,
  extra: { items: TimelineItem[]; vacuums: Set<string> } | undefined,
): boolean {
  if (!extra || !entry.entity_id || !extra.vacuums.has(entry.entity_id)) return false;
  const phase = REPLACED_STATES[entry.state ?? ""];
  if (!phase) return false;
  return extra.items.some(
    (i) =>
      i.entityId === entry.entity_id &&
      i.phase === phase &&
      Math.abs(i.when - entry.when * 1000) <= REPLACE_WINDOW_MS,
  );
}

/**
 * One thing that happened should be one entry: when a sensor triggered an
 * automation that switched a device, only the device entry is kept. It explains
 * the whole chain, so the automation run and the triggering state change are folded in.
 */
function mergeChains(
  items: TimelineItem[],
  hideExplainedRuns = true,
  keepRuns: ReadonlySet<string> = new Set(),
): TimelineItem[] {
  const hidden = new Set<TimelineItem>();
  for (const effect of items) {
    const actor = effect.cause?.actor;
    if (!actor?.entityId || (actor.kind !== "automation" && actor.kind !== "script")) continue;

    for (const run of items) {
      if (
        hideExplainedRuns &&
        run.isRun &&
        !(run.entityId && keepRuns.has(run.entityId)) &&
        run.entityId === actor.entityId &&
        Math.abs(run.when - effect.when) <= CHAIN_WINDOW_MS
      ) {
        hidden.add(run);
      }
    }
    const sourceId = effect.cause?.triggerEntityId;
    if (!sourceId) continue;
    const source = items.find(
      (i) =>
        i !== effect &&
        !i.isRun &&
        i.entityId === sourceId &&
        i.when <= effect.when + 5_000 &&
        effect.when - i.when <= CHAIN_WINDOW_MS,
    );
    if (source) {
      hidden.add(source);
      effect.cause = { ...effect.cause, trigger: `${source.name} ${source.verb}`, source };
    }
  }
  return items.filter((i) => !hidden.has(i));
}

function dedupe(
  hass: HomeAssistant,
  items: TimelineItem[],
  config: WhatHappenedConfig,
): TimelineItem[] {
  if (!smartFilteringOn(config)) return items;
  return hideGroupMembers(hass, items, pickedEntities(config, hass));
}

/**
 * Turn raw logbook entries into the grouped, filtered and limited structure the
 * card renders. Pure function so it can be unit-tested.
 */
export function buildTimeline(
  hass: HomeAssistant,
  entries: Iterable<LogbookEntry>,
  config: WhatHappenedConfig,
  now: number,
  allowed?: Set<string>,
  /** Integration-built items, and the vacuums whose plain logbook state changes they replace. */
  extra?: { items: TimelineItem[]; vacuums: Set<string> },
  /** What a run said or sent (from its trace); undefined while that is still loading. */
  resolveRun?: (run: TimelineItem) => ActionEvent[] | undefined,
): DayGroup[] {
  const since = now - effectiveHours(config) * 3_600_000;
  const maxEntries = effectiveMaxEntries(config);
  const collapse = config.collapse_repeats ?? DEFAULTS.collapse_repeats;

  // Integration items outside the window are dropped first, so they can never suppress a
  // logbook line that is still inside it.
  const richItems = (extra?.items ?? []).filter(
    (i) => i.when >= since && i.when <= now + FUTURE_TOLERANCE_MS,
  );
  const standIns = extra ? { items: richItems, vacuums: extra.vacuums } : undefined;

  const list = [...entries];
  const restarts = list
    .filter((e) => e.domain === "homeassistant" && e.message === "started")
    .map((e) => e.when);
  const picked = pickedEntities(config, hass);
  const recovered =
    (config.hide_unavailable ?? DEFAULTS.hide_unavailable) ? recoveryKeys(list) : new Set<string>();

  // Entries that started an automation or script a moment later, for example the press of a
  // button that is not worth a line on its own. They are kept so the action can be headed by
  // them, and dropped again if nothing ends up folded under them.
  const triggerTimes = new Map<string, number[]>();
  for (const e of list) {
    const raw = isRunEntry(e)
      ? (e.source ?? e.message?.replace(/^triggered by /, ""))
      : e.context_event_type === "automation_triggered" || e.context_event_type === "script_started"
        ? (e.context_source ?? e.context_message?.replace(/^triggered by /, ""))
        : undefined;
    const id = firstEntityId(raw);
    if (id) triggerTimes.set(id, [...(triggerTimes.get(id) ?? []), e.when]);
  }
  const startsSomething = (e: LogbookEntry): boolean =>
    !!e.entity_id &&
    (triggerTimes.get(e.entity_id) ?? []).some((at) => e.when <= at + 5 && at - e.when <= 60);
  const softKeys = new Set<string>();
  const restartNoise = (e: LogbookEntry): boolean => {
    if ((config.activity ?? DEFAULTS.activity) !== "meaningful") return false;
    if (e.domain === "homeassistant") {
      // "stopped" is only the first half of "restarted".
      return e.message === "stopped" && restarts.some((t) => t >= e.when && t - e.when <= 900);
    }
    if (
      hasKnownCause(e) ||
      startsSomething(e) ||
      (e.entity_id && picked.has(e.entity_id)) ||
      RESTART_EXEMPT_DOMAINS.has(e.domain ?? e.entity_id?.split(".")[0] ?? "")
    ) {
      return false;
    }
    // Right after Home Assistant starts, dozens of entities restore their state with no cause.
    return restarts.some((t) => e.when >= t - 30 && e.when <= t + 180);
  };

  // An event entity's state is the moment it fired, so the same state twice is one event
  // reported more than once (some integrations write it for every attribute update). The
  // earliest copy is kept, whatever order the buffer is in.
  const repeatedEvents = new Set<LogbookEntry>();
  const firstEvent = new Map<string, LogbookEntry>();
  for (const e of list) {
    if (
      domainOf(e) !== "event" ||
      !e.entity_id ||
      e.state === undefined ||
      e.state === "unavailable" ||
      e.state === "unknown"
    ) {
      continue;
    }
    const key = `${e.entity_id}|${e.state}`;
    const first = firstEvent.get(key);
    if (!first) firstEvent.set(key, e);
    else if (e.when < first.when) {
      repeatedEvents.add(first);
      firstEvent.set(key, e);
    } else repeatedEvents.add(e);
  }
  const sorted = list
    .filter((e) => !repeatedEvents.has(e))
    .filter((e) => {
      const ms = e.when * 1000;
      return ms >= since && ms <= now + FUTURE_TOLERANCE_MS;
    })
    .filter((e) => {
      if (passesFilters(e, config, allowed, hass)) return true;
      if (
        smartFilteringOn(config) &&
        startsSomething(e) &&
        passesFilters(e, config, allowed, hass, true)
      ) {
        softKeys.add(entryKey(e));
        return true;
      }
      return false;
    })
    .filter((e) => !recovered.has(entryKey(e)))
    .filter((e) => !restartNoise(e))
    .filter((e) => !isStandIn(e, standIns))
    .sort((a, b) => b.when - a.when);

  const runs = config.automation_runs ?? DEFAULTS.automation_runs;
  const converted = convertRuns(
    hass,
    [
      ...sorted.map((entry) => {
        const item = toItem(hass, entry, config);
        if (softKeys.has(item.key)) item.soft = true;
        return item;
      }),
      ...richItems,
    ],
    runs,
    config.state_color ?? DEFAULTS.state_color,
    config.show_actions === false ? undefined : resolveRun,
    picked,
  ).sort((a, b) => b.when - a.when);
  // With automation_runs: all, runs stay visible next to what they did.
  const chained = mergeChains(converted, runs !== "all", picked).filter((i) => !i.soft);
  const bursts = groupBursts(
    summarizeChatty(
      dedupe(hass, foldTrackers(hass, chained, config), config),
      config.chatty ?? DEFAULTS.chatty,
      picked,
    ),
  );
  // One action, one entry: what an automation caused moves under the entry that started it.
  const merged = applyColors(
    (smartFilteringOn(config) ? groupEffects(hass, bursts) : bursts).sort(
      (a, b) => b.when - a.when,
    ),
    config,
  );

  const items: TimelineItem[] = [];
  let oldestOfLast = 0;
  for (const item of merged) {
    const last = items[items.length - 1];
    if (
      collapse &&
      last &&
      !item.rich &&
      !last.rich &&
      item.entityId &&
      last.entityId === item.entityId &&
      last.verb === item.verb &&
      causeSignature(last) === causeSignature(item) &&
      oldestOfLast - item.when <= COLLAPSE_WINDOW_MS
    ) {
      last.count += 1;
      oldestOfLast = item.when;
      continue;
    }
    items.push(item);
    oldestOfLast = item.when;
    if (items.length > maxEntries) break;
  }

  const limited = items.slice(0, maxEntries);
  if ((config.order ?? DEFAULTS.order) === "oldest_first") limited.reverse();

  const groups: DayGroup[] = [];
  for (const item of limited) {
    const key = dayKey(item.when);
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) {
      group = { key, label: formatDayLabel(item.when, now), items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}

export function plainSentence(item: TimelineItem): string {
  let text = item.text ?? `${item.name} ${item.verb}`;
  if (item.count > 1) text += ` ${item.count} times`;
  const cause = item.cause;
  if (cause?.actor) text += ` by ${cause.actor.name}`;
  if (cause?.trigger) text += `, triggered by ${cause.trigger}`;
  if (item.details?.length) text += ` (${item.details.join(", ")})`;
  if (item.effects?.length)
    text += `. ${item.effects.map((e) => `${e.name} ${e.verb}`).join(". ")}`;
  return text;
}
