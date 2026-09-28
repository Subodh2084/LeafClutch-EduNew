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
-- Udemy courses students get free with a course. Content LeafClutch
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
