import { OverviewClient } from "./overview-client";
import { getAttendanceRowsForTimelog } from "@/lib/get-attendance-rows";
import { mapAttendanceToTimelogRows } from "@/lib/timelog-map";

export default async function OverviewPage() {
  const { rows, error } = await getAttendanceRowsForTimelog();
  const tableRows = mapAttendanceToTimelogRows(rows);

  return (
    <OverviewClient initialRows={tableRows} fetchError={error} />
  );
}
