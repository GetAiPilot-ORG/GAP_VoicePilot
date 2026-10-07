import { createClient } from "@supabase/supabase-js";
import { AdminPhoneNumbersClient } from "./AdminPhoneNumbersClient";
import { fetchVomyraNumbers } from "@/lib/vomyra";

export const dynamic = "force-dynamic";

export default async function AdminPhoneNumbersPage() {
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let initialNumbers: any[] = [];
  let vomyraNumbers: any[] = [];
  let allWorkspaces: any[] = [];

  try {
    // 1. Fetch all numbers in the database, with workspace & assistant joins
    const { data: dbNumbers } = await adminClient
      .from("phone_numbers")
      .select("*, workspaces(id, name, owner_id), assistants(id, name)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    // 2. Fetch workspace owner user accounts from auth admin
    let userMap: Record<string, { email?: string; full_name?: string }> = {};
    try {
      const { data: { users } } = await adminClient.auth.admin.listUsers();
      if (users) {
        users.forEach(u => {
          userMap[u.id] = {
            email: u.email,
            full_name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0]
          };
        });
      }
    } catch (authErr) {
      console.warn("Failed to list auth users for phone numbers admin:", authErr);
    }

    if (dbNumbers) {
      initialNumbers = dbNumbers.map((n: any) => ({
        ...n,
        owner: n.workspaces?.owner_id ? userMap[n.workspaces.owner_id] : null
      }));
    }

    // 3. Fetch all workspaces for manual assignment options
    const { data: wsList } = await adminClient
      .from("workspaces")
      .select("id, name, owner_id")
      .order("name", { ascending: true });

    if (wsList) {
      allWorkspaces = wsList.map((ws: any) => ({
        ...ws,
        owner: ws.owner_id ? userMap[ws.owner_id] : null
      }));
    }

    // 4. Fetch live Vomyra pool
    vomyraNumbers = await fetchVomyraNumbers();
  } catch (e) {
    console.warn("Failed to fetch admin phone numbers:", e);
  }

  return (
    <AdminPhoneNumbersClient 
      initialNumbers={initialNumbers} 
      vomyraNumbers={vomyraNumbers} 
      allWorkspaces={allWorkspaces} 
    />
  );
}
