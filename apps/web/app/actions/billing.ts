"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient, requireCurrentWorkspace } from "@/lib/workspace";
import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getRazorpayKeyId(): string {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "";
}

// Get the user's session token to pass to the Express backend
async function getAuthToken(): Promise<string> {
  const cookieStore = await cookies();
  const supabase = await createServerSupabaseClient(cookieStore);
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Unauthorized");
  }
  return session.access_token;
}

function getPaymentsApiUrl() {
  const apiUrl = (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000"
  ).replace(/\/$/, "");
  return apiUrl.endsWith("/api/v1")
    ? `${apiUrl}/payments`
    : `${apiUrl}/api/v1/payments`;
}

export async function getBillingDataAction() {
  const adminClient = await getAdminClient();
  const { workspaceId } = await requireCurrentWorkspace();

  // 1. Get Balance
  const { data: balanceData } = await adminClient.rpc(
    "get_workspace_credit_balance",
    {
      p_workspace_id: workspaceId,
    },
  );

  let balance = Number(balanceData || 0);

  const { data: wsData } = await adminClient
    .from("workspaces")
    .select("dedicated_number_entitlements")
    .eq("id", workspaceId)
    .single();

  const dedicatedNumberEntitlements = wsData?.dedicated_number_entitlements || 0;

  // 2. Get Subscription & Plan (including expired for renewal detection)
  let { data: sub } = await adminClient
    .from("workspace_subscriptions")
    .select("*, plans(*)")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  // 2.1 Auto-Reconciliation with Hub Database if no active plan or balance is 0
  if (!sub || sub.status !== "active" || balance === 0) {
    try {
      const cookieStore = await cookies();
      const supabase = await createServerSupabaseClient(cookieStore);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        const hubUrl =
          process.env.HUB_SUPABASE_URL ||
          "https://uklxlappjcuvdqjvecfh.supabase.co";
        const hubKey =
          process.env.HUB_SUPABASE_SERVICE_ROLE_KEY ||
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrbHhsYXBwamN1dmRxanZlY2ZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODE0NzA4MywiZXhwIjoyMDgzNzIzMDgzfQ.8raDYx4BqeVELD691E720qBORhWEI4L68c_ED2JIt5w";
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
              if (!sub || sub.status !== "active") {
                await adminClient.from("workspace_subscriptions").upsert(
                  {
                    workspace_id: workspaceId,
                    plan_id: targetPlanId,
                    status: "active",
                    current_period_start:
                      hubSub.started_at || new Date().toISOString(),
                    current_period_end:
                      hubSub.expires_at ||
                      new Date(Date.now() + 30 * 86400000).toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: "workspace_id" },
                );

                await adminClient
                  .from("profiles")
                  .update({
                    current_plan: targetPlanId,
                  })
                  .eq("id", user.id);
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
                    reference_id:
                      hubSub.last_payment_id || `hub_sync_${Date.now()}`,
                    created_at: new Date().toISOString(),
                  });
                }
              }

              // Re-fetch sub and balance
              const [reSub, reBal] = await Promise.all([
                adminClient
                  .from("workspace_subscriptions")
                  .select("*, plans(*)")
                  .eq("workspace_id", workspaceId)
                  .eq("status", "active")
                  .maybeSingle(),
                adminClient.rpc("get_workspace_credit_balance", {
                  p_workspace_id: workspaceId,
                }),
              ]);
              if (reSub.data) sub = reSub.data;
              balance = Number(reBal.data || targetMins);
            }
          } else {
            // Hub has no active paid subscription for this user -> downgrade/cancel Voice Pilot sub
            if (
              sub &&
              (sub.plan_id === "gap_pro" ||
                sub.plan_id === "gap_enterprise" ||
                String(sub.plan_id).startsWith("gap_") ||
                sub.status === "active")
            ) {
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

              const reBal = await adminClient.rpc(
                "get_workspace_credit_balance",
                { p_workspace_id: workspaceId },
              );
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
    .from("plans")
    .select("*")
    .neq("id", "sidebar_permissions")
    .eq("is_active", true)
    .order("price_monthly", { ascending: true });

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
    .from("credit_ledger")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(20);

  // 5. Get Active Phone Numbers
  const { data: phoneNumbers } = await adminClient
    .from("phone_numbers")
    .select("id, phone_number, current_period_end, assigned_assistant_id")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null);

  const activePhoneNumbers = (phoneNumbers || []).filter(
    (n: any) =>
      !n.current_period_end ||
      new Date(n.current_period_end).getTime() > Date.now(),
  );

  // 6. Get Payment Invoices & Orders History
  const { data: payments } = await adminClient
    .from("payment_intents")
    .select("*, plans(name)")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(30);

  return {
    workspaceId,
    balance,
    dedicatedNumberEntitlements,
    activePhoneNumbersCount: activePhoneNumbers.length,
    phoneNumbers: phoneNumbers || [],
    subscription: sub || null,
    plans: sanitizedPlans,
    ledger: ledger || [],
    payments: payments || [],
    razorpayKeyId: getRazorpayKeyId(),
  };
}

/**
 * Create a Razorpay Order - Proxies to Express API
 */
export async function createRazorpayOrderAction(params: {
  amount?: number;
  planId?: string;
  type: "top_up" | "plan_purchase" | "number_purchase";
}) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${getPaymentsApiUrl()}/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const err = await response.json();
      return {
        success: false,
        error: err.error || "Failed to create Razorpay Order",
      };
    }

    const data = await response.json();
    return {
      success: true,
      orderId: data.data.orderId,
      amount: data.data.amount,
      currency: data.data.currency,
      keyId: data.data.keyId || getRazorpayKeyId(),
    };
  } catch (err: any) {
    console.error("Proxy create-order error:", err);
    return { success: false, error: err.message || "Internal error" };
  }
}

/**
 * Verify Razorpay Payment - Proxies to Express API
 */
export async function verifyRazorpayPaymentAction(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${getPaymentsApiUrl()}/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const err = await response.json();
      return {
        success: false,
        error: err.error || "Payment verification failed",
      };
    }

    const data = await response.json();

    // Revalidate the billing page to reflect new credits and plan status
    revalidatePath("/dashboard/billing");

    return {
      success: true,
      message: data.message,
      minutesGranted: data.creditsGranted,
    };
  } catch (err: any) {
    console.error("Proxy verify-payment error:", err);
    return { success: false, error: err.message || "Internal error" };
  }
}
