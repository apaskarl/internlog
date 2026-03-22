import { OverviewClient } from "./overview-client";
import { getAttendanceStats } from "@/lib/get-attendance-stats";

export default async function OverviewPage() {
  const stats = await getAttendanceStats();
  return <OverviewClient stats={stats} />;
}
