"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { PageContainer } from "@/components/page-container";
import { formatDurationMs } from "@/lib/attendance-time";
import {
  avgHoursPerWorkedDay,
  countDaysWorked,
  estimatedCompletionDate,
  formatTimelogDateChips,
  INTERNSHIP_TARGET_HOURS,
  INTERNSHIP_TARGET_MS,
  totalNetMsCareer,
  weekDayHoursForChart,
} from "@/lib/timelog-stats";
import type { WorkSessionState } from "@/lib/work-session";
import type { TimelogTableRow } from "@/lib/types/timelog";
import { useWorkSession } from "@/components/work-session-provider";

function phaseLabel(s: WorkSessionState): string {
  switch (s.phase) {
    case "idle":
      return "No active session";
    case "working":
      return "Working";
    case "on_break":
      return "On break";
    case "finished":
      return "Session ended";
    default:
      return "Session";
  }
}

function formatHoursOneDecimal(ms: number): string {
  const h = ms / (60 * 60 * 1000);
  return h.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

type Props = {
  initialRows: TimelogTableRow[];
  fetchError: string | null;
};

export function OverviewClient({ initialRows, fetchError }: Props) {
  const { state, derived, hydrated } = useWorkSession();

  const now = new Date();
  const chips = formatTimelogDateChips(now);
  const careerMs = totalNetMsCareer(initialRows, state, derived.netMs);
  const progressPct = Math.min(
    100,
    Math.round((careerMs / INTERNSHIP_TARGET_MS) * 1000) / 10,
  );
  const remainingMs = Math.max(0, INTERNSHIP_TARGET_MS - careerMs);

  const weekly = weekDayHoursForChart(
    initialRows,
    state,
    derived.netMs,
    now,
  );
  const maxWeekHours = Math.max(...weekly.map((d) => d.hours), 0.01);
  const daysWorked = countDaysWorked(initialRows);
  const avgHrs = avgHoursPerWorkedDay(initialRows);
  const estDate = estimatedCompletionDate(
    initialRows,
    state,
    derived.netMs,
    INTERNSHIP_TARGET_MS,
  );

  const timerLine =
    !hydrated || state.phase === "idle"
      ? formatDurationMs(0)
      : formatDurationMs(derived.netMs);

  return (
    <PageContainer className="flex flex-col gap-10 lg:gap-12">
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-(--accent)">
          Dashboard
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Overview
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-(--muted)">
          Track progress toward your {INTERNSHIP_TARGET_HOURS}-hour goal and this
          week&apos;s hours.
        </p>
      </section>

      {/* Hero: 702-hour goal progress */}
      <section
        aria-labelledby="goal-progress-heading"
        className="rounded-2xl border border-(--card-border) bg-(--card) p-6 shadow-sm sm:p-8 lg:p-10"
      >
        <h2
          id="goal-progress-heading"
          className="text-sm font-semibold uppercase tracking-wider text-(--muted)"
        >
          Internship goal · {INTERNSHIP_TARGET_HOURS} hours
        </h2>
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between lg:gap-10">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl font-bold tabular-nums tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {formatHoursOneDecimal(careerMs)}
            </span>
            <span className="text-xl font-medium text-(--muted) sm:text-2xl">/ {INTERNSHIP_TARGET_HOURS} hrs</span>
          </div>
          <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end">
            <div
              className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20"
              aria-hidden
            >
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-(--card-border)"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  strokeLinecap="round"
                  className="text-(--accent)"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - progressPct / 100)}`}
                  style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
              </svg>
            </div>
            <span className="text-2xl font-bold tabular-nums text-(--accent) sm:text-3xl">
              {progressPct}%
            </span>
          </div>
        </div>
        <p className="mt-4 text-sm text-(--muted)">
          {remainingMs > 0
            ? `${formatHoursOneDecimal(remainingMs)} hrs remaining`
            : "Target reached"}
        </p>
        <div className="mt-6 h-4 overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full bg-gradient-to-r from-(--accent) to-teal-500 transition-all"
            style={{ width: `${Math.min(100, progressPct)}%` }}
          />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/timelog"
          className="group flex flex-col justify-between rounded-2xl border border-(--card-border) bg-(--card) p-5 shadow-sm transition-all hover:border-(--accent)/35 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-(--muted)">
                Timer
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {hydrated ? phaseLabel(state) : "…"}
              </p>
              <p className="mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                {timerLine}
                <span className="ml-1 text-sm font-normal text-(--muted)">net</span>
              </p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--accent-muted) text-(--accent) transition group-hover:opacity-90">
              <Icon icon="mdi:clock-outline" className="h-5 w-5" aria-hidden />
            </span>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-(--accent)">
            Open time log
            <Icon icon="mdi:arrow-right" className="h-4 w-4" aria-hidden />
          </span>
        </Link>

        <section
          aria-labelledby="days-worked-heading"
          className="rounded-2xl border border-(--card-border) bg-(--card) p-5 shadow-sm"
        >
          <h2 id="days-worked-heading" className="text-xs font-semibold uppercase tracking-wider text-(--muted)">
            Days worked
          </h2>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground">
            {daysWorked}
          </p>
          <p className="mt-1 text-xs text-(--muted)">distinct days logged</p>
        </section>

        <section
          aria-labelledby="avg-hours-heading"
          className="rounded-2xl border border-(--card-border) bg-(--card) p-5 shadow-sm"
        >
          <h2 id="avg-hours-heading" className="text-xs font-semibold uppercase tracking-wider text-(--muted)">
            Avg per day
          </h2>
          <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground">
            {formatHoursOneDecimal(avgHrs * 60 * 60 * 1000)}
          </p>
          <p className="mt-1 text-xs text-(--muted)">hrs when logging</p>
        </section>

        <section
          aria-labelledby="est-completion-heading"
          className="rounded-2xl border border-(--card-border) bg-(--card) p-5 shadow-sm"
        >
          <h2 id="est-completion-heading" className="text-xs font-semibold uppercase tracking-wider text-(--muted)">
            Est. completion
          </h2>
          <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-foreground">
            {estDate
              ? estDate.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "—"}
          </p>
          <p className="mt-1 text-xs text-(--muted)">
            {estDate ? "at current pace" : remainingMs <= 0 ? "Target reached" : "Log more to estimate"}
          </p>
        </section>
      </div>

      <section aria-labelledby="weekly-heading">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="weekly-heading"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              This week&apos;s hours
            </h2>
            <p className="mt-1 text-sm text-(--muted)">{chips.weekLabel}</p>
          </div>
          {fetchError ? (
            <p className="text-sm text-red-400" role="alert">
              Could not load history: {fetchError}
            </p>
          ) : null}
        </div>
        <div className="mt-6 rounded-2xl border border-(--card-border) bg-(--card) p-6 shadow-sm">
          <div className="flex items-end justify-between gap-1 sm:gap-3">
            {weekly.map((row) => {
              const pct = (row.hours / maxWeekHours) * 100;
              return (
                <div
                  key={row.day}
                  className="flex min-w-0 flex-1 flex-col items-center gap-2.5"
                >
                  <div
                    className="flex h-44 w-full max-w-[4.5rem] items-end justify-center sm:h-48 sm:max-w-none"
                    aria-hidden
                  >
                    <div
                      className="w-full max-w-[3rem] rounded-t-lg bg-(--accent)/85 dark:bg-(--accent)/70"
                      style={{ height: `${pct}%` }}
                      title={`${row.hours} hrs`}
                    />
                  </div>
                  <span className="text-xs font-medium text-(--muted)">{row.day}</span>
                  <span className="font-mono text-xs tabular-nums text-foreground">
                    {row.hours}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
