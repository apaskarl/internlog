"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { formatDurationMs } from "@/lib/attendance-time";
import type { WorkSessionState } from "@/lib/work-session";
import { ResetDaySessionControl } from "@/components/reset-day-session";
import { useWorkSession } from "@/components/work-session-provider";

function phaseDot(s: WorkSessionState): { className: string; label: string } {
  switch (s.phase) {
    case "idle":
      return {
        className: "bg-(--muted)",
        label: "No session",
      };
    case "working":
      return {
        className:
          "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.45)]",
        label: "Working",
      };
    case "on_break":
      return {
        className: "bg-amber-500",
        label: "On break",
      };
    case "finished":
      return {
        className: "bg-teal-500",
        label: "Session ended",
      };
    default:
      return { className: "bg-(--muted)", label: "Session" };
  }
}

const action =
  "inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-foreground/55 transition-[color,transform,background] hover:bg-foreground/[0.06] hover:text-foreground active:scale-[0.96] sm:h-11 sm:w-11";

const actionDanger =
  `${action} text-red-600/70 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400/80`;

function SessionQuickActions() {
  const session = useWorkSession();
  const { state, timeIn, startBreak, resumeBreak, timeOut, continueSession } =
    session;

  if (state.phase === "idle") {
    return (
      <button
        type="button"
        className={action}
        onClick={timeIn}
        title="Time in"
        aria-label="Time in — start session"
      >
        <Icon icon="mdi:play" className="h-5 w-5 sm:h-[22px] sm:w-[22px]" aria-hidden />
      </button>
    );
  }

  if (state.phase === "working") {
    return (
      <button
        type="button"
        className={action}
        onClick={startBreak}
        title="Pause"
        aria-label="Pause — take a break"
      >
        <Icon icon="mdi:pause" className="h-5 w-5 sm:h-[22px] sm:w-[22px]" aria-hidden />
      </button>
    );
  }

  if (state.phase === "on_break") {
    return (
      <>
        <button
          type="button"
          className={action}
          onClick={resumeBreak}
          title="Resume"
          aria-label="Resume work"
        >
          <Icon icon="mdi:play" className="h-5 w-5 sm:h-[22px] sm:w-[22px]" aria-hidden />
        </button>
        <button
          type="button"
          className={actionDanger}
          onClick={timeOut}
          title="Time out"
          aria-label="Time out — end session"
        >
          <Icon icon="mdi:stop" className="h-5 w-5 sm:h-[22px] sm:w-[22px]" aria-hidden />
        </button>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        className={action}
        onClick={continueSession}
        title="Continue time"
        aria-label="Continue time — resume logging"
      >
        <Icon icon="mdi:play-circle-outline" className="h-5 w-5 sm:h-[22px] sm:w-[22px]" aria-hidden />
      </button>
      <Link
        href="/timelog"
        className={action}
        title="Review & publish"
        aria-label="Open Time log to review and publish"
      >
        <Icon
          icon="mdi:check-bold"
          className="h-5 w-5 text-emerald-600/90 sm:h-[22px] sm:w-[22px] dark:text-emerald-400/90"
          aria-hidden
        />
      </Link>
    </>
  );
}

export function SessionStatusWidget() {
  const { state, derived, hydrated } = useWorkSession();

  if (!hydrated) {
    return (
      <div
        className="pointer-events-none fixed z-40 bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))]"
        aria-hidden
      >
        <div className="h-11 w-44 animate-pulse rounded-full bg-foreground/6 sm:h-12 sm:w-52" />
      </div>
    );
  }

  const dot = phaseDot(state);
  const net =
    state.phase === "idle" ? formatDurationMs(0) : formatDurationMs(derived.netMs);
  const ariaStatus = `${dot.label}. Net ${net}.`;

  return (
    <aside
      className="fixed z-40 bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))]"
      aria-label={ariaStatus}
    >
      <div className="flex items-center gap-1.5 rounded-full border border-(--card-border)/70 bg-(--card)/85 py-1.5 pl-3 pr-1.5 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.14)] backdrop-blur-md dark:border-white/8 dark:bg-(--card)/75 dark:shadow-[0_4px_28px_-6px_rgba(0,0,0,0.5)] sm:gap-2 sm:py-2 sm:pl-4 sm:pr-2">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${dot.className} ${state.phase === "working" ? "animate-pulse" : ""}`}
          title={dot.label}
          aria-hidden
        />
        <span className="min-w-[5rem] px-0.5 font-mono text-sm font-semibold tabular-nums leading-none tracking-tight text-foreground/90 sm:min-w-[5.5rem] sm:text-base">
          {net}
        </span>
        <span
          className="h-5 w-px shrink-0 self-center bg-(--card-border)/80 sm:h-6"
          aria-hidden
        />
        <div className="flex items-center gap-1 pr-0.5 sm:gap-1.5 sm:pr-1">
          <SessionQuickActions />
          <ResetDaySessionControl variant="widget" />
        </div>
      </div>
    </aside>
  );
}
