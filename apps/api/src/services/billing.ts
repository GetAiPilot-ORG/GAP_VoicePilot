import { supabaseAdmin } from '../config/supabase';

export { supabaseAdmin };

/**
 * Fetch current available credit balance for a workspace
 */
export async function getWorkspaceBalance(workspaceId: string): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc('get_workspace_credit_balance', {
    p_workspace_id: workspaceId
  });

  if (error) {
    console.error('Error fetching workspace credit balance:', error);
    // Fallback: direct query
    const { data: rows, error: directErr } = await supabaseAdmin
      .from('credit_ledger')
      .select('amount')
      .eq('workspace_id', workspaceId);
    
    if (directErr || !rows) return 0;
    return rows.reduce((acc: number, curr: { amount: number | string | null }) => acc + Number(curr.amount || 0), 0);
  }

  return Number(data || 0);
}

/**
 * Check if a workspace has access to a specific sub-feature
 */
export async function checkFeaturePermission(workspaceId: string, featureKey: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc('has_workspace_feature', {
    p_workspace_id: workspaceId,
    p_feature_key: featureKey
  });

  if (error) {
    console.error(`Error checking feature permission for ${featureKey}:`, error);
    // Fallback: check workspace_subscriptions -> plans
    const { data: sub } = await supabaseAdmin
      .from('workspace_subscriptions')
      .select('plans(features)')
      .eq('workspace_id', workspaceId)
      .eq('status', 'active')
      .maybeSingle();

    if (sub && sub.plans && (sub.plans as any).features) {
      return Boolean((sub.plans as any).features[featureKey]);
    }
    return false;
  }

  return Boolean(data);
}

/**
 * Reserve credits before executing a call or campaign
 */
export async function reserveCredits(
  workspaceId: string,
  amount: number,
  referenceId?: string,
  description?: string
): Promise<{ success: boolean; currentBalance: number; error?: string }> {
  const currentBalance = await getWorkspaceBalance(workspaceId);

  if (currentBalance < amount) {
    return {
      success: false,
      currentBalance,
      error: `Insufficient credit balance. Required: ${amount}, Available: ${currentBalance}`
    };
  }

  const { error } = await supabaseAdmin.from('credit_ledger').insert({
    workspace_id: workspaceId,
    type: 'reservation',
    amount: -Math.abs(amount),
    description: description || 'Call credit reservation',
    reference_id: referenceId
  });

  if (error) {
    console.error('Failed to insert credit reservation:', error);
    return { success: false, currentBalance, error: error.message };
  }

  return { success: true, currentBalance: currentBalance - amount };
}

/**
 * Settle call billing: release hold and debit actual usage cost
 */
export async function settleCallBilling(params: {
  workspaceId: string;
  callId?: string;
  reservedAmount: number;
  durationSeconds: number;
  costPerMinute?: number;
  referenceId?: string;
}): Promise<void> {
  const {
    workspaceId,
    callId,
    reservedAmount,
    durationSeconds,
    costPerMinute = 1.0,
    referenceId
  } = params;

  // 1. Calculate actual minutes (rounded up to nearest minute)
  const billedMinutes = Math.ceil(Math.max(durationSeconds, 1) / 60);
  const actualCreditCost = billedMinutes * costPerMinute;

  // 2. Release reservation if any
  if (reservedAmount > 0) {
    await supabaseAdmin.from('credit_ledger').insert({
      workspace_id: workspaceId,
      type: 'reservation_release',
      amount: Math.abs(reservedAmount),
      description: 'Release call credit reservation',
      reference_id: referenceId || callId,
      call_id: callId
    });
  }

  // 3. Charge actual usage cost
  await supabaseAdmin.from('credit_ledger').insert({
    workspace_id: workspaceId,
    type: 'charge',
    amount: -Math.abs(actualCreditCost),
    description: `Call charge for ${billedMinutes} minute(s)`,
    reference_id: referenceId || callId,
    call_id: callId
  });

  // 4. Log usage event for margin analytics
  if (callId) {
    await supabaseAdmin.from('usage_events').insert({
      workspace_id: workspaceId,
      call_id: callId,
      duration_seconds: durationSeconds,
      units_billed: billedMinutes,
      total_credit_cost: actualCreditCost,
      provider_raw_cost: billedMinutes * 0.05 // Vomyra internal raw cost estimate ($0.05/min)
    });
  }
}
