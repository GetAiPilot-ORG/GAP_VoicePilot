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

export interface LaunchBatchCampaignParams {
  name: string;
  assistantId: string;
  contacts: Array<{
    name: string;
    phone: string;
    followUpDate?: string;
    details?: string;
  }>;
}

export async function launchBatchCampaignAction({ name, assistantId, contacts }: LaunchBatchCampaignParams) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const adminClient = await getAdminClient();

    let workspaceId = "00000000-0000-0000-0000-000000000000";
    if (user) {
      const { data: member } = await adminClient
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (member?.workspace_id) workspaceId = member.workspace_id;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const res = await fetch(`${apiUrl}/api/v1/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        assistantId,
        contacts,
        workspaceId,
        createdBy: user?.id || workspaceId
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        error: data.error || 'Failed to dispatch outbound campaign'
      };
    }

    revalidatePath('/dashboard/campaigns');
    return {
      success: true,
      campaign: data.campaign,
      message: data.message
    };
  } catch (err: any) {
    console.error("Failed to launch batch campaign action:", err);
    return {
      success: false,
      error: err.message || "Failed to connect to telephony backend"
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
