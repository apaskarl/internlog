import { formatTimeForUi } from "@/lib/attendance-time";
import {
  ATTENDANCE_SELECT,
  ATTENDANCE_TABLE,
} from "@/lib/supabase/attendance";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

function isMissingTableError(message: string) {
  return /schema cache|Could not find the table|PGRST205/i.test(message);
}

type AttendanceRow = {
  id: string | number;
  date: string | null;
  time_in: string | null;
  time_out: string | null;
};

function formatDate(value: string | null) {
  if (value == null || value === "") return "—";
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return new Date(value + "T12:00:00").toLocaleDateString();
    }
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

export async function SupabaseConnectionStatus() {
  if (!isSupabaseConfigured()) {
    return (
      <div
        className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-950 dark:text-amber-100"
        role="status"
      >
        <p className="font-medium">Supabase not configured</p>
        <p className="mt-1 text-xs opacity-90">
          Add <code className="rounded bg-black/10 px-1 dark:bg-white/10">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          and{" "}
          <code className="rounded bg-black/10 px-1 dark:bg-white/10">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          from your project&apos;s API settings.
        </p>
      </div>
    );
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(ATTENDANCE_TABLE)
      .select(ATTENDANCE_SELECT)
      .order("date", { ascending: false })
      .order("id", { ascending: false })
      .limit(5);

    if (error) {
      const missingTable = isMissingTableError(error.message);
      return (
        <div
          className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200"
          role="status"
        >
          <p className="font-medium">Supabase query failed</p>
          <p className="mt-1 font-mono text-xs">{error.message}</p>
          {missingTable ? (
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs leading-relaxed opacity-95">
              <li>
                Confirm the table name in{" "}
                <code className="rounded bg-black/10 px-1">lib/supabase/attendance.ts</code> matches
                Supabase (e.g. <code className="rounded bg-black/10 px-1">attendance</code>).
              </li>
              <li>
                If Row Level Security blocks reads, run{" "}
                <code className="rounded bg-black/10 px-1">002_attendance_rls.sql</code> in the SQL
                Editor.
              </li>
              <li>
                See <code className="rounded bg-black/10 px-1">supabase/README.md</code>.
              </li>
            </ol>
          ) : (
            <p className="mt-2 text-xs opacity-90">
              Check <code className="rounded bg-black/10 px-1">supabase/README.md</code> for setup steps.
            </p>
          )}
        </div>
      );
    }

    const rows = (data ?? []) as AttendanceRow[];

    return (
      <div
        className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-950 dark:text-emerald-100"
        role="status"
      >
        <p className="font-medium">Supabase connected</p>
        <p className="mt-1 text-xs opacity-90">
          Latest {rows.length} row(s) from{" "}
          <code className="rounded bg-black/10 px-1 dark:bg-white/10">{ATTENDANCE_TABLE}</code> (max 5,
          newest by date).
        </p>
        {rows.length > 0 ? (
          <div className="mt-4 overflow-x-auto rounded-xl border border-emerald-600/20 bg-black/5 dark:bg-black/20">
            <table className="w-full min-w-[32rem] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-emerald-600/20 text-[10px] font-semibold uppercase tracking-wide text-emerald-900/80 dark:text-emerald-100/80">
                  <th className="px-3 py-2">id</th>
                  <th className="px-3 py-2">date</th>
                  <th className="px-3 py-2">time_in</th>
                  <th className="px-3 py-2">time_out</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={String(row.id)}
                    className="border-b border-emerald-600/10 last:border-0"
                  >
                    <td className="px-3 py-2 font-mono tabular-nums">{String(row.id)}</td>
                    <td className="px-3 py-2">{formatDate(row.date)}</td>
                    <td className="px-3 py-2 font-mono text-[11px]">
                      {formatTimeForUi(row.time_in)}
                    </td>
                    <td className="px-3 py-2 font-mono text-[11px]">
                      {formatTimeForUi(row.time_out)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-xs opacity-90">No rows in this table yet.</p>
        )}
      </div>
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return (
      <div
        className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-200"
        role="status"
      >
        <p className="font-medium">Supabase error</p>
        <p className="mt-1 text-xs">{message}</p>
      </div>
    );
  }
}
