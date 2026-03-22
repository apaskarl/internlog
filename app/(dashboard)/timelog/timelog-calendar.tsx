"use client";

import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import type { TimelogTableRow } from "@/lib/types/timelog";
import { toLocalDateString } from "@/lib/time-local";

const INTERNSHIP_START = new Date(2026, 0, 1); // Jan 2026
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type Props = {
  rows: TimelogTableRow[];
};

function buildDateMap(rows: TimelogTableRow[]): Map<string, TimelogTableRow> {
  const map = new Map<string, TimelogTableRow>();
  for (const row of rows) {
    if (row.dateKey) map.set(row.dateKey, row);
  }
  return map;
}

function getDaysInMonth(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: Date[] = [];
  const startOffset = first.getDay();

  // Pad leading empty slots
  for (let i = 0; i < startOffset; i++) {
    days.push(new Date(0));
  }

  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  return days;
}

function isBeforeInternship(d: Date): boolean {
  if (d.getTime() === 0) return true;
  return d < INTERNSHIP_START;
}

function isAfterToday(d: Date): boolean {
  if (d.getTime() === 0) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy > today;
}

export function TimelogCalendar({ rows }: Props) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const dateMap = useMemo(() => buildDateMap(rows), [rows]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const now = new Date();
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const maxDate = new Date(now.getFullYear(), now.getMonth() + 2, 1); // allow ~2 months ahead
  const canPrev = year > 2026 || (year === 2026 && month > 0);
  const canNext =
    year < maxDate.getFullYear() ||
    (year === maxDate.getFullYear() && month < maxDate.getMonth());

  const goPrev = () => {
    if (!canPrev) return;
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1));
  };

  const goNext = () => {
    if (!canNext) return;
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1));
  };

  const monthLabel = viewDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="rounded-2xl border border-(--card-border) bg-(--card) p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{monthLabel}</h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canPrev}
            aria-label="Previous month"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-(--card-border) bg-background text-foreground transition-colors hover:bg-background/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon icon="mdi:chevron-left" className="h-6 w-6" aria-hidden />
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!canNext}
            aria-label="Next month"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-(--card-border) bg-background text-foreground transition-colors hover:bg-background/80 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon icon="mdi:chevron-right" className="h-6 w-6" aria-hidden />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[10px] font-semibold uppercase tracking-wider text-(--muted)"
          >
            {d}
          </div>
        ))}
        {days.map((d, i) => {
          const isEmpty = d.getTime() === 0;
          const beforeStart = isBeforeInternship(d);
          const future = isAfterToday(d);
          const dateKey = isEmpty ? null : toLocalDateString(d);
          const row = dateKey ? dateMap.get(dateKey) : null;

          const isComplete = row?.status === "complete";
          const isPartial = row?.status === "partial";
          const isToday =
            !isEmpty &&
            d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear();

          let cellClass =
            "flex min-h-[4rem] min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 py-2 text-xs font-medium transition-colors ";
          if (isEmpty) {
            cellClass += "bg-transparent";
          } else if (beforeStart) {
            cellClass += "text-(--muted)/50";
          } else if (future) {
            cellClass += "text-(--muted)/60";
          } else if (isComplete) {
            cellClass +=
              "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/30";
          } else if (isPartial) {
            cellClass +=
              "bg-amber-500/15 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/25";
          } else {
            cellClass += "bg-background/60 text-(--muted) hover:bg-background/80";
          }

          if (isToday && !isEmpty && !isComplete && !isPartial) {
            cellClass += " ring-2 ring-(--accent) ring-offset-2 ring-offset-(--card)";
          }

          const title =
            row && dateKey
              ? `${row.dayLabel} · ${row.netDuration} net · ${row.status}`
              : dateKey
                ? toLocalDateString(d)
                : "";

          return (
            <div
              key={i}
              className={cellClass}
              title={title}
              aria-label={isEmpty ? undefined : dateKey ?? undefined}
            >
              {isEmpty ? null : (
                <>
                  <span>{d.getDate()}</span>
                  {row ? (
                    <span className="truncate max-w-full text-[9px] font-normal opacity-90">
                      {row.netDuration}
                    </span>
                  ) : null}
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-(--card-border) pt-3 text-[10px] text-(--muted)">
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full bg-emerald-500/40 ring-1 ring-emerald-500/40"
            aria-hidden
          />
          Complete
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full bg-amber-500/40 ring-1 ring-amber-500/40"
            aria-hidden
          />
          Partial
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-background ring-1 ring-(--card-border)" aria-hidden />
          No log
        </span>
      </div>
    </div>
  );
}
