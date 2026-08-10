"use server";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

async function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
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

export async function getWorkspaceKycStatus() {
  const adminClient = await getAdminClient();
  const workspaceId = await getWorkspaceId();

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

export async function submitKycRequest(formData: FormData) {
  const adminClient = await getAdminClient();
  const workspaceId = await getWorkspaceId();

  const businessName = formData.get("businessName") as string;
  const useCase = formData.get("useCase") as string;
  const documentFile = formData.get("document") as File;

  if (!businessName || !useCase || !documentFile) {
    return { success: false, error: "Missing required fields." };
  }

  try {
    // 1. Upload Document to Supabase Storage
    const fileExt = documentFile.name.split('.').pop();
    const fileName = `${workspaceId}-${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await adminClient.storage
      .from("kyc_documents")
      .upload(fileName, documentFile);

    if (uploadError) {
      return { success: false, error: "Failed to upload document: " + uploadError.message };
    }

    const { data: publicUrlData } = adminClient.storage
      .from("kyc_documents")
      .getPublicUrl(fileName);

    const documentUrl = publicUrlData.publicUrl;

    // 2. Insert KYC record
    const { error: insertError } = await adminClient
      .from("kyc_requests")
      .insert({
        workspace_id: workspaceId,
        business_name: businessName,
        use_case: useCase,
        document_url: documentUrl,
        status: "pending"
      });

    if (insertError) {
      return { success: false, error: insertError.message };
    }

    revalidatePath("/dashboard/phone-numbers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

export async function getAdminKycRequests() {
  const adminClient = await getAdminClient();
  
  // In a real app, you would verify if the user is an admin here!
  // We'll fetch all requests with workspace info
  const { data, error } = await adminClient
    .from("kyc_requests")
    .select("*, workspaces(name)")
    .order("created_at", { ascending: false });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, requests: data };
}

export async function approveKycAndAssignNumber(kycId: string, workspaceId: string, phoneNumber: string) {
  const adminClient = await getAdminClient();

  if (!phoneNumber) return { success: false, error: "Phone number is required." };

  try {
    // 1. Mark KYC as approved
    const { error: kycError } = await adminClient
      .from("kyc_requests")
      .update({ status: "approved", assigned_number: phoneNumber })
      .eq("id", kycId);

    if (kycError) {
      return { success: false, error: kycError.message };
    }

    // 2. Insert into phone_numbers for that workspace
    const { error: phoneError } = await adminClient
      .from("phone_numbers")
      .insert({
        workspace_id: workspaceId,
        phone_number: phoneNumber,
        provider: "vomyra", // or manual
        provider_resource_id: `manual_${Date.now()}`,
        status: "unassigned" // ready to be assigned to an assistant
      });

    if (phoneError) {
      return { success: false, error: phoneError.message };
    }

    revalidatePath("/dashboard/admin/kyc");
    revalidatePath("/dashboard/phone-numbers");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getAvailableVomyraNumbers() {
  const adminClient = await getAdminClient();
  const vomyraBaseUrl = process.env.VOMYRA_BASE_URL || "https://api.vomyra.com";
  const vomyraApiKey = process.env.VOMYRA_API_KEY || "";

  if (!vomyraApiKey) {
    return { success: false, error: "Vomyra API Key is not configured." };
  }

  try {
    // 1. Fetch from Vomyra API
    const vRes = await fetch(`${vomyraBaseUrl}/v1/numbers`, {
      headers: { "x-api-key": vomyraApiKey },
      cache: "no-store"
    });

    if (!vRes.ok) {
      return { success: false, error: "Failed to fetch from Vomyra API" };
    }

    const vData = await vRes.json();
    const vomyraNumbers = Array.isArray(vData) ? vData : (vData.phone_numbers || vData.data || []);
    
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
