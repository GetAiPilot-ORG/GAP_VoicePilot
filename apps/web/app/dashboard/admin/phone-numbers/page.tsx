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

  try {
    // Fetch all numbers in the database, including the workspace name
    const { data: dbNumbers } = await adminClient
      .from("phone_numbers")
      .select("*, workspaces(name)")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (dbNumbers) {
      initialNumbers = dbNumbers;
    }

    // Fetch live Vomyra pool
    vomyraNumbers = await fetchVomyraNumbers();
  } catch (e) {
    console.warn("Failed to fetch admin phone numbers:", e);
  }

  return <AdminPhoneNumbersClient initialNumbers={initialNumbers} vomyraNumbers={vomyraNumbers} />;
}
