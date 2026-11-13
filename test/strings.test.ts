import { describe, expect, it } from "vitest";
import { en, registerStrings, t } from "../src/strings";

describe("t", () => {
  it("reads English by default and substitutes {vars}", () => {
    expect(t("changed to {value}", undefined, { value: "23 °C" })).toBe("changed to 23 °C");
    expect(t("was opened", "en-US")).toBe("was opened");
  });

  it("falls back to English for an unregistered language", () => {
    expect(t("returned to its dock", "sk")).toBe("returned to its dock");
    expect(t("changed {n} times", "nl", { n: 3 })).toBe("changed 3 times");
  });

  it("falls back key by key when a registered dictionary is missing one", () => {
    registerStrings("xx", { "was opened": "xx-opened" });
    expect(t("was opened", "xx")).toBe("xx-opened");
    // Not translated for "xx": falls back to English, not to the key's raw text by accident.
    expect(t("was closed", "xx")).toBe(en["was closed"]);
  });

  it("is unaffected by region subtags (sk-SK behaves like sk)", () => {
    registerStrings("sk", { "was opened": "bolo otvorené" });
    expect(t("was opened", "sk-SK")).toBe("bolo otvorené");
  });
});
