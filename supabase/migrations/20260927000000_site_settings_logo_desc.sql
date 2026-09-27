-- Add site_name, logo_url, footer_logo_url, favicon_url and description to site_settings
alter table public.site_settings
  add column if not exists site_name text,
  add column if not exists logo_url text,
  add column if not exists footer_logo_url text,
  add column if not exists favicon_url text,
  add column if not exists description text;
