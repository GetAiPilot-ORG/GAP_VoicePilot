"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient, requireCurrentWorkspace } from "@/lib/workspace";
import { fetchVomyraNumbers, vomyraRequest } from "@/lib/vomyra";

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

    try {
        const vRes = await vomyraRequest('/v1/numbers/assignment', {
          method: "PUT",
          headers: {
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
          // Allow local assignment to succeed for test/manual numbers
        }
    } catch (e: any) {
        console.error("Vomyra sync error:", e);
        return { success: false, error: "Error communicating with Vomyra API." };
    }
  } else {
    // If unassigning, sync with Vomyra using DELETE
    try {
        const vRes = await vomyraRequest('/v1/numbers/assignment', {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phone_number: phoneData.phone_number
          })
        });

        if (!vRes.ok) {
          const text = await vRes.text();
          console.error("Vomyra unassignment failed:", text);
          // Allow local unassignment to succeed
        }
    } catch (e: any) {
        console.error("Vomyra sync error:", e);
        return { success: false, error: "Error communicating with Vomyra API." };
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
  const { workspaceId } = await requireCurrentWorkspace();

  let fetchedNumbersCount = 0;
  let errorMsg: string | null = null;

  try {
    // Fetch all numbers from Vomyra API directly to ensure perfect sync
      const vomyraNumbers = await fetchVomyraNumbers();
        
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
            const providerResourceId = `vomyra_${cleanPhone.replace(/[^\d+]/g, "")}`;

            await adminClient.from("phone_numbers").upsert({
              workspace_id: workspaceId,
              phone_number: cleanPhone,
              provider: "vomyra",
              provider_resource_id: providerResourceId,
              assigned_assistant_id: localAssignedAssistantId,
              status: localAssignedAssistantId ? "active" : "unassigned"
            }, { onConflict: "provider,provider_resource_id" });
            
            fetchedNumbersCount++;
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

export async function fetchPhoneNumbersAction() {
  const adminClient = await getAdminClient();
  const { workspaceId } = await requireCurrentWorkspace();

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
      created_at: n.created_at,
      current_period_end: n.current_period_end || null
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

export async function claimPhoneNumberAction() {
  const adminClient = await getAdminClient();
  const { workspaceId } = await requireCurrentWorkspace();

  try {
    // 1. Verify KYC is approved
    const { getWorkspaceKycStatus } = await import("@/app/actions/kyc");
    const kycRes = await getWorkspaceKycStatus();
    if (!kycRes.success || !kycRes.kyc || kycRes.kyc.status !== "approved") {
      return { success: false, error: "You must complete business KYC before claiming a number." };
    }

    // 2. Atomically reserve entitlement
    const { data: claimData, error: claimError } = await adminClient.rpc("reserve_number_entitlement", {
      p_workspace_id: workspaceId
    });

    if (claimError || !claimData) {
      return { success: false, error: claimError?.message || "No available dedicated number entitlements." };
    }

    const claimId = claimData;

    // 3. Fetch all unassigned Vomyra numbers locally
    const { data: availableDbNumbers, error: dbNumError } = await adminClient
      .from("phone_numbers")
      .select("*")
      .is("workspace_id", null)
      .is("deleted_at", null)
      .limit(10);

    let numberToAssign = null;
    let provider = "vomyra";
    let providerResourceId = "";

    // 4. Try to pick from local DB unassigned pool first
    if (availableDbNumbers && availableDbNumbers.length > 0) {
      numberToAssign = availableDbNumbers[0].phone_number;
      providerResourceId = availableDbNumbers[0].provider_resource_id;
    } else {
      // 5. Fallback: Fetch directly from Vomyra API
      try {
        const vomyraNumbers = await fetchVomyraNumbers();
        // find one that isn't in our system
        const { data: allAssigned } = await adminClient.from("phone_numbers").select("phone_number").is("deleted_at", null);
        const assignedSet = new Set(allAssigned?.map(n => n.phone_number) || []);
        
        const unassignedVomyra = vomyraNumbers.filter((n: any) => {
          const cleanPhone = String(n.phone_number || n.number).trim();
          return !assignedSet.has(cleanPhone);
        });

        if (unassignedVomyra.length > 0) {
          numberToAssign = String(unassignedVomyra[0].phone_number || unassignedVomyra[0].number).trim();
          providerResourceId = `vomyra_${numberToAssign.replace(/[^\d+]/g, "")}`;
        }
      } catch (e: any) {
        console.warn("Failed to fetch from Vomyra API during claim:", e.message);
      }
    }

    if (!numberToAssign) {
      // Provisioning failed - Refund entitlement
      await adminClient.rpc("refund_number_entitlement", {
        p_claim_id: claimId
      });
      return { success: false, error: "No available numbers in the pool right now. Please try again later or contact support." };
    }

    // 6. Assign it to the user's workspace
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30); // 30 day validity

    const { data: newNumber, error: assignError } = await adminClient.from("phone_numbers").upsert({
      workspace_id: workspaceId,
      phone_number: numberToAssign,
      provider: provider,
      provider_resource_id: providerResourceId,
      status: "unassigned",
      current_period_start: new Date().toISOString(),
      current_period_end: currentPeriodEnd.toISOString()
    }, { onConflict: "provider,provider_resource_id" }).select().single();

    if (assignError) {
      // Provisioning failed - Refund entitlement
      await adminClient.rpc("refund_number_entitlement", {
        p_claim_id: claimId
      });
      return { success: false, error: "Failed to allocate number to your workspace." };
    }

    // 7. Update claim status
    await adminClient.from("number_claims").update({
      status: "claimed",
      provider_number_id: providerResourceId,
      phone_number: numberToAssign
    }).eq("id", claimId);

    revalidatePath("/dashboard/phone-numbers");
    return { success: true, newNumber };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Admin: Assign/Reassign a phone number to a specific workspace
 */
export async function adminAssignNumberAction(params: {
  phoneNumber: string;
  workspaceId: string;
  provider?: string;
}) {
  try {
    const { checkIsAdminAction } = await import("@/app/actions/kyc");
    const isAdmin = await checkIsAdminAction();
    if (!isAdmin) return { success: false, error: "Unauthorized. Admin access required." };

    const adminClient = await getAdminClient();
    const provider = params.provider || "vomyra";
    const cleanNum = params.phoneNumber.trim();
    const providerResourceId = `${provider}_${cleanNum.replace(/[^\d+]/g, "")}`;

    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    const { data: updated, error } = await adminClient
      .from("phone_numbers")
      .upsert({
        phone_number: cleanNum,
        provider,
        provider_resource_id: providerResourceId,
        workspace_id: params.workspaceId,
        status: "unassigned",
        current_period_start: new Date().toISOString(),
        current_period_end: currentPeriodEnd.toISOString(),
        deleted_at: null
      }, { onConflict: "provider,provider_resource_id" })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/phone-numbers");
    revalidatePath("/dashboard/phone-numbers");
    return { success: true, number: updated };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

/**
 * Admin: Release a phone number back to unassigned pool
 */
export async function adminReleaseNumberAction(phoneId: string) {
  try {
    const { checkIsAdminAction } = await import("@/app/actions/kyc");
    const isAdmin = await checkIsAdminAction();
    if (!isAdmin) return { success: false, error: "Unauthorized. Admin access required." };

    const adminClient = await getAdminClient();
    const { error } = await adminClient
      .from("phone_numbers")
      .update({
        workspace_id: null,
        assigned_assistant_id: null,
        status: "unassigned"
      })
      .eq("id", phoneId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/phone-numbers");
    revalidatePath("/dashboard/phone-numbers");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
