/** Bordered blocks so duration labels and values scan as separate units. */

type DurationMetricCardProps = {
  label: string;
  value: string;
  /** Smaller padding for narrow stat cards. */
  compact?: boolean;
  /** De-emphasize the value (e.g. gross span). */
  muted?: boolean;
};

export function DurationMetricCard({
  label,
  value,
  compact = false,
  muted = false,
}: DurationMetricCardProps) {
  return (
    <div
      className={
        compact
          ? "flex min-w-0 flex-col gap-1 rounded-lg border border-(--card-border) bg-background/60 px-2.5 py-2"
          : "flex min-w-0 flex-col gap-1.5 rounded-xl border border-(--card-border) bg-background/60 px-4 py-3 shadow-sm"
      }
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider text-(--muted)">
        {label}
      </span>
      <span
        className={
          (compact ? "text-sm " : "text-lg ") +
          "font-mono font-semibold tabular-nums tracking-wide " +
          (muted ? "text-(--muted)" : "text-foreground")
        }
      >
        {value}
      </span>
    </div>
  );
}

type TimeClockRowProps = {
  label: string;
  value: string;
  /** Date / title text — not monospace. */
  variant?: "time" | "text";
};

export function TimeClockRow({
  label,
  value,
  variant = "time",
}: TimeClockRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-(--card-border) bg-background/50 px-3 py-2.5">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wider text-(--muted)">
        {label}
      </span>
      <span
        className={
          variant === "time"
            ? "min-w-0 text-right font-mono text-sm font-medium tabular-nums tracking-wide text-foreground"
            : "min-w-0 text-right text-sm font-medium text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}
