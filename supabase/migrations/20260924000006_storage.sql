-- 6/12 · Storage buckets
-- All buckets hold intentionally public assets, so they are public and served
-- by URL. Size and type limits are enforced here and again in the upload code
-- (src/lib/storage.ts). SVG is excluded on purpose: it can carry scripts.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('course-thumbnails',     'course-thumbnails',     true, 2097152,  array['image/jpeg', 'image/png', 'image/webp']),
  ('course-curriculums',    'course-curriculums',    true, 10485760, array['application/pdf']),
  ('instructor-images',     'instructor-images',     true, 2097152,  array['image/jpeg', 'image/png', 'image/webp']),
  ('training-images',       'training-images',       true, 5242880,  array['image/jpeg', 'image/png', 'image/webp']),
  ('offer-images',          'offer-images',          true, 2097152,  array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public buckets need no read policy for URL access; only admins may write.
drop policy if exists "Admins manage site assets" on storage.objects;
create policy "Admins manage site assets" on storage.objects for all to authenticated
  using (
    bucket_id in ('course-thumbnails', 'course-curriculums', 'instructor-images',
                  'training-images', 'offer-images')
    and (select public.is_admin())
  )
  with check (
    bucket_id in ('course-thumbnails', 'course-curriculums', 'instructor-images',
                  'training-images', 'offer-images')
    and (select public.is_admin())
  );
