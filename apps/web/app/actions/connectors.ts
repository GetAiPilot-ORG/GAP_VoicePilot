"use server";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { getCurrentWorkspace, getAdminClient } from "@/lib/workspace";

export async function getConnectorsAction() {
  try {
    const current = await getCurrentWorkspace();
    const workspaceId = current?.workspaceId || "default";

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${apiUrl}/api/v1/connectors?workspaceId=${workspaceId}`, {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          workspaceId,
          definitions: data.definitions || [],
          connectedAccounts: data.connectedAccounts || [],
        };
      }
    } catch (apiErr: any) {
      console.warn("[getConnectorsAction] API fetch warning, returning default catalog:", apiErr.message);
    }

    return {
      success: true,
      workspaceId,
      definitions: [],
      connectedAccounts: [],
    };
  } catch (error: any) {
    console.error("[getConnectorsAction] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function initiateConnectorAuthAction(provider: string) {
  try {
    if (provider === "zapier") {
      return {
        success: false,
        error: "Native Zapier Platform App uses OAuth 2.0 Provider initiated directly from Zapier Platform. Please click 'Setup Zapier' in the dashboard.",
      };
    }

    const current = await getCurrentWorkspace();
    const workspaceId = current?.workspaceId || "default";
    const userId = current?.userId || "user_default";

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUrl = `${appUrl}/dashboard/connectors?connector=${provider}`;

    const authorizeEndpoint = `${apiUrl}/api/v1/connectors/${provider}/authorize?workspaceId=${workspaceId}&userId=${userId}&redirectUrl=${encodeURIComponent(redirectUrl)}`;

    try {
      const res = await fetch(authorizeEndpoint, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.authUrl) {
          return { success: true, authUrl: data.authUrl };
        }
      }
    } catch (fetchErr: any) {
      console.warn("[initiateConnectorAuthAction] Fetch warning, falling back to direct URL redirect:", fetchErr.message);
    }

    return {
      success: true,
      authUrl: authorizeEndpoint,
    };
  } catch (error: any) {
    console.error("[initiateConnectorAuthAction] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function disconnectConnectorAction(workspaceConnectorId: string, provider: string) {
  try {
    const current = await getCurrentWorkspace();
    const workspaceId = current?.workspaceId || "default";

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiUrl}/api/v1/connectors/${provider}/disconnect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId, workspaceConnectorId }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to disconnect integration");
    }

    revalidatePath("/dashboard/connectors");
    return { success: true };
  } catch (error: any) {
    console.error("[disconnectConnectorAction] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getAssistantsForWorkspaceAction() {
  try {
    const current = await getCurrentWorkspace();
    const workspaceId = current?.workspaceId;
    const adminClient = await getAdminClient();

    if (!adminClient || !workspaceId) return { success: true, assistants: [] };

    const { data } = await adminClient
      .from("assistants")
      .select("id, name, status")
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null);

    return { success: true, assistants: data || [] };
  } catch (e: any) {
    return { success: false, error: e.message, assistants: [] };
  }
}

export async function getWorkflowsAction() {
  try {
    const current = await getCurrentWorkspace();
    const workspaceId = current?.workspaceId || "default";

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${apiUrl}/api/v1/workflows?workspaceId=${workspaceId}`, {
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, workflows: data.workflows || [] };
      }
    } catch (apiErr: any) {
      console.warn("[getWorkflowsAction] API fetch warning:", apiErr.message);
    }

    return { success: true, workflows: [] };
  } catch (error: any) {
    console.error("[getWorkflowsAction] Error:", error);
    return { success: false, error: error.message, workflows: [] };
  }
}

export async function createWorkflowAction(payload: {
  name: string;
  trigger_type: string;
  actions: Array<{ tool_name: string; config: Record<string, any> }>;
}) {
  try {
    const current = await getCurrentWorkspace();
    const workspaceId = current?.workspaceId || "default";

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiUrl}/api/v1/workflows`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workspace_id: workspaceId,
        name: payload.name,
        trigger_type: payload.trigger_type,
        actions: payload.actions.map((act, idx) => ({ id: `act_${idx + 1}`, ...act })),
        enabled: true,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to create workflow");
    }

    revalidatePath("/dashboard/connectors");
    return { success: true };
  } catch (error: any) {
    console.error("[createWorkflowAction] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleWorkflowEnabledAction(workflowId: string, enabled: boolean) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiUrl}/api/v1/workflows/${workflowId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update workflow");
    }

    revalidatePath("/dashboard/connectors");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteWorkflowAction(workflowId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiUrl}/api/v1/workflows/${workflowId}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to delete workflow");
    }

    revalidatePath("/dashboard/connectors");
    revalidatePath("/dashboard/workflows");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAgentPermissionsAction(assistantId: string) {
  try {
    const current = await getCurrentWorkspace();
    if (!current) return { success: false, error: "Unauthorized" };

    const adminClient = await getAdminClient();
    if (!adminClient) return { success: false, error: "Database unavailable" };

    // 1. Verify assistant belongs to current workspace
    const { data: assistant } = await adminClient
      .from("assistants")
      .select("id, workspace_id, name")
      .eq("id", assistantId)
      .eq("workspace_id", current.workspaceId)
      .maybeSingle();

    if (!assistant) {
      return { success: false, error: "Assistant not found in this workspace" };
    }

    // 2. Fetch connected workspace connectors
    const { data: connectedAccs } = await adminClient
      .from("workspace_connectors")
      .select("id, name, connected_account_name, connected_account_email, status, connector_definition_id")
      .eq("workspace_id", current.workspaceId)
      .eq("status", "connected");

    // 3. Fetch connector definitions
    const { data: defs } = await adminClient.from("connector_definitions").select("*");

    // 4. Fetch assistant connector mappings for this assistant
    const { data: astConnectors } = await adminClient
      .from("assistant_connectors")
      .select("workspace_connector_id, enabled")
      .eq("assistant_id", assistant.id);

    // 5. Fetch tool permissions for this assistant
    const { data: toolPerms } = await adminClient
      .from("connector_tool_permissions")
      .select("workspace_connector_id, tool_name, enabled, execution_policy")
      .eq("assistant_id", assistant.id);

    return {
      success: true,
      assistant,
      connectedAccounts: connectedAccs || [],
      definitions: defs || [],
      assistantConnectors: astConnectors || [],
      toolPermissions: toolPerms || [],
    };
  } catch (error: any) {
    console.error("[getAgentPermissionsAction] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function saveAgentPermissionsAction(
  assistantId: string,
  payload: {
    connectors: Array<{ workspace_connector_id: string; enabled: boolean }>;
    toolPermissions: Array<{
      workspace_connector_id: string;
      tool_name: string;
      enabled: boolean;
      execution_policy: "automatic" | "confirm" | "disabled";
    }>;
  }
) {
  try {
    const current = await getCurrentWorkspace();
    if (!current) return { success: false, error: "Unauthorized" };

    const adminClient = await getAdminClient();
    if (!adminClient) return { success: false, error: "Database unavailable" };

    // 1. Strict Server-Side Validation: Verify assistant belongs to user's workspace
    const { data: assistant } = await adminClient
      .from("assistants")
      .select("id, workspace_id")
      .eq("id", assistantId)
      .eq("workspace_id", current.workspaceId)
      .maybeSingle();

    if (!assistant) {
      return { success: false, error: "Security Error: Assistant does not belong to your workspace" };
    }

    // 2. Strict Server-Side Validation: Verify all target workspace_connectors belong to user's workspace
    const targetConnectorIds = Array.from(
      new Set([
        ...payload.connectors.map((c) => c.workspace_connector_id),
        ...payload.toolPermissions.map((t) => t.workspace_connector_id),
      ])
    );

    if (targetConnectorIds.length > 0) {
      const { data: validConnectors } = await adminClient
        .from("workspace_connectors")
        .select("id")
        .eq("workspace_id", current.workspaceId)
        .in("id", targetConnectorIds);

      const validSet = new Set((validConnectors || []).map((c: any) => c.id));
      for (const reqId of targetConnectorIds) {
        if (!validSet.has(reqId)) {
          return { success: false, error: "Security Error: Invalid workspace connector ID" };
        }
      }
    }

    // 3. Upsert assistant_connectors mappings
    for (const conn of payload.connectors) {
      await adminClient.from("assistant_connectors").upsert(
        {
          assistant_id: assistant.id,
          workspace_connector_id: conn.workspace_connector_id,
          enabled: conn.enabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "assistant_id,workspace_connector_id" }
      );
    }

    // 4. Upsert connector_tool_permissions mappings
    for (const tp of payload.toolPermissions) {
      // Validate execution_policy values
      const validPolicies = ["automatic", "confirm", "disabled"];
      const policy = validPolicies.includes(tp.execution_policy) ? tp.execution_policy : "automatic";

      await adminClient.from("connector_tool_permissions").upsert(
        {
          assistant_id: assistant.id,
          workspace_connector_id: tp.workspace_connector_id,
          tool_name: tp.tool_name,
          enabled: tp.enabled,
          execution_policy: policy,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "workspace_connector_id,assistant_id,tool_name" }
      );
    }

    revalidatePath(`/dashboard/assistants/${assistantId}`);
    return { success: true };
  } catch (error: any) {
    console.error("[saveAgentPermissionsAction] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getAdminConnectorAvailabilitiesAction() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiUrl}/api/v1/connectors/admin/availability`, {
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, availabilities: data.availabilities || [] };
    }
    return { success: false, error: "Failed to fetch admin availability" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateConnectorAvailabilityAction(
  slug: string,
  availability_status: "enabled" | "disabled" | "coming_soon",
  is_visible: boolean,
  internal_note?: string
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const res = await fetch(`${apiUrl}/api/v1/connectors/admin/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, availability_status, is_visible, internal_note }),
    });

    if (res.ok) {
      const data = await res.json();
      revalidatePath("/dashboard/connectors");
      revalidatePath("/dashboard/admin/integrations");
      return { success: true, record: data.record };
    }
    return { success: false, error: "Failed to update availability" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


