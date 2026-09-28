// Builds supabase/setup.sql: every migration (in order) followed by the seed,
// as one file to paste into the Supabase SQL editor. Safe to run any number
// of times. Regenerate after adding or changing a migration:
//
//   npm run db:bundle

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const supabase = join(dirname(fileURLToPath(import.meta.url)), "..", "supabase");
const migrations = readdirSync(join(supabase, "migrations"))
  .filter((file) => file.endsWith(".sql"))
  .sort();

const section = (name, sql) =>
  `\n-- ===========================================================================\n-- ${name}\n-- ===========================================================================\n\n${sql.trim()}\n`;

const header = `-- Leafclutch — complete Supabase setup (generated; do not edit by hand).
--
-- Paste this whole file into the Supabase SQL editor and click Run. It is safe
-- to run again at any time: it creates whatever is missing and brings existing
-- tables up to date. Each part of the seed runs only once per database, so
-- rows you edited or deleted in Supabase or the admin are left alone.
--
-- Generated from supabase/migrations/*.sql and supabase/seed.sql by
-- "npm run db:bundle". Contents: ${migrations.length} migrations, then the seed.
`;

const body = migrations.map((file) => section(file, readFileSync(join(supabase, "migrations", file), "utf8")));
body.push(section("seed.sql", readFileSync(join(supabase, "seed.sql"), "utf8")));

writeFileSync(join(supabase, "setup.sql"), header + body.join(""));
console.log(`Wrote supabase/setup.sql (${migrations.length} migrations + seed).`);
