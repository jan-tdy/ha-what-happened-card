import { resolveTargetEntities } from "./targets";
import type { HomeAssistant, LogbookEntry, WhatHappenedConfig } from "./types";

/**
 * What counts as "something that happened" for a person looking at a dashboard: things that
 * were switched, opened, locked, armed or started, and people arriving or leaving.
 *
 * A real installation logs far more than that. Going through a live log, the noise is:
 *  - clocks, text and number sensors, battery and signal values, update entities;
 *  - helpers (input_boolean, input_select, ...) that automations flip as plumbing;
 *  - button entities pressed by nobody in particular, and a device_tracker next to every person;
 *  - the "echo" after Home Assistant starts, when dozens of entities restore their state;
 *  - the same action split over several entities (a script, a speaker, a status LED, ...).
 *
 * `activity: everything` turns all of this filtering off.
 */

/** Things people care about whoever or whatever caused them. */
const CORE_DOMAINS = new Set([
  "light",
  "switch",
  "fan",
  "cover",
  "lock",
  "climate",
  "humidifier",
  "water_heater",
  "valve",
  "siren",
  "alarm_control_panel",
  "media_player",
  "vacuum",
  "lawn_mower",
  "person",
  "device_tracker", // folded into its person (see people.ts), never listed alone
  "scene",
  "event",
  "doorbell",
  "homeassistant",
]);

/** Helper-like entities: worth a line only when a person did it (an automation flipping a helper is plumbing). */
const PERSON_ONLY_DOMAINS = new Set([
  "input_boolean",
  "input_select",
  "input_number",
  "input_text",
  "input_datetime",
  "input_button",
  "button",
  "counter",
  "timer",
  "group",
  "remote",
  "automation",
  "script",
]);

/** Binary sensors that report something happening, as opposed to plumbing. */
const MEANINGFUL_BINARY_CLASSES = new Set([
  "door",
  "garage_door",
  "opening",
  "window",
  "lock",
  "motion",
  "moving",
  "occupancy",
  "presence",
  "smoke",
  "gas",
  "carbon_monoxide",
  "moisture",
  "problem",
  "safety",
  "tamper",
  "vibration",
  "sound",
  "plug",
]);

/** Domains that keep their meaning right after a restart (a tracker is folded into its person). */
export const RESTART_EXEMPT_DOMAINS = new Set(["person", "device_tracker", "homeassistant"]);

const pickedCache = new WeakMap<
  WhatHappenedConfig,
  { entities: unknown; devices: unknown; ids: Set<string> }
>();

/**
 * Entities the user asked for: by name (`target`, `also_show_entities`) or through a label
 * (`also_show_labels`, which covers entities and devices carrying it). They bypass every smart
 * filter. Cached per config because it is asked for once per log entry.
 */
export function pickedEntities(config: WhatHappenedConfig, hass?: HomeAssistant): Set<string> {
  const hit = pickedCache.get(config);
  if (hit && hit.entities === hass?.entities && hit.devices === hass?.devices) return hit.ids;

  const ids = new Set([config.target?.entity_id ?? [], config.also_show_entities ?? []].flat());
  if (hass && config.also_show_labels?.length) {
    for (const id of resolveTargetEntities(hass, { label_id: config.also_show_labels }))
      ids.add(id);
  }
  pickedCache.set(config, { entities: hass?.entities, devices: hass?.devices, ids });
  return ids;
}

/**
 * An entity whose device is in `hide_devices`, unless the user explicitly asked for it anyway
 * (`also_show_entities`, or a label in `also_show_labels`) — the same way `also_show_entities`
 * always wins, whatever else would otherwise hide an entity.
 */
export function isDeviceHidden(
  config: WhatHappenedConfig,
  hass: HomeAssistant | undefined,
  entityId: string,
): boolean {
  if (!config.hide_devices?.length) return false;
  const deviceId = hass?.entities?.[entityId]?.device_id;
  if (!deviceId || !config.hide_devices.includes(deviceId)) return false;
  return !pickedEntities(config, hass).has(entityId);
}

export function isRunEntry(entry: LogbookEntry): boolean {
  const domain = entry.domain ?? entry.entity_id?.split(".")[0];
  return (
    (domain === "automation" || domain === "script") &&
    entry.state === undefined &&
    entry.message !== undefined
  );
}

/** Something other than the entity itself is on record as the cause. */
export function hasKnownCause(entry: LogbookEntry): boolean {
  return Boolean(
    entry.context_user_id ||
    entry.context_event_type ||
    entry.context_entity_id ||
    entry.context_name ||
    entry.context_service,
  );
}

export function isMeaningful(
  entry: LogbookEntry,
  config: WhatHappenedConfig,
  hass: HomeAssistant | undefined,
): boolean {
  const domain = entry.domain ?? entry.entity_id?.split(".")[0] ?? "homeassistant";
  if (entry.entity_id && pickedEntities(config, hass).has(entry.entity_id)) return true;
  if (config.also_show_domains?.includes(domain)) return true;
  if (config.include_domains?.length) return true; // the user chose domains explicitly

  if (isRunEntry(entry)) return true; // decided later, once the run's actions are known
  if (PERSON_ONLY_DOMAINS.has(domain)) return Boolean(entry.context_user_id);
  if (domain === "binary_sensor") {
    const deviceClass = entry.entity_id && hass?.states[entry.entity_id]?.attributes.device_class;
    // A binary sensor with no device class says nothing about what it is: believe it only when
    // something known caused it.
    return deviceClass ? MEANINGFUL_BINARY_CLASSES.has(deviceClass) : hasKnownCause(entry);
  }
  return CORE_DOMAINS.has(domain);
}
