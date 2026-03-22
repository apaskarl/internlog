import { toLocalDateString } from "@/lib/time-local";
import type { TimelogTableRow } from "@/lib/types/timelog";

export type TimelogWeekGroup = {
  /** Monday of the week, `YYYY-MM-DD` (local). */
  weekStartIso: string;
  /** Human-readable range for the section header. */
  label: string;
  rows: TimelogTableRow[];
};

/** Monday 00:00 local for the calendar day of `dateKey` (`YYYY-MM-DD`). */
function mondayOfDateKey(dateKey: string): Date {
  const d = new Date(`${dateKey}T12:00:00`);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  const mon = new Date(d);
  mon.setDate(d.getDate() - diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function formatWeekRangeLabel(weekStartIso: string): string {
  const start = new Date(`${weekStartIso}T12:00:00`);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const y = start.getFullYear();
  return `Week of ${fmt(start)} – ${fmt(end)}, ${y}`;
}

/** How to order days within a week and week blocks (by week-start Monday). */
export type TimelogDateSortOrder = "desc" | "asc";

/**
 * Groups rows by ISO weeks starting **Monday** (same convention as weekly stats).
 * Week blocks and rows within a week follow `dateOrder` (latest vs oldest first).
 */
export function groupTimelogRowsByWeek(
  rows: TimelogTableRow[],
  dateOrder: TimelogDateSortOrder = "desc",
): TimelogWeekGroup[] {
  const byWeek = new Map<string, TimelogTableRow[]>();
  for (const row of rows) {
    const dk = row.dateKey;
    if (!dk) continue;
    const mon = mondayOfDateKey(dk);
    const weekStartIso = toLocalDateString(mon);
    if (!byWeek.has(weekStartIso)) byWeek.set(weekStartIso, []);
    byWeek.get(weekStartIso)!.push(row);
  }
  const cmpDate = (a: TimelogTableRow, b: TimelogTableRow) => {
    const da = a.dateKey ?? "";
    const db = b.dateKey ?? "";
    return dateOrder === "desc" ? db.localeCompare(da) : da.localeCompare(db);
  };
  for (const [, arr] of byWeek) {
    arr.sort(cmpDate);
  }
  const weekCmp = (a: [string, TimelogTableRow[]], b: [string, TimelogTableRow[]]) =>
    dateOrder === "desc" ? b[0].localeCompare(a[0]) : a[0].localeCompare(b[0]);
  return [...byWeek.entries()]
    .sort(weekCmp)
    .map(([weekStartIso, weekRows]) => ({
      weekStartIso,
      label: formatWeekRangeLabel(weekStartIso),
      rows: weekRows,
    }));
}

const MONTH_FILTER_START = new Date(2026, 0, 1); // Jan 2026 — internship window start

/** Month options from Jan 2026 through the current month (newest first). `all` = paginated list. */
export function buildMonthFilterOptions(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [
    { value: "all", label: "All entries" },
  ];
  const now = new Date();
  let end = new Date(now.getFullYear(), now.getMonth(), 1);
  if (end < MONTH_FILTER_START) {
    end = new Date(MONTH_FILTER_START);
  }
  const cursor = new Date(end);
  while (cursor >= MONTH_FILTER_START) {
    const value = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    const label = cursor.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
    out.push({ value, label });
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return out;
}
