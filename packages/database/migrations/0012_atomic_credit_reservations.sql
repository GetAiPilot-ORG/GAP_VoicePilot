-- Serialize credit reservations per workspace so concurrent calls cannot spend
-- the same balance. This function is only callable by the backend service role.
create or replace function public.reserve_workspace_credits(
  p_workspace_id uuid,
  p_amount numeric,
  p_reference_id text default null,
  p_description text default 'Call credit reservation'
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_balance numeric;
begin
  if p_amount is null or p_amount <= 0 then
    return jsonb_build_object('success', false, 'current_balance', 0, 'error', 'Reservation amount must be positive');
  end if;

  -- Transaction-scoped and workspace-specific: concurrent reservations for the
  -- same wallet serialize while unrelated workspaces remain independent.
  perform pg_advisory_xact_lock(hashtextextended(p_workspace_id::text, 0));

  select coalesce(sum(amount), 0)
  into v_balance
  from public.credit_ledger
  where workspace_id = p_workspace_id;

  if v_balance < p_amount then
    return jsonb_build_object(
      'success', false,
      'current_balance', v_balance,
      'error', format('Insufficient credit balance. Required: %s, Available: %s', p_amount, v_balance)
    );
  end if;

  insert into public.credit_ledger (workspace_id, type, amount, description, reference_id)
  values (p_workspace_id, 'reservation', -abs(p_amount), p_description, p_reference_id);

  return jsonb_build_object('success', true, 'current_balance', v_balance - p_amount);
end;
$$;

revoke all on function public.reserve_workspace_credits(uuid, numeric, text, text) from public, anon, authenticated;
grant execute on function public.reserve_workspace_credits(uuid, numeric, text, text) to service_role;

create table if not exists public.campaign_dispatch_jobs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  call_payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  locked_at timestamptz,
  last_error text,
  provider_call_id text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists campaign_dispatch_jobs_pending_idx
  on public.campaign_dispatch_jobs (available_at, created_at)
  where status = 'pending';

alter table public.campaign_dispatch_jobs enable row level security;
revoke all on public.campaign_dispatch_jobs from public, anon, authenticated;
grant select, insert, update on public.campaign_dispatch_jobs to service_role;

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
