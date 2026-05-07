-- RLS reset for classroom/assignment app.
-- Paste this in Supabase SQL Editor and run it as the project owner.

begin;

-- Remove the policies shown in the dashboard so they do not conflict with the new set.
do $$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'assignment_comments',
        'assignment_files',
        'assignment_submission_files',
        'assignment_submissions',
        'assignment_submissions_grades',
        'assignments',
        'class_contents',
        'class_members',
        'classes',
        'enrollments',
        'profiles'
      )
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

drop policy if exists "storage_assignment_submissions_select_members" on storage.objects;
drop policy if exists "storage_assignment_submissions_insert_own" on storage.objects;
drop policy if exists "storage_assignment_submissions_update_own" on storage.objects;
drop policy if exists "storage_assignment_submissions_delete_own" on storage.objects;
drop policy if exists "storage_assignment_files_select_members" on storage.objects;
drop policy if exists "storage_assignment_files_insert_teacher" on storage.objects;
drop policy if exists "storage_assignment_files_update_teacher" on storage.objects;
drop policy if exists "storage_assignment_files_delete_teacher" on storage.objects;

-- Remove old overloaded helper functions from previous attempts.
-- If more than one version exists, PostgreSQL can throw:
-- "function public.is_class_member(uuid) is not unique".
do $$
declare
  f record;
begin
  for f in
    select n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'current_user_class_role',
        'is_class_member',
        'is_class_teacher',
        'is_assignment_member',
        'is_assignment_teacher',
        'is_submission_owner',
        'is_submission_teacher',
        'assignment_id_from_storage_path'
      )
  loop
    execute format('drop function if exists %I.%I(%s) cascade', f.nspname, f.proname, f.args);
  end loop;
end $$;

-- Helper functions avoid recursive RLS checks on enrollments.
create or replace function public.current_user_class_role(p_class_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select e.role::text
  from public.enrollments e
  where e.class_id = p_class_id
    and e.user_id = auth.uid()
  limit 1
$$;

create or replace function public.is_class_member(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_class_role(p_class_id) is not null
$$;

create or replace function public.is_class_teacher(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_class_role(p_class_id) = 'teacher'
$$;

create or replace function public.is_assignment_member(p_assignment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assignments a
    where a.id = p_assignment_id
      and public.is_class_member(a.class_id)
  )
$$;

create or replace function public.is_assignment_teacher(p_assignment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assignments a
    where a.id = p_assignment_id
      and public.is_class_teacher(a.class_id)
  )
$$;

create or replace function public.is_submission_owner(p_submission_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assignment_submissions s
    where s.id = p_submission_id
      and s.student_id = auth.uid()
  )
$$;

create or replace function public.is_submission_teacher(p_submission_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.assignment_submissions s
    join public.assignments a on a.id = s.assignment_id
    where s.id = p_submission_id
      and public.is_class_teacher(a.class_id)
  )
$$;

create or replace function public.assignment_id_from_storage_path(p_name text)
returns uuid
language sql
immutable
as $$
  select nullif((storage.foldername(p_name))[2], '')::uuid
$$;

alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.enrollments enable row level security;
alter table public.class_members enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_files enable row level security;
alter table public.assignment_comments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.assignment_submission_files enable row level security;
alter table public.assignment_submissions_grades enable row level security;
alter table public.class_contents enable row level security;

-- Profiles
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "profiles_select_classmates"
on public.profiles for select
to authenticated
using (
  exists (
    select 1
    from public.enrollments me
    join public.enrollments other_member
      on other_member.class_id = me.class_id
    where me.user_id = auth.uid()
      and other_member.user_id = profiles.id
  )
);

create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Auth signup/login support. The app does not insert profiles directly during
-- signup, so Auth must create the profile row automatically.
do $$
declare
  t record;
begin
  for t in
    select tr.tgname
    from pg_trigger tr
    join pg_proc p on p.oid = tr.tgfoid
    join pg_namespace n on n.oid = p.pronamespace
    where tr.tgrelid = 'auth.users'::regclass
      and not tr.tgisinternal
      and n.nspname = 'public'
      and (
        tr.tgname ilike '%profile%'
        or tr.tgname ilike '%user_created%'
        or p.proname in (
          'handle_new_user',
          'sync_profile_from_auth',
          'sync_profile_email_update'
        )
      )
  loop
    execute format('drop trigger if exists %I on auth.users', t.tgname);
  end loop;
end $$;

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

-- Classes
create policy "classes_select_members_or_join_code"
on public.classes for select
to authenticated
using (
  public.is_class_member(id)
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'student'
  )
);

create policy "classes_insert_teacher_owner"
on public.classes for insert
to authenticated
with check (
  teacher_id = auth.uid()
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'teacher'
  )
);

create policy "classes_update_teacher"
on public.classes for update
to authenticated
using (teacher_id = auth.uid() or public.is_class_teacher(id))
with check (teacher_id = auth.uid() or public.is_class_teacher(id));

create policy "classes_delete_teacher"
on public.classes for delete
to authenticated
using (teacher_id = auth.uid() or public.is_class_teacher(id));

-- Enrollments
create policy "enrollments_select_members"
on public.enrollments for select
to authenticated
using (user_id = auth.uid() or public.is_class_member(class_id));

create policy "enrollments_insert_teacher_self"
on public.enrollments for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'teacher'
  and exists (
    select 1
    from public.classes c
    where c.id = class_id
      and c.teacher_id = auth.uid()
  )
);

create policy "enrollments_insert_student_self"
on public.enrollments for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'student'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'student'
  )
);

create policy "enrollments_delete_teacher_or_self"
on public.enrollments for delete
to authenticated
using (user_id = auth.uid() or public.is_class_teacher(class_id));

-- Legacy class_members table shown in your dashboard. The app currently uses enrollments.
create policy "class_members_select_members"
on public.class_members for select
to authenticated
using (user_id = auth.uid() or public.is_class_member(class_id));

create policy "class_members_insert_student_self"
on public.class_members for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'student'
  and exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'student'
  )
);

-- Assignments
create policy "assignments_select_members"
on public.assignments for select
to authenticated
using (public.is_class_member(class_id));

create policy "assignments_teacher_insert"
on public.assignments for insert
to authenticated
with check (public.is_class_teacher(class_id));

create policy "assignments_teacher_update"
on public.assignments for update
to authenticated
using (public.is_class_teacher(class_id))
with check (public.is_class_teacher(class_id));

create policy "assignments_teacher_delete"
on public.assignments for delete
to authenticated
using (public.is_class_teacher(class_id));

-- Assignment files attached by teachers to an assignment.
create policy "assignment_files_select_members"
on public.assignment_files for select
to authenticated
using (public.is_assignment_member(assignment_id));

create policy "assignment_files_insert_teacher"
on public.assignment_files for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and public.is_assignment_teacher(assignment_id)
);

create policy "assignment_files_delete_teacher"
on public.assignment_files for delete
to authenticated
using (public.is_assignment_teacher(assignment_id));

-- Comments
create policy "assignment_comments_select_members"
on public.assignment_comments for select
to authenticated
using (public.is_assignment_member(assignment_id));

create policy "assignment_comments_insert_members"
on public.assignment_comments for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.is_assignment_member(assignment_id)
);

create policy "assignment_comments_update_own"
on public.assignment_comments for update
to authenticated
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and public.is_assignment_member(assignment_id)
);

create policy "assignment_comments_delete_own"
on public.assignment_comments for delete
to authenticated
using (user_id = auth.uid());

-- Submissions
create policy "assignment_submissions_select_own"
on public.assignment_submissions for select
to authenticated
using (student_id = auth.uid());

create policy "assignment_submissions_select_teacher"
on public.assignment_submissions for select
to authenticated
using (public.is_assignment_teacher(assignment_id));

create policy "assignment_submissions_insert_own"
on public.assignment_submissions for insert
to authenticated
with check (
  student_id = auth.uid()
  and exists (
    select 1
    from public.assignments a
    where a.id = assignment_id
      and public.current_user_class_role(a.class_id) = 'student'
  )
);

create policy "assignment_submissions_update_own"
on public.assignment_submissions for update
to authenticated
using (student_id = auth.uid())
with check (
  student_id = auth.uid()
  and exists (
    select 1
    from public.assignments a
    where a.id = assignment_id
      and public.current_user_class_role(a.class_id) = 'student'
  )
);

-- Submission files table, if your app starts using it later.
create policy "assignment_submission_files_select_own"
on public.assignment_submission_files for select
to authenticated
using (
  public.is_submission_owner(submission_id)
  or public.is_submission_teacher(submission_id)
);

create policy "assignment_submission_files_insert_own"
on public.assignment_submission_files for insert
to authenticated
with check (public.is_submission_owner(submission_id));

create policy "assignment_submission_files_delete_own"
on public.assignment_submission_files for delete
to authenticated
using (public.is_submission_owner(submission_id));

create policy "assignment_submission_files_delete_teacher"
on public.assignment_submission_files for delete
to authenticated
using (public.is_submission_teacher(submission_id));

-- Grades
create policy "assignment_submissions_grades_select_student"
on public.assignment_submissions_grades for select
to authenticated
using (public.is_submission_owner(submission_id));

create policy "assignment_submissions_grades_select_teacher"
on public.assignment_submissions_grades for select
to authenticated
using (public.is_submission_teacher(submission_id));

create policy "assignment_submissions_grades_insert_teacher"
on public.assignment_submissions_grades for insert
to authenticated
with check (
  teacher_id = auth.uid()
  and public.is_submission_teacher(submission_id)
);

create policy "assignment_submissions_grades_update_teacher"
on public.assignment_submissions_grades for update
to authenticated
using (teacher_id = auth.uid() and public.is_submission_teacher(submission_id))
with check (teacher_id = auth.uid() and public.is_submission_teacher(submission_id));

-- Class contents
create policy "class_contents_select_members"
on public.class_contents for select
to authenticated
using (public.is_class_member(class_id));

create policy "class_contents_insert_teacher"
on public.class_contents for insert
to authenticated
with check (public.is_class_teacher(class_id));

create policy "class_contents_update_teacher"
on public.class_contents for update
to authenticated
using (public.is_class_teacher(class_id))
with check (public.is_class_teacher(class_id));

create policy "class_contents_delete_teacher"
on public.class_contents for delete
to authenticated
using (public.is_class_teacher(class_id));

-- Storage policies. The student upload in Sidebar.tsx writes here:
-- bucket: assignment-submissions
-- path: assignments/{assignment_id}/{file_name}
create policy "storage_assignment_submissions_select_members"
on storage.objects for select
to authenticated
using (
  bucket_id = 'assignment-submissions'
  and public.is_assignment_member(public.assignment_id_from_storage_path(name))
);

create policy "storage_assignment_submissions_insert_own"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'assignment-submissions'
  and (storage.foldername(name))[1] = 'assignments'
  and public.is_assignment_member(public.assignment_id_from_storage_path(name))
);

create policy "storage_assignment_submissions_update_own"
on storage.objects for update
to authenticated
using (
  bucket_id = 'assignment-submissions'
  and owner = auth.uid()
)
with check (
  bucket_id = 'assignment-submissions'
  and owner = auth.uid()
  and public.is_assignment_member(public.assignment_id_from_storage_path(name))
);

create policy "storage_assignment_submissions_delete_own"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'assignment-submissions'
  and owner = auth.uid()
);

-- Optional teacher assignment attachments bucket.
create policy "storage_assignment_files_select_members"
on storage.objects for select
to authenticated
using (
  bucket_id = 'assignment-files'
  and public.is_assignment_member(public.assignment_id_from_storage_path(name))
);

create policy "storage_assignment_files_insert_teacher"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'assignment-files'
  and (storage.foldername(name))[1] = 'assignments'
  and public.is_assignment_teacher(public.assignment_id_from_storage_path(name))
);

create policy "storage_assignment_files_update_teacher"
on storage.objects for update
to authenticated
using (
  bucket_id = 'assignment-files'
  and public.is_assignment_teacher(public.assignment_id_from_storage_path(name))
)
with check (
  bucket_id = 'assignment-files'
  and public.is_assignment_teacher(public.assignment_id_from_storage_path(name))
);

create policy "storage_assignment_files_delete_teacher"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'assignment-files'
  and public.is_assignment_teacher(public.assignment_id_from_storage_path(name))
);

commit;
