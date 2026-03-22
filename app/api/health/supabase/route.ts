import { auth } from "@/auth";
import {
  ATTENDANCE_SELECT,
  ATTENDANCE_TABLE,
} from "@/lib/supabase/attendance";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/health/supabase — latest 5 rows from attendance (requires session).
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Supabase env not configured",
        hint: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
      },
      { status: 503 },
    );
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from(ATTENDANCE_TABLE)
      .select(ATTENDANCE_SELECT)
      .order("date", { ascending: false })
      .order("id", { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: error.message,
          hint:
            "Confirm table name in lib/supabase/attendance.ts and run 002_attendance_rls.sql if RLS blocks reads.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      table: ATTENDANCE_TABLE,
      rowCount: data?.length ?? 0,
      rows: data,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
