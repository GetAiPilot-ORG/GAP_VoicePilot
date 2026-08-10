import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import CallsClient from "./CallsClient";

export const dynamic = "force-dynamic";

export default async function CallLogsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  let assistants: Array<{ id: string; name: string }> = [];

  try {
    const { data: dbAssistants } = await adminClient
      .from("assistants")
      .select("id, name")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (dbAssistants && dbAssistants.length > 0) {
      assistants = dbAssistants.map((a: any) => ({ id: a.id, name: a.name }));
    }
  } catch (e) {
    console.warn("Failed to fetch assistants for calls page:", e);
  }

  const sampleCalls = [
    {
      id: "call_9821a8f0",
      assistant: assistants[0]?.name || "Support Pilot Pro",
      assistantId: assistants[0]?.id,
      number: "+1 (800) 459-2901",
      duration: "2m 45s",
      latency: "340ms",
      status: "completed",
      cost: "$0.08",
      time: "10 mins ago",
      transcript: "User: Hi, I want to reschedule my appointment. Agent: Sure! I can help you with that. What date works best for you?"
    },
    {
      id: "call_7712b941",
      assistant: assistants[1]?.name || "Sales Prospector",
      assistantId: assistants[1]?.id,
      number: "+91 98765 43210",
      duration: "4m 12s",
      latency: "380ms",
      status: "completed",
      cost: "$0.14",
      time: "25 mins ago",
      transcript: "User: Namaste, kya aap offer ke baare mein bata sakte ho? Agent: Namaste! Haan bilkul, humare pass Special Voice Automation plan hai."
    },
    {
      id: "call_3321c109",
      assistant: assistants[0]?.name || "Support Pilot Pro",
      assistantId: assistants[0]?.id,
      number: "+1 (888) 201-9922",
      duration: "0m 48s",
      latency: "310ms",
      status: "completed",
      cost: "$0.03",
      time: "1 hour ago",
      transcript: "User: Thanks for resolving my query quickly. Agent: You are welcome! Have a great day ahead."
    }
  ];

  return (
    <CallsClient
      initialCalls={sampleCalls}
      assistants={assistants.length > 0 ? assistants : [{ id: "ast_default", name: "Support Pilot Pro" }]}
    />
  );
}
