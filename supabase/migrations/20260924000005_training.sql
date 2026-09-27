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
