import { describe, expect, it } from "vitest";
import { buildTimeline, passesFilters, plainSentence } from "../src/timeline";
import type { WhatHappenedConfig } from "../src/types";
import { NOW, entry, makeHass, state } from "./helpers";

const hass = makeHass([
  state("light.kitchen", "on", { friendly_name: "Kitchen light" }),
  state("person.jan", "home", { friendly_name: "Jan", entity_picture: "/jan.png", user_id: "u1" }),
  state("automation.a", "on", { friendly_name: "Auto A" }),
  state("binary_sensor.hall", "on", { friendly_name: "Hallway motion", device_class: "motion" }),
]);
const cfg = (c: Partial<WhatHappenedConfig> = {}): WhatHappenedConfig => ({
  type: "custom:what-happened-card",
  ...c,
});
const flat = (groups: ReturnType<typeof buildTimeline>) => groups.flatMap((g) => g.items);

describe("buildTimeline", () => {
  const entries = [
    entry({ ago: 60, entity_id: "light.kitchen", name: "Kitchen light", state: "on" }),
    entry({ ago: 600, entity_id: "person.jan", name: "Jan", state: "home" }),
    entry({ ago: 90_000, entity_id: "light.kitchen", name: "Kitchen light", state: "off" }),
    entry({ ago: 400_000, entity_id: "light.kitchen", name: "Kitchen light", state: "on" }),
  ];

  it("sorts newest first, applies the time window and groups by day", () => {
    const groups = buildTimeline(hass, entries, cfg({ hours_to_show: 48 }), NOW);
    expect(groups.map((g) => g.label)).toEqual(["Today", "Yesterday"]);
    expect(flat(groups)).toHaveLength(3);
    expect(flat(groups)[0].name).toBe("Kitchen light");
  });

  it("respects max_entries and oldest_first ordering", () => {
    const groups = buildTimeline(
      hass,
      entries,
      cfg({ max_entries: 2, order: "oldest_first", hours_to_show: 48 }),
      NOW,
    );
    const items = flat(groups);
    expect(items).toHaveLength(2);
    expect(items[0].when).toBeLessThan(items[1].when);
  });

  it("uses a person's picture for person events", () => {
    const item = flat(buildTimeline(hass, entries, cfg(), NOW)).find((i) => i.isPerson);
    expect(item?.picture).toBe("/jan.png");
    expect(item?.verb).toBe("arrived home");
  });

  it("filters by entity, domain and hides unavailable", () => {
    const more = [...entries, entry({ entity_id: "light.kitchen", state: "unavailable" })];
    expect(
      flat(buildTimeline(hass, more, cfg({ exclude_entities: ["person.jan"] }), NOW)),
    ).toHaveLength(1);
    expect(flat(buildTimeline(hass, more, cfg({ include_domains: ["person"] }), NOW))).toHaveLength(
      1,
    );
    expect(flat(buildTimeline(hass, more, cfg({ exclude_domains: ["light"] }), NOW))).toHaveLength(
      1,
    );
    expect(flat(buildTimeline(hass, more, cfg({ hide_unavailable: false }), NOW))).toHaveLength(3);
  });

  it("restricts to the allowed entity set", () => {
    const items = flat(buildTimeline(hass, entries, cfg(), NOW, new Set(["person.jan"])));
    expect(items).toHaveLength(1);
  });

  it("collapses rapid repeats of the same event", () => {
    const flapping = [
      entry({ ago: 10, entity_id: "light.kitchen", state: "on", context_user_id: "u1" }),
      entry({ ago: 120, entity_id: "light.kitchen", state: "on", context_user_id: "u1" }),
      entry({ ago: 200, entity_id: "light.kitchen", state: "on", context_user_id: "u1" }),
      entry({ ago: 250, entity_id: "light.kitchen", state: "on", context_user_id: "other" }),
    ];
    const items = flat(buildTimeline(hass, flapping, cfg(), NOW));
    expect(items.map((i) => i.count)).toEqual([3, 1]);
    expect(flat(buildTimeline(hass, flapping, cfg({ collapse_repeats: false }), NOW))).toHaveLength(
      4,
    );
  });

  it("builds the automation sentence from context", () => {
    const [item] = flat(
      buildTimeline(
        hass,
        [
          entry({
            entity_id: "light.kitchen",
            state: "on",
            context_event_type: "automation_triggered",
            context_entity_id: "automation.a",
            context_source: "state of light.kitchen",
          }),
        ],
        cfg(),
        NOW,
      ),
    );
    expect(plainSentence(item)).toBe(
      "Kitchen light was turned on by Auto A, triggered by state of Kitchen light",
    );
    expect(item.cause?.actor?.icon).toBeTruthy();
  });

  it("shows automation runs with their trigger", () => {
    const [item] = flat(
      buildTimeline(
        hass,
        [
          entry({
            entity_id: "automation.a",
            name: "Auto A",
            domain: "automation",
            message: "triggered by state of light.kitchen",
            source: "state of light.kitchen",
          }),
        ],
        cfg({ automation_runs: "all" }),
        NOW,
      ),
    );
    expect(item.verb).toBe("was triggered");
    expect(item.cause?.trigger).toBe("state of Kitchen light");
  });

  it("ignores entries from the far future", () => {
    expect(
      flat(
        buildTimeline(
          hass,
          [entry({ ago: -86_400, entity_id: "light.kitchen", state: "on" })],
          cfg(),
          NOW,
        ),
      ),
    ).toHaveLength(0);
  });
});

describe("group_device_actions", () => {
  // A device confirmed (via the registry) to have no device_id at all still groups its own
  // different actions by entity_id; a sparse registry entry (device_id simply not set, as most
  // of this file's other fixtures do) does not, so existing behavior elsewhere is unaffected.
  const h = makeHass(
    [
      state("sensor.laptop_cpu", "10", { friendly_name: "Laptop CPU" }),
      state("sensor.laptop_battery", "90", { friendly_name: "Laptop battery" }),
      state("binary_sensor.laptop_active", "on", { friendly_name: "Laptop active" }),
      state("light.kitchen", "on", { friendly_name: "Kitchen light" }),
      state("sensor.standalone", "1", { friendly_name: "Standalone sensor" }),
    ],
    {
      entities: {
        "sensor.laptop_cpu": { entity_id: "sensor.laptop_cpu", device_id: "laptop" },
        "sensor.laptop_battery": { entity_id: "sensor.laptop_battery", device_id: "laptop" },
        "binary_sensor.laptop_active": {
          entity_id: "binary_sensor.laptop_active",
          device_id: "laptop",
        },
        "sensor.standalone": { entity_id: "sensor.standalone", device_id: null },
      },
      devices: { laptop: { id: "laptop" } },
    },
  );
  const build = (e: ReturnType<typeof entry>[], c: Partial<WhatHappenedConfig> = {}) =>
    flat(buildTimeline(h, e, cfg({ activity: "everything", ...c }), NOW));

  const cpu = entry({
    ago: 100,
    entity_id: "sensor.laptop_cpu",
    name: "Laptop CPU",
    state: "80",
  });
  const battery = entry({
    ago: 90,
    entity_id: "sensor.laptop_battery",
    name: "Laptop battery",
    state: "89",
  });
  const active = entry({
    ago: 80,
    entity_id: "binary_sensor.laptop_active",
    name: "Laptop active",
    state: "off",
  });
  const light = entry({ ago: 70, entity_id: "light.kitchen", name: "Kitchen light", state: "off" });

  it("folds several different actions of one device's entities into one grouped entry", () => {
    const items = build([cpu, battery, active, light]);
    expect(items).toHaveLength(2);
    const group = items.find((i) => i.groupCount)!;
    expect(group.groupCount).toBe(3);
    expect(group.name).toBe("Laptop active"); // the latest action heads the entry
    expect(group.group?.map((g) => g.name)).toEqual(["Laptop CPU", "Laptop battery"]); // oldest first
    expect(items.find((i) => i.name === "Kitchen light")?.groupCount).toBeUndefined();
  });

  it("does not group entries outside the time window", () => {
    const far = entry({
      ago: 100 + 4 * 60, // 4 minutes before cpu: outside the default 3 minute window
      entity_id: "sensor.laptop_battery",
      name: "Laptop battery",
      state: "88",
    });
    const items = build([cpu, far], { group_window_minutes: 3 });
    expect(items.every((i) => !i.groupCount)).toBe(true);
    expect(items).toHaveLength(2);
  });

  it("respects a custom group_window_minutes", () => {
    const far = entry({
      ago: 100 + 4 * 60,
      entity_id: "sensor.laptop_battery",
      name: "Laptop battery",
      state: "88",
    });
    const items = build([cpu, far], { group_window_minutes: 10 });
    expect(items).toHaveLength(1);
    expect(items[0].groupCount).toBe(2);
  });

  it("groups a device-less entity's own different actions by entity_id, once confirmed no device", () => {
    const first = entry({
      ago: 60,
      entity_id: "sensor.standalone",
      name: "Standalone sensor",
      state: "2",
    });
    const second = entry({
      ago: 30,
      entity_id: "sensor.standalone",
      name: "Standalone sensor",
      state: "3",
    });
    const items = build([first, second]);
    expect(items).toHaveLength(1);
    expect(items[0].groupCount).toBe(2);
  });

  it("does not cross-group unrelated entities that merely lack device info", () => {
    // light.kitchen and the laptop's binary sensor have no entity registry entry at all, so
    // the fallback never applies to them: two different never-registered entities are never
    // folded together just because they fired close in time.
    const other = entry({
      ago: 65,
      entity_id: "binary_sensor.door",
      name: "Front door",
      state: "on",
    });
    const items = build([light, other]);
    expect(items.every((i) => !i.groupCount)).toBe(true);
    expect(items).toHaveLength(2);
  });

  it("never folds an entity explicitly asked for into a silent group", () => {
    const items = build([cpu, battery, active, light], {
      also_show_entities: ["sensor.laptop_battery"],
    });
    expect(items.find((i) => i.name === "Laptop battery")?.groupCount).toBeUndefined();
    // the other two laptop entities still group together, without the picked one
    const group = items.find((i) => i.groupCount)!;
    expect(group.groupCount).toBe(2);
    expect(group.name).toBe("Laptop active");
    expect(group.group?.map((g) => g.name)).toEqual(["Laptop CPU"]);
  });

  it("can be turned off", () => {
    const items = build([cpu, battery, active, light], { group_device_actions: false });
    expect(items.every((i) => !i.groupCount)).toBe(true);
    expect(items).toHaveLength(4);
  });
});

describe("hide_devices", () => {
  const h = makeHass(
    [
      state("sensor.presence_battery", "50", { friendly_name: "Presence battery" }),
      state("sensor.presence_distance", "2", { friendly_name: "Presence distance" }),
      state("light.kitchen", "on", { friendly_name: "Kitchen light" }),
    ],
    {
      entities: {
        "sensor.presence_battery": { entity_id: "sensor.presence_battery", device_id: "dev1" },
        "sensor.presence_distance": { entity_id: "sensor.presence_distance", device_id: "dev1" },
      },
      devices: { dev1: { id: "dev1" } },
    },
  );
  const shown = (e: ReturnType<typeof entry>[], c: Partial<WhatHappenedConfig> = {}) =>
    flat(
      buildTimeline(h, e, cfg({ activity: "everything", group_device_actions: false, ...c }), NOW),
    ).map((i) => i.name);

  const battery = entry({
    ago: 30,
    entity_id: "sensor.presence_battery",
    name: "Presence battery",
    state: "49",
  });
  const distance = entry({
    ago: 20,
    entity_id: "sensor.presence_distance",
    name: "Presence distance",
    state: "3",
  });
  const light = entry({ ago: 10, entity_id: "light.kitchen", name: "Kitchen light", state: "off" });

  it("excludes every entity of a hidden device", () => {
    expect(shown([battery, distance, light], { hide_devices: ["dev1"] })).toEqual([
      "Kitchen light",
    ]);
  });

  it("keeps an entity explicitly named in also_show_entities", () => {
    expect(
      shown([battery, distance, light], {
        hide_devices: ["dev1"],
        also_show_entities: ["sensor.presence_battery"],
      }),
    ).toEqual(["Kitchen light", "Presence battery"]);
  });

  it("keeps an entity carrying a label in also_show_labels", () => {
    const labelled = makeHass(h.states ? Object.values(h.states) : [], {
      entities: {
        "sensor.presence_battery": {
          entity_id: "sensor.presence_battery",
          device_id: "dev1",
          labels: ["watch"],
        },
        "sensor.presence_distance": { entity_id: "sensor.presence_distance", device_id: "dev1" },
      },
      devices: { dev1: { id: "dev1" } },
    });
    const items = flat(
      buildTimeline(
        labelled,
        [battery, distance, light],
        cfg({
          activity: "everything",
          hide_devices: ["dev1"],
          also_show_labels: ["watch"],
          group_device_actions: false,
        }),
        NOW,
      ),
    ).map((i) => i.name);
    expect(items).toEqual(["Kitchen light", "Presence battery"]);
  });

  it("leaves a device not in hide_devices unaffected", () => {
    expect(shown([battery, distance, light], { hide_devices: ["dev-other"] })).toEqual([
      "Kitchen light",
      "Presence distance",
      "Presence battery",
    ]);
  });
});

describe("passesFilters", () => {
  it("applies the same rules used when buffering live events", () => {
    const light = entry({ entity_id: "light.kitchen", state: "on" });
    expect(passesFilters(light, cfg(), undefined)).toBe(true);
    expect(passesFilters(light, cfg({ include_domains: ["person"] }), undefined)).toBe(false);
    expect(passesFilters(light, cfg({ exclude_entities: ["light.kitchen"] }), undefined)).toBe(
      false,
    );
    expect(passesFilters(light, cfg(), new Set(["light.other"]))).toBe(false);
  });
});

describe("chain merging", () => {
  const chain = [
    entry({ ago: 60, entity_id: "binary_sensor.hall", name: "Hallway motion", state: "on" }),
    entry({
      ago: 58,
      entity_id: "automation.a",
      domain: "automation",
      name: "Auto A",
      message: "triggered by state of binary_sensor.hall",
      source: "state of binary_sensor.hall",
    }),
    entry({
      ago: 57,
      entity_id: "light.kitchen",
      name: "Kitchen light",
      state: "on",
      context_event_type: "automation_triggered",
      context_entity_id: "automation.a",
      context_source: "state of binary_sensor.hall",
    }),
  ];

  it("folds sensor, automation run and device into a single entry", () => {
    const items = flat(buildTimeline(hass, chain, cfg(), NOW));
    expect(items).toHaveLength(1);
    expect(plainSentence(items[0])).toBe(
      "Kitchen light was turned on by Auto A, triggered by Hallway motion detected motion",
    );
  });

  it("keeps a plain automation run only when asked for every run", () => {
    expect(flat(buildTimeline(hass, [chain[1]], cfg(), NOW))).toHaveLength(0);
    const items = flat(buildTimeline(hass, [chain[1]], cfg({ automation_runs: "all" }), NOW));
    expect(items).toHaveLength(1);
    expect(items[0].verb).toBe("was triggered");
  });

  it("keeps unrelated entries", () => {
    const other = entry({ ago: 30, entity_id: "person.jan", name: "Jan", state: "home" });
    expect(flat(buildTimeline(hass, [...chain, other], cfg(), NOW))).toHaveLength(2);
  });
});

describe("event entities", () => {
  const h = makeHass([
    state("event.doorbell_ding", "2026-11-08T11:00:00.000+00:00", {
      friendly_name: "Doorbell",
      device_class: "doorbell",
      event_type: "ring",
    }),
  ]);
  const fired = "2026-11-08T11:00:00.000+00:00";

  it("shows one entry for an event the logbook reports several times", () => {
    // Seen in a real log: one doorbell press written three times with the same state.
    const entries = [1, 2, 3].map(() =>
      entry({
        ago: 3600,
        entity_id: "event.doorbell_ding",
        state: fired,
        attributes: { event_type: "ring" },
      }),
    );
    const items = flat(buildTimeline(h, entries, cfg(), NOW));
    expect(items).toHaveLength(1);
    expect(items[0].verb).toBe("rang");
    expect(items[0].count).toBe(1);
  });

  it("keeps the earliest copy of a repeated event, whatever the buffer order", () => {
    const copy = (ago: number) =>
      entry({ ago, entity_id: "event.doorbell_ding", state: fired, context_id: `c${ago}` });
    const items = flat(buildTimeline(h, [copy(3000), copy(3600), copy(3300)], cfg(), NOW));
    expect(items.map((i) => i.when)).toEqual([NOW - 3_600_000]);
  });

  it("keeps separate events apart", () => {
    const entries = [
      entry({ ago: 3600, entity_id: "event.doorbell_ding", state: fired }),
      entry({
        ago: 1800,
        entity_id: "event.doorbell_ding",
        state: "2026-11-08T11:30:00.000+00:00",
      }),
    ];
    const items = flat(buildTimeline(h, entries, cfg({ collapse_repeats: false }), NOW));
    expect(items.map((i) => i.verb)).toEqual(["rang", "rang"]);
  });

  it("summarizes a busy event entity by what it reported", () => {
    const motion = makeHass([
      state("event.cam", "2026-11-08T11:00:00.000+00:00", {
        friendly_name: "Garden camera",
        device_class: "motion",
      }),
    ]);
    const fire = (i: number, type: string) =>
      entry({
        ago: 600 * (i + 1),
        entity_id: "event.cam",
        state: `2026-11-08T10:${String(i).padStart(2, "0")}:00.000+00:00`,
        attributes: { event_type: type },
      });
    const same = Array.from({ length: 12 }, (_, i) => fire(i, "camera_motion"));
    const one = flat(buildTimeline(motion, same, cfg(), NOW));
    expect(one.map((i) => i.verb)).toEqual(["detected motion 12 times"]);
    expect(one[0].details).toBeUndefined();

    const mixed = same.map((e, i) =>
      i === 0 ? { ...e, attributes: { event_type: "camera_person" } } : e,
    );
    const two = flat(buildTimeline(motion, mixed, cfg(), NOW));
    expect(two.map((i) => i.verb)).toEqual(["fired 12 times"]);
    expect(two[0].details).toEqual(["latest: detected a person"]);
  });
});

describe("returning from unavailable", () => {
  const h = makeHass([
    state("binary_sensor.boiler_fault", "off", {
      friendly_name: "Boiler fault",
      device_class: "problem",
    }),
    state("climate.thermostat", "heat", { friendly_name: "Thermostat" }),
    state("light.kitchen", "on", { friendly_name: "Kitchen light" }),
  ]);
  // A cloud thermostat dropping out now and then, as seen in a real log: the derived problem
  // sensor follows it. Each return is in the state from before the gap.
  const flapping = [
    entry({ ago: 7200, entity_id: "binary_sensor.boiler_fault", state: "off" }),
    entry({
      ago: 3600,
      entity_id: "binary_sensor.boiler_fault",
      state: "unavailable",
      context_entity_id: "climate.thermostat",
    }),
    entry({ ago: 3540, entity_id: "binary_sensor.boiler_fault", state: "off" }),
    entry({ ago: 1800, entity_id: "binary_sensor.boiler_fault", state: "unavailable" }),
    entry({ ago: 1795, entity_id: "binary_sensor.boiler_fault", state: "off" }),
    entry({ ago: 7000, entity_id: "climate.thermostat", state: "heat" }),
    entry({ ago: 3600, entity_id: "climate.thermostat", state: "unavailable" }),
    entry({ ago: 3540, entity_id: "climate.thermostat", state: "heat" }),
  ];
  const verbs = (c: Partial<WhatHappenedConfig> = {}) =>
    flat(buildTimeline(h, flapping, cfg(c), NOW)).map((i) => `${i.entityId} ${i.verb}`);

  it("drops a return to the state from before the gap", () => {
    expect(verbs()).toEqual([
      "climate.thermostat changed to Heat",
      "binary_sensor.boiler_fault problem resolved",
    ]);
    const items = flat(buildTimeline(h, flapping, cfg(), NOW));
    expect(items.map((i) => i.when)).toEqual([NOW - 7_000_000, NOW - 7_200_000]);
  });

  it("keeps a return to a different state", () => {
    const changed = [
      entry({ ago: 600, entity_id: "light.kitchen", state: "off" }),
      entry({ ago: 300, entity_id: "light.kitchen", state: "unavailable" }),
      entry({ ago: 200, entity_id: "light.kitchen", state: "on" }),
    ];
    expect(flat(buildTimeline(h, changed, cfg(), NOW)).map((i) => i.verb)).toEqual([
      "was turned on",
      "was turned off",
    ]);
  });

  it("keeps a return with a known cause", () => {
    const caused = [
      entry({ ago: 600, entity_id: "light.kitchen", state: "on" }),
      entry({ ago: 300, entity_id: "light.kitchen", state: "unavailable" }),
      entry({ ago: 200, entity_id: "light.kitchen", state: "on", context_user_id: "u1" }),
    ];
    expect(flat(buildTimeline(h, caused, cfg({ collapse_repeats: false }), NOW))).toHaveLength(2);
  });

  it("drops a return that only follows another entity coming back", () => {
    const derived = [
      entry({ ago: 600, entity_id: "binary_sensor.boiler_fault", state: "off" }),
      entry({
        ago: 300,
        entity_id: "binary_sensor.boiler_fault",
        state: "unavailable",
        context_entity_id: "climate.thermostat",
      }),
      entry({
        ago: 200,
        entity_id: "binary_sensor.boiler_fault",
        state: "off",
        context_entity_id: "climate.thermostat",
        context_state: "heat",
      } as Parameters<typeof entry>[0]),
    ];
    expect(flat(buildTimeline(h, derived, cfg(), NOW)).map((i) => i.when)).toEqual([NOW - 600_000]);
  });

  it("works on the live buffer, which is filtered as entries arrive", () => {
    // The card filters each entry before buffering it; gaps must survive that step.
    const buffered = flapping.filter((e) => passesFilters(e, cfg(), undefined, h, false, true));
    expect(buffered.filter((e) => e.state === "unavailable")).toHaveLength(3);
    expect(flat(buildTimeline(h, buffered, cfg(), NOW))).toHaveLength(2);
    expect(passesFilters(flapping[1], cfg(), undefined, h)).toBe(false);
  });

  it("keeps the first return when the state before the gap is outside the window", () => {
    const edge = [
      entry({ ago: 300, entity_id: "light.kitchen", state: "unavailable" }),
      entry({ ago: 200, entity_id: "light.kitchen", state: "on" }),
    ];
    expect(flat(buildTimeline(h, edge, cfg(), NOW))).toHaveLength(1);
  });

  it("shows everything when hide_unavailable is off", () => {
    expect(verbs({ hide_unavailable: false, collapse_repeats: false })).toHaveLength(8);
  });
});
