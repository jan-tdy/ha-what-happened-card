import type { HomeAssistant, TimelineItem } from "./types";

/**
 * Taming noisy installations without any manual entity picking.
 *
 * - Chatty entities (a clock sensor changing every minute, an automation that runs every
 *   15 minutes) become one summary entry instead of hundreds of lines.
 * - Bursts (20 update entities switching in the same second, four lights of one group)
 *   become one entry that lists the members.
 */

export const CHATTY_MIN_EVENTS = 10;
export const BURST_WINDOW_MS = 10_000;
export const BURST_MIN_ITEMS = 3;

export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function keyOf(item: TimelineItem): string {
  return item.entityId ?? item.name;
}

/**
 * Entities with at least 10 entries that happened at a pace of one per hour or faster,
 * measured over the span they were actually active (so a job that ran every 15 minutes for
 * three hours counts, a lamp switched ten times over a whole day does not).
 */
export function summarizeChatty(
  items: TimelineItem[],
  mode: "summarize" | "hide" | "show",
  /** Entities the user asked to see: never summarized or hidden. */
  exempt: ReadonlySet<string> = new Set(),
): TimelineItem[] {
  if (mode === "show") return items;
  const groups = new Map<string, TimelineItem[]>();
  for (const item of items) {
    if (item.rich || (item.entityId && exempt.has(item.entityId))) continue;
    const key = keyOf(item);
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }

  const chatty = new Set<string>();
  for (const [key, list] of groups) {
    if (list.length < CHATTY_MIN_EVENTS) continue;
    const spanHours = (list[0].when - list[list.length - 1].when) / 3_600_000;
    if (spanHours <= list.length) chatty.add(key);
  }
  if (chatty.size === 0) return items;

  const out: TimelineItem[] = [];
  const emitted = new Set<string>();
  for (const item of items) {
    const key = keyOf(item);
    if (item.rich || !chatty.has(key) || (item.entityId && exempt.has(item.entityId))) {
      out.push(item);
      continue;
    }
    if (emitted.has(key) || mode === "hide") continue;
    emitted.add(key);
    const group = groups.get(key)!;
    const n = group.length; // `item` is the newest because input is sorted newest first
    // An event entity only fires, so "changed" says nothing: name what it reported.
    const event = item.domain === "event";
    const sameVerb = event && group.every((g) => g.verb === item.verb);
    out.push({
      ...item,
      key: `chatty|${key}`,
      verb: item.isRun
        ? `was triggered ${n} times`
        : sameVerb
          ? `${item.verb} ${n} times`
          : event
            ? `fired ${n} times`
            : `changed ${n} times`,
      details: item.isRun || sameVerb ? undefined : [`latest: ${truncate(item.verb, 70)}`],
      isRun: false,
      count: 1,
      rich: true,
    });
  }
  return out;
}

const PLURALS: Record<string, string> = {
  update: "updates",
  light: "lights",
  switch: "switches",
  binary_sensor: "sensors",
  sensor: "sensors",
  cover: "covers",
  fan: "fans",
  lock: "locks",
  climate: "thermostats",
  media_player: "media players",
  input_boolean: "toggles",
  automation: "automations",
  script: "scripts",
  button: "buttons",
  number: "numbers",
  select: "selects",
};

function plural(domain: string): string {
  return PLURALS[domain] ?? `${domain.replace(/_/g, " ")} entities`;
}

function pluralVerb(verb: string): string {
  if (verb.startsWith("was ")) return `were ${verb.slice(4)}`;
  if (verb.startsWith("is ")) return `are ${verb.slice(3)}`;
  return verb;
}

function sameCause(a: TimelineItem, b: TimelineItem): boolean {
  return (
    (a.cause?.actor?.name ?? "") === (b.cause?.actor?.name ?? "") &&
    (a.cause?.trigger ?? "") === (b.cause?.trigger ?? "")
  );
}

/** Three or more entities of one domain doing the same thing within seconds become one entry. */
export function groupBursts(items: TimelineItem[]): TimelineItem[] {
  interface Cluster {
    members: TimelineItem[];
    oldest: number;
  }
  const open = new Map<string, Cluster>();
  const clusters: Cluster[] = [];
  for (const item of items) {
    if (item.rich || !item.entityId) continue;
    const key = `${item.domain}|${item.verb}|${item.tone}`;
    const cluster = open.get(key);
    if (cluster && cluster.oldest - item.when <= BURST_WINDOW_MS) {
      cluster.members.push(item);
      cluster.oldest = item.when;
    } else {
      const fresh = { members: [item], oldest: item.when };
      open.set(key, fresh);
      clusters.push(fresh);
    }
  }

  const replaced = new Map<TimelineItem, TimelineItem | null>();
  for (const { members } of clusters) {
    // One entity repeating itself is not a burst of several entities.
    const distinct = new Set(members.map((m) => m.entityId));
    if (distinct.size < BURST_MIN_ITEMS) continue;
    const newest = members[0];
    const names = [...new Set(members.map((m) => m.name))];
    const shown = names.slice(0, 6).join(", ");
    replaced.set(newest, {
      ...newest,
      key: `burst|${newest.key}`,
      entityId: undefined,
      name: `${distinct.size} ${plural(newest.domain)}`,
      verb: pluralVerb(newest.verb),
      details: [names.length > 6 ? `${shown} and ${names.length - 6} more` : shown],
      cause: members.every((m) => sameCause(m, newest)) ? newest.cause : undefined,
      count: 1,
      stateValue: undefined,
      rich: true,
    });
    for (const member of members.slice(1)) replaced.set(member, null);
  }
  if (replaced.size === 0) return items;
  return items.flatMap((item) => {
    if (!replaced.has(item)) return [item];
    const swap = replaced.get(item);
    return swap ? [swap] : [];
  });
}

const GROUP_WINDOW_MS = 30_000;

/**
 * A light group switches together with its members, so the log holds the group and every
 * member doing the same thing. Show the group only. A member that changes alone (the group
 * stays on because other members are on) has no matching group entry and is kept.
 */
export function hideGroupMembers(
  hass: HomeAssistant,
  items: TimelineItem[],
  /** Entities the user asked for by name: never hidden. */
  picked: ReadonlySet<string> = new Set(),
): TimelineItem[] {
  const hidden = new Set<TimelineItem>();
  for (const group of items) {
    if (group.rich || !group.entityId) continue;
    const members = hass.states[group.entityId]?.attributes.entity_id;
    if (!Array.isArray(members) || members.length === 0) continue;
    const memberIds = new Set<string>(members.filter((m): m is string => typeof m === "string"));
    for (const other of items) {
      if (
        other !== group &&
        !other.rich &&
        other.entityId &&
        !picked.has(other.entityId) &&
        memberIds.has(other.entityId) &&
        other.verb === group.verb &&
        Math.abs(other.when - group.when) <= GROUP_WINDOW_MS
      ) {
        hidden.add(other);
      }
    }
  }
  return hidden.size ? items.filter((i) => !hidden.has(i)) : items;
}
