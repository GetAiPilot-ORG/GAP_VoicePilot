import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { CampaignsClient, CampaignJob, AssistantOption } from "./CampaignsClient";

export default async function CampaignsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let initialCampaigns: CampaignJob[] = [];
  let assistantOptions: AssistantOption[] = [];

  try {
    const { data: dbCampaigns } = await adminClient
      .from("campaigns")
      .select("*, assistants(name)")
      .order("created_at", { ascending: false });

    if (dbCampaigns && dbCampaigns.length > 0) {
      initialCampaigns = dbCampaigns.map((c: any) => ({
        id: c.id,
        name: c.name,
        assistant_id: c.assistant_id,
        assistant_name: c.assistants?.name || "Voice Assistant",
        total_contacts: c.total_contacts || 1,
        status: (c.status === "running" ? "in_progress" : c.status) || "completed",
        created_at: new Date(c.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true
        })
      }));
    }

    const { data: dbAssistants } = await adminClient
      .from("assistants")
      .select("id, name")
      .is("deleted_at", null);

    if (dbAssistants) {
      assistantOptions = dbAssistants.map((a: any) => ({
        id: a.id,
        name: a.name,
        phone_number: "7943494977"
      }));
    }
  } catch (e) {
    console.warn("Failed to fetch campaigns page data:", e);
  }

  return (
    <CampaignsClient
      initialCampaigns={initialCampaigns}
      assistants={assistantOptions}
    />
  );
}
