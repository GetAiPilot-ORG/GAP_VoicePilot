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

    // 1. Check existing workspace membership
    const { data: member } = await adminClient
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (member?.workspace_id) {
      return {
        workspaceId: member.workspace_id,
        userId: user.id,
        userEmail: user.email || "",
      };
    }

    // 2. Check if user owns an existing workspace
    const { data: ownedWs } = await adminClient
      .from("workspaces")
      .select("id")
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle();

    if (ownedWs?.id) {
      // Add workspace member row
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

    // 3. Auto-provision a dedicated workspace for this user
    const wsName = user.email ? `${user.email.split("@")[0]}'s Workspace` : "My Workspace";
    const { data: newWs, error: createWsErr } = await adminClient
      .from("workspaces")
      .insert({
        name: wsName,
        owner_id: user.id,
        balance: 50.00
      })
      .select()
      .single();

    if (createWsErr || !newWs) {
      // Fallback if schema doesn't have balance column
      const { data: fallbackWs } = await adminClient
        .from("workspaces")
        .insert({
          name: wsName,
          owner_id: user.id
        })
        .select()
        .single();

      if (fallbackWs?.id) {
        await adminClient.from("workspace_members").upsert({
          workspace_id: fallbackWs.id,
          user_id: user.id,
          role: "owner"
        });

        return {
          workspaceId: fallbackWs.id,
          userId: user.id,
          userEmail: user.email || "",
        };
      }
      return null;
    }

    // Insert workspace member
    await adminClient.from("workspace_members").upsert({
      workspace_id: newWs.id,
      user_id: user.id,
      role: "owner"
    });

    // Seed initial free trial credits (50 mins)
    try {
      await adminClient.from("credit_ledger").insert({
        workspace_id: newWs.id,
        amount: 50.00,
        type: "top_up",
        notes: "Welcome free trial credits (50 AI Mins)"
      });
    } catch (e) {}

    return {
      workspaceId: newWs.id,
      userId: user.id,
      userEmail: user.email || "",
    };
  } catch (err) {
    console.error("Error resolving workspace:", err);
    return null;
  }
}
