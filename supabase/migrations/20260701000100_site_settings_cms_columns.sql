alter table public.site_settings
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists seo_og_image text,
  add column if not exists hero_eyebrow text,
  add column if not exists hero_headline_lead text,
  add column if not exists hero_headline_trail text,
  add column if not exists hero_copy text,
  add column if not exists hero_video_url text,
  add column if not exists about_founder_note text,
  add column if not exists about_positioning text,
  add column if not exists about_values jsonb not null default '[]'::jsonb,
  add column if not exists services jsonb not null default '[]'::jsonb,
  add column if not exists navigation_visibility jsonb not null default
    '{"home":true,"work":true,"services":true,"about":true,"contact":true}'::jsonb,
  add column if not exists site_copy jsonb not null default '{}'::jsonb;

notify pgrst, 'reload schema';
