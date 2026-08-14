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
  
  const res = await fetch(`${apiUrl}/api/v1/assistants`, {
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
  if (!user) {
    return { success: false, error: "Unauthorized: Please log in again.", code: "UNAUTHORIZED" };
  }

  let rawApiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://127.0.0.1:8000';
  if (rawApiUrl.includes('localhost')) {
    rawApiUrl = rawApiUrl.replace('localhost', '127.0.0.1');
  }
  const targetUrl = `${rawApiUrl.replace(/\/$/, '')}/api/v1/assistants/${id}`;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[updateAssistantAction] User: ${user.id} | Assistant: ${id} | Target URL: ${targetUrl}`);
  }

  // Attempt 1: Call Express API Backend
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(targetUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      revalidatePath(`/dashboard/assistants/${id}`);
      revalidatePath('/dashboard/assistants');
      return { success: true, data: data.data || data };
    } else {
      let errMessage = 'Express API update failed';
      try {
        const errJson = await res.json();
        errMessage = errJson.error || errMessage;
      } catch {
        const text = await res.text();
        errMessage = `Express API Error (${res.status}): ${text.slice(0, 100)}`;
      }
      console.warn(`[updateAssistantAction] Express API returned non-200 status (${res.status}): ${errMessage}`);
    }
  } catch (expressErr: any) {
    console.warn(`[updateAssistantAction] Express API fetch failed (${expressErr.name}: ${expressErr.message}). Falling back to direct database sync.`);
  }

  // Attempt 2: Direct Supabase + Vomyra Fallback
  try {
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let dbAssistant: any = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUuid) {
      const { data } = await adminClient
        .from('assistants')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .maybeSingle();
      dbAssistant = data;
    }

    if (!dbAssistant) {
      const { data } = await adminClient
        .from('assistants')
        .select('*')
        .eq('provider_resource_id', id)
        .is('deleted_at', null)
        .maybeSingle();
      dbAssistant = data;
    }

    if (!dbAssistant) {
      return { success: false, error: 'Assistant not found in database', code: 'ASSISTANT_NOT_FOUND' };
    }

    const realDbId = dbAssistant.id;
    let updatedConfig = { ...(dbAssistant.config_snapshot || {}), ...payload };

    // Sync with Vomyra API directly if key is available
    const vomyraApiKey = process.env.VOMYRA_API_KEY || '';
    const vomyraBaseUrl = process.env.VOMYRA_BASE_URL || 'https://api.vomyra.com';
    const providerResId = dbAssistant.provider_resource_id || id;

    if (vomyraApiKey && providerResId && !providerResId.startsWith('mock_') && !providerResId.startsWith('ast_')) {
      try {
        const sanitizedVoice = payload.voice ? { ...payload.voice } : undefined;
        if (sanitizedVoice && !sanitizedVoice.tts_model) delete sanitizedVoice.tts_model;
        const vPayload = { ...payload };
        if (sanitizedVoice) vPayload.voice = sanitizedVoice;

        const vRes = await fetch(`${vomyraBaseUrl}/v1/assistants/${providerResId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': vomyraApiKey
          },
          body: JSON.stringify(vPayload)
        });

        if (vRes.ok) {
          const vData = await vRes.json();
          const rawV = vData.data || vData;
          updatedConfig = { ...(dbAssistant.config_snapshot || {}), ...rawV, ...payload };
        } else {
          console.warn(`[updateAssistantAction] Direct Vomyra update returned status ${vRes.status}`);
        }
      } catch (vErr: any) {
        console.warn(`[updateAssistantAction] Direct Vomyra update fetch error: ${vErr.message}`);
      }
    }

    // Update Supabase
    const { data: updatedRecord, error: dbErr } = await adminClient
      .from('assistants')
      .update({
        name: payload.name || dbAssistant.name,
        config_snapshot: updatedConfig,
        updated_at: new Date().toISOString()
      })
      .eq('id', realDbId)
      .select()
      .single();

    if (dbErr) {
      console.error(`[updateAssistantAction] Database update error:`, dbErr.message);
      return { success: false, error: `Database update failed: ${dbErr.message}`, code: 'DATABASE_ERROR' };
    }

    // Sync tools if selected_tools array present
    if (Array.isArray(payload.selected_tools)) {
      try {
        await adminClient.from('assistant_tools').delete().eq('assistant_id', realDbId);
        if (payload.selected_tools.length > 0) {
          const toolRows = payload.selected_tools.map((tId: string) => ({
            assistant_id: realDbId,
            tool_id: tId
          }));
          await adminClient.from('assistant_tools').insert(toolRows);
        }
      } catch (tErr: any) {
        console.warn(`[updateAssistantAction] Tool assignment sync error:`, tErr.message);
      }
    }

    revalidatePath(`/dashboard/assistants/${id}`);
    revalidatePath('/dashboard/assistants');

    return { success: true, data: updatedRecord };
  } catch (fallbackErr: any) {
    console.error(`[updateAssistantAction] Fallback update failed:`, fallbackErr);
    return {
      success: false,
      error: fallbackErr.message || 'Failed to update assistant',
      code: 'ASSISTANT_UPDATE_FAILED'
    };
  }
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
