import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import WhatsAppClient, { WhatsAppNumberItem, AssistantOption } from "./WhatsAppClient";
import { verifyRouteAccess } from "@/app/actions/adminSidebarPermissions";

export const dynamic = "force-dynamic";

export default async function WhatsAppPage() {
  await verifyRouteAccess("/dashboard/whatsapp");
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

  let initialWhatsAppNumbers: WhatsAppNumberItem[] = [];
  let assistants: AssistantOption[] = [];

  try {
    const { data: { user } } = await supabase.auth.getUser();
    let workspaceIds: string[] = [];

    if (user) {
      const { data: members } = await adminClient
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id);

      workspaceIds = members?.map((m: any) => m.workspace_id) || [];
    }

    if (workspaceIds.length > 0) {
      // 1. Fetch active workspace assistants
      const { data: dbAssistants } = await adminClient
        .from("assistants")
        .select("id, name, provider_resource_id, config_snapshot")
        .in("workspace_id", workspaceIds)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (dbAssistants) {
        assistants = dbAssistants.map((a: any) => ({
          id: a.id,
          name: a.name,
          provider_resource_id: a.provider_resource_id
        }));
      }
    }

    // 2. Fetch live WhatsApp Numbers from API
    const vomyraApiKey = process.env.VOMYRA_API_KEY || "0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx";
    const vomyraBaseUrl = process.env.VOMYRA_BASE_URL || "https://api.vomyra.com";

    const res = await fetch(`${vomyraBaseUrl}/v1/whatsapp/numbers`, {
      headers: { "x-api-key": vomyraApiKey },
      cache: "no-store"
    });

    if (res.ok) {
      const data = await res.json();
      const rawNumbers = Array.isArray(data) ? data : (data.data || []);
      initialWhatsAppNumbers = rawNumbers.map((n: any, idx: number) => ({
        id: n.id || `wa_${idx}`,
        phoneNumber: n.phone_number || n.number || "Unknown",
        displayName: n.display_name || n.name || "WhatsApp Business",
        status: n.status || "connected",
        assignedAgentId: n.assigned_assistant_id || n.assistant_id || assistants[0]?.id || null,
        assignedAgentName: n.assigned_assistant_name || n.assistant?.name || assistants[0]?.name || "Unassigned",
        events: n.events || ["inbound_call", "outbound_call"],
        callingEnabled: n.calling_enabled ?? true,
        connectedAt: n.created_at || new Date().toISOString()
      }));
    }
  } catch (err: any) {
    console.error("Failed to load WhatsApp page data:", err);
  }

  return (
    <WhatsAppClient
      initialNumbers={initialWhatsAppNumbers}
      assistants={assistants}
    />
  );
}
