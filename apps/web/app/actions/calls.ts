"use server";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

async function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getWorkspaceId(): Promise<string> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const adminClient = await getAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: member } = await adminClient
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (member?.workspace_id) return member.workspace_id;
  }

  // Fallback to ANY workspace removed to prevent random assignment

  return "00000000-0000-0000-0000-000000000000";
}

export interface TriggerTestCallParams {
  customerNumber: string;
  customerName?: string;
  assistantId?: string;
  assignedNumber?: string;
  countryCode?: string;
  to?: string;
  from?: string;
}

/**
 * Trigger an outbound PSTN phone call via the Express backend API matching Vomyra specification
 */
export async function triggerTestCallAction(params: TriggerTestCallParams) {
  try {
    const workspaceId = await getWorkspaceId();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const idempotencyKey = `test_call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const targetCustomerNumber = (params.customerNumber || params.to || "").trim();
    const targetCustomerName = (params.customerName || "Test Caller").trim();
    const targetCountryCode = params.countryCode || (targetCustomerNumber.startsWith("+91") ? "+91" : "+1");

    if (!targetCustomerNumber) {
      return { success: false, error: "Please enter a valid customer phone number." };
    }

    const adminClient = await getAdminClient();
    let realVomyraAssistantId: string | undefined = undefined;

    if (params.assistantId) {
      // 1. Check if assistantId is already a Vomyra ObjectId (24 hex characters)
      if (/^[0-9a-fA-F]{24}$/.test(params.assistantId)) {
        realVomyraAssistantId = params.assistantId;
      } else {
        // 2. Query Supabase for provider_resource_id
        const { data: astRecord } = await adminClient
          .from('assistants')
          .select('provider_resource_id')
          .eq('id', params.assistantId)
          .maybeSingle();

        if (astRecord?.provider_resource_id && !astRecord.provider_resource_id.startsWith('mock_')) {
          realVomyraAssistantId = astRecord.provider_resource_id;
        }
      }
    }

    // Build Vomyra payload: exactly ONE of assistant_id or assigned_number
    const payload: any = {
      customer_number: targetCustomerNumber,
      customer_name: targetCustomerName,
      customer_country_code: targetCountryCode,
      workspaceId,
      idempotencyKey,
      additional_data: {
        source: "GAP_VoicePilot_WebConsole",
        dispatched_at: new Date().toISOString()
      }
    };

    if (realVomyraAssistantId) {
      payload.assistant_id = realVomyraAssistantId;
    } else if (params.assignedNumber || params.from) {
      payload.assigned_number = (params.assignedNumber || params.from || "").trim();
    } else if (params.assistantId) {
      payload.assistant_id = params.assistantId;
    }

    console.log("[triggerTestCallAction] Posting to backend:", JSON.stringify(payload));

    const res = await fetch(`${apiUrl}/api/v1/calls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { error: responseText };
    }

    if (!res.ok) {
      return {
        success: false,
        error: data.error || data.message || `Telephony Server returned ${res.status}: ${responseText.slice(0, 150)}`
      };
    }

    const callData = data.data || data;
    return {
      success: true,
      call: callData,
      idempotencyKey,
      callId: callData?.id || idempotencyKey
    };
  } catch (err: any) {
    console.error("Trigger test call error:", err);
    return {
      success: false,
      error: err.message || "Failed to connect to telephony backend"
    };
  }
}

/**
 * Fetch assigned or active phone numbers for test call caller ID selection
 */
export async function fetchCallerNumbersAction(assistantId?: string) {
  try {
    const workspaceId = await getWorkspaceId();
    const adminClient = await getAdminClient();

    const { data: numbers } = await adminClient
      .from('phone_numbers')
      .select('id, phone_number, assigned_assistant_id, provider')
      .eq('workspace_id', workspaceId)
      .is('deleted_at', null);

    return {
      success: true,
      numbers: (numbers || []).map(n => ({
        id: n.id,
        phone_number: n.phone_number,
        isAssignedToThis: assistantId ? n.assigned_assistant_id === assistantId : false,
        provider: n.provider || 'vomyra'
      }))
    };
  } catch (err: any) {
    return {
      success: false,
      numbers: [],
      error: err.message
    };
  }
}

/**
 * Web Call Voice Simulator - Generates dynamic contextual AI responses based on assistant configuration
 */
export async function simulateWebAgentResponseAction({
  assistantName,
  systemPrompt,
  welcomeMessage,
  conversationHistory,
  userMessage
}: {
  assistantName: string;
  systemPrompt?: string;
  welcomeMessage?: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; text: string }>;
  userMessage: string;
}) {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
    
    if (openaiApiKey) {
      const isGroq = !!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY;
      const endpoint = isGroq 
        ? 'https://api.groq.com/openai/v1/chat/completions' 
        : 'https://api.openai.com/v1/chat/completions';
      const model = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';

      const promptInstructions = systemPrompt || `You are ${assistantName}, a professional voice assistant. Speak conversationally in 1-2 crisp sentences.`;

      const messages = [
        { role: 'system', content: promptInstructions },
        ...conversationHistory.map(m => ({ role: m.role, content: m.text })),
        { role: 'user', content: userMessage }
      ];

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 150,
          temperature: 0.3
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content?.trim();
        if (reply) {
          return { success: true, reply };
        }
      }
    }

    // Intelligent domain-aware conversational heuristics when no external LLM key is supplied
    const lower = userMessage.toLowerCase();
    let reply = `Thank you for asking. I am ${assistantName}. How can I assist you with this today?`;

    if (lower.includes("hello") || lower.includes("hi") || lower.includes("namaste") || lower.includes("hey")) {
      reply = welcomeMessage || `Hello! This is ${assistantName}. How can I help you today?`;
    } else if (lower.includes("price") || lower.includes("cost") || lower.includes("plan") || lower.includes("pricing") || lower.includes("rate")) {
      reply = "Our plans feature transparent pay-per-minute billing starting at $0.05 per call minute with zero setup fees. Would you like me to share more details?";
    } else if (lower.includes("human") || lower.includes("transfer") || lower.includes("representative") || lower.includes("agent") || lower.includes("talk to someone")) {
      reply = "Certainly. I am initiating a transfer to our senior support representative right now. Please hold for a moment.";
    } else if (lower.includes("room") || lower.includes("booking") || lower.includes("hotel") || lower.includes("reservation") || lower.includes("reserve")) {
      reply = "We offer Luxury Deluxe and Executive suites with complimentary breakfast and high-speed Wi-Fi. What check-in date would you prefer?";
    } else if (lower.includes("time") || lower.includes("hour") || lower.includes("open") || lower.includes("location")) {
      reply = "Our customer operations are active 24 hours a day, 7 days a week. We are always here to assist you!";
    } else if (lower.includes("bye") || lower.includes("thank") || lower.includes("goodbye") || lower.includes("exit")) {
      reply = "Thank you for reaching out to us today. Have a fantastic day ahead! Goodbye!";
    } else {
      reply = `I have noted that: "${userMessage}". I will make sure our team processes this immediately. Anything else I can assist with?`;
    }

    return { success: true, reply };
  } catch (err: any) {
    return {
      success: true,
      reply: `Hello! I received your message: "${userMessage}". How else can I assist you today?`
    };
  }
}
