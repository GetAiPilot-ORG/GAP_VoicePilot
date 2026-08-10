import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { EditAssistantForm } from "../EditAssistantForm";

interface AssistantPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssistantDetailPage({ params }: AssistantPageProps) {
  const resolvedParams = await params;
  const assistantId = resolvedParams.id;

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return notFound();
  }

  // Get workspace with fallback
  let workspaceId = "";
  const { data: member } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (member?.workspace_id) {
    workspaceId = member.workspace_id;
  } else {
    const { data: anyWs } = await supabase.from('workspaces').select('id').limit(1).maybeSingle();
    workspaceId = anyWs?.id || "";
  }

  // Fetch assistant details from Express backend
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  let assistant: any = null;

  try {
    const res = await fetch(`${apiUrl}/api/v1/assistants/${assistantId}`, {
      cache: 'no-store'
    });
    if (res.ok) {
      assistant = await res.json();
    }
  } catch (e) {
    console.warn("Could not fetch assistant from backend API:", e);
  }

  // Fallback to Supabase if API is unreachable
  if (!assistant) {
    const { data: dbAssistant } = await supabase
      .from('assistants')
      .select('*')
      .eq('id', assistantId)
      .single();

    if (!dbAssistant) {
      return notFound();
    }

    const { data: assignedTools } = await supabase
      .from('assistant_tools')
      .select('tool_id')
      .eq('assistant_id', assistantId);

    assistant = {
      ...dbAssistant,
      config: dbAssistant.config_snapshot || {},
      assigned_tool_ids: assignedTools ? assignedTools.map((t: any) => t.tool_id) : []
    };
  }

  // Fetch all workspace tools for the Tools tab
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .eq('workspace_id', workspaceId)
    .is('deleted_at', null);

  return (
    <div className="max-w-6xl space-y-6">
      <EditAssistantForm assistant={assistant} workspaceTools={tools || []} />
    </div>
  );
}
