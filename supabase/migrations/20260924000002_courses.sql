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
