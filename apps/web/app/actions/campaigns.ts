"use server";

import { getCurrentWorkspace, getAdminClient } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

export interface LaunchBatchCampaignParams {
  name: string;
  assistantId: string;
  phoneNumberId?: string;
  assignedNumber?: string;
  contacts: Array<{
    name: string;
    phone: string;
    followUpDate?: string;
    details?: string;
  }>;
}

export async function launchBatchCampaignAction({ name, assistantId, phoneNumberId, contacts }: LaunchBatchCampaignParams) {
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

    // Check credit balance upfront
    const requiredCredits = cleanContacts.length * 1.0;
    const { data: wsData } = await adminClient
      .from("workspaces")
      .select("balance")
      .eq("id", workspaceId)
      .maybeSingle();

    const currentBalance = wsData?.balance ?? 0;
    if (currentBalance < requiredCredits) {
      return {
        success: false,
        error: `Insufficient credit balance (${currentBalance.toFixed(2)} available). You need at least ${requiredCredits} credits to launch ${cleanContacts.length} calls. Please top up your wallet.`
      };
    }

    let campaignId = `camp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 1. Insert campaign into Supabase
    const { data: dbCampaign, error: campaignError } = await adminClient
      .from("campaigns")
      .insert({
        workspace_id: workspaceId,
        created_by: userId,
        assistant_id: assistantId,
        phone_number_id: actualPhoneNumberId,
        name,
        total_contacts: cleanContacts.length,
        status: "running"
      })
      .select()
      .single();

    if (campaignError || !dbCampaign) {
      return { success: false, error: campaignError?.message || "Could not create the campaign." };
    }

    campaignId = dbCampaign.id;

    // Queue durable jobs; a dedicated API worker dispatches them independently.
    const dispatchJobs = cleanContacts.map((contact) => {
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
          additional_data: { campaign_id: campaignId, campaign_name: name, workspaceId, followUpDate: contact.followUpDate, details: contact.details }
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
        total_contacts: cleanContacts.length,
        status: "running"
      },
      message: `Campaign initiated! Dispatching ${cleanContacts.length} automated calls in real-time.`
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
