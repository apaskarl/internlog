-- `public.attendance`: create first, then RLS (anon/authenticated read).
-- Matches InternLog app: TIME columns, bigint identity id, break_duration in minutes.

create table if not exists public.attendance (
  id bigint generated always as identity primary key,
  date date,
  time_in time,
  break_duration integer not null default 0,
  time_out time
);

comment on table public.attendance is 'Internship attendance rows (published from InternLog).';

alter table public.attendance enable row level security;

drop policy if exists "Allow anon select on attendance" on public.attendance;
drop policy if exists "Allow authenticated select on attendance" on public.attendance;

create policy "Allow anon select on attendance"
  on public.attendance
  for select
  to anon
  using (true);

create policy "Allow authenticated select on attendance"
  on public.attendance
  for select
  to authenticated
  using (true);

grant select on public.attendance to anon, authenticated;

notify pgrst, 'reload schema';
