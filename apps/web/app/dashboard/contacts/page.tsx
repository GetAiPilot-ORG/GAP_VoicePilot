import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { getContactsAction } from "@/app/actions/contacts";
import ContactsClient from "./ContactsClient";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  let assistantOptions: Array<{ id: string; name: string; phone_number: string }> = [];

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      const { data: members } = await adminClient
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id);

      const wIds = members?.map((m: any) => m.workspace_id) || [];

      if (wIds.length > 0) {
        const { data: dbAssistants } = await adminClient
          .from("assistants")
          .select(`
            id,
            name,
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
      }
    }
  } catch (e) {
    console.warn("Could not load assistant options for contacts page:", e);
  }

  // Fallback assistant option if none found
  if (assistantOptions.length === 0) {
    assistantOptions = [
      { id: "demo_asst_1", name: "Sales Representative Bot", phone_number: "+91 (800) 555-0199" },
      { id: "demo_asst_2", name: "Customer Support Agent", phone_number: "+91 (800) 555-0244" }
    ];
  }

  const { contacts, integrations, logs } = await getContactsAction();

  return (
    <ContactsClient 
      initialContacts={contacts}
      initialIntegrations={integrations}
      initialLogs={logs}
      assistants={assistantOptions}
    />
  );
}
