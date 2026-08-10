alter table public.inquiries
add column if not exists notification_status text;

update public.inquiries
set notification_status = 'skipped'
where notification_status is null;

alter table public.inquiries
alter column notification_status set default 'pending',
alter column notification_status set not null;

alter table public.inquiries
add column if not exists notification_attempts integer not null default 0,
add column if not exists notification_last_attempt_at timestamptz,
add column if not exists notification_sent_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.inquiries'::regclass
      and conname = 'inquiries_notification_status_check'
  ) then
    alter table public.inquiries
      add constraint inquiries_notification_status_check
      check (
        notification_status in ('pending', 'sent', 'failed', 'skipped')
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.inquiries'::regclass
      and conname = 'inquiries_notification_attempts_check'
  ) then
    alter table public.inquiries
      add constraint inquiries_notification_attempts_check
      check (notification_attempts >= 0);
  end if;
end;
$$;

create index if not exists inquiries_notification_retry_idx
on public.inquiries (notification_last_attempt_at, created_at)
where notification_status in ('pending', 'failed');

create or replace function public.claim_inquiry_notifications(
  p_batch_size integer default 20,
  p_max_attempts integer default 5
)
returns table (
  inquiry_id uuid,
  name text,
  email text,
  company text,
  service_type text,
  brief text,
  notification_attempts integer
)
language plpgsql
volatile
security definer
set search_path = public
as $$
begin
  if p_batch_size < 1 or p_batch_size > 100 then
    raise exception 'Batch size must be between 1 and 100.';
  end if;

  if p_max_attempts < 1 or p_max_attempts > 20 then
    raise exception 'Maximum attempts must be between 1 and 20.';
  end if;

  return query
  with candidates as (
    select i.id
    from public.inquiries as i
    where i.notification_status in ('pending', 'failed')
      and i.notification_attempts < p_max_attempts
      and (
        i.notification_last_attempt_at is null
        or i.notification_last_attempt_at < now() - interval '5 minutes'
      )
    order by i.created_at
    for update skip locked
    limit p_batch_size
  )
  update public.inquiries as i
  set
    notification_status = 'pending',
    notification_attempts = i.notification_attempts + 1,
    notification_last_attempt_at = now()
  from candidates
  where i.id = candidates.id
  returning
    i.id,
    i.name,
    i.email,
    i.company,
    i.service_type,
    i.brief,
    i.notification_attempts;
end;
$$;

revoke all on function public.claim_inquiry_notifications(integer, integer)
from public, anon, authenticated;
grant execute on function public.claim_inquiry_notifications(integer, integer)
to service_role;

notify pgrst, 'reload schema';
