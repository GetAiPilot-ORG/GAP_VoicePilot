import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { PhoneNumbersClient, PhoneNumberRecord, AvailableNumberItem, AssistantOption } from "./PhoneNumbersClient";

const DEFAULT_WORKSPACE_ID = "df2a5118-9106-4124-9cea-bcaadc13f2ef";

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
  let workspaceBalance = 0.00;

  try {
    // 1. Fetch user's purchased numbers
    const { data: dbMyNumbers } = await adminClient
      .from("phone_numbers")
      .select("*, assistants(id, name)")
      .eq("workspace_id", DEFAULT_WORKSPACE_ID)
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

    // 2. Fetch unassigned numbers from database (workspace_id IS NULL)
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

    // 3. Fetch assistants list
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

    // 4. Fetch workspace balance
    const { data: ws } = await adminClient
      .from("workspaces")
      .select("balance")
      .eq("id", DEFAULT_WORKSPACE_ID)
      .maybeSingle();

    if (ws && typeof ws.balance === 'number') {
      workspaceBalance = ws.balance;
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
