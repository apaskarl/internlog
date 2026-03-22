import { DashboardShell } from "@/components/dashboard-shell";
import { WorkSessionProvider } from "@/components/work-session-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkSessionProvider>
      <DashboardShell>{children}</DashboardShell>
    </WorkSessionProvider>
  );
}
