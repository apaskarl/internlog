"use client";

import { Icon } from "@iconify/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageContainer } from "@/components/page-container";
import { formatDurationMs } from "@/lib/attendance-time";
import {
  DEFAULT_DAILY_TARGET_MS,
  formatTimelogDateChips,
  remainingTargetMs,
} from "@/lib/timelog-stats";
import { toLocalDateString } from "@/lib/time-local";
import type { TimelogTableRow } from "@/lib/types/timelog";
import { useWorkSession } from "@/components/work-session-provider";
import { WorkSessionPanel } from "./work-session-panel";
import { TimelogCalendar } from "./timelog-calendar";
import { EditAttendanceDialog } from "./edit-attendance-dialog";
import {
  fetchAttendancePage,
  fetchAttendanceForMonth,
  fetchAttendanceStats,
} from "@/app/actions/attendance";
import {
  buildMonthFilterOptions,
  groupTimelogRowsByWeek,
} from "@/lib/timelog-week-group";

const PAGE_SIZE = 25;

const STORAGE_HISTORY_VIEW = "internlog:timelog-history-view";

type Props = {
  supabaseConfigured: boolean;
};

export function TimeLogClient({ supabaseConfigured }: Props) {
  const session = useWorkSession();
  const [publishToast, setPublishToast] = useState(false);
  const [historyView, setHistoryView] = useState<"calendar" | "list">("calendar");
  const [listMonthFilter, setListMonthFilter] = useState<string>("all");
  const [listSortOrder, setListSortOrder] = useState<"date-desc" | "date-asc">(
    "date-desc",
  );
  const [editingRow, setEditingRow] = useState<TimelogTableRow | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  // Stats (today, this week) from aggregated API; weekBuckets stored for live session merge
  const [stats, setStats] = useState<{
    remainingMs: number;
    loggedTodayMs: number;
    weekMs: number;
    chips: { weekLabel: string; dateLabel: string };
    weekBuckets: { netMs: number }[];
  } | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // List: paginated rows
  const [listRows, setListRows] = useState<TimelogTableRow[]>([]);
  const [listPage, setListPage] = useState(1);
  const [listTotalCount, setListTotalCount] = useState(0);
  const [listHasMore, setListHasMore] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(false);

  // Calendar: month-scoped rows
  const [calendarRows, setCalendarRows] = useState<TimelogTableRow[]>([]);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);

  const now = new Date();
  const chips = formatTimelogDateChips(now);

  const monthFilterOptions = useMemo(() => buildMonthFilterOptions(), []);

  const persistHistoryView = useCallback((v: "calendar" | "list") => {
    setHistoryView(v);
    try {
      localStorage.setItem(STORAGE_HISTORY_VIEW, v);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        const hv = localStorage.getItem(STORAGE_HISTORY_VIEW);
        if (hv === "calendar" || hv === "list") setHistoryView(hv);
        localStorage.removeItem("internlog:timelog-list-month-filter");
      } catch {
        /* ignore */
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Load stats on mount
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- bootstrap stats from Supabase / env */
    if (!supabaseConfigured) {
      queueMicrotask(() => {
        setStats({
          remainingMs: DEFAULT_DAILY_TARGET_MS,
          loggedTodayMs: 0,
          weekMs: 0,
          chips,
          weekBuckets: [],
        });
        setStatsLoading(false);
      });
      return;
    }

    let cancelled = false;
    setStatsLoading(true);
    fetchAttendanceStats()
      .then((s) => {
        if (cancelled) return;
        const todayIdx = (now.getDay() + 6) % 7;
        const loggedTodayFromDb = s.weekBuckets[todayIdx]?.netMs ?? 0;
        const sessionNet =
          session.state.phase !== "idle" &&
          toLocalDateString(new Date(session.state.timeInMs)) ===
            toLocalDateString(now)
            ? session.derived.netMs
            : 0;
        const loggedTodayMs = loggedTodayFromDb + sessionNet;
        const weekFromDb = s.weekBuckets.reduce((sum, b) => sum + b.netMs, 0);
        const weekSession =
          session.state.phase !== "idle"
            ? session.derived.netMs
            : 0;
        setStats({
          remainingMs: remainingTargetMs(DEFAULT_DAILY_TARGET_MS, loggedTodayMs),
          loggedTodayMs,
          weekMs: weekFromDb + weekSession,
          chips: formatTimelogDateChips(now),
          weekBuckets: s.weekBuckets.map((b) => ({ netMs: b.netMs })),
        });
        setStatsError(s.error);
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [supabaseConfigured]);

  // Derive display stats (merge live session into DB stats)
  const displayStats = useMemo(() => {
    const base = stats ?? {
      remainingMs: DEFAULT_DAILY_TARGET_MS,
      loggedTodayMs: 0,
      weekMs: 0,
      chips,
      weekBuckets: [],
    };
    if (!base.weekBuckets?.length) {
      return {
        remainingMs: base.remainingMs,
        loggedTodayMs: base.loggedTodayMs,
        weekMs: base.weekMs,
        chips: base.chips,
      };
    }
    const todayIdx = (now.getDay() + 6) % 7;
    const loggedTodayFromDb = base.weekBuckets[todayIdx]?.netMs ?? 0;
    const sessionNet =
      session.state.phase !== "idle" &&
      toLocalDateString(new Date(session.state.timeInMs)) === toLocalDateString(now)
        ? session.derived.netMs
        : 0;
    const loggedTodayMs = loggedTodayFromDb + sessionNet;
    const weekFromDb = base.weekBuckets.reduce((s, b) => s + b.netMs, 0);
    const weekSession = session.state.phase !== "idle" ? session.derived.netMs : 0;
    return {
      remainingMs: remainingTargetMs(DEFAULT_DAILY_TARGET_MS, loggedTodayMs),
      loggedTodayMs,
      weekMs: weekFromDb + weekSession,
      chips: base.chips,
    };
  }, [stats, session.state, session.derived.netMs, chips]);

  const loadListPage = useCallback(
    async (page: number, append: boolean) => {
      if (!supabaseConfigured) return;
      const dateAscending = listSortOrder === "date-asc";
      setListLoading(true);
      const res = await fetchAttendancePage(page, PAGE_SIZE, dateAscending);
      setListError(res.error);
      setListTotalCount(res.totalCount);
      setListHasMore(res.hasMore);
      setListRows((prev) => (append ? [...prev, ...res.rows] : res.rows));
      if (!append) setListPage(page);
      setListLoading(false);
    },
    [supabaseConfigured, listSortOrder],
  );

  const loadCalendarMonth = useCallback(
    async (year: number, month: number) => {
      if (!supabaseConfigured) return;
      setCalendarLoading(true);
      const res = await fetchAttendanceForMonth(year, month);
      setCalendarError(res.error);
      setCalendarRows(res.rows);
      setCalendarLoading(false);
    },
    [supabaseConfigured],
  );

  const loadListMonth = useCallback(
    async (year: number, month: number) => {
      if (!supabaseConfigured) return;
      setListLoading(true);
      setListError(null);
      const res = await fetchAttendanceForMonth(year, month);
      setListError(res.error);
      setListRows(res.rows);
      setListTotalCount(res.rows.length);
      setListHasMore(false);
      setListPage(1);
      setListLoading(false);
    },
    [supabaseConfigured],
  );

  useEffect(() => {
    if (historyView !== "list" || !supabaseConfigured) return;
    const id = requestAnimationFrame(() => {
      if (listMonthFilter === "all") {
        void loadListPage(1, false);
      } else {
        const parts = listMonthFilter.split("-");
        const y = Number(parts[0]);
        const mo = Number(parts[1]) - 1;
        if (!Number.isFinite(y) || mo < 0 || mo > 11) return;
        void loadListMonth(y, mo);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [
    historyView,
    listMonthFilter,
    listSortOrder,
    supabaseConfigured,
    loadListPage,
    loadListMonth,
  ]);

  const handleLoadMore = () => {
    const next = listPage + 1;
    setListPage(next);
    loadListPage(next, true);
  };

  const handleCalendarMonthChange = useCallback(
    (year: number, month: number) => {
      setCalendarMonth({ y: year, m: month });
      loadCalendarMonth(year, month);
    },
    [loadCalendarMonth],
  );

  useEffect(() => {
    const onPublished = () => {
      setPublishToast(true);
      loadStats();
      if (historyView === "calendar") {
        loadCalendarMonth(calendarMonth.y, calendarMonth.m);
      } else if (listMonthFilter === "all") {
        void loadListPage(1, false);
      } else {
        const parts = listMonthFilter.split("-");
        const y = Number(parts[0]);
        const mo = Number(parts[1]) - 1;
        if (Number.isFinite(y) && mo >= 0 && mo <= 11) {
          void loadListMonth(y, mo);
        }
      }
    };
    const loadStats = async () => {
      if (!supabaseConfigured) return;
      const s = await fetchAttendanceStats();
      const todayIdx = (now.getDay() + 6) % 7;
      const loggedTodayFromDb = s.weekBuckets[todayIdx]?.netMs ?? 0;
      const sessionNet =
        session.state.phase !== "idle" &&
        toLocalDateString(new Date(session.state.timeInMs)) === toLocalDateString(now)
          ? session.derived.netMs
          : 0;
      const weekFromDb = s.weekBuckets.reduce((sum, b) => sum + b.netMs, 0);
      setStats({
        remainingMs: remainingTargetMs(DEFAULT_DAILY_TARGET_MS, loggedTodayFromDb + sessionNet),
        loggedTodayMs: loggedTodayFromDb + sessionNet,
        weekMs: weekFromDb + (session.state.phase !== "idle" ? session.derived.netMs : 0),
        chips: formatTimelogDateChips(now),
        weekBuckets: s.weekBuckets.map((b) => ({ netMs: b.netMs })),
      });
      setStatsError(s.error);
    };
    window.addEventListener("internlog-attendance-published", onPublished);
    return () =>
      window.removeEventListener("internlog-attendance-published", onPublished);
  }, [
    historyView,
    supabaseConfigured,
    loadCalendarMonth,
    loadListPage,
    calendarMonth.y,
    calendarMonth.m,
    listMonthFilter,
    loadListMonth,
  ]);

  useEffect(() => {
    if (!publishToast) return;
    const t = window.setTimeout(() => setPublishToast(false), 6500);
    return () => window.clearTimeout(t);
  }, [publishToast]);

  const listMonthLabel = useMemo(() => {
    if (listMonthFilter === "all") return "";
    const d = new Date(`${listMonthFilter}-01T12:00:00`);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }, [listMonthFilter]);

  const weekGroups = useMemo(() => {
    const order = listSortOrder === "date-desc" ? "desc" : "asc";
    const g = groupTimelogRowsByWeek(listRows, order);
    if (g.length > 0 || listRows.length === 0) return g;
    return [
      {
        weekStartIso: "other",
        label: "Other",
        rows: listRows,
      },
    ];
  }, [listRows, listSortOrder]);

  const historySubtitle = listError ?? calendarError
    ? `Could not load data: ${listError ?? calendarError}`
    : !supabaseConfigured
      ? "Add Supabase env vars to load rows from the attendance table."
      : historyView === "list"
        ? listMonthFilter === "all"
          ? `Grouped by week (Mon–Sun). Sort: ${listSortOrder === "date-desc" ? "latest first" : "oldest first"}. Showing ${listRows.length} of ${listTotalCount} row(s).`
          : `Grouped by week (Mon–Sun). Sort: ${listSortOrder === "date-desc" ? "latest first" : "oldest first"}. ${listMonthLabel}: ${listRows.length} row(s).`
        : "Calendar loads the visible month only.";

  return (
    <PageContainer className="flex flex-col gap-8 lg:gap-10">
      <EditAttendanceDialog
        row={editingRow}
        open={editingRow != null}
        onClose={() => setEditingRow(null)}
        supabaseConfigured={supabaseConfigured}
      />
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
              <Icon icon="mdi:clock-outline" className="h-5 w-5" aria-hidden />
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
              {displayStats.chips.weekLabel}
            </span>
            <span className="rounded-lg border border-(--card-border) bg-background px-3 py-1.5 text-xs font-medium text-(--muted)">
              Today · {displayStats.chips.dateLabel}
            </span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-(--card-border) bg-(--card) p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--muted)">
              Remaining today
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground">
              {statsLoading ? "…" : formatDurationMs(displayStats.remainingMs)}
            </p>
            <p className="mt-1 text-xs text-(--muted)">
              Target {formatDurationMs(DEFAULT_DAILY_TARGET_MS)} · logged{" "}
              <span className="font-mono tabular-nums text-foreground">
                {statsLoading ? "…" : formatDurationMs(displayStats.loggedTodayMs)}
              </span>{" "}
              net
            </p>
          </div>
          <div className="rounded-2xl border border-(--card-border) bg-(--card) p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-(--muted)">
              Logged this week
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-foreground">
              {statsLoading ? "…" : formatDurationMs(displayStats.weekMs)}
            </p>
            <p className="mt-1 text-xs text-(--muted)">
              Net work Mon–Sun (database + current session)
            </p>
          </div>
        </div>
        {statsError ? (
          <p className="text-xs text-red-400" role="alert">
            Stats: {statsError}
          </p>
        ) : null}

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
              className={`mt-1 text-sm ${listError ?? calendarError ? "text-red-400" : "text-(--muted)"}`}
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
                onClick={() => persistHistoryView("calendar")}
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
                onClick={() => persistHistoryView("list")}
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
            {historyView === "list" ? (
              <>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="timelog-month-filter"
                    className="text-xs font-medium text-(--muted)"
                  >
                    Month
                  </label>
                  <select
                    id="timelog-month-filter"
                    value={listMonthFilter}
                    onChange={(e) => setListMonthFilter(e.target.value)}
                    className="cursor-pointer rounded-lg border border-(--card-border) bg-background px-3 py-1.5 text-xs font-medium text-foreground"
                    aria-label="Filter list by month"
                  >
                    {monthFilterOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="timelog-sort"
                    className="text-xs font-medium text-(--muted)"
                  >
                    Sort
                  </label>
                  <select
                    id="timelog-sort"
                    value={listSortOrder}
                    onChange={(e) =>
                      setListSortOrder(
                        e.target.value === "date-asc" ? "date-asc" : "date-desc",
                      )
                    }
                    className="cursor-pointer rounded-lg border border-(--card-border) bg-background px-3 py-1.5 text-xs font-medium text-foreground"
                    aria-label="Sort entries by date"
                  >
                    <option value="date-desc">Latest entry first</option>
                    <option value="date-asc">Oldest entry first</option>
                  </select>
                </div>
              </>
            ) : null}
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-(--card-border) bg-background px-3 py-1.5 text-xs font-medium text-(--muted) opacity-60 transition-colors hover:opacity-80 disabled:cursor-not-allowed"
              disabled
            >
              Export CSV (soon)
            </button>
          </div>
        </div>

        {(listError ?? calendarError) ? (
          <div
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            Supabase: {listError ?? calendarError}
          </div>
        ) : null}

        {historyView === "calendar" ? (
          <TimelogCalendar
            rows={calendarRows}
            loading={calendarLoading}
            onMonthChange={handleCalendarMonthChange}
            supabaseConfigured={supabaseConfigured}
            onEditRow={(row) => setEditingRow(row)}
          />
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
                    <th className="px-4 py-3 text-right font-semibold lg:px-5">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--card-border)">
                  {listLoading && listRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-(--muted) lg:px-5">
                        Loading…
                      </td>
                    </tr>
                  ) : listRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-10 text-center text-sm text-(--muted) lg:px-5"
                      >
                        No rows to show. Check Supabase RLS policies and that{" "}
                        <code className="font-mono text-foreground">attendance</code> has data.
                      </td>
                    </tr>
                  ) : (
                    weekGroups.flatMap((group) => [
                      <tr
                        key={`week-${group.weekStartIso}`}
                        className="border-b border-(--card-border) bg-background/70"
                      >
                        <td
                          colSpan={8}
                          className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-(--muted) lg:px-5"
                        >
                          {group.label}
                        </td>
                      </tr>,
                      ...group.rows.map((row) => (
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
                          <td className="px-4 py-4 text-right lg:px-5">
                            <button
                              type="button"
                              disabled={!supabaseConfigured}
                              onClick={() => setEditingRow(row)}
                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-(--card-border) bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-background/80 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Icon
                                icon="mdi:pencil-outline"
                                className="h-4 w-4"
                                aria-hidden
                              />
                              Edit
                            </button>
                          </td>
                        </tr>
                      )),
                    ])
                  )}
                </tbody>
              </table>
            </div>
            {listMonthFilter === "all" && listHasMore ? (
              <div className="border-t border-(--card-border) p-3 text-center">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={listLoading}
                  className="cursor-pointer rounded-lg border border-(--card-border) bg-background px-4 py-2 text-sm font-medium text-(--muted) transition-colors hover:bg-background/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {listLoading ? "Loading…" : "Load more"}
                </button>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </PageContainer>
  );
}