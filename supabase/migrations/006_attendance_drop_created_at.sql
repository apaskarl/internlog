-- App no longer selects `created_at`; optional cleanup if the column still exists.
alter table public.attendance drop column if exists created_at;

notify pgrst, 'reload schema';
