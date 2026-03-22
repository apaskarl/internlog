"use client";

import { Icon } from "@iconify/react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { updateAttendance } from "@/app/actions/attendance";
import { pgTimeToInputValue } from "@/lib/time-local";
import type { TimelogTableRow } from "@/lib/types/timelog";

type Props = {
  row: TimelogTableRow | null;
  open: boolean;
  onClose: () => void;
  supabaseConfigured: boolean;
};

export function EditAttendanceDialog({
  row,
  open,
  onClose,
  supabaseConfigured,
}: Props) {
  if (!open || !row) return null;

  return (
    <EditAttendanceForm
      key={row.id}
      row={row}
      onClose={onClose}
      supabaseConfigured={supabaseConfigured}
    />
  );
}

function EditAttendanceForm({
  row,
  onClose,
  supabaseConfigured,
}: {
  row: TimelogTableRow;
  onClose: () => void;
  supabaseConfigured: boolean;
}) {
  const titleId = useId();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const [date, setDate] = useState(() => row.dateRaw ?? "");
  const [timeIn, setTimeIn] = useState(() => pgTimeToInputValue(row.timeInRaw));
  const [timeOut, setTimeOut] = useState(() =>
    pgTimeToInputValue(row.timeOutRaw),
  );
  const [breakMin, setBreakMin] = useState(() => row.breakMinutes ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, []);

  const handleBackdrop = useCallback(() => {
    if (saving) return;
    onClose();
  }, [saving, onClose]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!supabaseConfigured) return;
      setSaving(true);
      setError(null);
      const result = await updateAttendance({
        id: row.id,
        date,
        timeIn,
        timeOut: timeOut.trim() === "" ? "" : timeOut,
        breakDurationMinutes: Number.isFinite(breakMin) ? breakMin : 0,
      });
      setSaving(false);
      if (result.ok) {
        onClose();
        window.dispatchEvent(new CustomEvent("internlog-attendance-published"));
      } else {
        setError(result.error);
      }
    },
    [row.id, supabaseConfigured, date, timeIn, timeOut, breakMin, onClose],
  );

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="pointer-events-auto absolute inset-0 cursor-pointer bg-black/60"
        aria-label="Close"
        onClick={handleBackdrop}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="pointer-events-auto relative z-10 w-full max-w-md rounded-2xl border border-(--card-border) bg-(--card) p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id={titleId} className="text-lg font-semibold text-foreground">
          Edit attendance
        </h3>
        <p className="mt-2 text-sm text-(--muted)">
          Update this row in the <code className="font-mono text-foreground">attendance</code>{" "}
          table. Leave clock-out empty for a partial day (no time out yet).
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="edit-att-date"
              className="text-[10px] font-semibold uppercase tracking-wider text-(--muted)"
            >
              Date
            </label>
            <input
              id="edit-att-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-(--card-border) bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-att-in"
                className="text-[10px] font-semibold uppercase tracking-wider text-(--muted)"
              >
                Clock in
              </label>
              <input
                id="edit-att-in"
                type="time"
                step={1}
                required
                value={timeIn}
                onChange={(e) => setTimeIn(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-(--card-border) bg-background px-3 py-2 font-mono text-sm text-foreground tabular-nums"
              />
            </div>
            <div>
              <label
                htmlFor="edit-att-out"
                className="text-[10px] font-semibold uppercase tracking-wider text-(--muted)"
              >
                Clock out
              </label>
              <input
                id="edit-att-out"
                type="time"
                step={1}
                value={timeOut}
                onChange={(e) => setTimeOut(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-(--card-border) bg-background px-3 py-2 font-mono text-sm text-foreground tabular-nums"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="edit-att-break"
              className="text-[10px] font-semibold uppercase tracking-wider text-(--muted)"
            >
              Break (minutes)
            </label>
            <input
              id="edit-att-break"
              type="number"
              min={0}
              max={24 * 60}
              value={breakMin}
              onChange={(e) => setBreakMin(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-(--card-border) bg-background px-3 py-2 font-mono text-sm text-foreground tabular-nums"
            />
          </div>

          {!supabaseConfigured ? (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Configure Supabase env vars to save changes.
            </p>
          ) : null}
          {error ? (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              ref={closeBtnRef}
              type="button"
              className="cursor-pointer rounded-lg border border-(--card-border) bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-background/90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={saving}
              onClick={handleBackdrop}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !supabaseConfigured}
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-(--accent) px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-950"
            >
              {saving ? (
                "Saving…"
              ) : (
                <>
                  <Icon icon="mdi:content-save-outline" className="h-5 w-5" aria-hidden />
                  Save changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
