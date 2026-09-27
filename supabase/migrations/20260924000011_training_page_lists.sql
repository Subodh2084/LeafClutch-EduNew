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
