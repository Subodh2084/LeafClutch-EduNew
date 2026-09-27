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
