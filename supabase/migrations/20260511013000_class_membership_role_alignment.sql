create or replace function public.create_classroom(
  input_name text,
  input_description text default null
)
returns public.classes
language plpgsql
security definer
set search_path = public
as $$
declare
  created_class public.classes;
  creator_profile public.profiles;
  next_class_code text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into creator_profile
  from public.profiles
  where id = auth.uid();

  if creator_profile.id is null or creator_profile.is_active is not true then
    raise exception 'Active profile required';
  end if;

  if nullif(trim(coalesce(input_name, '')), '') is null then
    raise exception 'Class name is required';
  end if;

  next_class_code := public.generate_class_code(8);

  insert into public.classes (
    name,
    description,
    teacher_id,
    class_code,
    code
  )
  values (
    trim(input_name),
    nullif(trim(coalesce(input_description, '')), ''),
    auth.uid(),
    next_class_code,
    next_class_code
  )
  returning * into created_class;

  insert into public.class_members (
    class_id,
    user_id,
    role
  )
  values (
    created_class.id,
    auth.uid(),
    'teacher'::public.app_role
  )
  on conflict (class_id, user_id) do update
  set role = excluded.role;

  return created_class;
end;
$$;

create or replace function public.join_class_by_code(input_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_code text;
  requester_profile public.profiles;
  target_class public.classes;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into requester_profile
  from public.profiles
  where id = auth.uid();

  if requester_profile.id is null or requester_profile.is_active is not true then
    raise exception 'Active profile required';
  end if;

  normalized_code := upper(trim(coalesce(input_code, '')));

  select *
  into target_class
  from public.classes c
  where upper(c.class_code) = normalized_code
     or upper(c.code) = normalized_code
  limit 1;

  if target_class.id is null then
    return jsonb_build_object('status', 'not_found');
  end if;

  if exists (
    select 1
    from public.class_members cm
    where cm.class_id = target_class.id
      and cm.user_id = auth.uid()
  ) then
    return jsonb_build_object(
      'status', 'already_member',
      'class', row_to_json(target_class)
    );
  end if;

  insert into public.class_members (
    class_id,
    user_id,
    role
  )
  values (
    target_class.id,
    auth.uid(),
    'student'::public.app_role
  );

  return jsonb_build_object(
    'status', 'joined',
    'class', row_to_json(target_class)
  );
end;
$$;
