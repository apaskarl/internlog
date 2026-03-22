-- `id` is `bigint generated always as identity` (see migration 002).
-- No manual default needed: omit `id` on INSERT and Postgres assigns the next value.
-- If you still see "null value in column id", re-run migration 002’s CREATE TABLE block
-- or align your table with: id bigint generated always as identity primary key

notify pgrst, 'reload schema';
