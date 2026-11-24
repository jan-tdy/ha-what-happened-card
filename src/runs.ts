import { ACTOR_ICONS, stateColor } from "./appearance";
import type { ActionEvent } from "./trace";
import type { Actor, AutomationRuns, HomeAssistant, TimelineItem } from "./types";
import { t } from "./strings";

/**
 * Most automation and script runs are plumbing: a helper toggled, a summary refreshed. Showing
 * "AI summaries was triggered" is noise. What deserves an entry is what a run *did* that leaves
 * no state change of its own: something it said on a speaker, or a notification it sent.
 *
 * Those become entries of their own, in the usual shape:
 *   Kitchen speaker said "Someone is at the front door"
 *   by Announce visitor, triggered by Front door was opened
 */

const WINDOW_MS = 90_000;

function names(hass: HomeAssistant, entityIds: string[]): string {
  return entityIds.map((id) => hass.states[id]?.attributes.friendly_name ?? id).join(", ");
}

function actionItem(
  hass: HomeAssistant,
  run: TimelineItem,
  actor: Actor,
  action: ActionEvent,
  index: number,
  useColor: boolean,
  by?: Actor,
): TimelineItem {
  const say = action.kind === "say";
  return {
    key: `action|${run.key}|${index}`,
    when: run.when,
    entityId: say ? action.speakers[0] : undefined,
    domain: say ? "media_player" : "notify",
    name: say
      ? action.speakers.length
        ? names(hass, action.speakers)
        : t("Speaker", hass.locale?.language)
      : t("Notification", hass.locale?.language),
    verb: say
      ? t("said {text}", hass.locale?.language, { text: `“${action.text}”` })
      : t("sent {text}", hass.locale?.language, { text: `“${action.title ? `${action.title}: ` : ""}${action.text}”` }),
    tone: "active",
    icon: say ? "mdi:bullhorn" : "mdi:bell-ring",
    fixedIcon: true,
    isPerson: false,
    isRun: false,
    count: 1,
    rich: true,
    cause: {
      actor,
      by,
      trigger: run.cause?.trigger,
      triggerEntityId: run.cause?.triggerEntityId,
    },
    accent: stateColor("media_player", undefined, "playing", "active", useColor),
  };
}

/**
 * Replace plain runs with entries for what they said or sent (or keep every run with
 * `automation_runs: all`, or drop everything with `none`).
 */
export function convertRuns(
  hass: HomeAssistant,
  items: TimelineItem[],
  mode: AutomationRuns,
  useColor: boolean,
  resolveRun: ((run: TimelineItem) => ActionEvent[] | undefined) | undefined,
  /** Automations and scripts the user asked to see: their runs stay listed. */
  keepRuns: ReadonlySet<string> = new Set(),
): TimelineItem[] {
  const hidden = new Set<TimelineItem>();
  const added: TimelineItem[] = [];

  for (const run of items) {
    if (!run.isRun || run.rich) continue;
    if (mode !== "all" && !(run.entityId && keepRuns.has(run.entityId))) hidden.add(run);
    if (mode === "none" || !resolveRun) continue;

    const actions = resolveRun(run) ?? [];
    const kind = run.domain === "script" ? "script" : "automation";
    const own: Actor = { kind, name: run.name, entityId: run.entityId, icon: ACTOR_ICONS[kind] };
    // A script started by an automation: the automation is who did it, the script only how.
    // A script or automation started by a person: it did it, on that person's behalf.
    const by = run.cause?.actor?.kind === "user" ? run.cause.actor : undefined;
    const actor = by ? own : (run.cause?.actor ?? own);
    const owners = new Set([run.entityId, actor.entityId]);
    actions.forEach((action, index) => {
      added.push(actionItem(hass, run, actor, action, index, useColor, by));
      // "Kitchen speaker started playing" is implied by what it said.
      for (const other of items) {
        if (
          other !== run &&
          other.entityId &&
          action.speakers.includes(other.entityId) &&
          owners.has(other.cause?.actor?.entityId) &&
          Math.abs(other.when - run.when) <= WINDOW_MS
        ) {
          hidden.add(other);
        }
      }
    });
  }
  return [...items.filter((i) => !hidden.has(i)), ...added];
}
