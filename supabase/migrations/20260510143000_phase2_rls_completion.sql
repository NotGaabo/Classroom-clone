begin;

create or replace function public.is_admin(user_id uuid default auth.uid())
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
      and p.role = 'admin'::public.app_role
      and coalesce(p.is_active, true)
  );
$$;

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
    join public.classes c on c.id = cm.class_id
    where cm.class_id = target_class_id
      and cm.user_id = user_id
      and cm.enrollment_state = 'active'::public.enrollment_state
      and c.deleted_at is null
      and c.archived_at is null
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
    join public.classes c on c.id = cm.class_id
    where cm.class_id = target_class_id
      and cm.user_id = user_id
      and cm.role = target_role
      and cm.enrollment_state = 'active'::public.enrollment_state
      and c.deleted_at is null
      and c.archived_at is null
  );
$$;

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
    join public.classes c on c.id = a.class_id
    where a.id = target_assignment_id
      and cm.user_id = auth.uid()
      and cm.enrollment_state = 'active'::public.enrollment_state
      and a.deleted_at is null
      and c.deleted_at is null
      and c.archived_at is null
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
    join public.classes c on c.id = a.class_id
    where a.id = target_assignment_id
      and cm.user_id = auth.uid()
      and cm.role = 'teacher'::public.app_role
      and cm.enrollment_state = 'active'::public.enrollment_state
      and a.deleted_at is null
      and c.deleted_at is null
      and c.archived_at is null
  );
$$;

create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$;

create or replace function public.is_valid_submission_transition(
  previous_state public.submission_state,
  next_state public.submission_state
)
returns boolean
language sql
immutable
set search_path = public
as $$
  select case
    when previous_state = next_state then true
    when previous_state = 'draft'::public.submission_state and next_state in ('submitted'::public.submission_state, 'late'::public.submission_state) then true
    when previous_state = 'submitted'::public.submission_state and next_state in ('graded'::public.submission_state, 'returned'::public.submission_state, 'late'::public.submission_state) then true
    when previous_state = 'returned'::public.submission_state and next_state in ('resubmitted'::public.submission_state, 'late'::public.submission_state) then true
    when previous_state = 'late'::public.submission_state and next_state in ('graded'::public.submission_state, 'returned'::public.submission_state) then true
    when previous_state = 'resubmitted'::public.submission_state and next_state in ('graded'::public.submission_state, 'returned'::public.submission_state) then true
    else false
  end;
$$;

create or replace function public.enforce_submission_state_transition()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.submission_state is null then
    new.submission_state := 'draft'::public.submission_state;
  end if;

  if tg_op = 'UPDATE' and old.submission_state is distinct from new.submission_state then
    if not public.is_valid_submission_transition(old.submission_state, new.submission_state) then
      raise exception 'Invalid submission state transition: % -> %', old.submission_state, new.submission_state;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists classes_set_updated_at on public.classes;
create trigger classes_set_updated_at
  before update on public.classes
  for each row execute function public.set_row_updated_at();

drop trigger if exists assignments_set_updated_at on public.assignments;
create trigger assignments_set_updated_at
  before update on public.assignments
  for each row execute function public.set_row_updated_at();

drop trigger if exists assignment_submissions_set_updated_at on public.assignment_submissions;
create trigger assignment_submissions_set_updated_at
  before update on public.assignment_submissions
  for each row execute function public.set_row_updated_at();

drop trigger if exists notification_preferences_set_updated_at on public.notification_preferences;
create trigger notification_preferences_set_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_row_updated_at();

drop trigger if exists assignment_submissions_validate_state on public.assignment_submissions;
create trigger assignment_submissions_validate_state
  before insert or update on public.assignment_submissions
  for each row execute function public.enforce_submission_state_transition();

grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.is_valid_submission_transition(public.submission_state, public.submission_state) to authenticated;

drop policy if exists activity_events_select_related on public.activity_events;
create policy activity_events_select_related
  on public.activity_events
  for select
  to authenticated
  using (
    actor_id = auth.uid()
    or public.is_admin()
    or (class_id is not null and public.is_class_member(class_id))
    or (assignment_id is not null and public.is_member_of_assignment(assignment_id))
  );

drop policy if exists activity_events_insert_actor on public.activity_events;
create policy activity_events_insert_actor
  on public.activity_events
  for insert
  to authenticated
  with check (
    actor_id = auth.uid()
    and (
      public.is_admin()
      or (class_id is not null and public.is_class_member(class_id))
      or (assignment_id is not null and public.is_member_of_assignment(assignment_id))
    )
  );

drop policy if exists notifications_insert_admin on public.notifications;
create policy notifications_insert_admin
  on public.notifications
  for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists notification_preferences_insert_own on public.notification_preferences;
create policy notification_preferences_insert_own
  on public.notification_preferences
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists files_select_contextual on public.files;
create policy files_select_contextual
  on public.files
  for select
  to authenticated
  using (
    owner_id = auth.uid()
    or uploaded_by = auth.uid()
    or exists (
      select 1
      from public.assignment_attachments aa
      join public.assignments a on a.id = aa.assignment_id
      where aa.file_id = public.files.id
        and public.is_member_of_assignment(a.id)
    )
    or exists (
      select 1
      from public.submission_attachments sa
      join public.assignment_submissions s on s.id = sa.submission_id
      join public.assignments a on a.id = s.assignment_id
      where sa.file_id = public.files.id
        and (
          s.student_id = auth.uid()
          or public.is_teacher_of_assignment(a.id)
          or public.is_admin()
        )
    )
  );

drop policy if exists files_update_owner on public.files;
create policy files_update_owner
  on public.files
  for update
  to authenticated
  using (uploaded_by = auth.uid() or public.is_admin())
  with check (uploaded_by = auth.uid() or public.is_admin());

drop policy if exists assignment_attachments_select_members on public.assignment_attachments;
create policy assignment_attachments_select_members
  on public.assignment_attachments
  for select
  to authenticated
  using (public.is_member_of_assignment(assignment_id) or public.is_admin());

drop policy if exists assignment_attachments_insert_teacher on public.assignment_attachments;
create policy assignment_attachments_insert_teacher
  on public.assignment_attachments
  for insert
  to authenticated
  with check (public.is_teacher_of_assignment(assignment_id) or public.is_admin());

drop policy if exists assignment_attachments_delete_teacher on public.assignment_attachments;
create policy assignment_attachments_delete_teacher
  on public.assignment_attachments
  for delete
  to authenticated
  using (public.is_teacher_of_assignment(assignment_id) or public.is_admin());

drop policy if exists submission_attachments_select_related on public.submission_attachments;
create policy submission_attachments_select_related
  on public.submission_attachments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.assignment_submissions s
      join public.assignments a on a.id = s.assignment_id
      where s.id = submission_id
        and (
          s.student_id = auth.uid()
          or public.is_teacher_of_assignment(a.id)
          or public.is_admin()
        )
    )
  );

drop policy if exists submission_attachments_insert_related on public.submission_attachments;
create policy submission_attachments_insert_related
  on public.submission_attachments
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.assignment_submissions s
      join public.assignments a on a.id = s.assignment_id
      where s.id = submission_id
        and (
          s.student_id = auth.uid()
          or public.is_teacher_of_assignment(a.id)
          or public.is_admin()
        )
    )
  );

drop policy if exists submission_attachments_delete_related on public.submission_attachments;
create policy submission_attachments_delete_related
  on public.submission_attachments
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.assignment_submissions s
      join public.assignments a on a.id = s.assignment_id
      where s.id = submission_id
        and (
          s.student_id = auth.uid()
          or public.is_teacher_of_assignment(a.id)
          or public.is_admin()
        )
    )
  );

drop policy if exists audit_logs_insert_actor on public.audit_logs;
create policy audit_logs_insert_actor
  on public.audit_logs
  for insert
  to authenticated
  with check (actor_id = auth.uid() or public.is_admin());

commit;
