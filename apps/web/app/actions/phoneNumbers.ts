"use server";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
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
          } catch {}
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
      .limit(1)
      .maybeSingle();

    if (member?.workspace_id) return member.workspace_id;
  }

  const { data: anyWs } = await adminClient.from('workspaces').select('id').limit(1).maybeSingle();
  if (anyWs?.id) return anyWs.id;

  const { data: newWs } = await adminClient.from('workspaces').insert({ name: 'Default Workspace', owner_id: user?.id || '00000000-0000-0000-0000-000000000000' }).select().single();
  return newWs.id;
}

export async function assignPhoneNumberAction(numberId: string, assistantId: string | null) {
  const adminClient = await getAdminClient();
  
  const { error } = await adminClient
    .from("phone_numbers")
    .update({ assigned_assistant_id: assistantId })
    .eq("id", numberId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard/phone-numbers");
  return { success: true };
}

/**
 * Fetch and Sync Phone Numbers from Vomyra API
 */
export async function fetchAndSyncVomyraNumbersAction() {
  const adminClient = await getAdminClient();
  const workspaceId = await getWorkspaceId();

  let fetchedNumbersCount = 0;
  let errorMsg: string | null = null;

  try {
    const vomyraBaseUrl = process.env.VOMYRA_BASE_URL || "https://api.vomyra.com";
    const vomyraApiKey = process.env.VOMYRA_API_KEY || "";

    // 1. Fetch workspace assistants from Supabase
    const { data: workspaceAssistants } = await adminClient
      .from("assistants")
      .select("id, name, provider_resource_id, config_snapshot")
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null);

    if (workspaceAssistants && workspaceAssistants.length > 0) {
      for (const ast of workspaceAssistants) {
        let phoneNumFound: string | null = null;

        // Check snapshot config first
        if (ast.config_snapshot && (ast.config_snapshot.phone_number || ast.config_snapshot.assigned_number)) {
          phoneNumFound = ast.config_snapshot.phone_number || ast.config_snapshot.assigned_number;
        }

        // Query Vomyra API live if key is present
        if (!phoneNumFound && vomyraApiKey && ast.provider_resource_id) {
          try {
            const vRes = await fetch(`${vomyraBaseUrl}/v1/assistants/${ast.provider_resource_id}`, {
              headers: { "x-api-key": vomyraApiKey }
            });
            if (vRes.ok) {
              const vData = await vRes.json();
              if (vData?.phone_number || vData?.assigned_number || vData?.phone_number_id) {
                phoneNumFound = vData.phone_number || vData.assigned_number || vData.phone_number_id;
              }
            }
          } catch (e) {
            console.warn("Vomyra fetch assistant error:", e);
          }
        }

        if (phoneNumFound) {
          const clean = String(phoneNumFound).trim();
          await adminClient.from("phone_numbers").upsert({
            workspace_id: workspaceId,
            phone_number: clean,
            provider: "vomyra",
            provider_resource_id: `vomyra_${clean.replace(/[^\d+]/g, "")}`,
            assigned_assistant_id: ast.id,
            status: "active"
          }, { onConflict: "phone_number" });

          fetchedNumbersCount++;
        }
      }
    }
  } catch (err: any) {
    errorMsg = err.message;
  }

  const freshData = await fetchPhoneNumbersAction();
  return {
    success: true,
    fetchedNumbersCount,
    errorMsg,
    ...freshData
  };
}

export async function buyPhoneNumberAction(availableNumberId: string, phoneNumber: string, provider: string) {
  const adminClient = await getAdminClient();
  const workspaceId = await getWorkspaceId();

  const { data: existing } = await adminClient
    .from("phone_numbers")
    .select("id")
    .eq("id", availableNumberId)
    .maybeSingle();

  let resultNumber: any = null;

  if (existing) {
    const { data, error } = await adminClient
      .from("phone_numbers")
      .update({
        workspace_id: workspaceId,
        status: 'active'
      })
      .eq("id", availableNumberId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    resultNumber = data;
  } else {
    const { data, error } = await adminClient
      .from("phone_numbers")
      .insert({
        workspace_id: workspaceId,
        phone_number: phoneNumber,
        provider: provider || 'vomyra',
        provider_resource_id: `pn_${Date.now()}`,
        status: 'active'
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    resultNumber = data;
  }

  revalidatePath("/dashboard/phone-numbers");
  return { success: true, newNumber: resultNumber };
}

export async function fetchPhoneNumbersAction() {
  const adminClient = await getAdminClient();
  const workspaceId = await getWorkspaceId();

  const { data: myNumbers } = await adminClient
    .from("phone_numbers")
    .select("*, assistants(id, name)")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const { data: availableNumbers } = await adminClient
    .from("phone_numbers")
    .select("*")
    .is("workspace_id", null)
    .is("deleted_at", null);

  return {
    myNumbers: (myNumbers || []).map((n: any) => ({
      id: n.id,
      phone_number: n.phone_number,
      provider: n.provider || "vomyra",
      provider_resource_id: n.provider_resource_id,
      assigned_assistant_id: n.assigned_assistant_id,
      assistants: n.assistants ? { id: n.assistants.id, name: n.assistants.name } : null,
      status: (n.assigned_assistant_id ? "active" : "unassigned") as "active" | "unassigned" | "purchased",
      created_at: n.created_at
    })),
    availableNumbers: (availableNumbers || []).map((n: any) => ({
      id: n.id,
      phone_number: n.phone_number,
      country: "United States",
      country_code: "US",
      provider: n.provider || "vomyra",
      monthly_price: 2.00
    }))
  };
}
