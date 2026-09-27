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
