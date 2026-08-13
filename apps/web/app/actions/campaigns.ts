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
    const vomyraApiKey = process.env.VOMYRA_API_KEY;
    const vomyraBaseUrl = process.env.VOMYRA_BASE_URL || "https://api.vomyra.com";

    if (!vomyraApiKey) {
      return { success: false, error: "Vomyra API credentials are not configured." };
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

    // 2. Dispatch calls directly to Vomyra Voice API
    const dispatchPromises = cleanContacts.map(async (contact, index) => {
      // Stagger calls by 800ms
      await new Promise((resolve) => setTimeout(resolve, index * 800));

      const cleanNumber = contact.phone.startsWith("+")
        ? contact.phone
        : `+91${contact.phone.replace(/^0+/, "")}`;

      const payload: any = {
        customer_number: cleanNumber,
        customer_name: contact.name || "Customer",
        customer_country_code: cleanNumber.startsWith("+91") ? "+91" : "+1",
        additional_data: {
          campaign_id: campaignId,
          campaign_name: name,
          workspaceId,
          followUpDate: contact.followUpDate,
          details: contact.details,
          dispatched_at: new Date().toISOString()
        }
      };

      payload.assigned_number = assignedNumber;

      try {
        const res = await fetch(`${vomyraBaseUrl}/v1/calls`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": vomyraApiKey
          },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const callData = await res.json();
          return { success: true, callId: callData?.data?.id || callData?.id, contact };
        } else {
          const errText = await res.text();
          console.warn(`[Campaign] Call failed for ${cleanNumber}:`, errText);
          return { success: false, error: errText, contact };
        }
      } catch (err: any) {
        console.warn(`[Campaign] Call network error for ${cleanNumber}:`, err.message);
        return { success: false, error: err.message, contact };
      }
    });

    // Run dispatches in background
    Promise.allSettled(dispatchPromises).then(async (results) => {
      if (adminClient) {
        try {
          await adminClient
            .from("campaigns")
            .update({
              status: "completed"
            })
            .eq("id", campaignId);
        } catch (e) {}
      }
    });

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
