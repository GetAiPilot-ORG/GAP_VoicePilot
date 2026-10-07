-- Migration 0013: Campaign Idempotency, Active Call Guard, and Reconciliation
-- Adds idempotency key to campaigns, updates dispatch job statuses to include needs_reconciliation,
-- and ensures robust concurrency protection.

-- 1. Add idempotency_key to campaigns table
alter table public.campaigns
  add column if not exists idempotency_key text;

create unique index if not exists campaigns_workspace_idempotency_idx
  on public.campaigns (workspace_id, idempotency_key)
  where idempotency_key is not null;

-- 2. Update status constraint on campaign_dispatch_jobs to support needs_reconciliation
alter table public.campaign_dispatch_jobs
  drop constraint if exists campaign_dispatch_jobs_status_check;

alter table public.campaign_dispatch_jobs
  add constraint campaign_dispatch_jobs_status_check
  check (status in ('pending', 'processing', 'completed', 'failed', 'needs_reconciliation'));

-- 3. Add index on recipient number and status for fast in-flight duplicate checks
create index if not exists campaign_dispatch_jobs_recipient_inflight_idx
  on public.campaign_dispatch_jobs (workspace_id, (call_payload->>'customer_number'), status)
  where status in ('pending', 'processing');

-- 4. Update claim_campaign_dispatch_jobs RPC to ensure only pending jobs ready for dispatch are claimed
create or replace function public.claim_campaign_dispatch_jobs(p_limit integer default 10)
returns setof public.campaign_dispatch_jobs
language plpgsql
security invoker
set search_path = ''
as $$
begin
  return query
  update public.campaign_dispatch_jobs jobs
  set status = 'processing', locked_at = now(), attempts = jobs.attempts + 1
  where jobs.id in (
    select queued.id
    from public.campaign_dispatch_jobs queued
    where queued.status = 'pending' and queued.available_at <= now()
    order by queued.created_at
    for update skip locked
    limit greatest(1, least(p_limit, 50))
  )
  returning jobs.*;
end;
$$;

revoke all on function public.claim_campaign_dispatch_jobs(integer) from public, anon, authenticated;
grant execute on function public.claim_campaign_dispatch_jobs(integer) to service_role;
