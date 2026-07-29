-- Keep legacy gallery columns structurally aligned while gallery_items is
-- gradually becoming the canonical representation. NOT VALID avoids blocking
-- rollout on historical rows; Postgres still enforces these checks for new and
-- updated rows. Validate them separately after auditing production data.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.projects'::regclass
      and conname = 'projects_gallery_shape_check'
  ) then
    alter table public.projects
      add constraint projects_gallery_shape_check
      check (
        case
          when jsonb_typeof(gallery_items) = 'array' then
            cardinality(gallery_images) = cardinality(gallery_captions)
            and cardinality(gallery_images) = jsonb_array_length(gallery_items)
          else false
        end
      ) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.projects'::regclass
      and conname = 'projects_year_check'
  ) then
    alter table public.projects
      add constraint projects_year_check
      check (year between 1900 and 2100) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.inquiries'::regclass
      and conname = 'inquiries_service_type_check'
  ) then
    alter table public.inquiries
      add constraint inquiries_service_type_check
      check (
        service_type is null
        or service_type in (
          'Commercial Shoot',
          'Social Content',
          'Event Coverage',
          'Brand Campaign',
          'Other'
        )
      ) not valid;
  end if;
end;
$$;

notify pgrst, 'reload schema';
