"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { ATTENDANCE_TABLE } from "@/lib/supabase/attendance";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  getAttendanceRowsForMonth,
  getAttendanceRowsPaginated,
} from "@/lib/get-attendance-rows";
import { getAttendanceStats } from "@/lib/get-attendance-stats";
import { mapAttendanceToTimelogRows } from "@/lib/timelog-map";
import type { TimelogTableRow } from "@/lib/types/timelog";
import { toPgTimeFromInput } from "@/lib/time-local";

export type PublishAttendanceInput = {
  date: string;
  timeIn: string;
  timeOut: string;
  breakDurationMinutes: number;
};

export type PublishAttendanceResult =
  | { ok: true }
  | { ok: false; error: string };

export type UpdateAttendanceInput = {
  id: string;
  date: string;
  /** Local time from the form; normalized to Postgres `time`. */
  timeIn: string;
  /** Empty clears clock-out (partial entry). */
  timeOut: string;
  breakDurationMinutes: number;
};

/** Match PostgREST filter type for `id` (bigint vs uuid). */
function attendanceIdForUpdate(id: string): string | number {
  if (/^\d+$/.test(id)) return Number(id);
  return id;
}

function isValidDateYmd(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function isValidPgTime(s: string): boolean {
  return /^\d{2}:\d{2}:\d{2}$/.test(s);
}

function isNullIdConstraint(message: string): boolean {
  return (
    message.includes('null value in column "id"') &&
    message.includes("not-null constraint")
  );
}

/** Next bigint id when the column has no sequence (best-effort; prefer DB default). */
async function nextNumericAttendanceId(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<number | null> {
  const { data, error } = await supabase
    .from(ATTENDANCE_TABLE)
    .select("id")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  const raw = data?.id as unknown;
  if (raw == null) return 1;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw + 1;
  if (typeof raw === "string" && /^\d+$/.test(raw)) return Number(raw) + 1;
  return null;
}

export async function publishAttendance(
  input: PublishAttendanceInput,
): Promise<PublishAttendanceResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  if (!isValidDateYmd(input.date)) {
    return { ok: false, error: "Invalid date." };
  }
  if (!isValidPgTime(input.timeIn) || !isValidPgTime(input.timeOut)) {
    return { ok: false, error: "Invalid time format." };
  }

  const breakMin = Math.max(
    0,
    Math.min(24 * 60, Math.round(input.breakDurationMinutes)),
  );

  const [ih, im, is] = input.timeIn.split(":").map(Number);
  const [oh, om, os] = input.timeOut.split(":").map(Number);
  const inSec = ih! * 3600 + im! * 60 + is!;
  const outSec = oh! * 3600 + om! * 60 + os!;
  if (outSec <= inSec) {
    return {
      ok: false,
      error:
        "Time out must be after time in. Overnight sessions are not supported yet.",
    };
  }

  const row = {
    date: input.date,
    time_in: input.timeIn,
    time_out: input.timeOut,
    break_duration: breakMin,
  };

  try {
    const supabase = await createClient();

    let { error } = await supabase.from(ATTENDANCE_TABLE).insert(row);
    const missingId =
      error != null && isNullIdConstraint(error.message);

    if (missingId) {
      ({ error } = await supabase
        .from(ATTENDANCE_TABLE)
        .insert({ ...row, id: randomUUID() }));
    }

    if (error != null && missingId) {
      const nextId = await nextNumericAttendanceId(supabase);
      if (nextId != null) {
        ({ error } = await supabase
          .from(ATTENDANCE_TABLE)
          .insert({ ...row, id: nextId }));
      }
    }

    if (error) {
      return { ok: false, error: error.message };
    }

    revalidatePath("/timelog");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: message };
  }
}

export async function updateAttendance(
  input: UpdateAttendanceInput,
): Promise<PublishAttendanceResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  if (!isValidDateYmd(input.date)) {
    return { ok: false, error: "Invalid date." };
  }

  const timeInPg = toPgTimeFromInput(input.timeIn);
  if (!timeInPg || !isValidPgTime(timeInPg)) {
    return { ok: false, error: "Invalid time in." };
  }

  const timeOutPg = toPgTimeFromInput(input.timeOut);
  if (input.timeOut.trim() !== "" && (!timeOutPg || !isValidPgTime(timeOutPg))) {
    return { ok: false, error: "Invalid time out." };
  }

  if (timeOutPg) {
    const [ih, im, is] = timeInPg.split(":").map(Number);
    const [oh, om, os] = timeOutPg.split(":").map(Number);
    const inSec = ih! * 3600 + im! * 60 + is!;
    const outSec = oh! * 3600 + om! * 60 + os!;
    if (outSec <= inSec) {
      return {
        ok: false,
        error:
          "Time out must be after time in. Overnight sessions are not supported yet.",
      };
    }
  }

  const breakMin = Math.max(
    0,
    Math.min(24 * 60, Math.round(input.breakDurationMinutes)),
  );

  const row = {
    date: input.date,
    time_in: timeInPg,
    time_out: timeOutPg,
    break_duration: breakMin,
  };

  try {
    const supabase = await createClient();
    const idFilter = attendanceIdForUpdate(input.id);

    const { data, error } = await supabase
      .from(ATTENDANCE_TABLE)
      .update(row)
      .eq("id", idFilter)
      .select("id");

    if (error) {
      return { ok: false, error: error.message };
    }

    const updated = Array.isArray(data) ? data.length : data ? 1 : 0;
    if (updated === 0) {
      return {
        ok: false,
        error:
          "No row was updated. If you use Row Level Security, add an UPDATE policy on public.attendance (see supabase/migrations/008_attendance_update_rls.sql).",
      };
    }

    revalidatePath("/timelog");
    revalidatePath("/");
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: message };
  }
}

/** Server action: paginated list rows for timelog. */
export async function fetchAttendancePage(
  page: number,
  pageSize: number = 25,
  /** When true, pagination starts from oldest dates (aligns with “oldest first” UI). */
  dateAscending: boolean = false,
): Promise<{
  rows: TimelogTableRow[];
  totalCount: number;
  hasMore: boolean;
  error: string | null;
}> {
  const { rows, totalCount, hasMore, error } =
    await getAttendanceRowsPaginated(page, pageSize, dateAscending);
  return {
    rows: mapAttendanceToTimelogRows(rows),
    totalCount,
    hasMore,
    error,
  };
}

/** Server action: calendar rows for a specific month. */
export async function fetchAttendanceForMonth(
  year: number,
  month: number,
): Promise<{ rows: TimelogTableRow[]; error: string | null }> {
  const { rows, error } = await getAttendanceRowsForMonth(year, month);
  return { rows: mapAttendanceToTimelogRows(rows), error };
}

/** Server action: aggregated stats for timelog header (today, week). */
export async function fetchAttendanceStats() {
  return getAttendanceStats();
}
