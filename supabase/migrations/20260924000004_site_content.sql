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
