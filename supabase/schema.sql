create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  business text not null default 'Car',
  title text not null,
  slug text not null unique,
  short_description text not null,
  full_description text not null,
  category text not null,
  car_model text not null,
  location text not null,
  year integer not null,
  cover_image text not null,
  gallery_images text[] not null default '{}',
  gallery_captions text[] not null default '{}',
  video_url text,
  uploaded_video text,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  behind_the_scenes text
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  brief text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id text primary key,
  brand_name text not null,
  brand_mark text not null,
  brand_strapline text not null,
  contact_email text not null,
  contact_phone text not null,
  contact_city text not null,
  social_links jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.projects
add column if not exists gallery_captions text[] not null default '{}';

alter table public.projects
add column if not exists business text not null default 'Car';

alter table public.inquiries
add column if not exists service_type text;

alter table public.projects enable row level security;
alter table public.inquiries enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects"
on public.projects
for select
using (published = true);

drop policy if exists "Authenticated users can manage projects" on public.projects;
create policy "Authenticated users can manage projects"
on public.projects
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Anyone can create inquiries" on public.inquiries;
drop policy if exists "Authenticated users can read inquiries" on public.inquiries;
create policy "Authenticated users can read inquiries"
on public.inquiries
for select
using (auth.role() = 'authenticated');

-- Public inserts are intentionally disabled.
-- Inquiry submissions should go through the server route using the
-- SUPABASE_SERVICE_ROLE_KEY so spam protection and rate limiting can run
-- before data is written to the database.

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings
for select
using (true);

drop policy if exists "Authenticated users can manage site settings" on public.site_settings;
create policy "Authenticated users can manage site settings"
on public.site_settings
for all
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create index if not exists projects_created_at_idx on public.projects (created_at desc);
create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);

insert into public.site_settings (
  id,
  brand_name,
  brand_mark,
  brand_strapline,
  contact_email,
  contact_phone,
  contact_city,
  social_links
)
values (
  'global',
  'Northline Motion',
  'N/M',
  'Automotive films, stills, and campaign visuals built for launch moments.',
  'hello@northlinemotion.studio',
  '+41 00 000 00 00',
  'Zurich / Milan / Monaco',
  '[{"label":"Instagram","href":"https://instagram.com"},{"label":"YouTube","href":"https://youtube.com"},{"label":"Vimeo","href":"https://vimeo.com"}]'::jsonb
)
on conflict (id) do nothing;

-- ── Site settings: CMS content columns ─────────────────────────────────────
-- Run these once against an existing database. New installs get the columns
-- from the CREATE TABLE above after you add them there.

alter table public.site_settings
  add column if not exists seo_title        text,
  add column if not exists seo_description  text,
  add column if not exists seo_og_image     text,
  add column if not exists hero_eyebrow     text,
  add column if not exists hero_headline_lead  text,
  add column if not exists hero_headline_trail text,
  add column if not exists hero_copy        text,
  add column if not exists hero_video_url   text,
  add column if not exists about_founder_note text,
  add column if not exists about_positioning  text,
  add column if not exists about_values     jsonb not null default '[]'::jsonb,
  add column if not exists services         jsonb not null default '[]'::jsonb;

-- Storage setup:
-- 1. Create a public bucket named `projects`.
-- 2. Grant authenticated users upload/update/delete access to that bucket.
-- 3. Store cover images in `covers/`, gallery stills in `gallery/`, and videos in `videos/`.
