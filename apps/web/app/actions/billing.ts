"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient, requireCurrentWorkspace } from "@/lib/workspace";
import { createClient as createServerSupabaseClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getRazorpayKeyId(): string {
  return requireEnv("NEXT_PUBLIC_RAZORPAY_KEY_ID");
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

  const balance = Number(balanceData || 0);

  const { data: wsData } = await adminClient
    .from("workspaces")
    .select("dedicated_number_entitlements")
    .eq("id", workspaceId)
    .single();

  const dedicatedNumberEntitlements = wsData?.dedicated_number_entitlements || 0;

  // 2. Get Subscription & Plan (including expired for renewal detection)
  const { data: sub } = await adminClient
    .from("workspace_subscriptions")
    .select("*, plans(*)")
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  // 3. Get All Plans
  const { data: allPlans } = await adminClient
    .from("plans")
    .select("*")
    .order("price_monthly", { ascending: true });

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
    (n: any) => !n.current_period_end || new Date(n.current_period_end).getTime() > Date.now()
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
    plans: allPlans || [],
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
      keyId: getRazorpayKeyId(),
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
