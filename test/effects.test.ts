import { describe, expect, it } from "vitest";
import { groupEffects } from "../src/effects";
import { buildTimeline } from "../src/timeline";
import type { ActionEvent } from "../src/trace";
import type { LogbookEntry, WhatHappenedConfig } from "../src/types";
import { NOW, entry, makeHass, state } from "./helpers";

const hass = makeHass([
  state("person.jan", "home", { friendly_name: "Ján Dubovský", user_id: "u1" }),
  state("input_button.prid", "unknown", { friendly_name: "4 – Prídem onedlho" }),
  state("automation.code", "on", {
    friendly_name: "DevControl – Hlásenie kódu (spracovanie)",
    id: "1",
  }),
  state("media_player.echo", "idle", { friendly_name: "Atom Echo 01" }),
  state("text.b35", "Kod 4", { friendly_name: 'JadivClock 3.5" Broadcast' }),
  state("text.b43", "Kod 4", { friendly_name: 'JadivClock4.3" Jedáleň JadivClock Broadcast' }),
  state("text.b24", "Kod 4", { friendly_name: 'JadivClock 2.4" Broadcast' }),
  state("input_select.who", "Ján", { friendly_name: "Hlásenie – kto hlási" }),
  state("light.kitchen", "on", { friendly_name: "Kitchen light" }),
]);
const cfg = (c: Partial<WhatHappenedConfig> = {}): WhatHappenedConfig => ({
  type: "custom:what-happened-card",
  also_show_domains: ["text", "input_select"],
  ...c,
});

const viaCode = {
  context_event_type: "automation_triggered",
  context_entity_id: "automation.code",
  context_source: "input_button.prid was pressed",
};

// Pressing "4 – Prídem onedlho" as Ján, exactly as it appears in the real log.
const press: LogbookEntry[] = [
  entry({
    ago: 100,
    entity_id: "input_button.prid",
    name: "4 – Prídem onedlho",
    state: "2026-11-08T16:38:00",
    context_user_id: "u1",
    context_event_type: "call_service",
    context_domain: "input_button",
    context_service: "press",
  }),
  entry({
    ago: 99,
    entity_id: "automation.code",
    domain: "automation",
    name: "DevControl – Hlásenie kódu (spracovanie)",
    message: "triggered by input_button.prid was pressed",
    source: "input_button.prid was pressed",
  }),
  entry({
    ago: 98,
    entity_id: "text.b35",
    name: 'JadivClock 3.5" Broadcast',
    state: "Kod 4",
    ...viaCode,
  }),
  entry({
    ago: 98,
    entity_id: "text.b43",
    name: 'JadivClock4.3" Jedáleň JadivClock Broadcast',
    state: "Kod 4",
    ...viaCode,
  }),
  entry({
    ago: 98,
    entity_id: "text.b24",
    name: 'JadivClock 2.4" Broadcast',
    state: "Kod 4",
    ...viaCode,
  }),
  entry({
    ago: 97,
    entity_id: "input_select.who",
    name: "Hlásenie – kto hlási",
    state: "Ján",
    context_event_type: "call_service",
    context_domain: "input_select",
    context_service: "select_option",
  }),
];
const say: ActionEvent[] = [
  { kind: "say", text: "Kod 4", speakers: ["media_player.echo"], service: "tts.speak" },
];
const build = (e: LogbookEntry[], c: Partial<WhatHappenedConfig> = {}, actions = say) =>
  buildTimeline(hass, e, cfg(c), NOW, undefined, undefined, () => actions).flatMap((g) => g.items);

describe("one action, one entry", () => {
  const items = build(press);

  it("is a single entry headed by what was pressed, and by whom", () => {
    expect(items).toHaveLength(1);
    const [head] = items;
    expect(head.name).toBe("4 – Prídem onedlho");
    expect(head.cause?.actor?.name).toBe("Ján Dubovský");
    expect(head.via?.map((a) => a.name)).toEqual(["DevControl – Hlásenie kódu (spracovanie)"]);
  });

  it("lists everything it caused underneath", () => {
    const lines = items[0].effects!.map((e) => `${e.name} ${e.verb}`);
    expect(lines).toEqual([
      "Atom Echo 01 said “Kod 4”",
      "3 text entities changed to Kod 4",
      "Hlásenie – kto hlási changed to Ján",
    ]);
    expect(items[0].effects![1].details?.[0]).toContain("JadivClock 3.5");
  });

  it("is headed by the automation when nothing visible triggered it", () => {
    const timer = press
      .slice(1)
      .map((e) => ({ ...e, context_source: "time", source: "time", message: "triggered by time" }));
    const result = build(timer);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("DevControl – Hlásenie kódu (spracovanie)");
    expect(result[0].verb).toBe("ran");
    expect(result[0].cause?.trigger).toBe("time");
    expect(result[0].effects!.length).toBeGreaterThanOrEqual(2);
  });

  it("tells one effect of a person's press as press-by-person, with what it caused", () => {
    const one = [press[0], press[1]];
    const result = build(one);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("4 – Prídem onedlho");
    expect(result[0].cause?.actor?.name).toBe("Ján Dubovský");
    expect(result[0].effects!.map((e) => `${e.name} ${e.verb}`)).toEqual([
      "Atom Echo 01 said “Kod 4”",
    ]);
  });

  it("keeps one effect of a sensor as a single line", () => {
    const sensorHass = makeHass([
      state("binary_sensor.motion", "on", { friendly_name: "Hall motion", device_class: "motion" }),
      state("automation.lights", "on", { friendly_name: "Motion light" }),
      state("light.kitchen", "on", { friendly_name: "Kitchen light" }),
    ]);
    const result = buildTimeline(
      sensorHass,
      [
        entry({ ago: 60, entity_id: "binary_sensor.motion", name: "Hall motion", state: "on" }),
        entry({
          ago: 58,
          entity_id: "light.kitchen",
          name: "Kitchen light",
          state: "on",
          context_event_type: "automation_triggered",
          context_entity_id: "automation.lights",
          context_source: "state of binary_sensor.motion",
        }),
      ],
      cfg(),
      NOW,
    ).flatMap((g) => g.items);
    expect(result).toHaveLength(1);
    expect(result[0].effects).toBeUndefined();
    expect(result[0].name).toBe("Kitchen light");
    expect(result[0].cause?.trigger).toBe("Hall motion detected motion");
  });

  it("does not pull in unrelated entries, or the same thing at another time", () => {
    const other = entry({
      ago: 600,
      entity_id: "light.kitchen",
      name: "Kitchen light",
      state: "off",
    });
    expect(build([...press, other]).map((i) => i.name)).toEqual([
      "4 – Prídem onedlho",
      "Kitchen light",
    ]);
    const later = press.map((e) => ({ ...e, when: e.when - 3600 }));
    expect(build([...press, ...later])).toHaveLength(2);
  });

  it("shows an entity the user asked for as a line of the action that caused it", () => {
    const plain = build(press, { also_show_entities: [] })[0].effects!;
    const result = build(press, { also_show_entities: ["text.b35", "text.b43", "text.b24"] });
    // still one entry: the picked displays are not left behind as rows of their own
    expect(result).toHaveLength(1);
    expect(result[0].effects!.length).toBe(plain.length);
    expect(result[0].effects!.map((e) => e.name).join(" ")).toContain("3 text entities");
  });

  it("shows a script that switched on and off as one line that says it ran", () => {
    const withScript = [
      ...press,
      entry({
        ago: 98,
        entity_id: "script.tts",
        name: "TTS Announce Script",
        state: "on",
        ...viaCode,
      }),
      entry({
        ago: 97,
        entity_id: "script.tts",
        name: "TTS Announce Script",
        state: "off",
        ...viaCode,
      }),
    ];
    const scriptHass = makeHass([
      ...Object.values(hass.states),
      state("script.tts", "off", { friendly_name: "TTS Announce Script" }),
    ]);
    const result = buildTimeline(
      scriptHass,
      withScript,
      cfg({ also_show_domains: ["text", "input_select", "script"] }),
      NOW,
      undefined,
      undefined,
      () => say,
    ).flatMap((g) => g.items);
    expect(result).toHaveLength(1);
    const lines = result[0].effects!.map((e) => `${e.name} ${e.verb}`);
    expect(lines.filter((l) => l.startsWith("TTS Announce Script"))).toEqual([
      "TTS Announce Script ran",
    ]);
    expect(lines.join(" ")).not.toContain("turned on");
    expect(lines.join(" ")).not.toContain("turned off");
  });

  it("is off when the user picks what to see", () => {
    expect(
      build(press, {
        include_domains: ["text", "input_button", "automation", "media_player", "input_select"],
      }).length,
    ).toBeGreaterThan(1);
  });
});

describe("icon colors", () => {
  const colored = (colors: WhatHappenedConfig["colors"]) =>
    buildTimeline(
      hass,
      [
        entry({ ago: 30, entity_id: "light.kitchen", name: "Kitchen light", state: "on" }),
        entry({
          ago: 40,
          entity_id: "input_select.who",
          name: "Hlásenie",
          state: "Ján",
          context_user_id: "u1",
        }),
      ],
      cfg({ colors }),
      NOW,
    )
      .flatMap((g) => g.items)
      .map((i) => [i.name, i.accent]);

  it("uses palette names, css colors, and lets an entity beat its domain", () => {
    expect(
      colored([
        { match: "light", color: "teal" },
        { match: "input_select", color: "#ff8800" },
      ]),
    ).toEqual([
      ["Kitchen light", "var(--teal-color, #009688)"],
      ["Hlásenie", "#ff8800"],
    ]);
    expect(
      colored([
        { match: "light", color: "teal" },
        { match: "light.kitchen", color: "pink" },
      ])[0][1],
    ).toBe("var(--pink-color, #e91e63)");
  });

  it("leaves everything else alone", () => {
    const plain = colored(undefined);
    expect(colored([{ match: "fan", color: "red" }])).toEqual(plain);
  });

  it("also colors the lines of a grouped entry", () => {
    const [head] = buildTimeline(
      hass,
      press,
      cfg({ colors: [{ match: "text", color: "orange" }] }),
      NOW,
      undefined,
      undefined,
      () => say,
    ).flatMap((g) => g.items);
    const text = head.effects!.find((e) => e.name.includes("text entities"))!;
    expect(text.accent).toBe("var(--orange-color, #ff9800)");
  });
});

describe("any action, not just one button", () => {
  // The press came from a device on the wall: nobody is on record as having done it.
  const wallPress = (ago: number) =>
    entry({
      ago,
      entity_id: "input_button.prid",
      name: "4 – Prídem onedlho",
      state: "2026-11-08T16:38:00",
    });
  const text = (id: string, name: string, ago: number, withTrigger: boolean) =>
    entry({
      ago,
      entity_id: id,
      name,
      state: "Kod 4",
      context_event_type: "automation_triggered",
      context_entity_id: "automation.code",
      ...(withTrigger ? { context_source: "input_button.prid was pressed" } : {}),
    });

  const action = (withTriggerOnTexts: boolean): LogbookEntry[] => [
    wallPress(100),
    entry({
      ago: 99,
      entity_id: "automation.code",
      domain: "automation",
      name: "DevControl – Hlásenie kódu (spracovanie)",
      message: "triggered by input_button.prid was pressed",
      source: "input_button.prid was pressed",
    }),
    text("text.b35", 'JadivClock 3.5" Broadcast', 98, withTriggerOnTexts),
    text("text.b43", 'JadivClock4.3" Jedáleň JadivClock Broadcast', 98, withTriggerOnTexts),
    text("text.b24", 'JadivClock 2.4" Broadcast', 98, withTriggerOnTexts),
  ];

  it("is headed by a press that nobody is on record for", () => {
    const result = build(action(true));
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("4 – Prídem onedlho");
    expect(result[0].verb).toBe("was pressed");
    expect(result[0].cause).toBeUndefined();
    expect(result[0].effects!.map((e) => `${e.name} ${e.verb}`)).toEqual([
      "Atom Echo 01 said “Kod 4”",
      "3 text entities changed to Kod 4",
    ]);
  });

  it("keeps effects together although only some of them name their trigger", () => {
    const result = build(action(false));
    expect(result).toHaveLength(1);
    expect(result[0].effects).toHaveLength(2);
  });

  it("shows the press on its own when it only caused one effect that is not worth a line", () => {
    // the press is dropped when nothing is folded under it and it is not worth a row itself
    const lonely = [wallPress(100)];
    expect(build(lonely)).toHaveLength(0);
  });

  it("does not mix two presses that happen seconds apart", () => {
    const second = {
      ...action(true)[0],
      entity_id: "input_button.other",
      name: "Other",
      when: NOW / 1000 - 96,
    };
    const hassTwo = makeHass([
      ...Object.values(hass.states),
      state("input_button.other", "unknown", { friendly_name: "Other" }),
    ]);
    const entries = [
      ...action(true),
      second,
      entry({
        ago: 95,
        entity_id: "text.b35",
        name: 'JadivClock 3.5" Broadcast',
        state: "Kod 9",
        context_event_type: "automation_triggered",
        context_entity_id: "automation.code",
        context_source: "input_button.other was pressed",
      }),
      entry({
        ago: 95,
        entity_id: "text.b24",
        name: 'JadivClock 2.4" Broadcast',
        state: "Kod 9",
        context_event_type: "automation_triggered",
        context_entity_id: "automation.code",
        context_source: "input_button.other was pressed",
      }),
    ];
    const result = buildTimeline(
      hassTwo,
      entries,
      cfg(),
      NOW,
      undefined,
      undefined,
      () => say,
    ).flatMap((g) => g.items);
    expect(result.map((i) => i.name).sort()).toEqual(["4 – Prídem onedlho", "Other"].sort());
  });
});

describe("review findings", () => {
  const viaPress = (id: string) => ({
    context_event_type: "automation_triggered",
    context_entity_id: "automation.code",
    context_source: `${id} was pressed`,
  });

  it("keeps two triggers apart even when their own rows are not in the log", () => {
    const hassTwo = makeHass([
      ...Object.values(hass.states),
      state("input_button.a", "unknown", { friendly_name: "Button A" }),
      state("input_button.b", "unknown", { friendly_name: "Button B" }),
    ]);
    const entries = [
      entry({
        ago: 100,
        entity_id: "text.b35",
        name: 'JadivClock 3.5" Broadcast',
        state: "A",
        ...viaPress("input_button.a"),
      }),
      entry({
        ago: 100,
        entity_id: "text.b24",
        name: 'JadivClock 2.4" Broadcast',
        state: "A",
        ...viaPress("input_button.a"),
      }),
      entry({
        ago: 95,
        entity_id: "text.b35",
        name: 'JadivClock 3.5" Broadcast',
        state: "B",
        ...viaPress("input_button.b"),
      }),
      entry({
        ago: 95,
        entity_id: "text.b24",
        name: 'JadivClock 2.4" Broadcast',
        state: "B",
        ...viaPress("input_button.b"),
      }),
    ];
    const result = buildTimeline(hassTwo, entries, cfg(), NOW).flatMap((g) => g.items);
    expect(result).toHaveLength(2);
    expect(result.map((i) => i.cause?.trigger).sort()).toEqual([
      "Button A was pressed",
      "Button B was pressed",
    ]);
  });

  it("heads a single effect by the press when the press is not worth a row by itself", () => {
    const result = build([press[0], press[1]].map((e) => ({ ...e, context_user_id: undefined })));
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("4 – Prídem onedlho");
    expect(result[0].effects!.map((e) => `${e.name} ${e.verb}`)).toEqual([
      "Atom Echo 01 said “Kod 4”",
    ]);
  });
});

describe("a script that a person ran", () => {
  const findHass = makeHass([
    ...Object.values(hass.states),
    state("script.find_phone", "off", { friendly_name: "FIND Phone" }),
  ]);
  const byJan = {
    context_user_id: "u1",
    context_event_type: "call_service",
    context_domain: "script",
    context_service: "turn_on",
  };
  const log: LogbookEntry[] = [
    entry({ ago: 100, entity_id: "script.find_phone", name: "FIND Phone", state: "on", ...byJan }),
    entry({
      ago: 100,
      entity_id: "script.find_phone",
      domain: "script",
      name: "FIND Phone",
      message: "started",
      ...byJan,
    }),
  ];
  const notify = (text: string, title?: string): ActionEvent => ({
    kind: "notify",
    text,
    title,
    speakers: [],
    service: "notify.mobile_app_phone",
  });
  const run = (actions: ActionEvent[], e = log) =>
    buildTimeline(findHass, e, cfg(), NOW, undefined, undefined, () => actions).flatMap(
      (g) => g.items,
    );

  it("is one entry: the script ran, by the person, with its notifications under it", () => {
    const result = run([
      notify("Vrrrrr! Niesom macka!", "Tu som!"),
      notify("command_ringer_mode"),
      notify("command_volume_level"),
      notify("command_volume_level"),
    ]);
    expect(result).toHaveLength(1);
    const [head] = result;
    expect(head.name).toBe("FIND Phone");
    expect(head.verb).toBe("ran");
    expect(head.cause?.actor?.name).toBe("Ján Dubovský");
    expect(head.effects!.map((e) => `${e.name} ${e.verb}${e.count ? ` ×${e.count}` : ""}`)).toEqual(
      [
        "Notification sent “Tu som!: Vrrrrr! Niesom macka!”",
        "Notification sent “command_ringer_mode”",
        "Notification sent “command_volume_level” ×2",
      ],
    );
  });

  it("is also one entry when it sent only one thing", () => {
    const result = run([notify("command_ringer_mode")]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("FIND Phone");
    expect(result[0].effects).toHaveLength(1);
  });
});

describe("a script with nothing to group", () => {
  it("is one 'ran' entry, not turned on and off", () => {
    const hass = makeHass([state("script.radio", "off", { friendly_name: "Radio" })]);
    const mk = (verb: string, when: number) =>
      ({
        key: `k${when}`,
        when,
        entityId: "script.radio",
        domain: "script",
        name: "Radio",
        verb,
        tone: "neutral",
        icon: "mdi:script-text",
        isPerson: false,
        isRun: false,
        count: 1,
      }) as never;
    const out = groupEffects(hass, [mk("was turned off", 2000), mk("was turned on", 1000)]);
    expect(out).toHaveLength(1);
    expect(out[0].verb).toBe("ran");
  });
});
