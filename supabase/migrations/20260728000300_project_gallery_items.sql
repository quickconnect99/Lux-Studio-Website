alter table public.projects
  add column if not exists gallery_items jsonb not null default '[]'::jsonb;

update public.projects
set gallery_items = coalesce(
  (
    select jsonb_agg(
      jsonb_build_object(
        'image', gallery_images[position],
        'caption', coalesce(gallery_captions[position], '')
      )
      order by position
    )
    from generate_subscripts(gallery_images, 1) as position
  ),
  '[]'::jsonb
)
where gallery_items = '[]'::jsonb
  and cardinality(gallery_images) > 0;

notify pgrst, 'reload schema';
