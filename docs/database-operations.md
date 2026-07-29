# Supabase database operations

Stand: 29. Juli 2026

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

After auditing existing production rows, validate them explicitly:

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
