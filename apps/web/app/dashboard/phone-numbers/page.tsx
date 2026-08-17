import { getAdminClient, getCurrentWorkspace } from "@/lib/workspace";
import { PhoneNumbersClient, PhoneNumberRecord, AssistantOption } from "./PhoneNumbersClient";

export const dynamic = "force-dynamic";

export default async function PhoneNumbersPage() {
  let initialMyNumbers: PhoneNumberRecord[] = [];
  let assistantOptions: AssistantOption[] = [];
  let workspaceBalance = 0;
  let dedicatedNumberEntitlements = 0;
  let initialSubscription: any = null;
  let initialKyc: any = null;

  try {
    const ws = await getCurrentWorkspace();
    const adminClient = await getAdminClient();

    if (ws?.workspaceId) {
      const workspaceId = ws.workspaceId;

      // 1. Fetch user's purchased numbers (including expired ones)
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
          created_at: n.created_at,
          current_period_end: n.current_period_end || null
        }));
      }

      // 2. Fetch workspace balance from credit ledger RPC
      const { data: balanceData } = await adminClient.rpc("get_workspace_credit_balance", {
        p_workspace_id: workspaceId
      });
      workspaceBalance = Number(balanceData || 0);

      // 3. Fetch dedicated number entitlements
      const { data: wsData } = await adminClient
        .from("workspaces")
        .select("dedicated_number_entitlements")
        .eq("id", workspaceId)
        .single();
      if (wsData) {
        dedicatedNumberEntitlements = wsData.dedicated_number_entitlements || 0;
      }

      // 4. Fetch workspace subscription (to check expiration)
      const { data: subData } = await adminClient
        .from("workspace_subscriptions")
        .select("*, plans(*)")
        .eq("workspace_id", workspaceId)
        .maybeSingle();
      initialSubscription = subData;

      // 5. Fetch assistants list
      const { data: dbAssistants } = await adminClient
        .from("assistants")
        .select("id, name")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null);

      if (dbAssistants) {
        assistantOptions = dbAssistants.map((a: any) => ({
          id: a.id,
          name: a.name
        }));
      }
    }

    // 6. Fetch current KYC status
    const { getWorkspaceKycStatus } = await import("@/app/actions/kyc");
    const kycRes = await getWorkspaceKycStatus();
    initialKyc = kycRes.success ? kycRes.kyc : null;

    return (
      <PhoneNumbersClient
        initialMyNumbers={initialMyNumbers}
        initialKyc={initialKyc}
        assistants={assistantOptions}
        workspaceBalance={workspaceBalance}
        dedicatedNumberEntitlements={dedicatedNumberEntitlements}
        initialSubscription={initialSubscription}
      />
    );
  } catch (e) {
    console.warn("Failed to fetch phone numbers page data:", e);
    return (
      <PhoneNumbersClient
        initialMyNumbers={initialMyNumbers}
        initialKyc={null}
        assistants={assistantOptions}
        workspaceBalance={workspaceBalance}
        dedicatedNumberEntitlements={0}
        initialSubscription={null}
      />
    );
  }
}
