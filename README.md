# InternLog

Internship time tracking and monthly reflections — [Next.js](https://nextjs.org) App Router, Tailwind CSS, Auth.js (credentials), [Supabase](https://supabase.com) (Postgres via `@supabase/supabase-js`).

## Setup

### 1. Environment

Copy [`.env.example`](.env.example) to `.env` (or `.env.local`) and set:

| Variable | Description |
| -------- | ----------- |
| `AUTH_SECRET` | Random string (e.g. `openssl rand -hex 32`). |
| `AUTH_ALLOWED_EMAIL` | Only this email may sign in. |
| `AUTH_PASSWORD_HASH_B64` | Base64 of your bcrypt hash (see below — **not** the raw `$2a$…` string). |
| `AUTH_URL` | App URL (e.g. `http://localhost:3000`). |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (Settings → API). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional, server-only; bypasses RLS — do not expose to the client. |

Generate a password hash:

```bash
node scripts/hash-password.cjs "your-password"
```

Paste the printed `AUTH_PASSWORD_HASH_B64=…` line into `.env`. Next.js expands `$` in env files, so a raw bcrypt hash in `AUTH_PASSWORD_HASH` is broken; the script outputs base64 to avoid that.

### 2. Supabase

Point env keys at the project that contains **`public.attendance`** (`id`, `date`, `time_in`, `time_out`, `break_duration`). If the anon key cannot read rows, run [`supabase/migrations/002_attendance_rls.sql`](supabase/migrations/002_attendance_rls.sql). Details: [`supabase/README.md`](supabase/README.md).

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login` until you sign in.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Auth.js](https://authjs.dev/)
- [Supabase Docs](https://supabase.com/docs)
