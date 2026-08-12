"use server";

import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

// ─── Setu Credentials ─────────────────────────────────────────────────────────
const SETU_BASE_URL = process.env.SETU_BASE_URL || "https://dg-sandbox.setu.co";
const SETU_CLIENT_ID = process.env.SETU_CLIENT_ID || "";
const SETU_CLIENT_SECRET = process.env.SETU_CLIENT_SECRET || "";
const SETU_DIGILOCKER_PRODUCT_INSTANCE_ID =
  process.env.SETU_DIGILOCKER_PRODUCT_INSTANCE_ID ||
  "930f371d-020f-4b6e-971a-898d848c94a3";
const SETU_PAN_PRODUCT_INSTANCE_ID =
  process.env.SETU_PAN_PRODUCT_INSTANCE_ID ||
  "YOUR_PAN_PRODUCT_INSTANCE_ID_HERE"; // From Metabull Universe - PAN product
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}

async function getCurrentWorkspaceId(): Promise<string | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const adminClient = await getAdminClient();
  const { data: member } = await adminClient
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return member?.workspace_id || null;
}

function setuHeaders(productInstanceId: string) {
  return {
    "Content-Type": "application/json",
    "x-client-id": SETU_CLIENT_ID,
    "x-client-secret": SETU_CLIENT_SECRET,
    "x-product-instance-id": productInstanceId,
  };
}

// ─── 1. Initiate DigiLocker KYC ───────────────────────────────────────────────
export async function initiateDigiLockerKyc() {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: "Not authenticated." };

    const adminClient = await getAdminClient();

    // Check if already approved
    const { data: existingKyc } = await adminClient
      .from("kyc_requests")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("status", "approved")
      .maybeSingle();

    if (existingKyc) {
      return { success: false, error: "KYC already approved for this workspace." };
    }

    const redirectUrl = `${APP_URL}/dashboard/kyc/digilocker-callback`;

    // Create DigiLocker request on Setu
    const setuRes = await fetch(`${SETU_BASE_URL}/api/digilocker/`, {
      method: "POST",
      headers: setuHeaders(SETU_DIGILOCKER_PRODUCT_INSTANCE_ID),
      body: JSON.stringify({ redirectUrl }),
    });

    if (!setuRes.ok) {
      const errBody = await setuRes.text();
      console.error("Setu DigiLocker create error:", errBody);
      return {
        success: false,
        error: `Setu API error (400). Details: ${errBody}`,
      };
    }

    const setuData = await setuRes.json();
    const setuRequestId: string = setuData.id;
    const digilockerUrl: string = setuData.url;

    if (!setuRequestId || !digilockerUrl) {
      return { success: false, error: "Invalid response from Setu API." };
    }

    // Upsert pending KYC record with the Setu request ID
    const { data: existingPending } = await adminClient
      .from("kyc_requests")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("status", "pending")
      .maybeSingle();

    if (existingPending) {
      await adminClient
        .from("kyc_requests")
        .update({
          digilocker_request_id: setuRequestId,
          verification_method: "setu_digilocker",
        })
        .eq("id", existingPending.id);
    } else {
      await adminClient.from("kyc_requests").insert({
        workspace_id: workspaceId,
        business_name: "Pending DigiLocker Verification",
        use_case: "Phone number provisioning",
        status: "pending",
        digilocker_request_id: setuRequestId,
        verification_method: "setu_digilocker",
      });
    }

    return { success: true, digilockerUrl };
  } catch (err: any) {
    console.error("initiateDigiLockerKyc error:", err);
    return { success: false, error: err.message || "Unexpected error." };
  }
}

// ─── 2. Handle DigiLocker Callback ────────────────────────────────────────────
export async function handleDigiLockerCallback(
  setuRequestId: string,
  successParam: string
) {
  try {
    if (successParam !== "True") {
      return {
        success: false,
        error: "User cancelled or DigiLocker verification failed.",
      };
    }

    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: "Not authenticated." };

    const adminClient = await getAdminClient();

    // Find our KYC record
    const { data: kycRecord } = await adminClient
      .from("kyc_requests")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("digilocker_request_id", setuRequestId)
      .maybeSingle();

    if (!kycRecord) {
      return { success: false, error: "No matching KYC request found." };
    }

    if (kycRecord.status === "approved") {
      return { success: true, alreadyApproved: true };
    }

    // Check DigiLocker status with Setu
    const statusRes = await fetch(
      `${SETU_BASE_URL}/api/digilocker/${setuRequestId}/status`,
      { method: "GET", headers: setuHeaders(SETU_DIGILOCKER_PRODUCT_INSTANCE_ID) }
    );

    if (!statusRes.ok) {
      const errText = await statusRes.text();
      return { success: false, error: `Could not verify DigiLocker status with Setu. Setu said: ${errText}` };
    }

    // Try fetching Aadhaar data for name
    let aadhaarName: string | null = null;
    try {
      const aadhaarRes = await fetch(
        `${SETU_BASE_URL}/api/digilocker/${setuRequestId}/aadhaar`,
        { method: "GET", headers: setuHeaders(SETU_DIGILOCKER_PRODUCT_INSTANCE_ID) }
      );
      if (aadhaarRes.ok) {
        const aadhaarData = await aadhaarRes.json();
        aadhaarName = aadhaarData?.data?.name || aadhaarData?.name || null;
      }
    } catch (_) {
      // Best-effort only
    }

    // Mark identity as verified, but leave status as 'pending' for manual Admin review/assignment
    await adminClient
      .from("kyc_requests")
      .update({
        digilocker_verified: true,
        business_name: aadhaarName || kycRecord.business_name,
        verification_method: "setu_pan_and_digilocker",
      })
      .eq("id", kycRecord.id);

    revalidatePath("/dashboard/phone-numbers");
    revalidatePath("/dashboard/admin/kyc");

    return {
      success: true,
      assignedNumber: availableNumber?.phone_number || null,
      verifiedName: aadhaarName,
    };
  } catch (err: any) {
    console.error("handleDigiLockerCallback error:", err);
    return { success: false, error: err.message || "Unexpected error." };
  }
}

// ─── 3. Get KYC Status ────────────────────────────────────────────────────────
export async function getDigiLockerKycStatus() {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: "Not authenticated." };

    const adminClient = await getAdminClient();
    const { data, error } = await adminClient
      .from("kyc_requests")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return { success: false, error: error.message };
    return { success: true, kyc: data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── 4. Verify PAN ────────────────────────────────────────────────────────────
export async function verifyPanWithSetu(pan: string, businessName: string) {
  try {
    const workspaceId = await getCurrentWorkspaceId();
    if (!workspaceId) return { success: false, error: "Not authenticated." };

    if (!pan || pan.length !== 10) {
      return { success: false, error: "Invalid PAN format." };
    }

    // Call Setu PAN Verification API
    const res = await fetch(`${SETU_BASE_URL}/api/verify/pan`, {
      method: "POST",
      headers: setuHeaders(SETU_PAN_PRODUCT_INSTANCE_ID),
      body: JSON.stringify({
        pan: pan.toUpperCase(),
        consent: "Y",
        reason: "Business KYC for phone number provisioning",
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Setu PAN Verification error:", errBody);
      return {
        success: false,
        error: `PAN Verification failed (${res.status}). Please check credentials or try again.`,
      };
    }

    const setuData = await res.json();
    const verificationStatus = setuData.verification;

    if (!verificationStatus || verificationStatus.toUpperCase() !== "SUCCESS") {
      console.log("Setu PAN Verification failed. Response:", JSON.stringify(setuData, null, 2));
      return { success: false, error: `PAN is invalid or not active (status: ${verificationStatus}).` };
    }

    const verifiedName = setuData.data?.full_name || "Verified User";

    const adminClient = await getAdminClient();

    // Check if a pending request exists
    const { data: existingPending } = await adminClient
      .from("kyc_requests")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("status", "pending")
      .maybeSingle();

    if (existingPending) {
      const { error: updateErr } = await adminClient
        .from("kyc_requests")
        .update({
          business_name: businessName,
          verified_pan_name: verifiedName,
        })
        .eq("id", existingPending.id);

      if (updateErr) {
        return { success: false, error: `Database error (update): ${updateErr.message}. Did you run the SQL migration?` };
      }
    } else {
      const { error: insertErr } = await adminClient.from("kyc_requests").insert({
        workspace_id: workspaceId,
        business_name: businessName,
        status: "pending",
        verified_pan_name: verifiedName,
        verification_method: "setu_pan_and_digilocker",
      });

      if (insertErr) {
        return { success: false, error: `Database error (insert): ${insertErr.message}. Did you run the SQL migration?` };
      }
    }

    return { success: true, verifiedName };
  } catch (err: any) {
    console.error("verifyPanWithSetu error:", err);
    return { success: false, error: err.message || "Unexpected error." };
  }
}
