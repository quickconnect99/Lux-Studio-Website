alter table public.site_settings
  add column if not exists about_team_images text[] not null default '{}';

notify pgrst, 'reload schema';
