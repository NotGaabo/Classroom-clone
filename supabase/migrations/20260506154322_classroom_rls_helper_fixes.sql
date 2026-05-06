begin;

create or replace function public.is_class_member(target_class_id uuid, user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_members cm
    where cm.class_id = target_class_id
      and cm.user_id = user_id
  );
$$;

create or replace function public.has_class_role(
  target_class_id uuid,
  target_role public.app_role,
  user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.class_members cm
    where cm.class_id = target_class_id
      and cm.user_id = user_id
      and cm.role = target_role
  );
$$;

create or replace function public.is_teacher(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_id
      and p.role = 'teacher'::public.app_role
      and coalesce(p.is_active, true)
  );
$$;

create or replace function public.is_student(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = user_id
      and p.role = 'student'::public.app_role
      and coalesce(p.is_active, true)
  );
$$;

grant execute on function public.is_class_member(uuid, uuid) to authenticated;
grant execute on function public.has_class_role(uuid, public.app_role, uuid) to authenticated;
grant execute on function public.is_teacher(uuid) to authenticated;
grant execute on function public.is_student(uuid) to authenticated;
grant execute on function public.is_member_of_assignment(uuid) to authenticated;
grant execute on function public.is_teacher_of_assignment(uuid) to authenticated;

commit;
