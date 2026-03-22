-- Allow inserting attendance rows (anon + authenticated), matching read access.
-- Run in Supabase SQL Editor after 002; re-run if the table is recreated.

drop policy if exists "Allow anon insert on attendance" on public.attendance;
drop policy if exists "Allow authenticated insert on attendance" on public.attendance;

create policy "Allow anon insert on attendance"
  on public.attendance
  for insert
  to anon
  with check (true);

create policy "Allow authenticated insert on attendance"
  on public.attendance
  for insert
  to authenticated
  with check (true);

grant insert on public.attendance to anon, authenticated;

notify pgrst, 'reload schema';
