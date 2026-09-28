# Supabase backend

## Setup

1. Create a new Supabase project.
2. **Easiest:** paste `setup.sql` into the SQL editor and click Run. It contains every migration below plus the seed, in order, and is safe to run again at any time (after pulling changes, just run it again). Regenerate it with `npm run db:bundle` after changing a migration or the seed.

   Or run the migrations one by one, in order, with `npx supabase db push` or the SQL editor:

   | File | Contents |
   | --- | --- |
   | `…01_auth_and_helpers.sql` | profiles, admin role, `is_admin()`, shared RLS setup |
   | `…02_courses.sql` | categories, courses, benefits, modules, lessons, instalments |
   | `…03_instructors.sql` | instructors, course ↔ instructor links |
   | `…04_site_content.sql` | FAQs, testimonials, offers, site settings |
   | `…05_training.sql` | training programs, objectives, topics, gallery |
   | `…06_storage.sql` | storage buckets with size and type limits |
   | `…07_remove_payment_methods.sql` | removes the old payment tables from databases that still have them |
   | `…08_home_stats.sql` | home page stats |
   | `…09_about_contact.sql` | About page cards (values, features, learning steps), Contact opening hours |
   | `…10_training_pages.sql` | training partners, courses per training page, organisation testimonials |
   | `…11_training_page_lists.sql` | training page features, programs, process steps and images |
   | `…12_training_page_text.sql` | training page headings, descriptions and button labels |
   | `20260927…_site_settings_logo_desc.sql` | site name, logos, favicon and description in site settings |
   | `20260928…_course_tools_udemy.sql` | course tools, free Udemy courses; no courses on the training pages |
   | `20260929…_site_settings_map.sql` | Google Maps link for the Contact page |
   | `20260930…_rename_leafclutch.sql` | brand spelling "Leafclutch" in all stored text |

3. Run `seed.sql`. It loads the content that used to live in `src/data`. Most of it is placeholder copy.

   Migrations and seed are safe to run again, on a new or an existing database. Each part of the seed runs only once per database (tracked in `private.seed_log`), so rows you edit or delete are never brought back or overwritten.
4. Copy `.env.example` to `.env.local` and fill in the URL and anon key.
5. Create the admin: add a user under Authentication → Users, then run `select public.promote_to_admin('you@example.com');` in the SQL editor.

No service-role key is needed. Admin actions run as the signed-in admin, and RLS checks every write.

## Code map

- `src/lib/courses.ts`, `src/lib/content.ts`, `src/lib/training.ts`: public reads. Nothing is cached, so every page load reads live data.
- `src/actions/*`: admin server actions. Each one validates with Zod (`src/lib/validation/admin.ts`), calls `requireAdmin()`, then writes. They return `{ ok: true, data }` or `{ ok: false, error, fieldErrors }`.
- `src/lib/storage.ts`: bucket limits. Uploads are checked by their actual file bytes, not by file name.
- `src/lib/whatsapp.ts`: builds WhatsApp links from `site_settings.whatsapp`.

Any change, whether made in the Supabase dashboard or through the admin actions, shows on the next page load.
