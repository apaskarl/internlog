import { TimeLogClient } from "./time-log-client";
import { getAttendanceRowsForTimelog } from "@/lib/get-attendance-rows";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { mapAttendanceToTimelogRows } from "@/lib/timelog-map";

export default async function TimeLogPage() {
  const { rows, error } = await getAttendanceRowsForTimelog();
  const tableRows = mapAttendanceToTimelogRows(rows);

  return (
    <TimeLogClient
      initialRows={tableRows}
      fetchError={error}
      supabaseConfigured={isSupabaseConfigured()}
    />
  );
}
