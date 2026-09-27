-- Deletes EVERYTHING the LeafClutch-EduNew migrations created (tables, data,
-- functions, storage policy and empty buckets), so the migrations can be re-run.
-- Auth users (your admin login) are kept.
--
-- Safety check: stops without deleting anything unless this is the
-- LeafClutch-EduNew database. Tables such as courses and faqs also exist in the
-- shared edu-website project, and this must never run there.
do $$
begin
  if to_regprocedure('private.setup_content_table(text,boolean)') is null then
    raise exception 'This is not the LeafClutch-EduNew database. Nothing was deleted.';
  end if;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
drop policy if exists "Admins manage site assets" on storage.objects;

drop table if exists
  public.training_gallery, public.training_topics, public.training_objectives, public.training_programs,
  public.site_settings, public.offers, public.testimonials, public.faqs,
  public.course_instructors, public.instructors,
  public.course_installments, public.course_lessons, public.course_modules, public.course_benefits,
  public.courses, public.course_categories, public.profiles
  cascade;

drop function if exists
  public.handle_new_user(), public.is_admin(), public.promote_to_admin(text), public.set_updated_at()
  cascade;
drop schema if exists private cascade;

-- Supabase blocks deleting stored files with SQL. A bucket that still holds
-- files is skipped: empty it in Dashboard → Storage, then run this again.
do $$
declare
  b text;
begin
  foreach b in array array['course-thumbnails', 'course-curriculums', 'instructor-images',
                           'training-images', 'offer-images']
  loop
    begin
      delete from storage.buckets where id = b;
    exception when others then
      raise notice 'Bucket % still has files; empty it in Dashboard → Storage.', b;
    end;
  end loop;
end;
$$;
