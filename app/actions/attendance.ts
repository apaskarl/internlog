"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { ATTENDANCE_TABLE } from "@/lib/supabase/attendance";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type PublishAttendanceInput = {
  date: string;
  timeIn: string;
  timeOut: string;
  breakDurationMinutes: number;
};

export type PublishAttendanceResult =
  | { ok: true }
  | { ok: false; error: string };

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
    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { ok: false, error: message };
  }
}
