"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "@/components/page-container";
import { formatDurationMs } from "@/lib/attendance-time";
import {
  DEFAULT_DAILY_TARGET_MS,
  formatTimelogDateChips,
  remainingTargetMs,
  totalNetMsThisWeek,
  totalNetMsToday,
} from "@/lib/timelog-stats";
import { toLocalDateString } from "@/lib/time-local";
import type { TimelogTableRow } from "@/lib/types/timelog";
import { useWorkSession } from "@/components/work-session-provider";
import { WorkSessionPanel } from "./work-session-panel";
import { TimelogCalendar } from "./timelog-calendar";

type Props = {
  initialRows: TimelogTableRow[];
  fetchError: string | null;
  supabaseConfigured: boolean;
};

export function TimeLogClient({
  initialRows,
  fetchError,
  supabaseConfigured,
}: Props) {
  const session = useWorkSession();
  const [publishToast, setPublishToast] = useState(false);
  const [historyView, setHistoryView] = useState<"calendar" | "list">("calendar");

  const stats = useMemo(() => {
    const now = new Date();
    const todayYmd = toLocalDateString(now);
    const loggedTodayMs = totalNetMsToday(
      initialRows,
      session.state,
      session.derived.netMs,
      todayYmd,
    );
    const remainingMs = remainingTargetMs(DEFAULT_DAILY_TARGET_MS, loggedTodayMs);
    const weekMs = totalNetMsThisWeek(
      initialRows,
      session.state,
      session.derived.netMs,
      now,
    );
    const chips = formatTimelogDateChips(now);
    return {
      remainingMs,
      loggedTodayMs,
      weekMs,
      chips,
    };
  }, [initialRows, session.state, session.derived.netMs]);

  useEffect(() => {
    const onPublished = () => {
      setPublishToast(true);
    };
    window.addEventListener("internlog-attendance-published", onPublished);
    return () =>
      window.removeEventListener("internlog-attendance-published", onPublished);
  }, []);

  useEffect(() => {
    if (!publishToast) return;
    const t = window.setTimeout(() => setPublishToast(false), 6500);
    return () => window.clearTimeout(t);
  }, [publishToast]);

  const historySubtitle = fetchError
    ? `Could not load data: ${fetchError}`
    : !supabaseConfigured
      ? "Add Supabase env vars to load rows from the attendance table."
      : initialRows.length > 0
        ? `Showing ${initialRows.length} row(s) from Supabase (attendance).`
        : "No rows yet. Publish a session below after Time Out, or check RLS policies.";

  return (
    <PageContainer className="flex flex-col gap-8 lg:gap-10">
      {publishToast ? (
        <div
          className="rounded-xl border border-emerald-500/35 bg-emerald-500/12 px-4 py-3 text-sm text-emerald-100"
          role="status"
        >
          <span className="font-medium text-emerald-50">Attendance published.</span>{" "}
          Your history table has been refreshed.
        </div>
      ) : null}

      <section aria-labelledby="timelog-heading" className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--accent-muted) text-(--accent)">
              <Icon
                icon="mdi:clock-outline"
                className="h-5 w-5"
                aria-hidden
              />
            </span>
            <div>
              <h1
                id="timelog-heading"
                className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
              >
                Time log
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-(--muted)">
                The round control bar works like a player:{" "}
                <strong className="text-foreground">play</strong> to start,{" "}
                <strong className="text-foreground">pause</strong> for breaks,{" "}
                <strong className="text-foreground">stop</strong> to clock out, then{" "}
                <strong className="text-foreground">confirm</strong> to publish to{" "}
                <strong className="text-foreground">attendance</strong>.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-(--card-border) bg-background px-3 py-1.5 text-xs font-medium text-(--muted)">
              {stats.chips.weekLabel}
            </span>
            <span className="rounded-lg border border-(--card-border) bg-background px-3 py-1.5 text-xs font-medium text-(--muted)">
              Today · {stats.chips.dateLabel}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-(--card-border) bg-(--card) p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--muted)">
              Remaining today
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground">
              {formatDurationMs(stats.remainingMs)}
            </p>
            <p className="mt-1 text-xs text-(--muted)">
              Target {formatDurationMs(DEFAULT_DAILY_TARGET_MS)} · logged{" "}
              <span className="font-mono tabular-nums text-foreground">
                {formatDurationMs(stats.loggedTodayMs)}
              </span>{" "}
              net
            </p>
          </div>
          <div className="rounded-2xl border border-(--card-border) bg-(--card) p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--muted)">
              Logged this week
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground">
              {formatDurationMs(stats.weekMs)}
            </p>
            <p className="mt-1 text-xs text-(--muted)">
              Net work Mon–Sun (database + current session)
            </p>
          </div>
        </div>

        <WorkSessionPanel
          session={session}
          supabaseConfigured={supabaseConfigured}
        />
      </section>

      <section aria-labelledby="history-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="history-heading"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              History
            </h2>
            <p
              className={`mt-1 text-sm ${fetchError ? "text-red-400" : "text-(--muted)"}`}
            >
              {historySubtitle}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-lg border border-(--card-border) bg-background p-0.5"
              role="group"
              aria-label="History view"
            >
              <button
                type="button"
                onClick={() => setHistoryView("calendar")}
                aria-pressed={historyView === "calendar"}
                aria-label="Calendar view"
                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  historyView === "calendar"
                    ? "bg-(--accent-muted) text-(--accent)"
                    : "text-(--muted) hover:text-foreground"
                }`}
              >
                <Icon icon="mdi:calendar-month" className="mr-1.5 inline-block h-4 w-4 align-middle" aria-hidden />
                Calendar
              </button>
              <button
                type="button"
                onClick={() => setHistoryView("list")}
                aria-pressed={historyView === "list"}
                aria-label="List view"
                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  historyView === "list"
                    ? "bg-(--accent-muted) text-(--accent)"
                    : "text-(--muted) hover:text-foreground"
                }`}
              >
                <Icon icon="mdi:format-list-bulleted" className="mr-1.5 inline-block h-4 w-4 align-middle" aria-hidden />
                List
              </button>
            </div>
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-(--card-border) bg-background px-3 py-1.5 text-xs font-medium text-(--muted) opacity-60 transition-colors hover:opacity-80 disabled:cursor-not-allowed"
              disabled
            >
              Export CSV (soon)
            </button>
          </div>
        </div>

        {fetchError ? (
          <div
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            Supabase: {fetchError}
          </div>
        ) : null}

        {historyView === "calendar" ? (
          <TimelogCalendar rows={initialRows} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-(--card-border) bg-(--card) shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-(--card-border) bg-background/60 text-xs uppercase tracking-wider text-(--muted)">
                  <th className="px-4 py-3 font-semibold lg:px-5">Date</th>
                  <th className="px-4 py-3 font-semibold lg:px-5">Clock in</th>
                  <th className="px-4 py-3 font-semibold lg:px-5">Clock out</th>
                  <th className="px-4 py-3 font-semibold lg:px-5">Break</th>
                  <th className="px-4 py-3 font-semibold lg:px-5">Gross</th>
                  <th className="px-4 py-3 font-semibold lg:px-5">Net</th>
                  <th className="px-4 py-3 font-semibold lg:px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--card-border)">
                {initialRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-sm text-(--muted) lg:px-5"
                    >
                      No rows to show. Check Supabase RLS policies and that{" "}
                      <code className="font-mono text-foreground">attendance</code> has
                      data.
                    </td>
                  </tr>
                ) : (
                  initialRows.map((row) => (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-background/40"
                    >
                      <td className="px-4 py-4 font-medium text-foreground lg:px-5">
                        {row.dayLabel}
                      </td>
                      <td className="px-4 py-4 font-mono text-foreground tabular-nums lg:px-5">
                        {row.clockIn}
                      </td>
                      <td className="px-4 py-4 font-mono text-foreground tabular-nums lg:px-5">
                        {row.clockOut}
                      </td>
                      <td className="px-4 py-4 font-mono text-(--muted) tabular-nums lg:px-5">
                        {row.breakTime}
                      </td>
                      <td className="px-4 py-4 font-mono text-(--muted) tabular-nums lg:px-5">
                        {row.duration}
                      </td>
                      <td className="px-4 py-4 font-mono text-foreground tabular-nums lg:px-5">
                        {row.netDuration}
                      </td>
                      <td className="px-4 py-4 lg:px-5">
                        {row.status === "complete" ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-500/12 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-400">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </section>
    </PageContainer>
  );
}
