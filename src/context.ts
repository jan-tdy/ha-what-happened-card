import { t } from "./strings";
import type { Actor, Cause, HomeAssistant, LogbookEntry } from "./types";

const ENTITY_ID_RE = /\b([a-z_]+)\.([a-z0-9_]+)\b/g;

/** Replace raw entity ids inside a free text with their friendly names. */
export function humanizeEntityIds(hass: HomeAssistant, text: string): string {
  return text.replace(ENTITY_ID_RE, (match) => {
    const name = hass.states[match]?.attributes.friendly_name;
    return name ?? match;
  });
}

export interface PersonInfo {
  entityId: string;
  name: string;
  picture?: string;
}

export function personByUserId(hass: HomeAssistant, userId: string): PersonInfo | undefined {
  for (const [entityId, stateObj] of Object.entries(hass.states)) {
    if (entityId.startsWith("person.") && stateObj.attributes.user_id === userId) {
      return {
        entityId,
        name: stateObj.attributes.friendly_name ?? entityId,
        picture: stateObj.attributes.entity_picture,
      };
    }
  }
  return undefined;
}

/** First entity id mentioned in a raw trigger description such as "state of sensor.x". */
export function firstEntityId(text: string | undefined): string | undefined {
  if (!text) return undefined;
  return text.match(/\b[a-z_]+\.[a-z0-9_]+\b/)?.[0];
}

function rawTrigger(entry: LogbookEntry): string | undefined {
  if (entry.context_source) return entry.context_source;
  if (entry.context_message?.startsWith("triggered by ")) {
    return entry.context_message.slice("triggered by ".length);
  }
  return undefined;
}

/** Make raw trigger descriptions read naturally. */
export function friendlyTrigger(text: string, lang?: string): string {
  return text.replace(/event 'automation_triggered'/g, t("another automation", lang));
}

function triggerFrom(hass: HomeAssistant, entry: LogbookEntry): string | undefined {
  let raw = entry.context_source;
  if (!raw && entry.context_message?.startsWith("triggered by ")) {
    raw = entry.context_message.slice("triggered by ".length);
  }
  return raw ? friendlyTrigger(humanizeEntityIds(hass, raw), hass.locale?.language) : undefined;
}

function userActor(hass: HomeAssistant, userId: string): Actor {
  const person = personByUserId(hass, userId);
  if (person) {
    return { kind: "user", name: person.name, entityId: person.entityId, picture: person.picture };
  }
  if (hass.user && hass.user.id === userId) return { kind: "user", name: hass.user.name };
  return { kind: "user", name: t("A user", hass.locale?.language) };
}

function nameOf(hass: HomeAssistant, entityId: string | undefined, fallback?: string): string {
  return (
    (entityId ? hass.states[entityId]?.attributes.friendly_name : undefined) ??
    fallback ??
    entityId ??
    "Unknown"
  );
}

/**
 * Work out *why* something happened, from the Home Assistant context that the
 * logbook attaches to every entry.
 */
export function resolveCause(hass: HomeAssistant, entry: LogbookEntry): Cause | undefined {
  const eventType = entry.context_event_type;

  if (eventType === "automation_triggered" || eventType === "script_started") {
    const kind = eventType === "automation_triggered" ? "automation" : "script";
    const actor: Actor = {
      kind,
      name: nameOf(
        hass,
        entry.context_entity_id,
        entry.context_name ?? entry.context_entity_id_name,
      ),
      entityId: entry.context_entity_id,
    };
    return {
      actor,
      trigger: triggerFrom(hass, entry),
      triggerEntityId: firstEntityId(rawTrigger(entry)),
    };
  }

  if (entry.context_user_id) {
    const actor = userActor(hass, entry.context_user_id);
    if (entry.context_domain && entry.context_service) {
      actor.detail = `${entry.context_domain}.${entry.context_service}`;
    }
    return { actor };
  }

  if (eventType === "call_service" && entry.context_domain && entry.context_service) {
    const service = `${entry.context_domain}.${entry.context_service}`;
    if (entry.context_domain === "scene") {
      return { actor: { kind: "scene", name: t("A scene", hass.locale?.language), detail: service } };
    }
    return { actor: { kind: "service", name: service, detail: service } };
  }

  if (eventType === "logbook_entry" && entry.context_name) {
    return { actor: { kind: "other", name: entry.context_name } };
  }

  if (entry.context_entity_id) {
    const actor: Actor = {
      kind: "entity",
      name: nameOf(hass, entry.context_entity_id, entry.context_entity_id_name),
      entityId: entry.context_entity_id,
      detail: entry.context_message,
    };
    return { actor };
  }

  if (entry.context_name) {
    return { actor: { kind: "other", name: entry.context_name } };
  }

  return undefined;
}

/** Trigger text for entries that *are* an automation/script run. */
export function runTrigger(hass: HomeAssistant, entry: LogbookEntry): string | undefined {
  const raw =
    entry.source ??
    (entry.message?.startsWith("triggered by ")
      ? entry.message.slice("triggered by ".length)
      : undefined);
  return raw ? friendlyTrigger(humanizeEntityIds(hass, raw), hass.locale?.language) : undefined;
}
