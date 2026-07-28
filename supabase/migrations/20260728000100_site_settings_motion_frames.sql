alter table public.site_settings
  add column if not exists motion_frames text[] not null default '{}';

notify pgrst, 'reload schema';
