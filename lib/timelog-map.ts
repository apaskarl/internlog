import {
  formatTimeForUi,
  grossNetFromAttendance,
  netWorkMsFromAttendance,
} from "@/lib/attendance-time";
import type { AttendanceDbRow, TimelogTableRow } from "@/lib/types/timelog";

function formatDayLabel(dateStr: string | null): string {
  if (dateStr == null || dateStr === "") return "—";
  try {
    const d = /^\d{4}-\d{2}-\d{2}$/.test(dateStr)
      ? new Date(`${dateStr}T12:00:00`)
      : new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function parseBreakMinutes(
  v: number | string | null | undefined,
): number | null {
  if (v == null || v === "") return null;
  const n = typeof v === "string" ? Number.parseInt(v, 10) : v;
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

/** Break column: minutes from `break_duration` (0 shows as `0m`). */
export function formatBreakMinutes(min: number | null | undefined): string {
  if (min == null) return "—";
  if (min === 0) return "0m";
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function dateKeyFromAttendance(date: string | null): string | null {
  if (date == null || date === "") return null;
  const part = date.split("T")[0]!;
  return /^\d{4}-\d{2}-\d{2}$/.test(part) ? part : null;
}

/** Map Supabase `attendance` rows into the time log table shape. */
export function mapAttendanceToTimelogRows(rows: AttendanceDbRow[]): TimelogTableRow[] {
  return rows.map((row) => {
    const breakMin = parseBreakMinutes(row.break_duration);
    const payload = {
      date: row.date,
      time_in: row.time_in,
      time_out: row.time_out,
      break_duration: breakMin ?? undefined,
    };
    const { gross, net } = grossNetFromAttendance(payload);
    const netMs = netWorkMsFromAttendance(payload);
    const hasOut = Boolean(row.time_out);
    const dateKey = dateKeyFromAttendance(row.date);
    return {
      id: String(row.id),
      dateKey,
      dateRaw: dateKey,
      timeInRaw: row.time_in ?? null,
      timeOutRaw: row.time_out ?? null,
      breakMinutes: breakMin,
      netWorkMs: netMs ?? 0,
      dayLabel: formatDayLabel(row.date),
      clockIn: formatTimeForUi(row.time_in),
      clockOut: formatTimeForUi(row.time_out),
      breakTime: formatBreakMinutes(breakMin ?? undefined),
      duration: gross,
      netDuration: net,
      status: hasOut ? "complete" : "partial",
      notes: "—",
    };
  });
}
