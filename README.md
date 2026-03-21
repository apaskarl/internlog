# InternLog

Internship time tracking and monthly reflections — [Next.js](https://nextjs.org) App Router, Tailwind CSS, Auth.js (credentials), Drizzle + SQLite for future data.

## Setup

### 1. Environment

Copy [`.env.example`](.env.example) to `.env.local` and set:

| Variable | Description |
| -------- | ----------- |
| `AUTH_SECRET` | Random string (e.g. `openssl rand -hex 32`). |
| `AUTH_ALLOWED_EMAIL` | Only this email may sign in. |
| `AUTH_PASSWORD_HASH_B64` | Base64 of your bcrypt hash (see below — **not** the raw `$2a$…` string). |
| `AUTH_URL` | App URL (e.g. `http://localhost:3000`). |
| `DATABASE_URL` | SQLite path, default `file:./data/internlog.db`. |

Generate a password hash:

```bash
node scripts/hash-password.cjs "your-password"
```

Paste the printed `AUTH_PASSWORD_HASH_B64=…` line into `.env`. Next.js expands `$` in env files, so a raw bcrypt hash in `AUTH_PASSWORD_HASH` is broken; the script outputs base64 to avoid that.

### 2. Database (optional for auth)

Auth uses **JWT sessions** — SQLite is for future internship tables. Create the DB file and `app_meta` table:

```bash
mkdir data
npm run db:push
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You will be redirected to `/login` until you sign in.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run db:push` — apply Drizzle schema to SQLite
- `npm run db:studio` — Drizzle Studio (inspect DB)

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Auth.js](https://authjs.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
