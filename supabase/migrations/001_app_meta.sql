-- Run once per Supabase project: Dashboard → SQL Editor → New query → Paste → Run.
-- If you already ran an older version, this script is safe to run again.

create table if not exists public.app_meta (
  key text primary key,
  value text not null
);

comment on table public.app_meta is 'InternLog app metadata (optional; used to verify Supabase connection).';

insert into public.app_meta (key, value)
values ('internlog_version', '1')
on conflict (key) do nothing;

alter table public.app_meta enable row level security;

drop policy if exists "Allow anon select on app_meta" on public.app_meta;
drop policy if exists "Allow authenticated select on app_meta" on public.app_meta;

create policy "Allow anon select on app_meta"
  on public.app_meta
  for select
  to anon
  using (true);

create policy "Allow authenticated select on app_meta"
  on public.app_meta
  for select
  to authenticated
  using (true);

grant select on public.app_meta to anon, authenticated;

-- Refresh PostgREST so the table appears in the API (fixes "schema cache" errors right after DDL)
notify pgrst, 'reload schema';
