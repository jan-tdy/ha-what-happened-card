import { truncate } from "./noise";
import type { HassEntity, HomeAssistant, Tone } from "./types";

export interface StateDescription {
  verb: string;
  tone: Tone;
}

const BINARY: Record<string, [string, string, Tone?, Tone?]> = {
  // [on verb, off verb, on tone override, off tone override]
  door: ["was opened", "was closed"],
  garage_door: ["was opened", "was closed"],
  opening: ["was opened", "was closed"],
  window: ["was opened", "was closed"],
  lock: ["was unlocked", "was locked"],
  motion: ["detected motion", "motion cleared"],
  moving: ["started moving", "stopped moving"],
  occupancy: ["detected occupancy", "occupancy cleared"],
  presence: ["detected presence", "presence cleared"],
  smoke: ["detected smoke", "smoke cleared", "alert"],
  gas: ["detected gas", "gas cleared", "alert"],
  carbon_monoxide: ["detected carbon monoxide", "carbon monoxide cleared", "alert"],
  moisture: ["detected moisture", "became dry", "alert"],
  problem: ["reported a problem", "problem resolved", "alert"],
  safety: ["is unsafe", "is safe", "alert"],
  tamper: ["detected tampering", "tampering cleared", "alert"],
  connectivity: ["connected", "disconnected"],
  plug: ["was plugged in", "was unplugged"],
  power: ["detected power", "lost power"],
  battery: ["reported low battery", "battery is normal", "alert"],
  battery_charging: ["started charging", "stopped charging"],
  cold: ["got cold", "is no longer cold"],
  heat: ["got hot", "is no longer hot"],
  light: ["detected light", "no longer detects light"],
  sound: ["detected sound", "no longer detects sound"],
  vibration: ["detected vibration", "vibration cleared"],
  running: ["started running", "stopped running"],
  update: ["has an update available", "is up to date"],
};

const BY_STATE: Record<string, Record<string, [string, Tone]>> = {
  lock: {
    locked: ["was locked", "active"],
    unlocked: ["was unlocked", "inactive"],
    locking: ["is locking", "neutral"],
    unlocking: ["is unlocking", "neutral"],
    open: ["was opened", "inactive"],
    opening: ["is opening", "neutral"],
    jammed: ["is jammed", "alert"],
  },
  cover: {
    open: ["was opened", "active"],
    closed: ["was closed", "inactive"],
    opening: ["started opening", "neutral"],
    closing: ["started closing", "neutral"],
  },
  alarm_control_panel: {
    disarmed: ["was disarmed", "inactive"],
    armed_home: ["was armed (home)", "active"],
    armed_away: ["was armed (away)", "active"],
    armed_night: ["was armed (night)", "active"],
    armed_vacation: ["was armed (vacation)", "active"],
    armed_custom_bypass: ["was armed (custom bypass)", "active"],
    pending: ["is pending", "neutral"],
    arming: ["is arming", "neutral"],
    disarming: ["is disarming", "neutral"],
    triggered: ["was triggered", "alert"],
  },
  media_player: {
    playing: ["started playing", "active"],
    paused: ["paused", "neutral"],
    idle: ["is idle", "inactive"],
    buffering: ["is buffering", "neutral"],
    standby: ["went to standby", "inactive"],
    off: ["was turned off", "inactive"],
    on: ["was turned on", "active"],
  },
  vacuum: {
    cleaning: ["started cleaning", "active"],
    docked: ["returned to its dock", "inactive"],
    returning: ["is returning to its dock", "neutral"],
    paused: ["paused", "neutral"],
    idle: ["is idle", "inactive"],
    error: ["reported an error", "alert"],
  },
  lawn_mower: {
    mowing: ["started mowing", "active"],
    docked: ["returned to its dock", "inactive"],
    paused: ["paused", "neutral"],
    returning: ["is returning to its dock", "neutral"],
    error: ["reported an error", "alert"],
  },
  timer: {
    active: ["started", "active"],
    paused: ["paused", "neutral"],
    idle: ["finished", "inactive"],
  },
  sun: {
    above_horizon: ["rose", "active"],
    below_horizon: ["set", "inactive"],
  },
};

const ON_OFF_DOMAINS = new Set([
  "light",
  "switch",
  "fan",
  "input_boolean",
  "humidifier",
  "siren",
  "remote",
  "group",
  "schedule",
  "valve",
  "water_heater",
  "automation",
  "binary_sensor",
  "calendar",
  "update",
]);

const PRESENCE_DOMAINS = new Set(["person", "device_tracker"]);
const PRESS_DOMAINS = new Set(["button", "input_button", "doorbell"]);

/** Verbs for the event types the core integrations use most; anything else is named as is. */
const EVENT_TYPES: Record<string, [string, Tone]> = {
  ring: ["rang", "active"],
  motion: ["detected motion", "active"],
  camera_motion: ["detected motion", "active"],
  person: ["detected a person", "active"],
  camera_person: ["detected a person", "active"],
  sound: ["detected sound", "active"],
  camera_sound: ["detected sound", "active"],
  press: ["was pressed", "active"],
  initial_press: ["was pressed", "active"],
  single_press: ["was pressed", "active"],
  short_press: ["was pressed", "active"],
  double_press: ["was double-pressed", "active"],
  triple_press: ["was triple-pressed", "active"],
  long_press: ["was long-pressed", "active"],
};

/** What an event entity's device class says when the entry carries no event type. */
const EVENT_CLASSES: Record<string, string> = {
  doorbell: "rang",
  motion: "detected motion",
  button: "was pressed",
};

/**
 * An event entity's state is only the time it fired. What happened is its event type, which
 * the logbook reports per entry (`attributes.event_type`); without it, the device class is the
 * best guess.
 */
function describeEvent(deviceClass: string | undefined, eventType: string | undefined) {
  if (eventType) {
    const known = EVENT_TYPES[eventType];
    if (known) return { verb: known[0], tone: known[1] };
    const text = eventType.replace(/_/g, " ");
    return {
      verb: `reported ${text}`,
      tone: (/(error|fail)/i.test(text) ? "alert" : "active") as Tone,
    };
  }
  const byClass = deviceClass ? EVENT_CLASSES[deviceClass] : undefined;
  return { verb: byClass ?? "detected an event", tone: "active" as Tone };
}

function prettify(value: string): string {
  const text = value.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatValue(hass: HomeAssistant, entityId: string, state: string): string {
  const stateObj = hass.states[entityId];
  if (stateObj && hass.formatEntityState) {
    try {
      const formatted = hass.formatEntityState({ ...stateObj, state }, state);
      if (formatted) return formatted;
    } catch {
      /* fall through to plain value */
    }
  }
  const unit = stateObj?.attributes.unit_of_measurement;
  const numeric = state !== "" && !Number.isNaN(Number(state));
  if (numeric) return unit ? `${state} ${unit}` : state;
  return prettify(state);
}

function zoneName(hass: HomeAssistant, zoneState: string): string {
  const zone = Object.values(hass.states).find(
    (s: HassEntity) =>
      s.entity_id.startsWith("zone.") &&
      (s.attributes.friendly_name ?? "").toLowerCase() === zoneState.toLowerCase(),
  );
  return zone?.attributes.friendly_name ?? prettify(zoneState);
}

/** Turn a raw logbook state change into a short English verb phrase. */
export function describeState(
  hass: HomeAssistant,
  domain: string,
  entityId: string | undefined,
  state: string,
  /** For event entities: the event type of this entry, from the logbook. */
  eventType?: string,
): StateDescription {
  if (state === "unavailable") return { verb: "became unavailable", tone: "unavailable" };
  if (state === "unknown") return { verb: "became unknown", tone: "neutral" };

  const stateObj = entityId ? hass.states[entityId] : undefined;
  const deviceClass = stateObj?.attributes.device_class;

  if (domain === "event") return describeEvent(deviceClass, eventType);

  if (PRESENCE_DOMAINS.has(domain)) {
    if (state === "home") return { verb: "arrived home", tone: "active" };
    if (state === "not_home") return { verb: "left home", tone: "inactive" };
    return { verb: `arrived at ${zoneName(hass, state)}`, tone: "active" };
  }

  if (domain === "binary_sensor" && deviceClass && BINARY[deviceClass]) {
    const [onVerb, offVerb, onTone, offTone] = BINARY[deviceClass];
    if (state === "on") return { verb: onVerb, tone: onTone ?? "active" };
    if (state === "off") return { verb: offVerb, tone: offTone ?? "inactive" };
  }

  const byState = BY_STATE[domain]?.[state];
  if (byState) return { verb: byState[0], tone: byState[1] };

  if (PRESS_DOMAINS.has(domain)) return { verb: "was pressed", tone: "active" };
  if (domain === "scene") return { verb: "was activated", tone: "active" };

  if (domain === "climate" && state === "off") return { verb: "was turned off", tone: "inactive" };

  if (ON_OFF_DOMAINS.has(domain) || state === "on" || state === "off") {
    if (state === "on") return { verb: "was turned on", tone: "active" };
    if (state === "off") return { verb: "was turned off", tone: "inactive" };
  }

  const value = entityId ? formatValue(hass, entityId, state) : prettify(state);
  return { verb: `changed to ${truncate(value, 80)}`, tone: "neutral" };
}
