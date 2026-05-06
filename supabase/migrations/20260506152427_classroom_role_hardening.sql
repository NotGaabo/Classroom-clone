begin;

create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'app_role'
  ) then
    create type public.app_role as enum ('teacher', 'student');
  end if;
end $$;

create or replace function public.generate_class_code(code_length integer default 8)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  idx integer;
begin
  loop
    candidate := '';

    for idx in 1..greatest(code_length, 6) loop
      candidate := candidate || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    end loop;

    if not exists (
      select 1
      from public.classes
      where upper(coalesce(class_code, code)) = candidate
    ) then
      return candidate;
    end if;
  end loop;
end;
$$;

create or replace function public.is_class_member(target_class_id uuid, user_id uuid default auth.uid())
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.class_members cm
    where cm.class_id = target_class_id
      and cm.user_id = user_id
  )
$$;

create or replace function public.has_class_role(
  target_class_id uuid,
  target_role public.app_role,
  user_id uuid default auth.uid()
)
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.class_members cm
    where cm.class_id = target_class_id
      and cm.user_id = user_id
      and cm.role::text = target_role::text
  )
$$;

create or replace function public.handle_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata_role text;
  next_role public.app_role;
begin
  metadata_role := lower(coalesce(new.raw_user_meta_data ->> 'role', ''));
  next_role := case
    when metadata_role = 'teacher' then 'teacher'::public.app_role
    when metadata_role = 'student' then 'student'::public.app_role
    else 'student'::public.app_role
  end;

  insert into public.profiles (
    id,
    full_name,
    avatar_url,
    email,
    role,
    is_active
  )
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'avatar_url', '')), ''),
    new.email,
    next_role,
    true
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    email = coalesce(excluded.email, public.profiles.email),
    role = coalesce(public.profiles.role, excluded.role),
    is_active = coalesce(public.profiles.is_active, excluded.is_active);

  return new;
end;
$$;

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.role is distinct from new.role
     and auth.uid() is not null
     and current_setting('request.jwt.claim.role', true) = 'authenticated' then
    raise exception 'Role cannot be changed directly by authenticated users';
  end if;

  return new;
end;
$$;

alter table public.profiles
  add column if not exists role public.app_role;

update public.profiles p
set role = case
  when exists (
    select 1
    from public.class_members cm
    where cm.user_id = p.id
      and cm.role = 'teacher'
  ) then 'teacher'::public.app_role
  else 'student'::public.app_role
end
where p.role is null;

alter table public.profiles
  alter column role set default 'student'::public.app_role;

alter table public.profiles
  alter column role set not null;

create or replace function public.current_user_role()
returns public.app_role
language sql
stable
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
$$;

create or replace function public.is_teacher(user_id uuid default auth.uid())
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_id
      and p.role = 'teacher'::public.app_role
      and coalesce(p.is_active, true)
  )
$$;

create or replace function public.is_student(user_id uuid default auth.uid())
returns boolean
language sql
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_id
      and p.role = 'student'::public.app_role
      and coalesce(p.is_active, true)
  )
$$;

update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id
  and coalesce(p.email, '') = '';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_profile_from_auth_user();

drop trigger if exists profiles_prevent_role_change on public.profiles;
create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_profile_role_change();

alter table public.classes
  add column if not exists teacher_id uuid references public.profiles(id) on delete restrict,
  add column if not exists class_code text;

update public.classes c
set teacher_id = teacher_row.user_id
from (
  select distinct on (cm.class_id)
    cm.class_id,
    cm.user_id
  from public.class_members cm
  where cm.role = 'teacher'
  order by cm.class_id, cm.joined_at nulls first, cm.id
) as teacher_row
where c.id = teacher_row.class_id
  and c.teacher_id is null;

with orphan_members as (
  select distinct on (cm.class_id)
    cm.class_id,
    cm.user_id
  from public.class_members cm
  left join public.class_members teachers
    on teachers.class_id = cm.class_id
   and teachers.role = 'teacher'
  where teachers.id is null
  order by cm.class_id, cm.joined_at nulls first, cm.id
)
update public.class_members cm
set role = 'teacher'
from orphan_members om
where cm.class_id = om.class_id
  and cm.user_id = om.user_id
  and cm.role <> 'teacher';

update public.profiles p
set role = 'teacher'::public.app_role
where exists (
  select 1
  from public.class_members cm
  where cm.user_id = p.id
    and cm.role = 'teacher'
);

update public.classes c
set teacher_id = teacher_row.user_id
from (
  select distinct on (cm.class_id)
    cm.class_id,
    cm.user_id
  from public.class_members cm
  where cm.role = 'teacher'
  order by cm.class_id, cm.joined_at nulls first, cm.id
) as teacher_row
where c.id = teacher_row.class_id
  and c.teacher_id is null;

update public.classes
set class_code = upper(trim(coalesce(nullif(class_code, ''), nullif(code, ''), public.generate_class_code(8))))
where class_code is null
   or trim(class_code) = '';

do $$
declare
  duplicate_record record;
  duplicate_ids uuid[];
  idx integer;
begin
  for duplicate_record in
    select upper(class_code) as normalized_code, array_agg(id order by created_at, id) as ids
    from public.classes
    group by upper(class_code)
    having count(*) > 1
  loop
    duplicate_ids := duplicate_record.ids;

    for idx in 2..array_length(duplicate_ids, 1) loop
      update public.classes
      set class_code = public.generate_class_code(8)
      where id = duplicate_ids[idx];
    end loop;
  end loop;
end $$;

update public.classes
set class_code = upper(class_code),
    code = upper(class_code);

alter table public.classes
  alter column teacher_id set not null;

alter table public.classes
  alter column class_code set not null;

alter table public.classes
  alter column code set not null;

create unique index if not exists classes_class_code_unique_idx
  on public.classes (upper(class_code));

create unique index if not exists classes_code_unique_idx
  on public.classes (upper(code));

create or replace function public.sync_legacy_class_code()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.class_code is null or trim(new.class_code) = '' then
    new.class_code := upper(trim(coalesce(new.code, public.generate_class_code(8))));
  else
    new.class_code := upper(trim(new.class_code));
  end if;

  new.code := new.class_code;
  return new;
end;
$$;

drop trigger if exists classes_sync_legacy_code on public.classes;
create trigger classes_sync_legacy_code
  before insert or update on public.classes
  for each row execute function public.sync_legacy_class_code();

drop policy if exists classes_insert_authenticated on public.classes;
drop policy if exists classes_insert_teacher_owner on public.classes;
drop policy if exists classes_select_members on public.classes;
drop policy if exists classes_update_teacher on public.classes;
drop policy if exists classes_delete_teacher on public.classes;
drop policy if exists class_members_insert_own on public.class_members;
drop policy if exists class_members_insert_student_self on public.class_members;
drop policy if exists class_members_select_members on public.class_members;
drop policy if exists assignments_select_members on public.assignments;
drop policy if exists assignments_teacher_insert on public.assignments;
drop policy if exists assignments_teacher_update on public.assignments;
drop policy if exists assignments_teacher_delete on public.assignments;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_select_classmates on public.profiles;
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists assignment_submissions_insert_own on public.assignment_submissions;
drop policy if exists assignment_submissions_select_own on public.assignment_submissions;
drop policy if exists assignment_submissions_select_teacher on public.assignment_submissions;
drop policy if exists assignment_submissions_update_own on public.assignment_submissions;
drop policy if exists assignment_submissions_grades_insert_teacher on public.assignment_submissions_grades;
drop policy if exists assignment_submissions_grades_select_student on public.assignment_submissions_grades;
drop policy if exists assignment_submissions_grades_select_teacher on public.assignment_submissions_grades;
drop policy if exists assignment_submissions_grades_update_teacher on public.assignment_submissions_grades;
drop policy if exists submissions_insert_own on public.submissions;
drop policy if exists submissions_select_members on public.submissions;
drop policy if exists submissions_update_own on public.submissions;
drop policy if exists assignment_files_objects_delete_teacher on storage.objects;
drop policy if exists assignment_files_objects_insert_teacher on storage.objects;
drop policy if exists assignment_files_objects_select_members on storage.objects;
drop policy if exists assignment_submissions_objects_delete_own on storage.objects;
drop policy if exists assignment_submissions_objects_delete_teacher on storage.objects;
drop policy if exists assignment_submissions_objects_insert_own on storage.objects;
drop policy if exists assignment_submissions_objects_select_own on storage.objects;
drop policy if exists assignment_submissions_objects_select_teacher on storage.objects;

alter table public.class_members
  alter column joined_at set default timezone('utc'::text, now());

alter table public.class_members
  drop constraint if exists class_members_role_check;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'class_members'
      and column_name = 'role'
      and data_type = 'text'
  ) then
    alter table public.class_members
      alter column role type public.app_role
      using role::public.app_role;
  end if;
end $$;

alter table public.class_members
  alter column role set not null;

alter table public.assignments
  add constraint assignments_points_non_negative
  check (points is null or points >= 0);

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.assignment_submissions_grades enable row level security;

create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy profiles_select_classmates
  on public.profiles
  for select
  to authenticated
  using (
    id = auth.uid()
    or exists (
      select 1
      from public.class_members mine
      join public.class_members classmates
        on classmates.class_id = mine.class_id
      where mine.user_id = auth.uid()
        and classmates.user_id = public.profiles.id
    )
  );

create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (id = auth.uid());

create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy classes_select_members
  on public.classes
  for select
  to authenticated
  using (public.is_class_member(id));

create policy classes_insert_teacher_owner
  on public.classes
  for insert
  to authenticated
  with check (
    public.is_teacher()
    and teacher_id = auth.uid()
    and class_code = upper(class_code)
    and code = class_code
  );

create policy classes_update_teacher
  on public.classes
  for update
  to authenticated
  using (teacher_id = auth.uid())
  with check (
    teacher_id = auth.uid()
    and public.is_teacher()
    and class_code = upper(class_code)
    and code = class_code
  );

create policy classes_delete_teacher
  on public.classes
  for delete
  to authenticated
  using (teacher_id = auth.uid());

create policy class_members_select_members
  on public.class_members
  for select
  to authenticated
  using (public.is_class_member(class_id));

create policy class_members_insert_student_self
  on public.class_members
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and role = 'student'::public.app_role
    and public.is_student()
  );

create policy assignments_select_members
  on public.assignments
  for select
  to authenticated
  using (public.is_class_member(class_id));

create policy assignments_teacher_insert
  on public.assignments
  for insert
  to authenticated
  with check (
    public.has_class_role(class_id, 'teacher'::public.app_role)
    and public.is_teacher()
  );

create policy assignments_teacher_update
  on public.assignments
  for update
  to authenticated
  using (
    public.has_class_role(class_id, 'teacher'::public.app_role)
    and public.is_teacher()
  )
  with check (
    public.has_class_role(class_id, 'teacher'::public.app_role)
    and public.is_teacher()
  );

create policy assignments_teacher_delete
  on public.assignments
  for delete
  to authenticated
  using (
    public.has_class_role(class_id, 'teacher'::public.app_role)
    and public.is_teacher()
  );

create policy assignment_submissions_insert_own
  on public.assignment_submissions
  for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and public.is_student()
    and exists (
      select 1
      from public.assignments a
      join public.class_members cm
        on cm.class_id = a.class_id
      where a.id = assignment_id
        and cm.user_id = auth.uid()
        and cm.role = 'student'::public.app_role
    )
  );

create policy assignment_submissions_select_own
  on public.assignment_submissions
  for select
  to authenticated
  using (student_id = auth.uid());

create policy assignment_submissions_select_teacher
  on public.assignment_submissions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.assignments a
      join public.class_members cm
        on cm.class_id = a.class_id
      where a.id = assignment_id
        and cm.user_id = auth.uid()
        and cm.role = 'teacher'::public.app_role
    )
  );

create policy assignment_submissions_update_own
  on public.assignment_submissions
  for update
  to authenticated
  using (student_id = auth.uid())
  with check (
    student_id = auth.uid()
    and public.is_student()
    and exists (
      select 1
      from public.assignments a
      join public.class_members cm
        on cm.class_id = a.class_id
      where a.id = assignment_id
        and cm.user_id = auth.uid()
        and cm.role = 'student'::public.app_role
    )
  );

create policy assignment_submissions_grades_select_teacher
  on public.assignment_submissions_grades
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.assignment_submissions s
      join public.assignments a
        on a.id = s.assignment_id
      join public.class_members cm
        on cm.class_id = a.class_id
      where s.id = submission_id
        and cm.user_id = auth.uid()
        and cm.role = 'teacher'::public.app_role
    )
  );

create policy assignment_submissions_grades_select_student
  on public.assignment_submissions_grades
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.assignment_submissions s
      where s.id = submission_id
        and s.student_id = auth.uid()
    )
  );

create policy assignment_submissions_grades_insert_teacher
  on public.assignment_submissions_grades
  for insert
  to authenticated
  with check (
    teacher_id = auth.uid()
    and public.is_teacher()
    and exists (
      select 1
      from public.assignment_submissions s
      join public.assignments a
        on a.id = s.assignment_id
      join public.class_members cm
        on cm.class_id = a.class_id
      where s.id = submission_id
        and cm.user_id = auth.uid()
        and cm.role = 'teacher'::public.app_role
    )
  );

create policy assignment_submissions_grades_update_teacher
  on public.assignment_submissions_grades
  for update
  to authenticated
  using (
    teacher_id = auth.uid()
    and public.is_teacher()
  )
  with check (
    teacher_id = auth.uid()
    and public.is_teacher()
    and exists (
      select 1
      from public.assignment_submissions s
      join public.assignments a
        on a.id = s.assignment_id
      join public.class_members cm
        on cm.class_id = a.class_id
      where s.id = submission_id
        and cm.user_id = auth.uid()
        and cm.role = 'teacher'::public.app_role
    )
  );

create or replace function public.is_member_of_assignment(target_assignment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assignments a
    join public.class_members cm on cm.class_id = a.class_id
    where a.id = target_assignment_id
      and cm.user_id = auth.uid()
  );
$$;

create or replace function public.is_teacher_of_assignment(target_assignment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assignments a
    join public.class_members cm on cm.class_id = a.class_id
    where a.id = target_assignment_id
      and cm.user_id = auth.uid()
      and cm.role = 'teacher'::public.app_role
  );
$$;

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
  next_class_code text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_teacher(auth.uid()) then
    raise exception 'Only teachers can create classes';
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
  target_class public.classes;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_student(auth.uid()) then
    return jsonb_build_object(
      'status', 'forbidden',
      'message', 'Only students can join classes'
    );
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

grant execute on function public.create_classroom(text, text) to authenticated;
grant execute on function public.join_class_by_code(text) to authenticated;

create policy assignment_files_objects_select_members
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'assignment-files'
    and public.is_member_of_assignment((storage.foldername(name))[1]::uuid)
  );

create policy assignment_files_objects_insert_teacher
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'assignment-files'
    and auth.uid()::text = (storage.foldername(name))[2]
    and public.is_teacher_of_assignment((storage.foldername(name))[1]::uuid)
  );

create policy assignment_files_objects_delete_teacher
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'assignment-files'
    and public.is_teacher_of_assignment((storage.foldername(name))[1]::uuid)
  );

create policy assignment_submissions_objects_select_own
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'assignment-submissions'
    and auth.uid()::text = (storage.foldername(name))[2]
  );

create policy assignment_submissions_objects_select_teacher
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'assignment-submissions'
    and public.is_teacher_of_assignment((storage.foldername(name))[1]::uuid)
  );

create policy assignment_submissions_objects_insert_own
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'assignment-submissions'
    and auth.uid()::text = (storage.foldername(name))[2]
    and exists (
      select 1
      from public.assignments a
      join public.class_members cm on cm.class_id = a.class_id
      where a.id = (storage.foldername(objects.name))[1]::uuid
        and cm.user_id = auth.uid()
        and cm.role = 'student'::public.app_role
    )
  );

create policy assignment_submissions_objects_delete_own
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'assignment-submissions'
    and auth.uid()::text = (storage.foldername(name))[2]
  );

create policy assignment_submissions_objects_delete_teacher
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'assignment-submissions'
    and public.is_teacher_of_assignment((storage.foldername(name))[1]::uuid)
  );

drop table if exists public.submissions;

commit;
