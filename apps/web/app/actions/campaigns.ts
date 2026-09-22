"use server";

import { getCurrentWorkspace, getAdminClient } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

export interface LaunchBatchCampaignParams {
  name: string;
  assistantId: string;
  phoneNumberId?: string;
  assignedNumber?: string;
  idempotencyKey?: string;
  contacts: Array<{
    name: string;
    phone: string;
    followUpDate?: string;
    details?: string;
  }>;
}

export async function launchBatchCampaignAction({ name, assistantId, phoneNumberId, idempotencyKey, contacts }: LaunchBatchCampaignParams) {
  try {
    const workspace = await getCurrentWorkspace();
    if (!workspace) {
      return { success: false, error: "You must be signed in to launch a campaign." };
    }

    const workspaceId = workspace.workspaceId;
    const userId = workspace.userId;
    const adminClient = await getAdminClient();

    if (!adminClient) {
      return { success: false, error: "Campaign service is not configured." };
    }

    if (!contacts || contacts.length === 0) {
      return { success: false, error: "No contacts provided for the campaign." };
    }

    const cleanContacts = contacts
      .map((c) => ({
        name: String(c.name || "Customer").trim(),
        phone: String(c.phone || "").trim().replace(/[\s\-()]/g, ""),
        followUpDate: c.followUpDate,
        details: c.details
      }))
      .filter((c) => c.phone.length >= 7);

    if (cleanContacts.length === 0) {
      return { success: false, error: "Please provide valid phone numbers." };
    }

    // 1. Idempotency Check: Prevent duplicate campaign creation on double-click
    const effectiveIdempotencyKey = idempotencyKey || `camp_${workspaceId}_${assistantId}_${cleanContacts.map(c => c.phone).sort().join('_').slice(0, 40)}_${Math.floor(Date.now() / 30000)}`;
    
    const { data: existingCampaign } = await adminClient
      .from("campaigns")
      .select("id, name, total_contacts, status")
      .eq("workspace_id", workspaceId)
      .eq("idempotency_key", effectiveIdempotencyKey)
      .maybeSingle();

    if (existingCampaign) {
      console.log(`[CampaignAction] Duplicate campaign submission detected for key ${effectiveIdempotencyKey}. Returning existing campaign.`);
      return {
        success: true,
        campaign: existingCampaign,
        message: "Campaign already created and processing."
      };
    }

    const { data: assistant } = await adminClient
      .from("assistants")
      .select("id")
      .eq("id", assistantId)
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null)
      .maybeSingle();

    if (!assistant) {
      return { success: false, error: "The selected assistant was not found in this workspace." };
    }

    let numberQuery = adminClient
      .from("phone_numbers")
      .select("id, phone_number")
      .eq("workspace_id", workspaceId)
      .eq("assigned_assistant_id", assistantId)
      .is("deleted_at", null);

    if (phoneNumberId) {
      numberQuery = numberQuery.eq("id", phoneNumberId);
    }

    const { data: campaignNumber, error: campaignNumberError } = await numberQuery
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (campaignNumberError || !campaignNumber?.phone_number) {
      return { success: false, error: "The selected assistant must have a phone number assigned before launching a campaign." };
    }

    const actualPhoneNumberId = campaignNumber.id;
    const assignedNumber = campaignNumber.phone_number.trim();

    // 2. Active Recipient Concurrency Guard: Check for in-flight pending/processing calls to same numbers
    const formattedNumbers = cleanContacts.map(c => c.phone.startsWith("+") ? c.phone : `+91${c.phone.replace(/^0+/, "")}`);
    const { data: inFlightJobs } = await adminClient
      .from("campaign_dispatch_jobs")
      .select("call_payload")
      .eq("workspace_id", workspaceId)
      .in("status", ["pending", "processing"]);

    const inFlightNumbers = new Set(
      (inFlightJobs || []).map(j => (j.call_payload as any)?.customer_number).filter(Boolean)
    );

    const eligibleContacts = cleanContacts.filter(c => {
      const num = c.phone.startsWith("+") ? c.phone : `+91${c.phone.replace(/^0+/, "")}`;
      return !inFlightNumbers.has(num);
    });

    if (eligibleContacts.length === 0) {
      return {
        success: false,
        error: "All selected recipients already have an active call in progress or pending dispatch."
      };
    }

    // Reserve credits atomically using database RPC
    const requiredCredits = eligibleContacts.length * 1.0;
    const refKey = `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const { data: resData, error: resErr } = await adminClient.rpc("reserve_workspace_credits", {
      p_workspace_id: workspaceId,
      p_amount: requiredCredits,
      p_reference_id: refKey,
      p_description: `Campaign "${name}" hold for ${eligibleContacts.length} calls`
    });

    if (resErr || (resData && (resData as any).success === false)) {
      const errMsg = (resData as any)?.error || resErr?.message || "Insufficient credit balance to launch campaign.";
      return { success: false, error: errMsg };
    }

    let campaignId = `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Insert campaign into Supabase with idempotency key
    const { data: dbCampaign, error: campaignError } = await adminClient
      .from("campaigns")
      .insert({
        workspace_id: workspaceId,
        created_by: userId,
        assistant_id: assistantId,
        phone_number_id: actualPhoneNumberId,
        name,
        total_contacts: eligibleContacts.length,
        status: "running",
        idempotency_key: effectiveIdempotencyKey
      })
      .select()
      .single();

    if (campaignError || !dbCampaign) {
      return { success: false, error: campaignError?.message || "Could not create the campaign." };
    }

    campaignId = dbCampaign.id;

    // Queue durable jobs
    const dispatchJobs = eligibleContacts.map((contact) => {
      const cleanNumber = contact.phone.startsWith("+")
        ? contact.phone
        : `+91${contact.phone.replace(/^0+/, "")}`;
      return {
        campaign_id: campaignId,
        workspace_id: workspaceId,
        call_payload: {
          customer_number: cleanNumber,
          customer_name: contact.name || "Customer",
          customer_country_code: cleanNumber.startsWith("+91") ? "+91" : "+1",
          assigned_number: assignedNumber,
          additional_data: { 
            campaign_id: campaignId, 
            campaign_name: name, 
            workspaceId, 
            followUpDate: contact.followUpDate, 
            details: contact.details,
            idempotency_key: `contact_${campaignId}_${cleanNumber}`
          }
        }
      };
    });
    const { error: queueError } = await adminClient.from("campaign_dispatch_jobs").insert(dispatchJobs);
    if (queueError) return { success: false, error: `Could not queue campaign calls: ${queueError.message}` };

    revalidatePath("/dashboard/campaigns");

    return {
      success: true,
      campaign: {
        id: campaignId,
        name,
        total_contacts: eligibleContacts.length,
        status: "running"
      },
      message: `Campaign initiated! Dispatching ${eligibleContacts.length} automated calls in real-time.`
    };
  } catch (err: any) {
    console.error("Failed to launch batch campaign action:", err);
    return {
      success: false,
      error: err.message || "Failed to launch campaign"
    };
  }
}

import { redirect } from "next/navigation";

export async function createCampaignAction(formData: FormData): Promise<void> {
  const name = formData.get("name") as string;
  const assistantId = formData.get("assistantId") as string;
  const numbers = formData.get("numbers") as string;

  const contacts = numbers.split(",").map(n => ({
    name: "Customer",
    phone: n.trim()
  })).filter(c => c.phone.length > 0);

  await launchBatchCampaignAction({ name, assistantId, contacts });
  redirect("/dashboard/campaigns");
}
