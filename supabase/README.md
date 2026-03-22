# Supabase setup (InternLog)

## Table: `public.attendance`

Canonical shape (see [`migrations/002_attendance_rls.sql`](./migrations/002_attendance_rls.sql)):

| Column | Type | Notes |
|--------|------|--------|
| `id` | `bigint` | `generated always as identity` — omit on insert |
| `date` | `date` | |
| `time_in` | `time` | `HH:MM:SS` from the app |
| `time_out` | `time` | |
| `break_duration` | `integer` | minutes, default `0` |

The app selects `id, date, time_in, time_out, break_duration` from [`../lib/supabase/attendance.ts`](../lib/supabase/attendance.ts).

### Fresh database

Apply migrations in order (`001` → `006` as needed). Migration **`002`** creates `public.attendance` (if missing) and enables **SELECT** for `anon` / `authenticated`. **`003`** adds **INSERT** policies for publishing. **`006`** drops `created_at` if present (the app does not use it).

### You dropped and recreated the table manually

Policies are removed when you `DROP TABLE`. After recreating the table with the same columns as above, run in the **SQL Editor**:

1. [`migrations/002_attendance_rls.sql`](./migrations/002_attendance_rls.sql) — skip the `CREATE TABLE` part if the table already exists; at minimum run from `alter table ... enable row level security` through `notify pgrst`.
2. [`migrations/003_attendance_insert_rls.sql`](./migrations/003_attendance_insert_rls.sql)

Or run the full `002` file: `CREATE TABLE IF NOT EXISTS` is safe if the table already matches.

### `id` / inserts

[`migrations/004_attendance_id_default.sql`](./migrations/004_attendance_id_default.sql) is a no-op reminder: with `generated always as identity`, you do not set `id` on insert.

If you still see **`null value in column "id"`**, the table’s `id` column is not identity — align it with migration `002` or run:

```sql
-- Only if id exists as a plain bigint without identity (adjust to match your DB)
-- Prefer backing up data, then recreate table via 002’s CREATE block.
```

## Row Level Security

If you see **Connected** but **0 rows** while Table Editor shows data, ensure **`002`** ran so the **anon** role can `SELECT`.

## Optional

[`migrations/001_app_meta.sql`](./migrations/001_app_meta.sql) is not required for attendance.

### Changing applied migrations (Supabase CLI)

If **`002` was already applied** before it included `CREATE TABLE`, your remote history may not match this repo. Options: run the new SQL manually in the Dashboard, or use `supabase migration repair` / a new forward-only migration that only `CREATE TABLE IF NOT EXISTS` and fixes policies.
