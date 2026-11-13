import { t } from "./strings";
import type { HomeAssistant } from "./types";

function language(hass: HomeAssistant | undefined): string {
  return hass?.locale?.language ?? "en-US";
}

function localDayStart(ms: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function dayKey(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function use12Hours(hass: HomeAssistant | undefined): boolean {
  const pref = hass?.locale?.time_format;
  if (pref === "12") return true;
  if (pref === "24") return false;
  return new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions().hour12 ?? false;
}

export function formatTime(ms: number, hass: HomeAssistant | undefined, seconds = false): string {
  const twelve = use12Hours(hass);
  return new Intl.DateTimeFormat(language(hass), {
    hour: twelve ? "numeric" : "2-digit",
    minute: "2-digit",
    second: seconds ? "2-digit" : undefined,
    hourCycle: twelve ? "h12" : "h23",
  }).format(ms);
}

export function formatDateTime(ms: number, hass: HomeAssistant | undefined): string {
  const date = new Intl.DateTimeFormat(language(hass), {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(ms);
  return `${date}, ${formatTime(ms, hass, true)}`;
}

const rtfCache = new Map<string, Intl.RelativeTimeFormat>();

/** One `Intl.RelativeTimeFormat` per language: it ships native phrasing ("pred 5 minútami",
 * "5 minuten geleden", "yesterday") for every ICU locale, so the card needs no string table
 * entry per language for this. */
function relativeFormatter(lang: string): Intl.RelativeTimeFormat {
  let rtf = rtfCache.get(lang);
  if (!rtf) {
    rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
    rtfCache.set(lang, rtf);
  }
  return rtf;
}

export function formatRelative(ms: number, now: number, hass?: HomeAssistant): string {
  const seconds = Math.max(0, Math.round((now - ms) / 1000));
  const lang = language(hass);
  // Finer than RelativeTimeFormat's "now" (which would otherwise cover anything under a
  // minute): kept as a small, explicitly-translatable phrase rather than hand-rolled English.
  if (seconds < 45) return t("just now", lang);
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return relativeFormatter(lang).format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours < 24) return relativeFormatter(lang).format(-hours, "hour");
  const days = Math.round(hours / 24);
  return relativeFormatter(lang).format(-days, "day");
}

export function formatDayLabel(ms: number, now: number, hass?: HomeAssistant): string {
  const diffDays = Math.round((localDayStart(now) - localDayStart(ms)) / 86_400_000);
  const lang = language(hass);
  if (diffDays === 0 || diffDays === 1) {
    // RelativeTimeFormat naturally produces "today"/"yesterday" (or their equivalent) per
    // locale; capitalized to match the day heading style of the weekday names below.
    const label = relativeFormatter(lang).format(-diffDays, "day");
    return label.charAt(0).toUpperCase() + label.slice(1);
  }
  const sameYear = new Date(ms).getFullYear() === new Date(now).getFullYear();
  return new Intl.DateTimeFormat(lang, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  }).format(ms);
}
