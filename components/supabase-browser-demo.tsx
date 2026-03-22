"use client";

import { createClient } from "@/lib/supabase/client";
import {
  ATTENDANCE_SELECT,
  ATTENDANCE_TABLE,
} from "@/lib/supabase/attendance";
import { useEffect, useState } from "react";

type State = "idle" | "loading" | "ok" | "error" | "skipped";

type AttendanceRow = {
  id: string | number;
  date: string;
  time_in: string | null;
  time_out: string | null;
};

/**
 * Browser Supabase client: loads up to 5 attendance rows (same ordering as server).
 */
export function SupabaseBrowserDemo() {
  const [state, setState] = useState<State>("idle");
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setState("skipped");
      return;
    }

    let cancelled = false;
    setState("loading");

    const supabase = createClient();
    void supabase
      .from(ATTENDANCE_TABLE)
      .select(ATTENDANCE_SELECT)
      .order("date", { ascending: false })
      .order("id", { ascending: false })
      .limit(5)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setErr(error.message);
          setState("error");
          return;
        }
        setRows((data ?? []) as AttendanceRow[]);
        setState("ok");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "skipped") {
    return null;
  }

  if (state === "idle" || state === "loading") {
    return (
      <p className="text-xs text-[var(--muted)]" aria-live="polite">
        {state === "loading" ? "Loading attendance from browser…" : null}
      </p>
    );
  }

  if (state === "error") {
    const missing =
      err && /schema cache|Could not find the table|PGRST205/i.test(err);
    return (
      <div className="text-xs text-red-300" role="status">
        <p>Browser client: {err}</p>
        {missing ? (
          <p className="mt-2 text-[var(--muted)]">
            Check table name in <code className="font-mono">lib/supabase/attendance.ts</code> and RLS (
            <code className="font-mono">002_attendance_rls.sql</code>).
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="text-xs text-[var(--muted)]" role="status">
      <p>
        Browser client: {rows.length} row(s) from{" "}
        <code className="font-mono text-[var(--foreground)]">{ATTENDANCE_TABLE}</code>.
      </p>
      {rows.length > 0 ? (
        <ul className="mt-2 space-y-1 font-mono text-[11px] text-[var(--foreground)]">
          {rows.map((r) => (
            <li key={String(r.id)}>
              id {String(r.id)} · {r.date} · in {r.time_in ?? "—"} · out {r.time_out ?? "—"}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
