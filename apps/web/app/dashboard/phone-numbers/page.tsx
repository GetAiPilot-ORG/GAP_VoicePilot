import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { PhoneNumbersClient, PhoneNumberRecord, AvailableNumberItem, AssistantOption } from "./PhoneNumbersClient";

export const dynamic = "force-dynamic";

export default async function PhoneNumbersPage() {
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

  let initialMyNumbers: PhoneNumberRecord[] = [];
  let initialAvailableNumbers: AvailableNumberItem[] = [];
  let assistantOptions: AssistantOption[] = [];
  let workspaceBalance = 0;

  try {
    // Resolve current user workspace
    const { data: { user } } = await supabase.auth.getUser();
    let workspaceId: string | null = null;

    if (user) {
      const { data: member } = await adminClient
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (member?.workspace_id) workspaceId = member.workspace_id;
    }

    if (!workspaceId) {
      const { data: anyWs } = await adminClient.from("workspaces").select("id").limit(1).maybeSingle();
      if (anyWs?.id) workspaceId = anyWs.id;
    }

    if (workspaceId) {
      // 1. Fetch user's purchased numbers
      const { data: dbMyNumbers } = await adminClient
        .from("phone_numbers")
        .select("*, assistants(id, name)")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (dbMyNumbers && dbMyNumbers.length > 0) {
        initialMyNumbers = dbMyNumbers.map((n: any) => ({
          id: n.id,
          phone_number: n.phone_number,
          provider: n.provider || "vomyra",
          provider_resource_id: n.provider_resource_id,
          assigned_assistant_id: n.assigned_assistant_id,
          assistants: n.assistants ? { id: n.assistants.id, name: n.assistants.name } : null,
          status: n.assigned_assistant_id ? "active" : "unassigned",
          created_at: n.created_at
        }));
      }

      // 2. Fetch workspace balance from credit ledger RPC
      const { data: balanceData } = await adminClient.rpc("get_workspace_credit_balance", {
        p_workspace_id: workspaceId
      });
      workspaceBalance = Number(balanceData || 0);
    }

    // 3. Fetch available numbers
    const { data: dbUnassigned } = await adminClient
      .from("phone_numbers")
      .select("*")
      .is("workspace_id", null)
      .is("deleted_at", null);

    if (dbUnassigned && dbUnassigned.length > 0) {
      initialAvailableNumbers = dbUnassigned.map((n: any) => ({
        id: n.id,
        phone_number: n.phone_number,
        country: "United States",
        country_code: "US",
        provider: n.provider || "vomyra",
        monthly_price: 2.00
      }));
    }

    // 4. Fetch assistants list
    const { data: dbAssistants } = await adminClient
      .from("assistants")
      .select("id, name")
      .is("deleted_at", null);

    if (dbAssistants) {
      assistantOptions = dbAssistants.map((a: any) => ({
        id: a.id,
        name: a.name
      }));
    }
  } catch (e) {
    console.warn("Failed to fetch phone numbers page data:", e);
  }

  return (
    <PhoneNumbersClient
      initialMyNumbers={initialMyNumbers}
      initialAvailableNumbers={initialAvailableNumbers}
      assistants={assistantOptions}
      workspaceBalance={workspaceBalance}
    />
  );
}
