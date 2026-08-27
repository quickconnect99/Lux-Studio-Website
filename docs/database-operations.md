# Supabase database operations

Stand: 21. August 2026

## Production migration status

The linked production project is synchronized through migration
`20260812000200` (the full local migration history).

- On 30 July 2026, the existing baseline objects were verified through the
  remote schema linter and core-table inspection. Migration
  `20260601000100` was then marked as applied without executing its SQL.
- `20260729000100_storage_bucket_limits.sql` and
  `20260729000200_data_integrity_constraints.sql` were reviewed in a linked
  dry run and applied successfully.
- On 21 August 2026, following the pre-deployment checklist below,
  `20260801000100_inquiry_retention.sql`,
  `20260801000200_inquiry_notification_outbox.sql`,
  `20260810000100_email_settings.sql`,
  `20260812000100_validate_data_integrity_constraints.sql`, and
  `20260812000200_public_read_views.sql` were applied to the linked
  production project via `supabase db push`. The three integrity
  constraints from `20260729000200` are now fully `VALID` (the audit
  queries below returned zero violating rows before the push).
- The Supabase backup API reports daily physical backups (walg) as of
  21 August 2026; PITR remains disabled. Verify a recent physical backup
  before any future destructive production migration.

## Sources of truth

- `supabase/migrations/` is the executable, ordered database history.
- `20260601000100_baseline_schema.sql` creates the complete base schema for a
  fresh local, CI or staging database.
- `supabase/schema.sql` is the maintained current-state reference. Every schema
  change must update both the reference and a new forward migration.
- Never change the production schema directly through Studio or the SQL editor.

CI applies every migration to a fresh local Postgres instance and then runs the
database linter. The lightweight Node check remains useful for immediate naming
and baseline feedback.

## Existing linked project

The baseline predates migrations already recorded by the current production
project. Do not apply it retroactively and do not use `db push --include-all`
without reviewing the migration history.

After confirming that the linked project already contains the baseline tables,
functions, policies and storage bucket, mark only the baseline version as
already applied:

```text
supabase migration list
supabase migration repair 20260601000100 --status applied
supabase db push --dry-run
```

This migration-history repair is an external release step and is not executed by
the application or CI.

## Pre-deployment checklist

1. Confirm the target is staging or production before every linked command.
2. Verify the current backup and Point-in-Time Recovery status in Supabase.
3. Run `supabase db reset --no-seed` locally.
4. Run `supabase db lint --local --fail-on error`.
5. Review `supabase db push --dry-run`.
6. Apply to staging and exercise project save, Site Settings save, inquiry
   creation and public reads.
7. Apply to production only inside an agreed maintenance/release window.

Any migration containing `drop table`, `drop column`, destructive type changes,
or irreversible data rewrites requires a restorable backup before production.
The existing obsolete sharing-image removal falls into this category.

## Inquiry retention

`INQUIRY_RETENTION_DAYS` defaults to 365 and is constrained to 30-3650
days. The protected `/api/admin/retention` Cron route invokes the
service-role-only `delete_expired_inquiries(...)` function once per day.
Verify each production run through the structured
`inquiry.retention_completed` event and its `deletedCount`.

The retention process deletes database inquiry rows. SMTP delivery and the
recipient mailbox create separate copies; their operational retention must be
configured and approved separately. Never claim database retention also deletes
those copies.

## Inquiry notification outbox

The outbox is stored on `inquiries` through `notification_status`,
`notification_attempts`, `notification_last_attempt_at`, and
`notification_sent_at`. Immediate delivery and Cron retries share the
inquiry UUID as the outgoing message's ID.

`claim_inquiry_notifications(...)` atomically claims at most 20 eligible
rows with `FOR UPDATE SKIP LOCKED`, waits at least five minutes between
claims, and stops after five attempts. The Cron route runs every 15 minutes.
Existing rows are marked `skipped` by the migration so deployment does
not send historical inquiries.

The outbox tracks and retries notification delivery; it is not a general
message queue and does not make the initial API response asynchronous.

## Future public-data boundary

`20260812000200_public_read_views.sql` adds `public.projects_public` and
`public.site_settings_public`: `security_invoker` views that narrow the
exposed columns while still evaluating the base tables' existing RLS
policies (they do not change which rows are visible, only which columns).
`getPublishedProjects`, `getProjectBySlug`, and `getSiteSettings`
(`lib/supabase.ts`) read through these views. Admin reads/writes still go
directly against the base `projects` and `site_settings` tables — this
migration does not touch those code paths or their RLS policies.

Revoking anonymous `SELECT` on the base tables is a deliberately separate,
later step, once the views have been verified against a live/staging
environment. Do not combine that revoke with an untested change.

## Rollback strategy

Production migrations roll forward. Do not edit an already deployed migration.
For a reversible mistake, add a new migration that restores the previous schema
or data representation.

For destructive data loss, stop writes and restore the verified backup or PITR
point before reopening the Admin. Local development may use
`supabase db reset --version ...`; this must never be pointed at production.

## Pending constraint validation

The gallery-shape, project-year and inquiry-service constraints are initially
`NOT VALID`. PostgreSQL enforces them for new and updated rows without blocking
deployment on historical data.

`20260812000100_validate_data_integrity_constraints.sql` already contains the
three `VALIDATE CONSTRAINT` statements below and will fail outright if
production has violating rows — Postgres validates on `db push` itself, so
there is no separate manual validation step. Run the audit selects first
regardless: they tell you which rows to repair before that push, rather than
letting the migration fail after the fact.

```sql
with gallery_audit as (
  select
    id,
    slug,
    cardinality(gallery_images) as image_count,
    cardinality(gallery_captions) as caption_count,
    case
      when jsonb_typeof(gallery_items) = 'array'
      then jsonb_array_length(gallery_items)
    end as item_count
  from public.projects
)
select *
from gallery_audit
where item_count is null
   or image_count <> caption_count
   or image_count <> item_count;

select id, slug, year
from public.projects
where year not between 1900 and 2100;

select id, service_type
from public.inquiries
where service_type is not null
  and service_type not in (
    'Commercial Shoot',
    'Social Content',
    'Event Coverage',
    'Brand Campaign',
    'Other'
  );

alter table public.projects
  validate constraint projects_gallery_shape_check;
alter table public.projects
  validate constraint projects_year_check;
alter table public.inquiries
  validate constraint inquiries_service_type_check;
```

If validation fails, repair the reported historical rows first; do not drop the
constraint to make the release pass.

References:

- https://supabase.com/docs/guides/deployment/database-migrations
- https://supabase.com/docs/guides/local-development/cli-workflows
- https://supabase.com/docs/guides/deployment/ci/testing
- https://github.com/supabase/setup-cli
