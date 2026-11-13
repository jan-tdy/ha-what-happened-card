/**
 * Small string table for the card's own sentences.
 *
 * HA already translates state *values* (`hass.formatEntityState`), cause lines
 * (`hass.localize`) and a few stateless-entry phrases, but the card's own sentence style —
 * "was opened", "returned to its dock", "3 sensors were turned off", "changed 14 times" — is
 * built in this codebase (`state-message.ts`, `noise.ts`) and was always hardcoded English.
 *
 * Keys are the literal English phrase itself (gettext style), with `{name}` placeholders for
 * the variable parts (e.g. `"changed to {value}"`). `t()` looks the key up in the dictionary
 * for the requested language and falls back, key by key, to English — so a dictionary that only
 * translates part of the table still works, and an unregistered language reads exactly like
 * today. Only `en` is registered for now; contributions of further language dictionaries
 * (see README.md) call `registerStrings()`.
 */

export const en = {
  // -- state-message.ts: binary sensor device classes -----------------------------------------
  "was opened": "was opened",
  "was closed": "was closed",
  "was unlocked": "was unlocked",
  "was locked": "was locked",
  "detected motion": "detected motion",
  "motion cleared": "motion cleared",
  "started moving": "started moving",
  "stopped moving": "stopped moving",
  "detected occupancy": "detected occupancy",
  "occupancy cleared": "occupancy cleared",
  "detected presence": "detected presence",
  "presence cleared": "presence cleared",
  "detected smoke": "detected smoke",
  "smoke cleared": "smoke cleared",
  "detected gas": "detected gas",
  "gas cleared": "gas cleared",
  "detected carbon monoxide": "detected carbon monoxide",
  "carbon monoxide cleared": "carbon monoxide cleared",
  "detected moisture": "detected moisture",
  "became dry": "became dry",
  "reported a problem": "reported a problem",
  "problem resolved": "problem resolved",
  "is unsafe": "is unsafe",
  "is safe": "is safe",
  "detected tampering": "detected tampering",
  "tampering cleared": "tampering cleared",
  connected: "connected",
  disconnected: "disconnected",
  "was plugged in": "was plugged in",
  "was unplugged": "was unplugged",
  "detected power": "detected power",
  "lost power": "lost power",
  "reported low battery": "reported low battery",
  "battery is normal": "battery is normal",
  "started charging": "started charging",
  "stopped charging": "stopped charging",
  "got cold": "got cold",
  "is no longer cold": "is no longer cold",
  "got hot": "got hot",
  "is no longer hot": "is no longer hot",
  "detected light": "detected light",
  "no longer detects light": "no longer detects light",
  "detected sound": "detected sound",
  "no longer detects sound": "no longer detects sound",
  "detected vibration": "detected vibration",
  "vibration cleared": "vibration cleared",
  "started running": "started running",
  "stopped running": "stopped running",
  "has an update available": "has an update available",
  "is up to date": "is up to date",

  // -- state-message.ts: per-domain states -----------------------------------------------------
  "is locking": "is locking",
  "is unlocking": "is unlocking",
  "is opening": "is opening",
  "is jammed": "is jammed",
  "started opening": "started opening",
  "started closing": "started closing",
  "was disarmed": "was disarmed",
  "was armed (home)": "was armed (home)",
  "was armed (away)": "was armed (away)",
  "was armed (night)": "was armed (night)",
  "was armed (vacation)": "was armed (vacation)",
  "was armed (custom bypass)": "was armed (custom bypass)",
  "is pending": "is pending",
  "is arming": "is arming",
  "is disarming": "is disarming",
  "was triggered": "was triggered",
  "started playing": "started playing",
  paused: "paused",
  "is idle": "is idle",
  "is buffering": "is buffering",
  "went to standby": "went to standby",
  "started cleaning": "started cleaning",
  "returned to its dock": "returned to its dock",
  "is returning to its dock": "is returning to its dock",
  "reported an error": "reported an error",
  "started mowing": "started mowing",
  started: "started",
  finished: "finished",
  rose: "rose",
  set: "set",

  // -- state-message.ts: event entities ---------------------------------------------------------
  rang: "rang",
  "detected a person": "detected a person",
  "was pressed": "was pressed",
  "was double-pressed": "was double-pressed",
  "was triple-pressed": "was triple-pressed",
  "was long-pressed": "was long-pressed",
  "reported {text}": "reported {text}",
  "detected an event": "detected an event",

  // -- state-message.ts: presence, generic on/off, fallback --------------------------------------
  "arrived home": "arrived home",
  "left home": "left home",
  "arrived at {zone}": "arrived at {zone}",
  "became unavailable": "became unavailable",
  "became unknown": "became unknown",
  "was activated": "was activated",
  "was turned on": "was turned on",
  "was turned off": "was turned off",
  "changed to {value}": "changed to {value}",

  // -- noise.ts: chatty entities and bursts -----------------------------------------------------
  "was triggered {n} times": "was triggered {n} times",
  "{verb} {n} times": "{verb} {n} times",
  "fired {n} times": "fired {n} times",
  "changed {n} times": "changed {n} times",
  "latest: {verb}": "latest: {verb}",
  "{shown} and {more} more": "{shown} and {more} more",

  // -- format.ts: relative time ------------------------------------------------------------------
  "just now": "just now",

  // -- timeline.ts: grouped device actions (feature) ----------------------------------------------
  "{count} changes in the last {minutes} min": "{count} changes in the last {minutes} min",
} as const;

export type StringKey = keyof typeof en;
export type Strings = Partial<Record<StringKey, string>>;

const dictionaries: Record<string, Strings> = { en };

/** Register (or extend) a language's dictionary. Missing keys fall back to English. */
export function registerStrings(lang: string, dict: Strings): void {
  const base = lang.toLowerCase();
  dictionaries[base] = { ...dictionaries[base], ...dict };
}

function baseLang(lang: string | undefined): string {
  return (lang ?? "en").split("-")[0].toLowerCase();
}

/** Look a phrase up for `lang` (any registered dictionary beats English, key by key), and
 * substitute `{name}` placeholders from `vars`. An unregistered language, or a missing key in a
 * registered one, reads exactly like English. */
export function t(
  key: StringKey,
  lang: string | undefined,
  vars?: Record<string, string | number>,
): string {
  const dict = dictionaries[baseLang(lang)];
  let text = dict?.[key] ?? en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.split(`{${name}}`).join(String(value));
    }
  }
  return text;
}
