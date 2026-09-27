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
