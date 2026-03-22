"use client";

import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { publishAttendance } from "@/app/actions/attendance";
import {
  DurationMetricCard,
  TimeClockRow,
} from "@/components/duration-metric";
import { formatDurationMs } from "@/lib/attendance-time";
import { toLocalDateString, toPgTime } from "@/lib/time-local";
import { ResetDaySessionControl } from "@/components/reset-day-session";
import { totalBreakMs, type WorkSessionState } from "@/lib/work-session";
import type { WorkSessionApi } from "./use-work-session";

type Props = {
  session: WorkSessionApi;
  supabaseConfigured: boolean;
};

export function WorkSessionPanel({ session, supabaseConfigured }: Props) {
  const {
    state,
    hydrated,
    derived,
    timeIn,
    startBreak,
    resumeBreak,
    timeOut,
    continueSession,
    discardFinished,
  } = session;

  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const dialogTitleId = useId();

  useEffect(() => {
    if (!dialogOpen) return;
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [dialogOpen]);

  /** Close review and return to active time logging (same clock-in & breaks, live timer). */
  const backToTimeLogging = useCallback(() => {
    if (publishing) return;
    setPublishError(null);
    setDialogOpen(false);
    continueSession();
  }, [publishing, continueSession]);

  const handlePublish = useCallback(async () => {
    if (state.phase !== "finished") return;
    setPublishing(true);
    setPublishError(null);
    const breakMin = Math.round(totalBreakMs(state, Date.now()) / 60000);
    const timeInD = new Date(state.timeInMs);
    const timeOutD = new Date(state.timeOutMs);
    const result = await publishAttendance({
      date: toLocalDateString(timeInD),
      timeIn: toPgTime(timeInD),
      timeOut: toPgTime(timeOutD),
      breakDurationMinutes: breakMin,
    });
    setPublishing(false);
    if (result.ok) {
      setPublishError(null);
      setDialogOpen(false);
      discardFinished();
      router.refresh();
      window.dispatchEvent(new CustomEvent("internlog-attendance-published"));
    } else {
      setPublishError(result.error);
    }
  }, [state, discardFinished, router]);

  if (!hydrated) {
    return (
      <div
        className="rounded-2xl border border-(--card-border) bg-(--card) p-6 shadow-sm sm:p-8"
        aria-hidden
      >
        <div className="h-40 animate-pulse rounded-xl bg-background/60" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-(--card-border) bg-(--card) p-6 shadow-sm sm:p-10">
        <div className="mx-auto flex max-w-lg flex-col items-center text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-(--muted)">
            Today&apos;s session
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            {phaseHeading(state)}
          </h2>

          <CenterTimerDisplay state={state} derived={derived} />

          <p className="mt-6 max-w-md text-sm text-(--muted)">
            {phaseDescription(state)}
          </p>

          <div className="mt-8 flex w-full flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <PlayerControls
                state={state}
                onTimeIn={timeIn}
                onBreak={startBreak}
                onResume={resumeBreak}
                onContinueTime={continueSession}
                onOpenPublish={() => {
                  setPublishError(null);
                  setDialogOpen(true);
                }}
                supabaseConfigured={supabaseConfigured}
              />
            </div>
            {state.phase === "on_break" ? (
              <button
                type="button"
                onClick={timeOut}
                className="cursor-pointer rounded-xl border border-red-500/45 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-700 shadow-sm transition hover:border-red-500/70 hover:bg-red-500/18 active:scale-[0.99] dark:text-red-400 dark:hover:bg-red-500/20"
              >
                Time out — end session
              </button>
            ) : null}
            <ResetDaySessionControl variant="panel" />
          </div>
        </div>
      </div>

      {dialogOpen && state.phase === "finished" ? (
        <div
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            className="pointer-events-auto absolute inset-0 cursor-pointer bg-black/60"
            aria-label="Continue time — resume logging"
            onClick={backToTimeLogging}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            className="pointer-events-auto relative z-10 w-full max-w-md rounded-2xl border border-(--card-border) bg-(--card) p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id={dialogTitleId}
              className="text-lg font-semibold text-foreground"
            >
              Confirm attendance
            </h3>
            <p className="mt-2 text-sm text-(--muted)">
              Review the times below. Continue time closes this and resumes logging with
              the same clock-in. Publishing saves one row to the{" "}
              <code className="font-mono text-foreground">attendance</code>{" "}
              table.
            </p>

            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-(--muted)">
                Clock times
              </p>
              <TimeClockRow
                label="Date"
                value={toLocalDateString(new Date(state.timeInMs))}
                variant="text"
              />
              <TimeClockRow
                label="Time in"
                value={new Date(state.timeInMs).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              />
              <TimeClockRow
                label="Time out"
                value={new Date(state.timeOutMs).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              />
            </div>

            {state.completedBreaks.length > 0 ? (
              <div className="mt-5 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-(--muted)">
                  Breaks ({state.completedBreaks.length})
                </p>
                <ul className="max-h-32 space-y-2 overflow-y-auto">
                  {state.completedBreaks.map((b, i) => (
                    <li key={`${b.startMs}-${b.endMs}`}>
                      <TimeClockRow
                        label={`Break #${i + 1}`}
                        value={formatDurationMs(
                          Math.max(0, b.endMs - b.startMs),
                        )}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-5 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-(--muted)">
                Durations
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                <DurationMetricCard
                  label="Gross"
                  value={formatDurationMs(
                    Math.max(0, state.timeOutMs - state.timeInMs),
                  )}
                  muted
                />
                <DurationMetricCard
                  label="Total break"
                  value={formatDurationMs(
                    totalBreakMs(state, state.timeOutMs),
                  )}
                  muted
                />
                <DurationMetricCard
                  label="Net work"
                  value={formatDurationMs(
                    Math.max(
                      0,
                      state.timeOutMs -
                        state.timeInMs -
                        totalBreakMs(state, state.timeOutMs),
                    ),
                  )}
                />
              </div>
            </div>

            {!supabaseConfigured ? (
              <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
                Configure Supabase env vars to publish.
              </p>
            ) : null}

            {publishError ? (
              <p className="mt-3 text-sm text-red-400" role="alert">
                {publishError}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-end">
              <button
                ref={closeBtnRef}
                type="button"
                className="inline-flex h-11 min-w-[9rem] cursor-pointer items-center justify-center gap-2 rounded-full border border-(--card-border) bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-background/90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={publishing}
                onClick={backToTimeLogging}
              >
                <Icon icon="mdi:play-circle-outline" className="h-5 w-5 shrink-0 text-(--accent)" aria-hidden />
                Continue time
              </button>
              <PublishAttendancePillButton
                onClick={handlePublish}
                disabled={publishing || !supabaseConfigured}
                loading={publishing}
                ariaLabel="Confirm and publish attendance"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function phaseHeading(s: WorkSessionState): string {
  switch (s.phase) {
    case "idle":
      return "Ready to start?";
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

function phaseDescription(s: WorkSessionState): string {
  switch (s.phase) {
    case "idle":
      return "Press play to start. Pause for breaks, stop when you’re done, then confirm to publish to Supabase.";
    case "working":
      return "Use pause when you need a break. Time out only appears while you’re paused.";
    case "on_break":
      return "Break time is tracked. Resume to keep working, or use the red Time out to end the session.";
    case "finished":
      return "Continue time picks up where you left off. Check opens publish when you’re ready. Your session survives refresh until you publish.";
    default:
      return "";
  }
}

function CenterTimerDisplay({
  state,
  derived,
}: {
  state: WorkSessionState;
  derived: { grossMs: number; breakMs: number; netMs: number };
}) {
  if (state.phase === "idle") {
    return (
      <div className="mt-8 w-full">
        <p className="font-mono text-3xl font-semibold tabular-nums tracking-wide text-(--muted) sm:text-4xl">
          {formatDurationMs(0)}
        </p>
        <p className="mt-2 text-sm text-(--muted)">Timer starts after Time in</p>
      </div>
    );
  }

  if (state.phase === "finished") {
    return (
      <div className="mt-8 w-full space-y-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-(--muted)">
            Net work
          </p>
          <p className="mt-1 font-mono text-4xl font-semibold tabular-nums tracking-wide text-foreground sm:text-5xl">
            {formatDurationMs(derived.netMs)}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-(--muted)">
          <span>
            Break total{" "}
            <span className="font-mono tabular-nums text-foreground">
              {formatDurationMs(derived.breakMs)}
            </span>
          </span>
          <span className="text-(--card-border)">·</span>
          <span>
            Gross{" "}
            <span className="font-mono tabular-nums text-foreground">
              {formatDurationMs(derived.grossMs)}
            </span>
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-(--muted)">
        {state.phase === "on_break" ? "Paused · net work" : "Net work"}
      </p>
      <p className="font-mono text-4xl font-semibold tabular-nums tracking-wide text-foreground sm:text-5xl">
        {formatDurationMs(derived.netMs)}
      </p>
      <p className="text-base text-(--muted)">
        Break total{" "}
        <span className="font-mono tabular-nums text-foreground">
          {formatDurationMs(derived.breakMs)}
        </span>
        {state.phase === "on_break" ? (
          <span className="ml-2 rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
            On break
          </span>
        ) : null}
      </p>
    </div>
  );
}

function TextResumeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-(--card-border) bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-background/90 active:scale-[0.99]"
      aria-label="Resume work"
    >
      <Icon icon="mdi:play" className="h-5 w-5 shrink-0 text-(--accent)" aria-hidden />
      Resume
    </button>
  );
}

/** After Time out: resume logging without opening publish (same time in & breaks). */
function ContinueTimeButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-11 cursor-pointer items-center gap-2.5 rounded-full border border-(--card-border) bg-background px-5 text-sm font-semibold text-foreground shadow-sm transition hover:bg-background/90 active:scale-[0.99]"
      aria-label="Continue time — resume logging without publishing"
    >
      <Icon icon="mdi:play-circle-outline" className="h-6 w-6 shrink-0 text-(--accent)" aria-hidden />
      Continue time
    </button>
  );
}

const publishPillEnabledClass =
  "inline-flex h-11 min-w-44 cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/35 ring-2 ring-emerald-300/55 ring-offset-2 ring-offset-background transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 dark:from-emerald-500 dark:to-teal-600 dark:ring-emerald-400/45";

const publishPillUnconfiguredClass =
  "inline-flex h-11 min-w-44 cursor-pointer items-center justify-center gap-2 rounded-full border border-dashed border-(--card-border) bg-background/40 px-5 text-sm font-semibold text-(--muted) shadow-none";

/** Same pill as dialog: check icon + “Publish attendance”. */
function PublishAttendancePillButton({
  onClick,
  disabled,
  loading,
  unconfigured,
  ariaLabel,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** No Supabase env — dashed inactive style (main card only). */
  unconfigured?: boolean;
  ariaLabel?: string;
}) {
  const label = loading ? "Publishing…" : "Publish attendance";
  const inactive = Boolean(disabled || loading);
  return (
    <button
      type="button"
      onClick={inactive ? undefined : onClick}
      disabled={inactive}
      className={unconfigured ? publishPillUnconfiguredClass : publishPillEnabledClass}
      aria-label={ariaLabel ?? "Publish attendance"}
    >
      <Icon icon="mdi:check-bold" className="h-5 w-5 shrink-0" aria-hidden />
      {label}
    </button>
  );
}

function PlayerIconButton({
  onClick,
  icon,
  label,
  variant = "ghost",
  disabled,
  size = "md",
}: {
  onClick?: () => void;
  icon: string;
  label: string;
  variant?: "primary" | "ghost" | "danger" | "publish";
  disabled?: boolean;
  size?: "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "h-16 w-16" : "h-12 w-12";
  const iconClass = size === "lg" ? "h-8 w-8" : "h-6 w-6";
  const base =
    `inline-flex ${sizeClass} shrink-0 items-center justify-center rounded-full transition active:scale-95`;
  const interactive =
    disabled === true
      ? "cursor-not-allowed opacity-45"
      : "cursor-pointer hover:brightness-[1.03]";
  let styles: string;
  if (variant === "publish") {
    styles = disabled
      ? "border border-dashed border-(--card-border) bg-background/40 text-(--muted) shadow-none"
      : "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/35 ring-2 ring-emerald-300/60 ring-offset-2 ring-offset-background hover:brightness-110 dark:from-emerald-500 dark:to-teal-600 dark:ring-emerald-400/40";
  } else if (variant === "primary") {
    styles =
      "bg-(--accent) text-white shadow-sm hover:opacity-95 dark:text-slate-950";
  } else if (variant === "danger") {
    styles =
      "border border-(--card-border) bg-background text-foreground hover:border-red-500/40 hover:bg-red-500/10";
  } else {
    styles =
      "border border-(--card-border) bg-background text-foreground hover:bg-background/90";
  }
  const disabledDim =
    disabled === true && variant !== "publish"
      ? " disabled:cursor-not-allowed disabled:opacity-50"
      : "";
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${base} ${interactive} ${styles}${disabledDim}`}
      title={label}
      aria-label={label}
    >
      <Icon icon={icon} className={iconClass} aria-hidden />
    </button>
  );
}

function PlayerControls({
  state,
  onTimeIn,
  onBreak,
  onResume,
  onContinueTime,
  onOpenPublish,
  supabaseConfigured,
}: {
  state: WorkSessionState;
  onTimeIn: () => void;
  onBreak: () => void;
  onResume: () => void;
  onContinueTime: () => void;
  onOpenPublish: () => void;
  supabaseConfigured: boolean;
}) {
  if (state.phase === "idle") {
    return (
      <PlayerIconButton
        onClick={onTimeIn}
        icon="mdi:play"
        label="Time in — start session"
        variant="primary"
        size="lg"
      />
    );
  }

  if (state.phase === "working") {
    return (
      <PlayerIconButton
        onClick={onBreak}
        icon="mdi:pause"
        label="Pause — take a break"
        variant="primary"
        size="lg"
      />
    );
  }

  if (state.phase === "on_break") {
    return <TextResumeButton onClick={onResume} />;
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <ContinueTimeButton onClick={onContinueTime} />
      <PublishAttendancePillButton
        onClick={onOpenPublish}
        disabled={!supabaseConfigured}
        unconfigured={!supabaseConfigured}
        ariaLabel={
          supabaseConfigured
            ? "Publish attendance — open review"
            : "Configure Supabase to publish attendance"
        }
      />
    </div>
  );
}
