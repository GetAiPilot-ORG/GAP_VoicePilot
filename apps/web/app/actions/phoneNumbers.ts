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
    } catch(e) {}
  }
  return newWs.id;
}

export async function assignPhoneNumberAction(numberId: string, assistantId: string | null) {
  const adminClient = await getAdminClient();
  
  // Fetch phone number details
  const { data: phoneData, error: phoneError } = await adminClient
    .from("phone_numbers")
    .select("phone_number")
    .eq("id", numberId)
    .single();

  if (phoneError || !phoneData) {
    return { success: false, error: "Phone number not found." };
  }

  const vomyraBaseUrl = process.env.VOMYRA_BASE_URL || "https://api.vomyra.com";
  const vomyraApiKey = process.env.VOMYRA_API_KEY || "";

  // If assigning to an assistant, sync with Vomyra using PUT
  if (assistantId) {
    const { data: assistantData, error: assistantError } = await adminClient
      .from("assistants")
      .select("provider_resource_id")
      .eq("id", assistantId)
      .single();

    if (assistantError || !assistantData?.provider_resource_id) {
      return { success: false, error: "Assistant not found or missing provider ID." };
    }

    if (vomyraApiKey) {
      try {
        const vRes = await fetch(`${vomyraBaseUrl}/v1/numbers/assignment`, {
          method: "PUT",
          headers: {
            "x-api-key": vomyraApiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phone_number: phoneData.phone_number,
            assistant_id: assistantData.provider_resource_id
          })
        });

        if (!vRes.ok) {
          const text = await vRes.text();
          console.error("Vomyra assignment failed:", text);
          return { success: false, error: "Failed to sync assignment with Vomyra API." };
        }
      } catch (e: any) {
        console.error("Vomyra sync error:", e);
        return { success: false, error: "Error communicating with Vomyra API." };
      }
    }
  } else {
    // If unassigning, sync with Vomyra using DELETE
    if (vomyraApiKey) {
      try {
        const vRes = await fetch(`${vomyraBaseUrl}/v1/numbers/assignment`, {
          method: "DELETE",
          headers: {
            "x-api-key": vomyraApiKey,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phone_number: phoneData.phone_number
          })
        });

        if (!vRes.ok) {
          const text = await vRes.text();
          console.error("Vomyra unassignment failed:", text);
          // Let it pass locally even if Vomyra fails, or return error?
          // We should return an error to prevent them getting out of sync.
          return { success: false, error: "Failed to sync unassignment with Vomyra API." };
        }
      } catch (e: any) {
        console.error("Vomyra sync error:", e);
        return { success: false, error: "Error communicating with Vomyra API." };
      }
    }
  }

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

    // Fetch all numbers from Vomyra API directly to ensure perfect sync
    if (vomyraApiKey) {
      const vRes = await fetch(`${vomyraBaseUrl}/v1/numbers`, {
        headers: { "x-api-key": vomyraApiKey }
      });
      
      if (vRes.ok) {
        const vData = await vRes.json();
        const vomyraNumbers = Array.isArray(vData) ? vData : (vData.phone_numbers || vData.data || []);
        
        // 1. Fetch workspace assistants from Supabase to map them
        const { data: workspaceAssistants } = await adminClient
          .from("assistants")
          .select("id, name, provider_resource_id")
          .eq("workspace_id", workspaceId)
          .is("deleted_at", null);

        const localAssistantMap = new Map();
        if (workspaceAssistants) {
          workspaceAssistants.forEach(ast => {
            if (ast.provider_resource_id) {
              localAssistantMap.set(ast.provider_resource_id, ast.id);
            }
          });
        }

        // 2. Fetch current workspace numbers to only update numbers that belong to this workspace
        // (If the number is assigned to a workspace assistant in Vomyra, we import it to this workspace)
        const { data: workspaceNumbers } = await adminClient
          .from("phone_numbers")
          .select("phone_number")
          .eq("workspace_id", workspaceId)
          .is("deleted_at", null);
          
        const workspaceNumberSet = new Set(workspaceNumbers?.map(n => n.phone_number) || []);

        for (const vNum of vomyraNumbers) {
          if (!vNum || !vNum.phone_number) continue;
          
          const cleanPhone = String(vNum.phone_number).trim();
          let localAssignedAssistantId = null;
          let shouldImportToWorkspace = false;

          // Check if Vomyra says it's assigned to an assistant
          if (vNum.assigned_to && vNum.assigned_to.assistant_id) {
            const vAssistantId = vNum.assigned_to.assistant_id;
            
            // If the Vomyra assistant ID matches one of our local workspace assistants, 
            // then this number belongs to our workspace and is assigned to that assistant.
            if (localAssistantMap.has(vAssistantId)) {
              localAssignedAssistantId = localAssistantMap.get(vAssistantId);
              shouldImportToWorkspace = true;
            }
          }

          // We also update the number if it already belongs to our workspace
          if (workspaceNumberSet.has(cleanPhone) || shouldImportToWorkspace) {
            await adminClient.from("phone_numbers").upsert({
              workspace_id: workspaceId,
              phone_number: cleanPhone,
              provider: "vomyra",
              provider_resource_id: `vomyra_${cleanPhone.replace(/[^\d+]/g, "")}`,
              assigned_assistant_id: localAssignedAssistantId,
              status: localAssignedAssistantId ? "active" : "unassigned"
            }, { onConflict: "phone_number" });
            
            fetchedNumbersCount++;
          }
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
