"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";
import { PageContainer } from "@/components/page-container";
import {
  PLACEHOLDER_QUICK_START_TIMES,
  PLACEHOLDER_STATS,
  PLACEHOLDER_TIMELOG_TODAY,
  PLACEHOLDER_TIME_LOGS,
} from "@/lib/placeholder-data";

export default function TimeLogPage() {
  const [selectedStart, setSelectedStart] = useState<string | null>(
    PLACEHOLDER_QUICK_START_TIMES[2]?.label ?? null,
  );
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [activeClockIn, setActiveClockIn] = useState<string | null>(null);

  function handleClockIn() {
    const time = selectedStart ?? "9:00 AM";
    setActiveClockIn(time);
    setIsClockedIn(true);
  }

  function handleClockOut() {
    setIsClockedIn(false);
    setActiveClockIn(null);
  }

  return (
    <PageContainer className="flex flex-col gap-8 lg:gap-10">
      <section aria-labelledby="timelog-heading" className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent)]">
              <Icon
                icon="mdi:clock-outline"
                className="h-5 w-5"
                aria-hidden
              />
            </span>
            <div>
              <h1
                id="timelog-heading"
                className="text-xl font-semibold tracking-tight text-[var(--foreground)] sm:text-2xl"
              >
                Time log
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-[var(--muted)]">
                Record clock-in and clock-out, breaks, and notes. Actions below
                are{" "}
                <span className="font-medium text-[var(--foreground)]">
                  UI-only
                </span>{" "}
                until you connect your backend.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--muted)]">
              {PLACEHOLDER_TIMELOG_TODAY.weekLabel}
            </span>
            <span className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--muted)]">
              Today · {PLACEHOLDER_TIMELOG_TODAY.dateLabel}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Today (scheduled)
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[var(--foreground)]">
              {PLACEHOLDER_TIMELOG_TODAY.expectedHours}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Target internship day length
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Logged this week
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-[var(--foreground)]">
              {PLACEHOLDER_STATS.weekHours}
              <span className="ml-1 text-base font-normal text-[var(--muted)]">
                hrs
              </span>
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              From completed entries
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Session
            </p>
            <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
              {isClockedIn ? "In progress" : "Off the clock"}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {isClockedIn && activeClockIn
                ? `Started · ${activeClockIn}`
                : "Use quick start, then clock in"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Today&apos;s actions
              </p>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                {isClockedIn
                  ? "You’re clocked in"
                  : "Ready to start your day?"}
              </h2>
              <p className="max-w-md text-sm text-[var(--muted)]">
                Pick a quick start time (typical arrival), then clock in. Clock
                out when you leave — your selection is stored locally for this
                demo only.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto lg:justify-end">
              {!isClockedIn ? (
                <button
                  type="button"
                  onClick={handleClockIn}
                  className="inline-flex h-12 min-w-[9rem] items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 active:scale-[0.99] dark:text-slate-950"
                >
                  <Icon icon="mdi:login" className="h-5 w-5" aria-hidden />
                  Clock in
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClockOut}
                  className="inline-flex h-12 min-w-[9rem] items-center justify-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-6 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--background)]/80 active:scale-[0.99]"
                >
                  <Icon icon="mdi:logout" className="h-5 w-5" aria-hidden />
                  Clock out
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-[var(--card-border)] pt-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                <Icon
                  icon="mdi:clock-start"
                  className="h-4 w-4 text-[var(--accent)]"
                  aria-hidden
                />
                Quick start time
              </span>
              <span className="text-xs text-[var(--muted)]">
                (optional — defaults to 9:00 AM if none selected)
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {PLACEHOLDER_QUICK_START_TIMES.map((t) => {
                const active = selectedStart === t.label;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedStart(t.label)}
                    className={
                      "rounded-xl border px-4 py-2.5 font-mono text-sm tabular-nums transition " +
                      (active
                        ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)] ring-2 ring-[var(--accent)]/20"
                        : "border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--accent)]/40")
                    }
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-[var(--background)]/80 px-4 py-3 text-xs text-[var(--muted)]">
            <span className="font-medium text-[var(--foreground)]">
              Demo state:{" "}
            </span>
            {isClockedIn
              ? `Active session from ${activeClockIn ?? "—"} — press Clock out to reset.`
              : `Selected start: ${selectedStart ?? "—"} — press Clock in to simulate a session.`}
          </div>
        </div>
      </section>

      <section aria-labelledby="history-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="history-heading"
              className="text-lg font-semibold tracking-tight text-[var(--foreground)]"
            >
              History
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Gross time, breaks, net hours, and daily notes (placeholder rows).
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] opacity-60"
              disabled
            >
              Export CSV (soon)
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--card-border)] bg-[var(--background)]/60 text-xs uppercase tracking-wider text-[var(--muted)]">
                  <th className="px-4 py-3 font-semibold lg:px-5">Date</th>
                  <th className="px-4 py-3 font-semibold lg:px-5">Clock in</th>
                  <th className="px-4 py-3 font-semibold lg:px-5">Clock out</th>
                  <th className="px-4 py-3 font-semibold lg:px-5">Break</th>
                  <th className="px-4 py-3 font-semibold lg:px-5">Gross</th>
                  <th className="px-4 py-3 font-semibold lg:px-5">Net</th>
                  <th className="px-4 py-3 font-semibold lg:px-5">Status</th>
                  <th className="min-w-[180px] px-4 py-3 font-semibold lg:px-5">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {PLACEHOLDER_TIME_LOGS.map((row) => (
                  <tr
                    key={row.id}
                    className="transition-colors hover:bg-[var(--background)]/40"
                  >
                    <td className="px-4 py-4 font-medium text-[var(--foreground)] lg:px-5">
                      {row.dayLabel}
                    </td>
                    <td className="px-4 py-4 font-mono text-[var(--foreground)] tabular-nums lg:px-5">
                      {row.clockIn}
                    </td>
                    <td className="px-4 py-4 font-mono text-[var(--foreground)] tabular-nums lg:px-5">
                      {row.clockOut}
                    </td>
                    <td className="px-4 py-4 font-mono text-[var(--muted)] tabular-nums lg:px-5">
                      {row.breakTime}
                    </td>
                    <td className="px-4 py-4 font-mono text-[var(--muted)] tabular-nums lg:px-5">
                      {row.duration}
                    </td>
                    <td className="px-4 py-4 font-mono text-[var(--foreground)] tabular-nums lg:px-5">
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
                    <td className="max-w-[220px] px-4 py-4 text-[var(--muted)] lg:px-5">
                      <span className="line-clamp-2">{row.notes}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
