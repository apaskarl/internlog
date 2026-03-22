import { TimeLogClient } from "./time-log-client";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export default function TimeLogPage() {
  return (
    <TimeLogClient supabaseConfigured={isSupabaseConfigured()} />
  );
}
