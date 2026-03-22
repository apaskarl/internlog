import { toLocalDateString } from "@/lib/time-local";
import type { WorkSessionState } from "@/lib/work-session";
import type { TimelogTableRow } from "@/lib/types/timelog";

/** Default daily internship target (8h). */
export const DEFAULT_DAILY_TARGET_MS = 8 * 60 * 60 * 1000;

/** Total internship hours target (702h). */
export const INTERNSHIP_TARGET_HOURS = 702;
export const INTERNSHIP_TARGET_MS =
  INTERNSHIP_TARGET_HOURS * 60 * 60 * 1000;

export function mondayOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + mondayOffset);
  return x;
}

export function sundayOfWeek(d: Date): Date {
  const m = mondayOfWeek(d);
  const s = new Date(m);
  s.setDate(m.getDate() + 6);
  return s;
}

export function sumNetWorkMsForToday(
  rows: TimelogTableRow[],
  todayYmd: string,
): number {
  let sum = 0;
  for (const r of rows) {
    if (r.dateKey === todayYmd) sum += r.netWorkMs;
  }
  return sum;
}

export function sumNetWorkMsForWeek(rows: TimelogTableRow[], now: Date): number {
  const from = toLocalDateString(mondayOfWeek(now));
  const to = toLocalDateString(sundayOfWeek(now));
  let sum = 0;
  for (const r of rows) {
    if (!r.dateKey || r.dateKey < from || r.dateKey > to) continue;
    sum += r.netWorkMs;
  }
  return sum;
}

/** Unpublished session net for today (not yet in `initialRows`). */
export function liveSessionNetMsForToday(
  state: WorkSessionState,
  netMs: number,
  todayYmd: string,
): number {
  if (state.phase === "idle") return 0;
  const sessionDay = toLocalDateString(new Date(state.timeInMs));
  return sessionDay === todayYmd ? netMs : 0;
}

/** Unpublished session net if session started this calendar week. */
export function liveSessionNetMsForWeek(
  state: WorkSessionState,
  netMs: number,
  now: Date,
): number {
  if (state.phase === "idle") return 0;
  const day = toLocalDateString(new Date(state.timeInMs));
  const from = toLocalDateString(mondayOfWeek(now));
  const to = toLocalDateString(sundayOfWeek(now));
  if (day >= from && day <= to) return netMs;
  return 0;
}

export function totalNetMsToday(
  rows: TimelogTableRow[],
  state: WorkSessionState,
  sessionNetMs: number,
  todayYmd: string,
): number {
  return (
    sumNetWorkMsForToday(rows, todayYmd) +
    liveSessionNetMsForToday(state, sessionNetMs, todayYmd)
  );
}

export function totalNetMsThisWeek(
  rows: TimelogTableRow[],
  state: WorkSessionState,
  sessionNetMs: number,
  now: Date,
): number {
  return (
    sumNetWorkMsForWeek(rows, now) + liveSessionNetMsForWeek(state, sessionNetMs, now)
  );
}

export function remainingTargetMs(targetMs: number, loggedMs: number): number {
  return Math.max(0, targetMs - loggedMs);
}

/** Sum of net work from all published attendance rows. */
export function sumNetWorkMsAllRows(rows: TimelogTableRow[]): number {
  let sum = 0;
  for (const r of rows) sum += r.netWorkMs;
  return sum;
}

/**
 * Total net ms toward internship: published rows plus any in-flight session
 * (not yet in the database).
 */
export function totalNetMsCareer(
  rows: TimelogTableRow[],
  state: WorkSessionState,
  sessionNetMs: number,
): number {
  const published = sumNetWorkMsAllRows(rows);
  if (state.phase === "idle") return published;
  return published + sessionNetMs;
}

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Net hours per weekday (Mon–Sun) for the calendar week containing `now`. */
export function weekDayHoursForChart(
  rows: TimelogTableRow[],
  state: WorkSessionState,
  sessionNetMs: number,
  now: Date,
): { day: string; hours: number }[] {
  const buckets = [0, 0, 0, 0, 0, 0, 0];
  const monYmd = toLocalDateString(mondayOfWeek(now));
  const sunYmd = toLocalDateString(sundayOfWeek(now));

  for (const r of rows) {
    if (!r.dateKey || r.dateKey < monYmd || r.dateKey > sunYmd) continue;
    const d = new Date(`${r.dateKey}T12:00:00`);
    const wd = d.getDay();
    const idx = wd === 0 ? 6 : wd - 1;
    buckets[idx] += r.netWorkMs;
  }

  if (state.phase !== "idle") {
    const sessionDay = toLocalDateString(new Date(state.timeInMs));
    if (sessionDay >= monYmd && sessionDay <= sunYmd) {
      const d = new Date(`${sessionDay}T12:00:00`);
      const wd = d.getDay();
      const idx = wd === 0 ? 6 : wd - 1;
      buckets[idx] += sessionNetMs;
    }
  }

  return WEEKDAY_LABELS.map((day, i) => ({
    day,
    hours: Math.round((buckets[i]! / (60 * 60 * 1000)) * 100) / 100,
  }));
}

/** Number of distinct days with logged attendance. */
export function countDaysWorked(rows: TimelogTableRow[]): number {
  const seen = new Set<string>();
  for (const r of rows) {
    if (r.dateKey) seen.add(r.dateKey);
  }
  return seen.size;
}

/** Avg hours per logged day (only days with data). Returns 0 if no days. */
export function avgHoursPerWorkedDay(rows: TimelogTableRow[]): number {
  const days = countDaysWorked(rows);
  if (days === 0) return 0;
  const totalHrs = sumNetWorkMsAllRows(rows) / (60 * 60 * 1000);
  return Math.round(totalHrs / days * 100) / 100;
}

/** Estimated date to reach target, assuming avg hours/day. Returns null if already at target or no pace. */
export function estimatedCompletionDate(
  rows: TimelogTableRow[],
  state: WorkSessionState,
  sessionNetMs: number,
  targetMs: number,
): Date | null {
  const careerMs = totalNetMsCareer(rows, state, sessionNetMs);
  if (careerMs >= targetMs) return null;
  const remainingMs = targetMs - careerMs;
  const daysWorked = countDaysWorked(rows);
  if (daysWorked === 0) return null;
  const totalHrs = careerMs / (60 * 60 * 1000);
  const avgHrsPerDay = totalHrs / daysWorked;
  if (avgHrsPerDay <= 0) return null;
  const remainingHrs = remainingMs / (60 * 60 * 1000);
  const daysNeeded = remainingHrs / avgHrsPerDay;
  const d = new Date();
  d.setDate(d.getDate() + Math.ceil(daysNeeded));
  return d;
}

export function formatTimelogDateChips(now: Date): {
  weekLabel: string;
  dateLabel: string;
} {
  const mon = mondayOfWeek(now);
  const sun = sundayOfWeek(now);
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const weekLabel = `${mon.toLocaleDateString(undefined, opts)}–${sun.toLocaleDateString(undefined, { ...opts, year: "numeric" })}`;
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return {
    weekLabel: `Week of ${weekLabel}`,
    dateLabel,
  };
}
