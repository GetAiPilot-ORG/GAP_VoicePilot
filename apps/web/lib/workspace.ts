import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function getCurrentWorkspace(): Promise<{
  workspaceId: string;
  userId: string;
  userEmail: string;
} | null> {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !anonKey) return null;

    const supabase = createServerClient(
      supabaseUrl,
      anonKey,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const adminClient = await getAdminClient();
    if (!adminClient) return null;

    // Resolve the single workspace owned by this user. Signup provisioning is
    // handled atomically by the database trigger.
    const { data: ownedWs } = await adminClient
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (ownedWs?.id) {
      await adminClient.from("workspace_members").upsert({
        workspace_id: ownedWs.id,
        user_id: user.id,
        role: "owner"
      });

      return {
        workspaceId: ownedWs.id,
        userId: user.id,
        userEmail: user.email || "",
      };
    }
    console.error("No workspace was provisioned for authenticated user", user.id);
    return null;
  } catch (err) {
    console.error("Error resolving workspace:", err);
    return null;
  }
}
