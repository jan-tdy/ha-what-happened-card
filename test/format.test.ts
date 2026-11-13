import { describe, expect, it } from "vitest";
import { formatDayLabel, formatRelative } from "../src/format";
import type { HomeAssistant } from "../src/types";
import { makeHass } from "./helpers";

const withLang = (language: string): HomeAssistant => makeHass([], { locale: { language } });

describe("formatRelative", () => {
  it("still reads 'just now' right after the fact, in English", () => {
    expect(formatRelative(1_000, 1_030)).toBe("just now");
  });

  it("uses Intl.RelativeTimeFormat for minutes, hours and days (English)", () => {
    const now = 1_000_000;
    expect(formatRelative(now - 5 * 60_000, now)).toBe("5 minutes ago");
    expect(formatRelative(now - 3 * 3_600_000, now)).toBe("3 hours ago");
    expect(formatRelative(now - 2 * 86_400_000, now)).toBe("2 days ago");
  });

  it("reads natively in a non-English hass.locale.language, not hardcoded English", () => {
    const now = 1_000_000;
    const en = formatRelative(now - 5 * 60_000, now, withLang("en-US"));
    const sk = formatRelative(now - 5 * 60_000, now, withLang("sk"));
    const nl = formatRelative(now - 5 * 60_000, now, withLang("nl"));
    expect(sk).not.toBe(en);
    expect(nl).not.toBe(en);
    // Loose shape check rather than an exact match, since ICU data can vary by Node version.
    expect(sk.length).toBeGreaterThan(0);
    expect(nl.length).toBeGreaterThan(0);
  });

  it("falls back to en-US when hass has no locale", () => {
    expect(formatRelative(1_000_000 - 60_000, 1_000_000, makeHass([]))).toBe("1 minute ago");
  });
});

describe("formatDayLabel", () => {
  const now = new Date("2026-11-08T12:00:00").getTime();
  const today = now - 60_000;
  const yesterday = now - 25 * 3_600_000;
  const lastWeek = now - 6 * 86_400_000;

  it("labels today and yesterday in English", () => {
    expect(formatDayLabel(today, now)).toBe("Today");
    expect(formatDayLabel(yesterday, now)).toBe("Yesterday");
  });

  it("falls back to a weekday name further back", () => {
    expect(formatDayLabel(lastWeek, now)).toMatch(/^[A-Za-z]+, .+ \d+$/);
  });

  it("uses the native phrasing for today/yesterday in another language", () => {
    const sk = formatDayLabel(yesterday, now, withLang("sk"));
    const en = formatDayLabel(yesterday, now, withLang("en-US"));
    expect(sk).not.toBe(en);
    expect(sk.length).toBeGreaterThan(0);
  });
});
