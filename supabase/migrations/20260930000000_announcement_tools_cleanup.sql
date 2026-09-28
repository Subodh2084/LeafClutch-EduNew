-- 16/16 · Site-wide announcement bar; course tools lose their logos; the
-- single "Udemy link" on a course is gone (free Udemy courses are managed in
-- course_udemy_bonus instead).

-- ---------------------------------------------------------------------------
-- A short notice shown above the navbar on every public page, e.g. "Due to
-- Dashain, all physical classes are cancelled until further notice." Empty or
-- null hides the bar.
-- ---------------------------------------------------------------------------

alter table public.site_settings
  add column if not exists announcement text;

alter table public.site_settings drop constraint if exists site_settings_announcement_check;
alter table public.site_settings add constraint site_settings_announcement_check
  check (announcement is null or char_length(announcement) <= 200);

-- ---------------------------------------------------------------------------
-- "Tools covered" shows the tool names only; no logo key.
-- ---------------------------------------------------------------------------

alter table public.course_tools drop column if exists icon;

-- ---------------------------------------------------------------------------
-- Replaced by the free Udemy courses list (course_udemy_bonus).
-- ---------------------------------------------------------------------------

alter table public.courses drop column if exists udemy_url;
