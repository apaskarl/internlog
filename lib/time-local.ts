/** Local calendar date `YYYY-MM-DD` for Postgres `date`. */
export function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Local time `HH:MM:SS` for Postgres `time`. */
export function toPgTime(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${min}:${s}`;
}

/**
 * Converts `<input type="time">` values (`HH:MM` or `HH:MM:SS`) to Postgres `HH:MM:SS`.
 * Empty or whitespace returns `null` (e.g. clear clock-out).
 */
export function toPgTimeFromInput(s: string | null | undefined): string | null {
  const t = (s ?? "").trim();
  if (!t) return null;
  const parts = t.split(":");
  if (parts.length === 2) {
    const h = parts[0]!.padStart(2, "0");
    const m = parts[1]!.padStart(2, "0");
    return `${h}:${m}:00`;
  }
  if (parts.length === 3) {
    return `${parts[0]!.padStart(2, "0")}:${parts[1]!.padStart(2, "0")}:${parts[2]!.padStart(2, "0")}`;
  }
  return null;
}

/** Postgres `time` string → value for `<input type="time" step="1">`. */
export function pgTimeToInputValue(pg: string | null | undefined): string {
  if (pg == null || pg === "") return "";
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(pg.trim());
  if (!m) return "";
  const h = m[1]!.padStart(2, "0");
  const min = m[2]!.padStart(2, "0");
  const s = (m[3] ?? "00").padStart(2, "0");
  return `${h}:${min}:${s}`;
}
