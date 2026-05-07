begin;

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists auth_users_sync_profile on auth.users;
drop trigger if exists auth_users_update_profile on auth.users;

drop function if exists public.handle_new_user();
drop function if exists public.sync_profile_from_auth();
drop function if exists public.sync_profile_email_update();

create or replace function public.sync_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, created_at, updated_at)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'Usuario'
    ),
    coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'student')::public.user_role,
    now(),
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = now();

  return new;
end;
$$;

create or replace function public.sync_profile_email_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    email = new.email,
    full_name = coalesce(
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'name', ''),
      public.profiles.full_name
    ),
    updated_at = now()
  where id = new.id;

  return new;
end;
$$;

create trigger auth_users_sync_profile
after insert on auth.users
for each row execute function public.sync_profile_from_auth();

create trigger auth_users_update_profile
after update of email, raw_user_meta_data on auth.users
for each row execute function public.sync_profile_email_update();

commit;
