-- Validates the three `NOT VALID` constraints added by
-- `20260729000200_data_integrity_constraints.sql`. PostgreSQL has already
-- enforced them for every row written since that migration; this step makes
-- Postgres check historical rows too and upgrades each constraint to fully
-- validated.
--
-- Applying this to a fresh (or already-compliant) database always succeeds.
-- Applying it to a linked project with pre-existing violating rows fails the
-- migration instead of silently accepting bad data — repair the reported
-- rows using the audit queries in docs/database-operations.md, then reapply.

alter table public.projects
  validate constraint projects_gallery_shape_check;

alter table public.projects
  validate constraint projects_year_check;

alter table public.inquiries
  validate constraint inquiries_service_type_check;
