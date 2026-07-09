alter table public.site_settings
  add column if not exists selected_frames text[] not null default '{}';

update public.site_settings
set services = (
  select coalesce(jsonb_agg(service), '[]'::jsonb)
  from jsonb_array_elements(services) as service
  where lower(coalesce(service->>'title', '')) <> 'motion direction'
)
where services is not null;

notify pgrst, 'reload schema';
