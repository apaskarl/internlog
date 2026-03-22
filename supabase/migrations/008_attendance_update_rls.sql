-- Allow updating attendance rows (anon + authenticated), matching insert access.
-- Without this, UPDATE succeeds with 0 rows affected under RLS.

drop policy if exists "Allow anon update on attendance" on public.attendance;
drop policy if exists "Allow authenticated update on attendance" on public.attendance;

create policy "Allow anon update on attendance"
  on public.attendance
  for update
  to anon
  using (true)
  with check (true);

create policy "Allow authenticated update on attendance"
  on public.attendance
  for update
  to authenticated
  using (true)
  with check (true);

grant update on public.attendance to anon, authenticated;

notify pgrst, 'reload schema';
