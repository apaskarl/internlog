/**
 * Supabase returns PostgreSQL `time` as "HH:MM:SS" (no date). `timestamp` returns ISO strings.
 * `new Date("09:00:00")` is invalid in JS — combine with `date` for durations.
 */

export function formatTimeForUi(value: string | null): string {
  if (value == null || value === "") return "—";
  const v = value.trim();
  if (/^\d{4}-\d{2}-\d{2}T/.test(v) || v.includes("GMT") || v.endsWith("Z")) {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
    }
  }
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(v);
  if (m) {
    const h = parseInt(m[1]!, 10);
    const min = parseInt(m[2]!, 10);
    const d = new Date(2000, 0, 1, h, min);
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  const d = new Date(v);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  return v;
}

function msFromDateAndTime(
  dateStr: string | null,
  timeStr: string | null,
): number | null {
  if (!dateStr || !timeStr) return null;
  const datePart = dateStr.split("T")[0]!;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return null;
  const t = timeStr.trim().split(/\./)[0]!;
  const ms = new Date(`${datePart}T${t}`).getTime();
  return Number.isNaN(ms) ? null : ms;
}

/** Formats a non-negative duration as `Hh MMm SSs` (minutes and seconds zero-padded). */
export function formatDurationMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m ${s.toString().padStart(2, "0")}s`;
}

/** Net work duration in ms, or `null` if times are incomplete or invalid. */
export function netWorkMsFromAttendance(row: {
  date: string | null;
  time_in: string | null;
  time_out: string | null;
  break_duration?: number | null;
}): number | null {
  const a = msFromDateAndTime(row.date, row.time_in);
  const b = msFromDateAndTime(row.date, row.time_out);
  if (a == null || b == null || b <= a) return null;
  const ms = b - a;
  const breakMin = row.break_duration ?? 0;
  return Math.max(0, ms - breakMin * 60000);
}

export function grossNetFromAttendance(row: {
  date: string | null;
  time_in: string | null;
  time_out: string | null;
  break_duration?: number | null;
}): { gross: string; net: string } {
  const workMs = netWorkMsFromAttendance(row);
  const a = msFromDateAndTime(row.date, row.time_in);
  const b = msFromDateAndTime(row.date, row.time_out);
  if (a == null || b == null || b <= a || workMs == null) {
    return { gross: "—", net: "—" };
  }
  const grossMs = b - a;
  return {
    gross: formatDurationMs(grossMs),
    net: formatDurationMs(workMs),
  };
}
