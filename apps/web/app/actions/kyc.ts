"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getAdminClient, requireCurrentWorkspace } from "@/lib/workspace";
import { fetchVomyraNumbers } from "@/lib/vomyra";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const adminClient = await getAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_super_admin) {
    throw new Error("Unauthorized: Admins only");
  }
}

export async function checkIsAdminAction() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const adminClient = await getAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('is_super_admin')
      .eq('id', user.id)
      .single();

    return profile?.is_super_admin === true;
  } catch (e) {
    return false;
  }
}

export async function getWorkspaceKycStatus() {
  const adminClient = await getAdminClient();
  const { workspaceId } = await requireCurrentWorkspace();

  const { data, error } = await adminClient
    .from("kyc_requests")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, kyc: data };
}

export async function getAdminKycRequests() {
  await verifyAdmin();
  const adminClient = await getAdminClient();
  
  // Fetch all requests with workspace info
  const { data: requests, error } = await adminClient
    .from("kyc_requests")
    .select("*, workspaces(id, name, owner_id)")
    .order("created_at", { ascending: false });

  // Fetch workspace owner user accounts from auth admin
  let userMap: Record<string, { email?: string; full_name?: string }> = {};
  try {
    const { data: { users } } = await adminClient.auth.admin.listUsers();
    if (users) {
      users.forEach(u => {
        userMap[u.id] = {
          email: u.email,
          full_name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0]
        };
      });
    }
  } catch (authErr) {
    console.warn("Failed to list auth users for KYC admin:", authErr);
  }

  const enriched = (requests || []).map((r: any) => ({
    ...r,
    owner: r.workspaces?.owner_id ? userMap[r.workspaces.owner_id] : null
  }));

  return { success: true, requests: enriched };
}

export async function approveKycAndAssignNumber(kycId: string, workspaceId: string, phoneNumber: string) {
  await verifyAdmin();
  const adminClient = await getAdminClient();

  if (!phoneNumber) return { success: false, error: "Phone number is required." };

  try {
    const { error } = await adminClient.rpc("approve_kyc_and_assign_number", {
      p_kyc_id: kycId,
      p_workspace_id: workspaceId,
      p_phone_number: phoneNumber,
      p_provider: "vomyra",
      p_provider_resource_id: `manual_${phoneNumber.replace(/[^\d+]/g, "")}`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/kyc");
    revalidatePath("/dashboard/phone-numbers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function approveKyc(kycId: string) {
  await verifyAdmin();
  const adminClient = await getAdminClient();

  try {
    const { error } = await adminClient
      .from("kyc_requests")
      .update({ 
        status: "approved",
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", kycId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/kyc");
    revalidatePath("/dashboard/phone-numbers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function rejectKyc(kycId: string, rejectionReason?: string) {
  await verifyAdmin();
  const adminClient = await getAdminClient();

  try {
    const { error } = await adminClient
      .from("kyc_requests")
      .update({ 
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq("id", kycId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/kyc");
    revalidatePath("/dashboard/phone-numbers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function resetKycStatus(kycId: string) {
  await verifyAdmin();
  const adminClient = await getAdminClient();

  try {
    const { error } = await adminClient
      .from("kyc_requests")
      .update({ 
        status: "pending",
        reviewed_at: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", kycId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/kyc");
    revalidatePath("/dashboard/phone-numbers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getAvailableVomyraNumbers() {
  await verifyAdmin();
  const adminClient = await getAdminClient();
  try {
    // 1. Fetch from Vomyra API
    const vomyraNumbers = await fetchVomyraNumbers();
    
    // Extract phone numbers as array of strings
    const allVomyraNumbers = vomyraNumbers.map((n: any) => typeof n === 'string' ? n : n.phone_number || n.number);

    // 2. Fetch all numbers already assigned in our system
    const { data: assignedDbNumbers, error } = await adminClient
      .from("phone_numbers")
      .select("phone_number")
      .is("deleted_at", null);

    if (error) {
      return { success: false, error: error.message };
    }

    const assignedSet = new Set(assignedDbNumbers.map((n: any) => n.phone_number));

    // 3. Filter out assigned numbers
    const availableNumbers = allVomyraNumbers.filter((n: any) => n && !assignedSet.has(n));

    return { success: true, availableNumbers };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
