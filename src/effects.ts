import { ACTOR_ICONS, stateColor } from "./appearance";
import type { Actor, EffectLine, HomeAssistant, TimelineItem } from "./types";

/**
 * One action, one entry. Pressing a button that runs an automation which speaks, sets three
 * displays and a helper used to be four lines. Now the press is the entry, with what it caused
 * listed underneath:
 *
 *   "4 – Prídem onedlho" was pressed             by Ján
 *   via DevControl – Hlásenie kódu
 *     Atom Echo 01 said “Kod 4”
 *     3 text entities changed to Kod 4
 *     Hlásenie – kto hlási changed to Ján
 *
 * Without a visible trigger entity (a timer, say) the automation heads the entry.
 */

const CLUSTER_GAP_MS = 30_000;
/** A plain service call (no person, no automation on record) this close to a cluster is part of it. */
const LOOSE_BEFORE_MS = 5_000;
const LOOSE_AFTER_MS = 10_000;
const SCRIPT_STATE_WINDOW_MS = 30_000;

function line(item: TimelineItem): EffectLine {
  return {
    key: item.key,
    domain: item.domain,
    name: item.name,
    verb: item.verb,
    entityId: item.entityId,
    icon: item.icon,
    fixedIcon: item.fixedIcon,
    stateValue: item.stateValue,
    accent: item.accent,
    details: item.details,
  };
}

function viaOf(effects: TimelineItem[]): Actor[] {
  const seen = new Set<string>();
  const out: Actor[] = [];
  for (const e of effects) {
    const actor = e.cause?.actor;
    const key = actor?.entityId ?? actor?.name;
    if (
      actor &&
      (actor.kind === "automation" || actor.kind === "script") &&
      key &&
      !seen.has(key)
    ) {
      seen.add(key);
      out.push(actor);
    }
  }
  return out;
}

/** A script switching on and off is a script that ran. */
function isScriptState(item: TimelineItem): boolean {
  return item.domain === "script" && !item.isRun && /^was turned (on|off)$/.test(item.verb);
}

/** One "ran" line per script, however many times its state flipped. */
function scriptRuns(states: TimelineItem[]): TimelineItem[] {
  const seen = new Map<string, TimelineItem>();
  for (const item of states) {
    const key = item.entityId ?? item.name;
    if (!seen.has(key))
      seen.set(key, { ...item, verb: "ran", stateValue: undefined, tone: "active" });
  }
  return [...seen.values()];
}

/** Four identical notifications in a row are one line with a count. */
function mergeRepeats(lines: EffectLine[]): EffectLine[] {
  const out: EffectLine[] = [];
  for (const l of lines) {
    const last = out[out.length - 1];
    if (
      last &&
      last.name === l.name &&
      last.verb === l.verb &&
      (last.details ?? []).join() === (l.details ?? []).join()
    ) {
      last.count = (last.count ?? 1) + 1;
    } else {
      out.push({ ...l });
    }
  }
  return out;
}

function headCause(cluster: TimelineItem[]): TimelineItem["cause"] {
  const by = cluster.find((c) => c.cause?.by)?.cause?.by;
  const trigger = triggerOf(cluster);
  return by || trigger ? { actor: by, ...trigger } : undefined;
}

function triggerOf(cluster: TimelineItem[]) {
  const withTrigger = cluster.find((c) => c.cause?.trigger);
  return withTrigger
    ? {
        trigger: withTrigger.cause!.trigger,
        triggerEntityId: withTrigger.cause!.triggerEntityId,
      }
    : undefined;
}

/**
 * Which trigger an effect belongs to. The entity that started the automation identifies it
 * whether or not its own log row is available; without an entity, the trigger text does.
 */
function triggerKey(item: TimelineItem, useText: boolean): string | undefined {
  const cause = item.cause;
  const entity = cause?.triggerEntityId ?? cause?.source?.entityId;
  if (entity) return `entity|${entity}`;
  return useText && cause?.trigger ? `text|${cause.trigger}` : undefined;
}

/**
 * Two different triggers inside one burst (two buttons pressed within seconds) are two actions.
 * Effects that do not say what triggered them join the nearest one.
 */
function splitByTrigger(clusters: TimelineItem[][]): TimelineItem[][] {
  return clusters.flatMap((cluster) => {
    const anyEntity = cluster.some((c) => c.cause?.triggerEntityId ?? c.cause?.source?.entityId);
    const keyOf = (c: TimelineItem) => triggerKey(c, !anyEntity);
    const keyed = cluster.filter((c) => keyOf(c));
    const keys = new Set(keyed.map((c) => keyOf(c)!));
    if (keys.size <= 1) return [cluster];
    const parts = new Map<string, TimelineItem[]>([...keys].map((k) => [k, []]));
    for (const c of cluster) {
      let key = keyOf(c);
      if (!key) {
        let best = Infinity;
        for (const other of keyed) {
          const gap = Math.abs(other.when - c.when);
          if (gap < best) {
            best = gap;
            key = keyOf(other);
          }
        }
      }
      parts.get(key!)!.push(c);
    }
    return [...parts.values()];
  });
}

export function groupEffects(hass: HomeAssistant, items: TimelineItem[]): TimelineItem[] {
  // Everything one automation or script did. Effects of one action happen within seconds of
  // each other; what each effect knows about its trigger varies (one logbook line names the
  // pressed button, the next does not), so the automation is what ties them together.
  const byKey = new Map<string, TimelineItem[]>();
  for (const item of items) {
    const cause = item.cause;
    const actor = cause?.actor;
    if (!actor?.entityId || (actor.kind !== "automation" && actor.kind !== "script")) continue;
    if (item.effects) continue;
    const key = actor.entityId;
    const list = byKey.get(key);
    if (list) list.push(item);
    else byKey.set(key, [item]);
  }

  const removed = new Set<TimelineItem>();
  const added: TimelineItem[] = [];
  // A script or automation calls input_select.select_option; the log records that change as a
  // bare service call with no trace of who made it.
  const loose = items.filter((i) => !i.rich && i.cause?.actor?.kind === "service");

  for (const [, all] of byKey) {
    // Split into bursts: effects of one press happen within seconds of each other.
    const sorted = [...all].sort((a, b) => a.when - b.when);
    const clusters: TimelineItem[][] = [];
    for (const item of sorted) {
      const last = clusters[clusters.length - 1];
      if (last && item.when - last[last.length - 1].when <= CLUSTER_GAP_MS) last.push(item);
      else clusters.push([item]);
    }

    for (const cluster of splitByTrigger(clusters)) {
      cluster.sort((a, b) => a.when - b.when);
      const source = cluster.find((c) => c.cause?.source)?.cause?.source;
      // One effect of a visible sensor is better told in one line. One effect of a person's
      // press, or of a press that is not worth a row by itself, is told as "pressed, which
      // caused ...", the same way as several effects.
      // "TTS Announce Script was turned on" and "turned off" are one thing: it ran. They do not
      // count as separate effects, and appear as a single "ran" line.
      const states = cluster.filter(isScriptState);
      const real = cluster.filter((c) => !states.includes(c));
      if (real.length === 0) continue;
      // A script or automation that a person started is told as one entry even for one effect.
      const byPerson = real.some((c) => c.cause?.by);
      if (real.length < 2 && source?.cause?.actor?.kind !== "user" && !source?.soft && !byPerson) {
        continue;
      }
      cluster.splice(0, cluster.length, ...real);
      for (const item of loose) {
        if (
          !removed.has(item) &&
          !cluster.includes(item) &&
          item.when >= cluster[0].when - LOOSE_BEFORE_MS &&
          item.when <= cluster[cluster.length - 1].when + LOOSE_AFTER_MS
        ) {
          cluster.push(item);
        }
      }
      cluster.sort((a, b) => a.when - b.when);
      const first = cluster[0];
      const via = viaOf(cluster);
      const effects = mergeRepeats(
        [...cluster, ...scriptRuns(states)].sort((a, b) => a.when - b.when).map(line),
      );

      let head: TimelineItem;
      if (source) {
        head = {
          ...source,
          soft: undefined,
          key: `group|${source.key}|${first.key}`,
          effects,
          via,
          count: 1,
          rich: true,
        };
      } else {
        const actor = via[0];
        const kind = actor.kind === "script" ? "script" : "automation";
        head = {
          key: `group|${first.key}`,
          when: first.when,
          entityId: actor.entityId,
          domain: kind,
          name: actor.name,
          verb: "ran",
          tone: "active",
          icon: ACTOR_ICONS[kind],
          isPerson: false,
          isRun: false,
          count: 1,
          rich: true,
          cause: headCause(cluster),
          effects,
          accent: stateColor(kind, undefined, "on", "active", true),
        };
      }
      for (const c of [...cluster, ...states]) removed.add(c);
      // "FIND Phone was turned on" is the script itself: the entry that is now headed by it.
      if (!source) {
        for (const item of items) {
          if (
            isScriptState(item) &&
            item.entityId === head.entityId &&
            item.when >= first.when - SCRIPT_STATE_WINDOW_MS &&
            item.when <= cluster[cluster.length - 1].when + SCRIPT_STATE_WINDOW_MS
          ) {
            removed.add(item);
          }
        }
      }
      added.push(head);
    }
  }
  void hass;
  const grouped = removed.size ? [...items.filter((i) => !removed.has(i)), ...added] : items;
  return tellScriptsAsRuns(grouped);
}

/**
 * A script that has nothing visible to group still ran; it did not "turn on" and "turn off".
 * The "on" row becomes "ran", the "off" row that closes it is dropped.
 */
function tellScriptsAsRuns(items: TimelineItem[]): TimelineItem[] {
  const states = items.filter(isScriptState);
  if (!states.length) return items;
  const ons = states.filter((s) => s.verb === "was turned on");
  const drop = new Set<TimelineItem>();
  const out = items.map((item) => {
    if (!states.includes(item)) return item;
    const key = item.entityId ?? item.name;
    if (item.verb === "was turned on") {
      return { ...item, verb: "ran", stateValue: undefined, tone: "active" as const };
    }
    const opened = ons.some(
      (o) =>
        (o.entityId ?? o.name) === key && o.when <= item.when && item.when - o.when <= 5 * 60_000,
    );
    if (opened) drop.add(item);
    return item;
  });
  return out.filter((i) => !drop.has(i));
}
