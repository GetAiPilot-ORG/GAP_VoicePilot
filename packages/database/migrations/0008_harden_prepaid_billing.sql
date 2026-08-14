-- Corrective migration for environments where the initial 0007 billing SQL
-- was applied before the security and idempotency review.

alter table public.payment_intents enable row level security;
revoke all on table public.payment_intents from anon, authenticated;

alter table public.credit_ledger
  drop constraint if exists credit_ledger_reference_id_key;

create unique index if not exists credit_ledger_payment_reference_uidx
  on public.credit_ledger (reference_id)
  where reference_id is not null and type in ('grant', 'top_up');

create index if not exists payment_intents_workspace_created_idx
  on public.payment_intents (workspace_id, created_at desc);

create or replace function public.process_payment_intent(
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
  v_result jsonb;
begin
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
    else
      v_granted_credits := floor((v_intent.amount_paise / 100.0) / 5.0);
    end if;

    return jsonb_build_object(
      'success', true,
      'type', v_intent.purchase_type,
      'plan_id', v_intent.plan_id,
      'credits_granted', v_granted_credits,
      'already_processed', true
    );
  end if;

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
        when existing.current_period_end > now() then existing.current_period_start
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
      'Razorpay Wallet Top-up (INR ' || (v_intent.amount_paise / 100.0) || ' = ' || v_granted_credits || ' Mins)',
      p_razorpay_payment_id
    );

    v_result := jsonb_build_object(
      'success', true,
      'type', 'top_up',
      'credits_granted', v_granted_credits
    );
  end if;

  return v_result;
end;
$$;

revoke all on function public.process_payment_intent(text, text) from public, anon, authenticated;
grant execute on function public.process_payment_intent(text, text) to service_role;
