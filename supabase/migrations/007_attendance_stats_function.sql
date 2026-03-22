-- Function to get aggregated attendance stats without fetching all rows.
-- Net work = (time_out - time_in) - break_duration, in milliseconds.

create or replace function public.get_attendance_stats(p_week_start date default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_week_start date;
  v_week_end date;
  v_result jsonb;
  v_total_net_ms bigint;
  v_days_worked bigint;
  v_week_buckets jsonb;
begin
  -- Default to current week's Monday (ISO week start)
  if p_week_start is null then
    v_week_start := date_trunc('week', current_date)::date;
  else
    v_week_start := p_week_start;
  end if;
  v_week_end := v_week_start + interval '6 days';

  -- Career totals: total_net_ms, days_worked
  select
    coalesce(sum(
      case
        when a.time_out is not null and a.time_in is not null then
          greatest(0, extract(epoch from (a.time_out - a.time_in)) * 1000 - coalesce(a.break_duration, 0) * 60000)
        else 0
      end
    ), 0)::bigint,
    count(distinct a.date)::bigint
  into v_total_net_ms, v_days_worked
  from attendance a
  where a.date is not null;

  -- Week buckets: Mon-Sun net ms for the given week
  select jsonb_agg(bucket order by d)
  into v_week_buckets
  from (
    select d,
      jsonb_build_object(
        'day', (array['Mon','Tue','Wed','Thu','Fri','Sat','Sun'])[extract(isodow from d)::int],
        'net_ms', coalesce(x.net_ms, 0)::bigint
      ) as bucket
    from generate_series(v_week_start, v_week_end, '1 day'::interval) d
    left join lateral (
      select sum(
        greatest(0, extract(epoch from (a.time_out - a.time_in)) * 1000 - coalesce(a.break_duration, 0) * 60000)
      )::bigint as net_ms
      from attendance a
      where a.date = d::date
        and a.time_out is not null
        and a.time_in is not null
    ) x on true
  ) sub;

  v_result := jsonb_build_object(
    'total_net_ms', v_total_net_ms,
    'days_worked', v_days_worked,
    'week_buckets', coalesce(v_week_buckets, '[]'::jsonb)
  );
  return v_result;
end;
$$;

comment on function public.get_attendance_stats(date) is 'Returns aggregated career and weekly stats without fetching all rows.';

grant execute on function public.get_attendance_stats(date) to anon, authenticated;
