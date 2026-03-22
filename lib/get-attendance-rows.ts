import {
  ATTENDANCE_SELECT,
  ATTENDANCE_TABLE,
} from "@/lib/supabase/attendance";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { AttendanceDbRow } from "@/lib/types/timelog";

export async function getAttendanceRowsForTimelog(): Promise<{
  rows: AttendanceDbRow[];
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { rows: [], error: null };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(ATTENDANCE_TABLE)
      .select(ATTENDANCE_SELECT)
      .order("date", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      return { rows: [], error: error.message };
    }

    return { rows: (data ?? []) as AttendanceDbRow[], error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { rows: [], error: message };
  }
}
