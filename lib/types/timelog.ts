export type TimelogTableRow = {
  id: string;
  /** `YYYY-MM-DD` from Supabase `date`, for stats. */
  dateKey: string | null;
  /** Net work in ms when clock-out exists; otherwise `0`. */
  netWorkMs: number;
  dayLabel: string;
  clockIn: string;
  clockOut: string;
  breakTime: string;
  duration: string;
  netDuration: string;
  status: "complete" | "partial";
  notes: string;
};

/** Columns from Supabase `public.attendance` (see `ATTENDANCE_SELECT`). */
export type AttendanceDbRow = {
  id: string | number;
  date: string | null;
  time_in: string | null;
  time_out: string | null;
  break_duration?: number | string | null;
};
