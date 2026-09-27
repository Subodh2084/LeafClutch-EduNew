-- 1/10 · Auth, admin role and shared helpers
--
-- Public visitors read published/active content through RLS. Admins write
-- through server actions that run as the signed-in admin, so RLS is enforced
-- on every write too.
--
-- Every migration is safe to run again: on an empty database it creates
-- everything, on an existing one it changes nothing that is already there.
--
-- Create the first admin:
--   1. Supabase Dashboard → Authentication → Users → Add user
--   2. SQL editor: select public.promote_to_admin('you@example.com');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles & admin role
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'student' check (role in ('admin', 'student')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Role is never taken from sign-up metadata (users control that), so the only
-- way to become admin is promote_to_admin(), which only the SQL editor can run.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.promote_to_admin(user_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set role = 'admin' where email = user_email;
  if not found then
    raise exception 'No profile found for %', user_email;
  end if;
end;
$$;

revoke execute on function public.promote_to_admin(text) from public, anon, authenticated;

alter table public.profiles enable row level security;
grant select on public.profiles to authenticated;
-- Read-only for users: no update policy, so nobody can change their own role.
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Content-table setup, used by the following migrations
-- ---------------------------------------------------------------------------
-- The `private` schema is not exposed through the API.

create schema if not exists private;

-- For a content table: enable RLS, let admins do everything, grant table
-- access (RLS still decides which rows), and keep updated_at current.
-- Public read policies are written per table, next to the table.
create or replace procedure private.setup_content_table(t text, has_updated_at boolean default true)
language plpgsql
set search_path = ''
as $$
begin
  execute format('alter table public.%I enable row level security', t);
  execute format('drop policy if exists "Admins manage %1$s" on public.%1$I', t);
  execute format(
    'create policy "Admins manage %1$s" on public.%1$I for all to authenticated
       using ((select public.is_admin())) with check ((select public.is_admin()))', t);
  execute format('grant select on public.%I to anon, authenticated', t);
  execute format('grant insert, update, delete on public.%I to authenticated', t);
  if has_updated_at then
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t);
  end if;
end;
$$;

revoke all on procedure private.setup_content_table(text, boolean) from public;
