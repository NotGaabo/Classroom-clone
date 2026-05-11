begin;

create or replace function public.handle_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  has_profiles_table boolean;
  has_full_name boolean;
  has_avatar_url boolean;
  has_email boolean;
  has_role boolean;
  has_is_active boolean;
  full_name_value text;
  avatar_url_value text;
  insert_columns text[] := array['id'];
  insert_values text[] := array[quote_nullable(new.id::text)];
  update_assignments text[] := array[]::text[];
  sql text;
begin
  select exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'profiles'
  ) into has_profiles_table;

  if not has_profiles_table then
    return new;
  end if;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'full_name'
  ) into has_full_name;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'avatar_url'
  ) into has_avatar_url;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'email'
  ) into has_email;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'role'
  ) into has_role;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'is_active'
  ) into has_is_active;

  full_name_value := nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '');
  avatar_url_value := nullif(trim(coalesce(new.raw_user_meta_data ->> 'avatar_url', '')), '');

  if has_full_name then
    insert_columns := array_append(insert_columns, 'full_name');
    insert_values := array_append(insert_values, quote_nullable(full_name_value));
    update_assignments := array_append(
      update_assignments,
      'full_name = coalesce(excluded.full_name, public.profiles.full_name)'
    );
  end if;

  if has_avatar_url then
    insert_columns := array_append(insert_columns, 'avatar_url');
    insert_values := array_append(insert_values, quote_nullable(avatar_url_value));
    update_assignments := array_append(
      update_assignments,
      'avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url)'
    );
  end if;

  if has_email then
    insert_columns := array_append(insert_columns, 'email');
    insert_values := array_append(insert_values, quote_nullable(new.email));
    update_assignments := array_append(
      update_assignments,
      'email = coalesce(excluded.email, public.profiles.email)'
    );
  end if;

  if has_role then
    insert_columns := array_append(insert_columns, 'role');
    insert_values := array_append(insert_values, quote_literal('student') || '::public.app_role');
  end if;

  if has_is_active then
    insert_columns := array_append(insert_columns, 'is_active');
    insert_values := array_append(insert_values, 'true');
    update_assignments := array_append(
      update_assignments,
      'is_active = coalesce(public.profiles.is_active, excluded.is_active)'
    );
  end if;

  sql := 'insert into public.profiles (' || array_to_string(insert_columns, ', ') || ') values (' ||
    array_to_string(insert_values, ', ') || ') on conflict (id) do update set ' ||
    case
      when array_length(update_assignments, 1) is null then 'id = public.profiles.id'
      else array_to_string(update_assignments, ', ')
    end;

  execute sql;

  return new;
end;
$$;

create or replace function public.ensure_notification_preferences()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  has_preferences_table boolean;
begin
  select exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'notification_preferences'
  ) into has_preferences_table;

  if not has_preferences_table then
    return new;
  end if;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_profile_from_auth_user();

drop trigger if exists profiles_notification_preferences on public.profiles;
create trigger profiles_notification_preferences
  after insert on public.profiles
  for each row execute function public.ensure_notification_preferences();

commit;
