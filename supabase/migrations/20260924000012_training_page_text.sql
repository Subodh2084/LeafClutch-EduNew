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
