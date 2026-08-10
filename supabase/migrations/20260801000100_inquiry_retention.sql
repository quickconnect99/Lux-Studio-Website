-- Deletes expired inquiry records through a service-role-only function. The
-- application invokes this daily from the authenticated retention cron route.
create or replace function public.delete_expired_inquiries(
  p_retention_days integer
)
returns bigint
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  deleted_count bigint;
begin
  if p_retention_days < 30 or p_retention_days > 3650 then
    raise exception 'Retention days must be between 30 and 3650.';
  end if;

  with deleted as (
    delete from public.inquiries
    where created_at < now() - make_interval(days => p_retention_days)
    returning 1
  )
  select count(*)::bigint into deleted_count from deleted;

  return deleted_count;
end;
$$;

revoke all on function public.delete_expired_inquiries(integer)
from public, anon, authenticated;
grant execute on function public.delete_expired_inquiries(integer)
to service_role;

notify pgrst, 'reload schema';
