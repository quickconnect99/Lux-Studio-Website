alter table public.site_settings
  drop column if exists seo_og_image;

notify pgrst, 'reload schema';
