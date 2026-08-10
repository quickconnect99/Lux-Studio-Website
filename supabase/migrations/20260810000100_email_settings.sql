create table if not exists public.email_settings (
  id text primary key default 'global',
  smtp_host text,
  smtp_port integer,
  smtp_secure boolean not null default false,
  smtp_user text,
  smtp_password text,
  inquiry_email_to text,
  inquiry_email_from text,
  verified_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.email_settings enable row level security;

-- This table holds SMTP credentials for inquiry notifications. It is
-- intentionally not exposed to anon/authenticated clients (unlike
-- site_settings, which is public-readable): only the service-role-only
-- /api/admin/email-settings route and the server-only email sender read
-- or write it.
--
-- verified_at is set only by a successful "send test email" from the admin
-- panel, and cleared on every save, so the panel can show "not working yet"
-- until the current configuration has actually been proven to send.
revoke all on table public.email_settings from anon, authenticated;
grant select, insert, update on table public.email_settings to service_role;

drop trigger if exists email_settings_set_updated_at on public.email_settings;
create trigger email_settings_set_updated_at
before update on public.email_settings
for each row execute function public.set_updated_at();

insert into public.email_settings (id)
values ('global')
on conflict (id) do nothing;

notify pgrst, 'reload schema';
