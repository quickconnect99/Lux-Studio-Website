update public.site_settings
set contact_phone = ''
where contact_phone = '+41 00 000 00 00';

update public.site_settings
set social_links = '[{"label":"Instagram","href":"https://www.instagram.com/"}]'::jsonb
where social_links = (
  '[{"label":"Instagram","href":"https://instagram.com"},' ||
  '{"label":"YouTube","href":"https://youtube.com"},' ||
  '{"label":"Vimeo","href":"https://vimeo.com"}]'
)::jsonb;
