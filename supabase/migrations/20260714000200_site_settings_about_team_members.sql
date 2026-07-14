alter table public.site_settings
  add column if not exists about_team_members jsonb not null default '[]'::jsonb;

update public.site_settings
set about_team_members = jsonb_build_array(
  jsonb_build_object(
    'name', 'Nico Hagelberger',
    'title', 'Creative Partner',
    'position', 'Production & Client Direction',
    'description', 'Nico shapes the project brief, keeps communication clear, and translates campaign goals into shoot priorities, deliverables, and rollout-ready assets.',
    'image', coalesce(about_team_images[1], '/images/demo-car-02.jpg')
  ),
  jsonb_build_object(
    'name', 'Benjamin Reuteler',
    'title', 'Creative Partner',
    'position', 'Film & Visual Direction',
    'description', 'Benjamin leads framing, pacing, and visual consistency on set, making sure each film and still set carries the same controlled studio language.',
    'image', coalesce(about_team_images[2], '/images/demo-car-03.jpg')
  )
)
where about_team_members = '[]'::jsonb;

notify pgrst, 'reload schema';
