"use server";

import { getCurrentWorkspace, getAdminClient } from "@/lib/workspace";

/**
 * Fetch real call recording and full transcript from Vomyra Telephony API
 */
export async function fetchCallRecordingAction(callId: string) {
  try {
    const vomyraApiKey = process.env.VOMYRA_API_KEY || "0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx";
    const vomyraBaseUrl = process.env.VOMYRA_BASE_URL || "https://api.vomyra.com";

    // 1. Try GET /v1/calls/:id/recording
    try {
      const res = await fetch(`${vomyraBaseUrl}/v1/calls/${callId}/recording`, {
        headers: { 'x-api-key': vomyraApiKey },
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        const url = data?.data?.recording_url || data?.recording_url || data?.url || data?.data?.url || (typeof data === 'string' ? data : null);
        if (url && typeof url === 'string' && url.startsWith('http')) {
          return { success: true, recordingUrl: url };
        }
      }
    } catch (e) {}

    // 2. Try GET /v1/calls/:id
    try {
      const callRes = await fetch(`${vomyraBaseUrl}/v1/calls/${callId}`, {
        headers: { 'x-api-key': vomyraApiKey },
        cache: 'no-store'
      });
      if (callRes.ok) {
        const callData = await callRes.json();
        const c = callData?.data || callData;
        const recUrl = c?.recording_url || c?.recording || c?.audio_url || c?.call_recording || c?.media_url;
        if (recUrl && typeof recUrl === 'string' && recUrl.startsWith('http')) {
          return { success: true, recordingUrl: recUrl };
        }
      }
    } catch (e) {}

    return { success: false, error: "No recording available for this call." };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch recording" };
  }
}

/**
 * Fetch full call details, recording, and transcripts directly from Vomyra Telephony API
 */
export async function fetchCallDetailsAction(callId: string) {
  try {
    const vomyraApiKey = process.env.VOMYRA_API_KEY || "0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx";
    const vomyraBaseUrl = process.env.VOMYRA_BASE_URL || "https://api.vomyra.com";

    let recordingUrl: string | null = null;
    let transcriptMessages: Array<{ role: string; content: string; timestamp?: string }> = [];
    let summary: string = "";

    // 1. Fetch Call details
    try {
      const res = await fetch(`${vomyraBaseUrl}/v1/calls/${callId}`, {
        headers: { 'x-api-key': vomyraApiKey },
        cache: 'no-store'
      });
      if (res.ok) {
        const json = await res.json();
        const c = json?.data || json;
        recordingUrl = c?.recording_url || c?.recording || c?.audio_url || c?.call_recording || c?.media_url || null;
        summary = c?.whatsapp_summary || c?.summary || c?.notes || "";

        if (Array.isArray(c?.transcript)) {
          transcriptMessages = c.transcript.map((t: any) => ({
            role: t.role || t.speaker || 'assistant',
            content: t.content || t.message || t.text || '',
            timestamp: t.timestamp ? new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
          }));
        } else if (typeof c?.transcript === 'string' && c.transcript.trim()) {
          transcriptMessages = [{ role: 'assistant', content: c.transcript }];
        }
      }
    } catch (e) {}

    // 2. Fetch Recording URL specifically if not found yet
    if (!recordingUrl) {
      try {
        const recRes = await fetch(`${vomyraBaseUrl}/v1/calls/${callId}/recording`, {
          headers: { 'x-api-key': vomyraApiKey },
          cache: 'no-store'
        });
        if (recRes.ok) {
          const recData = await recRes.json();
          const foundUrl = recData?.data?.recording_url || recData?.recording_url || recData?.url || recData?.data?.url || (typeof recData === 'string' && recData.startsWith('http') ? recData : null);
          if (foundUrl) recordingUrl = foundUrl;
        }
      } catch (e) {}
    }

    // 3. Fetch Transcript specifically if not found yet
    if (transcriptMessages.length === 0) {
      try {
        const transRes = await fetch(`${vomyraBaseUrl}/v1/calls/${callId}/transcript`, {
          headers: { 'x-api-key': vomyraApiKey },
          cache: 'no-store'
        });
        if (transRes.ok) {
          const tData = await transRes.json();
          const raw = tData?.data || tData;
          if (Array.isArray(raw)) {
            transcriptMessages = raw.map((t: any) => ({
              role: t.role || t.speaker || 'assistant',
              content: t.content || t.message || t.text || '',
              timestamp: t.timestamp ? new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
            }));
          } else if (typeof raw === 'string' && raw.trim()) {
            transcriptMessages = [{ role: 'assistant', content: raw }];
          }
        }
      } catch (e) {}
    }

    return {
      success: true,
      recordingUrl,
      transcriptMessages,
      summary
    };
  } catch (err: any) {
    return {
      success: false,
      recordingUrl: null,
      transcriptMessages: [],
      error: err.message
    };
  }
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
 * Trigger an outbound PSTN phone call via Vomyra specification
 */
export async function triggerTestCallAction(params: TriggerTestCallParams) {
  try {
    const workspace = await getCurrentWorkspace();
    if (!workspace?.userId) {
      return { success: false, error: "You must be signed in to place a test call." };
    }

    let workspaceId: string | undefined;
    const idempotencyKey = `test_call_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const targetCustomerNumber = (params.customerNumber || params.to || "").trim();
    const targetCustomerName = (params.customerName || "Test Caller").trim();
    const targetCountryCode = params.countryCode || (targetCustomerNumber.startsWith("+91") ? "+91" : "+1");

    if (!targetCustomerNumber) {
      return { success: false, error: "Please enter a valid customer phone number." };
    }

    const adminClient = await getAdminClient();
    let realVomyraAssistantId: string | undefined = undefined;
    let verifiedAssignedNumber: string | undefined = undefined;

    if (params.assistantId) {
      // 1. Check if assistantId is already a Vomyra ObjectId (24 hex characters)
      if (/^[0-9a-fA-F]{24}$/.test(params.assistantId)) {
        realVomyraAssistantId = params.assistantId;
      } else if (adminClient) {
        // 2. Query Supabase for provider_resource_id
        const { data: astRecord } = await adminClient
          .from('assistants')
          .select('provider_resource_id, workspace_id')
          .eq('id', params.assistantId)
          .maybeSingle();

        if (!astRecord) {
          return { success: false, error: "Assistant not found." };
        }

        const { data: membership } = await adminClient
          .from("workspace_members")
          .select("workspace_id")
          .eq("workspace_id", astRecord.workspace_id)
          .eq("user_id", workspace.userId)
          .maybeSingle();

        if (!membership) {
          return { success: false, error: "You do not have access to this assistant's workspace." };
        }

        workspaceId = astRecord.workspace_id;

        if (astRecord.provider_resource_id && !astRecord.provider_resource_id.startsWith('mock_')) {
          realVomyraAssistantId = astRecord.provider_resource_id;
        }
      }
    }

    if (!workspaceId) {
      return { success: false, error: "Could not resolve the assistant's workspace." };
    }

    if (params.assignedNumber && params.assistantId && adminClient) {
      const { data: assignedPhone, error: assignedPhoneError } = await adminClient
        .from("phone_numbers")
        .select("phone_number")
        .eq("workspace_id", workspaceId)
        .eq("assigned_assistant_id", params.assistantId)
        .eq("phone_number", params.assignedNumber.trim())
        .is("deleted_at", null)
        .maybeSingle();

      if (assignedPhoneError || !assignedPhone) {
        return {
          success: false,
          error: "This caller ID is not assigned to this assistant. Assign the number first, then try again."
        };
      }

      verifiedAssignedNumber = assignedPhone.phone_number.trim();
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

    if (verifiedAssignedNumber) {
      // Vomyra accepts exactly one routing identifier. Using the assigned number
      // preserves the configured outbound caller ID and resolves its bound assistant.
      payload.assigned_number = verifiedAssignedNumber;
    } else if (realVomyraAssistantId) {
      payload.assistant_id = realVomyraAssistantId;
    } else if (params.assistantId) {
      return {
        success: false,
        error: "No phone number is assigned to this assistant. Assign one before placing a PSTN test call."
      };
    }

    const vomyraBaseUrl = process.env.VOMYRA_BASE_URL || 'https://api.vomyra.com';
    const vomyraApiKey = process.env.VOMYRA_API_KEY || '';
    
    console.log("[triggerTestCallAction] Posting to Vomyra backend:", JSON.stringify(payload));

    const res = await fetch(`${vomyraBaseUrl}/v1/calls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': vomyraApiKey
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

export interface TriggerDemoCallParams {
  customerNumber: string;
  customerName?: string;
  useCase?: string;
  assistantId?: string;
}

/**
 * Trigger a public / website demo call using configured DEMO_ASSISTANT_ID env variable or prop
 */
export async function triggerDemoCallAction(params: TriggerDemoCallParams) {
  try {
    const configuredAssistantId =
      params.assistantId ||
      process.env.NEXT_PUBLIC_DEMO_ASSISTANT_ID ||
      process.env.DEMO_ASSISTANT_ID ||
      "66a87b8f9a2b1c0012345678";

    return await triggerTestCallAction({
      customerNumber: params.customerNumber,
      customerName: params.customerName || "Website Demo Visitor",
      assistantId: configuredAssistantId,
    });
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Unable to initiate demo call"
    };
  }
}

/**
 * Fetch assigned or active phone numbers for test call caller ID selection
 */
export async function fetchCallerNumbersAction(assistantId?: string) {
  try {
    if (!assistantId) {
      return { success: true, numbers: [] };
    }

    const adminClient = await getAdminClient();
    if (!adminClient) {
      console.log("[fetchCallerNumbersAction] No admin client");
      return { success: true, numbers: [] };
    }

    const workspace = await getCurrentWorkspace();
    if (!workspace?.userId) {
      return { success: false, numbers: [], error: "You must be signed in." };
    }

    const { data: ast } = await adminClient
      .from("assistants")
      .select("id, workspace_id")
      .eq("id", assistantId)
      .maybeSingle();

    if (!ast) {
      return { success: false, numbers: [], error: "Assistant not found." };
    }

    const { data: membership } = await adminClient
      .from("workspace_members")
      .select("workspace_id")
      .eq("workspace_id", ast.workspace_id)
      .eq("user_id", workspace.userId)
      .maybeSingle();

    if (!membership) {
      return { success: false, numbers: [], error: "You do not have access to this assistant's workspace." };
    }

    const { data: numbers, error } = await adminClient
      .from('phone_numbers')
      .select('id, phone_number, assigned_assistant_id, provider')
      .eq('workspace_id', ast.workspace_id)
      .eq('assigned_assistant_id', assistantId)
      .is('deleted_at', null);

    console.log("[fetchCallerNumbersAction] numbers fetched:", numbers, error);

    return {
      success: true,
      numbers: (numbers || []).map(n => ({
        id: n.id,
        phone_number: n.phone_number,
        isAssignedToThis: n.assigned_assistant_id === assistantId,
        provider: n.provider || 'vomyra'
      }))
    };
  } catch (err: any) {
    console.error("[fetchCallerNumbersAction] ERROR:", err);
    return {
      success: true,
      numbers: []
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
