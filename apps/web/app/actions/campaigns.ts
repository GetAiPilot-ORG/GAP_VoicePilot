"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createCampaignAction(formData: FormData) {
  const name = formData.get("name") as string;
  const assistantId = formData.get("assistantId") as string;
  const numbers = formData.get("numbers") as string;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
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
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Get user's default workspace
  const { data: workspaceMembers } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1)
    .single();

  if (!workspaceMembers) {
    throw new Error("No workspace found");
  }

  // Call the Express Backend API
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  const res = await fetch(`${apiUrl}/api/v1/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name,
      assistantId,
      numbers,
      workspaceId: workspaceMembers.workspace_id,
      createdBy: user.id
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to start campaign');
  }

  return redirect("/dashboard/campaigns");
}
