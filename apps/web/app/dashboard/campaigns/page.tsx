import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { fetchVomyraCalls } from "@/lib/vomyra";
import { CampaignsClient, CampaignJob, AssistantOption } from "./CampaignsClient";

export const dynamic = "force-dynamic";

import { verifyRouteAccess } from "@/app/actions/adminSidebarPermissions";

export default async function CampaignsPage() {
  await verifyRouteAccess("/dashboard/campaigns");
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  let initialCampaigns: CampaignJob[] = [];
  let assistantOptions: AssistantOption[] = [];

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: members } = await adminClient
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id);

      const wIds = members?.map((m: any) => m.workspace_id) || [];

      if (wIds.length > 0) {
        // 1. Fetch Assistants with provider_resource_id
        const { data: dbAssistants } = await adminClient
          .from("assistants")
          .select(`
            id,
            name,
            provider_resource_id,
            phone_numbers (
              phone_number
            )
          `)
          .in("workspace_id", wIds)
          .is("deleted_at", null);

        if (dbAssistants) {
          assistantOptions = dbAssistants.map((a: any) => {
            const numbers = a.phone_numbers || [];
            const phone = numbers.length > 0 ? numbers[0].phone_number : "No number assigned";
            return {
              id: a.id,
              name: a.name,
              phone_number: phone
            };
          });
        }

        // 2. Fetch Supabase Campaigns
        const { data: dbCampaigns } = await adminClient
          .from("campaigns")
          .select("*, assistants(name, provider_resource_id)")
          .in("workspace_id", wIds)
          .order("created_at", { ascending: false });

        if (dbCampaigns && dbCampaigns.length > 0) {
          initialCampaigns = dbCampaigns.map((c: any) => ({
            id: c.id,
            name: c.name,
            status: c.status || "completed",
            target_audience: c.target_audience || "Direct Outbound",
            assistant_name: c.assistants?.name || "Voice Assistant",
            total_contacts: c.total_contacts || c.total_phone_numbers || 0,
            completed_contacts: c.completed_contacts || 0,
            failed_contacts: c.failed_contacts || 0,
            success_rate: c.success_rate_percent ? `${c.success_rate_percent}%` : "100%",
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

        // 3. Fetch & Reconstruct All Vomyra Campaign Dispatches from Live Call API
        try {
          const vomyraApiKey = process.env.VOMYRA_API_KEY || '';
          const vomyraBaseUrl = process.env.VOMYRA_BASE_URL || 'https://api.vomyra.com';

          const res = await fetch(`${vomyraBaseUrl}/v1/calls?limit=100`, {
            headers: { 'x-api-key': vomyraApiKey },
            cache: 'no-store'
          });

          if (res.ok) {
            const data = await res.json();
            const allRawCalls = data.data || data.calls || (Array.isArray(data) ? data : []);

            // Match calls against Supabase UUIDs, Vomyra Provider IDs, names, and workspace IDs
            const userAssistantIds = new Set(dbAssistants?.map((a: any) => a.id) || []);
            const userProviderIds = new Set((dbAssistants || []).map((a: any) => a.provider_resource_id).filter(Boolean));
            const userAssistantNames = new Set((dbAssistants || []).map((a: any) => a.name?.toLowerCase().trim()).filter(Boolean));

            const rawCalls = allRawCalls.filter((c: any) => {
              if (c.call_type === "web") return false;
              if (c.additional_data?.source === "GAP_VoicePilot_WebConsole") return false;

              const astId = c.assistant?.id || "";
              const astName = (c.assistant?.name || "").toLowerCase().trim();
              const callWsId = c.additional_data?.workspaceId;
              const callCampName = (c.additional_data?.campaign_name || "").toLowerCase().trim();

              const isUserAssistant = userAssistantIds.has(astId) || userProviderIds.has(astId) || userAssistantNames.has(astName);
              const isUserWs = callWsId && wIds.includes(callWsId);
              const isCampMatch = callCampName && Array.from(userAssistantNames).some(n => callCampName.includes(n));

              return isUserAssistant || isUserWs || isCampMatch;
            });

            // Group calls either by explicit campaign_id, campaign_name, or time batch
            const campaignGroups: Record<string, {
              id: string;
              name: string;
              assistant: string;
              time: string;
              total: number;
              completed: number;
            }> = {};

            rawCalls.forEach((c: any) => {
              const campId = c.additional_data?.campaign_id;
              const campName = c.additional_data?.campaign_name;
              const astName = c.assistant?.name || "Voice Assistant";
              const time = new Date(c.created_at || Date.now());

              let key = "";
              let displayName = "";
              let jobId = "";

              if (campId) {
                key = `id_${campId}`;
                displayName = campName || `Campaign ${campId}`;
                jobId = campId.startsWith("#") ? campId : `#JOB-${campId.slice(-6).toUpperCase()}`;
              } else if (campName) {
                key = `name_${campName}`;
                displayName = campName;
                jobId = `#JOB-${c.id.slice(-6).toUpperCase()}`;
              } else {
                const bucket = new Date(Math.floor(time.getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000)).toISOString();
                key = `batch_${bucket}_${astName}`;
                displayName = `${astName} Outbound Batch`;
                jobId = `#JOB-${c.id.slice(-6).toUpperCase()}`;
              }

              if (!campaignGroups[key]) {
                campaignGroups[key] = {
                  id: jobId,
                  name: displayName,
                  assistant: astName,
                  time: c.created_at || time.toISOString(),
                  total: 0,
                  completed: 0,
                };
              }

              campaignGroups[key].total += 1;
              if (c.status === "completed" || c.call_duration !== "00:00:00") {
                campaignGroups[key].completed += 1;
              }
            });

            // Merge with existing initialCampaigns
            Object.entries(campaignGroups).forEach(([key, group]) => {
              const existing = initialCampaigns.find(c => c.id === group.id || c.name === group.name);
              if (existing) {
                if (!existing.total_contacts || existing.total_contacts < group.total) {
                  existing.total_contacts = group.total;
                }
                if (!existing.completed_contacts || existing.completed_contacts < group.completed) {
                  existing.completed_contacts = group.completed;
                }
                if (group.completed > 0) {
                  existing.status = "completed";
                }
              } else {
                initialCampaigns.push({
                  id: group.id,
                  name: `${group.name} (${group.total} contacts)`,
                  assistant_name: group.assistant,
                  total_contacts: group.total,
                  completed_contacts: group.completed,
                  failed_contacts: group.total - group.completed,
                  status: group.completed > 0 ? "completed" : "in_progress",
                  created_at: new Date(group.time).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                  })
                });
              }
            });
          }
        } catch (err: any) {
          console.error("Failed to sync live Vomyra campaign batches:", err.message);
        }
      }
    }
  } catch (err) {
    console.warn("Failed to fetch campaigns DB data:", err);
  }

  // 3. Fetch & Reconstruct All Vomyra Bulk Campaign Dispatches from Live Call API
  try {
      const data = await fetchVomyraCalls(100);
      {
      const allRawCalls = data.data || data.calls || (Array.isArray(data) ? data : []);

      // Filter to only show calls from this user's assistants
      const userAssistantIds = new Set(assistantOptions.map(a => a.id));
      const userAssistantNames = new Set(assistantOptions.map(a => a.name));
      
      const rawCalls = allRawCalls.filter((c: any) => {
        // Exclude web simulator calls and manual quick test calls from campaign reconstruction
        if (c.call_type === "web") return false;
        if (c.additional_data?.source === "GAP_VoicePilot_WebConsole") return false;

        const astId = c.assistant?.id || "";
        const astName = c.assistant?.name || (c.additional_data?.campaign_name || "");
        return userAssistantIds.has(astId) || userAssistantNames.has(astName);
      });

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
