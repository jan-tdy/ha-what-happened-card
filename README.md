# What Happened Card

[![HACS](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz)
[![CI](https://github.com/jan-tdy/ha-what-happened-card/actions/workflows/ci.yml/badge.svg)](https://github.com/jan-tdy/ha-what-happened-card/actions/workflows/ci.yml)

A live, resizable timeline for Home Assistant that tells you **what happened, when, why and who or what caused it**.

![Preview](docs/preview.png)

> Living room light was turned on — by **Motion light** — triggered by **state of Hallway motion**

## Features

- Live vertical timeline built on the Home Assistant logbook, with day headers and clock/relative times.
- Explains the cause using Home Assistant context: person (with profile picture), automation, script, scene, service call or another entity, plus the trigger that started it.
- Choose **how many** entries (1 – 500) and **how far back** (1 – 720 hours).
- Limit to areas, floors, devices, labels or entities; exclude entities or domains.
- Resizable in Sections views (drag handles), `max_height` for Masonry/Panel views.
- Native support for the [TapoVac-ADV](https://github.com/jan-tdy/TapoVac-ADV) vacuum integration (see below).
- Full visual editor, follows your theme (light/dark), keyboard accessible.

## Installation

### HACS

1. HACS → Frontend → ⋮ → **Custom repositories** → add `https://github.com/jan-tdy/ha-what-happened-card`, category **Dashboard**.
2. Install **What Happened Card** and reload the browser.

### Manual

Download `what-happened-card.js` from the latest release, put it in `config/www/` and add it as a dashboard resource (`/local/what-happened-card.js`, type _JavaScript module_).

## Usage

Add the card from the card picker (**What Happened**) or in YAML:

```yaml
type: custom:what-happened-card
title: What happened
hours_to_show: 24
max_entries: 50
target:
  area_id:
    - living_room
exclude_domains:
  - automation
```

## Options

| Option                 | Default        | Description                                                                                                         |
| ---------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------- |
| `title`                | –              | Card title                                                                                                          |
| `hours_to_show`        | `24`           | Time window, 1 – 720 hours                                                                                          |
| `max_entries`          | `50`           | Maximum entries, 1 – 500                                                                                            |
| `order`                | `newest_first` | `newest_first` or `oldest_first`                                                                                    |
| `target`               | all            | `entity_id`, `device_id`, `area_id`, `floor_id`, `label_id` (string/list)                                           |
| `exclude_entities`     | –              | Entities to hide                                                                                                    |
| `hide_devices`         | –              | Devices to hide: every entity of these devices is hidden, unless listed in `also_show_entities`/`also_show_labels`  |
| `also_show_entities`   | –              | Always show these entities, even if the default view hides them; pick an automation or script to list its runs      |
| `also_show_labels`     | –              | Like `also_show_entities`, for everything carrying one of these labels (entities and devices)                       |
| `colors`               | –              | List of `match` (domain or entity id) and `color` (palette name or CSS color) for icons                             |
| `also_show_domains`    | –              | Add domains to the default view, e.g. `sensor`                                                                      |
| `include_domains`      | –              | Only show these domains                                                                                             |
| `exclude_domains`      | –              | Hide these domains                                                                                                  |
| `show_cause`           | `true`         | Show who/what caused it and the trigger                                                                             |
| `show_avatars`         | `true`         | Use profile pictures for people                                                                                     |
| `show_day_headers`     | `true`         | Group by day                                                                                                        |
| `state_color`          | `true`         | Color icons by entity state, using your theme's state colors                                                        |
| `compact`              | `false`        | Smaller layout                                                                                                      |
| `time_display`         | `both`         | `both`, `absolute` or `relative`                                                                                    |
| `tap_action`           | `more-info`    | `more-info` or `none`                                                                                               |
| `max_height`           | –              | Pixels; for Masonry/Panel views                                                                                     |
| `vacuum_details`       | `true`         | Rich entries for TapoVac-ADV vacuums (rooms, duration, reason)                                                      |
| `activity`             | `meaningful`   | `meaningful` or `everything` (clocks, sensors, updates, …)                                                          |
| `automation_runs`      | `actions`      | `actions`, `all` or `none` (see below)                                                                              |
| `chatty`               | `summarize`    | Very frequent entities: `summarize`, `hide` or `show`                                                               |
| `show_diagnostic`      | `false`        | Include diagnostic, configuration and hidden entities                                                               |
| `hide_unavailable`     | `true`         | Hide `unavailable` / `unknown` states, and an entity coming back from them in the state it had before               |
| `collapse_repeats`     | `true`         | Merge rapid repeats of the same event (shown as ×N)                                                                 |
| `group_device_actions` | `true`         | Fold a device's (or device-less entity's) different actions within `group_window_minutes` into one expandable entry |
| `group_window_minutes` | `3`            | Grouping window for `group_device_actions`, 1 – 60 minutes                                                          |

The "why" comes from the Home Assistant logbook context. Changes made physically on a device have no context, so they show without a cause line.

## Smart defaults

The card works out what is worth showing, so you do not have to pick entities by hand.

**Shows things that happened:** lights, switches, locks, covers, doors and windows, motion, alarm, media players, vacuums, climate, scenes and people arriving or leaving, each with who or what caused it.

**Leaves out by default** (tested against the log of a real house, ~500 lines an hour became a handful):

- clocks, text and number sensors, battery and signal values, update entities;
- diagnostic, configuration and hidden entities;
- helpers (`input_boolean`, `input_select`, …) and buttons, unless a person used them. An automation flipping a helper is plumbing;
- the `device_tracker` next to every person: a person and their phone arriving in the same second are one entry, "Pavel arrived home, by device moto g13". A device that changes while the person stays put says nothing about anyone and is left out;
- a binary sensor with no device class and no known cause;
- the **restart echo**: dozens of entities restoring their state with no cause right after Home Assistant starts, and the "stopped" half of a restart;
- the members of a light group (or any group entity) that switched together with it: only the group is shown. A member that changes on its own, while the group stays as it is, is still shown;
- the same action split over many entities: a script, the speaker, a status LED and a text sensor that all changed because of one automation become a single entry.

- **Show more:** `also_show_entities` adds entities the default view would hide (a helper, a button, a diagnostic entity, an automation whose runs you want to follow); `also_show_labels` does the same for everything carrying a Home Assistant label (entities and devices), so one "watch this" label is enough; `also_show_domains` adds whole domains such as `sensor`. Both are additive: everything else keeps following the default view. An entity you list is always shown and never summarized; when an automation caused it together with other things, it is a line under that action rather than a row of its own.
- **Hide a whole device:** `hide_devices` hides every entity of the listed devices in one go, handy for a device with many sensors (a presence sensor with a dozen sub-entities, a laptop). List one of its entities in `also_show_entities` (or give it a label in `also_show_labels`) to keep just that one visible; the editor's "Hide these devices" section lists each hidden device's entities with a checkbox for exactly this.
- **Grouped device actions:** when several different actions of one device's entities (or, once the entity registry confirms it has no device, of that one entity) happen within `group_window_minutes` of each other, they become one entry showing the latest action, captioned "N changes in the last X min" with a ringed icon; click it to reveal the earlier ones, oldest first. An entity in `also_show_entities`/`also_show_labels` is never folded into one of these groups. Turn it off with `group_device_actions: false`.
- **One action, one entry:** pressing a button that runs an automation which speaks, changes three displays and sets a helper is one entry: `"4 – Prídem onedlho" was pressed, by Ján, via DevControl – Hlásenie kódu`, with what it caused listed underneath (`Atom Echo 01 said “Kod 4”`, `3 text entities changed to Kod 4`, `TTS Announce Script ran`, ...). A script that switched on and off is a single "ran" line, and identical lines in a row are shown once with a count (`× 2`). A script or automation that a person started is one entry too: `FIND Phone ran, by Ján`, with the notifications it sent underneath. This works for any action, not just buttons: whatever started the automation (a button on the wall, a sensor, a helper) heads the entry even when that entity would not be listed by itself, as long as something is listed under it. When nothing visible started it (a timer), the automation heads the entry instead. Effects belong together because one automation did them within seconds, even if their log lines do not all name the trigger; two different triggers inside one burst stay two entries.
- **Colors:** icons follow your theme's state colors, except a vacuum, which is teal in every state (red on an error). Anything that stays grey, such as a helper, can be given a color with `colors`, by domain or by entity (an entity beats its domain):

  ```yaml
  colors:
    - match: input_select
      color: purple
    - match: light.kitchen
      color: "#ff8800"
  ```

- `activity: everything` shows all of it again. Picking an entity by name in `target`, or domains in `include_domains`, always shows them, and also turns off the grouping of light-group members and of a person with their device.
- **Automations and scripts:** most runs are plumbing ("AI summaries was triggered", a helper toggled), so they are not listed. When a run switched something, the change is shown with "by <automation>, triggered by …". When a run said something on a speaker or sent a notification, that becomes its own entry, in the same shape as everything else: `Kitchen speaker said “Someone is at the front door”`, `by Announce visitor, triggered by Front door was opened`. `automation_runs: all` lists every run, `none` hides runs and what they said.
- **How it knows:** the spoken text and notifications are read from the run trace, which Home Assistant only gives to admin users. Without admin rights, or with `show_actions: false`, plain runs simply stay hidden.
- Automations triggered by other automations read "triggered by another automation"; long values are shortened.

## TapoVac-ADV vacuum support

If you use [TapoVac-ADV](https://github.com/jan-tdy/TapoVac-ADV) (`tapo_rv30`), the card detects its vacuums automatically. Each cleaning run gets two entries, because they happen at two different times:

> **Robot vacuum started cleaning Kitchen and Hallway**
> by Cleaning planner, triggered by Kitchen: 6 days since last clean; nobody home
>
> **Robot vacuum finished cleaning Kitchen and Hallway**
> 42 min · 38 m² · bin emptied

- **What and when:** rooms, start and finish time, duration, cleaned area, emptied bin, errors (from the integration's clean history).
- **Who and why:** the planner's own reason (which rooms were due, nobody home, …), a start you made yourself, or where the run came from (Tapo app, robot schedule, Alexa, automation, …).
- **Planner events:** sent home because someone came home, "clean anyway" overrides, skipped days and start errors.
- These replace the plain "cleaning" and "docked" logbook lines. Other states such as "returning" or "error" are still shown.
- Updates live; set `vacuum_details: false` to turn it off. The usual `target`, `exclude_entities` and `exclude_domains` filters apply to the vacuum too.

## Localization

Dates and relative times (`5 minutes ago`, `Today`) follow `hass.locale.language` via `Intl.DateTimeFormat`/`Intl.RelativeTimeFormat`, so they read natively in any Home Assistant language with no extra work. The card's own sentences ("was opened", "returned to its dock", "changed 14 times") are its own wording, not covered by Home Assistant's translations, and live in `src/strings.ts` as a small `en` dictionary behind a `t()` lookup that falls back to English key by key. Only `en` is registered today — contributions of further language dictionaries (`registerStrings()`) are very welcome.

## Development

```bash
npm ci
npm test          # unit tests
npm run typecheck
npm run build     # dist/what-happened-card.js
npx vite          # dev harness at http://localhost:5173/dev/index.html
```

Requires Home Assistant 2024.8 or newer.

## License

MIT
