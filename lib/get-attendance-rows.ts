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

const PAGE_SIZE = 25;

/** Paginated rows for list view. */
export async function getAttendanceRowsPaginated(
  page: number = 1,
  pageSize: number = PAGE_SIZE,
  /** When true, page 1 is the oldest rows (matches “oldest first” list sort). */
  dateAscending: boolean = false,
): Promise<{
  rows: AttendanceDbRow[];
  totalCount: number;
  hasMore: boolean;
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { rows: [], totalCount: 0, hasMore: false, error: null };
  }

  try {
    const supabase = await createClient();
    const from = (page - 1) * pageSize;
    const asc = dateAscending;

    const [countRes, dataRes] = await Promise.all([
      supabase.from(ATTENDANCE_TABLE).select("*", { count: "exact", head: true }),
      supabase
        .from(ATTENDANCE_TABLE)
        .select(ATTENDANCE_SELECT)
        .order("date", { ascending: asc })
        .order("id", { ascending: asc })
        .range(from, from + pageSize - 1),
    ]);

    if (dataRes.error) {
      return { rows: [], totalCount: 0, hasMore: false, error: dataRes.error.message };
    }

    const totalCount = countRes.count ?? 0;
    const rows = (dataRes.data ?? []) as AttendanceDbRow[];
    const hasMore = from + rows.length < totalCount;

    return { rows, totalCount, hasMore, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return { rows: [], totalCount: 0, hasMore: false, error: message };
  }
}

/** Rows for a single calendar month only. */
export async function getAttendanceRowsForMonth(
  year: number,
  month: number,
): Promise<{
  rows: AttendanceDbRow[];
  error: string | null;
}> {
  if (!isSupabaseConfigured()) {
    return { rows: [], error: null };
  }

  // month is 0-indexed (0=Jan, 11=Dec); PostgreSQL needs 01–12
  const monthStr = String(month + 1).padStart(2, "0");
  const start = `${year}-${monthStr}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const end = `${year}-${monthStr}-${String(lastDay).padStart(2, "0")}`;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(ATTENDANCE_TABLE)
      .select(ATTENDANCE_SELECT)
      .gte("date", start)
      .lte("date", end)
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
