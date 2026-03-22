"use client";

import { Icon } from "@iconify/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useWorkSession } from "@/components/work-session-provider";

type Props = {
  /** Main timer card vs floating widget. */
  variant: "panel" | "widget";
};

export function ResetDaySessionControl({ variant }: Props) {
  const { state, hydrated, resetToIdle } = useWorkSession();
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => cancelRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const confirm = useCallback(() => {
    resetToIdle();
    setOpen(false);
  }, [resetToIdle]);

  if (!hydrated || state.phase === "idle") {
    return null;
  }

  const trigger =
    variant === "panel" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-(--card-border) bg-background px-4 py-2.5 text-sm font-medium text-(--muted) transition hover:border-red-500/35 hover:bg-red-500/5 hover:text-red-700 dark:hover:text-red-400"
      >
        <Icon icon="mdi:delete-outline" className="h-5 w-5 shrink-0" aria-hidden />
        Reset day
      </button>
    ) : (
      <>
        <span
          className="mx-0.5 h-5 w-px shrink-0 self-center bg-(--card-border)/80 sm:h-6"
          aria-hidden
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-foreground/45 transition-[color,transform,background] hover:bg-red-500/10 hover:text-red-600 active:scale-[0.96] sm:h-11 sm:w-11 dark:hover:text-red-400"
          title="Reset day"
          aria-label="Reset day — clear session"
        >
          <Icon icon="mdi:delete-outline" className="h-5 w-5 sm:h-[22px] sm:w-[22px]" aria-hidden />
        </button>
      </>
    );

  return (
    <>
      {trigger}
      {open ? (
        <div
          className="pointer-events-none fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="presentation"
        >
          <button
            type="button"
            className="pointer-events-auto absolute inset-0 cursor-pointer bg-black/60"
            aria-label="Cancel"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="pointer-events-auto relative z-10 w-full max-w-md rounded-2xl border border-(--card-border) bg-(--card) p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id={titleId}
              className="text-lg font-semibold text-foreground"
            >
              Reset today&apos;s session?
            </h3>
            <p className="mt-2 text-sm text-(--muted)">
              This clears the timer on this device: clock-in, breaks, and any ended
              session that hasn&apos;t been published yet. Rows already saved in
              Supabase are not deleted.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                ref={cancelRef}
                type="button"
                className="inline-flex h-10 min-w-[6rem] cursor-pointer items-center justify-center rounded-full border border-(--card-border) bg-background px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-background/90"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex h-10 min-w-[6rem] cursor-pointer items-center justify-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 text-sm font-semibold text-red-700 shadow-sm transition hover:bg-red-500/18 dark:text-red-400"
                onClick={confirm}
              >
                <Icon icon="mdi:delete-outline" className="h-5 w-5" aria-hidden />
                Reset day
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
