import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-sync-secret, Authorization",
};

function jsonRes(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

interface VoicePlanSpec {
  id: string;
  name: string;
  priceMonthly: number;
  includedCredits: number;
  maxAssistants: number;
  maxConcurrentCalls: number;
  extraMinRate: number;
  isBundle: boolean;
}

function mapHubPlanToVoice(planId?: string | null, planLabel?: string | null): VoicePlanSpec | null {
  const combined = `${planId || ""} ${planLabel || ""}`.toLowerCase().trim();
  if (!combined || combined === "free" || combined === "free_trial") return null;

  if (
    combined.includes("enterprise") ||
    combined.includes("enterprice") ||
    combined.includes("gap_scale")
  ) {
    return {
      id: "gap_enterprise",
      name: "GAP Enterprise",
      priceMonthly: 8999,
      includedCredits: 250,
      maxAssistants: 20,
      maxConcurrentCalls: 5,
      extraMinRate: 4,
      isBundle: true,
    };
  }

  if (
    combined.includes("gap_core") ||
    combined.includes("gap core") ||
    combined.includes("all_in_one") ||
    combined.includes("bundle") ||
    combined.includes("gap_max")
  ) {
    return {
      id: "gap_core",
      name: "GAP Core",
      priceMonthly: 4999,
      includedCredits: 300,
      maxAssistants: 5,
      maxConcurrentCalls: 2,
      extraMinRate: 4,
      isBundle: true,
    };
  }

  if (combined.includes("gap_pro") || combined === "pro") {
    return {
      id: "gap_pro",
      name: "GAP Pro",
      priceMonthly: 4999,
      includedCredits: 100,
      maxAssistants: 5,
      maxConcurrentCalls: 2,
      extraMinRate: 5,
      isBundle: true,
    };
  }

  if (combined.includes("calling_elite") || combined.includes("call_elite")) {
    return {
      id: "call_elite",
      name: "CALL ELITE",
      priceMonthly: 7999,
      includedCredits: 2000,
      maxAssistants: 20,
      maxConcurrentCalls: 4,
      extraMinRate: 5,
      isBundle: false,
    };
  }

  if (combined.includes("calling_pro") || combined.includes("call_pro")) {
    return {
      id: "call_pro",
      name: "CALL PRO",
      priceMonthly: 2999,
      includedCredits: 500,
      maxAssistants: 5,
      maxConcurrentCalls: 2,
      extraMinRate: 5,
      isBundle: false,
    };
  }

  if (combined.includes("calling_lite") || combined.includes("call_lite")) {
    return {
      id: "call_lite",
      name: "CALL LITE",
      priceMonthly: 1499,
      includedCredits: 100,
      maxAssistants: 1,
      maxConcurrentCalls: 1,
      extraMinRate: 6,
      isBundle: false,
    };
  }

  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonRes(405, { error: "Method not allowed" });
  }

  const syncSecret = Deno.env.get("VOICE_SYNC_SECRET") ?? "";
  const incomingSecret = req.headers.get("x-sync-secret") ?? "";
  if (!syncSecret || incomingSecret !== syncSecret) {
    return jsonRes(401, { error: "Unauthorized" });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !supabaseKey) {
    return jsonRes(500, { error: "Server misconfiguration" });
  }

  try {
    const body = await req.json();
    const email = String(body.email || body.userEmail || "").trim().toLowerCase();
    const hubUserId = body.hub_user_id || body.userId || null;
    const planSpec = mapHubPlanToVoice(body.plan_id, body.plan_label);

    if (!email) {
      return jsonRes(400, { error: "email is required" });
    }

    if (!planSpec) {
      return jsonRes(200, { success: true, skipped: true, reason: "No Voice-eligible plan" });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    // Ensure profile exists
    let { data: profile } = await supabase
      .from("profiles")
      .select("id, hub_user_id")
      .ilike("email", email)
      .maybeSingle();

    if (!profile?.id) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { full_name: body.name || email.split("@")[0] },
      });
      if (createErr && !createErr.message?.toLowerCase().includes("already")) {
        return jsonRes(500, { error: createErr.message });
      }
      const uid = created?.user?.id;
      if (uid) {
        const { data: p2 } = await supabase
          .from("profiles")
          .select("id, hub_user_id")
          .eq("id", uid)
          .maybeSingle();
        profile = p2;
      }
      if (!profile?.id) {
        const { data: pByEmail } = await supabase
          .from("profiles")
          .select("id, hub_user_id")
          .ilike("email", email)
          .maybeSingle();
        profile = pByEmail;
      }
    }

    if (!profile?.id) {
      return jsonRes(404, { error: "Voice user profile not found" });
    }

    // Ensure plan exists in plans table
    const { data: planExists } = await supabase
      .from("plans")
      .select("id")
      .eq("id", planSpec.id)
      .maybeSingle();

    if (!planExists) {
      await supabase.from("plans").insert({
        id: planSpec.id,
        name: planSpec.name,
        price_monthly: planSpec.priceMonthly,
        included_credits: planSpec.includedCredits,
        max_assistants: planSpec.maxAssistants,
        max_concurrent_calls: planSpec.maxConcurrentCalls,
        features: {
          badge: planSpec.name,
          description: `${planSpec.includedCredits} AI calling minutes included in ${planSpec.name}`,
          extra_min_rate: planSpec.extraMinRate,
          campaigns: true,
          ecosystem: planSpec.isBundle,
        },
        is_active: true,
      });
    }

    // Resolve or create workspace
    let { data: member } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", profile.id)
      .limit(1)
      .maybeSingle();

    let workspaceId = member?.workspace_id;
    if (!workspaceId) {
      const { data: ownedWs } = await supabase
        .from("workspaces")
        .select("id")
        .eq("owner_id", profile.id)
        .limit(1)
        .maybeSingle();
      workspaceId = ownedWs?.id;
    }

    if (!workspaceId) {
      const { data: newWs } = await supabase
        .from("workspaces")
        .insert({
          name: `${email.split("@")[0]}'s Workspace`,
          owner_id: profile.id,
        })
        .select("id")
        .single();
      if (newWs?.id) {
        workspaceId = newWs.id;
        await supabase.from("workspace_members").insert({
          workspace_id: workspaceId,
          user_id: profile.id,
          role: "owner",
        });
      }
    }

    if (!workspaceId) {
      return jsonRes(500, { error: "Failed to resolve Voice workspace" });
    }

    const nowIso = new Date().toISOString();
    const periodEnd = body.expires_at || new Date(Date.now() + 30 * 86400000).toISOString();

    await supabase
      .from("profiles")
      .update({
        current_plan: planSpec.id,
        ...(hubUserId && !profile.hub_user_id ? { hub_user_id: hubUserId } : {}),
      })
      .eq("id", profile.id);

    await supabase.from("workspace_subscriptions").upsert(
      {
        workspace_id: workspaceId,
        plan_id: planSpec.id,
        status: "active",
        current_period_start: nowIso,
        current_period_end: periodEnd,
        updated_at: nowIso,
      },
      { onConflict: "workspace_id" },
    );

    if (planSpec.isBundle) {
      await supabase
        .from("workspaces")
        .update({ dedicated_number_entitlements: 1 })
        .eq("id", workspaceId);
    }

    // Only grant included credits if workspace currently has 0 balance and hasn't received this sync grant
    const { data: rpcBal } = await supabase.rpc("get_workspace_credit_balance", {
      p_workspace_id: workspaceId,
    });
    if (Number(rpcBal || 0) === 0) {
      const syncRef = `hub_sync_${workspaceId}_${planSpec.id}_${periodEnd.slice(0, 10)}`;
      const { error: creditErr } = await supabase.from("credit_ledger").insert({
        workspace_id: workspaceId,
        type: "grant",
        amount: planSpec.includedCredits,
        description: `${planSpec.name} Included Monthly Credits (${planSpec.includedCredits} AI Mins)`,
        reference_id: syncRef,
        created_at: nowIso,
      });
      if (creditErr && creditErr.code !== "23505") {
        console.warn("[voice sync-from-hub] credit grant note:", creditErr.message);
      }
    }

    return jsonRes(200, {
      success: true,
      workspace_id: workspaceId,
      plan_id: planSpec.id,
      plan_label: planSpec.name,
    });
  } catch (err: any) {
    console.error("[voice sync-from-hub] Error:", err?.message || err);
    return jsonRes(500, { error: err?.message || "Internal server error" });
  }
});
