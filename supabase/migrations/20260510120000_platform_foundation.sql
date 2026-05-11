begin;

create extension if not exists pgcrypto;

do $$
begin
  alter type public.app_role add value if not exists 'admin';
exception
  when duplicate_object then null;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'enrollment_state'
  ) then
    create type public.enrollment_state as enum ('pending', 'active', 'removed', 'invited', 'rejected');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'submission_state'
  ) then
    create type public.submission_state as enum ('draft', 'submitted', 'returned', 'late', 'graded', 'resubmitted');
  end if;
end $$;

alter table if exists public.classes
  add column if not exists archived_at timestamptz,
  add column if not exists created_by uuid,
  add column if not exists deleted_at timestamptz,
  add column if not exists updated_at timestamptz default timezone('utc'::text, now()),
  add column if not exists updated_by uuid;

alter table if exists public.assignments
  add column if not exists archived_at timestamptz,
  add column if not exists created_by uuid,
  add column if not exists deleted_at timestamptz,
  add column if not exists updated_at timestamptz default timezone('utc'::text, now()),
  add column if not exists updated_by uuid;

alter table if exists public.class_members
  add column if not exists enrollment_state public.enrollment_state default 'active'::public.enrollment_state,
  add column if not exists invited_at timestamptz,
  add column if not exists removed_at timestamptz,
  add column if not exists rejected_at timestamptz;

update public.class_members
set enrollment_state = 'active'::public.enrollment_state
where enrollment_state is null;

alter table if exists public.class_members
  alter column enrollment_state set not null;

alter table if exists public.assignment_submissions
  add column if not exists submission_state public.submission_state default 'draft'::public.submission_state,
  add column if not exists deleted_at timestamptz,
  add column if not exists returned_at timestamptz,
  add column if not exists updated_at timestamptz default timezone('utc'::text, now());

update public.assignment_submissions
set submission_state = case
  when submitted_at is null then 'draft'::public.submission_state
  else 'submitted'::public.submission_state
end
where submission_state is null;

alter table if exists public.assignment_submissions
  alter column submission_state set not null;

create or replace function public.handle_profile_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
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
    'student'::public.app_role,
    true
  )
  on conflict (id) do update
  set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    email = coalesce(excluded.email, public.profiles.email),
    is_active = coalesce(public.profiles.is_active, excluded.is_active);

  return new;
end;
$$;

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  version integer not null default 1,
  event_type text not null,
  actor_id uuid references public.profiles(id) on delete set null,
  class_id uuid references public.classes(id) on delete set null,
  assignment_id uuid references public.assignments(id) on delete set null,
  target_entity text not null,
  target_entity_id text not null,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists activity_events_class_created_at_idx
  on public.activity_events (class_id, created_at desc);

create index if not exists activity_events_assignment_created_at_idx
  on public.activity_events (assignment_id, created_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid references public.activity_events(id) on delete set null,
  type text not null,
  title text not null,
  body text not null,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now())
);

create index if not exists notifications_user_created_at_idx
  on public.notifications (user_id, created_at desc);

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  channel_in_app boolean not null default true,
  channel_email boolean not null default false,
  assignment_created boolean not null default true,
  assignment_graded boolean not null default true,
  comment_added boolean not null default true,
  class_invitation boolean not null default true,
  class_join_request boolean not null default true,
  announcement_posted boolean not null default true,
  system_updates boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  bucket_id text not null,
  storage_path text not null,
  original_name text not null,
  mime_type text not null,
  extension text not null,
  size_bytes bigint not null default 0,
  checksum text,
  preview_type text not null default 'unknown',
  created_at timestamptz not null default timezone('utc'::text, now()),
  deleted_at timestamptz
);

create unique index if not exists files_bucket_storage_path_idx
  on public.files (bucket_id, storage_path);

create table if not exists public.assignment_attachments (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  file_id uuid not null references public.files(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (assignment_id, file_id)
);

create table if not exists public.submission_attachments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.assignment_submissions(id) on delete cascade,
  file_id uuid not null references public.files(id) on delete cascade,
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (submission_id, file_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc'::text, now())
);

insert into storage.buckets (id, name, public)
values
  ('classroom-files', 'classroom-files', false),
  ('assignment-files', 'assignment-files', false),
  ('submission-files', 'submission-files', false),
  ('avatars', 'avatars', false)
on conflict (id) do update
set public = excluded.public;

alter table if exists public.activity_events enable row level security;
alter table if exists public.notifications enable row level security;
alter table if exists public.notification_preferences enable row level security;
alter table if exists public.files enable row level security;
alter table if exists public.assignment_attachments enable row level security;
alter table if exists public.submission_attachments enable row level security;
alter table if exists public.audit_logs enable row level security;

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own
  on public.notifications
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own
  on public.notifications
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists notification_preferences_select_own on public.notification_preferences;
create policy notification_preferences_select_own
  on public.notification_preferences
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists notification_preferences_update_own on public.notification_preferences;
create policy notification_preferences_update_own
  on public.notification_preferences
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists files_select_owner on public.files;
create policy files_select_owner
  on public.files
  for select
  to authenticated
  using (owner_id = auth.uid() or uploaded_by = auth.uid());

drop policy if exists files_insert_owner on public.files;
create policy files_insert_owner
  on public.files
  for insert
  to authenticated
  with check (uploaded_by = auth.uid());

drop policy if exists audit_logs_select_admin on public.audit_logs;
create policy audit_logs_select_admin
  on public.audit_logs
  for select
  to authenticated
  using (public.current_user_role() = 'admin'::public.app_role);

create or replace function public.ensure_notification_preferences()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists profiles_notification_preferences on public.profiles;
create trigger profiles_notification_preferences
  after insert on public.profiles
  for each row execute function public.ensure_notification_preferences();

commit;
