"use client";

import { Icon } from "@iconify/react";
import { useMemo } from "react";
import { PageContainer } from "@/components/page-container";
import { PLACEHOLDER_MONTHLY_REPORTS } from "@/lib/placeholder-data";

export default function ReportsPage() {
  const reports = PLACEHOLDER_MONTHLY_REPORTS;

  const aggregates = useMemo(() => {
    let hours = 0;
    let days = 0;
    let mentors = 0;
    for (const r of reports) {
      hours += Number.parseFloat(r.stats.hoursLogged) || 0;
      days += r.stats.daysPresent;
      mentors += r.stats.mentorSessions;
    }
    return {
      hoursTotal: Math.round(hours),
      daysTotal: days,
      mentorTotal: mentors,
      reportCount: reports.length,
    };
  }, [reports]);

  return (
    <PageContainer className="flex flex-col gap-10 lg:gap-12">
      <section aria-labelledby="reports-heading" className="space-y-6">
        <div className="flex flex-col gap-6 border-b border-[var(--card-border)] pb-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-muted)] text-[var(--accent)]">
              <Icon
                icon="mdi:notebook-outline"
                className="h-6 w-6"
                aria-hidden
              />
            </span>
            <div>
              <h1
                id="reports-heading"
                className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl"
              >
                Monthly reports
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                A structured journal for learnings, shipped work, challenges,
                and what&apos;s next — useful for reviews, mentors, and your
                portfolio. Data below is placeholder.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm font-medium text-[var(--muted)] opacity-60"
            >
              <Icon icon="mdi:file-export-outline" className="h-5 w-5" />
              Export
            </button>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white opacity-90 shadow-sm dark:text-slate-950"
            >
              <Icon icon="mdi:plus" className="h-5 w-5" />
              New entry
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Reports on file
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[var(--foreground)]">
              {aggregates.reportCount}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Months with a written reflection
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Hours logged (sample)
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[var(--foreground)]">
              {aggregates.hoursTotal}
              <span className="ml-1 text-lg font-normal text-[var(--muted)]">
                h
              </span>
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Sum of monthly totals in the list
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Days on-site (sample)
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[var(--foreground)]">
              {aggregates.daysTotal}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Cumulative days present
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Mentor touchpoints
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-[var(--foreground)]">
              {aggregates.mentorTotal}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              1:1s & scheduled check-ins
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-[var(--foreground)]">
            Jump to month
          </p>
          <nav
            className="flex flex-wrap gap-2"
            aria-label="Monthly report shortcuts"
          >
            {reports.map((r) => (
              <a
                key={r.id}
                href={`#report-${r.id}`}
                className="rounded-full border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--accent)]/50 hover:bg-[var(--accent-muted)]"
              >
                {r.month.slice(0, 3)} {r.year}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <div className="flex flex-col gap-12">
        {reports.map((report) => (
          <article
            key={report.id}
            id={`report-${report.id}`}
            className="scroll-mt-28 overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-sm"
          >
            <div className="relative border-b border-[var(--card-border)] bg-[var(--background)]/50 px-6 py-6 sm:px-8">
              <div className="absolute left-0 top-0 h-full w-1.5 bg-[var(--accent)]" />
              <div className="pl-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[var(--accent-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
                    Reflection
                  </span>
                  {report.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[var(--card-border)] bg-[var(--card)] px-3 py-1 text-xs font-medium text-[var(--muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                  {report.month} {report.year}
                </h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                    <div className="flex items-center gap-2 text-[var(--muted)]">
                      <Icon
                        icon="mdi:clock-outline"
                        className="h-4 w-4 text-[var(--accent)]"
                        aria-hidden
                      />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Hours
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-[var(--foreground)]">
                      {report.stats.hoursLogged}
                      <span className="ml-1 text-sm font-normal text-[var(--muted)]">
                        h
                      </span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                    <div className="flex items-center gap-2 text-[var(--muted)]">
                      <Icon
                        icon="mdi:calendar-check"
                        className="h-4 w-4 text-[var(--accent)]"
                        aria-hidden
                      />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Days present
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-[var(--foreground)]">
                      {report.stats.daysPresent}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
                    <div className="flex items-center gap-2 text-[var(--muted)]">
                      <Icon
                        icon="mdi:account-supervisor-outline"
                        className="h-4 w-4 text-[var(--accent)]"
                        aria-hidden
                      />
                      <span className="text-xs font-semibold uppercase tracking-wider">
                        Mentor sessions
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-[var(--foreground)]">
                      {report.stats.mentorSessions}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <blockquote className="border-b border-[var(--card-border)] px-6 py-6 sm:px-8 sm:py-8">
              <Icon
                icon="mdi:format-quote-open"
                className="mb-3 h-8 w-8 text-[var(--accent)]/40"
                aria-hidden
              />
              <p className="text-base leading-relaxed text-[var(--foreground)] sm:text-lg">
                {report.highlights}
              </p>
            </blockquote>

            <div className="grid gap-0 lg:grid-cols-2">
              <div className="border-b border-[var(--card-border)] p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="mdi:lightbulb-outline"
                    className="h-5 w-5 text-[var(--accent)]"
                    aria-hidden
                  />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
                    What I learned
                  </h3>
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--foreground)]">
                  {report.lessonsLearned.map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-b border-[var(--card-border)] p-6 sm:p-8">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="mdi:checkbox-marked-circle-outline"
                    className="h-5 w-5 text-[var(--accent)]"
                    aria-hidden
                  />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
                    Tasks & contributions
                  </h3>
                </div>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--foreground)]">
                  {report.tasksCompleted.map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <Icon
                        icon="mdi:check"
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-2">
              <div className="border-t border-[var(--card-border)] bg-amber-500/[0.06] p-6 sm:p-8 dark:bg-amber-500/[0.08]">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="mdi:terrain"
                    className="h-5 w-5 text-amber-700 dark:text-amber-400"
                    aria-hidden
                  />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                    Challenges
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]">
                  {report.challenges}
                </p>
              </div>
              <div className="border-t border-[var(--card-border)] bg-[var(--accent-muted)] p-6 sm:p-8 lg:border-l">
                <div className="flex items-center gap-2">
                  <Icon
                    icon="mdi:flag-checkered"
                    className="h-5 w-5 text-[var(--accent)]"
                    aria-hidden
                  />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--accent)]">
                    Next month
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[var(--foreground)]">
                  {report.goalsNext}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </PageContainer>
  );
}
