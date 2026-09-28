-- Leafclutch — complete Supabase setup (generated; do not edit by hand).
--
-- Paste this whole file into the Supabase SQL editor and click Run. It is safe
-- to run again at any time: it creates whatever is missing and brings existing
-- tables up to date. Each part of the seed runs only once per database, so
-- rows you edited or deleted in Supabase or the admin are left alone.
--
-- Generated from supabase/migrations/*.sql and supabase/seed.sql by
-- "npm run db:bundle". Contents: 17 migrations, then the seed.

-- ===========================================================================
-- 20260924000001_auth_and_helpers.sql
-- ===========================================================================

-- 1/10 · Auth, admin role and shared helpers
--
-- Public visitors read published/active content through RLS. Admins write
-- through server actions that run as the signed-in admin, so RLS is enforced
-- on every write too.
--
-- Every migration is safe to run again: on an empty database it creates
-- everything, on an existing one it changes nothing that is already there.
--
-- Create the first admin:
--   1. Supabase Dashboard → Authentication → Users → Add user
--   2. SQL editor: select public.promote_to_admin('you@example.com');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles & admin role
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'student' check (role in ('admin', 'student')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Role is never taken from sign-up metadata (users control that), so the only
-- way to become admin is promote_to_admin(), which only the SQL editor can run.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.promote_to_admin(user_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set role = 'admin' where email = user_email;
  if not found then
    raise exception 'No profile found for %', user_email;
  end if;
end;
$$;

revoke execute on function public.promote_to_admin(text) from public, anon, authenticated;

alter table public.profiles enable row level security;
grant select on public.profiles to authenticated;
-- Read-only for users: no update policy, so nobody can change their own role.
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Content-table setup, used by the following migrations
-- ---------------------------------------------------------------------------
-- The `private` schema is not exposed through the API.

create schema if not exists private;

-- For a content table: enable RLS, let admins do everything, grant table
-- access (RLS still decides which rows), and keep updated_at current.
-- Public read policies are written per table, next to the table.
create or replace procedure private.setup_content_table(t text, has_updated_at boolean default true)
language plpgsql
set search_path = ''
as $$
begin
  execute format('alter table public.%I enable row level security', t);
  execute format('drop policy if exists "Admins manage %1$s" on public.%1$I', t);
  execute format(
    'create policy "Admins manage %1$s" on public.%1$I for all to authenticated
       using ((select public.is_admin())) with check ((select public.is_admin()))', t);
  execute format('grant select on public.%I to anon, authenticated', t);
  execute format('grant insert, update, delete on public.%I to authenticated', t);
  if has_updated_at then
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t);
  end if;
end;
$$;

revoke all on procedure private.setup_content_table(text, boolean) from public;

-- ===========================================================================
-- 20260924000002_courses.sql
-- ===========================================================================

-- 2/10 · Courses: categories, courses, benefits, curriculum, instalments

create table if not exists public.course_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  image_url text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  -- restrict: a category can't be deleted while courses still use it
  category_id uuid not null references public.course_categories (id) on delete restrict,
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  short_description text not null,
  description text not null default '',
  thumbnail text,
  actual_price numeric(10, 2) not null check (actual_price >= 0),
  discount_price numeric(10, 2)
    check (discount_price is null or (discount_price >= 0 and discount_price < actual_price)),
  duration text not null,
  learning_mode text not null default 'online' check (learning_mode in ('online', 'physical', 'hybrid')),
  curriculum_pdf_url text,
  udemy_url text check (udemy_url is null or udemy_url ~ '^https://'),
  certificate_available boolean not null default true,
  is_featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- "What You Will Get"
create table if not exists public.course_benefits (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules (id) on delete cascade,
  title text not null,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Instalment plans are shown in the existing Payment Options section.
create table if not exists public.course_installments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  percentage numeric(5, 2) not null check (percentage > 0 and percentage <= 100),
  description text not null default '',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists courses_category_id_idx on public.courses (category_id);
create index if not exists courses_status_idx on public.courses (status);
create index if not exists course_benefits_course_id_idx on public.course_benefits (course_id);
create index if not exists course_modules_course_id_idx on public.course_modules (course_id);
create index if not exists course_lessons_module_id_idx on public.course_lessons (module_id);
create index if not exists course_installments_course_id_idx on public.course_installments (course_id);

call private.setup_content_table('course_categories');
call private.setup_content_table('courses');
call private.setup_content_table('course_benefits');
call private.setup_content_table('course_modules');
call private.setup_content_table('course_lessons');
call private.setup_content_table('course_installments');

drop policy if exists "Public reads active categories" on public.course_categories;
create policy "Public reads active categories" on public.course_categories for select
  using (is_active);

drop policy if exists "Public reads published courses" on public.courses;
create policy "Public reads published courses" on public.courses for select
  using (status = 'published');

-- Course children are visible exactly when their course is.
drop policy if exists "Public reads benefits of published courses" on public.course_benefits;
create policy "Public reads benefits of published courses" on public.course_benefits for select
  using (exists (select 1 from public.courses c where c.id = course_id and c.status = 'published'));

drop policy if exists "Public reads modules of published courses" on public.course_modules;
create policy "Public reads modules of published courses" on public.course_modules for select
  using (exists (select 1 from public.courses c where c.id = course_id and c.status = 'published'));

drop policy if exists "Public reads lessons of published courses" on public.course_lessons;
create policy "Public reads lessons of published courses" on public.course_lessons for select
  using (exists (
    select 1 from public.course_modules m
    join public.courses c on c.id = m.course_id
    where m.id = module_id and c.status = 'published'
  ));

drop policy if exists "Public reads installments of published courses" on public.course_installments;
create policy "Public reads installments of published courses" on public.course_installments for select
  using (exists (select 1 from public.courses c where c.id = course_id and c.status = 'published'));

-- ===========================================================================
-- 20260924000003_instructors.sql
-- ===========================================================================

-- 3/10 · Instructors (one instructor can teach many courses)

create table if not exists public.instructors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  designation text not null,
  bio text not null default '',
  image text,
  linkedin_url text check (linkedin_url is null or linkedin_url ~ '^https://'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_instructors (
  course_id uuid not null references public.courses (id) on delete cascade,
  instructor_id uuid not null references public.instructors (id) on delete cascade,
  display_order integer not null default 0,
  primary key (course_id, instructor_id)
);

create index if not exists course_instructors_instructor_id_idx on public.course_instructors (instructor_id);

call private.setup_content_table('instructors');
call private.setup_content_table('course_instructors', has_updated_at => false);

drop policy if exists "Public reads active instructors" on public.instructors;
create policy "Public reads active instructors" on public.instructors for select
  using (is_active);

drop policy if exists "Public reads course instructors" on public.course_instructors;
create policy "Public reads course instructors" on public.course_instructors for select
  using (exists (select 1 from public.courses c where c.id = course_id and c.status = 'published'));

-- ===========================================================================
-- 20260924000004_site_content.sql
-- ===========================================================================

-- 4/12 · Shared content: FAQs, testimonials, offers, site settings

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  category text not null default 'general'
    check (category in ('general', 'course', 'enrollment', 'payment', 'certificate')),
  -- null = site-wide FAQ
  course_id uuid references public.courses (id) on delete cascade,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One shared table for all testimonials.
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image text,
  course_id uuid references public.courses (id) on delete set null,
  review text not null,
  rating smallint check (rating between 1 and 5),
  is_featured boolean not null default false,
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  -- optional: an offer may promote a course without copying its details
  course_id uuid references public.courses (id) on delete set null,
  title text not null,
  description text not null default '',
  thumbnail text,
  price numeric(10, 2) check (price is null or price >= 0),
  discount_price numeric(10, 2) check (discount_price is null or discount_price >= 0),
  is_active boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Global settings. Exactly one row (id = 1).
create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  email text,
  phone text,
  -- international format, digits only, e.g. 9779800000000
  whatsapp text check (whatsapp is null or whatsapp ~ '^[0-9]{8,15}$'),
  address text,
  -- [{ "label": "Facebook", "href": "https://…" }]
  social_links jsonb not null default '[]'::jsonb check (jsonb_typeof(social_links) = 'array'),
  updated_at timestamptz not null default now()
);

create index if not exists faqs_course_id_idx on public.faqs (course_id);
create index if not exists testimonials_course_id_idx on public.testimonials (course_id);
create index if not exists offers_course_id_idx on public.offers (course_id);

call private.setup_content_table('faqs');
call private.setup_content_table('testimonials');
call private.setup_content_table('offers');
call private.setup_content_table('site_settings');

drop policy if exists "Public reads active faqs" on public.faqs;
create policy "Public reads active faqs" on public.faqs for select
  using (is_active);

drop policy if exists "Public reads active testimonials" on public.testimonials;
create policy "Public reads active testimonials" on public.testimonials for select
  using (is_active);

drop policy if exists "Public reads active offers" on public.offers;
create policy "Public reads active offers" on public.offers for select
  using (is_active);

drop policy if exists "Public reads site settings" on public.site_settings;
create policy "Public reads site settings" on public.site_settings for select
  using (true);

-- ===========================================================================
-- 20260924000005_training.sql
-- ===========================================================================

-- 5/12 · Corporate / academic / government training (one table for all three)
-- Inquiries go to WhatsApp and are not stored.

create table if not exists public.training_programs (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('corporate', 'academic', 'government')),
  title text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  short_description text not null,
  description text not null default '',
  thumbnail text,
  duration text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_objectives (
  id uuid primary key default gen_random_uuid(),
  training_program_id uuid not null references public.training_programs (id) on delete cascade,
  title text not null,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_topics (
  id uuid primary key default gen_random_uuid(),
  training_program_id uuid not null references public.training_programs (id) on delete cascade,
  title text not null,
  description text,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_gallery (
  id uuid primary key default gen_random_uuid(),
  training_program_id uuid not null references public.training_programs (id) on delete cascade,
  title text,
  description text,
  image_url text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists training_programs_type_status_idx on public.training_programs (type, status);
create index if not exists training_objectives_program_id_idx on public.training_objectives (training_program_id);
create index if not exists training_topics_program_id_idx on public.training_topics (training_program_id);
create index if not exists training_gallery_program_id_idx on public.training_gallery (training_program_id);

call private.setup_content_table('training_programs');
call private.setup_content_table('training_objectives');
call private.setup_content_table('training_topics');
call private.setup_content_table('training_gallery');

drop policy if exists "Public reads published training" on public.training_programs;
create policy "Public reads published training" on public.training_programs for select
  using (status = 'published');

drop policy if exists "Public reads objectives of published training" on public.training_objectives;
create policy "Public reads objectives of published training" on public.training_objectives for select
  using (exists (select 1 from public.training_programs p where p.id = training_program_id and p.status = 'published'));

drop policy if exists "Public reads topics of published training" on public.training_topics;
create policy "Public reads topics of published training" on public.training_topics for select
  using (exists (select 1 from public.training_programs p where p.id = training_program_id and p.status = 'published'));

drop policy if exists "Public reads gallery of published training" on public.training_gallery;
create policy "Public reads gallery of published training" on public.training_gallery for select
  using (exists (select 1 from public.training_programs p where p.id = training_program_id and p.status = 'published'));

-- ===========================================================================
-- 20260924000006_storage.sql
-- ===========================================================================

-- 6/12 · Storage buckets
-- All buckets hold intentionally public assets, so they are public and served
-- by URL. Size and type limits are enforced here and again in the upload code
-- (src/lib/storage.ts). SVG is excluded on purpose: it can carry scripts.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('course-thumbnails',     'course-thumbnails',     true, 5242880,  array['image/jpeg', 'image/png', 'image/webp']),
  ('course-curriculums',    'course-curriculums',    true, 10485760, array['application/pdf']),
  ('instructor-images',     'instructor-images',     true, 5242880,  array['image/jpeg', 'image/png', 'image/webp']),
  ('training-images',       'training-images',       true, 5242880,  array['image/jpeg', 'image/png', 'image/webp']),
  ('offer-images',          'offer-images',          true, 5242880,  array['image/jpeg', 'image/png', 'image/webp']),
  -- logos and favicon (the favicon may be an .ico file)
  ('site-assets',           'site-assets',           true, 2097152,  array['image/jpeg', 'image/png', 'image/webp', 'image/x-icon'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public buckets need no read policy for URL access; only admins may write.
drop policy if exists "Admins manage site assets" on storage.objects;
create policy "Admins manage site assets" on storage.objects for all to authenticated
  using (
    bucket_id in ('course-thumbnails', 'course-curriculums', 'instructor-images',
                  'training-images', 'offer-images', 'site-assets')
    and (select public.is_admin())
  )
  with check (
    bucket_id in ('course-thumbnails', 'course-curriculums', 'instructor-images',
                  'training-images', 'offer-images', 'site-assets')
    and (select public.is_admin())
  );

-- ===========================================================================
-- 20260924000007_remove_payment_methods.sql
-- ===========================================================================

-- 7/12 · Remove payment methods (feature dropped)
-- Only does something on databases created before payment methods were
-- removed; on a new database every statement below is a no-op.
-- The old "payment-method-images" storage bucket can't be removed with SQL.
-- If it exists, delete it in Dashboard → Storage (nothing can upload to it).

drop table if exists public.course_payment_methods, public.payment_methods cascade;

update public.faqs
set answer = 'We accept eSewa, Khalti, Fonepay and bank transfer. Our team confirms how you will pay after you enroll, and any instalment plan is shown on the course page.'
where question = 'Which payment methods do you accept?'
  and answer = 'We accept eSewa, Khalti, Fonepay and bank transfer. The methods available for each course, and any instalment plan, are listed on the course page.';

-- ===========================================================================
-- 20260924000008_home_stats.sql
-- ===========================================================================

-- 8/12 · Home page stats ("1,000+ Students trained")

create table if not exists public.home_stats (
  id uuid primary key default gen_random_uuid(),
  value text not null,
  label text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

call private.setup_content_table('home_stats');

drop policy if exists "Public reads active home stats" on public.home_stats;
create policy "Public reads active home stats" on public.home_stats for select
  using (is_active);

-- ===========================================================================
-- 20260924000009_about_contact.sql
-- ===========================================================================

-- 9/12 · About page cards and Contact opening hours

-- Contact page opening hours: [{ "days": "Sunday – Friday", "hours": "9:00 AM – 6:00 PM" }]
alter table public.site_settings
  add column if not exists opening_hours jsonb not null default '[]'::jsonb;

alter table public.site_settings drop constraint if exists site_settings_opening_hours_check;
alter table public.site_settings add constraint site_settings_opening_hours_check
  check (jsonb_typeof(opening_hours) = 'array');

-- Page copy stays in code (src/data/about.ts, src/data/contact.ts). Remove the
-- page_content table on databases where an earlier version created it.
drop table if exists public.page_content;

-- About page cards: values, "why learn with us" features and learning steps.
-- `icon` picks one of the icons the design provides.
create table if not exists public.about_items (
  id uuid primary key default gen_random_uuid(),
  section text not null check (section in ('value', 'feature', 'learning_step')),
  icon text not null check (icon in (
    'guidance', 'inclusive', 'quality', 'growth', 'learn', 'practice', 'build', 'grow',
    'practical', 'mentor', 'projects', 'certificate', 'flexible', 'curriculum', 'career'
  )),
  title text not null,
  description text not null default '',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists about_items_section_idx on public.about_items (section, display_order);

call private.setup_content_table('about_items');

drop policy if exists "Public reads active about items" on public.about_items;
create policy "Public reads active about items" on public.about_items for select
  using (is_active);

-- ===========================================================================
-- 20260924000010_training_pages.sql
-- ===========================================================================

-- 10/12 · Training pages (corporate / academic / government)
-- Page copy (hero, why choose us, process, programs, CTA) stays in code:
-- src/data/training/*. The database holds what changes over time: partners,
-- which courses each page offers, and organisation testimonials.

-- Courses offered on each training page, e.g. {corporate,academic}.
alter table public.courses
  add column if not exists training_types text[] not null default '{}';

alter table public.courses drop constraint if exists courses_training_types_check;
alter table public.courses add constraint courses_training_types_check
  check (training_types <@ array['corporate', 'academic', 'government']::text[]);

create index if not exists courses_training_types_idx on public.courses using gin (training_types);

-- Testimonials: student reviews (home page) or organisations (training pages).
alter table public.testimonials
  add column if not exists type text not null default 'student',
  -- Role and organisation, e.g. "HR Manager, Summit Logistics"
  add column if not exists designation text;

alter table public.testimonials drop constraint if exists testimonials_type_check;
alter table public.testimonials add constraint testimonials_type_check
  check (type in ('student', 'corporate', 'academic', 'government'));

-- Partners shown in each training page's logo marquee.
create table if not exists public.training_partners (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('corporate', 'academic', 'government')),
  name text not null,
  logo text,
  website text check (website is null or website ~ '^https://'),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists training_partners_type_idx on public.training_partners (type, display_order);

call private.setup_content_table('training_partners');

drop policy if exists "Public reads active training partners" on public.training_partners;
create policy "Public reads active training partners" on public.training_partners for select
  using (is_active);

-- ===========================================================================
-- 20260924000011_training_page_lists.sql
-- ===========================================================================

-- 11/12 · Training page lists: why-choose-us features, programs, process
-- steps and images. Headings and paragraphs stay in code (src/data/training/*).

-- `icon` is one of the icons the design provides (components/training/training-icons).
create table if not exists public.training_page_items (
  id uuid primary key default gen_random_uuid(),
  -- null = shown on every training page (used for the shared process steps)
  type text check (type in ('corporate', 'academic', 'government')),
  section text not null check (section in ('feature', 'program', 'process_step')),
  icon text check (icon in (
    'Award', 'BarChart3', 'BookOpenCheck', 'Bot', 'BriefcaseBusiness', 'Building2',
    'CalendarClock', 'ChartNoAxesCombined', 'FolderCode', 'GraduationCap', 'Handshake',
    'Landmark', 'Laptop', 'Presentation', 'Rocket', 'Settings2', 'ShieldCheck', 'Sprout',
    'Target', 'UsersRound', 'Workflow', 'Wrench'
  )),
  title text not null,
  description text not null default '',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Features and programs belong to one page and need an icon; steps are numbered instead.
  constraint training_page_items_shape check (
    section = 'process_step' or (type is not null and icon is not null)
  )
);

create index if not exists training_page_items_lookup_idx
  on public.training_page_items (section, type, display_order);

create table if not exists public.training_page_images (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('corporate', 'academic', 'government')),
  -- hero = the hero slider; why_choose_us = the collage (first three are used)
  placement text not null check (placement in ('hero', 'why_choose_us')),
  image_url text not null,
  alt text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists training_page_images_lookup_idx
  on public.training_page_images (type, placement, display_order);

call private.setup_content_table('training_page_items');
call private.setup_content_table('training_page_images');

drop policy if exists "Public reads active training page items" on public.training_page_items;
create policy "Public reads active training page items" on public.training_page_items for select
  using (is_active);

drop policy if exists "Public reads active training page images" on public.training_page_images;
create policy "Public reads active training page images" on public.training_page_images for select
  using (is_active);

-- ===========================================================================
-- 20260924000012_training_page_text.sql
-- ===========================================================================

-- 12/12 · Training page text: headings, descriptions and button labels for the
-- corporate / academic / government pages, one row per page. Button links are
-- set by the site (WhatsApp when a number is configured, otherwise /contact).

create table if not exists public.training_pages (
  type text primary key check (type in ('corporate', 'academic', 'government')),
  hero_eyebrow text not null default '',
  hero_title text not null default '',
  hero_description text not null default '',
  hero_cta_label text not null default '',
  partners_title text not null default '',
  courses_title text not null default '',
  courses_description text not null default '',
  why_title text not null default '',
  why_description text not null default '',
  process_title text not null default '',
  process_description text,
  programs_title text not null default '',
  programs_description text not null default '',
  testimonials_title text not null default '',
  testimonials_description text not null default '',
  cta_title text not null default '',
  cta_description text not null default '',
  cta_label text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

call private.setup_content_table('training_pages');

drop policy if exists "Public reads training pages" on public.training_pages;
create policy "Public reads training pages" on public.training_pages for select
  using (true);

-- ===========================================================================
-- 20260927000000_site_settings_logo_desc.sql
-- ===========================================================================

-- Add site_name, logo_url, footer_logo_url, favicon_url and description to site_settings
alter table public.site_settings
  add column if not exists site_name text,
  add column if not exists logo_url text,
  add column if not exists footer_logo_url text,
  add column if not exists favicon_url text,
  add column if not exists description text;

-- ===========================================================================
-- 20260928000000_course_tools_udemy.sql
-- ===========================================================================

-- 14/14 · Course "Tools covered" and Udemy bonus courses; courses are no
-- longer linked to the training pages.

-- ---------------------------------------------------------------------------
-- Tools covered by a course. (Migration 16 drops the `icon` column again.)
-- ---------------------------------------------------------------------------

create table if not exists public.course_tools (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  name text not null,
  icon text,
  description text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists course_tools_course_id_idx on public.course_tools (course_id, display_order);

-- ---------------------------------------------------------------------------
-- Udemy courses students get free with a course. Content Leafclutch
-- maintains; nothing is fetched from Udemy.
-- ---------------------------------------------------------------------------

create table if not exists public.course_udemy_bonus (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text not null default '',
  image_url text not null,
  instructor text not null,
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  ratings_count integer not null default 0 check (ratings_count >= 0),
  -- as Udemy shows it, e.g. "99h 48m"
  total_hours text not null default '',
  lectures integer not null default 0 check (lectures >= 0),
  level text not null default 'All Levels',
  course_url text not null check (course_url ~ '^https://'),
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists course_udemy_bonus_course_id_idx on public.course_udemy_bonus (course_id, display_order);

call private.setup_content_table('course_tools');
call private.setup_content_table('course_udemy_bonus');

-- Visible when active and the course is published.
drop policy if exists "Public reads tools of published courses" on public.course_tools;
create policy "Public reads tools of published courses" on public.course_tools for select
  using (is_active and exists (select 1 from public.courses c where c.id = course_id and c.status = 'published'));

drop policy if exists "Public reads udemy bonus of published courses" on public.course_udemy_bonus;
create policy "Public reads udemy bonus of published courses" on public.course_udemy_bonus for select
  using (is_active and exists (select 1 from public.courses c where c.id = course_id and c.status = 'published'));

-- ---------------------------------------------------------------------------
-- Courses aren't listed on the corporate / academic / government pages: those
-- pages invite organisations to get in touch instead. Drops the link added in
-- migration 10 (with its check constraint and index).
-- ---------------------------------------------------------------------------

alter table public.courses drop column if exists training_types;

-- ===========================================================================
-- 20260929000000_site_settings_map.sql
-- ===========================================================================

-- 15/15 · Google Maps on the Contact page. The admin pastes Google Maps'
-- "Embed a map" link (Share → Embed a map); the site stores only the link.

alter table public.site_settings
  add column if not exists map_embed_url text;

alter table public.site_settings drop constraint if exists site_settings_map_embed_url_check;
alter table public.site_settings add constraint site_settings_map_embed_url_check
  check (map_embed_url is null or map_embed_url ~ '^https://www\.google\.com/maps/embed\?');

-- ===========================================================================
-- 20260930000000_announcement_tools_cleanup.sql
-- ===========================================================================

-- 16/16 · Site-wide announcement bar; course tools lose their logos; the
-- single "Udemy link" on a course is gone (free Udemy courses are managed in
-- course_udemy_bonus instead).

-- ---------------------------------------------------------------------------
-- A short notice shown above the navbar on every public page, e.g. "Due to
-- Dashain, all physical classes are cancelled until further notice." Empty or
-- null hides the bar.
-- ---------------------------------------------------------------------------

alter table public.site_settings
  add column if not exists announcement text;

alter table public.site_settings drop constraint if exists site_settings_announcement_check;
alter table public.site_settings add constraint site_settings_announcement_check
  check (announcement is null or char_length(announcement) <= 200);

-- ---------------------------------------------------------------------------
-- "Tools covered" shows the tool names only; no logo key.
-- ---------------------------------------------------------------------------

alter table public.course_tools drop column if exists icon;

-- ---------------------------------------------------------------------------
-- Replaced by the free Udemy courses list (course_udemy_bonus).
-- ---------------------------------------------------------------------------

alter table public.courses drop column if exists udemy_url;

-- ===========================================================================
-- 20260930000001_rename_leafclutch.sql
-- ===========================================================================

-- 17/17 · Brand spelling: "LeafClutch" → "Leafclutch" in all stored text.
-- Updates every text column of every table in the public schema, only where
-- the old spelling appears. Safe to run again: afterwards nothing matches.

do $$
declare
  col record;
begin
  for col in
    select c.table_name, c.column_name
    from information_schema.columns c
    join information_schema.tables t
      on t.table_schema = c.table_schema and t.table_name = c.table_name and t.table_type = 'BASE TABLE'
    where c.table_schema = 'public' and c.data_type in ('text', 'character varying')
  loop
    execute format(
      'update public.%I set %I = replace(%I, %L, %L) where %I like %L',
      col.table_name, col.column_name, col.column_name, 'LeafClutch', 'Leafclutch', col.column_name, '%LeafClutch%'
    );
  end loop;
end;
$$;

-- ===========================================================================
-- seed.sql
-- ===========================================================================

-- Seed data generated from the original static files in src/data.
-- PLACEHOLDER content: instructors, testimonials, contact details and most
-- course detail copy are placeholders for layout — replace before launch.
-- Safe to run again: every part runs only once per database (see below).

-- Each part below runs once per database: private.seed_log remembers which
-- parts have run, so re-running this file never brings back rows you deleted
-- or overwrites rows you edited. New parts added later still run once.
create table if not exists private.seed_log (
  name text primary key,
  ran_at timestamptz not null default now()
);

do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:site_settings:1') then
    insert into public.site_settings (id, email, phone, whatsapp, address, social_links) values
      -- FAKE contacts: the WhatsApp number is invalid and .example is a reserved domain.
      (1, 'admissions@leafclutch.example', null, '9770000000000', null, '[]')
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:site_settings:1');
  end if;
end $seed$;

do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:course_categories:1') then
    insert into public.course_categories (id, name, short_name, slug, description, image_url, display_order) values
      ('a3394a82-6db1-422e-882a-e12dcf5a4969', 'Web Development', 'Web Development', 'web-development', 'Build modern, production-ready websites and web applications.', null, 1),
      ('6ce7e45e-a8cb-4386-8c89-407261d3e2d1', 'AI & Machine Learning', 'AI & ML', 'ai-ml', 'Train models, work with LLMs and build intelligent agents.', null, 2),
      ('4527f811-674e-4998-8dbf-3774355570bd', 'Data Science', 'Data Science', 'data-science', 'Turn raw data into analysis, dashboards and decisions.', null, 3),
      ('4ebda519-dcbf-4c71-80b9-f10eaad863df', 'UI/UX Design', 'UI/UX', 'ui-ux', 'Research, design and prototype digital products people enjoy using.', null, 4),
      ('5df8a66f-8525-45e6-8ead-3d9ddfc14c16', 'Cybersecurity', 'Cybersecurity', 'cybersecurity', 'Understand attacks, secure systems and test defences ethically.', null, 5),
      ('0c89dd00-d674-4fa6-82a6-f93e17ec9dd8', 'Graphic Design', 'Graphic Design', 'graphic-design', 'Visual communication, branding and layout for print and screen.', null, 6),
      ('2c000f38-8d6f-474c-8537-a61d44c7419d', 'Cloud Computing', 'Cloud', 'cloud-computing', 'Deploy, scale and automate infrastructure on the cloud.', null, 7)
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:course_categories:1');
  end if;
end $seed$;

do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:courses:1') then
    insert into public.courses (id, category_id, name, slug, short_description, description, thumbnail, actual_price, discount_price, duration, learning_mode, curriculum_pdf_url, certificate_available, is_featured, status, created_at) values
      ('7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', '6ce7e45e-a8cb-4386-8c89-407261d3e2d1', 'Agentic AI', 'agentic-ai', 'Design and ship AI agents that plan, use tools and complete multi-step tasks with LLMs.', 'Agentic AI goes beyond chatbots. In this course you will learn how large language models can reason about a goal, choose tools, call APIs and check their own work to finish real tasks.

    You will start with LLM fundamentals and prompt design, then move to tool calling, retrieval-augmented generation and memory. The second half of the course focuses on agent architecture: planning loops, multi-agent coordination, evaluation and guardrails.

    Every module ends with a build. By the final week you will have deployed a working agent that solves a problem you choose, along with the evaluation suite that proves it works.', null, 25000, 18000, '3 months', 'hybrid', '/curriculum/agentic-ai-curriculum.pdf', true, true, 'published', now() - interval '13 minutes'),
      ('20a70350-dffd-40d5-87ad-a61e7360e743', '6ce7e45e-a8cb-4386-8c89-407261d3e2d1', 'Generative AI', 'generative-ai', 'Work with text, image and embedding models to build practical generative AI features.', 'This course gives developers a hands-on foundation in generative AI. You will learn how modern text and image models work at a practical level, and how to integrate them into applications responsibly.

    Topics include prompt engineering, embeddings and vector search, retrieval-augmented generation, fine-tuning trade-offs and cost control. You will build a document question-answering app and an image-generation workflow as course projects.', null, 20000, 15000, '2 months', 'online', null, true, false, 'published', now() - interval '12 minutes'),
      ('d523ab0a-33e1-4928-8734-3956c6739d04', '6ce7e45e-a8cb-4386-8c89-407261d3e2d1', 'Machine Learning with Python', 'machine-learning-with-python', 'Learn supervised and unsupervised learning with scikit-learn, from data prep to deployment.', 'A structured introduction to machine learning for people who can already write basic Python. You will cover the full workflow: cleaning data, engineering features, choosing models, evaluating them honestly and deploying the result.

    Algorithms covered include linear and logistic regression, decision trees, ensembles, clustering and an introduction to neural networks. The course closes with a capstone on a real Nepali dataset.', null, 22000, null, '3 months', 'physical', null, true, false, 'published', now() - interval '11 minutes'),
      ('f42af617-4d01-4006-888b-4d6d6b6052f4', 'a3394a82-6db1-422e-882a-e12dcf5a4969', 'MERN Stack Development', 'mern-stack-development', 'Build full-stack JavaScript applications with MongoDB, Express, React and Node.js.', 'Go from JavaScript fundamentals to deploying complete full-stack applications. You will build REST APIs with Node.js and Express, model data in MongoDB and create responsive interfaces with React.

    Along the way you will learn authentication, file uploads, testing and deployment. The course is built around three projects of increasing size, finishing with a team project run the way a real development team works.', null, 30000, 24000, '4 months', 'hybrid', null, true, true, 'published', now() - interval '10 minutes'),
      ('a31d768d-750b-4607-8c8d-6cd1a8b5994b', 'a3394a82-6db1-422e-882a-e12dcf5a4969', 'Frontend Development with React & Next.js', 'react-nextjs-frontend', 'Create fast, accessible interfaces with React, TypeScript, Tailwind CSS and Next.js.', 'A focused frontend course for learners who know HTML, CSS and basic JavaScript. You will learn component design, state management, data fetching and routing with React and Next.js, written in TypeScript.

    The course puts equal weight on quality: accessibility, performance and responsive layout are part of every assignment, not an afterthought.', null, 18000, null, '2.5 months', 'online', null, true, false, 'published', now() - interval '9 minutes'),
      ('8ddf1088-14f1-46d0-827a-17b814c7539f', 'a3394a82-6db1-422e-882a-e12dcf5a4969', 'Python Django Web Development', 'python-django', 'Build secure, database-driven web applications and APIs with Python and Django.', 'Learn backend web development with one of the most dependable frameworks available. You will model data with the Django ORM, build admin tools, write REST APIs with Django REST Framework and deploy to a Linux server.

    The course covers authentication, permissions, testing and the security practices every production application needs.', null, 20000, 16000, '3 months', 'physical', null, true, false, 'published', now() - interval '8 minutes'),
      ('a626064a-7374-423e-86d6-1f8797f54a7c', '4527f811-674e-4998-8dbf-3774355570bd', 'Data Science with Python', 'data-science-with-python', 'Analyse, visualise and model data with Python, pandas, SQL and statistics.', 'This course takes you through the day-to-day work of a data scientist. You will query data with SQL, clean and reshape it with pandas, explore it visually and apply statistical reasoning to answer real questions.

    The final month introduces predictive modelling and communicating findings to non-technical stakeholders. You will finish with a portfolio of three analysis projects.', null, 28000, 22000, '4 months', 'hybrid', null, true, true, 'published', now() - interval '7 minutes'),
      ('85a42f2c-5670-429b-8c72-f5a4e7494af2', '4527f811-674e-4998-8dbf-3774355570bd', 'Data Analytics with Power BI', 'data-analytics-power-bi', 'Build clear, interactive business dashboards with Excel, Power Query and Power BI.', 'Designed for working professionals and graduates who want to make better use of data. You will learn to clean data with Power Query, model it with DAX and design dashboards that answer business questions at a glance.

    All exercises use realistic business datasets from finance, retail and operations.', null, 15000, null, '6 weeks', 'online', null, true, false, 'published', now() - interval '6 minutes'),
      ('74b2aa62-017d-4a09-88bc-1c1565e2b715', '4ebda519-dcbf-4c71-80b9-f10eaad863df', 'UI/UX Design with Figma', 'ui-ux-design', 'Research, wireframe and prototype usable digital products using Figma.', 'Learn the full product design process: understanding users, mapping journeys, sketching ideas, building wireframes and turning them into polished, testable prototypes in Figma.

    You will also learn design systems, accessibility basics and how to hand designs off to developers. The course ends with a case study you can present in interviews.', null, 20000, 15000, '3 months', 'hybrid', null, true, true, 'published', now() - interval '5 minutes'),
      ('f7b2c938-f077-4b4c-8b37-73eb73e758f3', '5df8a66f-8525-45e6-8ead-3d9ddfc14c16', 'Ethical Hacking & Cybersecurity', 'ethical-hacking', 'Learn how attacks work and how to find and fix vulnerabilities in a legal lab environment.', 'A practical cybersecurity course built around a dedicated lab. You will learn networking fundamentals, Linux, reconnaissance, web application vulnerabilities and common exploitation techniques — always within an authorised, ethical framework.

    Equal time is spent on defence: hardening systems, reading logs and writing clear vulnerability reports.', null, 25000, 20000, '3 months', 'physical', null, true, false, 'published', now() - interval '4 minutes'),
      ('1e73e4b8-99b3-40f3-8d02-fae509493379', '0c89dd00-d674-4fa6-82a6-f93e17ec9dd8', 'Graphic Design Fundamentals', 'graphic-design', 'Master layout, typography, colour and branding with Photoshop and Illustrator.', 'Build a strong foundation in visual design. You will study the principles behind good layout, typography and colour, and practise them in Adobe Photoshop and Illustrator.

    Projects include a logo and brand kit, social media campaign assets and a print brochure.', null, 12000, null, '2 months', 'physical', null, false, false, 'published', now() - interval '3 minutes'),
      ('420ccfc3-75a4-41cd-868f-69770e2ad8df', '2c000f38-8d6f-474c-8537-a61d44c7419d', 'AWS Cloud & DevOps', 'aws-cloud-devops', 'Deploy and automate applications on AWS with Linux, Docker, CI/CD and infrastructure as code.', 'Learn how modern teams ship and run software. You will set up Linux servers, containerise applications with Docker, build CI/CD pipelines and manage AWS infrastructure with Terraform.

    The course aligns with the AWS Cloud Practitioner and Solutions Architect Associate exam topics.', null, 26000, 21000, '3 months', 'online', null, true, false, 'published', now() - interval '2 minutes'),
      ('e099672a-84b3-4bc6-8e9d-19316a21d50c', 'a3394a82-6db1-422e-882a-e12dcf5a4969', 'Blockchain Development', 'blockchain-development', 'Smart contracts and decentralised applications with Solidity.', 'Course content in preparation.', null, 25000, null, '3 months', 'online', null, true, false, 'draft', now() - interval '1 minutes')
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:courses:1');
  end if;
end $seed$;

do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:course_benefits:1') then
    insert into public.course_benefits (id, course_id, title, description, display_order) values
      ('87ccd1d1-5ca5-47e8-8074-4329428a96b1', '7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', 'Live, mentor-led sessions', 'Weekly live classes with time for questions, code reviews and debugging together.', 1),
      ('dbcb7ff4-d93b-47c5-89c4-1676f1933929', '7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', 'Five portfolio projects', 'Build a research assistant, a RAG app, a tool-using agent, a multi-agent workflow and a capstone.', 2),
      ('21639988-8ddb-47a5-8340-583d2643866d', '7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', 'Evaluation and guardrails', 'Learn to measure agent quality and add safety checks — the part most tutorials skip.', 3),
      ('17298c68-1e42-404e-84b5-60acea804217', '7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', 'Recorded classes', 'Every session is recorded so you can revisit difficult topics at your own pace.', 4),
      ('09d4c075-593d-4978-854d-2008a44a813c', '7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', 'Internship pathway', 'Top performers are considered for an internship on real Leafclutch AI projects.', 5),
      ('20d2d869-48d0-4c84-839c-49fe0a44eef2', '7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', 'Certificate of completion', 'Receive a Leafclutch certificate after completing the course and capstone.', 6),
      ('9c422131-f9dd-4388-80b6-7acbc1ea1629', '20a70350-dffd-40d5-87ad-a61e7360e743', 'Hands-on labs', 'Guided labs for prompting, embeddings and retrieval with real APIs.', 1),
      ('abc06a2f-7281-4010-86de-92b0ed23c215', '20a70350-dffd-40d5-87ad-a61e7360e743', 'Two complete projects', 'A document Q&A app and an image-generation workflow for your portfolio.', 2),
      ('438cbae9-d6e5-4e07-88e5-b701b8772ba3', '20a70350-dffd-40d5-87ad-a61e7360e743', 'Cost and safety practices', 'Learn how to keep AI features affordable, reliable and responsible.', 3),
      ('1b173cbb-c43b-4b6e-8a7c-032074e5894b', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'Three full-stack projects', 'Build and deploy progressively larger applications, ending with a team project.', 1),
      ('47d7da2f-be8f-4341-88dc-1ac861893a08', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'Code reviews', 'Mentors review your pull requests the way a senior developer would at work.', 2),
      ('1b0241ec-9014-48fb-89b7-cb847ed88dd9', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'Git and team workflow', 'Branching, pull requests and issue tracking, practised on a shared codebase.', 3),
      ('f10f4334-8bb7-4b74-8e4d-52bccafe4750', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'Interview preparation', 'Mock interviews and portfolio feedback in the final weeks.', 4),
      ('de6b55a2-89fd-4c11-8487-1e2fa51ddb8d', 'a626064a-7374-423e-86d6-1f8797f54a7c', 'Real datasets', 'Work with public datasets from Nepal and around the world, not toy examples.', 1),
      ('578a8f06-e7e1-4225-8ef1-dbfd8c77be6d', 'a626064a-7374-423e-86d6-1f8797f54a7c', 'Portfolio of three analyses', 'Finish with three written analyses you can share with employers.', 2),
      ('2e446c14-005c-4152-88c7-bffc18fd531d', 'a626064a-7374-423e-86d6-1f8797f54a7c', 'SQL to modelling', 'Cover the whole workflow from querying data to predictive models.', 3),
      ('379ea230-5c0b-4ddf-8c6e-e04ef1d01b87', 'a626064a-7374-423e-86d6-1f8797f54a7c', 'Presentation practice', 'Learn to explain findings clearly to non-technical audiences.', 4),
      ('470d94d1-3c72-4d3e-8ab0-d2cdf189f509', '74b2aa62-017d-4a09-88bc-1c1565e2b715', 'Weekly design critiques', 'Structured feedback on your work from mentors and peers.', 1),
      ('87c85369-19ff-4283-895d-92767acbb9ba', '74b2aa62-017d-4a09-88bc-1c1565e2b715', 'Interview-ready case study', 'A complete, documented case study from research to prototype.', 2),
      ('0d8151f3-8f68-4366-8aaa-7e03754b0a64', '74b2aa62-017d-4a09-88bc-1c1565e2b715', 'Design systems basics', 'Build reusable components and styles the way product teams do.', 3),
      ('ae8bd0e4-bbde-4226-8a0b-78a95ee5e1f1', '74b2aa62-017d-4a09-88bc-1c1565e2b715', 'Developer hand-off', 'Prepare specs and assets developers can actually build from.', 4)
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:course_benefits:1');
  end if;
end $seed$;

do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:course_modules:1') then
    insert into public.course_modules (id, course_id, title, description, display_order) values
      ('0c6949d6-e4a6-41af-80d3-bb03fd0c1e16', '7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', 'Introduction to AI', 'The foundations you need before building agents.', 1),
      ('8da4bfcc-63d6-4413-80e5-1fb733b4b3d0', '7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', 'LLM Fundamentals', 'How large language models work in practice, and how to prompt them well.', 2),
      ('335e3ff7-9abb-4434-86b8-c5842aa7b6df', '7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', 'Building AI Agents', 'Tool calling, retrieval and memory — the building blocks of an agent.', 3),
      ('3083bc1a-7cd9-477b-86d7-9d3ef492d9a9', '7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', 'Advanced Agent Architecture', 'Planning loops, multi-agent systems, evaluation and guardrails.', 4),
      ('c537953d-7181-4052-8ec8-68ea37d743f4', '7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', 'Capstone Project', null, 5),
      ('a96cc59c-1c5a-4112-8bb3-36db1f42d3fb', '20a70350-dffd-40d5-87ad-a61e7360e743', 'How Generative Models Work', null, 1),
      ('175036f0-eca8-448e-8f72-fa3a1a75b58a', '20a70350-dffd-40d5-87ad-a61e7360e743', 'Embeddings and Retrieval', null, 2),
      ('e83c1b80-4a1b-48c3-8f13-d2003ab2031f', '20a70350-dffd-40d5-87ad-a61e7360e743', 'Shipping Generative Features', null, 3),
      ('8b86cf41-0229-48d3-8993-3d0de3463d8c', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'Modern JavaScript', 'The language features you will use every day.', 1),
      ('6a427599-af06-4f10-8426-748443dab95a', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'React Fundamentals', 'Components, state and data flow.', 2),
      ('4ddb4ca0-1f25-462c-8ee2-786924cb943a', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'Node.js and Express APIs', 'Designing and building REST APIs.', 3),
      ('8e8a71e8-6df6-4715-8072-5eb4a4270600', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'MongoDB and Data Modelling', null, 4),
      ('7a734fe7-214e-45bd-8923-6e4b769c4829', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'Authentication, Testing and Deployment', null, 5),
      ('89b3546c-cd4c-4b99-8743-88d8da2b85a3', 'a626064a-7374-423e-86d6-1f8797f54a7c', 'Python for Data', null, 1),
      ('bfa91c58-4d51-47a3-8eac-b9e5897a7337', 'a626064a-7374-423e-86d6-1f8797f54a7c', 'SQL and Data Wrangling', null, 2),
      ('05aa2e29-3fe1-4f50-860e-d637c882b47a', 'a626064a-7374-423e-86d6-1f8797f54a7c', 'Statistics and Visualisation', null, 3),
      ('688e05f2-716e-4c4e-86a0-41e53a73a89c', 'a626064a-7374-423e-86d6-1f8797f54a7c', 'Predictive Modelling', null, 4),
      ('94cbd133-18b3-40ed-892d-b2ce01b3e4c4', '74b2aa62-017d-4a09-88bc-1c1565e2b715', 'Design Thinking and Research', null, 1),
      ('b8dc7040-ae73-4c04-8776-0da80093efdb', '74b2aa62-017d-4a09-88bc-1c1565e2b715', 'Wireframing and Information Architecture', null, 2),
      ('6e2ffe99-881a-4b20-83be-3d05597551cb', '74b2aa62-017d-4a09-88bc-1c1565e2b715', 'Visual Design in Figma', null, 3),
      ('dc318d21-ee6a-4940-8174-8a91db3b25ea', '74b2aa62-017d-4a09-88bc-1c1565e2b715', 'Prototyping, Testing and Hand-off', null, 4)
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:course_modules:1');
  end if;
end $seed$;

do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:course_lessons:1') then
    insert into public.course_lessons (id, module_id, title, description, display_order) values
      ('2e45244d-18f8-499e-8af6-7544be36d055', '0c6949d6-e4a6-41af-80d3-bb03fd0c1e16', 'What is Artificial Intelligence?', null, 1),
      ('ac6a15e5-8557-4436-8e22-81fe7b66da42', '0c6949d6-e4a6-41af-80d3-bb03fd0c1e16', 'Understanding AI Agents', null, 2),
      ('e171aad4-423e-48ac-8876-f2ff4c3fd1e1', '0c6949d6-e4a6-41af-80d3-bb03fd0c1e16', 'Agent Architecture', null, 3),
      ('0714305e-a0ad-4f22-8bf3-72529a4bcc30', '8da4bfcc-63d6-4413-80e5-1fb733b4b3d0', 'How LLMs Generate Text', null, 1),
      ('632f0b32-b04f-4ed8-8b26-89c356cf887f', '8da4bfcc-63d6-4413-80e5-1fb733b4b3d0', 'Prompt Design Patterns', null, 2),
      ('52fbd828-432d-48f2-8a75-b4b5d5ded27e', '8da4bfcc-63d6-4413-80e5-1fb733b4b3d0', 'Structured Outputs', null, 3),
      ('e21fab15-9cc4-4142-8633-e15b59621ac1', '8da4bfcc-63d6-4413-80e5-1fb733b4b3d0', 'Working with LLM APIs', null, 4),
      ('ae121c48-4fb8-4ad5-8674-7181c7a2df75', '335e3ff7-9abb-4434-86b8-c5842aa7b6df', 'Tool Calling', null, 1),
      ('b00c2936-0b6d-486e-8136-36eac8811585', '335e3ff7-9abb-4434-86b8-c5842aa7b6df', 'Retrieval-Augmented Generation', null, 2),
      ('83acc9d2-09c9-4312-8ebf-c0ab2b582df8', '335e3ff7-9abb-4434-86b8-c5842aa7b6df', 'Memory and State', null, 3),
      ('2eb435e6-89a6-4da9-8759-86d9baba107c', '335e3ff7-9abb-4434-86b8-c5842aa7b6df', 'Building Your First Agent', null, 4),
      ('5c5fbdcf-b9ff-4ac3-817c-0db489af6849', '3083bc1a-7cd9-477b-86d7-9d3ef492d9a9', 'Planning and Reflection Loops', null, 1),
      ('2f5ca441-602d-47d7-833b-c54ad352c191', '3083bc1a-7cd9-477b-86d7-9d3ef492d9a9', 'Multi-Agent Systems', null, 2),
      ('6f1efc15-cae8-46bb-80d7-d2c8730c0bd5', '3083bc1a-7cd9-477b-86d7-9d3ef492d9a9', 'Evaluating Agents', null, 3),
      ('4d2b4d5a-8ec9-4b9f-84e8-6461111db871', '3083bc1a-7cd9-477b-86d7-9d3ef492d9a9', 'Guardrails and Safety', null, 4),
      ('acff8118-0c44-4d62-851a-ca8d35334eda', 'c537953d-7181-4052-8ec8-68ea37d743f4', 'Choosing a Problem', null, 1),
      ('6278e5e3-6bf1-4c14-809d-3c9f7ebe516c', 'c537953d-7181-4052-8ec8-68ea37d743f4', 'Build, Evaluate and Deploy', null, 2),
      ('42be2a94-c783-410d-84b9-eb98d01ab1ac', 'c537953d-7181-4052-8ec8-68ea37d743f4', 'Demo Day', null, 3),
      ('a728480f-3831-40d7-8b72-d7d69154fd32', 'a96cc59c-1c5a-4112-8bb3-36db1f42d3fb', 'Text and Image Models Explained', null, 1),
      ('ee311ee5-0430-413e-831a-05fa2a75cc3f', 'a96cc59c-1c5a-4112-8bb3-36db1f42d3fb', 'Prompt Engineering', null, 2),
      ('c1ecf200-ec51-4a9a-8624-4caf5805c615', '175036f0-eca8-448e-8f72-fa3a1a75b58a', 'Embeddings', null, 1),
      ('ef4f764a-3f91-4c63-83d8-4c41c131323d', '175036f0-eca8-448e-8f72-fa3a1a75b58a', 'Vector Search', null, 2),
      ('2f7bd43a-0457-4472-8e85-e39e31f125ec', '175036f0-eca8-448e-8f72-fa3a1a75b58a', 'Building a Document Q&A App', null, 3),
      ('9b23f091-ba94-40ff-842a-a87dcfbb73ee', 'e83c1b80-4a1b-48c3-8f13-d2003ab2031f', 'Fine-tuning Trade-offs', null, 1),
      ('dc201ae7-ae0d-4465-8b7f-5cdc47d57cf3', 'e83c1b80-4a1b-48c3-8f13-d2003ab2031f', 'Cost, Latency and Safety', null, 2),
      ('ca7d41e6-d3bf-4e72-86b8-16cdf4c38c19', '8b86cf41-0229-48d3-8993-3d0de3463d8c', 'ES6+ Essentials', null, 1),
      ('1b29e1c3-4dc0-4362-8dbb-2eeb35f58218', '8b86cf41-0229-48d3-8993-3d0de3463d8c', 'Asynchronous JavaScript', null, 2),
      ('fcc8c7fb-18ca-4a7c-8b3b-fc1b0c52d76d', '8b86cf41-0229-48d3-8993-3d0de3463d8c', 'Modules and Tooling', null, 3),
      ('efef4bca-7e94-4d0b-8e78-3ced93ac13f3', '6a427599-af06-4f10-8426-748443dab95a', 'Components and Props', null, 1),
      ('78a3188b-d156-4c52-861b-5a83ede6534b', '6a427599-af06-4f10-8426-748443dab95a', 'State and Effects', null, 2),
      ('7845c3e0-f4ab-4314-8639-fbaae2f06ae9', '6a427599-af06-4f10-8426-748443dab95a', 'Routing and Forms', null, 3),
      ('af005191-28b2-40ff-8f86-232b75f4604b', '4ddb4ca0-1f25-462c-8ee2-786924cb943a', 'HTTP and REST Design', null, 1),
      ('bca018c2-4c26-4a15-837f-ba370421cb96', '4ddb4ca0-1f25-462c-8ee2-786924cb943a', 'Express Middleware', null, 2),
      ('6bda4274-3bb8-45b2-8a72-7a75b5f66a4f', '4ddb4ca0-1f25-462c-8ee2-786924cb943a', 'Validation and Error Handling', null, 3),
      ('e6d27960-ba5b-4cba-8e8e-f10311db3f5a', '8e8a71e8-6df6-4715-8072-5eb4a4270600', 'Documents and Collections', null, 1),
      ('6e080ec5-303e-4b7e-8579-8a5badb499d9', '8e8a71e8-6df6-4715-8072-5eb4a4270600', 'Mongoose Schemas', null, 2),
      ('9e252976-e58d-4fa6-8fad-5364649e37f8', '7a734fe7-214e-45bd-8923-6e4b769c4829', 'JWT Authentication', null, 1),
      ('86f34a79-4739-48fc-86ba-d662f349aad1', '7a734fe7-214e-45bd-8923-6e4b769c4829', 'Testing APIs', null, 2),
      ('658801a0-e5f9-4fe5-8b2a-ea20fd3785d0', '7a734fe7-214e-45bd-8923-6e4b769c4829', 'Deploying to the Cloud', null, 3),
      ('062fcd2a-794a-468f-8e7e-963d7ac02c1b', '89b3546c-cd4c-4b99-8743-88d8da2b85a3', 'NumPy and pandas', null, 1),
      ('f2e7582e-3232-41fc-8265-deb235ddcc1a', '89b3546c-cd4c-4b99-8743-88d8da2b85a3', 'Cleaning Messy Data', null, 2),
      ('bdcfb446-0e8e-4652-8dd5-6d29ac63a092', 'bfa91c58-4d51-47a3-8eac-b9e5897a7337', 'SQL Queries and Joins', null, 1),
      ('44564e36-fba8-42ae-8030-d90e961487d2', 'bfa91c58-4d51-47a3-8eac-b9e5897a7337', 'Reshaping and Aggregation', null, 2),
      ('14aeb6f9-9f22-4cf1-8e3f-10b7bca331d4', '05aa2e29-3fe1-4f50-860e-d637c882b47a', 'Descriptive Statistics', null, 1),
      ('2a5f22b9-06a9-4cfd-84d1-576d71a64b74', '05aa2e29-3fe1-4f50-860e-d637c882b47a', 'Visualising with Matplotlib and Seaborn', null, 2),
      ('186cdac4-add5-4b45-8b16-4640dc1561f0', '05aa2e29-3fe1-4f50-860e-d637c882b47a', 'Hypothesis Testing', null, 3),
      ('df093171-0de0-4a9f-8ad4-24a6ccdf235d', '688e05f2-716e-4c4e-86a0-41e53a73a89c', 'Regression and Classification', null, 1),
      ('329ad5f4-1bf4-4ee6-89f4-4b4f5fa6998d', '688e05f2-716e-4c4e-86a0-41e53a73a89c', 'Model Evaluation', null, 2),
      ('8057c33e-0dcf-415d-88ce-963afabad18a', '94cbd133-18b3-40ed-892d-b2ce01b3e4c4', 'User Interviews', null, 1),
      ('fbaebbb6-dee9-4174-80f1-fc16f251bdb3', '94cbd133-18b3-40ed-892d-b2ce01b3e4c4', 'Personas and Journey Maps', null, 2),
      ('a439a262-4006-4061-8063-21a2bd701fe5', 'b8dc7040-ae73-4c04-8776-0da80093efdb', 'Sitemaps and User Flows', null, 1),
      ('0a7c8e51-346d-4d26-8897-d0ad757d9468', 'b8dc7040-ae73-4c04-8776-0da80093efdb', 'Low-fidelity Wireframes', null, 2),
      ('69a1bc28-f83a-4c85-8b4b-a7aafc4f6b54', '6e2ffe99-881a-4b20-83be-3d05597551cb', 'Typography, Colour and Layout', null, 1),
      ('fb65bebe-dd7f-4154-8abc-47cc5f519bc9', '6e2ffe99-881a-4b20-83be-3d05597551cb', 'Components and Auto Layout', null, 2),
      ('81ea3c05-faf4-4633-8cb5-279d1adad4cb', 'dc318d21-ee6a-4940-8174-8a91db3b25ea', 'Interactive Prototypes', null, 1),
      ('da217390-c0aa-4ec0-84f3-5881eeb14ae6', 'dc318d21-ee6a-4940-8174-8a91db3b25ea', 'Usability Testing', null, 2),
      ('8408cf7e-3bdb-49e5-8653-0df927d4659e', 'dc318d21-ee6a-4940-8174-8a91db3b25ea', 'Developer Hand-off', null, 3)
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:course_lessons:1');
  end if;
end $seed$;

do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:course_installments:1') then
    insert into public.course_installments (id, course_id, title, percentage, description, display_order) values
      ('cae50a71-3155-40f5-89d1-74a886ffe586', '7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', 'First Instalment', 50, 'Payable at enrollment', 1),
      ('e404b725-5049-47d8-8b8b-5ac369713afb', '7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', 'Second Instalment', 50, 'Payable when promoted to internship', 2),
      ('24fa2e42-5af8-424d-8161-203defa2c7f1', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'First Instalment', 40, 'Payable at enrollment', 1),
      ('47530354-ea07-4c88-864d-2da9830226ce', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'Second Instalment', 30, 'Payable at the start of month two', 2),
      ('43821a64-7dbe-47fc-8381-7a37624a766a', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'Third Instalment', 30, 'Payable at the start of month three', 3),
      ('c498449d-390c-419c-86a0-554512b29dc9', 'a626064a-7374-423e-86d6-1f8797f54a7c', 'First Instalment', 50, 'Payable at enrollment', 1),
      ('f46f42f5-ab0a-4d61-86d0-51627193cb15', 'a626064a-7374-423e-86d6-1f8797f54a7c', 'Second Instalment', 50, 'Payable at the midpoint of the course', 2)
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:course_installments:1');
  end if;
end $seed$;

do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:instructors:1') then
    insert into public.instructors (id, name, designation, bio, image) values
      ('9177826b-8784-445a-879d-4df519890f9b', 'Prakash Shrestha', 'AI Engineer', 'Builds LLM-powered products and has spent the last several years taking machine learning prototypes into production. Focuses on practical agent design and evaluation.', null),
      ('9105bc43-1897-4f87-8cf1-054b7b37e7a8', 'Nisha Gurung', 'Senior Full-Stack Developer', 'Works across React, Node.js and cloud infrastructure, and mentors junior developers on writing maintainable, well-tested code.', null),
      ('bd688e03-fe42-4e58-8996-707e18802927', 'Suman Rai', 'Backend Developer', 'Designs APIs and data models for high-traffic applications, with a particular interest in security and performance.', null),
      ('0b7bcff4-203c-4d43-83bb-e545ea89da2a', 'Anjali Maharjan', 'Data Scientist', 'Uses data to answer business and policy questions, and enjoys teaching statistics through real-world examples.', null),
      ('5238f43c-7b2c-4402-8f01-93cfe1637557', 'Kiran Tamang', 'Product Designer', 'Designs digital products end to end, from user research to design systems, and has run design critiques for product teams.', null)
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:instructors:1');
  end if;
end $seed$;

do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:course_instructors:1') then
    insert into public.course_instructors (course_id, instructor_id, display_order) values
      ('7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', '9177826b-8784-445a-879d-4df519890f9b', 1),
      ('20a70350-dffd-40d5-87ad-a61e7360e743', '9177826b-8784-445a-879d-4df519890f9b', 1),
      ('f42af617-4d01-4006-888b-4d6d6b6052f4', '9105bc43-1897-4f87-8cf1-054b7b37e7a8', 1),
      ('f42af617-4d01-4006-888b-4d6d6b6052f4', 'bd688e03-fe42-4e58-8996-707e18802927', 2),
      ('a31d768d-750b-4607-8c8d-6cd1a8b5994b', '9105bc43-1897-4f87-8cf1-054b7b37e7a8', 1),
      ('8ddf1088-14f1-46d0-827a-17b814c7539f', 'bd688e03-fe42-4e58-8996-707e18802927', 1),
      ('a626064a-7374-423e-86d6-1f8797f54a7c', '0b7bcff4-203c-4d43-83bb-e545ea89da2a', 1),
      ('85a42f2c-5670-429b-8c72-f5a4e7494af2', '0b7bcff4-203c-4d43-83bb-e545ea89da2a', 1),
      ('74b2aa62-017d-4a09-88bc-1c1565e2b715', '5238f43c-7b2c-4402-8f01-93cfe1637557', 1)
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:course_instructors:1');
  end if;
end $seed$;

do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:faqs:1') then
    insert into public.faqs (id, question, answer, category, course_id, display_order, is_active) values
      ('718337b2-756a-4ff7-894b-5e7b9957ab5c', 'Do I need prior experience to join a course?', 'Most beginner courses start from the fundamentals, so no prior experience is required. Advanced courses list their prerequisites on the course page — if you are unsure, contact us and we will help you pick the right starting point.', 'general', null, 1, true),
      ('b4d22d05-3c04-43e8-8671-63bbf1ac2c67', 'Are classes online or in person?', 'It depends on the course. Each course is offered online, in person or in a hybrid format, and the learning mode is shown on every course card and course page.', 'general', null, 2, true),
      ('537b7d47-f219-4c75-897e-f788a87be552', 'How do I choose the right course?', 'Start with the area you want to work in, then compare the curriculum, duration and projects on each course page. Our team is also happy to talk through your goals before you enroll.', 'course', null, 3, true),
      ('6be007c1-cb6e-4f0a-8398-5acf5c3c1c21', 'Will I build real projects?', 'Yes. Every course is project-based, and you finish with work you can show in a portfolio or during interviews.', 'course', null, 4, true),
      ('7423eec7-824d-4d2f-863e-5d22f5f01a08', 'How do I enroll?', 'Open the course you are interested in and select Enroll Now. Fill in the short form and send it to us by WhatsApp or email — our team will confirm your seat and share the next steps.', 'enrollment', null, 5, true),
      ('760d91ff-ebb2-4c2d-83ca-04384efd7175', 'Which payment methods do you accept?', 'We accept eSewa, Khalti, Fonepay and bank transfer. Our team confirms how you will pay after you enroll, and any instalment plan is shown on the course page.', 'enrollment', null, 6, true),
      ('05f92c2c-337b-4829-81c3-b88b7905c968', 'Can I pay in instalments?', 'Many courses can be paid in instalments. Where an instalment plan is available, the course page shows each instalment and when it is due.', 'enrollment', null, 7, true),
      ('208ce88b-5b46-468d-8cde-dc661e66a5d0', 'Will I receive a certificate?', 'Courses that include a certificate say so on the course page. You receive a Leafclutch certificate of completion after successfully finishing the course and its projects.', 'certificate', null, 8, true),
      ('4d4fd572-693f-4d11-8f38-1a57bcc26a4a', 'What do I need to know before joining Agentic AI?', 'You should be comfortable writing basic Python — functions, loops and working with lists and dictionaries. No prior machine learning experience is required.', 'course', '7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', 1, true),
      ('05519eda-4de5-425e-8cfe-2559ab4cbb3e', 'Do I need to pay for AI model APIs?', 'Most exercises can be completed with free tiers or open models. Where a paid API is useful, we show you how to keep costs very low and suggest free alternatives.', 'course', '7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', 2, true),
      ('4cb29760-92f3-4fba-8168-c7e11eedc30f', 'What kind of laptop do I need?', 'Any laptop from the last five years with 8 GB of RAM is enough. Heavy computation runs in the cloud, not on your machine.', 'course', '7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', 3, true),
      ('91a419b8-cc09-483d-84b2-d5dae0bc65a2', 'Is MERN Stack Development suitable for complete beginners?', 'It helps to know basic HTML and CSS. The course starts with modern JavaScript, so you do not need prior programming experience beyond that.', 'course', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 1, true),
      ('9346a9a3-827f-4c73-8c30-0f5f64fe4667', 'Draft question that should not appear', 'Inactive FAQs are hidden.', 'course', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 2, false)
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:faqs:1');
  end if;
end $seed$;

do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:testimonials:1') then
    insert into public.testimonials (id, name, image, course_id, review, rating, is_featured, is_active, display_order) values
      ('aa486013-ce40-418d-809c-25ea5d67f66d', 'Aarati Sharma', null, 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'The projects were the best part. By the end I had a full-stack app deployed and could explain every decision in it during my interviews.', 5, true, true, 1),
      ('b253b19a-d12a-4654-8c24-04dede460dde', 'Bibek Thapa', null, 'a626064a-7374-423e-86d6-1f8797f54a7c', 'I came from a commerce background and was worried about the maths. The instructors explained concepts with real datasets, which made it click.', 5, true, true, 2),
      ('b26c7369-cee8-43f5-83b5-cb20dc76cc73', 'Sneha Karki', null, '74b2aa62-017d-4a09-88bc-1c1565e2b715', 'Weekly feedback on my designs helped me improve faster than learning alone. My final case study is now the centrepiece of my portfolio.', 5, true, true, 3),
      ('a17ff02c-a95c-4102-8483-5d36fdd330d2', 'Rohan Adhikari', null, '7516a9d7-d1dd-42c8-8c5f-53cea00ed33c', 'Practical and current. We built agents with real tools and evaluation, not just demos.', 4, false, true, 4)
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:testimonials:1');
  end if;
end $seed$;

-- TODO: confirm these figures with Leafclutch before launch.
do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:home_stats:1') then
    insert into public.home_stats (id, value, label, display_order) values
      ('be331df1-7623-4066-832f-1d2cf1a6dd36', '1,000+', 'Students trained', 1),
      ('22258061-2a8c-4e76-87bf-62952ca32b45', '20+', 'Courses', 2),
      ('a07f4065-ae5e-40b2-82be-e8e6f59abeb2', '50+', 'Industry mentors', 3),
      ('41c12b46-bf24-4b48-8782-789bfd0c9133', '100+', 'Projects built', 4)
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:home_stats:1');
  end if;
end $seed$;

-- About and Contact pages -------------------------------------------------

-- Contact details shown on the Contact page. PLACEHOLDER values: only filled in
-- where still empty, so details entered in Supabase are never overwritten.
do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'update:site_settings:1') then
    update public.site_settings set address = 'Kathmandu, Nepal' where id = 1 and address is null;
    insert into private.seed_log (name) values ('update:site_settings:1');
  end if;
end $seed$;
do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'update:site_settings:2') then
    update public.site_settings set phone = '+977 00-0000000' where id = 1 and phone is null;
    insert into private.seed_log (name) values ('update:site_settings:2');
  end if;
end $seed$;
do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'update:site_settings:3') then
    update public.site_settings set opening_hours = $json$[
      {
        "days": "Sunday – Friday",
        "hours": "9:00 AM – 6:00 PM"
      },
      {
        "days": "Saturday",
        "hours": "Closed"
      }
    ]$json$::jsonb
    where id = 1 and opening_hours = '[]'::jsonb;
    insert into private.seed_log (name) values ('update:site_settings:3');
  end if;
end $seed$;

do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:about_items:1') then
    insert into public.about_items (id, section, icon, title, description, display_order) values
      ('dc8bf3aa-06eb-4d74-88e6-4a8223f11a5e', 'value', 'guidance', 'Honest guidance', 'We recommend the course that fits your goals, even when that means a shorter or cheaper one.', 1),
      ('974845f3-dbcf-4c00-8e9f-68c3c08ff74d', 'value', 'inclusive', 'Open to every learner', 'No computer science degree needed. Courses start from the basics and build up.', 2),
      ('f8f0e835-fa91-4cd5-8345-e6cc86b151d2', 'value', 'quality', 'Quality over shortcuts', 'We teach the habits behind clean, working results, not tricks that fall apart.', 3),
      ('36efdd4f-22d3-41e9-8ccf-3388322397ad', 'value', 'growth', 'Always learning', 'Our mentors keep up with their fields, and our courses change when the tools do.', 4),
      ('a3d08c57-1e55-43f3-88f9-54a7d550329a', 'feature', 'practical', 'Practical learning', 'Every concept is practised in code or design the same week it is taught.', 1),
      ('4db4ca8e-5e49-414c-881f-cf2e7b47702b', 'feature', 'mentor', 'Expert mentors', 'Small batches mean your mentor knows your progress and answers your questions.', 2),
      ('53da45c6-80f4-45f5-8a2e-aa326aa703eb', 'feature', 'projects', 'Real projects', 'Finish with portfolio projects you can show employers and explain in interviews.', 3),
      ('c2e081bc-6cbd-448d-8631-624792c6d898', 'feature', 'career', 'Career focus', 'CV reviews, interview practice and guidance on internships and first roles.', 4),
      ('857d15a5-5a8a-415b-8d8e-ee2f44d5e64f', 'feature', 'curriculum', 'Industry-relevant curriculum', 'Course content is reviewed regularly to match the tools teams use today.', 5),
      ('5bf90f2b-2e41-4c87-8af8-0df9efadcbfa', 'feature', 'certificate', 'Recognised certificate', 'Earn a Leafclutch certificate backed by the projects you completed.', 6),
      ('5dca624e-82c0-4f2e-8ea6-e41a6edbaa84', 'learning_step', 'learn', 'Learn', 'Understand the core concepts in live, mentor-led classes.', 1),
      ('4815d4ca-59a2-4a6e-87b6-16fb87d7ac66', 'learning_step', 'practice', 'Practice', 'Work through guided exercises and get feedback on your work.', 2),
      ('05cc9ae0-bba0-47d3-8780-edcba0f577a2', 'learning_step', 'build', 'Build', 'Build real projects from start to finish for your portfolio.', 3),
      ('bb77ad5d-a778-489b-8c76-10082eff2343', 'learning_step', 'grow', 'Grow', 'Prepare for interviews, internships and your next role.', 4)
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:about_items:1');
  end if;
end $seed$;

-- Training pages ------------------------------------------------------------

-- PLACEHOLDER organisation testimonials — fictional; replace with real,
-- consented testimonials before launch.
do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:testimonials:2') then
    insert into public.testimonials (id, type, name, image, course_id, designation, review, rating, is_featured, is_active, display_order) values
      ('eb2ff41d-40b1-4081-8092-7c3653051367', 'corporate', 'Prakash Shrestha', null, null, 'Head of Engineering, Himalayan Digital Solutions', 'The program was built around our own codebase and tools. Within a month the team was using what they learned in real sprint work.', null, true, true, 1),
      ('f2829e56-64ff-4a39-87dc-06dbb28e206a', 'corporate', 'Nisha Gurung', null, null, 'HR & Learning Manager, Summit Logistics', 'Scheduling around operations was our biggest worry. The hybrid format let staff attend without disrupting shifts, and completion was high.', null, true, true, 2),
      ('8856ba13-a53a-4af4-88f1-db50459ffd7e', 'corporate', 'Suman Rai', null, null, 'Finance Director, Everest Fintech Group', 'Our analysts now build their own Power BI reports instead of waiting on IT. The trainers kept every exercise tied to our real reporting needs.', null, true, true, 3),
      ('35cfc0a2-8871-4412-8484-4452a5c8a0f2', 'academic', 'Dr. Kamala Joshi', null, null, 'Principal, Valley Institute of Technology', 'Students came out of the bootcamp with projects they could show employers. The mentors worked closely with our faculty throughout.', null, true, true, 1),
      ('e6b0b1fc-4926-450c-8130-3bf616295043', 'academic', 'Ramesh Adhikari', null, null, 'IT Coordinator, Himalaya College of Computing', 'The workshops filled a real gap in our curriculum. Planning around our exam calendar was easy, and attendance stayed strong.', null, true, true, 2),
      ('3863b39e-059f-464b-8cf6-ff4e8b0275d4', 'academic', 'Anjali Mahato', null, null, 'Final-year student, Terai Science Campus', 'Building a full project with a team, the way companies do it, made internships feel far less intimidating.', null, true, true, 3),
      ('2418dff9-16ca-481f-8828-e80dee63679f', 'government', 'Binod Poudel', null, null, 'IT Officer, Municipal e-Governance Unit', 'The cybersecurity sessions were practical and matched the systems our staff use every day. We have already changed several routines.', null, true, true, 1),
      ('4f78386b-d00e-4106-8029-01da30f60883', 'government', 'Sita Bhandari', null, null, 'Program Officer, Public Service Skills Institute', 'Leafclutch adapted the content for participants with very different starting levels, and the follow-up support helped it stick.', null, true, true, 2),
      ('4bd5029c-dace-4706-8817-81151f84caf9', 'government', 'Hari Thapa', null, null, 'Data Section Chief, Local Government Data Office', 'Our team now builds its own dashboards for monthly reporting. The training used our own data formats, which made all the difference.', null, true, true, 3)
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:testimonials:2');
  end if;
end $seed$;

-- MOCK partners — fictional organisations; replace with real, approved
-- partners and their logos before launch.
do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:training_partners:1') then
    insert into public.training_partners (id, type, name, logo, website, display_order, is_active) values
      ('e33386c6-c509-4982-8a3c-7b8693512551', 'corporate', 'Himalayan Digital Solutions', null, null, 1, true),
      ('277b9d0d-cc80-47a2-85e4-41cbfebfe865', 'corporate', 'TechBridge Nepal', null, null, 2, true),
      ('fe8525b6-02f3-4b43-8967-efb3f42ae961', 'corporate', 'Everest Fintech Group', null, null, 3, true),
      ('ef6cc3e5-f2a5-4725-80b3-21fe3ababd44', 'corporate', 'Summit Logistics', null, null, 4, true),
      ('824036f9-4143-459d-83c8-37d28a57e1ca', 'corporate', 'Annapurna Retail Co.', null, null, 5, true),
      ('ac592426-0428-4351-86d4-08141a3ec631', 'corporate', 'Koshi Energy Services', null, null, 6, true),
      ('b5cbb69c-9d02-40bb-8e3b-4e5da0730de7', 'corporate', 'Bagmati Insurance Partners', null, null, 7, true),
      ('2ce26ca2-f5e4-46e1-8a13-521fa8be8174', 'corporate', 'Lumbini Health Network', null, null, 8, true),
      ('d9e3708d-990e-433b-8298-e785efb53788', 'academic', 'Future Skills Academy', null, null, 1, true),
      ('7e257c56-07ca-43e6-8820-c2deb44a6d53', 'academic', 'Valley Institute of Technology', null, null, 2, true),
      ('bbebcc0d-a560-4dbd-8c3f-7bfad0e584c0', 'academic', 'Himalaya College of Computing', null, null, 3, true),
      ('a8852bcf-762b-43a3-8c3f-7a7c3b7fc076', 'academic', 'Fewa Engineering Campus', null, null, 4, true),
      ('62c03add-97f9-4037-885c-9bc0dd42d8a8', 'academic', 'Greenfield Management College', null, null, 5, true),
      ('44824a5a-48a0-460c-8838-c5ae137fdb99', 'academic', 'Terai Science Campus', null, null, 6, true),
      ('15e97669-83a7-4832-8781-3ec3d5b31315', 'academic', 'Riverside Higher Secondary School', null, null, 7, true),
      ('c08ba0b5-eccf-41c3-841f-b4f582107fef', 'academic', 'Mountview IT College', null, null, 8, true),
      ('a680d9ac-f4c9-429d-8e75-feb711a6d11a', 'government', 'Digital Innovation Center', null, null, 1, true),
      ('cafa2a66-fc5a-409b-84d7-0a0ed23785d9', 'government', 'Provincial IT Training Centre', null, null, 2, true),
      ('e30f7c17-b439-42af-8958-9b2b46a2618d', 'government', 'Municipal e-Governance Unit', null, null, 3, true),
      ('bfc6a215-5faf-472c-8980-55cf2f192026', 'government', 'Public Service Skills Institute', null, null, 4, true),
      ('2d51c2ae-0701-4c8a-854e-534ce547d75f', 'government', 'Rural Digital Literacy Program', null, null, 5, true),
      ('bc5c0044-d032-4eba-8659-d49563a7e0a1', 'government', 'Local Government Data Office', null, null, 6, true),
      ('10baa28e-149f-4843-8c98-b64f8c5e7f39', 'government', 'Civil Records Modernisation Project', null, null, 7, true),
      ('3928d8b2-678e-4624-8d4c-a8b7375ad81f', 'government', 'Community Library Network', null, null, 8, true)
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:training_partners:1');
  end if;
end $seed$;

-- Training page lists: why-choose-us features, programs, process steps (a step
-- with no type is shown on all three pages) and images.
do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:training_page_items:1') then
    insert into public.training_page_items (id, type, section, icon, title, description, display_order) values
      ('81c6f16e-db73-42d4-863c-ae0e48eaf3e7', null, 'process_step', null, 'Understand Your Requirements', 'We meet your team to understand goals, current skill levels, participant numbers and constraints.', 1),
      ('9e4cdbbd-e01c-4555-87ec-5885d6b1c2f0', null, 'process_step', null, 'Design the Training Program', 'We shape the curriculum, schedule, delivery mode and practical exercises around what you need.', 2),
      ('041f0b11-0731-4c78-80c4-1369d423ad0f', null, 'process_step', null, 'Deliver Practical Training', 'Experienced trainers run hands-on sessions on-site, online or hybrid, built around real tasks.', 3),
      ('4b3a63e4-ee8b-4144-8cfc-4189d31a7b0e', null, 'process_step', null, 'Evaluate & Support', 'We assess progress, share a completion report and stay available for follow-up questions.', 4),
      ('ed33ff70-63d6-45a1-87d4-023792d19acc', 'corporate', 'feature', 'BriefcaseBusiness', 'Industry-Focused Training', 'Training designed around real workplace requirements and current technology trends.', 1),
      ('c849c2b5-728f-4ef9-81c5-a9562327922c', 'corporate', 'feature', 'Settings2', 'Customized Learning Programs', 'Programs adapted to your organizational goals, teams and skill gaps.', 2),
      ('0758fc28-692e-4c75-8b87-db76eb11b838', 'corporate', 'feature', 'FolderCode', 'Practical Project-Based Learning', 'Employees learn through practical tasks and real-world scenarios.', 3),
      ('e1abc66a-962d-43d1-8593-b09386b19751', 'corporate', 'feature', 'CalendarClock', 'Flexible Delivery', 'On-site, online and hybrid options that fit around work schedules.', 4),
      ('fae261b0-023f-498d-88ed-59272a884cc1', 'corporate', 'feature', 'UsersRound', 'Experienced Trainers', 'Learn from professionals with practical technology experience.', 5),
      ('906e8594-eb5d-42ee-8876-5f8ff3f10a72', 'corporate', 'feature', 'ChartNoAxesCombined', 'Measurable Skill Development', 'A focus on practical capabilities employees can apply in their work.', 6),
      ('5e194d8e-c35c-46cd-8868-e4f04451437b', 'corporate', 'program', 'Rocket', 'Employee Upskilling', 'Structured learning paths that close specific skill gaps across a team.', 1),
      ('acf66291-ebd9-470a-8f57-e23a335bcd1a', 'corporate', 'program', 'Workflow', 'Technology Transformation', 'Prepare teams to adopt new platforms, tools and ways of working.', 2),
      ('850f0cd4-b560-4e66-8088-77aaa95f2157', 'corporate', 'program', 'Bot', 'AI & Automation', 'Practical use of AI assistants, agents and workflow automation at work.', 3),
      ('66e207b4-f554-4cc5-849e-20f6ba27fa3a', 'corporate', 'program', 'BarChart3', 'Data & Analytics', 'Turn business data into dashboards, reports and better decisions.', 4),
      ('212e2a38-8c10-4a7d-8198-4bb6e8c1acac', 'corporate', 'program', 'ShieldCheck', 'Cybersecurity', 'Security awareness for all staff and hands-on skills for technical teams.', 5),
      ('a374c8bf-2bbd-4bb8-8ab3-d3a3eaed5886', 'corporate', 'program', 'Laptop', 'Digital Productivity', 'Get more from everyday tools for documents, collaboration and planning.', 6),
      ('f4e1e470-d926-428a-820f-d76dbc4dcb4a', 'academic', 'feature', 'BookOpenCheck', 'Industry-Relevant Curriculum', 'Help students develop skills aligned with modern technology careers.', 1),
      ('a8e31ecd-accf-4456-8f65-2aaaccc7da5f', 'academic', 'feature', 'FolderCode', 'Hands-On Projects', 'Students learn by building practical projects rather than relying only on theory.', 2),
      ('ad8d6a38-a637-4396-8a61-44b83020afad', 'academic', 'feature', 'UsersRound', 'Experienced Mentors', 'Guidance from trainers with practical industry experience.', 3),
      ('02702f1a-76aa-4ba2-8280-5fb71fd9e725', 'academic', 'feature', 'BriefcaseBusiness', 'Career & Internship Exposure', 'Help students understand professional environments and career expectations.', 4),
      ('c3b6838a-0d60-4d17-842d-af9b46e59b56', 'academic', 'feature', 'Award', 'Certification', 'Recognize students'' learning and practical achievements.', 5),
      ('0666cd1d-e3fd-46be-837d-539e5ac14d25', 'academic', 'feature', 'Handshake', 'Institutional Collaboration', 'We work with your institution to develop relevant learning programs.', 6),
      ('19c7652b-1608-45f7-8a1c-f9a0351fc401', 'academic', 'program', 'Sprout', 'Student Skill Development', 'Structured tracks that build practical, job-ready technology skills.', 1),
      ('37f14b30-4504-482c-8eae-1b65cb2e8339', 'academic', 'program', 'Presentation', 'Industry-Oriented Workshops', 'Short, focused sessions on tools and practices used in industry today.', 2),
      ('59694bf0-b018-4b17-85c1-e391a6141ccc', 'academic', 'program', 'Rocket', 'Technology Bootcamps', 'Intensive, project-driven programs that run over a few weeks.', 3),
      ('4b26edcd-e1cf-41e5-8209-eb0dbe1c7a43', 'academic', 'program', 'BriefcaseBusiness', 'Internship Preparation', 'Portfolios, interview practice and team projects before placements.', 4),
      ('b563076d-f2e9-4ffe-81e8-a780cca33764', 'academic', 'program', 'GraduationCap', 'Faculty Development', 'Help teaching staff stay current with new tools and technologies.', 5),
      ('2a9c0840-e386-4f6e-8cf0-a6e48550f286', 'academic', 'program', 'Target', 'Career-Oriented Training', 'Courses mapped to specific roles such as developer, analyst or designer.', 6),
      ('9fdb118f-0f75-45bc-8ae0-cb2f9e0ffc87', 'government', 'feature', 'Landmark', 'Public-Sector Relevant Training', 'Programs designed around digital transformation and institutional requirements.', 1),
      ('2603f484-7363-42c7-8ec2-810ea5b75717', 'government', 'feature', 'Laptop', 'Digital Skills Development', 'Build practical technology capabilities among government personnel.', 2),
      ('41c1d367-cd75-4e93-8d0e-8c42b23d7c67', 'government', 'feature', 'Settings2', 'Customized Programs', 'Training adapted to departmental and organizational requirements.', 3),
      ('d0e8660a-9d88-4e61-88ac-4ac6d1699fd9', 'government', 'feature', 'CalendarClock', 'Flexible Delivery', 'Support for on-site, online and hybrid training.', 4),
      ('82d76e84-9890-405b-8020-b4f6e53fa7d4', 'government', 'feature', 'UsersRound', 'Experienced Trainers', 'Professional trainers with practical technology experience.', 5),
      ('4325ebf5-fb81-493a-887f-7867c1ecc692', 'government', 'feature', 'Sprout', 'Sustainable Capacity Building', 'A focus on skills teams can keep applying after the training ends.', 6),
      ('f554695e-4eba-428a-81e5-90aaf1f17631', 'government', 'program', 'Building2', 'Digital Transformation', 'Prepare teams to plan, adopt and run digital public services.', 1),
      ('b9e2090b-b02c-4b48-8eb0-2d98a03c0990', 'government', 'program', 'BarChart3', 'Data & Analytics', 'Use data for reporting, planning and evidence-based decisions.', 2),
      ('0b2ed7f4-57d8-4ce5-8f92-6a3c75cee4ff', 'government', 'program', 'ShieldCheck', 'Cybersecurity Awareness', 'Protect public data and systems through safe everyday practice.', 3),
      ('e971d1e1-f45c-4667-8493-545e6650003c', 'government', 'program', 'Bot', 'AI & Emerging Technologies', 'Understand where AI and automation can responsibly support public work.', 4),
      ('c18ddc55-4849-4fc3-8a13-286b95a7540c', 'government', 'program', 'Laptop', 'Digital Productivity', 'Confident use of office, collaboration and document-management tools.', 5),
      ('c7c52615-250b-4e64-8aed-52c2a03752a9', 'government', 'program', 'Wrench', 'Technical Capacity Building', 'Deeper skills for IT officers in systems, networks and development.', 6)
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:training_page_items:1');
  end if;
end $seed$;

-- Placeholder CC0 stock photos (public/training/*) until real Leafclutch photos exist.
do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:training_page_images:1') then
    insert into public.training_page_images (id, type, placement, image_url, alt, display_order) values
      ('56eec2ef-04f9-45a4-89ba-6dbb00987f21', 'corporate', 'hero', '/training/corporate/trainer-flipchart.jpg', 'A trainer leads a planning session at a flipchart while colleagues listen', 1),
      ('ecd8b000-5306-4fac-8620-65755555bd92', 'corporate', 'hero', '/training/corporate/team-session.jpg', 'A team works through an exercise on laptops around a meeting table', 2),
      ('67a3370c-6b9b-44e1-8606-f67b1b23649d', 'corporate', 'hero', '/training/corporate/whiteboard-workshop.jpg', 'A facilitator maps a workflow on a whiteboard during a workshop', 3),
      ('5cef17f7-276a-4490-824e-e660b7f5b366', 'corporate', 'hero', '/training/corporate/team-laptops.jpg', 'Colleagues of different ages discuss a task together at a shared desk', 4),
      ('6249e4de-c73a-4d30-883a-8222ac958267', 'corporate', 'why_choose_us', '/training/corporate/pair-review.jpg', 'Two colleagues review work on a laptop together', 1),
      ('133abb48-b10b-4d0d-893c-5d504e70d4f8', 'corporate', 'why_choose_us', '/training/corporate/process-mapping.jpg', 'A participant sketches a process flowchart on a whiteboard', 2),
      ('9d98eb9e-f28c-429b-85c9-c54d0c9e50e1', 'corporate', 'why_choose_us', '/training/corporate/team-overhead.jpg', 'A team gathered around a table with laptops, seen from above', 3),
      ('a862217d-4a09-458d-8975-5058cea6b125', 'academic', 'hero', '/training/academic/lecture-hall.jpg', 'Students seated in a lecture hall during a session', 1),
      ('a25673b2-cf26-4167-865b-64dec3226823', 'academic', 'hero', '/training/academic/group-project.jpg', 'A group of students plan a project together around a table', 2),
      ('57cd41b9-92a5-44c6-87e9-172f6221f308', 'academic', 'hero', '/training/academic/student-presentation.jpg', 'A student presents ideas on a board to classmates', 3),
      ('ac18fa48-458c-4a11-83ed-d43ae699b49a', 'academic', 'hero', '/training/academic/project-planning.jpg', 'Students sketch and annotate a project plan on large sheets of paper', 4),
      ('df207193-0e75-496a-8906-df63b7f59ac7', 'academic', 'why_choose_us', '/training/academic/study-notes.jpg', 'Students working through notes and diagrams with coloured markers', 1),
      ('e598ee06-3635-4cb6-834d-c109b24428bc', 'academic', 'why_choose_us', '/training/academic/code-laptop.jpg', 'Code open in an editor on a laptop', 2),
      ('9b76a2f2-6acd-49aa-880f-b72e6902443b', 'academic', 'why_choose_us', '/training/academic/student-laptop.jpg', 'A student takes notes beside a laptop', 3),
      ('6a9265ea-6897-455b-80da-bd4a54e28d4b', 'government', 'hero', '/training/government/facilitated-workshop.jpg', 'A facilitator leads a workshop discussion beside a planning board', 1),
      ('e2adedd0-9477-4c80-8666-5b1e8e2d206e', 'government', 'hero', '/training/government/conference-hall.jpg', 'Participants seated in a large conference hall', 2),
      ('a2f2c53e-c007-4c39-8d8f-817acb2255b2', 'government', 'hero', '/training/government/workshop-discussion.jpg', 'A trainer explains a topic to a seated group of participants', 3),
      ('f3c7c051-69f9-48e3-8ad9-eba12d736ce7', 'government', 'hero', '/training/government/seminar.jpg', 'A participant takes notes during a seminar', 4),
      ('04599d2a-0a15-4f3c-803b-4bda68b7089e', 'government', 'why_choose_us', '/training/government/data-dashboard.jpg', 'A data dashboard with charts open on a tablet', 1),
      ('c98364cf-3b89-404f-8def-98f506356e39', 'government', 'why_choose_us', '/training/government/network-infrastructure.jpg', 'A technician connects network cables in a server rack', 2),
      ('80ea327d-c629-4d65-8ddd-2673ab67c787', 'government', 'why_choose_us', '/training/government/digital-skills.jpg', 'An experienced professional works on a laptop', 3)
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:training_page_images:1');
  end if;
end $seed$;

-- Training page text (headings, descriptions, button labels), one row per page.
do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:training_pages:1') then
    insert into public.training_pages (type, hero_eyebrow, hero_title, hero_description, hero_cta_label, partners_title, courses_title, courses_description, why_title, why_description, process_title, process_description, programs_title, programs_description, testimonials_title, testimonials_description, cta_title, cta_description, cta_label) values
      ('corporate', 'Corporate Training', 'Empower Your Team With Industry-Ready Technology Skills', 'Equip your workforce with practical, industry-focused technology training designed around your organization''s goals, challenges, and future needs.', 'Request Corporate Training', 'Trusted by Businesses & Organizations', 'Corporate Courses', 'Proven courses we adapt for teams, from AI and automation to cloud, security and analytics.', 'Training that fits the way your team works', 'We build programs around your tools, your projects and your schedule, so new skills show up in day-to-day work.', 'How we run a corporate program', 'A clear four-step process, from the first conversation to follow-up support.', 'Programs built around your goals', 'Beyond individual courses, we design complete programs for teams and departments.', 'What our corporate clients say', 'Feedback from teams who have trained with Leafclutch.', 'Ready to Upskill Your Team?', 'Let''s build a training program around your organization''s goals.', 'Request Corporate Training'),
      ('academic', 'Academic Training', 'Prepare Students for the Skills and Careers of Tomorrow', 'Help students bridge the gap between academic learning and industry expectations through practical, mentor-led technology training.', 'Partner With Us', 'Our Academic Partners', 'Academic Courses', 'Career-focused courses we run for colleges and schools, from web development to data and design.', 'Learning that connects the classroom to industry', 'We work alongside your faculty to give students practical skills, real projects and a clear view of technology careers.', 'How we work with your institution', 'A clear four-step process, planned around your academic calendar.', 'Programs for students and faculty', 'From single workshops to semester-long programs, we plan the format with your institution.', 'What our academic partners say', 'Feedback from institutions and faculty who have worked with Leafclutch.', 'Let''s Prepare Students for the Future', 'Partner with Leafclutch to bring industry-focused technology learning to your institution.', 'Partner With Us'),
      ('government', 'Government Training', 'Building Digital Skills for a Smarter Public Sector', 'Support digital transformation with practical technology training designed for government teams, institutions, and public-sector initiatives.', 'Request Government Training', 'Supporting Public Sector & Government Initiatives', 'Government Courses', 'Courses we adapt for public institutions, covering data, security, cloud and emerging technology.', 'Capacity building that lasts beyond the training room', 'We design training around institutional needs and public-sector realities, so teams keep applying what they learn.', 'How we run a public-sector program', 'A clear four-step process that fits institutional planning and reporting.', 'Programs for public institutions', 'We plan programs with your department, from awareness sessions to in-depth technical training.', 'What public-sector teams say', 'Feedback from government teams and programs we have trained.', 'Build Digital Capacity for the Future', 'Let''s design practical technology training around your institution''s needs.', 'Request Government Training')
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:training_pages:1');
  end if;
end $seed$;

-- Tools covered by each course.
do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:course_tools:1') then
    insert into public.course_tools (id, course_id, name, description, display_order) values
      ('44a7643e-65b0-4dc0-8d7d-1397fab3fbca', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'JavaScript', 'ES6+ and async code', 1),
      ('96e645f8-0b39-4565-8174-4a07abadefb1', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'React', 'Components, state and routing', 2),
      ('1d71d1ff-c227-4461-88e0-ef3c885ee9cd', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'Node.js', 'Server-side JavaScript', 3),
      ('0df0c5f7-ee13-4a82-8412-7d35710ef65f', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'Express', 'REST APIs and middleware', 4),
      ('00e9af7a-b95e-4f22-80af-f5d912b68209', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'MongoDB', 'Document database', 5),
      ('ebe1ec12-e6e9-4864-83ed-1a368f561519', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'Mongoose', 'Schemas and models', 6),
      ('42bd8e72-6a5e-458d-8f35-e8d6cc9c2979', 'a626064a-7374-423e-86d6-1f8797f54a7c', 'Python', 'The language for the whole course', 1),
      ('90f4f08c-3de8-4ff4-8517-13a74c4890da', 'a626064a-7374-423e-86d6-1f8797f54a7c', 'NumPy', 'Fast numerical arrays', 2),
      ('f6fb23a8-d504-464e-8934-aef062211314', 'a626064a-7374-423e-86d6-1f8797f54a7c', 'pandas', 'Cleaning and reshaping data', 3),
      ('8ed9a0dc-fea6-4786-8e91-114dc8fde89e', 'a626064a-7374-423e-86d6-1f8797f54a7c', 'SQL', 'Queries and joins', 4),
      ('665e0947-1f18-4518-8635-2c7437952a16', 'a626064a-7374-423e-86d6-1f8797f54a7c', 'Matplotlib', 'Charts and plots', 5),
      ('985b7bb8-4463-4e49-8773-051491d5e263', 'a626064a-7374-423e-86d6-1f8797f54a7c', 'Seaborn', 'Statistical visualisation', 6)
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:course_tools:1');
  end if;
end $seed$;

-- Udemy courses included free with a course (content Leafclutch maintains).
do $seed$ begin
  if not exists (select 1 from private.seed_log where name = 'insert:course_udemy_bonus:1') then
    insert into public.course_udemy_bonus (id, course_id, title, description, image_url, instructor, rating, ratings_count, total_hours, lectures, level, course_url, display_order) values
      ('676fd8f2-a0da-48ea-8e60-cf8ce84b2f59', 'f42af617-4d01-4006-888b-4d6d6b6052f4', 'Complete web development course', 'Only web development course that you will need. Covers HTML, CSS, Tailwind, Node, React, MongoDB, Prisma, Deployment etc', 'https://img-c.udemycdn.com/course/480x270/6035102_7d1a.jpg', 'Hitesh Choudhary', 4.5, 22660, '99h 48m', 331, 'All Levels', 'https://www.udemy.com/course/web-dev-master/', 1)
    on conflict do nothing;
    insert into private.seed_log (name) values ('insert:course_udemy_bonus:1');
  end if;
end $seed$;
