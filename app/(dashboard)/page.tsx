import Link from "next/link";
import { PageContainer } from "@/components/page-container";
import {
  PLACEHOLDER_INTERNSHIP_SUMMARY,
  PLACEHOLDER_OVERVIEW_ACTIVITY,
  PLACEHOLDER_STATS,
  PLACEHOLDER_WEEKLY_HOURS,
} from "@/lib/placeholder-data";

export default function OverviewPage() {
  const maxWeekHours = Math.max(
    ...PLACEHOLDER_WEEKLY_HOURS.map((d) => d.hours),
    1,
  );
  const progressPct = Math.round(
    (PLACEHOLDER_INTERNSHIP_SUMMARY.currentWeek /
      PLACEHOLDER_INTERNSHIP_SUMMARY.totalWeeks) *
      100,
  );

  return (
    <PageContainer className="flex flex-col gap-10 lg:gap-12">
      <section
        aria-labelledby="overview-intro"
        className="flex flex-col gap-4 border-b border-[var(--card-border)] pb-10 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent)]">
            {PLACEHOLDER_INTERNSHIP_SUMMARY.organization} ·{" "}
            {PLACEHOLDER_INTERNSHIP_SUMMARY.cohort}
          </p>
          <h1
            id="overview-intro"
            className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl"
          >
            Internship overview
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
            {PLACEHOLDER_INTERNSHIP_SUMMARY.role}. Week of Mar 17–21, 2025 —
            placeholder schedule; connect your calendar or backend later.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] shadow-sm">
            Week {PLACEHOLDER_INTERNSHIP_SUMMARY.currentWeek} of{" "}
            {PLACEHOLDER_INTERNSHIP_SUMMARY.totalWeeks}
          </span>
          <span className="rounded-full bg-emerald-500/12 px-4 py-2 text-sm font-medium text-emerald-800 dark:text-emerald-400">
            On track
          </span>
        </div>
      </section>

      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Summary statistics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="group rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Today
            </p>
            <p className="mt-3 font-mono text-4xl font-semibold tabular-nums tracking-tight text-[var(--foreground)]">
              {PLACEHOLDER_STATS.todayHours}
              <span className="ml-1.5 text-lg font-normal text-[var(--muted)]">
                hrs
              </span>
            </p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Logged time for the current day
            </p>
          </article>
          <article className="group rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              This week
            </p>
            <p className="mt-3 font-mono text-4xl font-semibold tabular-nums tracking-tight text-[var(--foreground)]">
              {PLACEHOLDER_STATS.weekHours}
              <span className="ml-1.5 text-lg font-normal text-[var(--muted)]">
                hrs
              </span>
            </p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Rolling total across Mon–Fri
            </p>
          </article>
          <article className="group rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Streak
            </p>
            <p className="mt-3 font-mono text-4xl font-semibold tabular-nums tracking-tight text-[var(--foreground)]">
              {PLACEHOLDER_STATS.streakDays}
              <span className="ml-1.5 text-lg font-normal text-[var(--muted)]">
                days
              </span>
            </p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Consecutive days with a full log
            </p>
          </article>
          <article className="group rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm transition-shadow hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Daily average
            </p>
            <p className="mt-3 font-mono text-4xl font-semibold tabular-nums tracking-tight text-[var(--foreground)]">
              {PLACEHOLDER_STATS.avgDaily}
              <span className="ml-1.5 text-lg font-normal text-[var(--muted)]">
                hrs
              </span>
            </p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Based on completed entries
            </p>
          </article>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-12 xl:gap-10">
        <section
          aria-labelledby="weekly-rhythm-heading"
          className="xl:col-span-7"
        >
          <h2
            id="weekly-rhythm-heading"
            className="text-lg font-semibold tracking-tight text-[var(--foreground)]"
          >
            This week&apos;s hours
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Placeholder breakdown by weekday — swap for a real chart later.
          </p>
          <div className="mt-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm">
            <div className="flex items-end justify-between gap-2 sm:gap-4">
              {PLACEHOLDER_WEEKLY_HOURS.map((row) => {
                const pct = (row.hours / maxWeekHours) * 100;
                return (
                  <div
                    key={row.day}
                    className="flex min-w-0 flex-1 flex-col items-center gap-3"
                  >
                    <div
                      className="flex h-44 w-full max-w-[4.5rem] items-end justify-center sm:h-48 sm:max-w-none"
                      aria-hidden
                    >
                      <div
                        className="w-full max-w-[3rem] rounded-t-lg bg-[var(--accent)]/85 dark:bg-[var(--accent)]/70"
                        style={{ height: `${pct}%` }}
                        title={`${row.hours} hrs`}
                      />
                    </div>
                    <span className="text-xs font-medium text-[var(--muted)]">
                      {row.day}
                    </span>
                    <span className="font-mono text-xs tabular-nums text-[var(--foreground)]">
                      {row.hours}h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section aria-labelledby="activity-heading" className="xl:col-span-5">
          <h2
            id="activity-heading"
            className="text-lg font-semibold tracking-tight text-[var(--foreground)]"
          >
            Recent activity
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Latest events from your log (sample).
          </p>
          <ul className="mt-6 space-y-0 divide-y divide-[var(--card-border)] rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-sm">
            {PLACEHOLDER_OVERVIEW_ACTIVITY.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-0.5 px-5 py-4 first:pt-5 last:pb-5"
              >
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {item.title}
                </span>
                <span className="text-xs text-[var(--muted)]">{item.meta}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <section
          aria-labelledby="focus-heading"
          className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm sm:p-8"
        >
          <h2
            id="focus-heading"
            className="text-lg font-semibold tracking-tight text-[var(--foreground)]"
          >
            Internship progress
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Rough timeline from your placeholder program length.
          </p>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs font-medium text-[var(--muted)]">
              <span>
                Week {PLACEHOLDER_INTERNSHIP_SUMMARY.currentWeek} of{" "}
                {PLACEHOLDER_INTERNSHIP_SUMMARY.totalWeeks}
              </span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--background)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <div className="mt-8 border-t border-[var(--card-border)] pt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--muted)]">
              This week&apos;s focus
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]">
              {PLACEHOLDER_INTERNSHIP_SUMMARY.focusLine}
            </p>
          </div>
        </section>

        <section aria-labelledby="quick-links-heading">
          <h2
            id="quick-links-heading"
            className="text-lg font-semibold tracking-tight text-[var(--foreground)]"
          >
            Jump to
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Open detailed views for hours and monthly notes.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <Link
              href="/timelog"
              className="group flex flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm transition-all hover:border-[var(--accent)]/40 hover:shadow-md"
            >
              <span className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)]">
                Time log
              </span>
              <span className="mt-2 text-sm text-[var(--muted)]">
                Full clock-in / clock-out history and statuses
              </span>
              <span className="mt-4 text-xs font-medium text-[var(--accent)]">
                Open →
              </span>
            </Link>
            <Link
              href="/reports"
              className="group flex flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm transition-all hover:border-[var(--accent)]/40 hover:shadow-md"
            >
              <span className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)]">
                Monthly reports
              </span>
              <span className="mt-2 text-sm text-[var(--muted)]">
                Learnings, tasks, and reflections by month
              </span>
              <span className="mt-4 text-xs font-medium text-[var(--accent)]">
                Open →
              </span>
            </Link>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
