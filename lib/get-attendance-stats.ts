import { mondayOfWeek } from "@/lib/timelog-stats";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type AttendanceStats = {
  totalNetMs: number;
  daysWorked: number;
  weekBuckets: { day: string; hours: number; netMs: number }[];
  error: string | null;
};

/** Fetch aggregated stats from DB (no full row fetch). */
export async function getAttendanceStats(
  weekStart?: Date,
): Promise<AttendanceStats> {
  const defaultWeek = mondayOfWeek(new Date());
  const start = weekStart ?? defaultWeek;
  const ymd = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;

  if (!isSupabaseConfigured()) {
    return {
      totalNetMs: 0,
      daysWorked: 0,
      weekBuckets: WEEKDAY_LABELS.map((day) => ({ day, hours: 0, netMs: 0 })),
      error: null,
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_attendance_stats", {
      p_week_start: ymd,
    });

    if (error) {
      return {
        totalNetMs: 0,
        daysWorked: 0,
        weekBuckets: WEEKDAY_LABELS.map((day) => ({ day, hours: 0, netMs: 0 })),
        error: error.message,
      };
    }

    const raw = data as {
      total_net_ms?: number;
      days_worked?: number;
      week_buckets?: { day: string; net_ms: number }[];
    } | null;

    if (!raw) {
      return {
        totalNetMs: 0,
        daysWorked: 0,
        weekBuckets: WEEKDAY_LABELS.map((day) => ({ day, hours: 0, netMs: 0 })),
        error: null,
      };
    }

    const totalNetMs = Number(raw.total_net_ms ?? 0);
    const daysWorked = Number(raw.days_worked ?? 0);
    const buckets = Array.isArray(raw.week_buckets)
      ? raw.week_buckets
      : WEEKDAY_LABELS.map((day) => ({ day, net_ms: 0 }));

    const weekBuckets = WEEKDAY_LABELS.map((day, i) => {
      const b = buckets[i];
      const netMs = b && typeof b === "object" && "net_ms" in b ? Number(b.net_ms ?? 0) : 0;
      return {
        day,
        netMs,
        hours: Math.round((netMs / (60 * 60 * 1000)) * 100) / 100,
      };
    });

    return {
      totalNetMs,
      daysWorked,
      weekBuckets,
      error: null,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return {
      totalNetMs: 0,
      daysWorked: 0,
      weekBuckets: WEEKDAY_LABELS.map((day) => ({ day, hours: 0, netMs: 0 })),
      error: message,
    };
  }
}
