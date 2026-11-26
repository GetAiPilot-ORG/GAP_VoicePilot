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
          .select("id, is_admin, role, subscription")
          .ilike("email", user.email)
          .maybeSingle();

        if (hubProfile) {
          const [{ data: hubSub }, { data: hubPayments }] = await Promise.all([
            hubClient
              .from("app_user_subscriptions")
              .select("*")
              .eq("user_id", hubProfile.id)
              .maybeSingle(),
            hubClient
              .from("app_subscription_payments")
              .select("plan_id, plan_label, payment_id, charged_at, created_at, raw, payment_status")
              .eq("user_id", hubProfile.id)
              .order("created_at", { ascending: false })
              .limit(5),
          ]);

          const nowMs = Date.now();
          const isPrivileged =
            Boolean(hubProfile.is_admin) ||
            ["admin", "tester"].includes(String(hubProfile.role || "").toLowerCase());

          const isHubSubActive = Boolean(
            hubSub?.plan_id &&
            hubSub.plan_id !== "free" &&
            hubSub.plan_id !== "free_trial" &&
            (isPrivileged ||
              (["active", "prepaid", "captured", "trialing"].includes(
                String(hubSub.status || hubSub.subscription_status || "").toLowerCase(),
              ) &&
                (!hubSub.expires_at || new Date(hubSub.expires_at).getTime() > nowMs))),
          );

          let activePayPlanId = "";
          let activePayLabel = "";
          let activePayPaymentId = "";
          let activePayStartedAt = "";
          let activePayExpiresAt = "";

          if (!isHubSubActive && hubPayments?.length) {
            for (const p of hubPayments as any[]) {
              if (p?.payment_status === "failed" || p?.plan_id === "free_trial") continue;
              if (Array.isArray(p?.raw?.active_plans)) {
                const validAp = p.raw.active_plans.find(
                  (ap: any) => ap?.expires_at && new Date(ap.expires_at).getTime() > nowMs && ap?.plan_id !== "free_trial",
                );
                if (validAp) {
                  activePayPlanId = validAp.plan_id || p.plan_id;
                  activePayLabel = validAp.plan_label || p.plan_label;
                  activePayPaymentId = p.payment_id || "";
                  activePayStartedAt = validAp.started_at || p.charged_at || p.created_at;
                  activePayExpiresAt = validAp.expires_at;
                  break;
                }
              }
              const ts = p?.charged_at || p?.created_at;
              if (ts && p?.plan_id) {
                const endMs = new Date(ts).getTime() + 32 * 86400000;
                if (endMs > nowMs) {
                  activePayPlanId = p.plan_id;
                  activePayLabel = p.plan_label;
                  activePayPaymentId = p.payment_id || "";
                  activePayStartedAt = ts;
                  activePayExpiresAt = new Date(endMs).toISOString();
                  break;
                }
              }
            }
          }

          const resolvedPlanIdStr = isHubSubActive
            ? String(hubSub.plan_id || "")
            : activePayPlanId
              ? activePayPlanId
              : isPrivileged
                ? (String(hubProfile.subscription || "").toLowerCase().includes("enterprise") ||
                  String(hubProfile.subscription || "").toLowerCase().includes("enterprice")
                    ? "gap_enterprise"
                    : "gap_core")
                : "";

          const resolvedPlanLabelStr = isHubSubActive
            ? String(hubSub.plan_label || "")
            : activePayLabel
              ? activePayLabel
              : isPrivileged
                ? (resolvedPlanIdStr === "gap_enterprise" ? "GAP Enterprise" : "GAP Core")
                : "";

          if (resolvedPlanIdStr) {
            const planIdsStr = resolvedPlanIdStr.toLowerCase();
            const planLabelsStr = resolvedPlanLabelStr.toLowerCase();

            const isEnterprise =
              planIdsStr.includes("enterprise") ||
              planIdsStr.includes("enterprice") ||
              planIdsStr.includes("gap_scale") ||
              planLabelsStr.includes("enterprise");

            const isCore =
              !isEnterprise &&
              (planIdsStr.includes("gap_core") ||
                planIdsStr.includes("all_in_one") ||
                planIdsStr.includes("bundle") ||
                planIdsStr.includes("gap_max") ||
                planLabelsStr.includes("gap core") ||
                planLabelsStr.includes("gap max"));

            const isPro =
              !isEnterprise &&
              !isCore &&
              (planIdsStr.includes("gap_pro") ||
                planLabelsStr.includes("gap pro") ||
                planIdsStr === "pro");

            if (isEnterprise || isCore || isPro) {
              const targetPlanId = isEnterprise
                ? "gap_enterprise"
                : isCore
                  ? "gap_core"
                  : "gap_pro";
              const targetMins = isEnterprise ? 250 : isCore ? 300 : 100;
              const planLabel = isEnterprise
                ? "GAP Enterprise"
                : isCore
                  ? "GAP Core"
                  : "GAP Pro";

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
                    extra_min_rate: isEnterprise || isCore ? 4 : 5,
                    campaigns: true,
                    ecosystem: true,
                  },
                  is_active: true,
                });
              }

              // Update/insert workspace subscription
              if (!sub || sub.status !== "active" || sub.plan_id !== targetPlanId) {
                await adminClient.from("workspace_subscriptions").upsert(
                  {
                    workspace_id: workspaceId,
                    plan_id: targetPlanId,
                    status: "active",
                    current_period_start:
                      (isHubSubActive ? hubSub.started_at : activePayStartedAt) ||
                      new Date().toISOString(),
                    current_period_end:
                      (isHubSubActive ? hubSub.expires_at : activePayExpiresAt) ||
                      new Date(Date.now() + 30 * 86400000).toISOString(),
                    ...(isHubSubActive && hubSub.last_payment_id
                      ? { razorpay_payment_id: hubSub.last_payment_id }
                      : activePayPaymentId
                        ? { razorpay_payment_id: activePayPaymentId }
                        : {}),
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
                      (isHubSubActive ? hubSub.last_payment_id : activePayPaymentId) ||
                      `hub_sync_${Date.now()}`,
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
          } else if (
            !isPrivileged &&
            sub &&
            (sub.plan_id === "gap_pro" ||
              sub.plan_id === "gap_core" ||
              sub.plan_id === "gap_enterprise" ||
              String(sub.plan_id).startsWith("gap_"))
          ) {
            // Hub has no active paid/admin ecosystem subscription for this user -> downgrade/cancel GAP bundle sub
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
