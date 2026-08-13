"use server";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function getOrCreateWorkspace(supabase: any, user: any): Promise<string> {
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (member?.workspace_id) return member.workspace_id;

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    await adminClient.from('profiles').upsert({
      id: user.id,
      email: user.email || 'user@example.com',
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
    }, { onConflict: 'id' });
  } catch (e) {}

  // Fallback removed to prevent assigning users to random workspaces

  try {
    const { data: newWs } = await adminClient
      .from('workspaces')
      .insert({
        name: `${user.email?.split('@')[0] || 'Default'}'s Workspace`,
        owner_id: user.id,
        status: 'active'
      })
      .select('id')
      .single();

    if (newWs?.id) {
      try {
        await adminClient.from('workspace_members').insert({
          workspace_id: newWs.id,
          user_id: user.id,
          role: 'owner'
        });
      } catch (e) {}
      return newWs.id;
    }
  } catch (e) {}

  return "00000000-0000-0000-0000-000000000000";
}

export async function generatePromptAction(topic: string, category: string = 'general') {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  const res = await fetch(`${apiUrl}/api/v1/assistants/generate-prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, category })
  });

  if (!res.ok) {
    throw new Error("Failed to generate prompt");
  }

  const data = await res.json();
  return data.prompt || "";
}

export async function createAssistantAction(formData: FormData) {
  const payloadStr = formData.get("payload");
  if (!payloadStr) throw new Error("No payload found");
  
  const payload = JSON.parse(payloadStr as string);

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
  if (!user) throw new Error("Unauthorized");

  const workspaceId = await getOrCreateWorkspace(supabase, user);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  let res: Response;
  try {
    res = await fetch(`${apiUrl}/api/v1/assistants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workspaceId: workspaceId,
        createdBy: user.id,
        ...payload
      })
    });
  } catch (networkErr: any) {
    console.error("Failed to connect to backend API server:", networkErr);
    throw new Error(`Cannot connect to backend server at ${apiUrl}. Please make sure the API server is running (npm run dev in apps/api).`);
  }

  if (!res.ok) {
    const text = await res.text();
    let errMessage = 'Failed to create assistant';
    try {
      const parsed = JSON.parse(text);
      errMessage = parsed.error || errMessage;
    } catch {
      errMessage = `Server Error (${res.status}): ${text.slice(0, 100)}`;
    }
    throw new Error(errMessage);
  }

  return { success: true };
}

export async function updateAssistantAction(id: string, payload: any) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const res = await fetch(`${apiUrl}/api/v1/assistants/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update assistant');
  }

  return await res.json();
}

export async function deleteAssistantAction(assistantId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const res = await fetch(`${apiUrl}/api/v1/assistants/${assistantId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      console.warn("Express delete assistant returned non-200 status:", await res.text());
    }
  } catch (e) {
    console.warn("Express delete assistant fetch failed:", e);
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await adminClient.from('phone_numbers').update({ assigned_assistant_id: null, status: 'unassigned' }).eq('assigned_assistant_id', assistantId);
  await adminClient.from('assistant_tools').delete().eq('assistant_id', assistantId);
  
  const { error: delErr } = await adminClient.from('assistants').delete().eq('id', assistantId);
  if (delErr) {
    await adminClient.from('assistants').update({ deleted_at: new Date().toISOString() }).eq('id', assistantId);
  }

  revalidatePath("/dashboard/assistants");
  return { success: true };
}

export async function duplicateAssistantAction(assistantId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: target } = await adminClient
    .from('assistants')
    .select('*')
    .eq('id', assistantId)
    .single();

  if (!target) throw new Error("Assistant not found");

  const workspaceId = await getOrCreateWorkspace(supabase, user);

  const payload = {
    ...(target.config_snapshot || {}),
    name: `${target.name} (Copy)`
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const res = await fetch(`${apiUrl}/api/v1/assistants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceId,
      createdBy: user.id,
      ...payload
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to duplicate assistant');
  }

  revalidatePath("/dashboard/assistants");
  return { success: true };
}

export async function toggleAssistantToolAction(assistantId: string, toolId: string, assign: boolean) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const endpoint = `${apiUrl}/api/v1/assistants/${assistantId}/tools${assign ? '' : `/${toolId}`}`;
  const method = assign ? 'POST' : 'DELETE';
  const body = assign ? JSON.stringify({ toolId }) : undefined;

  const res = await fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update tool assignment');
  }

  return await res.json();
}
