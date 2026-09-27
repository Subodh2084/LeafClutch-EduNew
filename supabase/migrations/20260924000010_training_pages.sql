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
