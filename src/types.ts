/** Minimal subset of the Home Assistant frontend types used by this card. */

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any> & {
    friendly_name?: string;
    icon?: string;
    device_class?: string;
    entity_picture?: string;
    unit_of_measurement?: string;
    user_id?: string;
  };
  last_changed?: string;
  last_updated?: string;
}

export interface EntityRegistryEntry {
  entity_id: string;
  device_id?: string | null;
  area_id?: string | null;
  labels?: string[];
  hidden?: boolean;
  platform?: string;
  entity_category?: string | null;
}

export interface DeviceRegistryEntry {
  id: string;
  area_id?: string | null;
  labels?: string[];
}

export interface AreaRegistryEntry {
  area_id: string;
  name: string;
  floor_id?: string | null;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  entities?: Record<string, EntityRegistryEntry>;
  devices?: Record<string, DeviceRegistryEntry>;
  areas?: Record<string, AreaRegistryEntry>;
  user?: { id: string; name: string };
  locale?: { language?: string; time_format?: string };
  connection: {
    subscribeMessage<T>(
      callback: (message: T) => void,
      subscribeMessage: Record<string, unknown>,
      options?: { resubscribe?: boolean },
    ): Promise<() => void>;
  };
  callWS<T>(message: Record<string, unknown>): Promise<T>;
  formatEntityState?(stateObj: HassEntity, state?: string): string;
}

/** Raw entry as delivered by the `logbook/event_stream` websocket command. */
export interface LogbookEntry {
  when: number; // epoch seconds
  name?: string;
  message?: string;
  entity_id?: string;
  state?: string;
  icon?: string;
  source?: string;
  domain?: string;
  context_id?: string;
  context_user_id?: string;
  context_event_type?: string;
  context_domain?: string;
  context_service?: string;
  context_entity_id?: string;
  context_entity_id_name?: string;
  context_message?: string;
  context_name?: string;
  context_source?: string;
  /** State attributes the logbook exposes; today only `event_type` of an event entity. */
  attributes?: { event_type?: string };
}

export interface TargetConfig {
  entity_id?: string | string[];
  device_id?: string | string[];
  area_id?: string | string[];
  floor_id?: string | string[];
  label_id?: string | string[];
}

export type TimeDisplay = "relative" | "absolute" | "both";
export type TapAction = "more-info" | "none";
export type AutomationRuns = "actions" | "all" | "none";
export interface ColorRule {
  match: string;
  color: string;
}
export type Activity = "meaningful" | "everything";
export type ChattyMode = "summarize" | "hide" | "show";
export type Order = "newest_first" | "oldest_first";

export interface WhatHappenedConfig {
  type: string;
  title?: string;
  target?: TargetConfig;
  exclude_entities?: string[];
  include_domains?: string[];
  exclude_domains?: string[];
  /** Always show these entities, even when the smart default view would hide them. */
  also_show_entities?: string[];
  /** Show these domains on top of the smart default view (e.g. "sensor"). */
  also_show_domains?: string[];
  /** Labels: everything carrying one of them is shown like an entity in also_show_entities. */
  also_show_labels?: string[];
  /** Colors for the icons: match is an entity id or a domain, color a palette name or any CSS color. */
  colors?: ColorRule[];
  hours_to_show?: number;
  max_entries?: number;
  order?: Order;
  show_cause?: boolean;
  show_avatars?: boolean;
  show_day_headers?: boolean;
  state_color?: boolean;
  compact?: boolean;
  time_display?: TimeDisplay;
  tap_action?: TapAction;
  max_height?: number;
  vacuum_details?: boolean;
  activity?: Activity;
  automation_runs?: AutomationRuns;
  show_actions?: boolean;
  chatty?: ChattyMode;
  show_diagnostic?: boolean;
  hide_unavailable?: boolean;
  collapse_repeats?: boolean;
}

export type Tone = "active" | "inactive" | "alert" | "unavailable" | "neutral";

export type ActorKind = "user" | "automation" | "script" | "scene" | "service" | "entity" | "other";

export interface Actor {
  kind: ActorKind;
  name: string;
  entityId?: string;
  picture?: string;
  icon?: string;
  /** Extra detail, e.g. the state change that caused an entity-actor. */
  detail?: string;
}

export interface Cause {
  actor?: Actor;
  /** Human readable trigger, e.g. "state of Hallway motion". */
  trigger?: string;
  /** Entity whose state change started the automation, if it could be identified. */
  triggerEntityId?: string;
  /** Who set it going, when the actor is the script or automation that was started by a person. */
  by?: Actor;
  /** The entry of that triggering entity itself (e.g. the button press), folded into this one. */
  source?: TimelineItem;
}

/** One thing that an action caused, listed under the entry that started it. */
export interface EffectLine {
  key: string;
  /** Identical lines in a row are shown once with a count. */
  count?: number;
  domain: string;
  name: string;
  verb: string;
  entityId?: string;
  icon: string;
  fixedIcon?: boolean;
  stateValue?: string;
  accent: string;
  details?: string[];
}

export interface TimelineItem {
  key: string;
  when: number; // epoch ms (newest in a collapsed group)
  entityId?: string;
  domain: string;
  name: string;
  verb: string;
  tone: Tone;
  /** Plain icon for entries that are not entities (or entities that no longer exist). */
  icon: string;
  stateValue?: string;
  picture?: string;
  isPerson: boolean;
  /** True for "automation/script was triggered" entries. */
  isRun: boolean;
  cause?: Cause;
  count: number;
  accent: string;
  /** Extra facts shown under the sentence, e.g. "42 min", "38 m²". */
  details?: string[];
  /** Full sentence for entries that are not "subject + verb" (planner log). */
  text?: string;
  /** Kept only because it started an automation; dropped when nothing was folded under it. */
  soft?: boolean;
  /** Built from an integration (not the logbook): never merged with neighbours. */
  rich?: boolean;
  /** For integration entries: a run has a start entry and a finish entry. */
  phase?: "start" | "finish";
  /** Draw `icon` as given instead of asking <ha-state-icon>. */
  fixedIcon?: boolean;
  /** What this entry caused (several things from one action), shown beneath it. */
  effects?: EffectLine[];
  /** The automations or scripts that carried the action out. */
  via?: Actor[];
}

export interface DayGroup {
  key: string;
  label: string;
  items: TimelineItem[];
}
