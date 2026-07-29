-- Enforce the same broad media boundary server-side that the admin applies
-- before upload. Image-specific 15 MiB validation remains in the admin because
-- Supabase bucket limits apply to every object in the bucket.
update storage.buckets
set
  file_size_limit = 524288000,
  allowed_mime_types = array[
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]::text[]
where id = 'projects';
