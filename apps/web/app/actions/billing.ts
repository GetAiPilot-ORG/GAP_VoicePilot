"use server";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getRazorpayKeyId(): string {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy';
}

function getRazorpayKeySecret(): string {
  return process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
}

async function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    requireEnv("SUPABASE_SERVICE_ROLE_KEY")
  );
}

async function getWorkspaceId(): Promise<string> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { }
        },
      },
    }
  );

  const adminClient = await getAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: member } = await adminClient
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (member?.workspace_id) return member.workspace_id;
  }

  // Fallback to ANY workspace removed to prevent random assignment

  const { data: newWs } = await adminClient.from('workspaces').insert({ name: `${user?.email?.split('@')[0] || 'Default'}'s Workspace`, owner_id: user?.id || '00000000-0000-0000-0000-000000000000' }).select().single();

  if (newWs?.id && user?.id) {
    try {
      await adminClient.from('workspace_members').insert({
        workspace_id: newWs.id,
        user_id: user.id,
        role: 'owner'
      });
    } catch (e) { }
  }
  return newWs.id;
}

export async function getBillingDataAction() {
  const adminClient = await getAdminClient();
  const workspaceId = await getWorkspaceId();

  // 1. Get Balance
  const { data: balanceData } = await adminClient.rpc('get_workspace_credit_balance', {
    p_workspace_id: workspaceId
  });

  let balance = Number(balanceData || 0);

  // 2. Get Active Subscription & Plan
  let { data: sub } = await adminClient
    .from('workspace_subscriptions')
    .select('*, plans(*)')
    .eq('workspace_id', workspaceId)
    .eq('status', 'active')
    .maybeSingle();

  // 2.1 Auto-Reconciliation with Hub Database if no active plan or balance is 0
  if (!sub || balance === 0) {
    try {
      const cookieStore = await cookies();
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
          cookies: {
            getAll: () => cookieStore.getAll(),
            setAll: () => {},
          },
        }
      );
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.email) {
        const hubUrl = process.env.HUB_SUPABASE_URL || "https://uklxlappjcuvdqjvecfh.supabase.co";
        const hubKey = process.env.HUB_SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbHhsYXBwamN1dmRxanZlY2ZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE0NzA4MywiZXhwIjoyMDgzNzIzMDgzfQ.8raDYx4BqeVELD691E720qBORhWEI4L68c_ED2JIt5w";
        const hubClient = createClient(hubUrl, hubKey);

        const { data: hubProfile } = await hubClient
          .from("profiles")
          .select("id")
          .ilike("email", user.email)
          .maybeSingle();

        if (hubProfile) {
          const { data: hubSub } = await hubClient
            .from("app_user_subscriptions")
            .select("*")
            .eq("user_id", hubProfile.id)
            .maybeSingle();

          if (hubSub && hubSub.status === "active") {
            const planIdsStr = String(hubSub.plan_id || "").toLowerCase();
            const planLabelsStr = String(hubSub.plan_label || "").toLowerCase();

            const isEnterprise =
              planIdsStr.includes("enterprise") ||
              planIdsStr.includes("gap_scale") ||
              planLabelsStr.includes("enterprise");

            const isPro =
              planIdsStr.includes("all_in_one") ||
              planIdsStr.includes("gap_pro") ||
              planLabelsStr.includes("gap pro") ||
              planLabelsStr.includes("pro");

            if (isEnterprise || isPro) {
              const targetPlanId = isEnterprise ? "gap_enterprise" : "gap_pro";
              const targetMins = isEnterprise ? 250 : 100;
              const planLabel = isEnterprise ? "GAP Enterprise" : "GAP Pro";

              // Ensure plan exists in Voice Pilot DB
              const { data: planExists } = await adminClient
                .from("plans")
                .select("id")
                .eq("id", targetPlanId)
                .maybeSingle();

              if (!planExists) {
                await adminClient.from("plans").insert({
                  id: targetPlanId,
                  name: planLabel,
                  price_monthly: isEnterprise ? 8999 : 4999,
                  included_credits: targetMins,
                  max_assistants: isEnterprise ? 20 : 5,
                  max_concurrent_calls: isEnterprise ? 5 : 2,
                  features: {
                    badge: planLabel,
                    description: `${targetMins} AI calling minutes included in ${planLabel}`,
                    extra_min_rate: isEnterprise ? 4 : 5,
                    campaigns: true,
                    ecosystem: true,
                  },
                  is_active: true,
                });
              }

              // Update/insert workspace subscription
              if (!sub) {
                await adminClient.from("workspace_subscriptions").upsert({
                  workspace_id: workspaceId,
                  plan_id: targetPlanId,
                  status: "active",
                  current_period_start: hubSub.started_at || new Date().toISOString(),
                  current_period_end: hubSub.expires_at || new Date(Date.now() + 30 * 86400000).toISOString(),
                  updated_at: new Date().toISOString(),
                }, { onConflict: "workspace_id" });

                await adminClient.from("profiles").update({
                  current_plan: targetPlanId,
                }).eq("id", user.id);
              }

              // Ensure credits are granted
              if (balance === 0) {
                const { data: existingLedger } = await adminClient
                  .from("credit_ledger")
                  .select("id")
                  .eq("workspace_id", workspaceId)
                  .limit(1);

                if (!existingLedger || existingLedger.length === 0) {
                  await adminClient.from("credit_ledger").insert({
                    workspace_id: workspaceId,
                    type: "grant",
                    amount: targetMins,
                    description: `${planLabel} Included Monthly Credits (${targetMins} AI Mins)`,
                    reference_id: hubSub.last_payment_id || `hub_sync_${Date.now()}`,
                    created_at: new Date().toISOString(),
                  });
                }
              }

              // Re-fetch sub and balance
              const [reSub, reBal] = await Promise.all([
                adminClient.from("workspace_subscriptions").select("*, plans(*)").eq("workspace_id", workspaceId).eq("status", "active").maybeSingle(),
                adminClient.rpc("get_workspace_credit_balance", { p_workspace_id: workspaceId }),
              ]);
              if (reSub.data) sub = reSub.data;
              balance = Number(reBal.data || targetMins);
            }
          } else {
            // Hub has no active paid subscription for this user -> downgrade/cancel Voice Pilot sub
            if (sub && (sub.plan_id === "gap_pro" || sub.plan_id === "gap_enterprise" || String(sub.plan_id).startsWith("gap_") || sub.status === "active")) {
              await adminClient
                .from("workspace_subscriptions")
                .update({
                  status: "canceled",
                  updated_at: new Date().toISOString(),
                })
                .eq("workspace_id", workspaceId);

              await adminClient
                .from("profiles")
                .update({ current_plan: null })
                .eq("id", user.id);

              // Clear promotional grant ledger entries if present
              await adminClient
                .from("credit_ledger")
                .delete()
                .eq("workspace_id", workspaceId)
                .ilike("description", "%Included Monthly Credits%");

              const reBal = await adminClient.rpc("get_workspace_credit_balance", { p_workspace_id: workspaceId });
              sub = null;
              balance = Math.max(0, Number(reBal.data || 0));
            }
          }
        }
      }
    } catch (e) {
      console.warn("Auto-reconcile check notice:", e);
    }
  }

  // 3. Get All Plans (active and unique)
  const { data: allPlans } = await adminClient
    .from('plans')
    .select('*')
    .neq('id', 'sidebar_permissions')
    .eq('is_active', true)
    .order('price_monthly', { ascending: true });

  const uniquePlansMap = new Map();
  (allPlans || []).forEach((p: any) => {
    const key = (p.name || p.id).trim().toLowerCase();
    if (!uniquePlansMap.has(key)) {
      uniquePlansMap.set(key, p);
    }
  });
  const sanitizedPlans = Array.from(uniquePlansMap.values());

  // 4. Get Ledger History
  const { data: ledger } = await adminClient
    .from('credit_ledger')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(20);

  return {
    workspaceId,
    balance,
    subscription: sub || null,
    plans: sanitizedPlans,
    ledger: ledger || [],
    razorpayKeyId: getRazorpayKeyId()
  };
}

/**
 * Create a Razorpay Order (Server Action)
 */
export async function createRazorpayOrderAction(params: { amount: number; planId?: string; type: 'top_up' | 'subscription' }) {
  const { amount, planId, type } = params;
  const workspaceId = await getWorkspaceId();
  const razorpayKeyId = getRazorpayKeyId();
  const razorpayKeySecret = getRazorpayKeySecret();

  const authHeader = 'Basic ' + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: { workspaceId, planId: planId || 'custom', type }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Razorpay API order error:', errText);
    return { success: false, error: 'Failed to create Razorpay Order' };
  }

  const order = await response.json();

  return {
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: razorpayKeyId,
    workspaceId
  };
}

/**
 * Verify Razorpay Payment Signature & Update Supabase DB (Subscriptions + Profiles.current_plan)
 */
export async function verifyRazorpayPaymentAction(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  planId?: string;
  type: 'top_up' | 'subscription';
  amount?: number;
}) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId, type, amount } = params;
  const adminClient = await getAdminClient();
  const workspaceId = await getWorkspaceId();
  const razorpayKeySecret = getRazorpayKeySecret();

  // Verify HMAC SHA256 Signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', razorpayKeySecret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return { success: false, error: 'Payment signature verification failed' };
  }

  if (type === 'subscription' && planId) {
    const { data: targetPlan } = await adminClient.from('plans').select('*').eq('id', planId).maybeSingle();

    // 1. Update workspace_subscriptions
    await adminClient.from('workspace_subscriptions').upsert({
      workspace_id: workspaceId,
      plan_id: planId,
      status: 'active',
      stripe_subscription_id: razorpay_payment_id,
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }, { onConflict: 'workspace_id' });

    // 2. Sync to profiles table for easy Supabase UI viewing
    const { data: ws } = await adminClient.from('workspaces').select('owner_id').eq('id', workspaceId).maybeSingle();
    if (ws?.owner_id) {
      await adminClient.from('profiles').update({ current_plan: planId }).eq('id', ws.owner_id);
    }

    // 3. Grant plan included credits
    const includedCredits = targetPlan?.included_credits || 100;
    await adminClient.from('credit_ledger').insert({
      workspace_id: workspaceId,
      type: 'grant',
      amount: includedCredits,
      description: `Plan Subscription: ${targetPlan?.name || planId} (Razorpay ${razorpay_payment_id})`,
      reference_id: razorpay_payment_id
    });

    // 4. Bidirectional Sync: Propagate newly purchased plan to GetAiPilot Main Hub DB
    try {
      let userEmail: string | undefined;
      if (ws?.owner_id) {
        const { data: ownerProf } = await adminClient
          .from('profiles')
          .select('email')
          .eq('id', ws.owner_id)
          .maybeSingle();
        userEmail = ownerProf?.email;
      }

      if (!userEmail) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
          {
            cookies: {
              getAll: () => cookieStore.getAll(),
              setAll: () => {},
            },
          }
        );
        const { data: { user } } = await supabase.auth.getUser();
        userEmail = user?.email;
      }

      if (userEmail) {
        const hubUrl = process.env.HUB_SUPABASE_URL || "https://uklxlappjcuvdqjvecfh.supabase.co";
        const hubKey = process.env.HUB_SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbHhsYXBwamN1dmRxanZlY2ZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE0NzA4MywiZXhwIjoyMDgzNzIzMDgzfQ.8raDYx4BqeVELD691E720qBORhWEI4L68c_ED2JIt5w";
        const hubClient = createClient(hubUrl, hubKey);

        const { data: hubProfile } = await hubClient
          .from("profiles")
          .select("id")
          .ilike("email", userEmail)
          .maybeSingle();

        if (hubProfile) {
          const planLabel = targetPlan?.name || (planId === "gap_enterprise" ? "GAP Enterprise" : planId === "gap_pro" ? "GAP Pro" : planId);
          const pricePaise = (targetPlan?.price_monthly || (planId === "gap_enterprise" ? 8999 : 4999)) * 100;
          const nowIso = new Date().toISOString();
          const expiresIso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

          // Upsert into app_user_subscriptions on Hub
          await hubClient.from("app_user_subscriptions").upsert({
            user_id: hubProfile.id,
            email: userEmail,
            plan_id: planId,
            plan_label: planLabel,
            plan_price_paise: pricePaise,
            plan_duration_days: 30,
            started_at: nowIso,
            expires_at: expiresIso,
            status: "active",
            subscription_status: "active",
            last_payment_id: razorpay_payment_id,
            last_payment_status: "paid",
            last_payment_verified_at: nowIso,
            updated_at: nowIso,
          }, { onConflict: "user_id" });

          // Update profiles on Hub
          await hubClient.from("profiles").update({
            subscription: planLabel,
            updated_at: nowIso,
          }).eq("id", hubProfile.id);

          // If plan is a bundle / pro / enterprise plan, also activate WhatsApp organization on Hub
          const lowerPlan = planId.toLowerCase();
          if (lowerPlan.includes("pro") || lowerPlan.includes("enterprise") || lowerPlan.includes("all_in_one")) {
            const { data: members } = await hubClient
              .from("organization_members")
              .select("organization_id")
              .eq("user_id", hubProfile.id);
            if (members && members.length > 0) {
              const orgIds = members.map((m: any) => m.organization_id);
              await hubClient
                .from("organizations")
                .update({
                  plan_id: lowerPlan.includes("enterprise") ? "enterprise" : "pro",
                  plan_status: "active",
                  subscription_tier: lowerPlan.includes("enterprise") ? "enterprise" : "pro",
                  updated_at: nowIso,
                })
                .in("id", orgIds);
            }
          }
        }
      }
    } catch (hubSyncErr) {
      console.warn("Notice: Hub sync during subscription purchase:", hubSyncErr);
    }

    revalidatePath('/dashboard/billing');
    return {
      success: true,
      message: `Plan ${targetPlan?.name || planId} activated! ${includedCredits} AI Mins credited.`,
      planId
    };
  }

  // Top Up Wallet
  const rupees = Number(amount || 500);
  const minutesGranted = Math.floor(rupees / 5);

  await adminClient.from('credit_ledger').insert({
    workspace_id: workspaceId,
    type: 'top_up',
    amount: minutesGranted,
    description: `Razorpay Wallet Top-up (₹${rupees} = ${minutesGranted} Mins)`,
    reference_id: razorpay_payment_id
  });

  revalidatePath('/dashboard/billing');
  return {
    success: true,
    message: `Recharged ₹${rupees} (${minutesGranted} AI Mins added)!`,
    minutesGranted
  };
}
