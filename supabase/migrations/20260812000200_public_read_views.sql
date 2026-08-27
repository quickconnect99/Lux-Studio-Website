-- Introduces explicit, security-invoker views for the two public read paths
-- (published projects, site settings). `security_invoker` means the view
-- still evaluates through the querying role's own RLS policies on the base
-- table — it narrows which *columns* are exposed, it does not change which
-- *rows* are visible. The existing "Public can read published projects" /
-- "Public can read site settings" policies on the base tables keep doing
-- that job unchanged.
--
-- This is the first step of the staged rollout described in
-- docs/database-operations.md ("Future public-data boundary"): introduce the
-- views and move application reads onto them. Revoking base-table SELECT
-- from anon is a deliberately separate, later step and is NOT part of this
-- migration.

create or replace view public.projects_public
with (security_invoker = true) as
select
  id,
  business,
  title,
  slug,
  short_description,
  full_description,
  category,
  car_model,
  location,
  year,
  cover_image,
  gallery_images,
  gallery_captions,
  gallery_items,
  video_url,
  uploaded_video,
  featured,
  published,
  created_at,
  updated_at,
  behind_the_scenes
from public.projects;

grant select on public.projects_public to anon, authenticated;

create or replace view public.site_settings_public
with (security_invoker = true) as
select
  id,
  updated_at,
  brand_name,
  brand_mark,
  brand_strapline,
  contact_email,
  contact_phone,
  contact_city,
  social_links,
  seo_title,
  seo_description,
  hero_eyebrow,
  hero_headline_lead,
  hero_headline_trail,
  hero_copy,
  hero_video_url,
  about_founder_note,
  about_positioning,
  about_team_images,
  about_team_members,
  about_values,
  services,
  selected_frames,
  motion_frames,
  navigation_visibility,
  site_copy
from public.site_settings;

grant select on public.site_settings_public to anon, authenticated;

notify pgrst, 'reload schema';
