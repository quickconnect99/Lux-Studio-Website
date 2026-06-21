create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Authenticated users can manage projects" on public.projects;
drop policy if exists "Admins can manage projects" on public.projects;
create policy "Admins can manage projects"
on public.projects
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can read inquiries" on public.inquiries;
drop policy if exists "Admins can read inquiries" on public.inquiries;
create policy "Admins can read inquiries"
on public.inquiries
for select
to authenticated
using (public.is_admin());

drop policy if exists "Authenticated users can manage site settings" on public.site_settings;
drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
on public.site_settings
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Authenticated users can upload project media" on storage.objects;
drop policy if exists "Admins can upload project media" on storage.objects;
create policy "Admins can upload project media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'projects' and public.is_admin());

drop policy if exists "Authenticated users can update project media" on storage.objects;
drop policy if exists "Admins can update project media" on storage.objects;
create policy "Admins can update project media"
on storage.objects
for update
to authenticated
using (bucket_id = 'projects' and public.is_admin())
with check (bucket_id = 'projects' and public.is_admin());

drop policy if exists "Authenticated users can delete project media" on storage.objects;
drop policy if exists "Admins can delete project media" on storage.objects;
create policy "Admins can delete project media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'projects' and public.is_admin());
