import { describe, expect, it } from "vitest";
import { friendlyTrigger } from "../src/context";
import { buildTimeline } from "../src/timeline";
import type { ActionEvent } from "../src/trace";
import type { LogbookEntry, WhatHappenedConfig } from "../src/types";
import { NOW, entry, makeHass, state } from "./helpers";

const cfg = (c: Partial<WhatHappenedConfig> = {}): WhatHappenedConfig => ({
  type: "custom:what-happened-card",
  ...c,
});
const hass = makeHass(
  [
    state("sensor.date_time", "2026-11-08, 15:19", { friendly_name: "Date & Time" }),
    state("automation.ai", "on", { friendly_name: "AI summaries" }),
    state("light.kitchen", "on", { friendly_name: "Kitchen light" }),
    state("switch.led", "off", { friendly_name: "Status LED" }),
    state("person.jan", "home", { friendly_name: "Jan" }),
  ],
  {
    entities: {
      "switch.led": { entity_id: "switch.led", entity_category: "diagnostic" },
      "light.kitchen": { entity_id: "light.kitchen" },
    },
  },
);
const items = (e: LogbookEntry[], c: Partial<WhatHappenedConfig> = {}) =>
  buildTimeline(hass, e, cfg({ hours_to_show: 24, activity: "everything", ...c }), NOW).flatMap(
    (g) => g.items,
  );

const clock = Array.from({ length: 40 }, (_, i) =>
  entry({
    ago: 60 * (i + 1),
    entity_id: "sensor.date_time",
    name: "Date & Time",
    state: `15:${i}`,
  }),
);

describe("chatty entities", () => {
  it("summarizes a clock that changes every minute into one entry", () => {
    const result = items([
      ...clock,
      entry({ ago: 5, entity_id: "person.jan", name: "Jan", state: "home" }),
    ]);
    expect(result).toHaveLength(2);
    const summary = result.find((i) => i.name === "Date & Time")!;
    expect(summary.verb).toBe("changed 40 times");
    expect(summary.details?.[0]).toMatch(/^latest: changed to/);
  });

  it("can hide them completely or show everything", () => {
    expect(items(clock, { chatty: "hide" })).toHaveLength(0);
    expect(
      items(clock, { chatty: "show", collapse_repeats: false, max_entries: 100 }),
    ).toHaveLength(40);
  });

  it("summarizes an automation that runs every 15 minutes", () => {
    const runs = Array.from({ length: 12 }, (_, i) =>
      entry({
        ago: 900 * (i + 1),
        entity_id: "automation.ai",
        domain: "automation",
        name: "AI summaries",
        message: "triggered by time pattern",
        source: "time pattern",
      }),
    );
    const result = items(runs, { automation_runs: "all" });
    expect(result).toHaveLength(1);
    expect(result[0].verb).toBe("was triggered 12 times");
    expect(result[0].cause?.trigger).toBe("time pattern");
  });

  it("does not summarize a lamp that was just switched ten times over a day", () => {
    const day = Array.from({ length: 10 }, (_, i) =>
      entry({
        ago: 7000 * (i + 1),
        entity_id: "light.kitchen",
        name: "Kitchen light",
        state: i % 2 ? "on" : "off",
      }),
    );
    expect(items(day, { collapse_repeats: false })).toHaveLength(10);
  });

  it("leaves ordinary activity alone", () => {
    const few = Array.from({ length: 6 }, (_, i) =>
      entry({
        ago: 3000 * (i + 1),
        entity_id: "light.kitchen",
        name: "Kitchen light",
        state: i % 2 ? "on" : "off",
      }),
    );
    expect(items(few)).toHaveLength(6);
  });

  it("splits a chatty entity into a separate group once it has been quiet for the gap", () => {
    // Twelve changes a minute apart, a 70-minute silence, then twelve more a minute apart.
    const recent = Array.from({ length: 12 }, (_, i) =>
      entry({
        ago: 60 * (i + 1),
        entity_id: "sensor.date_time",
        name: "Date & Time",
        state: `r${i}`,
      }),
    );
    const earlier = Array.from({ length: 12 }, (_, i) =>
      entry({
        ago: 12 * 60 + 70 * 60 + 60 * (i + 1),
        entity_id: "sensor.date_time",
        name: "Date & Time",
        state: `e${i}`,
      }),
    );
    const result = items([...recent, ...earlier]);
    const summaries = result.filter((i) => i.name === "Date & Time");
    expect(summaries).toHaveLength(2);
    expect(summaries.map((i) => i.verb)).toEqual(["changed 12 times", "changed 12 times"]);
    // Each group keeps its own identity, so the card can tell them apart.
    expect(new Set(summaries.map((i) => i.key)).size).toBe(2);
  });

  it("only summarizes the bursts that are actually chatty, leaving a quiet trickle of the same entity alone", () => {
    const burst = Array.from({ length: 12 }, (_, i) =>
      entry({
        ago: 60 * (i + 1),
        entity_id: "sensor.date_time",
        name: "Date & Time",
        state: `b${i}`,
      }),
    );
    // Three changes hours apart: too slow and too few to count as chatty on their own.
    const trickle = [300, 600, 900].map((agoMinutes, i) =>
      entry({
        ago: agoMinutes * 60,
        entity_id: "sensor.date_time",
        name: "Date & Time",
        state: `t${i}`,
      }),
    );
    const result = items([...burst, ...trickle]).filter((i) => i.name === "Date & Time");
    expect(result).toHaveLength(4); // one summary for the burst, three individual entries
    expect(result[0].verb).toBe("changed 12 times");
  });

  it("the quiet gap is adjustable: a tighter one splits what the default would keep together", () => {
    const runs = Array.from({ length: 12 }, (_, i) =>
      entry({
        ago: 900 * (i + 1),
        entity_id: "automation.ai",
        domain: "automation",
        name: "AI summaries",
        message: "triggered by time pattern",
        source: "time pattern",
      }),
    );
    const result = items(runs, { automation_runs: "all", chatty_gap_minutes: 10 });
    // 15 minutes apart is already more than a 10-minute gap: nothing stays grouped.
    expect(result).toHaveLength(12);
  });

  it("the minimum entry count is adjustable", () => {
    const five = Array.from({ length: 5 }, (_, i) =>
      entry({
        ago: 60 * (i + 1),
        entity_id: "sensor.date_time",
        name: "Date & Time",
        state: `s${i}`,
      }),
    );
    expect(items(five)).toHaveLength(5); // below the default minimum of 10, shown as is
    const result = items(five, { chatty_min_events: 5 });
    expect(result).toHaveLength(1);
    expect(result[0].verb).toBe("changed 5 times");
  });
});

describe("bursts", () => {
  it("groups many entities doing the same thing in the same second", () => {
    const updates = Array.from({ length: 20 }, (_, i) =>
      entry({ ago: 120, entity_id: `update.thing_${i}`, name: `Thing ${i} Update`, state: "off" }),
    );
    const result = items(updates);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("20 updates");
    expect(result[0].verb).toBe("were turned off");
    expect(result[0].details?.[0]).toContain("and 14 more");
  });

  it("does not call one button pressed three times a burst of buttons", () => {
    const presses = [100, 101, 102].map((ago) =>
      entry({ ago, entity_id: "button.bell", name: "Doorbell", state: "2026-11-08T14:00:00" }),
    );
    expect(items(presses, { collapse_repeats: false })).toHaveLength(3);
  });

  it("does not group two entities or things far apart in time", () => {
    const two = [
      entry({ ago: 100, entity_id: "light.a", name: "A", state: "on" }),
      entry({ ago: 101, entity_id: "light.b", name: "B", state: "on" }),
    ];
    expect(items(two)).toHaveLength(2);
    const spread = [100, 400, 900, 1500].map((ago, i) =>
      entry({ ago, entity_id: `light.s${i}`, name: `S${i}`, state: "on" }),
    );
    expect(items(spread)).toHaveLength(4);
  });
});

describe("diagnostic entities", () => {
  const led = entry({ ago: 30, entity_id: "switch.led", name: "Status LED", state: "on" });
  it("are hidden by default and can be included", () => {
    expect(items([led])).toHaveLength(0);
    expect(items([led], { show_diagnostic: true })).toHaveLength(1);
  });
  it("are shown when picked by name", () => {
    expect(items([led], { target: { entity_id: "switch.led" } })).toHaveLength(1);
  });
});

describe("friendlyTrigger", () => {
  it("reads naturally", () => {
    expect(friendlyTrigger("event 'automation_triggered'")).toBe("another automation");
    expect(friendlyTrigger("time pattern")).toBe("time pattern");
  });
});

describe("meaningful activity (default)", () => {
  const meaningful = (e: LogbookEntry[], c: Partial<WhatHappenedConfig> = {}) =>
    buildTimeline(hass, e, cfg(c), NOW).flatMap((g) => g.items);

  it("leaves out clocks, text sensors and update entities", () => {
    const noise = [
      ...clock,
      entry({ ago: 50, entity_id: "update.card", name: "Card Update", state: "on" }),
      entry({ ago: 30, entity_id: "text.summary", name: "AI Summary", state: "A long text" }),
    ];
    expect(meaningful(noise)).toHaveLength(0);
  });

  describe("automation runs", () => {
    const run = entry({
      ago: 40,
      entity_id: "automation.visitor",
      domain: "automation",
      name: "Announce visitor",
      message: "triggered by state of binary_sensor.door",
      source: "state of binary_sensor.door",
    });
    const door = entry({
      ago: 41,
      entity_id: "binary_sensor.door",
      name: "Front door",
      state: "on",
    });
    const say: ActionEvent = {
      kind: "say",
      text: "Someone is at the front door",
      speakers: ["media_player.kitchen"],
      service: "tts.speak",
    };
    const speakerHass = makeHass([
      state("media_player.kitchen", "idle", { friendly_name: "Kitchen speaker" }),
      state("binary_sensor.door", "on", { friendly_name: "Front door", device_class: "door" }),
      state("automation.visitor", "on", { friendly_name: "Announce visitor" }),
    ]);
    const build = (
      e: LogbookEntry[],
      c: Partial<WhatHappenedConfig> = {},
      actions?: ActionEvent[],
    ) =>
      buildTimeline(speakerHass, e, cfg(c), NOW, undefined, undefined, () => actions).flatMap(
        (g) => g.items,
      );

    it("shows what a run said as its own entry, with who and why", () => {
      const [item] = build([run, door], {}, [say]);
      expect(item.name).toBe("Kitchen speaker");
      expect(item.verb).toBe("said “Someone is at the front door”");
      expect(item.cause?.actor?.name).toBe("Announce visitor");
      expect(item.cause?.trigger).toBe("Front door was opened");
      expect(build([run, door], {}, [say])).toHaveLength(1); // run and sensor are folded in
    });

    it("shows a sent notification", () => {
      const [item] = build([run], {}, [
        {
          kind: "notify",
          text: "Visitor at the door",
          title: "Door",
          speakers: [],
          service: "notify.x",
        },
      ]);
      expect(item.name).toBe("Notification");
      expect(item.verb).toBe("sent “Door: Visitor at the door”");
    });

    it("hides a run that said and sent nothing, and one whose trace is not loaded yet", () => {
      expect(build([run], {}, [])).toHaveLength(0);
      expect(build([run], {}, undefined)).toHaveLength(0);
    });

    it("does not also list the speaker starting to play", () => {
      const playing = entry({
        ago: 39,
        entity_id: "media_player.kitchen",
        name: "Kitchen speaker",
        state: "playing",
        context_event_type: "automation_triggered",
        context_entity_id: "automation.visitor",
      });
      expect(build([run, playing], {}, [say])).toHaveLength(1);
    });

    it("can show every run, or nothing at all", () => {
      expect(build([run], { automation_runs: "all" }, [])).toHaveLength(1);
      expect(build([run], { automation_runs: "none" }, [say])).toHaveLength(0);
      expect(build([run], { show_actions: false }, [say])).toHaveLength(0);
    });

    it("still summarizes a run that fires all the time when every run is shown", () => {
      const runs = Array.from({ length: 14 }, (_, i) => ({
        ...run,
        when: NOW / 1000 - 900 * (i + 1),
      }));
      const result = build(runs, { automation_runs: "all" }, []);
      expect(result).toHaveLength(1);
      expect(result[0].verb).toBe("was triggered 14 times");
    });
  });

  it("keeps what people care about", () => {
    const real = [
      entry({ ago: 50, entity_id: "light.kitchen", name: "Kitchen light", state: "on" }),
      entry({ ago: 40, entity_id: "person.jan", name: "Jan", state: "home" }),
      entry({ ago: 30, entity_id: "lock.front", name: "Front door lock", state: "locked" }),
    ];
    expect(meaningful(real)).toHaveLength(3);
  });

  it("brings noise back on request, or when an entity is picked by name", () => {
    expect(meaningful(clock, { activity: "everything" }).length).toBeGreaterThan(0);
    expect(
      meaningful(clock.slice(0, 2), { target: { entity_id: "sensor.date_time" } }),
    ).toHaveLength(2);
  });

  it("shows helpers and buttons only when a person used them", () => {
    const h = makeHass([
      state("input_boolean.guest", "on", { friendly_name: "Guest mode" }),
      state("button.repairs", "unknown", { friendly_name: "Repairs" }),
      state("device_tracker.phone", "home", { friendly_name: "Phone" }),
      state("binary_sensor.todo", "on", { friendly_name: "Todo" }),
    ]);
    const shown = (e: LogbookEntry) =>
      buildTimeline(h, [e], cfg(), NOW).flatMap((g) => g.items).length;
    const byPerson = { context_user_id: "u1", context_event_type: "call_service" };
    const byAutomation = {
      context_event_type: "automation_triggered",
      context_entity_id: "automation.x",
    };
    const helper = (c = {}) =>
      entry({ ago: 30, entity_id: "input_boolean.guest", name: "Guest mode", state: "on", ...c });
    expect(shown(helper(byPerson))).toBe(1);
    expect(shown(helper(byAutomation))).toBe(0);
    expect(shown(helper())).toBe(0);
    const press = (c = {}) =>
      entry({ ago: 30, entity_id: "button.repairs", name: "Repairs", state: "2026-11-08", ...c });
    expect(shown(press())).toBe(0);
    expect(shown(press(byPerson))).toBe(1);
    // a tracker only repeats its person; a class-less binary sensor needs a known cause
    expect(
      shown(entry({ ago: 30, entity_id: "device_tracker.phone", name: "Phone", state: "home" })),
    ).toBe(0);
    const todo = (c = {}) =>
      entry({ ago: 30, entity_id: "binary_sensor.todo", name: "Todo", state: "on", ...c });
    expect(shown(todo())).toBe(0);
    expect(shown(todo(byAutomation))).toBe(1);
  });

  it("filters binary sensors by what they report", () => {
    const h = makeHass([
      state("binary_sensor.door", "on", { device_class: "door" }),
      state("binary_sensor.wifi", "on", { device_class: "connectivity" }),
    ]);
    const run = (id: string) =>
      buildTimeline(
        h,
        [entry({ ago: 30, entity_id: id, name: id, state: "on" })],
        cfg(),
        NOW,
      ).flatMap((g) => g.items);
    expect(run("binary_sensor.door")).toHaveLength(1);
    expect(run("binary_sensor.wifi")).toHaveLength(0);
  });
});

describe("light groups", () => {
  const groupHass = makeHass([
    state("light.dining", "off", {
      friendly_name: "Svetlá jedáleň",
      entity_id: ["light.dining_1", "light.dining_2", "light.dining_3"],
    }),
    state("light.dining_1", "off", { friendly_name: "Jedáleň svetlo 01" }),
    state("light.dining_2", "off", { friendly_name: "Jedáleň svetlo 02" }),
    state("light.dining_3", "off", { friendly_name: "Jedáleň svetlo 03" }),
  ]);
  const shown = (e: LogbookEntry[]) =>
    buildTimeline(groupHass, e, cfg(), NOW).flatMap((g) => g.items);
  const off = (ago: number, id: string, name: string, c: Partial<LogbookEntry> = {}) =>
    entry({ ago, entity_id: id, name, state: "off", ...c });

  it("shows the group and not its members", () => {
    const result = shown([
      off(100, "light.dining", "Svetlá jedáleň", {
        context_entity_id: "light.dining_2",
        context_entity_id_name: "Jedáleň svetlo 02",
      }),
      off(100, "light.dining_2", "Jedáleň svetlo 02"),
      off(100, "light.dining_1", "Jedáleň svetlo 01"),
      off(99, "light.dining_3", "Jedáleň svetlo 03"),
    ]);
    expect(result.map((i) => i.name)).toEqual(["Svetlá jedáleň"]);
    expect(result[0].cause?.actor?.name).toBe("Jedáleň svetlo 02");
  });

  it("keeps members the user picked by name, or when they chose domains or everything", () => {
    const both = [
      off(100, "light.dining", "Svetlá jedáleň"),
      off(100, "light.dining_1", "Jedáleň svetlo 01"),
    ];
    const run = (c: Partial<WhatHappenedConfig>) =>
      buildTimeline(groupHass, both, cfg(c), NOW).flatMap((g) => g.items).length;
    expect(run({})).toBe(1);
    expect(run({ target: { entity_id: ["light.dining", "light.dining_1"] } })).toBe(2);
    expect(run({ include_domains: ["light"] })).toBe(2);
    expect(run({ activity: "everything" })).toBe(2);
  });

  it("keeps a member that changed alone, while the group stayed on", () => {
    const result = shown([off(100, "light.dining_1", "Jedáleň svetlo 01")]);
    expect(result.map((i) => i.name)).toEqual(["Jedáleň svetlo 01"]);
  });

  it("keeps a member that did something different from the group", () => {
    const result = shown([
      entry({ ago: 100, entity_id: "light.dining", name: "Svetlá jedáleň", state: "on" }),
      off(98, "light.dining_1", "Jedáleň svetlo 01"),
    ]);
    expect(result).toHaveLength(2);
  });

  it("keeps a member that changed long before or after the group", () => {
    const result = shown([
      off(100, "light.dining", "Svetlá jedáleň"),
      off(400, "light.dining_1", "Jedáleň svetlo 01"),
    ]);
    expect(result).toHaveLength(2);
  });
});

describe("people and their devices", () => {
  const peopleHass = makeHass([
    state("person.pavel", "home", {
      friendly_name: "Pavel",
      device_trackers: ["device_tracker.moto", "device_tracker.watch"],
    }),
    state("device_tracker.moto", "home", { friendly_name: "moto g13" }),
    state("device_tracker.watch", "home", { friendly_name: "Watch" }),
  ]);
  const shown = (e: LogbookEntry[], c: Partial<WhatHappenedConfig> = {}) =>
    buildTimeline(peopleHass, e, cfg(c), NOW).flatMap((g) => g.items);
  const left = (id: string, name: string, ago: number) =>
    entry({ ago, entity_id: id, name, state: "not_home" });

  it("shows only the person, based on the device", () => {
    const result = shown([
      left("person.pavel", "Pavel", 100),
      left("device_tracker.moto", "moto g13", 101),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Pavel");
    expect(result[0].verb).toBe("left home");
    expect(result[0].cause?.trigger).toBe("device moto g13");
  });

  it("drops a device that changed while the person stayed", () => {
    expect(shown([left("device_tracker.watch", "Watch", 100)])).toHaveLength(0);
  });

  it("does not use a device that changed minutes away from the person", () => {
    const result = shown([
      left("person.pavel", "Pavel", 100),
      left("device_tracker.moto", "moto g13", 700),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].cause).toBeUndefined();
  });

  it("lists devices when asked for everything or when picked by name", () => {
    const both = [left("person.pavel", "Pavel", 100), left("device_tracker.moto", "moto g13", 101)];
    expect(shown(both, { activity: "everything" })).toHaveLength(2);
    expect(
      shown(both, { target: { entity_id: ["person.pavel", "device_tracker.moto"] } }),
    ).toHaveLength(2);
    expect(shown(both, { include_domains: ["person", "device_tracker"] })).toHaveLength(2);
  });
});

describe("also show", () => {
  const h = makeHass(
    [
      state("input_boolean.recently", "on", { friendly_name: "Automation recently" }),
      state("button.repairs", "unknown", { friendly_name: "Repairs" }),
      state("sensor.battery", "50", { friendly_name: "Battery" }),
      state("switch.led", "on", { friendly_name: "Status LED" }),
      state("light.kitchen", "on", { friendly_name: "Kitchen light" }),
      state("automation.code", "on", { friendly_name: "Hlásenie kódu" }),
    ],
    { entities: { "switch.led": { entity_id: "switch.led", entity_category: "diagnostic" } } },
  );
  const shown = (e: LogbookEntry[], c: Partial<WhatHappenedConfig> = {}) =>
    buildTimeline(h, e, cfg(c), NOW).flatMap((g) => g.items);
  const byAutomation = {
    context_event_type: "automation_triggered",
    context_entity_id: "automation.x",
  };

  it("adds entities that the default view would hide", () => {
    const helper = entry({
      ago: 30,
      entity_id: "input_boolean.recently",
      name: "Recently",
      state: "on",
      ...byAutomation,
    });
    const press = entry({
      ago: 40,
      entity_id: "button.repairs",
      name: "Repairs",
      state: "2026-11-08",
    });
    const led = entry({ ago: 50, entity_id: "switch.led", name: "Status LED", state: "on" });
    expect(shown([helper, press, led])).toHaveLength(0);
    const also = { also_show_entities: ["input_boolean.recently", "button.repairs", "switch.led"] };
    expect(shown([helper, press, led], also)).toHaveLength(3);
    // and it is additive: other things still follow the default view
    const clock = entry({ ago: 20, entity_id: "sensor.battery", name: "Battery", state: "49" });
    expect(shown([helper, clock], also).map((i) => i.name)).toEqual(["Recently"]);
  });

  it("adds whole domains on top of the default view", () => {
    const sensor = entry({ ago: 20, entity_id: "sensor.battery", name: "Battery", state: "49" });
    const light = entry({
      ago: 30,
      entity_id: "light.kitchen",
      name: "Kitchen light",
      state: "off",
    });
    expect(shown([sensor, light]).map((i) => i.name)).toEqual(["Kitchen light"]);
    expect(shown([sensor, light], { also_show_domains: ["sensor"] }).map((i) => i.name)).toEqual([
      "Battery",
      "Kitchen light",
    ]);
  });

  it("never summarizes or hides an entity that was asked for", () => {
    const flapping = Array.from({ length: 30 }, (_, i) =>
      entry({
        ago: 60 * (i + 1),
        entity_id: "light.kitchen",
        name: "Kitchen light",
        state: i % 2 ? "on" : "off",
      }),
    );
    expect(shown(flapping, { collapse_repeats: false, max_entries: 100 }).length).toBeLessThan(5);
    expect(
      shown(flapping, {
        also_show_entities: ["light.kitchen"],
        collapse_repeats: false,
        max_entries: 100,
      }),
    ).toHaveLength(30);
  });

  it("lists the runs of an automation that was asked for", () => {
    const run = entry({
      ago: 30,
      entity_id: "automation.code",
      domain: "automation",
      name: "Hlásenie kódu",
      message: "triggered by time",
      source: "time",
    });
    expect(shown([run])).toHaveLength(0);
    expect(shown([run], { also_show_entities: ["automation.code"] }).map((i) => i.name)).toEqual([
      "Hlásenie kódu",
    ]);
  });
});

describe("also show labels", () => {
  const h = makeHass(
    [
      state("input_boolean.watched", "on", { friendly_name: "Watched helper" }),
      state("button.on_device", "unknown", { friendly_name: "Button on labelled device" }),
      state("input_boolean.plain", "on", { friendly_name: "Plain helper" }),
    ],
    {
      entities: {
        "input_boolean.watched": { entity_id: "input_boolean.watched", labels: ["watch"] },
        "button.on_device": { entity_id: "button.on_device", device_id: "dev1" },
        "input_boolean.plain": { entity_id: "input_boolean.plain" },
      },
      devices: { dev1: { id: "dev1", labels: ["watch"] } },
    },
  );
  const shown = (c: Partial<WhatHappenedConfig> = {}) =>
    buildTimeline(
      h,
      [
        entry({ ago: 30, entity_id: "input_boolean.watched", name: "Watched helper", state: "on" }),
        entry({
          ago: 40,
          entity_id: "button.on_device",
          name: "Button on labelled device",
          state: "2026-11-08",
        }),
        entry({ ago: 50, entity_id: "input_boolean.plain", name: "Plain helper", state: "on" }),
      ],
      cfg(c),
      NOW,
    )
      .flatMap((g) => g.items)
      .map((i) => i.name);

  it("is hidden by default", () => {
    expect(shown()).toEqual([]);
  });

  it("shows everything carrying the label, entities and devices alike, and nothing else", () => {
    expect(shown({ also_show_labels: ["watch"] })).toEqual([
      "Watched helper",
      "Button on labelled device",
    ]);
    expect(shown({ also_show_labels: ["other"] })).toEqual([]);
  });

  it("combines with entities listed by name", () => {
    expect(
      shown({ also_show_labels: ["watch"], also_show_entities: ["input_boolean.plain"] }),
    ).toHaveLength(3);
  });
});
