/**
 * `public.attendance` — id, date, time_in, time_out, break_duration
 * (`time_in` / `time_out` are PostgreSQL `time`; PostgREST returns "HH:MM:SS").
 */
export const ATTENDANCE_TABLE = "attendance" as const;

export const ATTENDANCE_SELECT =
  "id, date, time_in, time_out, break_duration" as const;
