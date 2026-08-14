import { createClient } from "@supabase/supabase-js";

const url = "https://gkyilicraflkgcfgqypc.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWlsaWNyYWZsa2djZmdxeXBjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjA4Mzc0NiwiZXhwIjoyMTAxNjU5NzQ2fQ.DYf3RkJp3F8WFPNio6XiUVCYv2Fc7WztfKeLwI4N3eI";
const vomyraApiKey = "0KBY8fRk1ptydIq20Q8tkoBRGXn2KYhx";
const vomyraBaseUrl = "https://api.vomyra.com";

const supabase = createClient(url, serviceKey);

async function main() {
  console.log("=== STEP 1: Querying Supabase assistants table ===");
  const { data: existingAsts, error: astErr } = await supabase
    .from("assistants")
    .select("id, name, provider, provider_resource_id")
    .is("deleted_at", null);

  console.log("Existing assistants in Supabase:", existingAsts, astErr);

  let realAssistantId = null;

  if (existingAsts && existingAsts.length > 0) {
    for (const ast of existingAsts) {
      if (ast.provider_resource_id && /^[0-9a-fA-F]{24}$/.test(ast.provider_resource_id)) {
        realAssistantId = ast.provider_resource_id;
        console.log(`Found valid Vomyra provider_resource_id: ${realAssistantId} (${ast.name})`);
        break;
      }
    }
  }

  if (!realAssistantId) {
    console.log("=== STEP 2: Creating a new demo assistant on Vomyra Telephony API ===");
    const payload = {
      name: "VoicePilot Public Demo Agent",
      prompt: "You are VoicePilot Demo Assistant, a helpful, polite AI calling agent built in India. Greet the customer warmly in a mix of Hindi and English (Hinglish). Explain that this is a 60-second live test call for GAP VoicePilot. Ask how you can help them today.",
      language: "en-IN",
      voice: {
        provider: "vomyra",
        voice_id: "hindi_female_1",
        speed: 1.0
      },
      first_message: "Namaste! Hello from GAP VoicePilot. I am your AI demo assistant calling to test our sub-240ms voice engine. How are you doing today?"
    };

    try {
      const res = await fetch(`${vomyraBaseUrl}/v1/assistants`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": vomyraApiKey
        },
        body: JSON.stringify(payload)
      });

      const responseText = await res.text();
      console.log("Vomyra create assistant response:", res.status, responseText);

      let data = {};
      try { data = JSON.parse(responseText); } catch {}

      const created = data.data || data;
      if (created && (created.id || created._id)) {
        realAssistantId = created.id || created._id;
        console.log("Successfully created Vomyra Assistant ID:", realAssistantId);
      }
    } catch (err) {
      console.error("Vomyra API create assistant error:", err);
    }
  }

  if (!realAssistantId) {
    console.log("=== STEP 3: Trying GET /v1/assistants directly from Vomyra API ===");
    try {
      const res = await fetch(`${vomyraBaseUrl}/v1/assistants`, {
        headers: { "x-api-key": vomyraApiKey }
      });
      if (res.ok) {
        const listData = await res.json();
        console.log("Vomyra assistants list:", JSON.stringify(listData));
        const list = Array.isArray(listData) ? listData : (listData.data || []);
        if (list.length > 0) {
          realAssistantId = list[0].id || list[0]._id;
          console.log("Using first Vomyra assistant ID:", realAssistantId);
        }
      }
    } catch (e) {
      console.error("Vomyra GET /v1/assistants error:", e);
    }
  }

  console.log("FINAL RESOLVED DEMO ASSISTANT ID:", realAssistantId);
}

main();
