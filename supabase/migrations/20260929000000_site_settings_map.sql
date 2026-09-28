-- 15/15 · Google Maps on the Contact page. The admin pastes Google Maps'
-- "Embed a map" link (Share → Embed a map); the site stores only the link.

alter table public.site_settings
  add column if not exists map_embed_url text;

alter table public.site_settings drop constraint if exists site_settings_map_embed_url_check;
alter table public.site_settings add constraint site_settings_map_embed_url_check
  check (map_embed_url is null or map_embed_url ~ '^https://www\.google\.com/maps/embed\?');
