import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { CampaignsClient, CampaignJob, AssistantOption } from "./CampaignsClient";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  let initialCampaigns: CampaignJob[] = [];
  let assistantOptions: AssistantOption[] = [];

  // 1. Fetch Assistants
  try {
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
    console.warn("Failed to fetch assistants:", e);
  }

  // 2. Fetch Supabase Campaigns
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
  } catch (e) {
    console.warn("Failed to fetch Supabase campaigns:", e);
  }

  // 3. Fetch & Reconstruct All Vomyra Bulk Campaign Dispatches from Live Call API
  try {
    const vomyraApiKey = process.env.VOMYRA_API_KEY || '0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx';
    const vomyraBaseUrl = process.env.VOMYRA_BASE_URL || 'https://api.vomyra.com';

    const res = await fetch(`${vomyraBaseUrl}/v1/calls?limit=100`, {
      headers: { 'x-api-key': vomyraApiKey },
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      const rawCalls = data.data || data.calls || (Array.isArray(data) ? data : []);

      // Group calls placed within 5-minute batches (campaign dispatches)
      const batches: Record<string, { time: string; assistant: string; count: number; completed: number; id: string }> = {};

      rawCalls.forEach((c: any) => {
        const time = new Date(c.created_at || Date.now());
        const bucket = new Date(Math.floor(time.getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000)).toISOString();
        const ast = c.assistant?.name || (c.additional_data?.campaign_name || 'Outbound Campaign Batch');
        const key = `${bucket}_${ast}`;

        if (!batches[key]) {
          batches[key] = {
            id: `#JOB-${c.id.slice(-6).toUpperCase()}`,
            time: c.created_at,
            assistant: ast,
            count: 0,
            completed: 0
          };
        }

        batches[key].count += 1;
        if (c.status === 'completed' || c.call_duration !== '00:00:00') {
          batches[key].completed += 1;
        }
      });

      // Convert batches with >= 2 calls into campaign jobs (1-off calls belong strictly in Call Logs)
      const vomyraCampaigns: CampaignJob[] = Object.values(batches)
        .filter((b) => b.count >= 2)
        .map((b) => ({
          id: b.id,
          name: `${b.assistant} (${b.count} contacts)`,
          assistant_name: b.assistant,
          total_contacts: b.count,
          status: b.completed > 0 ? "completed" : "in_progress",
          created_at: new Date(b.time).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          })
        }));

      // Merge avoiding duplicate IDs
      const existingIds = new Set(initialCampaigns.map(c => c.id));
      for (const vc of vomyraCampaigns) {
        if (!existingIds.has(vc.id)) {
          initialCampaigns.push(vc);
        }
      }
    }
  } catch (err: any) {
    console.error("Failed to sync live Vomyra campaign batches:", err.message);
  }

  return (
    <CampaignsClient
      initialCampaigns={initialCampaigns}
      assistants={assistantOptions}
    />
  );
}
