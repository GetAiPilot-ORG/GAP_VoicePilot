import { getAdminClient } from "@/lib/workspace";
import { notFound } from "next/navigation";
import { EditAssistantForm } from "../EditAssistantForm";

export const dynamic = "force-dynamic";

interface AssistantPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssistantDetailPage({ params }: AssistantPageProps) {
  const resolvedParams = await params;
  const assistantId = resolvedParams.id;

  const adminClient = await getAdminClient();
  let assistant: any = null;
  let tools: any[] = [];

  // 1. Fetch Assistant from Supabase using Admin Client (checks both UUID and provider_resource_id)
  if (adminClient) {
    try {
      // Check by primary ID
      const { data: dbAssistant } = await adminClient
        .from("assistants")
        .select("*")
        .eq("id", assistantId)
        .is("deleted_at", null)
        .maybeSingle();

      if (dbAssistant) {
        assistant = dbAssistant;
      } else {
        // Check by provider_resource_id if passed
        const { data: altAssistant } = await adminClient
          .from("assistants")
          .select("*")
          .eq("provider_resource_id", assistantId)
          .is("deleted_at", null)
          .maybeSingle();

        if (altAssistant) {
          assistant = altAssistant;
        }
      }
    } catch (err) {
      console.warn("Error fetching assistant from database:", err);
    }
  }

  // 2. Fetch assigned tools for this assistant
  if (assistant && adminClient) {
    try {
      const { data: assignedTools } = await adminClient
        .from("assistant_tools")
        .select("tool_id")
        .eq("assistant_id", assistant.id);

      assistant = {
        ...assistant,
        config: assistant.config_snapshot || {},
        assigned_tool_ids: assignedTools ? assignedTools.map((t: any) => t.tool_id) : []
      };
    } catch (e) {}
  }

  // 3. Fallback: Check Vomyra API directly if not in Supabase
  if (!assistant) {
    try {
      const vomyraApiKey = process.env.VOMYRA_API_KEY || "";
      const vomyraBaseUrl = process.env.VOMYRA_BASE_URL || "https://api.vomyra.com";
      const res = await fetch(`${vomyraBaseUrl}/v1/assistants/${assistantId}`, {
        headers: { "x-api-key": vomyraApiKey },
        cache: "no-store"
      });

      if (res.ok) {
        const vData = await res.json();
        const raw = vData.data || vData;
        assistant = {
          id: raw.id || assistantId,
          name: raw.name || "AI Assistant",
          status: raw.status || "active",
          provider_resource_id: raw.id || raw.provider_resource_id || assistantId,
          config_snapshot: raw.config || raw,
          assigned_tool_ids: raw.tools || []
        };
      }
    } catch (e) {}
  }

  // 4. Fallback: Check backend Express API
  if (!assistant) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${apiUrl}/api/v1/assistants/${assistantId}`, { cache: "no-store" });
      if (res.ok) {
        assistant = await res.json();
      }
    } catch (e) {}
  }

  // If still not found after all fallbacks, return 404
  if (!assistant) {
    return notFound();
  }

  // 5. Fetch Workspace Tools & Vomyra Tools
  if (adminClient) {
    try {
      const { data: dbTools } = await adminClient
        .from("tools")
        .select("*")
        .is("deleted_at", null);

      if (dbTools && dbTools.length > 0) {
        tools = dbTools;
      }
    } catch (e) {}
  }

  // Also fetch Vomyra Live Tools
  try {
    const vomyraApiKey = process.env.VOMYRA_API_KEY || "";
    const vomyraBaseUrl = process.env.VOMYRA_BASE_URL || "https://api.vomyra.com";
    const toolRes = await fetch(`${vomyraBaseUrl}/v1/tools`, {
      headers: { "x-api-key": vomyraApiKey },
      cache: "no-store"
    });

    if (toolRes.ok) {
      const tData = await toolRes.json();
      const rawTools = tData.data || tData.tools || (Array.isArray(tData) ? tData : []);
      const mappedVomyraTools = rawTools.map((t: any) => ({
        id: t.id || t._id,
        name: t.name || t.tool_name || "Custom Connector",
        type: t.type || (t.schema ? "api_request" : "knowledgebase"),
        description: t.description || (t.schema ? "Vomyra API Request Connector" : "Vomyra Knowledge Base Tool"),
        config: {
          request_url: t.schema?.endpoint || t.endpoint || "",
          request_http_method: t.schema?.method || t.method || "POST"
        }
      }));

      // Combine tools
      const toolIds = new Set(tools.map((x) => x.id));
      for (const mt of mappedVomyraTools) {
        if (!toolIds.has(mt.id)) {
          tools.push(mt);
        }
      }
    }
  } catch (e) {}

  return (
    <div className="max-w-6xl space-y-6">
      <EditAssistantForm assistant={assistant} workspaceTools={tools} />
    </div>
  );
}
