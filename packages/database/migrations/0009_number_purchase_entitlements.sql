-- 1. Add dedicated_number_entitlements to workspaces
alter table public.workspaces
  add column if not exists dedicated_number_entitlements int not null default 0 check (dedicated_number_entitlements >= 0);

-- 2. Update payment_intents constraint for purchase_type
alter table public.payment_intents
  drop constraint if exists payment_intents_purchase_type_check;

alter table public.payment_intents
  add constraint payment_intents_purchase_type_check check (purchase_type in ('plan_purchase', 'top_up', 'number_purchase'));

create unique index if not exists payment_intents_razorpay_order_id_uidx
on public.payment_intents (razorpay_order_id);

-- 3. Create number_claims table
create table if not exists public.number_claims (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  payment_intent_id uuid references public.payment_intents(id),
  status text not null check (
    status in (
      'reserved',
      'provisioning',
      'claimed',
      'failed',
      'needs_reconciliation'
    )
  ),
  provider_request_id text,
  provider_number_id text,
  phone_number text,
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  claimed_at timestamptz
);

alter table public.number_claims enable row level security;
revoke all on table public.number_claims from anon, authenticated;

-- 4. Add current_period tracking to phone_numbers
alter table public.phone_numbers
  add column if not exists current_period_start timestamptz,
  add column if not exists current_period_end timestamptz,
  add column if not exists payment_intent_id uuid references public.payment_intents(id);

-- 5. Update process_payment_intent RPC
create or replace function process_payment_intent(
  p_razorpay_order_id text,
  p_razorpay_payment_id text
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_intent public.payment_intents%rowtype;
  v_plan public.plans%rowtype;
  v_granted_credits numeric;
  v_renew_phone_id uuid;
  v_result jsonb;
begin
  -- Lock the payment intent row to prevent race conditions
  select * into v_intent
  from public.payment_intents
  where razorpay_order_id = p_razorpay_order_id
  for update;

  if not found then
    raise exception 'Payment intent not found for order %', p_razorpay_order_id;
  end if;

  if v_intent.status = 'completed' then
    if v_intent.razorpay_payment_id is distinct from p_razorpay_payment_id then
      raise exception 'Order % was already completed with a different payment', p_razorpay_order_id;
    end if;

    if v_intent.purchase_type = 'plan_purchase' then
      select * into v_plan from public.plans where id = v_intent.plan_id;
      v_granted_credits := coalesce(v_plan.included_credits, 100);
      return jsonb_build_object(
        'success', true,
        'type', v_intent.purchase_type,
        'plan_id', v_intent.plan_id,
        'credits_granted', v_granted_credits,
        'already_processed', true
      );
    elsif v_intent.purchase_type = 'top_up' then
      v_granted_credits := floor((v_intent.amount_paise / 100.0) / 5.0);
      return jsonb_build_object(
        'success', true,
        'type', v_intent.purchase_type,
        'credits_granted', v_granted_credits,
        'already_processed', true
      );
    elsif v_intent.purchase_type = 'number_purchase' then
      return jsonb_build_object(
        'success', true,
        'type', 'number_purchase',
        'entitlements_granted', 1,
        'already_processed', true
      );
    else
      raise exception 'Unsupported purchase type: %', v_intent.purchase_type;
    end if;
  end if;

  -- Mark intent as completed
  update public.payment_intents
  set status = 'completed',
      razorpay_payment_id = p_razorpay_payment_id,
      paid_at = now()
  where id = v_intent.id;

  if v_intent.purchase_type = 'plan_purchase' then
    select * into v_plan from public.plans where id = v_intent.plan_id;
    if not found then
      raise exception 'Plan % not found', v_intent.plan_id;
    end if;

    insert into public.workspace_subscriptions as existing (
      workspace_id, plan_id, status, current_period_start, current_period_end, 
      razorpay_order_id, razorpay_payment_id, purchase_id
    ) values (
      v_intent.workspace_id, v_intent.plan_id, 'active', now(), now() + interval '30 days',
      p_razorpay_order_id, p_razorpay_payment_id, v_intent.id
    )
    on conflict (workspace_id) do update set
      plan_id = excluded.plan_id,
      status = 'active',
      current_period_start = case
        when existing.current_period_end > now()
          then existing.current_period_start
        else now()
      end,
      current_period_end = greatest(existing.current_period_end, now()) + interval '30 days',
      razorpay_order_id = excluded.razorpay_order_id,
      razorpay_payment_id = excluded.razorpay_payment_id,
      purchase_id = excluded.purchase_id,
      updated_at = now();

    v_granted_credits := coalesce(v_plan.included_credits, 100);

    insert into public.credit_ledger (
      workspace_id, type, amount, description, reference_id
    ) values (
      v_intent.workspace_id, 'grant', v_granted_credits,
      'Plan Activation: ' || v_plan.name || ' (Razorpay: ' || p_razorpay_payment_id || ')',
      p_razorpay_payment_id
    );

    update public.profiles profile
    set current_plan = v_intent.plan_id
    from public.workspaces workspace
    where workspace.id = v_intent.workspace_id
      and profile.id = workspace.owner_id;

    v_result := jsonb_build_object(
      'success', true,
      'type', 'plan_purchase',
      'plan_id', v_intent.plan_id,
      'credits_granted', v_granted_credits
    );

  elsif v_intent.purchase_type = 'top_up' then
    v_granted_credits := floor((v_intent.amount_paise / 100.0) / 5.0);
    insert into public.credit_ledger (
      workspace_id, type, amount, description, reference_id
    ) values (
      v_intent.workspace_id, 'top_up', v_granted_credits,
      'Razorpay Wallet Top-up (₹' || (v_intent.amount_paise / 100.0) || ' = ' || v_granted_credits || ' Mins)',
      p_razorpay_payment_id
    );
    v_result := jsonb_build_object(
      'success', true,
      'type', 'top_up',
      'credits_granted', v_granted_credits
    );

  elsif v_intent.purchase_type = 'number_purchase' then
    -- Check if workspace has an expired or renew-eligible dedicated phone number
    select id into v_renew_phone_id
    from public.phone_numbers
    where workspace_id = v_intent.workspace_id
      and deleted_at is null
      and (current_period_end is null or current_period_end <= now())
    order by created_at asc
    limit 1;

    if v_renew_phone_id is not null then
      update public.phone_numbers
      set current_period_start = case when current_period_end > now() then current_period_start else now() end,
          current_period_end = greatest(coalesce(current_period_end, now()), now()) + interval '30 days',
          payment_intent_id = v_intent.id,
          status = case when assigned_assistant_id is not null then 'active' else 'unassigned' end
      where id = v_renew_phone_id;

      v_result := jsonb_build_object(
        'success', true,
        'type', 'number_renewal',
        'phone_number_id', v_renew_phone_id,
        'message', 'Existing dedicated number renewed for 30 days'
      );
    else
      update public.workspaces
      set dedicated_number_entitlements = dedicated_number_entitlements + 1
      where id = v_intent.workspace_id;
      
      v_result := jsonb_build_object(
        'success', true,
        'type', 'number_purchase',
        'entitlements_granted', 1
      );
    end if;

  else
    raise exception 'Unsupported purchase type: %', v_intent.purchase_type;
  end if;

  return v_result;
end;
$$;

revoke all on function public.process_payment_intent(text, text) from public, anon, authenticated;
grant execute on function public.process_payment_intent(text, text) to service_role;

-- 6. Create atomic reservation RPC
create or replace function reserve_number_entitlement(
  p_workspace_id uuid
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_updated_count int;
  v_claim_id uuid;
begin
  -- Attempt to deduct entitlement
  update public.workspaces
  set dedicated_number_entitlements = dedicated_number_entitlements - 1
  where id = p_workspace_id
    and dedicated_number_entitlements > 0;
    
  get diagnostics v_updated_count = row_count;
  
  if v_updated_count = 0 then
    return jsonb_build_object('success', false, 'error', 'No dedicated number entitlements available');
  end if;
  
  -- Create reservation
  insert into public.number_claims (workspace_id, status)
  values (p_workspace_id, 'reserved')
  returning id into v_claim_id;
  
  return jsonb_build_object(
    'success', true, 
    'claim_id', v_claim_id,
    'entitlements_reserved', 1
  );
end;
$$;

revoke all on function public.reserve_number_entitlement(uuid) from public, anon, authenticated;
grant execute on function public.reserve_number_entitlement(uuid) to service_role;

-- 7. Create atomic refund RPC
create or replace function refund_number_entitlement(
  p_workspace_id uuid
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.workspaces
  set dedicated_number_entitlements = dedicated_number_entitlements + 1
  where id = p_workspace_id;
end;
$$;

revoke all on function public.refund_number_entitlement(uuid) from public, anon, authenticated;
grant execute on function public.refund_number_entitlement(uuid) to service_role;
