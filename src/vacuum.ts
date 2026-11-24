import { ALERT_COLOR, stateColor } from "./appearance";
import type { Actor, Cause, HomeAssistant, TimelineItem, WhatHappenedConfig } from "./types";
import { t } from "./strings";

/**
 * Support for the TapoVac-ADV integration (`tapo_rv30`). The logbook only knows that the
 * vacuum went "cleaning" and "docked". The integration itself knows which rooms, how
 * long, how much area, who or what started it and why, so those are folded into a
 * single entry per cleaning run.
 */

export const TAPO_PLATFORM = "tapo_rv30";

export interface PlannerLogEntry {
  ts: number; // epoch seconds
  kind: string;
  text: string;
}

export interface HistoryRun {
  started: number; // epoch seconds
  minutes?: number | null;
  area?: number | null;
  emptied_bin?: boolean | number | null;
  error?: number | null;
  start_type?: number | null;
  rule_name?: string | null;
}

export interface VacuumData {
  entityId: string;
  log: PlannerLogEntry[];
  runs: HistoryRun[];
}

export const START_TYPES: Record<number, string> = {
  0: "the robot button",
  1: "the Tapo app",
  2: "Alexa",
  3: "Google Assistant",
  4: "the robot's schedule",
  5: "an automation",
  6: "IFTTT",
  7: "Alice",
};

/**
 * Logbook state changes that a richer integration entry stands in for: "cleaning" is the
 * start of a run and "docked" its finish. "returning", "paused" and the rest stay as they are.
 */
export const REPLACED_STATES: Record<string, "start" | "finish"> = {
  cleaning: "start",
  docked: "finish",
};

/** How far apart a logbook state change and the integration's entry may be. */
export const REPLACE_WINDOW_MS = 10 * 60 * 1000;

/** Planner log kinds worth a timeline entry. `wait`, `pending`, `preview` and `config` are noise. */
const LOG_KINDS = new Set(["start", "done", "override", "return", "docked", "skip", "error"]);

const MATCH_WINDOW_S = 300;

export function findTapoVacuums(hass: HomeAssistant): string[] {
  return Object.values(hass.entities ?? {})
    .filter((e) => e.platform === TAPO_PLATFORM && e.entity_id.startsWith("vacuum."))
    .map((e) => e.entity_id);
}

interface ParsedStart {
  names?: string;
  why?: string;
  byUser: boolean;
}

/** "You started cleaning Kitchen and Hallway. Kitchen: due; nobody home." */
export function parseStart(text: string): ParsedStart {
  const m = text.match(/^(You started|Started) cleaning (.+?)\.(?: (.+))?$/s);
  if (!m) return { byUser: text.startsWith("You") };
  return { byUser: m[1] === "You started", names: m[2], why: m[3]?.replace(/\.$/, "") };
}

function nearestStart(log: PlannerLogEntry[], startedS: number, used: Set<PlannerLogEntry>) {
  let best: PlannerLogEntry | undefined;
  for (const entry of log) {
    if (entry.kind !== "start" || used.has(entry)) continue;
    const gap = Math.abs(entry.ts - startedS);
    if (gap <= MATCH_WINDOW_S && (!best || gap < Math.abs(best.ts - startedS))) best = entry;
  }
  return best;
}

/** "Jan and Veronika came home: finishing the kitchen, then docking." */
export function parseReturn(text: string): { people: string; note: string } | undefined {
  const m = text.match(/^(.+?) came home: (.*?)\.?$/s);
  return m ? { people: m[1], note: m[2] } : undefined;
}

function peopleActor(hass: HomeAssistant, people: string): Actor {
  const names = people.split(/, | and /).map((n) => n.trim());
  const found =
    names.length === 1
      ? Object.values(hass.states).find(
          (s) => s.entity_id.startsWith("person.") && s.attributes.friendly_name === names[0],
        )
      : undefined;
  return {
    kind: "user",
    name: people,
    entityId: found?.entity_id,
    picture: found?.attributes.entity_picture,
  };
}

function plannerActor(lang?: string): Actor {
  return { kind: "other", name: t("Cleaning planner", lang), icon: "mdi:calendar-clock" };
}

function userActor(hass: HomeAssistant): Actor {
  return { kind: "user", name: hass.user?.name ?? "You" };
}

function runDetails(run: HistoryRun, lang?: string): string[] {
  const details: string[] = [];
  if (run.minutes != null) details.push(`${run.minutes} min`);
  if (run.area != null) details.push(`${run.area} m²`);
  if (run.emptied_bin) details.push(t("bin emptied", lang));
  return details;
}

/**
 * Build timeline items for one robot from its planner log and clean history. A run gives
 * two entries, "started cleaning" (rooms, who, why) and t("finished cleaning", lang) (duration,
 * area, bin), because those are two things that happened at two different times.
 */
export function vacuumItems(
  hass: HomeAssistant,
  data: VacuumData,
  config: WhatHappenedConfig,
): TimelineItem[] {
  const stateObj = hass.states[data.entityId];
  const name = stateObj?.attributes.friendly_name ?? data.entityId;
  const useColor = config.state_color ?? true;
  const lang = hass.locale?.language;
  const items: TimelineItem[] = [];
  const used = new Set<PlannerLogEntry>();

  const base = {
    entityId: data.entityId,
    domain: "vacuum",
    name,
    isPerson: false,
    isRun: false,
    count: 1,
    rich: true,
    fixedIcon: true,
  };

  for (const run of data.runs) {
    const start = nearestStart(data.log, run.started, used);
    if (start) used.add(start);
    const parsed = start ? parseStart(start.text) : undefined;
    const failed = !!run.error;

    let cause: Cause | undefined;
    if (start && parsed) {
      cause = { actor: parsed.byUser ? userActor(hass) : plannerActor(lang), trigger: parsed.why };
    } else if (run.start_type != null && START_TYPES[run.start_type]) {
      cause = {
        actor: { kind: "other", name: t(START_TYPES[run.start_type] as any, lang), icon: "mdi:gesture-tap" },
      };
    }

    items.push({
      ...base,
      key: `vac|${data.entityId}|start|${run.started}`,
      when: run.started * 1000,
      verb: parsed?.names ? t("started cleaning {rooms}", lang, { rooms: parsed.names }) : t("started cleaning", lang),
      tone: "active",
      phase: "start",
      icon: "mdi:robot-vacuum",
      details: run.rule_name ? [t("preset {name}", lang, { name: `“${run.rule_name}”` })] : undefined,
      cause,
      accent: stateColor("vacuum", undefined, "cleaning", "active", useColor),
    });

    const endMs = (run.started + (run.minutes ?? 0) * 60) * 1000;
    items.push({
      ...base,
      key: `vac|${data.entityId}|finish|${run.started}`,
      when: Math.max(endMs, run.started * 1000 + 1000),
      verb: failed
        ? t("stopped with error {error}", lang, { error: String(run.error) })
        : parsed?.names
          ? t("finished cleaning {rooms}", lang, { rooms: parsed.names })
          : t("finished cleaning", lang),
      tone: failed ? "alert" : "inactive",
      phase: "finish",
      icon: failed ? "mdi:robot-vacuum-alert" : "mdi:robot-vacuum",
      details: runDetails(run, lang),
      accent: failed
        ? ALERT_COLOR
        : stateColor("vacuum", undefined, "docked", "inactive", useColor),
    });
  }

  // "Sent home" is the planner's reaction to someone coming home: say who.
  const returns = data.log.filter((e) => e.kind === "return");
  const returnFor = new Map<PlannerLogEntry, PlannerLogEntry>();
  const taken = new Set<PlannerLogEntry>();
  for (const docked of data.log.filter((e) => e.kind === "docked")) {
    const source = returns.find(
      (r) => !taken.has(r) && r.ts <= docked.ts && docked.ts - r.ts <= 30 * 60,
    );
    if (source) {
      returnFor.set(docked, source);
      taken.add(source);
    }
  }

  // Planner events that no finished run explains (still running, no record kept, other events).
  const covered = new Set(data.runs.map((r) => r.started));
  for (const entry of data.log) {
    if (!LOG_KINDS.has(entry.kind) || used.has(entry)) continue;
    if (entry.kind === "done" && data.runs.length > 0) continue; // the run entry covers it
    if (
      entry.kind === "start" &&
      [...covered].some((s) => Math.abs(s - entry.ts) <= MATCH_WINDOW_S)
    )
      continue;

    if (taken.has(entry)) continue; // folded into the "sent home" entry below
    const parsed = entry.kind === "start" ? parseStart(entry.text) : undefined;
    const returned = entry.kind === "docked" ? returnFor.get(entry) : undefined;
    const arrival = returned ? parseReturn(returned.text) : undefined;
    if (arrival) {
      items.push({
        ...base,
        key: `vac|${data.entityId}|log|${entry.ts}|docked`,
        when: entry.ts * 1000,
        verb: t("was sent home", lang),
        tone: "neutral",
        icon: "mdi:robot-vacuum",
        details: [arrival.note.charAt(0).toUpperCase() + arrival.note.slice(1)],
        cause: { actor: peopleActor(hass, arrival.people), trigger: t("coming home", lang) },
        accent: stateColor("vacuum", undefined, "docked", "inactive", useColor),
      });
      continue;
    }
    const tone = entry.kind === "error" ? "alert" : entry.kind === "start" ? "active" : "neutral";
    items.push({
      ...base,
      key: `vac|${data.entityId}|log|${entry.ts}|${entry.kind}`,
      when: entry.ts * 1000,
      verb: parsed?.names ? t("started cleaning {rooms}", lang, { rooms: parsed.names }) : "",
      text: parsed?.names ? undefined : entry.text.replace(/\.$/, ""),
      tone,
      phase: entry.kind === "start" ? "start" : entry.kind === "done" ? "finish" : undefined,
      icon: entry.kind === "error" ? "mdi:robot-vacuum-alert" : "mdi:robot-vacuum",
      cause: { actor: parsed?.byUser ? userActor(hass) : plannerActor(lang), trigger: parsed?.why },
      accent:
        tone === "alert"
          ? ALERT_COLOR
          : stateColor(
              "vacuum",
              undefined,
              "cleaning",
              tone === "active" ? "active" : "neutral",
              useColor,
            ),
    });
  }
  return items;
}
