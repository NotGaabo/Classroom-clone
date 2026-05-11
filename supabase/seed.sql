-- Seed foundation for local development.
-- Intentionally minimal until the remote baseline is pulled into the repo.
-- Add local-only admin bootstrap data after `supabase db pull baseline_remote_schema`.

select 'seed_initialized' as status;
